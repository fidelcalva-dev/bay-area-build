// Market Onboarding Service
// Handles templates, onboarding, versions, and adjustments

import { supabase } from '@/integrations/supabase/client';

// Types
export interface MarketTemplate {
  id: string;
  template_name: string;
  description: string | null;
  default_included_tons_json: Record<string, number>;
  default_days_included: number;
  default_extra_ton_rate: number;
  default_overdue_daily_rate: number;
  default_core_markup_pct: number;
  default_premium_markup_pct: number;
  default_service_fee_by_size_json: Record<string, number> | null;
  default_same_day_fee: number | null;
  heavy_base_prices_json: Record<string, number> | null;
  green_halo_prices_json: Record<string, number> | null;
  heavy_max_tons: number | null;
  heavy_included_days: number | null;
  is_active: boolean;
}

export interface MarketOnboarding {
  id: string;
  market_code: string;
  market_name: string;
  city: string;
  state: string;
  yard_id: string | null;
  template_id: string | null;
  status: 'DRAFT' | 'SEEDED' | 'REVIEWED' | 'LIVE_READY' | 'ACTIVE';
  facilities_config_json: FacilitiesConfig | null;
  notes: string | null;
  created_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  activated_at: string | null;
  created_at: string;
}

export interface MarketPriceVersion {
  id: string;
  market_code: string;
  version_label: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  pricing_snapshot_json: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  activated_at: string | null;
}

export interface MarketPriceAdjustment {
  id: string;
  market_code: string;
  applies_to: 'STANDARD_DEBRIS' | 'GREEN_WASTE' | 'HEAVY_BASE' | 'GREEN_HALO' | 'ALL';
  adjustment_pct: number;
  reason: string | null;
  is_active: boolean;
  created_at: string;
}

export interface FacilitiesConfig {
  cnd_debris: {
    facility_name: string;
    cost_per_ton: number;
    min_charge?: number;
  };
  green_waste: {
    facility_name: string;
    cost_per_ton: number;
    min_charge?: number;
  };
  heavy_clean: {
    facility_name: string;
    cost_per_load_concrete?: number;
    cost_per_load_asphalt?: number;
    cost_per_load_soil?: number;
    environmental_fee?: number;
  };
}

// ============================================================
// TEMPLATES
// ============================================================

export async function getMarketTemplates(): Promise<MarketTemplate[]> {
  const { data, error } = await supabase
    .from('market_templates')
    .select('*')
    .eq('is_active', true)
    .order('template_name');

  if (error) {
    console.error('Failed to fetch market templates:', error);
    return [];
  }

  return (data || []) as unknown as MarketTemplate[];
}

export async function getMarketTemplate(id: string): Promise<MarketTemplate | null> {
  const { data, error } = await supabase
    .from('market_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch market template:', error);
    return null;
  }

  return data as unknown as MarketTemplate;
}

// ============================================================
// ONBOARDING
// ============================================================

export async function getMarketOnboardings(): Promise<MarketOnboarding[]> {
  const { data, error } = await supabase
    .from('market_onboarding')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch market onboardings:', error);
    return [];
  }

  return (data || []) as unknown as MarketOnboarding[];
}

export async function getMarketOnboarding(marketCode: string): Promise<MarketOnboarding | null> {
  const { data, error } = await supabase
    .from('market_onboarding')
    .select('*')
    .eq('market_code', marketCode)
    .single();

  if (error) {
    console.error('Failed to fetch market onboarding:', error);
    return null;
  }

  return data as unknown as MarketOnboarding;
}

export async function createMarketOnboarding(
  onboarding: Omit<MarketOnboarding, 'id' | 'created_at' | 'reviewed_at' | 'activated_at' | 'reviewed_by'>
): Promise<MarketOnboarding | null> {
  const { data, error } = await supabase
    .from('market_onboarding')
    .insert(onboarding as never)
    .select()
    .single();

  if (error) {
    console.error('Failed to create market onboarding:', error);
    return null;
  }

  return data as unknown as MarketOnboarding;
}

export async function updateMarketOnboardingStatus(
  marketCode: string,
  status: MarketOnboarding['status'],
  notes?: string
): Promise<boolean> {
  const updates: Record<string, unknown> = { status };
  
  if (status === 'REVIEWED') {
    updates.reviewed_at = new Date().toISOString();
  } else if (status === 'ACTIVE') {
    updates.activated_at = new Date().toISOString();
  }
  
  if (notes) {
    updates.notes = notes;
  }

  const { error } = await supabase
    .from('market_onboarding')
    .update(updates)
    .eq('market_code', marketCode);

  if (error) {
    console.error('Failed to update market onboarding status:', error);
    return false;
  }

  return true;
}

// ============================================================
// VERSIONS
// ============================================================

export async function getMarketPriceVersions(marketCode?: string): Promise<MarketPriceVersion[]> {
  let query = supabase
    .from('market_price_versions')
    .select('*')
    .order('created_at', { ascending: false });

  if (marketCode) {
    query = query.eq('market_code', marketCode);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch market price versions:', error);
    return [];
  }

  return (data || []) as unknown as MarketPriceVersion[];
}

export async function activateMarketPriceVersion(
  marketCode: string,
  versionId: string
): Promise<boolean> {
  // First, archive any currently active version
  await supabase
    .from('market_price_versions')
    .update({ status: 'ARCHIVED', archived_at: new Date().toISOString() })
    .eq('market_code', marketCode)
    .eq('status', 'ACTIVE');

  // Then activate the new version
  const { error } = await supabase
    .from('market_price_versions')
    .update({ status: 'ACTIVE', activated_at: new Date().toISOString() })
    .eq('id', versionId);

  if (error) {
    console.error('Failed to activate market price version:', error);
    return false;
  }

  // Update onboarding status
  await updateMarketOnboardingStatus(marketCode, 'ACTIVE');

  return true;
}

// ============================================================
// ADJUSTMENTS
// ============================================================

export async function getMarketPriceAdjustments(marketCode?: string): Promise<MarketPriceAdjustment[]> {
  let query = supabase
    .from('market_price_adjustments')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (marketCode) {
    query = query.eq('market_code', marketCode);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch market price adjustments:', error);
    return [];
  }

  return (data || []) as unknown as MarketPriceAdjustment[];
}

export async function createMarketPriceAdjustment(
  adjustment: Omit<MarketPriceAdjustment, 'id' | 'created_at'>
): Promise<MarketPriceAdjustment | null> {
  const { data, error } = await supabase
    .from('market_price_adjustments')
    .insert(adjustment as never)
    .select()
    .single();

  if (error) {
    console.error('Failed to create market price adjustment:', error);
    return null;
  }

  return data as unknown as MarketPriceAdjustment;
}

// ============================================================
// SEED MARKET PRICING (Edge Function Call)
// ============================================================

export interface SeedMarketRequest {
  market_code: string;
  market_name: string;
  city: string;
  state?: string;
  yard_id?: string;
  template_id: string;
  facilities: FacilitiesConfig;
  adjustments?: Array<{
    applies_to: string;
    adjustment_pct: number;
    reason?: string;
  }>;
}

export interface SeedMarketResult {
  success: boolean;
  results: {
    market_code: string;
    dump_fee_profiles_created: number;
    market_size_pricing_created: number;
    heavy_material_rates_created: number;
    adjustments_applied: number;
    version_created: boolean;
    errors: string[];
  };
  message: string;
}

export async function seedMarketPricing(request: SeedMarketRequest): Promise<SeedMarketResult> {
  const { data, error } = await supabase.functions.invoke('seed-market-pricing', {
    body: request,
  });

  if (error) {
    console.error('Failed to seed market pricing:', error);
    return {
      success: false,
      results: {
        market_code: request.market_code,
        dump_fee_profiles_created: 0,
        market_size_pricing_created: 0,
        heavy_material_rates_created: 0,
        adjustments_applied: 0,
        version_created: false,
        errors: [error.message],
      },
      message: `Failed to seed market: ${error.message}`,
    };
  }

  return data as SeedMarketResult;
}

// ============================================================
// YARDS (for wizard)
// ============================================================

export interface Yard {
  id: string;
  name: string;
  market: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
}

export async function getYards(): Promise<Yard[]> {
  const { data, error } = await supabase
    .from('yards')
    .select('id, name, market, address, latitude, longitude, is_active')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Failed to fetch yards:', error);
    return [];
  }

  return (data || []) as Yard[];
}
