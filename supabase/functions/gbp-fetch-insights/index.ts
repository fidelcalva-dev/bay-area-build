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

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const mode = await checkGoogleMode(adminClient);

    const { data: configRows } = await adminClient
      .from("config_settings")
      .select("key, value")
      .in("key", ["google.marketing_mode", "google.gbp_account_id", "google.gbp_locations_json"]);

    const config: Record<string, string> = {};
    for (const c of configRows || []) {
      try { config[c.key] = JSON.parse(c.value as string); } catch { config[c.key] = c.value as string; }
    }

    const marketingMode = config["google.marketing_mode"] || "DRY_RUN";

    const body = await req.json();
    const { start_date, end_date } = body;

    if (marketingMode === "DRY_RUN" || mode === "DRY_RUN") {
      return new Response(
        JSON.stringify({
          mode: "DRY_RUN",
          data: {
            locations: [
              {
                market: "Oakland",
                searches_shown: 2400,
                maps_views: 1850,
                search_views: 1200,
                website_clicks: 320,
                calls: 85,
                direction_requests: 145,
                photo_views: 560,
                messages: 12,
              },
              {
                market: "San Jose",
                searches_shown: 1800,
                maps_views: 1200,
                search_views: 890,
                website_clicks: 210,
                calls: 62,
                direction_requests: 98,
                photo_views: 380,
                messages: 8,
              },
              {
                market: "San Francisco",
                searches_shown: 1500,
                maps_views: 980,
                search_views: 720,
                website_clicks: 175,
                calls: 48,
                direction_requests: 82,
                photo_views: 290,
                messages: 5,
              },
            ],
            totals: {
              searches_shown: 5700,
              website_clicks: 705,
              calls: 195,
              direction_requests: 325,
              photo_views: 1230,
            },
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // LIVE mode — call Business Profile Performance API
    const tokenResult = await getValidAccessToken(adminClient, userId);
    if (!tokenResult) {
      return new Response(
        JSON.stringify({ error: "Google account not connected" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let locations: Array<{ market: string; location_id: string }> = [];
    try {
      locations = JSON.parse(config["google.gbp_locations_json"] || "[]");
    } catch { /* empty */ }

    if (locations.length === 0) {
      return new Response(
        JSON.stringify({ error: "No GBP locations configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const startDate = start_date || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    const endDate = end_date || new Date().toISOString().split("T")[0];

    const locationResults = [];
    for (const loc of locations) {
      try {
        // Business Profile Performance API
        const perfResponse = await fetch(
          `https://businessprofileperformance.googleapis.com/v1/${loc.location_id}:fetchMultiDailyMetricsTimeSeries?` +
            new URLSearchParams({
              "dailyMetrics": "WEBSITE_CLICKS",
              "dailyRange.startDate.year": startDate.split("-")[0],
              "dailyRange.startDate.month": String(parseInt(startDate.split("-")[1])),
              "dailyRange.startDate.day": String(parseInt(startDate.split("-")[2])),
              "dailyRange.endDate.year": endDate.split("-")[0],
              "dailyRange.endDate.month": String(parseInt(endDate.split("-")[1])),
              "dailyRange.endDate.day": String(parseInt(endDate.split("-")[2])),
            }),
          {
            headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
          }
        );

        if (perfResponse.ok) {
          const perfData = await perfResponse.json();
          locationResults.push({ market: loc.market, location_id: loc.location_id, data: perfData });
        } else {
          const errText = await perfResponse.text();
          locationResults.push({ market: loc.market, error: errText });
        }
      } catch (e) {
        locationResults.push({ market: loc.market, error: String(e) });
      }
    }

    await adminClient.from("marketing_snapshots").insert({
      source: "GBP",
      date_range: `${startDate}_${endDate}`,
      payload_json: { locations: locationResults },
      fetched_by: userId,
    });

    return new Response(
      JSON.stringify({ mode: "LIVE", data: { locations: locationResults } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[gbp-fetch-insights] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
