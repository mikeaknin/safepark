import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getStatusStyle, SAFE_PARK_TOKENS } from '../../../theme/tokens';
import {
  Footprints,
  Car,
  MapPin,
  LocateFixed,
} from 'lucide-react';

interface InteractiveMapCanvasProps {
  isFullscreen?: boolean;
}

export const InteractiveMapCanvas: React.FC<InteractiveMapCanvasProps> = ({
  isFullscreen = false,
}) => {
  const {
    locations,
    selectedLocation,
    setSelectedLocation,
    selectedDestination,
    showLightingHeatmap,
    isNightMode,
    motionState,
    parkedLocation,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [deviceCoordinates, setDeviceCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 37.7812,
    lng: -122.4001,
  });
  const [gpsActive, setGpsActive] = useState<boolean>(false);

  // Live GPS Device Geolocation Tracker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setDeviceCoordinates({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setGpsActive(true);
        },
        (err) => {
          console.warn('Geolocation access fallback to SOMA default coordinates:', err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <div
      ref={mapContainerRef}
      role="region"
      aria-label="Interactive City Risk and Parking Safety Map"
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : undefined,
        width: '100%',
        height: isFullscreen ? '100dvh' : '440px',
        backgroundColor: isNightMode ? '#0B1120' : '#1E293B',
        borderRadius: isFullscreen ? 0 : SAFE_PARK_TOKENS.borderRadius.lg,
        border: isFullscreen ? 'none' : '1px solid #334155',
        overflow: 'hidden',
        boxShadow: isFullscreen ? 'none' : SAFE_PARK_TOKENS.shadows.card,
        transition: 'background-color 0.4s ease',
        touchAction: 'pan-x pan-y pinch-zoom',
        zIndex: isFullscreen ? 0 : 1,
      }}
    >
      {/* High-Performance Vector Street Grid & Lighting Heatmap Render Engine */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <pattern id="streetGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={isNightMode ? '#17255433' : '#33415555'} strokeWidth="1" />
          </pattern>

          {/* Radial Lighting Glow Gradients */}
          <radialGradient id="highLuxZone" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22C55E" stopOpacity={isNightMode ? '0.45' : '0.2'} />
            <stop offset="60%" stopColor="#22C55E" stopOpacity={isNightMode ? '0.15' : '0.05'} />
            <stop offset="100%" stopColor="#0B1120" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="moderateLuxZone" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity={isNightMode ? '0.35' : '0.15'} />
            <stop offset="60%" stopColor="#F59E0B" stopOpacity={isNightMode ? '0.1' : '0.03'} />
            <stop offset="100%" stopColor="#0B1120" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="darkAlleyZone" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={isNightMode ? '0.35' : '0.15'} />
            <stop offset="100%" stopColor="#0B1120" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Vector Base Grid */}
        <rect width="100%" height="100%" fill="url(#streetGrid)" />

        {/* Mapbox Vector Street Geometry */}
        <path d="M 0 160 Q 300 130 1200 180" stroke="#334155" strokeWidth="26" fill="none" />
        <path d="M 0 380 L 1200 350" stroke="#334155" strokeWidth="22" fill="none" />
        <path d="M 0 580 L 1200 560" stroke="#334155" strokeWidth="22" fill="none" />
        <path d="M 280 0 L 320 800" stroke="#334155" strokeWidth="22" fill="none" />
        <path d="M 680 0 L 650 800" stroke="#334155" strokeWidth="22" fill="none" />

        {/* Street Centerlines */}
        <path d="M 0 160 Q 300 130 1200 180" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" fill="none" />
        <path d="M 0 380 L 1200 350" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" fill="none" />
        <path d="M 0 580 L 1200 560" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" fill="none" />
        <path d="M 280 0 L 320 800" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" fill="none" />
        <path d="M 680 0 L 650 800" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" fill="none" />

        {/* LIGHTING DENSITY HEATMAP LAYER */}
        {showLightingHeatmap && (
          <g id="lightingHeatmapLayer">
            <circle cx="28%" cy="35%" r="120" fill="url(#highLuxZone)" />
            <circle cx="75%" cy="32%" r="110" fill="url(#highLuxZone)" />
            <circle cx="48%" cy="58%" r="95" fill="url(#moderateLuxZone)" />
            <circle cx="68%" cy="22%" r="85" fill="url(#darkAlleyZone)" />

            <path
              d="M 0 160 Q 300 130 1200 180"
              stroke="#22C55E"
              strokeWidth="4"
              strokeDasharray="8 6"
              fill="none"
              opacity="0.75"
            />
          </g>
        )}

        {/* Live Turn-by-Turn Safe Walk Back Return Path */}
        {selectedLocation && (
          <g id="safeWalkRouting">
            <path
              d="M 300 240 L 300 160 L 660 165"
              stroke="#22C55E"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="6 6"
              fill="none"
              style={{ animation: 'dash 1.2s linear infinite' }}
            />
            <path
              d="M 300 240 L 500 320 L 660 165"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="3 4"
              fill="none"
              opacity="0.5"
            />
          </g>
        )}
      </svg>

      {/* Live GPS Telemetry Floating Badge */}
      <div
        style={{
          position: 'absolute',
          top: isFullscreen ? 'calc(env(safe-area-inset-top, 0px) + 110px)' : '14px',
          right: '14px',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid #334155',
          fontSize: '0.725rem',
          color: gpsActive ? '#22C55E' : '#38BDF8',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          pointerEvents: 'auto',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <LocateFixed size={13} />
        <span>{gpsActive ? 'Live GPS Active' : 'SF SOMA Grid'}</span>
      </div>

      {/* Target Destination Marker */}
      {selectedDestination && (
        <div
          style={{
            position: 'absolute',
            top: '32%',
            left: '68%',
            transform: 'translate(-50%, -100%)',
            zIndex: 25,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
              color: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.pill,
              fontSize: '0.75rem',
              fontWeight: 700,
              boxShadow: SAFE_PARK_TOKENS.shadows.glowBlue,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            <MapPin size={12} />
            <span>Target: {selectedDestination.name.split(' ')[0]}</span>
          </div>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `6px solid ${SAFE_PARK_TOKENS.colors.brand.primary}`,
            }}
          />
        </div>
      )}

      {/* Dynamic Interactive Parking Spot Pins */}
      {locations.map((loc, index) => {
        const isSelected = selectedLocation?.id === loc.id;
        const isParkedHere = parkedLocation?.id === loc.id;
        const status = getStatusStyle(loc.csi.totalScore);

        const xPos = 24 + (index % 3) * 28 + (index > 2 ? 10 : 0);
        const yPos = index === 0 ? 38 : index === 1 ? 58 : index === 2 ? 28 : 48;

        return (
          <button
            key={loc.id}
            onClick={() => setSelectedLocation(loc)}
            aria-label={`${loc.name}, CSI score ${loc.csi.totalScore}, rate $${loc.hourlyRate} per hour`}
            style={{
              position: 'absolute',
              top: `${yPos}%`,
              left: `${xPos}%`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: isSelected || isParkedHere ? 30 : 15,
              transition: 'transform 0.2s ease',
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '44px',
              minHeight: '44px',
              justifyContent: 'center',
            }}
          >
            {/* Active Selection Glow Ring */}
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  inset: '-6px',
                  borderRadius: '50%',
                  backgroundColor: status.hex,
                  opacity: 0.4,
                  animation: 'pulse 1.6s infinite',
                }}
              />
            )}

            {/* Pin Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: isSelected ? '#FFFFFF' : '#1E293B',
                color: isSelected ? '#0F172A' : '#FFFFFF',
                border: `2px solid ${status.hex}`,
                boxShadow: isSelected ? `0 0 14px ${status.hex}` : SAFE_PARK_TOKENS.shadows.card,
                padding: '4px 8px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: status.hex,
                  boxShadow: `0 0 6px ${status.hex}`,
                }}
              />
              <span className="tabular-nums">CSI {loc.csi.totalScore}</span>
              <span style={{ fontSize: '0.7rem', color: isSelected ? '#475569' : '#94A3B8' }}>
                • ${loc.hourlyRate}
              </span>
              {isParkedHere && (
                <span
                  style={{
                    backgroundColor: '#22C55E',
                    color: '#0F172A',
                    fontSize: '0.65rem',
                    padding: '1px 4px',
                    borderRadius: '3px',
                    fontWeight: 800,
                  }}
                >
                  PARKED
                </span>
              )}
            </div>

            {/* Label below marker */}
            <div
              style={{
                fontSize: '0.675rem',
                color: '#CBD5E1',
                textAlign: 'center',
                marginTop: '4px',
                maxWidth: '120px',
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {loc.name}
            </div>
          </button>
        );
      })}

      {/* User Motion Entity: Vehicle Marker / Walking Avatar */}
      <div
        style={{
          position: 'absolute',
          top: motionState === 'walking' ? '42%' : '72%',
          left: motionState === 'walking' ? '46%' : '30%',
          transform: 'translate(-50%, -50%)',
          zIndex: 22,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'all 0.6s ease',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: motionState === 'walking' ? '#22C55E' : SAFE_PARK_TOKENS.colors.brand.primary,
            border: '3px solid #FFFFFF',
            boxShadow: `0 0 12px ${motionState === 'walking' ? '#22C55E' : '#2C73D2'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {motionState === 'walking' ? (
            <Footprints size={13} color="#000000" />
          ) : (
            <Car size={13} color="#FFFFFF" />
          )}
        </div>
        <span
          style={{
            fontSize: '0.65rem',
            color: '#FFFFFF',
            fontWeight: 700,
            marginTop: '2px',
            textShadow: '0 1px 3px #000',
          }}
        >
          {motionState === 'walking' ? 'Walking Return' : motionState === 'parked' ? 'Vehicle Stowed' : 'Your Location'}
        </span>
      </div>
    </div>
  );
};
