/**
 * SafePark Curbside Street Parking Ingestion & Block Clustering Service
 * Ingests official municipal on-street metered parking inventories for SF & LA.
 * Clusters individual meters into Street Parking Blocks with spatial centroids.
 * Falls back to bundled static datasets (sf_street_backup.json & la_street_backup.json).
 */

import { ParkingFacility } from '../lib/safetyScore';
import { SF_STREET_BACKUP, LA_STREET_BACKUP } from '../data/streetBackups';

export type SupportedCity = 'sf' | 'la';

function toTitleCase(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
}

function haversineDistMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export class StreetParkingService {
  /**
   * Retrieves curated client-bundled static street blocks fallback.
   */
  public static getBundledStreetBackup(city: SupportedCity): ParkingFacility[] {
    const list = city === 'sf' ? SF_STREET_BACKUP : LA_STREET_BACKUP;
    return (list as any[]).map((item) => ({
      ...item,
      isStreetParking: true,
      type: 'curbside_street_metered',
      access: 'public',
      fee: 'yes',
    }));
  }

  /**
   * Fetches and clusters live curbside street meters for the given city.
   */
  public static async fetchCurbsideStreetBlocks(
    city: SupportedCity,
    externalSignal?: AbortSignal
  ): Promise<ParkingFacility[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const onExternalAbort = () => controller.abort();
    if (externalSignal) {
      externalSignal.addEventListener('abort', onExternalAbort);
    }

    try {
      if (city === 'sf') {
        const sfUrl = new URL('https://data.sf.gov/resource/8vzz-qzz9.json');
        sfUrl.searchParams.set('$select', 'post_id,street_name,street_num,active_meter_flag,on_offstreet_type,latitude,longitude');
        sfUrl.searchParams.set('$where', "active_meter_flag in ('M', 'T') AND on_offstreet_type = 'ON' AND latitude IS NOT NULL");
        sfUrl.searchParams.set('$limit', '2000');

        const resp = await fetch(sfUrl.toString(), {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!resp.ok) {
          throw new Error(`SFMTA returned HTTP ${resp.status}`);
        }

        const meters = await resp.json();
        if (!Array.isArray(meters) || meters.length === 0) {
          throw new Error('SFMTA returned empty meter list');
        }

        // Group meters along the same street_name located within 60 meters of each other
        const byStreet: Record<string, { lat: number; lon: number; num: number; id: string }[]> = {};
        for (const m of meters) {
          const lat = parseFloat(m.latitude);
          const lon = parseFloat(m.longitude);
          if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) continue;
          const st = (m.street_name || 'Street').trim().toUpperCase();
          if (!byStreet[st]) byStreet[st] = [];
          byStreet[st].push({
            lat,
            lon,
            num: parseInt(m.street_num || '0', 10),
            id: m.post_id || '',
          });
        }

        const streetBlocks: ParkingFacility[] = [];

        for (const [street, items] of Object.entries(byStreet)) {
          items.sort((a, b) => a.num - b.num || a.lat - b.lat);
          const clusters: {
            items: typeof items;
            centerLat: number;
            centerLon: number;
            nums: number[];
          }[] = [];

          for (const item of items) {
            let matched: (typeof clusters)[0] | null = null;
            for (const cl of clusters) {
              const dist = haversineDistMeters(cl.centerLat, cl.centerLon, item.lat, item.lon);
              if (dist <= 60) {
                matched = cl;
                break;
              }
            }

            if (matched) {
              matched.items.push(item);
              // Centroid
              matched.centerLat = matched.items.reduce((s, i) => s + i.lat, 0) / matched.items.length;
              matched.centerLon = matched.items.reduce((s, i) => s + i.lon, 0) / matched.items.length;
              if (item.num > 0) matched.nums.push(item.num);
            } else {
              clusters.push({
                items: [item],
                centerLat: item.lat,
                centerLon: item.lon,
                nums: item.num > 0 ? [item.num] : [],
              });
            }
          }

          for (const cl of clusters) {
            const formattedStreet = toTitleCase(street);
            let blockNum = 100;
            if (cl.nums.length > 0) {
              const avgNum = cl.nums.reduce((a, b) => a + b, 0) / cl.nums.length;
              blockNum = Math.floor(avgNum / 100) * 100;
            }
            const blockStr = `${blockNum === 0 ? '100' : blockNum} Block`;
            const name = `${formattedStreet} • ${blockStr}`;

            streetBlocks.push({
              id: `sfmta-curb-${street.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${blockNum}-${Math.round(
                cl.centerLat * 10000
              )}`,
              name,
              blockName: name,
              address: `${blockStr} ${formattedStreet}, San Francisco, CA`,
              lat: cl.centerLat,
              lon: cl.centerLon,
              isStreetParking: true,
              type: 'curbside_street_metered',
              capacity: String(cl.items.length),
              meterCount: cl.items.length,
              meterRate: '$3.50/hr',
              timeLimit: '2HR',
              fee: 'yes',
              access: 'public',
            });
          }
        }

        if (streetBlocks.length > 0) {
          return streetBlocks;
        }
      } else {
        // Los Angeles (LADOT)
        let rawSpaces: any[] = [];

        // Primary SODA query with latlng IS NOT NULL (and fallback handling)
        const laUrl = new URL('https://data.lacity.org/resource/s49e-q6j2.json');
        laUrl.searchParams.set('$where', 'latlng IS NOT NULL');
        laUrl.searchParams.set('$limit', '2000');

        try {
          const resp = await fetch(laUrl.toString(), {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          });
          if (resp.ok) {
            const json = await resp.json();
            if (Array.isArray(json) && json.length > 0) {
              rawSpaces = json;
            }
          }
        } catch {
          // If query fails, continue to check rawSpaces
        }
        clearTimeout(timeout);

        if (rawSpaces.length === 0) {
          throw new Error('LADOT returned empty space list');
        }

        // Group spaces sharing the same blockface into a single Street Parking Block
        const clusters: Record<
          string,
          {
            blockface: string;
            raterange?: string;
            timelimit?: string;
            lats: number[];
            lons: number[];
            count: number;
          }
        > = {};

        for (const s of rawSpaces) {
          const lat = parseFloat(s.lat ?? s.latlng?.latitude);
          const lon = parseFloat(s.lon ?? s.latlng?.longitude);
          if (isNaN(lat) || isNaN(lon) || lat <= 0) continue;
          const bf = (s.blockface || 'Block').trim();
          if (!clusters[bf]) {
            clusters[bf] = {
              blockface: bf,
              raterange: s.raterange,
              timelimit: s.timelimit,
              lats: [],
              lons: [],
              count: 0,
            };
          }
          clusters[bf].lats.push(lat);
          clusters[bf].lons.push(lon);
          clusters[bf].count++;
        }

        const streetBlocks: ParkingFacility[] = Object.values(clusters).map((c, i) => {
          const match = c.blockface.match(/^(\d+)\s+(.+)$/);
          let name = c.blockface;
          let formattedStreet = 'Curbside';
          let blockStr = '100 Block';
          if (match) {
            blockStr = `${match[1]} Block`;
            formattedStreet = toTitleCase(match[2].replace(/^[NSEW]\s+/i, ''));
            name = `${formattedStreet} • ${blockStr}`;
          } else {
            name = toTitleCase(c.blockface);
          }

          // Assign midpoint coordinate as block location
          const avgLat = c.lats.reduce((a, b) => a + b, 0) / c.lats.length;
          const avgLon = c.lons.reduce((a, b) => a + b, 0) / c.lons.length;

          return {
            id: `ladot-curb-${i}-${Math.round(avgLat * 10000)}`,
            name,
            blockName: name,
            address: `${blockStr} ${formattedStreet}, Los Angeles, CA`,
            lat: avgLat,
            lon: avgLon,
            isStreetParking: true,
            type: 'curbside_street_metered',
            capacity: String(c.count),
            meterCount: c.count,
            meterRate: c.raterange || '$2.50/hr',
            timeLimit: c.timelimit || '2HR',
            fee: 'yes',
            access: 'public',
          };
        });

        if (streetBlocks.length > 0) {
          return streetBlocks;
        }
      }
    } catch (err) {
      console.warn(`StreetParkingService: live fetch failed for ${city}, utilizing curated backup:`, err);
    } finally {
      clearTimeout(timeout);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', onExternalAbort);
      }
    }

    // Static client-bundled fallback
    return this.getBundledStreetBackup(city);
  }
}
