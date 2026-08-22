import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ParkingLocation } from '../../../domain/models/ParkingLocation';
import { SpotCard } from '../map/SpotCard';
import { SAFE_PARK_TOKENS, getStatusStyle } from '../../../theme/tokens';
import {
  ChevronUp,
  ChevronDown,
  Car,
  Footprints,
} from 'lucide-react';

export type SheetSnapPoint = 'peek' | 'mid' | 'expanded';

interface MobileBottomSheetProps {
  onInspectCsi: (loc: ParkingLocation) => void;
  onSafeWalk: (loc: ParkingLocation) => void;
  onReportHazard: (loc: ParkingLocation) => void;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
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
  } = useApp();

  const [snapPoint, setSnapPoint] = useState<SheetSnapPoint>('peek');
  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);

  // Height mappings for snap points
  const getHeight = () => {
    switch (snapPoint) {
      case 'peek':
        return '140px';
      case 'mid':
        return '50vh';
      case 'expanded':
        return '84vh';
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null || touchCurrentY.current === null) {
      touchStartY.current = null;
      touchCurrentY.current = null;
      return;
    }

    const diff = touchStartY.current - touchCurrentY.current;
    const threshold = 40; // min swipe delta

    if (diff > threshold) {
      // Swiped UP
      if (snapPoint === 'peek') setSnapPoint('mid');
      else if (snapPoint === 'mid') setSnapPoint('expanded');
    } else if (diff < -threshold) {
      // Swiped DOWN
      if (snapPoint === 'expanded') setSnapPoint('mid');
      else if (snapPoint === 'mid') setSnapPoint('peek');
    }

    touchStartY.current = null;
    touchCurrentY.current = null;
  };

  const cycleSnapPoint = () => {
    if (snapPoint === 'peek') setSnapPoint('mid');
    else if (snapPoint === 'mid') setSnapPoint('expanded');
    else setSnapPoint('peek');
  };

  const activeSpot = selectedLocation || locations[0];
  const activeSpotStatus = activeSpot ? getStatusStyle(activeSpot.csi.totalScore) : null;

  return (
    <section
      aria-label="Nearby Parking Spots and Safety Details"
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 60px)', // Above BottomNavBar
        left: 0,
        right: 0,
        height: getHeight(),
        backgroundColor: '#1E293B',
        borderTop: '1px solid #334155',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.45)',
        zIndex: 35,
        display: 'flex',
        flexDirection: 'column',
        transition: 'height 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Drag Pill Handle & Header Tap Area */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={cycleSnapPoint}
        style={{
          width: '100%',
          paddingTop: '8px',
          paddingBottom: '6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* iOS Drag Pill Bar */}
        <div
          style={{
            width: '36px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: '#64748B',
            marginBottom: '4px',
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
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
            {snapPoint === 'peek' ? 'Closest Safe Spot' : `Nearby Parking Spots (${locations.length})`}
          </span>

          <button
            aria-label={snapPoint === 'expanded' ? 'Collapse parking list' : 'Expand parking list'}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '36px',
            }}
          >
            <span>{snapPoint === 'expanded' ? 'Collapse' : snapPoint === 'mid' ? 'Full View' : 'Explore All'}</span>
            {snapPoint === 'expanded' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Peek Mode View: Compact Card */}
      {snapPoint === 'peek' && activeSpot && activeSpotStatus && (
        <div style={{ padding: '0 16px 10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
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
                }}
              >
                CSI {activeSpot.csi.totalScore}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeSpot.name}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
              ${activeSpot.hourlyRate}/hr • {activeSpot.availableSpaces} spots open • {activeSpot.infrastructure.structureType.replace(/_/g, ' ')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSafeWalk(activeSpot);
              }}
              style={{
                backgroundColor: '#0F172A',
                color: '#22C55E',
                border: '1px solid #22C55E',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.775rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                minHeight: '44px',
              }}
            >
              <Footprints size={15} />
              <span>Walk</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleParkHere(activeSpot);
              }}
              disabled={parkedLocation?.id === activeSpot.id}
              style={{
                backgroundColor: parkedLocation?.id === activeSpot.id ? '#22C55E' : SAFE_PARK_TOKENS.colors.brand.primary,
                color: parkedLocation?.id === activeSpot.id ? '#0F172A' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: parkedLocation?.id === activeSpot.id ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                minHeight: '44px',
              }}
            >
              <Car size={15} />
              <span>{parkedLocation?.id === activeSpot.id ? 'Parked' : 'Park'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mid & Expanded Mode View: Scrollable List of Spots */}
      {snapPoint !== 'peek' && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 16px 20px 16px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {locations.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
              No parking locations match your active filter criteria.
            </div>
          ) : (
            locations.map((loc) => (
              <SpotCard
                key={loc.id}
                location={loc}
                isSelected={selectedLocation?.id === loc.id}
                isParkedHere={parkedLocation?.id === loc.id}
                onSelect={(l) => {
                  setSelectedLocation(l);
                }}
                onInspectCsi={(l) => onInspectCsi(l)}
                onSafeWalk={(l) => onSafeWalk(l)}
                onParkHere={(l) => handleParkHere(l)}
                onReportHazard={(l) => onReportHazard(l)}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
};
