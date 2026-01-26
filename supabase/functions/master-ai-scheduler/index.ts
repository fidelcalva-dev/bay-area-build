import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function is called by pg_cron to enqueue scheduled jobs
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { job_type, priority } = await req.json();

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

    // Enqueue the job
    const { data: jobId, error } = await supabase.rpc("enqueue_ai_job", {
      p_job_type: job_type || "CONTROL_TOWER",
      p_payload: {},
      p_priority: priority || 3,
      p_scheduled_for: new Date().toISOString(),
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ status: "enqueued", job_id: jobId, job_type }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scheduler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
