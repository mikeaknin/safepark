import React from 'react';
import { ParkingLocation } from '../../domain/models/ParkingLocation';
import { Badge } from './common/Badge';
import { SAFE_PARK_TOKENS, getStatusStyle } from '../../theme/tokens';
import {
  ShieldCheck,
  Video,
  Footprints,
  AlertTriangle,
  Info,
  Car,
  Lock,
  CheckCircle2,
  Navigation,
  Sparkles,
  Sun,
  Eye
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
        backgroundColor: '#1E293B',
        borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
        border: isParkedHere
          ? '2px solid #22C55E'
          : isSelected
          ? `2px solid ${SAFE_PARK_TOKENS.colors.brand.primary}`
          : `1px solid rgba(51, 65, 85, 0.7)`,
        boxShadow: isParkedHere
          ? SAFE_PARK_TOKENS.shadows.glowGreen
          : isSelected
          ? SAFE_PARK_TOKENS.shadows.glowBlue
          : SAFE_PARK_TOKENS.shadows.card,
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
            backgroundColor: '#22C55E',
            color: '#0F172A',
            padding: '2px 10px',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.pill,
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
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
        <div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{location.name}</span>
            {location.csi.totalScore >= 75 && (
              <span title="SafePark Low Risk Certified" style={{ display: 'inline-flex' }}>
                <ShieldCheck size={16} color="#38BDF8" />
              </span>
            )}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{location.address}</p>
        </div>

        <Badge score={location.csi.totalScore} size="md" />
      </div>

      {/* Quick Specs: Distance, Rate, Structure */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.775rem',
          color: '#CBD5E1',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontWeight: 700, color: '#38BDF8' }}>${location.hourlyRate}/hr</span>
        <span>•</span>
        <span>{location.availableSpaces} spots open</span>
        <span>•</span>
        <span style={{ textTransform: 'capitalize' }}>
          {location.infrastructure.structureType.replace(/_/g, ' ')}
        </span>
        {litRoute && (
          <>
            <span>•</span>
            <span style={{ color: '#22C55E', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Footprints size={12} />
              {litRoute.estimatedWalkingMinutes} min safe walk ({litRoute.totalDistanceMeters}m)
            </span>
          </>
        )}
      </div>

      {/* Feature Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
        {location.infrastructure.hasControlledAccessBarrier && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#334155',
              color: '#E2E8F0',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 500,
            }}
          >
            <Lock size={12} color="#38BDF8" /> Gated Perimeter
          </span>
        )}
        {location.infrastructure.hasActiveAttendantOrPatrol && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#334155',
              color: '#E2E8F0',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 500,
            }}
          >
            <ShieldCheck size={12} color="#22C55E" /> 24/7 Attendant
          </span>
        )}
        {location.infrastructure.surveillance === 'monitored_cctv_24_7' && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#334155',
              color: '#E2E8F0',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 500,
            }}
          >
            <Video size={12} color="#38BDF8" /> CCTV Monitored
          </span>
        )}
      </div>

      {/* Granular Sub-Score Gauges (in Full/Expanded view or when showFullDetails is true) */}
      {(showFullDetails || isSelected) && location.csi.components && (
        <div
          style={{
            backgroundColor: '#0F172A',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '14px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase' }}>
            CSI Sub-Score Breakdown
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Crime Index</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: location.csi.components.crimeScore?.rawScore >= 75 ? '#22C55E' : '#F59E0B' }}>
                {Math.round(location.csi.components.crimeScore?.rawScore || 0)}/100
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Lighting Grid</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: location.csi.components.lightingScore?.rawScore >= 75 ? '#22C55E' : '#F59E0B' }}>
                {Math.round(location.csi.components.lightingScore?.rawScore || 0)}/100
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Infrastructure</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: location.csi.components.infrastructureScore?.rawScore >= 75 ? '#22C55E' : '#F59E0B' }}>
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
            aria-label={`View on foot refined walk return route for ${location.name}`}
            style={{
              flex: '1 1 120px',
              backgroundColor: '#0F172A',
              color: '#38BDF8',
              border: '1px solid #22C55E',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '44px',
              textAlign: 'left',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Footprints size={15} color="#22C55E" style={{ flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#FFFFFF' }}>On Foot</span>
              <span style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 500 }}>Refined Walk Return</span>
            </div>
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
              backgroundColor: '#334155',
              color: '#CBD5E1',
              border: 'none',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
              padding: '8px 12px',
              fontSize: '0.775rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              minHeight: '44px',
            }}
          >
            <Info size={15} />
            <span>Details</span>
          </button>
        )}

        {/* Park Here */}
        {onParkHere && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onParkHere(location);
            }}
            disabled={isParkedHere}
            style={{
              flex: '1 1 100px',
              backgroundColor: isParkedHere ? '#22C55E' : SAFE_PARK_TOKENS.colors.brand.primary,
              color: isParkedHere ? '#0F172A' : '#FFFFFF',
              border: 'none',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
              padding: '8px 14px',
              fontSize: '0.775rem',
              fontWeight: 700,
              cursor: isParkedHere ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '44px',
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
              backgroundColor: 'transparent',
              color: '#94A3B8',
              border: '1px solid #334155',
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
            <AlertTriangle size={15} color="#F59E0B" />
          </button>
        )}
      </div>
    </article>
  );
};
