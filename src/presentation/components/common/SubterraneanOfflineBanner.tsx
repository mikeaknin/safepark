import React, { useEffect, useState } from 'react';
import { OfflineCacheService, ConnectivityStatus } from '../../../domain/services/OfflineCacheService';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import { WifiOff, ShieldCheck, HardDrive, RefreshCw } from 'lucide-react';

export const SubterraneanOfflineBanner: React.FC = () => {
  const [status, setStatus] = useState<ConnectivityStatus>(OfflineCacheService.getCurrentStatus());
  const [lastSync, setLastSync] = useState<string>(OfflineCacheService.getLastSyncTime());

  useEffect(() => {
    OfflineCacheService.initialize();
    const unsub = OfflineCacheService.subscribe((newStatus) => {
      setStatus(newStatus);
      setLastSync(OfflineCacheService.getLastSyncTime());
    });
    return () => unsub();
  }, []);

  if (status === 'online') {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: '#0F172A',
        border: '1px solid #F59E0B',
        borderRadius: SAFE_PARK_TOKENS.borderRadius.md,
        padding: '10px 14px',
        marginBottom: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: SAFE_PARK_TOKENS.shadows.glowAmber,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F59E0B',
          }}
        >
          <WifiOff size={16} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F59E0B' }}>
            Subterranean Concrete Garage Mode (Offline Resiliency Active)
          </div>
          <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
            Serving cached block safety indices, active session telemetry, and offline return walking paths.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <HardDrive size={12} /> Local Cache: {lastSync === 'Just now' ? 'Active' : new Date(lastSync).toLocaleTimeString()}
        </span>
        <button
          onClick={() => OfflineCacheService.toggleSubterraneanSimulation(false)}
          style={{
            backgroundColor: '#334155',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Restore Online
        </button>
      </div>
    </div>
  );
};
