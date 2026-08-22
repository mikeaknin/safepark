import React from 'react';
import { ExitTriggerAlert } from '../../../domain/services/ExitDetectionService';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import { AlertTriangle, Lock, ShieldCheck, Bluetooth, X } from 'lucide-react';

interface ExitAlertModalProps {
  alert: ExitTriggerAlert;
  onClose: () => void;
  onConfirmCabinClear: () => void;
}

export const ExitAlertModal: React.FC<ExitAlertModalProps> = ({
  alert,
  onClose,
  onConfirmCabinClear,
}) => {
  const isHighUrgency = alert.urgency === 'high';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.90)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          backgroundColor: '#1E293B',
          borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
          border: isHighUrgency ? '2px solid #EF4444' : '1px solid #2C73D2',
          boxShadow: isHighUrgency ? SAFE_PARK_TOKENS.shadows.glowRed : SAFE_PARK_TOKENS.shadows.glowBlue,
          maxWidth: '520px',
          width: '100%',
          padding: '24px',
          color: '#FFFFFF',
        }}
      >
        {/* Trigger Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isHighUrgency ? 'rgba(239, 68, 68, 0.2)' : 'rgba(44, 115, 210, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isHighUrgency ? <AlertTriangle size={20} color="#EF4444" /> : <Bluetooth size={20} color="#2C73D2" />}
            </div>
            <div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: isHighUrgency ? '#EF4444' : '#2C73D2',
                }}
              >
                Automatic Exit Trigger Activated
              </span>
              <h2 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>{alert.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#334155',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
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

        {/* Message */}
        <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '20px' }}>
          {alert.message}
        </p>

        {/* Property Protection Checklist */}
        <div
          style={{
            backgroundColor: '#0F172A',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid #334155',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Driver Physical Checklist:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#22C55E" />
              <span>Charging cords, mounts & coins hidden away</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#22C55E" />
              <span>Bags, backpacks, and luggage placed in trunk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="#22C55E" />
              <span>All windows rolled up and doors locked</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              onConfirmCabinClear();
              onClose();
            }}
            style={{
              backgroundColor: isHighUrgency ? '#EF4444' : SAFE_PARK_TOKENS.colors.brand.primary,
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <Lock size={16} />
            {alert.actionPrompt}
          </button>
        </div>
      </div>
    </div>
  );
};
