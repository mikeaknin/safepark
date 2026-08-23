export interface PoliceIncidentRecord {
  id: string;
  incidentDatetime: string;
  incidentCategory: string;
  incidentDescription: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  isVehicleLarceny: boolean;
}

export interface DataSFPoliceReportSummary {
  incidentsLast30Days: number;
  incidentsLast90Days: number;
  vehicleLarcenyCount30Days: number;
  vehicleLarcenyCount90Days: number;
  smashAndGrabCount: number;
  recentIncidentTimestamps: string[];
  isHotspotCluster: boolean;
  incidents: PoliceIncidentRecord[];
  isLive: boolean;
  cachedAt?: number;
}

interface CacheEntry {
  timestamp: number;
  data: DataSFPoliceReportSummary;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1-hour TTL
const MEMORY_CACHE = new Map<string, CacheEntry>();

export class DataSFPoliceService {
  private static readonly ENDPOINT = 'https://data.sfgov.org/resource/wg3w-h783.json';

  public static clearCache(): void {
    MEMORY_CACHE.clear();
  }

  /**
   * Fetches real-time verified property crime incidents from DataSF Socrata API within radius (default 500m).
   */
  public static async fetchIncidentsNearCoordinates(
    coords: { lat: number; lng: number },
    radiusMeters: number = 500
  ): Promise<DataSFPoliceReportSummary> {
    const { lat, lng } = coords;
    // Quantize cache key to ~100m grid for optimal cache hits
    const cacheKey = `datasf_police_${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusMeters}`;

    // 1. Check In-Memory Cache
    const memCached = MEMORY_CACHE.get(cacheKey);
    if (memCached && Date.now() - memCached.timestamp < CACHE_TTL_MS) {
      return memCached.data;
    }

    // 2. Check LocalStorage Cache
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          const parsed: CacheEntry = JSON.parse(stored);
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            MEMORY_CACHE.set(cacheKey, parsed);
            return parsed.data;
          }
        }
      } catch {}
    }

    // 3. Query DataSF Socrata API
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgoISO = ninetyDaysAgo.toISOString().split('.')[0]; // Socrata ISO format

    const query = `?$where=within_circle(point, ${lat}, ${lng}, ${radiusMeters}) AND incident_datetime >= '${ninetyDaysAgoISO}' AND incident_category in ('Larceny Theft', 'Motor Vehicle Theft', 'Vandalism')&$limit=100&$order=incident_datetime DESC`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast UI response

    try {
      const response = await fetch(`${this.ENDPOINT}${query}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`DataSF API responded with status ${response.status}`);
      }

      const rows: any[] = await response.json();
      const now = Date.now();
      const thirtyDaysAgoMs = now - 30 * 24 * 60 * 60 * 1000;

      const incidents: PoliceIncidentRecord[] = [];
      let incidentsLast30Days = 0;
      let vehicleLarcenyCount30Days = 0;
      let vehicleLarcenyCount90Days = 0;
      let smashAndGrabCount = 0;
      const recentTimestamps: string[] = [];

      for (const row of rows) {
        const incidentLat = parseFloat(row.latitude);
        const incidentLng = parseFloat(row.longitude);
        if (isNaN(incidentLat) || isNaN(incidentLng)) continue;

        const distanceMeters = this.haversineDistanceMeters(lat, lng, incidentLat, incidentLng);
        const dtMs = new Date(row.incident_datetime).getTime();
        const desc = String(row.incident_description || row.incident_subcategory || '').toLowerCase();

        const isVehicle =
          desc.includes('vehicle') ||
          desc.includes('auto') ||
          desc.includes('car') ||
          desc.includes('smash') ||
          desc.includes('theft, from locked vehicle') ||
          desc.includes('theft, from unlocked vehicle') ||
          row.incident_category === 'Motor Vehicle Theft';

        const isSmash = desc.includes('locked vehicle') || desc.includes('window') || desc.includes('smash');

        if (isVehicle) {
          vehicleLarcenyCount90Days++;
          if (dtMs >= thirtyDaysAgoMs) vehicleLarcenyCount30Days++;
        }

        if (isSmash) smashAndGrabCount++;

        if (dtMs >= thirtyDaysAgoMs) {
          incidentsLast30Days++;
        }

        if (recentTimestamps.length < 5 && row.incident_datetime) {
          recentTimestamps.push(row.incident_datetime);
        }

        incidents.push({
          id: String(row.row_id || row.incident_id || Math.random().toString(36)),
          incidentDatetime: row.incident_datetime,
          incidentCategory: row.incident_category || 'Larceny Theft',
          incidentDescription: row.incident_description || 'Property Incident',
          latitude: incidentLat,
          longitude: incidentLng,
          distanceMeters: Math.round(distanceMeters),
          isVehicleLarceny: isVehicle,
        });
      }

      const summary: DataSFPoliceReportSummary = {
        incidentsLast30Days,
        incidentsLast90Days: rows.length,
        vehicleLarcenyCount30Days,
        vehicleLarcenyCount90Days,
        smashAndGrabCount,
        recentIncidentTimestamps: recentTimestamps,
        isHotspotCluster: vehicleLarcenyCount30Days >= 3 || rows.length >= 6,
        incidents,
        isLive: true,
        cachedAt: now,
      };

      // Save to Caches
      const entry: CacheEntry = { timestamp: now, data: summary };
      MEMORY_CACHE.set(cacheKey, entry);
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(entry));
        } catch {}
      }

      return summary;
    } catch (err) {
      clearTimeout(timeoutId);
      // Graceful fallback to null or empty summary when offline / timeout
      return {
        incidentsLast30Days: 0,
        incidentsLast90Days: 0,
        vehicleLarcenyCount30Days: 0,
        vehicleLarcenyCount90Days: 0,
        smashAndGrabCount: 0,
        recentIncidentTimestamps: [],
        isHotspotCluster: false,
        incidents: [],
        isLive: false,
      };
    }
  }

  private static haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
