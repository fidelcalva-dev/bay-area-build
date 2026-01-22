import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Alert {
  id: string;
  alert_type: string;
  entity_type: string;
  entity_id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface Recommendation {
  id: string;
  rec_type: string;
  entity_type: string;
  entity_id: string;
  context: Record<string, unknown>;
  title: string;
  description: string | null;
  action_label: string | null;
  action_data: Record<string, unknown>;
  shown_at: string | null;
  accepted: boolean | null;
  accepted_at: string | null;
  dismissed_at: string | null;
  created_at: string;
}

export function useAlerts(filters?: { severity?: string; alertType?: string; resolved?: boolean }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.alertType) {
        query = query.eq('alert_type', filters.alertType);
      }
      if (filters?.resolved !== undefined) {
        query = query.eq('is_resolved', filters.resolved);
      }

      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      setAlerts(data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [filters?.severity, filters?.alertType, filters?.resolved]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const markAsRead = useCallback(async (alertId: string) => {
    const { error } = await (supabase as any)
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (!error) {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string) => {
    const { error } = await (supabase as any)
      .from('alerts')
      .update({ 
        is_resolved: true, 
        resolved_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (!error) {
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, is_resolved: true, resolved_at: new Date().toISOString() } : a
      ));
    }
  }, []);

  const unreadCount = alerts.filter(a => !a.is_read && !a.is_resolved).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.is_resolved).length;

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
    markAsRead,
    resolveAlert,
    unreadCount,
    criticalCount,
  };
}

export function useRecommendations(filters?: { recType?: string; entityType?: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from('recommendations')
        .select('*')
        .is('accepted', null)
        .is('dismissed_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filters?.recType) {
        query = query.eq('rec_type', filters.recType);
      }
      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      setRecommendations(data || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [filters?.recType, filters?.entityType]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const acceptRecommendation = useCallback(async (recId: string) => {
    const { error } = await (supabase as any)
      .from('recommendations')
      .update({ 
        accepted: true, 
        accepted_at: new Date().toISOString(),
      })
      .eq('id', recId);

    if (!error) {
      setRecommendations(prev => prev.filter(r => r.id !== recId));
    }
    return !error;
  }, []);

  const dismissRecommendation = useCallback(async (recId: string) => {
    const { error } = await (supabase as any)
      .from('recommendations')
      .update({ 
        dismissed_at: new Date().toISOString(),
      })
      .eq('id', recId);

    if (!error) {
      setRecommendations(prev => prev.filter(r => r.id !== recId));
    }
    return !error;
  }, []);

  const markAsShown = useCallback(async (recId: string) => {
    await (supabase as any)
      .from('recommendations')
      .update({ shown_at: new Date().toISOString() })
      .eq('id', recId)
      .is('shown_at', null);
  }, []);

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
    acceptRecommendation,
    dismissRecommendation,
    markAsShown,
  };
}
