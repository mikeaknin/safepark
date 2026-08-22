import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useGeocodingAutocomplete } from '../../hooks/useGeocodingAutocomplete';
import { GeocodedLocation } from '../../../domain/models/GeocodedLocation';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import {
  Search,
  MapPin,
  X,
  Loader2,
} from 'lucide-react';

export const SearchAndFilterHeader: React.FC = () => {
  const {
    selectedDestination,
    setSelectedDestination,
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
        {/* Single Apple Maps-Style Full-Width Clean Floating Search Bar */}
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
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: isOpen
                ? `1.5px solid ${SAFE_PARK_TOKENS.colors.brand.primary}`
                : '1px solid rgba(51, 65, 85, 0.85)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
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
              placeholder="Search SF address, neighborhood, or landmark..."
              aria-label="Search destination for safe parking"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.925rem',
                fontWeight: 500,
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

          {/* Autocomplete Dropdown List */}
          {isOpen && suggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                backgroundColor: 'rgba(30, 41, 59, 0.98)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid #475569',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75)',
                zIndex: 50,
                maxHeight: '340px',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  padding: '10px 16px 6px 16px',
                  fontSize: '0.7rem',
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>San Francisco Locations</span>
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
                      padding: '10px 16px',
                      borderTop: '1px solid #334155',
                      cursor: 'pointer',
                      backgroundColor: selectedDestination?.name === loc.name ? '#0F172A' : 'transparent',
                      minHeight: '52px',
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
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        backgroundColor: badge.bg,
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
                            color: '#FFFFFF',
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
                              color: '#38BDF8',
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
                            padding: '1px 6px',
                            borderRadius: '4px',
                            marginLeft: 'auto',
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
    </header>
  );
};
