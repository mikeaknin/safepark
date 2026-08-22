import React, { useState } from 'react';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import { B2C_PLANS, StripePaymentService } from '../../../domain/services/StripePaymentService';
import { AuthService } from '../../../domain/services/AuthService';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlanId?: 'premium_monthly' | 'premium_annual';
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  isOpen,
  onClose,
  targetPlanId = 'premium_monthly',
}) => {
  const { showToast, setCurrentUser } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'premium_monthly' | 'premium_annual'>(targetPlanId);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('882');
  const [cardHolder, setCardHolder] = useState('Alex Rivera');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentPlanObj = B2C_PLANS.find(p => p.id === selectedPlan) || B2C_PLANS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const result = await StripePaymentService.processB2CCheckout(selectedPlan);
      const upgradedUser = await AuthService.upgradeSubscription(selectedPlan);
      setIsProcessing(false);
      setCurrentUser(upgradedUser);
      showToast(`🎉 ${result.message}`);
      onClose();
    } catch (err) {
      setIsProcessing(false);
      showToast('❌ Payment processing failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 3500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      role="dialog"
      aria-label="SafePark Premium Stripe Checkout"
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.2)',
          maxWidth: '540px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '24px',
          color: '#0F172A',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Sparkles size={14} /> SAFEPARK DRIVER PRO
            </div>
            <h2 style={{ fontSize: '1.3rem', color: '#0F172A', fontWeight: 800, marginTop: '2px' }}>
              Upgrade to Premium Protection
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Plan Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {B2C_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as any)}
                style={{
                  backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                  border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {plan.interval === 'year' && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-9px',
                      right: '10px',
                      backgroundColor: '#15803D',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                    }}
                  >
                    SAVE 33%
                  </span>
                )}
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{plan.name}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
                  ${plan.price}
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                    /{plan.interval === 'month' ? 'mo' : 'yr'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stripe Elements Card Input */}
        <form onSubmit={handleSubmit}>
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                <CreditCard size={16} color="#2563EB" />
                <span>Card Information</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#15803D', fontWeight: 700 }}>
                <Lock size={12} />
                <span>Stripe Encrypted (PCI-DSS)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '4px', fontWeight: 600 }}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#0F172A',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '4px', fontWeight: 600 }}>
                  Card Number (Stripe Encrypted)
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#0F172A',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '4px', fontWeight: 600 }}>
                    Expires
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#0F172A',
                      fontSize: '0.85rem',
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '4px', fontWeight: 600 }}>
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#0F172A',
                      fontSize: '0.85rem',
                    }}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            style={{
              width: '100%',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            }}
          >
            {isProcessing ? (
              <span>Processing with Stripe...</span>
            ) : (
              <>
                <span>Pay ${currentPlanObj.price} & Activate Premium</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
