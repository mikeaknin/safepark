export type CertificationTier = 'platinum' | 'gold' | 'silver' | 'unverified';

export interface GarageSecurityAudit {
  facilityId: string;
  facilityName: string;
  operatorName: string;
  has247MannedGuards: boolean;
  cctvCoveragePercentage: number; // e.g. 95%
  hasPhysicalBarrierGates: boolean;
  averageLumenOutputLux: number; // e.g. 65 lux
  hasLicencePlateRecognition: boolean;
  hasEmergencyHelpCallBoxes: boolean;
  hasUndergroundEnclosure: boolean;
  insuranceBondingVerified: boolean;
}

export interface CertificationResult {
  tier: CertificationTier;
  isCertified: boolean;
  auditScore: number; // 0 - 100
  csiBaselineBoost: number; // e.g. +18 points
  certifiedBadgeLabel: string;
  complianceNotes: string[];
}
