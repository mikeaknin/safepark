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
  Loader2,
  FlaskConical
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
        paddingLeft: '14px',
        paddingRight: '14px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          pointerEvents: 'auto',
          width: '100%',
        }}
      >
        {/* Single Apple Maps-Style Full-Width Floating Search Bar */}
        <div
          ref={searchContainerRef}
          style={{
            position: 'relative',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: isOpen
                ? `1.5px solid ${SAFE_PARK_TOKENS.colors.brand.primary}`
                : '1px solid rgba(51, 65, 85, 0.8)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55)',
              padding: '0 12px',
              minHeight: '48px',
              width: '100%',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {/* Search / Loading Icon */}
            {isLoading ? (
              <Loader2
                size={18}
                color={SAFE_PARK_TOKENS.colors.brand.primary}
                style={{ marginRight: '10px', flexShrink: 0, animation: 'spin 1s linear infinite' }}
              />
            ) : (
              <Search
                size={18}
                color={SAFE_PARK_TOKENS.colors.brand.primary}
                style={{ marginRight: '10px', flexShrink: 0 }}
              />
            )}

            {/* Input Text Box */}
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search SF address, street, or spot..."
              aria-label="Search destination for safe parking"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.925rem',
                width: '100%',
                outline: 'none',
                fontFamily: 'inherit',
                minHeight: '44px',
              }}
            />

            {/* Clear Button */}
            {query && (
              <button
                onClick={clearQuery}
                aria-label="Clear search input"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '36px',
                  minHeight: '36px',
                  marginRight: '2px',
                }}
              >
                <X size={16} />
              </button>
            )}

            {/* Discreet Embedded Filter Icon */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              aria-label="Open filter settings"
              style={{
                position: 'relative',
                background: activeFilterCount > 0 ? 'rgba(44, 115, 210, 0.2)' : 'transparent',
                border: activeFilterCount > 0 ? '1px solid #2C73D2' : 'none',
                color: activeFilterCount > 0 ? '#38BDF8' : '#94A3B8',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '36px',
                minHeight: '36px',
                marginLeft: '4px',
              }}
              title="Parking Safety Filters"
            >
              <SlidersHorizontal size={17} />
              {activeFilterCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: '#22C55E',
                    color: '#0F172A',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Discreet Embedded Lab Icon */}
            {onOpenLabTools && (
              <button
                onClick={onOpenLabTools}
                aria-label="Open Simulation Lab Tools"
                style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38BDF8',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  minHeight: '36px',
                  marginLeft: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
                title="Simulation Lab Diagnostics"
              >
                <FlaskConical size={15} />
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
                backgroundColor: 'rgba(30, 41, 59, 0.98)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid #475569',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
                zIndex: 50,
                maxHeight: '320px',
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
