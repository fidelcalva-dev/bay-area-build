/**
 * Public Pricing Helper
 * 
 * Provides consistent price ranges for public-facing pages.
 * Uses location-based pricing from market_size_pricing table.
 * 
 * Public pages show:
 * - "From $X" for the lowest base price
 * - "$X–$Y" for size-specific ranges
 * - Always with disclaimer about exact ZIP-based pricing
 */

import { supabase } from '@/integrations/supabase/client';
import { DUMPSTER_SIZES_DATA } from './shared-data';

// Default market for public pricing (Oakland/East Bay)
const DEFAULT_MARKET = 'oakland_east_bay';

/**
 * Price range result for public display
 */
export interface PublicPriceRange {
  fromPrice: number;
  toPrice: number | null;
  sizeYd: number | null;
  disclaimer: string;
  formattedRange: string;
  includedTons?: number;
  includedDays?: number;
}

/**
 * Canonical pricing disclaimer text
 */
export const PRICING_DISCLAIMER = 
  'Exact price depends on ZIP code, material type, and availability.';

export const PRICING_DISCLAIMER_ES = 
  'El precio exacto depende del código postal, tipo de material y disponibilidad.';

/**
 * Get public price range for display on marketing pages
 * Uses market_size_pricing BASE tier as the "From" price
 * 
 * @param sizeYd - Optional size to get specific price, or null for overall lowest
 * @param serviceType - Optional: 'STANDARD' | 'HEAVY' (defaults to STANDARD for lowest price)
 * @param marketCode - Optional market code (defaults to Oakland/East Bay)
 * @returns PublicPriceRange object with formatted display values
 */
export async function getPublicPriceRange(
  sizeYd: number | null = null,
  serviceType: 'STANDARD' | 'HEAVY' = 'STANDARD',
  marketCode: string = DEFAULT_MARKET
): Promise<PublicPriceRange> {
  try {
    if (sizeYd) {
      // Get specific size price from market_size_pricing
      const { data } = await supabase
        .from('market_size_pricing')
        .select('base_price, size_yd, included_tons, included_days')
        .eq('market_code', marketCode)
        .eq('size_yd', sizeYd)
        .eq('tier', 'BASE')
        .eq('is_active', true)
        .single();
      
      if (data) {
        return {
          fromPrice: data.base_price,
          toPrice: null,
          sizeYd: data.size_yd,
          disclaimer: PRICING_DISCLAIMER,
          formattedRange: `From $${data.base_price}`,
          includedTons: data.included_tons,
          includedDays: data.included_days,
        };
      }
      
      // Fallback to dumpster_sizes if no market pricing
      const { data: fallbackData } = await supabase
        .from('dumpster_sizes')
        .select('base_price, size_value')
        .eq('size_value', sizeYd)
        .eq('is_active', true)
        .single();
      
      if (fallbackData) {
        return {
          fromPrice: fallbackData.base_price,
          toPrice: null,
          sizeYd: fallbackData.size_value,
          disclaimer: PRICING_DISCLAIMER,
          formattedRange: `From $${fallbackData.base_price}`,
        };
      }
    }
    
    // Get overall lowest and highest BASE tier prices
    const { data: marketPrices } = await supabase
      .from('market_size_pricing')
      .select('base_price')
      .eq('market_code', marketCode)
      .eq('tier', 'BASE')
      .eq('is_active', true)
      .order('base_price', { ascending: true });
    
    if (marketPrices && marketPrices.length > 0) {
      const fromPrice = marketPrices[0].base_price;
      const toPrice = marketPrices[marketPrices.length - 1].base_price;
      
      return {
        fromPrice,
        toPrice,
        sizeYd: null,
        disclaimer: PRICING_DISCLAIMER,
        formattedRange: sizeYd ? `From $${fromPrice}` : `$${fromPrice}–$${toPrice}`,
      };
    }
    
    // Fallback to dumpster_sizes
    const { data: lowestData } = await supabase
      .from('dumpster_sizes')
      .select('base_price')
      .eq('is_active', true)
      .order('base_price', { ascending: true })
      .limit(1);
    
    const { data: highestData } = await supabase
      .from('dumpster_sizes')
      .select('base_price')
      .eq('is_active', true)
      .order('base_price', { ascending: false })
      .limit(1);
    
    const fromPrice = lowestData?.[0]?.base_price || getSharedDataLowest();
    const toPrice = highestData?.[0]?.base_price || getSharedDataHighest();
    
    return {
      fromPrice,
      toPrice,
      sizeYd: null,
      disclaimer: PRICING_DISCLAIMER,
      formattedRange: sizeYd ? `From $${fromPrice}` : `$${fromPrice}–$${toPrice}`,
    };
  } catch {
    // Fallback to shared-data on error
    const fromPrice = getSharedDataLowest();
    const toPrice = getSharedDataHighest();
    
    return {
      fromPrice,
      toPrice,
      sizeYd,
      disclaimer: PRICING_DISCLAIMER,
      formattedRange: sizeYd ? `From $${fromPrice}` : `$${fromPrice}–$${toPrice}`,
    };
  }
}

/**
 * Synchronous helper for SSR/static pages using shared-data
 */
export function getPublicPriceRangeSync(sizeYd: number | null = null): PublicPriceRange {
  if (sizeYd) {
    const sizeData = DUMPSTER_SIZES_DATA.find(s => s.yards === sizeYd);
    if (sizeData) {
      return {
        fromPrice: sizeData.priceFrom,
        toPrice: null,
        sizeYd,
        disclaimer: PRICING_DISCLAIMER,
        formattedRange: `From $${sizeData.priceFrom}`,
        includedTons: sizeData.includedTons,
      };
    }
  }
  
  const fromPrice = getSharedDataLowest();
  const toPrice = getSharedDataHighest();
  
  return {
    fromPrice,
    toPrice,
    sizeYd: null,
    disclaimer: PRICING_DISCLAIMER,
    formattedRange: sizeYd ? `From $${fromPrice}` : `$${fromPrice}–$${toPrice}`,
  };
}

function getSharedDataLowest(): number {
  return Math.min(...DUMPSTER_SIZES_DATA.map(s => s.priceFrom));
}

function getSharedDataHighest(): number {
  return Math.max(...DUMPSTER_SIZES_DATA.map(s => s.priceFrom));
}

/**
 * Get base price for a specific size from shared-data (synchronous)
 */
export function getSizeBasePrice(sizeYd: number): number | null {
  const sizeData = DUMPSTER_SIZES_DATA.find(s => s.yards === sizeYd);
  return sizeData?.priceFrom || null;
}

/**
 * Get all size prices for a grid display (async - uses market pricing)
 */
export async function getAllSizePricesAsync(
  marketCode: string = DEFAULT_MARKET
): Promise<Array<{ yards: number; priceFrom: number; includedTons: number; includedDays: number }>> {
  const { data } = await supabase
    .from('market_size_pricing')
    .select('size_yd, base_price, included_tons, included_days')
    .eq('market_code', marketCode)
    .eq('tier', 'BASE')
    .eq('is_active', true)
    .order('size_yd');
  
  if (data && data.length > 0) {
    return data.map(d => ({
      yards: d.size_yd,
      priceFrom: d.base_price,
      includedTons: d.included_tons,
      includedDays: d.included_days,
    }));
  }
  
  // Fallback to shared-data
  return DUMPSTER_SIZES_DATA.map(s => ({
    yards: s.yards,
    priceFrom: s.priceFrom,
    includedTons: s.includedTons,
    includedDays: 7,
  }));
}

/**
 * Get all size prices for a grid display (sync - uses shared-data)
 */
export function getAllSizePrices(): Array<{ yards: number; priceFrom: number; includedTons: number }> {
  return DUMPSTER_SIZES_DATA.map(s => ({
    yards: s.yards,
    priceFrom: s.priceFrom,
    includedTons: s.includedTons,
  }));
}

/**
 * Get heavy material pricing for display
 */
export async function getHeavyMaterialPrices(
  marketCode: string = DEFAULT_MARKET
): Promise<Array<{ sizeYd: number; materialStream: string; price: number; maxTons: number }>> {
  const { data } = await supabase
    .from('heavy_material_rates')
    .select('size_yd, material_stream, base_price_flat, max_tons')
    .eq('market_code', marketCode)
    .eq('is_active', true)
    .order('size_yd')
    .order('material_stream');
  
  if (data) {
    return data.map(d => ({
      sizeYd: d.size_yd,
      materialStream: d.material_stream,
      price: d.base_price_flat,
      maxTons: d.max_tons,
    }));
  }
  
  return [];
}

/**
 * Constants for pricing rules (used across the app)
 */
export const PRICING_CONSTANTS = {
  EXTRA_TON_RATE: 165,
  OVERDUE_DAILY_RATE: 35,
  SAME_DAY_FEE: 75,
  INCLUDED_DAYS: 7,
  HEAVY_MAX_TONS: 10,
} as const;
