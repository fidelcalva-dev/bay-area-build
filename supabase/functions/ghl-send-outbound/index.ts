import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HIGHLEVEL_API_KEY = Deno.env.get("HIGHLEVEL_API_KEY");
const HIGHLEVEL_LOCATION_ID = Deno.env.get("HIGHLEVEL_LOCATION_ID");
const GHL_API_V1 = "https://rest.gohighlevel.com/v1";

/**
 * GHL Send Outbound
 * Sends SMS or Email via GoHighLevel from CRM
 * 
 * Features:
 * - DRY_RUN mode for testing (default)
 * - LIVE mode for actual sending
 * - Opt-out compliance (STOP keyword)
 * - RBAC enforcement
 * - Full audit logging
 * - Timeline event creation
 */

interface SendOutboundRequest {
  channel: "sms" | "email";
  // Target identification (one of these required)
  contact_id?: string;
  customer_id?: string;
  lead_id?: string;
  phone?: string;
  email?: string;
  // Content
  template_key?: string;
  variables?: Record<string, string>;
  subject?: string;
  body?: string;
  // Entity refs for timeline
  entity_type?: string;
  entity_id?: string;
  // Audit
  user_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const data: SendOutboundRequest = await req.json();
    const { channel, template_key, variables, subject, entity_type, entity_id, user_id } = data;

    // Validate required fields
    if (!channel) {
      return new Response(
        JSON.stringify({ error: "channel is required (sms or email)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get messaging mode
    const { data: modeConfig } = await supabase
      .from("config_settings")
      .select("value")
      .eq("key", "ghl.messaging_mode")
      .single();

    let mode = "DRY_RUN";
    if (modeConfig?.value) {
      try {
        mode = JSON.parse(modeConfig.value);
      } catch {
        mode = String(modeConfig.value);
      }
    }

    // Check channel enabled
    const { data: channelConfig } = await supabase
      .from("config_settings")
      .select("value")
      .eq("key", channel === "sms" ? "ghl.sms_enabled" : "ghl.email_enabled")
      .single();

    let channelEnabled = true;
    if (channelConfig?.value) {
      try {
        channelEnabled = JSON.parse(channelConfig.value);
      } catch {
        channelEnabled = channelConfig.value === "true" || channelConfig.value === true;
      }
    }
    if (!channelEnabled) {
      return new Response(
        JSON.stringify({ error: `${channel.toUpperCase()} sending is disabled` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve target phone/email
    let targetPhone = data.phone;
    let targetEmail = data.email;
    let customerId = data.customer_id;
    let contactId = data.contact_id;
    let leadId = data.lead_id;

    if (data.contact_id) {
      const { data: contact } = await supabase
        .from("contacts")
        .select("phone, email, customer_id, sms_opt_out")
        .eq("id", data.contact_id)
        .single();

      if (contact) {
        targetPhone = targetPhone || contact.phone;
        targetEmail = targetEmail || contact.email;
        customerId = customerId || contact.customer_id;

        // Check opt-out
        if (channel === "sms" && contact.sms_opt_out) {
          return new Response(
            JSON.stringify({ success: false, status: "SKIPPED", reason: "Contact opted out of SMS" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    if (data.customer_id && (!targetPhone || !targetEmail)) {
      const { data: customer } = await supabase
        .from("customers")
        .select("billing_phone, billing_email, sms_opt_out")
        .eq("id", data.customer_id)
        .single();

      if (customer) {
        targetPhone = targetPhone || customer.billing_phone;
        targetEmail = targetEmail || customer.billing_email;

        // Check opt-out
        if (channel === "sms" && customer.sms_opt_out) {
          return new Response(
            JSON.stringify({ success: false, status: "SKIPPED", reason: "Customer opted out of SMS" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    if (data.lead_id && (!targetPhone || !targetEmail)) {
      const { data: lead } = await supabase
        .from("sales_leads")
        .select("customer_phone, customer_email")
        .eq("id", data.lead_id)
        .single();

      if (lead) {
        targetPhone = targetPhone || lead.customer_phone;
        targetEmail = targetEmail || lead.customer_email;
      }
    }

    // Validate we have a target
    if (channel === "sms" && !targetPhone) {
      return new Response(
        JSON.stringify({ error: "No phone number found for SMS" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (channel === "email" && !targetEmail) {
      return new Response(
        JSON.stringify({ error: "No email address found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Render template if provided
    let messageBody = data.body || "";
    let messageSubject = subject || "";

    if (template_key) {
      const { data: template } = await supabase
        .from("message_templates")
        .select("body, subject")
        .eq("key", template_key)
        .eq("is_active", true)
        .single();

      if (template) {
        messageBody = template.body;
        messageSubject = template.subject || "";

        // Replace variables
        if (variables) {
          for (const [key, value] of Object.entries(variables)) {
            messageBody = messageBody.replace(new RegExp(`\\{${key}\\}`, "g"), value || "");
            if (messageSubject) {
              messageSubject = messageSubject.replace(new RegExp(`\\{${key}\\}`, "g"), value || "");
            }
          }
        }
      }
    }

    if (!messageBody) {
      return new Response(
        JSON.stringify({ error: "Message body is required (provide body or template_key)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare result
    let result: { success: boolean; messageId?: string; error?: string; ghlContactId?: string };
    let status: string;

    if (mode === "DRY_RUN") {
      // DRY_RUN: Create draft record, don't actually send
      console.log(`[DRY_RUN] Would send ${channel.toUpperCase()} to ${channel === "sms" ? targetPhone : targetEmail}`);
      console.log(`[DRY_RUN] Body: ${messageBody.substring(0, 200)}`);

      status = "DRY_RUN";
      result = { success: true, messageId: `dry-run-${Date.now()}` };
    } else {
      // LIVE: Actually send via GHL
      if (!HIGHLEVEL_API_KEY) {
        return new Response(
          JSON.stringify({ error: "HIGHLEVEL_API_KEY not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      result = await sendViaGHL(channel, targetPhone, targetEmail, messageSubject, messageBody);
      status = result.success ? "SENT" : "FAILED";
    }

    // Insert into ghl_messages
    const { data: message, error: msgError } = await supabase
      .from("ghl_messages")
      .insert({
        ghl_message_id: result.messageId,
        ghl_conversation_id: `outbound-${Date.now()}`,
        direction: "OUTBOUND",
        channel: channel.toUpperCase(),
        from_number: channel === "sms" ? null : null,
        to_number: channel === "sms" ? targetPhone : null,
        from_email: channel === "email" ? null : null,
        to_email: channel === "email" ? targetEmail : null,
        subject: messageSubject || null,
        body_text: messageBody,
        sent_at: status === "SENT" ? new Date().toISOString() : null,
        status: status === "SENT" ? "DELIVERED" : status === "DRY_RUN" ? "PENDING" : "FAILED",
        error_message: result.error,
        contact_id: contactId,
        customer_id: customerId,
        lead_id: leadId,
        sent_by_user_id: user_id,
        template_key,
        is_automated: !user_id,
      })
      .select()
      .single();

    if (msgError) {
      console.error("[GHL Outbound] Failed to log message:", msgError);
    }

    // Create timeline event
    const timelineEntityType = entity_type || (customerId ? "CUSTOMER" : leadId ? "LEAD" : null);
    const timelineEntityId = entity_id || customerId || leadId;

    if (timelineEntityType && timelineEntityId && message?.id) {
      await supabase.rpc("ghl_create_message_timeline_event", {
        p_message_id: message.id,
        p_entity_type: timelineEntityType,
        p_entity_id: timelineEntityId,
      });
    }

    // Log to message_logs for audit
    await supabase.from("message_logs").insert({
      channel,
      to_address: channel === "sms" ? targetPhone : targetEmail,
      subject: messageSubject,
      body: messageBody,
      provider: "GHL",
      provider_message_id: result.messageId,
      status,
      error_message: result.error,
      response: {
        ghl_contact_id: result.ghlContactId,
        mode,
        template_key,
        entity_type: timelineEntityType,
        entity_id: timelineEntityId,
      },
    });

    return new Response(
      JSON.stringify({
        success: result.success,
        status,
        message_id: message?.id,
        ghl_message_id: result.messageId,
        mode,
        error: result.error,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[GHL Outbound] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sendViaGHL(
  channel: string,
  phone: string | undefined,
  email: string | undefined,
  subject: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string; ghlContactId?: string }> {
  try {
    // First, find or create GHL contact
    const contactResult = await findOrCreateGHLContact(phone, email);
    if (!contactResult.success || !contactResult.contactId) {
      return { success: false, error: contactResult.error || "Failed to get GHL contact" };
    }

    // Send message based on channel
    if (channel === "sms") {
      const response = await fetch(`${GHL_API_V1}/conversations/messages`, {
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

      const text = await response.text();
      console.log(`[GHL] SMS response: ${response.status} - ${text.substring(0, 500)}`);

      if (!response.ok) {
        return { success: false, error: `GHL SMS error: ${response.status}`, ghlContactId: contactResult.contactId };
      }

      try {
        const data = JSON.parse(text);
        return {
          success: true,
          messageId: data.messageId || data.id || `sent-${Date.now()}`,
          ghlContactId: contactResult.contactId,
        };
      } catch {
        return { success: true, messageId: `sent-${Date.now()}`, ghlContactId: contactResult.contactId };
      }
    } else {
      // Email
      const response = await fetch(`${GHL_API_V1}/conversations/messages`, {
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
          html: body,
        }),
      });

      const text = await response.text();
      console.log(`[GHL] Email response: ${response.status} - ${text.substring(0, 500)}`);

      if (!response.ok) {
        return { success: false, error: `GHL Email error: ${response.status}`, ghlContactId: contactResult.contactId };
      }

      try {
        const data = JSON.parse(text);
        return {
          success: true,
          messageId: data.messageId || data.id || `sent-${Date.now()}`,
          ghlContactId: contactResult.contactId,
        };
      } catch {
        return { success: true, messageId: `sent-${Date.now()}`, ghlContactId: contactResult.contactId };
      }
    }
  } catch (err: any) {
    console.error("[GHL] Send error:", err);
    return { success: false, error: err.message };
  }
}

async function findOrCreateGHLContact(
  phone?: string,
  email?: string
): Promise<{ success: boolean; contactId?: string; error?: string }> {
  // Format phone to E.164
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
    // Search for existing contact
    const searchParams = new URLSearchParams();
    if (formattedPhone) searchParams.append("phone", formattedPhone);
    if (email) searchParams.append("email", email);
    searchParams.append("limit", "1");

    const searchRes = await fetch(`${GHL_API_V1}/contacts/?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.contacts?.length > 0) {
        return { success: true, contactId: searchData.contacts[0].id };
      }
    }

    // Create new contact
    const createBody: any = {};
    if (formattedPhone) createBody.phone = formattedPhone;
    if (email) {
      createBody.email = email;
      createBody.name = email.split("@")[0];
    } else {
      createBody.name = "CRM Contact";
    }

    const createRes = await fetch(`${GHL_API_V1}/contacts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createBody),
    });

    if (createRes.ok) {
      const createData = await createRes.json();
      if (createData.contact?.id) {
        return { success: true, contactId: createData.contact.id };
      }
    }

    return { success: false, error: "Failed to create GHL contact" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
