import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SAFE_PARK_TOKENS, getStatusStyle } from '../../theme/tokens';
import { ParkingLocation } from '../../domain/models/ParkingLocation';
import { DirectionsActionSheet } from '../components/navigation/DirectionsActionSheet';
import {
  ShieldCheck,
  Building2,
  Lock,
  Video,
  Lightbulb,
  CheckCircle2,
  Navigation,
  Footprints,
  Sparkles,
  MapPin,
  Car,
  Compass,
} from 'lucide-react';

export const SafeGaragesView: React.FC = () => {
  const {
    locations,
    setSelectedLocation,
    setCurrentView,
    setSafeWalkLocation,
    handleParkHere,
    parkedLocation,
    showToast,
  } = useApp();

  const [directionsTarget, setDirectionsTarget] = useState<ParkingLocation | null>(null);

  // Filter for high-safety rated, covered or gated garages
  const safeGarages = locations
    .filter(
      (loc) =>
        loc.csi.totalScore >= 75 ||
        loc.infrastructure.hasControlledAccessBarrier ||
        loc.infrastructure.structureType === 'covered_underground_garage' ||
        loc.infrastructure.structureType === 'multi_level_deck'
    )
    .sort((a, b) => b.csi.totalScore - a.csi.totalScore);

  const handleSelectAndNavigate = (loc: ParkingLocation) => {
    setSelectedLocation(loc);
    setCurrentView('driver');
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '8px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span
            style={{
              backgroundColor: '#ECFDF5',
              color: '#15803D',
              border: '1px solid #A7F3D0',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Vetted Facilities
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>San Francisco Municipal Safety Standard</span>
        </div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
          Vetted Safe Garages
        </h1>
        <p style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '4px', lineHeight: 1.4 }}>
          Covered, gated, and monitored facilities in San Francisco with top Composite Safety Index (CSI) ratings.
        </p>
      </div>

      {/* Facilities List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {safeGarages.map((facility) => {
          const status = getStatusStyle(facility.csi.totalScore);
          const isParked = parkedLocation?.id === facility.id;
          const litRoute = facility.walkingRoutes?.find((r) => r.isRecommendedLitPath);

          return (
            <article
              key={facility.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: isParked ? '2px solid #15803D' : '1px solid #E2E8F0',
                boxShadow: isParked
                  ? '0 4px 16px rgba(21, 128, 61, 0.12)'
                  : '0 2px 10px rgba(15, 23, 42, 0.04)',
                padding: '18px',
                position: 'relative',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {/* Header: Title & CSI Score */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <Building2 size={16} color="#2563EB" style={{ flexShrink: 0 }} />
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                      {facility.name}
                    </h2>
                  </div>
                  <p style={{ fontSize: '0.775rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {facility.address}
                    </span>
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: status.bg,
                    color: status.text,
                    border: `1px solid ${status.border}`,
                    borderRadius: '10px',
                    padding: '4px 10px',
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    {status.label}
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    {facility.csi.totalScore}
                  </div>
                </div>
              </div>

              {/* Verified Security Attributes Grid */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #F1F5F9',
                  padding: '10px 12px',
                  marginBottom: '14px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '0.75rem',
                  color: '#334155',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#15803D" />
                  <span style={{ fontWeight: 600 }}>Gated & Secured</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Video size={14} color="#2563EB" />
                  <span style={{ fontWeight: 600 }}>24/7 CCTV Monitoring</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lightbulb size={14} color="#B45309" />
                  <span style={{ fontWeight: 600 }}>High-Lux Smart LED</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#15803D" />
                  <span style={{ fontWeight: 600 }}>Zero Break-In Zone</span>
                </div>
              </div>

              {/* Rate & Availability Specs */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 800, color: '#2563EB', fontSize: '1rem' }}>
                    ${facility.hourlyRate.toFixed(2)}
                  </span>
                  <span style={{ color: '#64748B', fontWeight: 500 }}> / hour</span>
                </div>
                <div style={{ color: '#64748B' }}>
                  <strong style={{ color: '#0F172A' }}>{facility.availableSpaces}</strong> stalls open
                </div>
                {litRoute && (
                  <div style={{ color: '#15803D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Footprints size={14} />
                    <span>{litRoute.estimatedWalkingMinutes} min walk</span>
                  </div>
                )}
              </div>

              {/* Primary Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleSelectAndNavigate(facility)}
                  style={{
                    flex: '1 1 120px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '0.825rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
                  }}
                >
                  <Navigation size={15} />
                  <span>Navigate on Map</span>
                </button>

                <button
                  onClick={() => setDirectionsTarget(facility)}
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #BFDBFE',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    fontSize: '0.825rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Compass size={15} />
                  <span>In-Car Nav</span>
                </button>

                {litRoute && (
                  <button
                    onClick={() => setSafeWalkLocation(facility)}
                    style={{
                      backgroundColor: '#F1F5F9',
                      color: '#1E293B',
                      border: '1px solid #CBD5E1',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Footprints size={15} color="#15803D" />
                    <span>Safe Walk</span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* In-Car Navigation Deep Links Modal */}
      {directionsTarget && (
        <DirectionsActionSheet
          location={directionsTarget}
          isOpen={!!directionsTarget}
          onClose={() => setDirectionsTarget(null)}
          onCopyAddress={() => showToast('📋 Facility address copied')}
        />
      )}
    </div>
  );
};
