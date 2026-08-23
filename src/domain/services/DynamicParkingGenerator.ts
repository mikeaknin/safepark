import { ParkingLocation } from '../models/ParkingLocation';
import { ParkingStructureType, SurveillanceTier } from '../models/Infrastructure';
import { SafeWalkBackEngine } from './SafeWalkBackEngine';
import { SearchDestination } from '../../presentation/context/AppContext';
import { getSfNeighborhoodProfile, NeighborhoodSafetyProfile } from '../data/sfNeighborhoodSafetyData';
import { SafetyScoringEngine } from './SafetyScoringEngine';
import { DataSFPoliceService, DataSFPoliceReportSummary } from '../../infrastructure/api/DataSFPoliceService';
import { SF311Service, SF311MunicipalSummary } from '../../infrastructure/api/SF311Service';

export class DynamicParkingGenerator {
  /**
   * Generates authentic San Francisco parking locations (Curbside, Metered, Garages, Surface Lots)
   * within a 400-meter radius around any searched destination in SF.
   */
  public static generateSpotsAroundDestination(
    destination: SearchDestination,
    isDaytime: boolean = false,
    policeSummary?: DataSFPoliceReportSummary,
    municipalSummary?: SF311MunicipalSummary
  ): ParkingLocation[] {
    return this.generateSpotsAroundCoordinates(
      destination.coordinates,
      destination.name,
      isDaytime,
      destination.id,
      policeSummary,
      municipalSummary
    );
  }

  /**
   * Async generator that queries live DataSF SFPD Police Telemetry & SF 311 Outage Cases
   */
  public static async generateSpotsAroundCoordinatesAsync(
    coordinates: { lat: number; lng: number },
    referenceName?: string,
    isDaytime: boolean = false,
    idPrefix?: string
  ): Promise<ParkingLocation[]> {
    const [policeSummary, municipalSummary] = await Promise.all([
      DataSFPoliceService.fetchIncidentsNearCoordinates(coordinates, 500),
      SF311Service.fetchMunicipalCasesNearCoordinates(coordinates, 250),
    ]);

    return this.generateSpotsAroundCoordinates(
      coordinates,
      referenceName,
      isDaytime,
      idPrefix,
      policeSummary,
      municipalSummary
    );
  }

  /**
   * Generates and scores curbside & covered parking spots for any coordinates in SF
   */
  public static generateSpotsAroundCoordinates(
    coordinates: { lat: number; lng: number },
    referenceName?: string,
    isDaytime: boolean = false,
    idPrefix?: string,
    policeSummary?: DataSFPoliceReportSummary,
    municipalSummary?: SF311MunicipalSummary
  ): ParkingLocation[] {
    const { lat, lng } = coordinates;

    // 1. Resolve neighborhood profile
    const neighborhood: NeighborhoodSafetyProfile = getSfNeighborhoodProfile(coordinates);

    // 2. Parse or resolve authentic street and cross street names
    const parsed = this.resolveStreets(lat, lng, neighborhood, referenceName);
    const street = parsed.street;
    const crossStreet = parsed.crossStreet;
    const crossStreet2 = parsed.crossStreet2;

    const baseId = idPrefix || `geo-${lat.toFixed(4).replace('.', '')}-${lng.toFixed(4).replace('.', '')}`;

    // 3. Dynamic Realistic Pricing by Neighborhood & Type
    const isDowntown = neighborhood.id === 'financial_district' || neighborhood.id === 'soma';
    const garageHourlyRate = isDowntown
      ? SafetyScoringEngine.hashRange(lat, lng, 6, 9, 'garage_rate')
      : SafetyScoringEngine.hashRange(lat, lng, 4, 7, 'garage_rate') + 0.50;

    const meterHourlyRate = isDowntown
      ? Number((SafetyScoringEngine.hashRange(lat, lng, 350, 450, 'meter_rate') / 100).toFixed(2))
      : Number((SafetyScoringEngine.hashRange(lat, lng, 250, 350, 'meter_rate') / 100).toFixed(2));

    const lotHourlyRate = isDowntown
      ? SafetyScoringEngine.hashRange(lat, lng, 4, 6, 'lot_rate')
      : SafetyScoringEngine.hashRange(lat, lng, 3, 5, 'lot_rate');

    // Dynamic Garage Name Selection
    const garageNamePrefix = neighborhood.garageNamePrefixes.length > 0
      ? neighborhood.garageNamePrefixes[SafetyScoringEngine.hashRange(lat, lng, 0, neighborhood.garageNamePrefixes.length - 1, 'garage_name')]
      : `${neighborhood.name} Covered Garage`;

    const spotTemplates: Array<{
      idSuffix: string;
      name: string;
      address: string;
      type: ParkingStructureType;
      surveillance: SurveillanceTier;
      barrier: boolean;
      attendant: boolean;
      emergencyBoxes: boolean;
      hourlyRate: number;
      totalSpaces: number;
      availableSpaces: number;
      latOffset: number;
      lngOffset: number;
      pedestrianRating: 'high' | 'medium' | 'low' | 'isolated';
    }> = [
      {
        idSuffix: 'street-metered',
        name: `${street} Curbside Metered`,
        address: `${street} near ${crossStreet}, San Francisco, CA`,
        type: 'curbside_street_metered',
        surveillance: 'commercial_storefront_camera_overlap',
        barrier: false,
        attendant: false,
        emergencyBoxes: false,
        hourlyRate: meterHourlyRate,
        totalSpaces: 18,
        availableSpaces: SafetyScoringEngine.hashRange(lat, lng, 3, 9, 'spaces_meter'),
        latOffset: -0.0004,
        lngOffset: 0.0003,
        pedestrianRating: 'high',
      },
      {
        idSuffix: 'garage-main',
        name: garageNamePrefix,
        address: `${SafetyScoringEngine.hashRange(lat, lng, 100, 850, 'garage_addr')} ${street}, San Francisco, CA`,
        type: 'covered_underground_garage',
        surveillance: 'monitored_cctv_24_7',
        barrier: true,
        attendant: true,
        emergencyBoxes: true,
        hourlyRate: garageHourlyRate,
        totalSpaces: SafetyScoringEngine.hashRange(lat, lng, 140, 280, 'spaces_garage_tot'),
        availableSpaces: SafetyScoringEngine.hashRange(lat, lng, 18, 55, 'spaces_garage_avail'),
        latOffset: 0.0008,
        lngOffset: 0.0007,
        pedestrianRating: 'high',
      },
      {
        idSuffix: 'street-free',
        name: `${crossStreet} & ${street} 2-Hour Zone`,
        address: `${crossStreet} & ${street}, San Francisco, CA`,
        type: 'curbside_residential',
        surveillance: 'none',
        barrier: false,
        attendant: false,
        emergencyBoxes: false,
        hourlyRate: 0.00,
        totalSpaces: 14,
        availableSpaces: SafetyScoringEngine.hashRange(lat, lng, 2, 6, 'spaces_free'),
        latOffset: 0.0004,
        lngOffset: -0.0011,
        pedestrianRating: 'medium',
      },
      {
        idSuffix: 'deck-secure',
        name: `${crossStreet} Multi-Level Deck`,
        address: `${SafetyScoringEngine.hashRange(lat, lng, 200, 950, 'deck_addr')} ${crossStreet}, San Francisco, CA`,
        type: 'multi_level_deck',
        surveillance: 'monitored_cctv_24_7',
        barrier: true,
        attendant: true,
        emergencyBoxes: true,
        hourlyRate: Math.max(4.00, garageHourlyRate - 1.00),
        totalSpaces: 110,
        availableSpaces: SafetyScoringEngine.hashRange(lat, lng, 12, 28, 'spaces_deck'),
        latOffset: 0.0012,
        lngOffset: -0.0008,
        pedestrianRating: 'high',
      },
      {
        idSuffix: 'street-smart',
        name: `${crossStreet2} Smart Curb Meter`,
        address: `${crossStreet2} Corridor, San Francisco, CA`,
        type: 'curbside_street_metered',
        surveillance: 'commercial_storefront_camera_overlap',
        barrier: false,
        attendant: false,
        emergencyBoxes: false,
        hourlyRate: meterHourlyRate,
        totalSpaces: 20,
        availableSpaces: SafetyScoringEngine.hashRange(lat, lng, 4, 11, 'spaces_smart'),
        latOffset: -0.0009,
        lngOffset: 0.0012,
        pedestrianRating: 'high',
      },
      {
        idSuffix: 'lot-attended',
        name: `${crossStreet2} & ${crossStreet} Surface Lot`,
        address: `${crossStreet2} & ${crossStreet}, San Francisco, CA`,
        type: 'gated_surface_lot',
        surveillance: 'unmonitored_recording_cctv',
        barrier: true,
        attendant: true,
        emergencyBoxes: false,
        hourlyRate: lotHourlyRate,
        totalSpaces: 55,
        availableSpaces: SafetyScoringEngine.hashRange(lat, lng, 8, 19, 'spaces_lot'),
        latOffset: -0.0013,
        lngOffset: -0.0006,
        pedestrianRating: 'medium',
      },
    ];

    return spotTemplates.map((template) => {
      const spotLat = Number((lat + template.latOffset).toFixed(5));
      const spotLng = Number((lng + template.lngOffset).toFixed(5));
      const spotId = `spot-${baseId}-${template.idSuffix}`;

      // Crime Aggregate (Enhanced with live SFPD data if available)
      const incidents30 = policeSummary?.isLive
        ? policeSummary.incidentsLast30Days
        : neighborhood.smashAndGrabRisk === 'high'
        ? 5
        : neighborhood.smashAndGrabRisk === 'elevated'
        ? 3
        : 1;

      const incidents90 = policeSummary?.isLive
        ? policeSummary.incidentsLast90Days
        : neighborhood.smashAndGrabRisk === 'high'
        ? 14
        : neighborhood.smashAndGrabRisk === 'elevated'
        ? 8
        : 2;

      const smashCount = policeSummary?.isLive
        ? policeSummary.smashAndGrabCount
        : neighborhood.smashAndGrabRisk === 'high'
        ? 3
        : neighborhood.smashAndGrabRisk === 'elevated'
        ? 1
        : 0;

      const crimeData = {
        incidentsLast30Days: incidents30,
        incidentsLast90Days: incidents90,
        smashAndGrabCount: smashCount,
        catalyticConverterCount: neighborhood.smashAndGrabRisk === 'high' ? 2 : 0,
        incidentDensityPerSqKm: policeSummary?.isLive
          ? Number((incidents90 * 0.7).toFixed(1))
          : neighborhood.incidentRatePerSqKm,
        recentIncidents: (policeSummary?.incidents || []).slice(0, 10).map((inc) => ({
          id: inc.id,
          category: inc.isVehicleLarceny ? ('smash_and_grab' as const) : ('petty_theft_exterior' as const),
          timestamp: inc.incidentDatetime,
          distanceMeters: inc.distanceMeters,
          severityWeight: inc.isVehicleLarceny ? 1.0 : 0.5,
          verifiedByPoliceReport: true,
          blockDescription: inc.incidentDescription,
          coordinates: { lat: inc.latitude, lng: inc.longitude },
        })),
      };

      const luxLevel = isDaytime
        ? 95
        : municipalSummary?.hasStreetlightOutage
        ? Math.max(15, neighborhood.typicalLuxLevel - 25)
        : neighborhood.typicalLuxLevel;

      const lighting = {
        ambientLuxLevel: luxLevel,
        isDaytime,
        sunElevationAngleDegrees: isDaytime ? 45 : -18,
        coverageIndexPercentage: isDaytime ? 100 : Math.min(98, Math.round(luxLevel * 1.3)),
        blindSpotDetected: luxLevel < 35 || !!municipalSummary?.hasStreetlightOutage,
        municipalSmartLamps: [
          {
            id: `lamp-${spotId}-1`,
            lampType: 'smart_led' as const,
            luxOutput: luxLevel,
            status: municipalSummary?.hasStreetlightOutage ? ('reported_out' as const) : ('active' as const),
            distanceMeters: 6,
            poleHeightMeters: 4.5,
            motionActivated: true,
          },
        ],
      };

      const infrastructure = {
        structureType: template.type,
        surveillance: template.surveillance,
        hasControlledAccessBarrier: template.barrier,
        hasActiveAttendantOrPatrol: template.attendant,
        hasEmergencyCallBoxes: template.emergencyBoxes,
        pedestrianTrafficRating: template.pedestrianRating,
        clearSightlines: luxLevel >= 40,
      };

      // Compute Deterministic Geospatial CSI with Live SFPD & 311 Telemetry
      const csi = SafetyScoringEngine.computeGeospatialCsi({
        spotId,
        coordinates: { lat: spotLat, lng: spotLng },
        structureType: template.type,
        isDaytime,
        luxLevel,
        hazards: [],
        policeSummary,
        municipalSummary,
      });

      const routes = SafeWalkBackEngine.calculateWalkingRoutes(
        spotId,
        template.name,
        referenceName || `${street} Destination`
      );

      return {
        id: spotId,
        name: template.name,
        address: template.address,
        hourlyRate: template.hourlyRate,
        currency: '$',
        totalSpaces: template.totalSpaces,
        availableSpaces: template.availableSpaces,
        coordinates: { lat: spotLat, lng: spotLng },
        crimeData,
        lighting,
        infrastructure,
        activeHazards: [],
        csi,
        walkingRoutes: [routes.illuminatedRoute, routes.directRoute],
      };
    });
  }

  private static resolveStreets(
    lat: number,
    lng: number,
    neighborhood: NeighborhoodSafetyProfile,
    referenceName?: string
  ) {
    if (referenceName) {
      const parsed = this.parseAddressComponents(referenceName, '');
      if (parsed.street !== 'Municipal Corridor') {
        return parsed;
      }
    }

    const stIndex = SafetyScoringEngine.hashRange(lat, lng, 0, Math.max(0, neighborhood.primaryStreets.length - 1), 'street_pick');
    const street = neighborhood.primaryStreets[stIndex] || 'Market St';

    const crossIndex1 = SafetyScoringEngine.hashRange(lat, lng, 0, Math.max(0, neighborhood.crossStreets.length - 1), 'cross1_pick');
    let crossStreet = neighborhood.crossStreets[crossIndex1] || '4th St';

    const crossIndex2 = (crossIndex1 + 1) % (neighborhood.crossStreets.length || 1);
    const crossStreet2 = neighborhood.crossStreets[crossIndex2] || '5th St';

    return { street, crossStreet, crossStreet2, neighborhood: neighborhood.name };
  }

  private static parseAddressComponents(name: string, address: string) {
    const combined = `${name} ${address}`;

    const sfStreets = [
      'Vallejo', 'Columbus', 'Green', 'Broadway', 'Mission', 'Howard', 'Folsom',
      'Van Ness', 'Market', 'Geary', 'Post', 'Sutter', 'Powell', 'Stockton',
      'Grant', 'Kearny', 'Montgomery', 'Sansome', 'Battery', 'Front', 'Davis',
      'The Embarcadero', '4th', '5th', '3rd', '2nd', '1st', '6th', '7th',
      '8th', '9th', '10th', 'Hayes', 'Fell', 'Oak', 'Page', 'Haight',
      'Divisadero', 'Castro', 'Fillmore', 'Valencia', 'Guerrero', 'Dolores',
      'Polk', 'Lombard', 'Chestnut', 'Union', 'Filbert', 'California', 'Bush',
      'Pine', 'Clay', 'Sacramento', 'Washington', 'Jackson', 'Pacific',
      'Clement', 'Irving', 'Judah', 'Noriega', 'Taraval', 'Eddy', 'Ellis'
    ];

    let foundStreet = '';
    for (const st of sfStreets) {
      const regex = new RegExp(`\\b${st}\\b`, 'i');
      if (regex.test(combined)) {
        foundStreet = st.endsWith('St') || st.endsWith('Ave') || st.endsWith('Blvd') || st.includes('Embarcadero')
          ? st
          : `${st} St`;
        break;
      }
    }

    const street = foundStreet || (name.length > 2 && !name.includes('http') ? `${name.split(',')[0].trim()} St` : 'Municipal Corridor');
    let crossStreet = 'Columbus Ave';
    let crossStreet2 = 'Broadway';

    if (street.includes('Howard') || street.includes('Mission') || street.includes('Folsom')) {
      crossStreet = '3rd St';
      crossStreet2 = '4th St';
    } else if (street.includes('Market')) {
      crossStreet = '5th St';
      crossStreet2 = '6th St';
    } else if (street.includes('Valencia')) {
      crossStreet = '16th St';
      crossStreet2 = '18th St';
    } else if (street.includes('Chestnut') || street.includes('Union') || street.includes('Lombard')) {
      crossStreet = 'Fillmore St';
      crossStreet2 = 'Steiner St';
    } else if (street.includes('California') || street.includes('Pine') || street.includes('Bush')) {
      crossStreet = 'Montgomery St';
      crossStreet2 = 'Kearny St';
    } else if (street.includes('Eddy') || street.includes('Ellis')) {
      crossStreet = 'Jones St';
      crossStreet2 = 'Leavenworth St';
    }

    return { street, crossStreet, crossStreet2, neighborhood: 'San Francisco' };
  }
}
