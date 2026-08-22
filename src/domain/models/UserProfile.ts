import { ParkingLocation } from './ParkingLocation';

export interface ParkingHistoryItem {
  sessionId: string;
  locationId: string;
  locationName: string;
  address: string;
  parkedAtIso: string;
  durationMinutes: number;
  totalPaid: number;
  csiScoreAtParking: number;
  riskAvoidanceSummary: string;
  cabinCheckConfirmed: boolean;
}

export interface UserProfileData {
  userId: string;
  driverName: string;
  vehicleModel: string;
  licensePlateMasked: string;
  bluetoothPairedDevice: string;
  totalSafelyParkedSessions: number;
  averageParkedCsiScore: number;
  favoriteSpotIds: string[];
  history: ParkingHistoryItem[];
}

export const INITIAL_USER_PROFILE: UserProfileData = {
  userId: 'usr-sf-8821',
  driverName: 'Alex Rivera',
  vehicleModel: 'Tesla Model Y / Dark Silver',
  licensePlateMasked: '8XYZ•••',
  bluetoothPairedDevice: 'CarPlay_Vehicle_Audio_Sync',
  totalSafelyParkedSessions: 14,
  averageParkedCsiScore: 84,
  favoriteSpotIds: ['spot-sf-001', 'spot-sf-004'],
  history: [
    {
      sessionId: 'ses-101',
      locationId: 'spot-sf-001',
      locationName: 'Mission Bay Secure Underground Garage',
      address: '450 4th Street, San Francisco, CA',
      parkedAtIso: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      durationMinutes: 145,
      totalPaid: 15.70,
      csiScoreAtParking: 94,
      riskAvoidanceSummary: 'Zero break-ins, 24/7 CCTV surveillance & gated credential entry.',
      cabinCheckConfirmed: true,
    },
    {
      sessionId: 'ses-102',
      locationId: 'spot-sf-004',
      locationName: 'Yerba Buena Center Garage',
      address: '772 Folsom Street, San Francisco, CA',
      parkedAtIso: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
      durationMinutes: 90,
      totalPaid: 8.25,
      csiScoreAtParking: 88,
      riskAvoidanceSummary: 'High-density municipal smart LED lighting & monitored perimeter.',
      cabinCheckConfirmed: true,
    }
  ]
};
