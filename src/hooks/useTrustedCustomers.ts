import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TrustedCustomer {
  id: string;
  customer_id: string | null;
  phone: string | null;
  reason: string;
  added_by: string | null;
  created_at: string;
  status: 'active' | 'inactive';
}

export function useTrustedCustomers() {
  const [customers, setCustomers] = useState<TrustedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('trusted_customers' as 'orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setCustomers((data as unknown as TrustedCustomer[]) || []);
    } catch (err) {
      console.error('Failed to fetch trusted customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
  };

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    stats,
  };
}

export function useRiskScoreEvents(phone?: string, customerId?: string) {
  const [events, setEvents] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!phone && !customerId) {
        setEvents([]);
        setLoading(false);
        return;
      }

      let queryBuilder = supabase
        .from('risk_score_events' as 'orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (phone) {
        queryBuilder = queryBuilder.eq('phone' as 'id', phone);
      } else if (customerId) {
        queryBuilder = queryBuilder.eq('customer_id' as 'id', customerId);
      }

      const { data } = await queryBuilder;
      setEvents(data || []);
      setLoading(false);
    };

    fetchEvents();
  }, [phone, customerId]);

  return { events, loading };
}
