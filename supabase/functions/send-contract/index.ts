import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface SendContractRequest {
  contractId: string;
  method: 'sms' | 'email';
  phone?: string;
  email?: string;
  actorId?: string;
  actorRole?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractId, method, phone, email, actorId, actorRole }: SendContractRequest = await req.json();

    if (!contractId) {
      return new Response(
        JSON.stringify({ error: "contractId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch contract details
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select(`
        *,
        customers (
          id,
          company_name,
          billing_phone,
          billing_email
        )
      `)
      .eq("id", contractId)
      .single();

    if (contractError || !contract) {
      return new Response(
        JSON.stringify({ error: "Contract not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build secure signing link
    const signingLink = `${SUPABASE_URL.replace('.supabase.co', '.lovable.app')}/portal/sign-contract?id=${contractId}`;
    
    const contractTypeLabel = contract.contract_type === 'msa' 
      ? 'Master Service Agreement' 
      : 'Service Addendum';

    if (method === 'sms') {
      const targetPhone = phone || contract.customers?.billing_phone;
      
      if (!targetPhone) {
        return new Response(
          JSON.stringify({ error: "No phone number available" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Build SMS message
      const smsBody = `CalSan Dumpsters: Please review and sign your ${contractTypeLabel} to proceed with scheduling.

Sign here: ${signingLink}

No service can be performed until this is completed.`;

      // Send via Twilio
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
      const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

      const twilioResponse = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: targetPhone,
          From: TWILIO_PHONE_NUMBER,
          Body: smsBody,
        }),
      });

      const twilioResult = await twilioResponse.json();

      if (!twilioResponse.ok) {
        console.error("Twilio error:", twilioResult);
        return new Response(
          JSON.stringify({ error: "Failed to send SMS", details: twilioResult }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log event
      await supabase.from("contract_events").insert({
        contract_id: contractId,
        event_type: "sent_sms",
        actor_id: actorId,
        actor_role: actorRole,
        metadata: { 
          phone: targetPhone.slice(-4),
          message_sid: twilioResult.sid 
        },
      });

      // Log to message history
      await supabase.from("message_history").insert({
        customer_id: contract.customer_id,
        channel: "sms",
        direction: "outbound",
        message_body: smsBody,
        customer_phone: targetPhone,
        sent_by: actorId,
        template_key: "contract_signature_request",
        external_id: twilioResult.sid,
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          method: "sms",
          messageSid: twilioResult.sid 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (method === 'email') {
      const targetEmail = email || contract.customers?.billing_email;

      if (!targetEmail) {
        return new Response(
          JSON.stringify({ error: "No email address available" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // For now, log that email would be sent
      // In production, integrate with email service (SendGrid, etc.)
      console.log(`Would send contract email to ${targetEmail}`);

      // Log event
      await supabase.from("contract_events").insert({
        contract_id: contractId,
        event_type: "sent_email",
        actor_id: actorId,
        actor_role: actorRole,
        metadata: { email: targetEmail },
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          method: "email",
          note: "Email integration pending - link logged"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid method. Use 'sms' or 'email'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-contract:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// =====================================================
// HELPER FUNCTION: Send contract signed confirmation
// This is called by the sign-contract endpoint after signature
// =====================================================
export async function sendContractSignedConfirmation(
  supabaseClient: ReturnType<typeof createClient>,
  contractId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch contract with customer info - use any to bypass strict typing in edge functions
    const { data: contractData, error: contractError } = await supabaseClient
      .from("contracts")
      .select(`
        *,
        customers (
          id,
          company_name,
          billing_phone,
          billing_email
        )
      `)
      .eq("id", contractId)
      .single();

    if (contractError || !contractData) {
      return { success: false, error: "Contract not found" };
    }

    // Type assertion for edge function context
    const contract = contractData as {
      id: string;
      customer_id: string;
      contract_type: string;
      service_address: string | null;
      customers: { id: string; company_name: string | null; billing_phone: string | null; billing_email: string | null } | null;
    };

    const customer = contract.customers;
    const phone = customer?.billing_phone;
    const email = customer?.billing_email;
    const customerName = customer?.company_name || '';

    const contractTypeLabel = contract.contract_type === 'msa' 
      ? 'Master Service Agreement' 
      : 'Service Addendum';
    
    const serviceAddress = contract.service_address;

    // Build confirmation message
    const smsBody = `${customerName ? `Hi ${customerName.split(' ')[0]}, ` : ''}✅ Your ${contractTypeLabel} has been signed successfully.${serviceAddress ? ` Address: ${serviceAddress}` : ''}\n\nWe can now proceed with scheduling your service. Thank you!`;

    // Send SMS confirmation
    if (phone) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: phone,
            From: TWILIO_PHONE_NUMBER,
            Body: smsBody,
          }),
        });

        if (twilioResponse.ok) {
          const result = await twilioResponse.json();
          
          // Log event - use any to bypass strict typing in edge function context
          // deno-lint-ignore no-explicit-any
          await (supabaseClient as any).from("contract_events").insert({
            contract_id: contractId,
            event_type: "signed_confirmation_sent",
            metadata: { 
              channel: "sms",
              phone: phone.slice(-4),
              message_sid: result.sid,
            },
          });

          // Log to message history
          // deno-lint-ignore no-explicit-any
          await (supabaseClient as any).from("message_history").insert({
            customer_id: contract.customer_id,
            channel: "sms",
            direction: "outbound",
            message_body: smsBody,
            customer_phone: phone,
            template_key: "contract_signed_confirmation",
            external_id: result.sid,
          });
        }
      } catch (err) {
        console.error("SMS confirmation error:", err);
      }
    }

    // Log email would be sent (integrate with Resend when available)
    if (email) {
      console.log(`Would send signed confirmation email to ${email}`);
      
      // deno-lint-ignore no-explicit-any
      await (supabaseClient as any).from("contract_events").insert({
        contract_id: contractId,
        event_type: "signed_confirmation_email_logged",
        metadata: { 
          channel: "email",
          email: email,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending signed confirmation:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
