import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ghl-signature",
};

/**
 * GHL Webhook Inbound Handler
 * Receives webhook events from GoHighLevel for:
 * - Inbound SMS/Email messages
 * - Call events (answered, missed, voicemail)
 * - Conversation updates
 * 
 * Webhook URL to configure in GHL:
 * POST https://<project>.supabase.co/functions/v1/ghl-webhook-inbound
 */

interface GHLWebhookEvent {
  type: string;
  locationId: string;
  // Message events
  messageId?: string;
  conversationId?: string;
  contactId?: string;
  body?: string;
  direction?: string;
  status?: string;
  dateAdded?: string;
  phone?: string;
  email?: string;
  messageType?: string;
  // Call events
  callId?: string;
  callStatus?: string;
  duration?: number;
  recordingUrl?: string;
  from?: string;
  to?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload
    const rawBody = await req.text();
    console.log("[GHL Webhook] Received:", rawBody.substring(0, 1000));

    let event: GHLWebhookEvent;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature if configured (optional)
    const { data: signatureSecret } = await supabase
      .from("config_settings")
      .select("value")
      .eq("key", "ghl.webhook_signature_secret")
      .single();

    if (signatureSecret?.value && signatureSecret.value !== '""') {
      const signature = req.headers.get("x-ghl-signature");
      // TODO: Implement HMAC verification when GHL provides signature
      console.log("[GHL Webhook] Signature header:", signature ? "present" : "missing");
    }

    const eventType = event.type?.toLowerCase() || "";
    let result: { processed: boolean; entity?: string; id?: string; action?: string };

    // Handle different event types
    if (eventType.includes("message") || eventType === "inboundsms" || eventType === "inboundemail") {
      result = await handleInboundMessage(supabase, event);
    } else if (eventType.includes("call")) {
      result = await handleCallEvent(supabase, event);
    } else if (eventType.includes("conversation")) {
      result = await handleConversationUpdate(supabase, event);
    } else {
      console.log(`[GHL Webhook] Unhandled event type: ${event.type}`);
      result = { processed: false, action: "ignored" };
    }

    const durationMs = Date.now() - startTime;
    console.log(`[GHL Webhook] Processed in ${durationMs}ms:`, result);

    return new Response(
      JSON.stringify({
        success: true,
        duration_ms: durationMs,
        ...result,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[GHL Webhook] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleInboundMessage(supabase: any, event: GHLWebhookEvent) {
  const {
    messageId,
    conversationId,
    direction,
    body,
    phone,
    email,
    messageType,
    dateAdded,
  } = event;

  // Only process inbound messages
  if (direction?.toLowerCase() !== "inbound") {
    return { processed: false, action: "skipped_outbound" };
  }

  let channel = "SMS";
  if (messageType?.toLowerCase().includes("email") || email) {
    channel = "EMAIL";
  }

  // Use the database function to process the message
  const { data, error } = await supabase.rpc("ghl_process_inbound_message", {
    p_ghl_message_id: messageId || `ghl-${Date.now()}`,
    p_ghl_conversation_id: conversationId || `conv-${Date.now()}`,
    p_channel: channel,
    p_from_number: channel === "SMS" ? phone : null,
    p_to_number: null,
    p_from_email: channel === "EMAIL" ? email : null,
    p_to_email: null,
    p_subject: null,
    p_body_text: body,
    p_sent_at: dateAdded || new Date().toISOString(),
  });

  if (error) {
    console.error("[GHL Webhook] Failed to process message:", error);
    return { processed: false, error: error.message };
  }

  // Unified pipeline: route through lead-ingest (non-blocking)
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    await fetch(`${supabaseUrl}/functions/v1/lead-ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        source_channel: channel === 'SMS' ? 'GHL_SMS' : 'GHL_EMAIL',
        source_detail: 'ghl_webhook_inbound',
        phone: phone ?? null,
        email: email ?? null,
        message: body?.substring(0, 500) ?? null,
        consent_status: 'OPTED_IN',
        raw_payload: { messageId, conversationId, channel },
      }),
    });
  } catch (ingestErr) {
    console.error("[GHL Webhook] lead-ingest failed (non-critical):", ingestErr);
  }

  // Create staff notification for inbound message
  await createInboundNotification(supabase, {
    type: "inbound_message",
    channel,
    from: phone || email || "Unknown",
    excerpt: body?.substring(0, 100),
    messageId: data,
  });

  return { processed: true, entity: "message", id: data };
}

async function handleCallEvent(supabase: any, event: GHLWebhookEvent) {
  const {
    callId,
    conversationId,
    callStatus,
    duration,
    recordingUrl,
    from,
    to,
    direction,
    dateAdded,
  } = event;

  // Map GHL call status to our status
  let status = "COMPLETED";
  const callStatusLower = callStatus?.toLowerCase() || "";
  if (callStatusLower.includes("miss") || callStatusLower === "no-answer") {
    status = "MISSED";
  } else if (callStatusLower.includes("voicemail")) {
    status = "VOICEMAIL";
  } else if (callStatusLower.includes("busy")) {
    status = "BUSY";
  } else if (callStatusLower.includes("fail")) {
    status = "FAILED";
  } else if (callStatusLower.includes("answer")) {
    status = "ANSWERED";
  }

  // Use the database function to process the call
  const { data, error } = await supabase.rpc("ghl_process_inbound_call", {
    p_ghl_call_id: callId || `ghl-call-${Date.now()}`,
    p_ghl_conversation_id: conversationId,
    p_direction: direction?.toUpperCase() || "INBOUND",
    p_from_number: from || "",
    p_to_number: to || "",
    p_duration_seconds: duration || 0,
    p_status: status,
    p_recording_url: recordingUrl,
    p_started_at: dateAdded || new Date().toISOString(),
  });

  if (error) {
    console.error("[GHL Webhook] Failed to process call:", error);
    return { processed: false, error: error.message };
  }

  // Create notification for missed calls or voicemails
  if (status === "MISSED" || status === "VOICEMAIL") {
    await createInboundNotification(supabase, {
      type: status === "VOICEMAIL" ? "voicemail" : "missed_call",
      from: from || "Unknown",
      recordingUrl,
      callId: data,
    });
  }

  return { processed: true, entity: "call", id: data, status };
}

async function handleConversationUpdate(supabase: any, event: GHLWebhookEvent) {
  const { conversationId, contactId } = event;

  if (!conversationId) {
    return { processed: false, action: "no_conversation_id" };
  }

  // Update or create thread with latest info
  const { error } = await supabase
    .from("ghl_message_threads")
    .upsert({
      ghl_conversation_id: conversationId,
      ghl_contact_id: contactId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "ghl_conversation_id",
    });

  if (error) {
    console.error("[GHL Webhook] Failed to update thread:", error);
    return { processed: false, error: error.message };
  }

  return { processed: true, entity: "thread", action: "updated" };
}

async function createInboundNotification(supabase: any, params: {
  type: string;
  channel?: string;
  from: string;
  excerpt?: string;
  messageId?: string;
  recordingUrl?: string;
  callId?: string;
}) {
  try {
    // Determine which team to notify
    let assignedTeam = "cs";
    if (params.type === "inbound_message" && params.channel === "SMS") {
      // Check if this is from a lead (notify sales)
      // For now, default to CS
    }

    // Create notification in staff_notifications or crm_tasks
    const { error } = await supabase.from("crm_tasks").insert({
      entity_type: "system",
      entity_id: params.messageId || params.callId,
      task_type: params.type,
      subject: params.type === "missed_call" 
        ? `Missed call from ${params.from}` 
        : params.type === "voicemail"
        ? `Voicemail from ${params.from}`
        : `New ${params.channel || "message"} from ${params.from}`,
      description: params.excerpt || (params.recordingUrl ? `Recording: ${params.recordingUrl}` : ""),
      priority: params.type === "missed_call" ? "high" : "medium",
      due_date: new Date().toISOString(),
      assigned_team: assignedTeam,
    });

    if (error) {
      console.error("[GHL Webhook] Failed to create notification:", error);
    }
  } catch (err) {
    console.error("[GHL Webhook] Notification error:", err);
  }
}
