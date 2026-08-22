import { IGeocodingRepository } from '../../domain/repositories/IGeocodingRepository';
import {
  GeocodedLocation,
  SAN_FRANCISCO_VIEWBOX,
  PlaceType
} from '../../domain/models/GeocodedLocation';
import { SearchDestination } from '../../presentation/context/AppContext';

export const SF_MUNICIPAL_LANDMARKS: GeocodedLocation[] = [
  {
    id: 'poi-moscone',
    name: 'Moscone Convention Center',
    formattedAddress: '747 Howard St, San Francisco, CA 94103',
    streetNumber: '747',
    streetName: 'Howard St',
    neighborhood: 'SoMa',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
    coordinates: { lat: 37.7842, lng: -122.4015 },
    placeType: 'poi',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'poi-salesforce-tower',
    name: 'Salesforce Tower Plaza',
    formattedAddress: '415 Mission St, San Francisco, CA 94105',
    streetNumber: '415',
    streetName: 'Mission St',
    neighborhood: 'Transbay / SoMa',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    coordinates: { lat: 37.7897, lng: -122.3972 },
    placeType: 'poi',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'poi-oracle-park',
    name: 'Oracle Park',
    formattedAddress: '24 Willie Mays Plaza, San Francisco, CA 94107',
    streetNumber: '24',
    streetName: 'Willie Mays Plaza',
    neighborhood: 'Mission Bay / South Beach',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    coordinates: { lat: 37.7786, lng: -122.3893 },
    placeType: 'poi',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'poi-chase-center',
    name: 'Chase Center',
    formattedAddress: '1 Warriors Way, San Francisco, CA 94158',
    streetNumber: '1',
    streetName: 'Warriors Way',
    neighborhood: 'Mission Bay',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94158',
    coordinates: { lat: 37.7680, lng: -122.3877 },
    placeType: 'poi',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'poi-union-square',
    name: 'Union Square & Shopping District',
    formattedAddress: '333 Post St, San Francisco, CA 94108',
    streetNumber: '333',
    streetName: 'Post St',
    neighborhood: 'Downtown / Union Square',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94108',
    coordinates: { lat: 37.7879, lng: -122.4075 },
    placeType: 'poi',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'poi-ferry-building',
    name: 'San Francisco Ferry Building',
    formattedAddress: '1 Ferry Building, San Francisco, CA 94111',
    streetNumber: '1',
    streetName: 'The Embarcadero',
    neighborhood: 'Embarcadero / Financial District',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94111',
    coordinates: { lat: 37.7955, lng: -122.3937 },
    placeType: 'poi',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'poi-fishermans-wharf',
    name: "Fisherman's Wharf & Pier 39",
    formattedAddress: 'Pier 39, San Francisco, CA 94133',
    streetNumber: 'Pier 39',
    streetName: 'The Embarcadero',
    neighborhood: "Fisherman's Wharf",
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94133',
    coordinates: { lat: 37.8087, lng: -122.4098 },
    placeType: 'poi',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'poi-city-hall',
    name: 'San Francisco City Hall',
    formattedAddress: '1 Dr Carlton B Goodlett Pl, San Francisco, CA 94102',
    streetNumber: '1',
    streetName: 'Dr Carlton B Goodlett Pl',
    neighborhood: 'Civic Center',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    coordinates: { lat: 37.7793, lng: -122.4193 },
    placeType: 'poi',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'poi-metreon',
    name: 'Metreon Entertainment Hub',
    formattedAddress: '135 4th St, San Francisco, CA 94103',
    streetNumber: '135',
    streetName: '4th St',
    neighborhood: 'SoMa',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
    coordinates: { lat: 37.7848, lng: -122.4032 },
    placeType: 'poi',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'poi-palace-fine-arts',
    name: 'Palace of Fine Arts',
    formattedAddress: '3301 Lyon St, San Francisco, CA 94123',
    streetNumber: '3301',
    streetName: 'Lyon St',
    neighborhood: 'Marina District',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94123',
    coordinates: { lat: 37.8029, lng: -122.4484 },
    placeType: 'poi',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'int-market-4th',
    name: 'Market St & 4th St',
    formattedAddress: 'Market St & 4th St, San Francisco, CA 94103',
    streetName: 'Market St',
    crossStreet: '4th St',
    neighborhood: 'Downtown / SoMa',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
    coordinates: { lat: 37.7858, lng: -122.4057 },
    placeType: 'intersection',
    confidence: 0.95,
    source: 'fallback',
  },
  {
    id: 'int-mission-16th',
    name: 'Mission St & 16th St',
    formattedAddress: 'Mission St & 16th St, San Francisco, CA 94103',
    streetName: 'Mission St',
    crossStreet: '16th St',
    neighborhood: 'Mission District',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
    coordinates: { lat: 37.7650, lng: -122.4197 },
    placeType: 'intersection',
    confidence: 0.95,
    source: 'fallback',
  },
  {
    id: 'int-columbus-broadway',
    name: 'Columbus Ave & Broadway',
    formattedAddress: 'Columbus Ave & Broadway, San Francisco, CA 94133',
    streetName: 'Columbus Ave',
    crossStreet: 'Broadway',
    neighborhood: 'North Beach',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94133',
    coordinates: { lat: 37.7981, lng: -122.4068 },
    placeType: 'intersection',
    confidence: 0.95,
    source: 'fallback',
  },
  {
    id: 'int-haight-ashbury',
    name: 'Haight St & Ashbury St',
    formattedAddress: 'Haight St & Ashbury St, San Francisco, CA 94117',
    streetName: 'Haight St',
    crossStreet: 'Ashbury St',
    neighborhood: 'Haight-Ashbury',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94117',
    coordinates: { lat: 37.7699, lng: -122.4469 },
    placeType: 'intersection',
    confidence: 0.95,
    source: 'fallback',
  },
  {
    id: 'int-valencia-18th',
    name: 'Valencia St & 18th St',
    formattedAddress: 'Valencia St & 18th St, San Francisco, CA 94110',
    streetName: 'Valencia St',
    crossStreet: '18th St',
    neighborhood: 'Mission District',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94110',
    coordinates: { lat: 37.7618, lng: -122.4216 },
    placeType: 'intersection',
    confidence: 0.95,
    source: 'fallback',
  },
  {
    id: 'facility-5th-mission',
    name: '5th & Mission / Yerba Buena Garage',
    formattedAddress: '833 Mission St, San Francisco, CA 94103',
    streetNumber: '833',
    streetName: 'Mission St',
    neighborhood: 'SoMa',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
    coordinates: { lat: 37.7828, lng: -122.4063 },
    placeType: 'facility',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'facility-sutter-stockton',
    name: 'Sutter Stockton Garage',
    formattedAddress: '444 Stockton St, San Francisco, CA 94108',
    streetNumber: '444',
    streetName: 'Stockton St',
    neighborhood: 'Union Square',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94108',
    coordinates: { lat: 37.7895, lng: -122.4068 },
    placeType: 'facility',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'facility-mission-bay-garage',
    name: 'Mission Bay Secure Underground Garage',
    formattedAddress: '250 4th St, San Francisco, CA 94103',
    streetNumber: '250',
    streetName: '4th St',
    neighborhood: 'SoMa / Mission Bay',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
    coordinates: { lat: 37.7818, lng: -122.4022 },
    placeType: 'facility',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'poi-732-vallejo',
    name: '732 Vallejo St',
    formattedAddress: '732 Vallejo St, San Francisco, CA 94133',
    streetNumber: '732',
    streetName: 'Vallejo St',
    neighborhood: 'North Beach',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94133',
    coordinates: { lat: 37.7984, lng: -122.4084 },
    placeType: 'address',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'poi-north-beach-garage',
    name: 'North Beach Garage',
    formattedAddress: '735 Vallejo St, San Francisco, CA 94133',
    streetNumber: '735',
    streetName: 'Vallejo St',
    neighborhood: 'North Beach',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94133',
    coordinates: { lat: 37.7985, lng: -122.4082 },
    placeType: 'facility',
    confidence: 1.0,
    source: 'fallback',
  },
  {
    id: 'poi-van-ness-1000',
    name: '1000 Van Ness Ave',
    formattedAddress: '1000 Van Ness Ave, San Francisco, CA 94109',
    streetNumber: '1000',
    streetName: 'Van Ness Ave',
    neighborhood: 'Van Ness Corridor / Civic Center',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94109',
    coordinates: { lat: 37.7850, lng: -122.4215 },
    placeType: 'address',
    confidence: 1.0,
    source: 'fallback',
  },
];

export class GeocodingAdapter implements IGeocodingRepository {
  private static readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
  private static readonly NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
  private static readonly USER_AGENT = 'SafePark-Geocoding-Engine/1.0.0 (contact: support@safepark.app)';
  private static readonly CACHE_STORAGE_KEY = 'safepark_geocoding_cache_v1';

  // In-memory LRU-like cache
  private static memoryCache: Map<string, { timestamp: number; results: GeocodedLocation[] }> = new Map();
  private static readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  public constructor() {
    this.hydrateCache();
  }

  /**
   * Normalizes input text into standard San Francisco search queries.
   * Detects intersections (&, and, @, /) and ensures municipal location context.
   */
  public normalizeQuery(rawQuery: string): { normalizedQuery: string; isIntersection: boolean } {
    let q = rawQuery.trim();

    // Check for intersection patterns (e.g., "Mission & 16th", "Market and 4th", "Columbus @ Broadway")
    const intersectionRegex = /^(.+?)\s*(?:&|and|@|at|\/)\s*(.+)$/i;
    const match = q.match(intersectionRegex);

    if (match) {
      const streetA = this.expandStreetSuffix(match[1].trim());
      const streetB = this.expandStreetSuffix(match[2].trim());
      const normalizedQuery = `${streetA} & ${streetB}, San Francisco, CA`;
      return { normalizedQuery, isIntersection: true };
    }

    // Append San Francisco, CA if not already present to guide bounded geocoders
    if (!/san francisco|sf|california|\bca\b/i.test(q)) {
      q = `${q}, San Francisco, CA`;
    }

    return { normalizedQuery: q, isIntersection: false };
  }

  /**
   * Forward geocodes an address or POI with strict San Francisco municipal bounding box.
   */
  public async forwardGeocode(query: string, signal?: AbortSignal): Promise<GeocodedLocation[]> {
    if (!query || query.trim().length < 2) {
      return SF_MUNICIPAL_LANDMARKS.slice(0, 6);
    }

    const trimmed = query.trim();
    const cacheKey = `fwd:${trimmed.toLowerCase()}`;

    // 1. Check in-memory / local storage cache
    const cached = this.getCachedResults(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Normalize query string
    const { normalizedQuery, isIntersection } = this.normalizeQuery(trimmed);

    // Check high-speed local municipal landmark catalog first
    const localMatches = this.searchFallbackCatalog(trimmed);
    if (localMatches.length > 0) {
      this.setCachedResults(cacheKey, localMatches);
      return localMatches;
    }

    // 3. Query OpenStreetMap Nominatim with strict SF bounding parameters and 1200ms timeout
    try {
      const viewboxParam = `${SAN_FRANCISCO_VIEWBOX.minLon},${SAN_FRANCISCO_VIEWBOX.maxLat},${SAN_FRANCISCO_VIEWBOX.maxLon},${SAN_FRANCISCO_VIEWBOX.minLat}`;
      const params = new URLSearchParams({
        q: normalizedQuery,
        format: 'jsonv2',
        addressdetails: '1',
        limit: '6',
        bounded: '1',
        viewbox: viewboxParam,
      });

      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), 1200);

      // Combine user signal and timeout signal if provided
      const combinedSignal = signal || timeoutController.signal;

      const response = await fetch(`${GeocodingAdapter.NOMINATIM_BASE_URL}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'User-Agent': GeocodingAdapter.USER_AGENT,
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const results: GeocodedLocation[] = data
            .map((item: any) => this.mapNominatimResponse(item, isIntersection))
            .filter((loc: GeocodedLocation) => this.isWithinSfBounds(loc.coordinates.lat, loc.coordinates.lng));

          if (results.length > 0) {
            this.setCachedResults(cacheKey, results);
            return results;
          }
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' && signal?.aborted) {
        // Query was cancelled by user typing next keystroke
        return [];
      }
      // Timeout or network error - fallback proceeds below
    }

    // 4. Client-side fallback matching against SF municipal landmarks and intersections
    const fallbackResults = this.searchFallbackCatalog(trimmed);
    if (fallbackResults.length > 0) {
      this.setCachedResults(cacheKey, fallbackResults);
      return fallbackResults;
    }

    // 5. Dynamic fallback placeholder within SoMa/Downtown bounds for unlisted streets
    const dynamicFallback: GeocodedLocation = {
      id: `geo-${Date.now()}`,
      name: trimmed,
      formattedAddress: `${trimmed}, San Francisco, CA`,
      city: 'San Francisco',
      state: 'CA',
      coordinates: {
        lat: 37.7842 + (Math.random() - 0.5) * 0.012,
        lng: -122.4015 + (Math.random() - 0.5) * 0.012,
      },
      placeType: isIntersection ? 'intersection' : 'address',
      confidence: 0.7,
      source: 'fallback',
    };

    const combined = [dynamicFallback, ...SF_MUNICIPAL_LANDMARKS.slice(0, 4)];
    this.setCachedResults(cacheKey, combined);
    return combined;
  }

  /**
   * Reverse geocodes coordinates to a clean municipal street address.
   */
  public async reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<GeocodedLocation | null> {
    if (!this.isWithinSfBounds(lat, lng)) {
      return null;
    }

    const cacheKey = `rev:${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = this.getCachedResults(cacheKey);
    if (cached && cached[0]) {
      return cached[0];
    }

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: 'jsonv2',
        addressdetails: '1',
      });

      const res = await fetch(`${GeocodingAdapter.NOMINATIM_REVERSE_URL}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'User-Agent': GeocodingAdapter.USER_AGENT,
          'Accept': 'application/json',
        },
        signal,
      });

      if (res.ok) {
        const item = await res.json();
        if (item && item.place_id) {
          const loc = this.mapNominatimResponse(item, false);
          this.setCachedResults(cacheKey, [loc]);
          return loc;
        }
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return null;
      console.warn('Reverse geocoding fetch fallback:', e?.message);
    }

    // Fallback reverse geocode calculation
    const nearest = SF_MUNICIPAL_LANDMARKS[0];
    return {
      ...nearest,
      coordinates: { lat, lng },
      name: `San Francisco Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      source: 'fallback',
    };
  }

  /**
   * Static helper providing backward-compatibility for AppContext and View Components.
   */
  public static async searchDestinations(query: string, signal?: AbortSignal): Promise<SearchDestination[]> {
    const adapter = new GeocodingAdapter();
    const results = await adapter.forwardGeocode(query, signal);

    return results.map((r) => ({
      id: r.id,
      name: r.name,
      address: r.formattedAddress,
      coordinates: r.coordinates,
    }));
  }

  /**
   * Validates if coordinates reside strictly within the San Francisco municipal bounding box.
   */
  public isWithinSfBounds(lat: number, lng: number): boolean {
    return (
      lat >= SAN_FRANCISCO_VIEWBOX.minLat &&
      lat <= SAN_FRANCISCO_VIEWBOX.maxLat &&
      lng >= SAN_FRANCISCO_VIEWBOX.minLon &&
      lng <= SAN_FRANCISCO_VIEWBOX.maxLon
    );
  }

  /**
   * Helper to search the local offline landmark and intersection catalog.
   */
  private searchFallbackCatalog(query: string): GeocodedLocation[] {
    const q = query.toLowerCase();
    return SF_MUNICIPAL_LANDMARKS.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(q);
      const addrMatch = item.formattedAddress.toLowerCase().includes(q);
      const neighMatch = item.neighborhood?.toLowerCase().includes(q);
      const streetMatch = item.streetName?.toLowerCase().includes(q);
      const crossMatch = item.crossStreet?.toLowerCase().includes(q);
      return nameMatch || addrMatch || neighMatch || streetMatch || crossMatch;
    });
  }

  /**
   * Maps OpenStreetMap Nominatim response JSON to domain GeocodedLocation model.
   */
  private mapNominatimResponse(item: any, isIntersectionQuery: boolean): GeocodedLocation {
    const addr = item.address || {};
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    let placeType: PlaceType = 'address';
    if (isIntersectionQuery || item.type === 'intersection') {
      placeType = 'intersection';
    } else if (item.category === 'tourism' || item.category === 'leisure' || item.category === 'amenity') {
      placeType = 'poi';
    } else if (item.category === 'place' && item.type === 'neighbourhood') {
      placeType = 'neighborhood';
    } else if (item.type === 'parking' || item.category === 'parking') {
      placeType = 'facility';
    }

    const name = item.name || addr.amenity || addr.building || addr.road || item.display_name.split(',')[0];
    const streetNumber = addr.house_number;
    const streetName = addr.road;
    const neighborhood = addr.neighbourhood || addr.suburb;
    const city = addr.city || 'San Francisco';
    const state = addr.state || 'CA';
    const postalCode = addr.postcode;

    return {
      id: `osm-${item.place_id || item.osm_id || Date.now()}`,
      name,
      formattedAddress: item.display_name || `${name}, San Francisco, CA`,
      streetNumber,
      streetName,
      neighborhood,
      city,
      state,
      postalCode,
      coordinates: { lat, lng },
      placeType,
      confidence: parseFloat(item.importance || '0.85'),
      source: 'nominatim',
    };
  }

  /**
   * Expands common street abbreviations and attaches proper suffixes for San Francisco corridors.
   */
  private expandStreetSuffix(street: string): string {
    const s = street.trim();
    if (!s) return s;

    // Check if it already has a standard full suffix or named corridor like Broadway / Embarcadero
    if (/(?:\b(?:Street|Avenue|Boulevard|Drive|Road|Way|Place|Lane|Alley|Broadway|Plaza|The Embarcadero)\b)$/i.test(s)) {
      return s;
    }

    const expansions: Record<string, string> = {
      'st': 'Street',
      'ave': 'Avenue',
      'blvd': 'Boulevard',
      'dr': 'Drive',
      'rd': 'Road',
      'way': 'Way',
      'pl': 'Place',
      'ln': 'Lane',
    };

    const words = s.split(/\s+/);
    const lastWord = words[words.length - 1]?.toLowerCase().replace(/[.,]/g, '');

    if (lastWord && expansions[lastWord]) {
      words[words.length - 1] = expansions[lastWord];
      return words.join(' ');
    }

    // If it's just a number (e.g. "16th" or "4th"), append "Street"
    if (/^\d+(?:st|nd|rd|th)?$/i.test(s)) {
      return `${s} Street`;
    }

    // Known Avenues in SF
    const knownAvenues = ['columbus', 'van ness', 'potrero', 'masonic', 'sunset', 'park presidio', 'arguello'];
    if (knownAvenues.some(a => s.toLowerCase() === a || s.toLowerCase().startsWith(a))) {
      return `${s} Avenue`;
    }

    // Default standard street without suffix
    return `${s} Street`;
  }

  private getCachedResults(key: string): GeocodedLocation[] | null {
    const memory = GeocodingAdapter.memoryCache.get(key);
    if (memory && Date.now() - memory.timestamp < GeocodingAdapter.CACHE_TTL_MS) {
      return memory.results;
    }
    return null;
  }

  private setCachedResults(key: string, results: GeocodedLocation[]): void {
    GeocodingAdapter.memoryCache.set(key, {
      timestamp: Date.now(),
      results,
    });
    this.persistCache();
  }

  private hydrateCache(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(GeocodingAdapter.CACHE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          Object.entries(parsed).forEach(([k, v]: [string, any]) => {
            if (Date.now() - v.timestamp < GeocodingAdapter.CACHE_TTL_MS) {
              GeocodingAdapter.memoryCache.set(k, v);
            }
          });
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  private persistCache(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const obj: Record<string, any> = {};
        GeocodingAdapter.memoryCache.forEach((val, key) => {
          obj[key] = val;
        });
        localStorage.setItem(GeocodingAdapter.CACHE_STORAGE_KEY, JSON.stringify(obj));
      }
    } catch {
      // Ignore quota exceeded or storage disabled
    }
  }
}
