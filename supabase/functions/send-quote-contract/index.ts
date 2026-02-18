import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quoteId } = await req.json();

    if (!quoteId) {
      return new Response(
        JSON.stringify({ error: "quoteId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch quote data
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      return new Response(
        JSON.stringify({ error: "Quote not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const customerName = quote.customer_name || "Customer";
    const customerPhone = quote.customer_phone;
    const customerEmail = quote.customer_email;
    const serviceAddress = quote.delivery_address || "";
    const dumpsterSize = `${quote.user_selected_size_yards || quote.recommended_size_yards || 10} yd`;
    const materialType = quote.material_type || "General";
    const rentalDays = quote.rental_days || 7;
    const price = quote.subtotal || quote.estimated_min || 0;

    // Build contract terms
    const termsContent = `DUMPSTER RENTAL SERVICE CONTRACT

Customer: ${customerName}
${serviceAddress ? `Service Address: ${serviceAddress}` : ''}

SERVICE DETAILS
Dumpster Size: ${dumpsterSize}
Material Type: ${materialType}
Rental Period: ${rentalDays} days
Total Price: $${Number(price).toFixed(2)}

TERMS AND CONDITIONS

1. SERVICE AGREEMENT
CalSan Dumpsters ("Company") agrees to provide dumpster rental services as described above. Customer agrees to the terms outlined herein.

2. PRICING & PAYMENT
The total price includes delivery, pickup, and disposal within the included weight allowance. Payment is due before service begins. Overages beyond included tonnage are billed at the prevailing per-ton rate.

3. RENTAL PERIOD
The rental period begins on the delivery date. Extensions are available at a daily rate. Contact us before your scheduled pickup to extend.

4. PERMITTED MATERIALS
General construction debris, household waste, and yard waste are accepted. Hazardous materials, electronics, tires, mattresses, and refrigerant-containing appliances are prohibited and may incur extra fees.

5. CUSTOMER RESPONSIBILITIES
- Ensure clear access for delivery and pickup
- Do not overfill above the marked fill line
- Obtain required permits for street placement
- Dispose only of permitted materials

6. WEIGHT & OVERAGE
Final billing is based on official scale tickets. Overages are charged at the agreed rate.

7. LIABILITY
Customer agrees to indemnify Company against claims arising from improper disposal, site conditions, or failure to obtain permits.

8. CANCELLATION
Cancellations made within 24 hours of scheduled delivery may incur a cancellation fee.

By signing below, Customer acknowledges reading and agreeing to these terms.`;

    // Create quote_contract record
    const { data: contractRecord, error: insertError } = await supabase
      .from("quote_contracts")
      .insert({
        quote_id: quoteId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        service_address: serviceAddress,
        dumpster_size: dumpsterSize,
        material_type: materialType,
        rental_days: rentalDays,
        price,
        terms_content: termsContent,
        status: "pending",
        sent_at: new Date().toISOString(),
        sent_via: [customerPhone ? "sms" : null, customerEmail ? "email" : null].filter(Boolean),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create contract" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build signing link
    const appUrl = SUPABASE_URL.replace(".supabase.co", ".lovable.app");
    const signingLink = `${appUrl}/portal/sign-quote-contract?id=${contractRecord.id}`;

    const channels: string[] = [];

    // Send SMS
    if (customerPhone && TWILIO_ACCOUNT_SID) {
      try {
        const smsBody = `CalSan Dumpsters: Please review and sign your service contract for ${dumpsterSize} dumpster rental ($${Number(price).toFixed(2)}).

Sign here: ${signingLink}

No service can be performed until this contract is signed.`;

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: customerPhone,
            From: TWILIO_PHONE_NUMBER,
            Body: smsBody,
          }),
        });

        if (twilioResponse.ok) {
          channels.push("sms");
          const result = await twilioResponse.json();

          // Log to message_history
          await supabase.from("message_history").insert({
            customer_id: quote.customer_id || null,
            channel: "sms",
            direction: "outbound",
            message_body: smsBody,
            customer_phone: customerPhone,
            template_key: "quote_contract_signature_request",
            external_id: result.sid,
          });
        } else {
          console.error("Twilio SMS error:", await twilioResponse.text());
        }
      } catch (err) {
        console.error("SMS send error:", err);
      }
    }

    // Send Email
    if (customerEmail && RESEND_API_KEY) {
      try {
        const emailBody = `
<h2>CalSan Dumpsters - Service Contract</h2>
<p>Dear ${customerName},</p>
<p>Please review and sign your service contract for a <strong>${dumpsterSize}</strong> dumpster rental.</p>
<p><strong>Total Price: $${Number(price).toFixed(2)}</strong></p>
<p><a href="${signingLink}" style="display:inline-block;padding:12px 24px;background:#16a34a;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Review & Sign Contract</a></p>
<p>No service can be performed until this contract is signed.</p>
<p>Thank you,<br/>CalSan Dumpsters Pro</p>`;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Calsan Dumpsters Pro <noreply@calsandumpsterspro.com>",
            to: [customerEmail],
            subject: `Sign Your Service Contract - ${dumpsterSize} Dumpster Rental`,
            html: emailBody,
          }),
        });

        if (emailResponse.ok) {
          channels.push("email");
        } else {
          console.error("Email error:", await emailResponse.text());
        }
      } catch (err) {
        console.error("Email send error:", err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        contractId: contractRecord.id,
        channels,
        signingLink,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
