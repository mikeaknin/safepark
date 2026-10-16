import { describe, it, expect } from 'vitest';
import {
  calculateSafetyScore,
  haversineDistanceMeters,
  scoreAllFacilities,
  ParkingFacility,
  CrimeIncident,
} from '../lib/safetyScore';

describe('Real Safety Index Calculation Engine (lib/safetyScore.ts)', () => {
  it('correctly calculates haversine distance between two known coordinates', () => {
    // Distance between SF Ferry Building (37.7955, -122.3937) and Moscone Center (37.7842, -122.4015)
    // Approximately 1430 meters
    const dist = haversineDistanceMeters(37.7955, -122.3937, 37.7842, -122.4015);
    expect(dist).toBeGreaterThan(1300);
    expect(dist).toBeLessThan(1600);

    // Distance to same point is 0
    expect(haversineDistanceMeters(37.7749, -122.4194, 37.7749, -122.4194)).toBe(0);
  });

  it('assigns base score 100 and Green status when zero incidents nearby', () => {
    const facility: ParkingFacility = {
      id: 'fac-1',
      name: 'Pristine Garage',
      lat: 37.7749,
      lon: -122.4194,
      type: 'underground',
      capacity: '200',
    };

    const result = calculateSafetyScore(facility, []);
    expect(result.score).toBe(100);
    expect(result.color).toBe('green');
    expect(result.riskLevel).toBe('Low Incident Zone');
    expect(result.incidentCount500m).toBe(0);
    expect(result.displayText).toBe('0 vehicle incidents within 500m in past 90 days');
  });

  it('deducts 4 points for incidents within 250m and 2 points between 250m and 500m', () => {
    const facility: ParkingFacility = {
      id: 'fac-2',
      name: 'Downtown Lot',
      lat: 37.7749,
      lon: -122.4194,
    };

    // 0.001 deg lat is ~111 meters (within 250m)
    // 0.0035 deg lat is ~388 meters (between 250m and 500m)
    // 0.01 deg lat is ~1110 meters (outside 500m)
    const incidents: CrimeIncident[] = [
      { datetime: '2026-09-01', category: 'Larceny Theft', lat: 37.7749 + 0.001, lon: -122.4194 }, // ~111m -> -4
      { datetime: '2026-09-02', category: 'Burglary', lat: 37.7749 + 0.0015, lon: -122.4194 },     // ~166m -> -4
      { datetime: '2026-09-03', category: 'Motor Vehicle Theft', lat: 37.7749 + 0.0035, lon: -122.4194 }, // ~388m -> -2
      { datetime: '2026-09-04', category: 'Larceny Theft', lat: 37.7749 + 0.01, lon: -122.4194 },   // ~1110m -> ignored
    ];

    const result = calculateSafetyScore(facility, incidents);
    // Base: 100 - (2 * 4) - (1 * 2) = 100 - 8 - 2 = 90
    expect(result.score).toBe(90);
    expect(result.color).toBe('green');
    expect(result.incidentsWithin250m).toBe(2);
    expect(result.incidents250to500m).toBe(1);
    expect(result.incidentCount500m).toBe(3);
    expect(result.displayText).toBe('3 vehicle incidents within 500m in past 90 days');
  });

  it('classifies score 60-79 as yellow (Moderate Risk)', () => {
    const facility: ParkingFacility = {
      id: 'fac-3',
      name: 'Mid-Market Garage',
      lat: 37.7749,
      lon: -122.4194,
    };

    // 7 incidents within 250m -> 7 * 4 = 28 points deducted -> score = 72
    const incidents: CrimeIncident[] = Array.from({ length: 7 }, (_, i) => ({
      datetime: '2026-09-10',
      category: 'Burglary',
      lat: 37.7749 + 0.0005 + i * 0.0001,
      lon: -122.4194,
    }));

    const result = calculateSafetyScore(facility, incidents);
    expect(result.score).toBe(72);
    expect(result.color).toBe('yellow');
    expect(result.riskLevel).toBe('Moderate Risk');
  });

  it('classifies score under 60 as red (High Break-In Frequency) and enforces minimum score floor 10', () => {
    const facility: ParkingFacility = {
      id: 'fac-4',
      name: 'High Risk Curbside',
      lat: 37.7749,
      lon: -122.4194,
    };

    // 30 incidents within 250m -> 30 * 4 = 120 points deducted -> raw = -20 -> clamped to 10
    const incidents: CrimeIncident[] = Array.from({ length: 30 }, (_, i) => ({
      datetime: '2026-09-10',
      category: 'Burglary',
      lat: 37.7749 + 0.0002 + (i % 5) * 0.0001,
      lon: -122.4194,
    }));

    const result = calculateSafetyScore(facility, incidents);
    expect(result.score).toBe(10); // Floor 10
    expect(result.color).toBe('red');
    expect(result.riskLevel).toBe('High Break-In Frequency');
    expect(result.incidentCount500m).toBe(30);
  });

  it('scores an array of facilities simultaneously with scoreAllFacilities', () => {
    const facilities: ParkingFacility[] = [
      { id: 1, name: 'Safe Spot', lat: 37.77, lon: -122.42 },
      { id: 2, name: 'Active Spot', lat: 37.78, lon: -122.41 },
    ];
    const incidents: CrimeIncident[] = [
      { datetime: '2026-09-10', category: 'Burglary', lat: 37.7801, lon: -122.4101 },
    ];

    const results = scoreAllFacilities(facilities, incidents);
    expect(results).toHaveLength(2);
    expect(results[0].score).toBe(100);
    expect(results[1].score).toBe(96);
  });
});
