import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getStatusStyle, SAFE_PARK_TOKENS } from '../../../theme/tokens';
import {
  Car,
  MapPin,
  LocateFixed,
  ShieldCheck,
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
    motionState,
    parkedLocation,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Map Center State that tracks destination coordinate changes
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: selectedDestination?.coordinates.lat || 37.7842,
    lng: selectedDestination?.coordinates.lng || -122.4015,
  });

  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [deviceCoordinates, setDeviceCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 37.7812,
    lng: -122.4001,
  });
  const [gpsActive, setGpsActive] = useState<boolean>(false);

  // Smoothly pan / flyTo new destination when selectedDestination changes
  useEffect(() => {
    if (selectedDestination?.coordinates) {
      setIsPanning(true);
      const timer = setTimeout(() => {
        setMapCenter({
          lat: selectedDestination.coordinates.lat,
          lng: selectedDestination.coordinates.lng,
        });
        setIsPanning(false);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [selectedDestination]);

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
          console.warn('Geolocation fallback to destination coordinates:', err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Coordinate Projection Helper: Maps Lat/Lng relative to mapCenter on a 0-100% canvas
  const projectCoordinate = (lat: number, lng: number) => {
    const scaleLng = 11800;
    const scaleLat = 9400;

    const x = 50 + (lng - mapCenter.lng) * scaleLng;
    const y = 46 - (lat - mapCenter.lat) * scaleLat;

    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(12, Math.min(88, y)),
    };
  };

  const destCoords = selectedDestination?.coordinates || mapCenter;
  const destProjected = projectCoordinate(destCoords.lat, destCoords.lng);

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
        backgroundColor: '#F8FAFC', // Daylight Slate 50 Foundation
        borderRadius: isFullscreen ? 0 : SAFE_PARK_TOKENS.borderRadius.lg,
        border: isFullscreen ? 'none' : '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: isFullscreen ? 'none' : SAFE_PARK_TOKENS.shadows.card,
        transition: 'background-color 0.3s ease',
        touchAction: 'pan-x pan-y pinch-zoom',
        zIndex: isFullscreen ? 0 : 1,
      }}
    >
      {/* Daylight Vector Street Grid & Lighting Heatmap Render Engine */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <defs>
          <pattern id="daylightGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#E2E8F0" strokeWidth="1" />
          </pattern>

          {/* Daylight Radial Lighting Glow Gradients */}
          <radialGradient id="highLuxZoneDay" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#22C55E" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="moderateLuxZoneDay" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="darkAlleyZoneDay" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Vector Base Grid */}
        <rect width="100%" height="100%" fill="url(#daylightGrid)" />

        {/* High-Clarity Daylight Vector Streets (Carto Voyager Palette) */}
        <g opacity={isPanning ? 0.7 : 1} style={{ transition: 'opacity 0.3s ease' }}>
          {/* Road Borders */}
          <path d="M 0 220 Q 400 190 1400 240" stroke="#CBD5E1" strokeWidth="26" fill="none" />
          <path d="M 0 440 L 1400 420" stroke="#CBD5E1" strokeWidth="24" fill="none" />
          <path d="M 0 660 L 1400 640" stroke="#CBD5E1" strokeWidth="22" fill="none" />
          <path d="M 320 0 L 360 900" stroke="#CBD5E1" strokeWidth="24" fill="none" />
          <path d="M 720 0 L 690 900" stroke="#CBD5E1" strokeWidth="24" fill="none" />

          {/* Clean White Road Surfaces */}
          <path d="M 0 220 Q 400 190 1400 240" stroke="#FFFFFF" strokeWidth="22" fill="none" />
          <path d="M 0 440 L 1400 420" stroke="#FFFFFF" strokeWidth="20" fill="none" />
          <path d="M 0 660 L 1400 640" stroke="#FFFFFF" strokeWidth="18" fill="none" />
          <path d="M 320 0 L 360 900" stroke="#FFFFFF" strokeWidth="20" fill="none" />
          <path d="M 720 0 L 690 900" stroke="#FFFFFF" strokeWidth="20" fill="none" />

          {/* Subtle Road Centerlines */}
          <path d="M 0 220 Q 400 190 1400 240" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
          <path d="M 0 440 L 1400 420" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
          <path d="M 0 660 L 1400 640" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
          <path d="M 320 0 L 360 900" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
          <path d="M 720 0 L 690 900" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
        </g>

        {/* LIGHTING DENSITY HEATMAP LAYER */}
        {showLightingHeatmap && (
          <g id="lightingHeatmapLayer">
            <circle cx="34%" cy="40%" r="130" fill="url(#highLuxZoneDay)" />
            <circle cx="68%" cy="36%" r="120" fill="url(#highLuxZoneDay)" />
            <circle cx="50%" cy="62%" r="105" fill="url(#moderateLuxZoneDay)" />
            <circle cx="82%" cy="24%" r="90" fill="url(#darkAlleyZoneDay)" />
          </g>
        )}

        {/* Turn-by-Turn Safe Walk Back Illuminated Return Path */}
        {selectedLocation && (
          <g id="safeWalkRouting">
            {(() => {
              const spotProj = projectCoordinate(
                selectedLocation.coordinates.lat,
                selectedLocation.coordinates.lng
              );
              const dX = `${destProjected.x}%`;
              const dY = `${destProjected.y}%`;
              const sX = `${spotProj.x}%`;
              const sY = `${spotProj.y}%`;

              return (
                <>
                  <line
                    x1={sX}
                    y1={sY}
                    x2={dX}
                    y2={dY}
                    stroke="#16A34A"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="7 7"
                  />
                  {/* Outer Safety Aura */}
                  <line
                    x1={sX}
                    y1={sY}
                    x2={dX}
                    y2={dY}
                    stroke="#22C55E"
                    strokeWidth="14"
                    strokeLinecap="round"
                    opacity="0.25"
                  />
                </>
              );
            })()}
          </g>
        )}
      </svg>

      {/* Live GPS & Neighborhood Floating Indicator */}
      <div
        style={{
          position: 'absolute',
          top: isFullscreen ? 'calc(env(safe-area-inset-top, 0px) + 72px)' : '14px',
          right: '14px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid #CBD5E1',
          fontSize: '0.725rem',
          fontWeight: 700,
          color: '#0F172A',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          pointerEvents: 'auto',
          zIndex: 10,
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.08)',
        }}
      >
        <LocateFixed size={13} color="#2563EB" />
        <span>{selectedDestination ? `${selectedDestination.name.split(' ')[0]} • SF Grid` : 'SF Live Grid'}</span>
      </div>

      {/* Target Destination Drop Pin (Cobalt Blue with Dark Text Pill) */}
      {selectedDestination && (
        <div
          style={{
            position: 'absolute',
            top: `${destProjected.y}%`,
            left: `${destProjected.x}%`,
            transform: 'translate(-50%, -100%)',
            zIndex: 25,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
            transition: 'top 0.5s ease, left 0.5s ease',
          }}
        >
          {/* Radar Ring Pulse */}
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#2563EB',
              opacity: 0.2,
              animation: 'pulse 1.8s infinite',
            }}
          />

          {/* Destination Pill Badge (Crisp White Surface & Slate 900 Text) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '5px 12px',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.pill,
              fontSize: '0.75rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              border: '1.5px solid #CBD5E1',
            }}
          >
            <MapPin size={13} color="#2563EB" />
            <span>Target: {selectedDestination.name}</span>
          </div>

          {/* Cobalt Blue Pin Arrow */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '8px solid #2563EB',
            }}
          />
        </div>
      )}

      {/* Dynamic Interactive Parking Spot Pins (Daylight Contrast) */}
      {locations.map((loc) => {
        const isSelected = selectedLocation?.id === loc.id;
        const isParkedHere = parkedLocation?.id === loc.id;
        const status = getStatusStyle(loc.csi.totalScore);
        const proj = projectCoordinate(loc.coordinates.lat, loc.coordinates.lng);

        return (
          <button
            key={loc.id}
            onClick={() => setSelectedLocation(loc)}
            aria-label={`${loc.name}, CSI score ${loc.csi.totalScore}, rate $${loc.hourlyRate} per hour`}
            style={{
              position: 'absolute',
              top: `${proj.y}%`,
              left: `${proj.x}%`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: isSelected || isParkedHere ? 30 : 15,
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
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
                  backgroundColor: status.dot,
                  opacity: 0.3,
                  animation: 'pulse 1.4s infinite',
                }}
              />
            )}

            {/* Spot Badge Pin (Pure White with Dark Text & Colored Accent) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: `2px solid ${status.dot}`,
                boxShadow: isSelected
                  ? `0 0 0 2px #2563EB, 0 4px 14px rgba(15, 23, 42, 0.18)`
                  : '0 2px 8px rgba(15, 23, 42, 0.12)',
                padding: isSelected ? '4px 10px' : '3px 8px',
                borderRadius: '16px',
                fontSize: '0.725rem',
                fontWeight: 800,
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              {isParkedHere ? (
                <Car size={13} color="#15803D" />
              ) : loc.csi.totalScore >= 75 ? (
                <ShieldCheck size={13} color="#15803D" />
              ) : (
                <div
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: status.dot,
                  }}
                />
              )}
              <span>CSI {loc.csi.totalScore}</span>
              <span style={{ color: '#64748B', fontSize: '0.675rem' }}>${loc.hourlyRate}</span>
            </div>

            {/* Pin Pointer Arrow */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: `5px solid ${status.dot}`,
                marginTop: '-1px',
              }}
            />
          </button>
        );
      })}
    </div>
  );
};
