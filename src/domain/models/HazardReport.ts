export type VerifiableHazardType =
  | 'broken_glass_pavement'       // Fresh automotive tempered safety glass shards
  | 'failed_street_lamp'          // Dead fixture creating black spot
  | 'broken_security_gate'        // Gate stuck open or forced
  | 'camera_tampered_or_down'     // Disabled or vandalized CCTV unit
  | 'obstructed_sightline_alcove' // Overgrowth or structural blind spot
  | 'pavement_debris_puncture_risk'; // Sharp metal/nails

export interface HazardReport {
  id: string;
  spotId: string;
  hazardType: VerifiableHazardType;
  reportedAt: string;             // ISO 8601
  confirmedByWitnessCount: number;
  photoEvidenceVerified: boolean;
  notes?: string;                 // Sanitized & anti-bias validated
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface HazardValidationResult {
  isValid: boolean;
  rejectionReason?: string;
  flaggedSubjectiveTerms?: string[];
  sanitizedReport?: Partial<HazardReport>;
}
