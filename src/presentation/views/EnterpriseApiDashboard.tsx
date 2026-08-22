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
                border: '1px solid #BFDBFE',
              }}
            >
              Enterprise B2B Telematics
            </span>
            <span style={{ color: '#64748B', fontSize: '0.8rem' }}>REST & GraphQL API Endpoints</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', color: '#0F172A', fontWeight: 800 }}>
            Geocoded Risk API & Data Feeds
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '4px' }}>
            Direct data pipelines feeding real-time CSI scores and break-in hazard telemetry into connected vehicle in-dash infotainment and insurance underwriting models.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '10px 16px',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Active Monthly OEM Calls
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB' }}>
              276,930
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Left Column Key Management / Right Column Live JSON Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Left Column: API Key Management & Ingestion Docs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* API Key Generator Card */}
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
              <Key size={20} color="#2563EB" />
              <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>
                Enterprise API Authentication Keys
              </h2>
            </div>

            <form onSubmit={handleGenerateKey} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key Name (e.g. Ford In-Dash Sync)"
                style={{
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#0F172A',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                }}
              >
                Issue Key
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {apiKeys.map((k) => (
                <div
                  key={k.id}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0F172A' }}>{k.name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#2563EB', marginTop: '2px' }}>
                      {k.keyMasked}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px' }}>
                      Rate: {k.rateLimitPerMin.toLocaleString()} req/min • {k.requestsTotal.toLocaleString()} requests
                    </div>
                  </div>

                  <span
                    style={{
                      backgroundColor: '#ECFDF5',
                      color: '#15803D',
                      border: '1px solid #A7F3D0',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                    }}
                  >
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Underwriting Integration Specs */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Insurer & Mobility Use Cases
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#475569' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={14} color="#15803D" />
                <span><strong>Dynamic Deductible Underwriting:</strong> Adjust comprehensive rates for overnight street parking in low-CSI zones.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={14} color="#15803D" />
                <span><strong>Autonomous Fleet Depot Staging:</strong> Autonomous robo-taxis route to verified high-lux covered depots during dwell times.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Live Data Feed Inspector */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={20} color="#2563EB" />
              <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>
                Live Geocoded Block Risk Stream
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {(['json', 'curl'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  style={{
                    backgroundColor: selectedFormat === fmt ? '#2563EB' : '#F1F5F9',
                    color: selectedFormat === fmt ? '#FFFFFF' : '#475569',
                    border: `1px solid ${selectedFormat === fmt ? '#2563EB' : '#CBD5E1'}`,
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Code Readout Box (Dark Syntax Box for High Contrast) */}
          <div
            style={{
              backgroundColor: '#0F172A',
              borderRadius: '12px',
              border: '1px solid #334155',
              padding: '16px',
              flex: 1,
              overflowX: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.775rem',
              lineHeight: 1.5,
              color: '#38BDF8',
              maxHeight: '440px',
              overflowY: 'auto',
            }}
          >
            <pre style={{ margin: 0 }}>
              {selectedFormat === 'curl'
                ? curlSnippet
                : JSON.stringify(
                    {
                      status: 'ok',
                      timestamp: new Date().toISOString(),
                      jurisdiction: 'San Francisco, CA',
                      blocksEvaluated: livePayloads.length,
                      data: livePayloads,
                    },
                    null,
                    2
                  )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
