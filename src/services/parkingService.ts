/**
 * SafePark Resilient Parking Facility Service
 * Primary: /api/parking?city=${city} (with 6s timeout) or direct Overpass API query.
 * Fallback: Static client-bundled dataset from src/data/sf_parking_backup.json and src/data/la_parking_backup.json
 */

import { ParkingFacility } from '../lib/safetyScore';
import sfParkingBackup from '../data/sf_parking_backup.json';
import laParkingBackup from '../data/la_parking_backup.json';
import { StreetParkingService } from './streetParkingService';

export type SupportedCity = 'sf' | 'la';

export const PARKING_BOUNDING_BOXES: Record<SupportedCity, string> = {
  sf: '37.70,-122.52,37.83,-122.35',
  la: '33.98,-118.50,34.11,-118.23',
};

/**
 * Merges live Overpass facilities with verified named anchor garages,
 * ensuring anchor facilities are always present and avoiding duplicates (80m window).
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
      return d < 80;
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

    // 2. Direct Socrata Curbside Meter Query using StreetParkingService
    try {
      const streetBlocks = await StreetParkingService.fetchCurbsideStreetBlocks(city, externalSignal);
      if (streetBlocks && streetBlocks.length > 0) {
        return [...streetBlocks, ...anchors];
      }
    } catch {
      // Proceed to Overpass / Bundled fallback
    }

    // 3. Secondary Off-Street Garages from Overpass (Strict 6000ms timeout)
    const bbox = PARKING_BOUNDING_BOXES[city] || PARKING_BOUNDING_BOXES.sf;
    const ql = `[out:json][timeout:25];(node["amenity"="parking"](${bbox});way["amenity"="parking"](${bbox}););out center tags;`;
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

                // Strict Filtering: Exclude any facility tagged with access=private, access=customers, or capacity < 15.
                const access = (tags.access || '').toLowerCase();
                if (access === 'private' || access === 'customers' || access === 'permit' || access === 'no') {
                  return null;
                }

                if (tags.capacity) {
                  const cap = parseInt(String(tags.capacity), 10);
                  if (!isNaN(cap) && cap < 15) return null;
                }

                // Drop any element without a valid name or street address.
                if (!tags.name && !tags['addr:street']) return null;

                let name = tags.name;
                if (!name) {
                  if (tags.operator) {
                    const streetOrNum = tags['addr:street'] || tags['addr:housenumber'] || 'Facility';
                    name = `${tags.operator} - ${streetOrNum}`;
                  } else if (tags['addr:street']) {
                    const houseNum = tags['addr:housenumber'] ? `${tags['addr:housenumber']} ` : '';
                    name = `${houseNum}${tags['addr:street']} Parking`.trim();
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
                  isStreetParking: false,
                };
              })
              .filter(Boolean) as ParkingFacility[];

            if (parsedLive.length > 0) {
              const streetFallback = StreetParkingService.getBundledStreetBackup(city);
              const mergedGarages = mergeWithAnchorGarages(anchors, parsedLive);
              return [...streetFallback, ...mergedGarages];
            }
          }
        }
      } catch {
        clearTimeout(overpassTimeout);
      }
    }

    // 4. Bundled static fallback: street blocks + anchor garages
    const streetFallback = StreetParkingService.getBundledStreetBackup(city);
    return [...streetFallback, ...anchors];
  }
}
