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
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '3px solid #CBD5E1',
        boxShadow: '0 10px 40px rgba(15, 23, 42, 0.12)',
      }}
    >
      {/* CarPlay Chassis Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          borderBottom: '1px solid #E2E8F0',
          fontSize: '0.8rem',
          color: '#64748B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#15803D' }} />
          <span style={{ fontWeight: 800, color: '#0F172A' }}>Apple CarPlay / Automotive Display</span>
          <span>•</span>
          <span>In-Dash Daylight Mode</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontWeight: 700 }}>
          <span className="tabular-nums">5G Ultra</span>
          <span className="tabular-nums">11:42 AM</span>
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
            backgroundColor: '#F8FAFC',
            borderRadius: '16px',
            border: `2px solid ${status.border}`,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Top Destination & Maneuver Banner */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
                  Next Parking Guidance
                </div>
                <h2 style={{ fontSize: '1.4rem', color: '#0F172A', fontWeight: 800, marginTop: '2px' }}>
                  {activeSpot?.name || 'Searching Safe Facilities...'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
                  {activeSpot?.address || 'San Francisco, CA'}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: status.bg,
                  color: status.text,
                  border: `1.5px solid ${status.border}`,
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                }}
              >
                CSI {activeSpot?.csi.totalScore || 85}
              </div>
            </div>

            {/* Quick Turn Maneuver */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '14px',
                marginTop: '16px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <Navigation size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                  In 400 ft, Turn Right onto Mission St
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Entering Covered Multi-Level Structure • 24/7 Monitored
                </div>
              </div>
            </div>
          </div>

          {/* Voice Prompt Playback Simulator */}
          {simulatedVoiceAlert && (
            <div
              style={{
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                borderRadius: '12px',
                padding: '12px 16px',
                margin: '12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Volume2 size={20} color="#2563EB" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.825rem', color: '#1E40AF', fontStyle: 'italic', fontWeight: 600 }}>
                {simulatedVoiceAlert}
              </div>
            </div>
          )}

          {/* Bottom Live Action Controls */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              onClick={() => activeSpot && handleParkHere(activeSpot)}
              disabled={parkedLocation?.id === activeSpot?.id}
              style={{
                flex: 1,
                backgroundColor: parkedLocation?.id === activeSpot?.id ? '#15803D' : '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: parkedLocation?.id === activeSpot?.id ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{parkedLocation?.id === activeSpot?.id ? 'Parked at Facility' : 'Confirm Spot & Park'}</span>
            </button>
          </div>
        </div>

        {/* Right: Driver Action Tiles (Large Tap Targets for Vehicle Ergonomics) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Quick Route to Safest Facility */}
          <button
            onClick={handleRouteToSafestSpot}
            style={{
              flex: 1,
              backgroundColor: '#ECFDF5',
              border: '2px solid #A7F3D0',
              borderRadius: '16px',
              padding: '18px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Shield size={24} color="#15803D" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>
                One-Touch Reroute
              </span>
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Navigate to Safest Spot
              </div>
              <div style={{ fontSize: '0.8rem', color: '#065F46', marginTop: '2px' }}>
                Top-rated facility (CSI {safestSpot?.csi.totalScore || 94}) within 3 mins
              </div>
            </div>
          </button>

          {/* Test Audio Voice Alert Trigger */}
          <button
            onClick={handleTriggerAudioSmashAndGrabAlert}
            style={{
              flex: 1,
              backgroundColor: '#FFFBEB',
              border: '2px solid #FDE68A',
              borderRadius: '16px',
              padding: '18px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Volume2 size={24} color="#B45309" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>
                Voice Assistant
              </span>
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Test Audio Theft Alert
              </div>
              <div style={{ fontSize: '0.8rem', color: '#92400E', marginTop: '2px' }}>
                Trigger high-incident corridor cabin safety prompt
              </div>
            </div>
          </button>

          {/* Safe Walk Return Preview */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Footprints size={20} color="#2563EB" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Illuminated Return</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>54 Lux Municipal Path Active</div>
              </div>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803D' }}>3 min walk</span>
          </div>
        </div>
      </div>
    </div>
  );
};
