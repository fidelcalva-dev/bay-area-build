import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KpiRequest {
  period?: "weekly" | "monthly";
  userId?: string;
  role?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: KpiRequest = await req.json().catch(() => ({}));
    const periodType = body.period || "weekly";

    console.log(`[KPI Evaluator] Running ${periodType} KPI evaluation`);

    // Check compensation mode
    const { data: modeConfig } = await supabase
      .from("config_settings")
      .select("value")
      .eq("key", "compensation.mode")
      .single();

    const mode = modeConfig?.value?.replace(/"/g, '') || "DRY_RUN";
    
    const now = new Date();
    const currentPeriod = now.toISOString().slice(0, 7);
    
    // Calculate date range
    let startDate: Date;
    let endDate = now;
    
    if (periodType === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const results: Array<{ user_id: string; role: string; bonus: number; reason: string }> = [];

    // =============================================
    // CS KPI: Zero Overdue Bonus
    // =============================================
    const { data: csPlan } = await supabase
      .from("compensation_plans")
      .select("*, compensation_rules(*)")
      .eq("role", "cs")
      .eq("is_active", true)
      .single();

    if (csPlan) {
      // Get all CS users
      const { data: csUsers } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["cs", "cs_agent"]);

      for (const csUser of csUsers || []) {
        // Check overdue count for this user's orders
        const { count: overdueCount } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString())
          .gt("balance_due", 0)
          .eq("payment_status", "overdue");

        if (overdueCount === 0) {
          const bonusRule = csPlan.compensation_rules?.find((r: any) => 
            r.rule_name.includes("Zero Overdue") && r.trigger_event === "KPI_PERIOD_END"
          );

          if (bonusRule) {
            const bonusAmount = bonusRule.payout_formula_json?.amount || 25;

            // Check for existing adjustment
            const { data: existing } = await supabase
              .from("compensation_adjustments")
              .select("id")
              .eq("user_id", csUser.user_id)
              .eq("adjustment_type", "BONUS")
              .eq("reason", `${periodType} Zero Overdue Bonus`)
              .gte("created_at", startDate.toISOString())
              .single();

            if (!existing) {
              const { data: adjustment } = await supabase
                .from("compensation_adjustments")
                .insert({
                  user_id: csUser.user_id,
                  adjustment_type: "BONUS",
                  reason: `${periodType} Zero Overdue Bonus`,
                  amount: bonusAmount,
                  period: currentPeriod,
                  status: "PENDING"
                })
                .select()
                .single();

              if (adjustment) {
                results.push({
                  user_id: csUser.user_id,
                  role: "cs",
                  bonus: bonusAmount,
                  reason: `${periodType} Zero Overdue Bonus`
                });

                await supabase.from("compensation_audit_log").insert({
                  action: "BONUS_CREATED",
                  target_user_id: csUser.user_id,
                  entity_type: "compensation_adjustments",
                  entity_id: adjustment.id,
                  after_data: { amount: bonusAmount, reason: `${periodType} Zero Overdue Bonus` },
                  details_json: { mode, trigger: "KPI_PERIOD_END", period_type: periodType }
                });
              }
            }
          }
        }
      }
    }

    // =============================================
    // DISPATCH KPI: Efficiency Bonus
    // =============================================
    const { data: dispatchPlan } = await supabase
      .from("compensation_plans")
      .select("*, compensation_rules(*)")
      .eq("role", "dispatcher")
      .eq("is_active", true)
      .single();

    if (dispatchPlan && periodType === "weekly") {
      // Get all dispatchers
      const { data: dispatchers } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "dispatcher");

      for (const dispatcher of dispatchers || []) {
        // Calculate on-time rate
        const { count: totalRuns } = await supabase
          .from("runs")
          .select("id", { count: "exact", head: true })
          .eq("created_by", dispatcher.user_id)
          .eq("status", "COMPLETED")
          .gte("completed_at", startDate.toISOString());

        const { count: onTimeRuns } = await supabase
          .from("runs")
          .select("id", { count: "exact", head: true })
          .eq("created_by", dispatcher.user_id)
          .eq("status", "COMPLETED")
          .gte("completed_at", startDate.toISOString())
          .lte("actual_duration_minutes", 120); // Consider on-time if under 2 hours

        const efficiency = totalRuns && totalRuns > 0 ? (onTimeRuns || 0) / totalRuns : 0;

        if (efficiency >= 0.95 && totalRuns && totalRuns >= 5) {
          const bonusAmount = dispatchPlan.rules_json?.weekly_efficiency_bonus || 50;

          const { data: existing } = await supabase
            .from("compensation_adjustments")
            .select("id")
            .eq("user_id", dispatcher.user_id)
            .eq("adjustment_type", "BONUS")
            .eq("reason", "Weekly Efficiency Bonus")
            .gte("created_at", startDate.toISOString())
            .single();

          if (!existing) {
            const { data: adjustment } = await supabase
              .from("compensation_adjustments")
              .insert({
                user_id: dispatcher.user_id,
                adjustment_type: "BONUS",
                reason: "Weekly Efficiency Bonus",
                amount: bonusAmount,
                period: currentPeriod,
                status: "PENDING"
              })
              .select()
              .single();

            if (adjustment) {
              results.push({
                user_id: dispatcher.user_id,
                role: "dispatcher",
                bonus: bonusAmount,
                reason: `Weekly Efficiency Bonus (${Math.round(efficiency * 100)}% on-time)`
              });

              await supabase.from("compensation_audit_log").insert({
                action: "BONUS_CREATED",
                target_user_id: dispatcher.user_id,
                entity_type: "compensation_adjustments",
                entity_id: adjustment.id,
                after_data: { amount: bonusAmount, efficiency },
                details_json: { mode, trigger: "KPI_PERIOD_END", period_type: periodType }
              });
            }
          }
        }
      }
    }

    // =============================================
    // FINANCE KPI: Monthly AR Target
    // =============================================
    const { data: financePlan } = await supabase
      .from("compensation_plans")
      .select("*, compensation_rules(*)")
      .eq("role", "finance")
      .eq("is_active", true)
      .single();

    if (financePlan && periodType === "monthly") {
      // Get all finance users
      const { data: financeUsers } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["finance", "billing_specialist", "finance_admin"]);

      // Calculate overall AR collection rate
      const { data: invoiceStats } = await supabase
        .from("invoices")
        .select("amount_due, amount_paid")
        .gte("created_at", startDate.toISOString());

      const totalDue = invoiceStats?.reduce((sum, inv) => sum + (inv.amount_due || 0), 0) || 0;
      const totalPaid = invoiceStats?.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0;
      const collectionRate = totalDue > 0 ? totalPaid / totalDue : 0;

      if (collectionRate >= 0.95) {
        const arRule = financePlan.compensation_rules?.find((r: any) => 
          r.rule_name.includes("AR Target") && r.trigger_event === "KPI_PERIOD_END"
        );

        const bonusAmount = arRule?.payout_formula_json?.amount || 100;

        for (const financeUser of financeUsers || []) {
          const { data: existing } = await supabase
            .from("compensation_adjustments")
            .select("id")
            .eq("user_id", financeUser.user_id)
            .eq("adjustment_type", "BONUS")
            .eq("reason", "Monthly AR Target Bonus")
            .gte("created_at", startDate.toISOString())
            .single();

          if (!existing) {
            const { data: adjustment } = await supabase
              .from("compensation_adjustments")
              .insert({
                user_id: financeUser.user_id,
                adjustment_type: "BONUS",
                reason: "Monthly AR Target Bonus",
                amount: bonusAmount,
                period: currentPeriod,
                status: "PENDING"
              })
              .select()
              .single();

            if (adjustment) {
              results.push({
                user_id: financeUser.user_id,
                role: "finance",
                bonus: bonusAmount,
                reason: `Monthly AR Target Bonus (${Math.round(collectionRate * 100)}% collected)`
              });

              await supabase.from("compensation_audit_log").insert({
                action: "BONUS_CREATED",
                target_user_id: financeUser.user_id,
                entity_type: "compensation_adjustments",
                entity_id: adjustment.id,
                after_data: { amount: bonusAmount, collection_rate: collectionRate },
                details_json: { mode, trigger: "KPI_PERIOD_END", period_type: periodType }
              });
            }
          }
        }
      }
    }

    console.log(`[KPI Evaluator] Created ${results.length} bonuses for ${periodType} period`);

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        period_type: periodType,
        bonuses_created: results.length,
        details: results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[KPI Evaluator] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
