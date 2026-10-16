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

export class ParkingService {
  /**
   * Retrieves the client-bundled static JSON dataset to guarantee
   * the map never drops to 0 lots.
   */
  public static getBundledBackup(city: SupportedCity): ParkingFacility[] {
    const list = city === 'sf' ? sfParkingBackup : laParkingBackup;
    return (list as any[]).map((item) => ({
      id: item.id,
      name: item.name,
      lat: item.lat,
      lon: item.lon,
      type: item.type || 'surface',
      capacity: item.capacity ? String(item.capacity) : 'Unknown',
    }));
  }

  /**
   * Fetches parking facilities:
   * 1. Try local/Vercel `/api/parking?city=${city}` (6s timeout)
   * 2. Direct Overpass API query (6s timeout per mirror)
   * 3. Fallback to client-bundled JSON (sf_parking_backup.json / la_parking_backup.json)
   */
  public static async fetchParkingFacilities(
    city: SupportedCity,
    externalSignal?: AbortSignal
  ): Promise<ParkingFacility[]> {
    // 1. Try proxy route first with 6s timeout
    const proxyController = new AbortController();
    const proxyTimeout = setTimeout(() => proxyController.abort(), 6000);

    const onExternalAbort = () => proxyController.abort();
    if (externalSignal) {
      externalSignal.addEventListener('abort', onExternalAbort);
    }

    try {
      const resp = await fetch(`/api/parking?city=${city}`, {
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
      // Proceed to Overpass / Bundled fallback
    } finally {
      clearTimeout(proxyTimeout);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', onExternalAbort);
      }
    }

    // 2. Direct Overpass API query with strict 6000ms AbortController timeout
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
            const parsed = json.elements
              .map((elem: any) => {
                const lat = elem.type === 'node' ? elem.lat : elem.center?.lat;
                const lon = elem.type === 'node' ? elem.lon : elem.center?.lon;
                if (typeof lat !== 'number' || typeof lon !== 'number') return null;

                const tags = elem.tags || {};
                let name = tags.name;
                if (!name) {
                  if (tags['addr:street']) {
                    name = `${tags['addr:housenumber'] ? tags['addr:housenumber'] + ' ' : ''}${tags['addr:street']} Parking`;
                  } else if (tags.operator) {
                    name = `${tags.operator} Parking`;
                  } else if (tags.parking === 'underground' || tags.parking === 'multi-storey') {
                    name = tags.parking === 'underground' ? 'Subterranean Parking Garage' : 'Multi-Level Parking Garage';
                  } else {
                    name = 'Public Parking Facility';
                  }
                }

                return {
                  id: `osm-${elem.type}-${elem.id}`,
                  name,
                  lat,
                  lon,
                  type: tags.parking || 'surface',
                  capacity: tags.capacity ? String(tags.capacity) : 'Unknown',
                };
              })
              .filter(Boolean) as ParkingFacility[];

            if (parsed.length > 0) {
              return parsed;
            }
          }
        }
      } catch {
        clearTimeout(overpassTimeout);
      }
    }

    // 3. Bundled static JSON fallback (Guarantees map NEVER drops to 0 lots)
    return this.getBundledBackup(city);
  }
}
