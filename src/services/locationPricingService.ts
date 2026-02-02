// Location-Based Pricing Service
// Fetches market_size_pricing, dump_fee_profiles, heavy_material_rates

import { supabase } from '@/integrations/supabase/client';

// Types
export interface DumpFeeProfile {
  id: string;
  market_code: string;
  material_category: 'DEBRIS' | 'HEAVY' | 'DEBRIS_HEAVY' | 'CLEAN_RECYCLING';
  material_code: string | null;
  material_stream: string | null;
  dump_cost_model: 'PER_TON' | 'PER_LOAD';
  default_cost_per_ton: number | null;
  default_cost_per_load: number | null;
  min_charge: number | null;
  facility_name: string | null;
  notes: string | null;
  is_active: boolean;
  assumed_tons_defaults_json: Record<string, unknown> | null;
}

export interface MarketSizePricing {
  id: string;
  market_code: string;
  size_yd: number;
  tier: 'BASE' | 'CORE' | 'PREMIUM';
  base_price: number;
  included_days: number;
  included_tons: number;
  extra_ton_rate: number;
  overdue_daily_rate: number;
  same_day_fee: number | null;
  service_fee_component: number | null;
  dump_cost_assumption: number | null;
  target_margin_pct: number | null;
  notes: string | null;
  is_active: boolean;
}

export interface HeavyMaterialRate {
  id: string;
  market_code: string;
  size_yd: number;
  heavy_category: 'HEAVY_BASE' | 'GREEN_HALO';
  material_stream: string;
  base_price_flat: number;
  max_tons: number;
  included_days: number;
  facility_name: string | null;
  reclass_to_debris_heavy: boolean;
  notes: string | null;
  is_active: boolean;
}

export interface SizePricingDefault {
  id: string;
  size_yd: number;
  included_days_default: number;
  included_tons_default: number;
  base_service_fee: number;
  description: string | null;
  is_active: boolean;
}

export interface MarketPricingResult {
  base_price: number;
  included_days: number;
  included_tons: number;
  extra_ton_rate: number;
  overdue_daily_rate: number;
  same_day_fee: number | null;
  service_fee_component: number | null;
  dump_cost_assumption: number | null;
}

// ============================================================
// DUMP FEE PROFILES
// ============================================================

export async function getDumpFeeProfiles(
  marketCode?: string
): Promise<DumpFeeProfile[]> {
  let query = supabase
    .from('dump_fee_profiles')
    .select('*')
    .eq('is_active', true)
    .order('market_code')
    .order('material_category');

  if (marketCode) {
    query = query.eq('market_code', marketCode);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch dump fee profiles:', error);
    return [];
  }

  return (data || []) as unknown as DumpFeeProfile[];
}

export async function getDumpFeeByStream(
  marketCode: string,
  materialStream: string
): Promise<DumpFeeProfile | null> {
  const { data, error } = await supabase
    .from('dump_fee_profiles')
    .select('*')
    .eq('market_code', marketCode)
    .or(`material_stream.eq.${materialStream},material_category.eq.${materialStream}`)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch dump fee:', error);
    return null;
  }

  return data as unknown as DumpFeeProfile | null;
}

// ============================================================
// MARKET SIZE PRICING
// ============================================================

export async function getMarketSizePricing(
  marketCode?: string,
  tier: 'BASE' | 'CORE' | 'PREMIUM' = 'BASE'
): Promise<MarketSizePricing[]> {
  let query = supabase
    .from('market_size_pricing')
    .select('*')
    .eq('tier', tier)
    .eq('is_active', true)
    .order('size_yd');

  if (marketCode) {
    query = query.eq('market_code', marketCode);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch market size pricing:', error);
    return [];
  }

  return (data || []) as MarketSizePricing[];
}

export async function getMarketPriceBySize(
  marketCode: string,
  sizeYd: number,
  tier: 'BASE' | 'CORE' | 'PREMIUM' = 'BASE'
): Promise<MarketPricingResult | null> {
  const { data, error } = await supabase.rpc('get_market_pricing', {
    p_market_code: marketCode,
    p_size_yd: sizeYd,
    p_tier: tier,
  });

  if (error) {
    console.error('Failed to get market pricing:', error);
    return null;
  }

  if (data && Array.isArray(data) && data.length > 0) {
    return data[0] as MarketPricingResult;
  }

  return null;
}

export async function getAllMarketSizePricing(): Promise<MarketSizePricing[]> {
  const { data, error } = await supabase
    .from('market_size_pricing')
    .select('*')
    .eq('is_active', true)
    .order('market_code')
    .order('tier')
    .order('size_yd');

  if (error) {
    console.error('Failed to fetch all market size pricing:', error);
    return [];
  }

  return (data || []) as MarketSizePricing[];
}

// ============================================================
// HEAVY MATERIAL RATES
// ============================================================

export async function getHeavyMaterialRates(
  marketCode?: string
): Promise<HeavyMaterialRate[]> {
  let query = supabase
    .from('heavy_material_rates')
    .select('*')
    .eq('is_active', true)
    .order('size_yd')
    .order('material_stream');

  if (marketCode) {
    query = query.eq('market_code', marketCode);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch heavy material rates:', error);
    return [];
  }

  return (data || []) as HeavyMaterialRate[];
}

export async function getHeavyRateByMaterial(
  marketCode: string,
  sizeYd: number,
  materialStream: string
): Promise<HeavyMaterialRate | null> {
  const { data, error } = await supabase
    .from('heavy_material_rates')
    .select('*')
    .eq('market_code', marketCode)
    .eq('size_yd', sizeYd)
    .eq('material_stream', materialStream)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to get heavy material rate:', error);
    return null;
  }

  return data as HeavyMaterialRate | null;
}

// ============================================================
// SIZE PRICING DEFAULTS
// ============================================================

export async function getSizePricingDefaults(): Promise<SizePricingDefault[]> {
  const { data, error } = await supabase
    .from('size_pricing_defaults')
    .select('*')
    .eq('is_active', true)
    .order('size_yd');

  if (error) {
    console.error('Failed to fetch size pricing defaults:', error);
    return [];
  }

  return (data || []) as SizePricingDefault[];
}

// ============================================================
// PRICING CALCULATION HELPERS
// ============================================================

export interface PriceCalculationInput {
  marketCode: string;
  sizeYd: number;
  materialCategory: 'DEBRIS' | 'HEAVY' | 'DEBRIS_HEAVY';
  materialStream?: string;
  tier?: 'BASE' | 'CORE' | 'PREMIUM';
}

export interface PriceCalculationResult {
  basePrice: number;
  includedTons: number;
  includedDays: number;
  extraTonRate: number;
  overdueDailyRate: number;
  sameDayFee: number;
  dumpCostAssumption: number | null;
  serviceFeeComponent: number | null;
  targetMarginPct: number | null;
  facilityName: string | null;
  isHeavyFlat: boolean;
  maxTons: number | null;
}

export async function calculateLocationPrice(
  input: PriceCalculationInput
): Promise<PriceCalculationResult | null> {
  const tier = input.tier || 'BASE';

  // For heavy materials, check heavy_material_rates first
  if (input.materialCategory === 'HEAVY' && input.materialStream) {
    const heavyRate = await getHeavyRateByMaterial(
      input.marketCode,
      input.sizeYd,
      input.materialStream
    );

    if (heavyRate) {
      return {
        basePrice: heavyRate.base_price_flat,
        includedTons: heavyRate.max_tons,
        includedDays: heavyRate.included_days,
        extraTonRate: 0, // Flat fee, no overage
        overdueDailyRate: 35,
        sameDayFee: 75,
        dumpCostAssumption: null,
        serviceFeeComponent: null,
        targetMarginPct: null,
        facilityName: heavyRate.facility_name,
        isHeavyFlat: true,
        maxTons: heavyRate.max_tons,
      };
    }
  }

  // For standard debris, use market_size_pricing
  const marketPrice = await getMarketPriceBySize(
    input.marketCode,
    input.sizeYd,
    tier
  );

  if (marketPrice) {
    return {
      basePrice: marketPrice.base_price,
      includedTons: marketPrice.included_tons,
      includedDays: marketPrice.included_days,
      extraTonRate: marketPrice.extra_ton_rate,
      overdueDailyRate: marketPrice.overdue_daily_rate,
      sameDayFee: marketPrice.same_day_fee || 75,
      dumpCostAssumption: marketPrice.dump_cost_assumption,
      serviceFeeComponent: marketPrice.service_fee_component,
      targetMarginPct: null,
      facilityName: null,
      isHeavyFlat: false,
      maxTons: null,
    };
  }

  return null;
}

// ============================================================
// MARGIN ESTIMATION
// ============================================================

export interface MarginEstimate {
  customerPrice: number;
  serviceFee: number;
  dumpCost: number;
  totalInternalCost: number;
  grossMargin: number;
  marginPct: number;
  marginClass: 'green' | 'amber' | 'red';
}

export function estimateMargin(
  customerPrice: number,
  serviceFee: number,
  dumpCost: number
): MarginEstimate {
  const totalInternalCost = serviceFee + dumpCost;
  const grossMargin = customerPrice - totalInternalCost;
  const marginPct = customerPrice > 0 ? (grossMargin / customerPrice) * 100 : 0;

  let marginClass: 'green' | 'amber' | 'red' = 'green';
  if (marginPct < 20) {
    marginClass = 'red';
  } else if (marginPct < 30) {
    marginClass = 'amber';
  }

  return {
    customerPrice,
    serviceFee,
    dumpCost,
    totalInternalCost,
    grossMargin,
    marginPct: Math.round(marginPct * 10) / 10,
    marginClass,
  };
}

// ============================================================
// UPSERT FUNCTIONS (Admin)
// ============================================================

export async function upsertDumpFeeProfile(
  profile: { 
    id?: string;
    market_code: string; 
    material_category: string; 
    dump_cost_model: string;
    material_code?: string | null;
    material_stream?: string | null;
    default_cost_per_ton?: number | null;
    default_cost_per_load?: number | null;
    min_charge?: number | null;
    facility_name?: string | null;
    notes?: string | null;
    is_active?: boolean;
  }
): Promise<DumpFeeProfile | null> {
  const { data, error } = await supabase
    .from('dump_fee_profiles')
    .upsert(profile as never, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Failed to upsert dump fee profile:', error);
    return null;
  }

  return data as unknown as DumpFeeProfile;
}

export async function upsertMarketSizePricing(
  pricing: { 
    id?: string;
    market_code: string; 
    size_yd: number; 
    tier: string; 
    base_price: number; 
    included_tons: number;
    included_days?: number;
    extra_ton_rate?: number;
    overdue_daily_rate?: number;
    same_day_fee?: number | null;
    service_fee_component?: number | null;
    dump_cost_assumption?: number | null;
    target_margin_pct?: number | null;
    notes?: string | null;
    is_active?: boolean;
  }
): Promise<MarketSizePricing | null> {
  const { data, error } = await supabase
    .from('market_size_pricing')
    .upsert(pricing as never, { onConflict: 'market_code,size_yd,tier' })
    .select()
    .single();

  if (error) {
    console.error('Failed to upsert market size pricing:', error);
    return null;
  }

  return data as unknown as MarketSizePricing;
}

export async function upsertHeavyMaterialRate(
  rate: { 
    id?: string;
    market_code: string; 
    size_yd: number; 
    heavy_category: string; 
    material_stream: string; 
    base_price_flat: number;
    max_tons?: number;
    included_days?: number;
    facility_name?: string | null;
    reclass_to_debris_heavy?: boolean;
    notes?: string | null;
    is_active?: boolean;
  }
): Promise<HeavyMaterialRate | null> {
  const { data, error } = await supabase
    .from('heavy_material_rates')
    .upsert(rate as never, { onConflict: 'market_code,size_yd,heavy_category,material_stream' })
    .select()
    .single();

  if (error) {
    console.error('Failed to upsert heavy material rate:', error);
    return null;
  }

  return data as unknown as HeavyMaterialRate;
}

// ============================================================
// DISPLAY HELPERS
// ============================================================

export const MATERIAL_STREAM_LABELS: Record<string, string> = {
  CND_DEBRIS: 'C&D / General Debris',
  GREEN_WASTE: 'Green Waste / Yard Debris',
  CLEAN_WOOD: 'Clean Wood',
  CLEAN_DRYWALL: 'Clean Drywall',
  MIXED_HEAVY: 'Mixed Heavy Debris',
  CLEAN_CONCRETE: 'Clean Concrete',
  CLEAN_ASPHALT: 'Clean Asphalt',
  CLEAN_ROCK_SAND: 'Clean Rock/Sand/Gravel',
  CLEAN_SOIL: 'Clean Soil/Dirt',
};

export const HEAVY_CATEGORY_LABELS: Record<string, string> = {
  HEAVY_BASE: 'Heavy Base (Inert)',
  GREEN_HALO: 'Green Halo (Eco)',
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getMarginBadgeColor(marginPct: number): string {
  if (marginPct >= 40) return 'bg-green-100 text-green-800';
  if (marginPct >= 30) return 'bg-blue-100 text-blue-800';
  if (marginPct >= 20) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}
