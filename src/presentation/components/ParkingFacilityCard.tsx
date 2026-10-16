import React from 'react';
import { ParkingLocation } from '../../domain/models/ParkingLocation';
import { Badge } from './common/Badge';
import { SAFE_PARK_TOKENS, getStatusStyle } from '../../theme/tokens';
import {
  ShieldCheck,
  Video,
  Footprints,
  Info,
  Car,
  CheckCircle2,
  AlertTriangle,
  Navigation,
} from 'lucide-react';

export interface ParkingFacilityCardProps {
  location: ParkingLocation;
  isSelected: boolean;
  isParkedHere: boolean;
  showFullDetails?: boolean;
  onSelect: (loc: ParkingLocation) => void;
  onInspectCsi?: (loc: ParkingLocation) => void;
  onSafeWalk?: (loc: ParkingLocation) => void;
  onParkHere?: (loc: ParkingLocation) => void;
  onLeaveSpot?: (loc: ParkingLocation) => void;
  onReportHazard?: (loc: ParkingLocation) => void;
  onOpenDirections?: (loc: ParkingLocation) => void;
}

export const ParkingFacilityCard: React.FC<ParkingFacilityCardProps> = ({
  location,
  isSelected,
  isParkedHere,
  showFullDetails = false,
  onSelect,
  onInspectCsi,
  onSafeWalk,
  onParkHere,
  onLeaveSpot,
  onReportHazard,
  onOpenDirections,
}) => {
  const status = getStatusStyle(location.csi.totalScore);
  const litRoute = location.walkingRoutes?.find((r) => r.isRecommendedLitPath);

  const score = location.csi.totalScore;
  const isGreen = score >= 80;
  const isYellow = score >= 60 && score < 80;
  const isRed = score < 60;

  const isStreet = Boolean(
    location.isStreetParking ||
    location.infrastructure.structureType === 'curbside_street_metered' ||
    location.infrastructure.structureType === 'curbside_residential'
  );
  const smashAndGrabCount =
    location.breakInsPast90Days ??
    location.crimeData?.smashAndGrabCount ??
    location.crimeData?.incidentsLast30Days ??
    0;

  const cardBorder = isParkedHere
    ? '2px solid #15803D'
    : isSelected
    ? '2.5px solid #2563EB'
    : isGreen
    ? '1.5px solid #86EFAC'
    : isYellow
    ? '1.5px solid #FDE047'
    : '1.5px solid #FCA5A5';

  const cardBg = isGreen ? '#FFFFFF' : isYellow ? '#FFFEFA' : '#FFFDFD';

  const incidentCount = (location.csi.components.crimeScore?.factorDetails?.incidentCount500m as number) ?? (location.crimeData?.incidentsLast90Days ?? 0);
  const within250 = (location.csi.components.crimeScore?.factorDetails?.within250m as number) ?? (location.crimeData?.incidentsLast30Days ?? 0);
  const between250and500 = (location.csi.components.crimeScore?.factorDetails?.between250and500m as number) ?? Math.max(0, incidentCount - within250);

  const breakInScore = location.csi.components.crimeScore?.rawScore ?? 100;
  const breakInLabel =
    (location.csi.components.crimeScore?.factorDetails?.label as string) ??
    (breakInScore >= 80 ? 'Low Break-in Risk' : breakInScore >= 60 ? 'Moderate Risk' : 'High Break-in Frequency');

  const facilitySecurityScore = location.csi.components.infrastructureScore?.rawScore ?? 75;
  const facilitySecurityLabel =
    location.csi.components.infrastructureScore?.description ??
    (location.infrastructure.structureType.includes('underground')
      ? 'Gated Underground Garage'
      : location.infrastructure.structureType.includes('deck')
      ? 'Multi-Level Deck'
      : 'Open Surface Lot');

  const lightingScore = location.csi.components.lightingScore?.rawScore ?? 85;
  const lightingLabel =
    location.csi.components.lightingScore?.description ??
    (location.infrastructure.structureType.includes('underground')
      ? '24/7 Enclosed Lighting'
      : 'Ambient Street Light');

  return (
    <article
      aria-label={`${location.name}, Safety Score ${location.csi.totalScore}`}
      onClick={() => onSelect(location)}
      style={{
        backgroundColor: cardBg,
        borderRadius: '18px',
        border: cardBorder,
        boxShadow: isParkedHere
          ? '0 4px 16px rgba(21, 128, 61, 0.12)'
          : isSelected
          ? '0 6px 20px rgba(37, 99, 235, 0.16)'
          : '0 2px 10px rgba(15, 23, 42, 0.05)',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {/* Top Tag for Parked Status */}
      {isParkedHere && (
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            right: '16px',
            backgroundColor: '#15803D',
            color: '#FFFFFF',
            padding: '2px 10px',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.pill,
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            boxShadow: '0 2px 8px rgba(21, 128, 61, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <CheckCircle2 size={12} />
          Active Vehicle Spot
        </div>
      )}

      {/* Header Row: Dedicated Full-Width Title & CSI Badge */}
      <div style={{ width: '100%', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', width: '100%', marginBottom: '2px' }}>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              lineHeight: 1.3,
              flex: 1,
              wordBreak: 'break-word',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{isStreet ? (location.blockName || location.name) : location.name}</span>
            {location.csi.totalScore >= 75 && (
              <span title="SafePark Low Risk Certified" style={{ display: 'inline-flex', flexShrink: 0 }}>
                <ShieldCheck size={16} color="#15803D" />
              </span>
            )}
          </h3>
          <Badge score={location.csi.totalScore} size="md" />
        </div>
        <p style={{ fontSize: '0.775rem', color: '#64748B', margin: 0 }}>
          {location.address}
        </p>
      </div>

      {/* Quick Specs: Street vs Garage */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.775rem',
          color: '#475569',
          marginBottom: '10px',
          flexWrap: 'wrap',
        }}
      >
        {isStreet ? (
          <>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#047857',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.725rem',
                fontWeight: 800,
              }}
            >
              🚗 Curbside Parking
            </span>
            <span>•</span>
            <span style={{ fontWeight: 800, color: '#2563EB' }}>
              {location.meterRate || `$${location.hourlyRate.toFixed(2)}/hr`}
            </span>
            <span>•</span>
            <span style={{ fontWeight: 600 }}>
              {location.timeLimit ? (location.timeLimit.toLowerCase().includes('max') ? location.timeLimit : `${location.timeLimit} Max`) : '2-Hr Max'}
            </span>
          </>
        ) : (
          <>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#1D4ED8',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.725rem',
                fontWeight: 800,
              }}
            >
              🏢 {location.infrastructure.structureType.includes('underground') ? 'Underground Garage' : location.infrastructure.structureType.includes('deck') ? 'Multi-Level Deck' : 'Surface Public Lot'}
            </span>
            <span>•</span>
            <span style={{ fontWeight: 800, color: '#2563EB' }}>
              ${location.hourlyRate.toFixed(2)}/hr
            </span>
            <span>•</span>
            <span style={{ fontWeight: 600 }}>{location.totalSpaces} spots capacity</span>
          </>
        )}
      </div>

      {/* Street Smash & Grab Warning OR Garage 3-Factor Scorecard */}
      {isStreet ? (
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '12px 14px',
            marginBottom: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Smash & Grab Warning Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: isRed ? '#FEE2E2' : isYellow ? '#FEF9C3' : '#DCFCE7',
              border: `1px solid ${isRed ? '#FCA5A5' : isYellow ? '#FDE047' : '#86EFAC'}`,
              borderRadius: '10px',
              padding: '9px 12px',
            }}
          >
            <AlertTriangle size={18} color={isRed ? '#DC2626' : isYellow ? '#CA8A04' : '#15803D'} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isRed ? '#991B1B' : isYellow ? '#854D0E' : '#166534' }}>
                {location.smashAndGrabWarning || `${smashAndGrabCount} break-in${smashAndGrabCount === 1 ? '' : 's'} reported within 150m in past 90 days`}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                Curbside spots have open street exposure without attendant or security gate.
              </div>
            </div>
          </div>

          {/* Rate & Time Limit Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px', fontSize: '0.775rem' }}>
            <span style={{ color: '#64748B', fontWeight: 600 }}>Curb Meter Policy:</span>
            <span style={{ fontWeight: 800, color: '#0F172A' }}>
              {location.meterRate || `$${location.hourlyRate.toFixed(2)}/hr`} • {location.timeLimit ? (location.timeLimit.toLowerCase().includes('max') ? location.timeLimit : `${location.timeLimit} Max`) : '2-Hr Max'}
            </span>
          </div>
        </div>
      ) : (
        /* Deterministic Multi-Factor CSI Scorecard for Garages & Lots */
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '12px 14px',
            marginBottom: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isGreen ? '#16A34A' : isYellow ? '#CA8A04' : '#DC2626',
                }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isGreen ? '#15803D' : isYellow ? '#854D0E' : '#991B1B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isGreen ? 'Low Incident Zone' : isYellow ? 'Moderate Risk' : 'High Break-In Frequency'}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: isGreen ? '#15803D' : isYellow ? '#854D0E' : '#991B1B' }}>
              {score}/100 Master CSI
            </span>
          </div>

          {/* 1. Vehicle Break-in Risk Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 800, color: '#1E293B' }}>
                Vehicle Break-in Risk
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: breakInScore >= 80 ? '#15803D' : breakInScore >= 60 ? '#854D0E' : '#B91C1C' }}>
                {breakInScore}/100 • {breakInLabel}
              </span>
            </div>
            <div style={{ width: '100%', height: '7px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${breakInScore}%`,
                  height: '100%',
                  backgroundColor: breakInScore >= 80 ? '#16A34A' : breakInScore >= 60 ? '#CA8A04' : '#DC2626',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '3px' }}>
              {incidentCount} incident{incidentCount === 1 ? '' : 's'} within 500m in past 90 days
            </div>
          </div>

          {/* 2. Facility Security Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 800, color: '#1E293B' }}>
                Facility Security
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: facilitySecurityScore >= 80 ? '#15803D' : facilitySecurityScore >= 60 ? '#854D0E' : '#B91C1C' }}>
                {facilitySecurityScore}/100 • {facilitySecurityLabel}
              </span>
            </div>
            <div style={{ width: '100%', height: '7px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${facilitySecurityScore}%`,
                  height: '100%',
                  backgroundColor: facilitySecurityScore >= 80 ? '#16A34A' : facilitySecurityScore >= 60 ? '#CA8A04' : '#DC2626',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '3px' }}>
              Structure: {facilitySecurityLabel}
            </div>
          </div>

          {/* 3. Lighting & Visibility Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 800, color: '#1E293B' }}>
                Lighting & Visibility
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: lightingScore >= 80 ? '#15803D' : lightingScore >= 60 ? '#854D0E' : '#B91C1C' }}>
                {lightingScore}/100 • {lightingLabel}
              </span>
            </div>
            <div style={{ width: '100%', height: '7px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${lightingScore}%`,
                  height: '100%',
                  backgroundColor: lightingScore >= 80 ? '#16A34A' : lightingScore >= 60 ? '#CA8A04' : '#DC2626',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '3px' }}>
              Environment: {lightingLabel}
            </div>
          </div>
        </div>
      )}

      {/* 2-Stage Action Buttons Row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
        {isParkedHere ? (
          <>
            {/* Post-Parked State: Safe Walk & Leave Spot */}
            {onSafeWalk && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSafeWalk(location);
                }}
                aria-label={`Safe Walk to parked car at ${location.name}`}
                style={{
                  flex: '1 1 140px',
                  backgroundColor: '#15803D',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  minHeight: '42px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Footprints size={15} />
                <span>Safe Walk to Car</span>
              </button>
            )}

            {onLeaveSpot && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLeaveSpot(location);
                }}
                aria-label="Leave this parked spot"
                style={{
                  backgroundColor: '#FFF1F2',
                  color: '#BE123C',
                  border: '1px solid #FECDD3',
                  borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  minHeight: '42px',
                  fontSize: '0.775rem',
                  fontWeight: 800,
                }}
              >
                <span>Leave Spot</span>
              </button>
            )}
          </>
        ) : (
          <>
            {/* Get Directions (Google Maps / Apple Maps direct coordinates) */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Get directions to ${location.name} in Google Maps`}
              style={{
                flex: '1 1 130px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                textDecoration: 'none',
                borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
                padding: '8px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minHeight: '42px',
                fontSize: '0.8rem',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <Navigation size={15} />
              <span>Get Directions</span>
            </a>

            {onParkHere && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onParkHere(location);
                }}
                aria-label={`Mark parked at ${location.name}`}
                style={{
                  flex: '1 1 120px',
                  backgroundColor: '#F1F5F9',
                  color: '#334155',
                  border: '1px solid #CBD5E1',
                  borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  minHeight: '42px',
                  fontSize: '0.775rem',
                  fontWeight: 800,
                  transition: 'all 0.15s ease',
                }}
              >
                <Car size={15} />
                <span>I'm Parked Here</span>
              </button>
            )}
          </>
        )}

        {/* CSI Score Inspector */}
        {onInspectCsi && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInspectCsi(location);
            }}
            aria-label={`Inspect CSI Score breakdown for ${location.name}`}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
              padding: '8px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              minHeight: '42px',
              fontSize: '0.75rem',
              fontWeight: 700,
              transition: 'all 0.15s ease',
            }}
          >
            <Info size={13} color="#2563EB" />
            <span>Why CSI?</span>
          </button>
        )}

        {/* Report Hazard button */}
        {onReportHazard && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReportHazard(location);
            }}
            aria-label={`Report street hazard near ${location.name}`}
            style={{
              backgroundColor: 'transparent',
              color: '#64748B',
              border: 'none',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '36px',
              minHeight: '40px',
            }}
            title="Report physical street hazard"
          >
            <AlertTriangle size={15} color="#B45309" />
          </button>
        )}
      </div>
    </article>
  );
};
