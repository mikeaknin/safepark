import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeocodingAdapter } from '../data/adapters/GeocodingAdapter';
import { SAN_FRANCISCO_VIEWBOX } from '../domain/models/GeocodedLocation';

describe('GeocodingAdapter & San Francisco Bounded Geocoding Engine', () => {
  let adapter: GeocodingAdapter;

  beforeEach(() => {
    adapter = new GeocodingAdapter();
    vi.restoreAllMocks();
  });

  describe('Multi-Pattern Address Normalization', () => {
    it('should parse intersection tokens with ampersand (&)', () => {
      const result = adapter.normalizeQuery('Mission & 16th');
      expect(result.isIntersection).toBe(true);
      expect(result.normalizedQuery).toBe('Mission Street & 16th Street, San Francisco, CA');
    });

    it('should parse intersection tokens with "and" or "@"', () => {
      const andResult = adapter.normalizeQuery('Market and 4th');
      expect(andResult.isIntersection).toBe(true);
      expect(andResult.normalizedQuery).toBe('Market Street & 4th Street, San Francisco, CA');

      const atResult = adapter.normalizeQuery('Columbus @ Broadway');
      expect(atResult.isIntersection).toBe(true);
      expect(atResult.normalizedQuery).toBe('Columbus Avenue & Broadway, San Francisco, CA');
    });

    it('should normalize standard street addresses and append San Francisco context', () => {
      const result = adapter.normalizeQuery('772 Folsom St');
      expect(result.isIntersection).toBe(false);
      expect(result.normalizedQuery).toContain('772 Folsom St');
      expect(result.normalizedQuery).toContain('San Francisco, CA');
    });

    it('should preserve explicit San Francisco phrasing in query', () => {
      const result = adapter.normalizeQuery('1000 Van Ness Ave, San Francisco, CA');
      expect(result.isIntersection).toBe(false);
      expect(result.normalizedQuery).toBe('1000 Van Ness Ave, San Francisco, CA');
    });
  });

  describe('San Francisco Municipal Bounding Constraints', () => {
    it('should confirm coordinates within San Francisco viewbox', () => {
      // Moscone Center
      expect(adapter.isWithinSfBounds(37.7842, -122.4015)).toBe(true);
      // Ocean Beach
      expect(adapter.isWithinSfBounds(37.7600, -122.5090)).toBe(true);
      // Fisherman's Wharf
      expect(adapter.isWithinSfBounds(37.8087, -122.4098)).toBe(true);
    });

    it('should reject coordinates outside San Francisco municipal boundary', () => {
      // Oakland (East of SF)
      expect(adapter.isWithinSfBounds(37.8044, -122.2712)).toBe(false);
      // San Jose (South of SF)
      expect(adapter.isWithinSfBounds(37.3382, -121.8863)).toBe(false);
      // Marin / San Rafael (North of SF)
      expect(adapter.isWithinSfBounds(37.9735, -122.5311)).toBe(false);
    });
  });

  describe('Fallback Municipal Landmarks & Offline Resolution', () => {
    it('should resolve prominent SF landmarks from the offline municipal catalog', async () => {
      const results = await adapter.forwardGeocode('Oracle Park');
      expect(results.length).toBeGreaterThan(0);
      const topMatch = results[0];
      expect(topMatch.name).toContain('Oracle Park');
      expect(adapter.isWithinSfBounds(topMatch.coordinates.lat, topMatch.coordinates.lng)).toBe(true);
    });

    it('should resolve cross-street intersections from the municipal fallback catalog', async () => {
      const results = await adapter.forwardGeocode('Mission & 16th');
      expect(results.length).toBeGreaterThan(0);
      const match = results.find((r) => r.placeType === 'intersection');
      expect(match).toBeDefined();
      expect(match?.formattedAddress).toContain('Mission');
    });

    it('should provide default popular destinations on empty or short queries', async () => {
      const results = await adapter.forwardGeocode('');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].city).toBe('San Francisco');
    });
  });

  describe('Client-Side Caching & AbortSignal Handling', () => {
    it('should cache results and return identical payload on repeated queries', async () => {
      const first = await adapter.forwardGeocode('Salesforce Tower');
      const second = await adapter.forwardGeocode('Salesforce Tower');
      expect(first).toEqual(second);
    });

    it('should handle AbortSignal cancelation gracefully', async () => {
      const controller = new AbortController();
      controller.abort();

      const results = await adapter.forwardGeocode('Union Square', controller.signal);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Static searchDestinations Bridge for AppContext', () => {
    it('should return SearchDestination objects with id, name, address, and coordinates', async () => {
      const destinations = await GeocodingAdapter.searchDestinations('Moscone Center');
      expect(destinations.length).toBeGreaterThan(0);
      expect(destinations[0]).toHaveProperty('id');
      expect(destinations[0]).toHaveProperty('name');
      expect(destinations[0]).toHaveProperty('address');
      expect(destinations[0]).toHaveProperty('coordinates');
      expect(destinations[0].coordinates.lat).toBeCloseTo(37.7842, 1);
    });
  });
});
