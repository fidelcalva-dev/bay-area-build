/**
 * React hooks for consuming the canonical public pricing catalog.
 * Website pages should use these hooks instead of importing DUMPSTER_SIZES_DATA directly.
 */
import { useQuery } from '@tanstack/react-query';
import {
  fetchPublicGeneralPrices,
  fetchPublicHeavyPrices,
  getPublicStartingPrice,
  type PublicGeneralPrice,
  type PublicHeavyPrice,
} from '@/lib/publicPricingService';

// ── General Debris Prices ───────────────────────────────────
export function usePublicGeneralPrices(marketCode = 'default') {
  return useQuery<PublicGeneralPrice[]>({
    queryKey: ['public-general-prices', marketCode],
    queryFn: () => fetchPublicGeneralPrices(marketCode),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// ── Heavy Material Prices ───────────────────────────────────
export function usePublicHeavyPrices(marketCode = 'default') {
  return useQuery<PublicHeavyPrice[]>({
    queryKey: ['public-heavy-prices', marketCode],
    queryFn: () => fetchPublicHeavyPrices(marketCode),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// ── Starting Price ──────────────────────────────────────────
export function usePublicStartingPrice(marketCode = 'default') {
  return useQuery<number>({
    queryKey: ['public-starting-price', marketCode],
    queryFn: () => getPublicStartingPrice(marketCode),
    staleTime: 15 * 60 * 1000,
  });
}
