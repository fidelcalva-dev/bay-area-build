import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Job {
  id: string;
  job_type: string;
  payload: Record<string, unknown>;
  attempt_count: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

interface Decision {
  type: string;
  severity: string;
  entity_type: string;
  entity_id?: string;
  summary: string;
  recommendation?: string;
  actions?: Array<{ type: string; request: Record<string, unknown> }>;
  requires_approval?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const workerId = `worker-${crypto.randomUUID().slice(0, 8)}`;

  try {
    // Check if Master AI is enabled
    const { data: configEnabled } = await supabase
      .from("config_settings")
      .select("value")
      .eq("category", "master_ai")
      .eq("key", "enabled")
      .maybeSingle();

    if (!configEnabled?.value) {
      return new Response(JSON.stringify({ status: "disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Master AI mode
    const { data: configMode } = await supabase
      .from("config_settings")
      .select("value")
      .eq("category", "master_ai")
      .eq("key", "mode")
      .maybeSingle();

    const mode = configMode?.value || "DRY_RUN";

    // Claim next job
    const { data: jobs, error: claimError } = await supabase.rpc("claim_next_ai_job", {
      p_worker_id: workerId,
    });

    if (claimError || !jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ status: "no_jobs" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const job = jobs[0] as Job;
    console.log(`Processing job ${job.id} (${job.job_type}), attempt ${job.attempt_count}`);

    const decisions: Decision[] = [];

    try {
      switch (job.job_type) {
        case "CONTROL_TOWER":
          await runControlTower(supabase, job, decisions, mode);
          break;
        case "DAILY_BRIEF":
          await runDailyBrief(supabase, job, decisions, mode);
          break;
        case "EOD_REPORT":
          await runEodReport(supabase, job, decisions, mode);
          break;
        case "KPI_SNAPSHOT":
          await runKpiSnapshot(supabase, job, decisions);
          break;
        case "DISPATCH_HEALTH":
          await runDispatchHealth(supabase, job, decisions, mode);
          break;
        case "OVERDUE_CHECK":
          await runOverdueCheck(supabase, job, decisions, mode);
          break;
        case "ADS_HEALTH":
          await runAdsHealth(supabase, job, decisions, mode);
          break;
        default:
          console.log(`Unknown job type: ${job.job_type}`);
      }

      // Log all decisions
      for (const decision of decisions) {
        const { data: decisionRow } = await supabase.rpc("log_ai_decision", {
          p_job_id: job.id,
          p_decision_type: decision.type,
          p_severity: decision.severity,
          p_entity_type: decision.entity_type,
          p_entity_id: decision.entity_id || null,
          p_summary: decision.summary,
          p_recommendation: decision.recommendation || null,
          p_actions_json: decision.actions || [],
          p_requires_approval: decision.requires_approval || false,
        });

        // Log actions and enqueue notifications
        if (decision.actions && decisionRow) {
          for (const action of decision.actions) {
            await supabase.from("ai_actions").insert({
              decision_id: decisionRow,
              action_type: action.type,
              status: mode === "LIVE" ? "EXECUTED" : "DRAFTED",
              request_json: action.request,
            });

            // Enqueue notification based on action
            if (action.type === "SEND_NOTIFICATION") {
              const notif = action.request as {
                channel?: string;
                team?: string;
                title?: string;
                body?: string;
                entity_type?: string;
                entity_id?: string;
                priority?: string;
              };
              await supabase.rpc("enqueue_notification", {
                p_channel: notif.channel || "IN_APP",
                p_target_team: notif.team || "ADMIN",
                p_title: notif.title || decision.summary,
                p_body: notif.body || decision.recommendation || "",
                p_entity_type: notif.entity_type || decision.entity_type,
                p_entity_id: notif.entity_id || decision.entity_id,
                p_priority: notif.priority || (decision.severity === "CRITICAL" ? "URGENT" : "NORMAL"),
                p_mode: mode,
              });
            }
          }
        }
      }

      // Mark job as complete
      await supabase.rpc("complete_ai_job", { p_job_id: job.id, p_success: true });

      return new Response(
        JSON.stringify({
          status: "success",
          job_id: job.id,
          job_type: job.job_type,
          decisions_count: decisions.length,
          mode,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (jobError) {
      console.error(`Job ${job.id} failed:`, jobError);
      await supabase.rpc("complete_ai_job", {
        p_job_id: job.id,
        p_success: false,
        p_error: jobError instanceof Error ? jobError.message : "Unknown error",
      });
      throw jobError;
    }
  } catch (error) {
    console.error("Worker error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ============ JOB HANDLERS ============

async function runControlTower(
  supabase: AnySupabaseClient,
  job: Job,
  decisions: Decision[],
  mode: string
) {
  console.log("Running Control Tower checks...");

  // 1. Check stale leads (no action in 15+ minutes)
  const { data: staleLeads } = await supabase
    .from("sales_leads")
    .select("id, customer_name, assignment_type, created_at")
    .eq("lead_status", "new")
    .lt("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString())
    .limit(10);

  if (staleLeads && staleLeads.length > 0) {
    for (const lead of staleLeads) {
      decisions.push({
        type: "ALERT",
        severity: "HIGH",
        entity_type: "lead",
        entity_id: lead.id,
        summary: `Stale lead: ${lead.customer_name} waiting ${Math.round((Date.now() - new Date(lead.created_at).getTime()) / 60000)} mins`,
        recommendation: "Assign to CS or Sales immediately",
        actions: [
          {
            type: "SEND_NOTIFICATION",
            request: {
              channel: "IN_APP",
              team: lead.assignment_type?.toUpperCase() || "SALES",
              title: "Stale Lead Alert",
              body: `Lead ${lead.customer_name} has been waiting over 15 minutes`,
            },
          },
        ],
      });
    }
  }

  // 2. Check stale quotes (48+ hours old, not converted)
  const { data: staleQuotes } = await supabase
    .from("quotes")
    .select("id, customer_name, subtotal, created_at")
    .eq("status", "quoted")
    .lt("created_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .limit(10);

  if (staleQuotes && staleQuotes.length > 0) {
    decisions.push({
      type: "TASK",
      severity: "MED",
      entity_type: "quote",
      summary: `${staleQuotes.length} quotes stale (48h+), total value $${staleQuotes.reduce((a, q) => a + (q.subtotal || 0), 0).toFixed(2)}`,
      recommendation: "Follow up with customers or mark as lost",
      actions: [
        {
          type: "SEND_NOTIFICATION",
          request: {
            channel: "IN_APP",
            team: "SALES",
            title: "Stale Quotes Review",
            body: `${staleQuotes.length} quotes need follow-up`,
          },
        },
      ],
    });
  }

  // 3. Check overdue assets
  const { data: overdueAssets } = await supabase
    .from("assets_dumpsters")
    .select("id, asset_code, days_out, current_order_id")
    .eq("asset_status", "deployed")
    .gt("days_out", 7)
    .limit(10);

  if (overdueAssets && overdueAssets.length > 0) {
    decisions.push({
      type: "ALERT",
      severity: overdueAssets.length > 5 ? "HIGH" : "MED",
      entity_type: "asset",
      summary: `${overdueAssets.length} assets overdue (7+ days out)`,
      recommendation: "Schedule pickups or contact customers for extensions",
      actions: [
        {
          type: "SEND_NOTIFICATION",
          request: {
            channel: "IN_APP",
            team: "DISPATCH",
            title: "Overdue Assets Alert",
            body: `${overdueAssets.length} dumpsters have been out 7+ days`,
          },
        },
      ],
    });
  }

  // 4. Check pending approvals
  const { data: pendingApprovals } = await supabase
    .from("approval_requests")
    .select("id, request_type, created_at")
    .eq("status", "pending")
    .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (pendingApprovals && pendingApprovals.length > 0) {
    decisions.push({
      type: "ESCALATION",
      severity: "HIGH",
      entity_type: "system",
      summary: `${pendingApprovals.length} approvals pending 24h+`,
      recommendation: "Review and approve/deny immediately",
      actions: [
        {
          type: "SEND_NOTIFICATION",
          request: {
            channel: "IN_APP",
            team: "ADMIN",
            title: "Aging Approvals",
            body: `${pendingApprovals.length} approval requests need attention`,
            priority: "HIGH",
          },
        },
      ],
    });
  }

  // 5. Check delayed runs
  const today = new Date().toISOString().split("T")[0];
  const { data: delayedRuns } = await supabase
    .from("runs")
    .select("id, run_type, scheduled_date, customer_name")
    .eq("status", "SCHEDULED")
    .lt("scheduled_date", today)
    .limit(10);

  if (delayedRuns && delayedRuns.length > 0) {
    decisions.push({
      type: "ALERT",
      severity: "HIGH",
      entity_type: "run",
      summary: `${delayedRuns.length} runs delayed (past scheduled date)`,
      recommendation: "Reschedule or complete immediately",
      actions: [
        {
          type: "SEND_NOTIFICATION",
          request: {
            channel: "IN_APP",
            team: "DISPATCH",
            title: "Delayed Runs",
            body: `${delayedRuns.length} runs are past their scheduled date`,
            priority: "URGENT",
          },
        },
      ],
    });
  }

  console.log(`Control Tower completed: ${decisions.length} decisions`);
}

async function runDailyBrief(
  supabase: AnySupabaseClient,
  job: Job,
  decisions: Decision[],
  mode: string
) {
  console.log("Running Daily Brief...");

  // Gather KPIs
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  // Orders
  const { count: ordersYesterday } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", yesterday)
    .lt("created_at", today);

  // Revenue
  const { data: revenueData } = await supabase
    .from("orders")
    .select("amount_due")
    .gte("created_at", yesterday)
    .lt("created_at", today);
  const revenueYesterday = revenueData?.reduce((a, o) => a + (o.amount_due || 0), 0) || 0;

  // Leads
  const { count: leadsYesterday } = await supabase
    .from("sales_leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", yesterday)
    .lt("created_at", today);

  // Overdue count
  const { count: overdueCount } = await supabase
    .from("assets_dumpsters")
    .select("id", { count: "exact", head: true })
    .eq("asset_status", "deployed")
    .gt("days_out", 7);

  // Pending approvals
  const { count: pendingApprovals } = await supabase
    .from("approval_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  const briefBody = `
📊 **Daily CEO Brief - ${today}**

**Yesterday's Performance:**
• Orders: ${ordersYesterday || 0}
• Revenue: $${revenueYesterday.toFixed(2)}
• New Leads: ${leadsYesterday || 0}

**Current Status:**
• Overdue Assets: ${overdueCount || 0}
• Pending Approvals: ${pendingApprovals || 0}

_Generated by CALSAN Master AI_
  `.trim();

  decisions.push({
    type: "KPI_REPORT",
    severity: "LOW",
    entity_type: "system",
    summary: `Daily Brief: ${ordersYesterday || 0} orders, $${revenueYesterday.toFixed(2)} revenue`,
    recommendation: briefBody,
    actions: [
      {
        type: "SEND_NOTIFICATION",
        request: {
          channel: "IN_APP",
          team: "EXECUTIVE",
          title: `Daily Brief - ${today}`,
          body: briefBody,
        },
      },
    ],
  });

  // Record KPI snapshot
  await supabase.rpc("record_kpi_snapshot", {
    p_date: yesterday,
    p_market_code: null,
    p_metrics: {
      orders_count: ordersYesterday || 0,
      revenue: revenueYesterday,
      leads_count: leadsYesterday || 0,
      overdue_count: overdueCount || 0,
      pending_approvals: pendingApprovals || 0,
    },
    p_type: "DAILY",
  });

  console.log("Daily Brief completed");
}

async function runEodReport(
  supabase: AnySupabaseClient,
  job: Job,
  decisions: Decision[],
  mode: string
) {
  console.log("Running EOD Report...");

  const today = new Date().toISOString().split("T")[0];

  // Today's completions
  const { count: completedRuns } = await supabase
    .from("runs")
    .select("id", { count: "exact", head: true })
    .eq("status", "COMPLETED")
    .gte("completed_at", today);

  // Open issues
  const { count: openAlerts } = await supabase
    .from("alerts")
    .select("id", { count: "exact", head: true })
    .eq("is_resolved", false);

  // Tomorrow's scheduled
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const { count: tomorrowRuns } = await supabase
    .from("runs")
    .select("id", { count: "exact", head: true })
    .eq("scheduled_date", tomorrow);

  const eodBody = `
🌙 **End of Day Report - ${today}**

**Today's Completions:**
• Runs Completed: ${completedRuns || 0}

**Open Items:**
• Unresolved Alerts: ${openAlerts || 0}

**Tomorrow's Schedule:**
• Scheduled Runs: ${tomorrowRuns || 0}

_Good night from CALSAN Master AI_
  `.trim();

  decisions.push({
    type: "KPI_REPORT",
    severity: "LOW",
    entity_type: "system",
    summary: `EOD: ${completedRuns || 0} runs completed, ${tomorrowRuns || 0} scheduled tomorrow`,
    recommendation: eodBody,
    actions: [
      {
        type: "SEND_NOTIFICATION",
        request: {
          channel: "IN_APP",
          team: "ADMIN",
          title: `End of Day - ${today}`,
          body: eodBody,
        },
      },
    ],
  });

  console.log("EOD Report completed");
}

async function runKpiSnapshot(
  supabase: AnySupabaseClient,
  job: Job,
  decisions: Decision[]
) {
  console.log("Running KPI Snapshot...");

  const today = new Date().toISOString().split("T")[0];

  // Asset utilization
  const { count: totalAssets } = await supabase
    .from("assets_dumpsters")
    .select("id", { count: "exact", head: true })
    .eq("asset_status", "deployed");

  const { count: availableAssets } = await supabase
    .from("assets_dumpsters")
    .select("id", { count: "exact", head: true })
    .eq("asset_status", "available");

  const utilizationPct = totalAssets && availableAssets !== null
    ? ((totalAssets / (totalAssets + availableAssets)) * 100).toFixed(1)
    : 0;

  // Average days out
  const { data: daysOutData } = await supabase
    .from("assets_dumpsters")
    .select("days_out")
    .eq("asset_status", "deployed");

  const avgDaysOut = daysOutData && daysOutData.length > 0
    ? (daysOutData.reduce((a, d) => a + (d.days_out || 0), 0) / daysOutData.length).toFixed(1)
    : 0;

  await supabase.rpc("record_kpi_snapshot", {
    p_date: today,
    p_market_code: null,
    p_metrics: {
      utilization_pct: parseFloat(utilizationPct.toString()),
      days_out_avg: parseFloat(avgDaysOut.toString()),
      deployed_count: totalAssets || 0,
      available_count: availableAssets || 0,
    },
    p_type: "DAILY",
  });

  decisions.push({
    type: "INSIGHT",
    severity: "LOW",
    entity_type: "system",
    summary: `KPI Snapshot: ${utilizationPct}% utilization, ${avgDaysOut} avg days out`,
  });

  console.log("KPI Snapshot completed");
}

async function runDispatchHealth(
  supabase: AnySupabaseClient,
  job: Job,
  decisions: Decision[],
  mode: string
) {
  console.log("Running Dispatch Health check...");

  // Check runs missing checkpoints
  const { data: runsNoCheckpoints } = await supabase
    .from("runs")
    .select(`
      id, run_type, customer_name,
      run_checkpoints!inner(id, is_completed)
    `)
    .eq("status", "COMPLETED")
    .eq("run_checkpoints.is_completed", false)
    .limit(10);

  if (runsNoCheckpoints && runsNoCheckpoints.length > 0) {
    decisions.push({
      type: "ALERT",
      severity: "MED",
      entity_type: "run",
      summary: `${runsNoCheckpoints.length} completed runs missing checkpoints`,
      recommendation: "Drivers need to upload POD photos and dump tickets",
      actions: [
        {
          type: "SEND_NOTIFICATION",
          request: {
            channel: "IN_APP",
            team: "DISPATCH",
            title: "Missing Checkpoints",
            body: `${runsNoCheckpoints.length} runs need POD/ticket uploads`,
          },
        },
      ],
    });
  }

  console.log("Dispatch Health completed");
}

async function runOverdueCheck(
  supabase: AnySupabaseClient,
  job: Job,
  decisions: Decision[],
  mode: string
) {
  console.log("Running Overdue Check...");

  // Check for new overdue (7 days)
  const { data: newOverdue } = await supabase
    .from("assets_dumpsters")
    .select("id, asset_code, days_out, current_order_id")
    .eq("asset_status", "deployed")
    .eq("days_out", 7)
    .eq("overdue_notified", false)
    .limit(20);

  if (newOverdue && newOverdue.length > 0) {
    for (const asset of newOverdue) {
      decisions.push({
        type: "ALERT",
        severity: "MED",
        entity_type: "asset",
        entity_id: asset.id,
        summary: `Asset ${asset.asset_code} hit 7-day overdue threshold`,
        recommendation: "Schedule pickup or contact customer for extension billing",
        actions: [
          {
            type: "SEND_NOTIFICATION",
            request: {
              channel: "IN_APP",
              team: "BILLING",
              title: "New Overdue Asset",
              body: `${asset.asset_code} is now 7 days out`,
            },
          },
        ],
      });
    }

    // Mark as notified
    await supabase
      .from("assets_dumpsters")
      .update({ overdue_notified: true })
      .in("id", newOverdue.map(a => a.id));
  }

  console.log("Overdue Check completed");
}

async function runAdsHealth(
  supabase: AnySupabaseClient,
  job: Job,
  decisions: Decision[],
  mode: string
) {
  console.log("Running Ads Health check...");

  // Check for campaigns with high CPA
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const { data: highCpa } = await supabase
    .from("ads_metrics")
    .select("campaign_id, cost, conversions, cpa")
    .eq("date", yesterday)
    .gt("cpa", 100)
    .limit(5);

  if (highCpa && highCpa.length > 0) {
    decisions.push({
      type: "ALERT",
      severity: "MED",
      entity_type: "campaign",
      summary: `${highCpa.length} campaigns with CPA > $100 yesterday`,
      recommendation: "Review ad spend and consider pausing underperforming campaigns",
      actions: [
        {
          type: "SEND_NOTIFICATION",
          request: {
            channel: "IN_APP",
            team: "ADMIN",
            title: "High CPA Campaigns",
            body: `${highCpa.length} campaigns exceeded $100 CPA threshold`,
          },
        },
      ],
    });
  }

  console.log("Ads Health completed");
}
