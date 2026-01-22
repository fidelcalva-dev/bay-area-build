import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequestInput {
  orderId: string;
  paymentType: "deposit" | "balance" | "overage";
  amount: number;
  note?: string;
  sendSms?: boolean;
  sendEmail?: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    const body: PaymentRequestInput = await req.json();
    const { orderId, paymentType, amount, note, sendSms, sendEmail, customerName, customerPhone, customerEmail } = body;

    if (!orderId || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid order ID or amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify order exists
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, balance_due")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call create-hosted-session to generate the payment token
    const origin = "https://id-preview--9d2754ea-90c1-4bce-9c45-c379d4c6b54c.lovable.app";
    const returnUrl = `${origin}/portal/payment-complete?orderId=${orderId}`;
    const cancelUrl = `${origin}/portal/orders/${orderId}`;

    const hostedSessionResponse = await fetch(`${supabaseUrl}/functions/v1/create-hosted-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        orderId,
        paymentType,
        amount,
        returnUrl,
        cancelUrl,
      }),
    });

    const hostedSessionData = await hostedSessionResponse.json();

    if (!hostedSessionData.success || !hostedSessionData.token) {
      throw new Error(hostedSessionData.error || "Failed to create payment session");
    }

    const paymentId = hostedSessionData.paymentId;
    const token = hostedSessionData.token;
    const formPostUrl = hostedSessionData.formPostUrl;

    // Build payment link - this will be a page that auto-submits to the hosted form
    const paymentLink = `${origin}/portal/pay/${paymentId}?token=${encodeURIComponent(token)}`;

    // Format message with standardized legal copy
    const formattedAmount = amount.toFixed(2);
    const greeting = customerName ? `Hi ${customerName.split(" ")[0]}` : "Hi";
    const noteText = note ? `\n\n${note}` : "";
    const paymentDisclaimer = "Payment is required before or at the time of service unless approved.";
    
    const smsMessage = `${greeting}, your Calsan ${paymentType} payment of $${formattedAmount} is ready. Pay securely here: ${paymentLink}${noteText}\n\n${paymentDisclaimer}`;

    // Send SMS if enabled
    let smsSent = false;
    if (sendSms && customerPhone && twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      try {
        // Format phone number
        let digits = customerPhone.replace(/\D/g, "");
        if (digits.length === 11 && digits.startsWith("1")) {
          digits = digits.substring(1);
        }
        
        if (digits.length === 10) {
          const formattedPhone = `+1${digits}`;
          
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
          const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

          const smsResponse = await fetch(twilioUrl, {
            method: "POST",
            headers: {
              Authorization: `Basic ${twilioAuth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: formattedPhone,
              From: twilioPhoneNumber,
              Body: smsMessage,
            }),
          });

          if (smsResponse.ok) {
            smsSent = true;
            
            // Log message
            await supabase.from("message_history").insert({
              order_id: orderId,
              customer_phone: formattedPhone,
              channel: "sms",
              direction: "outbound",
              message_body: smsMessage,
              template_key: "payment_request",
              status: "sent",
            });
          } else {
            console.error("SMS failed:", await smsResponse.text());
          }
        }
      } catch (smsError) {
        console.error("SMS error:", smsError);
      }
    }

    // Send Email if enabled (using Resend if available)
    let emailSent = false;
    if (sendEmail && customerEmail) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (resendApiKey) {
        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Calsan Dumpsters <billing@calsan.com>",
              to: customerEmail,
              subject: `Payment Request - $${formattedAmount} Due`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1f2937;">${greeting},</h2>
                  <p>Your ${paymentType} payment of <strong>$${formattedAmount}</strong> is ready for processing.</p>
                  ${note ? `<p style="color: #6b7280; font-style: italic;">"${note}"</p>` : ""}
                  <div style="margin: 24px 0;">
                    <a href="${paymentLink}" 
                       style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Pay $${formattedAmount} Now
                    </a>
                  </div>
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; font-size: 14px;">
                    <strong>Payment Terms:</strong> Payment is required before or at the time of service unless approved.
                    Post-service charges, including overages and reclassification, are billed after disposal based on scale tickets.
                  </div>
                  <p style="color: #6b7280; font-size: 14px;">
                    This is a secure payment link. Your card information is protected by Authorize.Net.
                  </p>
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                  <p style="color: #9ca3af; font-size: 12px;">
                    Calsan Dumpsters | Bay Area's Trusted Dumpster Service<br>
                    Photos, scale tickets, and receipts available through the customer portal constitute final documentation.
                  </p>
                </div>
              `,
            }),
          });

          if (emailResponse.ok) {
            emailSent = true;
            
            // Log email
            await supabase.from("message_history").insert({
              order_id: orderId,
              customer_phone: customerPhone || null,
              channel: "email",
              direction: "outbound",
              message_body: `Payment request email sent for $${formattedAmount}`,
              template_key: "payment_request",
              status: "sent",
            });
          }
        } catch (emailError) {
          console.error("Email error:", emailError);
        }
      }
    }

    // Create order event
    await supabase.from("order_events").insert({
      order_id: orderId,
      event_type: "PAYMENT_REQUEST_SENT",
      message: `Payment request of $${formattedAmount} (${paymentType}) sent via ${smsSent && emailSent ? "SMS + Email" : smsSent ? "SMS" : emailSent ? "Email" : "link only"}`,
      after_json: {
        payment_id: paymentId,
        amount,
        payment_type: paymentType,
        sms_sent: smsSent,
        email_sent: emailSent,
        note,
      },
    });

    // Update payment record with link sent info
    await supabase
      .from("orders")
      .update({
        payment_link_url: paymentLink,
        payment_link_amount: amount,
        payment_link_type: paymentType,
        payment_link_sent_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({
        success: true,
        paymentId,
        paymentLink,
        smsSent,
        emailSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Send payment request error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
