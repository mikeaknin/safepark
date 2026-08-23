import React from 'react';
import { useApp, ActiveAppView } from '../context/AppContext';
import {
  Compass,
  Car,
  ShieldCheck,
  User,
} from 'lucide-react';

export const TabBarNavigation: React.FC = () => {
  const { currentView, setCurrentView, activeParkedSession } = useApp();

  const tabs: Array<{
    id: ActiveAppView;
    testId: string;
    label: string;
    icon: React.ReactNode;
    hasBadge?: boolean;
    badgeText?: string;
  }> = [
    { id: 'driver', testId: 'tab-driver', label: 'Explore', icon: <Compass size={21} /> },
    {
      id: 'my_car',
      testId: 'tab-my_car',
      label: 'My Car',
      icon: <Car size={21} />,
      hasBadge: !!activeParkedSession,
    },
    { id: 'safe_garages', testId: 'tab-safe_garages', label: 'Safe Garages', icon: <ShieldCheck size={21} /> },
    { id: 'profile', testId: 'tab-profile', label: 'Profile', icon: <User size={21} /> },
  ];

  const isTabActive = (tabId: ActiveAppView) => {
    if (tabId === 'driver') return currentView === 'driver';
    if (tabId === 'my_car') return currentView === 'my_car';
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
        paddingTop: '6px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        paddingLeft: '12px',
        paddingRight: '12px',
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
              gap: '2px',
              backgroundColor: 'transparent',
              border: 'none',
              color: active ? '#2563EB' : '#64748B',
              cursor: 'pointer',
              flex: 1,
              minWidth: 0,
              minHeight: '44px',
              padding: '2px 4px',
              borderRadius: '12px',
              transition: 'all 0.15s ease',
              position: 'relative',
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
                position: 'relative',
              }}
            >
              {tab.icon}
              {tab.hasBadge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-4px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#10B981',
                    borderRadius: '50%',
                    border: '1.5px solid #FFFFFF',
                    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)',
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: active ? 700 : 600,
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
