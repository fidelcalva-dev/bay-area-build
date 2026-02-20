import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * link-camera-event: resolves camera events to runs based on truck + timestamp overlap.
 * Can be called per-event or as a batch backfill.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { event_id, backfill } = body;

    if (backfill) {
      // Batch: find camera_events with no run_id and resolve them
      const { data: unlinked, error: fetchErr } = await supabase
        .from("camera_events")
        .select("id, truck_id, event_timestamp")
        .is("run_id", null)
        .order("event_timestamp", { ascending: false })
        .limit(500);

      if (fetchErr) throw fetchErr;

      let linked = 0;
      for (const evt of unlinked || []) {
        const runId = await resolveRun(supabase, evt.truck_id, evt.event_timestamp);
        if (runId) {
          await supabase
            .from("camera_events")
            .update({ run_id: runId })
            .eq("id", evt.id);
          linked++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, processed: unlinked?.length || 0, linked }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Single event
    if (!event_id) {
      return new Response(JSON.stringify({ error: "event_id or backfill required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: evt, error: evtErr } = await supabase
      .from("camera_events")
      .select("id, truck_id, event_timestamp, run_id")
      .eq("id", event_id)
      .single();

    if (evtErr || !evt) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (evt.run_id) {
      return new Response(
        JSON.stringify({ success: true, run_id: evt.run_id, already_linked: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const runId = await resolveRun(supabase, evt.truck_id, evt.event_timestamp);

    if (runId) {
      await supabase
        .from("camera_events")
        .update({ run_id: runId })
        .eq("id", event_id);
    }

    return new Response(
      JSON.stringify({ success: true, run_id: runId || null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("link-camera-event error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function resolveRun(supabase: any, truckId: string, timestamp: string): Promise<string | null> {
  // Find a run for this truck that was active at this timestamp
  // Active = started_at <= timestamp AND (completed_at >= timestamp OR completed_at IS NULL AND status IN active states)
  const { data: runs } = await supabase
    .from("runs")
    .select("id, started_at, completed_at, status")
    .eq("truck_id", truckId)
    .lte("started_at", timestamp)
    .in("status", ["EN_ROUTE", "ARRIVED", "ASSIGNED", "COMPLETED"])
    .order("started_at", { ascending: false })
    .limit(5);

  if (!runs?.length) return null;

  for (const run of runs) {
    if (!run.completed_at || run.completed_at >= timestamp) {
      return run.id;
    }
  }

  return null;
}
