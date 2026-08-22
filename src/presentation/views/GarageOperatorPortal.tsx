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
    cctvCoveragePercentage: 100,
    hasPhysicalBarrierGates: true,
    averageLumenOutputLux: 75,
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
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
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
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                border: '1px solid #BFDBFE',
              }}
            >
              B2B Enterprise SaaS
            </span>
            <span style={{ color: '#64748B', fontSize: '0.8rem' }}>ISO/IEC 27001 Security Standard</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', color: '#0F172A', fontWeight: 800 }}>
            SafePark Certified™ Facility Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '4px' }}>
            Submit verified infrastructure telemetry to elevate your facility's CSI score and earn official SafePark Certified Trust Badges.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '10px 16px',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#065F46', fontWeight: 700, textTransform: 'uppercase' }}>
              Average Yield Boost
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803D' }}>
              +38% Driver Bookings
            </div>
          </div>
        </div>
      </div>

      {/* Main Form & Live Preview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Left Column: Security Audit Entry Form */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Building2 size={20} color="#2563EB" />
            <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>
              Physical Infrastructure Audit Form
            </h2>
          </div>

          <form onSubmit={handleRunAudit}>
            {/* Select Target Facility */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 700, marginBottom: '6px' }}>
                Select SF Garage Facility
              </label>
              <select
                value={selectedSpotId}
                onChange={(e) => {
                  setSelectedSpotId(e.target.value);
                  const loc = locations.find(l => l.id === e.target.value);
                  if (loc) {
                    setAuditData(prev => ({
                      ...prev,
                      facilityId: loc.id,
                      facilityName: loc.name,
                    }));
                  }
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#0F172A',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} (Current CSI: {loc.csi.totalScore})
                  </option>
                ))}
              </select>
            </div>

            {/* Operator Company Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 700, marginBottom: '6px' }}>
                Commercial Operator Entity
              </label>
              <input
                type="text"
                value={auditData.operatorName}
                onChange={(e) => setAuditData({ ...auditData, operatorName: e.target.value })}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#0F172A',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              />
            </div>

            {/* CCTV Coverage Percentage */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 700 }}>
                  High-Definition CCTV Stall Coverage (%)
                </label>
                <span className="tabular-nums" style={{ color: '#2563EB', fontWeight: 800 }}>
                  {auditData.cctvCoveragePercentage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={auditData.cctvCoveragePercentage}
                onChange={(e) => setAuditData({ ...auditData, cctvCoveragePercentage: Number(e.target.value) })}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Average Lux Output */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 700 }}>
                  Internal High-Bay LED Lumens (Avg Lux)
                </label>
                <span className="tabular-nums" style={{ color: '#B45309', fontWeight: 800 }}>
                  {auditData.averageLumenOutputLux} Lux
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                value={auditData.averageLumenOutputLux}
                onChange={(e) => setAuditData({ ...auditData, averageLumenOutputLux: Number(e.target.value) })}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Checkbox Security Hardware Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.825rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={auditData.has247MannedGuards}
                  onChange={(e) => setAuditData({ ...auditData, has247MannedGuards: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>24/7 Uniformed On-Site Security Staff</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.825rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={auditData.hasPhysicalBarrierGates}
                  onChange={(e) => setAuditData({ ...auditData, hasPhysicalBarrierGates: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Automated Rapid-Drop Roll-up Security Gates</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.825rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={auditData.hasLicencePlateRecognition}
                  onChange={(e) => setAuditData({ ...auditData, hasLicencePlateRecognition: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Automated License Plate Recognition (ALPR) Cameras</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.825rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={auditData.hasUndergroundEnclosure}
                  onChange={(e) => setAuditData({ ...auditData, hasUndergroundEnclosure: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Fully Enclosed Subterranean Concrete Vault Structure</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.825rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={auditData.insuranceBondingVerified}
                  onChange={(e) => setAuditData({ ...auditData, insuranceBondingVerified: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>$2M Commercial Theft & Property Damage Bonding Active</span>
              </label>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              }}
            >
              <FileCheck size={18} />
              <span>Calculate SafePark Certification Tier</span>
            </button>
          </form>
        </div>

        {/* Right Column: Audit Evaluation Results & SaaS Stripe Activation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {certificationResult ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: `2px solid ${certificationResult.tier === 'platinum' ? '#15803D' : '#2563EB'}`,
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    <Award size={16} /> Audit & Rating Results
                  </div>
                  <h3 style={{ fontSize: '1.3rem', color: '#0F172A', fontWeight: 800, marginTop: '2px' }}>
                    {certificationResult.certifiedBadgeLabel}
                  </h3>
                </div>
                <div
                  style={{
                    backgroundColor: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #A7F3D0',
                    borderRadius: '8px',
                    padding: '4px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                  }}
                >
                  +{certificationResult.csiBaselineBoost} CSI Pts
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '6px', fontWeight: 700 }}>
                  Projected Consumer Impact
                </div>
                <div style={{ fontSize: '1.1rem', color: '#0F172A', fontWeight: 800 }}>
                  CSI Score: {targetSpot?.csi.totalScore || 70} ➔ {Math.min(100, (targetSpot?.csi.totalScore || 70) + certificationResult.csiBaselineBoost)}/100
                </div>
                <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                  Tier: {certificationResult.tier.toUpperCase()} • Baseline Score: {certificationResult.auditScore}/100
                </p>
              </div>

              {/* Verified Safeguards Checklist */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                  Compliance & Verified Safeguards
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {certificationResult.complianceNotes.map((note, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                      <CheckCircle2 size={14} color="#15803D" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stripe B2B Subscription Section */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Enterprise Certification SaaS</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB' }}>$199/mo</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={handleStripeB2BEnroll}
                    disabled={isEnrollingSaaS}
                    style={{
                      width: '100%',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: isEnrollingSaaS ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    <CreditCard size={16} />
                    <span>{isEnrollingSaaS ? 'Activating...' : 'Subscribe to SaaS Certification'}</span>
                  </button>

                  <button
                    onClick={handleApplyToLiveMap}
                    style={{
                      width: '100%',
                      backgroundColor: '#F1F5F9',
                      color: '#0F172A',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      padding: '10px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Apply Verified Certification to Live Driver Map
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px dashed #CBD5E1',
                padding: '40px 24px',
                textAlign: 'center',
                color: '#64748B',
              }}
            >
              <Award size={48} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#0F172A', fontWeight: 800, marginBottom: '6px' }}>
                No Active Audit Evaluation
              </h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '360px', margin: '0 auto' }}>
                Fill out the physical infrastructure parameters on the left and click "Calculate SafePark Certification Tier" to calculate your badge tier.
              </p>
            </div>
          )}

          {/* Value Proposition Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '12px' }}>
              <TrendingUp size={20} color="#15803D" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Top Map Placement</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                Certified facilities receive priority pin ranking in consumer searches.
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '12px' }}>
              <ShieldCheck size={20} color="#2563EB" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Verified Safety Seal</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                Showcases real-time manned security and barrier gate telemetry.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
