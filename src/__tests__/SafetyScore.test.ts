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

  describe('A. Break-In Risk Score (0-100)', () => {
    it('assigns base break-in score 100 when zero incidents nearby', () => {
      const facility: ParkingFacility = {
        id: 'fac-1',
        name: 'Pristine Garage',
        lat: 37.7749,
        lon: -122.4194,
        type: 'underground',
        capacity: '200',
      };

      const result = calculateSafetyScore(facility, []);
      expect(result.breakInScore).toBe(100);
      expect(result.breakInLabel).toBe('Low Break-in Risk');
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

      const incidents: CrimeIncident[] = [
        { datetime: '2026-09-01', category: 'Larceny Theft', lat: 37.7749 + 0.001, lon: -122.4194 }, // ~111m -> -4
        { datetime: '2026-09-02', category: 'Burglary', lat: 37.7749 + 0.0015, lon: -122.4194 },     // ~166m -> -4
        { datetime: '2026-09-03', category: 'Motor Vehicle Theft', lat: 37.7749 + 0.0035, lon: -122.4194 }, // ~388m -> -2
        { datetime: '2026-09-04', category: 'Larceny Theft', lat: 37.7749 + 0.01, lon: -122.4194 },   // ~1110m -> ignored
      ];

      const result = calculateSafetyScore(facility, incidents);
      // Base: 100 - (2 * 4) - (1 * 2) = 100 - 8 - 2 = 90
      expect(result.breakInScore).toBe(90);
      expect(result.breakInLabel).toBe('Low Break-in Risk');
      expect(result.incidentsWithin250m).toBe(2);
      expect(result.incidents250to500m).toBe(1);
      expect(result.incidentCount500m).toBe(3);
    });

    it('classifies break-in score 60-79 as Moderate Risk', () => {
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
      expect(result.breakInScore).toBe(72);
      expect(result.breakInLabel).toBe('Moderate Risk');
    });

    it('classifies break-in score under 60 as High Break-In Frequency and enforces minimum floor 10', () => {
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
      expect(result.breakInScore).toBe(10); // Floor 10
      expect(result.breakInLabel).toBe('High Break-in Frequency');
      expect(result.incidentCount500m).toBe(30);
    });
  });

  describe('B. Facility Security Score (0-100)', () => {
    it('awards +30 for underground, +15 for monitored/gated, and +5 for capacity telemetry', () => {
      const undergroundFacility: ParkingFacility = {
        id: 'ug-1',
        name: 'Secure Subterranean',
        lat: 37.7749,
        lon: -122.4194,
        type: 'underground',
        capacity: 500,
        fee: 'yes',
      };

      const result = calculateSafetyScore(undergroundFacility, []);
      // Base: 50 + 30 (underground) + 15 (gated/paid) + 5 (capacity) = 100 clamped to 98
      expect(result.facilitySecurityScore).toBe(98);
      expect(result.facilitySecurityLabel).toBe('Gated Underground Garage');
    });

    it('deducts 10 points for open surface lots with unrestricted access', () => {
      const surfaceFacility: ParkingFacility = {
        id: 'surf-1',
        name: 'Open Street Lot',
        lat: 37.7749,
        lon: -122.4194,
        type: 'surface',
      };

      const result = calculateSafetyScore(surfaceFacility, []);
      // Base: 50 + 0 (surface) - 10 (unrestricted open surface) = 40
      expect(result.facilitySecurityScore).toBe(40);
      expect(result.facilitySecurityLabel).toBe('Open Unrestricted Surface');
    });
  });

  describe('C. Lighting & Visibility Score (0-100)', () => {
    it('underground structures retain 85 lighting score after dusk', () => {
      const nightDate = new Date('2026-10-16T22:00:00'); // 10 PM
      const facility: ParkingFacility = {
        id: 'ug-2',
        name: 'Night Garage',
        lat: 37.7749,
        lon: -122.4194,
        type: 'underground',
      };

      const result = calculateSafetyScore(facility, [], nightDate);
      expect(result.lightingScore).toBe(85);
      expect(result.lightingLabel).toBe('24/7 Enclosed Lighting');
    });

    it('open surface lots drop to 55 or 40 after dusk', () => {
      const nightDate = new Date('2026-10-16T22:00:00'); // 10 PM
      const surfaceFacility: ParkingFacility = {
        id: 'surf-2',
        name: 'Dark Lot',
        lat: 37.7749,
        lon: -122.4194,
        type: 'surface',
      };

      const result = calculateSafetyScore(surfaceFacility, [], nightDate);
      expect(result.lightingScore).toBe(40);
      expect(result.lightingLabel).toBe('Low Night Visibility');
    });
  });

  describe('D. Master Composite Safety Index (CSI 0-100)', () => {
    it('calculates weighted composite: 50% break-in + 35% facility security + 15% lighting', () => {
      const dayDate = new Date('2026-10-16T12:00:00'); // Noon
      const facility: ParkingFacility = {
        id: 'fac-master',
        name: 'Union Square Garage',
        lat: 37.788,
        lon: -122.4075,
        type: 'underground',
        capacity: 985,
        fee: 'yes',
      };

      // 0 crimes -> breakIn = 100
      // underground + fee + capacity -> facilitySecurity = 98
      // underground daytime -> lighting = 85
      // Weighted = (100 * 0.50) + (98 * 0.35) + (85 * 0.15) = 50 + 34.3 + 12.75 = 97.05 -> 97
      const result = calculateSafetyScore(facility, [], dayDate);
      expect(result.score).toBe(97);
      expect(result.color).toBe('green');
      expect(result.riskLevel).toBe('Low Incident Zone');
    });

    it('scores an array of facilities simultaneously with scoreAllFacilities', () => {
      const facilities: ParkingFacility[] = [
        { id: 1, name: 'Safe Spot', lat: 37.77, lon: -122.42, type: 'underground', capacity: 200, fee: 'yes' },
        { id: 2, name: 'Active Spot', lat: 37.78, lon: -122.41, type: 'surface' },
      ];
      const incidents: CrimeIncident[] = [
        { datetime: '2026-09-10', category: 'Burglary', lat: 37.7801, lon: -122.4101 },
      ];

      const results = scoreAllFacilities(facilities, incidents);
      expect(results).toHaveLength(2);
      expect(results[0].breakInScore).toBe(100);
      expect(results[1].breakInScore).toBe(96);
    });
  });
});
