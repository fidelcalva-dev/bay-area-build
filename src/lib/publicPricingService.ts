/**
 * Public Pricing Service — Reads from `public_price_catalog`
 * 
 * Website pages consume THIS service for representative/display pricing.
 * Never reads from raw internal pricing tables directly.
 * Falls back to config constants if DB is empty.
 */
import { supabase } from '@/integrations/supabase/client';
import { GENERAL_DEBRIS_SIZES } from '@/config/pricingConfig';
import { calculateHeavyTotalPrice, HEAVY_MATERIAL_GROUPS, HEAVY_ALLOWED_SIZES, type HeavySize, type HeavyMaterialGroup } from '@/config/heavyMaterialConfig';

// ── Types ────────────────────────────────────────────────────

export interface PublicPriceRow {
  id: string;
  market_code: string;
  service_line: string;
  price_family: string;
  size_yd: number;
  material_group_code: string | null;
  public_price: number;
  included_days: number;
  included_tons: number;
  overage_rate: number;
  public_label: string;
  public_description: string | null;
}

export interface PublicGeneralPrice {
  size_yd: number;
  price: number;
  includedTons: number;
  includedDays: number;
  overageRate: number;
  label: string;
  description: string;
}

export interface PublicHeavyPrice {
  size_yd: number;
  group_code: string;
  price: number;
  label: string;
  description: string;
}

// ── Cache ────────────────────────────────────────────────────

let _generalCache: PublicGeneralPrice[] | null = null;
let _heavyCache: PublicHeavyPrice[] | null = null;
let _cacheTs = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return Date.now() - _cacheTs < CACHE_TTL;
}

// ── General Debris Public Prices ─────────────────────────────

export async function fetchPublicGeneralPrices(
  marketCode = 'default'
): Promise<PublicGeneralPrice[]> {
  if (_generalCache && isCacheValid()) return _generalCache;

  const { data, error } = await supabase
    .from('public_price_catalog')
    .select('*')
    .eq('market_code', marketCode)
    .eq('price_family', 'GENERAL_DEBRIS')
    .eq('active', true)
    .eq('public_visible', true)
    .order('size_yd');

  if (error || !data || data.length === 0) {
    // Fallback to config constants
    const fallback = GENERAL_DEBRIS_SIZES.map(s => ({
      size_yd: s.size,
      price: s.price,
      includedTons: s.includedTons,
      includedDays: 7,
      overageRate: 165,
      label: `${s.size} Yard Dumpster`,
      description: s.bestFor,
    }));
    _generalCache = fallback;
    _cacheTs = Date.now();
    return fallback;
  }

  const result = data.map((row: any) => ({
    size_yd: row.size_yd,
    price: Number(row.public_price),
    includedTons: Number(row.included_tons),
    includedDays: row.included_days,
    overageRate: Number(row.overage_rate),
    label: row.public_label,
    description: row.public_description || '',
  }));

  _generalCache = result;
  _cacheTs = Date.now();
  return result;
}

// ── Heavy Material Public Prices ─────────────────────────────

export async function fetchPublicHeavyPrices(
  marketCode = 'default'
): Promise<PublicHeavyPrice[]> {
  if (_heavyCache && isCacheValid()) return _heavyCache;

  const { data, error } = await supabase
    .from('public_price_catalog')
    .select('*')
    .eq('market_code', marketCode)
    .eq('price_family', 'HEAVY_MATERIAL')
    .eq('active', true)
    .eq('public_visible', true)
    .order('material_group_code')
    .order('size_yd');

  if (error || !data || data.length === 0) {
    // Fallback to config constants
    const fallback: PublicHeavyPrice[] = [];
    for (const group of HEAVY_MATERIAL_GROUPS) {
      for (const size of HEAVY_ALLOWED_SIZES) {
        const total = calculateHeavyTotalPrice(size, group.id);
        fallback.push({
          size_yd: size,
          group_code: group.id,
          price: total,
          label: `${size} Yard - ${group.label}`,
          description: group.description,
        });
      }
    }
    _heavyCache = fallback;
    _cacheTs = Date.now();
    return fallback;
  }

  const result = data.map((row: any) => ({
    size_yd: row.size_yd,
    group_code: row.material_group_code || 'UNKNOWN',
    price: Number(row.public_price),
    label: row.public_label,
    description: row.public_description || '',
  }));

  _heavyCache = result;
  _cacheTs = Date.now();
  return result;
}

// ── Helpers ──────────────────────────────────────────────────

export async function getPublicPriceForSize(
  sizeYd: number,
  marketCode = 'default'
): Promise<number> {
  const prices = await fetchPublicGeneralPrices(marketCode);
  return prices.find(p => p.size_yd === sizeYd)?.price ?? 0;
}

export async function getPublicStartingPrice(
  marketCode = 'default'
): Promise<number> {
  const prices = await fetchPublicGeneralPrices(marketCode);
  return prices[0]?.price ?? 395;
}

export async function getPublicHeavyPriceForGroup(
  sizeYd: number,
  groupCode: string,
  marketCode = 'default'
): Promise<number> {
  const prices = await fetchPublicHeavyPrices(marketCode);
  return prices.find(p => p.size_yd === sizeYd && p.group_code === groupCode)?.price ?? 0;
}

/** Invalidate cache — call after publishing new pricing version */
export function invalidatePublicPricingCache(): void {
  _generalCache = null;
  _heavyCache = null;
  _cacheTs = 0;
}
