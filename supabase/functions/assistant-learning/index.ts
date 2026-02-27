import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Check mode from config_settings
    const { data: configRow } = await supabase
      .from("config_settings")
      .select("value")
      .eq("category", "assistant_learning")
      .eq("key", "mode")
      .maybeSingle();

    const mode = configRow?.value
      ? JSON.parse(configRow.value as string)
      : "OFF";

    if (mode === "OFF") {
      return new Response(
        JSON.stringify({ status: "skipped", reason: "mode_off" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    // Validate — no PII fields allowed
    const row = {
      session_id: body.session_id || null,
      lead_id: body.lead_id || null,
      user_type: body.user_type || null,
      project_type: body.project_type || null,
      material_type: body.material_type || null,
      recommended_size: body.recommended_size || null,
      selected_size: body.selected_size || null,
      confidence: body.confidence || null,
      converted_to_quote: body.converted_to_quote ?? false,
      converted_to_order: body.converted_to_order ?? false,
      revenue_cents: body.revenue_cents || null,
      margin_band: body.margin_band || null,
      ai_mode: mode,
      drop_off_step: body.drop_off_step || null,
    };

    if (mode === "DRY_RUN") {
      // DRY_RUN: insert minimal row (no revenue/margin) so dashboard has data
      const minimalRow = {
        session_id: row.session_id,
        lead_id: row.lead_id,
        user_type: row.user_type,
        project_type: row.project_type,
        material_type: row.material_type,
        recommended_size: row.recommended_size,
        selected_size: row.selected_size,
        confidence: row.confidence,
        converted_to_quote: false,
        converted_to_order: false,
        revenue_cents: null,
        margin_band: null,
        ai_mode: "DRY_RUN",
        drop_off_step: row.drop_off_step,
      };

      const { data: dryData, error: dryErr } = await supabase
        .from("assistant_learning")
        .insert(minimalRow)
        .select("id")
        .single();

      if (dryErr) {
        console.error("[assistant-learning] DRY_RUN insert error:", dryErr);
        return new Response(
          JSON.stringify({ status: "dry_run_error", message: dryErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ status: "dry_run", recorded: true, id: dryData.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // LIVE mode — insert full row via service role (bypasses RLS)
    const { data, error } = await supabase
      .from("assistant_learning")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error("[assistant-learning] Insert error:", error);
      return new Response(
        JSON.stringify({ status: "error", message: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ status: "recorded", id: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[assistant-learning] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
