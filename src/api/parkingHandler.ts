/**
 * Serverless / Edge Handler for /api/parking?city=[sf|la]
 * Queries OpenStreetMap Overpass API using optimized bounding boxes:
 * - SF: 37.70, -122.52, 37.83, -122.35
 * - LA Focused Hubs (Downtown LA, Hollywood, Santa Monica, Venice): 33.98, -118.50, 34.11, -118.23
 *
 * Resilient 7-second abort timeout with instant static JSON fallback to prevent Vercel 10s lambda timeouts.
 */

import sfParkingBackup from '../../data/sf_parking_backup.json';
import laParkingBackup from '../../data/la_parking_backup.json';

export interface NormalizedParkingFacility {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: string;
  capacity: string;
}

const cache: {
  [city: string]: { data: NormalizedParkingFacility[]; timestamp: number };
} = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const CITY_BOUNDING_BOXES: Record<'sf' | 'la', string> = {
  sf: '37.70,-122.52,37.83,-122.35',
  la: '33.98,-118.50,34.11,-118.23', // Focused LA high-density hubs
};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const STATIC_BACKUPS: Record<'sf' | 'la', NormalizedParkingFacility[]> = {
  sf: sfParkingBackup as NormalizedParkingFacility[],
  la: laParkingBackup as NormalizedParkingFacility[],
};

export async function fetchLiveParkingFacilities(city: 'sf' | 'la'): Promise<NormalizedParkingFacility[]> {
  const cached = cache[city];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const bbox = CITY_BOUNDING_BOXES[city] || CITY_BOUNDING_BOXES.sf;
  const ql = `[out:json][timeout:25];(node["amenity"="parking"](${bbox});way["amenity"="parking"](${bbox}););out center tags;`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    // 1. Resilient 7-second abort timeout to prevent Vercel 10s execution window kill
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'SafePark/1.0 (https://safepark-pearl.vercel.app)',
        },
        body: `data=${encodeURIComponent(ql)}`,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      // Instant fallback on HTTP 429 (rate limited), 504 (gateway timeout) or server error
      if (!resp.ok) {
        console.warn(`Overpass endpoint ${endpoint} returned HTTP ${resp.status}; falling back.`);
        continue;
      }

      const json = await resp.json();
      if (!json || !Array.isArray(json.elements)) {
        continue;
      }

      const normalized: NormalizedParkingFacility[] = json.elements
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
        .filter(Boolean) as NormalizedParkingFacility[];

      if (normalized.length > 0) {
        cache[city] = { data: normalized, timestamp: Date.now() };
        return normalized;
      }
    } catch (err: any) {
      clearTimeout(timeout);
      // Try next mirror or fallback
    }
  }

  // 2. Fall back to cached memory if previously fetched
  if (cached && cached.data.length > 0) {
    return cached.data;
  }

  // 3. Fall back to bundled static JSON cache of verified parking facilities
  const fallback = STATIC_BACKUPS[city] || STATIC_BACKUPS.sf;
  cache[city] = { data: fallback, timestamp: Date.now() };
  return fallback;
}

export async function handleParkingApi(req: any, res?: any): Promise<Response | void> {
  // CORS & Cache headers
  const cacheHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 's-maxage=3600, stale-while-revalidate=1800',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };

  // Handle preflight OPTIONS
  if (req && (req.method === 'OPTIONS' || (typeof req.headers?.get === 'function' && req.method === 'OPTIONS'))) {
    if (res) {
      if (typeof res.setHeader === 'function') {
        Object.entries(cacheHeaders).forEach(([k, v]) => res.setHeader(k, v));
      }
      if (typeof res.status === 'function') return res.status(200).end();
      if (typeof res.writeHead === 'function') {
        res.writeHead(200, cacheHeaders);
        res.end();
        return;
      }
    }
    return new Response(null, { status: 200, headers: cacheHeaders });
  }

  const url = req?.url ? new URL(req.url, 'http://localhost') : new URL('http://localhost');
  const cityParam = url.searchParams.get('city') || (req?.query && req.query.city) || 'sf';
  const city = cityParam.toLowerCase() === 'la' ? 'la' : 'sf';

  const sendResponse = (statusCode: number, payload: any) => {
    if (res) {
      if (typeof res.setHeader === 'function') {
        Object.entries(cacheHeaders).forEach(([k, v]) => res.setHeader(k, v));
      }
      if (typeof res.status === 'function' && typeof res.json === 'function') {
        return res.status(statusCode).json(payload);
      }
      if (typeof res.writeHead === 'function') {
        res.writeHead(statusCode, cacheHeaders);
        res.end(JSON.stringify(payload));
        return;
      }
    }
    return new Response(JSON.stringify(payload), {
      status: statusCode,
      headers: cacheHeaders,
    });
  };

  try {
    const data = await fetchLiveParkingFacilities(city);
    return sendResponse(200, { city, count: data.length, data });
  } catch (err: any) {
    const fallback = STATIC_BACKUPS[city] || STATIC_BACKUPS.sf;
    return sendResponse(200, {
      city,
      count: fallback.length,
      data: fallback,
      fallback: true,
      message: err?.message || 'Using bundled verified parking lots',
    });
  }
}
