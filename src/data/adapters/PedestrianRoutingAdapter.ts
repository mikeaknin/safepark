export interface PedestrianRouteResult {
  coordinates: Array<[number, number]>; // Array of [lat, lng] tuples
  distanceMeters: number;
  durationMinutes: number;
  isOsrmSnapped: boolean;
}

export class PedestrianRoutingAdapter {
  private static cache = new Map<string, PedestrianRouteResult>();

  /**
   * Fetch street-snapped walking directions using OSRM Foot Engine with network fallback
   */
  public static async getPedestrianRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<PedestrianRouteResult> {
    const cacheKey = `${origin.lat.toFixed(5)},${origin.lng.toFixed(5)}->${destination.lat.toFixed(5)},${destination.lng.toFixed(5)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const url = `https://router.project-osrm.org/route/v1/foot/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // OSRM GeoJSON geometry format is [lng, lat] -> convert to Leaflet [lat, lng]
          const coordinates: Array<[number, number]> = route.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );

          const distanceMeters = Math.round(route.distance || 0);
          const durationMinutes = Math.max(1, Math.round((route.duration || 0) / 60));

          const result: PedestrianRouteResult = {
            coordinates,
            distanceMeters,
            durationMinutes,
            isOsrmSnapped: true,
          };

          this.cache.set(cacheKey, result);
          return result;
        }
      }
    } catch (err) {
      // Network timeout or offline - use graceful fallback
      clearTimeout(timeoutId);
    }

    // Fallback: Realistic SF Grid-Corner Step interpolation
    const fallback = this.generateFallbackGridRoute(origin, destination);
    this.cache.set(cacheKey, fallback);
    return fallback;
  }

  private static generateFallbackGridRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): PedestrianRouteResult {
    const latDiff = destination.lat - origin.lat;
    const cornerWaypoint: [number, number] = [origin.lat + latDiff * 0.65, origin.lng];

    const coordinates: Array<[number, number]> = [
      [origin.lat, origin.lng],
      cornerWaypoint,
      [destination.lat, destination.lng],
    ];

    // Estimate walking distance in meters (approx 111,000m per lat degree)
    const dLat = (destination.lat - origin.lat) * 111000;
    const dLng = (destination.lng - origin.lng) * 85000;
    const distanceMeters = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 1.2); // 1.2x grid factor
    const durationMinutes = Math.max(1, Math.round(distanceMeters / 80)); // ~80m per min walk

    return {
      coordinates,
      distanceMeters,
      durationMinutes,
      isOsrmSnapped: false,
    };
  }
}
