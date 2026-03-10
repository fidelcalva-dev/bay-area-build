/**
 * Market Service
 * Handles market resolution (ZIP → City → Market) and market-based operations
 * 
 * MARKET is the primary key for:
 * - Pricing rules
 * - Yard selection
 * - Certified facilities
 * - Disposal recommendations
 * - Dispatch routing
 * - Dashboards
 */
import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TYPES
// =====================================================

export interface Market {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'coming_soon';
  default_yard_id: string | null;
  timezone: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketRates {
  id: string;
  market_id: string;
  extra_ton_rate_standard: number;
  extra_ton_rate_prepay: number | null;
  prepay_discount_pct: number;
  heavy_base_10yd: number;
  mixed_small_overage_rate: number | null;
  rental_day_3_factor: number | null;
  rental_day_7_factor: number | null;
  rental_day_10_factor: number | null;
  rental_day_14_factor: number | null;
  rental_day_30_factor: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketResolution {
  market_id: string;
  market_name: string;
  city: string | null;
  county: string | null;
  zone_id: string | null;
  requires_manual_review: boolean;
}

export interface ZipMarketMapping {
  zip_code: string;
  city_name: string;
  county: string | null;
  market_id: string | null;
  zone_id: string | null;
}

// =====================================================
// MARKET RESOLUTION (ZIP → CITY → MARKET)
// =====================================================

/**
 * Resolve market from ZIP code
 * Returns market_id and metadata, or flags manual_review if not found
 */
export async function resolveMarket(zip: string): Promise<MarketResolution> {
  // Validate ZIP format
  const cleanZip = zip.trim();
  if (!/^\d{5}$/.test(cleanZip)) {
    return {
      market_id: '',
      market_name: '',
      city: null,
      county: null,
      zone_id: null,
      requires_manual_review: true,
    };
  }

  // Look up ZIP in zone_zip_codes
  const { data: zipData, error } = await supabase
    .from('zone_zip_codes')
    .select('zip_code, city_name, county, market_id, zone_id')
    .eq('zip_code', cleanZip)
    .single();

  if (error || !zipData) {
    console.warn(`ZIP ${cleanZip} not found in database`);
    return {
      market_id: '',
      market_name: '',
      city: null,
      county: null,
      zone_id: null,
      requires_manual_review: true,
    };
  }

  // If market_id is set, fetch market name
  if (zipData.market_id) {
    const { data: market } = await supabase
      .from('markets')
      .select('id, name')
      .eq('id', zipData.market_id)
      .single();

    return {
      market_id: zipData.market_id,
      market_name: market?.name || zipData.market_id,
      city: zipData.city_name,
      county: zipData.county,
      zone_id: zipData.zone_id,
      requires_manual_review: false,
    };
  }

  // ZIP exists but no market assigned - infer from city
  const inferredMarket = await inferMarketFromCity(zipData.city_name);
  
  if (inferredMarket) {
    // Update the ZIP record with the inferred market
    await supabase
      .from('zone_zip_codes')
      .update({ market_id: inferredMarket.market_id })
      .eq('zip_code', cleanZip);

    return {
      market_id: inferredMarket.market_id,
      market_name: inferredMarket.market_name,
      city: zipData.city_name,
      county: zipData.county,
      zone_id: zipData.zone_id,
      requires_manual_review: false,
    };
  }

  // Could not infer market
  return {
    market_id: '',
    market_name: '',
    city: zipData.city_name,
    county: zipData.county,
    zone_id: zipData.zone_id,
    requires_manual_review: true,
  };
}

/**
 * Infer market from city name using known city patterns
 */
async function inferMarketFromCity(
  cityName: string
): Promise<{ market_id: string; market_name: string } | null> {
  if (!cityName) return null;

  const city = cityName.toLowerCase();

  // Oakland / East Bay cities
  const eastBayCities = [
    'oakland', 'berkeley', 'alameda', 'fremont', 'hayward', 
    'richmond', 'san leandro', 'union city', 'newark',
    'castro valley', 'emeryville', 'piedmont', 'el cerrito',
    'albany', 'san lorenzo', 'cherryland', 'ashland',
    'pleasanton', 'livermore', 'dublin', 'san ramon'
  ];

  // San Jose / South Bay cities
  const southBayCities = [
    'san jose', 'santa clara', 'sunnyvale', 'campbell',
    'los gatos', 'milpitas', 'cupertino', 'mountain view',
    'palo alto', 'saratoga', 'los altos', 'morgan hill',
    'gilroy', 'menlo park', 'redwood city', 'san mateo',
    'foster city', 'belmont', 'san carlos', 'atherton'
  ];

  for (const c of eastBayCities) {
    if (city.includes(c)) {
      return { market_id: 'oakland_east_bay', market_name: 'Oakland / East Bay' };
    }
  }

  for (const c of southBayCities) {
    if (city.includes(c)) {
      return { market_id: 'san_jose_south_bay', market_name: 'San Jose / South Bay' };
    }
  }

  return null;
}

// =====================================================
// MARKET QUERIES
// =====================================================

/**
 * Get all active markets
 */
export async function getMarkets(): Promise<Market[]> {
  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) {
    console.error('Error fetching markets:', error);
    return [];
  }

  return (data || []) as Market[];
}

/**
 * Get all markets (including inactive) for admin
 */
export async function getAllMarkets(): Promise<Market[]> {
  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching markets:', error);
    return [];
  }

  return (data || []) as Market[];
}

/**
 * Get a single market by ID
 */
export async function getMarket(marketId: string): Promise<Market | null> {
  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .eq('id', marketId)
    .single();

  if (error) {
    console.error('Error fetching market:', error);
    return null;
  }

  return data as Market;
}

/**
 * Create or update a market
 */
export async function upsertMarket(
  market: Partial<Market> & { id: string }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('markets')
    .upsert({
      id: market.id,
      name: market.name,
      status: market.status || 'active',
      default_yard_id: market.default_yard_id || null,
      timezone: market.timezone || 'America/Los_Angeles',
      notes: market.notes || null,
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error upserting market:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// =====================================================
// MARKET RATES
// =====================================================

/**
 * Get rates for a specific market
 */
export async function getMarketRates(marketId: string): Promise<MarketRates | null> {
  const { data, error } = await supabase
    .from('market_rates')
    .select('*')
    .eq('market_id', marketId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching market rates:', error);
    return null;
  }

  return data as MarketRates;
}

/**
 * Get all market rates
 */
export async function getAllMarketRates(): Promise<MarketRates[]> {
  const { data, error } = await supabase
    .from('market_rates')
    .select('*')
    .order('market_id');

  if (error) {
    console.error('Error fetching market rates:', error);
    return [];
  }

  return (data || []) as MarketRates[];
}

/**
 * Update market rates
 */
export async function upsertMarketRates(
  rates: Partial<MarketRates> & { market_id: string }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('market_rates')
    .upsert({
      market_id: rates.market_id,
      extra_ton_rate_standard: rates.extra_ton_rate_standard ?? 165,
      extra_ton_rate_prepay: rates.extra_ton_rate_prepay,
      prepay_discount_pct: rates.prepay_discount_pct ?? 5,
      heavy_base_10yd: rates.heavy_base_10yd ?? 695.50,
      mixed_small_overage_rate: rates.mixed_small_overage_rate ?? 30,
      rental_day_3_factor: rates.rental_day_3_factor ?? 0.6,
      rental_day_7_factor: rates.rental_day_7_factor ?? 1.0,
      rental_day_10_factor: rates.rental_day_10_factor ?? 1.15,
      rental_day_14_factor: rates.rental_day_14_factor ?? 1.25,
      rental_day_30_factor: rates.rental_day_30_factor ?? 1.5,
      is_active: rates.is_active ?? true,
      notes: rates.notes,
    }, { onConflict: 'market_id' });

  if (error) {
    console.error('Error upserting market rates:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// =====================================================
// ZIP-MARKET MAPPING MANAGEMENT
// =====================================================

/**
 * Get all ZIPs for a market
 */
export async function getZipsForMarket(marketId: string): Promise<ZipMarketMapping[]> {
  const { data, error } = await supabase
    .from('zone_zip_codes')
    .select('zip_code, city_name, county, market_id, zone_id')
    .eq('market_id', marketId)
    .order('zip_code');

  if (error) {
    console.error('Error fetching ZIPs for market:', error);
    return [];
  }

  return (data || []) as ZipMarketMapping[];
}

/**
 * Assign ZIPs to a market
 */
export async function assignZipsToMarket(
  zips: string[],
  marketId: string
): Promise<{ success: boolean; updated: number; error?: string }> {
  const { error, count } = await supabase
    .from('zone_zip_codes')
    .update({ market_id: marketId })
    .in('zip_code', zips);

  if (error) {
    console.error('Error assigning ZIPs to market:', error);
    return { success: false, updated: 0, error: error.message };
  }

  return { success: true, updated: count || 0 };
}

/**
 * Get ZIPs without a market assignment (for review)
 */
export async function getUnassignedZips(): Promise<ZipMarketMapping[]> {
  const { data, error } = await supabase
    .from('zone_zip_codes')
    .select('zip_code, city_name, county, market_id, zone_id')
    .is('market_id', null)
    .order('city_name');

  if (error) {
    console.error('Error fetching unassigned ZIPs:', error);
    return [];
  }

  return (data || []) as ZipMarketMapping[];
}

// =====================================================
// MARKET STATISTICS
// =====================================================

/**
 * Get market statistics for dashboards
 */
export async function getMarketStats(marketId: string): Promise<{
  totalQuotes: number;
  totalOrders: number;
  activeOrders: number;
  zipCount: number;
  facilityCount: number;
}> {
  const [quotesRes, ordersRes, activeRes, zipsRes, facilitiesRes] = await Promise.all([
    supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('market_id', marketId),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('market_id', marketId),
    supabase.from('orders').select('id', { count: 'exact', head: true })
      .eq('market_id', marketId)
      .in('status', ['pending', 'confirmed', 'scheduled', 'active']),
    supabase.from('zone_zip_codes').select('id', { count: 'exact', head: true }).eq('market_id', marketId),
    supabase.from('facilities').select('id', { count: 'exact', head: true }).eq('market_id', marketId),
  ]);

  return {
    totalQuotes: quotesRes.count || 0,
    totalOrders: ordersRes.count || 0,
    activeOrders: activeRes.count || 0,
    zipCount: zipsRes.count || 0,
    facilityCount: facilitiesRes.count || 0,
  };
}

// =====================================================
// DISPLAY HELPERS
// =====================================================

export const MARKET_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  coming_soon: 'Coming Soon',
};

export const MARKET_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-300',
  inactive: 'bg-gray-100 text-gray-800 border-gray-300',
  coming_soon: 'bg-blue-100 text-blue-800 border-blue-300',
};
