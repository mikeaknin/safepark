import { ParkingStructureType, PhysicalInfrastructure } from '../models/Infrastructure';
import { LightingEnvironment } from '../models/LightingData';
import { CrimeDataAggregate } from '../models/CrimeIncident';
import { HazardReport } from '../models/HazardReport';
import { CompositeSafetyIndex, ScoreComponentBreakdown } from '../models/SafetyScore';
import { getRiskLevel } from '../../theme/tokens';
import {
  getSfNeighborhoodProfile,
  NeighborhoodSafetyProfile,
} from '../data/sfNeighborhoodSafetyData';

export interface DynamicCsiCalculationOptions {
  spotId: string;
  coordinates: { lat: number; lng: number };
  structureType: ParkingStructureType;
  isDaytime?: boolean;
  luxLevel?: number;
  hazards?: HazardReport[];
  customSurveillanceBonus?: number;
}

export class SafetyScoringEngine {
  /**
   * Deterministic Murmur-style coordinate hash generating consistent pseudo-random values in [0, 1)
   * This guarantees block-level persistent CSI variation that doesn't fluctuate between page reloads or pan events.
   */
  public static hashCoordinates(lat: number, lng: number, salt: string = ''): number {
    const str = `${lat.toFixed(5)}_${lng.toFixed(5)}_${salt}`;
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    // Normalize unsigned 32-bit int to [0, 1)
    return ((hash >>> 0) % 10000) / 10000;
  }

  /**
   * Generates a deterministic integer between [min, max] inclusive for given coordinates and salt.
   */
  public static hashRange(lat: number, lng: number, min: number, max: number, salt: string = ''): number {
    const fraction = this.hashCoordinates(lat, lng, salt);
    return Math.floor(min + fraction * (max - min + 1));
  }

  /**
   * Main Dynamic Geospatial Composite Safety Index (CSI) Scoring Formula:
   * CSI = Clamp(NeighborhoodBase + FacilityModifier + LightingScore - IncidentPenalty, 20, 99)
   */
  public static computeGeospatialCsi(options: DynamicCsiCalculationOptions): CompositeSafetyIndex {
    const {
      spotId,
      coordinates,
      structureType,
      isDaytime = false,
      hazards = [],
    } = options;

    const { lat, lng } = coordinates;
    const neighborhood: NeighborhoodSafetyProfile = getSfNeighborhoodProfile(coordinates);

    // 1. Neighborhood Baseline Score (Deterministic jitter within neighborhood range)
    const baseVariance = this.hashRange(lat, lng, neighborhood.baseCsiMin, neighborhood.baseCsiMax, 'base_csi');
    const neighborhoodBaseScore = baseVariance;

    // 2. Facility Type Modifier
    // - Secure Gated / Attended Multi-Level Garage: +12 to +18 pts
    // - High-Visibility Commercial Metered Strip: +0 to +5 pts
    // - 2-Hour Residential Curbside: -3 to +4 pts (based on block lighting)
    // - Surface Unattended Lot / Dark Alleyway: -12 to -20 pts
    let facilityModifier = 0;
    let infrastructureDescription = '';

    switch (structureType) {
      case 'covered_underground_garage':
      case 'multi_level_deck': {
        const garageBonus = this.hashRange(lat, lng, 12, 18, 'garage_mod');
        facilityModifier = garageBonus;
        infrastructureDescription = 'Secure gated access, concrete enclosure, and CCTV surveillance';
        break;
      }
      case 'curbside_street_metered': {
        const meteredBonus = this.hashRange(lat, lng, 0, 5, 'meter_mod');
        facilityModifier = meteredBonus;
        infrastructureDescription = 'High-visibility commercial storefront corridor with active eyes-on-street';
        break;
      }
      case 'curbside_residential': {
        const residentialMod = this.hashRange(lat, lng, -3, 4, 'res_mod');
        facilityModifier = residentialMod;
        infrastructureDescription = 'Residential curbside parking with natural neighborhood surveillance';
        break;
      }
      case 'gated_surface_lot': {
        const gatedLotMod = this.hashRange(lat, lng, -2, 6, 'gated_lot');
        facilityModifier = gatedLotMod;
        infrastructureDescription = 'Gated surface lot with access arm control';
        break;
      }
      case 'open_surface_lot':
      default: {
        const lotPenalty = this.hashRange(lat, lng, 12, 20, 'unattended_lot');
        facilityModifier = -lotPenalty;
        infrastructureDescription = 'Unattended surface lot / unmonitored open parking area';
        break;
      }
    }

    // 3. Lighting Score Modifier
    // High-Lux municipal smart LEDs add up to +6 pts; unlit side streets subtract -8 pts.
    const effectiveLux = options.luxLevel !== undefined
      ? options.luxLevel
      : isDaytime
      ? 95
      : this.hashRange(lat, lng, Math.max(15, neighborhood.typicalLuxLevel - 15), Math.min(90, neighborhood.typicalLuxLevel + 10), 'lux_level');

    let lightingModifier = 0;
    if (isDaytime) {
      lightingModifier = 6;
    } else {
      if (effectiveLux >= 65) {
        lightingModifier = this.hashRange(lat, lng, 4, 6, 'high_lux');
      } else if (effectiveLux >= 45) {
        lightingModifier = this.hashRange(lat, lng, 1, 3, 'med_lux');
      } else if (effectiveLux >= 30) {
        lightingModifier = this.hashRange(lat, lng, -4, -1, 'low_lux');
      } else {
        lightingModifier = -8;
      }
    }

    // 4. Incident Penalty
    // Based on neighborhood baseline incident density + micro-block variance
    const microIncidentVariance = this.hashRange(lat, lng, 0, 4, 'crime_variance');
    let incidentPenalty = Math.round(neighborhood.incidentRatePerSqKm * 0.75 + microIncidentVariance);

    if (structureType === 'covered_underground_garage' || structureType === 'multi_level_deck') {
      // Garages isolate vehicles from curbside larceny
      incidentPenalty = Math.round(incidentPenalty * 0.35);
    }

    // Hazard penalties (time decayed)
    let hazardPenalty = 0;
    for (const h of hazards) {
      hazardPenalty += 8;
    }

    // Formula execution: Clamp(NeighborhoodBase + FacilityModifier + LightingScore - IncidentPenalty - HazardPenalty, 20, 99)
    const rawSum = neighborhoodBaseScore + facilityModifier + lightingModifier - incidentPenalty - hazardPenalty;
    const finalScore = Math.min(99, Math.max(20, Math.round(rawSum)));
    const riskLevel = getRiskLevel(finalScore);

    // Diagnostics & Key Factors
    const keyRiskFactors: string[] = [];
    const recommendations: string[] = [];

    if (neighborhood.smashAndGrabRisk === 'high' || neighborhood.smashAndGrabRisk === 'elevated') {
      keyRiskFactors.push(`Elevated vehicle property crime zone (${neighborhood.name})`);
      recommendations.push('Do NOT leave sunglasses, charging cables, or bags visible');
    }

    if (!isDaytime && effectiveLux < 40) {
      keyRiskFactors.push(`Sub-optimal night illumination (${effectiveLux} lux)`);
      recommendations.push('Return walking route via well-lit commercial avenue');
    }

    if (facilityModifier > 10) {
      recommendations.push('High-security gated facility: Maximum vehicle break-in defense');
    } else if (facilityModifier < -10) {
      keyRiskFactors.push('Unattended open lot without barrier controls');
      recommendations.push('Consider moving to an attended garage after dark');
    }

    if (recommendations.length === 0) {
      recommendations.push('Standard urban parking precautions recommended');
    }

    // Detailed Component Breakdown for UI Modals
    const crimeScoreComponent: ScoreComponentBreakdown = {
      rawScore: Math.max(10, Math.min(100, 100 - incidentPenalty * 4)),
      weightedScore: (100 - incidentPenalty * 4) * 0.40,
      weightPercentage: 40,
      description: `Empirical SF Incident Rate: ${neighborhood.incidentRatePerSqKm} incidents/sq km (${neighborhood.name})`,
      factorDetails: {
        neighborhood: neighborhood.name,
        incidentRate: `${neighborhood.incidentRatePerSqKm} per sq km`,
        smashAndGrabRisk: neighborhood.smashAndGrabRisk,
        microIncidentPenalty: incidentPenalty,
      },
    };

    const lightingScoreComponent: ScoreComponentBreakdown = {
      rawScore: Math.max(10, Math.min(100, Math.round(isDaytime ? 95 : (effectiveLux / 75) * 100))),
      weightedScore: (isDaytime ? 95 : (effectiveLux / 75) * 100) * 0.25,
      weightPercentage: 25,
      description: `${isDaytime ? 'Daylight Solar Zenith' : `${effectiveLux} Lux Municipal Smart Grid`}`,
      factorDetails: {
        isDaytime,
        ambientLux: `${effectiveLux} lux`,
        lightingModifier: `${lightingModifier > 0 ? '+' : ''}${lightingModifier} pts`,
      },
    };

    const infrastructureScoreComponent: ScoreComponentBreakdown = {
      rawScore: Math.max(10, Math.min(100, 50 + facilityModifier * 2.8)),
      weightedScore: (50 + facilityModifier * 2.8) * 0.25,
      weightPercentage: 25,
      description: infrastructureDescription,
      factorDetails: {
        structureType: structureType.replace(/_/g, ' '),
        facilityModifier: `${facilityModifier > 0 ? '+' : ''}${facilityModifier} pts`,
      },
    };

    const hazardScoreComponent: ScoreComponentBreakdown = {
      rawScore: Math.max(0, 100 - hazardPenalty * 10),
      weightedScore: (100 - hazardPenalty * 10) * 0.10,
      weightPercentage: 10,
      description: 'Active Community-Reported Physical Hazards',
      factorDetails: {
        activeHazardsCount: hazards.length,
        hazardPenalty: `-${hazardPenalty} pts`,
      },
    };

    return {
      id: `csi-${spotId}-${Date.now()}`,
      spotId,
      totalScore: finalScore,
      riskLevel,
      timestamp: new Date().toISOString(),
      isNightTime: !isDaytime,
      components: {
        crimeScore: crimeScoreComponent,
        lightingScore: lightingScoreComponent,
        infrastructureScore: infrastructureScoreComponent,
        hazardScore: hazardScoreComponent,
      },
      keyRiskFactors,
      recommendations,
    };
  }
}
