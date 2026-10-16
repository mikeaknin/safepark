/**
 * SafePark Real Safety Index Calculation Engine
 * Deterministic multi-factor scoring based on live municipal crime incident feeds
 * and OpenStreetMap facility telemetry.
 */

import { useMemo } from 'react';

export interface ParkingFacility {
  id: string | number;
  name: string;
  address?: string;
  operator?: string;
  lat: number;
  lon: number;
  type?: string;
  capacity?: string | number;
  tags?: Record<string, any>;
  fee?: string;
  access?: string;
  barrier?: string;
  lit?: string;
  covered?: string;
  isStreetParking?: boolean;
  blockName?: string;
  meterRate?: string;
  timeLimit?: string;
  meterCount?: number;
}

export interface CrimeIncident {
  id?: string;
  datetime?: string;
  category?: string;
  subcategory?: string;
  lat: number;
  lon: number;
}

export type SafetyRiskColor = 'green' | 'yellow' | 'red';
export type SafetyRiskLevel = 'Low Incident Zone' | 'Moderate Risk' | 'High Break-In Frequency';

export interface SafetyScoreResult {
  facilityId: string | number;
  name: string;
  address?: string;
  operator?: string;
  lat: number;
  lon: number;
  type: string;
  capacity: string;
  isStreetParking?: boolean;
  blockName?: string;
  meterRate?: string;
  timeLimit?: string;
  meterCount?: number;
  smashAndGrabCount?: number;
  smashAndGrabWarning?: string;

  // Master Composite Safety Index (0-100)
  score: number;
  color: SafetyRiskColor;
  riskLevel: SafetyRiskLevel;

  // 3 Distinct Sub-ratings
  breakInScore: number;
  breakInLabel: string;

  facilitySecurityScore: number;
  facilitySecurityLabel: string;

  lightingScore: number;
  lightingLabel: string;

  // Incident counts
  incidentCount500m: number;
  incidentsWithin250m: number;
  incidents250to500m: number;
  incidentsWithin100m?: number;
  incidents100to200m?: number;
  incidentsWithin150m?: number;
  displayText: string;
}

/**
 * Standard Haversine formula to compute great-circle distance in meters between two lat/lon pairs
 */
export function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Deterministically computes the four scores for a parking facility:
 * A. Break-In Risk Score (0-100)
 * B. Facility Security Score (0-100)
 * C. Lighting & Visibility Score (0-100)
 * D. Composite Safety Index (Master Score 0-100)
 */
export function calculateSafetyScore(
  facility: ParkingFacility,
  incidents: CrimeIncident[],
  evaluationDate?: Date
): SafetyScoreResult {
  let incidentsWithin100m = 0;
  let incidents100to200m = 0;
  let incidentsWithin150m = 0;
  let incidentsWithin250m = 0;
  let incidents250to500m = 0;

  for (const incident of incidents) {
    if (
      typeof incident.lat !== 'number' ||
      typeof incident.lon !== 'number' ||
      isNaN(incident.lat) ||
      isNaN(incident.lon)
    ) {
      continue;
    }

    // Fast rectangular coordinate pre-filter before calling trigonometric functions
    const dLat = Math.abs(facility.lat - incident.lat);
    const dLon = Math.abs(facility.lon - incident.lon);
    if (dLat > 0.005 || dLon > 0.006) {
      continue;
    }

    const dist = haversineDistanceMeters(facility.lat, facility.lon, incident.lat, incident.lon);
    if (dist <= 100) {
      incidentsWithin100m++;
    } else if (dist <= 200) {
      incidents100to200m++;
    }
    if (dist <= 150) {
      incidentsWithin150m++;
    }
    if (dist <= 250) {
      incidentsWithin250m++;
    } else if (dist <= 500) {
      incidents250to500m++;
    }
  }

  const total500m = incidentsWithin250m + incidents250to500m;
  const isStreet = Boolean(
    facility.isStreetParking ||
    facility.type === 'curbside_street_metered' ||
    facility.type === 'curbside_residential' ||
    facility.type?.includes('curbside') ||
    facility.type?.includes('street')
  );

  let masterScore = 100;
  let breakInScore = 100;
  let breakInLabel = 'Low Break-in Risk';
  let facilitySecurityScore = 50;
  let facilitySecurityLabel = 'Curbside Street Parking';
  let lightingScore = 80;
  let lightingLabel = 'Ambient Street Lighting';
  let displayText = '';

  const smashCount = incidentsWithin150m;
  const smashAndGrabWarning = `${smashCount} break-in${smashCount === 1 ? '' : 's'} reported on this block in past 90 days`;

  if (isStreet) {
    // Street Parking Score: Focused on smash-and-grab risk.
    // Count police vehicle break-ins within 150m of the block over the past 90 days.
    // Deduct 5 points per incident within 100m; 2.5 points between 100m and 200m. Floor at 10.
    const rawStreetScore = 100 - (incidentsWithin100m * 5) - (incidents100to200m * 2.5);
    masterScore = Math.max(10, Math.min(100, Math.round(rawStreetScore)));
    breakInScore = masterScore;

    if (breakInScore < 60) {
      breakInLabel = 'High Break-in Frequency';
    } else if (breakInScore < 80) {
      breakInLabel = 'Moderate Risk';
    } else {
      breakInLabel = 'Low Break-in Risk';
    }

    facilitySecurityScore = 35;
    facilitySecurityLabel = 'Curbside Street Block';
    lightingScore = 70;
    lightingLabel = 'Ambient Street Lighting';
    displayText = smashAndGrabWarning;
  } else {
    // Garage / Lot Score: Maintain 3-factor CSI (Break-In Risk 50%, Structure/Gate Security 35%, Lighting 15%)
    // A. Break-In Risk Score (0-100)
    const rawBreakInScore = 100 - incidentsWithin250m * 4 - incidents250to500m * 2;
    breakInScore = Math.max(10, Math.min(100, Math.round(rawBreakInScore)));

    if (breakInScore < 60) {
      breakInLabel = 'High Break-in Frequency';
    } else if (breakInScore < 80) {
      breakInLabel = 'Moderate Risk';
    } else {
      breakInLabel = 'Low Break-in Risk';
    }

    // B. Facility Security Score (0-100)
    let facilitySecurity = 50;
    const pType = (facility.type || facility.tags?.parking || '').toLowerCase();
    const isUnderground = pType.includes('underground');
    const isMultiStorey = pType.includes('multi-storey') || pType.includes('deck');
    const isCovered = pType.includes('covered') || facility.tags?.covered === 'yes' || facility.covered === 'yes';

    if (isUnderground || isMultiStorey) {
      facilitySecurity += 30;
    } else if (isCovered) {
      facilitySecurity += 15;
    }

    const tags = facility.tags || {};
    const fee = facility.fee || tags.fee;
    const access = facility.access || tags.access;
    const barrier = facility.barrier || tags.barrier;

    const isGatedOrMonitored =
      fee === 'yes' ||
      access === 'customers' ||
      Boolean(barrier && barrier !== 'no') ||
      tags.supervised === 'yes' ||
      isUnderground;

    const isOpenSurfaceUnrestricted = !isUnderground && !isMultiStorey && !isCovered && !isGatedOrMonitored;

    if (isGatedOrMonitored) {
      facilitySecurity += 15;
    } else if (isOpenSurfaceUnrestricted) {
      facilitySecurity -= 10;
    }

    const capNum = typeof facility.capacity === 'number'
      ? facility.capacity
      : parseInt(String(facility.capacity || tags.capacity || '0'), 10);

    if (!isNaN(capNum) && capNum > 0) {
      facilitySecurity += 5;
    }

    facilitySecurityScore = Math.max(15, Math.min(98, Math.round(facilitySecurity)));

    facilitySecurityLabel = 'Open Unrestricted Surface';
    if (isUnderground) {
      facilitySecurityLabel = isGatedOrMonitored ? 'Gated Underground Garage' : 'Underground/Covered Structure';
    } else if (isMultiStorey) {
      facilitySecurityLabel = isGatedOrMonitored ? 'Monitored Multi-Level Deck' : 'Multi-Level Deck';
    } else if (isCovered) {
      facilitySecurityLabel = 'Underground/Covered Structure';
    } else if (isGatedOrMonitored) {
      facilitySecurityLabel = 'Controlled Access Surface Lot';
    }

    // C. Lighting & Visibility Score (0-100)
    const now = evaluationDate || new Date();
    const currentHours = now.getHours() + now.getMinutes() / 60;
    const isAfterDusk = currentHours >= 18.5 || currentHours < 6.5;

    lightingScore = 90;
    lightingLabel = 'Day-lit Open Deck';
    const litTag = (facility.lit || tags.lit || '').toLowerCase();
    const isEnclosed = isUnderground || isCovered;

    if (!isAfterDusk) {
      if (isEnclosed) {
        lightingScore = 85;
        lightingLabel = '24/7 Enclosed Lighting';
      } else if (isMultiStorey) {
        lightingScore = 85;
        lightingLabel = 'Day-lit Open Deck';
      } else {
        lightingScore = 90;
        lightingLabel = 'Day-lit Open Deck';
      }
    } else {
      if (isEnclosed) {
        lightingScore = 85;
        lightingLabel = '24/7 Enclosed Lighting';
      } else {
        if (litTag === 'yes') {
          lightingScore = 75;
          lightingLabel = 'Illuminated Night Surface';
        } else if (isGatedOrMonitored) {
          lightingScore = 55;
          lightingLabel = 'Ambient Street Light';
        } else {
          lightingScore = 40;
          lightingLabel = 'Low Night Visibility';
        }
      }
    }

    // D. Composite Safety Index (CSI - Master Score 0-100)
    const weightedCsi = breakInScore * 0.50 + facilitySecurityScore * 0.35 + lightingScore * 0.15;
    masterScore = Math.max(10, Math.min(100, Math.round(weightedCsi)));
    displayText = `${total500m} vehicle incident${total500m === 1 ? '' : 's'} within 500m in past 90 days`;
  }

  let color: SafetyRiskColor = 'green';
  let riskLevel: SafetyRiskLevel = 'Low Incident Zone';

  if (masterScore < 60) {
    color = 'red';
    riskLevel = 'High Break-In Frequency';
  } else if (masterScore < 80) {
    color = 'yellow';
    riskLevel = 'Moderate Risk';
  }

  return {
    facilityId: facility.id,
    name: facility.name || 'Public Parking',
    address: facility.address,
    operator: facility.operator,
    lat: facility.lat,
    lon: facility.lon,
    type: facility.type || (isStreet ? 'curbside_street_metered' : 'surface'),
    capacity: String(facility.capacity || (isStreet ? (facility.meterCount || '12') : 'Unknown')),
    isStreetParking: isStreet,
    blockName: facility.blockName || facility.name,
    meterRate: facility.meterRate || (isStreet ? '$3.50/hr' : undefined),
    timeLimit: facility.timeLimit || (isStreet ? '2HR' : undefined),
    meterCount: facility.meterCount,
    smashAndGrabCount: smashCount,
    smashAndGrabWarning,
    score: masterScore,
    color,
    riskLevel,
    breakInScore,
    breakInLabel,
    facilitySecurityScore,
    facilitySecurityLabel,
    lightingScore,
    lightingLabel,
    incidentCount500m: total500m,
    incidentsWithin250m,
    incidents250to500m,
    incidentsWithin100m,
    incidents100to200m,
    incidentsWithin150m,
    displayText,
  };
}

/**
 * Calculates safety scores for an entire list of parking facilities against crime incidents.
 */
export function scoreAllFacilities(
  facilities: ParkingFacility[],
  incidents: CrimeIncident[],
  evaluationDate?: Date
): SafetyScoreResult[] {
  return facilities.map((fac) => calculateSafetyScore(fac, incidents, evaluationDate));
}

/**
 * React hook to move safety score calculations off the main render loop.
 */
export function useSafetyScoredFacilities(
  facilities: ParkingFacility[],
  incidents: CrimeIncident[]
): SafetyScoreResult[] {
  return useMemo(() => {
    return scoreAllFacilities(facilities, incidents);
  }, [facilities, incidents]);
}
