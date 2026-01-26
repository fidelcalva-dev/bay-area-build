import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MasterAIConfig {
  enabled: boolean;
  mode: 'DRY_RUN' | 'LIVE';
  control_tower_interval_minutes: number;
  daily_brief_time: string;
  eod_time: string;
  alert_thresholds: Record<string, number>;
}

interface QueueStats {
  pending: number;
  running: number;
  failed: number;
}

interface AIDecision {
  id: string;
  decision_type: string;
  severity: string;
  entity_type: string;
  entity_id?: string;
  summary: string;
  recommendation?: string;
  created_at: string;
}

interface AIJob {
  id: string;
  job_type: string;
  status: string;
  priority: number;
  scheduled_for: string;
  attempt_count: number;
  max_attempts?: number;
  last_error?: string;
  created_at: string;
  updated_at?: string;
}

interface Notification {
  id: string;
  channel: string;
  target_team: string;
  title: string;
  body: string;
  status: string;
  mode: string;
  priority?: string;
  created_at: string;
}

interface KPISnapshot {
  id: string;
  snapshot_date: string;
  market_code?: string;
  metrics: Record<string, number>;
}

export function useMasterAI() {
  const [config, setConfig] = useState<MasterAIConfig | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats>({ pending: 0, running: 0, failed: 0 });
  const [recentDecisions, setRecentDecisions] = useState<AIDecision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/master-ai-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ action: 'get_status' }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch status');
      }

      const data = await response.json();
      
      setConfig({
        enabled: data.config?.enabled ?? false,
        mode: data.config?.mode ?? 'DRY_RUN',
        control_tower_interval_minutes: data.config?.control_tower_interval_minutes ?? 30,
        daily_brief_time: data.config?.daily_brief_time ?? '08:00',
        eod_time: data.config?.eod_time ?? '18:00',
        alert_thresholds: data.config?.alert_thresholds ?? {},
      });
      setQueueStats(data.queue);
      setRecentDecisions(data.recent_decisions || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const triggerJob = async (jobType: string, priority = 1) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/master-ai-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ action: 'trigger_job', job_type: jobType, priority }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to trigger job');
    }

    await fetchStatus();
    return response.json();
  };

  const retryJob = async (jobId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/master-ai-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ action: 'retry_job', job_id: jobId }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to retry job');
    }

    await fetchStatus();
    return response.json();
  };

  const updateConfig = async (key: string, value: unknown) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/master-ai-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ action: 'update_config', key, value }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update config');
    }

    await fetchStatus();
    return response.json();
  };

  const fetchJobs = async (status?: string, limit = 50): Promise<AIJob[]> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/master-ai-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ action: 'get_jobs', status, limit }),
      }
    );

    if (!response.ok) throw new Error('Failed to fetch jobs');
    const data = await response.json();
    return data.jobs;
  };

  const fetchDecisions = async (severity?: string, limit = 50): Promise<AIDecision[]> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/master-ai-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ action: 'get_decisions', severity, limit }),
      }
    );

    if (!response.ok) throw new Error('Failed to fetch decisions');
    const data = await response.json();
    return data.decisions;
  };

  const fetchNotifications = async (status?: string, limit = 50): Promise<Notification[]> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/master-ai-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ action: 'get_notifications', status, limit }),
      }
    );

    if (!response.ok) throw new Error('Failed to fetch notifications');
    const data = await response.json();
    return data.notifications;
  };

  const fetchKPIs = async (days = 7): Promise<KPISnapshot[]> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/master-ai-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ action: 'get_kpis', days }),
      }
    );

    if (!response.ok) throw new Error('Failed to fetch KPIs');
    const data = await response.json();
    return data.snapshots;
  };

  return {
    config,
    queueStats,
    recentDecisions,
    isLoading,
    error,
    refresh: fetchStatus,
    triggerJob,
    retryJob,
    updateConfig,
    fetchJobs,
    fetchDecisions,
    fetchNotifications,
    fetchKPIs,
  };
}
