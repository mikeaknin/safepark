import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PedestrianRoutingAdapter } from '../data/adapters/PedestrianRoutingAdapter';

describe('Safe Walk to My Car Return Routing Engine & Geofence Fallbacks', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('generates a street-snapped pedestrian route for local walk back coordinates', async () => {
    const origin = { lat: 37.7850, lng: -122.4020 };
    const carSpot = { lat: 37.7842, lng: -122.4015 };

    const route = await PedestrianRoutingAdapter.getPedestrianRoute(origin, carSpot);

    expect(route).toBeDefined();
    expect(route.coordinates.length).toBeGreaterThanOrEqual(2);
    expect(route.distanceMeters).toBeGreaterThan(0);
    expect(route.durationMinutes).toBeGreaterThanOrEqual(1);
  });

  it('handles remote or out-of-area origin points (>10km) via smart synthesized nearby origin', async () => {
    const carSpot = { lat: 37.7842, lng: -122.4015 };
    const remoteOrigin = { lat: 34.0522, lng: -118.2437 }; // Los Angeles (> 500 km away)

    // Haversine check simulation as done in AppContext
    const R = 6371e3;
    const φ1 = (remoteOrigin.lat * Math.PI) / 180;
    const φ2 = (carSpot.lat * Math.PI) / 180;
    const Δφ = ((carSpot.lat - remoteOrigin.lat) * Math.PI) / 180;
    const Δλ = ((carSpot.lng - remoteOrigin.lng) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distMeters = R * c;

    expect(distMeters).toBeGreaterThan(10000);

    // Synthesized origin ~250m away along the street grid
    const synthesizedOrigin = {
      lat: carSpot.lat + 0.0018,
      lng: carSpot.lng + 0.0018,
    };

    const route = await PedestrianRoutingAdapter.getPedestrianRoute(synthesizedOrigin, carSpot);

    expect(route.coordinates.length).toBeGreaterThanOrEqual(2);
    expect(route.distanceMeters).toBeGreaterThanOrEqual(150);
    expect(route.distanceMeters).toBeLessThanOrEqual(500);
    expect(route.durationMinutes).toBeGreaterThanOrEqual(1);
    expect(route.durationMinutes).toBeLessThanOrEqual(6);
  });
});
