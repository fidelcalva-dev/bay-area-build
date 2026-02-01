import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type HealthSeverity = 'GREEN' | 'AMBER' | 'RED';

export interface NodeHealth {
  severity: HealthSeverity;
  message: string;
  issues: string[];
}

export interface HealthIssue {
  severity: HealthSeverity;
  source: string;
  message: string;
  details: Record<string, unknown>;
}

export interface HealthSummary {
  total_nodes: number;
  green: number;
  amber: number;
  red: number;
  generated_at: string;
}

export interface HealthSnapshot {
  id: string;
  generated_at: string;
  summary_json: HealthSummary;
  node_health_json: Record<string, NodeHealth>;
  issues_json: HealthIssue[];
}

export interface ManualSetupItem {
  id: string;
  category: string;
  key: string;
  name: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | 'NOT_APPLICABLE';
  verified_at: string | null;
  notes: string | null;
}

export function useSystemHealth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [latestSnapshot, setLatestSnapshot] = useState<HealthSnapshot | null>(null);
  const [manualSetupItems, setManualSetupItems] = useState<ManualSetupItem[]>([]);

  const fetchLatestSnapshot = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_health_snapshot')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setLatestSnapshot({
          id: data.id,
          generated_at: data.generated_at,
          summary_json: data.summary_json as unknown as HealthSummary,
          node_health_json: data.node_health_json as unknown as Record<string, NodeHealth>,
          issues_json: data.issues_json as unknown as HealthIssue[],
        });
      }
    } catch (error) {
      console.error('Failed to fetch health snapshot:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchManualSetupItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('manual_setup_items')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setManualSetupItems((data || []) as ManualSetupItem[]);
    } catch (error) {
      console.error('Failed to fetch manual setup items:', error);
    }
  }, []);

  const runHealthScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('health-collector');
      
      if (error) throw error;
      
      if (data?.snapshot_id) {
        await fetchLatestSnapshot();
        toast.success('Health scan completed');
      }
      
      return data;
    } catch (error) {
      console.error('Health scan failed:', error);
      toast.error('Health scan failed');
      throw error;
    } finally {
      setIsScanning(false);
    }
  }, [fetchLatestSnapshot]);

  const updateManualSetupStatus = useCallback(async (
    id: string,
    status: ManualSetupItem['status'],
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('manual_setup_items')
        .update({
          status,
          notes,
          verified_at: status === 'DONE' ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchManualSetupItems();
      toast.success('Status updated');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  }, [fetchManualSetupItems]);

  return {
    isLoading,
    isScanning,
    latestSnapshot,
    manualSetupItems,
    fetchLatestSnapshot,
    fetchManualSetupItems,
    runHealthScan,
    updateManualSetupStatus,
  };
}
