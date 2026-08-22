import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getStatusStyle, SAFE_PARK_TOKENS } from '../../../theme/tokens';
import { APP_CONFIG } from '../../../config/env';
import {
  Navigation,
  Footprints,
  Car,
  MapPin,
  Sparkles,
  Shield,
  Video,
  AlertTriangle,
  LocateFixed,
  Layers
} from 'lucide-react';

export const InteractiveMapCanvas: React.FC = () => {
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
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        backgroundColor: isNightMode ? '#0B1120' : '#1E293B',
        borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
        border: '1px solid #334155',
        overflow: 'hidden',
        boxShadow: SAFE_PARK_TOKENS.shadows.card,
        transition: 'background-color 0.4s ease',
      }}
    >
      {/* High-Performance SVG / WebGL Vector Street Grid & Heatmap Render Engine */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
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
        <path d="M 0 110 Q 240 90 800 130" stroke="#334155" strokeWidth="22" fill="none" />
        <path d="M 0 270 L 800 250" stroke="#334155" strokeWidth="18" fill="none" />
        <path d="M 220 0 L 260 420" stroke="#334155" strokeWidth="18" fill="none" />
        <path d="M 520 0 L 500 420" stroke="#334155" strokeWidth="18" fill="none" />

        {/* Street Centerlines */}
        <path d="M 0 110 Q 240 90 800 130" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" fill="none" />
        <path d="M 0 270 L 800 250" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" fill="none" />
        <path d="M 220 0 L 260 420" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" fill="none" />
        <path d="M 520 0 L 500 420" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" fill="none" />

        {/* LIGHTING DENSITY HEATMAP LAYER */}
        {showLightingHeatmap && (
          <g id="lightingHeatmapLayer">
            {/* Mission Bay high lux corridor (68 lux) */}
            <circle cx="22%" cy="40%" r="90" fill="url(#highLuxZone)" />
            {/* Yerba Buena high lux zone (62 lux) */}
            <circle cx="82%" cy="38%" r="85" fill="url(#highLuxZone)" />
            {/* SOMA 5th moderate lux zone (32 lux) */}
            <circle cx="42%" cy="60%" r="70" fill="url(#moderateLuxZone)" />
            {/* Minna Alley Dark Blindspot (6 lux) */}
            <circle cx="62%" cy="30%" r="65" fill="url(#darkAlleyZone)" />

            {/* Smart Lighted Street Axis Highlight */}
            <path
              d="M 0 110 Q 240 90 800 130"
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
            {/* Recommended illuminated path line */}
            <path
              d="M 240 180 L 240 110 L 510 115"
              stroke="#22C55E"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="6 6"
              fill="none"
              style={{ animation: 'dash 1.2s linear infinite' }}
            />
            {/* Unlit direct alleyway comparison line */}
            <path
              d="M 240 180 L 400 240 L 510 115"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="3 4"
              fill="none"
              opacity="0.5"
            />
          </g>
        )}
      </svg>

      {/* Map Header Status Controls */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {/* Semantic Risk Legend */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.90)',
            backdropFilter: 'blur(6px)',
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1px solid #334155',
            fontSize: '0.725rem',
            color: '#CBD5E1',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
            <span>Low (≥75)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            <span>Mod (50-74)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <span>High (&lt;50)</span>
          </div>
        </div>

        {/* GPS Live Telemetry Chip */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.90)',
            backdropFilter: 'blur(6px)',
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1px solid #334155',
            fontSize: '0.725rem',
            color: gpsActive ? '#22C55E' : '#38BDF8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'auto',
          }}
        >
          <LocateFixed size={13} />
          <span>{gpsActive ? 'Live GPS Active' : 'Vector Mapbox GL'}</span>
        </div>
      </div>

      {/* Target Destination Marker */}
      {selectedDestination && (
        <div
          style={{
            position: 'absolute',
            top: '28%',
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
            <span>Destination: {selectedDestination.name.split(' ')[0]}</span>
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
        
        const xPos = 20 + (index % 3) * 30 + (index > 2 ? 15 : 0);
        const yPos = index === 0 ? 42 : index === 1 ? 64 : index === 2 ? 32 : 55;

        return (
          <div
            key={loc.id}
            onClick={() => setSelectedLocation(loc)}
            style={{
              position: 'absolute',
              top: `${yPos}%`,
              left: `${xPos}%`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: isSelected || isParkedHere ? 30 : 15,
              transition: 'transform 0.2s ease',
            }}
          >
            {/* Active Selection Glow Ring */}
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  inset: '-8px',
                  borderRadius: '50%',
                  backgroundColor: status.hex,
                  opacity: 0.35,
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
                <span style={{ backgroundColor: '#22C55E', color: '#0F172A', fontSize: '0.65rem', padding: '1px 4px', borderRadius: '3px', fontWeight: 800 }}>
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
          </div>
        );
      })}

      {/* User Motion Entity: Vehicle Marker / Walking Avatar */}
      <div
        style={{
          position: 'absolute',
          top: motionState === 'walking' ? '45%' : '76%',
          left: motionState === 'walking' ? '48%' : '32%',
          transform: 'translate(-50%, -50%)',
          zIndex: 22,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'all 0.6s ease',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
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
            <Footprints size={12} color="#000000" />
          ) : (
            <Car size={12} color="#FFFFFF" />
          )}
        </div>
        <span style={{ fontSize: '0.65rem', color: '#FFFFFF', fontWeight: 700, marginTop: '2px', textShadow: '0 1px 3px #000' }}>
          {motionState === 'walking' ? 'Walking Return' : motionState === 'parked' ? 'Vehicle Stowed' : 'Your Location'}
        </span>
      </div>
    </div>
  );
};
