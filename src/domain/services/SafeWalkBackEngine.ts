import { SafeWalkRoute, WalkingPathSegment } from '../models/ParkingLocation';

export class SafeWalkBackEngine {
  /**
   * Generates dual pedestrian routing alternatives:
   * 1. SafePark Illuminated Corridor (Well-lit, high foot traffic, CCTV monitored avenue)
   * 2. Direct Short Path (Faster by ~1 min, but passes through unlit alley / low foot traffic)
   */
  public static calculateWalkingRoutes(
    spotId: string,
    spotName: string,
    destinationName: string = 'Destination'
  ): { illuminatedRoute: SafeWalkRoute; directRoute: SafeWalkRoute } {
    const illuminatedSegments: WalkingPathSegment[] = [
      {
        stepIndex: 1,
        instruction: 'Head North along Main Boulevard (Smart LED Municipal Corridor)',
        distanceMeters: 140,
        luxLevel: 48,
        isIlluminated: true,
        footTrafficScore: 88,
        coordinates: [37.7842, -122.4060],
      },
      {
        stepIndex: 2,
        instruction: 'Cross at signalized crosswalk on 4th & Market (Continuous CCTV Coverage)',
        distanceMeters: 60,
        luxLevel: 52,
        isIlluminated: true,
        footTrafficScore: 92,
        coordinates: [37.7850, -122.4055],
      },
      {
        stepIndex: 3,
        instruction: 'Turn right along Transit Plaza entrance with active ground-floor storefronts',
        distanceMeters: 110,
        luxLevel: 45,
        isIlluminated: true,
        footTrafficScore: 84,
        coordinates: [37.7855, -122.4048],
      }
    ];

    const directSegments: WalkingPathSegment[] = [
      {
        stepIndex: 1,
        instruction: 'Walk East into rear access service alleyway',
        distanceMeters: 120,
        luxLevel: 6,
        isIlluminated: false,
        footTrafficScore: 15,
        coordinates: [37.7841, -122.4050],
      },
      {
        stepIndex: 2,
        instruction: 'Exit alley onto side lane toward destination',
        distanceMeters: 110,
        luxLevel: 12,
        isIlluminated: false,
        footTrafficScore: 22,
        coordinates: [37.7848, -122.4045],
      }
    ];

    const illuminatedRoute: SafeWalkRoute = {
      id: `route-lit-${spotId}`,
      fromSpotId: spotId,
      destinationName,
      totalDistanceMeters: 310,
      estimatedWalkingMinutes: 4.2,
      averageIlluminationLux: 48,
      safetyScore: 92,
      pathSegments: illuminatedSegments,
      isRecommendedLitPath: true,
    };

    const directRoute: SafeWalkRoute = {
      id: `route-direct-${spotId}`,
      fromSpotId: spotId,
      destinationName,
      totalDistanceMeters: 230,
      estimatedWalkingMinutes: 3.1,
      averageIlluminationLux: 9,
      safetyScore: 38,
      pathSegments: directSegments,
      isRecommendedLitPath: false,
    };

    return { illuminatedRoute, directRoute };
  }
}
