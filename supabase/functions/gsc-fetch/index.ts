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
      .in("key", ["google.marketing_mode", "google.gsc_site_url"]);

    const config: Record<string, string> = {};
    for (const c of configRows || []) {
      try { config[c.key] = JSON.parse(c.value as string); } catch { config[c.key] = c.value as string; }
    }

    const marketingMode = config["google.marketing_mode"] || "DRY_RUN";
    const siteUrl = config["google.gsc_site_url"] || "https://calsandumpsterspro.com/";

    const body = await req.json();
    const { start_date, end_date } = body;

    if (marketingMode === "DRY_RUN" || mode === "DRY_RUN") {
      return new Response(
        JSON.stringify({
          mode: "DRY_RUN",
          site_url: siteUrl,
          data: {
            queries: [
              { query: "dumpster rental oakland", clicks: 145, impressions: 3200, ctr: 0.045, position: 4.2 },
              { query: "dumpster rental san jose", clicks: 98, impressions: 2800, ctr: 0.035, position: 5.1 },
              { query: "dumpster rental near me", clicks: 82, impressions: 4500, ctr: 0.018, position: 8.3 },
              { query: "roll off dumpster bay area", clicks: 67, impressions: 1200, ctr: 0.056, position: 3.8 },
              { query: "construction dumpster rental", clicks: 55, impressions: 2100, ctr: 0.026, position: 6.5 },
              { query: "10 yard dumpster rental", clicks: 42, impressions: 980, ctr: 0.043, position: 4.9 },
              { query: "cheap dumpster rental oakland", clicks: 38, impressions: 850, ctr: 0.045, position: 5.2 },
              { query: "dumpster rental san francisco", clicks: 35, impressions: 1900, ctr: 0.018, position: 9.1 },
            ],
            pages: [
              { page: "/", clicks: 210, impressions: 5200, ctr: 0.04, position: 5.5 },
              { page: "/sizes", clicks: 85, impressions: 1800, ctr: 0.047, position: 4.8 },
              { page: "/quote", clicks: 62, impressions: 1200, ctr: 0.052, position: 4.2 },
              { page: "/dumpster-rental-oakland-ca", clicks: 145, impressions: 3200, ctr: 0.045, position: 4.2 },
            ],
            totals: { clicks: 580, impressions: 15800, ctr: 0.037, position: 5.8 },
            devices: [
              { device: "DESKTOP", clicks: 320, impressions: 8500 },
              { device: "MOBILE", clicks: 240, impressions: 6800 },
              { device: "TABLET", clicks: 20, impressions: 500 },
            ],
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // LIVE mode
    const tokenResult = await getValidAccessToken(adminClient, userId);
    if (!tokenResult) {
      return new Response(
        JSON.stringify({ error: "Google account not connected" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const startDate = start_date || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    const endDate = end_date || new Date().toISOString().split("T")[0];

    // Search Console API
    const gscResponse = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["query"],
          rowLimit: 25,
        }),
      }
    );

    if (!gscResponse.ok) {
      const errText = await gscResponse.text();
      console.error("[gsc-fetch] API error:", errText);
      return new Response(
        JSON.stringify({ error: "GSC API error", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const gscData = await gscResponse.json();

    await adminClient.from("marketing_snapshots").insert({
      source: "GSC",
      date_range: `${startDate}_${endDate}`,
      payload_json: gscData,
      fetched_by: userId,
    });

    return new Response(
      JSON.stringify({ mode: "LIVE", site_url: siteUrl, data: gscData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[gsc-fetch] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
