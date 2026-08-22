import { CrimeDataAggregate, CrimeIncident } from '../models/CrimeIncident';
import { LightingEnvironment } from '../models/LightingData';
import { PhysicalInfrastructure } from '../models/Infrastructure';
import { HazardReport } from '../models/HazardReport';
import { CompositeSafetyIndex, ScoreComponentBreakdown } from '../models/SafetyScore';
import { getRiskLevel } from '../../theme/tokens';

export class CsiEngine {
  // Weights summing to 1.00 (100%)
  private static readonly WEIGHT_CRIME = 0.40;
  private static readonly WEIGHT_LIGHTING = 0.25;
  private static readonly WEIGHT_INFRASTRUCTURE = 0.25;
  private static readonly WEIGHT_HAZARDS = 0.10;

  /**
   * Main Composite Safety Index (CSI) Scoring Function (0 - 100)
   */
  public static calculate(
    spotId: string,
    crime: CrimeDataAggregate,
    lighting: LightingEnvironment,
    infra: PhysicalInfrastructure,
    hazards: HazardReport[],
    currentTimeIso: string = new Date().toISOString()
  ): CompositeSafetyIndex {
    const crimeScore = this.computeCrimeScore(crime);
    const lightingScore = this.computeLightingScore(lighting);
    const infrastructureScore = this.computeInfrastructureScore(infra);
    const hazardScore = this.computeHazardScore(hazards, currentTimeIso);

    const totalRaw =
      crimeScore.weightedScore +
      lightingScore.weightedScore +
      infrastructureScore.weightedScore +
      hazardScore.weightedScore;

    // Constrain score strictly within [0, 100]
    const finalScore = Math.min(100, Math.max(0, Math.round(totalRaw)));
    const riskLevel = getRiskLevel(finalScore);

    const keyRiskFactors: string[] = [];
    const recommendations: string[] = [];

    // Factor Diagnostics
    if (crime.smashAndGrabCount > 0) {
      keyRiskFactors.push(`${crime.smashAndGrabCount} smash-and-grab incidents reported nearby in last 30 days`);
      recommendations.push('Do NOT leave bags, sunglasses, or charging cables visible inside cabin');
    }
    if (crime.catalyticConverterCount > 0) {
      keyRiskFactors.push('Elevated catalytic converter theft corridor');
    }
    if (!lighting.isDaytime && lighting.coverageIndexPercentage < 65) {
      keyRiskFactors.push('Sub-optimal night illumination (<65% municipal coverage)');
      recommendations.push('Use SafePark Illuminated Walking Route upon return');
    }
    if (infra.surveillance === 'none' && !infra.hasControlledAccessBarrier) {
      keyRiskFactors.push('Unmonitored public access without barrier controls');
    }
    if (hazards.length > 0) {
      keyRiskFactors.push(`${hazards.length} verified physical hazard(s) active on this block`);
    }

    if (recommendations.length === 0) {
      recommendations.push('High safety rating: Standard vehicle locking precautions recommended');
    }

    // Telemetry Breadcrumb recording
    try {
      import('../../utils/telemetry').then(({ Telemetry }) => {
        Telemetry.addBreadcrumb('csi_engine', `Computed CSI ${finalScore} for spot ${spotId}`, {
          spotId,
          finalScore,
          riskLevel,
          crimePenalty: 100 - crimeScore.rawScore,
          lightingScore: lightingScore.rawScore,
        });
      }).catch(() => {});
    } catch {}

    return {
      id: `csi-${spotId}-${Date.now()}`,
      spotId,
      totalScore: finalScore,
      riskLevel,
      timestamp: currentTimeIso,
      isNightTime: !lighting.isDaytime,
      components: {
        crimeScore,
        lightingScore,
        infrastructureScore,
        hazardScore,
      },
      keyRiskFactors,
      recommendations,
    };
  }

  /**
   * 1. Crime Score Sub-Engine (40% Weight)
   * High penalty for smash & grab and catalytic converter theft in close proximity.
   */
  private static computeCrimeScore(crime: CrimeDataAggregate): ScoreComponentBreakdown {
    let penalty = 0;

    // Penalize by incident categories
    for (const inc of crime.recentIncidents) {
      const distanceDecay = Math.max(0.2, 1 - inc.distanceMeters / 500); // Higher penalty if closer
      let categoryPenalty = 8;

      if (inc.category === 'smash_and_grab') categoryPenalty = 18;
      else if (inc.category === 'catalytic_converter') categoryPenalty = 14;
      else if (inc.category === 'vehicle_theft') categoryPenalty = 12;
      else if (inc.category === 'vandalism_slashed_tires') categoryPenalty = 7;
      else categoryPenalty = 4;

      penalty += categoryPenalty * inc.severityWeight * distanceDecay;
    }

    // Additional penalty based on density
    penalty += Math.min(25, crime.incidentDensityPerSqKm * 2.5);

    const rawScore = Math.max(5, Math.min(100, Math.round(100 - penalty)));
    const weightedScore = rawScore * this.WEIGHT_CRIME;

    return {
      rawScore,
      weightedScore,
      weightPercentage: this.WEIGHT_CRIME * 100,
      description: 'Historical & recent geocoded property crime incident analysis',
      factorDetails: {
        incidentsLast30Days: crime.incidentsLast30Days,
        smashAndGrabIncidents: crime.smashAndGrabCount,
        catalyticConverterIncidents: crime.catalyticConverterCount,
        densityPerSqKm: crime.incidentDensityPerSqKm,
      }
    };
  }

  /**
   * 2. Lighting & Solar Status Sub-Engine (25% Weight)
   * Daytime receives high baseline; nighttime evaluates municipal smart lamp output & coverage.
   */
  private static computeLightingScore(lighting: LightingEnvironment): ScoreComponentBreakdown {
    let rawScore = 0;

    if (lighting.isDaytime) {
      // Natural sunlight provides ambient protection
      rawScore = 92 + Math.min(8, lighting.coverageIndexPercentage * 0.08);
    } else {
      // Nighttime: Evaluate smart lighting grid
      const coverageContribution = lighting.coverageIndexPercentage * 0.50; // up to 50
      const luxContribution = Math.min(40, (lighting.ambientLuxLevel / 45) * 40); // 45+ lux is well lit
      const blindSpotPenalty = lighting.blindSpotDetected ? 18 : 0;

      // Smart active lamps bonus
      const activeSmartLamps = lighting.municipalSmartLamps.filter(l => l.status === 'active' && l.luxOutput >= 30).length;
      const smartBonus = Math.min(15, activeSmartLamps * 4);

      rawScore = Math.max(10, Math.min(100, coverageContribution + luxContribution + smartBonus - blindSpotPenalty));
    }

    rawScore = Math.round(rawScore);
    const weightedScore = rawScore * this.WEIGHT_LIGHTING;

    return {
      rawScore,
      weightedScore,
      weightPercentage: this.WEIGHT_LIGHTING * 100,
      description: 'Municipal smart lighting grid density and solar zenith calculation',
      factorDetails: {
        isDaytime: lighting.isDaytime,
        ambientLux: `${lighting.ambientLuxLevel} lux`,
        coverage: `${lighting.coverageIndexPercentage}%`,
        activeSmartLamps: lighting.municipalSmartLamps.filter(l => l.status === 'active').length,
        blindSpotDetected: lighting.blindSpotDetected,
      }
    };
  }

  /**
   * 3. Physical Infrastructure Security Sub-Engine (25% Weight)
   * Covered underground garages, controlled barriers, and active surveillance yield maximum score.
   */
  private static computeInfrastructureScore(infra: PhysicalInfrastructure): ScoreComponentBreakdown {
    let base = 30;

    // Structure baseline
    switch (infra.structureType) {
      case 'covered_underground_garage':
        base = 85;
        break;
      case 'multi_level_deck':
        base = 72;
        break;
      case 'gated_surface_lot':
        base = 65;
        break;
      case 'open_surface_lot':
        base = 45;
        break;
      case 'curbside_street_metered':
        base = 40;
        break;
      case 'curbside_residential':
        base = 35;
        break;
    }

    // Surveillance modifiers
    if (infra.surveillance === 'monitored_cctv_24_7') base += 15;
    else if (infra.surveillance === 'unmonitored_recording_cctv') base += 8;
    else if (infra.surveillance === 'commercial_storefront_camera_overlap') base += 4;

    // Barrier controls
    if (infra.hasControlledAccessBarrier) base += 10;
    if (infra.hasActiveAttendantOrPatrol) base += 12;
    if (infra.hasEmergencyCallBoxes) base += 5;
    if (!infra.clearSightlines) base -= 10;

    const rawScore = Math.max(10, Math.min(100, base));
    const weightedScore = rawScore * this.WEIGHT_INFRASTRUCTURE;

    return {
      rawScore,
      weightedScore,
      weightPercentage: this.WEIGHT_INFRASTRUCTURE * 100,
      description: 'Physical perimeter, gated barriers, surveillance, and structure classification',
      factorDetails: {
        structureType: infra.structureType.replace(/_/g, ' '),
        surveillance: infra.surveillance.replace(/_/g, ' '),
        gatedBarrier: infra.hasControlledAccessBarrier,
        mannedPatrol: infra.hasActiveAttendantOrPatrol,
        clearSightlines: infra.clearSightlines,
      }
    };
  }

  /**
   * 4. Time-Decayed User Hazard Reports (10% Weight)
   * Fresh verified reports produce immediate penalty; decays exponentially over 48 hours.
   */
  private static computeHazardScore(hazards: HazardReport[], currentTimeIso: string): ScoreComponentBreakdown {
    const currentMs = new Date(currentTimeIso).getTime();
    let totalHazardPenalty = 0;

    for (const h of hazards) {
      const reportMs = new Date(h.reportedAt).getTime();
      const ageHours = Math.max(0, (currentMs - reportMs) / (1000 * 60 * 60));
      
      // Exponential decay: Half-life of 18 hours (after 48 hours impact is near 0)
      const decayFactor = Math.exp(-0.0385 * ageHours);
      
      let baseSeverity = 15;
      if (h.hazardType === 'broken_glass_pavement') baseSeverity = 28;
      else if (h.hazardType === 'broken_security_gate') baseSeverity = 25;
      else if (h.hazardType === 'camera_tampered_or_down') baseSeverity = 20;
      else if (h.hazardType === 'failed_street_lamp') baseSeverity = 16;
      else baseSeverity = 10;

      // Witness verification multiplier
      const witnessMultiplier = 1 + Math.min(0.5, h.confirmedByWitnessCount * 0.1);
      const photoMultiplier = h.photoEvidenceVerified ? 1.25 : 1.0;

      totalHazardPenalty += baseSeverity * decayFactor * witnessMultiplier * photoMultiplier;
    }

    const rawScore = Math.max(0, Math.min(100, Math.round(100 - totalHazardPenalty)));
    const weightedScore = rawScore * this.WEIGHT_HAZARDS;

    return {
      rawScore,
      weightedScore,
      weightPercentage: this.WEIGHT_HAZARDS * 100,
      description: 'Community-verified, time-decayed physical hazard observations',
      factorDetails: {
        activeVerifiedHazardsCount: hazards.length,
        decayHalfLife: '18 hours',
      }
    };
  }
}
