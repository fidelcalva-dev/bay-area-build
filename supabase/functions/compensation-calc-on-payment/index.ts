import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentEvent {
  paymentId: string;
  orderId: string;
  amount: number;
  customerId?: string;
  isOverdueRecovery?: boolean;
  daysOverdue?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: PaymentEvent = await req.json();
    const { paymentId, orderId, amount, isOverdueRecovery, daysOverdue } = body;

    console.log(`[Compensation] Processing payment ${paymentId} for order ${orderId}, amount: $${amount}`);

    // Check compensation mode
    const { data: modeConfig } = await supabase
      .from("config_settings")
      .select("value")
      .eq("key", "compensation.mode")
      .single();

    const mode = modeConfig?.value?.replace(/"/g, '') || "DRY_RUN";
    console.log(`[Compensation] Mode: ${mode}`);

    // Get order details with sales owner
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        quotes(
          created_by,
          customer_name,
          subtotal,
          created_at
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<{ user_id: string; role: string; payout: number; rule: string }> = [];

    // =============================================
    // SALES COMMISSION
    // =============================================
    const salesUserId = order.quotes?.created_by || order.created_by;
    
    if (salesUserId) {
      // Get sales plan and rules
      const { data: salesPlan } = await supabase
        .from("compensation_plans")
        .select("*, compensation_rules(*)")
        .eq("role", "sales")
        .eq("is_active", true)
        .single();

      if (salesPlan) {
        let salesPayout = 0;
        const salesRules = salesPlan.compensation_rules?.filter((r: any) => 
          r.is_active && r.trigger_event === "PAYMENT_CAPTURED"
        ) || [];

        for (const rule of salesRules) {
          const formula = rule.payout_formula_json;
          
          if (formula.type === "percentage") {
            const rate = formula.rate || 0.05;
            const ruleAmount = amount * rate;
            salesPayout += ruleAmount;
            console.log(`[Compensation] Sales rule "${rule.rule_name}": ${rate * 100}% of $${amount} = $${ruleAmount.toFixed(2)}`);
          } else if (formula.type === "flat") {
            // Check conditions for flat bonuses
            if (rule.rule_name.includes("Fast Close")) {
              const quoteCreated = new Date(order.quotes?.created_at || order.created_at);
              const hoursSinceQuote = (Date.now() - quoteCreated.getTime()) / (1000 * 60 * 60);
              if (hoursSinceQuote <= 24) {
                salesPayout += formula.amount;
                console.log(`[Compensation] Sales Fast Close bonus: $${formula.amount}`);
              }
            } else if (rule.rule_name.includes("Upsell")) {
              const subtotal = order.quotes?.subtotal || order.amount_due || 0;
              if (subtotal >= 500) {
                salesPayout += formula.amount;
                console.log(`[Compensation] Sales Upsell bonus: $${formula.amount}`);
              }
            }
          }
        }

        if (salesPayout > 0) {
          // Check for existing earning
          const { data: existing } = await supabase
            .from("compensation_earnings")
            .select("id")
            .eq("entity_type", "payment")
            .eq("entity_id", paymentId)
            .eq("user_id", salesUserId)
            .single();

          if (!existing) {
            const { data: earning, error: earningError } = await supabase
              .from("compensation_earnings")
              .insert({
                user_id: salesUserId,
                role: "sales",
                plan_id: salesPlan.id,
                entity_type: "payment",
                entity_id: paymentId,
                gross_amount: amount,
                payout_amount: Math.round(salesPayout * 100) / 100,
                calculation_details: {
                  order_id: orderId,
                  rules_applied: salesRules.map((r: any) => r.rule_name),
                  mode
                },
                period: new Date().toISOString().slice(0, 7)
              })
              .select()
              .single();

            if (!earningError && earning) {
              results.push({
                user_id: salesUserId,
                role: "sales",
                payout: salesPayout,
                rule: "Sales Commission"
              });

              // Log audit
              await supabase.from("compensation_audit_log").insert({
                action: "EARNING_CREATED",
                target_user_id: salesUserId,
                entity_type: "compensation_earnings",
                entity_id: earning.id,
                after_data: { gross_amount: amount, payout_amount: salesPayout },
                details_json: { mode, trigger: "PAYMENT_CAPTURED" }
              });
            }
          }
        }
      }
    }

    // =============================================
    // BILLING/FINANCE COMMISSION (for overdue recovery)
    // =============================================
    if (isOverdueRecovery) {
      // Get finance plan
      const { data: financePlan } = await supabase
        .from("compensation_plans")
        .select("*, compensation_rules(*)")
        .eq("role", "finance")
        .eq("is_active", true)
        .single();

      if (financePlan) {
        // Find the billing user who worked on this
        const { data: arActions } = await supabase
          .from("ar_actions")
          .select("performed_by")
          .eq("order_id", orderId)
          .order("created_at", { ascending: false })
          .limit(1);

        const billingUserId = arActions?.[0]?.performed_by;

        if (billingUserId) {
          let financePayout = 0;
          const financeRules = financePlan.compensation_rules?.filter((r: any) => 
            r.is_active && r.trigger_event === "PAYMENT_CAPTURED" && 
            r.condition_json?.is_overdue_recovery
          ) || [];

          for (const rule of financeRules) {
            const formula = rule.payout_formula_json;
            if (formula.type === "percentage") {
              let rate = formula.rate || 0.02;
              
              // Apply tiered rates based on days overdue
              if (daysOverdue && daysOverdue >= 30) {
                rate += 0.01; // Extra 1% for 30+ days
              }
              if (daysOverdue && daysOverdue >= 60) {
                rate += 0.02; // Extra 2% for 60+ days
              }
              
              financePayout += amount * rate;
            }
          }

          if (financePayout > 0) {
            const { data: existing } = await supabase
              .from("compensation_earnings")
              .select("id")
              .eq("entity_type", "payment")
              .eq("entity_id", paymentId)
              .eq("user_id", billingUserId)
              .single();

            if (!existing) {
              const { data: earning } = await supabase
                .from("compensation_earnings")
                .insert({
                  user_id: billingUserId,
                  role: "finance",
                  plan_id: financePlan.id,
                  entity_type: "payment",
                  entity_id: paymentId,
                  gross_amount: amount,
                  payout_amount: Math.round(financePayout * 100) / 100,
                  calculation_details: {
                    order_id: orderId,
                    is_overdue_recovery: true,
                    days_overdue: daysOverdue,
                    mode
                  },
                  period: new Date().toISOString().slice(0, 7)
                })
                .select()
                .single();

              if (earning) {
                results.push({
                  user_id: billingUserId,
                  role: "finance",
                  payout: financePayout,
                  rule: "Collection Commission"
                });

                await supabase.from("compensation_audit_log").insert({
                  action: "EARNING_CREATED",
                  target_user_id: billingUserId,
                  entity_type: "compensation_earnings",
                  entity_id: earning.id,
                  after_data: { gross_amount: amount, payout_amount: financePayout },
                  details_json: { mode, trigger: "PAYMENT_CAPTURED", is_overdue_recovery: true }
                });
              }
            }
          }
        }
      }
    }

    console.log(`[Compensation] Created ${results.length} earnings for payment ${paymentId}`);

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
