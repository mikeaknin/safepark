import { ParkingLocation } from '../models/ParkingLocation';
import { ParkingStructureType, SurveillanceTier } from '../models/Infrastructure';
import { CsiEngine } from './CsiEngine';
import { SafeWalkBackEngine } from './SafeWalkBackEngine';
import { SearchDestination } from '../../presentation/context/AppContext';

export class DynamicParkingGenerator {
  /**
   * Generates authentic San Francisco parking locations (Curbside, Metered, Garages, Surface Lots)
   * within a 400-meter radius around any searched destination in SF.
   */
  public static generateSpotsAroundDestination(
    destination: SearchDestination,
    isDaytime: boolean = false
  ): ParkingLocation[] {
    return this.generateSpotsAroundCoordinates(
      destination.coordinates,
      destination.name,
      isDaytime,
      destination.id
    );
  }

  /**
   * Generates and scores curbside & covered parking spots for any coordinates in SF
   */
  public static generateSpotsAroundCoordinates(
    coordinates: { lat: number; lng: number },
    referenceName?: string,
    isDaytime: boolean = false,
    idPrefix?: string
  ): ParkingLocation[] {
    const { lat, lng } = coordinates;

    // Extract primary street and neighborhood heuristics
    const parsed = this.parseCoordinatesOrName(lat, lng, referenceName);
    const street = parsed.street;
    const crossStreet = parsed.crossStreet;
    const crossStreet2 = parsed.crossStreet2;
    const neighborhood = parsed.neighborhood;

    const baseId = idPrefix || `geo-${lat.toFixed(4).replace('.', '')}-${lng.toFixed(4).replace('.', '')}`;

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
      incidents30: number;
      incidents90: number;
      lux: number;
      pedestrianRating: 'high' | 'medium' | 'low' | 'isolated';
    }> = [
      {
        idSuffix: 'street-metered',
        name: `${street} Curbside Metered`,
        address: `${street} near ${crossStreet}, San Francisco, CA`,
        type: 'curbside_street_metered',
        surveillance: 'unmonitored_recording_cctv',
        barrier: false,
        attendant: false,
        emergencyBoxes: false,
        hourlyRate: 3.50,
        totalSpaces: 18,
        availableSpaces: 6,
        latOffset: -0.0004,
        lngOffset: 0.0003,
        incidents30: 1,
        incidents90: 3,
        lux: 54,
        pedestrianRating: 'high',
      },
      {
        idSuffix: 'garage-main',
        name: `${neighborhood} Covered Garage`,
        address: `${Math.floor(Math.abs(lat * 100) % 800) + 100} ${street}, San Francisco, CA`,
        type: 'covered_underground_garage',
        surveillance: 'monitored_cctv_24_7',
        barrier: true,
        attendant: true,
        emergencyBoxes: true,
        hourlyRate: 5.50,
        totalSpaces: 160,
        availableSpaces: 32,
        latOffset: 0.0008,
        lngOffset: 0.0007,
        incidents30: 0,
        incidents90: 1,
        lux: 70,
        pedestrianRating: 'high',
      },
      {
        idSuffix: 'street-free',
        name: `${crossStreet} 2-Hour Free Zone`,
        address: `${crossStreet} & ${street}, San Francisco, CA`,
        type: 'curbside_residential',
        surveillance: 'none',
        barrier: false,
        attendant: false,
        emergencyBoxes: false,
        hourlyRate: 0.00,
        totalSpaces: 14,
        availableSpaces: 4,
        latOffset: 0.0004,
        lngOffset: -0.0011,
        incidents30: 2,
        incidents90: 4,
        lux: 32,
        pedestrianRating: 'medium',
      },
      {
        idSuffix: 'deck-secure',
        name: `${street} Multi-Level Deck`,
        address: `${Math.floor(Math.abs(lng * 100) % 800) + 200} ${street}, San Francisco, CA`,
        type: 'multi_level_deck',
        surveillance: 'monitored_cctv_24_7',
        barrier: true,
        attendant: true,
        emergencyBoxes: true,
        hourlyRate: 5.00,
        totalSpaces: 110,
        availableSpaces: 19,
        latOffset: 0.0012,
        lngOffset: -0.0008,
        incidents30: 0,
        incidents90: 2,
        lux: 60,
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
        hourlyRate: 3.00,
        totalSpaces: 20,
        availableSpaces: 7,
        latOffset: -0.0009,
        lngOffset: 0.0012,
        incidents30: 1,
        incidents90: 2,
        lux: 55,
        pedestrianRating: 'high',
      },
      {
        idSuffix: 'lot-attended',
        name: `${neighborhood} Surface Lot`,
        address: `${crossStreet2} & ${crossStreet}, San Francisco, CA`,
        type: 'gated_surface_lot',
        surveillance: 'unmonitored_recording_cctv',
        barrier: true,
        attendant: true,
        emergencyBoxes: false,
        hourlyRate: 4.00,
        totalSpaces: 55,
        availableSpaces: 12,
        latOffset: -0.0013,
        lngOffset: -0.0006,
        incidents30: 1,
        incidents90: 3,
        lux: 48,
        pedestrianRating: 'medium',
      },
    ];

    return spotTemplates.map((template, index) => {
      const spotLat = Number((lat + template.latOffset).toFixed(5));
      const spotLng = Number((lng + template.lngOffset).toFixed(5));
      const spotId = `spot-${baseId}-${template.idSuffix}`;

      const crimeData = {
        incidentsLast30Days: template.incidents30,
        incidentsLast90Days: template.incidents90,
        smashAndGrabCount: template.incidents30 > 0 ? 1 : 0,
        catalyticConverterCount: template.incidents90 > 3 ? 1 : 0,
        incidentDensityPerSqKm: template.incidents90 * 0.8,
        recentIncidents: [],
      };

      const lighting = {
        ambientLuxLevel: isDaytime ? 95 : template.lux,
        isDaytime,
        sunElevationAngleDegrees: isDaytime ? 45 : -18,
        coverageIndexPercentage: isDaytime ? 100 : Math.min(98, template.lux * 1.5),
        blindSpotDetected: template.lux < 35,
        municipalSmartLamps: [
          {
            id: `lamp-${spotId}-1`,
            lampType: 'smart_led' as const,
            luxOutput: isDaytime ? 95 : template.lux,
            status: 'active' as const,
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
        clearSightlines: template.lux >= 40,
      };

      const csi = CsiEngine.calculate(
        spotId,
        crimeData,
        lighting,
        infrastructure,
        []
      );

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

  private static parseCoordinatesOrName(lat: number, lng: number, name?: string) {
    if (name) {
      const parsed = this.parseAddressComponents(name, '');
      if (parsed.street !== 'Municipal Corridor') {
        return parsed;
      }
    }

    // Heuristic Geographic District & Street Resolver for San Francisco
    let neighborhood = 'San Francisco';
    let street = 'Market St';
    let crossStreet = '4th St';
    let crossStreet2 = 'Mission St';

    if (lat > 37.795 && lng > -122.415) {
      neighborhood = 'North Beach';
      street = 'Vallejo St';
      crossStreet = 'Columbus Ave';
      crossStreet2 = 'Green St';
    } else if (lat > 37.790 && lng > -122.405) {
      neighborhood = 'Financial District';
      street = 'California St';
      crossStreet = 'Montgomery St';
      crossStreet2 = 'Pine St';
    } else if (lat > 37.795 && lng <= -122.415) {
      neighborhood = 'Marina';
      street = 'Chestnut St';
      crossStreet = 'Fillmore St';
      crossStreet2 = 'Lombard St';
    } else if (lat >= 37.770 && lat <= 37.790 && lng > -122.415) {
      neighborhood = 'SoMa';
      street = 'Howard St';
      crossStreet = '3rd St';
      crossStreet2 = 'Folsom St';
    } else if (lat < 37.770 && lng > -122.430) {
      neighborhood = 'Mission';
      street = 'Valencia St';
      crossStreet = '16th St';
      crossStreet2 = 'Mission St';
    } else if (lng <= -122.450 && lat < 37.770) {
      neighborhood = 'Sunset';
      street = 'Irving St';
      crossStreet = '19th Ave';
      crossStreet2 = 'Judah St';
    } else if (lng <= -122.450 && lat >= 37.770) {
      neighborhood = 'Richmond';
      street = 'Clement St';
      crossStreet = '8th Ave';
      crossStreet2 = 'Geary Blvd';
    } else {
      neighborhood = 'Civic Center';
      street = 'Van Ness Ave';
      crossStreet = 'McAllister St';
      crossStreet2 = 'Golden Gate Ave';
    }

    return { street, crossStreet, crossStreet2, neighborhood };
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
      'Pine', 'Clay', 'Sacramento', 'Washington', 'Jackson', 'Pacific'
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

    const sfNeighborhoods = [
      'North Beach', 'Chinatown', 'Financial District', 'SoMa', 'Mission',
      'Marina', 'Pacific Heights', 'Russian Hill', 'Nob Hill', 'Hayes Valley',
      'Castro', 'Sunset', 'Richmond', 'Presidio', 'Embarcadero', 'Civic Center',
      'Tenderloin', 'Potrero Hill', 'Dogpatch', 'Mission Bay', 'Twin Peaks'
    ];

    let foundNeighborhood = '';
    for (const nh of sfNeighborhoods) {
      const regex = new RegExp(`\\b${nh}\\b`, 'i');
      if (regex.test(combined)) {
        foundNeighborhood = nh;
        break;
      }
    }

    const street = foundStreet || (name.length > 2 && !name.includes('http') ? `${name.split(',')[0].trim()} St` : 'Municipal Corridor');
    const neighborhood = foundNeighborhood || 'San Francisco';

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
    }

    return { street, crossStreet, crossStreet2, neighborhood };
  }
}
