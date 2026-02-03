import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HIGHLEVEL_API_KEY = Deno.env.get("HIGHLEVEL_API_KEY");
const HIGHLEVEL_LOCATION_ID = Deno.env.get("HIGHLEVEL_LOCATION_ID");
const GHL_API_V1 = "https://rest.gohighlevel.com/v1";
const GHL_API_V2 = "https://services.leadconnectorhq.com";

/**
 * GHL Sync Poller
 * Polls GoHighLevel API for recent conversations, messages, and calls
 * Can be triggered manually or via external cron (every 5 minutes recommended)
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if API key is configured
    if (!HIGHLEVEL_API_KEY) {
      return new Response(
        JSON.stringify({ error: "HIGHLEVEL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create sync log entry
    const { data: syncLog, error: syncLogError } = await supabase
      .from("ghl_sync_log")
      .insert({
        sync_type: "FULL",
        status: "STARTED",
      })
      .select()
      .single();

    if (syncLogError) {
      console.error("[GHL Sync] Failed to create sync log:", syncLogError);
    }

    const syncId = syncLog?.id;

    const results = {
      conversations: { processed: 0, created: 0, updated: 0, failed: 0 },
      messages: { processed: 0, created: 0, skipped: 0, failed: 0 },
      calls: { processed: 0, created: 0, skipped: 0, failed: 0 },
    };

    try {
      // 1. Sync recent conversations
      console.log("[GHL Sync] Fetching recent conversations...");
      const convResult = await syncConversations(supabase);
      results.conversations = convResult;

      // 2. Sync recent messages from each conversation
      console.log("[GHL Sync] Fetching recent messages...");
      const msgResult = await syncMessages(supabase);
      results.messages = msgResult;

      // 3. Sync call logs (if available via API)
      console.log("[GHL Sync] Fetching call logs...");
      const callResult = await syncCalls(supabase);
      results.calls = callResult;

      // Update sync log with success
      if (syncId) {
        await supabase
          .from("ghl_sync_log")
          .update({
            status: "COMPLETED",
            records_processed: results.conversations.processed + results.messages.processed + results.calls.processed,
            records_created: results.conversations.created + results.messages.created + results.calls.created,
            records_updated: results.conversations.updated,
            records_skipped: results.messages.skipped + results.calls.skipped,
            records_failed: results.conversations.failed + results.messages.failed + results.calls.failed,
            details_json: results,
            completed_at: new Date().toISOString(),
          })
          .eq("id", syncId);
      }
    } catch (syncError: any) {
      console.error("[GHL Sync] Sync error:", syncError);

      if (syncId) {
        await supabase
          .from("ghl_sync_log")
          .update({
            status: "FAILED",
            error_message: syncError.message,
            details_json: results,
            completed_at: new Date().toISOString(),
          })
          .eq("id", syncId);
      }

      throw syncError;
    }

    const durationMs = Date.now() - startTime;
    console.log(`[GHL Sync] Completed in ${durationMs}ms:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        duration_ms: durationMs,
        sync_id: syncId,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[GHL Sync] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function syncConversations(supabase: any) {
  const result = { processed: 0, created: 0, updated: 0, failed: 0 };

  try {
    // Get last sync time to only fetch recent conversations
    const { data: lastSync } = await supabase
      .from("ghl_sync_log")
      .select("completed_at")
      .eq("sync_type", "CONVERSATIONS")
      .eq("status", "COMPLETED")
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    const sinceDate = lastSync?.completed_at 
      ? new Date(lastSync.completed_at).toISOString()
      : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Default: last 24 hours

    // Fetch conversations from GHL
    const response = await fetch(`${GHL_API_V1}/conversations?locationId=${HIGHLEVEL_LOCATION_ID}&limit=100`, {
      headers: {
        Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[GHL Sync] Conversations fetch failed:", response.status, text.substring(0, 500));
      return result;
    }

    const data = await response.json();
    const conversations = data.conversations || [];

    for (const conv of conversations) {
      result.processed++;

      try {
        // Check if conversation already exists
        const { data: existing } = await supabase
          .from("ghl_message_threads")
          .select("id")
          .eq("ghl_conversation_id", conv.id)
          .single();

        // Match contact
        const phone = conv.phone || conv.contactPhone;
        const email = conv.email || conv.contactEmail;

        const { data: match } = await supabase.rpc("ghl_match_contact", {
          p_phone: phone,
          p_email: email,
        });

        const matchResult = match?.[0] || {};

        if (existing) {
          // Update existing thread
          await supabase
            .from("ghl_message_threads")
            .update({
              ghl_contact_id: conv.contactId,
              phone_number: phone,
              email_address: email,
              contact_id: matchResult.contact_id,
              customer_id: matchResult.customer_id,
              lead_id: matchResult.lead_id,
              last_message_at: conv.lastMessageDate || conv.updatedAt,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          result.updated++;
        } else {
          // Create new thread
          await supabase.from("ghl_message_threads").insert({
            ghl_conversation_id: conv.id,
            ghl_contact_id: conv.contactId,
            channel: conv.type?.toUpperCase() || "SMS",
            phone_number: phone,
            email_address: email,
            contact_id: matchResult.contact_id,
            customer_id: matchResult.customer_id,
            lead_id: matchResult.lead_id,
            last_message_at: conv.lastMessageDate || conv.createdAt,
          });

          result.created++;
        }
      } catch (err: any) {
        console.error("[GHL Sync] Conversation error:", conv.id, err.message);
        result.failed++;
      }
    }
  } catch (err: any) {
    console.error("[GHL Sync] Conversations sync error:", err);
    result.failed++;
  }

  return result;
}

async function syncMessages(supabase: any) {
  const result = { processed: 0, created: 0, skipped: 0, failed: 0 };

  try {
    // Get recent threads to sync messages for
    const { data: threads } = await supabase
      .from("ghl_message_threads")
      .select("id, ghl_conversation_id")
      .order("last_message_at", { ascending: false })
      .limit(50);

    for (const thread of threads || []) {
      try {
        // Fetch messages for this conversation
        const response = await fetch(
          `${GHL_API_V1}/conversations/${thread.ghl_conversation_id}/messages?limit=50`,
          {
            headers: {
              Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const messages = data.messages || [];

        for (const msg of messages) {
          result.processed++;

          // Check if message already exists
          const { data: existing } = await supabase
            .from("ghl_messages")
            .select("id")
            .eq("ghl_message_id", msg.id)
            .single();

          if (existing) {
            result.skipped++;
            continue;
          }

          // Determine direction
          const direction = msg.direction?.toUpperCase() || 
            (msg.type?.toLowerCase().includes("outbound") ? "OUTBOUND" : "INBOUND");

          // Insert message
          const { error } = await supabase.from("ghl_messages").insert({
            ghl_message_id: msg.id,
            ghl_conversation_id: thread.ghl_conversation_id,
            thread_id: thread.id,
            direction,
            channel: msg.type?.toUpperCase()?.includes("EMAIL") ? "EMAIL" : "SMS",
            from_number: msg.phone,
            to_number: msg.to,
            from_email: msg.email,
            subject: msg.subject,
            body_text: msg.body || msg.text || msg.message,
            sent_at: msg.dateAdded || msg.createdAt,
            status: direction === "INBOUND" ? "RECEIVED" : "SENT",
          });

          if (error) {
            result.failed++;
          } else {
            result.created++;
          }
        }
      } catch (err: any) {
        console.error("[GHL Sync] Messages error for thread:", thread.id, err.message);
      }
    }
  } catch (err: any) {
    console.error("[GHL Sync] Messages sync error:", err);
    result.failed++;
  }

  return result;
}

async function syncCalls(supabase: any) {
  const result = { processed: 0, created: 0, skipped: 0, failed: 0 };

  // Note: GHL API v1 has limited call log access
  // This would need GHL API v2 with proper OAuth for full call history
  // For now, we rely on webhooks for call events

  try {
    // Try to fetch call history if available
    const response = await fetch(
      `${GHL_API_V1}/conversations?locationId=${HIGHLEVEL_LOCATION_ID}&type=call&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.log("[GHL Sync] Call logs not available via API v1");
      return result;
    }

    const data = await response.json();
    const calls = data.conversations || [];

    for (const call of calls) {
      result.processed++;

      // Check if call already exists
      const { data: existing } = await supabase
        .from("ghl_call_logs")
        .select("id")
        .eq("ghl_call_id", call.id)
        .single();

      if (existing) {
        result.skipped++;
        continue;
      }

      // Use the database function to process the call
      const { error } = await supabase.rpc("ghl_process_inbound_call", {
        p_ghl_call_id: call.id,
        p_ghl_conversation_id: call.conversationId,
        p_direction: call.direction?.toUpperCase() || "INBOUND",
        p_from_number: call.phone || call.from || "",
        p_to_number: call.to || "",
        p_duration_seconds: call.duration || 0,
        p_status: mapCallStatus(call.status),
        p_recording_url: call.recordingUrl,
        p_started_at: call.dateAdded || call.createdAt,
      });

      if (error) {
        result.failed++;
      } else {
        result.created++;
      }
    }
  } catch (err: any) {
    console.error("[GHL Sync] Calls sync error:", err);
  }

  return result;
}

function mapCallStatus(status: string | undefined): string {
  if (!status) return "COMPLETED";
  const s = status.toLowerCase();
  if (s.includes("miss") || s === "no-answer") return "MISSED";
  if (s.includes("voicemail")) return "VOICEMAIL";
  if (s.includes("busy")) return "BUSY";
  if (s.includes("fail")) return "FAILED";
  if (s.includes("answer")) return "ANSWERED";
  return "COMPLETED";
}
