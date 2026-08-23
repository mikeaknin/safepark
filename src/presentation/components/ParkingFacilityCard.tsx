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
  onReportHazard,
  onOpenDirections,
}) => {
  const status = getStatusStyle(location.csi.totalScore);
  const litRoute = location.walkingRoutes?.find((r) => r.isRecommendedLitPath);

  return (
    <article
      aria-label={`${location.name}, Composite Safety Index ${location.csi.totalScore}`}
      onClick={() => onSelect(location)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        border: isParkedHere
          ? '2px solid #15803D'
          : isSelected
          ? '2px solid #2563EB'
          : '1px solid #E2E8F0',
        boxShadow: isParkedHere
          ? '0 4px 16px rgba(21, 128, 61, 0.12)'
          : isSelected
          ? '0 4px 16px rgba(37, 99, 235, 0.12)'
          : '0 2px 10px rgba(15, 23, 42, 0.04)',
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

      {/* Header Row: Title & CSI Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '10px', minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minWidth: 0,
            }}
          >
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {location.name}
            </span>
            {location.csi.totalScore >= 75 && (
              <span title="SafePark Low Risk Certified" style={{ display: 'inline-flex', flexShrink: 0 }}>
                <ShieldCheck size={16} color="#15803D" />
              </span>
            )}
          </h3>
          <p style={{ fontSize: '0.775rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {location.address}
          </p>
        </div>

        <Badge score={location.csi.totalScore} size="md" />
      </div>

      {/* Quick Specs: Rate, Open Spots, Structure */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.775rem',
          color: '#475569',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontWeight: 800, color: '#2563EB', fontSize: '0.85rem' }}>${location.hourlyRate.toFixed(2)}/hr</span>
        <span>•</span>
        <span style={{ fontWeight: 600 }}>{location.availableSpaces} spots open</span>
        <span>•</span>
        <span style={{ textTransform: 'capitalize', color: '#64748B' }}>
          {location.infrastructure.structureType.replace(/_/g, ' ')}
        </span>
        {location.infrastructure.surveillance === 'monitored_cctv_24_7' && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              color: '#1D4ED8',
              backgroundColor: '#EFF6FF',
              padding: '1px 6px',
              borderRadius: '4px',
              fontSize: '0.675rem',
              fontWeight: 700,
            }}
          >
            <Video size={12} color="#2563EB" /> CCTV Monitored
          </span>
        )}
      </div>

      {/* Granular Sub-Score Gauges */}
      {(showFullDetails || isSelected) && location.csi.components && (
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            padding: '10px 12px',
            marginBottom: '14px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            CSI Sub-Score Breakdown
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.675rem', color: '#64748B', fontWeight: 600 }}>Crime Index</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: location.csi.components.crimeScore?.rawScore >= 75 ? '#15803D' : '#B45309' }}>
                {Math.round(location.csi.components.crimeScore?.rawScore || 0)}/100
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.675rem', color: '#64748B', fontWeight: 600 }}>Lighting Grid</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: location.csi.components.lightingScore?.rawScore >= 75 ? '#15803D' : '#B45309' }}>
                {Math.round(location.csi.components.lightingScore?.rawScore || 0)}/100
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.675rem', color: '#64748B', fontWeight: 600 }}>Physical Sec</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: location.csi.components.infrastructureScore?.rawScore >= 75 ? '#15803D' : '#B45309' }}>
                {Math.round(location.csi.components.infrastructureScore?.rawScore || 0)}/100
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
        {/* Turn-by-Turn Driving Directions */}
        {onOpenDirections && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDirections(location);
            }}
            aria-label={`Open turn-by-turn driving directions for ${location.name}`}
            style={{
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              border: '1px solid #BFDBFE',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '40px',
              fontSize: '0.775rem',
              fontWeight: 800,
              transition: 'background-color 0.15s ease',
            }}
          >
            <Navigation size={14} />
            <span>Directions</span>
          </button>
        )}

        {/* On Foot / Safe Walk */}
        {onSafeWalk && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSafeWalk(location);
            }}
            aria-label={`View on foot return walk route for ${location.name}`}
            style={{
              flex: '1 1 110px',
              backgroundColor: '#F1F5F9',
              color: '#1E293B',
              border: '1px solid #CBD5E1',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '40px',
              fontSize: '0.775rem',
              fontWeight: 700,
              transition: 'background-color 0.15s ease',
            }}
          >
            <Footprints size={14} color="#15803D" />
            <span>Safe Walk {litRoute ? `(${litRoute.estimatedWalkingMinutes}m)` : ''}</span>
          </button>
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
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              minHeight: '40px',
              fontSize: '0.775rem',
              fontWeight: 700,
              transition: 'all 0.15s ease',
            }}
          >
            <Info size={14} color="#2563EB" />
            <span>Why CSI {location.csi.totalScore}?</span>
          </button>
        )}

        {/* Primary Action: Park Here */}
        {onParkHere && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onParkHere(location);
            }}
            disabled={isParkedHere}
            aria-label={`Park vehicle at ${location.name}`}
            style={{
              flex: '1 1 120px',
              backgroundColor: isParkedHere ? '#15803D' : '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
              padding: '8px 14px',
              cursor: isParkedHere ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '40px',
              fontSize: '0.8rem',
              fontWeight: 800,
              boxShadow: isParkedHere ? '0 4px 12px rgba(21, 128, 61, 0.3)' : '0 4px 12px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <Car size={15} />
            <span>{isParkedHere ? 'Parked Here ✓' : 'Park Here'}</span>
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
