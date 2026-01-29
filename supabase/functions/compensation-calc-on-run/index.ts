import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RunEvent {
  runId: string;
  driverId?: string;
  dispatcherId?: string;
  onTime: boolean;
  lateMinutes?: number;
  hasJustification?: boolean;
  hasPod?: boolean;
  hasDumpTicket?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RunEvent = await req.json();
    const { runId, driverId, dispatcherId, onTime, lateMinutes, hasJustification, hasPod, hasDumpTicket } = body;

    console.log(`[Compensation] Processing run ${runId}, driver: ${driverId}, onTime: ${onTime}`);

    // Check compensation mode
    const { data: modeConfig } = await supabase
      .from("config_settings")
      .select("value")
      .eq("key", "compensation.mode")
      .single();

    const mode = modeConfig?.value?.replace(/"/g, '') || "DRY_RUN";

    // Get run details
    const { data: run, error: runError } = await supabase
      .from("runs")
      .select("*")
      .eq("id", runId)
      .single();

    if (runError || !run) {
      console.error("Run not found:", runError);
      return new Response(
        JSON.stringify({ error: "Run not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<{ user_id: string; role: string; payout: number; rule: string }> = [];
    const currentPeriod = new Date().toISOString().slice(0, 7);

    // =============================================
    // DRIVER COMPENSATION
    // =============================================
    const actualDriverId = driverId || run.driver_id;
    
    if (actualDriverId) {
      const { data: driverPlan } = await supabase
        .from("compensation_plans")
        .select("*, compensation_rules(*)")
        .eq("role", "driver")
        .eq("is_active", true)
        .single();

      if (driverPlan) {
        let driverPayout = 0;
        const rulesApplied: string[] = [];

        const driverRules = driverPlan.compensation_rules?.filter((r: any) => 
          r.is_active && r.trigger_event === "RUN_COMPLETED"
        ) || [];

        for (const rule of driverRules) {
          const formula = rule.payout_formula_json;
          
          if (rule.rule_name.includes("Base Run")) {
            driverPayout += formula.amount || 25;
            rulesApplied.push("Base Run Pay");
          }
          
          if (rule.rule_name.includes("On-Time") && onTime) {
            driverPayout += formula.amount || 10;
            rulesApplied.push("On-Time Bonus");
          }
          
          if (rule.rule_name.includes("Documentation") && hasPod && hasDumpTicket) {
            driverPayout += formula.amount || 5;
            rulesApplied.push("Complete Docs Bonus");
          }
        }

        if (driverPayout !== 0) {
          // Check for existing earning
          const { data: existing } = await supabase
            .from("compensation_earnings")
            .select("id")
            .eq("entity_type", "run")
            .eq("entity_id", runId)
            .eq("user_id", actualDriverId)
            .single();

          if (!existing) {
            const { data: earning } = await supabase
              .from("compensation_earnings")
              .insert({
                user_id: actualDriverId,
                role: "driver",
                plan_id: driverPlan.id,
                entity_type: "run",
                entity_id: runId,
                gross_amount: driverPayout,
                payout_amount: driverPayout,
                calculation_details: {
                  on_time: onTime,
                  has_pod: hasPod,
                  has_dump_ticket: hasDumpTicket,
                  rules_applied: rulesApplied,
                  mode
                },
                period: currentPeriod
              })
              .select()
              .single();

            if (earning) {
              results.push({
                user_id: actualDriverId,
                role: "driver",
                payout: driverPayout,
                rule: rulesApplied.join(", ")
              });

              await supabase.from("compensation_audit_log").insert({
                action: "EARNING_CREATED",
                target_user_id: actualDriverId,
                entity_type: "compensation_earnings",
                entity_id: earning.id,
                after_data: { payout_amount: driverPayout },
                details_json: { mode, trigger: "RUN_COMPLETED", run_id: runId }
              });
            }
          }
        }
      }
    }

    // =============================================
    // DISPATCH COMPENSATION
    // =============================================
    const actualDispatcherId = dispatcherId || run.created_by;
    
    if (actualDispatcherId) {
      const { data: dispatchPlan } = await supabase
        .from("compensation_plans")
        .select("*, compensation_rules(*)")
        .eq("role", "dispatcher")
        .eq("is_active", true)
        .single();

      if (dispatchPlan) {
        let dispatchPayout = 0;
        const rulesApplied: string[] = [];

        const dispatchRules = dispatchPlan.compensation_rules?.filter((r: any) => 
          r.is_active && r.trigger_event === "RUN_COMPLETED"
        ) || [];

        for (const rule of dispatchRules) {
          const formula = rule.payout_formula_json;
          
          if (rule.rule_name.includes("On-Time") && onTime) {
            dispatchPayout += formula.amount || 15;
            rulesApplied.push("On-Time Run Bonus");
          }
          
          if (rule.rule_name.includes("Late") && !onTime && lateMinutes && lateMinutes >= 30 && !hasJustification) {
            dispatchPayout += formula.amount || -10;
            rulesApplied.push("Late Run Penalty");
          }
        }

        if (dispatchPayout !== 0) {
          const { data: existing } = await supabase
            .from("compensation_earnings")
            .select("id")
            .eq("entity_type", "run")
            .eq("entity_id", runId)
            .eq("user_id", actualDispatcherId)
            .single();

          if (!existing) {
            const { data: earning } = await supabase
              .from("compensation_earnings")
              .insert({
                user_id: actualDispatcherId,
                role: "dispatcher",
                plan_id: dispatchPlan.id,
                entity_type: "run",
                entity_id: runId,
                gross_amount: Math.abs(dispatchPayout),
                payout_amount: dispatchPayout,
                calculation_details: {
                  on_time: onTime,
                  late_minutes: lateMinutes,
                  has_justification: hasJustification,
                  rules_applied: rulesApplied,
                  mode
                },
                period: currentPeriod
              })
              .select()
              .single();

            if (earning) {
              results.push({
                user_id: actualDispatcherId,
                role: "dispatcher",
                payout: dispatchPayout,
                rule: rulesApplied.join(", ")
              });

              await supabase.from("compensation_audit_log").insert({
                action: dispatchPayout < 0 ? "PENALTY_CREATED" : "EARNING_CREATED",
                target_user_id: actualDispatcherId,
                entity_type: "compensation_earnings",
                entity_id: earning.id,
                after_data: { payout_amount: dispatchPayout },
                details_json: { mode, trigger: "RUN_COMPLETED", run_id: runId }
              });
            }
          }
        }
      }
    }

    console.log(`[Compensation] Created ${results.length} earnings for run ${runId}`);

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        earnings_created: results.length,
        details: results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[Compensation] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
