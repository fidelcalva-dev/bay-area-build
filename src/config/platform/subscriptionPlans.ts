// =====================================================
// Marketplace Subscription Plans
// =====================================================

import type { SubscriptionPlan } from './types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    plan_code: 'starter',
    plan_name: 'Starter',
    monthly_price_cents: 29900,
    features: {
      lead_routing: true,
      crm_access: true,
      quote_engine: true,
      branded_docs: false,
      priority_leads: false,
      exclusive_zips: false,
      api_access: false,
    },
    lead_cap: 20,
    priority_weight: 1,
  },
  {
    plan_code: 'growth',
    plan_name: 'Growth',
    monthly_price_cents: 59900,
    features: {
      lead_routing: true,
      crm_access: true,
      quote_engine: true,
      branded_docs: true,
      priority_leads: true,
      exclusive_zips: false,
      api_access: false,
    },
    lead_cap: 50,
    priority_weight: 5,
  },
  {
    plan_code: 'pro',
    plan_name: 'Pro',
    monthly_price_cents: 99900,
    features: {
      lead_routing: true,
      crm_access: true,
      quote_engine: true,
      branded_docs: true,
      priority_leads: true,
      exclusive_zips: true,
      api_access: true,
    },
    lead_cap: null, // unlimited
    priority_weight: 10,
  },
];

export const ADD_ONS = {
  exclusive_zip: { price_cents: 9900, label: 'Exclusive ZIP Code' },
  pay_per_lead: { price_cents: 4900, label: 'Pay-Per-Exclusive-Lead' },
} as const;
