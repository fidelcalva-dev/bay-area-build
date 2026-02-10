import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check ads mode
    const { data: modeConfig } = await supabase
      .from("config_settings")
      .select("value")
      .eq("category", "ads")
      .eq("key", "mode")
      .maybeSingle();

    const mode = modeConfig?.value ? JSON.parse(modeConfig.value as string) : "DRY_RUN";

    if (mode !== "LIVE") {
      await supabase.from("ads_sync_log").insert({
        sync_type: "metrics_sync",
        status: "skipped",
        records_processed: 0,
        duration_ms: Date.now() - startTime,
        error_message: "DRY_RUN mode — no API calls made",
      });

      return new Response(
        JSON.stringify({ success: true, mode: "DRY_RUN", message: "Sync skipped in DRY_RUN mode" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for required secrets
    const clientId = Deno.env.get("GOOGLE_ADS_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_ADS_CLIENT_SECRET");
    const developerToken = Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN");
    const refreshToken = Deno.env.get("GOOGLE_ADS_REFRESH_TOKEN");
    const customerId = Deno.env.get("GOOGLE_ADS_CUSTOMER_ID");

    if (!clientId || !clientSecret || !developerToken || !refreshToken || !customerId) {
      const missing = [
        !clientId && "GOOGLE_ADS_CLIENT_ID",
        !clientSecret && "GOOGLE_ADS_CLIENT_SECRET",
        !developerToken && "GOOGLE_ADS_DEVELOPER_TOKEN",
        !refreshToken && "GOOGLE_ADS_REFRESH_TOKEN",
        !customerId && "GOOGLE_ADS_CUSTOMER_ID",
      ].filter(Boolean);

      await supabase.from("ads_sync_log").insert({
        sync_type: "metrics_sync",
        status: "failed",
        records_processed: 0,
        duration_ms: Date.now() - startTime,
        error_message: `Missing secrets: ${missing.join(", ")}`,
      });

      return new Response(
        JSON.stringify({ success: false, error: `Missing credentials: ${missing.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Get OAuth access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error(`OAuth token error: ${tokenData.error_description || tokenData.error}`);
    }

    // Step 2: Query Google Ads API via GAQL
    const cleanCustomerId = customerId.replace(/-/g, "");
    const gaqlQuery = `
      SELECT 
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        segments.date
      FROM campaign 
      WHERE segments.date DURING LAST_7_DAYS
      ORDER BY segments.date DESC
    `;

    const searchRes = await fetch(
      `https://googleads.googleapis.com/v18/customers/${cleanCustomerId}/googleAds:searchStream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.access_token}`,
          "developer-token": developerToken,
        },
        body: JSON.stringify({ query: gaqlQuery }),
      }
    );

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      throw new Error(`Google Ads API error (${searchRes.status}): ${errText}`);
    }

    const searchData = await searchRes.json();
    let recordsProcessed = 0;

    // Step 3: Upsert metrics
    for (const batch of searchData) {
      if (!batch.results) continue;
      for (const row of batch.results) {
        const campaignId = row.campaign?.id;
        const date = row.segments?.date;
        if (!campaignId || !date) continue;

        const metrics = row.metrics || {};
        const costMicros = Number(metrics.cost_micros || 0);

        // Find matching campaign in our DB by google_campaign_id
        const { data: dbCampaign } = await supabase
          .from("ads_campaigns")
          .select("id")
          .eq("google_campaign_id", String(campaignId))
          .maybeSingle();

        if (!dbCampaign) continue;

        // Upsert into ads_metrics
        const metricsRow = {
          campaign_id: dbCampaign.id,
          date,
          impressions: Number(metrics.impressions || 0),
          clicks: Number(metrics.clicks || 0),
          cost: costMicros / 1_000_000,
          conversions: Number(metrics.conversions || 0),
          conversion_value: Number(metrics.conversions_value || 0),
          ctr: Number(metrics.impressions || 0) > 0
            ? (Number(metrics.clicks || 0) / Number(metrics.impressions || 0)) * 100
            : 0,
          cpc: Number(metrics.clicks || 0) > 0
            ? (costMicros / 1_000_000) / Number(metrics.clicks || 0)
            : 0,
          cpa: Number(metrics.conversions || 0) > 0
            ? (costMicros / 1_000_000) / Number(metrics.conversions || 0)
            : null,
          roas: costMicros > 0
            ? Number(metrics.conversions_value || 0) / (costMicros / 1_000_000)
            : null,
        };

        // Check existing
        const { data: existing } = await supabase
          .from("ads_metrics")
          .select("id")
          .eq("campaign_id", dbCampaign.id)
          .eq("date", date)
          .maybeSingle();

        if (existing) {
          await supabase.from("ads_metrics").update(metricsRow).eq("id", existing.id);
        } else {
          await supabase.from("ads_metrics").insert(metricsRow);
        }

        recordsProcessed++;
      }
    }

    // Log success
    await supabase.from("ads_sync_log").insert({
      sync_type: "metrics_sync",
      status: "completed",
      records_processed: recordsProcessed,
      duration_ms: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({ success: true, mode: "LIVE", records_processed: recordsProcessed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[google-ads-sync-metrics] Error:", errMsg);

    await supabase.from("ads_sync_log").insert({
      sync_type: "metrics_sync",
      status: "failed",
      records_processed: 0,
      duration_ms: Date.now() - startTime,
      error_message: errMsg,
    });

    return new Response(
      JSON.stringify({ success: false, error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
