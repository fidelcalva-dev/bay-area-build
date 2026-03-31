import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationEvent {
  id: string;
  event_type: string;
  lead_id: string | null;
  quote_id: string | null;
  customer_id: string | null;
  brand_origin: string | null;
  service_line: string | null;
  severity: 'info' | 'warning' | 'critical';
  requires_action: boolean;
  title: string;
  message: string | null;
  deep_link: string | null;
  payload_json: Record<string, unknown>;
  target_roles: string[];
  created_at: string;
}

export function useNotificationEvents(options?: {
  role?: string;
  limit?: number;
  severity?: string;
}) {
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from('notification_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(options?.limit || 50);

      if (options?.role) {
        query = query.contains('target_roles', [options.role]);
      }
      if (options?.severity) {
        query = query.eq('severity', options.severity);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching notification events:', err);
    } finally {
      setLoading(false);
    }
  }, [options?.role, options?.limit, options?.severity]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('notification-events-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notification_events' },
        (payload) => {
          const newEvent = payload.new as NotificationEvent;
          if (!options?.role || newEvent.target_roles?.includes(options.role)) {
            setEvents(prev => [newEvent, ...prev].slice(0, options?.limit || 50));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [options?.role, options?.limit]);

  return { events, loading, refetch: fetchEvents };
}
