import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SAFE_PARK_TOKENS, getStatusStyle } from '../../theme/tokens';
import { INITIAL_USER_PROFILE, ParkingHistoryItem } from '../../domain/models/UserProfile';
import { AuthService } from '../../domain/services/AuthService';
import {
  User,
  ShieldCheck,
  Car,
  Clock,
  Lock,
  Receipt,
  CheckCircle2,
  Calendar,
  Sparkles,
  Bluetooth,
  CreditCard,
  LogOut,
  Zap,
  ChevronRight,
  ShieldAlert,
  Footprints
} from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const {
    parkedLocation,
    handleLeaveParkedSpot,
    showToast,
    currentUser,
    setCurrentUser,
    setIsStripeCheckoutOpen,
    setCurrentView
  } = useApp();

  const [profile] = useState(INITIAL_USER_PROFILE);
  const [selectedReceipt, setSelectedReceipt] = useState<ParkingHistoryItem | null>(profile.history[0]);
  const [cabinCheckActive, setCabinCheckActive] = useState<boolean>(true);
  const [litPathDefault, setLitPathDefault] = useState<boolean>(true);

  const isPremium = currentUser?.subscriptionTier === 'premium_monthly' || currentUser?.subscriptionTier === 'premium_annual';

  const handleOAuthLogin = async (provider: 'apple' | 'google') => {
    const user = await AuthService.signInWithOAuth(provider);
    setCurrentUser(user);
    showToast(`✅ Authenticated with ${provider === 'apple' ? 'Apple Auth' : 'Google Sign-In'}`);
  };

  const handleSignOut = () => {
    AuthService.signOut();
    setCurrentUser(null);
    showToast('👋 Signed out of SafePark Driver account.');
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '540px',
        margin: '0 auto',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '8px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)',
      }}
    >
      {/* 1. Driver Profile Card (100% Mobile Responsive) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: isPremium ? '#15803D' : '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isPremium ? '0 4px 12px rgba(21, 128, 61, 0.25)' : '0 4px 12px rgba(37, 99, 235, 0.25)',
              flexShrink: 0,
            }}
          >
            {isPremium ? <ShieldCheck size={26} color="#FFFFFF" /> : <User size={26} color="#FFFFFF" />}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                {currentUser?.fullName || profile.driverName}
              </h1>
              <span
                style={{
                  backgroundColor: isPremium ? '#ECFDF5' : '#F1F5F9',
                  color: isPremium ? '#065F46' : '#2563EB',
                  border: `1px solid ${isPremium ? '#A7F3D0' : '#BFDBFE'}`,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.675rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                {isPremium ? 'PREMIUM PRO' : 'FREE TIER'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.email || 'driver@safepark.sf.gov'} • {isPremium ? 'Unlimited Crime Alerts Active' : 'Basic Driver Security'}
            </p>
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleOAuthLogin('apple')}
            style={{
              flex: '1 1 140px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span> Apple Auth</span>
          </button>

          {!isPremium && (
            <button
              onClick={() => setIsStripeCheckoutOpen(true)}
              style={{
                flex: '1 1 180px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 16px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              }}
            >
              <Zap size={14} />
              <span>Upgrade to Premium ($4.99/mo)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Registered Vehicle Details */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
          padding: '18px 20px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Car size={18} color="#2563EB" />
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Vehicle Profile & Bluetooth Sync</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>{profile.vehicleModel}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>License Plate: {profile.licensePlateMasked}</div>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 800, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '6px' }}>
            Paired
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748B' }}>
          <Bluetooth size={14} color="#2563EB" />
          <span>Vehicle Audio: <strong>{profile.bluetoothPairedDevice}</strong></span>
        </div>
      </div>

      {/* 3. Incident-Free Safety Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Zero Break-In Streak
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
            14 Sessions
          </div>
          <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '2px' }}>100% Incident-Free</div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Average Parking CSI
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB', marginTop: '2px' }}>
            {profile.averageParkedCsiScore}/100
          </div>
          <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '2px' }}>Top 5% Driver Safety</div>
        </div>
      </div>

      {/* 4. Driver Safety Preferences (Toggles) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
          padding: '18px 20px',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
          Safety Safeguards & Automations
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Cabin Check Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A' }}>
                Cabin Clear Exit Verification
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748B' }}>
                Prompts on Bluetooth disconnect to confirm zero valuables in view.
              </div>
            </div>
            <input
              type="checkbox"
              checked={cabinCheckActive}
              onChange={(e) => {
                setCabinCheckActive(e.target.checked);
                showToast(e.target.checked ? '✓ Cabin clear prompts enabled.' : '⚠️ Cabin clear prompts disabled.');
              }}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#2563EB' }}
            />
          </div>

          <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

          {/* Lit Path Default Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A' }}>
                Illuminated Safe Walk Default
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748B' }}>
                Automatically prioritizes municipal smart-lit sidewalk corridors.
              </div>
            </div>
            <input
              type="checkbox"
              checked={litPathDefault}
              onChange={(e) => {
                setLitPathDefault(e.target.checked);
                showToast(e.target.checked ? '✓ Illuminated routing enabled.' : 'Direct routing selected.');
              }}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#2563EB' }}
            />
          </div>
        </div>
      </div>

      {/* 5. Recent Parking History & Safety Receipts */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
              Recent Parking Sessions & Receipts
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Historical audit log of rates and parking safety scores.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {profile.history.map((item) => {
            const status = getStatusStyle(item.csiScoreAtParking);
            return (
              <div
                key={item.sessionId}
                onClick={() => setSelectedReceipt(item)}
                style={{
                  backgroundColor: selectedReceipt?.sessionId === item.sessionId ? '#EFF6FF' : '#F8FAFC',
                  border: `1px solid ${selectedReceipt?.sessionId === item.sessionId ? '#2563EB' : '#E2E8F0'}`,
                  borderRadius: '14px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span
                      style={{
                        backgroundColor: status.bg,
                        color: status.text,
                        border: `1px solid ${status.border}`,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '0.675rem',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      CSI {item.csiScoreAtParking}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.locationName}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#64748B' }}>
                    {new Date(item.parkedAtIso).toLocaleDateString()} • {item.durationMinutes} mins
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                    ${item.totalPaid.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#15803D', fontWeight: 700 }}>Apple Pay ✓</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
