import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HIGHLEVEL_API_KEY = Deno.env.get("HIGHLEVEL_API_KEY");
const HIGHLEVEL_LOCATION_ID = Deno.env.get("HIGHLEVEL_LOCATION_ID");
const GHL_API_BASE = "https://services.leadconnectorhq.com";

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

async function sendSmsViaGHL(to: string, body: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!HIGHLEVEL_API_KEY || !HIGHLEVEL_LOCATION_ID) {
    return { success: false, error: "GHL credentials not configured" };
  }

  // Format phone to E.164 if needed
  let phone = to.replace(/\D/g, "");
  if (phone.length === 10) phone = `+1${phone}`;
  else if (!phone.startsWith("+")) phone = `+${phone}`;

  try {
    // First, find contact by phone
    const searchRes = await fetch(`${GHL_API_BASE}/contacts/search/duplicates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      body: JSON.stringify({
        locationId: HIGHLEVEL_LOCATION_ID,
        phone,
      }),
    });

    let contactId: string | null = null;
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      contactId = searchData.contacts?.[0]?.id;
    }

    // If no contact, create one
    if (!contactId) {
      const createRes = await fetch(`${GHL_API_BASE}/contacts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
        body: JSON.stringify({
          locationId: HIGHLEVEL_LOCATION_ID,
          phone,
          name: "SMS Recipient",
        }),
      });

      if (createRes.ok) {
        const createData = await createRes.json();
        contactId = createData.contact?.id;
      }
    }

    if (!contactId) {
      return { success: false, error: "Could not find or create contact" };
    }

    // Send SMS via GHL Conversations API
    const smsRes = await fetch(`${GHL_API_BASE}/conversations/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
        "Content-Type": "application/json",
        Version: "2021-04-15",
      },
      body: JSON.stringify({
        type: "SMS",
        contactId,
        message: body,
      }),
    });

    if (!smsRes.ok) {
      const errText = await smsRes.text();
      console.error("GHL SMS error:", errText);
      return { success: false, error: `GHL API error: ${smsRes.status}` };
    }

    const smsData = await smsRes.json();
    return { success: true, messageId: smsData.messageId || smsData.id };
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
  if (!HIGHLEVEL_API_KEY || !HIGHLEVEL_LOCATION_ID) {
    return { success: false, error: "GHL credentials not configured" };
  }

  try {
    // Find contact by email
    const searchRes = await fetch(`${GHL_API_BASE}/contacts/search/duplicates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      body: JSON.stringify({
        locationId: HIGHLEVEL_LOCATION_ID,
        email: to,
      }),
    });

    let contactId: string | null = null;
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      contactId = searchData.contacts?.[0]?.id;
    }

    // Create contact if not found
    if (!contactId) {
      const createRes = await fetch(`${GHL_API_BASE}/contacts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
        body: JSON.stringify({
          locationId: HIGHLEVEL_LOCATION_ID,
          email: to,
          name: to.split("@")[0],
        }),
      });

      if (createRes.ok) {
        const createData = await createRes.json();
        contactId = createData.contact?.id;
      }
    }

    if (!contactId) {
      return { success: false, error: "Could not find or create contact" };
    }

    // Send email
    const emailRes = await fetch(`${GHL_API_BASE}/conversations/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
        "Content-Type": "application/json",
        Version: "2021-04-15",
      },
      body: JSON.stringify({
        type: "Email",
        contactId,
        subject,
        message: body,
        emailFrom: "Calsan Dumpsters Pro <noreply@calsandumpsterspro.com>",
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("GHL Email error:", errText);
      return { success: false, error: `GHL API error: ${emailRes.status}` };
    }

    const emailData = await emailRes.json();
    return { success: true, messageId: emailData.messageId || emailData.id };
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
    const { queue_id, channel, to_address, subject, body, contact_id, entity_type, entity_id, template_key } = data;

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
        // Log as skipped
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
      // Log only, don't send
      console.log(`[DRY_RUN] Would send ${channel.toUpperCase()} to ${to_address}: ${body.substring(0, 100)}...`);
      status = "DRY_RUN";
      result = { success: true, messageId: `dry-run-${Date.now()}` };
    } else {
      // Actually send via GHL
      if (channel === "sms") {
        result = await sendSmsViaGHL(to_address, body);
      } else {
        result = await sendEmailViaGHL(to_address, subject || "Message from Calsan Dumpsters Pro", body);
      }
      status = result.success ? "SENT" : "FAILED";
    }

    // Update queue if provided
    if (queue_id) {
      const updateData: Record<string, any> = {
        status,
        sent_at: result.success ? new Date().toISOString() : null,
        provider_message_id: result.messageId,
        error_message: result.error,
        last_attempt_at: new Date().toISOString(),
      };
      
      await supabase
        .from("message_queue")
        .update(updateData)
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
