import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HostedSessionRequest {
  orderId: string;
  paymentType: "deposit" | "balance" | "overage";
  amount: number;
  returnUrl?: string;
  cancelUrl?: string;
}

interface AuthNetHostedResponse {
  token?: string;
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
    const authNetEnv = Deno.env.get("AUTHNET_ENV") || "sandbox";

    if (!authNetLoginId || !authNetTransactionKey) {
      throw new Error("Authorize.Net credentials not configured");
    }

    const body: HostedSessionRequest = await req.json();
    const { orderId, paymentType, amount, returnUrl, cancelUrl } = body;

    if (!orderId || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid order ID or amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, quotes(customer_email, customer_phone, customer_name, delivery_address)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate amount doesn't exceed balance (unless overage)
    const balanceDue = order.balance_due || order.amount_due || order.final_total || 0;
    if (paymentType !== "overage" && amount > balanceDue) {
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
        customer_email: order.quotes?.customer_email,
        customer_phone: order.quotes?.customer_phone,
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to create payment record:", paymentError);
      throw new Error("Failed to create payment record");
    }

    // Build Authorize.Net API request for hosted payment page
    const isProduction = authNetEnv === "production";
    const apiUrl = isProduction
      ? "https://api.authorize.net/xml/v1/request.api"
      : "https://apitest.authorize.net/xml/v1/request.api";

    // Default URLs - use provided or construct from origin
    const defaultReturnUrl = returnUrl || `${supabaseUrl.replace('.supabase.co', '')}/portal/payment-complete?orderId=${orderId}&paymentId=${payment.id}`;
    const defaultCancelUrl = cancelUrl || `${supabaseUrl.replace('.supabase.co', '')}/portal/orders/${orderId}`;

    const hostedPaymentRequest = {
      getHostedPaymentPageRequest: {
        merchantAuthentication: {
          name: authNetLoginId,
          transactionKey: authNetTransactionKey,
        },
        transactionRequest: {
          transactionType: "authCaptureTransaction",
          amount: amount.toFixed(2),
          order: {
            invoiceNumber: orderId.slice(0, 20),
            description: `Calsan ${paymentType} payment`,
          },
          customer: {
            email: order.quotes?.customer_email || "",
          },
          billTo: {
            firstName: order.quotes?.customer_name?.split(" ")[0] || "Customer",
            lastName: order.quotes?.customer_name?.split(" ").slice(1).join(" ") || "",
            address: order.quotes?.delivery_address?.substring(0, 60) || "",
          },
        },
        hostedPaymentSettings: {
          setting: [
            {
              settingName: "hostedPaymentReturnOptions",
              settingValue: JSON.stringify({
                showReceipt: true,
                url: defaultReturnUrl,
                urlText: "Continue",
                cancelUrl: defaultCancelUrl,
                cancelUrlText: "Cancel",
              }),
            },
            {
              settingName: "hostedPaymentButtonOptions",
              settingValue: JSON.stringify({
                text: `Pay $${amount.toFixed(2)}`,
              }),
            },
            {
              settingName: "hostedPaymentStyleOptions",
              settingValue: JSON.stringify({
                bgColor: "#f8fafc",
              }),
            },
            {
              settingName: "hostedPaymentPaymentOptions",
              settingValue: JSON.stringify({
                cardCodeRequired: true,
                showCreditCard: true,
                showBankAccount: false,
              }),
            },
            {
              settingName: "hostedPaymentSecurityOptions",
              settingValue: JSON.stringify({
                captcha: false,
              }),
            },
            {
              settingName: "hostedPaymentShippingAddressOptions",
              settingValue: JSON.stringify({
                show: false,
                required: false,
              }),
            },
            {
              settingName: "hostedPaymentBillingAddressOptions",
              settingValue: JSON.stringify({
                show: true,
                required: false,
              }),
            },
            {
              settingName: "hostedPaymentCustomerOptions",
              settingValue: JSON.stringify({
                showEmail: true,
                requiredEmail: false,
                addPaymentProfile: false,
              }),
            },
            {
              settingName: "hostedPaymentOrderOptions",
              settingValue: JSON.stringify({
                show: true,
                merchantName: "Calsan Dumpsters",
              }),
            },
            {
              settingName: "hostedPaymentIFrameCommunicatorUrl",
              settingValue: JSON.stringify({
                url: "",
              }),
            },
          ],
        },
      },
    };

    // Make API call to Authorize.Net
    const authNetResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hostedPaymentRequest),
    });

    const authNetResult: AuthNetHostedResponse = await authNetResponse.json();
    console.log("AuthNet Hosted Response:", JSON.stringify(authNetResult, null, 2));

    if (authNetResult.messages.resultCode === "Ok" && authNetResult.token) {
      // Save token to payment record
      await supabase
        .from("payments")
        .update({
          auth_code: authNetResult.token, // Store token temporarily in auth_code field
          response_message: "Hosted session created",
        })
        .eq("id", payment.id);

      // Create order event
      await supabase.from("order_events").insert({
        order_id: orderId,
        event_type: "PAYMENT_SESSION_CREATED",
        message: `Hosted payment session created for $${amount.toFixed(2)} (${paymentType})`,
        after_json: {
          payment_id: payment.id,
          amount,
          payment_type: paymentType,
        },
      });

      // Build the redirect URL
      const hostedFormUrl = isProduction
        ? "https://accept.authorize.net/payment/payment"
        : "https://test.authorize.net/payment/payment";

      return new Response(
        JSON.stringify({
          success: true,
          paymentId: payment.id,
          token: authNetResult.token,
          hostedFormUrl,
          formPostUrl: hostedFormUrl,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Session creation failed
      const errorMessage = authNetResult.messages.message[0]?.text || "Failed to create payment session";

      await supabase
        .from("payments")
        .update({
          status: "failed",
          response_message: errorMessage,
        })
        .eq("id", payment.id);

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
    console.error("Hosted session error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
