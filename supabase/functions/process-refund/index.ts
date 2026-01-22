import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RefundRequest {
  actionId: string;
  paymentId: string;
  orderId: string;
  invoiceId: string | null;
  actionType: "refund" | "void";
  amount: number;
  originalTransactionId: string | null;
}

interface AuthNetResponse {
  transactionResponse?: {
    responseCode: string;
    transId?: string;
    messages?: Array<{ code: string; description: string }>;
    errors?: Array<{ errorCode: string; errorText: string }>;
  };
  messages: {
    resultCode: string;
    message: Array<{ code: string; text: string }>;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authNetLoginId = Deno.env.get("AUTHNET_API_LOGIN_ID");
    const authNetTransactionKey = Deno.env.get("AUTHNET_TRANSACTION_KEY");

    if (!authNetLoginId || !authNetTransactionKey) {
      throw new Error("Authorize.Net credentials not configured");
    }

    const body: RefundRequest = await req.json();
    const { actionId, paymentId, orderId, invoiceId, actionType, amount, originalTransactionId } = body;

    if (!actionId || !paymentId || !originalTransactionId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the original payment details for card info
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("card_last_four, card_type, refunded_amount, amount")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Authorize.Net API request
    const isProduction = Deno.env.get("AUTHNET_ENV") === "production";
    const apiUrl = isProduction
      ? "https://api.authorize.net/xml/v1/request.api"
      : "https://apitest.authorize.net/xml/v1/request.api";

    let authNetRequest: unknown;

    if (actionType === "void") {
      // Void transaction
      authNetRequest = {
        createTransactionRequest: {
          merchantAuthentication: {
            name: authNetLoginId,
            transactionKey: authNetTransactionKey,
          },
          transactionRequest: {
            transactionType: "voidTransaction",
            refTransId: originalTransactionId,
          },
        },
      };
    } else {
      // Refund transaction
      authNetRequest = {
        createTransactionRequest: {
          merchantAuthentication: {
            name: authNetLoginId,
            transactionKey: authNetTransactionKey,
          },
          transactionRequest: {
            transactionType: "refundTransaction",
            amount: amount.toFixed(2),
            refTransId: originalTransactionId,
            payment: {
              creditCard: {
                cardNumber: payment.card_last_four ? `XXXX${payment.card_last_four}` : "XXXX1111",
                expirationDate: "XXXX",
              },
            },
          },
        },
      };
    }

    // Make API call to Authorize.Net
    const authNetResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authNetRequest),
    });

    const authNetResult: AuthNetResponse = await authNetResponse.json();
    console.log("AuthNet Refund Response:", JSON.stringify(authNetResult, null, 2));

    const transResponse = authNetResult.transactionResponse;
    const isSuccess = 
      authNetResult.messages.resultCode === "Ok" && 
      transResponse?.responseCode === "1";

    if (isSuccess && transResponse) {
      // Update payment_action to completed
      await supabase
        .from("payment_actions")
        .update({
          status: "completed",
          provider_refund_transaction_id: transResponse.transId,
        })
        .eq("id", actionId);

      // Update payment refunded_amount
      const newRefundedAmount = (payment.refunded_amount || 0) + amount;
      await supabase
        .from("payments")
        .update({ refunded_amount: newRefundedAmount })
        .eq("id", paymentId);

      // Get order details and update balances
      const { data: order } = await supabase
        .from("orders")
        .select("amount_paid, amount_due, balance_due")
        .eq("id", orderId)
        .single();

      if (order) {
        const newAmountPaid = Math.max(0, (order.amount_paid || 0) - amount);
        const newBalanceDue = (order.amount_due || 0) - newAmountPaid;
        const newPaymentStatus = newBalanceDue <= 0 ? "paid" : newAmountPaid > 0 ? "partial" : "unpaid";

        // Update order
        await supabase
          .from("orders")
          .update({
            amount_paid: newAmountPaid,
            balance_due: Math.max(0, newBalanceDue),
            payment_status: newPaymentStatus,
          })
          .eq("id", orderId);

        // Update invoice if exists
        if (invoiceId) {
          await supabase
            .from("invoices")
            .update({
              amount_paid: newAmountPaid,
              balance_due: Math.max(0, newBalanceDue),
              payment_status: newPaymentStatus,
            })
            .eq("id", invoiceId);
        }
      }

      // Create order event
      await supabase.from("order_events").insert({
        order_id: orderId,
        event_type: "PAYMENT_REFUND_APPLIED",
        message: `${actionType === "void" ? "Void" : "Refund"} of $${amount.toFixed(2)} processed via API`,
        after_json: {
          action_id: actionId,
          amount,
          refund_transaction_id: transResponse.transId,
          mode: "auto",
        },
      });

      // Create audit log
      await supabase.from("audit_logs").insert({
        action: "update",
        entity_type: "approval_request",
        entity_id: actionId,
        after_data: {
          status: "completed",
          refund_transaction_id: transResponse.transId,
          mode: "auto",
        },
        changes_summary: `${actionType} of $${amount.toFixed(2)} processed via Authorize.Net API`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          refundTransactionId: transResponse.transId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Refund failed
      const errorMessage = 
        transResponse?.errors?.[0]?.errorText ||
        authNetResult.messages.message[0]?.text ||
        "Refund transaction failed";

      // Update action to failed
      await supabase
        .from("payment_actions")
        .update({
          status: "failed",
          error_message: errorMessage,
        })
        .eq("id", actionId);

      // Create audit log
      await supabase.from("audit_logs").insert({
        action: "update",
        entity_type: "approval_request",
        entity_id: actionId,
        after_data: {
          status: "failed",
          error: errorMessage,
        },
        changes_summary: `${actionType} of $${amount.toFixed(2)} failed: ${errorMessage}`,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error("Refund processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
