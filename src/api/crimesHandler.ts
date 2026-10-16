/**
 * Serverless / Edge Handler for /api/crimes?city=[sf|la]
 * Fetches live municipal crime feeds from SFPD DataSF and LAPD DataLA.
 */

export interface NormalizedCrimeIncident {
  id: string;
  datetime: string;
  category: string;
  subcategory?: string;
  lat: number;
  lon: number;
}

// In-memory server cache to protect upstream rate limits (1 hour TTL)
const cache: {
  [city: string]: { data: NormalizedCrimeIncident[]; timestamp: number };
} = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function getDateMinusDays(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

export async function fetchLiveCrimes(city: 'sf' | 'la'): Promise<NormalizedCrimeIncident[]> {
  const cached = cache[city];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (city === 'sf') {
    const url = new URL('https://data.sfgov.org/resource/wg3w-h783.json');
    url.searchParams.set('$select', 'incident_datetime, incident_category, incident_subcategory, latitude, longitude');
    url.searchParams.set(
      '$where',
      `incident_date >= '${ninetyDaysAgo}' AND incident_category in ('Larceny Theft', 'Motor Vehicle Theft', 'Burglary') AND latitude IS NOT NULL`
    );
    url.searchParams.set('$limit', '1500');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);

    try {
      const resp = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'SafePark/1.0 (https://safepark-pearl.vercel.app)',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        throw new Error(`DataSF returned HTTP ${resp.status}`);
      }

      const raw = await resp.json();
      if (!Array.isArray(raw)) {
        throw new Error('DataSF response was not an array');
      }

      const incidents: NormalizedCrimeIncident[] = raw
        .map((r: any, idx: number) => {
          const lat = parseFloat(r.latitude);
          const lon = parseFloat(r.longitude);
          if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) return null;
          return {
            id: r.row_id || `sf-crime-${idx}-${lat.toFixed(5)}_${lon.toFixed(5)}`,
            datetime: r.incident_datetime || ninetyDaysAgo,
            category: r.incident_category || 'Larceny Theft',
            subcategory: r.incident_subcategory || '',
            lat,
            lon,
          };
        })
        .filter(Boolean) as NormalizedCrimeIncident[];

      cache[city] = { data: incidents, timestamp: Date.now() };
      return incidents;
    } catch (err: any) {
      clearTimeout(timeout);
      // If cached data exists even if stale, return it
      if (cached && cached.data.length > 0) {
        return cached.data;
      }
      throw err;
    }
  } else if (city === 'la') {
    const url = new URL('https://data.lacity.org/resource/2nrs-mtv8.json');
    url.searchParams.set('$select', 'dr_no, date_occ, crm_cd_desc, lat, lon');
    url.searchParams.set(
      '$where',
      `date_occ >= '${ninetyDaysAgo}' AND (crm_cd_desc like '%THEFT FROM MOTOR VEHICLE%' or crm_cd_desc like '%BURGLARY FROM VEHICLE%' or crm_cd_desc like '%VEHICLE, STOLEN%') AND lat > 0`
    );
    url.searchParams.set('$limit', '1500');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);

    try {
      const resp = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'SafePark/1.0 (https://safepark-pearl.vercel.app)',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        throw new Error(`DataLA returned HTTP ${resp.status}`);
      }

      let raw = await resp.json();
      if (!Array.isArray(raw)) {
        throw new Error('DataLA response was not an array');
      }

      // If the dataset's latest records lag behind real-time and return 0,
      // fallback to the most recent 1500 records ordered by date_occ DESC
      if (raw.length === 0) {
        const fallbackUrl = new URL('https://data.lacity.org/resource/2nrs-mtv8.json');
        fallbackUrl.searchParams.set('$select', 'dr_no, date_occ, crm_cd_desc, lat, lon');
        fallbackUrl.searchParams.set(
          '$where',
          `(crm_cd_desc like '%THEFT FROM MOTOR VEHICLE%' or crm_cd_desc like '%BURGLARY FROM VEHICLE%' or crm_cd_desc like '%VEHICLE, STOLEN%') AND lat > 0`
        );
        fallbackUrl.searchParams.set('$order', 'date_occ DESC');
        fallbackUrl.searchParams.set('$limit', '1500');

        const fallbackResp = await fetch(fallbackUrl.toString(), {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'SafePark/1.0 (https://safepark-pearl.vercel.app)',
          },
          redirect: 'follow',
        });
        if (fallbackResp.ok) {
          const fallbackData = await fallbackResp.json();
          if (Array.isArray(fallbackData) && fallbackData.length > 0) {
            raw = fallbackData;
          }
        }
      }

      const incidents: NormalizedCrimeIncident[] = raw
        .map((r: any) => {
          const lat = parseFloat(r.lat);
          const lon = parseFloat(r.lon);
          if (isNaN(lat) || isNaN(lon) || lat <= 0 || lon >= 0) return null;
          return {
            id: r.dr_no || `la-crime-${lat.toFixed(5)}_${lon.toFixed(5)}`,
            datetime: r.date_occ || ninetyDaysAgo,
            category: 'Motor Vehicle Theft/Burglary',
            subcategory: r.crm_cd_desc || 'Theft from Motor Vehicle',
            lat,
            lon,
          };
        })
        .filter(Boolean) as NormalizedCrimeIncident[];

      cache[city] = { data: incidents, timestamp: Date.now() };
      return incidents;
    } catch (err: any) {
      clearTimeout(timeout);
      if (cached && cached.data.length > 0) {
        return cached.data;
      }
      throw err;
    }
  }

  throw new Error(`Unsupported city: ${city}`);
}

export async function handleCrimesApi(req: any, res?: any): Promise<Response | void> {
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
    const data = await fetchLiveCrimes(city);
    return sendResponse(200, { city, count: data.length, data });
  } catch (err: any) {
    return sendResponse(502, {
      error: 'Municipal Crime Feed Error',
      city,
      message: err?.message || String(err),
      data: [],
    });
  }
}

