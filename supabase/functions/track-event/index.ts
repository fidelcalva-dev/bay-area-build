import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple SHA-256 hash
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
      visitor_id,
      session_id,
      event_name,
      page_url,
      properties,
      consent_status = "UNKNOWN",
      is_session_start,
      landing_url,
      referrer_url,
      utm_json,
      gclid,
      device_json,
      timezone,
    } = body;

    if (!visitor_id || !session_id || !event_name) {
      return new Response(
        JSON.stringify({ error: "visitor_id, session_id, event_name required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- IP hashing (server-side only) ---
    let ipHash: string | null = null;
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    // Check if ip_hash is enabled
    const { data: ipConfig } = await supabase
      .from("config_settings")
      .select("value")
      .eq("category", "analytics")
      .eq("key", "ip_hash_enabled")
      .single();

    const ipHashEnabled = ipConfig?.value
      ? JSON.parse(ipConfig.value as string) === true || ipConfig.value === '"true"'
      : true;

    if (ipHashEnabled && clientIp !== "unknown") {
      const salt = Deno.env.get("IP_HASH_SALT") || "calsan-default-salt-2026";
      ipHash = await sha256(clientIp + salt);
    }

    // --- Upsert visitor profile ---
    const utmData = utm_json || properties?.utm_json || null;
    const referrer = referrer_url || properties?.referrer || null;

    const { data: existingVisitor } = await supabase
      .from("visitor_profiles")
      .select("id, visit_count, total_sessions, total_pageviews, first_referrer, first_utm_json")
      .eq("id", visitor_id)
      .single();

    if (!existingVisitor) {
      // New visitor
      await supabase.from("visitor_profiles").insert({
        id: visitor_id,
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        visit_count: 1,
        total_sessions: is_session_start ? 1 : 0,
        total_pageviews: event_name === "page_view" ? 1 : 0,
        first_referrer: referrer,
        last_referrer: referrer,
        first_utm_json: utmData,
        last_utm_json: utmData,
        device_summary: device_json?.device_type || null,
        consent_status,
      });
    } else {
      // Existing visitor — update
      const updates: Record<string, unknown> = {
        last_seen_at: new Date().toISOString(),
        last_referrer: referrer || existingVisitor.first_referrer,
        consent_status,
      };

      if (utmData) updates.last_utm_json = utmData;
      if (is_session_start) {
        updates.visit_count = (existingVisitor.visit_count || 0) + 1;
        updates.total_sessions = (existingVisitor.total_sessions || 0) + 1;
      }
      if (event_name === "page_view") {
        updates.total_pageviews = (existingVisitor.total_pageviews || 0) + 1;
      }

      await supabase
        .from("visitor_profiles")
        .update(updates)
        .eq("id", visitor_id);
    }

    // --- Insert session on session_start ---
    if (is_session_start) {
      await supabase.from("visitor_sessions").insert({
        id: session_id,
        visitor_id,
        started_at: new Date().toISOString(),
        landing_url: landing_url || page_url,
        referrer_url: referrer,
        utm_json: utmData,
        gclid: gclid || null,
        device_json: device_json || null,
        timezone: timezone || null,
        ip_hash: ipHash,
        consent_status,
      });
    }

    // --- Privacy: if consent denied, only store page_view ---
    if (consent_status === "DENIED" && event_name !== "page_view" && event_name !== "session_start") {
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: "consent_denied" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Insert event ---
    await supabase.from("visitor_events").insert({
      session_id,
      visitor_id,
      event_name,
      event_time: new Date().toISOString(),
      page_url,
      properties_json: properties || null,
    });

    // --- Link visitor to lead if lead_id provided ---
    if (properties?.lead_id && properties?.link_source) {
      await supabase.from("lead_visitor_links").upsert(
        {
          lead_id: properties.lead_id,
          visitor_id,
          source: properties.link_source,
          first_linked_at: new Date().toISOString(),
        },
        { onConflict: "lead_id,visitor_id" }
      );

      // Also set visitor_id on sales_leads
      await supabase
        .from("sales_leads")
        .update({ visitor_id })
        .eq("id", properties.lead_id);
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[track-event] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
