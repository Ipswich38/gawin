import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    credits: 1000,
    maxAgents: 5,
    maxWorkflows: 3,
    features: [
      'Basic AI chat',
      'Visual workflow builder',
      'Public agent marketplace',
      'Community support'
    ]
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    credits: 10000,
    maxAgents: 50,
    maxWorkflows: 25,
    features: [
      'Everything in Free',
      'Advanced AI models',
      'Private agent library',
      'Team collaboration',
      'Priority support',
      'Advanced analytics'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    credits: 50000,
    maxAgents: 500,
    maxWorkflows: 100,
    features: [
      'Everything in Pro',
      'Custom integrations',
      'SSO authentication',
      'Advanced security',
      'Dedicated support',
      'Custom deployment'
    ]
  }
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS;