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
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(10px)',
        zIndex: 3000,
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
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '28px',
          color: '#FFFFFF',
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
                backgroundColor: step >= s ? SAFE_PARK_TOKENS.colors.brand.primary : '#334155',
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
                  backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: SAFE_PARK_TOKENS.shadows.glowBlue,
                  marginBottom: '12px',
                }}
              >
                <Shield size={32} color="#FFFFFF" />
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                Welcome to SafePark
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '4px' }}>
                Shifting parking decisions from "Where can I park?" to "Where SHOULD I park?"
              </p>
            </div>

            {/* Core CSI Value Props */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                <div style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Vehicle Property Crime Ingestion (40%)</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    Heavily penalizes corridors with recent smash-and-grab break-ins and catalytic converter theft.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                <div style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }}>
                  <Moon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Smart Lighting & Solar Cycles (25%)</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    Adjusts risk dynamically from daytime sunlight to municipal smart LED lumen density at night.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                <div style={{ color: '#22C55E', flexShrink: 0, marginTop: '2px' }}>
                  <Footprints size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Safe Walk Back & Post-Parking Exit Triggers</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    Illuminated pedestrian routes and automatic Bluetooth disconnect reminders to conceal cabin valuables.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
                color: '#FFFFFF',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: SAFE_PARK_TOKENS.shadows.glowBlue,
              }}
            >
              Continue to Legal Terms <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: LEGAL GUARDRAILS & BAILMENT WAIVERS */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase' }}>
                Mandatory Legal Guardrails
              </div>
              <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>
                Terms & Risk Disclosures
              </h2>
            </div>

            <div
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '14px',
                maxHeight: '220px',
                overflowY: 'auto',
                fontSize: '0.8rem',
                color: '#CBD5E1',
                lineHeight: 1.5,
                marginBottom: '16px',
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#FFFFFF' }}>1. Informational Risk Estimation Only (No Safety Guarantee):</strong>
                <p style={{ marginTop: '2px', color: '#94A3B8' }}>
                  {LEGAL_SAFEGUARDS.NON_GUARANTEE_DISCLAIMER.body}
                </p>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#FFFFFF' }}>2. Bailment & Custody Waiver:</strong>
                <p style={{ marginTop: '2px', color: '#94A3B8' }}>
                  {LEGAL_SAFEGUARDS.BAILMENT_WAIVER.body}
                </p>
              </div>

              <div>
                <strong style={{ color: '#FFFFFF' }}>3. Objective Anti-Bias Reporting Standards:</strong>
                <p style={{ marginTop: '2px', color: '#94A3B8' }}>
                  {LEGAL_SAFEGUARDS.ANTI_BIAS_SUBMISSION_POLICY.body}
                </p>
              </div>
            </div>

            {/* Acknowledgment Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                backgroundColor: agreedToDisclaimer ? 'rgba(44, 115, 210, 0.15)' : '#0F172A',
                border: agreedToDisclaimer ? '1px solid #2C73D2' : '1px solid #334155',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                cursor: 'pointer',
                fontSize: '0.825rem',
              }}
            >
              <input
                type="checkbox"
                checked={agreedToDisclaimer}
                onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
                style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: SAFE_PARK_TOKENS.colors.brand.primary }}
              />
              <span>
                I understand and agree that SafePark provides informational risk analytics only, does not guarantee vehicle security, and accepts no bailment custody of personal property.
              </span>
            </label>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  backgroundColor: '#334155',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={() => agreedToDisclaimer && setStep(3)}
                disabled={!agreedToDisclaimer}
                style={{
                  flex: 1,
                  backgroundColor: agreedToDisclaimer ? SAFE_PARK_TOKENS.colors.brand.primary : '#334155',
                  color: agreedToDisclaimer ? '#FFFFFF' : '#64748B',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: agreedToDisclaimer ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                Accept & Proceed <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: INTERACTIVE PERMISSION HANDSHAKES */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#22C55E', fontWeight: 700, textTransform: 'uppercase' }}>
                System Handshakes
              </div>
              <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>
                Configure Driver Protection
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Enable core hardware integrations for real-time risk assessment.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {/* Location */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#0F172A',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={20} color="#2C73D2" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Precise Location Services</div>
                    <div style={{ fontSize: '0.725rem', color: '#94A3B8' }}>Nearby spot discovery & pedestrian routing</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={locationPermission}
                  onChange={(e) => setLocationPermission(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: SAFE_PARK_TOKENS.colors.brand.primary, cursor: 'pointer' }}
                />
              </div>

              {/* Bluetooth Exit Detection */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#0F172A',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bluetooth size={20} color="#38BDF8" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bluetooth Exit Detection</div>
                    <div style={{ fontSize: '0.725rem', color: '#94A3B8' }}>Detects CarPlay disconnect to push break-in alerts</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={bluetoothPermission}
                  onChange={(e) => setBluetoothPermission(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: SAFE_PARK_TOKENS.colors.brand.primary, cursor: 'pointer' }}
                />
              </div>

              {/* Push Notifications */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#0F172A',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bell size={20} color="#F59E0B" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Critical Safety Advisories</div>
                    <div style={{ fontSize: '0.725rem', color: '#94A3B8' }}>High-risk property notices & safe walk guidance</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushPermission}
                  onChange={(e) => setPushPermission(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: SAFE_PARK_TOKENS.colors.brand.primary, cursor: 'pointer' }}
                />
              </div>
            </div>

            <button
              onClick={onComplete}
              style={{
                width: '100%',
                backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
                color: '#FFFFFF',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: SAFE_PARK_TOKENS.shadows.glowBlue,
              }}
            >
              <CheckCircle2 size={18} /> Launch SafePark Navigation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
