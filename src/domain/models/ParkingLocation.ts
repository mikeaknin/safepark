import { CompositeSafetyIndex } from './SafetyScore';
import { CrimeDataAggregate } from './CrimeIncident';
import { LightingEnvironment } from './LightingData';
import { PhysicalInfrastructure } from './Infrastructure';
import { HazardReport } from './HazardReport';

export interface WalkingPathSegment {
  stepIndex: number;
  instruction: string;
  distanceMeters: number;
  luxLevel: number;
  isIlluminated: boolean;
  footTrafficScore: number; // 0 - 100
  coordinates: [number, number];
}

export interface SafeWalkRoute {
  id: string;
  fromSpotId: string;
  destinationName: string;
  totalDistanceMeters: number;
  estimatedWalkingMinutes: number;
  averageIlluminationLux: number;
  safetyScore: number; // 0 - 100
  pathSegments: WalkingPathSegment[];
  isRecommendedLitPath: boolean;
}

export interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  hourlyRate: number;
  currency: string;
  totalSpaces: number;
  availableSpaces: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  crimeData: CrimeDataAggregate;
  lighting: LightingEnvironment;
  infrastructure: PhysicalInfrastructure;
  activeHazards: HazardReport[];
  csi: CompositeSafetyIndex;
  walkingRoutes?: SafeWalkRoute[];
}
