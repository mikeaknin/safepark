import { GeocodedLocation } from '../models/GeocodedLocation';

export interface IGeocodingRepository {
  /**
   * Forward geocodes a query string (street address, intersection, or landmark)
   * with strict municipal bounding to San Francisco.
   */
  forwardGeocode(query: string, signal?: AbortSignal): Promise<GeocodedLocation[]>;

  /**
   * Reverse geocodes coordinates (lat, lng) to resolve the nearest street address.
   */
  reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<GeocodedLocation | null>;

  /**
   * Parses and normalizes input text (e.g. cross-streets with &, and, @).
   */
  normalizeQuery(rawQuery: string): { normalizedQuery: string; isIntersection: boolean };
}
