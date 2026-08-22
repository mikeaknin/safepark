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
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
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
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: isHighUrgency ? '2px solid #BE123C' : '2px solid #2563EB',
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.2)',
          maxWidth: '520px',
          width: '100%',
          padding: '24px',
          color: '#0F172A',
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
                backgroundColor: isHighUrgency ? '#FFF1F2' : '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isHighUrgency ? <AlertTriangle size={20} color="#BE123C" /> : <Bluetooth size={20} color="#2563EB" />}
            </div>
            <div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: isHighUrgency ? '#BE123C' : '#2563EB',
                }}
              >
                Automatic Exit Trigger Activated
              </span>
              <h2 style={{ fontSize: '1.2rem', color: '#0F172A', fontWeight: 800 }}>{alert.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close alert"
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Message */}
        <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
          {alert.message}
        </p>

        {/* Property Protection Checklist */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase' }}>
            Instant Vehicle Lockdown Checklist
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: '#334155', fontWeight: 600 }}>
              <Lock size={15} color="#15803D" />
              <span>All bags, charging cables, and sunglasses removed from plain view</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: '#334155', fontWeight: 600 }}>
              <Lock size={15} color="#15803D" />
              <span>Windows rolled up completely and doors double-locked</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: '#334155', fontWeight: 600 }}>
              <Lock size={15} color="#15803D" />
              <span>Trunk latched and keyless entry fob stored in signal-blocking pouch</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#F1F5F9',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Snooze 5m
          </button>
          <button
            onClick={onConfirmCabinClear}
            style={{
              backgroundColor: '#15803D',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
            }}
          >
            <ShieldCheck size={16} />
            <span>Confirm Cabin Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
};
