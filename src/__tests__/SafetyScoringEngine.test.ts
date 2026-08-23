import { describe, it, expect } from 'vitest';
import { SafetyScoringEngine } from '../domain/services/SafetyScoringEngine';
import { getSfNeighborhoodProfile } from '../domain/data/sfNeighborhoodSafetyData';

describe('SafetyScoringEngine & SF Neighborhood Geospatial Profiling', () => {
  it('correctly maps real San Francisco coordinates to their neighborhood profiles', () => {
    const marinaProfile = getSfNeighborhoodProfile({ lat: 37.8020, lng: -122.4380 });
    expect(marinaProfile.id).toBe('marina_presidio');
    expect(marinaProfile.baseCsiMin).toBeGreaterThanOrEqual(90);

    const pacHeightsProfile = getSfNeighborhoodProfile({ lat: 37.7925, lng: -122.4350 });
    expect(pacHeightsProfile.id).toBe('pacific_heights');
    expect(pacHeightsProfile.baseCsiMin).toBeGreaterThanOrEqual(90);

    const tenderloinProfile = getSfNeighborhoodProfile({ lat: 37.7845, lng: -122.4140 });
    expect(tenderloinProfile.id).toBe('tenderloin');
    expect(tenderloinProfile.baseCsiMax).toBeLessThanOrEqual(55);

    const somaProfile = getSfNeighborhoodProfile({ lat: 37.7780, lng: -122.4030 });
    expect(somaProfile.id).toBe('soma');

    const fidiProfile = getSfNeighborhoodProfile({ lat: 37.7920, lng: -122.3995 });
    expect(fidiProfile.id).toBe('financial_district');
  });

  it('produces deterministic, persistent hash values for coordinates', () => {
    const coords = { lat: 37.7842, lng: -122.4015 };
    const hash1 = SafetyScoringEngine.hashCoordinates(coords.lat, coords.lng, 'test_salt');
    const hash2 = SafetyScoringEngine.hashCoordinates(coords.lat, coords.lng, 'test_salt');

    expect(hash1).toBe(hash2);
    expect(hash1).toBeGreaterThanOrEqual(0);
    expect(hash1).toBeLessThan(1);
  });

  it('demonstrates visible safety disparity between Marina and Tenderloin curbside parking', () => {
    const marinaCsi = SafetyScoringEngine.computeGeospatialCsi({
      spotId: 'marina-curb',
      coordinates: { lat: 37.8020, lng: -122.4380 },
      structureType: 'curbside_street_metered',
      isDaytime: false,
    });

    const tenderloinCsi = SafetyScoringEngine.computeGeospatialCsi({
      spotId: 'tenderloin-curb',
      coordinates: { lat: 37.7845, lng: -122.4140 },
      structureType: 'curbside_street_metered',
      isDaytime: false,
    });

    // Marina CSI should be substantially higher than Tenderloin CSI
    expect(marinaCsi.totalScore).toBeGreaterThan(85);
    expect(tenderloinCsi.totalScore).toBeLessThan(65);
    expect(marinaCsi.totalScore - tenderloinCsi.totalScore).toBeGreaterThanOrEqual(25);
  });

  it('boosts CSI for secure underground garages compared to surface lots', () => {
    const coords = { lat: 37.7780, lng: -122.4030 }; // SoMa

    const garageCsi = SafetyScoringEngine.computeGeospatialCsi({
      spotId: 'soma-garage',
      coordinates: coords,
      structureType: 'covered_underground_garage',
      isDaytime: false,
    });

    const surfaceLotCsi = SafetyScoringEngine.computeGeospatialCsi({
      spotId: 'soma-lot',
      coordinates: coords,
      structureType: 'open_surface_lot',
      isDaytime: false,
    });

    expect(garageCsi.totalScore).toBeGreaterThan(surfaceLotCsi.totalScore);
    expect(garageCsi.totalScore - surfaceLotCsi.totalScore).toBeGreaterThanOrEqual(20);
  });

  it('clamps CSI strictly within [20, 99]', () => {
    const worstCaseCsi = SafetyScoringEngine.computeGeospatialCsi({
      spotId: 'worst-case',
      coordinates: { lat: 37.7845, lng: -122.4140 }, // Tenderloin
      structureType: 'open_surface_lot',
      isDaytime: false,
      luxLevel: 10,
    });

    expect(worstCaseCsi.totalScore).toBeGreaterThanOrEqual(20);
    expect(worstCaseCsi.totalScore).toBeLessThanOrEqual(99);

    const bestCaseCsi = SafetyScoringEngine.computeGeospatialCsi({
      spotId: 'best-case',
      coordinates: { lat: 37.8020, lng: -122.4380 }, // Marina
      structureType: 'covered_underground_garage',
      isDaytime: true,
      luxLevel: 95,
    });

    expect(bestCaseCsi.totalScore).toBeLessThanOrEqual(99);
    expect(bestCaseCsi.totalScore).toBeGreaterThanOrEqual(20);
  });
});
