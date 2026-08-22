import React from 'react';
import { useApp, ActiveAppView } from '../../context/AppContext';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import {
  Navigation,
  Car,
  Building2,
  Database,
  User,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export const ViewSwitcher: React.FC = () => {
  const { currentView, setCurrentView, setIsOnboardingOpen } = useApp();

  const views: Array<{ id: ActiveAppView; label: string; icon: React.ReactNode }> = [
    { id: 'driver', label: 'Driver Navigation', icon: <Navigation size={15} /> },
    { id: 'carplay', label: 'In-Dash CarPlay', icon: <Car size={15} /> },
    { id: 'b2b_portal', label: 'B2B Garage Certification', icon: <Building2 size={15} /> },
    { id: 'enterprise_api', label: 'Enterprise API Feed', icon: <Database size={15} /> },
    { id: 'user_profile', label: 'Driver Profile & Receipts', icon: <User size={15} /> },
    { id: 'admin_ops', label: 'Admin Ops & Feeds', icon: <ShieldCheck size={15} /> },
  ];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        borderBottom: '1px solid #334155',
        padding: '6px 20px',
        overflowX: 'auto',
      }}
    >
      <div style={{ display: 'flex', gap: '6px' }}>
        {views.map((v) => {
          const isActive = currentView === v.id;
          return (
            <button
              key={v.id}
              data-testid={`tab-${v.id}`}
              aria-label={v.label}
              onClick={() => setCurrentView(v.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: isActive ? SAFE_PARK_TOKENS.colors.brand.primary : 'transparent',
                color: isActive ? '#FFFFFF' : '#94A3B8',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {v.icon}
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setIsOnboardingOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#1E293B',
          color: '#38BDF8',
          border: '1px solid #334155',
          borderRadius: '6px',
          padding: '5px 10px',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <HelpCircle size={14} />
        <span>Legal Terms & CSI Intro</span>
      </button>
    </div>
  );
};
