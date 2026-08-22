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
  const [selectedCity, setSelectedCity] = useState<string>('san_francisco');
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

  const handleRejectHazard = (id: string) => {
    setHazards((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              status: 'rejected_bias',
              rejectionReason: 'Subjective terms or non-physical observation violation',
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
      setSyncFeedback('✅ Nightly municipal ETL sync completed: 270 incidents updated across 6 markets.');
    }, 1200);
  };

  const filteredHazards = hazards.filter((h) => {
    if (moderationFilter === 'all') return true;
    return h.status === moderationFilter;
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '16px 0', color: '#FFFFFF' }}>
      {/* Header Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                border: '1px solid #EF4444',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
              }}
            >
              RESTRICTED INTERNAL ACCESS
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>SOC-2 Type II Certified</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', marginTop: '6px' }}>
            SafePark Operations & Governance Console
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>
            Real-time telemetry, municipal data ETL health, community hazard moderation & Stripe revenue monitoring.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleTriggerEtlSync}
            disabled={isSyncing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isSyncing ? 'default' : 'pointer',
              boxShadow: SAFE_PARK_TOKENS.shadows.glowBlue,
            }}
          >
            <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Ingesting Municipal Portals...' : 'Trigger Multi-City ETL Sync'}</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid #22C55E',
            color: '#FFFFFF',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} color="#22C55E" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Monthly Recurring Revenue</span>
            <DollarSign size={16} color="#22C55E" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', margin: '6px 0' }}>$42,650</div>
          <div style={{ fontSize: '0.75rem', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} /> +18.4% vs last month
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Active Premium Drivers</span>
            <Users size={16} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', margin: '6px 0' }}>3,842</div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>$4.99/mo subscription tier</div>
        </div>

        <div
          style={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>B2B Certified Garages</span>
            <CheckCircle2 size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', margin: '6px 0' }}>128</div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Platinum & Gold SaaS tiers</div>
        </div>

        <div
          style={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>API & DB Latency</span>
            <Activity size={16} color="#22C55E" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22C55E', margin: '6px 0' }}>14 ms</div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>99.99% SLA uptime (6 markets)</div>
        </div>
      </div>

      {/* Grid: Municipal Ingestion Grid & Hazard Moderation Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Left Column: Multi-Market Ingestion Health */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
            border: '1px solid #334155',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} color="#38BDF8" />
              <h2 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>Municipal ETL Data Feeds</h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#22C55E', fontWeight: 700 }}>6 Markets Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.values(MUNICIPAL_CITIES).map((city) => (
              <div
                key={city.cityId}
                onClick={() => setSelectedCity(city.cityId)}
                style={{
                  backgroundColor: selectedCity === city.cityId ? '#0F172A' : '#1E293B',
                  border: selectedCity === city.cityId ? '1px solid #38BDF8' : '1px solid #334155',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="#38BDF8" />
                    <span>{city.cityName}, {city.state}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                    {city.portalName}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#22C55E' }}>
                    CSI {city.baselineCsiScore}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                    Synced 12m ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Physical Hazard Moderation Queue */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
            border: '1px solid #334155',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="#F59E0B" />
              <h2 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>Hazard Moderation Queue</h2>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#0F172A', padding: '3px', borderRadius: '6px' }}>
              {(['all', 'pending', 'verified_active', 'resolved'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setModerationFilter(filter)}
                  style={{
                    backgroundColor: moderationFilter === filter ? '#334155' : 'transparent',
                    color: moderationFilter === filter ? '#FFFFFF' : '#94A3B8',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {filter.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredHazards.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                No hazard reports matching filter.
              </div>
            ) : (
              filteredHazards.map((hazard) => (
                <div
                  key={hazard.id}
                  style={{
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {hazard.locationName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{hazard.city} • {hazard.reportedAt}</div>
                    </div>

                    <span
                      style={{
                        backgroundColor:
                          hazard.status === 'verified_active'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : hazard.status === 'resolved'
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                        color:
                          hazard.status === 'verified_active'
                            ? '#EF4444'
                            : hazard.status === 'resolved'
                            ? '#22C55E'
                            : '#F59E0B',
                        border: `1px solid ${
                          hazard.status === 'verified_active'
                            ? '#EF4444'
                            : hazard.status === 'resolved'
                            ? '#22C55E'
                            : '#F59E0B'
                        }`,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {hazard.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: '8px 0' }}>
                    "{hazard.notes}"
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>
                      CSI Impact: {hazard.csiPenalty} pts
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {hazard.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveHazard(hazard.id)}
                            style={{
                              backgroundColor: '#22C55E',
                              color: '#0F172A',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectHazard(hazard.id)}
                            style={{
                              backgroundColor: '#334155',
                              color: '#EF4444',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <X size={12} /> Reject Bias
                          </button>
                        </>
                      )}

                      {hazard.status === 'verified_active' && (
                        <button
                          onClick={() => handleResolveHazard(hazard.id)}
                          style={{
                            backgroundColor: '#334155',
                            color: '#22C55E',
                            border: '1px solid #22C55E',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <CheckCircle2 size={12} /> Mark Fixed / Repaired
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
