import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { ParkingLocation } from '../../domain/models/ParkingLocation';
import { ParkingFacilityCard } from './ParkingFacilityCard';
import { ActiveParkedSpotCard } from './ActiveParkedSpotCard';
import { SAFE_PARK_TOKENS, getStatusStyle } from '../../theme/tokens';
import {
  ChevronUp,
  ChevronDown,
  Navigation,
  Footprints,
  ShieldCheck,
  Building2,
  Car,
  Filter,
} from 'lucide-react';

export type SnapPoint = 'peek' | 'mid' | 'expanded';
export type SheetSnapPoint = SnapPoint;

interface AppleMapsBottomSheetProps {
  onInspectCsi: (loc: ParkingLocation) => void;
  onSafeWalk: (loc: ParkingLocation) => void;
  onReportHazard: (loc: ParkingLocation) => void;
  onOpenDirections?: (loc: ParkingLocation) => void;
}

export const AppleMapsBottomSheet: React.FC<AppleMapsBottomSheetProps> = ({
  onInspectCsi,
  onSafeWalk,
  onReportHazard,
  onOpenDirections,
}) => {
  const {
    locations,
    selectedLocation,
    setSelectedLocation,
    selectedDestination,
    parkedLocation,
    activeParkedSession,
    handleParkHere,
  } = useApp();

  const [snapPoint, setSnapPoint] = useState<SnapPoint>('peek');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const sheetRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTouchY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);

  // Height calculations based on viewport
  const getSnapHeight = useCallback((snap: SnapPoint): number => {
    const vh = window.innerHeight || 800;
    switch (snap) {
      case 'peek':
        return 120; // 120px fixed Peek height
      case 'mid':
        return Math.round(vh * 0.50); // 50vh Mid height
      case 'expanded':
        return Math.round(vh * 0.85); // 85vh Full height
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    lastTouchY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    lastTouchY.current = currentY;

    // Resistance dampening if dragging beyond top or bottom
    if (snapPoint === 'expanded' && deltaY < 0) {
      setDragOffset(deltaY * 0.2);
    } else if (snapPoint === 'peek' && deltaY > 0) {
      setDragOffset(deltaY * 0.2);
    } else {
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null || lastTouchY.current === null) {
      setIsDragging(false);
      return;
    }

    const totalDeltaY = lastTouchY.current - touchStartY.current;
    const duration = Date.now() - (touchStartTime.current || 0);
    const velocity = totalDeltaY / (duration || 1); // px per ms

    const threshold = 60; // px threshold to trigger snap change

    if (velocity < -0.4 || totalDeltaY < -threshold) {
      // Swiped UP
      if (snapPoint === 'peek') setSnapPoint('mid');
      else if (snapPoint === 'mid') setSnapPoint('expanded');
    } else if (velocity > 0.4 || totalDeltaY > threshold) {
      // Swiped DOWN
      if (snapPoint === 'expanded') setSnapPoint('mid');
      else if (snapPoint === 'mid') setSnapPoint('peek');
    }

    touchStartY.current = null;
    lastTouchY.current = null;
    touchStartTime.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  const cycleSnapPoint = () => {
    if (snapPoint === 'peek') setSnapPoint('mid');
    else if (snapPoint === 'mid') setSnapPoint('expanded');
    else setSnapPoint('peek');
  };

  const topRankedSpot = selectedLocation || locations[0];
  const activeSpotStatus = topRankedSpot ? getStatusStyle(topRankedSpot.csi.totalScore) : null;
  const currentLitRoute = topRankedSpot?.walkingRoutes?.find((r) => r.isRecommendedLitPath);

  const currentHeight = getSnapHeight(snapPoint);

  return (
    <section
      aria-label="Apple Maps Safe Parking Drawer"
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)',
        left: 0,
        right: 0,
        height: `${currentHeight}px`,
        transform: isDragging ? `translateY(${Math.max(-100, Math.min(200, dragOffset))}px)` : 'translateY(0px)',
        transition: isDragging ? 'none' : 'height 300ms cubic-bezier(0.25, 1, 0.5, 1), transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid #CBD5E1',
        borderTopLeftRadius: '22px',
        borderTopRightRadius: '22px',
        boxShadow: '0 -4px 30px rgba(15, 23, 42, 0.12)',
        zIndex: 35,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        willChange: 'transform, height',
      }}
    >
      {/* Header & Drag Handle Area */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={cycleSnapPoint}
        style={{
          width: '100%',
          paddingTop: '8px',
          paddingBottom: '4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
          backgroundColor: 'transparent',
          flexShrink: 0,
        }}
      >
        {/* Centered Drag Pill */}
        <div
          style={{
            width: '36px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: '#CBD5E1',
            marginBottom: '6px',
          }}
        />

        <div
          style={{
            width: '100%',
            padding: '0 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {snapPoint === 'peek'
                ? 'Recommended Spot'
                : snapPoint === 'mid'
                ? `Ranked Facilities (${locations.length})`
                : 'Facility Inspection & Route'}
            </span>
            {selectedDestination && (
              <span style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                • near {selectedDestination.name.split(' ')[0]}
              </span>
            )}
          </div>

          <button
            aria-label={snapPoint === 'expanded' ? 'Collapse drawer' : 'Expand drawer'}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: '36px',
              padding: '0 6px',
              flexShrink: 0,
            }}
          >
            <span>{snapPoint === 'expanded' ? 'Collapse' : snapPoint === 'mid' ? 'Full View' : 'Explore All'}</span>
            {snapPoint === 'expanded' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Peek Mode (120px fixed height): Dedicated Full-Width Title Row & Unclipped Action Bar */}
      {snapPoint === 'peek' && topRankedSpot && activeSpotStatus && (() => {
        const isMeter = topRankedSpot.infrastructure.structureType === 'curbside_street_metered';
        const is2Hr = topRankedSpot.hourlyRate === 0 || topRankedSpot.infrastructure.structureType === 'curbside_residential';
        const tagText = isMeter ? '🅿️ Meter' : is2Hr ? '⏱️ 2-Hr Free' : '🏢 Garage';
        const tagBg = isMeter ? '#EFF6FF' : is2Hr ? '#ECFDF5' : '#FAF5FF';
        const tagColor = isMeter ? '#1D4ED8' : is2Hr ? '#047857' : '#7E22CE';
        const tagBorder = isMeter ? '#BFDBFE' : is2Hr ? '#A7F3D0' : '#E9D5FF';

        return (
          <div
            style={{
              padding: '6px 16px 10px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flex: 1,
              gap: '4px',
              minWidth: 0,
            }}
          >
            {/* Dedicated Full-Width Title Container - Zero Horizontal Competition */}
            <div style={{ width: '100%', minWidth: 0 }}>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  margin: 0,
                  lineHeight: 1.25,
                }}
                title={topRankedSpot.name}
              >
                {topRankedSpot.name}
              </h3>
            </div>

            {/* Badges, Curbside Telemetry & Quick Action Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                minWidth: 0,
                width: '100%',
              }}
            >
              {/* Left Badges & Pricing */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    backgroundColor: tagBg,
                    color: tagColor,
                    border: `1px solid ${tagBorder}`,
                    padding: '1px 6px',
                    borderRadius: '5px',
                    fontSize: '0.675rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tagText}
                </span>

                <span
                  style={{
                    backgroundColor: activeSpotStatus.bg,
                    color: activeSpotStatus.text,
                    border: `1px solid ${activeSpotStatus.border}`,
                    padding: '1px 6px',
                    borderRadius: '5px',
                    fontSize: '0.675rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  🛡️ CSI {topRankedSpot.csi.totalScore}
                </span>

                <span style={{ fontWeight: 800, color: topRankedSpot.hourlyRate === 0 ? '#15803D' : '#2563EB', fontSize: '0.75rem' }}>
                  {topRankedSpot.hourlyRate === 0 ? 'Free' : `$${topRankedSpot.hourlyRate.toFixed(2)}/hr`}
                </span>

                {currentLitRoute && (
                  <span style={{ color: '#15803D', fontWeight: 700, fontSize: '0.725rem' }}>
                    • {currentLitRoute.estimatedWalkingMinutes}m walk
                  </span>
                )}
              </div>

              {/* Right Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                {onOpenDirections && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDirections(topRankedSpot);
                    }}
                    aria-label={`Open driving directions to ${topRankedSpot.name}`}
                    title="In-Car Directions"
                    style={{
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      border: '1px solid #BFDBFE',
                      borderRadius: '8px',
                      padding: '5px 9px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      minHeight: '32px',
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <Navigation size={12} />
                    <span>Nav</span>
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleParkHere(topRankedSpot);
                  }}
                  disabled={parkedLocation?.id === topRankedSpot.id}
                  style={{
                    backgroundColor: parkedLocation?.id === topRankedSpot.id ? '#15803D' : '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '5px 11px',
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    cursor: parkedLocation?.id === topRankedSpot.id ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    minHeight: '32px',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  <Car size={12} />
                  <span>{parkedLocation?.id === topRankedSpot.id ? 'Parked' : 'Park Here'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Mid & Full Modes: Scrollable List of Ranked Facilities */}
      {snapPoint !== 'peek' && (
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px 24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#F8FAFC',
          }}
        >
          {/* Active Parked Vehicle Session Card (Find My Car & Countdown Timer) */}
          {activeParkedSession && (
            <ActiveParkedSpotCard
              session={activeParkedSession}
              className="mb-2"
            />
          )}

          {locations.map((loc) => (
            <ParkingFacilityCard
              key={loc.id}
              location={loc}
              isSelected={selectedLocation?.id === loc.id}
              isParkedHere={parkedLocation?.id === loc.id || activeParkedSession?.locationId === loc.id}
              showFullDetails={snapPoint === 'expanded'}
              onSelect={(l) => {
                setSelectedLocation(l);
              }}
              onInspectCsi={onInspectCsi}
              onSafeWalk={onSafeWalk}
              onParkHere={handleParkHere}
              onReportHazard={onReportHazard}
              onOpenDirections={onOpenDirections}
            />
          ))}
        </div>
      )}
    </section>
  );
};
