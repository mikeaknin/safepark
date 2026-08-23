import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useGeocodingAutocomplete } from '../../hooks/useGeocodingAutocomplete';
import { GeocodedLocation } from '../../../domain/models/GeocodedLocation';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import {
  Search,
  MapPin,
  X,
  Loader2,
  Clock,
  Trash2,
  Sparkles,
} from 'lucide-react';

const RECENT_SEARCHES_STORAGE_KEY = 'safepark_recent_searches_v1';

export const SearchAndFilterHeader: React.FC = () => {
  const {
    selectedDestination,
    setSelectedDestination,
    showToast,
    filters,
    setFilters,
  } = useApp();

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [recentSearches, setRecentSearches] = useState<GeocodedLocation[]>([]);

  // Load Recent Searches from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  const saveRecentSearch = (loc: GeocodedLocation) => {
    try {
      const filtered = recentSearches.filter((item) => item.id !== loc.id);
      const updated = [loc, ...filtered].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage quota or privacy restriction
    }
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
      setRecentSearches([]);
      showToast('Cleared search history');
    } catch {}
  };

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
      saveRecentSearch(loc);
      setSelectedDestination({
        id: loc.id,
        name: loc.name,
        address: loc.formattedAddress,
        coordinates: loc.coordinates,
      });
      setIsOpen(false);
    },
    {
      debounceMs: 300,
      minChars: 2,
      initialQuery: selectedDestination?.name || '',
    }
  );

  // Close dropdown on outside click or touch
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [setIsOpen]);

  const getPlaceBadge = (loc: GeocodedLocation) => {
    switch (loc.placeType) {
      case 'poi':
        return { label: 'Landmark', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' };
      case 'intersection':
        return { label: 'Cross Street', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' };
      case 'facility':
        return { label: 'Garage', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' };
      case 'neighborhood':
        return { label: 'District', color: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF' };
      default:
        return { label: 'Address', color: '#475569', bg: '#F1F5F9', border: '#E2E8F0' };
    }
  };

  return (
    <header
      role="search"
      aria-label="Destination Search"
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
          maxWidth: '720px',
          margin: '0 auto',
          pointerEvents: 'auto',
          width: '100%',
        }}
      >
        {/* Daylight Apple Maps Full-Width Floating Search Bar */}
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
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: isOpen
                ? `1.5px solid ${SAFE_PARK_TOKENS.colors.brand.primary}`
                : '1px solid rgba(203, 213, 225, 0.85)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.12)',
              padding: '0 14px',
              minHeight: '50px',
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
                color="#64748B"
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
              placeholder="Search SF address, neighborhood, or spot..."
              aria-label="Search destination for safe parking"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0F172A',
                fontSize: '0.925rem',
                fontWeight: 600,
                width: '100%',
                outline: 'none',
                fontFamily: 'inherit',
                minHeight: '44px',
              }}
            />

            {/* Clear Button */}
            {query && (
              <button
                onClick={() => {
                  clearQuery();
                  setIsOpen(false);
                }}
                aria-label="Clear search input"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '36px',
                  minHeight: '36px',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Parking Type Filter Pills Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              paddingBottom: '2px',
            }}
          >
            {/* All Spots Pill */}
            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, parkingTypeFilter: 'all' }));
              }}
              style={{
                backgroundColor:
                  filters.parkingTypeFilter === 'all' ? '#0F172A' : 'rgba(255, 255, 255, 0.95)',
                color: filters.parkingTypeFilter === 'all' ? '#FFFFFF' : '#475569',
                border: `1px solid ${
                  filters.parkingTypeFilter === 'all' ? '#0F172A' : 'rgba(203, 213, 225, 0.9)'
                }`,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '9999px',
                padding: '4px 11px',
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                transition: 'all 0.15s ease',
              }}
            >
              All Spots
            </button>

            {/* Street & 2-Hr Free Pill */}
            <button
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  parkingTypeFilter: prev.parkingTypeFilter === 'street_only' ? 'all' : 'street_only',
                }));
              }}
              style={{
                backgroundColor:
                  filters.parkingTypeFilter === 'street_only' ? '#047857' : 'rgba(255, 255, 255, 0.95)',
                color: filters.parkingTypeFilter === 'street_only' ? '#FFFFFF' : '#047857',
                border: `1px solid ${
                  filters.parkingTypeFilter === 'street_only' ? '#047857' : '#A7F3D0'
                }`,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '9999px',
                padding: '4px 11px',
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                transition: 'all 0.15s ease',
              }}
            >
              ⏱️ Street & 2-Hr
            </button>

            {/* Garages Only Pill */}
            <button
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  parkingTypeFilter: prev.parkingTypeFilter === 'garages_only' ? 'all' : 'garages_only',
                }));
              }}
              style={{
                backgroundColor:
                  filters.parkingTypeFilter === 'garages_only' ? '#1D4ED8' : 'rgba(255, 255, 255, 0.95)',
                color: filters.parkingTypeFilter === 'garages_only' ? '#FFFFFF' : '#1D4ED8',
                border: `1px solid ${
                  filters.parkingTypeFilter === 'garages_only' ? '#1D4ED8' : '#BFDBFE'
                }`,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '9999px',
                padding: '4px 11px',
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                transition: 'all 0.15s ease',
              }}
            >
              🏢 Garages Only
            </button>
          </div>

          {/* Autocomplete & Recent Destinations Dropdown */}
          {isOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '16px',
                border: '1px solid #CBD5E1',
                boxShadow: '0 12px 36px rgba(15, 23, 42, 0.16)',
                zIndex: 50,
                maxHeight: '360px',
                overflowY: 'auto',
              }}
            >
              {/* 1. Live Autocomplete Suggestions (when query exists) */}
              {query.trim().length >= 2 && suggestions.length > 0 && (
                <>
                  <div
                    style={{
                      padding: '10px 16px 6px 16px',
                      fontSize: '0.7rem',
                      color: '#64748B',
                      textTransform: 'uppercase',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>San Francisco Locations</span>
                    <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Bounded OSM</span>
                  </div>

                  {suggestions.map((loc) => {
                    const badge = getPlaceBadge(loc);
                    return (
                      <div
                        key={loc.id}
                        onClick={() => {
                          selectSuggestion(loc);
                          setIsOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 16px',
                          borderTop: '1px solid #F1F5F9',
                          cursor: 'pointer',
                          backgroundColor: selectedDestination?.name === loc.name ? '#EFF6FF' : 'transparent',
                          minHeight: '52px',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            selectedDestination?.name === loc.name ? '#EFF6FF' : 'transparent';
                        }}
                      >
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            backgroundColor: badge.bg,
                            border: `1px solid ${badge.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <MapPin size={17} color={badge.color} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '0.9rem',
                                color: '#0F172A',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {loc.name}
                            </span>
                            {loc.neighborhood && (
                              <span
                                style={{
                                  fontSize: '0.725rem',
                                  color: '#2563EB',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                • {loc.neighborhood}
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                color: badge.color,
                                backgroundColor: badge.bg,
                                border: `1px solid ${badge.border}`,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                marginLeft: 'auto',
                                flexShrink: 0,
                              }}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: '0.75rem',
                              color: '#64748B',
                              marginTop: '2px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {loc.formattedAddress}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* 2. Recent Destinations (when query is empty and history exists) */}
              {!query.trim() && recentSearches.length > 0 && (
                <>
                  <div
                    style={{
                      padding: '10px 16px 6px 16px',
                      fontSize: '0.7rem',
                      color: '#64748B',
                      textTransform: 'uppercase',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} color="#64748B" />
                      <span>Recent Destinations</span>
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '0.65rem',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <Trash2 size={11} />
                      <span>Clear</span>
                    </button>
                  </div>

                  {recentSearches.map((loc) => (
                    <div
                      key={loc.id}
                      onClick={() => {
                        selectSuggestion(loc);
                        setIsOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        borderTop: '1px solid #F1F5F9',
                        cursor: 'pointer',
                        minHeight: '50px',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={15} color="#64748B" />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {loc.name}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {loc.formattedAddress}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
