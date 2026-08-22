import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SAFE_PARK_TOKENS } from '../../theme/tokens';
import { GarageSecurityAudit, CertificationResult } from '../../domain/models/Certification';
import { CertificationEngine } from '../../domain/services/CertificationEngine';
import { StripePaymentService, B2B_CERTIFICATION_PLANS } from '../../domain/services/StripePaymentService';
import {
  ShieldCheck,
  Building2,
  Video,
  Lock,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ShieldAlert,
  CreditCard
} from 'lucide-react';

export const GarageOperatorPortal: React.FC = () => {
  const { locations, setSelectedLocation, showToast, refreshLocations } = useApp();

  const [selectedSpotId, setSelectedSpotId] = useState<string>(locations[0]?.id || 'spot-sf-002');
  const targetSpot = locations.find(l => l.id === selectedSpotId) || locations[0];

  const [auditData, setAuditData] = useState<GarageSecurityAudit>({
    facilityId: targetSpot?.id || 'spot-sf-002',
    facilityName: targetSpot?.name || 'SOMA 5th St Gated Deck',
    operatorName: 'Pacific Parking Management Group LLC',
    has247MannedGuards: true,
    cctvCoveragePercentage: 92,
    hasPhysicalBarrierGates: true,
    averageLumenOutputLux: 62,
    hasLicencePlateRecognition: true,
    hasEmergencyHelpCallBoxes: true,
    hasUndergroundEnclosure: true,
    insuranceBondingVerified: true,
  });

  const [certificationResult, setCertificationResult] = useState<CertificationResult | null>(null);
  const [isEnrollingSaaS, setIsEnrollingSaaS] = useState<boolean>(false);

  const handleRunAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = CertificationEngine.evaluateFacility(auditData);
    setCertificationResult(result);
  };

  const handleApplyToLiveMap = async () => {
    if (targetSpot && certificationResult) {
      const updated = CertificationEngine.applyCertificationToLocation(targetSpot, auditData, certificationResult);
      setSelectedLocation(updated);
      showToast(`🛡️ Facility "${targetSpot.name}" upgraded to ${certificationResult.certifiedBadgeLabel}! Live CSI boosted.`);
      refreshLocations();
    }
  };

  const handleStripeB2BEnroll = async () => {
    if (!certificationResult) return;
    setIsEnrollingSaaS(true);
    try {
      const res = await StripePaymentService.processB2BOperatorCheckout(
        targetSpot?.id || 'spot-sf-002',
        certificationResult.tier as 'silver' | 'gold' | 'platinum'
      );
      setIsEnrollingSaaS(false);
      showToast(`💳 B2B SaaS Activated (${res.subscriptionId}). Certification auto-renewed monthly.`);
      handleApplyToLiveMap();
    } catch (e) {
      setIsEnrollingSaaS(false);
      showToast('❌ B2B Stripe billing authorization failed.');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 0' }}>
      {/* Portal Header */}
      <div
        style={{
          backgroundColor: '#1E293B',
          borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
          border: '1px solid #334155',
          padding: '24px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                backgroundColor: 'rgba(44, 115, 210, 0.2)',
                color: '#38BDF8',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              B2B OPERATOR SUITE
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Facility Self-Service Audit & SaaS Billing</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', color: '#FFFFFF' }}>
            SafePark Certified™ Facility Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#CBD5E1', maxWidth: '600px', marginTop: '4px' }}>
            Verify your garage's physical security, surveillance infrastructure, and lighting standards to earn verified trust badges and increase driver conversion.
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid #334155',
            padding: '12px 18px',
            borderRadius: '10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>B2B Certification Impact</div>
          <div className="tabular-nums" style={{ fontSize: '1.4rem', color: '#22C55E', fontWeight: 700 }}>
            +38% Conversion
          </div>
          <div style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>For Certified Low-Risk Garages</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px' }}>
        {/* Left Column: Security Verification Form */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
            border: '1px solid #334155',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Building2 size={20} color={SAFE_PARK_TOKENS.colors.brand.primary} />
            <h2 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>Facility Security Audit Form</h2>
          </div>

          <form onSubmit={handleRunAudit}>
            {/* Target Facility Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', color: '#CBD5E1', marginBottom: '6px', fontWeight: 600 }}>
                Select Managed Facility to Certify
              </label>
              <select
                value={selectedSpotId}
                onChange={(e) => {
                  setSelectedSpotId(e.target.value);
                  const s = locations.find(l => l.id === e.target.value);
                  if (s) {
                    setAuditData(prev => ({ ...prev, facilityId: s.id, facilityName: s.name }));
                  }
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                }}
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} (Current CSI: {loc.csi.totalScore})
                  </option>
                ))}
              </select>
            </div>

            {/* Guard Presence */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #334155' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>24/7 Dedicated Uniformed Security Patrol</div>
                <div style={{ fontSize: '0.725rem', color: '#94A3B8' }}>Active physical personnel patrolling parking apron</div>
              </div>
              <input
                type="checkbox"
                checked={auditData.has247MannedGuards}
                onChange={(e) => setAuditData(prev => ({ ...prev, has247MannedGuards: e.target.checked }))}
                style={{ width: '20px', height: '20px', accentColor: SAFE_PARK_TOKENS.colors.brand.primary, cursor: 'pointer' }}
              />
            </div>

            {/* HD CCTV Coverage % Slider */}
            <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>High-Definition CCTV Coverage</span>
                <span className="tabular-nums" style={{ color: '#22C55E', fontWeight: 700 }}>
                  {auditData.cctvCoveragePercentage}% Stalls Covered
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={auditData.cctvCoveragePercentage}
                onChange={(e) => setAuditData(prev => ({ ...prev, cctvCoveragePercentage: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: SAFE_PARK_TOKENS.colors.brand.primary, cursor: 'pointer' }}
              />
            </div>

            {/* Lighting Output Slider */}
            <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Average Stalls Illumination Level</span>
                <span className="tabular-nums" style={{ color: '#38BDF8', fontWeight: 700 }}>
                  {auditData.averageLumenOutputLux} Lux
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={auditData.averageLumenOutputLux}
                onChange={(e) => setAuditData(prev => ({ ...prev, averageLumenOutputLux: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: SAFE_PARK_TOKENS.colors.brand.primary, cursor: 'pointer' }}
              />
            </div>

            {/* Barrier Gate */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #334155' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Physical Barrier Credential Gates</div>
                <div style={{ fontSize: '0.725rem', color: '#94A3B8' }}>Automated RFID, Ticketed, or App Barrier Entry/Exit</div>
              </div>
              <input
                type="checkbox"
                checked={auditData.hasPhysicalBarrierGates}
                onChange={(e) => setAuditData(prev => ({ ...prev, hasPhysicalBarrierGates: e.target.checked }))}
                style={{ width: '20px', height: '20px', accentColor: SAFE_PARK_TOKENS.colors.brand.primary, cursor: 'pointer' }}
              />
            </div>

            {/* Additional Safeguards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.775rem', backgroundColor: '#0F172A', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={auditData.hasLicencePlateRecognition}
                  onChange={(e) => setAuditData(prev => ({ ...prev, hasLicencePlateRecognition: e.target.checked }))}
                  style={{ accentColor: SAFE_PARK_TOKENS.colors.brand.primary }}
                />
                <span>LPR Plate Camera</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.775rem', backgroundColor: '#0F172A', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={auditData.hasEmergencyHelpCallBoxes}
                  onChange={(e) => setAuditData(prev => ({ ...prev, hasEmergencyHelpCallBoxes: e.target.checked }))}
                  style={{ accentColor: SAFE_PARK_TOKENS.colors.brand.primary }}
                />
                <span>Help Call Boxes</span>
              </label>
            </div>

            <button
              type="submit"
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
              <Award size={18} /> Calculate SafePark Certification Tier
            </button>
          </form>
        </div>

        {/* Right Column: Certification Rating & Stripe B2B SaaS Subscription */}
        <div>
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
              border: '1px solid #334155',
              padding: '24px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <ShieldCheck size={20} color="#22C55E" />
                <h2 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>Audit & Rating Results</h2>
              </div>

              {certificationResult ? (
                <div>
                  {/* Verified Badge Card */}
                  <div
                    style={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      border: `2px solid ${certificationResult.tier === 'platinum' ? '#38BDF8' : certificationResult.tier === 'gold' ? '#F59E0B' : '#22C55E'}`,
                      padding: '20px',
                      textAlign: 'center',
                      marginBottom: '16px',
                      boxShadow: SAFE_PARK_TOKENS.shadows.glowGreen,
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <Award size={28} color="#22C55E" />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>
                      {certificationResult.certifiedBadgeLabel}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Security Audit Score</div>
                        <div className="tabular-nums" style={{ fontSize: '1.1rem', color: '#FFFFFF', fontWeight: 700 }}>
                          {certificationResult.auditScore}/100
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>CSI Score Boost</div>
                        <div className="tabular-nums" style={{ fontSize: '1.1rem', color: '#22C55E', fontWeight: 700 }}>
                          +{certificationResult.csiBaselineBoost} Pts
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Notes List */}
                  <div style={{ backgroundColor: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Verified Infrastructure Safeguards:
                    </div>
                    {certificationResult.complianceNotes.map((note, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem', color: '#94A3B8', marginBottom: '4px' }}>
                        <CheckCircle2 size={13} color="#22C55E" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: '#94A3B8',
                    marginBottom: '20px',
                  }}
                >
                  <FileCheck size={36} color="#64748B" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem' }}>
                    Complete the security audit checklist and click "Calculate SafePark Certification Tier" to generate your verified rating.
                  </p>
                </div>
              )}
            </div>

            {/* B2B Stripe SaaS Activation & Live Map Sync CTAs */}
            {certificationResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleStripeB2BEnroll}
                  disabled={isEnrollingSaaS}
                  style={{
                    backgroundColor: '#2C73D2',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: isEnrollingSaaS ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: SAFE_PARK_TOKENS.shadows.glowBlue,
                  }}
                >
                  <CreditCard size={18} />
                  <span>
                    {isEnrollingSaaS
                      ? 'Processing Stripe B2B SaaS Enrollment...'
                      : `Subscribe to SaaS Certification ($${B2B_CERTIFICATION_PLANS[certificationResult.tier]?.priceMonthly || 349}/mo)`}
                  </span>
                </button>

                <button
                  onClick={handleApplyToLiveMap}
                  style={{
                    backgroundColor: '#22C55E',
                    color: '#0F172A',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <Sparkles size={18} /> Apply Verified Certification to Live Driver Map
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
