/**
 * Generic tenant-scoped data hooks for CRUD operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

const TENANT_TABLES = [
  'tenant_customers',
  'tenant_quotes',
  'tenant_jobs',
  'tenant_invoices',
  'tenant_payments',
  'tenant_tasks',
  'tenant_documents',
  'tenant_timeline_events',
] as const;

type TenantTable = (typeof TENANT_TABLES)[number];

export function useTenantQuery(
  table: TenantTable,
  options?: {
    select?: string;
    filters?: Record<string, string>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: [table, tenantId, options?.filters],
    queryFn: async () => {
      if (!tenantId) return [];
      // Use any to avoid deep type instantiation with dynamic table names
      const baseQuery = (supabase.from as any)(table).select(options?.select ?? '*').eq('tenant_id', tenantId);

      let query = baseQuery;
      if (options?.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          query = query.eq(key, value);
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
      return data ?? [];
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
        .insert({ ...row, tenant_id: tenantId } as never)
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
