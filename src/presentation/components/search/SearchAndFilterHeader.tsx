import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  ShieldCheck,
  Building,
  Video,
  Sparkles,
  Lock,
  RotateCcw,
  FlaskConical
} from 'lucide-react';

interface SearchAndFilterHeaderProps {
  onOpenLabTools?: () => void;
}

export const SearchAndFilterHeader: React.FC<SearchAndFilterHeaderProps> = ({
  onOpenLabTools,
}) => {
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
    <header
      role="search"
      aria-label="Destination Search and Risk Filters"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.7)',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
        paddingBottom: '10px',
        paddingLeft: '14px',
        paddingRight: '14px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Top Search Input Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Search Box with Autocomplete */}
          <div ref={searchContainerRef} style={{ position: 'relative', flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#1E293B',
                border: isDropdownOpen ? `2px solid ${SAFE_PARK_TOKENS.colors.brand.primary}` : '1px solid #334155',
                borderRadius: '12px',
                padding: '8px 12px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
                minHeight: '44px',
              }}
            >
              <Search
                size={18}
                color={SAFE_PARK_TOKENS.colors.brand.primary}
                style={{ marginRight: '8px', flexShrink: 0 }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Where are you parking? (e.g. Moscone, Oracle Park)..."
                aria-label="Search destination for safe parking"
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
                  aria-label="Clear search input"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '4px',
                    minWidth: '32px',
                    minHeight: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                  borderRadius: '12px',
                  border: '1px solid #475569',
                  boxShadow: SAFE_PARK_TOKENS.shadows.sheet,
                  zIndex: 50,
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.7rem',
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  Popular Destinations
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
                      padding: '10px 12px',
                      borderTop: '1px solid #334155',
                      cursor: 'pointer',
                      backgroundColor: selectedDestination?.id === dest.id ? '#0F172A' : 'transparent',
                      minHeight: '44px',
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

          {/* Filter Modal Trigger */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            aria-label="Open filter settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: activeFilterCount > 0 ? SAFE_PARK_TOKENS.colors.brand.primary : '#1E293B',
              color: '#FFFFFF',
              border: activeFilterCount > 0 ? `1px solid ${SAFE_PARK_TOKENS.colors.brand.primary}` : '1px solid #334155',
              borderRadius: '12px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '44px',
              minWidth: '44px',
            }}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
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

          {/* Lab Tools Floating Trigger */}
          {onOpenLabTools && (
            <button
              onClick={onOpenLabTools}
              aria-label="Open Simulation Lab Tools"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '12px',
                padding: '8px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                minHeight: '44px',
                minWidth: '44px',
              }}
              title="Simulation & Diagnostic Tools"
            >
              <FlaskConical size={16} />
              <span className="hidden sm:inline">Lab</span>
            </button>
          )}
        </div>

        {/* Quick Horizontal Scrollable Filter Row */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingTop: '8px',
            paddingBottom: '2px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {/* Low Risk Only */}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, minCsi: prev.minCsi === 75 ? 0 : 75 }))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: filters.minCsi === 75 ? 'rgba(34, 197, 94, 0.2)' : '#1E293B',
              color: filters.minCsi === 75 ? '#22C55E' : '#94A3B8',
              border: filters.minCsi === 75 ? '1px solid #22C55E' : '1px solid #334155',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: '36px',
            }}
          >
            <ShieldCheck size={13} />
            <span>Low Risk (≥75)</span>
          </button>

          {/* Garages Only */}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, coveredOrGarageOnly: !prev.coveredOrGarageOnly }))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: filters.coveredOrGarageOnly ? 'rgba(44, 115, 210, 0.2)' : '#1E293B',
              color: filters.coveredOrGarageOnly ? '#38BDF8' : '#94A3B8',
              border: filters.coveredOrGarageOnly ? '1px solid #2C73D2' : '1px solid #334155',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: '36px',
            }}
          >
            <Building size={13} />
            <span>Garages Only</span>
          </button>

          {/* 24/7 CCTV */}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, monitoredCctvOnly: !prev.monitoredCctvOnly }))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: filters.monitoredCctvOnly ? 'rgba(44, 115, 210, 0.2)' : '#1E293B',
              color: filters.monitoredCctvOnly ? '#38BDF8' : '#94A3B8',
              border: filters.monitoredCctvOnly ? '1px solid #2C73D2' : '1px solid #334155',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: '36px',
            }}
          >
            <Video size={13} />
            <span>24/7 CCTV</span>
          </button>

          {/* Lighting Heatmap */}
          <button
            onClick={() => setShowLightingHeatmap(!showLightingHeatmap)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: showLightingHeatmap ? 'rgba(34, 197, 94, 0.2)' : '#1E293B',
              color: showLightingHeatmap ? '#22C55E' : '#94A3B8',
              border: showLightingHeatmap ? '1px solid #22C55E' : '1px solid #334155',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: '36px',
            }}
          >
            <Sparkles size={13} />
            <span>{showLightingHeatmap ? 'Lighting Grid: ON' : 'Lighting: OFF'}</span>
          </button>

          {/* Reset Filters if any active */}
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
                padding: '6px 10px',
                whiteSpace: 'nowrap',
                minHeight: '36px',
              }}
            >
              <RotateCcw size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Modal Popover */}
      {isFilterModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-modal-title"
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
                <h3 id="filter-modal-title" style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>
                  Parking Safety Filters
                </h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                aria-label="Close filters dialog"
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
                <X size={16} />
              </button>
            </div>

            {/* CSI Threshold Slider */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="csi-range-input" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1' }}>
                  Minimum Composite Safety Index (CSI)
                </label>
                <span
                  className="tabular-nums"
                  style={{
                    color: filters.minCsi >= 75 ? '#22C55E' : filters.minCsi >= 50 ? '#F59E0B' : '#FFFFFF',
                    fontWeight: 700,
                  }}
                >
                  ≥ {filters.minCsi}
                </span>
              </div>
              <input
                id="csi-range-input"
                type="range"
                min="0"
                max="85"
                step="5"
                value={filters.minCsi}
                onChange={(e) => setFilters((prev) => ({ ...prev, minCsi: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: SAFE_PARK_TOKENS.colors.brand.primary, cursor: 'pointer', minHeight: '44px' }}
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
                <label htmlFor="max-rate-input" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1' }}>
                  Maximum Hourly Rate
                </label>
                <span className="tabular-nums" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                  ${filters.maxHourlyRate}/hr
                </span>
              </div>
              <input
                id="max-rate-input"
                type="range"
                min="2"
                max="15"
                step="0.5"
                value={filters.maxHourlyRate}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxHourlyRate: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: SAFE_PARK_TOKENS.colors.brand.primary, cursor: 'pointer', minHeight: '44px' }}
              />
            </div>

            {/* Feature Checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#CBD5E1', cursor: 'pointer', minHeight: '36px' }}>
                <input
                  type="checkbox"
                  checked={filters.coveredOrGarageOnly}
                  onChange={(e) => setFilters((prev) => ({ ...prev, coveredOrGarageOnly: e.target.checked }))}
                  style={{ width: '20px', height: '20px', accentColor: SAFE_PARK_TOKENS.colors.brand.primary }}
                />
                <span>Covered or Underground Garage Only</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#CBD5E1', cursor: 'pointer', minHeight: '36px' }}>
                <input
                  type="checkbox"
                  checked={filters.gatedAccessOnly}
                  onChange={(e) => setFilters((prev) => ({ ...prev, gatedAccessOnly: e.target.checked }))}
                  style={{ width: '20px', height: '20px', accentColor: SAFE_PARK_TOKENS.colors.brand.primary }}
                />
                <span>Gated Perimeter Barrier Controls</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#CBD5E1', cursor: 'pointer', minHeight: '36px' }}>
                <input
                  type="checkbox"
                  checked={filters.monitoredCctvOnly}
                  onChange={(e) => setFilters((prev) => ({ ...prev, monitoredCctvOnly: e.target.checked }))}
                  style={{ width: '20px', height: '20px', accentColor: SAFE_PARK_TOKENS.colors.brand.primary }}
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
                  minHeight: '44px',
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
                  padding: '10px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                Apply Filters ({locations.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
