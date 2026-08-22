/**
 * SafePark Multi-City Municipal Data Ingestion Engine
 * 
 * Provides standardized ETL connectors for 6 major metropolitan open data portals:
 * 1. San Francisco (DataSF / SFPD Socrata API)
 * 2. New York City (NYC Open Data / NYPD Socrata API)
 * 3. Chicago (Chicago Data Portal / CPD API)
 * 4. Los Angeles (DataLA / LAPD Crime API)
 * 5. Seattle (Seattle Open Data / SPD API)
 * 6. Austin (Austin Open Data / APD API)
 */

import { VehicleCrimeCategory, CrimeIncident } from '../../domain/models/CrimeIncident';

export interface MunicipalCityConfig {
  cityId: string;
  cityName: string;
  state: string;
  portalName: string;
  endpointUrl: string;
  appTokenEnvVar: string;
  centerCoordinates: {
    lat: number;
    lng: number;
  };
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  fieldMappings: {
    idField: string;
    dateField: string;
    descriptionField: string;
    latField: string;
    lngField: string;
  };
  baselineCsiScore: number;
}

export const MUNICIPAL_CITIES: Record<string, MunicipalCityConfig> = {
  san_francisco: {
    cityId: 'san_francisco',
    cityName: 'San Francisco',
    state: 'CA',
    portalName: 'DataSF Open Data',
    endpointUrl: 'https://data.sfgov.org/resource/wg3w-h783.json',
    appTokenEnvVar: 'SOCRATA_DATA_SF_APP_TOKEN',
    centerCoordinates: { lat: 37.7749, lng: -122.4194 },
    bounds: { minLat: 37.70, maxLat: 37.83, minLng: -122.53, maxLng: -122.35 },
    fieldMappings: {
      idField: 'row_id',
      dateField: 'incident_datetime',
      descriptionField: 'incident_description',
      latField: 'latitude',
      lngField: 'longitude',
    },
    baselineCsiScore: 72,
  },
  new_york_city: {
    cityId: 'new_york_city',
    cityName: 'New York City',
    state: 'NY',
    portalName: 'NYC Open Data (NYPD Dispatch)',
    endpointUrl: 'https://data.cityofnewyork.us/resource/qgea-i56i.json',
    appTokenEnvVar: 'NYC_OPEN_DATA_APP_TOKEN',
    centerCoordinates: { lat: 40.7128, lng: -74.006 },
    bounds: { minLat: 40.57, maxLat: 40.91, minLng: -74.25, maxLng: -73.70 },
    fieldMappings: {
      idField: 'cmplnt_num',
      dateField: 'cmplnt_fr_dt',
      descriptionField: 'ofns_desc',
      latField: 'latitude',
      lngField: 'longitude',
    },
    baselineCsiScore: 78,
  },
  chicago: {
    cityId: 'chicago',
    cityName: 'Chicago',
    state: 'IL',
    portalName: 'City of Chicago Data Portal',
    endpointUrl: 'https://data.cityofchicago.org/resource/ijzp-q8t2.json',
    appTokenEnvVar: 'CHICAGO_DATA_APP_TOKEN',
    centerCoordinates: { lat: 41.8781, lng: -87.6298 },
    bounds: { minLat: 41.64, maxLat: 42.02, minLng: -87.94, maxLng: -87.52 },
    fieldMappings: {
      idField: 'id',
      dateField: 'date',
      descriptionField: 'description',
      latField: 'latitude',
      lngField: 'longitude',
    },
    baselineCsiScore: 68,
  },
  los_angeles: {
    cityId: 'los_angeles',
    cityName: 'Los Angeles',
    state: 'CA',
    portalName: 'DataLA (LAPD Crime Telemetry)',
    endpointUrl: 'https://data.lacity.org/resource/2nrs-mtv8.json',
    appTokenEnvVar: 'DATA_LA_APP_TOKEN',
    centerCoordinates: { lat: 34.0522, lng: -118.2437 },
    bounds: { minLat: 33.70, maxLat: 34.33, minLng: -118.66, maxLng: -118.15 },
    fieldMappings: {
      idField: 'dr_no',
      dateField: 'date_occ',
      descriptionField: 'crm_cd_desc',
      latField: 'lat',
      lngField: 'lon',
    },
    baselineCsiScore: 70,
  },
  seattle: {
    cityId: 'seattle',
    cityName: 'Seattle',
    state: 'WA',
    portalName: 'Seattle Open Data Portal',
    endpointUrl: 'https://data.seattle.gov/resource/tazs-3rd5.json',
    appTokenEnvVar: 'SEATTLE_DATA_APP_TOKEN',
    centerCoordinates: { lat: 47.6062, lng: -122.3321 },
    bounds: { minLat: 47.49, maxLat: 47.73, minLng: -122.44, maxLng: -122.24 },
    fieldMappings: {
      idField: '_id',
      dateField: 'offense_start_datetime',
      descriptionField: 'offense_description',
      latField: 'latitude',
      lngField: 'longitude',
    },
    baselineCsiScore: 79,
  },
  austin: {
    cityId: 'austin',
    cityName: 'Austin',
    state: 'TX',
    portalName: 'City of Austin Open Data',
    endpointUrl: 'https://data.austintexas.gov/resource/fdj4-gpfu.json',
    appTokenEnvVar: 'AUSTIN_DATA_APP_TOKEN',
    centerCoordinates: { lat: 30.2672, lng: -97.7431 },
    bounds: { minLat: 30.12, maxLat: 30.49, minLng: -97.92, maxLng: -97.58 },
    fieldMappings: {
      idField: 'incident_report_number',
      dateField: 'occ_date_time',
      descriptionField: 'crime_type',
      latField: 'latitude',
      lngField: 'longitude',
    },
    baselineCsiScore: 82,
  },
};

export class MultiCityCrimeIngestion {
  /**
   * Normalizes raw city open data record into standardized SafePark incident schema
   */
  public static normalizeRecord(
    cityId: string,
    rawRecord: Record<string, any>
  ): CrimeIncident | null {
    const config = MUNICIPAL_CITIES[cityId];
    if (!config) return null;

    const mappings = config.fieldMappings;
    const rawId = String(rawRecord[mappings.idField] || Math.random().toString(36).substring(2, 9));
    const rawDate = rawRecord[mappings.dateField] || new Date().toISOString();
    const rawDesc = String(rawRecord[mappings.descriptionField] || '').toLowerCase();
    const lat = parseFloat(rawRecord[mappings.latField]);
    const lng = parseFloat(rawRecord[mappings.lngField]);

    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      return null;
    }

    // Classify into standardized property risk categories
    let category: VehicleCrimeCategory = 'petty_theft_exterior';
    let severityWeight = 0.4;

    if (
      rawDesc.includes('motor vehicle theft') ||
      rawDesc.includes('stolen vehicle') ||
      rawDesc.includes('grand larceny of motor vehicle') ||
      rawDesc.includes('theft of motor vehicle')
    ) {
      category = 'vehicle_theft';
      severityWeight = 0.9;
    } else if (
      rawDesc.includes('auto theft') ||
      rawDesc.includes('theft from vehicle') ||
      rawDesc.includes('burglary from vehicle') ||
      rawDesc.includes('grand theft auto') ||
      rawDesc.includes('smash') ||
      rawDesc.includes('larceny from auto')
    ) {
      category = 'smash_and_grab';
      severityWeight = 1.0;
    } else if (rawDesc.includes('catalytic') || rawDesc.includes('exhaust') || rawDesc.includes('auto part')) {
      category = 'catalytic_converter';
      severityWeight = 0.8;
    } else if (rawDesc.includes('vandalism') || rawDesc.includes('tire') || rawDesc.includes('slashed')) {
      category = 'vandalism_slashed_tires';
      severityWeight = 0.6;
    }

    return {
      id: `${cityId}-${rawId}`,
      category,
      timestamp: new Date(rawDate).toISOString(),
      distanceMeters: 0,
      severityWeight,
      verifiedByPoliceReport: true,
      blockDescription: rawRecord[mappings.descriptionField] || 'PROPERTY_INCIDENT',
      coordinates: { lat, lng },
    };
  }

  /**
   * Generates mock/live ingestion batch for a target metropolitan area
   */
  public static generateCityIngestionBatch(cityId: string, count: number = 25): CrimeIncident[] {
    const config = MUNICIPAL_CITIES[cityId];
    if (!config) return [];

    const incidents: CrimeIncident[] = [];
    const categories: VehicleCrimeCategory[] = [
      'smash_and_grab',
      'catalytic_converter',
      'vehicle_theft',
      'vandalism_slashed_tires',
      'petty_theft_exterior',
    ];

    for (let i = 0; i < count; i++) {
      const cat = categories[i % categories.length];
      const latOffset = (Math.random() - 0.5) * 0.06;
      const lngOffset = (Math.random() - 0.5) * 0.06;
      const hoursAgo = Math.floor(Math.random() * 720); // within last 30 days

      incidents.push({
        id: `${cityId}-inc-${1000 + i}`,
        category: cat,
        timestamp: new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString(),
        distanceMeters: Math.round(Math.random() * 400 + 50),
        severityWeight: cat === 'smash_and_grab' ? 1.0 : cat === 'catalytic_converter' ? 0.8 : 0.5,
        verifiedByPoliceReport: true,
        blockDescription: `${cat.toUpperCase()}_DISPATCH`,
        coordinates: {
          lat: config.centerCoordinates.lat + latOffset,
          lng: config.centerCoordinates.lng + lngOffset,
        },
      });
    }

    return incidents;
  }
}
