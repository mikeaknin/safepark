import React, { useState } from 'react';
import { ParkingLocation } from '../../../domain/models/ParkingLocation';
import { SAFE_PARK_TOKENS, getStatusStyle } from '../../../theme/tokens';
import { RiskGauge } from '../common/RiskGauge';
import { X, Sun, Moon, Shield, Eye, AlertOctagon, Sparkles } from 'lucide-react';
import { CsiEngine } from '../../../domain/services/CsiEngine';

interface CsiBreakdownModalProps {
  location: ParkingLocation;
  onClose: () => void;
}

export const CsiBreakdownModal: React.FC<CsiBreakdownModalProps> = ({ location, onClose }) => {
  const [simNight, setSimNight] = useState(!location.lighting.isDaytime);
  const [simExtraHazard, setSimExtraHazard] = useState(false);

  // Live simulation of CSI mathematical response
  const simLighting = { ...location.lighting, isDaytime: !simNight };
  const simHazards = simExtraHazard
    ? [
        ...location.activeHazards,
        {
          id: 'sim-hz-99',
          spotId: location.id,
          hazardType: 'broken_glass_pavement' as const,
          reportedAt: new Date().toISOString(),
          confirmedByWitnessCount: 5,
          photoEvidenceVerified: true,
          notes: 'Fresh automotive glass shards detected on stall pavement',
          coordinates: location.coordinates,
        }
      ]
    : location.activeHazards;

  const currentCsi = CsiEngine.calculate(
    location.id,
    location.crimeData,
    simLighting,
    location.infrastructure,
    simHazards
  );

  const status = getStatusStyle(currentCsi.totalScore);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.2)',
          maxWidth: '620px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          color: '#0F172A',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Composite Safety Index (CSI) Engine
            </div>
            <h2 style={{ fontSize: '1.25rem', color: '#0F172A', fontWeight: 800 }}>{location.name}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Score Readout Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            backgroundColor: status.bg,
            padding: '16px 20px',
            borderRadius: '16px',
            border: `1.5px solid ${status.border}`,
            marginBottom: '20px',
          }}
        >
          <RiskGauge score={currentCsi.totalScore} size={90} strokeWidth={8} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: status.text }}>
                {status.label}
              </span>
              <span className="tabular-nums" style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>
                ({currentCsi.totalScore}/100)
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
              Dynamic mathematical weighting across 4 real-time municipal data feeds.
            </p>
          </div>
        </div>

        {/* Component Weight Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {/* Crime History (35%) */}
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={16} color="#2563EB" />
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Crime History</span>
              </div>
              <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 700 }}>35% Weight</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                30d Incidents: {location.crimeData.incidentsLast30Days}
              </span>
              <span className="tabular-nums" style={{ fontWeight: 800, fontSize: '1rem', color: currentCsi.components.crimeScore.rawScore >= 75 ? '#15803D' : '#B45309' }}>
                {Math.round(currentCsi.components.crimeScore.rawScore)}/100
              </span>
            </div>
          </div>

          {/* Lighting Grid (25%) */}
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sun size={16} color="#B45309" />
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Lighting & Solar</span>
              </div>
              <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 700 }}>25% Weight</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {simNight ? 'Night (Solar Decay)' : 'Daytime (Full Lux)'} • {simLighting.ambientLuxLevel} Lux
              </span>
              <span className="tabular-nums" style={{ fontWeight: 800, fontSize: '1rem', color: currentCsi.components.lightingScore.rawScore >= 75 ? '#15803D' : '#B45309' }}>
                {Math.round(currentCsi.components.lightingScore.rawScore)}/100
              </span>
            </div>
          </div>

          {/* Physical Security (20%) */}
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={16} color="#2563EB" />
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Physical Security</span>
              </div>
              <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 700 }}>20% Weight</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {location.infrastructure.surveillance.replace(/_/g, ' ')}
              </span>
              <span className="tabular-nums" style={{ fontWeight: 800, fontSize: '1rem', color: currentCsi.components.infrastructureScore.rawScore >= 75 ? '#15803D' : '#B45309' }}>
                {Math.round(currentCsi.components.infrastructureScore.rawScore)}/100
              </span>
            </div>
          </div>

          {/* Active Hazards (20%) */}
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertOctagon size={16} color="#BE123C" />
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Active Hazards</span>
              </div>
              <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 700 }}>20% Weight</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {simHazards.length} verified physical hazard{simHazards.length === 1 ? '' : 's'}
              </span>
              <span className="tabular-nums" style={{ fontWeight: 800, fontSize: '1rem', color: currentCsi.components.hazardScore.rawScore >= 75 ? '#15803D' : '#BE123C' }}>
                {Math.round(currentCsi.components.hazardScore.rawScore)}/100
              </span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            Close CSI Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
