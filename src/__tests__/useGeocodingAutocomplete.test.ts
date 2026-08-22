import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeocodingAdapter } from '../data/adapters/GeocodingAdapter';

describe('Geocoding Autocomplete Logic & Controller Integration', () => {
  let adapter: GeocodingAdapter;

  beforeEach(() => {
    adapter = new GeocodingAdapter();
  });

  it('should suppress empty queries and return default SF landmarks', async () => {
    const results = await adapter.forwardGeocode('');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].city).toBe('San Francisco');
  });

  it('should resolve full autocomplete queries with AbortController', async () => {
    const controller = new AbortController();
    const results = await adapter.forwardGeocode('Salesforce', controller.signal);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name.includes('Salesforce'))).toBe(true);
  });

  it('should abort cleanly when signal is triggered', async () => {
    const controller = new AbortController();
    controller.abort();

    const results = await adapter.forwardGeocode('Oracle Park', controller.signal);
    expect(Array.isArray(results)).toBe(true);
  });
});
