import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { outbound_quote_id, channels } = await req.json();
    if (!outbound_quote_id || !channels?.length) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing outbound_quote_id or channels" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Load quote
    const { data: quote, error: qErr } = await supabase
      .from("outbound_quotes")
      .select("*")
      .eq("id", outbound_quote_id)
      .single();

    if (qErr || !quote) {
      return new Response(
        JSON.stringify({ success: false, error: "Quote not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check messaging mode
    const { data: modeRow } = await supabase
      .from("config_settings")
      .select("value")
      .eq("key", "ghl.messaging_mode")
      .single();

    let rawMode = "DRY_RUN";
    if (modeRow?.value) {
      try {
        const v = typeof modeRow.value === "string" ? JSON.parse(modeRow.value) : modeRow.value;
        rawMode = v === "LIVE" ? "LIVE" : "DRY_RUN";
      } catch {
        rawMode = "DRY_RUN";
      }
    }

    const isLive = rawMode === "LIVE";

    // Build template variables
    const vars: Record<string, string> = {
      customer_name: quote.customer_name || "Customer",
      size: String(quote.size_yd),
      price: String(Math.round(quote.customer_price)),
      included_days: String(quote.included_days),
      included_tons: quote.included_tons || "2.0",
      overage_rule: quote.overage_rule_text || "$165/ton overage",
      schedule_link: quote.schedule_link || "#",
      payment_link: quote.payment_link || "#",
      portal_link: quote.portal_link || "#",
    };

    // Determine template key
    const customerType = (quote.customer_type || "homeowner").toLowerCase();
    const isHeavy = ["heavy", "debris_heavy"].includes(
      (quote.material_category || "").toUpperCase(),
    );

    const results: any[] = [];

    for (const channel of channels) {
      const ch = channel.toUpperCase();
      let templateKey = `outbound_quote_${ch === "SMS" ? "sms" : "email"}_${customerType}`;
      if (!["homeowner", "contractor", "commercial"].includes(customerType)) {
        templateKey = `outbound_quote_${ch === "SMS" ? "sms" : "email"}_homeowner`;
      }

      // Load template
      const { data: tmpl } = await supabase
        .from("message_templates")
        .select("subject, body")
        .eq("key", templateKey)
        .single();

      if (!tmpl) {
        results.push({ channel: ch, status: "FAILED", error: `Template ${templateKey} not found` });
        continue;
      }

      // Render template
      let body = tmpl.body;
      let subject = tmpl.subject || null;
      for (const [k, v] of Object.entries(vars)) {
        body = body.replace(new RegExp(`\\{${k}\\}`, "g"), v);
        if (subject) subject = subject.replace(new RegExp(`\\{${k}\\}`, "g"), v);
      }

      // Heavy addendum for SMS
      if (ch === "SMS" && isHeavy) {
        body +=
          "\nHeavy materials: fill-line required. If contamination is found, reclassification may apply at $165/ton.";
      }

      const toAddress = ch === "SMS" ? quote.customer_phone : quote.customer_email;
      if (!toAddress) {
        results.push({ channel: ch, status: "FAILED", error: `No ${ch} address on quote` });
        continue;
      }

      const messageStatus = isLive ? "SENT" : "DRY_RUN";
      let providerMessageId: string | null = null;

      // In LIVE mode, attempt to send via ghl-send-outbound
      if (isLive) {
        try {
          const sendRes = await supabase.functions.invoke("ghl-send-outbound", {
            body: {
              channel: ch.toLowerCase(),
              to_address: toAddress,
              subject: subject,
              body: body,
              entity_type: "outbound_quote",
              entity_id: outbound_quote_id,
            },
          });
          if (sendRes.error) {
            results.push({ channel: ch, status: "FAILED", error: sendRes.error.message });
            // Log the failed attempt
            await supabase.from("outbound_quote_messages").insert({
              outbound_quote_id,
              channel: ch,
              provider: "GHL",
              to_address: toAddress,
              message_body: body,
              status: "FAILED",
            });
            continue;
          }
          providerMessageId = sendRes.data?.id || null;
        } catch (e: any) {
          results.push({ channel: ch, status: "FAILED", error: e.message });
          continue;
        }
      }

      // Log to outbound_quote_messages
      await supabase.from("outbound_quote_messages").insert({
        outbound_quote_id,
        channel: ch,
        provider: isLive ? "GHL" : "DRY_RUN",
        to_address: toAddress,
        message_body: body,
        status: messageStatus,
        provider_message_id: providerMessageId,
      });

      results.push({ channel: ch, status: messageStatus });
    }

    // Update quote status
    const anyFailed = results.some((r) => r.status === "FAILED");
    const allFailed = results.every((r) => r.status === "FAILED");
    const newStatus = allFailed ? "FAILED" : anyFailed ? "SENT" : results[0]?.status === "DRY_RUN" ? "DRAFT" : "SENT";

    await supabase
      .from("outbound_quotes")
      .update({
        status: newStatus,
        error_message: allFailed ? results.map((r) => r.error).join("; ") : null,
      })
      .eq("id", outbound_quote_id);

    return new Response(
      JSON.stringify({ success: !allFailed, status: newStatus, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("send-outbound-quote error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
