/**
 * SafePark Resilient Parking Facility Service
 * Primary: /api/parking?city=${city} (with 6s timeout) or direct Overpass API query.
 * Fallback: Static client-bundled dataset from src/data/sf_parking_backup.json and src/data/la_parking_backup.json
 */

import { ParkingFacility } from '../lib/safetyScore';
import sfParkingBackup from '../data/sf_parking_backup.json';
import laParkingBackup from '../data/la_parking_backup.json';

export type SupportedCity = 'sf' | 'la';

export const PARKING_BOUNDING_BOXES: Record<SupportedCity, string> = {
  sf: '37.70,-122.52,37.83,-122.35',
  la: '33.98,-118.50,34.11,-118.23',
};

/**
 * Merges live Overpass facilities with verified named anchor garages,
 * ensuring anchor facilities are always present and avoiding duplicates.
 */
function mergeWithAnchorGarages(
  anchors: ParkingFacility[],
  liveResults: ParkingFacility[]
): ParkingFacility[] {
  const merged: ParkingFacility[] = [...anchors];

  function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  for (const live of liveResults) {
    const isDuplicate = merged.some((anchor) => {
      if (anchor.id === live.id) return true;
      if (anchor.name.toLowerCase() === live.name.toLowerCase()) return true;
      const d = getDistanceMeters(anchor.lat, anchor.lon, live.lat, live.lon);
      return d < 70;
    });

    if (!isDuplicate) {
      merged.push(live);
    }
  }

  return merged;
}

export class ParkingService {
  /**
   * Retrieves the client-bundled static JSON dataset to guarantee
   * the map never drops to 0 lots and all anchor garages are present.
   */
  public static getBundledBackup(city: SupportedCity): ParkingFacility[] {
    const list = city === 'sf' ? sfParkingBackup : laParkingBackup;
    return (list as any[]).map((item) => ({
      id: item.id,
      name: item.name,
      address: item.address,
      operator: item.operator,
      lat: item.lat,
      lon: item.lon,
      type: item.type || 'surface',
      capacity: item.capacity ? String(item.capacity) : 'Unknown',
      fee: item.fee,
      access: item.access,
      barrier: item.barrier,
      lit: item.lit,
      isStreetParking: false,
    }));
  }

  /**
   * Fetches dual-layer parking facilities:
   * 1. Try local/Vercel `/api/parking?city=${city}` (6s timeout) which returns both street meters and garages
   * 2. Direct Socrata meters query (SFMTA or LADOT) merged with anchor garages
   * 3. Fallback to client-bundled JSON (sf_parking_backup.json / la_parking_backup.json)
   */
  public static async fetchParkingFacilities(
    city: SupportedCity,
    externalSignal?: AbortSignal
  ): Promise<ParkingFacility[]> {
    const anchors = this.getBundledBackup(city);
    const cityName = city === 'la' ? 'Los Angeles' : 'San Francisco';

    // 1. Try proxy route first with 6s timeout
    const proxyController = new AbortController();
    const proxyTimeout = setTimeout(() => proxyController.abort(), 6500);

    const onExternalAbort = () => proxyController.abort();
    if (externalSignal) {
      externalSignal.addEventListener('abort', onExternalAbort);
    }

    try {
      const resp = await fetch(`/api/parking?city=${city}&v=dual_layer_v3`, {
        headers: { Accept: 'application/json' },
        signal: proxyController.signal,
      });
      clearTimeout(proxyTimeout);

      if (resp.ok) {
        const text = await resp.text();
        if (text && !text.trim().startsWith('<') && !text.includes('<!DOCTYPE') && !text.includes('DOCTYPE html')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed.data) && parsed.data.length > 0) {
            return parsed.data;
          }
        }
      }
    } catch {
      // Proceed to direct Socrata meter query / Overpass fallback
    } finally {
      clearTimeout(proxyTimeout);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', onExternalAbort);
      }
    }

    // 2. Direct Socrata Curbside Meter Query
    try {
      const meterController = new AbortController();
      const meterTimeout = setTimeout(() => meterController.abort(), 5000);
      let streetBlocks: ParkingFacility[] = [];

      if (city === 'sf') {
        const resp = await fetch(
          "https://data.sf.gov/resource/8vzz-qzz9.json?$where=active_meter_flag%20in%20('M',%20'T')%20AND%20latitude%20IS%20NOT%20NULL&$limit=1500",
          { headers: { Accept: 'application/json' }, signal: meterController.signal }
        );
        clearTimeout(meterTimeout);
        if (resp.ok) {
          const meters = await resp.json();
          if (Array.isArray(meters) && meters.length > 0) {
            const byStreet: Record<string, { lat: number; lon: number; num: number }[]> = {};
            for (const m of meters) {
              const lat = parseFloat(m.latitude);
              const lon = parseFloat(m.longitude);
              if (isNaN(lat) || isNaN(lon)) continue;
              const st = (m.street_name || 'Street').trim().toUpperCase();
              if (!byStreet[st]) byStreet[st] = [];
              byStreet[st].push({ lat, lon, num: parseInt(m.street_num || '0', 10) });
            }
            for (const [st, items] of Object.entries(byStreet)) {
              items.sort((a, b) => a.num - b.num);
              const clusters: { items: typeof items; centerLat: number; centerLon: number; nums: number[] }[] = [];
              for (const it of items) {
                let matched = clusters.find(
                  (c) =>
                    Math.abs(c.centerLat - it.lat) < 0.0006 && Math.abs(c.centerLon - it.lon) < 0.0006
                );
                if (matched) {
                  matched.items.push(it);
                  matched.centerLat = matched.items.reduce((s, i) => s + i.lat, 0) / matched.items.length;
                  matched.centerLon = matched.items.reduce((s, i) => s + i.lon, 0) / matched.items.length;
                  if (it.num > 0) matched.nums.push(it.num);
                } else {
                  clusters.push({ items: [it], centerLat: it.lat, centerLon: it.lon, nums: it.num > 0 ? [it.num] : [] });
                }
              }
              for (const cl of clusters) {
                const formattedStreet = st
                  .toLowerCase()
                  .replace(/\b\w/g, (s) => s.toUpperCase());
                let blockNum = 100;
                if (cl.nums.length > 0) {
                  blockNum = Math.floor(cl.nums.reduce((a, b) => a + b, 0) / cl.nums.length / 100) * 100;
                }
                const blockStr = `${blockNum === 0 ? '100' : blockNum} Block`;
                streetBlocks.push({
                  id: `sfmta-${st.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${blockNum}-${Math.round(cl.centerLat * 10000)}`,
                  name: `${formattedStreet} • ${blockStr}`,
                  blockName: `${formattedStreet} • ${blockStr}`,
                  address: `${blockStr} ${formattedStreet}, San Francisco, CA`,
                  lat: cl.centerLat,
                  lon: cl.centerLon,
                  isStreetParking: true,
                  type: 'curbside_street_metered',
                  capacity: String(cl.items.length),
                  meterCount: cl.items.length,
                  meterRate: '$3.50/hr',
                  timeLimit: '2HR',
                });
              }
            }
          }
        }
      } else {
        // LA
        const resp = await fetch(
          'https://data.lacity.org/resource/s49e-q6j2.json?$where=latlng%20IS%20NOT%20NULL&$limit=1500',
          { headers: { Accept: 'application/json' }, signal: meterController.signal }
        );
        clearTimeout(meterTimeout);
        if (resp.ok) {
          const spaces = await resp.json();
          if (Array.isArray(spaces) && spaces.length > 0) {
            const clusters: Record<string, { blockface: string; raterange?: string; timelimit?: string; lats: number[]; lons: number[]; count: number }> = {};
            for (const s of spaces) {
              const lat = parseFloat(s.latlng?.latitude);
              const lon = parseFloat(s.latlng?.longitude);
              if (isNaN(lat) || isNaN(lon)) continue;
              const bf = (s.blockface || 'Block').trim();
              if (!clusters[bf]) {
                clusters[bf] = { blockface: bf, raterange: s.raterange, timelimit: s.timelimit, lats: [], lons: [], count: 0 };
              }
              clusters[bf].lats.push(lat);
              clusters[bf].lons.push(lon);
              clusters[bf].count++;
            }
            streetBlocks = Object.values(clusters).map((c, i) => {
              const match = c.blockface.match(/^(\d+)\s+(.+)$/);
              let blockStr = '100 Block';
              let street = 'Curbside';
              if (match) {
                blockStr = `${match[1]} Block`;
                street = match[2]
                  .replace(/^[NSEW]\s+/i, '')
                  .toLowerCase()
                  .replace(/\b\w/g, (s) => s.toUpperCase());
              }
              const avgLat = c.lats.reduce((a, b) => a + b, 0) / c.lats.length;
              const avgLon = c.lons.reduce((a, b) => a + b, 0) / c.lons.length;
              return {
                id: `ladot-${i}-${Math.round(avgLat * 10000)}`,
                name: `${street} • ${blockStr}`,
                blockName: `${street} • ${blockStr}`,
                address: `${blockStr} ${street}, Los Angeles, CA`,
                lat: avgLat,
                lon: avgLon,
                isStreetParking: true,
                type: 'curbside_street_metered',
                capacity: String(c.count),
                meterCount: c.count,
                meterRate: c.raterange || '$2.50/hr',
                timeLimit: c.timelimit || '2HR',
              };
            });
          }
        }
      }

      if (streetBlocks.length > 0) {
        return [...streetBlocks, ...anchors];
      }
    } catch {
      // Proceed to Overpass / Bundled fallback
    }
    const bbox = PARKING_BOUNDING_BOXES[city] || PARKING_BOUNDING_BOXES.sf;
    const ql = `[out:json][timeout:5];(node["amenity"="parking"](${bbox});way["amenity"="parking"](${bbox}););out center tags;`;
    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
    ];

    for (const ep of endpoints) {
      const overpassController = new AbortController();
      const overpassTimeout = setTimeout(() => overpassController.abort(), 6000);

      try {
        const resp = await fetch(ep, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: `data=${encodeURIComponent(ql)}`,
          signal: overpassController.signal,
        });
        clearTimeout(overpassTimeout);

        if (resp.ok) {
          const json = await resp.json();
          if (Array.isArray(json.elements) && json.elements.length > 0) {
            const parsedLive = json.elements
              .map((elem: any) => {
                const lat = elem.type === 'node' ? elem.lat : elem.center?.lat;
                const lon = elem.type === 'node' ? elem.lon : elem.center?.lon;
                if (typeof lat !== 'number' || typeof lon !== 'number') return null;

                const tags = elem.tags || {};
                let name = tags.name;

                if (!name) {
                  if (tags.operator) {
                    const streetOrNum = tags['addr:street'] || tags['addr:housenumber'] || 'Facility';
                    name = `${tags.operator} - ${streetOrNum}`;
                  } else if (tags['addr:street']) {
                    const houseNum = tags['addr:housenumber'] ? `${tags['addr:housenumber']} ` : '';
                    name = `${houseNum}${tags['addr:street']} Parking`.trim();
                  } else {
                    // Drop any Overpass node that has NO name, NO operator, and NO street address.
                    return null;
                  }
                }

                let address = '';
                if (tags['addr:street']) {
                  const houseNum = tags['addr:housenumber'] ? `${tags['addr:housenumber']} ` : '';
                  address = `${houseNum}${tags['addr:street']}, ${cityName}, CA`;
                } else {
                  address = `${name}, ${cityName}, CA`;
                }

                return {
                  id: `osm-${elem.type}-${elem.id}`,
                  name,
                  address,
                  operator: tags.operator || undefined,
                  lat,
                  lon,
                  type: tags.parking || 'surface',
                  capacity: tags.capacity ? String(tags.capacity) : 'Unknown',
                  fee: tags.fee,
                  access: tags.access,
                  barrier: tags.barrier,
                  lit: tags.lit,
                };
              })
              .filter(Boolean) as ParkingFacility[];

            if (parsedLive.length > 0) {
              return mergeWithAnchorGarages(anchors, parsedLive);
            }
          }
        }
      } catch {
        clearTimeout(overpassTimeout);
      }
    }

    // 3. Bundled static JSON fallback (Guarantees map NEVER drops to 0 lots)
    return anchors;
  }
}
