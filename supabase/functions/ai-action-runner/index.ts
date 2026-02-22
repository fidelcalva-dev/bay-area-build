import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { action_id, decision } = await req.json();

    if (!action_id || !decision) {
      return new Response(JSON.stringify({ error: "action_id and decision (CONFIRMED|REJECTED) required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the action
    const { data: action, error: actionError } = await supabase
      .from("ai_control_actions")
      .select("*")
      .eq("id", action_id)
      .single();

    if (actionError || !action) {
      return new Response(JSON.stringify({ error: "Action not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user owns the session
    const { data: session } = await supabase
      .from("ai_control_sessions")
      .select("user_id")
      .eq("id", action.session_id)
      .single();

    if (!session || session.user_id !== userId) {
      // Check admin override
      const { data: roleCheck } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleCheck) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (decision === "REJECTED") {
      await supabase
        .from("ai_control_actions")
        .update({ status: "REJECTED" })
        .eq("id", action_id);

      return new Response(
        JSON.stringify({ success: true, status: "REJECTED" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CONFIRMED - Execute safe actions only
    const safeActions = [
      "SUGGEST_CALL",
      "SUGGEST_SMS",
      "SUGGEST_QUOTE",
      "SUGGEST_ASSIGN",
      "SUGGEST_ROUTE",
      "SUGGEST_FACILITY",
      "SUGGEST_PRICE_TIER",
      "SUGGEST_APPROVAL",
      "HOW_TO_GUIDE",
    ];

    if (!safeActions.includes(action.action_type)) {
      await supabase
        .from("ai_control_actions")
        .update({ status: "FAILED" })
        .eq("id", action_id);

      return new Response(
        JSON.stringify({ error: "Action type not permitted for automated execution", status: "FAILED" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In DRY_RUN mode, we log execution intent but don't actually perform actions
    // This is the safety gate -- real execution requires LIVE mode + admin approval
    await supabase
      .from("ai_control_actions")
      .update({ status: "CONFIRMED" })
      .eq("id", action_id);

    // Log to audit
    await supabase.from("audit_logs").insert({
      action: "AI_ACTION_CONFIRMED",
      entity_type: "ai_control_actions",
      entity_id: action_id,
      user_id: userId,
      after_data: {
        action_type: action.action_type,
        payload: action.payload_json,
        decision: "CONFIRMED",
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        status: "CONFIRMED",
        action_type: action.action_type,
        message: "Action confirmed and logged. DRY_RUN mode -- no side effects executed.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-action-runner error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
