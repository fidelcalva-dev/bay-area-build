import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeadChannel {
  id: string;
  channel_key: string;
  display_name: string;
  icon: string;
  description: string;
  is_active: boolean;
}

export interface Lead {
  id: string;
  channel_key: string | null;
  source_key: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  company_name: string | null;
  city: string | null;
  zip: string | null;
  lead_status: string | null;
  assignment_type: string | null;
  assigned_to: string | null;
  customer_type_detected: string | null;
  project_category: string | null;
  urgency_score: number | null;
  message_excerpt: string | null;
  consent_status: string | null;
  is_existing_customer: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface LeadFilters {
  channel_key?: string;
  status?: string;
  assignment_type?: string;
  urgency_min?: number;
  date_start?: string;
  date_end?: string;
  search?: string;
}

export function useLeadChannels() {
  const [channels, setChannels] = useState<LeadChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChannels() {
      const { data, error } = await supabase
        .from('lead_channels')
        .select('*')
        .order('display_name');

      if (!error && data) {
        setChannels(data as LeadChannel[]);
      }
      setLoading(false);
    }
    fetchChannels();
  }, []);

  return { channels, loading };
}

export function useLeads(filters: LeadFilters = {}, team?: 'sales' | 'cs' | 'all') {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      
      let query = supabase
        .from('sales_leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Team filter
      if (team && team !== 'all') {
        query = query.eq('assignment_type', team);
      }

      // Apply filters
      if (filters.channel_key) {
        query = query.eq('channel_key', filters.channel_key);
      }
      if (filters.status) {
        query = query.eq('lead_status', filters.status);
      }
      if (filters.assignment_type) {
        query = query.eq('assignment_type', filters.assignment_type);
      }
      if (filters.urgency_min) {
        query = query.gte('urgency_score', filters.urgency_min);
      }
      if (filters.date_start) {
        query = query.gte('created_at', filters.date_start);
      }
      if (filters.date_end) {
        query = query.lte('created_at', filters.date_end);
      }
      if (filters.search) {
        query = query.or(
          `customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,city.ilike.%${filters.search}%`
        );
      }

      const { data, error, count } = await query.limit(100);

      if (!error && data) {
        setLeads(data as Lead[]);
        setTotalCount(count || 0);
      }
      setLoading(false);
    }

    fetchLeads();

    // Set up realtime subscription
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales_leads' },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters, team]);

  return { leads, loading, totalCount };
}

export function useLeadStats(team?: 'sales' | 'cs' | 'all') {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    booked: 0,
    lost: 0,
    byChannel: {} as Record<string, number>,
    avgUrgency: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      let query = supabase.from('sales_leads').select('lead_status, channel_key, urgency_score');
      
      if (team && team !== 'all') {
        query = query.eq('assignment_type', team);
      }

      const { data } = await query;

      if (data) {
        const total = data.length;
        const statusCounts = data.reduce((acc, lead) => {
          const status = lead.lead_status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const channelCounts = data.reduce((acc, lead) => {
          const channel = lead.channel_key || 'unknown';
          acc[channel] = (acc[channel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const totalUrgency = data.reduce((sum, lead) => sum + (lead.urgency_score || 50), 0);

        setStats({
          total,
          new: statusCounts['new'] || 0,
          contacted: statusCounts['contacted'] || 0,
          qualified: statusCounts['qualified'] || 0,
          booked: statusCounts['booked'] || 0,
          lost: statusCounts['lost'] || 0,
          byChannel: channelCounts,
          avgUrgency: total > 0 ? Math.round(totalUrgency / total) : 0,
        });
      }
      setLoading(false);
    }

    fetchStats();
  }, [team]);

  return { stats, loading };
}

export async function updateLeadStatus(leadId: string, status: string, notes?: string) {
  const { data, error } = await supabase.rpc('update_lead_status', {
    p_lead_id: leadId,
    p_status: status,
    p_notes: notes || null,
  });
  return { success: !error, error };
}

export async function assignLead(leadId: string, userId: string) {
  const { error } = await supabase
    .from('sales_leads')
    .update({ assigned_to: userId, assigned_at: new Date().toISOString() })
    .eq('id', leadId);

  if (!error) {
    await supabase.from('lead_events').insert({
      lead_id: leadId,
      event_type: 'ASSIGNED',
      payload_json: { assigned_to: userId, method: 'manual' },
    });
  }

  return { success: !error, error };
}
