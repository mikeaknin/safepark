import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveParkedSpotCard } from '../components/ActiveParkedSpotCard';
import { Car, Compass, ShieldCheck, Clock, MapPin, Sparkles, Navigation, Lock } from 'lucide-react';

export const MyCarView: React.FC = () => {
  const { activeParkedSession, setCurrentView, guideMeToMyCar } = useApp();

  const handleGuideMe = () => {
    guideMeToMyCar();
    setCurrentView('driver');
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '8px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)',
      }}
    >
      {/* Page Header Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span
            style={{
              backgroundColor: activeParkedSession ? '#ECFDF5' : '#EFF6FF',
              color: activeParkedSession ? '#15803D' : '#2563EB',
              border: `1px solid ${activeParkedSession ? '#A7F3D0' : '#BFDBFE'}`,
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Car size={12} />
            <span>{activeParkedSession ? 'Active Tracking' : 'Vehicle Radar'}</span>
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            {activeParkedSession ? 'Live GPS Location Armed' : 'Find My Car & Parking Timers'}
          </span>
        </div>

        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
          My Parked Vehicle
        </h1>
        <p style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '4px', lineHeight: 1.4 }}>
          Live location, street sweeping alerts, and illuminated return walk.
        </p>
      </div>

      {activeParkedSession ? (
        /* Active Parked Vehicle Layout */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <ActiveParkedSpotCard session={activeParkedSession} />

          {/* Continuous Surveillance & Exit Safety Banner */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={16} color="#15803D" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>
                Continuous Vehicle Protection
              </span>
            </div>
            <p style={{ fontSize: '0.775rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>
              Your spot at <strong style={{ color: '#0F172A' }}>{activeParkedSession.spotName}</strong> is verified with a Composite Safety Index of <strong style={{ color: '#15803D' }}>CSI {activeParkedSession.csiScore}/100</strong>. Automatic Bluetooth disconnect detection and parking sweep alarms are active.
            </p>
          </div>
        </div>
      ) : (
        /* Empty State: No Vehicle Tracked */
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
            padding: '32px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              position: 'relative',
            }}
          >
            <Car size={32} />
            <div
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                border: '2px solid #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '10px',
              }}
            >
              <Sparkles size={12} />
            </div>
          </div>

          <div style={{ maxWidth: '320px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              No Vehicle Currently Tracked
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>
              Tap <strong style={{ color: '#2563EB' }}>"I'm Parked Here"</strong> on any street curb, 2-hour zone, or garage in Explore to start tracking your vehicle, set timers, and get illuminated walking directions back.
            </p>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <button
              onClick={() => setCurrentView('driver')}
              style={{
                width: '100%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '0.875rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                minHeight: '48px',
              }}
            >
              <Compass size={18} />
              <span>Find Safe Parking on Map</span>
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '0.725rem',
                color: '#94A3B8',
                fontWeight: 600,
                marginTop: '12px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> 2-Hr Reminders
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} /> GPS Radar
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} /> Safe Walk
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
