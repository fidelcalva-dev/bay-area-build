/**
 * Generic tenant-scoped data hooks for CRUD operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

type TenantTable = 'tenant_customers' | 'tenant_quotes' | 'tenant_jobs' | 'tenant_invoices' | 'tenant_payments' | 'tenant_tasks' | 'tenant_documents' | 'tenant_timeline_events';

export function useTenantQuery<T = unknown>(
  table: TenantTable,
  options?: {
    select?: string;
    filters?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  const { tenantId } = useTenant();

  return useQuery<T[]>({
    queryKey: [table, tenantId, options?.filters],
    queryFn: async () => {
      if (!tenantId) return [];
      let query = supabase
        .from(table)
        .select(options?.select ?? '*')
        .eq('tenant_id', tenantId);

      if (options?.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          query = query.eq(key, value as string);
        }
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as T[];
    },
    enabled: !!tenantId,
  });
}

export function useTenantInsert(table: TenantTable) {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      if (!tenantId) throw new Error('No active tenant');
      const { data, error } = await supabase
        .from(table)
        .insert({ ...row, tenant_id: tenantId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table, tenantId] });
    },
  });
}
