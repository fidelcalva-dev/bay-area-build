// Pricing Tier Calculation Engine

import { supabase } from '@/integrations/supabase/client';
import type { CustomerType, MaterialCategory } from '@/types/calculator';

export type PricingTier = 'BASE' | 'CORE' | 'PREMIUM';

export interface TierConfig {
  margin_min_pct: number;
  margin_target_pct: number;
}

export interface SurchargeConfig {
  same_day: number;
  tight_access: number;
  heavy_risk: number;
  low_inventory: number;
}

export interface RiskFlags {
  is_same_day: boolean;
  is_tight_access: boolean;
  is_heavy_risk: boolean;
  is_low_inventory: boolean;
}

export interface TierPricing {
  tier: PricingTier;
  customer_price: number;
  internal_cost: number;
  surcharges: number;
  gross_margin_dollars: number;
  gross_margin_pct: number;
  is_recommended: boolean;
  label: string;
  description: string;
}

export interface TierCalculationResult {
  tiers: Record<PricingTier, TierPricing>;
  recommended_tier: PricingTier;
  risk_flags: RiskFlags;
  surcharges_applied: number;
}

// Default configs (used as fallback if DB fetch fails)
const DEFAULT_TIER_CONFIG: Record<PricingTier, TierConfig> = {
  BASE: { margin_min_pct: 0.18, margin_target_pct: 0.22 },
  CORE: { margin_min_pct: 0.25, margin_target_pct: 0.30 },
  PREMIUM: { margin_min_pct: 0.35, margin_target_pct: 0.42 },
};

const DEFAULT_SURCHARGES: SurchargeConfig = {
  same_day: 75,
  tight_access: 50,
  heavy_risk: 75,
  low_inventory: 100,
};

const TIER_LABELS: Record<PricingTier, { label: string; description: string }> = {
  BASE: { label: 'Competitive', description: 'Best price for price-sensitive customers' },
  CORE: { label: 'Recommended', description: 'Balanced pricing for most jobs' },
  PREMIUM: { label: 'Priority', description: 'Priority scheduling & high-demand jobs' },
};

// Fetch tier configs from config_settings
export async function fetchTierConfigs(): Promise<{
  tiers: Record<PricingTier, TierConfig>;
  surcharges: SurchargeConfig;
  roundingRule: string;
}> {
  const { data, error } = await supabase
    .from('config_settings')
    .select('key, value')
    .like('key', 'pricing_tiers.%');

  if (error || !data?.length) {
    return {
      tiers: DEFAULT_TIER_CONFIG,
      surcharges: DEFAULT_SURCHARGES,
      roundingRule: 'nearest_5',
    };
  }

  const configMap = new Map<string, string>();
  data.forEach((row: any) => {
    const val = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
    configMap.set(row.key, val.replace(/^"|"$/g, ''));
  });

  const getNum = (key: string, fallback: number) =>
    parseFloat(configMap.get(key) || '') || fallback;

  return {
    tiers: {
      BASE: {
        margin_min_pct: getNum('pricing_tiers.base.margin_min_pct', 0.18),
        margin_target_pct: getNum('pricing_tiers.base.margin_target_pct', 0.22),
      },
      CORE: {
        margin_min_pct: getNum('pricing_tiers.core.margin_min_pct', 0.25),
        margin_target_pct: getNum('pricing_tiers.core.margin_target_pct', 0.30),
      },
      PREMIUM: {
        margin_min_pct: getNum('pricing_tiers.premium.margin_min_pct', 0.35),
        margin_target_pct: getNum('pricing_tiers.premium.margin_target_pct', 0.42),
      },
    },
    surcharges: {
      same_day: getNum('pricing_tiers.same_day.surcharge', 75),
      tight_access: getNum('pricing_tiers.tight_access.surcharge', 50),
      heavy_risk: getNum('pricing_tiers.heavy_risk.surcharge', 75),
      low_inventory: getNum('pricing_tiers.low_inventory.surcharge', 100),
    },
    roundingRule: configMap.get('pricing_tiers.rounding_rule') || 'nearest_5',
  };
}

// Apply rounding rule
function applyRounding(price: number, rule: string): number {
  if (rule === 'nearest_10') return Math.round(price / 10) * 10;
  return Math.round(price / 5) * 5; // nearest_5 default
}

// Compute surcharges from risk flags
function computeSurcharges(flags: RiskFlags, surchargeConfig: SurchargeConfig): number {
  let total = 0;
  if (flags.is_same_day) total += surchargeConfig.same_day;
  if (flags.is_tight_access) total += surchargeConfig.tight_access;
  if (flags.is_heavy_risk) total += surchargeConfig.heavy_risk;
  if (flags.is_low_inventory) total += surchargeConfig.low_inventory;
  return total;
}

// Determine recommended tier
export function getRecommendedTier(
  customerType: CustomerType,
  flags: RiskFlags,
): PricingTier {
  const hasUrgencyOrRisk = flags.is_same_day || flags.is_low_inventory || flags.is_heavy_risk || flags.is_tight_access;

  if (hasUrgencyOrRisk) return 'PREMIUM';

  switch (customerType) {
    case 'homeowner':
      return 'BASE';
    case 'contractor':
      return 'CORE';
    case 'commercial':
      return hasUrgencyOrRisk ? 'PREMIUM' : 'CORE';
    default:
      return 'CORE';
  }
}

// Build risk flags from inputs
export function buildRiskFlags(inputs: {
  is_same_day: boolean;
  material_category: MaterialCategory;
  access_notes?: string;
  warnings?: string[];
}): RiskFlags {
  const isHeavy = inputs.material_category === 'HEAVY' || inputs.material_category === 'DEBRIS_HEAVY';
  const isTightAccess = !!(inputs.access_notes && inputs.access_notes.length > 10);

  return {
    is_same_day: inputs.is_same_day,
    is_tight_access: isTightAccess,
    is_heavy_risk: isHeavy,
    is_low_inventory: false, // Would be determined by inventory check
  };
}

// Main calculation: compute all 3 tiers
export function calculateTiers(
  internalCost: number,
  riskFlags: RiskFlags,
  customerType: CustomerType,
  tierConfigs: Record<PricingTier, TierConfig>,
  surchargeConfig: SurchargeConfig,
  roundingRule: string,
): TierCalculationResult {
  const surchargesTotal = computeSurcharges(riskFlags, surchargeConfig);
  const recommendedTier = getRecommendedTier(customerType, riskFlags);

  const tiers = {} as Record<PricingTier, TierPricing>;

  for (const tier of ['BASE', 'CORE', 'PREMIUM'] as PricingTier[]) {
    const config = tierConfigs[tier];
    // customer_price = internal_cost / (1 - margin_target_pct) + surcharges
    const rawPrice = internalCost / (1 - config.margin_target_pct) + surchargesTotal;
    const customerPrice = applyRounding(rawPrice, roundingRule);
    const marginDollars = customerPrice - internalCost;
    const marginPct = customerPrice > 0 ? (marginDollars / customerPrice) * 100 : 0;

    tiers[tier] = {
      tier,
      customer_price: customerPrice,
      internal_cost: internalCost,
      surcharges: surchargesTotal,
      gross_margin_dollars: marginDollars,
      gross_margin_pct: marginPct,
      is_recommended: tier === recommendedTier,
      label: TIER_LABELS[tier].label,
      description: TIER_LABELS[tier].description,
    };
  }

  return {
    tiers,
    recommended_tier: recommendedTier,
    risk_flags: riskFlags,
    surcharges_applied: surchargesTotal,
  };
}

// Check if a tier selection meets minimum margin requirements
export function checkTierGuardrail(
  tierPricing: TierPricing,
  tierConfig: TierConfig,
  userRole: string,
): { allowed: boolean; requires_approval: boolean; reason?: string } {
  const marginPct = tierPricing.gross_margin_pct / 100;

  if (marginPct >= tierConfig.margin_min_pct) {
    return { allowed: true, requires_approval: false };
  }

  if (userRole === 'admin') {
    return { allowed: true, requires_approval: false };
  }

  return {
    allowed: false,
    requires_approval: true,
    reason: `Margin ${(marginPct * 100).toFixed(1)}% is below minimum ${(tierConfig.margin_min_pct * 100).toFixed(0)}% for ${tierPricing.tier} tier. Admin approval required.`,
  };
}

// Calculate vendor tier pricing (cost basis is vendor payout)
export function calculateVendorTiers(
  vendorPayout: number,
  riskFlags: RiskFlags,
  customerType: CustomerType,
  tierConfigs: Record<PricingTier, TierConfig>,
  surchargeConfig: SurchargeConfig,
  roundingRule: string,
): TierCalculationResult {
  // For vendor mode, the "internal cost" is the vendor payout
  return calculateTiers(vendorPayout, riskFlags, customerType, tierConfigs, surchargeConfig, roundingRule);
}
