/**
 * Hook that provides DumpsterSizeData[] from the public pricing catalog.
 * Drop-in replacement for direct DUMPSTER_SIZES_DATA imports in website pages.
 * Falls back to the static config if the DB query hasn't resolved yet.
 */
import { useMemo } from 'react';
import { usePublicGeneralPrices } from './usePublicPricing';
import { DUMPSTER_SIZES_DATA, type DumpsterSizeData } from '@/lib/shared-data';

export function useDumpsterSizes(marketCode = 'default') {
  const { data: publicPrices, isLoading } = usePublicGeneralPrices(marketCode);

  const sizes: DumpsterSizeData[] = useMemo(() => {
    if (!publicPrices || publicPrices.length === 0) return DUMPSTER_SIZES_DATA;

    // Merge public prices into the static size metadata
    return DUMPSTER_SIZES_DATA.map(size => {
      const pub = publicPrices.find(p => p.size_yd === size.yards);
      if (!pub) return size;
      return {
        ...size,
        priceFrom: pub.price,
        includedTons: pub.includedTons,
      };
    });
  }, [publicPrices]);

  return { sizes, isLoading };
}
