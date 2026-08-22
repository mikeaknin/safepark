export type LampType = 'smart_led' | 'high_pressure_sodium' | 'halogen' | 'decorative_low_lux';
export type LampOperationalStatus = 'active' | 'dimmed' | 'reported_out' | 'intermittent_fault';

export interface MunicipalSmartLamp {
  id: string;
  lampType: LampType;
  luxOutput: number;
  status: LampOperationalStatus;
  distanceMeters: number;
  poleHeightMeters: number;
  motionActivated: boolean;
}

export interface LightingEnvironment {
  ambientLuxLevel: number;        // Direct light reading at spot (lux)
  municipalSmartLamps: MunicipalSmartLamp[];
  isDaytime: boolean;            // Calculated based on solar zenith & local twilight
  sunElevationAngleDegrees: number;
  coverageIndexPercentage: number; // 0 - 100%
  blindSpotDetected: boolean;
}
