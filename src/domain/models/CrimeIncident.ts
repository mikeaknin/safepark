export type VehicleCrimeCategory =
  | 'smash_and_grab'          // Weight: Highest (0.40)
  | 'catalytic_converter'     // Weight: High (0.30)
  | 'vehicle_theft'           // Weight: High (0.20)
  | 'vandalism_slashed_tires' // Weight: Moderate (0.10)
  | 'petty_theft_exterior';   // Weight: Low (0.05)

export interface CrimeIncident {
  id: string;
  category: VehicleCrimeCategory;
  timestamp: string; // ISO 8601
  distanceMeters: number; // Distance from spot
  severityWeight: number; // 0.1 to 1.0
  verifiedByPoliceReport: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  blockDescription: string;
}

export interface CrimeDataAggregate {
  incidentsLast30Days: number;
  incidentsLast90Days: number;
  smashAndGrabCount: number;
  catalyticConverterCount: number;
  recentIncidents: CrimeIncident[];
  incidentDensityPerSqKm: number;
}
