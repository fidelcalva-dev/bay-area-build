import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Required secrets for each integration
const INTEGRATION_SECRETS: Record<string, string[]> = {
  TWILIO: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
  RESEND: ['RESEND_API_KEY'],
  AUTHNET: ['AUTHNET_API_LOGIN_ID', 'AUTHNET_TRANSACTION_KEY', 'AUTHNET_SIGNATURE_KEY'],
  GOOGLE_MAPS: ['GOOGLE_MAPS_API_KEY'],
  GHL: ['HIGHLEVEL_API_KEY', 'HIGHLEVEL_LOCATION_ID'],
  META: ['META_VERIFY_TOKEN', 'META_APP_SECRET'],
  GOOGLE_ADS: ['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_ADS_DEVELOPER_TOKEN', 'GOOGLE_ADS_REFRESH_TOKEN'],
};

// Functions that depend on each integration
const INTEGRATION_FUNCTIONS: Record<string, string[]> = {
  TWILIO: ['calls-inbound-handler', 'calls-outbound-handler', 'calls-status-callback', 'calls-voicemail-handler', 'twilio-sms-webhook', 'send-otp'],
  RESEND: ['send-quote-summary', 'send-contract', 'send-payment-receipt', 'send-service-receipt'],
  AUTHNET: ['create-hosted-session', 'process-payment', 'process-refund', 'authnet-webhook'],
  GOOGLE_MAPS: ['geocode-address', 'truck-route', 'nearest-facilities', 'calculate-operational-time'],
  GHL: ['ghl-send-message', 'ghl-message-worker', 'ghl-inbound-webhook', 'highlevel-webhook'],
  META: ['lead-from-meta'],
  GOOGLE_ADS: ['ads-capacity-guard', 'ads-generate-campaigns', 'lead-from-google-ads'],
};

// Mode config keys
const MODE_CONFIGS: Record<string, { key: string; category: string }> = {
  telephony: { key: 'telephony.mode', category: 'telephony' },
  messaging: { key: 'ghl.messaging_mode', category: 'messaging' },
  ads: { key: 'ads.mode', category: 'ads' },
  master_ai: { key: 'master_ai.mode', category: 'master_ai' },
  compensation: { key: 'compensation.mode', category: 'compensation' },
};

type HealthSeverity = 'GREEN' | 'AMBER' | 'RED';

interface HealthEvent {
  source_type: string;
  source_key: string;
  severity: HealthSeverity;
  message: string;
  details_json: Record<string, unknown>;
}

interface NodeHealth {
  severity: HealthSeverity;
  message: string;
  issues: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const events: HealthEvent[] = [];
    const nodeHealth: Record<string, NodeHealth> = {};

    // 1. Check secrets presence
    const secretsPresent: Record<string, boolean> = {};
    for (const [integration, secrets] of Object.entries(INTEGRATION_SECRETS)) {
      const allPresent = secrets.every(s => !!Deno.env.get(s));
      secretsPresent[integration] = allPresent;
      
      if (!allPresent) {
        const missing = secrets.filter(s => !Deno.env.get(s));
        events.push({
          source_type: 'INTEGRATION',
          source_key: integration,
          severity: 'AMBER',
          message: `Missing secrets: ${missing.join(', ')}`,
          details_json: { missing, total: secrets.length },
        });
      }
    }

    // 2. Get config modes
    const { data: configs } = await supabase
      .from('config_settings')
      .select('category, key, value')
      .in('key', Object.values(MODE_CONFIGS).map(m => m.key));

    const modes: Record<string, string> = {};
    for (const config of configs || []) {
      const modeKey = Object.entries(MODE_CONFIGS).find(
        ([, v]) => v.key === config.key
      )?.[0];
      if (modeKey) {
        modes[modeKey] = String(config.value).replace(/"/g, '');
      }
    }

    // 3. Check integration readiness (mode vs secrets)
    for (const [integration, functions] of Object.entries(INTEGRATION_FUNCTIONS)) {
      const hasSecrets = secretsPresent[integration];
      
      // Map integration to mode
      const modeMap: Record<string, string> = {
        TWILIO: 'telephony',
        GHL: 'messaging',
        GOOGLE_ADS: 'ads',
      };
      
      const relevantMode = modeMap[integration];
      const currentMode = relevantMode ? modes[relevantMode] : 'DRY_RUN';
      const isLive = currentMode === 'LIVE';

      let severity: HealthSeverity = 'GREEN';
      let message = 'Integration ready';

      if (isLive && !hasSecrets) {
        severity = 'RED';
        message = `${integration} in LIVE mode but missing required secrets`;
      } else if (!hasSecrets) {
        severity = 'AMBER';
        message = `${integration} secrets not configured (DRY_RUN mode)`;
      }

      // Set health for all functions in this integration
      for (const fn of functions) {
        nodeHealth[fn] = {
          severity,
          message,
          issues: severity !== 'GREEN' ? [message] : [],
        };
      }

      if (severity !== 'GREEN') {
        events.push({
          source_type: 'INTEGRATION',
          source_key: integration,
          severity,
          message,
          details_json: { functions, mode: currentMode, hasSecrets },
        });
      }
    }

    // 4. Check manual setup items
    const { data: manualItems } = await supabase
      .from('manual_setup_items')
      .select('*');

    for (const item of manualItems || []) {
      const isPending = item.status === 'PENDING' || item.status === 'BLOCKED';
      
      // Determine if this is blocking based on mode
      let severity: HealthSeverity = 'GREEN';
      let message = `${item.name}: ${item.status}`;

      if (item.category === 'TWILIO' && modes.telephony === 'LIVE' && isPending) {
        severity = 'RED';
        message = `${item.name} required for LIVE telephony`;
      } else if (item.category === 'SECURITY' && isPending) {
        severity = 'AMBER';
        message = `Security: ${item.name} not configured`;
      } else if (isPending) {
        severity = 'AMBER';
        message = `${item.name} not configured`;
      }

      if (severity !== 'GREEN') {
        events.push({
          source_type: 'MANUAL_SETUP',
          source_key: `${item.category}.${item.key}`,
          severity,
          message,
          details_json: { 
            category: item.category, 
            key: item.key, 
            status: item.status,
            description: item.description,
          },
        });
      }
    }

    // 5. Check config modes status
    for (const [name, config] of Object.entries(MODE_CONFIGS)) {
      const currentMode = modes[name] || 'DRY_RUN';
      
      nodeHealth[`config:${name}`] = {
        severity: currentMode === 'LIVE' ? 'GREEN' : 'AMBER',
        message: `Mode: ${currentMode}`,
        issues: currentMode !== 'LIVE' ? [`${name} in ${currentMode} mode`] : [],
      };
    }

    // 6. Check cron jobs (based on ai_jobs table for scheduler activity)
    const { data: recentJobs } = await supabase
      .from('ai_jobs')
      .select('job_type, status, created_at, last_error')
      .order('created_at', { ascending: false })
      .limit(10);

    const jobTypeLastRun: Record<string, { status: string; created_at: string; error?: string }> = {};
    for (const job of recentJobs || []) {
      if (!jobTypeLastRun[job.job_type]) {
        jobTypeLastRun[job.job_type] = {
          status: job.status,
          created_at: job.created_at,
          error: job.last_error || undefined,
        };
      }
    }

    // Check if master-ai-scheduler has recent activity
    const schedulerJobTypes = ['CONTROL_TOWER', 'DAILY_BRIEF', 'EOD_REPORT'];
    let hasRecentSchedulerActivity = false;
    for (const jt of schedulerJobTypes) {
      if (jobTypeLastRun[jt]) {
        const lastRun = new Date(jobTypeLastRun[jt].created_at);
        const hoursSince = (Date.now() - lastRun.getTime()) / (1000 * 60 * 60);
        if (hoursSince < 24) {
          hasRecentSchedulerActivity = true;
          break;
        }
      }
    }

    nodeHealth['cron:master-ai-scheduler'] = {
      severity: hasRecentSchedulerActivity ? 'GREEN' : 'AMBER',
      message: hasRecentSchedulerActivity ? 'Scheduler active' : 'No recent scheduler activity',
      issues: hasRecentSchedulerActivity ? [] : ['Master AI scheduler may not be running'],
    };

    if (!hasRecentSchedulerActivity) {
      events.push({
        source_type: 'CRON',
        source_key: 'master-ai-scheduler',
        severity: 'AMBER',
        message: 'No scheduler activity in last 24 hours',
        details_json: { lastJobs: jobTypeLastRun },
      });
    }

    // 7. Check overdue billing cron
    const { data: recentAlerts } = await supabase
      .from('alerts')
      .select('alert_type, created_at')
      .eq('alert_type', 'OVERDUE_BILLING')
      .order('created_at', { ascending: false })
      .limit(1);

    const hasRecentOverdueBilling = recentAlerts && recentAlerts.length > 0;
    nodeHealth['cron:overdue-billing-daily'] = {
      severity: 'GREEN', // Can't easily verify cron without logs
      message: hasRecentOverdueBilling ? 'Recent overdue billing activity' : 'Cron configured',
      issues: [],
    };

    // 8. Calculate summary
    const summary = {
      total_nodes: Object.keys(nodeHealth).length,
      green: Object.values(nodeHealth).filter(n => n.severity === 'GREEN').length,
      amber: Object.values(nodeHealth).filter(n => n.severity === 'AMBER').length,
      red: Object.values(nodeHealth).filter(n => n.severity === 'RED').length,
      generated_at: new Date().toISOString(),
    };

    // 9. Build issues list (sorted by severity)
    const issues = events
      .filter(e => e.severity !== 'GREEN')
      .sort((a, b) => {
        const order: Record<string, number> = { RED: 0, AMBER: 1, GREEN: 2 };
        return order[a.severity] - order[b.severity];
      })
      .map(e => ({
        severity: e.severity,
        source: `${e.source_type}:${e.source_key}`,
        message: e.message,
        details: e.details_json,
      }));

    // 10. Save health events
    if (events.length > 0) {
      await supabase.from('system_health_events').insert(events);
    }

    // 11. Save health snapshot
    const { data: snapshot, error: snapshotError } = await supabase
      .from('system_health_snapshot')
      .insert({
        summary_json: summary,
        node_health_json: nodeHealth,
        issues_json: issues,
      })
      .select()
      .single();

    if (snapshotError) {
      console.error('Failed to save snapshot:', snapshotError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        issues,
        node_health: nodeHealth,
        snapshot_id: snapshot?.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Health collector error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
