import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

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
    const {
      provider_id,
      event_type,
      gps_lat,
      gps_lng,
      speed_mph,
      heading,
      timestamp,
      video_url,
      thumbnail_url,
      truck_id,
      driver_id,
      run_id,
      severity,
      metadata,
      clips,
      webhook_secret,
    } = body;

    // Verify webhook secret if provider_id given
    if (provider_id && webhook_secret) {
      const { data: provider } = await supabase
        .from("camera_providers")
        .select("webhook_secret")
        .eq("id", provider_id)
        .eq("is_active", true)
        .single();

      if (!provider || provider.webhook_secret !== webhook_secret) {
        return new Response(
          JSON.stringify({ error: "Invalid webhook secret" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Resolve truck_id from external truck number if needed
    let resolvedTruckId = truck_id;
    if (!resolvedTruckId && body.truck_number) {
      const { data: truck } = await supabase
        .from("trucks")
        .select("id")
        .eq("truck_number", body.truck_number)
        .single();
      if (truck) resolvedTruckId = truck.id;
    }

    if (!resolvedTruckId) {
      return new Response(
        JSON.stringify({ error: "truck_id or truck_number required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert camera event
    const { data: eventData, error: eventError } = await supabase
      .from("camera_events")
      .insert({
        run_id: run_id || null,
        truck_id: resolvedTruckId,
        driver_id: driver_id || null,
        provider_id: provider_id || null,
        event_type: event_type || "UNKNOWN",
        gps_lat: gps_lat || null,
        gps_lng: gps_lng || null,
        speed_mph: speed_mph || null,
        heading: heading || null,
        video_url: video_url || null,
        thumbnail_url: thumbnail_url || null,
        severity: severity || "INFO",
        metadata: metadata || {},
        event_timestamp: timestamp || new Date().toISOString(),
      })
      .select("id")
      .single();

    if (eventError) throw eventError;
    const eventId = eventData.id;

    // Insert clips if provided
    if (clips && Array.isArray(clips) && clips.length > 0) {
      const clipRows = clips.map((c: { file_url: string; duration_seconds?: number; file_size_bytes?: number }) => ({
        event_id: eventId,
        file_url: c.file_url,
        duration_seconds: c.duration_seconds || null,
        file_size_bytes: c.file_size_bytes || null,
      }));
      await supabase.from("camera_clips").insert(clipRows);
    }

    // Log run event if run_id present
    if (run_id) {
      await supabase.from("run_events").insert({
        run_id,
        event_type: "CAMERA_EVENT_RECEIVED",
        metadata: { camera_event_id: eventId, camera_event_type: event_type },
      });
    }

    // Check safety alert rules
    const { data: rules } = await supabase
      .from("camera_alert_rules")
      .select("*")
      .eq("event_type", event_type || "UNKNOWN")
      .eq("is_active", true);

    if (rules && rules.length > 0) {
      for (const rule of rules) {
        // Create internal alert
        if (rule.notify_dispatch || rule.notify_safety) {
          await supabase.from("alerts").insert({
            alert_type: "CAMERA_SAFETY",
            entity_type: "truck",
            entity_id: resolvedTruckId,
            severity: rule.severity.toLowerCase(),
            title: `Camera Alert: ${event_type}`,
            message: `Fleet camera detected ${event_type} on truck ${resolvedTruckId}${run_id ? ` during run ${run_id}` : ""}`,
            metadata: { camera_event_id: eventId, rule_id: rule.id },
          });
        }

        // Auto-create vehicle issue for critical events
        if (rule.auto_create_issue) {
          await supabase.from("vehicle_issues").insert({
            truck_id: resolvedTruckId,
            reported_by_driver_id: driver_id || null,
            issue_category: "OTHER",
            severity: "SAFETY",
            status: "OPEN",
            description: `Auto-created from camera event: ${event_type}. Speed: ${speed_mph || "N/A"} mph.`,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, event_id: eventId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Camera webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
