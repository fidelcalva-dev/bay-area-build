import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 5;
const RETRY_DELAYS = [60, 300, 900, 3600, 7200]; // seconds: 1m, 5m, 15m, 1h, 2h

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending and retrying messages
    const { data: pendingMessages, error: fetchError } = await supabase
      .from("message_queue")
      .select("*")
      .in("status", ["PENDING", "RETRYING"])
      .lte("scheduled_for", new Date().toISOString())
      .order("created_at", { ascending: true })
      .limit(50);

    if (fetchError) {
      throw new Error(`Failed to fetch pending messages: ${fetchError.message}`);
    }

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      retrying: 0,
    };

    for (const message of pendingMessages || []) {
      results.processed++;

      // Check retry count
      const retryCount = message.retry_count || 0;
      if (retryCount >= MAX_ATTEMPTS) {
        await supabase
          .from("message_queue")
          .update({
            status: "FAILED",
            error_message: `Max attempts (${MAX_ATTEMPTS}) exceeded`,
          })
          .eq("id", message.id);

        results.failed++;
        continue;
      }

      // Call ghl-send-message edge function
      const sendResponse = await fetch(`${supabaseUrl}/functions/v1/ghl-send-message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          queue_id: message.id,
          channel: message.channel,
          to_address: message.to_address,
          subject: message.subject,
          body: message.body,
          contact_id: message.contact_id,
          entity_type: message.entity_type,
          entity_id: message.entity_id,
          template_key: message.template_key,
        }),
      });

      const sendResult = await sendResponse.json();

      if (sendResult.status === "SENT" || sendResult.status === "DRY_RUN") {
        results.sent++;
      } else if (sendResult.status === "SKIPPED") {
        results.skipped++;
      } else {
        // Schedule retry with exponential backoff
        const nextRetryCount = retryCount + 1;
        if (nextRetryCount < MAX_ATTEMPTS) {
          const delaySeconds = RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)];
          const nextScheduled = new Date(Date.now() + delaySeconds * 1000).toISOString();

          await supabase
            .from("message_queue")
            .update({
              status: "RETRYING",
              scheduled_for: nextScheduled,
              retry_count: nextRetryCount,
              last_attempt_at: new Date().toISOString(),
              error_message: sendResult.error,
            })
            .eq("id", message.id);

          results.retrying++;
        } else {
          results.failed++;
        }
      }
    }

    const durationMs = Date.now() - startTime;

    // Log worker run
    console.log(`GHL Message Worker completed in ${durationMs}ms:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        duration_ms: durationMs,
        ...results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("ghl-message-worker error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
