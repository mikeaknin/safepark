/**
 * SafePark Zero-Dependency Local Neighborhood Geocoding Service
 * Ultra-fast (<5ms) client-side index for San Francisco and Los Angeles
 * providing instant autocomplete, coordinates, and camera panning.
 */

export interface NeighborhoodItem {
  id: string;
  name: string;
  city: 'sf' | 'la';
  lat: number;
  lng: number;
  description: string;
  aliases?: string[];
}

export const SF_NEIGHBORHOODS: NeighborhoodItem[] = [
  {
    id: 'sf-downtown',
    name: 'Downtown',
    city: 'sf',
    lat: 37.7879,
    lng: -122.4075,
    description: 'Union Square, Market St & Shopping District',
    aliases: ['Union Square', 'Market', 'Mid-Market', 'Central'],
  },
  {
    id: 'sf-soma',
    name: 'SoMa',
    city: 'sf',
    lat: 37.7785,
    lng: -122.4056,
    description: 'South of Market, Howard St & Moscone Center',
    aliases: ['South of Market', 'Moscone', 'Yerba Buena', 'Folsom'],
  },
  {
    id: 'sf-mission',
    name: 'Mission',
    city: 'sf',
    lat: 37.7599,
    lng: -122.4148,
    description: 'Valencia Corridor, 16th/24th St & Mission Dolores',
    aliases: ['Mission District', 'Valencia', 'Dolores Park', '24th St'],
  },
  {
    id: 'sf-castro',
    name: 'Castro',
    city: 'sf',
    lat: 37.7609,
    lng: -122.4350,
    description: 'Castro St & Upper Market Historic District',
    aliases: ['Upper Market', 'The Castro', '18th & Castro'],
  },
  {
    id: 'sf-marina',
    name: 'Marina',
    city: 'sf',
    lat: 37.8037,
    lng: -122.4368,
    description: 'Chestnut St corridor, Marina Green & Palace of Fine Arts',
    aliases: ['Marina District', 'Chestnut', 'Marina Green'],
  },
  {
    id: 'sf-north-beach',
    name: 'North Beach',
    city: 'sf',
    lat: 37.8005,
    lng: -122.4102,
    description: 'Little Italy, Columbus Ave & Washington Square',
    aliases: ['Little Italy', 'Columbus', 'Telegraph Hill', 'Broadway'],
  },
  {
    id: 'sf-chinatown',
    name: 'Chinatown',
    city: 'sf',
    lat: 37.7941,
    lng: -122.4078,
    description: 'Grant Ave, Stockton St & Dragon Gate',
    aliases: ['Grant Ave', 'Stockton', 'Portsmouth Square'],
  },
  {
    id: 'sf-pac-heights',
    name: 'Pacific Heights',
    city: 'sf',
    lat: 37.7925,
    lng: -122.4382,
    description: 'Fillmore St shopping, Alta Plaza & Lafayette Park',
    aliases: ['Pac Heights', 'Fillmore', 'Alta Plaza'],
  },
  {
    id: 'sf-haight',
    name: 'Haight-Ashbury',
    city: 'sf',
    lat: 37.7699,
    lng: -122.4469,
    description: 'Upper Haight, Buena Vista Park & Golden Gate East',
    aliases: ['Haight', 'The Haight', 'Upper Haight', 'Cole Valley'],
  },
  {
    id: 'sf-richmond',
    name: 'Richmond',
    city: 'sf',
    lat: 37.7780,
    lng: -122.4780,
    description: 'Clement St dining, Geary Blvd & Outer Richmond',
    aliases: ['Inner Richmond', 'Outer Richmond', 'Clement', 'Geary'],
  },
  {
    id: 'sf-sunset',
    name: 'Sunset',
    city: 'sf',
    lat: 37.7540,
    lng: -122.4800,
    description: 'Inner Sunset, Irving St dining & 9th Ave corridor',
    aliases: ['Inner Sunset', 'Outer Sunset', 'Irving', 'Noriega'],
  },
  {
    id: 'sf-fidi',
    name: 'Financial District',
    city: 'sf',
    lat: 37.7946,
    lng: -122.4000,
    description: 'FiDi, California St Cable Car & Montgomery St',
    aliases: ['FiDi', 'Montgomery', 'California St', 'Battery'],
  },
  {
    id: 'sf-wharf',
    name: "Fisherman's Wharf",
    city: 'sf',
    lat: 37.8080,
    lng: -122.4177,
    description: 'Pier 39, Ghirardelli Square & Cannery Row',
    aliases: ['Pier 39', 'Ghirardelli', 'Aquatic Park', 'The Wharf'],
  },
  {
    id: 'sf-civic-center',
    name: 'Civic Center',
    city: 'sf',
    lat: 37.7793,
    lng: -122.4192,
    description: 'City Hall, SF Symphony, Opera & Van Ness corridor',
    aliases: ['City Hall', 'Opera House', 'Davies Symphony', 'Van Ness'],
  },
  {
    id: 'sf-potrero',
    name: 'Potrero Hill',
    city: 'sf',
    lat: 37.7595,
    lng: -122.3995,
    description: '18th St shopping corridor & skyline vistas',
    aliases: ['Potrero', '18th St', 'Connecticut St'],
  },
  {
    id: 'sf-dogpatch',
    name: 'Dogpatch',
    city: 'sf',
    lat: 37.7580,
    lng: -122.3880,
    description: '3rd St industrial-arts corridor, Crane Cove & Pier 70',
    aliases: ['3rd St', 'Crane Cove', 'Pier 70'],
  },
];

export const LA_NEIGHBORHOODS: NeighborhoodItem[] = [
  {
    id: 'la-dtla',
    name: 'Downtown (DTLA)',
    city: 'la',
    lat: 34.0407,
    lng: -118.2468,
    description: 'Historic Core, Grand Central Market, Crypto.com Arena',
    aliases: ['DTLA', 'Downtown LA', 'Bunker Hill', 'South Park', 'LA Live'],
  },
  {
    id: 'la-hollywood',
    name: 'Hollywood',
    city: 'la',
    lat: 34.1016,
    lng: -118.3268,
    description: 'Hollywood Blvd, Walk of Fame & TCL Chinese Theatre',
    aliases: ['Hollywood Blvd', 'Walk of Fame', 'Sunset & Vine'],
  },
  {
    id: 'la-weho',
    name: 'West Hollywood',
    city: 'la',
    lat: 34.0900,
    lng: -118.3617,
    description: 'Santa Monica Blvd, Sunset Strip & Pacific Design Center',
    aliases: ['WeHo', 'Sunset Strip', 'Santa Monica Blvd'],
  },
  {
    id: 'la-santa-monica',
    name: 'Santa Monica',
    city: 'la',
    lat: 34.0195,
    lng: -118.4912,
    description: 'Santa Monica Pier, Ocean Ave & 3rd St Promenade',
    aliases: ['Ocean Ave', '3rd Street Promenade', 'Santa Monica Beach'],
  },
  {
    id: 'la-venice',
    name: 'Venice Beach',
    city: 'la',
    lat: 33.9850,
    lng: -118.4695,
    description: 'Abbot Kinney Blvd, Venice Boardwalk & Canals',
    aliases: ['Venice', 'Abbot Kinney', 'Venice Boardwalk', 'Venice Canals'],
  },
  {
    id: 'la-beverly-hills',
    name: 'Beverly Hills',
    city: 'la',
    lat: 34.0736,
    lng: -118.4004,
    description: 'Rodeo Drive, Golden Triangle & Wilshire Blvd',
    aliases: ['Rodeo Dr', 'Golden Triangle', 'Wilshire'],
  },
  {
    id: 'la-silver-lake',
    name: 'Silver Lake',
    city: 'la',
    lat: 34.0869,
    lng: -118.2702,
    description: 'Sunset Junction, Silver Lake Reservoir & indie dining',
    aliases: ['Sunset Junction', 'Silver Lake Reservoir'],
  },
  {
    id: 'la-echo-park',
    name: 'Echo Park',
    city: 'la',
    lat: 34.0782,
    lng: -118.2606,
    description: 'Echo Park Lake, Dodger Stadium access & Sunset Blvd',
    aliases: ['Echo Park Lake', 'Dodger Stadium'],
  },
  {
    id: 'la-koreatown',
    name: 'Koreatown',
    city: 'la',
    lat: 34.0619,
    lng: -118.3000,
    description: 'Wilshire Center, 6th St & 24/7 dining hubs',
    aliases: ['K-Town', 'Wilshire Center', 'Olympic Blvd'],
  },
  {
    id: 'la-westwood',
    name: 'Westwood',
    city: 'la',
    lat: 34.0635,
    lng: -118.4455,
    description: 'Westwood Village, UCLA & Wilshire Theater corridor',
    aliases: ['Westwood Village', 'UCLA', 'Hammer Museum'],
  },
  {
    id: 'la-culver-city',
    name: 'Culver City',
    city: 'la',
    lat: 34.0211,
    lng: -118.3965,
    description: 'Downtown Culver City, Culver Steps & Helms Bakery District',
    aliases: ['Downtown Culver', 'Culver Steps', 'Sony Studios'],
  },
  {
    id: 'la-arts-district',
    name: 'Arts District',
    city: 'la',
    lat: 34.0436,
    lng: -118.2322,
    description: 'Traction Ave, 3rd St gallery hub & Hauser & Wirth',
    aliases: ['DTLA Arts District', 'Traction Ave', 'Little Tokyo adjacent'],
  },
  {
    id: 'la-century-city',
    name: 'Century City',
    city: 'la',
    lat: 34.0577,
    lng: -118.4187,
    description: 'Westfield Century City, Constellation Blvd & Fox Studios',
    aliases: ['Westfield Century City', 'Constellation', 'Avenue of the Stars'],
  },
  {
    id: 'la-los-feliz',
    name: 'Los Feliz',
    city: 'la',
    lat: 34.1042,
    lng: -118.2933,
    description: 'Vermont Ave, Hillhurst Ave & Griffith Observatory base',
    aliases: ['Hillhurst', 'Vermont', 'Griffith Park'],
  },
];

export class GeocodingService {
  /**
   * Search local zero-dependency neighborhood index for SF and LA.
   * Returns matches in <5ms without network dependencies.
   */
  public static searchNeighborhoods(
    query: string,
    city: 'sf' | 'la' = 'sf'
  ): NeighborhoodItem[] {
    const trimmed = (query || '').trim().toLowerCase();
    const list = city === 'sf' ? SF_NEIGHBORHOODS : LA_NEIGHBORHOODS;

    if (!trimmed) {
      return list.slice(0, 8);
    }

    return list.filter((item) => {
      if (item.name.toLowerCase().includes(trimmed)) return true;
      if (item.description.toLowerCase().includes(trimmed)) return true;
      if (item.aliases?.some((a) => a.toLowerCase().includes(trimmed))) return true;
      return false;
    });
  }

  /**
   * Get single neighborhood by ID
   */
  public static getNeighborhoodById(id: string): NeighborhoodItem | undefined {
    return [...SF_NEIGHBORHOODS, ...LA_NEIGHBORHOODS].find((n) => n.id === id);
  }
}
