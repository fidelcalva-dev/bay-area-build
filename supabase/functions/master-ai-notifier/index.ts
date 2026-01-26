import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Staff domains that are allowed to receive notifications in LIVE_INTERNAL mode
const STAFF_TEAMS = ["ADMIN", "SALES", "CS", "DISPATCH", "DRIVER", "BILLING", "FINANCE", "OPERATIONS"];
const INTERNAL_CHANNELS = ["IN_APP", "SLACK", "GOOGLE_CHAT"];
const CUSTOMER_CHANNELS = ["SMS", "EMAIL"];

interface Notification {
  id: string;
  channel: string;
  target_team: string;
  target_user_id?: string;
  title: string;
  body: string;
  entity_type?: string;
  entity_id?: string;
  priority?: string;
  mode?: string;
  status?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get Master AI configuration
    const { data: configs } = await supabase
      .from("config_settings")
      .select("key, value")
      .eq("category", "master_ai");

    const configMap = configs?.reduce((acc, c) => ({ 
      ...acc, 
      [c.key]: typeof c.value === 'string' ? c.value.replace(/"/g, '') : c.value 
    }), {}) as Record<string, string | boolean> || {};

    const masterAiMode = configMap.mode || "DRY_RUN";
    const allowInternalNotifications = configMap.allow_internal_notifications !== false;
    const allowCustomerMessages = configMap.allow_customer_messages === true;
    const allowCalls = configMap.allow_calls === true;

    console.log(`Notifier running in mode: ${masterAiMode}`);
    console.log(`Allow internal: ${allowInternalNotifications}, customer: ${allowCustomerMessages}, calls: ${allowCalls}`);

    // Fetch pending notifications
    const { data: notifications, error: fetchError } = await supabase
      .from("notifications_outbox")
      .select("*")
      .eq("status", "PENDING")
      .limit(50);

    if (fetchError) {
      throw fetchError;
    }

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ status: "no_notifications", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    let skipped = 0;
    const results: { id: string; status: string; reason?: string }[] = [];

    for (const notif of notifications as Notification[]) {
      const isInternalChannel = INTERNAL_CHANNELS.includes(notif.channel);
      const isCustomerChannel = CUSTOMER_CHANNELS.includes(notif.channel);
      const isStaffTarget = STAFF_TEAMS.includes(notif.target_team?.toUpperCase() || "");
      
      let shouldSend = false;
      let skipReason = "";

      // LIVE_INTERNAL Mode Logic
      if (masterAiMode === "LIVE_INTERNAL") {
        // In LIVE_INTERNAL:
        // - Allow IN_APP, SLACK, GOOGLE_CHAT to STAFF teams
        // - Block SMS/EMAIL to customers
        // - Block all calls
        
        if (notif.channel === "CALL") {
          shouldSend = false;
          skipReason = "LIVE_INTERNAL blocks outbound calls";
        } else if (isInternalChannel && isStaffTarget) {
          // Internal notification to staff - ALLOW
          shouldSend = allowInternalNotifications;
          if (!shouldSend) {
            skipReason = "Internal notifications disabled";
          }
        } else if (isCustomerChannel) {
          // Customer SMS/Email - BLOCK in LIVE_INTERNAL
          shouldSend = false;
          skipReason = "LIVE_INTERNAL blocks customer messages";
        } else if (isInternalChannel && !isStaffTarget) {
          // Internal channel but not staff target (e.g., customer IN_APP)
          shouldSend = false;
          skipReason = "Target is not a staff team in LIVE_INTERNAL mode";
        } else {
          // Default block for unknown scenarios
          shouldSend = false;
          skipReason = "Unknown channel/target combination in LIVE_INTERNAL";
        }
      } else if (masterAiMode === "LIVE") {
        // Full LIVE mode - respect individual flags
        if (notif.channel === "CALL") {
          shouldSend = allowCalls;
          if (!shouldSend) skipReason = "Calls disabled";
        } else if (isCustomerChannel) {
          shouldSend = allowCustomerMessages;
          if (!shouldSend) skipReason = "Customer messages disabled";
        } else {
          shouldSend = allowInternalNotifications;
          if (!shouldSend) skipReason = "Internal notifications disabled";
        }
      } else {
        // DRY_RUN mode - never send, always skip
        shouldSend = false;
        skipReason = "DRY_RUN mode - no notifications sent";
      }

      if (shouldSend) {
        // Actually send the notification
        const sendResult = await sendNotification(notif);
        
        if (sendResult.success) {
          await supabase
            .from("notifications_outbox")
            .update({ 
              status: "SENT", 
              sent_at: new Date().toISOString(),
              mode: masterAiMode
            })
            .eq("id", notif.id);
          sent++;
          results.push({ id: notif.id, status: "SENT" });
        } else {
          await supabase
            .from("notifications_outbox")
            .update({ 
              status: "FAILED", 
              error_message: sendResult.error,
              mode: masterAiMode
            })
            .eq("id", notif.id);
          results.push({ id: notif.id, status: "FAILED", reason: sendResult.error });
        }
      } else {
        // Mark as skipped with reason
        await supabase
          .from("notifications_outbox")
          .update({ 
            status: "SKIPPED", 
            error_message: skipReason,
            mode: masterAiMode
          })
          .eq("id", notif.id);
        skipped++;
        results.push({ id: notif.id, status: "SKIPPED", reason: skipReason });
      }
    }

    console.log(`Notifier complete: ${sent} sent, ${skipped} skipped`);

    return new Response(
      JSON.stringify({ 
        status: "success", 
        mode: masterAiMode,
        processed: notifications.length,
        sent,
        skipped,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Notifier error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sendNotification(notif: Notification): Promise<{ success: boolean; error?: string }> {
  try {
    switch (notif.channel) {
      case "IN_APP":
        // IN_APP notifications are stored in notifications_outbox with SENT status
        // The frontend polls or uses realtime to display them
        console.log(`IN_APP: ${notif.title} to ${notif.target_team}`);
        return { success: true };

      case "SLACK":
        // Slack integration - would call Slack API here
        console.log(`SLACK: ${notif.title} to ${notif.target_team}`);
        // TODO: Implement Slack webhook
        return { success: true };

      case "GOOGLE_CHAT":
        // Google Chat integration
        console.log(`GOOGLE_CHAT: ${notif.title} to ${notif.target_team}`);
        // TODO: Implement Google Chat webhook
        return { success: true };

      case "SMS":
        // Would use Twilio here
        console.log(`SMS: ${notif.title} (BLOCKED in current mode)`);
        return { success: false, error: "SMS not implemented in LIVE_INTERNAL" };

      case "EMAIL":
        // Would use Resend here
        console.log(`EMAIL: ${notif.title} (BLOCKED in current mode)`);
        return { success: false, error: "Email not implemented in LIVE_INTERNAL" };

      case "CALL":
        // Would use Twilio calls here
        console.log(`CALL: ${notif.title} (BLOCKED)`);
        return { success: false, error: "Calls blocked" };

      default:
        console.log(`Unknown channel: ${notif.channel}`);
        return { success: false, error: `Unknown channel: ${notif.channel}` };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Send failed" 
    };
  }
}
