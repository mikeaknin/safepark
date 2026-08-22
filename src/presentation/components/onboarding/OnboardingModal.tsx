import React, { useState } from 'react';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import { LEGAL_SAFEGUARDS } from '../../../domain/models/LegalNotice';
import {
  Shield,
  ShieldCheck,
  Lock,
  Moon,
  Footprints,
  Bluetooth,
  Bell,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Info
} from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
  const [locationPermission, setLocationPermission] = useState(true);
  const [bluetoothPermission, setBluetoothPermission] = useState(true);
  const [pushPermission, setPushPermission] = useState(true);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 3000,
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
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '28px',
          color: '#0F172A',
        }}
      >
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: '32px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: step >= s ? '#2563EB' : '#E2E8F0',
                transition: 'background-color 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* STEP 1: CSI ENGINE INTRODUCTION */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#2563EB',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  marginBottom: '12px',
                }}
              >
                <Shield size={32} color="#FFFFFF" />
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#0F172A', letterSpacing: '-0.02em', fontWeight: 800 }}>
                Welcome to SafePark
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                Shifting parking decisions from "Where can I park?" to "Where SHOULD I park?"
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '12px', display: 'flex', gap: '12px' }}>
                <ShieldCheck size={22} color="#15803D" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Composite Safety Index (CSI)</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    Proprietary 0-100 scoring based on vehicle break-in rates, lighting grid density, and infrastructure tiers.
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '12px', display: 'flex', gap: '12px' }}>
                <Footprints size={22} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Safe Walk Back Corridors</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    Illuminated pedestrian routing optimizing for high-lux streetlights, active commerce, and safe terrain.
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '12px', display: 'flex', gap: '12px' }}>
                <Lock size={22} color="#B45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Automatic Exit Triggers</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    Zero-touch cabin sweeps triggered via CarPlay disconnection, Bluetooth, and step detection.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              }}
            >
              <span>Continue</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: HARDWARE & SENSOR PERMISSIONS */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#2563EB',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  marginBottom: '12px',
                }}
              >
                <Bluetooth size={32} color="#FFFFFF" />
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#0F172A', letterSpacing: '-0.02em', fontWeight: 800 }}>
                Sensor & Exit Detection
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                Enable background awareness for automatic cabin-clear alerts when parking.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div
                onClick={() => setLocationPermission(!locationPermission)}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: locationPermission ? '2px solid #15803D' : '1px solid #E2E8F0',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <MapPin size={20} color="#2563EB" />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>Precise Location</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Real-time GPS spot proximity & routing</div>
                  </div>
                </div>
                <CheckCircle2 size={20} color={locationPermission ? '#15803D' : '#CBD5E1'} />
              </div>

              <div
                onClick={() => setBluetoothPermission(!bluetoothPermission)}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: bluetoothPermission ? '2px solid #15803D' : '1px solid #E2E8F0',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Bluetooth size={20} color="#2563EB" />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>Bluetooth / CarPlay Disconnect</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Zero-touch trigger when car turns off</div>
                  </div>
                </div>
                <CheckCircle2 size={20} color={bluetoothPermission ? '#15803D' : '#CBD5E1'} />
              </div>

              <div
                onClick={() => setPushPermission(!pushPermission)}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: pushPermission ? '2px solid #15803D' : '1px solid #E2E8F0',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Bell size={20} color="#B45309" />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>High-Priority Push Notifications</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Immediate theft mitigation warnings</div>
                  </div>
                </div>
                <CheckCircle2 size={20} color={pushPermission ? '#15803D' : '#CBD5E1'} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                style={{
                  flex: 2,
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                }}
              >
                <span>Continue</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LEGAL SAFEGUARDS & ZERO-LIABILITY DISCLAIMER */}
        {step === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#B45309',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(180, 83, 9, 0.3)',
                  marginBottom: '12px',
                }}
              >
                <AlertTriangle size={32} color="#FFFFFF" />
              </div>
              <h2 style={{ fontSize: '1.3rem', color: '#0F172A', letterSpacing: '-0.02em', fontWeight: 800 }}>
                Safety Advisory & Terms
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                Please review our statistical disclaimer and community policies.
              </p>
            </div>

            {/* Disclaimer Box */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '0.775rem',
                color: '#475569',
                maxHeight: '180px',
                overflowY: 'auto',
                marginBottom: '16px',
                lineHeight: 1.5,
              }}
            >
              <p style={{ marginBottom: '8px', fontWeight: 700, color: '#0F172A' }}>
                {LEGAL_SAFEGUARDS.zeroLiabilityDisclaimer.title}
              </p>
              <p style={{ marginBottom: '8px' }}>
                {LEGAL_SAFEGUARDS.zeroLiabilityDisclaimer.body}
              </p>
              <p style={{ marginBottom: '8px', fontWeight: 700, color: '#0F172A' }}>
                {LEGAL_SAFEGUARDS.antiBiasSafeguard.title}
              </p>
              <p>{LEGAL_SAFEGUARDS.antiBiasSafeguard.body}</p>
            </div>

            {/* Checkbox */}
            <div
              onClick={() => setAgreedToDisclaimer(!agreedToDisclaimer)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px',
                backgroundColor: agreedToDisclaimer ? '#ECFDF5' : '#F8FAFC',
                border: agreedToDisclaimer ? '1.5px solid #15803D' : '1px solid #E2E8F0',
                borderRadius: '10px',
                cursor: 'pointer',
                marginBottom: '20px',
              }}
            >
              <input
                type="checkbox"
                checked={agreedToDisclaimer}
                onChange={() => {}}
                style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 600, lineHeight: 1.4 }}>
                I acknowledge that SafePark provides statistical probabilistic guidance only, does not guarantee vehicle safety, and will never replace personal driver vigilance.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  flex: 1,
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={onComplete}
                disabled={!agreedToDisclaimer}
                style={{
                  flex: 2,
                  backgroundColor: agreedToDisclaimer ? '#15803D' : '#94A3B8',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: agreedToDisclaimer ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: agreedToDisclaimer ? '0 4px 14px rgba(21, 128, 61, 0.3)' : 'none',
                }}
              >
                <CheckCircle2 size={18} />
                <span>Enter SafePark</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
