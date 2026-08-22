import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SAFE_PARK_TOKENS } from '../../theme/tokens';
import { ApiKeyRecord, EnterpriseBlockRiskPayload } from '../../domain/models/EnterpriseApi';
import {
  Code,
  Key,
  Layers,
  Activity,
  Copy,
  CheckCircle2,
  Server,
  Terminal,
  Shield,
  Zap,
  TrendingUp,
  Database
} from 'lucide-react';

export const EnterpriseApiDashboard: React.FC = () => {
  const { locations, showToast } = useApp();

  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([
    {
      id: 'key-oem-101',
      name: 'Tesla Fleet Telematics Integration',
      keyMasked: 'sp_live_99f8a•••••••••••••••bc14',
      createdAt: '2026-06-12',
      tier: 'Enterprise OEM',
      rateLimitPerMin: 12000,
      requestsTotal: 184520,
      active: true,
    },
    {
      id: 'key-ins-202',
      name: 'Nationwide Mobility Underwriting Feed',
      keyMasked: 'sp_live_44e2b•••••••••••••••88d2',
      createdAt: '2026-07-04',
      tier: 'Mobility Insurer',
      rateLimitPerMin: 5000,
      requestsTotal: 92410,
      active: true,
    }
  ]);

  const [newKeyName, setNewKeyName] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'geojson' | 'curl'>('json');

  // Simulated live geocoded block telemetry payload
  const livePayloads: EnterpriseBlockRiskPayload[] = locations.map((loc) => ({
    blockId: `blk-${loc.id}`,
    geohash: '9q8yyk',
    neighborhood: 'South of Market (SOMA), SF',
    coordinates: loc.coordinates,
    csiScore: loc.csi.totalScore,
    riskTier: loc.csi.totalScore >= 75 ? 'LOW' : loc.csi.totalScore >= 50 ? 'MODERATE' : 'HIGH',
    smashAndGrabIncidents30d: loc.crimeData.smashAndGrabCount,
    catalyticThefts30d: loc.crimeData.catalyticConverterCount,
    lightingLuxAverage: loc.lighting.ambientLuxLevel,
    municipalSmartLampsActive: loc.lighting.municipalSmartLamps.filter(l => l.status === 'active').length,
    cctvSurveillanceTier: loc.infrastructure.surveillance,
    timestampUtc: new Date().toISOString(),
  }));

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const newKey: ApiKeyRecord = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      keyMasked: `sp_live_${Math.random().toString(36).substring(2, 6)}•••••••••••••••${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString().split('T')[0],
      tier: 'Enterprise OEM',
      rateLimitPerMin: 10000,
      requestsTotal: 0,
      active: true,
    };

    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
    showToast(`🔑 Generated Enterprise API Key: "${newKey.name}"`);
  };

  const curlSnippet = `curl -X GET "https://api.safepark.ai/v1/blocks/risk?lat=37.7812&lng=-122.4001&radius=500" \\
  -H "Authorization: Bearer sp_live_99f8a..." \\
  -H "Content-Type: application/json"`;

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '16px 0' }}>
      {/* Enterprise Header */}
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
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                color: '#38BDF8',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              ENTERPRISE DATA FEED
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Automotive OEM & Insurer Gateway</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', color: '#FFFFFF' }}>
            SafePark Risk Telemetry API Suite
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#CBD5E1', maxWidth: '640px', marginTop: '4px' }}>
            Integrate real-time block-level property risk scores (CSI), municipal lighting density, and break-in hazard feeds directly into in-car headunits, dispatch systems, and actuarial underwriting engines.
          </p>
        </div>

        {/* Telemetry Stats */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #334155', padding: '10px 16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>UPTIME</div>
            <div className="tabular-nums" style={{ fontSize: '1.2rem', color: '#22C55E', fontWeight: 700 }}>99.98%</div>
          </div>
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #334155', padding: '10px 16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>P99 LATENCY</div>
            <div className="tabular-nums" style={{ fontSize: '1.2rem', color: '#38BDF8', fontWeight: 700 }}>18ms</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left: API Key Provisioning & Usage Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Key Generation */}
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
              border: '1px solid #334155',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Key size={18} color={SAFE_PARK_TOKENS.colors.brand.primary} />
              <h2 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>API Key Management</h2>
            </div>

            <form onSubmit={handleGenerateKey} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key application name (e.g. In-Car HUD Prod)..."
                style={{
                  flex: 1,
                  backgroundColor: '#0F172A',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Provision Key
              </button>
            </form>

            {/* Key List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {apiKeys.map((k) => (
                <div
                  key={k.id}
                  style={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FFFFFF' }}>{k.name}</span>
                    <span style={{ fontSize: '0.7rem', backgroundColor: '#334155', color: '#38BDF8', padding: '2px 6px', borderRadius: '4px' }}>
                      {k.tier}
                    </span>
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '0.775rem', color: '#94A3B8', marginTop: '4px' }}>
                    {k.keyMasked}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#64748B', marginTop: '8px' }}>
                    <span>Rate Limit: {k.rateLimitPerMin}/min</span>
                    <span>Total Invocations: {k.requestsTotal.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Snippets */}
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
              border: '1px solid #334155',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} color="#22C55E" />
                <h3 style={{ fontSize: '1rem', color: '#FFFFFF' }}>cURL Quickstart</h3>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(curlSnippet);
                  showToast('📋 Copied cURL command to clipboard');
                }}
                style={{
                  background: '#334155',
                  border: 'none',
                  color: '#CBD5E1',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Copy size={12} /> Copy
              </button>
            </div>

            <pre
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '12px',
                color: '#38BDF8',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                overflowX: 'auto',
                lineHeight: 1.4,
              }}
            >
              {curlSnippet}
            </pre>
          </div>
        </div>

        {/* Right: Real-time Live JSON Stream Preview */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
            border: '1px solid #334155',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#22C55E" />
              <h2 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>Live Risk Stream (JSON)</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.725rem', color: '#22C55E' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
              <span>Streaming 4 Blocks Telemetry</span>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '14px',
              color: '#A7F3D0',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              overflowY: 'auto',
              maxHeight: '520px',
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(livePayloads, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
