import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LocationConfigRow {
  id: string;
  location_id: string;
  name: string;
  location_type: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  address: string | null;
  is_active_for_quotes: boolean;
  is_active_for_dispatch: boolean;
  is_visible_publicly: boolean;
  nearest_fallback_yard_id: string | null;
  service_radius_miles: number;
  market_type: string;
  priority_rank: number;
}

const QUERY_KEY = ['location-configs'];

export function useLocationConfigs() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<LocationConfigRow[]> => {
      const { data, error } = await supabase
        .from('location_configs')
        .select('*')
        .order('priority_rank', { ascending: true });
      if (error) throw error;
      return (data ?? []) as LocationConfigRow[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

/** Active yards for quote pricing */
export function useActiveQuoteYards() {
  const { data, ...rest } = useLocationConfigs();
  return {
    ...rest,
    data: (data ?? []).filter(l => l.location_type === 'YARD' && l.is_active_for_quotes),
  };
}

/** Active yards for dispatch */
export function useActiveDispatchYards() {
  const { data, ...rest } = useLocationConfigs();
  return {
    ...rest,
    data: (data ?? []).filter(l => l.location_type === 'YARD' && l.is_active_for_dispatch),
  };
}

/** Publicly visible locations */
export function usePublicLocations() {
  const { data, ...rest } = useLocationConfigs();
  return {
    ...rest,
    data: (data ?? []).filter(l => l.is_visible_publicly),
  };
}

/** Get nearest active yard by coordinates */
export function getNearestActiveYardFromList(
  yards: LocationConfigRow[],
  lat: number,
  lng: number
): LocationConfigRow | null {
  if (yards.length === 0) return null;
  let nearest = yards[0];
  let minDist = Infinity;
  for (const yard of yards) {
    const dist = Math.sqrt(Math.pow(yard.lat - lat, 2) + Math.pow(yard.lng - lng, 2));
    if (dist < minDist) {
      minDist = dist;
      nearest = yard;
    }
  }
  return nearest;
}

export function useSaveLocationConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (config: Partial<LocationConfigRow> & { id: string }) => {
      const { id, ...updates } = config;
      const { error } = await supabase
        .from('location_configs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: 'Location config updated' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error saving', description: err.message, variant: 'destructive' });
    },
  });
}
