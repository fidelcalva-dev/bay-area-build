/**
 * Public Pricing Helper
 * 
 * Provides consistent price ranges for public-facing pages.
 * Exact pricing comes from the ZIP-based calculator only.
 * 
 * Public pages show:
 * - "From $X" for the lowest base price
 * - "$X–$Y" for size-specific ranges
 * - Always with disclaimer about exact ZIP-based pricing
 */

import { supabase } from '@/integrations/supabase/client';
import { DUMPSTER_SIZES_DATA } from './shared-data';

/**
 * Price range result for public display
 */
export interface PublicPriceRange {
  fromPrice: number;
  toPrice: number | null;
  sizeYd: number | null;
  disclaimer: string;
  formattedRange: string;
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
 * Uses BASE tier pricing as the "From" price
 * 
 * @param sizeYd - Optional size to get specific price, or null for overall lowest
 * @param serviceType - Optional: 'STANDARD' | 'HEAVY' (defaults to STANDARD for lowest price)
 * @returns PublicPriceRange object with formatted display values
 */
export async function getPublicPriceRange(
  sizeYd: number | null = null,
  serviceType: 'STANDARD' | 'HEAVY' = 'STANDARD'
): Promise<PublicPriceRange> {
  try {
    if (sizeYd) {
      // Get specific size price
      const { data } = await supabase
        .from('dumpster_sizes')
        .select('base_price, size_value')
        .eq('size_value', sizeYd)
        .eq('is_active', true)
        .single();
      
      if (data) {
        return {
          fromPrice: data.base_price,
          toPrice: null,
          sizeYd: data.size_value,
          disclaimer: PRICING_DISCLAIMER,
          formattedRange: `From $${data.base_price}`,
        };
      }
    }
    
    // Get overall lowest price
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
 * Get all size prices for a grid display
 */
export function getAllSizePrices(): Array<{ yards: number; priceFrom: number; includedTons: number }> {
  return DUMPSTER_SIZES_DATA.map(s => ({
    yards: s.yards,
    priceFrom: s.priceFrom,
    includedTons: s.includedTons,
  }));
}
