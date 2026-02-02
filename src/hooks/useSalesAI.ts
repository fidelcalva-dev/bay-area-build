// Sales AI Closer Hook

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  SalesAIInsight, 
  SalesAIDraft, 
  SalesAIAnalyzeRequest, 
  SalesAIAnalyzeResponse,
  SalesAIConfig 
} from '@/types/salesAI';

// Fetch Sales AI config
export function useSalesAIConfig() {
  return useQuery({
    queryKey: ['sales-ai-config'],
    queryFn: async (): Promise<SalesAIConfig> => {
      const { data, error } = await supabase
        .from('config_settings')
        .select('key, value')
        .like('key', 'sales_ai.%');

      if (error) throw error;

      const config: SalesAIConfig = {
        enabled: true,
        mode: 'DRY_RUN',
        send_enabled: false,
        max_discount_pct_sales: 5,
        preferred_customer_discount_pct: 5,
      };

      (data as { key: string; value: unknown }[] | null)?.forEach((item) => {
        const key = item.key.replace('sales_ai.', '');
        let value = item.value;
        
        // Parse string values
        if (typeof value === 'string') {
          value = value.replace(/"/g, '');
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          else if (!isNaN(Number(value))) value = Number(value);
        }

        if (key === 'enabled') config.enabled = value as boolean;
        else if (key === 'mode') config.mode = value as 'DRY_RUN' | 'LIVE';
        else if (key === 'send_enabled') config.send_enabled = value as boolean;
        else if (key === 'max_discount_pct_sales') config.max_discount_pct_sales = value as number;
        else if (key === 'preferred_customer_discount_pct') config.preferred_customer_discount_pct = value as number;
      });

      return config;
    },
    staleTime: 60 * 1000,
  });
}

// Fetch latest insight for a lead - using RPC to avoid type issues with new tables
export function useSalesAIInsight(leadId?: string) {
  return useQuery({
    queryKey: ['sales-ai-insight', leadId],
    queryFn: async (): Promise<SalesAIInsight | null> => {
      if (!leadId) return null;

      // Use raw SQL query via REST API since types aren't regenerated yet
      const { data, error } = await supabase
        .rpc('get_latest_sales_ai_insight' as never, { p_lead_id: leadId } as never);

      // Fallback to direct fetch if RPC doesn't exist
      if (error) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/sales_ai_insights?lead_id=eq.${leadId}&order=created_at.desc&limit=1`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );
        const results = await response.json();
        return results?.[0] || null;
      }

      return data as SalesAIInsight | null;
    },
    enabled: !!leadId,
    staleTime: 30 * 1000,
  });
}

// Fetch drafts for a lead
export function useSalesAIDrafts(leadId?: string) {
  return useQuery({
    queryKey: ['sales-ai-drafts', leadId],
    queryFn: async (): Promise<SalesAIDraft[]> => {
      if (!leadId) return [];

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/sales_ai_messages_drafts?lead_id=eq.${leadId}&status=eq.DRAFT&order=created_at.desc`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      const results = await response.json();
      return (results || []) as SalesAIDraft[];
    },
    enabled: !!leadId,
    staleTime: 30 * 1000,
  });
}

// Analyze a lead with AI
export function useSalesAIAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SalesAIAnalyzeRequest): Promise<SalesAIAnalyzeResponse> => {
      const { data, error } = await supabase.functions.invoke('sales-ai-analyze', {
        body: request,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data as SalesAIAnalyzeResponse;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales-ai-insight', variables.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['sales-ai-drafts', variables.lead_id] });
      toast.success('AI analysis complete');
    },
    onError: (error: Error) => {
      console.error('Sales AI analyze error:', error);
      toast.error(error.message || 'Failed to analyze lead');
    },
  });
}

// Update draft status
export function useUpdateDraftStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      draftId, 
      status, 
      leadId 
    }: { 
      draftId: string; 
      status: 'SENT' | 'DISCARDED';
      leadId?: string;
    }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'SENT') updates.sent_at = new Date().toISOString();
      if (status === 'DISCARDED') updates.discarded_at = new Date().toISOString();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/sales_ai_messages_drafts?id=eq.${draftId}`,
        {
          method: 'PATCH',
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update draft');
      }

      return { draftId, status, leadId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-ai-drafts', data.leadId] });
      toast.success(data.status === 'SENT' ? 'Message sent' : 'Draft discarded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update draft');
    },
  });
}

// Log audit for copy action
export function useLogCopyAudit() {
  return useMutation({
    mutationFn: async ({ 
      leadId, 
      entityType, 
      entityId, 
      content 
    }: { 
      leadId?: string; 
      entityType: string; 
      entityId: string;
      content: string;
    }) => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/sales_ai_audit`,
        {
          method: 'POST',
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            lead_id: leadId,
            entity_type: entityType,
            entity_id: entityId,
            action_type: 'COPY_SCRIPT',
            input_summary_json: { content_length: content.length },
            ai_output_json: { copied_content: content.substring(0, 200) },
          }),
        }
      );

      if (!response.ok) {
        console.warn('Failed to log copy audit');
      }
    },
  });
}
