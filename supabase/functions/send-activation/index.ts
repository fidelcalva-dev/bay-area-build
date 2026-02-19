import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit: max 50 activations per batch, max 10 per minute per caller
const BATCH_LIMIT = 50;
const MAX_ATTEMPTS = 3;

function formatPhone(phone: string): { formatted: string; valid: boolean } {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.substring(1);
  if (digits.length !== 10) return { formatted: "", valid: false };
  const areaCode = digits.substring(0, 3);
  if (areaCode.startsWith("0") || areaCode.startsWith("1")) return { formatted: "", valid: false };
  return { formatted: `+1${digits}`, valid: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { customer_ids, channel, resend_customer_id } = await req.json();

    // Single resend for a specific customer
    if (resend_customer_id) {
      const result = await sendActivation(supabase, resend_customer_id, channel || "sms");
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch send
    if (!customer_ids || !Array.isArray(customer_ids)) {
      return new Response(JSON.stringify({ error: "customer_ids array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const batch = customer_ids.slice(0, BATCH_LIMIT);
    const results = { sent: 0, skipped: 0, failed: 0, errors: [] as string[] };

    for (const customerId of batch) {
      const ch = channel || "sms";
      const result = await sendActivation(supabase, customerId, ch);
      if (result.status === "sent") results.sent++;
      else if (result.status === "skipped") results.skipped++;
      else {
        results.failed++;
        results.errors.push(`${customerId}: ${result.error}`);
      }

      // Rate limit: 100ms between sends
      await new Promise((r) => setTimeout(r, 100));
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendActivation(
  supabase: ReturnType<typeof createClient>,
  customerId: string,
  channel: string
): Promise<{ status: string; error?: string }> {
  // Get customer
  const { data: customer, error: custErr } = await supabase
    .from("customers")
    .select("id, company_name, contact_name, billing_email, phone, activation_status, activation_attempts")
    .eq("id", customerId)
    .single();

  if (custErr || !customer) return { status: "failed", error: "Customer not found" };
  if (customer.activation_status === "activated") return { status: "skipped", error: "Already activated" };
  if ((customer.activation_attempts || 0) >= MAX_ATTEMPTS) return { status: "skipped", error: "Max attempts reached" };

  // Determine contact info
  const hasPhone = customer.phone && customer.phone.length >= 7;
  const hasEmail = customer.billing_email && customer.billing_email.includes("@");

  if (channel === "sms" && !hasPhone) {
    if (hasEmail) channel = "email";
    else return { status: "failed", error: "No phone or email" };
  }
  if (channel === "email" && !hasEmail) {
    if (hasPhone) channel = "sms";
    else return { status: "failed", error: "No phone or email" };
  }

  // Create token
  const { data: token, error: tokenErr } = await supabase
    .from("activation_tokens")
    .insert({
      customer_id: customerId,
      channel,
      attempt_number: (customer.activation_attempts || 0) + 1,
    })
    .select("id, token")
    .single();

  if (tokenErr || !token) return { status: "failed", error: "Failed to create token" };

  // Build activation link
  const portalUrl = "https://bay-area-build.lovable.app/portal/activate";
  const activationLink = `${portalUrl}?token=${token.token}`;
  const customerName = customer.contact_name || customer.company_name || "Customer";

  let sendSuccess = false;
  let sendError = "";

  if (channel === "sms") {
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioSid || !twilioToken || !twilioPhone) {
      console.log(`[ACTIVATION DRY_RUN] SMS to ${customer.phone}: ${activationLink}`);
      sendSuccess = true; // Treat as success in dev
    } else {
      const { formatted, valid } = formatPhone(customer.phone!);
      if (!valid) return { status: "failed", error: "Invalid phone format" };

      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const resp = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: formatted,
            From: twilioPhone,
            Body: `Hi ${customerName}! Access your Calsan Dumpster account — view orders, invoices & schedule pickups: ${activationLink}`,
          }),
        });

        if (!resp.ok) {
          const errText = await resp.text();
          sendError = `Twilio error: ${resp.status}`;
          console.error("Twilio error:", errText);
        } else {
          sendSuccess = true;
        }
      } catch (e) {
        sendError = e.message;
      }
    }
  } else if (channel === "email") {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.log(`[ACTIVATION DRY_RUN] Email to ${customer.billing_email}: ${activationLink}`);
      sendSuccess = true;
    } else {
      try {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Calsan Dumpsters Pro <noreply@calsandumpsterspro.com>",
            to: [customer.billing_email],
            subject: "Access Your Calsan Dumpster Account",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1a1a2e;">Hi ${customerName}!</h2>
                <p style="font-size: 16px; color: #333;">Your Calsan Dumpsters account is ready. View your orders, invoices, and schedule pickups instantly.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${activationLink}" style="background-color: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                    Activate Your Account
                  </a>
                </div>
                <p style="font-size: 14px; color: #666;">This link expires in 48 hours. If you didn't request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="font-size: 12px; color: #999;">Calsan Dumpsters Pro — Bay Area's Local Dumpster Service</p>
              </div>
            `,
            reply_to: "info@calsandumpsterspro.com",
          }),
        });

        if (!resp.ok) {
          const errBody = await resp.json();
          sendError = errBody?.message || `Resend error: ${resp.status}`;
        } else {
          sendSuccess = true;
        }
      } catch (e) {
        sendError = e.message;
      }
    }
  }

  // Update token status
  const newStatus = sendSuccess ? "sent" : "failed";
  await supabase
    .from("activation_tokens")
    .update({
      status: newStatus,
      sent_at: sendSuccess ? new Date().toISOString() : null,
      error_message: sendError || null,
    })
    .eq("id", token.id);

  // Update customer
  if (sendSuccess) {
    await supabase
      .from("customers")
      .update({
        activation_status: "sent",
        activation_attempts: (customer.activation_attempts || 0) + 1,
      })
      .eq("id", customerId);
  }

  return sendSuccess
    ? { status: "sent" }
    : { status: "failed", error: sendError };
}
