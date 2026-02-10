import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConversionRequest {
  gclid: string;
  conversionAction?: string;
  conversionDateTime: string;
  conversionValue: number;
  currencyCode?: string;
  orderId?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body: ConversionRequest = await req.json();
    const { gclid, conversionValue, conversionDateTime, currencyCode = "USD", orderId } = body;

    if (!gclid) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "No gclid — cannot upload offline conversion" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check mode
    const { data: modeConfig } = await supabase
      .from("config_settings")
      .select("value")
      .eq("category", "ads")
      .eq("key", "mode")
      .maybeSingle();

    const mode = modeConfig?.value ? JSON.parse(modeConfig.value as string) : "DRY_RUN";

    if (mode !== "LIVE") {
      await supabase.from("ads_sync_log").insert({
        sync_type: "conversion_upload",
        status: "skipped",
        records_processed: 0,
        error_message: `DRY_RUN: would upload conversion gclid=${gclid} value=${conversionValue}`,
      });

      return new Response(
        JSON.stringify({ success: true, mode: "DRY_RUN", message: "Conversion logged but not uploaded" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check secrets
    const clientId = Deno.env.get("GOOGLE_ADS_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_ADS_CLIENT_SECRET");
    const developerToken = Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN");
    const refreshToken = Deno.env.get("GOOGLE_ADS_REFRESH_TOKEN");
    const customerId = Deno.env.get("GOOGLE_ADS_CUSTOMER_ID");

    if (!clientId || !clientSecret || !developerToken || !refreshToken || !customerId) {
      await supabase.from("ads_sync_log").insert({
        sync_type: "conversion_upload",
        status: "failed",
        records_processed: 0,
        error_message: "Missing Google Ads API credentials",
      });

      return new Response(
        JSON.stringify({ success: false, error: "Google Ads credentials not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get conversion action from config
    const { data: actionsConfig } = await supabase
      .from("config_settings")
      .select("value")
      .eq("category", "ads")
      .eq("key", "conversion_actions")
      .maybeSingle();

    let conversionActionName = body.conversionAction;
    if (!conversionActionName && actionsConfig?.value) {
      try {
        const actions = JSON.parse(actionsConfig.value as string);
        conversionActionName = actions["payment_captured"] || actions["default"];
      } catch { /* use default */ }
    }

    if (!conversionActionName) {
      conversionActionName = `customers/${customerId.replace(/-/g, "")}/conversionActions/0`;
    }

    // OAuth token
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
      throw new Error(`OAuth error: ${tokenData.error_description || tokenData.error}`);
    }

    // Upload conversion
    const cleanCustomerId = customerId.replace(/-/g, "");
    const uploadRes = await fetch(
      `https://googleads.googleapis.com/v18/customers/${cleanCustomerId}:uploadClickConversions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.access_token}`,
          "developer-token": developerToken,
        },
        body: JSON.stringify({
          conversions: [
            {
              gclid,
              conversionAction: conversionActionName,
              conversionDateTime,
              conversionValue,
              currencyCode,
              orderId: orderId || undefined,
            },
          ],
          partialFailure: true,
        }),
      }
    );

    const uploadResult = await uploadRes.json();
    const hasErrors = uploadResult.partialFailureError;

    await supabase.from("ads_sync_log").insert({
      sync_type: "conversion_upload",
      status: hasErrors ? "partial" : "completed",
      records_processed: 1,
      error_message: hasErrors ? JSON.stringify(uploadResult.partialFailureError) : null,
      metadata: { gclid, conversionValue, orderId },
    });

    return new Response(
      JSON.stringify({
        success: !hasErrors,
        mode: "LIVE",
        result: uploadResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[google-ads-upload-conversion] Error:", errMsg);

    await supabase.from("ads_sync_log").insert({
      sync_type: "conversion_upload",
      status: "failed",
      records_processed: 0,
      error_message: errMsg,
    });

    return new Response(
      JSON.stringify({ success: false, error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
