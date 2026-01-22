import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  orderId: string;
  amount: number;
  paymentType: "deposit" | "balance" | "overage";
  customerEmail?: string;
  customerPhone?: string;
  // For Accept.js tokenized payment
  dataDescriptor?: string;
  dataValue?: string;
}

interface AuthNetResponse {
  transactionResponse?: {
    responseCode: string;
    authCode?: string;
    transId?: string;
    accountNumber?: string;
    accountType?: string;
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

    const body: PaymentRequest = await req.json();
    const { orderId, amount, paymentType, customerEmail, customerPhone, dataDescriptor, dataValue } = body;

    if (!orderId || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid order ID or amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, quotes(customer_email, customer_phone, customer_name)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate amount doesn't exceed balance
    const balanceDue = order.balance_due || order.amount_due || order.final_total || 0;
    if (amount > balanceDue) {
      return new Response(
        JSON.stringify({ error: `Amount exceeds balance due ($${balanceDue.toFixed(2)})` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create payment record with 'initiated' status
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        order_id: orderId,
        customer_id: order.customer_id,
        payment_type: paymentType,
        amount,
        status: "initiated",
        provider: "AuthorizeNet",
        customer_email: customerEmail || order.quotes?.customer_email,
        customer_phone: customerPhone || order.quotes?.customer_phone,
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to create payment record:", paymentError);
      throw new Error("Failed to create payment record");
    }

    // Build Authorize.Net API request
    const isProduction = Deno.env.get("AUTHNET_ENV") === "production";
    const apiUrl = isProduction
      ? "https://api.authorize.net/xml/v1/request.api"
      : "https://apitest.authorize.net/xml/v1/request.api";

    // Using Accept.js tokenized payment data
    const authNetRequest = {
      createTransactionRequest: {
        merchantAuthentication: {
          name: authNetLoginId,
          transactionKey: authNetTransactionKey,
        },
        transactionRequest: {
          transactionType: "authCaptureTransaction",
          amount: amount.toFixed(2),
          payment: {
            opaqueData: {
              dataDescriptor: dataDescriptor,
              dataValue: dataValue,
            },
          },
          order: {
            invoiceNumber: orderId.slice(0, 20),
            description: `Calsan ${paymentType} payment`,
          },
          customer: {
            email: customerEmail || order.quotes?.customer_email,
          },
        },
      },
    };

    // Make API call to Authorize.Net
    const authNetResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authNetRequest),
    });

    const authNetResult: AuthNetResponse = await authNetResponse.json();
    console.log("AuthNet Response:", JSON.stringify(authNetResult, null, 2));

    const transResponse = authNetResult.transactionResponse;
    const isSuccess = 
      authNetResult.messages.resultCode === "Ok" && 
      transResponse?.responseCode === "1";

    if (isSuccess && transResponse) {
      // Update payment record with success
      await supabase
        .from("payments")
        .update({
          status: "captured",
          transaction_id: transResponse.transId,
          auth_code: transResponse.authCode,
          response_code: transResponse.responseCode,
          response_message: transResponse.messages?.[0]?.description || "Approved",
          card_last_four: transResponse.accountNumber?.slice(-4),
          card_type: transResponse.accountType,
        })
        .eq("id", payment.id);

      // Calculate new payment amounts
      const newAmountPaid = (order.amount_paid || 0) + amount;
      const newBalanceDue = Math.max(0, (order.amount_due || order.final_total || 0) - newAmountPaid);
      const newPaymentStatus = newBalanceDue <= 0 ? "paid" : "partial";

      // Update order billing
      await supabase
        .from("orders")
        .update({
          amount_paid: newAmountPaid,
          balance_due: newBalanceDue,
          payment_status: newPaymentStatus,
        })
        .eq("id", orderId);

      // Update or create invoice
      const { data: existingInvoice } = await supabase
        .from("invoices")
        .select("id")
        .eq("order_id", orderId)
        .single();

      if (existingInvoice) {
        // Update existing invoice
        await supabase
          .from("invoices")
          .update({
            amount_paid: newAmountPaid,
            balance_due: newBalanceDue,
            payment_status: newPaymentStatus,
          })
          .eq("order_id", orderId);
      } else {
        // Create invoice if it doesn't exist
        const invoiceNumber = `INV-${orderId.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        
        await supabase.from("invoices").insert({
          order_id: orderId,
          customer_id: order.customer_id,
          invoice_number: invoiceNumber,
          amount_due: order.amount_due || order.final_total || 0,
          amount_paid: newAmountPaid,
          balance_due: newBalanceDue,
          payment_status: newPaymentStatus,
          due_date: dueDate.toISOString().split('T')[0],
        });
      }

      // Create audit log
      await supabase.from("audit_logs").insert({
        action: "create",
        entity_type: "payment",
        entity_id: payment.id,
        before_data: null,
        after_data: {
          order_id: orderId,
          amount,
          payment_type: paymentType,
          transaction_id: transResponse.transId,
          status: "captured",
        },
        changes_summary: `Payment of $${amount.toFixed(2)} captured via Authorize.Net`,
      });

      // Create order event
      await supabase.from("order_events").insert({
        order_id: orderId,
        event_type: "PAYMENT_CAPTURED",
        message: `Payment of $${amount.toFixed(2)} captured (${paymentType})`,
        after_json: {
          payment_id: payment.id,
          amount,
          transaction_id: transResponse.transId,
          new_balance: newBalanceDue,
        },
      });

      // Trigger receipt notification
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-payment-receipt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            paymentId: payment.id,
            orderId,
            amount,
            customerEmail: customerEmail || order.quotes?.customer_email,
            customerPhone: customerPhone || order.quotes?.customer_phone,
            transactionId: transResponse.transId,
            newBalance: newBalanceDue,
          }),
        });
      } catch (e) {
        console.error("Failed to send receipt:", e);
      }

      return new Response(
        JSON.stringify({
          success: true,
          paymentId: payment.id,
          transactionId: transResponse.transId,
          authCode: transResponse.authCode,
          newAmountPaid,
          newBalanceDue,
          paymentStatus: newPaymentStatus,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Payment failed
      const errorMessage = 
        transResponse?.errors?.[0]?.errorText ||
        authNetResult.messages.message[0]?.text ||
        "Transaction failed";

      await supabase
        .from("payments")
        .update({
          status: "failed",
          response_code: transResponse?.responseCode || "E",
          response_message: errorMessage,
        })
        .eq("id", payment.id);

      // Create audit log for failed payment
      await supabase.from("audit_logs").insert({
        action: "create",
        entity_type: "payment",
        entity_id: payment.id,
        after_data: {
          order_id: orderId,
          amount,
          status: "failed",
          error: errorMessage,
        },
        changes_summary: `Payment of $${amount.toFixed(2)} failed: ${errorMessage}`,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          paymentId: payment.id,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error("Payment processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
