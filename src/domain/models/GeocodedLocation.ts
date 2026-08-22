export type PlaceType = 'address' | 'intersection' | 'poi' | 'neighborhood' | 'facility';

export interface GeocodedLocation {
  id: string;
  name: string;
  formattedAddress: string;
  streetNumber?: string;
  streetName?: string;
  crossStreet?: string;
  neighborhood?: string;
  city: string;
  state: string;
  postalCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeType: PlaceType;
  confidence: number; // 0.0 - 1.0
  source: 'nominatim' | 'cache' | 'fallback';
}

export interface GeocodingBoundingBox {
  minLon: number;
  maxLat: number;
  maxLon: number;
  minLat: number;
}

export const SAN_FRANCISCO_VIEWBOX: GeocodingBoundingBox = {
  minLon: -122.5200,
  maxLat: 37.8400,
  maxLon: -122.3500,
  minLat: 37.7000,
};
