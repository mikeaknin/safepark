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
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#1E293B',
          borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
          border: '1px solid #475569',
          boxShadow: SAFE_PARK_TOKENS.shadows.sheet,
          maxWidth: '620px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          color: '#FFFFFF',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: SAFE_PARK_TOKENS.colors.brand.primary, fontWeight: 700, textTransform: 'uppercase' }}>
              Composite Safety Index (CSI) Engine
            </div>
            <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>{location.name}</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#334155',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
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
            backgroundColor: '#0F172A',
            padding: '16px 20px',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
            border: `1px solid ${status.hex}44`,
            marginBottom: '20px',
          }}
        >
          <RiskGauge score={currentCsi.totalScore} size={90} strokeWidth={8} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: status.hex }}>
                {status.label}
              </span>
              <span className="tabular-nums" style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                ({currentCsi.totalScore}/100)
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>
              Dynamic mathematical weighting across 4 real-time data feeds.
            </p>
          </div>
        </div>

        {/* Interactive Simulation Controls */}
        <div
          style={{
            backgroundColor: '#334155',
            padding: '12px 16px',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color={SAFE_PARK_TOKENS.colors.brand.primary} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Live CSI Simulator:</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSimNight(!simNight)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: simNight ? '#0F172A' : '#F59E0B',
                color: simNight ? '#94A3B8' : '#000000',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {simNight ? <Moon size={14} /> : <Sun size={14} />}
              {simNight ? 'Night Mode' : 'Day Mode'}
            </button>

            <button
              onClick={() => setSimExtraHazard(!simExtraHazard)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: simExtraHazard ? '#EF4444' : '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <AlertOctagon size={14} />
              {simExtraHazard ? '- Fresh Break-in Glass' : '+ Inject Glass Hazard'}
            </button>
          </div>
        </div>

        {/* Component Breakdown List */}
        <h4 style={{ fontSize: '0.9rem', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px' }}>
          Mathematical Weight Contributions
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Crime */}
          <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>1. Vehicle Crime History (40% Weight)</span>
              <span className="tabular-nums" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                {currentCsi.components.crimeScore.rawScore}/100 (Contrib: {currentCsi.components.crimeScore.weightedScore.toFixed(1)})
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Heavily weighted for smash-and-grab ({location.crimeData.smashAndGrabCount}) and catalytic converter thefts ({location.crimeData.catalyticConverterCount}).
            </p>
          </div>

          {/* Lighting */}
          <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>2. Municipal Smart Lighting & Solar Status (25% Weight)</span>
              <span className="tabular-nums" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                {currentCsi.components.lightingScore.rawScore}/100 (Contrib: {currentCsi.components.lightingScore.weightedScore.toFixed(1)})
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              {simNight ? 'Night evaluation: Smart fixture density & lux output.' : 'Daytime evaluation: Ambient solar protection.'}
            </p>
          </div>

          {/* Infrastructure */}
          <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>3. Physical Infrastructure & Access (25% Weight)</span>
              <span className="tabular-nums" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                {currentCsi.components.infrastructureScore.rawScore}/100 (Contrib: {currentCsi.components.infrastructureScore.weightedScore.toFixed(1)})
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Structure: {location.infrastructure.structureType.replace(/_/g, ' ')}, Surveillance: {location.infrastructure.surveillance.replace(/_/g, ' ')}.
            </p>
          </div>

          {/* Hazard Reports */}
          <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>4. Time-Decayed User Hazard Reports (10% Weight)</span>
              <span className="tabular-nums" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                {currentCsi.components.hazardScore.rawScore}/100 (Contrib: {currentCsi.components.hazardScore.weightedScore.toFixed(1)})
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Exponential time-decay algorithm (18hr half-life) on community-verified physical defects.
            </p>
          </div>
        </div>

        {/* Risk Factors & Recommendations */}
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#0F172A', borderRadius: '8px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B', marginBottom: '6px' }}>
            Driver Safety Directives:
          </div>
          {currentCsi.recommendations.map((rec, i) => (
            <div key={i} style={{ fontSize: '0.775rem', color: '#CBD5E1', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              • {rec}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
