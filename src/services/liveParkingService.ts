/**
 * SafePark Live Parking & Real-Time Crime Telemetry Service
 * Orchestrates live fetching from municipal feeds (SF & LA) and Overpass OSM parking facilities,
 * then computes the deterministic safety score using lib/safetyScore.ts.
 */

import {
  ParkingFacility,
  CrimeIncident,
  SafetyScoreResult,
  calculateSafetyScore,
} from '../lib/safetyScore';
import { ParkingLocation, SafeWalkRoute } from '../domain/models/ParkingLocation';
import { ParkingStructureType, SurveillanceTier } from '../domain/models/Infrastructure';
import { RiskLevel } from '../theme/tokens';

import { CrimeService } from './crimeService';
import { ParkingService } from './parkingService';

export type SupportedCity = 'sf' | 'la';

export interface CityConfig {
  id: SupportedCity;
  name: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  bbox: string;
}

export const CITY_CONFIGS: Record<SupportedCity, CityConfig> = {
  sf: {
    id: 'sf',
    name: 'San Francisco',
    center: [37.7749, -122.4194],
    zoom: 13,
    bbox: '37.70,-122.52,37.83,-122.35',
  },
  la: {
    id: 'la',
    name: 'Los Angeles',
    center: [34.0522, -118.2437],
    zoom: 12,
    bbox: '33.98,-118.50,34.11,-118.23', // Focused high-density hubs
  },
};

export interface LiveCityDataResult {
  city: SupportedCity;
  facilities: ParkingFacility[];
  crimes: CrimeIncident[];
  scoredLocations: ParkingLocation[];
  timestamp: number;
}

function mapStructureType(osmType?: string): ParkingStructureType {
  const t = (osmType || '').toLowerCase();
  if (t === 'underground') return 'covered_underground_garage';
  if (t === 'multi-storey') return 'multi_level_deck';
  if (t === 'surface') return 'gated_surface_lot';
  return 'curbside_street_metered';
}

export class LiveParkingService {
  /**
   * Fetches live crimes either via backend proxy `/api/crimes?city=${city}`
   * or direct municipal Socrata endpoint as fallback.
   */
  public static async fetchCrimes(city: SupportedCity, signal?: AbortSignal): Promise<CrimeIncident[]> {
    return CrimeService.fetchCrimes(city, signal);
  }

  /**
   * Fetches live parking facilities from `/api/parking?city=${city}`,
   * direct Overpass API query, or bundled static JSON fallback.
   */
  public static async fetchParkingFacilities(city: SupportedCity, signal?: AbortSignal): Promise<ParkingFacility[]> {
    return ParkingService.fetchParkingFacilities(city, signal);
  }

  /**
   * Loads both live parking facilities and municipal crime data,
   * calculates deterministic safety scores for each facility,
   * and returns full ParkingLocation domain models.
   */
  public static async loadCityLiveParking(
    city: SupportedCity,
    signal?: AbortSignal
  ): Promise<LiveCityDataResult> {
    const [facilities, crimes] = await Promise.all([
      this.fetchParkingFacilities(city, signal),
      this.fetchCrimes(city, signal),
    ]);

    const scoredLocations: ParkingLocation[] = facilities.map((fac) => {
      const scoreResult: SafetyScoreResult = calculateSafetyScore(fac, crimes);
      const isStreet = Boolean(scoreResult.isStreetParking || fac.isStreetParking);
      const structType: ParkingStructureType = isStreet
        ? 'curbside_street_metered'
        : mapStructureType(scoreResult.type);

      // Hourly rate estimation based on structure and city
      let hourlyRate = 3.5;
      if (isStreet) {
        const rateMatch = (scoreResult.meterRate || fac.meterRate || '').match(/\$([0-9.]+)/);
        hourlyRate = rateMatch ? parseFloat(rateMatch[1]) : city === 'sf' ? 3.5 : 2.5;
      } else if (scoreResult.type === 'underground' || scoreResult.type === 'multi-storey') {
        hourlyRate = city === 'sf' ? 14.0 : 10.0;
      } else if (scoreResult.type === 'surface') {
        hourlyRate = city === 'sf' ? 6.0 : 5.0;
      }

      const riskLevel: RiskLevel = scoreResult.score >= 80 ? 'low' : scoreResult.score >= 60 ? 'moderate' : 'high';
      const surveillance: SurveillanceTier =
        scoreResult.type === 'underground' ? 'monitored_cctv_24_7' : 'unmonitored_recording_cctv';

      const totalSpaces = scoreResult.capacity !== 'Unknown' ? parseInt(scoreResult.capacity, 10) || 15 : 15;
      const availableSpaces = Math.max(2, Math.round(totalSpaces * 0.4));

      const location: ParkingLocation = {
        id: String(scoreResult.facilityId),
        name: scoreResult.name,
        address: scoreResult.address || `${scoreResult.name}, ${CITY_CONFIGS[city].name}, CA`,
        hourlyRate,
        currency: 'USD',
        totalSpaces,
        availableSpaces,
        isStreetParking: isStreet,
        blockName: scoreResult.blockName || fac.blockName || scoreResult.name,
        meterRate: scoreResult.meterRate || fac.meterRate || (isStreet ? `$${hourlyRate.toFixed(2)}/hr` : undefined),
        timeLimit: scoreResult.timeLimit || fac.timeLimit || (isStreet ? '2HR' : undefined),
        smashAndGrabWarning: scoreResult.smashAndGrabWarning,
        breakInsPast90Days: scoreResult.smashAndGrabCount,
        coordinates: {
          lat: scoreResult.lat,
          lng: scoreResult.lon,
        },
        crimeData: {
          incidentsLast30Days: scoreResult.incidentsWithin250m,
          incidentsLast90Days: scoreResult.incidentCount500m,
          smashAndGrabCount: scoreResult.smashAndGrabCount ?? scoreResult.incidentsWithin250m,
          catalyticConverterCount: Math.round(scoreResult.incidents250to500m * 0.4),
          recentIncidents: [],
          incidentDensityPerSqKm: scoreResult.incidentCount500m * 1.5,
        },
        csi: {
          id: `csi-${scoreResult.facilityId}`,
          spotId: String(scoreResult.facilityId),
          totalScore: scoreResult.score,
          riskLevel,
          timestamp: new Date().toISOString(),
          isNightTime: true,
          components: {
            crimeScore: {
              rawScore: scoreResult.breakInScore,
              weightedScore: Math.round(scoreResult.breakInScore * 0.50),
              weightPercentage: 50,
              description: `${scoreResult.incidentCount500m} incident${scoreResult.incidentCount500m === 1 ? '' : 's'} within 500m in past 90 days`,
              factorDetails: {
                incidentCount500m: scoreResult.incidentCount500m,
                within250m: scoreResult.incidentsWithin250m,
                between250and500m: scoreResult.incidents250to500m,
                displayText: scoreResult.displayText,
                label: scoreResult.breakInLabel,
              },
            },
            infrastructureScore: {
              rawScore: scoreResult.facilitySecurityScore,
              weightedScore: Math.round(scoreResult.facilitySecurityScore * 0.35),
              weightPercentage: 35,
              description: scoreResult.facilitySecurityLabel,
              factorDetails: {
                label: scoreResult.facilitySecurityLabel,
              },
            },
            lightingScore: {
              rawScore: scoreResult.lightingScore,
              weightedScore: Math.round(scoreResult.lightingScore * 0.15),
              weightPercentage: 15,
              description: scoreResult.lightingLabel,
              factorDetails: {
                label: scoreResult.lightingLabel,
              },
            },
            hazardScore: {
              rawScore: 90,
              weightedScore: 0,
              weightPercentage: 0,
              description: 'Physical defect telemetry',
              factorDetails: {},
            },
          },
          keyRiskFactors: scoreResult.score < 60 ? ['High concentration of nearby vehicle break-ins'] : [],
          recommendations: scoreResult.score >= 80 ? ['Low incident zone facility'] : ['Standard urban parking precautions'],
        },
        infrastructure: {
          structureType: structType,
          surveillance,
          hasControlledAccessBarrier: scoreResult.type === 'underground' || scoreResult.type === 'multi-storey',
          hasActiveAttendantOrPatrol: scoreResult.type === 'multi-storey',
          hasEmergencyCallBoxes: scoreResult.type === 'underground',
          pedestrianTrafficRating: 'high',
          clearSightlines: true,
        },
        lighting: {
          ambientLuxLevel: 45,
          municipalSmartLamps: [],
          isDaytime: false,
          sunElevationAngleDegrees: 12,
          coverageIndexPercentage: 75,
          blindSpotDetected: false,
        },
        activeHazards: [],
        walkingRoutes: [
          {
            id: `route-${scoreResult.facilityId}`,
            fromSpotId: String(scoreResult.facilityId),
            destinationName: scoreResult.name,
            totalDistanceMeters: 280,
            estimatedWalkingMinutes: 4,
            averageIlluminationLux: 55,
            safetyScore: scoreResult.score,
            isRecommendedLitPath: true,
            pathSegments: [],
          },
        ],
      };

      return location;
    });

    return {
      city,
      facilities,
      crimes,
      scoredLocations,
      timestamp: Date.now(),
    };
  }
}
