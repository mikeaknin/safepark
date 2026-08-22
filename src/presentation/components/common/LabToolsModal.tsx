import React from 'react';
import { useApp } from '../../context/AppContext';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
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
  ShieldAlert
} from 'lucide-react';

interface LabToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDemoTour: () => void;
}

export const LabToolsModal: React.FC<LabToolsModalProps> = ({
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lab-tools-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
          width: '100%',
          maxWidth: '480px',
          padding: '24px',
          color: '#FFFFFF',
          boxShadow: SAFE_PARK_TOKENS.shadows.card,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FlaskConical size={18} color="#38BDF8" />
            </div>
            <div>
              <h2 id="lab-tools-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                SafePark Simulation & Lab Tools
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Simulate environmental factors, offline subterranean caching & triggers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Lab Tools"
            style={{
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              color: '#94A3B8',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '36px',
              minHeight: '36px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tools Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Day / Night Toggle */}
          <button
            onClick={() => {
              setIsNightMode(!isNightMode);
              showToast(isNightMode ? '☀️ Switched to Daytime (Solar Lux: 1200)' : '🌙 Switched to Night Mode (Smart Lighting Active)');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '14px',
              color: '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'left',
              minHeight: '44px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isNightMode ? <Moon size={20} color="#F59E0B" /> : <Sun size={20} color="#38BDF8" />}
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {isNightMode ? 'Night Mode Active' : 'Day Mode Active'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  {isNightMode ? 'Smart lighting grids & darkness risk penalties applied' : 'Solar zenith peak illumination (1200 Lux)'}
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: isNightMode ? '#F59E0B' : '#38BDF8',
                backgroundColor: '#1E293B',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              Toggle
            </span>
          </button>

          {/* Subterranean Signal Loss Simulation */}
          <button
            onClick={() => {
              handleToggleSubterraneanSignalLoss();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '14px',
              color: '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'left',
              minHeight: '44px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <WifiOff size={20} color="#EF4444" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Subterranean Garage Signal Loss
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Simulate zero cell coverage & test local offline cache fallback
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#EF4444',
                backgroundColor: '#1E293B',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              Simulate
            </span>
          </button>

          {/* Bluetooth Vehicle Exit Trigger */}
          <button
            onClick={() => {
              handleSimulateBluetoothDisconnect();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '14px',
              color: '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'left',
              minHeight: '44px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Bluetooth size={20} color="#38BDF8" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Vehicle Exit & Bluetooth Disconnect
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Fires post-parking exit alert & cabin belongings check
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#38BDF8',
                backgroundColor: '#1E293B',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              Trigger
            </span>
          </button>

          {/* Anti-Bias Hazard Reporter */}
          <button
            onClick={() => {
              setReportingHazardLocation(selectedLocation || locations[0]);
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '14px',
              color: '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'left',
              minHeight: '44px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={20} color="#F59E0B" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Report Physical Street Hazard
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Test anti-bias validator against subjective profiling
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#F59E0B',
                backgroundColor: '#1E293B',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              Report
            </span>
          </button>

          {/* Guided Stakeholder Demo Tour */}
          <button
            onClick={() => {
              onClose();
              onOpenDemoTour();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '14px',
              color: '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'left',
              minHeight: '44px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles size={20} color="#2C73D2" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Guided Stakeholder Demo Tour
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Interactive 5-step walkthrough of the SafePark ecosystem
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#FFFFFF',
                backgroundColor: '#2C73D2',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              Start Tour
            </span>
          </button>

          {/* Legal Terms & CSI Math Info */}
          <button
            onClick={() => {
              onClose();
              setIsOnboardingOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '14px',
              color: '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'left',
              minHeight: '44px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <HelpCircle size={20} color="#94A3B8" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Legal Terms & CSI Formula Guide
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Review non-bailment disclaimer & CSI weighting formulation
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#94A3B8',
                backgroundColor: '#1E293B',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              View
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
