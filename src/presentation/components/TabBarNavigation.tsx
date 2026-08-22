import React from 'react';
import { useApp, ActiveAppView } from '../context/AppContext';
import { SAFE_PARK_TOKENS } from '../../theme/tokens';
import {
  Compass,
  Building2,
  Car,
  Database,
  User,
  ShieldCheck
} from 'lucide-react';

export const TabBarNavigation: React.FC = () => {
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
      role="navigation"
      aria-label="iOS Tab Bar Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(51, 65, 85, 0.7)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: '8px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        paddingLeft: '16px',
        paddingRight: '16px',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => setCurrentView(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              backgroundColor: 'transparent',
              border: 'none',
              color: isActive ? '#38BDF8' : '#94A3B8',
              cursor: 'pointer',
              minWidth: '44px',
              minHeight: '44px',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                transform: isActive ? 'scale(1.12)' : 'scale(1)',
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
                color: isActive ? '#FFFFFF' : '#94A3B8',
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

export { TabBarNavigation as BottomNavBar };
