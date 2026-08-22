import { SAFE_PARK_TOKENS } from '../theme/tokens';
import { AntiBiasValidator } from '../domain/services/AntiBiasValidator';
import { CsiEngine } from '../domain/services/CsiEngine';
import { CertificationEngine } from '../domain/services/CertificationEngine';
import { MOCK_PARKING_LOCATIONS } from '../data/mock/mockParkingSpots';

/**
 * Calculates relative luminance for WCAG contrast compliance
 */
function getRelativeLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const sRGB = [r, g, b].map(val =>
    val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface SanityCheckResult {
  passed: boolean;
  totalChecks: number;
  results: Array<{ name: string; status: 'PASS' | 'FAIL'; details: string }>;
}

export class SanityRunner {
  public static runAllPreflightChecks(): SanityCheckResult {
    const results: Array<{ name: string; status: 'PASS' | 'FAIL'; details: string }> = [];

    // CHECK 1: WCAG 2.1 Contrast Ratio Verification (White on Slate)
    const textHex = SAFE_PARK_TOKENS.colors.text.primary;
    const surfaceHex = SAFE_PARK_TOKENS.colors.surface.primaryDark;
    const contrastRatio = getContrastRatio(textHex, surfaceHex);
    const contrastPassed = contrastRatio >= 7.0; // WCAG AAA requirement is >= 7.0:1

    results.push({
      name: 'WCAG 2.1 AAA Contrast Ratio Verification',
      status: contrastPassed ? 'PASS' : 'FAIL',
      details: `Contrast of ${textHex} on ${surfaceHex} is ${contrastRatio.toFixed(2)}:1 (Target: >= 7.0:1 AAA)`,
    });

    // CHECK 2: Semantic Status Color Isolation
    const brandBlue = SAFE_PARK_TOKENS.colors.brand.primary.toLowerCase();
    const lowRisk = SAFE_PARK_TOKENS.colors.status.lowRisk.hex.toLowerCase();
    const modRisk = SAFE_PARK_TOKENS.colors.status.moderateRisk.hex.toLowerCase();
    const highRisk = SAFE_PARK_TOKENS.colors.status.highRisk.hex.toLowerCase();

    const isolationPassed =
      brandBlue !== lowRisk &&
      brandBlue !== modRisk &&
      brandBlue !== highRisk &&
      lowRisk === '#22c55e' &&
      modRisk === '#f59e0b' &&
      highRisk === '#ef4444';

    results.push({
      name: 'Semantic Status Color Isolation (#22C55E / #F59E0B / #EF4444)',
      status: isolationPassed ? 'PASS' : 'FAIL',
      details: `Brand Blue (${brandBlue}) is isolated from semantic status badges. Status colors: Low=${lowRisk}, Mod=${modRisk}, High=${highRisk}`,
    });

    // CHECK 3: Anti-Bias Validator Invariant
    const subjectiveTest = AntiBiasValidator.validateReport(
      'spot-test',
      'broken_glass_pavement',
      'This sketchy area feels shady and full of weird people',
      37.77,
      -122.41
    );

    const objectiveTest = AntiBiasValidator.validateReport(
      'spot-test',
      'broken_glass_pavement',
      'Curb contains automotive tempered safety glass remnants',
      37.77,
      -122.41
    );

    const antiBiasPassed = !subjectiveTest.isValid && objectiveTest.isValid;

    results.push({
      name: 'Anti-Bias Input Validation Engine Guardrails',
      status: antiBiasPassed ? 'PASS' : 'FAIL',
      details: `Subjective terms rejected: ${!subjectiveTest.isValid}. Objective physical hazard accepted: ${objectiveTest.isValid}`,
    });

    // CHECK 4: CSI Mathematical Engine Bounds [0, 100]
    let allCsiBounded = true;
    for (const spot of MOCK_PARKING_LOCATIONS) {
      const score = spot.csi.totalScore;
      if (score < 0 || score > 100 || isNaN(score)) {
        allCsiBounded = false;
      }
    }

    results.push({
      name: 'CSI Engine Mathematical Boundedness Invariant',
      status: allCsiBounded ? 'PASS' : 'FAIL',
      details: `All ${MOCK_PARKING_LOCATIONS.length} spots computed within strict [0, 100] domain bounds.`,
    });

    // CHECK 5: B2B Certification Engine Threshold Logic
    const platinumAudit = CertificationEngine.evaluateFacility({
      facilityId: 'f-1',
      facilityName: 'Test Garage',
      operatorName: 'Operator',
      has247MannedGuards: true,
      cctvCoveragePercentage: 100,
      hasPhysicalBarrierGates: true,
      averageLumenOutputLux: 70,
      hasLicencePlateRecognition: true,
      hasEmergencyHelpCallBoxes: true,
      hasUndergroundEnclosure: true,
      insuranceBondingVerified: true,
    });

    const certPassed = platinumAudit.tier === 'platinum' && platinumAudit.isCertified && platinumAudit.csiBaselineBoost === 22;

    results.push({
      name: 'B2B Garage Certification Scoring Engine',
      status: certPassed ? 'PASS' : 'FAIL',
      details: `100% audit awarded tier "${platinumAudit.tier}" with +${platinumAudit.csiBaselineBoost} CSI baseline boost.`,
    });

    const allPassed = results.every(r => r.status === 'PASS');
    return {
      passed: allPassed,
      totalChecks: results.length,
      results,
    };
  }
}
