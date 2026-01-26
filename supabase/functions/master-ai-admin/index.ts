import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  // Verify admin auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  try {
    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", claims.claims.sub);

    const isAdmin = userRoles?.some((r) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case "get_status": {
        // Get config
        const { data: configs } = await supabase
          .from("config_settings")
          .select("key, value")
          .eq("category", "master_ai");

        const configMap = configs?.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {}) || {};

        // Get queue stats
        const { count: pendingJobs } = await supabase
          .from("ai_jobs")
          .select("id", { count: "exact", head: true })
          .eq("status", "PENDING");

        const { count: runningJobs } = await supabase
          .from("ai_jobs")
          .select("id", { count: "exact", head: true })
          .eq("status", "RUNNING");

        const { count: failedJobs } = await supabase
          .from("ai_jobs")
          .select("id", { count: "exact", head: true })
          .eq("status", "FAILED");

        // Recent decisions
        const { data: recentDecisions } = await supabase
          .from("ai_decisions")
          .select("id, decision_type, severity, entity_type, summary, created_at")
          .order("created_at", { ascending: false })
          .limit(10);

        return new Response(
          JSON.stringify({
            config: configMap,
            queue: { pending: pendingJobs || 0, running: runningJobs || 0, failed: failedJobs || 0 },
            recent_decisions: recentDecisions || [],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "trigger_job": {
        const { job_type, priority } = params;
        const { data: jobId } = await supabase.rpc("enqueue_ai_job", {
          p_job_type: job_type,
          p_payload: { triggered_by: "admin" },
          p_priority: priority || 1,
          p_scheduled_for: new Date().toISOString(),
        });

        return new Response(
          JSON.stringify({ status: "enqueued", job_id: jobId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "retry_job": {
        const { job_id } = params;
        await supabase
          .from("ai_jobs")
          .update({ status: "PENDING", attempt_count: 0, locked_at: null, locked_by: null })
          .eq("id", job_id);

        return new Response(
          JSON.stringify({ status: "retried", job_id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update_config": {
        const { key, value } = params;
        await supabase
          .from("config_settings")
          .update({ value: JSON.stringify(value) })
          .eq("category", "master_ai")
          .eq("key", key);

        return new Response(
          JSON.stringify({ status: "updated", key }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_jobs": {
        const { status, limit } = params;
        let query = supabase
          .from("ai_jobs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit || 50);

        if (status) {
          query = query.eq("status", status);
        }

        const { data: jobs } = await query;
        return new Response(
          JSON.stringify({ jobs: jobs || [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_decisions": {
        const { severity, limit } = params;
        let query = supabase
          .from("ai_decisions")
          .select(`
            *,
            ai_actions(*)
          `)
          .order("created_at", { ascending: false })
          .limit(limit || 50);

        if (severity) {
          query = query.eq("severity", severity);
        }

        const { data: decisions } = await query;
        return new Response(
          JSON.stringify({ decisions: decisions || [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_notifications": {
        const { status, limit } = params;
        let query = supabase
          .from("notifications_outbox")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit || 50);

        if (status) {
          query = query.eq("status", status);
        }

        const { data: notifications } = await query;
        return new Response(
          JSON.stringify({ notifications: notifications || [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_kpis": {
        const { days } = params;
        const startDate = new Date(Date.now() - (days || 7) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        const { data: snapshots } = await supabase
          .from("kpi_snapshots")
          .select("*")
          .gte("snapshot_date", startDate)
          .order("snapshot_date", { ascending: true });

        return new Response(
          JSON.stringify({ snapshots: snapshots || [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Admin action error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
