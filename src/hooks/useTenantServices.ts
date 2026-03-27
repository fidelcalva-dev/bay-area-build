import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export function useTenantServices() {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['tenant-services', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('tenant_services')
        .select('*, service_catalog:service_code(*)')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}
