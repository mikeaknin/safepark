import { describe, it, expect } from 'vitest';
import sfParkingBackup from '../data/sf_parking_backup.json';
import laParkingBackup from '../data/la_parking_backup.json';
import { ParkingService } from '../services/parkingService';

describe('Parking Facility Data Quality & Recognition', () => {
  it('should include all required prominent SF municipal garages with recognizable names and addresses', () => {
    const requiredSfGarages = [
      'Sutter Stockton Garage',
      'Union Square Garage',
      '5th & Mission / Yerba Buena Garage',
      'Portsmouth Square Garage',
      "St. Mary's Square Garage",
      'Civic Center Garage',
      'Moscone Center Garage',
      'Japan Center Garage',
      "Ellis O'Farrell Garage",
      'Vallejo Street Garage',
      'Golden Gateway Garage',
      'Performing Arts Garage',
      'Mission Bartlett Garage',
      'Lombard Street Garage',
      'North Beach Garage',
    ];

    const sfNames = sfParkingBackup.map((g: any) => g.name);
    for (const name of requiredSfGarages) {
      expect(sfNames).toContain(name);
      const garage = sfParkingBackup.find((g: any) => g.name === name);
      expect(garage).toBeDefined();
      expect(garage!.address).toBeDefined();
      expect(garage!.address.length).toBeGreaterThan(5);
      expect(garage!.lat).toBeGreaterThan(37.7);
      expect(garage!.lon).toBeLessThan(-122.3);
      expect(parseInt(garage!.capacity, 10)).toBeGreaterThan(0);
    }
  });

  it('should include all required prominent LA municipal garages with recognizable names and addresses', () => {
    const requiredLaGarages = [
      'Pershing Square Garage',
      'Music Center Garage',
      'Walt Disney Concert Hall Garage',
      'Hollywood & Highland Garage',
      'Vine Street Garage',
      'Grand Central Market Parking',
      'World Trade Center Garage',
      'Santa Monica Public Structure 1',
      'Santa Monica Public Structure 2',
      'Santa Monica Public Structure 4',
      'Santa Monica Public Structure 5',
      'Santa Monica Civic Center Structure',
      'Venice Beach Lot - Rose Ave',
      'Venice Beach Lot - Venice Blvd',
      'Venice Beach Lot - Washington Blvd',
    ];

    const laNames = laParkingBackup.map((g: any) => g.name);
    for (const name of requiredLaGarages) {
      expect(laNames).toContain(name);
      const garage = laParkingBackup.find((g: any) => g.name === name);
      expect(garage).toBeDefined();
      expect(garage!.address).toBeDefined();
      expect(garage!.address.length).toBeGreaterThan(5);
      expect(garage!.lat).toBeGreaterThan(33.9);
      expect(garage!.lon).toBeLessThan(-118.2);
      expect(parseInt(garage!.capacity, 10)).toBeGreaterThan(0);
    }
  });

  it('should never contain generic placeholder names like "Garage" or "Public Parking Facility"', () => {
    const allFacilities = [...sfParkingBackup, ...laParkingBackup];
    allFacilities.forEach((facility: any) => {
      expect(facility.name.trim()).not.toBe('Garage');
      expect(facility.name.trim()).not.toBe('Public Parking Facility');
      expect(facility.name.length).toBeGreaterThan(3);
      expect(facility.address).toBeDefined();
    });
  });

  it('ParkingService.getBundledBackup should return normalized facilities with rich fields', () => {
    const sf = ParkingService.getBundledBackup('sf');
    const la = ParkingService.getBundledBackup('la');

    expect(sf.length).toBeGreaterThanOrEqual(15);
    expect(la.length).toBeGreaterThanOrEqual(15);

    expect(sf[0].address).toBeDefined();
    expect(la[0].address).toBeDefined();
  });
});
