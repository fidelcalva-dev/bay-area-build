import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalRequest {
  action: "approve" | "void" | "pay" | "bulk_approve" | "bulk_pay";
  earningIds?: string[];
  adjustmentIds?: string[];
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !claims.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.user.id;

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const isAdmin = roles?.some(r => 
      ["admin", "finance_admin", "executive"].includes(r.role)
    );

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: ApprovalRequest = await req.json();
    const { action, earningIds, adjustmentIds, reason } = body;

    // Check compensation mode for pay actions
    const { data: modeConfig } = await supabase
      .from("config_settings")
      .select("value")
      .eq("key", "compensation.mode")
      .single();

    const mode = modeConfig?.value?.replace(/"/g, '') || "DRY_RUN";

    if (action === "pay" || action === "bulk_pay") {
      if (mode === "DRY_RUN") {
        return new Response(
          JSON.stringify({ 
            error: "Cannot mark as paid in DRY_RUN mode. Switch to LIVE mode first." 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const results = {
      earnings_updated: 0,
      adjustments_updated: 0,
      errors: [] as string[]
    };

    // Process earnings
    if (earningIds && earningIds.length > 0) {
      for (const earningId of earningIds) {
        const { data: earning } = await supabase
          .from("compensation_earnings")
          .select("*")
          .eq("id", earningId)
          .single();

        if (!earning) {
          results.errors.push(`Earning ${earningId} not found`);
          continue;
        }

        // Prevent users from approving their own earnings
        if (earning.user_id === userId) {
          results.errors.push(`Cannot approve own earning ${earningId}`);
          continue;
        }

        let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        let auditAction = "";

        switch (action) {
          case "approve":
          case "bulk_approve":
            if (earning.status !== "PENDING") {
              results.errors.push(`Earning ${earningId} is not pending`);
              continue;
            }
            updateData = {
              ...updateData,
              status: "APPROVED",
              approved_by: userId,
              approved_at: new Date().toISOString()
            };
            auditAction = "EARNING_APPROVED";
            break;

          case "pay":
          case "bulk_pay":
            if (earning.status !== "APPROVED") {
              results.errors.push(`Earning ${earningId} is not approved`);
              continue;
            }
            updateData = {
              ...updateData,
              status: "PAID",
              paid_at: new Date().toISOString()
            };
            auditAction = "EARNING_PAID";
            break;

          case "void":
            if (!["PENDING", "APPROVED"].includes(earning.status)) {
              results.errors.push(`Earning ${earningId} cannot be voided`);
              continue;
            }
            updateData = {
              ...updateData,
              status: "VOIDED",
              voided_at: new Date().toISOString(),
              void_reason: reason || "Admin voided"
            };
            auditAction = "EARNING_VOIDED";
            break;
        }

        const { error: updateError } = await supabase
          .from("compensation_earnings")
          .update(updateData)
          .eq("id", earningId);

        if (updateError) {
          results.errors.push(`Failed to update earning ${earningId}: ${updateError.message}`);
        } else {
          results.earnings_updated++;

          await supabase.from("compensation_audit_log").insert({
            action: auditAction,
            actor_user_id: userId,
            target_user_id: earning.user_id,
            entity_type: "compensation_earnings",
            entity_id: earningId,
            before_data: { status: earning.status },
            after_data: updateData,
            details_json: { reason }
          });
        }
      }
    }

    // Process adjustments
    if (adjustmentIds && adjustmentIds.length > 0) {
      for (const adjustmentId of adjustmentIds) {
        const { data: adjustment } = await supabase
          .from("compensation_adjustments")
          .select("*")
          .eq("id", adjustmentId)
          .single();

        if (!adjustment) {
          results.errors.push(`Adjustment ${adjustmentId} not found`);
          continue;
        }

        if (adjustment.user_id === userId) {
          results.errors.push(`Cannot approve own adjustment ${adjustmentId}`);
          continue;
        }

        let updateData: Record<string, unknown> = {};
        let auditAction = "";

        switch (action) {
          case "approve":
          case "bulk_approve":
            if (adjustment.status !== "PENDING") {
              results.errors.push(`Adjustment ${adjustmentId} is not pending`);
              continue;
            }
            updateData = {
              status: "APPROVED",
              approved_by: userId,
              approved_at: new Date().toISOString()
            };
            auditAction = "ADJUSTMENT_APPROVED";
            break;

          case "pay":
          case "bulk_pay":
            if (adjustment.status !== "APPROVED") {
              results.errors.push(`Adjustment ${adjustmentId} is not approved`);
              continue;
            }
            updateData = {
              status: "PAID"
            };
            auditAction = "ADJUSTMENT_PAID";
            break;

          case "void":
            if (!["PENDING", "APPROVED"].includes(adjustment.status)) {
              results.errors.push(`Adjustment ${adjustmentId} cannot be voided`);
              continue;
            }
            updateData = {
              status: "VOIDED"
            };
            auditAction = "ADJUSTMENT_VOIDED";
            break;
        }

        const { error: updateError } = await supabase
          .from("compensation_adjustments")
          .update(updateData)
          .eq("id", adjustmentId);

        if (updateError) {
          results.errors.push(`Failed to update adjustment ${adjustmentId}: ${updateError.message}`);
        } else {
          results.adjustments_updated++;

          await supabase.from("compensation_audit_log").insert({
            action: auditAction,
            actor_user_id: userId,
            target_user_id: adjustment.user_id,
            entity_type: "compensation_adjustments",
            entity_id: adjustmentId,
            before_data: { status: adjustment.status },
            after_data: updateData,
            details_json: { reason }
          });
        }
      }
    }

    console.log(`[Approval Worker] ${action}: ${results.earnings_updated} earnings, ${results.adjustments_updated} adjustments updated`);

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        action,
        ...results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[Approval Worker] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
