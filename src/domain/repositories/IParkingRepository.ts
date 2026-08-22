import { ParkingLocation } from '../models/ParkingLocation';

export interface IParkingRepository {
  getAllParkingLocations(): Promise<ParkingLocation[]>;
  getParkingLocationById(id: string): Promise<ParkingLocation | null>;
  searchParkingNear(lat: number, lng: number, radiusMeters: number): Promise<ParkingLocation[]>;
  reserveOrNavigateToSpot(id: string): Promise<boolean>;
}
