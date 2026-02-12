// Hook to fetch active locations from seo_locations_registry
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LocationEntry {
  id: string;
  city_name: string;
  slug: string;
  priority: number;
  is_active: boolean;
  anchor_variants: string[];
  page_exists: boolean;
}

export function useLocationRegistry() {
  return useQuery({
    queryKey: ['seo-locations-registry'],
    queryFn: async (): Promise<LocationEntry[]> => {
      const { data, error } = await supabase
        .from('seo_locations_registry')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });
      if (error) throw error;
      return (data ?? []) as LocationEntry[];
    },
    staleTime: 1000 * 60 * 30, // 30 min cache — rarely changes
  });
}
