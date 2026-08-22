import { ParkingLocation } from '../models/ParkingLocation';
import { ParkingStructureType, SurveillanceTier } from '../models/Infrastructure';
import { CsiEngine } from './CsiEngine';
import { SafeWalkBackEngine } from './SafeWalkBackEngine';
import { SearchDestination } from '../../presentation/context/AppContext';

export class DynamicParkingGenerator {
  /**
   * Generates 6-8 authentic San Francisco parking locations (both Curbside/Metered and Garages)
   * within a 400-meter radius around any searched destination in SF.
   */
  public static generateSpotsAroundDestination(
    destination: SearchDestination,
    isDaytime: boolean = false
  ): ParkingLocation[] {
    const { lat, lng } = destination.coordinates;

    // Extract primary street and neighborhood heuristics
    const parsed = this.parseAddressComponents(destination.name, destination.address);
    const street = parsed.street || 'Municipal Corridor';
    const crossStreet = parsed.crossStreet || 'Cross St';
    const crossStreet2 = parsed.crossStreet2 || 'Avenue';
    const neighborhood = parsed.neighborhood || 'SF District';

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
        idSuffix: 'garage-main',
        name: `${neighborhood} Covered Parking Garage`,
        address: `${Math.floor(Math.random() * 800) + 100} ${street}, San Francisco, CA`,
        type: 'covered_underground_garage',
        surveillance: 'monitored_cctv_24_7',
        barrier: true,
        attendant: true,
        emergencyBoxes: true,
        hourlyRate: 6.00,
        totalSpaces: 180,
        availableSpaces: 34,
        latOffset: 0.0007, // ~75m North
        lngOffset: 0.0006,
        incidents30: 0,
        incidents90: 1,
        lux: 65,
        pedestrianRating: 'high',
      },
      {
        idSuffix: 'street-metered',
        name: `${street} Curbside Metered Stalls`,
        address: `${street} & ${crossStreet}, San Francisco, CA`,
        type: 'curbside_street_metered',
        surveillance: 'unmonitored_recording_cctv',
        barrier: false,
        attendant: false,
        emergencyBoxes: false,
        hourlyRate: 3.50,
        totalSpaces: 16,
        availableSpaces: 5,
        latOffset: -0.0004, // ~45m South
        lngOffset: 0.0003,
        incidents30: 1,
        incidents90: 3,
        lux: 44,
        pedestrianRating: 'high',
      },
      {
        idSuffix: 'deck-secure',
        name: `${street} Secure Multi-Level Deck`,
        address: `${Math.floor(Math.random() * 800) + 200} ${street}, San Francisco, CA`,
        type: 'multi_level_deck',
        surveillance: 'monitored_cctv_24_7',
        barrier: true,
        attendant: true,
        emergencyBoxes: true,
        hourlyRate: 5.50,
        totalSpaces: 120,
        availableSpaces: 22,
        latOffset: 0.0011, // ~120m North-East
        lngOffset: -0.0009,
        incidents30: 0,
        incidents90: 2,
        lux: 58,
        pedestrianRating: 'high',
      },
      {
        idSuffix: 'street-cross',
        name: `${crossStreet} On-Street 2-Hour Zone`,
        address: `${crossStreet} near ${street}, San Francisco, CA`,
        type: 'curbside_residential',
        surveillance: 'none',
        barrier: false,
        attendant: false,
        emergencyBoxes: false,
        hourlyRate: 0.00,
        totalSpaces: 12,
        availableSpaces: 3,
        latOffset: 0.0003,
        lngOffset: -0.0012, // ~130m West
        incidents30: 2,
        incidents90: 5,
        lux: 28,
        pedestrianRating: 'medium',
      },
      {
        idSuffix: 'lot-gated',
        name: `${neighborhood} Surface Attended Lot`,
        address: `${crossStreet2} & ${street}, San Francisco, CA`,
        type: 'gated_surface_lot',
        surveillance: 'unmonitored_recording_cctv',
        barrier: true,
        attendant: true,
        emergencyBoxes: false,
        hourlyRate: 4.50,
        totalSpaces: 65,
        availableSpaces: 14,
        latOffset: -0.0012, // ~140m South-West
        lngOffset: -0.0007,
        incidents30: 1,
        incidents90: 4,
        lux: 48,
        pedestrianRating: 'medium',
      },
      {
        idSuffix: 'street-express',
        name: `${crossStreet2} Smart Meter Stalls`,
        address: `${crossStreet2} Corridor, San Francisco, CA`,
        type: 'curbside_street_metered',
        surveillance: 'commercial_storefront_camera_overlap',
        barrier: false,
        attendant: false,
        emergencyBoxes: false,
        hourlyRate: 3.00,
        totalSpaces: 18,
        availableSpaces: 6,
        latOffset: -0.0008,
        lngOffset: 0.0014, // ~160m South-East
        incidents30: 1,
        incidents90: 2,
        lux: 52,
        pedestrianRating: 'high',
      },
    ];

    return spotTemplates.map((template, index) => {
      const spotLat = Number((lat + template.latOffset).toFixed(5));
      const spotLng = Number((lng + template.lngOffset).toFixed(5));
      const spotId = `spot-dyn-${destination.id.replace(/[^a-zA-Z0-9]/g, '')}-${index + 1}`;

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
        destination.name
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

  private static parseAddressComponents(name: string, address: string) {
    const combined = `${name} ${address}`;

    // Common SF Street and Neighborhood dictionary
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
    for (const s of sfStreets) {
      if (new RegExp(`\\b${s}\\b`, 'i').test(combined)) {
        foundStreet = `${s} St`;
        if (['The Embarcadero', 'Broadway', 'Columbus', 'Van Ness', 'Geary'].includes(s)) {
          foundStreet = s.includes('Embarcadero') ? 'The Embarcadero' : `${s} Ave`;
        }
        break;
      }
    }

    let neighborhood = 'Downtown SF';
    if (/vallejo|columbus|green|filbert|union|stockton|grant|north beach/i.test(combined)) {
      neighborhood = 'North Beach';
    } else if (/mission|valencia|guerrero|dolores|16th|24th/i.test(combined)) {
      neighborhood = 'Mission District';
    } else if (/van ness|polk|civic center|city hall|larkin/i.test(combined)) {
      neighborhood = 'Civic Center / Van Ness';
    } else if (/howard|folsom|4th|5th|3rd|2nd|moscone|soma|south of market/i.test(combined)) {
      neighborhood = 'SoMa';
    } else if (/post|sutter|powell|gear|union square/i.test(combined)) {
      neighborhood = 'Union Square';
    } else if (/embarcadero|ferry|pier|waterfront|front/i.test(combined)) {
      neighborhood = 'Embarcadero Waterfront';
    } else if (/oracle|chase|warriors|willie mays|mission bay/i.test(combined)) {
      neighborhood = 'Mission Bay';
    } else if (/fishermans wharf|wharf|ghirardelli|cannery/i.test(combined)) {
      neighborhood = "Fisherman's Wharf";
    } else if (/castro|market|18th/i.test(combined)) {
      neighborhood = 'The Castro';
    } else if (/haight|ashbury/i.test(combined)) {
      neighborhood = 'Haight-Ashbury';
    } else if (/hayes|octavia|fell|oak/i.test(combined)) {
      neighborhood = 'Hayes Valley';
    } else if (/marina|chestnut|lombard/i.test(combined)) {
      neighborhood = 'Marina District';
    }

    const crossStreetsMap: Record<string, [string, string]> = {
      'North Beach': ['Columbus Ave', 'Green St'],
      'Mission District': ['Valencia St', '16th St'],
      'Civic Center / Van Ness': ['Polk St', 'Golden Gate Ave'],
      'SoMa': ['4th St', 'Howard St'],
      'Union Square': ['Powell St', 'Geary St'],
      'Embarcadero Waterfront': ['Washington St', 'The Embarcadero'],
      'Mission Bay': ['3rd St', '16th St'],
      "Fisherman's Wharf": ['Jefferson St', 'Taylor St'],
      'The Castro': ['Castro St', '18th St'],
      'Haight-Ashbury': ['Ashbury St', 'Page St'],
      'Hayes Valley': ['Octavia St', 'Hayes St'],
      'Marina District': ['Chestnut St', 'Fillmore St'],
      'Downtown SF': ['Market St', '2nd St'],
    };

    const cross = crossStreetsMap[neighborhood] || ['Market St', 'Mission St'];

    return {
      street: foundStreet || `${neighborhood} Corridor`,
      neighborhood,
      crossStreet: cross[0],
      crossStreet2: cross[1],
    };
  }
}
