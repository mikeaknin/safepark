/**
 * SafePark Resilient Crime Service
 * Fetches 90-day vehicle theft and burglary records for SF & LA.
 * Primary: /api/crimes?city=${city} (with 6s timeout)
 * Fallback: Direct browser query to official DataSF / DataLA Socrata API.
 */

import { CrimeIncident } from '../lib/safetyScore';

export type SupportedCity = 'sf' | 'la';

export class CrimeService {
  /**
   * Fetches crimes with primary /api/crimes (6s timeout) and direct Socrata fallback.
   */
  public static async fetchCrimes(city: SupportedCity, externalSignal?: AbortSignal): Promise<CrimeIncident[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const onExternalAbort = () => controller.abort();
    if (externalSignal) {
      externalSignal.addEventListener('abort', onExternalAbort);
    }

    // 1. Try local/Vercel serverless proxy endpoint
    try {
      const response = await fetch(`/api/crimes?city=${city}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const text = await response.text();
        // Check if returned HTML (e.g. SPA index.html fallback)
        if (text && !text.trim().startsWith('<') && !text.includes('<!DOCTYPE') && !text.includes('DOCTYPE html')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed.data) && parsed.data.length > 0) {
            return parsed.data;
          }
        }
      }
    } catch {
      // Proxy failed or timed out — proceed immediately to direct municipal fallback
    } finally {
      clearTimeout(timeoutId);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', onExternalAbort);
      }
    }

    // 2. Direct Socrata Open Data endpoints (CORS enabled by default in browsers)
    return this.fetchDirectSocrata(city, externalSignal);
  }

  /**
   * Direct browser fetch to Socrata Open Data endpoints
   */
  public static async fetchDirectSocrata(city: SupportedCity, signal?: AbortSignal): Promise<CrimeIncident[]> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      if (city === 'sf') {
        const url = new URL('https://data.sfgov.org/resource/wg3w-h783.json');
        url.searchParams.set('$select', 'incident_datetime, incident_category, incident_subcategory, latitude, longitude');
        url.searchParams.set(
          '$where',
          `incident_date >= '${ninetyDaysAgo}' AND incident_category in ('Larceny Theft', 'Motor Vehicle Theft', 'Burglary') AND latitude IS NOT NULL`
        );
        url.searchParams.set('$limit', '1500');

        const resp = await fetch(url.toString(), {
          headers: { Accept: 'application/json' },
          signal,
        });

        if (resp.ok) {
          const raw = await resp.json();
          if (Array.isArray(raw)) {
            return raw
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
              .filter(Boolean) as CrimeIncident[];
          }
        }
      } else {
        const url = new URL('https://data.lacity.org/resource/2nrs-mtv8.json');
        url.searchParams.set('$select', 'dr_no, date_occ, crm_cd_desc, lat, lon');
        url.searchParams.set(
          '$where',
          `date_occ >= '${ninetyDaysAgo}' AND (crm_cd_desc like '%THEFT FROM MOTOR VEHICLE%' or crm_cd_desc like '%BURGLARY FROM VEHICLE%' or crm_cd_desc like '%VEHICLE, STOLEN%') AND lat > 0`
        );
        url.searchParams.set('$limit', '1500');

        const resp = await fetch(url.toString(), {
          headers: { Accept: 'application/json' },
          signal,
        });

        let raw = resp.ok ? await resp.json() : [];

        // If latest records lag behind real-time, fallback to most recent 1500 records
        if (!Array.isArray(raw) || raw.length === 0) {
          const fallbackUrl = new URL('https://data.lacity.org/resource/2nrs-mtv8.json');
          fallbackUrl.searchParams.set('$select', 'dr_no, date_occ, crm_cd_desc, lat, lon');
          fallbackUrl.searchParams.set(
            '$where',
            `(crm_cd_desc like '%THEFT FROM MOTOR VEHICLE%' or crm_cd_desc like '%BURGLARY FROM VEHICLE%' or crm_cd_desc like '%VEHICLE, STOLEN%') AND lat > 0`
          );
          fallbackUrl.searchParams.set('$order', 'date_occ DESC');
          fallbackUrl.searchParams.set('$limit', '1500');

          const fallbackResp = await fetch(fallbackUrl.toString(), {
            headers: { Accept: 'application/json' },
            signal,
          });
          if (fallbackResp.ok) {
            raw = await fallbackResp.json();
          }
        }

        if (Array.isArray(raw)) {
          return raw
            .map((r: any) => {
              const lat = parseFloat(r.lat);
              const lon = parseFloat(r.lon);
              if (isNaN(lat) || isNaN(lon) || lat <= 0 || lon >= 0) return null;
              return {
                id: r.dr_no,
                datetime: r.date_occ || ninetyDaysAgo,
                category: 'Motor Vehicle Theft/Burglary',
                subcategory: r.crm_cd_desc || 'Theft from Motor Vehicle',
                lat,
                lon,
              };
            })
            .filter(Boolean) as CrimeIncident[];
        }
      }
    } catch (err) {
      console.warn(`Direct Socrata query for ${city} failed:`, err);
    }

    return [];
  }
}
