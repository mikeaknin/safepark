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
    showToast(`✅ Authenticated with ${provider === 'apple' ? 'Sign in with Apple' : 'Google Sign-In'}`);
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
          backgroundColor: '#1E293B',
          borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
          border: '1px solid #334155',
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
              backgroundColor: isPremium ? '#22C55E' : SAFE_PARK_TOKENS.colors.brand.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isPremium ? SAFE_PARK_TOKENS.shadows.glowGreen : SAFE_PARK_TOKENS.shadows.glowBlue,
            }}
          >
            {isPremium ? <ShieldCheck size={28} color="#0F172A" /> : <User size={28} color="#FFFFFF" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>
                {currentUser?.fullName || profile.driverName}
              </h1>
              <span
                style={{
                  backgroundColor: isPremium ? '#22C55E' : '#334155',
                  color: isPremium ? '#0F172A' : '#38BDF8',
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
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Car size={14} color="#38BDF8" /> {profile.vehicleModel}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bluetooth size={14} color="#22C55E" /> {profile.bluetoothPairedDevice}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Upgrade / Management Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isPremium ? (
            <button
              onClick={() => setIsStripeCheckoutOpen(true)}
              style={{
                backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: SAFE_PARK_TOKENS.shadows.glowBlue,
              }}
            >
              <Zap size={15} /> Upgrade to Premium ($4.99/mo)
            </button>
          ) : (
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22C55E', color: '#22C55E', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
              ✓ Unlimited Crime Alerts Active
            </div>
          )}

          <button
            onClick={() => handleOAuthLogin('apple')}
            style={{
              backgroundColor: '#0F172A',
              border: '1px solid #475569',
              color: '#FFFFFF',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Apple Auth
          </button>
        </div>
      </div>

      {/* ACTIVE SESSION STATUS (if vehicle is currently parked) */}
      {parkedLocation && (
        <div
          style={{
            backgroundColor: '#0F172A',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
            border: '2px solid #22C55E',
            padding: '20px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: SAFE_PARK_TOKENS.shadows.glowGreen,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={22} color="#22C55E" />
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#22C55E', fontWeight: 800, textTransform: 'uppercase' }}>
                Active Parked Session • Exit Trigger Armed
              </span>
              <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>{parkedLocation.name}</h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{parkedLocation.address}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="tabular-nums" style={{ fontSize: '1.1rem', color: '#FFFFFF', fontWeight: 700 }}>
              CSI {parkedLocation.csi.totalScore}
            </div>
            <button
              onClick={handleLeaveParkedSpot}
              style={{
                backgroundColor: '#334155',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              End Session & Depart
            </button>
          </div>
        </div>
      )}

      {/* History and Safety Receipts 2-Column Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px' }}>
        {/* Left: Parking History List */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
            border: '1px solid #334155',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Calendar size={18} color={SAFE_PARK_TOKENS.colors.brand.primary} />
            <h2 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>Parking History & Saved Spots</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {profile.history.map((item) => {
              const isSelected = selectedReceipt?.sessionId === item.sessionId;
              const status = getStatusStyle(item.csiScoreAtParking);

              return (
                <div
                  key={item.sessionId}
                  onClick={() => setSelectedReceipt(item)}
                  style={{
                    backgroundColor: isSelected ? '#0F172A' : '#1E293B',
                    border: isSelected ? `2px solid ${SAFE_PARK_TOKENS.colors.brand.primary}` : '1px solid #334155',
                    borderRadius: '10px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', color: '#FFFFFF', fontWeight: 600 }}>{item.locationName}</h3>
                      <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{item.address}</p>
                    </div>
                    <span
                      className="tabular-nums"
                      style={{
                        backgroundColor: status.bg,
                        color: status.hex,
                        border: `1px solid ${status.border}`,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      CSI {item.csiScoreAtParking}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#CBD5E1', marginTop: '8px' }}>
                    <span>Duration: {item.durationMinutes} mins</span>
                    <span className="tabular-nums">${item.totalPaid.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed CSI Safety Receipt Card */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
            border: '1px solid #334155',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Receipt size={18} color="#22C55E" />
            <h2 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>CSI Safety Receipt</h2>
          </div>

          {selectedReceipt ? (
            <div
              style={{
                backgroundColor: '#0F172A',
                borderRadius: '12px',
                border: '1px solid #334155',
                padding: '18px',
              }}
            >
              <div style={{ borderBottom: '1px dashed #334155', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#22C55E', fontWeight: 700, textTransform: 'uppercase' }}>
                  Verified SafePark Safety Protection Receipt
                </div>
                <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginTop: '2px' }}>{selectedReceipt.locationName}</h3>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{selectedReceipt.address}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Session ID:</span>
                  <span className="tabular-nums" style={{ color: '#FFFFFF' }}>{selectedReceipt.sessionId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Composite Safety Index (CSI):</span>
                  <span className="tabular-nums" style={{ color: '#22C55E', fontWeight: 700 }}>
                    {selectedReceipt.csiScoreAtParking}/100 (Low Risk)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cabin Valuables Check:</span>
                  <span style={{ color: '#22C55E', fontWeight: 600 }}>✓ Verified Confirmed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Duration:</span>
                  <span className="tabular-nums">{selectedReceipt.durationMinutes} minutes</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Amount Paid:</span>
                  <span className="tabular-nums" style={{ color: '#FFFFFF', fontWeight: 700 }}>${selectedReceipt.totalPaid.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#1E293B', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Risk Mitigation Summary
                </div>
                <div style={{ fontSize: '0.775rem', color: '#FFFFFF' }}>
                  {selectedReceipt.riskAvoidanceSummary}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Select a parking session from the list to view its safety receipt.</p>
          )}
        </div>
      </div>
    </div>
  );
};
