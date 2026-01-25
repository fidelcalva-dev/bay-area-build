import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OverdueAsset {
  asset_id: string;
  asset_code: string;
  days_out: number;
  order_id: string;
  order_status: string;
  included_days: number;
  overdue_days: number;
  customer_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  billed_overdue_days_total: number;
  billable_days: number;
  invoice_id: string | null;
  invoice_number: string | null;
}

interface Config {
  daily_rate: number;
  warning_days: number;
  escalation_days: number;
  max_auto_bill: number;
  messaging_mode: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load config using canonical keys (2026_Q1_ALIGNMENT)
    const { data: configRows } = await supabase
      .from("config_settings")
      .select("category, key, value")
      .in("category", ["overdue", "messaging"]);

    // Build a map keyed by "category.key" for canonical access
    const configMap = new Map<string, unknown>();
    for (const row of configRows || []) {
      const fullKey = `${row.category}.${row.key}`;
      let value: unknown = row.value;
      // Parse JSON strings
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          value = (value as string).replace(/^"|"$/g, '');
        }
      }
      configMap.set(fullKey, value);
    }

    const config: Config = {
      daily_rate: Number(configMap.get("overdue.daily_rate")) || 35,
      warning_days: Number(configMap.get("overdue.warning_days")) || 1,
      escalation_days: Number(configMap.get("overdue.escalation_days")) || 3,
      max_auto_bill: Number(configMap.get("overdue.auto_bill_max")) || 250,
      messaging_mode: String(configMap.get("messaging.mode") || "DRY_RUN"),
    };

    console.log("Overdue billing config:", config);

    // Get overdue assets from view
    const { data: overdueAssets, error: viewError } = await supabase
      .from("overdue_assets_billing_vw")
      .select("*");

    if (viewError) {
      console.error("Error fetching overdue assets:", viewError);
      throw viewError;
    }

    console.log(`Found ${overdueAssets?.length || 0} overdue assets`);

    const results = {
      processed: 0,
      billed: 0,
      approvals_created: 0,
      messages_created: 0,
      tasks_created: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const asset of (overdueAssets || []) as OverdueAsset[]) {
      try {
        const billableDays = asset.billable_days;
        
        if (billableDays <= 0) {
          results.skipped++;
          continue;
        }

        const amount = billableDays * config.daily_rate;
        console.log(`Processing ${asset.asset_code}: ${billableDays} billable days = $${amount}`);

        // Check if approval needed
        if (amount > config.max_auto_bill) {
          // Create approval request instead of auto-billing
          const { error: approvalError } = await supabase
            .from("approval_requests")
            .insert({
              request_type: "overdue_billing",
              entity_type: "order",
              entity_id: asset.order_id,
              requested_by: "00000000-0000-0000-0000-000000000000", // System
              requested_value: {
                asset_id: asset.asset_id,
                asset_code: asset.asset_code,
                billable_days: billableDays,
                amount: amount,
                daily_rate: config.daily_rate,
                customer_name: asset.customer_name,
              },
              reason: `Auto-billing amount $${amount} exceeds maximum $${config.max_auto_bill}`,
              status: "pending",
            });

          if (approvalError) {
            console.error("Approval creation error:", approvalError);
            results.errors.push(`Approval for ${asset.asset_code}: ${approvalError.message}`);
          } else {
            results.approvals_created++;
          }

          // Create alert for high amount
          await supabase.from("alerts").insert({
            alert_type: "overdue_high_amount",
            entity_type: "order",
            entity_id: asset.order_id,
            severity: "warning",
            title: `High overdue charge requires approval: ${asset.asset_code}`,
            message: `$${amount} for ${billableDays} overdue days. Customer: ${asset.customer_name || "Unknown"}`,
            metadata: { asset_id: asset.asset_id, amount, billable_days: billableDays },
          });

          results.processed++;
          continue;
        }

        // Auto-bill: Create or update invoice line item
        let invoiceId = asset.invoice_id;

        // If no invoice exists, create one
        if (!invoiceId) {
          const invoiceNumber = `INV-OD-${Date.now()}`;
          const { data: newInvoice, error: invoiceError } = await supabase
            .from("invoices")
            .insert({
              order_id: asset.order_id,
              customer_id: asset.customer_id,
              invoice_number: invoiceNumber,
              amount_due: amount,
              amount_paid: 0,
              balance_due: amount,
              payment_status: "pending",
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              notes: "Overdue rental charges",
            })
            .select("id")
            .single();

          if (invoiceError) {
            console.error("Invoice creation error:", invoiceError);
            results.errors.push(`Invoice for ${asset.asset_code}: ${invoiceError.message}`);
            continue;
          }
          invoiceId = newInvoice.id;
        }

        // Create invoice line item
        const { error: lineItemError } = await supabase.from("invoice_line_items").insert({
          invoice_id: invoiceId,
          order_id: asset.order_id,
          line_type: "overdue_rental",
          description: `Overdue rental: ${billableDays} day(s) @ $${config.daily_rate}/day`,
          quantity: billableDays,
          unit_price: config.daily_rate,
          amount: amount,
          metadata: {
            asset_id: asset.asset_id,
            asset_code: asset.asset_code,
            days_out: asset.days_out,
            included_days: asset.included_days,
            overdue_days: asset.overdue_days,
            billed_at: new Date().toISOString(),
          },
        });

        if (lineItemError) {
          console.error("Line item creation error:", lineItemError);
          results.errors.push(`Line item for ${asset.asset_code}: ${lineItemError.message}`);
          continue;
        }

        // Update invoice totals if invoice existed before
        if (asset.invoice_id) {
          try {
            // Get current invoice total and update
            const { data: lineItems } = await supabase
              .from("invoice_line_items")
              .select("amount")
              .eq("invoice_id", invoiceId);
            
            const total = lineItems?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
            await supabase
              .from("invoices")
              .update({ amount_due: total, balance_due: total })
              .eq("id", invoiceId);
          } catch (e) {
            console.error("Error updating invoice totals:", e);
          }
        }

        results.billed++;

        // Update billing state
        const { error: stateError } = await supabase.from("overdue_billing_state").upsert(
          {
            asset_id: asset.asset_id,
            order_id: asset.order_id,
            billed_overdue_days_total: asset.billed_overdue_days_total + billableDays,
            last_billed_at: new Date().toISOString(),
          },
          { onConflict: "asset_id,order_id" }
        );

        if (stateError) {
          console.error("Billing state update error:", stateError);
        }

        // Create message in outbox
        const messageBody = `Hi ${asset.customer_name || "Customer"}, your dumpster rental has exceeded the included rental period. As of today it is ${asset.overdue_days} day(s) overdue. The additional rental charge for ${billableDays} day(s) is $${amount}. Please reply to schedule pickup or to extend the rental. Thank you - Calsan Dumpsters`;

        const { error: messageError } = await supabase.from("message_history").insert({
          order_id: asset.order_id,
          customer_id: asset.customer_id,
          customer_phone: asset.customer_phone,
          direction: "outbound",
          channel: "sms",
          template_key: asset.overdue_days >= config.escalation_days ? "OVERDUE_NOTICE_ESCALATION" : "OVERDUE_NOTICE_1",
          message_body: messageBody,
          status: config.messaging_mode === "LIVE" ? "pending" : "dry_run",
          mode: config.messaging_mode,
        });

        if (messageError) {
          console.error("Message creation error:", messageError);
        } else {
          results.messages_created++;
        }

        // Create dispatch task if escalation threshold reached
        if (asset.overdue_days >= config.escalation_days) {
          // Check if task already exists
          const { data: existingAlert } = await supabase
            .from("alerts")
            .select("id")
            .eq("alert_type", "overdue_pickup_needed")
            .eq("entity_id", asset.order_id)
            .eq("is_resolved", false)
            .single();

          if (!existingAlert) {
            const { error: taskError } = await supabase.from("alerts").insert({
              alert_type: "overdue_pickup_needed",
              entity_type: "order",
              entity_id: asset.order_id,
              severity: "critical",
              title: `Schedule pickup ASAP: ${asset.asset_code}`,
              message: `Asset ${asset.asset_code} is ${asset.overdue_days} days overdue (${asset.days_out} days total). Customer: ${asset.customer_name || "Unknown"}. Phone: ${asset.customer_phone || "N/A"}`,
              metadata: {
                asset_id: asset.asset_id,
                customer_id: asset.customer_id,
                days_out: asset.days_out,
                overdue_days: asset.overdue_days,
                total_billed: asset.billed_overdue_days_total + billableDays,
              },
            });

            if (!taskError) {
              results.tasks_created++;
            }
          }
        }

        results.processed++;
      } catch (assetError) {
        console.error(`Error processing asset ${asset.asset_code}:`, assetError);
        results.errors.push(`${asset.asset_code}: ${String(assetError)}`);
      }
    }

    // Log automation run
    await supabase.from("automation_runs").insert({
      function_name: "overdue-billing-daily",
      status: results.errors.length > 0 ? "partial" : "success",
      records_processed: results.processed,
      records_affected: results.billed + results.approvals_created,
      metadata: results,
    });

    console.log("Overdue billing complete:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Overdue billing error:", error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
