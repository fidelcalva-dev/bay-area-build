import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useServiceCatalog() {
  return useQuery({
    queryKey: ['service-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_catalog')
        .select('*')
        .eq('is_active', true)
        .order('service_name');
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30 * 60 * 1000,
  });
}
