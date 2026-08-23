import { describe, it, expect } from 'vitest';
import { SafetyScoringEngine } from '../domain/services/SafetyScoringEngine';
import { getSfNeighborhoodProfile } from '../domain/data/sfNeighborhoodSafetyData';
import { DataSFPoliceReportSummary } from '../infrastructure/api/DataSFPoliceService';
import { SF311MunicipalSummary } from '../infrastructure/api/SF311Service';

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

    expect(marinaCsi.totalScore).toBeGreaterThan(85);
    expect(tenderloinCsi.totalScore).toBeLessThan(65);
    expect(marinaCsi.totalScore - tenderloinCsi.totalScore).toBeGreaterThanOrEqual(25);
  });

  it('deducts -3 points per live vehicle larceny and -10 points for active 311 streetlight outages', () => {
    const coords = { lat: 37.7842, lng: -122.4015 }; // Moscone SoMa

    const cleanPolice: DataSFPoliceReportSummary = {
      incidentsLast30Days: 0,
      incidentsLast90Days: 0,
      vehicleLarcenyCount30Days: 0,
      vehicleLarcenyCount90Days: 0,
      smashAndGrabCount: 0,
      recentIncidentTimestamps: [],
      isHotspotCluster: false,
      incidents: [],
      isLive: true,
    };

    const highLarcenyPolice: DataSFPoliceReportSummary = {
      incidentsLast30Days: 4,
      incidentsLast90Days: 9,
      vehicleLarcenyCount30Days: 4, // 4 vehicle larcenies -> -12 pts
      vehicleLarcenyCount90Days: 9,
      smashAndGrabCount: 3,
      recentIncidentTimestamps: [new Date().toISOString()],
      isHotspotCluster: true,
      incidents: [],
      isLive: true,
    };

    const clean311: SF311MunicipalSummary = {
      hasStreetlightOutage: false,
      openStreetlightOutagesCount: 0,
      openSidewalkHazardsCount: 0,
      cases: [],
      isLive: true,
    };

    const outage311: SF311MunicipalSummary = {
      hasStreetlightOutage: true, // -10 pts
      openStreetlightOutagesCount: 1,
      openSidewalkHazardsCount: 0,
      cases: [],
      isLive: true,
    };

    const baselineCsi = SafetyScoringEngine.computeGeospatialCsi({
      spotId: 'base-test',
      coordinates: coords,
      structureType: 'curbside_street_metered',
      isDaytime: false,
      policeSummary: cleanPolice,
      municipalSummary: clean311,
    });

    const larcenyCsi = SafetyScoringEngine.computeGeospatialCsi({
      spotId: 'larceny-test',
      coordinates: coords,
      structureType: 'curbside_street_metered',
      isDaytime: false,
      policeSummary: highLarcenyPolice,
      municipalSummary: clean311,
    });

    const outageCsi = SafetyScoringEngine.computeGeospatialCsi({
      spotId: 'outage-test',
      coordinates: coords,
      structureType: 'curbside_street_metered',
      isDaytime: false,
      policeSummary: cleanPolice,
      municipalSummary: outage311,
    });

    expect(larcenyCsi.totalScore).toBeLessThan(baselineCsi.totalScore);
    expect(baselineCsi.totalScore - larcenyCsi.totalScore).toBeGreaterThanOrEqual(10);

    expect(outageCsi.totalScore).toBeLessThan(baselineCsi.totalScore);
    expect(baselineCsi.totalScore - outageCsi.totalScore).toBe(10);
  });

  it('awards +15 points for verified zero-incident secured garages', () => {
    const coords = { lat: 37.7920, lng: -122.3995 }; // Financial District

    const cleanPolice: DataSFPoliceReportSummary = {
      incidentsLast30Days: 0,
      incidentsLast90Days: 0,
      vehicleLarcenyCount30Days: 0,
      vehicleLarcenyCount90Days: 0,
      smashAndGrabCount: 0,
      recentIncidentTimestamps: [],
      isHotspotCluster: false,
      incidents: [],
      isLive: true,
    };

    const garageCsi = SafetyScoringEngine.computeGeospatialCsi({
      spotId: 'fidi-garage',
      coordinates: coords,
      structureType: 'covered_underground_garage',
      isDaytime: false,
      policeSummary: cleanPolice,
    });

    expect(garageCsi.totalScore).toBeGreaterThanOrEqual(90);
    expect(garageCsi.recommendations.some(r => r.includes('Maximum vehicle break-in defense'))).toBe(true);
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
