import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-anet-signature",
};

interface WebhookPayload {
  notificationId: string;
  eventType: string;
  eventDate: string;
  webhookId: string;
  payload: {
    id?: string;
    responseCode?: number;
    authCode?: string;
    merchantReferenceId?: string;
    invoiceNumber?: string;
    authAmount?: number;
    settlementAmount?: number;
    entityName?: string;
    submitTimeUTC?: string;
  };
}

async function verifySignature(body: string, signature: string, signatureKey: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(signatureKey);
    const messageData = encoder.encode(body);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const expectedHash = encodeHex(new Uint8Array(signatureBuffer)).toUpperCase();
    
    const receivedHash = signature.replace("sha512=", "").toUpperCase();
    return expectedHash === receivedHash;
  } catch (e) {
    console.error("Signature verification error:", e);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signatureKey = Deno.env.get("AUTHNET_SIGNATURE_KEY");
    const bodyText = await req.text();
    
    // Verify webhook signature if key is configured
    if (signatureKey) {
      const signature = req.headers.get("x-anet-signature") || "";
      const isValid = await verifySignature(bodyText, signature, signatureKey);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const webhook: WebhookPayload = JSON.parse(bodyText);
    console.log("Received webhook:", JSON.stringify(webhook, null, 2));

    const { eventType, payload, notificationId } = webhook;

    // Find the payment by transaction ID
    const transactionId = payload.id;
    if (!transactionId) {
      console.log("No transaction ID in webhook");
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*, orders(amount_due, amount_paid, balance_due)")
      .eq("transaction_id", transactionId)
      .single();

    if (paymentError || !payment) {
      // Try finding by invoice number (order ID prefix)
      if (payload.invoiceNumber) {
        const { data: paymentByInvoice } = await supabase
          .from("payments")
          .select("*, orders(amount_due, amount_paid, balance_due)")
          .like("order_id", `${payload.invoiceNumber}%`)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        if (!paymentByInvoice) {
          console.log("Payment not found for transaction:", transactionId);
          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        console.log("Payment not found for transaction:", transactionId);
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Handle different event types
    let newStatus: string | null = null;
    let auditAction = "";

    switch (eventType) {
      case "net.authorize.payment.authcapture.created":
      case "net.authorize.payment.capture.created":
        newStatus = "captured";
        auditAction = "Payment captured";
        break;

      case "net.authorize.payment.priorAuthCapture.created":
        newStatus = "captured";
        auditAction = "Prior auth captured";
        break;

      case "net.authorize.payment.void.created":
        newStatus = "voided";
        auditAction = "Payment voided";
        break;

      case "net.authorize.payment.refund.created":
        newStatus = "refunded";
        auditAction = "Payment refunded";
        break;

      case "net.authorize.payment.fraud.declined":
        newStatus = "failed";
        auditAction = "Payment declined (fraud)";
        break;

      case "net.authorize.payment.fraud.held":
        // Keep as captured but log
        auditAction = "Payment held for fraud review";
        break;

      default:
        console.log("Unhandled event type:", eventType);
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Update payment status if needed
    if (newStatus && payment) {
      const previousStatus = payment.status;
      
      await supabase
        .from("payments")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      // Handle refund/void - reverse the payment on the order
      if (newStatus === "refunded" || newStatus === "voided") {
        const order = payment.orders;
        if (order) {
          const newAmountPaid = Math.max(0, (order.amount_paid || 0) - payment.amount);
          const newBalanceDue = (order.amount_due || 0) - newAmountPaid;
          const newPaymentStatus = newAmountPaid <= 0 ? "unpaid" : "partial";

          await supabase
            .from("orders")
            .update({
              amount_paid: newAmountPaid,
              balance_due: newBalanceDue,
              payment_status: newPaymentStatus,
            })
            .eq("id", payment.order_id);

          await supabase
            .from("invoices")
            .update({
              amount_paid: newAmountPaid,
              balance_due: newBalanceDue,
              payment_status: newPaymentStatus,
            })
            .eq("order_id", payment.order_id);
        }
      }

      // Create audit log
      await supabase.from("audit_logs").insert({
        action: newStatus === "refunded" ? "REFUND" : "update",
        entity_type: "payment",
        entity_id: payment.id,
        before_data: { status: previousStatus },
        after_data: { 
          status: newStatus,
          webhook_event: eventType,
          notification_id: notificationId,
        },
        changes_summary: `${auditAction} via webhook (${transactionId})`,
      });

      // Create order event
      await supabase.from("order_events").insert({
        order_id: payment.order_id,
        event_type: newStatus === "refunded" ? "PAYMENT_REFUNDED" : "PAYMENT_STATUS_UPDATED",
        message: `${auditAction} - Transaction: ${transactionId}`,
        before_json: { status: previousStatus },
        after_json: { status: newStatus, webhook_event: eventType },
      });
    }

    console.log(`Webhook processed: ${eventType} for transaction ${transactionId}`);
    
    return new Response(
      JSON.stringify({ received: true, processed: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    // Return 200 to prevent Authorize.Net from retrying
    return new Response(
      JSON.stringify({ received: true, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
