export interface SF311CaseRecord {
  caseId: string;
  serviceName: string;
  serviceDetails: string;
  status: string;
  requestedDatetime: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  isStreetlightOutage: boolean;
}

export interface SF311MunicipalSummary {
  hasStreetlightOutage: boolean;
  openStreetlightOutagesCount: number;
  openSidewalkHazardsCount: number;
  cases: SF311CaseRecord[];
  isLive: boolean;
  cachedAt?: number;
}

interface CacheEntry {
  timestamp: number;
  data: SF311MunicipalSummary;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1-hour TTL
const MEMORY_CACHE = new Map<string, CacheEntry>();

export class SF311Service {
  private static readonly ENDPOINT = 'https://data.sfgov.org/resource/vw6y-z8j6.json';

  public static clearCache(): void {
    MEMORY_CACHE.clear();
  }

  /**
   * Fetches active SF 311 municipal cases (Streetlight outages, sidewalk hazards) within radius (default 250m).
   */
  public static async fetchMunicipalCasesNearCoordinates(
    coords: { lat: number; lng: number },
    radiusMeters: number = 250
  ): Promise<SF311MunicipalSummary> {
    const { lat, lng } = coords;
    const cacheKey = `datasf_311_${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusMeters}`;

    // 1. In-Memory Cache
    const memCached = MEMORY_CACHE.get(cacheKey);
    if (memCached && Date.now() - memCached.timestamp < CACHE_TTL_MS) {
      return memCached.data;
    }

    // 2. LocalStorage Cache
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

    // 3. Query DataSF 311 API
    const query = `?$where=within_circle(point, ${lat}, ${lng}, ${radiusMeters}) AND status = 'Open' AND (service_name like '%Streetlight%' OR service_name like '%Street Light%' OR service_details like '%Streetlight%' OR service_name like '%Sidewalk%' OR service_name like '%Hazard%')&$limit=50&$order=requested_datetime DESC`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(`${this.ENDPOINT}${query}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`SF 311 API responded with status ${response.status}`);
      }

      const rows: any[] = await response.json();
      const cases: SF311CaseRecord[] = [];
      let openStreetlightOutagesCount = 0;
      let openSidewalkHazardsCount = 0;

      for (const row of rows) {
        const caseLat = parseFloat(row.lat);
        const caseLng = parseFloat(row.long);
        if (isNaN(caseLat) || isNaN(caseLng)) continue;

        const distanceMeters = this.haversineDistanceMeters(lat, lng, caseLat, caseLng);
        const sName = String(row.service_name || '').toLowerCase();
        const sDetails = String(row.service_details || '').toLowerCase();

        const isLight =
          sName.includes('streetlight') ||
          sName.includes('street light') ||
          sDetails.includes('streetlight') ||
          sDetails.includes('light out');

        if (isLight) {
          openStreetlightOutagesCount++;
        } else {
          openSidewalkHazardsCount++;
        }

        cases.push({
          caseId: String(row.service_request_id || Math.random().toString(36)),
          serviceName: row.service_name || 'Municipal Case',
          serviceDetails: row.service_details || '',
          status: row.status || 'Open',
          requestedDatetime: row.requested_datetime || new Date().toISOString(),
          latitude: caseLat,
          longitude: caseLng,
          distanceMeters: Math.round(distanceMeters),
          isStreetlightOutage: isLight,
        });
      }

      const now = Date.now();
      const summary: SF311MunicipalSummary = {
        hasStreetlightOutage: openStreetlightOutagesCount > 0,
        openStreetlightOutagesCount,
        openSidewalkHazardsCount,
        cases,
        isLive: true,
        cachedAt: now,
      };

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
      return {
        hasStreetlightOutage: false,
        openStreetlightOutagesCount: 0,
        openSidewalkHazardsCount: 0,
        cases: [],
        isLive: false,
      };
    }
  }

  private static haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
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
