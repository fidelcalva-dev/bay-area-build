import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getValidAccessToken, checkGoogleMode } from "../_shared/google-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Check mode
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const mode = await checkGoogleMode(adminClient);

    // Get config
    const { data: configRows } = await adminClient
      .from("config_settings")
      .select("key, value")
      .in("key", ["google.marketing_mode", "google.ga4_property_id"]);

    const config: Record<string, string> = {};
    for (const c of configRows || []) {
      try { config[c.key] = JSON.parse(c.value as string); } catch { config[c.key] = c.value as string; }
    }

    const marketingMode = config["google.marketing_mode"] || "DRY_RUN";
    const propertyId = config["google.ga4_property_id"];

    if (!propertyId && marketingMode !== "DRY_RUN") {
      return new Response(
        JSON.stringify({ error: "GA4 property ID not configured", mode: marketingMode }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { start_date, end_date } = body;

    // DRY_RUN mode — return mock data
    if (marketingMode === "DRY_RUN" || mode === "DRY_RUN") {
      return new Response(
        JSON.stringify({
          mode: "DRY_RUN",
          property_id: propertyId,
          data: {
            users: 1250,
            sessions: 1890,
            engaged_sessions: 1120,
            engagement_rate: 0.593,
            bounce_rate: 0.407,
            avg_session_duration: 145,
            conversions: {
              quote_started: 85,
              quote_completed: 42,
              click_call: 28,
              payment_started: 15,
              payment_completed: 8,
            },
            traffic_sources: [
              { source: "google", medium: "organic", sessions: 680 },
              { source: "(direct)", medium: "(none)", sessions: 520 },
              { source: "google", medium: "cpc", sessions: 320 },
              { source: "facebook", medium: "referral", sessions: 85 },
            ],
            top_pages: [
              { page: "/", sessions: 890, avg_time: 32 },
              { page: "/quote", sessions: 320, avg_time: 180 },
              { page: "/sizes", sessions: 210, avg_time: 95 },
              { page: "/pricing", sessions: 185, avg_time: 75 },
            ],
            date_range: { start: start_date || "2026-01-18", end: end_date || "2026-02-17" },
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // LIVE mode — call GA4 Data API
    const tokenResult = await getValidAccessToken(adminClient, userId);
    if (!tokenResult) {
      return new Response(
        JSON.stringify({ error: "Google account not connected or token expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const startDate = start_date || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    const endDate = end_date || new Date().toISOString().split("T")[0];

    // GA4 Data API v1beta runReport
    const ga4Response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "engagedSessions" },
            { name: "engagementRate" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
          ],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
        }),
      }
    );

    if (!ga4Response.ok) {
      const errText = await ga4Response.text();
      console.error("[ga4-fetch] API error:", errText);
      return new Response(
        JSON.stringify({ error: "GA4 API error", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ga4Data = await ga4Response.json();

    // Cache snapshot
    await adminClient.from("marketing_snapshots").insert({
      source: "GA4",
      date_range: `${startDate}_${endDate}`,
      payload_json: ga4Data,
      fetched_by: userId,
    });

    return new Response(
      JSON.stringify({ mode: "LIVE", property_id: propertyId, data: ga4Data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[ga4-fetch] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
