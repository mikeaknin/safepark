import React, { useState } from 'react';
import { ParkingLocation, SafeWalkRoute } from '../../../domain/models/ParkingLocation';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import { X, Footprints, Lightbulb, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SafeWalkModalProps {
  location: ParkingLocation;
  onClose: () => void;
}

export const SafeWalkModal: React.FC<SafeWalkModalProps> = ({ location, onClose }) => {
  const routes = location.walkingRoutes || [];
  const litRoute = routes.find(r => r.isRecommendedLitPath) || routes[0];
  const directRoute = routes.find(r => !r.isRecommendedLitPath) || routes[1];

  const [selectedRoute, setSelectedRoute] = useState<SafeWalkRoute | undefined>(litRoute);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.2)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          color: '#0F172A',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Safe Walk Back Navigation Engine
            </div>
            <h2 style={{ fontSize: '1.25rem', color: '#0F172A', fontWeight: 800 }}>Illuminated Return Routing</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Route Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {litRoute && (
            <div
              onClick={() => setSelectedRoute(litRoute)}
              style={{
                backgroundColor: selectedRoute?.id === litRoute.id ? '#ECFDF5' : '#F8FAFC',
                border: selectedRoute?.id === litRoute.id ? '2px solid #15803D' : '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D', fontSize: '0.75rem', fontWeight: 800 }}>
                <ShieldCheck size={16} /> RECOMMENDED
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                SafePark Lit Corridor
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.75rem', color: '#475569' }}>
                <span>{litRoute.estimatedWalkingMinutes} mins</span>
                <span>•</span>
                <span className="tabular-nums" style={{ color: '#15803D', fontWeight: 800 }}>
                  {litRoute.averageIlluminationLux} Lux Avg
                </span>
              </div>
            </div>
          )}

          {directRoute && (
            <div
              onClick={() => setSelectedRoute(directRoute)}
              style={{
                backgroundColor: selectedRoute?.id === directRoute.id ? '#FFF1F2' : '#F8FAFC',
                border: selectedRoute?.id === directRoute.id ? '2px solid #BE123C' : '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#BE123C', fontSize: '0.75rem', fontWeight: 800 }}>
                <AlertTriangle size={16} /> UNVERIFIED PATH
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                Standard Direct Walk
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.75rem', color: '#475569' }}>
                <span>{directRoute.estimatedWalkingMinutes} mins</span>
                <span>•</span>
                <span className="tabular-nums" style={{ color: '#BE123C', fontWeight: 800 }}>
                  {directRoute.averageIlluminationLux} Lux Avg
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Turn-by-Turn Waypoints */}
        {selectedRoute?.pathSegments && selectedRoute.pathSegments.length > 0 && (
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Turn-By-Turn Path Segments & Municipal Lighting
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedRoute.pathSegments.map((seg, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: seg.isIlluminated ? '#15803D' : '#64748B',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{seg.instruction}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Distance: {seg.distanceMeters}m</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="tabular-nums" style={{ fontSize: '0.75rem', fontWeight: 800, color: seg.luxLevel >= 25 ? '#15803D' : '#B45309' }}>
                      {seg.luxLevel} Lux
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            Start Illuminated Walk Return
          </button>
        </div>
      </div>
    </div>
  );
};
