// Database-Powered Pricing Data Hook
// Fetches pricing configuration from Supabase with fallback to constants

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DumpsterSize, MaterialType, Extra, RentalPeriod, UserType, PricingZone } from '../types';
import { 
  DUMPSTER_SIZES, 
  MATERIAL_TYPES, 
  EXTRAS, 
  RENTAL_PERIODS, 
  USER_TYPES,
  OVERAGE_COST_PER_TON,
  EXTRA_DAY_COST,
} from '../constants';

// Extended zone result with more details
export interface ZoneLookupResult {
  zoneId: string;
  zoneName: string;
  slug: string;
  cityName?: string;
  county?: string;
  multiplier: number;
  isActive: boolean;
}

export interface PricingDataState {
  zones: PricingZone[];
  sizes: DumpsterSize[];
  materials: MaterialType[];
  extras: Extra[];
  rentalPeriods: RentalPeriod[];
  userTypes: UserType[];
  overageCostPerTon: number;
  extraDayCost: number;
  isLoading: boolean;
  isUsingFallback: boolean;
  error: string | null;
}

/**
 * Fetches all pricing configuration from the database.
 * Falls back to hardcoded constants if database is empty or errors occur.
 */
export function usePricingData() {
  const [state, setState] = useState<PricingDataState>({
    zones: [],
    sizes: DUMPSTER_SIZES,
    materials: MATERIAL_TYPES,
    extras: EXTRAS,
    rentalPeriods: RENTAL_PERIODS,
    userTypes: USER_TYPES,
    overageCostPerTon: OVERAGE_COST_PER_TON,
    extraDayCost: EXTRA_DAY_COST,
    isLoading: true,
    isUsingFallback: true,
    error: null,
  });

  useEffect(() => {
    async function fetchPricingData() {
      try {
        // Fetch all pricing data in parallel
        const [
          sizesResult,
          materialsResult,
          extrasResult,
          periodsResult,
        ] = await Promise.all([
          supabase.from('dumpster_sizes').select('*').eq('is_active', true).order('display_order'),
          supabase.from('material_types').select('*').eq('is_active', true).order('display_order'),
          supabase.from('pricing_extras').select('*').eq('is_active', true).order('display_order'),
          supabase.from('rental_periods').select('*').eq('is_active', true).order('display_order'),
        ]);

        // Transform database records to our types
        const dbSizes: DumpsterSize[] = sizesResult.data?.length
          ? sizesResult.data.map((s) => ({
              id: s.id,
              value: s.size_value,
              label: s.label,
              basePrice: s.base_price,
              includedTons: s.included_tons,
              description: s.description || '',
              dimensions: s.dimensions || '',
              isHeavyOnly: s.is_heavy_only,
              popular: s.display_order === 2, // 20yd is typically popular
            }))
          : DUMPSTER_SIZES;

        const dbMaterials: MaterialType[] = materialsResult.data?.length
          ? materialsResult.data.map((m) => ({
              value: m.value as 'general' | 'heavy',
              label: m.label,
              icon: m.icon || (m.value === 'heavy' ? '🪨' : '🏠'),
              description: m.description || '',
              priceAdjustment: m.price_adjustment,
              allowedSizes: m.allowed_sizes || [],
            }))
          : MATERIAL_TYPES;

        const dbExtras: Extra[] = extrasResult.data?.length
          ? extrasResult.data.map((e) => ({
              id: e.id,
              value: e.value,
              label: e.label,
              description: e.description || '',
              price: e.price,
              icon: e.icon || '📦',
              allowQuantity: e.value.includes('days') || e.value.includes('tons') || e.value === 'mattress' || e.value === 'appliance',
              maxQuantity: e.value.includes('days') ? 14 : e.value.includes('tons') ? 5 : 4,
            }))
          : EXTRAS;

        const dbPeriods: RentalPeriod[] = periodsResult.data?.length
          ? periodsResult.data.map((p) => ({
              value: p.days,
              label: p.label,
              extraDays: p.days > 7 ? p.days - 7 : 0,
              extraCost: p.extra_cost,
              popular: p.is_default,
            }))
          : RENTAL_PERIODS;

        const hasDbData = 
          (sizesResult.data?.length || 0) > 0 ||
          (materialsResult.data?.length || 0) > 0 ||
          (extrasResult.data?.length || 0) > 0 ||
          (periodsResult.data?.length || 0) > 0;

        setState((prev) => ({
          ...prev,
          sizes: dbSizes,
          materials: dbMaterials,
          extras: dbExtras,
          rentalPeriods: dbPeriods,
          isLoading: false,
          isUsingFallback: !hasDbData,
          error: null,
        }));
      } catch (err) {
        console.error('Failed to fetch pricing data:', err);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isUsingFallback: true,
          error: 'Failed to load pricing data',
        }));
      }
    }

    fetchPricingData();
  }, []);

  return state;
}

/**
 * Looks up zone information for a given ZIP code from the database.
 * Returns null if ZIP is not in service area.
 */
export function useZoneLookup(zip: string) {
  const [zoneResult, setZoneResult] = useState<ZoneLookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupZone = useCallback(async (zipCode: string) => {
    if (zipCode.length !== 5) {
      setZoneResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('zone_zip_codes')
        .select(`
          zone_id,
          zip_code,
          city_name,
          county,
          zone:pricing_zones!inner(
            id, 
            name, 
            slug,
            base_multiplier, 
            is_active
          )
        `)
        .eq('zip_code', zipCode)
        .maybeSingle();

      if (queryError) {
        console.error('Zone lookup error:', queryError);
        setError('Failed to lookup ZIP code');
        setZoneResult(null);
        return;
      }

      if (!data || !(data.zone as any)?.is_active) {
        setZoneResult(null);
        return;
      }

      const zone = data.zone as any;
      setZoneResult({
        zoneId: data.zone_id,
        zoneName: zone.name,
        slug: zone.slug,
        cityName: data.city_name || undefined,
        county: data.county || undefined,
        multiplier: Number(zone.base_multiplier),
        isActive: zone.is_active,
      });
    } catch (err) {
      console.error('Zone lookup exception:', err);
      setError('Failed to lookup ZIP code');
      setZoneResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (zip.length === 5) {
      lookupZone(zip);
    } else {
      setZoneResult(null);
      setError(null);
    }
  }, [zip, lookupZone]);

  return { zoneResult, isLoading, error, refetch: () => lookupZone(zip) };
}

/**
 * Get zone-specific pricing override for a size if available.
 */
export async function getZonePricing(zoneId: string, sizeId: string): Promise<{
  priceOverride: number | null;
  isAvailable: boolean;
} | null> {
  try {
    const { data, error } = await supabase
      .from('zone_pricing')
      .select('price_override, is_available')
      .eq('zone_id', zoneId)
      .eq('size_id', sizeId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      priceOverride: data.price_override,
      isAvailable: data.is_available,
    };
  } catch {
    return null;
  }
}

/**
 * Calculate included tons based on size.
 * Official included tonnage: 6yd=0.5T, 8yd=0.5T, 10yd=1T, 20yd=2T, 30yd=3T, 40yd=4T, 50yd=5T
 * Same tonnage for both general debris and heavy materials.
 */
export function calculateIncludedTons(sizeValue: number, materialType: 'general' | 'heavy'): number {
  // Official tonnage by size (same for all material types)
  const tonsBySize: Record<number, number> = {
    6: 0.5,
    8: 0.5,
    10: 1,
    20: 2,
    30: 3,
    40: 4,
    50: 5,
  };

  return tonsBySize[sizeValue] || 0.5;
}

/**
 * Get the database ID for a dumpster size by its value.
 */
export async function getSizeDbId(sizeValue: number): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('dumpster_sizes')
      .select('id')
      .eq('size_value', sizeValue)
      .eq('is_active', true)
      .maybeSingle();

    return data?.id || null;
  } catch {
    return null;
  }
}
