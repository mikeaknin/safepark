import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  Shield,
  ShieldCheck,
  Building,
  Video,
  Lock,
  Moon,
  Sun,
  Bluetooth,
  Car,
  Footprints,
  Sparkles,
  Check,
  RotateCcw
} from 'lucide-react';

export const SearchAndFilterHeader: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedDestination,
    setSelectedDestination,
    destinationResults,
    filters,
    setFilters,
    resetFilters,
    isFilterModalOpen,
    setIsFilterModalOpen,
    isNightMode,
    setIsNightMode,
    motionState,
    setMotionState,
    parkedLocation,
    handleLeaveParkedSpot,
    bluetoothConnected,
    toggleBluetooth,
    showLightingHeatmap,
    setShowLightingHeatmap,
    locations,
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterCount =
    (filters.minCsi > 0 ? 1 : 0) +
    (filters.coveredOrGarageOnly ? 1 : 0) +
    (filters.gatedAccessOnly ? 1 : 0) +
    (filters.monitoredCctvOnly ? 1 : 0) +
    (filters.maxHourlyRate < 15 ? 1 : 0);

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Top Search & Controls Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1fr) auto',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        {/* Search Box with Autocomplete */}
        <div ref={searchContainerRef} style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1E293B',
              border: isDropdownOpen ? `2px solid ${SAFE_PARK_TOKENS.colors.brand.primary}` : '1px solid #334155',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
              padding: '8px 14px',
              boxShadow: SAFE_PARK_TOKENS.shadows.card,
              transition: 'all 0.2s ease',
            }}
          >
            <Search size={18} color={SAFE_PARK_TOKENS.colors.brand.primary} style={{ marginRight: '10px', flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search destination (e.g. Moscone Center, Salesforce Tower)..."
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                width: '100%',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDestination(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && destinationResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                backgroundColor: '#1E293B',
                borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
                border: '1px solid #475569',
                boxShadow: SAFE_PARK_TOKENS.shadows.sheet,
                zIndex: 50,
                maxHeight: '260px',
                overflowY: 'auto',
              }}
            >
              <div style={{ padding: '8px 12px', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                Suggested Destinations in San Francisco
              </div>
              {destinationResults.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => {
                    setSelectedDestination(dest);
                    setSearchQuery(dest.name);
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderTop: '1px solid #334155',
                    cursor: 'pointer',
                    backgroundColor: selectedDestination?.id === dest.id ? '#0F172A' : 'transparent',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#334155';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      selectedDestination?.id === dest.id ? '#0F172A' : 'transparent';
                  }}
                >
                  <MapPin size={16} color={SAFE_PARK_TOKENS.colors.brand.primary} style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 600 }}>{dest.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{dest.address}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Trigger Button */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeFilterCount > 0 ? SAFE_PARK_TOKENS.colors.brand.primary : '#1E293B',
              color: '#FFFFFF',
              border: activeFilterCount > 0 ? `1px solid ${SAFE_PARK_TOKENS.colors.brand.primary}` : '1px solid #334155',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
              padding: '9px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: SAFE_PARK_TOKENS.shadows.card,
              whiteSpace: 'nowrap',
            }}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  backgroundColor: '#FFFFFF',
                  color: SAFE_PARK_TOKENS.colors.brand.primary,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Secondary Bar: Active Filters Pills, Motion State & Heatmap Layer Toggles */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          marginTop: '10px',
        }}
      >
        {/* Quick Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={() => setFilters(prev => ({ ...prev, minCsi: prev.minCsi === 75 ? 0 : 75 }))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: filters.minCsi === 75 ? 'rgba(34, 197, 94, 0.2)' : '#1E293B',
              color: filters.minCsi === 75 ? '#22C55E' : '#94A3B8',
              border: filters.minCsi === 75 ? '1px solid #22C55E' : '1px solid #334155',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.pill,
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ShieldCheck size={13} />
            <span>Low Risk (CSI ≥75)</span>
          </button>

          <button
            onClick={() => setFilters(prev => ({ ...prev, coveredOrGarageOnly: !prev.coveredOrGarageOnly }))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: filters.coveredOrGarageOnly ? 'rgba(44, 115, 210, 0.2)' : '#1E293B',
              color: filters.coveredOrGarageOnly ? '#38BDF8' : '#94A3B8',
              border: filters.coveredOrGarageOnly ? '1px solid #2C73D2' : '1px solid #334155',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.pill,
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Building size={13} />
            <span>Garages Only</span>
          </button>

          <button
            onClick={() => setFilters(prev => ({ ...prev, monitoredCctvOnly: !prev.monitoredCctvOnly }))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: filters.monitoredCctvOnly ? 'rgba(44, 115, 210, 0.2)' : '#1E293B',
              color: filters.monitoredCctvOnly ? '#38BDF8' : '#94A3B8',
              border: filters.monitoredCctvOnly ? '1px solid #2C73D2' : '1px solid #334155',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.pill,
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Video size={13} />
            <span>24/7 CCTV</span>
          </button>

          {/* Toggle Lighting Density Heatmap Layer */}
          <button
            onClick={() => setShowLightingHeatmap(!showLightingHeatmap)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: showLightingHeatmap ? 'rgba(34, 197, 94, 0.2)' : '#1E293B',
              color: showLightingHeatmap ? '#22C55E' : '#94A3B8',
              border: showLightingHeatmap ? '1px solid #22C55E' : '1px solid #334155',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.pill,
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Sparkles size={13} />
            <span>{showLightingHeatmap ? 'Lighting Layer: ON' : 'Lighting Layer: OFF'}</span>
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#EF4444',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
              }}
            >
              <RotateCcw size={12} /> Clear Filters
            </button>
          )}
        </div>

        {/* State Indicators: Motion State & Bluetooth Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Motion State Chip */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: motionState === 'parked' ? 'rgba(245, 158, 11, 0.2)' : motionState === 'walking' ? 'rgba(34, 197, 94, 0.2)' : '#1E293B',
              color: motionState === 'parked' ? '#F59E0B' : motionState === 'walking' ? '#22C55E' : '#38BDF8',
              border: `1px solid ${motionState === 'parked' ? '#F59E0B' : motionState === 'walking' ? '#22C55E' : '#334155'}`,
              borderRadius: SAFE_PARK_TOKENS.borderRadius.pill,
              padding: '3px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {motionState === 'driving' ? <Car size={13} /> : motionState === 'parked' ? <Lock size={13} /> : <Footprints size={13} />}
            <span>State: {motionState}</span>
            {motionState === 'parked' && (
              <button
                onClick={handleLeaveParkedSpot}
                style={{
                  backgroundColor: '#334155',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  padding: '1px 6px',
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  marginLeft: '4px',
                }}
              >
                Depart Spot
              </button>
            )}
          </div>

          {/* Bluetooth Status */}
          <button
            onClick={toggleBluetooth}
            title={bluetoothConnected ? 'Bluetooth CarPlay Active' : 'Bluetooth Disconnected'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: bluetoothConnected ? 'rgba(44, 115, 210, 0.2)' : '#1E293B',
              color: bluetoothConnected ? '#38BDF8' : '#94A3B8',
              border: bluetoothConnected ? '1px solid #2C73D2' : '1px solid #475569',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.pill,
              padding: '3px 8px',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            <Bluetooth size={13} />
            <span>{bluetoothConnected ? 'Car Audio Linked' : 'Unlinked'}</span>
          </button>
        </div>
      </div>

      {/* Filter Modal Popover */}
      {isFilterModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 1500,
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
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={18} color={SAFE_PARK_TOKENS.colors.brand.primary} />
                <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>Parking Safety Filters</h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                style={{
                  background: '#334155',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* CSI Threshold Slider */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1' }}>
                  Minimum Composite Safety Index (CSI)
                </label>
                <span className="tabular-nums" style={{ color: filters.minCsi >= 75 ? '#22C55E' : filters.minCsi >= 50 ? '#F59E0B' : '#FFFFFF', fontWeight: 700 }}>
                  ≥ {filters.minCsi}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="85"
                step="5"
                value={filters.minCsi}
                onChange={(e) => setFilters(prev => ({ ...prev, minCsi: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: SAFE_PARK_TOKENS.colors.brand.primary, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748B', marginTop: '4px' }}>
                <span>All Spots (0)</span>
                <span>Moderate Risk (50)</span>
                <span>Certified Low Risk (75+)</span>
              </div>
            </div>

            {/* Max Hourly Rate */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1' }}>
                  Maximum Hourly Rate
                </label>
                <span className="tabular-nums" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                  ${filters.maxHourlyRate}/hr
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                step="0.5"
                value={filters.maxHourlyRate}
                onChange={(e) => setFilters(prev => ({ ...prev, maxHourlyRate: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: SAFE_PARK_TOKENS.colors.brand.primary, cursor: 'pointer' }}
              />
            </div>

            {/* Feature Checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#CBD5E1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.coveredOrGarageOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, coveredOrGarageOnly: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: SAFE_PARK_TOKENS.colors.brand.primary }}
                />
                <span>Covered or Underground Garage Only</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#CBD5E1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.gatedAccessOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, gatedAccessOnly: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: SAFE_PARK_TOKENS.colors.brand.primary }}
                />
                <span>Gated Perimeter Barrier Controls</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#CBD5E1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.monitoredCctvOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, monitoredCctvOnly: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: SAFE_PARK_TOKENS.colors.brand.primary }}
                />
                <span>24/7 Monitored Active CCTV</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={resetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Reset All
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                style={{
                  backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Apply Filters ({locations.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
