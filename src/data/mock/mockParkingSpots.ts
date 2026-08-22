import { ParkingLocation } from '../../domain/models/ParkingLocation';
import { CsiEngine } from '../../domain/services/CsiEngine';
import { SafeWalkBackEngine } from '../../domain/services/SafeWalkBackEngine';

const rawSpotConfigs = [
  {
    id: 'spot-sf-001',
    name: 'Mission Bay Secure Underground Garage',
    address: '450 4th Street, San Francisco, CA',
    hourlyRate: 6.50,
    currency: '$',
    totalSpaces: 240,
    availableSpaces: 42,
    coordinates: { lat: 37.7812, lng: -122.4001 },
    crimeData: {
      incidentsLast30Days: 0,
      incidentsLast90Days: 1,
      smashAndGrabCount: 0,
      catalyticConverterCount: 0,
      incidentDensityPerSqKm: 0.8,
      recentIncidents: []
    },
    lighting: {
      ambientLuxLevel: 68,
      isDaytime: false,
      sunElevationAngleDegrees: -18,
      coverageIndexPercentage: 96,
      blindSpotDetected: false,
      municipalSmartLamps: [
        { id: 'lamp-101', lampType: 'smart_led' as const, luxOutput: 55, status: 'active' as const, distanceMeters: 4, poleHeightMeters: 4.5, motionActivated: true },
        { id: 'lamp-102', lampType: 'smart_led' as const, luxOutput: 55, status: 'active' as const, distanceMeters: 12, poleHeightMeters: 4.5, motionActivated: true }
      ]
    },
    infrastructure: {
      structureType: 'covered_underground_garage' as const,
      surveillance: 'monitored_cctv_24_7' as const,
      hasControlledAccessBarrier: true,
      hasActiveAttendantOrPatrol: true,
      hasEmergencyCallBoxes: true,
      pedestrianTrafficRating: 'high' as const,
      clearSightlines: true
    },
    activeHazards: []
  },
  {
    id: 'spot-sf-002',
    name: 'SOMA 5th St Gated Deck & Surface',
    address: '890 5th Street, San Francisco, CA',
    hourlyRate: 4.00,
    currency: '$',
    totalSpaces: 120,
    availableSpaces: 18,
    coordinates: { lat: 37.7785, lng: -122.4042 },
    crimeData: {
      incidentsLast30Days: 2,
      incidentsLast90Days: 6,
      smashAndGrabCount: 1,
      catalyticConverterCount: 1,
      incidentDensityPerSqKm: 4.2,
      recentIncidents: [
        {
          id: 'crm-201',
          category: 'smash_and_grab' as const,
          timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          distanceMeters: 65,
          severityWeight: 0.8,
          verifiedByPoliceReport: true,
          coordinates: { lat: 37.7789, lng: -122.4046 },
          blockDescription: 'Rear window shattered, laptop bag extracted'
        }
      ]
    },
    lighting: {
      ambientLuxLevel: 32,
      isDaytime: false,
      sunElevationAngleDegrees: -18,
      coverageIndexPercentage: 72,
      blindSpotDetected: false,
      municipalSmartLamps: [
        { id: 'lamp-201', lampType: 'high_pressure_sodium' as const, luxOutput: 30, status: 'active' as const, distanceMeters: 14, poleHeightMeters: 6.0, motionActivated: false }
      ]
    },
    infrastructure: {
      structureType: 'gated_surface_lot' as const,
      surveillance: 'unmonitored_recording_cctv' as const,
      hasControlledAccessBarrier: true,
      hasActiveAttendantOrPatrol: false,
      hasEmergencyCallBoxes: false,
      pedestrianTrafficRating: 'medium' as const,
      clearSightlines: true
    },
    activeHazards: [
      {
        id: 'hz-101',
        spotId: 'spot-sf-002',
        hazardType: 'broken_glass_pavement' as const,
        reportedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        confirmedByWitnessCount: 3,
        photoEvidenceVerified: true,
        notes: 'Pavement curb contains automotive tempered safety glass remnants',
        coordinates: { lat: 37.7785, lng: -122.4042 }
      }
    ]
  },
  {
    id: 'spot-sf-003',
    name: 'Alleyway Curbside Meter Zone',
    address: '142 Minna Alley, San Francisco, CA',
    hourlyRate: 2.25,
    currency: '$',
    totalSpaces: 12,
    availableSpaces: 3,
    coordinates: { lat: 37.7865, lng: -122.4012 },
    crimeData: {
      incidentsLast30Days: 8,
      incidentsLast90Days: 22,
      smashAndGrabCount: 5,
      catalyticConverterCount: 3,
      incidentDensityPerSqKm: 14.5,
      recentIncidents: [
        {
          id: 'crm-301',
          category: 'smash_and_grab' as const,
          timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
          distanceMeters: 12,
          severityWeight: 1.0,
          verifiedByPoliceReport: true,
          coordinates: { lat: 37.7866, lng: -122.4013 },
          blockDescription: 'Passenger window smash-and-grab'
        },
        {
          id: 'crm-302',
          category: 'catalytic_converter' as const,
          timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
          distanceMeters: 25,
          severityWeight: 0.9,
          verifiedByPoliceReport: true,
          coordinates: { lat: 37.7864, lng: -122.4011 },
          blockDescription: 'Exhaust saw-off theft on Toyota Prius'
        }
      ]
    },
    lighting: {
      ambientLuxLevel: 6,
      isDaytime: false,
      sunElevationAngleDegrees: -18,
      coverageIndexPercentage: 22,
      blindSpotDetected: true,
      municipalSmartLamps: [
        { id: 'lamp-301', lampType: 'decorative_low_lux' as const, luxOutput: 8, status: 'reported_out' as const, distanceMeters: 28, poleHeightMeters: 4.0, motionActivated: false }
      ]
    },
    infrastructure: {
      structureType: 'curbside_street_metered' as const,
      surveillance: 'none' as const,
      hasControlledAccessBarrier: false,
      hasActiveAttendantOrPatrol: false,
      hasEmergencyCallBoxes: false,
      pedestrianTrafficRating: 'isolated' as const,
      clearSightlines: false
    },
    activeHazards: [
      {
        id: 'hz-301',
        spotId: 'spot-sf-003',
        hazardType: 'broken_glass_pavement' as const,
        reportedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        confirmedByWitnessCount: 6,
        photoEvidenceVerified: true,
        notes: 'Multiple fresh break-in glass piles along curb',
        coordinates: { lat: 37.7865, lng: -122.4012 }
      },
      {
        id: 'hz-302',
        spotId: 'spot-sf-003',
        hazardType: 'failed_street_lamp' as const,
        reportedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        confirmedByWitnessCount: 2,
        photoEvidenceVerified: false,
        notes: 'Alley lamp fixture dark, 0 lux reaching stalls 3-6',
        coordinates: { lat: 37.7865, lng: -122.4012 }
      }
    ]
  },
  {
    id: 'spot-sf-004',
    name: 'Yerba Buena Center Garage',
    address: '772 Folsom Street, San Francisco, CA',
    hourlyRate: 5.50,
    currency: '$',
    totalSpaces: 450,
    availableSpaces: 110,
    coordinates: { lat: 37.7834, lng: -122.4031 },
    crimeData: {
      incidentsLast30Days: 1,
      incidentsLast90Days: 3,
      smashAndGrabCount: 0,
      catalyticConverterCount: 0,
      incidentDensityPerSqKm: 1.1,
      recentIncidents: []
    },
    lighting: {
      ambientLuxLevel: 62,
      isDaytime: false,
      sunElevationAngleDegrees: -18,
      coverageIndexPercentage: 94,
      blindSpotDetected: false,
      municipalSmartLamps: [
        { id: 'lamp-401', lampType: 'smart_led' as const, luxOutput: 50, status: 'active' as const, distanceMeters: 6, poleHeightMeters: 5.0, motionActivated: true }
      ]
    },
    infrastructure: {
      structureType: 'multi_level_deck' as const,
      surveillance: 'monitored_cctv_24_7' as const,
      hasControlledAccessBarrier: true,
      hasActiveAttendantOrPatrol: true,
      hasEmergencyCallBoxes: true,
      pedestrianTrafficRating: 'high' as const,
      clearSightlines: true
    },
    activeHazards: []
  }
];

export const MOCK_PARKING_LOCATIONS: ParkingLocation[] = rawSpotConfigs.map(spot => {
  const csi = CsiEngine.calculate(
    spot.id,
    spot.crimeData,
    spot.lighting,
    spot.infrastructure,
    spot.activeHazards
  );

  const walkingRoutes = [
    SafeWalkBackEngine.calculateWalkingRoutes(spot.id, spot.name).illuminatedRoute,
    SafeWalkBackEngine.calculateWalkingRoutes(spot.id, spot.name).directRoute
  ];

  return {
    ...spot,
    csi,
    walkingRoutes,
  };
});
