export type SavedSpotType = 'free_curbside' | 'metered' | 'garage';

export interface SavedParkingSession {
  id: string;
  locationId: string;
  spotName: string;
  address: string;
  spotType: SavedSpotType;
  coordinates: {
    lat: number;
    lng: number;
  };
  parkedAtTimestamp: number;
  expirationTimestamp?: number;
  streetSweepingNotice?: string;
  garageNotes?: {
    level?: string;
    stallNumber?: string;
    note?: string;
  };
  csiScore: number;
  hourlyRate: number;
}
