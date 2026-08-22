import { ParkingLocation } from '../models/ParkingLocation';
import { CompositeSafetyIndex } from '../models/SafetyScore';

export interface ISafetyRepository {
  calculateScoreForLocation(spotId: string): Promise<CompositeSafetyIndex>;
  getLocationsWithScores(filter?: { minCsi?: number; maxRate?: number; isNight?: boolean }): Promise<ParkingLocation[]>;
  getLocationById(spotId: string): Promise<ParkingLocation | null>;
}
