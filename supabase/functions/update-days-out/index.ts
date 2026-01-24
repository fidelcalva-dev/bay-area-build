// Edge function to update days_out for deployed dumpsters
// Scheduled to run daily via cron

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("[update-days-out] Starting daily days_out update...");

    // Call the database function to update days_out
    const { error: updateError } = await supabase.rpc("update_assets_days_out");

    if (updateError) {
      console.error("[update-days-out] RPC error:", updateError);
      // Fallback: direct update
      const { data: deployed, error: fetchError } = await supabase
        .from("assets_dumpsters")
        .select("id, deployed_at")
        .eq("asset_status", "deployed")
        .not("deployed_at", "is", null);

      if (fetchError) {
        throw new Error(`Failed to fetch deployed assets: ${fetchError.message}`);
      }

      let updated = 0;
      const now = new Date();

      for (const asset of deployed || []) {
        const deployedAt = new Date(asset.deployed_at);
        const daysOut = Math.floor((now.getTime() - deployedAt.getTime()) / (1000 * 60 * 60 * 24));

        await supabase
          .from("assets_dumpsters")
          .update({ days_out: daysOut })
          .eq("id", asset.id);

        updated++;
      }

      console.log(`[update-days-out] Updated ${updated} assets via fallback`);

      return new Response(
        JSON.stringify({ success: true, updated, method: "fallback" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for overdue assets and create alerts
    const { data: overdueAssets } = await supabase
      .from("assets_dumpsters")
      .select(`
        id,
        asset_code,
        days_out,
        current_order_id,
        overdue_notified
      `)
      .eq("asset_status", "deployed")
      .gt("days_out", 7)
      .eq("overdue_notified", false);

    const alertsCreated = [];

    for (const asset of overdueAssets || []) {
      // Check if alert already exists
      const { data: existingAlert } = await supabase
        .from("alerts")
        .select("id")
        .eq("entity_type", "asset")
        .eq("entity_id", asset.id)
        .eq("alert_type", "overdue_rental")
        .is("resolved_at", null)
        .single();

      if (!existingAlert) {
        // Create new alert
        await supabase.from("alerts").insert({
          alert_type: "overdue_rental",
          entity_type: "asset",
          entity_id: asset.id,
          severity: asset.days_out > 14 ? "critical" : "high",
          title: `Overdue: ${asset.asset_code} (${asset.days_out} days)`,
          message: `Dumpster ${asset.asset_code} has been deployed for ${asset.days_out} days, exceeding the standard rental period.`,
          metadata: {
            asset_code: asset.asset_code,
            days_out: asset.days_out,
            order_id: asset.current_order_id,
          },
        });

        // Mark as notified
        await supabase
          .from("assets_dumpsters")
          .update({ overdue_notified: true })
          .eq("id", asset.id);

        alertsCreated.push(asset.asset_code);
      }
    }

    console.log(`[update-days-out] Complete. Alerts created for: ${alertsCreated.join(", ") || "none"}`);

    return new Response(
      JSON.stringify({
        success: true,
        method: "rpc",
        alertsCreated: alertsCreated.length,
        overdueAssets: overdueAssets?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[update-days-out] Error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
