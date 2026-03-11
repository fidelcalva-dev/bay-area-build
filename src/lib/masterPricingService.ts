/**
 * Master Pricing Service
 * Fetches city-specific pricing from the dumpster_pricing table.
 * Single source of truth for all pricing across website, CRM, quotes, invoices.
 */
import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TYPES
// =====================================================

export interface DumpsterPricing {
  size_yd: number;
  material_type: 'general' | 'heavy';
  market_code: string;
  delivery_fee: number;
  pickup_fee: number;
  rental_fee: number;
  dump_fee: number;
  total_price: number;
  included_tons: number;
  overweight_fee_per_ton: number;
  contamination_surcharge: number;
  included_days: number;
  extra_day_fee: number;
  is_heavy_only: boolean;
  dump_cost_per_ton: number;
  margin_pct: number;
}

export interface PriceRange {
  low: number;
  high: number;
  base: number;
  includedTons: number;
  isFlatFee: boolean;
  deliveryFee: number;
  pickupFee: number;
  rentalFee: number;
  dumpFee: number;
  overweightFeePerTon: number;
  contaminationSurcharge: number;
  includedDays: number;
  extraDayFee: number;
  dumpCostPerTon: number;
}

// City dump costs ($/ton)
export const CITY_DUMP_COSTS: Record<string, number> = {
  oakland_east_bay: 115,
  san_jose_south_bay: 120,
  san_francisco_peninsula: 125,
  berkeley_north: 115, // same as Oakland
};

// Green Halo compliance rate
export const GREEN_HALO_RATE = 165; // $/ton

// Price range spread (accounts for distance/access variance)
const RANGE_SPREAD = 70;

// =====================================================
// MARKET RESOLUTION
// =====================================================

/** Resolve market_code from ZIP via zone_zip_codes */
export async function resolveMarketFromZip(zip: string): Promise<string> {
  if (!/^\d{5}$/.test(zip)) return 'oakland_east_bay';

  const { data } = await supabase
    .from('zone_zip_codes')
    .select('market_id, city_name')
    .eq('zip_code', zip)
    .maybeSingle();

  if (data?.market_id) return data.market_id;

  // Fallback: detect by city name
  const city = data?.city_name?.toLowerCase() || '';
  if (city.includes('san francisco') || city.includes('daly city') || city.includes('south san francisco') || city.includes('pacifica') || city.includes('burlingame') || city.includes('san mateo') || city.includes('brisbane')) {
    return 'san_francisco_peninsula';
  }
  if (city.includes('san jose') || city.includes('campbell') || city.includes('cupertino') || city.includes('sunnyvale') || city.includes('santa clara') || city.includes('milpitas') || city.includes('mountain view') || city.includes('palo alto') || city.includes('los gatos') || city.includes('morgan hill') || city.includes('gilroy')) {
    return 'san_jose_south_bay';
  }

  return 'oakland_east_bay'; // default
}

// =====================================================
// PRICING FETCH
// =====================================================

/** Fetch pricing for a specific size, material, and market */
export async function getMasterPricing(
  sizeYd: number,
  materialType: 'general' | 'heavy',
  marketCode: string,
): Promise<DumpsterPricing | null> {
  const { data, error } = await supabase
    .from('dumpster_pricing')
    .select('*')
    .eq('size_yd', sizeYd)
    .eq('material_type', materialType)
    .eq('market_code', marketCode)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) return null;

  return {
    size_yd: data.size_yd,
    material_type: data.material_type as 'general' | 'heavy',
    market_code: data.market_code,
    delivery_fee: Number(data.delivery_fee),
    pickup_fee: Number(data.pickup_fee),
    rental_fee: Number(data.rental_fee),
    dump_fee: Number(data.dump_fee),
    total_price: Number(data.total_price),
    included_tons: Number(data.included_tons),
    overweight_fee_per_ton: Number(data.overweight_fee_per_ton),
    contamination_surcharge: Number(data.contamination_surcharge),
    included_days: data.included_days,
    extra_day_fee: Number(data.extra_day_fee),
    is_heavy_only: data.is_heavy_only,
    dump_cost_per_ton: Number(data.dump_cost_per_ton),
    margin_pct: Number(data.margin_pct),
  };
}

/** Calculate price range for display */
export function calculatePriceRange(pricing: DumpsterPricing): PriceRange {
  const base = pricing.total_price;
  const marginMultiplier = 1 + pricing.margin_pct / 100;
  const low = Math.round(base * marginMultiplier);
  const high = low + RANGE_SPREAD;

  return {
    low,
    high,
    base,
    includedTons: pricing.included_tons,
    isFlatFee: pricing.is_heavy_only,
    deliveryFee: pricing.delivery_fee,
    pickupFee: pricing.pickup_fee,
    rentalFee: pricing.rental_fee,
    dumpFee: pricing.dump_fee,
    overweightFeePerTon: pricing.overweight_fee_per_ton,
    contaminationSurcharge: pricing.contamination_surcharge,
    includedDays: pricing.included_days,
    extraDayFee: pricing.extra_day_fee,
    dumpCostPerTon: pricing.dump_cost_per_ton,
  };
}

/** Convenience: resolve ZIP → market → pricing → range */
export async function getPriceRangeForZip(
  zip: string,
  sizeYd: number,
  materialType: 'general' | 'heavy',
): Promise<PriceRange | null> {
  const marketCode = await resolveMarketFromZip(zip);
  const pricing = await getMasterPricing(sizeYd, materialType, marketCode);
  if (!pricing) return null;
  return calculatePriceRange(pricing);
}
