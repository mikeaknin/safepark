import { loadStripe, Stripe } from '@stripe/stripe-js';
import { APP_CONFIG } from '../../config/env';
import { AuthService } from './AuthService';

export interface B2CSubscriptionPlan {
  id: 'premium_monthly' | 'premium_annual';
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
}

export interface B2BCertificationPlan {
  tier: 'silver' | 'gold' | 'platinum';
  name: string;
  priceMonthly: number;
  features: string[];
}

export const B2C_PLANS: B2CSubscriptionPlan[] = [
  {
    id: 'premium_monthly',
    name: 'SafePark Premium Monthly',
    price: 4.99,
    interval: 'month',
    description: 'Full driver risk intelligence & illuminated routing',
    features: [
      'Real-time smash & grab background push alerts',
      'Turn-by-turn illuminated Safe Walk Back routing',
      'Unlimited digital CSI safety receipts & session export',
      'Priority routing to certified parking facilities',
    ],
  },
  {
    id: 'premium_annual',
    name: 'SafePark Premium Annual',
    price: 39.99,
    interval: 'year',
    description: 'Save 33% with annual driver risk mitigation protection',
    features: [
      'Everything in Monthly plan',
      'Annual property risk savings certificate',
      'CarPlay in-vehicle priority telemetry feed',
      'Dedicated driver support & theft incident claims assistance',
    ],
  },
];

export const B2B_CERTIFICATION_PLANS: Record<string, B2BCertificationPlan> = {
  silver: {
    tier: 'silver',
    name: 'SafePark Silver Certified™',
    priceMonthly: 199,
    features: ['Verified Silver Badge on map', '+10 CSI baseline score boost', 'Standard operator portal access'],
  },
  gold: {
    tier: 'gold',
    name: 'SafePark Gold Certified™',
    priceMonthly: 349,
    features: ['Verified Gold Badge on map', '+15 CSI baseline boost', 'In-App driver promotion & CarPlay priority'],
  },
  platinum: {
    tier: 'platinum',
    name: 'SafePark Platinum Certified™',
    priceMonthly: 499,
    features: ['Verified Platinum Shield', '+22 CSI boost', 'API telemetry syndication & top map placement'],
  },
};

export class StripePaymentService {
  private static stripePromise: Promise<Stripe | null> | null = null;

  public static getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      this.stripePromise = loadStripe(APP_CONFIG.stripe.publishableKey);
    }
    return this.stripePromise;
  }

  /**
   * Process simulated / live B2C Driver checkout
   */
  public static async processB2CCheckout(planId: 'premium_monthly' | 'premium_annual'): Promise<{ success: boolean; message: string }> {
    // In production, this calls the backend Stripe Checkout Session endpoint
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update user auth profile with new tier
    await AuthService.upgradeSubscription(planId);

    return {
      success: true,
      message: `Successfully enrolled in ${planId === 'premium_monthly' ? 'Monthly' : 'Annual'} SafePark Premium!`,
    };
  }

  /**
   * Process B2B Operator Garage Certification SaaS Subscription
   */
  public static async processB2BOperatorCheckout(
    facilityId: string,
    tier: 'silver' | 'gold' | 'platinum'
  ): Promise<{ success: boolean; subscriptionId: string }> {
    await new Promise(resolve => setTimeout(resolve, 900));

    return {
      success: true,
      subscriptionId: `sub_stripe_${tier}_${Date.now()}`,
    };
  }
}
