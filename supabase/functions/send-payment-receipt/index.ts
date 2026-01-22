import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReceiptRequest {
  paymentId: string;
  orderId: string;
  amount: number;
  customerEmail?: string;
  customerPhone?: string;
  transactionId?: string;
  newBalance: number;
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const body: ReceiptRequest = await req.json();
    const { paymentId, orderId, amount, customerEmail, customerPhone, transactionId, newBalance } = body;

    let smsSent = false;
    let emailSent = false;

    // Send SMS receipt
    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber && customerPhone) {
      try {
        const formattedPhone = customerPhone.startsWith("+1") 
          ? customerPhone 
          : `+1${customerPhone.replace(/\D/g, "")}`;

        const smsBody = newBalance <= 0
          ? `✅ Payment received! $${amount.toFixed(2)} paid. Your Calsan order #${orderId.slice(0, 8)} is now PAID IN FULL. Thank you!`
          : `✅ Payment received! $${amount.toFixed(2)} paid. Remaining balance: $${newBalance.toFixed(2)}. Order #${orderId.slice(0, 8)}. Thank you! - Calsan`;

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
            Body: smsBody,
          }),
        });

        if (smsResponse.ok) {
          smsSent = true;
          console.log("SMS receipt sent to:", formattedPhone);

          // Log message history
          await supabase.from("message_history").insert({
            order_id: orderId,
            customer_phone: formattedPhone,
            channel: "sms",
            direction: "outbound",
            message_body: smsBody,
            template_key: "payment_receipt",
            status: "sent",
          });
        }
      } catch (e) {
        console.error("SMS send error:", e);
      }
    }

    // Send email receipt
    if (resendApiKey && customerEmail) {
      try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0F4C3A 0%, #1a6b52 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .receipt-box { background: white; border-radius: 12px; padding: 24px; margin: 20px 0; border: 2px solid #0F4C3A; }
    .amount { font-size: 36px; font-weight: bold; color: #0F4C3A; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #6b7280; }
    .value { font-weight: 600; }
    .balance { padding: 16px; background: ${newBalance <= 0 ? '#dcfce7' : '#fef3c7'}; border-radius: 8px; text-align: center; margin-top: 20px; }
    .balance-label { font-size: 14px; color: #6b7280; }
    .balance-amount { font-size: 24px; font-weight: bold; color: ${newBalance <= 0 ? '#16a34a' : '#d97706'}; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Receipt</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Calsan Dumpster Rentals</p>
    </div>
    <div class="content">
      <div class="receipt-box">
        <p style="text-align: center; margin-bottom: 20px;">Payment Received</p>
        <p class="amount" style="text-align: center;">$${amount.toFixed(2)}</p>
        
        <div style="margin-top: 24px;">
          <div class="detail-row">
            <span class="label">Order #</span>
            <span class="value">${orderId.slice(0, 8).toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span class="label">Transaction ID</span>
            <span class="value">${transactionId || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="label">Date</span>
            <span class="value">${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>

        <div class="balance">
          <p class="balance-label">${newBalance <= 0 ? 'Status' : 'Remaining Balance'}</p>
          <p class="balance-amount">${newBalance <= 0 ? 'PAID IN FULL' : '$' + newBalance.toFixed(2)}</p>
        </div>
      </div>
      
      <p style="text-align: center; color: #6b7280;">
        Thank you for your payment!<br/>
        Questions? Call us at (510) 800-8262
      </p>
    </div>
    <div class="footer">
      <p>Calsan Inc. • Bay Area's #1 Dumpster Rental</p>
      <p>This is an automated receipt. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Calsan Dumpsters <noreply@calsan.com>",
            to: [customerEmail],
            subject: `Payment Receipt - Order #${orderId.slice(0, 8).toUpperCase()}`,
            html: emailHtml,
          }),
        });

        if (emailResponse.ok) {
          emailSent = true;
          console.log("Email receipt sent to:", customerEmail);
        }
      } catch (e) {
        console.error("Email send error:", e);
      }
    }

    // Store receipt document reference
    const receiptDocUrl = `receipt://${paymentId}/${transactionId || 'manual'}`;
    await supabase.from("documents").insert({
      order_id: orderId,
      doc_type: "payment_receipt",
      file_url: receiptDocUrl,
      file_name: `Receipt-${transactionId || paymentId.slice(0, 8)}.pdf`,
      notes: `Payment receipt for $${amount.toFixed(2)} - ${new Date().toISOString()}`,
    });

    // Update payment record with receipt sent timestamp
    await supabase
      .from("payments")
      .update({ 
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        smsSent, 
        emailSent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Receipt sending error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
