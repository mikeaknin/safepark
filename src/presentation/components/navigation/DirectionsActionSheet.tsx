import React from 'react';
import { ParkingLocation } from '../../../domain/models/ParkingLocation';
import { SAFE_PARK_TOKENS, getStatusStyle } from '../../../theme/tokens';
import {
  Navigation,
  X,
  Copy,
  ExternalLink,
  MapPin,
  Car,
  Compass,
} from 'lucide-react';

interface DirectionsActionSheetProps {
  location: ParkingLocation | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyAddress?: () => void;
}

export const DirectionsActionSheet: React.FC<DirectionsActionSheetProps> = ({
  location,
  isOpen,
  onClose,
  onCopyAddress,
}) => {
  if (!isOpen || !location) return null;

  const { lat, lng } = location.coordinates;
  const status = getStatusStyle(location.csi.totalScore);

  const appleMapsUrl = `maps://?daddr=${lat},${lng}&dirflg=d`;
  const appleMapsWebFallback = `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

  const handleOpenNav = (url: string, fallbackUrl?: string) => {
    try {
      window.location.href = url;
      if (fallbackUrl) {
        setTimeout(() => {
          window.open(fallbackUrl, '_blank');
        }, 500);
      }
    } catch {
      if (fallbackUrl) {
        window.open(fallbackUrl, '_blank');
      }
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${location.name}, ${location.address}, San Francisco, CA`);
    }
    if (onCopyAddress) {
      onCopyAddress();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="In-Car Navigation Directions"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.25)',
          border: '1px solid #E2E8F0',
        }}
      >
        {/* Header with Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span
                style={{
                  backgroundColor: status.bg,
                  color: status.text,
                  border: `1px solid ${status.border}`,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.675rem',
                  fontWeight: 800,
                }}
              >
                CSI {location.csi.totalScore}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>In-Car Navigation</span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              {location.name}
            </h2>
            <p style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} style={{ flexShrink: 0 }} />
              <span>{location.address}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close directions menu"
            style={{
              backgroundColor: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation App Launch Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
          {/* Apple Maps */}
          <button
            onClick={() => handleOpenNav(appleMapsUrl, appleMapsWebFallback)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '16px',
              padding: '12px 16px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                }}
              >
                
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>Apple Maps</div>
                <div style={{ fontSize: '0.725rem', color: '#64748B' }}>Turn-by-turn driving directions</div>
              </div>
            </div>
            <ExternalLink size={16} color="#64748B" />
          </button>

          {/* Google Maps */}
          <button
            onClick={() => handleOpenNav(googleMapsUrl, googleMapsUrl)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '16px',
              padding: '12px 16px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Compass size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>Google Maps</div>
                <div style={{ fontSize: '0.725rem', color: '#64748B' }}>Live traffic & alternative routes</div>
              </div>
            </div>
            <ExternalLink size={16} color="#64748B" />
          </button>

          {/* Waze */}
          <button
            onClick={() => handleOpenNav(wazeUrl, googleMapsUrl)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '16px',
              padding: '12px 16px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#06B6D4',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Car size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>Waze Navigation</div>
                <div style={{ fontSize: '0.725rem', color: '#64748B' }}>Real-time police & hazard alerts</div>
              </div>
            </div>
            <ExternalLink size={16} color="#64748B" />
          </button>
        </div>

        {/* Copy Address Row */}
        <button
          onClick={handleCopy}
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            color: '#475569',
            border: '1px solid #CBD5E1',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <Copy size={14} />
          <span>Copy Facility Address to Clipboard</span>
        </button>
      </div>
    </div>
  );
};
