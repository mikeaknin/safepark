import React from 'react';
import { useApp } from '../context/AppContext';
import { SAFE_PARK_TOKENS } from '../../theme/tokens';
import {
  FlaskConical,
  X,
  Sun,
  Moon,
  WifiOff,
  Bluetooth,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  ShieldAlert,
  Compass,
  Play
} from 'lucide-react';

interface LabToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDemoTour?: () => void;
}

export const LabToolsDrawer: React.FC<LabToolsDrawerProps> = ({
  isOpen,
  onClose,
  onOpenDemoTour,
}) => {
  const {
    isNightMode,
    setIsNightMode,
    handleToggleSubterraneanSignalLoss,
    handleSimulateBluetoothDisconnect,
    setReportingHazardLocation,
    selectedLocation,
    locations,
    setIsOnboardingOpen,
    showToast,
  } = useApp();

  if (!isOpen) return null;

  return (
    <>
      {/* Semi-Transparent Backdrop Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 45,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Slide-Over Diagnostic Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="lab-drawer-title"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100dvh',
          width: '340px',
          maxWidth: '85vw',
          backgroundColor: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(51, 65, 85, 0.8)',
          boxShadow: '-10px 0 36px rgba(0, 0, 0, 0.7)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '20px 18px',
          color: '#FFFFFF',
          transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              <FlaskConical size={20} color="#38BDF8" />
            </div>
            <div>
              <h2 id="lab-drawer-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
                Simulation Lab
              </h2>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Developer Diagnostics</span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Lab Tools Drawer"
            style={{
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              color: '#94A3B8',
              borderRadius: '10px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Section: Environmental Solar Cycle */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
            1. Solar / Lighting Cycle
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => {
                setIsNightMode(false);
                showToast('Simulating Daytime (12:00 PM) - Full ambient daylight active');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: !isNightMode ? '#38BDF8' : '#1E293B',
                color: !isNightMode ? '#0F172A' : '#CBD5E1',
                border: !isNightMode ? '1px solid #38BDF8' : '1px solid #334155',
                borderRadius: '10px',
                padding: '10px',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              <Sun size={16} />
              <span>Day (12:00)</span>
            </button>

            <button
              onClick={() => {
                setIsNightMode(true);
                showToast('Simulating Nighttime (11:00 PM) - Dynamic smart lighting active');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: isNightMode ? '#6366F1' : '#1E293B',
                color: '#FFFFFF',
                border: isNightMode ? '1px solid #6366F1' : '1px solid #334155',
                borderRadius: '10px',
                padding: '10px',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              <Moon size={16} />
              <span>Night (23:00)</span>
            </button>
          </div>
        </div>

        {/* Section: Subterranean Garage Continuity */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
            2. Offline Continuity Mode
          </div>
          <button
            onClick={() => {
              handleToggleSubterraneanSignalLoss();
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#1E293B',
              border: '1px solid #F59E0B',
              color: '#F59E0B',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              minHeight: '44px',
            }}
          >
            <WifiOff size={18} style={{ flexShrink: 0 }} />
            <div>
              <div>Subterranean Garage Signal Loss</div>
              <div style={{ fontSize: '0.675rem', color: '#94A3B8', fontWeight: 400 }}>
                Simulate 0-bar concrete signal drop & cached CSI
              </div>
            </div>
          </button>
        </div>

        {/* Section: Bluetooth Vehicle Departure */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
            3. Vehicle Exit Trigger
          </div>
          <button
            onClick={() => {
              handleSimulateBluetoothDisconnect();
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#1E293B',
              border: '1px solid #38BDF8',
              color: '#38BDF8',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              minHeight: '44px',
            }}
          >
            <Bluetooth size={18} style={{ flexShrink: 0 }} />
            <div>
              <div>Simulate Bluetooth Disconnect</div>
              <div style={{ fontSize: '0.675rem', color: '#94A3B8', fontWeight: 400 }}>
                Trigger background vehicle departure & Safe Walk
              </div>
            </div>
          </button>
        </div>

        {/* Section: Anti-Bias Street Hazard Reporting */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
            4. Anti-Bias Hazard Reporter
          </div>
          <button
            onClick={() => {
              setReportingHazardLocation(selectedLocation || locations[0]);
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#1E293B',
              border: '1px solid #EF4444',
              color: '#EF4444',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              minHeight: '44px',
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <div>
              <div>Report Physical Street Hazard</div>
              <div style={{ fontSize: '0.675rem', color: '#94A3B8', fontWeight: 400 }}>
                Test real-time objective validation & anti-bias filter
              </div>
            </div>
          </button>
        </div>

        {/* Section: Walkthrough & Onboarding Tour */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #334155' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onOpenDemoTour && (
              <button
                onClick={() => {
                  onOpenDemoTour();
                  onClose();
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: '#334155',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                <Play size={14} color="#38BDF8" />
                <span>Feature Tour</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOnboardingOpen(true);
                onClose();
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: '#334155',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              <Compass size={14} color="#22C55E" />
              <span>Onboarding</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
