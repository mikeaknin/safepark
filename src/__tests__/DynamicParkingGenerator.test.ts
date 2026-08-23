import { describe, it, expect } from 'vitest';
import { DynamicParkingGenerator } from '../domain/services/DynamicParkingGenerator';

describe('DynamicParkingGenerator Pan-to-Scan Curbside Engine', () => {
  it('should generate authentic parking spots with Free, Metered, and Garages for North Beach', () => {
    const northBeachCoords = { lat: 37.7984, lng: -122.4084 };
    const spots = DynamicParkingGenerator.generateSpotsAroundCoordinates(
      northBeachCoords,
      'North Beach',
      false
    );

    expect(spots.length).toBeGreaterThanOrEqual(6);

    const meteredSpot = spots.find((s) => s.infrastructure.structureType === 'curbside_street_metered');
    const freeSpot = spots.find((s) => s.hourlyRate === 0);
    const garageSpot = spots.find((s) => s.infrastructure.structureType === 'covered_underground_garage');

    expect(meteredSpot).toBeDefined();
    expect(meteredSpot?.name).toContain('Curbside');
    expect(meteredSpot?.hourlyRate).toBeGreaterThan(0);

    expect(freeSpot).toBeDefined();
    expect(freeSpot?.hourlyRate).toBe(0);

    expect(garageSpot).toBeDefined();
    expect(garageSpot?.csi.totalScore).toBeGreaterThanOrEqual(70);
  });

  it('should resolve district and curbside spots for Marina and Mission coordinates', () => {
    const marinaCoords = { lat: 37.8015, lng: -122.4350 };
    const marinaSpots = DynamicParkingGenerator.generateSpotsAroundCoordinates(marinaCoords);

    expect(marinaSpots.some((s) => s.name.includes('Chestnut') || s.name.includes('Marina') || s.name.includes('Lombard'))).toBe(true);

    const missionCoords = { lat: 37.7600, lng: -122.4200 };
    const missionSpots = DynamicParkingGenerator.generateSpotsAroundCoordinates(missionCoords);

    expect(missionSpots.some((s) => s.name.includes('Valencia') || s.name.includes('Mission'))).toBe(true);
  });

  it('should enforce realistic pricing ranges across downtown and residential zones', () => {
    const fidiCoords = { lat: 37.7920, lng: -122.3995 };
    const fidiSpots = DynamicParkingGenerator.generateSpotsAroundCoordinates(fidiCoords);

    const fidiGarage = fidiSpots.find((s) => s.infrastructure.structureType === 'covered_underground_garage');
    const fidiMeter = fidiSpots.find((s) => s.infrastructure.structureType === 'curbside_street_metered');
    const fidiFree = fidiSpots.find((s) => s.infrastructure.structureType === 'curbside_residential');

    expect(fidiGarage).toBeDefined();
    expect(fidiGarage!.hourlyRate).toBeGreaterThanOrEqual(5.00);
    expect(fidiGarage!.hourlyRate).toBeLessThanOrEqual(9.50);

    expect(fidiMeter).toBeDefined();
    expect(fidiMeter!.hourlyRate).toBeGreaterThanOrEqual(2.50);
    expect(fidiMeter!.hourlyRate).toBeLessThanOrEqual(4.50);

    expect(fidiFree).toBeDefined();
    expect(fidiFree!.hourlyRate).toBe(0.00);
  });

  it('should reflect neighborhood safety disparity between Marina and Tenderloin spots', () => {
    const marinaCoords = { lat: 37.8020, lng: -122.4380 };
    const tenderloinCoords = { lat: 37.7845, lng: -122.4140 };

    const marinaSpots = DynamicParkingGenerator.generateSpotsAroundCoordinates(marinaCoords);
    const tenderloinSpots = DynamicParkingGenerator.generateSpotsAroundCoordinates(tenderloinCoords);

    const avgMarinaCsi = marinaSpots.reduce((acc, s) => acc + s.csi.totalScore, 0) / marinaSpots.length;
    const avgTenderloinCsi = tenderloinSpots.reduce((acc, s) => acc + s.csi.totalScore, 0) / tenderloinSpots.length;

    expect(avgMarinaCsi).toBeGreaterThan(avgTenderloinCsi);
    expect(avgMarinaCsi - avgTenderloinCsi).toBeGreaterThanOrEqual(20);
  });
});
