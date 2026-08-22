import { describe, it, expect } from 'vitest';
import { CsiEngine } from '../domain/services/CsiEngine';
import { CrimeDataAggregate } from '../domain/models/CrimeIncident';
import { LightingEnvironment } from '../domain/models/LightingData';
import { PhysicalInfrastructure } from '../domain/models/Infrastructure';
import { HazardReport } from '../domain/models/HazardReport';

describe('Composite Safety Index (CSI) Scoring Engine', () => {
  const baseCrime: CrimeDataAggregate = {
    incidentsLast30Days: 0,
    incidentsLast90Days: 0,
    smashAndGrabCount: 0,
    catalyticConverterCount: 0,
    incidentDensityPerSqKm: 0.5,
    recentIncidents: [],
  };

  const dayLighting: LightingEnvironment = {
    ambientLuxLevel: 1200,
    isDaytime: true,
    sunElevationAngleDegrees: 55,
    coverageIndexPercentage: 98,
    blindSpotDetected: false,
    municipalSmartLamps: [],
  };

  const nightLightingWellLit: LightingEnvironment = {
    ambientLuxLevel: 65,
    isDaytime: false,
    sunElevationAngleDegrees: -20,
    coverageIndexPercentage: 95,
    blindSpotDetected: false,
    municipalSmartLamps: [
      { id: 'lamp-1', lampType: 'smart_led', luxOutput: 60, status: 'active', distanceMeters: 5, poleHeightMeters: 5, motionActivated: true }
    ],
  };

  const nightLightingDarkAlley: LightingEnvironment = {
    ambientLuxLevel: 4,
    isDaytime: false,
    sunElevationAngleDegrees: -20,
    coverageIndexPercentage: 15,
    blindSpotDetected: true,
    municipalSmartLamps: [
      { id: 'lamp-2', lampType: 'decorative_low_lux', luxOutput: 5, status: 'reported_out', distanceMeters: 25, poleHeightMeters: 4, motionActivated: false }
    ],
  };

  const secureInfra: PhysicalInfrastructure = {
    structureType: 'covered_underground_garage',
    surveillance: 'monitored_cctv_24_7',
    hasControlledAccessBarrier: true,
    hasActiveAttendantOrPatrol: true,
    hasEmergencyCallBoxes: true,
    pedestrianTrafficRating: 'high',
    clearSightlines: true,
  };

  const curbsideInfra: PhysicalInfrastructure = {
    structureType: 'curbside_street_metered',
    surveillance: 'none',
    hasControlledAccessBarrier: false,
    hasActiveAttendantOrPatrol: false,
    hasEmergencyCallBoxes: false,
    pedestrianTrafficRating: 'isolated',
    clearSightlines: false,
  };

  it('calculates a score >= 75 (Low Risk) for secure underground garages with no crime', () => {
    const result = CsiEngine.calculate('test-spot-1', baseCrime, dayLighting, secureInfra, []);
    expect(result.totalScore).toBeGreaterThanOrEqual(75);
    expect(result.riskLevel).toBe('low');
  });

  it('penalizes score when switching to night mode in an unlit alley', () => {
    const dayResult = CsiEngine.calculate('test-spot-2', baseCrime, dayLighting, curbsideInfra, []);
    const nightResult = CsiEngine.calculate('test-spot-2', baseCrime, nightLightingDarkAlley, curbsideInfra, []);

    expect(nightResult.totalScore).toBeLessThan(dayResult.totalScore);
    expect(nightResult.components.lightingScore.rawScore).toBeLessThan(dayResult.components.lightingScore.rawScore);
  });

  it('heavily penalizes smash-and-grab property crime clusters', () => {
    const highCrime: CrimeDataAggregate = {
      incidentsLast30Days: 6,
      incidentsLast90Days: 18,
      smashAndGrabCount: 4,
      catalyticConverterCount: 2,
      incidentDensityPerSqKm: 12.0,
      recentIncidents: [
        {
          id: 'crm-1',
          category: 'smash_and_grab',
          timestamp: new Date().toISOString(),
          distanceMeters: 15,
          severityWeight: 1.0,
          verifiedByPoliceReport: true,
          coordinates: { lat: 37.78, lng: -122.40 },
          blockDescription: 'Window smashed, items extracted',
        }
      ],
    };

    const safeResult = CsiEngine.calculate('test-safe', baseCrime, dayLighting, secureInfra, []);
    const crimeResult = CsiEngine.calculate('test-crime', highCrime, dayLighting, secureInfra, []);

    expect(crimeResult.totalScore).toBeLessThan(safeResult.totalScore);
    expect(crimeResult.keyRiskFactors.some(f => f.includes('smash-and-grab'))).toBe(true);
  });

  it('applies exponential time-decay to verified physical hazard reports', () => {
    const freshHazard: HazardReport = {
      id: 'hz-fresh',
      spotId: 'spot-hz',
      hazardType: 'broken_glass_pavement',
      reportedAt: new Date().toISOString(), // 0 hours ago
      confirmedByWitnessCount: 4,
      photoEvidenceVerified: true,
      coordinates: { lat: 37.78, lng: -122.40 },
    };

    const oldHazard: HazardReport = {
      id: 'hz-old',
      spotId: 'spot-hz',
      hazardType: 'broken_glass_pavement',
      reportedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), // 72 hours ago
      confirmedByWitnessCount: 4,
      photoEvidenceVerified: true,
      coordinates: { lat: 37.78, lng: -122.40 },
    };

    const now = new Date().toISOString();
    const freshResult = CsiEngine.calculate('spot-hz', baseCrime, dayLighting, secureInfra, [freshHazard], now);
    const oldResult = CsiEngine.calculate('spot-hz', baseCrime, dayLighting, secureInfra, [oldHazard], now);

    // Old hazard should have decayed away, giving higher hazard score
    expect(oldResult.components.hazardScore.rawScore).toBeGreaterThan(freshResult.components.hazardScore.rawScore);
  });
});
