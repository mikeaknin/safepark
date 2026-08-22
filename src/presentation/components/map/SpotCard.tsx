import React from 'react';
import { ParkingLocation } from '../../../domain/models/ParkingLocation';
import { Badge } from '../common/Badge';
import { SAFE_PARK_TOKENS, getStatusStyle } from '../../../theme/tokens';
import {
  ShieldCheck,
  Video,
  Footprints,
  AlertTriangle,
  Info,
  Car,
  Lock,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

interface SpotCardProps {
  location: ParkingLocation;
  isSelected: boolean;
  isParkedHere: boolean;
  onSelect: (loc: ParkingLocation) => void;
  onInspectCsi: (loc: ParkingLocation) => void;
  onSafeWalk: (loc: ParkingLocation) => void;
  onParkHere: (loc: ParkingLocation) => void;
  onReportHazard: (loc: ParkingLocation) => void;
}

export const SpotCard: React.FC<SpotCardProps> = ({
  location,
  isSelected,
  isParkedHere,
  onSelect,
  onInspectCsi,
  onSafeWalk,
  onParkHere,
  onReportHazard,
}) => {
  const status = getStatusStyle(location.csi.totalScore);
  const litRoute = location.walkingRoutes?.find(r => r.isRecommendedLitPath);

  return (
    <div
      onClick={() => onSelect(location)}
      style={{
        backgroundColor: '#1E293B',
        borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
        border: isParkedHere
          ? '2px solid #22C55E'
          : isSelected
          ? `2px solid ${SAFE_PARK_TOKENS.colors.brand.primary}`
          : `1px solid ${status.hex}44`,
        boxShadow: isParkedHere
          ? SAFE_PARK_TOKENS.shadows.glowGreen
          : isSelected
          ? SAFE_PARK_TOKENS.shadows.glowBlue
          : SAFE_PARK_TOKENS.shadows.card,
        padding: '16px',
        marginBottom: '14px',
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
          <Lock size={11} /> Currently Parked Here
        </div>
      )}

      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {location.name}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{location.address}</p>
        </div>
        <Badge score={location.csi.totalScore} />
      </div>

      {/* Metric Strip (Tabular numbers eliminate UI jitter) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          backgroundColor: '#0F172A',
          borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
          padding: '8px 10px',
          margin: '12px 0',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase' }}>Hourly Rate</div>
          <div className="tabular-nums" style={{ fontSize: '0.95rem', color: '#FFFFFF' }}>
            {location.currency}{location.hourlyRate.toFixed(2)}/hr
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase' }}>Available</div>
          <div
            className="tabular-nums"
            style={{
              fontSize: '0.95rem',
              color: location.availableSpaces > 5 ? '#22C55E' : '#EF4444',
            }}
          >
            {location.availableSpaces} / {location.totalSpaces}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase' }}>Walk Return</div>
          <div className="tabular-nums" style={{ fontSize: '0.95rem', color: '#38BDF8' }}>
            {litRoute ? `${litRoute.estimatedWalkingMinutes} min` : '4 min'}
          </div>
        </div>
      </div>

      {/* Infrastructure Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            color: '#CBD5E1',
            backgroundColor: '#334155',
            padding: '3px 8px',
            borderRadius: '4px',
          }}
        >
          <ShieldCheck size={13} color="#22C55E" />
          {location.infrastructure.structureType.replace(/_/g, ' ')}
        </span>

        {location.infrastructure.surveillance !== 'none' && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              color: '#CBD5E1',
              backgroundColor: '#334155',
              padding: '3px 8px',
              borderRadius: '4px',
            }}
          >
            <Video size={13} color={SAFE_PARK_TOKENS.colors.brand.primary} />
            {location.infrastructure.surveillance === 'monitored_cctv_24_7' ? '24/7 Monitored CCTV' : 'Recorded CCTV'}
          </span>
        )}

        {location.infrastructure.hasControlledAccessBarrier && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              color: '#CBD5E1',
              backgroundColor: '#334155',
              padding: '3px 8px',
              borderRadius: '4px',
            }}
          >
            <Lock size={12} color="#22C55E" />
            Gated Access
          </span>
        )}

        {location.crimeData.smashAndGrabCount > 0 ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              color: '#EF4444',
              backgroundColor: 'rgba(239,68,68,0.15)',
              border: '1px solid #EF4444',
              padding: '3px 8px',
              borderRadius: '4px',
            }}
          >
            <AlertTriangle size={13} />
            {location.crimeData.smashAndGrabCount} break-in(s) in block
          </span>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              color: '#22C55E',
              backgroundColor: 'rgba(34,197,94,0.15)',
              padding: '3px 8px',
              borderRadius: '4px',
            }}
          >
            <CheckCircle2 size={13} /> 0 Recent Break-ins
          </span>
        )}
      </div>

      {/* Action Buttons Workflow */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '6px' }}>
        {/* Park Here Primary Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onParkHere(location);
          }}
          disabled={isParkedHere}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: isParkedHere ? '#22C55E' : SAFE_PARK_TOKENS.colors.brand.primary,
            color: isParkedHere ? '#0F172A' : '#FFFFFF',
            border: 'none',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
            padding: '8px 12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: isParkedHere ? 'default' : 'pointer',
            boxShadow: isParkedHere ? 'none' : SAFE_PARK_TOKENS.shadows.glowBlue,
          }}
        >
          <Car size={14} />
          {isParkedHere ? 'Parked' : 'Park Here'}
        </button>

        {/* Inspect Safety Breakdown */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInspectCsi(location);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            backgroundColor: '#334155',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
            padding: '8px 8px',
            fontSize: '0.775rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Info size={13} />
          <span>CSI Factors</span>
        </button>

        {/* Safe Walk Back Preview */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSafeWalk(location);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            backgroundColor: '#0F172A',
            color: '#38BDF8',
            border: '1px solid #334155',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
            padding: '8px 8px',
            fontSize: '0.775rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Footprints size={13} color="#22C55E" />
          <span>Safe Walk</span>
        </button>

        {/* Report Physical Hazard */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReportHazard(location);
          }}
          title="Submit Verifiable Physical Hazard"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0F172A',
            color: '#F59E0B',
            border: '1px solid #475569',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
            padding: '8px 10px',
            cursor: 'pointer',
          }}
        >
          <AlertTriangle size={14} />
        </button>
      </div>
    </div>
  );
};
