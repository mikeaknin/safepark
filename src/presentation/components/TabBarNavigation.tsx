import React from 'react';
import { useApp, ActiveAppView } from '../context/AppContext';
import {
  Compass,
  ShieldCheck,
  User,
} from 'lucide-react';

export const TabBarNavigation: React.FC = () => {
  const { currentView, setCurrentView } = useApp();

  const tabs: Array<{ id: ActiveAppView; testId: string; label: string; icon: React.ReactNode }> = [
    { id: 'driver', testId: 'tab-driver', label: 'Explore', icon: <Compass size={22} /> },
    { id: 'safe_garages', testId: 'tab-safe_garages', label: 'Safe Garages', icon: <ShieldCheck size={22} /> },
    { id: 'profile', testId: 'tab-profile', label: 'Profile', icon: <User size={22} /> },
  ];

  const isTabActive = (tabId: ActiveAppView) => {
    if (tabId === 'driver') return currentView === 'driver';
    if (tabId === 'safe_garages') return currentView === 'safe_garages' || currentView === 'b2b_portal';
    if (tabId === 'profile') return currentView === 'profile' || currentView === 'user_profile';
    return currentView === tabId;
  };

  return (
    <nav
      role="navigation"
      aria-label="Consumer Tab Bar Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: '8px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        paddingLeft: '16px',
        paddingRight: '16px',
        boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.08)',
        height: '64px',
      }}
    >
      {tabs.map((tab) => {
        const active = isTabActive(tab.id);
        return (
          <button
            key={tab.id}
            data-testid={tab.testId}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
            onClick={() => setCurrentView(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              backgroundColor: 'transparent',
              border: 'none',
              color: active ? '#2563EB' : '#64748B',
              cursor: 'pointer',
              flex: 1,
              minWidth: 0,
              minHeight: '44px',
              padding: '2px 8px',
              borderRadius: '12px',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                transform: active ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: active ? '#2563EB' : '#64748B',
              }}
            >
              {tab.icon}
            </div>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: active ? 700 : 500,
                letterSpacing: '-0.01em',
                color: active ? '#2563EB' : '#64748B',
                whiteSpace: 'nowrap',
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
