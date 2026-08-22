import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PedestrianRoutingAdapter } from '../data/adapters/PedestrianRoutingAdapter';

describe('PedestrianRoutingAdapter (OSRM Foot Engine)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate fallback grid route when network is offline or fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    const origin = { lat: 37.7984, lng: -122.4084 };
    const destination = { lat: 37.7995, lng: -122.4072 };

    const route = await PedestrianRoutingAdapter.getPedestrianRoute(origin, destination);

    expect(route.coordinates).toBeDefined();
    expect(route.coordinates.length).toBeGreaterThanOrEqual(3);
    expect(route.coordinates[0]).toEqual([origin.lat, origin.lng]);
    expect(route.coordinates[route.coordinates.length - 1]).toEqual([destination.lat, destination.lng]);
    expect(route.distanceMeters).toBeGreaterThan(0);
    expect(route.durationMinutes).toBeGreaterThan(0);
    expect(route.isOsrmSnapped).toBe(false);
  });

  it('should parse real OSRM GeoJSON response and convert [lng, lat] to [lat, lng]', async () => {
    const mockOsrmResponse = {
      code: 'Ok',
      routes: [
        {
          distance: 350.5,
          duration: 240.2,
          geometry: {
            coordinates: [
              [-122.4084, 37.7984],
              [-122.4080, 37.7988],
              [-122.4072, 37.7995],
            ],
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockOsrmResponse,
    } as any);

    const origin = { lat: 37.7812, lng: -122.4050 };
    const destination = { lat: 37.7830, lng: -122.4020 };

    const route = await PedestrianRoutingAdapter.getPedestrianRoute(origin, destination);

    expect(route.isOsrmSnapped).toBe(true);
    expect(route.distanceMeters).toBe(351);
    expect(route.durationMinutes).toBe(4);
    expect(route.coordinates[0]).toEqual([37.7984, -122.4084]);
    expect(route.coordinates[2]).toEqual([37.7995, -122.4072]);
  });
});
