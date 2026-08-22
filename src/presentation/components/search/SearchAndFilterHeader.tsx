import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useGeocodingAutocomplete } from '../../hooks/useGeocodingAutocomplete';
import { GeocodedLocation } from '../../../domain/models/GeocodedLocation';
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
  RotateCcw,
  FlaskConical,
  Loader2,
  Navigation,
  Compass
} from 'lucide-react';

interface SearchAndFilterHeaderProps {
  onOpenLabTools?: () => void;
}

export const SearchAndFilterHeader: React.FC<SearchAndFilterHeaderProps> = ({
  onOpenLabTools,
}) => {
  const {
    selectedDestination,
    setSelectedDestination,
    filters,
    setFilters,
    resetFilters,
    isFilterModalOpen,
    setIsFilterModalOpen,
    showLightingHeatmap,
    setShowLightingHeatmap,
    locations,
  } = useApp();

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    isOpen,
    setIsOpen,
    clearQuery,
    selectSuggestion,
  } = useGeocodingAutocomplete(
    (loc: GeocodedLocation) => {
      setSelectedDestination({
        id: loc.id,
        name: loc.name,
        address: loc.formattedAddress,
        coordinates: loc.coordinates,
      });
    },
    {
      debounceMs: 300,
      minChars: 2,
      initialQuery: selectedDestination?.name || '',
    }
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const activeFilterCount =
    (filters.minCsi > 0 ? 1 : 0) +
    (filters.coveredOrGarageOnly ? 1 : 0) +
    (filters.gatedAccessOnly ? 1 : 0) +
    (filters.monitoredCctvOnly ? 1 : 0) +
    (filters.maxHourlyRate < 15 ? 1 : 0);

  const getPlaceBadge = (loc: GeocodedLocation) => {
    switch (loc.placeType) {
      case 'poi':
        return { label: 'Landmark', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' };
      case 'intersection':
        return { label: 'Cross Street', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)' };
      case 'facility':
        return { label: 'Garage', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'neighborhood':
        return { label: 'District', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' };
      default:
        return { label: 'Address', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)' };
    }
  };

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
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          pointerEvents: 'auto',
        }}
      >
        {/* Full-Width Floating Glassmorphic Search Card */}
        <div
          ref={searchContainerRef}
          style={{
            position: 'relative',
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(51, 65, 85, 0.7)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            padding: '6px 8px',
          }}
        >
          {/* Top Search & Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Search Input Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#1E293B',
                border: isOpen ? `2px solid ${SAFE_PARK_TOKENS.colors.brand.primary}` : '1px solid #334155',
                borderRadius: '12px',
                padding: '0 12px',
                flex: 1,
                minHeight: '44px',
                transition: 'border 0.2s ease',
              }}
            >
              {isLoading ? (
                <Loader2
                  size={18}
                  color={SAFE_PARK_TOKENS.colors.brand.primary}
                  style={{ marginRight: '8px', flexShrink: 0, animation: 'spin 1s linear infinite' }}
                />
              ) : (
                <Search
                  size={18}
                  color={SAFE_PARK_TOKENS.colors.brand.primary}
                  style={{ marginRight: '8px', flexShrink: 0 }}
                />
              )}

              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Where to? (e.g. 772 Folsom, Mission & 16th, Oracle Park)..."
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

              {query && (
                <button
                  onClick={clearQuery}
                  aria-label="Clear search input"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '6px',
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Trigger Button */}
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
                padding: '0 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '44px',
                minWidth: '44px',
                flexShrink: 0,
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

            {/* Discrete Lab Tools FAB */}
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
                  padding: '0 10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: '44px',
                  minWidth: '44px',
                  flexShrink: 0,
                }}
                title="Simulation & Diagnostic Tools"
              >
                <FlaskConical size={16} />
                <span>Lab</span>
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown List */}
          {isOpen && suggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                backgroundColor: '#1E293B',
                borderRadius: '14px',
                border: '1px solid #475569',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65)',
                zIndex: 50,
                maxHeight: '340px',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  padding: '10px 14px 6px 14px',
                  fontSize: '0.7rem',
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>San Francisco Municipal Results</span>
                <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Bounded OSM</span>
              </div>

              {suggestions.map((loc) => {
                const badge = getPlaceBadge(loc);
                return (
                  <div
                    key={loc.id}
                    onClick={() => selectSuggestion(loc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderTop: '1px solid #334155',
                      cursor: 'pointer',
                      backgroundColor: selectedDestination?.name === loc.name ? '#0F172A' : 'transparent',
                      minHeight: '48px',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#334155';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        selectedDestination?.name === loc.name ? '#0F172A' : 'transparent';
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: badge.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <MapPin size={16} color={badge.color} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.9rem',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {loc.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: badge.color,
                            backgroundColor: badge.bg,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            flexShrink: 0,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#94A3B8',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px',
                        }}
                      >
                        {loc.formattedAddress}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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

            {/* Reset Filters */}
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
            pointerEvents: 'auto',
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
