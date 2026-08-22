export type ParkingStructureType =
  | 'covered_underground_garage'
  | 'multi_level_deck'
  | 'gated_surface_lot'
  | 'open_surface_lot'
  | 'curbside_street_metered'
  | 'curbside_residential';

export type SurveillanceTier =
  | 'monitored_cctv_24_7'
  | 'unmonitored_recording_cctv'
  | 'commercial_storefront_camera_overlap'
  | 'none';

export interface PhysicalInfrastructure {
  structureType: ParkingStructureType;
  surveillance: SurveillanceTier;
  hasControlledAccessBarrier: boolean; // Gated arm / RFID / Keycode
  hasActiveAttendantOrPatrol: boolean;
  hasEmergencyCallBoxes: boolean;
  pedestrianTrafficRating: 'high' | 'medium' | 'low' | 'isolated';
  clearSightlines: boolean;            // Free of high hedges / hidden alcoves
}
