import React from 'react';
import { useApp, ActiveAppView } from '../../context/AppContext';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import {
  Compass,
  Building2,
  Car,
  Database,
  User,
  ShieldCheck
} from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const { currentView, setCurrentView } = useApp();

  const tabs: Array<{ id: ActiveAppView; label: string; icon: React.ReactNode }> = [
    { id: 'driver', label: 'Explore', icon: <Compass size={20} /> },
    { id: 'b2b_portal', label: 'Certified', icon: <Building2 size={20} /> },
    { id: 'carplay', label: 'CarPlay', icon: <Car size={20} /> },
    { id: 'enterprise_api', label: 'API Data', icon: <Database size={20} /> },
    { id: 'user_profile', label: 'Profile', icon: <User size={20} /> },
    { id: 'admin_ops', label: 'Admin', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #334155',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: '8px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        paddingLeft: '8px',
        paddingRight: '8px',
      }}
    >
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            aria-label={tab.label}
            onClick={() => setCurrentView(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              backgroundColor: 'transparent',
              border: 'none',
              color: isActive ? '#38BDF8' : '#94A3B8',
              cursor: 'pointer',
              minWidth: '52px',
              minHeight: '44px',
              padding: '4px 6px',
              borderRadius: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {tab.icon}
            </div>
            <span
              style={{
                fontSize: '0.675rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.01em',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
