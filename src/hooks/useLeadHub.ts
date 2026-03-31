import { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================
// BACKWARD-COMPATIBLE EXPORTS for legacy consumers
// (AdminLeadsHub, CSLeadInbox)
// ============================================================

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
    async function fetch() {
      const { data, error } = await supabase.from('lead_channels').select('*').order('display_name');
      if (!error && data) setChannels(data as LeadChannel[]);
      setLoading(false);
    }
    fetch();
  }, []);
  return { channels, loading };
}

export function useLeads(filters: LeadFilters = {}, team?: 'sales' | 'cs' | 'all') {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  useEffect(() => {
    async function fetch() {
      setLoading(true);
      let query = supabase.from('sales_leads').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      if (team && team !== 'all') query = query.eq('assignment_type', team);
      if (filters.channel_key) query = query.eq('channel_key', filters.channel_key);
      if (filters.status) query = query.eq('lead_status', filters.status);
      if (filters.search) {
        query = query.or(`customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }
      const { data, error, count } = await query.limit(100);
      if (!error && data) { setLeads(data as Lead[]); setTotalCount(count || 0); }
      setLoading(false);
    }
    fetch();
  }, [filters, team]);
  return { leads, loading, totalCount };
}

export function useLeadStats(team?: 'sales' | 'cs' | 'all') {
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, qualified: 0, booked: 0, lost: 0, byChannel: {} as Record<string, number>, avgUrgency: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetch() {
      let query = supabase.from('sales_leads').select('lead_status, channel_key, urgency_score');
      if (team && team !== 'all') query = query.eq('assignment_type', team);
      const { data } = await query;
      if (data) {
        const total = data.length;
        const sc = data.reduce((a, l) => { const s = l.lead_status || 'unknown'; a[s] = (a[s] || 0) + 1; return a; }, {} as Record<string, number>);
        const cc = data.reduce((a, l) => { const c = l.channel_key || 'unknown'; a[c] = (a[c] || 0) + 1; return a; }, {} as Record<string, number>);
        const tu = data.reduce((s, l) => s + (l.urgency_score || 50), 0);
        setStats({ total, new: sc['new'] || 0, contacted: sc['contacted'] || 0, qualified: sc['qualified'] || 0, booked: sc['booked'] || 0, lost: sc['lost'] || 0, byChannel: cc, avgUrgency: total > 0 ? Math.round(tu / total) : 0 });
      }
      setLoading(false);
    }
    fetch();
  }, [team]);
  return { stats, loading };
}

// ============================================================
// END BACKWARD-COMPATIBLE EXPORTS
// ============================================================
import { supabase } from '@/integrations/supabase/client';

export interface LeadHubLead {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  company_name: string | null;
  source_key: string | null;
  channel_key: string | null;
  lead_source: string | null;
  source_channel: string | null;
  source_page: string | null;
  source_module: string | null;
  lead_status: string;
  lead_quality_score: number | null;
  lead_risk_score: number | null;
  lead_quality_label: string | null;
  assignment_type: string | null;
  assigned_to: string | null;
  owner_user_id: string | null;
  city: string | null;
  zip: string | null;
  customer_type_detected: string | null;
  project_category: string | null;
  material_category: string | null;
  urgency_score: number | null;
  message_excerpt: string | null;
  consent_status: string | null;
  is_existing_customer: boolean | null;
  first_response_at: string | null;
  first_response_sent_at: string | null;
  first_contact_at: string | null;
  last_activity_at: string | null;
  last_contacted_at: string | null;
  last_followup_at: string | null;
  followup_count: number | null;
  sla_minutes: number | null;
  sla_due_at: string | null;
  escalation_level: number | null;
  is_sla_breached: boolean | null;
  // Enrichment fields
  next_best_action: string | null;
  last_step_completed: string | null;
  selected_size: number | null;
  quote_amount: number | null;
  quote_amount_high: number | null;
  delivery_preference: string | null;
  ai_conversation_summary: string | null;
  latest_recommended_size: number | null;
  latest_heavy_flag: boolean | null;
  // Service line fields
  service_line: string | null;
  cleanup_service_type: string | null;
  contractor_flag: boolean | null;
  recurring_service_flag: boolean | null;
  bundle_opportunity_flag: boolean | null;
  photos_uploaded_flag: boolean | null;
  needs_site_visit: boolean | null;
  // Brand
  brand: string | null;
  lead_intent: string | null;
}

export type LeadHubTab = 
  | 'new' 
  | 'needs_followup' 
  | 'active' 
  | 'high_intent' 
  | 'existing_customer' 
  | 'high_risk' 
  | 'my_leads'
  | 'cleanup'
  | 'contractor'
  | 'bundle'
  | 'ai_chat'
  | 'contact_form'
  | 'all';

export interface LeadHubFilters {
  tab: LeadHubTab;
  search?: string;
  source?: string;
  quality?: string;
  serviceLine?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useLeadHub(filters: LeadHubFilters) {
  const [leads, setLeads] = useState<LeadHubLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('sales_leads')
        .select('id, created_at, updated_at, customer_name, customer_phone, customer_email, company_name, source_key, channel_key, lead_source, source_channel, source_page, source_module, lead_status, lead_quality_score, lead_risk_score, lead_quality_label, assignment_type, assigned_to, owner_user_id, city, zip, customer_type_detected, project_category, material_category, urgency_score, message_excerpt, consent_status, is_existing_customer, first_response_at, first_response_sent_at, first_contact_at, last_activity_at, last_contacted_at, last_followup_at, followup_count, sla_minutes, sla_due_at, escalation_level, is_sla_breached, next_best_action, last_step_completed, selected_size, quote_amount, quote_amount_high, delivery_preference, ai_conversation_summary, latest_recommended_size, latest_heavy_flag, service_line, cleanup_service_type, contractor_flag, recurring_service_flag, bundle_opportunity_flag, photos_uploaded_flag, needs_site_visit, brand, lead_intent', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(500);

      // Tab-based filters
      switch (filters.tab) {
        case 'new':
          query = query.eq('lead_status', 'new');
          break;
        case 'needs_followup':
          query = query.in('lead_status', ['contacted', 'qualified', 'quoted']);
          break;
        case 'active':
          query = query.in('lead_status', ['contacted', 'qualified', 'quoted']);
          break;
        case 'high_intent':
          query = query.gte('urgency_score', 70);
          break;
        case 'existing_customer':
          query = query.eq('is_existing_customer', true);
          break;
        case 'high_risk':
          query = query.eq('lead_quality_label', 'RED');
          break;
        case 'cleanup':
          query = query.in('service_line', ['CLEANUP', 'BOTH']);
          break;
        case 'contractor':
          query = query.eq('contractor_flag', true);
          break;
        case 'bundle':
          query = query.or('service_line.eq.BOTH,bundle_opportunity_flag.eq.true');
          break;
        // 'my_leads' is filtered client-side after fetch (needs auth.uid)
      }

      if (filters.source) {
        query = query.or(`channel_key.eq.${filters.source},source_key.eq.${filters.source}`);
      }
      if (filters.quality) {
        query = query.eq('lead_quality_label', filters.quality);
      }
      if (filters.serviceLine) {
        query = query.eq('service_line', filters.serviceLine);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59');
      }

      const { data, error, count } = await query;
      if (error) throw error;

      let filtered = (data || []) as LeadHubLead[];

      // Client-side search
      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(l =>
          l.customer_name?.toLowerCase().includes(s) ||
          l.customer_phone?.includes(filters.search!) ||
          l.customer_email?.toLowerCase().includes(s) ||
          l.company_name?.toLowerCase().includes(s) ||
          l.city?.toLowerCase().includes(s) ||
          l.zip?.includes(filters.search!)
        );
      }

      setLeads(filtered);
      setTotalCount(count || filtered.length);
    } catch (err) {
      console.error('Lead Hub fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('lead-hub-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_leads' }, () => {
        fetchLeads();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchLeads]);

  // Compute tab counts from all leads (for badge display)
  const tabCounts = useMemo(() => {
    // We only have current tab's data, so return totalCount for current tab
    return { current: totalCount };
  }, [totalCount]);

  return { leads, loading, totalCount, tabCounts, refetch: fetchLeads };
}

export function useLeadHubStats() {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    needsFollowup: 0,
    highIntent: 0,
    existingCustomer: 0,
    highRisk: 0,
    quotesPending: 0,
    jobsScheduled: 0,
    converted: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Fetch leads + quotes in parallel
      const [leadsRes, quotesRes, ordersRes] = await Promise.all([
        supabase
          .from('sales_leads')
          .select('lead_status, lead_quality_label, lead_quality_score, urgency_score, is_existing_customer'),
        supabase
          .from('quotes')
          .select('id, status')
          .in('status', ['draft', 'sent', 'viewed']),
        supabase
          .from('orders')
          .select('id, status')
          .in('status', ['confirmed', 'scheduled']),
      ]);

      const data = leadsRes.data || [];
      const total = data.length;
      const converted = data.filter(l => l.lead_status === 'converted').length;

      setStats({
        total,
        new: data.filter(l => l.lead_status === 'new').length,
        needsFollowup: data.filter(l => ['contacted', 'qualified', 'quoted'].includes(l.lead_status)).length,
        highIntent: data.filter(l => (l.urgency_score || 0) >= 70 || (l.lead_quality_score || 0) >= 75).length,
        existingCustomer: data.filter(l => l.is_existing_customer).length,
        highRisk: data.filter(l => l.lead_quality_label === 'RED').length,
        quotesPending: quotesRes.data?.length || 0,
        jobsScheduled: ordersRes.data?.length || 0,
        converted,
        conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
      });

      setLoading(false);
    }
    fetchStats();
  }, []);

  return { stats, loading };
}

export async function updateLeadStatus(leadId: string, status: string, notes?: string) {
  const { error } = await supabase
    .from('sales_leads')
    .update({ lead_status: status, updated_at: new Date().toISOString() })
    .eq('id', leadId);

  if (!error) {
    await supabase.from('lead_events').insert({
      lead_id: leadId,
      event_type: `STATUS_CHANGED_TO_${status.toUpperCase()}`,
      payload_json: { new_status: status, notes },
    });
  }
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
