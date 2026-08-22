import React, { useState } from 'react';
import { SAFE_PARK_TOKENS } from '../../theme/tokens';
import { MUNICIPAL_CITIES } from '../../data/etl/MultiCityCrimeIngestion';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Server,
  DollarSign,
  Users,
  TrendingUp,
  RefreshCw,
  Clock,
  HardDrive,
  Eye,
  Check,
  X,
  ExternalLink,
  MapPin
} from 'lucide-react';

interface HazardModerationItem {
  id: string;
  locationName: string;
  city: string;
  hazardType: string;
  notes: string;
  reportedAt: string;
  status: 'pending' | 'verified_active' | 'resolved' | 'rejected_bias';
  rejectionReason?: string;
  hasPhoto: boolean;
  csiPenalty: number;
}

export const AdminOpsDashboard: React.FC = () => {
  const [moderationFilter, setModerationFilter] = useState<'all' | 'pending' | 'verified_active' | 'resolved'>('all');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const [hazards, setHazards] = useState<HazardModerationItem[]>([
    {
      id: 'hz-mod-101',
      locationName: 'Alleyway Curbside Meter Zone (5th & Mission)',
      city: 'San Francisco, CA',
      hazardType: 'broken_glass_pavement',
      notes: 'Curbside stall 4 has a 2-foot pile of broken tempered side window glass on the asphalt.',
      reportedAt: '12 minutes ago',
      status: 'pending',
      hasPhoto: true,
      csiPenalty: -28,
    },
    {
      id: 'hz-mod-102',
      locationName: 'SOMA 5th St Gated Deck',
      city: 'San Francisco, CA',
      hazardType: 'failed_street_lamp',
      notes: 'Municipal smart fixture #SOMA-44 extinguished. Northwest entrance dark.',
      reportedAt: '1 hour ago',
      status: 'verified_active',
      hasPhoto: true,
      csiPenalty: -16,
    },
    {
      id: 'hz-mod-103',
      locationName: 'Grand Central Multi-Level Deck',
      city: 'New York City, NY',
      hazardType: 'broken_security_gate',
      notes: 'Access gate barrier arm stuck in raised position bypassing RFID credentials.',
      reportedAt: '3 hours ago',
      status: 'verified_active',
      hasPhoto: true,
      csiPenalty: -25,
    },
    {
      id: 'hz-mod-104',
      locationName: 'Michigan Ave Surface Lot',
      city: 'Chicago, IL',
      hazardType: 'pavement_debris_puncture_risk',
      notes: 'Construction rebar shards along south driveway.',
      reportedAt: 'Yesterday',
      status: 'resolved',
      hasPhoto: true,
      csiPenalty: 0,
    },
  ]);

  const handleApproveHazard = (id: string) => {
    setHazards((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status: 'verified_active' } : h))
    );
  };

  const handleResolveHazard = (id: string) => {
    setHazards((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status: 'resolved', csiPenalty: 0 } : h))
    );
  };

  const handleRejectBiasHazard = (id: string) => {
    setHazards((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              status: 'rejected_bias',
              rejectionReason: 'Subjective non-verifiable narrative violates SafePark Anti-Bias Policy.',
              csiPenalty: 0,
            }
          : h
      )
    );
  };

  const handleTriggerEtlSync = () => {
    setIsSyncing(true);
    setSyncFeedback(null);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncFeedback(
        'Nightly municipal ETL sync completed: 270 incidents updated across 6 markets.'
      );
    }, 400);
  };

  const filteredHazards = hazards.filter((h) => {
    if (moderationFilter === 'all') return true;
    return h.status === moderationFilter;
  });

  const cityList = Object.values(MUNICIPAL_CITIES);

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '16px 0' }}>
      {/* Dashboard Top Header */}
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
                backgroundColor: '#ECFDF5',
                color: '#15803D',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                border: '1px solid #A7F3D0',
              }}
            >
              Enterprise Admin Ops
            </span>
            <span style={{ color: '#64748B', fontSize: '0.8rem' }}>SafePark Core Infrastructure Telemetry</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', color: '#0F172A', fontWeight: 800 }}>
            SafePark Operations & Governance Console
          </h1>
        </div>

        {/* Global Manual ETL Ingestion Trigger Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleTriggerEtlSync}
            disabled={isSyncing}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            }}
          >
            <RefreshCw size={16} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isSyncing ? 'Ingesting Feeds...' : 'Trigger Multi-City ETL Sync'}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Telemetry & Revenue KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {/* Monthly Recurring Revenue */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Monthly Recurring Revenue</span>
            <DollarSign size={18} color="#15803D" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>$42,650</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#15803D', marginTop: '4px', fontWeight: 700 }}>
            <TrendingUp size={14} />
            <span>+24.8% from prior month</span>
          </div>
        </div>

        {/* Active Driver Subscriptions */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Active Driver Pro Users</span>
            <Users size={18} color="#2563EB" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>3,842</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>82% Annual Plan Conversion</div>
        </div>

        {/* Latency */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>API Latency</span>
            <Activity size={18} color="#15803D" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803D' }}>14 ms</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Global Edge CDN Average</div>
        </div>

        {/* System Health */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>ETL Health</span>
            <Server size={18} color="#B45309" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>99.98%</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Multi-City Municipal Ingestion Active</div>
        </div>
      </div>

      {/* Sync Completion Notification Alert */}
      {syncFeedback && (
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '1.5px solid #A7F3D0',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#065F46',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={18} color="#15803D" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Municipal ETL Ingestion Overview Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>
              Multi-City Municipal Ingestion Pipeline
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Standardized ETL schema normalizing vehicle break-in and larceny data across city portals.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                <th style={{ padding: '10px 14px', fontWeight: 800 }}>City & Jurisdiction</th>
                <th style={{ padding: '10px 14px', fontWeight: 800 }}>Data Endpoint (Socrata API)</th>
                <th style={{ padding: '10px 14px', fontWeight: 800 }}>Portal Name</th>
                <th style={{ padding: '10px 14px', fontWeight: 800 }}>Sync Status</th>
                <th style={{ padding: '10px 14px', fontWeight: 800 }}>Daily Ingestion Rate</th>
              </tr>
            </thead>
            <tbody>
              {cityList.map((city) => (
                <tr key={city.cityId} style={{ borderBottom: '1px solid #F1F5F9', color: '#334155' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>{city.cityName}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#2563EB' }}>
                    {city.endpointUrl.split('/resource/')[1] || city.endpointUrl}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {city.portalName}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#15803D', fontWeight: 700 }}>
                      <CheckCircle2 size={13} /> Active (Hourly Cron)
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0F172A' }}>
                    ~{city.cityId === 'san_francisco' ? '420' : city.cityId === 'nyc' ? '740' : '260'} reports/day
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Community Hazard Moderation Queue */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>
              Hazard Moderation Queue
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Review driver hazard submissions, verify photographic proof, and enforce Anti-Bias policies.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {(['all', 'pending', 'verified_active', 'resolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setModerationFilter(tab)}
                style={{
                  backgroundColor: moderationFilter === tab ? '#2563EB' : '#F1F5F9',
                  color: moderationFilter === tab ? '#FFFFFF' : '#475569',
                  border: `1px solid ${moderationFilter === tab ? '#2563EB' : '#CBD5E1'}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Hazard Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredHazards.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      backgroundColor:
                        item.status === 'pending'
                          ? '#FFFBEB'
                          : item.status === 'verified_active'
                          ? '#ECFDF5'
                          : item.status === 'resolved'
                          ? '#F1F5F9'
                          : '#FFF1F2',
                      color:
                        item.status === 'pending'
                          ? '#B45309'
                          : item.status === 'verified_active'
                          ? '#065F46'
                          : item.status === 'resolved'
                          ? '#475569'
                          : '#9F1239',
                      border: `1px solid ${
                        item.status === 'pending'
                          ? '#FDE68A'
                          : item.status === 'verified_active'
                          ? '#A7F3D0'
                          : item.status === 'resolved'
                          ? '#E2E8F0'
                          : '#FECDD3'
                      }`,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.status === 'verified_active' ? 'VERIFIED ACTIVE' : item.status.replace('_', ' ')}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
                    {item.locationName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>({item.city})</span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                  <strong>Hazard:</strong> {item.hazardType.replace(/_/g, ' ')} — "{item.notes}"
                </div>

                {item.rejectionReason && (
                  <div style={{ fontSize: '0.75rem', color: '#BE123C', marginTop: '4px', fontWeight: 600 }}>
                    ⚠️ {item.rejectionReason}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.75rem', color: '#64748B' }}>
                  <span>Reported {item.reportedAt}</span>
                  <span>•</span>
                  <span>Photo Evidence: {item.hasPhoto ? 'Attached ✓' : 'None'}</span>
                  {item.csiPenalty !== 0 && (
                    <>
                      <span>•</span>
                      <span style={{ color: '#BE123C', fontWeight: 700 }}>Penalty: {item.csiPenalty} CSI Pts</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {item.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApproveHazard(item.id)}
                      style={{
                        backgroundColor: '#15803D',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '0.775rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Check size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleRejectBiasHazard(item.id)}
                      style={{
                        backgroundColor: '#FFF1F2',
                        color: '#BE123C',
                        border: '1px solid #FECDD3',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '0.775rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Reject (Anti-Bias)
                    </button>
                  </>
                )}

                {item.status === 'verified_active' && (
                  <button
                    onClick={() => handleResolveHazard(item.id)}
                    style={{
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>Mark Repaired / Resolved</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
