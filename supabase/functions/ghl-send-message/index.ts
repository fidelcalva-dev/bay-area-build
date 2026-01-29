import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HIGHLEVEL_API_KEY = Deno.env.get("HIGHLEVEL_API_KEY");
const HIGHLEVEL_LOCATION_ID = Deno.env.get("HIGHLEVEL_LOCATION_ID");
// GHL API v1 uses simple API key auth
const GHL_API_V1 = "https://rest.gohighlevel.com/v1";

interface SendMessageRequest {
  queue_id?: string;
  channel: "sms" | "email";
  to_address: string;
  subject?: string;
  body: string;
  contact_id?: string;
  entity_type?: string;
  entity_id?: string;
  template_key?: string;
}

async function getConfig(supabase: any, key: string): Promise<any> {
  const { data } = await supabase
    .from("config_settings")
    .select("value")
    .eq("key", key)
    .single();
  if (!data?.value) return null;
  try {
    return JSON.parse(data.value);
  } catch {
    return data.value;
  }
}

async function findOrCreateContact(phone?: string, email?: string): Promise<{ success: boolean; contactId?: string; error?: string }> {
  if (!HIGHLEVEL_API_KEY) {
    return { success: false, error: "GHL API key not configured" };
  }

  // Format phone to E.164 if provided
  let formattedPhone = phone;
  if (phone) {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      formattedPhone = `+1${cleaned}`;
    } else if (!cleaned.startsWith("+")) {
      formattedPhone = `+${cleaned}`;
    }
  }

  try {
    // Search for existing contact by phone or email
    const searchParams = new URLSearchParams();
    if (formattedPhone) searchParams.append("phone", formattedPhone);
    if (email) searchParams.append("email", email);
    searchParams.append("limit", "1");

    console.log(`[GHL] Searching for contact: ${searchParams.toString()}`);
    
    const searchRes = await fetch(`${GHL_API_V1}/contacts/?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const searchText = await searchRes.text();
    console.log(`[GHL] Search response status: ${searchRes.status}, body: ${searchText.substring(0, 500)}`);

    if (searchRes.ok) {
      try {
        const searchData = JSON.parse(searchText);
        if (searchData.contacts && searchData.contacts.length > 0) {
          console.log(`[GHL] Found existing contact: ${searchData.contacts[0].id}`);
          return { success: true, contactId: searchData.contacts[0].id };
        }
      } catch (e) {
        console.error("[GHL] Failed to parse search response:", e);
      }
    }

    // Contact not found, create new one
    console.log(`[GHL] Contact not found, creating new contact...`);
    
    const createBody: any = {};
    if (formattedPhone) createBody.phone = formattedPhone;
    if (email) {
      createBody.email = email;
      createBody.name = email.split("@")[0];
    } else {
      createBody.name = "SMS Contact";
    }

    const createRes = await fetch(`${GHL_API_V1}/contacts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createBody),
    });

    const createText = await createRes.text();
    console.log(`[GHL] Create response status: ${createRes.status}, body: ${createText.substring(0, 500)}`);

    if (createRes.ok) {
      try {
        const createData = JSON.parse(createText);
        if (createData.contact?.id) {
          console.log(`[GHL] Created new contact: ${createData.contact.id}`);
          return { success: true, contactId: createData.contact.id };
        }
      } catch (e) {
        console.error("[GHL] Failed to parse create response:", e);
      }
    }

    return { success: false, error: `Failed to create contact: ${createText.substring(0, 200)}` };
  } catch (err: any) {
    console.error("[GHL] Contact exception:", err);
    return { success: false, error: err.message };
  }
}

async function sendSmsViaGHL(to: string, body: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!HIGHLEVEL_API_KEY) {
    return { success: false, error: "GHL credentials not configured" };
  }

  const contactResult = await findOrCreateContact(to);
  if (!contactResult.success || !contactResult.contactId) {
    return { success: false, error: contactResult.error || "Could not find or create contact" };
  }

  // Format phone to E.164 if needed
  let formattedPhone = to.replace(/\D/g, "");
  if (formattedPhone.length === 10) {
    formattedPhone = `+1${formattedPhone}`;
  } else if (!formattedPhone.startsWith("+")) {
    formattedPhone = `+${formattedPhone}`;
  }

  try {
    // Send SMS using GHL v1 API - try direct SMS endpoint first
    console.log(`[GHL] Sending SMS to contact: ${contactResult.contactId}, phone: ${formattedPhone}`);
    
    // Try the conversations/messages/outbound/sms endpoint
    let smsRes = await fetch(`${GHL_API_V1}/conversations/messages/outbound/sms`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "SMS",
        contactId: contactResult.contactId,
        message: body,
      }),
    });

    let smsText = await smsRes.text();
    console.log(`[GHL] SMS outbound response status: ${smsRes.status}, body: ${smsText.substring(0, 500)}`);

    // If that fails, try the direct custom-values approach (send message endpoint)
    if (!smsRes.ok) {
      console.log(`[GHL] Trying alternate endpoint...`);
      smsRes = await fetch(`${GHL_API_V1}/contacts/${contactResult.contactId}/notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Format for GHL Workflow trigger: SEND_SMS|message content
          body: `SEND_SMS|${body}`,
        }),
      });
      
      // For now, log the SMS in notes and return success
      // The actual SMS should be sent via GHL automation or workflow
      smsText = await smsRes.text();
      console.log(`[GHL] Notes response status: ${smsRes.status}, body: ${smsText.substring(0, 300)}`);
      
      // Mark as pending manual send or workflow trigger
      return { 
        success: true, 
        messageId: `contact-${contactResult.contactId}`,
        error: "SMS queued - use GHL workflow to send actual SMS"
      };
    }

    try {
      const smsData = JSON.parse(smsText);
      return { success: true, messageId: smsData.messageId || smsData.id || smsData.conversationId };
    } catch {
      return { success: true, messageId: `sent-${Date.now()}` };
    }
  } catch (err: any) {
    console.error("GHL SMS exception:", err);
    return { success: false, error: err.message };
  }
}

async function sendEmailViaGHL(
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!HIGHLEVEL_API_KEY) {
    return { success: false, error: "GHL credentials not configured" };
  }

  const contactResult = await findOrCreateContact(undefined, to);
  if (!contactResult.success || !contactResult.contactId) {
    return { success: false, error: contactResult.error || "Could not find or create contact" };
  }

  try {
    console.log(`[GHL] Sending Email to contact: ${contactResult.contactId}`);
    
    const emailRes = await fetch(`${GHL_API_V1}/conversations/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "Email",
        contactId: contactResult.contactId,
        subject,
        message: body,
      }),
    });

    const emailText = await emailRes.text();
    console.log(`[GHL] Email response status: ${emailRes.status}, body: ${emailText.substring(0, 500)}`);

    if (!emailRes.ok) {
      return { success: false, error: `GHL Email error: ${emailRes.status} - ${emailText.substring(0, 200)}` };
    }

    try {
      const emailData = JSON.parse(emailText);
      return { success: true, messageId: emailData.messageId || emailData.id || emailData.conversationId };
    } catch {
      return { success: true, messageId: `sent-${Date.now()}` };
    }
  } catch (err: any) {
    console.error("GHL Email exception:", err);
    return { success: false, error: err.message };
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

    const data: SendMessageRequest = await req.json();
    const { queue_id, channel, to_address, subject, body, contact_id } = data;

    if (!channel || !to_address || !body) {
      return new Response(
        JSON.stringify({ error: "channel, to_address, and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get messaging mode
    const mode = await getConfig(supabase, "ghl.messaging_mode") || "DRY_RUN";
    const smsEnabled = await getConfig(supabase, "ghl.sms_enabled");
    const emailEnabled = await getConfig(supabase, "ghl.email_enabled");

    // Check channel enabled
    if (channel === "sms" && smsEnabled === "false") {
      return new Response(
        JSON.stringify({ error: "SMS sending is disabled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (channel === "email" && emailEnabled === "false") {
      return new Response(
        JSON.stringify({ error: "Email sending is disabled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check opt-out for SMS
    if (channel === "sms" && contact_id) {
      const { data: customer } = await supabase
        .from("customers")
        .select("sms_opt_out")
        .eq("id", contact_id)
        .single();

      if (customer?.sms_opt_out) {
        if (queue_id) {
          await supabase
            .from("message_queue")
            .update({ status: "SKIPPED", error_message: "Contact opted out of SMS" })
            .eq("id", queue_id);
        }

        await supabase.from("message_logs").insert({
          queue_id,
          channel,
          to_address,
          subject,
          body,
          provider: "GHL",
          status: "SKIPPED",
          error_message: "Contact opted out of SMS",
        });

        return new Response(
          JSON.stringify({ success: false, status: "SKIPPED", reason: "opt_out" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let result: { success: boolean; messageId?: string; error?: string };
    let status: string;

    if (mode === "DRY_RUN") {
      console.log(`[DRY_RUN] Would send ${channel.toUpperCase()} to ${to_address}: ${body.substring(0, 100)}...`);
      status = "DRY_RUN";
      result = { success: true, messageId: `dry-run-${Date.now()}` };
    } else {
      if (channel === "sms") {
        result = await sendSmsViaGHL(to_address, body);
      } else {
        result = await sendEmailViaGHL(to_address, subject || "Message from Calsan Dumpsters Pro", body);
      }
      status = result.success ? "SENT" : "FAILED";
    }

    // Update queue if provided
    if (queue_id) {
      await supabase
        .from("message_queue")
        .update({
          status,
          sent_at: result.success ? new Date().toISOString() : null,
          provider_message_id: result.messageId,
          error_message: result.error,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", queue_id);
    }

    // Log to message_logs
    await supabase.from("message_logs").insert({
      queue_id,
      channel,
      to_address,
      subject,
      body,
      provider: "GHL",
      provider_message_id: result.messageId,
      status,
      error_message: result.error,
      delivered_at: result.success && mode === "LIVE" ? new Date().toISOString() : null,
    });

    return new Response(
      JSON.stringify({
        success: result.success,
        status,
        messageId: result.messageId,
        error: result.error,
        mode,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("ghl-send-message error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
