import { GarageSecurityAudit, CertificationResult, CertificationTier } from '../models/Certification';
import { ParkingLocation } from '../models/ParkingLocation';
import { CsiEngine } from './CsiEngine';

export class CertificationEngine {
  public static evaluateFacility(audit: GarageSecurityAudit): CertificationResult {
    let score = 0;
    const notes: string[] = [];

    // Guard Presence (25 pts)
    if (audit.has247MannedGuards) {
      score += 25;
      notes.push('24/7 active security patrol on site (+25)');
    }

    // CCTV Coverage (25 pts max)
    const cctvPoints = Math.round((audit.cctvCoveragePercentage / 100) * 25);
    score += cctvPoints;
    notes.push(`HD CCTV coverage: ${audit.cctvCoveragePercentage}% (+${cctvPoints})`);

    // Physical Barrier Controls (15 pts)
    if (audit.hasPhysicalBarrierGates) {
      score += 15;
      notes.push('Automated barrier credential control (+15)');
    }

    // Lighting (15 pts max)
    const luxPoints = Math.min(15, Math.round((audit.averageLumenOutputLux / 60) * 15));
    score += luxPoints;
    notes.push(`Illumination: ${audit.averageLumenOutputLux} lux avg (+${luxPoints})`);

    // Additional Features (20 pts)
    if (audit.hasLicencePlateRecognition) {
      score += 8;
      notes.push('Automated LPR entry logging (+8)');
    }
    if (audit.hasEmergencyHelpCallBoxes) {
      score += 6;
      notes.push('Emergency callbox stations (+6)');
    }
    if (audit.insuranceBondingVerified) {
      score += 6;
      notes.push('Commercial liability & theft bonding verified (+6)');
    }

    let tier: CertificationTier = 'unverified';
    let isCertified = false;
    let boost = 0;
    let badgeLabel = 'Uncertified Facility';

    if (score >= 85) {
      tier = 'platinum';
      isCertified = true;
      boost = 22;
      badgeLabel = 'SafePark Platinum Certified';
    } else if (score >= 70) {
      tier = 'gold';
      isCertified = true;
      boost = 15;
      badgeLabel = 'SafePark Gold Certified';
    } else if (score >= 55) {
      tier = 'silver';
      isCertified = true;
      boost = 10;
      badgeLabel = 'SafePark Silver Certified';
    }

    return {
      tier,
      isCertified,
      auditScore: Math.min(100, score),
      csiBaselineBoost: boost,
      certifiedBadgeLabel: badgeLabel,
      complianceNotes: notes,
    };
  }

  public static applyCertificationToLocation(
    location: ParkingLocation,
    audit: GarageSecurityAudit,
    result: CertificationResult
  ): ParkingLocation {
    const updatedInfra = {
      ...location.infrastructure,
      surveillance: audit.cctvCoveragePercentage >= 80 ? ('monitored_cctv_24_7' as const) : location.infrastructure.surveillance,
      hasControlledAccessBarrier: audit.hasPhysicalBarrierGates,
      hasActiveAttendantOrPatrol: audit.has247MannedGuards,
      hasEmergencyCallBoxes: audit.hasEmergencyHelpCallBoxes,
    };

    const updatedLighting = {
      ...location.lighting,
      ambientLuxLevel: Math.max(location.lighting.ambientLuxLevel, audit.averageLumenOutputLux),
      coverageIndexPercentage: Math.max(location.lighting.coverageIndexPercentage, 92),
    };

    // Recalculate CSI score with certified security features
    const updatedCsi = CsiEngine.calculate(
      location.id,
      location.crimeData,
      updatedLighting,
      updatedInfra,
      location.activeHazards
    );

    return {
      ...location,
      infrastructure: updatedInfra,
      lighting: updatedLighting,
      csi: updatedCsi,
    };
  }
}
