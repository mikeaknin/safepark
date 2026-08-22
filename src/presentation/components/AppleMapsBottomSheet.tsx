import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { ParkingLocation } from '../../domain/models/ParkingLocation';
import { ParkingFacilityCard } from './ParkingFacilityCard';
import { SAFE_PARK_TOKENS, getStatusStyle } from '../../theme/tokens';
import {
  ChevronUp,
  ChevronDown,
  Car,
  Footprints,
  Navigation,
  ShieldCheck,
  Info,
  Sparkles,
  MapPin,
  Clock,
  Layers
} from 'lucide-react';

export type SheetSnapPoint = 'peek' | 'mid' | 'expanded';

interface AppleMapsBottomSheetProps {
  onInspectCsi: (loc: ParkingLocation) => void;
  onSafeWalk: (loc: ParkingLocation) => void;
  onReportHazard: (loc: ParkingLocation) => void;
}

export const AppleMapsBottomSheet: React.FC<AppleMapsBottomSheetProps> = ({
  onInspectCsi,
  onSafeWalk,
  onReportHazard,
}) => {
  const {
    locations,
    selectedLocation,
    setSelectedLocation,
    parkedLocation,
    handleParkHere,
    selectedDestination,
  } = useApp();

  const [snapPoint, setSnapPoint] = useState<SheetSnapPoint>('peek');
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const lastTouchY = useRef<number | null>(null);

  // Height mappings based on window viewport
  const getSnapHeight = useCallback((snap: SheetSnapPoint): number => {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    switch (snap) {
      case 'peek':
        return 120;
      case 'mid':
        return Math.round(vh * 0.50);
      case 'expanded':
        return Math.round(vh * 0.85);
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

    // Prevent collision with scroll container when expanded
    if (snapPoint === 'expanded' && scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      // If user is scrolled down into list and swipes down, allow native scroll instead of dragging
      if (scrollTop > 0 && deltaY > 0) {
        return;
      }
    }

    lastTouchY.current = currentY;
    setDragOffset(deltaY);
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null || lastTouchY.current === null || touchStartTime.current === null) {
      touchStartY.current = null;
      lastTouchY.current = null;
      touchStartTime.current = null;
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const deltaY = lastTouchY.current - touchStartY.current;
    const deltaTime = Math.max(1, Date.now() - touchStartTime.current);
    const velocity = deltaY / deltaTime; // px/ms

    // Determine target snap based on velocity & displacement
    if (velocity < -0.5 || deltaY < -150) {
      // Swiping UP fast or dragged significantly up
      if (snapPoint === 'peek') {
        setSnapPoint('mid');
      } else if (snapPoint === 'mid') {
        setSnapPoint('expanded');
      }
    } else if (velocity > 0.5 || deltaY > 150) {
      // Swiping DOWN fast or dragged significantly down
      if (snapPoint === 'expanded') {
        setSnapPoint('mid');
      } else if (snapPoint === 'mid') {
        setSnapPoint('peek');
      }
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
        backgroundColor: '#1E293B',
        borderTop: '1px solid rgba(51, 65, 85, 0.8)',
        borderTopLeftRadius: '22px',
        borderTopRightRadius: '22px',
        boxShadow: '0 -10px 36px rgba(0, 0, 0, 0.65)',
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
          backgroundColor: '#1E293B',
          flexShrink: 0,
        }}
      >
        {/* iOS Standard 32x4px Centered Drag Pill */}
        <div
          style={{
            width: '36px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: '#64748B',
            marginBottom: '6px',
          }}
        />

        <div
          style={{
            width: '100%',
            padding: '0 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {snapPoint === 'peek'
                ? 'Recommended Spot'
                : snapPoint === 'mid'
                ? `Ranked Facilities (${locations.length})`
                : 'Facility Inspection & Route'}
            </span>
            {selectedDestination && (
              <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                • near {selectedDestination.name.split(' ')[0]}
              </span>
            )}
          </div>

          <button
            aria-label={snapPoint === 'expanded' ? 'Collapse drawer' : 'Expand drawer'}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#38BDF8',
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

      {/* Peek Mode (120px fixed height): Clean Unclipped Spot Overview Card */}
      {snapPoint === 'peek' && topRankedSpot && activeSpotStatus && (
        <div
          style={{
            padding: '4px 14px 10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flex: 1,
            gap: '8px',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  backgroundColor: `${activeSpotStatus.hex}22`,
                  color: activeSpotStatus.hex,
                  border: `1px solid ${activeSpotStatus.hex}`,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                CSI {topRankedSpot.csi.totalScore}
              </span>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {topRankedSpot.name}
              </span>
            </div>
            <div style={{ fontSize: '0.725rem', color: '#94A3B8', marginTop: '2px', display: 'flex', gap: '6px', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span style={{ fontWeight: 700, color: '#38BDF8' }}>${topRankedSpot.hourlyRate}/hr</span>
              <span>•</span>
              <span>{topRankedSpot.availableSpaces} spaces</span>
              {currentLitRoute && (
                <>
                  <span>•</span>
                  <span style={{ color: '#22C55E', fontWeight: 600 }}>{currentLitRoute.estimatedWalkingMinutes} min walk</span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSafeWalk(topRankedSpot);
              }}
              aria-label={`View on foot refined walk return route for ${topRankedSpot.name}`}
              style={{
                backgroundColor: '#0F172A',
                color: '#38BDF8',
                border: '1px solid #22C55E',
                borderRadius: '8px',
                padding: '4px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                minHeight: '44px',
                textAlign: 'left',
              }}
            >
              <Footprints size={15} color="#22C55E" style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF' }}>On Foot</span>
                <span style={{ fontSize: '0.575rem', color: '#94A3B8', fontWeight: 500 }}>Refined Walk</span>
              </div>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleParkHere(topRankedSpot);
              }}
              disabled={parkedLocation?.id === topRankedSpot.id}
              style={{
                backgroundColor: parkedLocation?.id === topRankedSpot.id ? '#22C55E' : SAFE_PARK_TOKENS.colors.brand.primary,
                color: parkedLocation?.id === topRankedSpot.id ? '#0F172A' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: parkedLocation?.id === topRankedSpot.id ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                minHeight: '44px',
              }}
            >
              <Car size={15} />
              <span>{parkedLocation?.id === topRankedSpot.id ? 'Parked' : 'Park Here'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mid & Full-Sheet Mode: Scrollable Facility Ranking & Inspection List */}
      {snapPoint !== 'peek' && (
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 14px 20px 14px',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {/* Active Facility Inspection Card (if selected) */}
          {selectedLocation && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#38BDF8" />
                  <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase' }}>
                    Selected Target Facility
                  </span>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    minHeight: '36px',
                    padding: '0 4px',
                  }}
                >
                  Clear Selection
                </button>
              </div>

              <ParkingFacilityCard
                location={selectedLocation}
                isSelected={true}
                isParkedHere={parkedLocation?.id === selectedLocation.id}
                showFullDetails={snapPoint === 'expanded'}
                onSelect={(loc) => setSelectedLocation(loc)}
                onParkHere={(loc) => handleParkHere(loc)}
                onInspectCsi={onInspectCsi}
                onSafeWalk={onSafeWalk}
                onReportHazard={onReportHazard}
              />
            </div>
          )}

          {/* List of Nearby Ranked Parking Facilities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                All Facilities Ranked by CSI
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                Sorted: Highest Safety First
              </span>
            </div>

            {locations
              .filter((loc) => loc.id !== selectedLocation?.id)
              .map((loc) => (
                <ParkingFacilityCard
                  key={loc.id}
                  location={loc}
                  isSelected={selectedLocation?.id === loc.id}
                  isParkedHere={parkedLocation?.id === loc.id}
                  showFullDetails={snapPoint === 'expanded'}
                  onSelect={(l) => setSelectedLocation(l)}
                  onParkHere={(l) => handleParkHere(l)}
                  onInspectCsi={onInspectCsi}
                  onSafeWalk={onSafeWalk}
                  onReportHazard={onReportHazard}
                />
              ))}
          </div>
        </div>
      )}
    </section>
  );
};
