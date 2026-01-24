import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FraudFlag, FraudSeverity, FraudStatus } from '@/lib/fraudService';

export interface FraudFilters {
  status?: FraudStatus | 'all';
  severity?: FraudSeverity | 'all';
  days?: number;
}

export function useFraudFlags(filters?: FraudFilters) {
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let queryBuilder = supabase
        .from('fraud_flags' as 'orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        queryBuilder = queryBuilder.eq('status' as 'id', filters.status);
      }

      if (filters?.severity && filters.severity !== 'all') {
        queryBuilder = queryBuilder.eq('severity' as 'id', filters.severity);
      }

      if (filters?.days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - filters.days);
        queryBuilder = queryBuilder.gte('created_at' as 'id', cutoff.toISOString());
      }

      const { data, error: queryError } = await queryBuilder.limit(100);

      if (queryError) throw queryError;

      setFlags((data as unknown as FraudFlag[]) || []);
    } catch (err) {
      console.error('Failed to fetch fraud flags:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.severity, filters?.days]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const stats = {
    total: flags.length,
    open: flags.filter(f => f.status === 'open').length,
    high: flags.filter(f => f.severity === 'high' && f.status === 'open').length,
    medium: flags.filter(f => f.severity === 'medium' && f.status === 'open').length,
    low: flags.filter(f => f.severity === 'low' && f.status === 'open').length,
  };

  return {
    flags,
    loading,
    error,
    refetch: fetchFlags,
    stats,
  };
}

export function useFraudFlagActions(flagId: string) {
  const [actions, setActions] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActions = async () => {
      const { data } = await supabase
        .from('fraud_actions' as 'orders')
        .select('*')
        .eq('flag_id' as 'id', flagId)
        .order('created_at', { ascending: false });

      setActions((data as unknown[]) || []);
      setLoading(false);
    };

    if (flagId) fetchActions();
  }, [flagId]);

  return { actions, loading };
}
