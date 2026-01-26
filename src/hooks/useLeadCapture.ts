import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  company_name: string | null;
  source_key: string | null;
  lead_source: string | null;
  lead_status: string;
  assignment_type: string | null;
  assigned_to: string | null;
  city: string | null;
  zip: string | null;
  customer_type_detected: string | null;
  project_category: string | null;
  urgency_score: number | null;
  consent_status: string | null;
  notes: string | null;
  quote_id: string | null;
  first_response_sent_at: string | null;
  is_existing_customer: boolean | null;
}

export interface LeadSource {
  source_key: string;
  display_name: string;
  description: string | null;
  icon_name: string | null;
  is_active: boolean;
  is_automated: boolean;
}

export interface LeadFilters {
  status?: string;
  source_key?: string;
  assigned_team?: string;
  customer_type?: string;
  date_start?: string;
  date_end?: string;
  search?: string;
}

export function useLeadCapture(filters: LeadFilters = {}) {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
  });

  const fetchSources = useCallback(async () => {
    const { data } = await supabase
      .from('lead_sources')
      .select('*')
      .eq('is_active', true)
      .order('display_name');
    
    if (data) {
      setSources(data as LeadSource[]);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('sales_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (filters.status && filters.status !== 'all') {
        query = query.eq('lead_status', filters.status);
      }
      if (filters.source_key) {
        query = query.eq('source_key', filters.source_key);
      }
      if (filters.assigned_team) {
        query = query.eq('assignment_type', filters.assigned_team);
      }
      if (filters.customer_type) {
        query = query.eq('customer_type_detected', filters.customer_type);
      }
      if (filters.date_start) {
        query = query.gte('created_at', filters.date_start);
      }
      if (filters.date_end) {
        query = query.lte('created_at', filters.date_end);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Client-side search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(lead =>
          lead.customer_name?.toLowerCase().includes(searchLower) ||
          lead.customer_phone?.includes(filters.search!) ||
          lead.customer_email?.toLowerCase().includes(searchLower) ||
          lead.company_name?.toLowerCase().includes(searchLower)
        );
      }

      setLeads(filteredData as Lead[]);

      // Calculate stats
      const allLeads = data || [];
      setStats({
        total: allLeads.length,
        new: allLeads.filter(l => l.lead_status === 'new').length,
        contacted: allLeads.filter(l => l.lead_status === 'contacted').length,
        qualified: allLeads.filter(l => l.lead_status === 'qualified').length,
        converted: allLeads.filter(l => l.lead_status === 'converted').length,
        lost: allLeads.filter(l => l.lead_status === 'lost').length,
      });
    } catch (err) {
      console.error('Error fetching leads:', err);
      toast({ title: 'Error loading leads', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  const updateLeadStatus = useCallback(async (leadId: string, newStatus: string) => {
    try {
      const updates: Record<string, unknown> = { 
        lead_status: newStatus,
        updated_at: new Date().toISOString(),
      };
      
      if (newStatus === 'converted') {
        updates.converted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('sales_leads')
        .update(updates)
        .eq('id', leadId);

      if (error) throw error;

      // Log event
      await supabase.from('lead_events').insert({
        lead_id: leadId,
        event_type: `STATUS_CHANGED_TO_${newStatus.toUpperCase()}`,
        payload_json: { new_status: newStatus },
      });

      toast({ title: `Lead status updated to ${newStatus}` });
      fetchLeads();
    } catch (err) {
      console.error('Error updating lead:', err);
      toast({ title: 'Error updating lead', variant: 'destructive' });
    }
  }, [fetchLeads, toast]);

  const assignLead = useCallback(async (leadId: string, userId: string | null, team: string) => {
    try {
      const { error } = await supabase
        .from('sales_leads')
        .update({
          assigned_to: userId,
          assignment_type: team,
          assigned_at: new Date().toISOString(),
        })
        .eq('id', leadId);

      if (error) throw error;

      await supabase.from('lead_events').insert({
        lead_id: leadId,
        event_type: 'ASSIGNED',
        payload_json: { assigned_to: userId, team },
      });

      toast({ title: 'Lead assigned successfully' });
      fetchLeads();
    } catch (err) {
      console.error('Error assigning lead:', err);
      toast({ title: 'Error assigning lead', variant: 'destructive' });
    }
  }, [fetchLeads, toast]);

  const classifyWithAI = useCallback(async (leadId: string) => {
    try {
      const response = await supabase.functions.invoke('lead-ai-classify', {
        body: { lead_id: leadId },
      });

      if (response.error) throw response.error;

      toast({ title: 'Lead classified by AI' });
      fetchLeads();
      return response.data;
    } catch (err) {
      console.error('Error classifying lead:', err);
      toast({ title: 'Error classifying lead', variant: 'destructive' });
    }
  }, [fetchLeads, toast]);

  const exportLeads = useCallback(async (format: 'csv' | 'word', exportFilters: LeadFilters) => {
    try {
      toast({ title: 'Generating export...' });

      const response = await supabase.functions.invoke('lead-export', {
        body: {
          format,
          filters: {
            date_start: exportFilters.date_start,
            date_end: exportFilters.date_end,
            status: exportFilters.status,
            source_key: exportFilters.source_key,
            assigned_team: exportFilters.assigned_team,
            customer_type: exportFilters.customer_type,
          },
        },
      });

      if (response.error) throw response.error;

      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
        toast({ title: `Export ready: ${response.data.leads_count} leads` });
      }

      return response.data;
    } catch (err) {
      console.error('Error exporting leads:', err);
      toast({ title: 'Error generating export', variant: 'destructive' });
    }
  }, [toast]);

  useEffect(() => {
    fetchSources();
    fetchLeads();
  }, [fetchSources, fetchLeads]);

  // Set up realtime subscription
  useEffect(() => {
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
  }, [fetchLeads]);

  return {
    leads,
    sources,
    stats,
    isLoading,
    fetchLeads,
    updateLeadStatus,
    assignLead,
    classifyWithAI,
    exportLeads,
  };
}
