import React, { useState } from 'react';
import { SAFE_PARK_TOKENS } from '../../../theme/tokens';
import { B2C_PLANS, StripePaymentService } from '../../../domain/services/StripePaymentService';
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
  const { showToast } = useApp();
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
      setIsProcessing(false);
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
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(8px)',
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
          backgroundColor: '#1E293B',
          borderRadius: SAFE_PARK_TOKENS.borderRadius.lg,
          border: '1px solid #475569',
          boxShadow: SAFE_PARK_TOKENS.shadows.sheet,
          maxWidth: '540px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '24px',
          color: '#FFFFFF',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Sparkles size={14} /> SAFEPARK DRIVER PRO
            </div>
            <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginTop: '2px' }}>
              Upgrade to Premium Protection
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#334155',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Plan Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
          {B2C_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                style={{
                  backgroundColor: isSelected ? '#0F172A' : '#1E293B',
                  border: isSelected ? `2px solid ${SAFE_PARK_TOKENS.colors.brand.primary}` : '1px solid #334155',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {plan.id === 'premium_annual' && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '8px',
                      backgroundColor: '#22C55E',
                      color: '#0F172A',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                    }}
                  >
                    SAVE 33%
                  </span>
                )}
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                  <span className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22C55E' }}>
                    ${plan.price}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>/{plan.interval}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plan Features Checklist */}
        <div style={{ backgroundColor: '#0F172A', borderRadius: '8px', padding: '12px', marginBottom: '18px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
            Included Premium Features:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {currentPlanObj.features.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#CBD5E1' }}>
                <CheckCircle2 size={14} color="#22C55E" style={{ flexShrink: 0 }} />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stripe Secured Card Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              required
              style={{
                width: '100%',
                backgroundColor: '#0F172A',
                border: '1px solid #475569',
                borderRadius: '6px',
                padding: '9px 12px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
              Card Number (Stripe Encrypted)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  padding: '9px 12px 9px 36px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                }}
              />
              <CreditCard size={18} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
                Expiry
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
                CVC / CVV
              </label>
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>

          {/* Secure Stripe Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '16px' }}>
            <Lock size={13} color="#22C55E" />
            <span>256-bit TLS Encryption via Stripe Gateway (PCI-DSS Level 1)</span>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            style={{
              width: '100%',
              backgroundColor: SAFE_PARK_TOKENS.colors.brand.primary,
              color: '#FFFFFF',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: isProcessing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: SAFE_PARK_TOKENS.shadows.glowBlue,
            }}
          >
            <Lock size={16} />
            {isProcessing ? 'Authorizing with Stripe...' : `Pay $${currentPlanObj.price} & Activate Premium`}
          </button>
        </form>
      </div>
    </div>
  );
};
