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
}) => {
  const status = getStatusStyle(location.csi.totalScore);
  const litRoute = location.walkingRoutes?.find((r) => r.isRecommendedLitPath);

  return (
    <article
      aria-label={`${location.name}, Composite Safety Index ${location.csi.totalScore}`}
      onClick={() => onSelect(location)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: isParkedHere
          ? '2px solid #15803D'
          : isSelected
          ? '2px solid #2563EB'
          : '1px solid #E2E8F0',
        boxShadow: isParkedHere
          ? '0 4px 16px rgba(21, 128, 61, 0.15)'
          : isSelected
          ? '0 4px 16px rgba(37, 99, 235, 0.15)'
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

      {/* Header Row: Title & CSI Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#0F172A',
              marginBottom: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{location.name}</span>
            {location.csi.totalScore >= 75 && (
              <span title="SafePark Low Risk Certified" style={{ display: 'inline-flex', flexShrink: 0 }}>
                <ShieldCheck size={16} color="#15803D" />
              </span>
            )}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{location.address}</p>
        </div>

        <Badge score={location.csi.totalScore} size="md" />
      </div>

      {/* Quick Specs: Rate, Open Spots, Structure */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.775rem',
          color: '#475569',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontWeight: 800, color: '#2563EB' }}>${location.hourlyRate}/hr</span>
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
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            <Video size={12} color="#2563EB" /> CCTV Monitored
          </span>
        )}
      </div>

      {/* Granular Sub-Score Gauges (in Full/Expanded view or when selected) */}
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
          <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            CSI Sub-Score Breakdown
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Crime Index</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: location.csi.components.crimeScore?.rawScore >= 75 ? '#15803D' : '#B45309' }}>
                {Math.round(location.csi.components.crimeScore?.rawScore || 0)}/100
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Lighting Grid</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: location.csi.components.lightingScore?.rawScore >= 75 ? '#15803D' : '#B45309' }}>
                {Math.round(location.csi.components.lightingScore?.rawScore || 0)}/100
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Infrastructure</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: location.csi.components.infrastructureScore?.rawScore >= 75 ? '#15803D' : '#B45309' }}>
                {Math.round(location.csi.components.infrastructureScore?.rawScore || 0)}/100
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
        {/* On Foot / Safe Walk */}
        {onSafeWalk && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSafeWalk(location);
            }}
            aria-label={`View on foot return walk route for ${location.name}`}
            style={{
              flex: '1 1 120px',
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
              minHeight: '44px',
              fontSize: '0.775rem',
              fontWeight: 700,
              transition: 'background-color 0.15s ease',
            }}
          >
            <Footprints size={15} color="#15803D" />
            <span>Walk Route</span>
            {litRoute && (
              <span style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 700 }}>
                ({litRoute.estimatedWalkingMinutes}m)
              </span>
            )}
          </button>
        )}

        {/* Inspect CSI Details */}
        {onInspectCsi && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInspectCsi(location);
            }}
            aria-label={`Inspect CSI Score Breakdown for ${location.name}`}
            style={{
              backgroundColor: '#F1F5F9',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
              padding: '8px 12px',
              fontSize: '0.775rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              minHeight: '44px',
            }}
          >
            <Info size={15} color="#2563EB" />
            <span>Details</span>
          </button>
        )}

        {/* Park Here Primary CTA */}
        {onParkHere && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onParkHere(location);
            }}
            disabled={isParkedHere}
            style={{
              flex: '1 1 100px',
              backgroundColor: isParkedHere ? '#15803D' : '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
              padding: '8px 14px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: isParkedHere ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '44px',
              boxShadow: isParkedHere ? '0 4px 12px rgba(21, 128, 61, 0.25)' : '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Car size={15} />
            <span>{isParkedHere ? 'Parked Here' : 'Park Here'}</span>
          </button>
        )}

        {/* Report Hazard */}
        {onReportHazard && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReportHazard(location);
            }}
            aria-label={`Report street hazard near ${location.name}`}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#64748B',
              border: '1px solid #CBD5E1',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px',
              minWidth: '44px',
            }}
            title="Report Physical Hazard"
          >
            <AlertTriangle size={15} color="#D97706" />
          </button>
        )}
      </div>
    </article>
  );
};
