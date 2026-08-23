export interface NeighborhoodBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface NeighborhoodSafetyProfile {
  id: string;
  name: string;
  aliases: string[];
  centroid: { lat: number; lng: number };
  bounds: NeighborhoodBounds;
  baseCsiMin: number;
  baseCsiMax: number;
  typicalLuxLevel: number;
  incidentRatePerSqKm: number;
  smashAndGrabRisk: 'low' | 'moderate' | 'elevated' | 'high';
  primaryStreets: string[];
  crossStreets: string[];
  garageNamePrefixes: string[];
  notes: string;
}

export const SF_NEIGHBORHOOD_SAFETY_PROFILES: NeighborhoodSafetyProfile[] = [
  {
    id: 'tenderloin',
    name: 'Tenderloin',
    aliases: ['Tenderloin', 'Little Saigon', 'Downtown West'],
    centroid: { lat: 37.7845, lng: -122.4140 },
    bounds: { minLat: 37.7810, maxLat: 37.7880, minLng: -122.4200, maxLng: -122.4080 },
    baseCsiMin: 35,
    baseCsiMax: 55,
    typicalLuxLevel: 32,
    incidentRatePerSqKm: 18.5,
    smashAndGrabRisk: 'high',
    primaryStreets: ['Eddy St', 'Ellis St', "O'Farrell St", 'Golden Gate Ave', 'Turk St'],
    crossStreets: ['Jones St', 'Leavenworth St', 'Taylor St', 'Hyde St', 'Larkin St'],
    garageNamePrefixes: ['Tenderloin Community', 'Ellis-O-Farrell', 'Larkin St Vault'],
    notes: 'High incident density corridor. Attended or gated parking strongly advised.',
  },
  {
    id: 'civic_center',
    name: 'Civic Center / Mid-Market',
    aliases: ['Civic Center', 'Mid-Market', 'UN Plaza', 'Van Ness Corridor'],
    centroid: { lat: 37.7785, lng: -122.4180 },
    bounds: { minLat: 37.7725, maxLat: 37.7815, minLng: -122.4245, maxLng: -122.4110 },
    baseCsiMin: 48,
    baseCsiMax: 66,
    typicalLuxLevel: 44,
    incidentRatePerSqKm: 12.2,
    smashAndGrabRisk: 'elevated',
    primaryStreets: ['Van Ness Ave', 'McAllister St', 'Grove St', 'Polk St', 'Market St'],
    crossStreets: ['8th St', '9th St', '10th St', 'Larkin St', 'Franklin St'],
    garageNamePrefixes: ['Civic Center Plaza Garage', 'Performing Arts Garage', 'Brooks Hall'],
    notes: 'Municipal corridor with active pedestrian transit and variable nighttime risk.',
  },
  {
    id: 'mission',
    name: 'Mission / Mission Dolores',
    aliases: ['Mission', 'Mission Dolores', 'Valencia Corridor', 'Calle 24'],
    centroid: { lat: 37.7590, lng: -122.4190 },
    bounds: { minLat: 37.7450, maxLat: 37.7690, minLng: -122.4300, maxLng: -122.4080 },
    baseCsiMin: 62,
    baseCsiMax: 79,
    typicalLuxLevel: 48,
    incidentRatePerSqKm: 7.8,
    smashAndGrabRisk: 'moderate',
    primaryStreets: ['Valencia St', 'Mission St', 'Guerrero St', 'Dolores St', 'Folsom St'],
    crossStreets: ['16th St', '18th St', '20th St', '24th St', 'Cesar Chavez St'],
    garageNamePrefixes: ['Mission & Bartlett Garage', 'Valencia Plaza', 'Dolores Park'],
    notes: 'Vibrant dining and retail corridor. Moderately lit residential avenues.',
  },
  {
    id: 'soma',
    name: 'SoMa / Design District',
    aliases: ['SoMa', 'South of Market', 'Design District', 'Rincon Hill', 'Showplace Square'],
    centroid: { lat: 37.7780, lng: -122.4030 },
    bounds: { minLat: 37.7670, maxLat: 37.7885, minLng: -122.4120, maxLng: -122.3880 },
    baseCsiMin: 68,
    baseCsiMax: 82,
    typicalLuxLevel: 58,
    incidentRatePerSqKm: 5.4,
    smashAndGrabRisk: 'moderate',
    primaryStreets: ['Howard St', 'Folsom St', 'Harrison St', 'Bryant St', 'Brannan St', 'King St'],
    crossStreets: ['2nd St', '3rd St', '4th St', '5th St', '6th St', '7th St'],
    garageNamePrefixes: ['Moscone Center Garage', '5th & Mission Garage', 'Hearst Parking Center', 'Townsend Auto-Park'],
    notes: 'Major convention, tech, and transit hub with heavy daytime commercial presence.',
  },
  {
    id: 'financial_district',
    name: 'Financial District / East Cut',
    aliases: ['Financial District', 'FiDi', 'East Cut', 'Transbay', 'Jackson Square'],
    centroid: { lat: 37.7920, lng: -122.3995 },
    bounds: { minLat: 37.7870, maxLat: 37.7990, minLng: -122.4060, maxLng: -122.3900 },
    baseCsiMin: 80,
    baseCsiMax: 89,
    typicalLuxLevel: 72,
    incidentRatePerSqKm: 2.8,
    smashAndGrabRisk: 'low',
    primaryStreets: ['California St', 'Montgomery St', 'Sansome St', 'Battery St', 'Pine St', 'Bush St', 'Mission St'],
    crossStreets: ['Kearny St', 'Front St', 'Davis St', 'Beale St', 'Fremont St'],
    garageNamePrefixes: ['Embarcadero Center Garage P1', 'Montgomery Center Garage', 'St. Marys Square', 'Transbay Security Garage'],
    notes: 'Dense corporate security infrastructure, 24/7 CCTV, and high-lux municipal smart LEDs.',
  },
  {
    id: 'north_beach',
    name: 'North Beach / Waterfront / Embarcadero',
    aliases: ['North Beach', 'Telegraph Hill', 'Waterfront', 'Embarcadero North', "Fisherman's Wharf"],
    centroid: { lat: 37.8005, lng: -122.4090 },
    bounds: { minLat: 37.7975, maxLat: 37.8120, minLng: -122.4190, maxLng: -122.3930 },
    baseCsiMin: 82,
    baseCsiMax: 91,
    typicalLuxLevel: 68,
    incidentRatePerSqKm: 2.4,
    smashAndGrabRisk: 'low',
    primaryStreets: ['Vallejo St', 'Columbus Ave', 'Green St', 'Union St', 'Filbert St', 'The Embarcadero'],
    crossStreets: ['Grant Ave', 'Stockton St', 'Powell St', 'Kearny St', 'Montgomery St'],
    garageNamePrefixes: ['Vallejo Street Garage', 'North Beach Center Deck', 'Pier 39 Secured Pavilion', 'Columbus Plaza Deck'],
    notes: 'Historic pedestrian-heavy dining corridor with consistent foot-traffic and municipal patrols.',
  },
  {
    id: 'richmond_sunset',
    name: 'Richmond / Sunset',
    aliases: ['Richmond', 'Sunset', 'Inner Richmond', 'Outer Richmond', 'Inner Sunset', 'Outer Sunset', 'Golden Gate Heights'],
    centroid: { lat: 37.7650, lng: -122.4800 },
    bounds: { minLat: 37.7250, maxLat: 37.7890, minLng: -122.5150, maxLng: -122.4490 },
    baseCsiMin: 88,
    baseCsiMax: 95,
    typicalLuxLevel: 64,
    incidentRatePerSqKm: 1.2,
    smashAndGrabRisk: 'low',
    primaryStreets: ['Clement St', 'Geary Blvd', 'California St', 'Irving St', 'Judah St', 'Noriega St', 'Taraval St'],
    crossStreets: ['6th Ave', '8th Ave', '19th Ave', '25th Ave', '30th Ave', 'Sunset Blvd'],
    garageNamePrefixes: ['Richmond Municipal Deck', 'Inner Sunset Vault', 'Geary Boulevard Garage'],
    notes: 'Peaceful residential and avenue shopping districts with high community vigilance.',
  },
  {
    id: 'pacific_heights',
    name: 'Pacific Heights / Presidio Heights',
    aliases: ['Pacific Heights', 'Presidio Heights', 'Lower Pacific Heights', 'Laurel Heights'],
    centroid: { lat: 37.7925, lng: -122.4350 },
    bounds: { minLat: 37.7840, maxLat: 37.7975, minLng: -122.4560, maxLng: -122.4180 },
    baseCsiMin: 90,
    baseCsiMax: 96,
    typicalLuxLevel: 75,
    incidentRatePerSqKm: 0.8,
    smashAndGrabRisk: 'low',
    primaryStreets: ['Broadway', 'Pacific Ave', 'Jackson St', 'Washington St', 'Clay St', 'Sacramento St', 'Fillmore St'],
    crossStreets: ['Webster St', 'Steiner St', 'Pierce St', 'Scott St', 'Divisadero St'],
    garageNamePrefixes: ['Fillmore Center Garage', 'Pacific Place Vault', 'Laurel Village Covered Deck'],
    notes: 'Extremely safe residential enclave with private security patrols and high natural surveillance.',
  },
  {
    id: 'marina_presidio',
    name: 'Marina / Cow Hollow / Presidio',
    aliases: ['Marina', 'Cow Hollow', 'Presidio', 'Fort Mason', 'Marina District'],
    centroid: { lat: 37.8020, lng: -122.4380 },
    bounds: { minLat: 37.7960, maxLat: 37.8110, minLng: -122.4800, maxLng: -122.4230 },
    baseCsiMin: 92,
    baseCsiMax: 98,
    typicalLuxLevel: 82,
    incidentRatePerSqKm: 0.4,
    smashAndGrabRisk: 'low',
    primaryStreets: ['Chestnut St', 'Lombard St', 'Union St', 'Marina Blvd', 'Bay St', 'Greenwich St'],
    crossStreets: ['Fillmore St', 'Steiner St', 'Pierce St', 'Scott St', 'Divisadero St', 'Baker St'],
    garageNamePrefixes: ['Chestnut Street Secured Garage', 'Marina Blvd Vault', 'Lombard Gate Deck', 'Union Street Pavilions'],
    notes: 'Top tier safety index in SF with continuous smart LED illumination and active waterfront patrols.',
  },
];

/**
 * Resolves the closest matching SF Neighborhood Safety Profile for any latitude & longitude coordinate.
 */
export function getSfNeighborhoodProfile(coords: { lat: number; lng: number }): NeighborhoodSafetyProfile {
  const { lat, lng } = coords;

  // 1. Strict bounding box inclusion check (prioritize specific sub-neighborhoods like Tenderloin/Civic Center first)
  for (const profile of SF_NEIGHBORHOOD_SAFETY_PROFILES) {
    if (
      lat >= profile.bounds.minLat &&
      lat <= profile.bounds.maxLat &&
      lng >= profile.bounds.minLng &&
      lng <= profile.bounds.maxLng
    ) {
      return profile;
    }
  }

  // 2. Fallback: Find nearest centroid by Euclidean distance
  let nearestProfile = SF_NEIGHBORHOOD_SAFETY_PROFILES[3]; // Default SoMa
  let minDistanceSq = Number.MAX_VALUE;

  for (const profile of SF_NEIGHBORHOOD_SAFETY_PROFILES) {
    const dLat = lat - profile.centroid.lat;
    const dLng = lng - profile.centroid.lng;
    const distSq = dLat * dLat + dLng * dLng;

    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      nearestProfile = profile;
    }
  }

  return nearestProfile;
}
