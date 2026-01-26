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

    const mode = (typeof configMode?.value === 'string' 
      ? configMode.value.replace(/"/g, '') 
      : configMode?.value) || "DRY_RUN";
    
    const isLiveMode = mode === "LIVE" || mode === "LIVE_INTERNAL";
    console.log(`Master AI mode: ${mode}, isLive: ${isLiveMode}`);

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
              status: isLiveMode ? "EXECUTED" : "DRAFTED",
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

      // Count items created
      const tasksCreated = decisions.filter(d => d.type === 'TASK').length;
      const alertsCreated = decisions.filter(d => d.type === 'ALERT' || d.type === 'ESCALATION').length;
      const draftsCreated = decisions.reduce((acc, d) => acc + (d.actions?.filter(a => a.type === 'SEND_NOTIFICATION').length || 0), 0);
      
      // Update job with summary
      await supabase.from('ai_jobs').update({
        payload: {
          ...(job.payload || {}),
          summary: {
            decisions_created: decisions.length,
            tasks_created: tasksCreated,
            alerts_created: alertsCreated,
            drafts_created: draftsCreated,
            completed_at: new Date().toISOString(),
          }
        }
      }).eq('id', job.id);

      // Mark job as complete
      await supabase.rpc("complete_ai_job", { p_job_id: job.id, p_success: true });

      return new Response(
        JSON.stringify({
          status: "success",
          job_id: job.id,
          job_type: job.job_type,
          decisions_count: decisions.length,
          tasks_created: tasksCreated,
          alerts_created: alertsCreated,
          drafts_created: draftsCreated,
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

  // A) LEADS: Check stale leads (5+ minutes old, NEW status)
  const { data: staleLeads } = await supabase
    .from("sales_leads")
    .select("id, customer_name, assignment_type, created_at, customer_phone")
    .eq("lead_status", "new")
    .lt("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .limit(20);

  if (staleLeads && staleLeads.length > 0) {
    for (const lead of staleLeads) {
      const waitMins = Math.round((Date.now() - new Date(lead.created_at).getTime()) / 60000);
      const severity = waitMins > 15 ? "HIGH" : "MED";
      
      decisions.push({
        type: "TASK",
        severity,
        entity_type: "lead",
        entity_id: lead.id,
        summary: `Stale lead: ${lead.customer_name || 'Unknown'} waiting ${waitMins} mins`,
        recommendation: "Contact immediately - potential lost sale",
        actions: [
          {
            type: "SEND_NOTIFICATION",
            request: {
              channel: "IN_APP",
              team: lead.assignment_type?.toUpperCase() || "SALES",
              title: `⏰ Lead Waiting ${waitMins}min`,
              body: `${lead.customer_name || 'New Lead'} needs immediate response`,
              entity_type: "lead",
              entity_id: lead.id,
              priority: severity === "HIGH" ? "URGENT" : "NORMAL",
            },
          },
        ],
      });
      
      // Create CRM task for sales
      await supabase.from("crm_tasks").insert({
        entity_type: "lead",
        entity_id: lead.id,
        title: `Contact stale lead: ${lead.customer_name || 'Unknown'}`,
        description: `Lead has been waiting ${waitMins} minutes. Phone: ${lead.customer_phone || 'N/A'}`,
        assigned_team: lead.assignment_type || "sales",
        priority: severity === "HIGH" ? 1 : 2,
        due_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min deadline
      });
    }
  }

  // B) QUOTES: Check stale quotes (60+ minutes old, unpaid)
  const { data: staleQuotes } = await supabase
    .from("quotes")
    .select("id, customer_name, customer_phone, subtotal, created_at, status")
    .in("status", ["created", "quoted", "sent"])
    .lt("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .limit(20);

  if (staleQuotes && staleQuotes.length > 0) {
    const totalValue = staleQuotes.reduce((a, q) => a + (q.subtotal || 0), 0);
    
    decisions.push({
      type: "TASK",
      severity: "MED",
      entity_type: "quote",
      summary: `${staleQuotes.length} quotes stale (1h+), total value $${totalValue.toFixed(2)}`,
      recommendation: "Follow up with customers or mark as lost",
      actions: [
        {
          type: "SEND_NOTIFICATION",
          request: {
            channel: "IN_APP",
            team: "SALES",
            title: "📊 Stale Quotes Review",
            body: `${staleQuotes.length} quotes ($${totalValue.toFixed(0)} total) need follow-up`,
          },
        },
      ],
    });
    
    // Create follow-up tasks for high-value quotes
    for (const quote of staleQuotes.filter(q => (q.subtotal || 0) > 300)) {
      await supabase.from("crm_tasks").insert({
        entity_type: "quote",
        entity_id: quote.id,
        title: `Follow up: $${quote.subtotal?.toFixed(0)} quote for ${quote.customer_name}`,
        description: `Quote sent but not converted. Phone: ${quote.customer_phone || 'N/A'}`,
        assigned_team: "sales",
        priority: 2,
        due_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hour deadline
      });
    }
  }

  // C) DISPATCH: Check delayed runs (30+ mins past scheduled start)
  const now = new Date();
  const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const today = now.toISOString().split("T")[0];
  
  const { data: delayedRuns } = await supabase
    .from("runs")
    .select("id, run_type, scheduled_date, scheduled_window, customer_name, driver_id")
    .in("status", ["SCHEDULED", "ASSIGNED", "EN_ROUTE"])
    .lte("scheduled_date", today)
    .limit(20);

  // Filter for truly delayed runs
  const trulyDelayed = delayedRuns?.filter(run => {
    if (run.scheduled_date < today) return true;
    if (!run.scheduled_window) return false;
    const [startTime] = (run.scheduled_window || "").split("-");
    if (!startTime) return false;
    const [hours, mins] = startTime.split(":").map(Number);
    const scheduledStart = new Date(now);
    scheduledStart.setHours(hours || 8, mins || 0, 0, 0);
    return now > new Date(scheduledStart.getTime() + 30 * 60 * 1000);
  }) || [];

  if (trulyDelayed.length > 0) {
    decisions.push({
      type: "ALERT",
      severity: "HIGH",
      entity_type: "run",
      summary: `${trulyDelayed.length} runs delayed (30+ min past scheduled)`,
      recommendation: "Contact drivers and reschedule or complete immediately",
      actions: [
        {
          type: "SEND_NOTIFICATION",
          request: {
            channel: "IN_APP",
            team: "DISPATCH",
            title: "🚛 Delayed Runs Alert",
            body: `${trulyDelayed.length} runs are significantly behind schedule`,
            priority: "URGENT",
          },
        },
      ],
    });
    
    // Create dispatch tasks
    for (const run of trulyDelayed) {
      await supabase.from("crm_tasks").insert({
        entity_type: "run",
        entity_id: run.id,
        title: `Delayed ${run.run_type}: ${run.customer_name || 'Unknown'}`,
        description: `Run scheduled for ${run.scheduled_date} ${run.scheduled_window || ''} is delayed`,
        assigned_team: "dispatch",
        priority: 1,
      });
    }
  }

  // D) HEAVY RISK: Check high-risk heavy material orders
  const { data: heavyRiskOrders } = await supabase
    .from("orders")
    .select("id, is_heavy_material, weight_risk_level, heavy_material_code")
    .eq("is_heavy_material", true)
    .eq("weight_risk_level", "HIGH")
    .in("status", ["scheduled", "delivered"])
    .limit(10);

  if (heavyRiskOrders && heavyRiskOrders.length > 0) {
    decisions.push({
      type: "TASK",
      severity: "HIGH",
      entity_type: "order",
      summary: `${heavyRiskOrders.length} HIGH risk heavy orders need photo verification`,
      recommendation: "Verify fill line and collect pre-pickup photos before dispatch",
      actions: [
        {
          type: "SEND_NOTIFICATION",
          request: {
            channel: "IN_APP",
            team: "DISPATCH",
            title: "⚠️ Heavy Risk Orders",
            body: `${heavyRiskOrders.length} orders require photo verification before pickup`,
          },
        },
      ],
    });
    
    for (const order of heavyRiskOrders) {
      await supabase.from("crm_tasks").insert({
        entity_type: "order",
        entity_id: order.id,
        title: `Verify fill line: Heavy ${order.heavy_material_code || 'material'}`,
        description: `HIGH risk heavy order. Collect PRE_PICKUP_WIDE and PRE_PICKUP_MATERIAL photos.`,
        assigned_team: "dispatch",
        priority: 1,
      });
    }
  }

  // E) OVERDUE: Check overdue assets (7+ days)
  const { data: overdueAssets } = await supabase
    .from("assets_dumpsters")
    .select("id, asset_code, days_out, current_order_id")
    .eq("asset_status", "deployed")
    .gt("days_out", 7)
    .limit(20);

  if (overdueAssets && overdueAssets.length > 0) {
    decisions.push({
      type: "ALERT",
      severity: overdueAssets.length > 5 ? "HIGH" : "MED",
      entity_type: "asset",
      summary: `${overdueAssets.length} assets overdue (7+ days out)`,
      recommendation: "Schedule pickups or bill for extension days",
      actions: [
        {
          type: "SEND_NOTIFICATION",
          request: {
            channel: "IN_APP",
            team: "BILLING",
            title: "💰 Overdue Assets",
            body: `${overdueAssets.length} dumpsters past 7-day rental - review for billing`,
          },
        },
      ],
    });
    
    // Create billing review task
    await supabase.from("crm_tasks").insert({
      entity_type: "system",
      title: `Review ${overdueAssets.length} overdue assets for billing`,
      description: `Assets: ${overdueAssets.map(a => a.asset_code).join(", ")}`,
      assigned_team: "billing",
      priority: 2,
    });
  }

  // F) APPROVALS: Check aging approval requests (24h+)
  const { data: agingApprovals } = await supabase
    .from("approval_requests")
    .select("id, request_type, entity_type, created_at")
    .eq("status", "pending")
    .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(10);

  if (agingApprovals && agingApprovals.length > 0) {
    decisions.push({
      type: "ESCALATION",
      severity: "HIGH",
      entity_type: "system",
      summary: `${agingApprovals.length} approval requests pending 24h+`,
      recommendation: "Review and approve/deny immediately to unblock operations",
      actions: [
        {
          type: "SEND_NOTIFICATION",
          request: {
            channel: "IN_APP",
            team: "ADMIN",
            title: "🔴 Aging Approvals",
            body: `${agingApprovals.length} requests blocked for 24+ hours`,
            priority: "URGENT",
          },
        },
        {
          type: "SEND_NOTIFICATION",
          request: {
            channel: "IN_APP",
            team: "FINANCE",
            title: "🔴 Pending Approvals",
            body: `${agingApprovals.length} approval requests need your attention`,
            priority: "HIGH",
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
