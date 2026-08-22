import { describe, it, expect } from 'vitest';
import { CertificationEngine } from '../domain/services/CertificationEngine';
import { GarageSecurityAudit } from '../domain/models/Certification';
import { MOCK_PARKING_LOCATIONS } from '../data/mock/mockParkingSpots';

describe('B2B Garage Certification Engine ("SafePark Certified")', () => {
  const platinumAudit: GarageSecurityAudit = {
    facilityId: 'spot-sf-001',
    facilityName: 'Mission Bay Secure Garage',
    operatorName: 'Pacific Parking Group',
    has247MannedGuards: true,
    cctvCoveragePercentage: 95,
    hasPhysicalBarrierGates: true,
    averageLumenOutputLux: 68,
    hasLicencePlateRecognition: true,
    hasEmergencyHelpCallBoxes: true,
    hasUndergroundEnclosure: true,
    insuranceBondingVerified: true,
  };

  const silverAudit: GarageSecurityAudit = {
    facilityId: 'spot-sf-002',
    facilityName: 'Surface Deck',
    operatorName: 'Operator B',
    has247MannedGuards: false,
    cctvCoveragePercentage: 75,
    hasPhysicalBarrierGates: true,
    averageLumenOutputLux: 45,
    hasLicencePlateRecognition: true,
    hasEmergencyHelpCallBoxes: false,
    hasUndergroundEnclosure: false,
    insuranceBondingVerified: true,
  };

  it('awards Platinum certification to facilities with security guards, high CCTV and bright lighting', () => {
    const result = CertificationEngine.evaluateFacility(platinumAudit);
    expect(result.tier).toBe('platinum');
    expect(result.isCertified).toBe(true);
    expect(result.auditScore).toBeGreaterThanOrEqual(85);
    expect(result.csiBaselineBoost).toBe(22);
  });

  it('awards Silver certification to moderately secured facilities', () => {
    const result = CertificationEngine.evaluateFacility(silverAudit);
    expect(result.tier).toBe('silver');
    expect(result.isCertified).toBe(true);
    expect(result.auditScore).toBeGreaterThanOrEqual(55);
    expect(result.csiBaselineBoost).toBe(10);
  });

  it('upgrades parking spot infrastructure and boosts CSI score upon certification', () => {
    const spot = MOCK_PARKING_LOCATIONS[1]; // SOMA 5th
    const evalResult = CertificationEngine.evaluateFacility(platinumAudit);
    const updatedSpot = CertificationEngine.applyCertificationToLocation(spot, platinumAudit, evalResult);

    expect(updatedSpot.infrastructure.hasActiveAttendantOrPatrol).toBe(true);
    expect(updatedSpot.csi.totalScore).toBeGreaterThanOrEqual(spot.csi.totalScore);
  });
});
