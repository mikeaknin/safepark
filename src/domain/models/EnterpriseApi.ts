export interface ApiKeyRecord {
  id: string;
  name: string;
  keyMasked: string;
  createdAt: string;
  tier: 'Enterprise OEM' | 'Mobility Insurer' | 'Fleet Telematics';
  rateLimitPerMin: number;
  requestsTotal: number;
  active: boolean;
}

export interface EnterpriseBlockRiskPayload {
  blockId: string;
  geohash: string;
  neighborhood: string;
  coordinates: { lat: number; lng: number };
  csiScore: number;
  riskTier: 'LOW' | 'MODERATE' | 'HIGH';
  smashAndGrabIncidents30d: number;
  catalyticThefts30d: number;
  lightingLuxAverage: number;
  municipalSmartLampsActive: number;
  cctvSurveillanceTier: string;
  timestampUtc: string;
}
