import { describe, it, expect } from 'vitest';
import { MUNICIPAL_CITIES, MultiCityCrimeIngestion } from '../data/etl/MultiCityCrimeIngestion';

describe('Multi-City Municipal Data ETL Ingestion', () => {
  it('should define configurations for all 6 target metropolitan launch markets', () => {
    const expectedCities = ['san_francisco', 'new_york_city', 'chicago', 'los_angeles', 'seattle', 'austin'];
    expectedCities.forEach((cityKey) => {
      const city = MUNICIPAL_CITIES[cityKey];
      expect(city).toBeDefined();
      expect(city.cityName.length).toBeGreaterThan(0);
      expect(city.endpointUrl).toMatch(/^https:\/\//);
      expect(city.baselineCsiScore).toBeGreaterThanOrEqual(50);
      expect(city.bounds.maxLat).toBeGreaterThan(city.bounds.minLat);
      expect(city.bounds.maxLng).toBeGreaterThan(city.bounds.minLng);
    });
  });

  it('should normalize raw municipal crime records into standard SafePark schema', () => {
    const rawNycRecord = {
      cmplnt_num: '987654321',
      cmplnt_fr_dt: '2026-08-15T14:30:00.000',
      ofns_desc: 'GRAND LARCENY OF MOTOR VEHICLE',
      latitude: '40.7589',
      longitude: '-73.9851',
    };

    const normalized = MultiCityCrimeIngestion.normalizeRecord('new_york_city', rawNycRecord);
    expect(normalized).not.toBeNull();
    expect(normalized?.id).toBe('new_york_city-987654321');
    expect(normalized?.category).toBe('vehicle_theft');
    expect(normalized?.severityWeight).toBe(0.9);
    expect(normalized?.coordinates.lat).toBe(40.7589);
    expect(normalized?.coordinates.lng).toBe(-73.9851);
  });

  it('should classify smash-and-grab incidents and reject unlocatable entries', () => {
    const rawSfRecord = {
      row_id: 'sf-9988',
      incident_datetime: '2026-08-10T19:00:00.000',
      incident_description: 'BURGLARY FROM VEHICLE (SMASH AND GRAB)',
      latitude: '37.7749',
      longitude: '-122.4194',
    };

    const normalized = MultiCityCrimeIngestion.normalizeRecord('san_francisco', rawSfRecord);
    expect(normalized?.category).toBe('smash_and_grab');
    expect(normalized?.severityWeight).toBe(1.0);

    // Test rejection of invalid lat/lng
    const invalidRecord = { ...rawSfRecord, latitude: 'invalid' };
    expect(MultiCityCrimeIngestion.normalizeRecord('san_francisco', invalidRecord)).toBeNull();
  });

  it('should generate balanced municipal batches for automated simulations', () => {
    const batch = MultiCityCrimeIngestion.generateCityIngestionBatch('austin', 30);
    expect(batch.length).toBe(30);
    expect(batch.every((i) => i.coordinates.lat >= 30.12 && i.coordinates.lat <= 30.49)).toBe(true);
  });
});
