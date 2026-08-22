import React from 'react';
import { useApp, ActiveAppView } from '../context/AppContext';
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
    { id: 'driver', label: 'Explore', icon: <Compass size={19} /> },
    { id: 'b2b_portal', label: 'Certified', icon: <Building2 size={19} /> },
    { id: 'carplay', label: 'CarPlay', icon: <Car size={19} /> },
    { id: 'enterprise_api', label: 'Data', icon: <Database size={19} /> },
    { id: 'user_profile', label: 'Profile', icon: <User size={19} /> },
    { id: 'admin_ops', label: 'Admin', icon: <ShieldCheck size={19} /> },
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
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: '6px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
        paddingLeft: '8px',
        paddingRight: '8px',
        boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.08)',
        height: '60px',
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
              color: isActive ? '#2563EB' : '#64748B',
              cursor: 'pointer',
              flex: 1,
              minWidth: 0,
              minHeight: '44px',
              padding: '2px 4px',
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
                fontSize: '0.65rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.01em',
                color: isActive ? '#2563EB' : '#64748B',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
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
