import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SAFE_PARK_TOKENS, getStatusStyle } from '../../theme/tokens';
import {
  Navigation,
  Shield,
  Volume2,
  AlertTriangle,
  Lock,
  Footprints,
  Compass,
  Sparkles,
  CheckCircle2,
  Zap
} from 'lucide-react';

export const CarPlayView: React.FC = () => {
  const { locations, selectedLocation, setSelectedLocation, handleParkHere, parkedLocation, showToast } = useApp();

  const [simulatedVoiceAlert, setSimulatedVoiceAlert] = useState<string | null>(null);

  // Safest spot available
  const safestSpot = [...locations].sort((a, b) => b.csi.totalScore - a.csi.totalScore)[0];
  const activeSpot = selectedLocation || safestSpot;
  const status = getStatusStyle(activeSpot?.csi.totalScore || 85);

  const handleRouteToSafestSpot = () => {
    if (safestSpot) {
      setSelectedLocation(safestSpot);
      setSimulatedVoiceAlert(`"SafePark routing engaged. Navigating to ${safestSpot.name}, Composite Safety Index 94. 24/7 CCTV surveillance active."`);
      showToast(`🚗 CarPlay Navigation engaged: ${safestSpot.name}`);
    }
  };

  const handleTriggerAudioSmashAndGrabAlert = () => {
    setSimulatedVoiceAlert('"⚠️ Caution: Entering high-incident smash-and-grab corridor. Ensure all charging cords, backpacks, and accessories are stowed in the trunk."');
    showToast('🔊 CarPlay Audio Voice Prompt triggered');
  };

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '16px',
        backgroundColor: '#0B1120',
        borderRadius: '24px',
        border: '4px solid #334155',
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
      }}
    >
      {/* CarPlay Chassis Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          borderBottom: '1px solid #1E293B',
          fontSize: '0.8rem',
          color: '#94A3B8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Apple CarPlay / Automotive Display</span>
          <span>•</span>
          <span>In-Dash Driving Mode</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span className="tabular-nums">5G Ultra</span>
          <span className="tabular-nums">7:48 PM</span>
        </div>
      </div>

      {/* CarPlay High-Contrast Split Screen (Map Navigation Left / Driver Commands Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '16px',
          padding: '16px',
          minHeight: '440px',
        }}
      >
        {/* Left: Simplified High-Contrast Turn-by-Turn Card */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: '16px',
            border: `2px solid ${status.hex}`,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Top Destination & Maneuver Banner */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Navigation size={26} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                    In 300 FT • Turn Right on 4th St
                  </div>
                  <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', fontWeight: 700, lineHeight: 1.2 }}>
                    {activeSpot?.name}
                  </h2>
                </div>
              </div>

              {/* Large High-Contrast Status Readout */}
              <div
                style={{
                  backgroundColor: status.bg,
                  border: `2px solid ${status.hex}`,
                  borderRadius: '12px',
                  padding: '8px 14px',
                  textAlign: 'center',
                }}
              >
                <div className="tabular-nums" style={{ fontSize: '1.6rem', color: status.hex, fontWeight: 800, lineHeight: 1 }}>
                  {activeSpot?.csi.totalScore}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#FFFFFF', fontWeight: 700, textTransform: 'uppercase' }}>
                  {status.label}
                </div>
              </div>
            </div>

            {/* In-Car Safety Telemetry Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '20px' }}>
              <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>BREAK-INS (30D)</div>
                <div className="tabular-nums" style={{ fontSize: '1.2rem', color: activeSpot?.crimeData.smashAndGrabCount === 0 ? '#22C55E' : '#EF4444', fontWeight: 700 }}>
                  {activeSpot?.crimeData.smashAndGrabCount} Incidents
                </div>
              </div>

              <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>STREET LIGHTING</div>
                <div className="tabular-nums" style={{ fontSize: '1.2rem', color: '#38BDF8', fontWeight: 700 }}>
                  {activeSpot?.lighting.coverageIndexPercentage}% Lux
                </div>
              </div>

              <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>RATE</div>
                <div className="tabular-nums" style={{ fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 700 }}>
                  ${activeSpot?.hourlyRate}/hr
                </div>
              </div>
            </div>
          </div>

          {/* Voice Prompt Playback Banner */}
          {simulatedVoiceAlert && (
            <div
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #38BDF8',
                borderRadius: '10px',
                padding: '12px 14px',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Volume2 size={22} color="#38BDF8" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.85rem', color: '#E2E8F0', fontStyle: 'italic' }}>
                {simulatedVoiceAlert}
              </div>
            </div>
          )}

          {/* Bottom Action Row */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button
              onClick={() => activeSpot && handleParkHere(activeSpot)}
              style={{
                flex: 1,
                backgroundColor: '#22C55E',
                color: '#0F172A',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Lock size={20} />
              {parkedLocation?.id === activeSpot?.id ? 'Vehicle Parked & Locked' : 'Park & Arm Safety Trigger'}
            </button>
          </div>
        </div>

        {/* Right: One-Tap In-Car Driving Commands */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Quick Command 1: Route to Safest Spot */}
          <button
            onClick={handleRouteToSafestSpot}
            style={{
              backgroundColor: '#1E293B',
              border: '2px solid #2C73D2',
              borderRadius: '16px',
              padding: '18px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', fontSize: '0.8rem', fontWeight: 700 }}>
                <Sparkles size={16} /> ONE-TAP SMART ROUTING
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                Route to Safest Spot
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Filters nearest 90+ CSI certified garage
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#2C73D2',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Navigation size={18} />
            </div>
          </button>

          {/* Quick Command 2: Audio Voice Alert Test */}
          <button
            onClick={handleTriggerAudioSmashAndGrabAlert}
            style={{
              backgroundColor: '#1E293B',
              border: '1px solid #475569',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '0.8rem', fontWeight: 700 }}>
                <AlertTriangle size={16} /> VOICE TELEMETRY
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                Test Audio Risk Warning
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Hands-free smash & grab advisory
              </div>
            </div>
            <Volume2 size={20} color="#EF4444" />
          </button>

          {/* Quick Command 3: Other Nearby Spots */}
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: '16px',
              border: '1px solid #334155',
              padding: '14px',
              flex: 1,
              overflowY: 'auto',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
              Other Options in 0.5 Mile Range:
            </div>
            {locations.map((loc) => (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  backgroundColor: selectedLocation?.id === loc.id ? '#0F172A' : 'transparent',
                  border: selectedLocation?.id === loc.id ? '1px solid #2C73D2' : 'none',
                  cursor: 'pointer',
                  marginBottom: '4px',
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 600 }}>{loc.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>${loc.hourlyRate}/hr</div>
                </div>
                <div className="tabular-nums" style={{ fontSize: '0.85rem', color: getStatusStyle(loc.csi.totalScore).hex, fontWeight: 700 }}>
                  CSI {loc.csi.totalScore}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
