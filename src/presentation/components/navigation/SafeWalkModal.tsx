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
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
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
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          color: '#FFFFFF',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#22C55E', fontWeight: 700, textTransform: 'uppercase' }}>
              Safe Walk Back Navigation Engine
            </div>
            <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>Illuminated Return Routing</h2>
          </div>
          <button
            onClick={onClose}
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
            <X size={18} />
          </button>
        </div>

        {/* Route Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {litRoute && (
            <div
              onClick={() => setSelectedRoute(litRoute)}
              style={{
                backgroundColor: selectedRoute?.id === litRoute.id ? '#0F172A' : '#334155',
                border: selectedRoute?.id === litRoute.id ? '2px solid #22C55E' : '1px solid #475569',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22C55E', fontSize: '0.8rem', fontWeight: 700 }}>
                <ShieldCheck size={16} /> RECOMMENDED
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>
                SafePark Lit Corridor
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.75rem', color: '#CBD5E1' }}>
                <span>{litRoute.estimatedWalkingMinutes} mins</span>
                <span>•</span>
                <span className="tabular-nums" style={{ color: '#22C55E', fontWeight: 700 }}>
                  {litRoute.averageIlluminationLux} Lux Avg
                </span>
              </div>
            </div>
          )}

          {directRoute && (
            <div
              onClick={() => setSelectedRoute(directRoute)}
              style={{
                backgroundColor: selectedRoute?.id === directRoute.id ? '#0F172A' : '#334155',
                border: selectedRoute?.id === directRoute.id ? '2px solid #EF4444' : '1px solid #475569',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '0.8rem', fontWeight: 700 }}>
                <AlertTriangle size={16} /> LOW VISIBILITY
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>
                Direct Alleyway Short
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.75rem', color: '#CBD5E1' }}>
                <span>{directRoute.estimatedWalkingMinutes} mins</span>
                <span>•</span>
                <span className="tabular-nums" style={{ color: '#EF4444', fontWeight: 700 }}>
                  {directRoute.averageIlluminationLux} Lux Avg
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Route Turn-by-Turn Steps */}
        {selectedRoute && (
          <div style={{ backgroundColor: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1' }}>
                Waypoints from {location.name}:
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  backgroundColor: selectedRoute.isRecommendedLitPath ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: selectedRoute.isRecommendedLitPath ? '#22C55E' : '#EF4444',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}
              >
                Safety Index: {selectedRoute.safetyScore}/100
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedRoute.pathSegments.map((segment, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: segment.isIlluminated ? '#22C55E' : '#EF4444',
                      color: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {segment.stepIndex}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: '#FFFFFF' }}>
                      {segment.instruction}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                      <span>{segment.distanceMeters}m</span>
                      <span>•</span>
                      <span className="tabular-nums" style={{ color: segment.luxLevel >= 30 ? '#22C55E' : '#EF4444' }}>
                        💡 {segment.luxLevel} Lux
                      </span>
                      <span>•</span>
                      <span>Foot Traffic: {segment.footTrafficScore}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Navigation CTA */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <Footprints size={16} /> Start Pedestrian Safe Walk
          </button>
        </div>
      </div>
    </div>
  );
};
