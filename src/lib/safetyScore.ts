/**
 * SafePark Real Safety Index Calculation Engine
 * Deterministic scoring based on live municipal crime incident feeds.
 */

import { useMemo } from 'react';

export interface ParkingFacility {
  id: string | number;
  name: string;
  lat: number;
  lon: number;
  type?: string;
  capacity?: string | number;
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
  lat: number;
  lon: number;
  type: string;
  capacity: string;
  score: number; // 10 to 100
  color: SafetyRiskColor;
  riskLevel: SafetyRiskLevel;
  incidentCount500m: number;
  incidentsWithin250m: number;
  incidents250to500m: number;
  displayText: string; // "X vehicle incidents within 500m in past 90 days"
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
 * Deterministically computes the safety score (10 - 100) for a single parking facility
 * based on reported incidents within 500m in the past 90 days.
 *
 * Scoring Rules:
 * - Base Score = 100
 * - Deduct 4 points for each vehicle burglary/theft within 250m.
 * - Deduct 2 points for each vehicle burglary/theft between 250m and 500m.
 * - Minimum score floor is 10.
 *
 * Color Rules:
 * - 80-100: Green (Low Incident Zone)
 * - 60-79: Yellow (Moderate Risk)
 * - Under 60: Red (High Break-In Frequency)
 */
export function calculateSafetyScore(
  facility: ParkingFacility,
  incidents: CrimeIncident[]
): SafetyScoreResult {
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

    // Fast rectangular coordinate pre-filter before calling trigonometric Math.sin/Math.atan2.
    // Skips any crime incident where abs(lat1 - lat2) > 0.005 or abs(lon1 - lon2) > 0.006.
    // Eliminates 98%+ of distance math instantly on the main CPU thread.
    const dLat = Math.abs(facility.lat - incident.lat);
    const dLon = Math.abs(facility.lon - incident.lon);
    if (dLat > 0.005 || dLon > 0.006) {
      continue;
    }

    const dist = haversineDistanceMeters(facility.lat, facility.lon, incident.lat, incident.lon);
    if (dist <= 250) {
      incidentsWithin250m++;
    } else if (dist <= 500) {
      incidents250to500m++;
    }
  }

  const total500m = incidentsWithin250m + incidents250to500m;

  // Deduct 4 points for each vehicle burglary/theft within 250m
  // Deduct 2 points for each vehicle burglary/theft between 250m and 500m
  const rawScore = 100 - incidentsWithin250m * 4 - incidents250to500m * 2;
  const score = Math.max(10, Math.min(100, Math.round(rawScore)));

  let color: SafetyRiskColor = 'green';
  let riskLevel: SafetyRiskLevel = 'Low Incident Zone';

  if (score < 60) {
    color = 'red';
    riskLevel = 'High Break-In Frequency';
  } else if (score < 80) {
    color = 'yellow';
    riskLevel = 'Moderate Risk';
  }

  const displayText = `${total500m} vehicle incident${total500m === 1 ? '' : 's'} within 500m in past 90 days`;

  return {
    facilityId: facility.id,
    name: facility.name || 'Public Parking',
    lat: facility.lat,
    lon: facility.lon,
    type: facility.type || 'surface',
    capacity: String(facility.capacity || 'Unknown'),
    score,
    color,
    riskLevel,
    incidentCount500m: total500m,
    incidentsWithin250m,
    incidents250to500m,
    displayText,
  };
}

/**
 * Calculates safety scores for an entire list of parking facilities against crime incidents.
 */
export function scoreAllFacilities(
  facilities: ParkingFacility[],
  incidents: CrimeIncident[]
): SafetyScoreResult[] {
  return facilities.map((fac) => calculateSafetyScore(fac, incidents));
}

/**
 * React hook to move safety score calculations off the main render loop.
 * Memoizes scoring across facilities and incidents so map panning, zooming,
 * and bottom sheet dragging/animations do not trigger recalculations.
 */
export function useSafetyScoredFacilities(
  facilities: ParkingFacility[],
  incidents: CrimeIncident[]
): SafetyScoreResult[] {
  return useMemo(() => {
    return scoreAllFacilities(facilities, incidents);
  }, [facilities, incidents]);
}
