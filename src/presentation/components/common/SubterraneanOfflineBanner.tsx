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
        backgroundColor: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderRadius: '12px',
        padding: '10px 14px',
        margin: '10px 14px 0 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: '0 2px 8px rgba(180, 83, 9, 0.1)',
        zIndex: 45,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            backgroundColor: '#FEF3C7',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#B45309',
          }}
        >
          <WifiOff size={16} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400E' }}>
            Subterranean Concrete Garage Mode (Offline Resiliency Active)
          </div>
          <div style={{ fontSize: '0.75rem', color: '#78350F' }}>
            Serving cached local CSI safety metrics, parking rules, and offline return routes.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.725rem', color: '#92400E' }}>
        <HardDrive size={14} color="#B45309" />
        <span>IndexedDB Cache Synced: {new Date(lastSync).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
