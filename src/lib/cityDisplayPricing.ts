/**
 * City Display Pricing — Dynamic city-based pricing for SEO pages
 * 
 * Resolution:
 *   1. Lookup city_display_pricing table for primary ZIP
 *   2. Pass ZIP into canonical pricing engine (getPriceRangeForZip)
 *   3. Return public-safe "from" prices per size
 *   4. Cache results in memory by city_slug
 * 
 * Falls back to static DUMPSTER_SIZES_DATA if engine unavailable.
 */

import { supabase } from '@/integrations/supabase/client';
import { getPriceRangeForZip } from './masterPricingService';
import { DUMPSTER_SIZES_DATA } from './shared-data';
import { GENERAL_DEBRIS_SIZES, HEAVY_MATERIAL, formatPrice } from '@/config/pricingConfig';

// =====================================================
// TYPES
// =====================================================

export interface CityDisplayConfig {
  city_slug: string;
  city_name: string;
  primary_zip: string;
  fallback_zip: string | null;
  assigned_market_id: string | null;
  preferred_yard_id: string | null;
  is_active: boolean;
  notes: string | null;
}

export interface CityPriceEntry {
  sizeYd: number;
  fromPrice: number;
  toPrice: number | null;
  includedTons: number;
  materialType: 'general' | 'heavy';
  formatted: string;
}

export interface CityDisplayPricing {
  citySlug: string;
  cityName: string;
  zip: string;
  generalPrices: CityPriceEntry[];
  heavyPrices: CityPriceEntry[];
  disclaimer: string;
  isLive: boolean; // true = from pricing engine, false = fallback
  fetchedAt: number;
}

// =====================================================
// CACHE
// =====================================================

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const cache = new Map<string, CityDisplayPricing>();

function getCached(slug: string): CityDisplayPricing | null {
  const entry = cache.get(slug);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
    cache.delete(slug);
    return null;
  }
  return entry;
}

/** Clear all cached city pricing (call on config change) */
export function invalidateCityPricingCache(slug?: string) {
  if (slug) {
    cache.delete(slug);
  } else {
    cache.clear();
  }
}

// =====================================================
// CONFIG LOOKUP
// =====================================================

export async function getCityDisplayConfig(citySlug: string): Promise<CityDisplayConfig | null> {
  const { data } = await supabase
    .from('city_display_pricing')
    .select('*')
    .eq('city_slug', citySlug)
    .eq('is_active', true)
    .maybeSingle();

  if (!data) return null;

  return {
    city_slug: data.city_slug,
    city_name: data.city_name,
    primary_zip: data.primary_zip,
    fallback_zip: data.fallback_zip,
    assigned_market_id: data.assigned_market_id,
    preferred_yard_id: data.preferred_yard_id,
    is_active: data.is_active,
    notes: data.notes,
  };
}

// =====================================================
// MAIN HELPER — getCityDisplayPricing
// =====================================================

const GENERAL_DISPLAY_SIZES = [10, 20, 30]; // Sizes shown on city pages
const HEAVY_DISPLAY_SIZES = [5, 8, 10];

export async function getCityDisplayPricing(citySlug: string): Promise<CityDisplayPricing | null> {
  // Check cache
  const cached = getCached(citySlug);
  if (cached) return cached;

  // Lookup config
  const config = await getCityDisplayConfig(citySlug);
  if (!config) return null;

  const zip = config.primary_zip;
  const result: CityDisplayPricing = {
    citySlug: config.city_slug,
    cityName: config.city_name,
    zip,
    generalPrices: [],
    heavyPrices: [],
    disclaimer: 'Final pricing depends on material, exact address, and delivery timing.',
    isLive: false,
    fetchedAt: Date.now(),
  };

  // Try pricing engine for general debris sizes
  let engineWorked = false;
  try {
    const pricePromises = GENERAL_DISPLAY_SIZES.map(async (size) => {
      const range = await getPriceRangeForZip(zip, size, 'general');
      if (range) {
        engineWorked = true;
        return {
          sizeYd: size,
          fromPrice: range.low,
          toPrice: range.high !== range.low ? range.high : null,
          includedTons: range.includedTons,
          materialType: 'general' as const,
          formatted: range.high !== range.low
            ? `${formatPrice(range.low)}–${formatPrice(range.high)}`
            : `From ${formatPrice(range.low)}`,
        };
      }
      return null;
    });

    const heavyPromises = HEAVY_DISPLAY_SIZES.map(async (size) => {
      const range = await getPriceRangeForZip(zip, size, 'heavy');
      if (range) {
        engineWorked = true;
        return {
          sizeYd: size,
          fromPrice: range.low,
          toPrice: range.high !== range.low ? range.high : null,
          includedTons: range.includedTons,
          materialType: 'heavy' as const,
          formatted: `From ${formatPrice(range.low)}`,
        };
      }
      return null;
    });

    const [generalResults, heavyResults] = await Promise.all([
      Promise.all(pricePromises),
      Promise.all(heavyPromises),
    ]);

    result.generalPrices = generalResults.filter(Boolean) as CityPriceEntry[];
    result.heavyPrices = heavyResults.filter(Boolean) as CityPriceEntry[];
    result.isLive = engineWorked;
  } catch (err) {
    console.warn('City display pricing engine failed for', citySlug, err);
  }

  // Fallback to static data if engine didn't produce results
  if (result.generalPrices.length === 0) {
    result.generalPrices = GENERAL_DISPLAY_SIZES.map(size => {
      const sizeData = GENERAL_DEBRIS_SIZES.find(s => s.size === size);
      return {
        sizeYd: size,
        fromPrice: sizeData?.price ?? 0,
        toPrice: null,
        includedTons: sizeData?.includedTons ?? 0,
        materialType: 'general' as const,
        formatted: `From ${formatPrice(sizeData?.price ?? 0)}`,
      };
    });
  }

  if (result.heavyPrices.length === 0) {
    result.heavyPrices = HEAVY_DISPLAY_SIZES.map(size => {
      const price = HEAVY_MATERIAL.cleanSoil.prices[size] ?? 0;
      return {
        sizeYd: size,
        fromPrice: price,
        toPrice: null,
        includedTons: 0,
        materialType: 'heavy' as const,
        formatted: `From ${formatPrice(price)}`,
      };
    });
  }

  // Cache result
  cache.set(citySlug, result);
  return result;
}

// =====================================================
// SYNC FALLBACK (no async, uses static data only)
// =====================================================

export function getCityDisplayPricingSync(cityName: string): Omit<CityDisplayPricing, 'fetchedAt'> {
  return {
    citySlug: '',
    cityName,
    zip: '',
    generalPrices: GENERAL_DISPLAY_SIZES.map(size => {
      const sizeData = GENERAL_DEBRIS_SIZES.find(s => s.size === size);
      return {
        sizeYd: size,
        fromPrice: sizeData?.price ?? 0,
        toPrice: null,
        includedTons: sizeData?.includedTons ?? 0,
        materialType: 'general' as const,
        formatted: `From ${formatPrice(sizeData?.price ?? 0)}`,
      };
    }),
    heavyPrices: HEAVY_DISPLAY_SIZES.map(size => ({
      sizeYd: size,
      fromPrice: HEAVY_MATERIAL.cleanSoil.prices[size] ?? 0,
      toPrice: null,
      includedTons: 0,
      materialType: 'heavy' as const,
      formatted: `From ${formatPrice(HEAVY_MATERIAL.cleanSoil.prices[size] ?? 0)}`,
    })),
    disclaimer: 'Final pricing depends on material, exact address, and delivery timing.',
    isLive: false,
  };
}
