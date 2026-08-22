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
  Star,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  Bluetooth,
  CreditCard,
  LogOut,
  Zap
} from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const {
    parkedLocation,
    handleLeaveParkedSpot,
    showToast,
    currentUser,
    setCurrentUser,
    setIsStripeCheckoutOpen
  } = useApp();

  const [profile] = useState(INITIAL_USER_PROFILE);
  const [selectedReceipt, setSelectedReceipt] = useState<ParkingHistoryItem | null>(profile.history[0]);

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
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '16px 0' }}>
      {/* Profile Summary Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
          padding: '24px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: isPremium ? '#15803D' : '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isPremium ? '0 4px 14px rgba(21, 128, 61, 0.3)' : '0 4px 14px rgba(37, 99, 235, 0.3)',
            }}
          >
            {isPremium ? <ShieldCheck size={28} color="#FFFFFF" /> : <User size={28} color="#FFFFFF" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', color: '#0F172A', fontWeight: 800 }}>
                {currentUser?.fullName || profile.driverName}
              </h1>
              <span
                style={{
                  backgroundColor: isPremium ? '#ECFDF5' : '#F1F5F9',
                  color: isPremium ? '#065F46' : '#2563EB',
                  border: `1px solid ${isPremium ? '#A7F3D0' : '#BFDBFE'}`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                {isPremium ? 'PREMIUM PRO' : 'FREE TIER'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
              {currentUser?.email || 'driver@safepark.sf.gov'} • {isPremium ? 'Unlimited Crime Alerts Active' : 'Basic Driver Security'}
            </p>
          </div>
        </div>

        {/* OAuth Authentication State & Upgrade */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleOAuthLogin('apple')}
            style={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span> Apple Auth</span>
          </button>

          {!isPremium && (
            <button
              onClick={() => setIsStripeCheckoutOpen(true)}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              }}
            >
              <Zap size={14} />
              <span>Upgrade to Premium ($4.99/mo)</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Zero Break-In Streak</div>
          <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>
            14 Sessions
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>100% Incident-Free</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Avg Parking CSI</div>
          <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
            {profile.averageParkedCsiScore}/100
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>High Safety Standard</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Safe Sessions</div>
          <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
            {profile.totalSafelyParkedSessions}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Illuminated Walk Return Active</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Vehicle Profile</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
            {profile.vehicleModel}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
            {profile.licensePlateMasked}
          </div>
        </div>
      </div>

      {/* Active Vehicle Session Card (if parked) */}
      {parkedLocation && (
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '2px solid #15803D',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 4px 16px rgba(21, 128, 61, 0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065F46', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <CheckCircle2 size={16} /> ACTIVE PARKING SESSION IN PROGRESS
              </div>
              <h2 style={{ fontSize: '1.25rem', color: '#0F172A', fontWeight: 800, marginTop: '2px' }}>
                {parkedLocation.name}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569' }}>{parkedLocation.address}</p>
            </div>

            <button
              onClick={handleLeaveParkedSpot}
              style={{
                backgroundColor: '#15803D',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)',
              }}
            >
              End Parking Session & Return
            </button>
          </div>
        </div>
      )}

      {/* Past Parking Receipts & CSI Record */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>
              Recent Parking History & Safety Receipts
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Full audit trail of parking sessions, rates, and safety scores.
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
                  borderRadius: '12px',
                  padding: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        backgroundColor: status.bg,
                        color: status.text,
                        border: `1px solid ${status.border}`,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                      }}
                    >
                      CSI {item.csiScoreAtParking}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>{item.locationName}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    {item.address} • {new Date(item.parkedAtIso).toLocaleDateString()} ({item.durationMinutes} mins)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="tabular-nums" style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                    ${item.totalPaid.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 700 }}>Paid via Apple Pay</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
