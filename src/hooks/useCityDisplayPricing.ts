/**
 * React hook for city display pricing.
 * Fetches dynamic pricing for a city slug from the pricing engine.
 */
import { useQuery } from '@tanstack/react-query';
import { getCityDisplayPricing, type CityDisplayPricing } from '@/lib/cityDisplayPricing';

export function useCityDisplayPricing(citySlug: string | undefined) {
  return useQuery<CityDisplayPricing | null>({
    queryKey: ['city-display-pricing', citySlug],
    queryFn: () => getCityDisplayPricing(citySlug!),
    enabled: !!citySlug,
    staleTime: 15 * 60 * 1000, // 15 min
    gcTime: 30 * 60 * 1000,
  });
}
