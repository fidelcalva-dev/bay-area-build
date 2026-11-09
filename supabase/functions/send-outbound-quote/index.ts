// Send an outbound quote by SMS and/or email.
// CAL 011:
//  - only active office staff may send;
//  - idempotency_key: a retried request with the same key never sends a second
//    message per channel (the channel is claimed in outbound_quote_messages before sending);
//  - include_schedule_link: when the outbound quote is tied to a saved quote, a new
//    secure, expiring schedule link (/portal/schedule?t=...) is issued and placed in
//    the message; otherwise the message asks the customer to call;
//  - quotes whose contact email ends in @calsan.test are test data: nothing is sent.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { issueScheduleLink, SCHEDULE_SITE_ORIGIN } from "../_shared/schedule-link.ts";
import { isTestContact } from "../_shared/test-transport.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KEY_RE = /^[A-Za-z0-9_-]{8,80}$/;
const CALL_TEXT = "call (510) 680-2150";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type ChannelResult = { channel: string; status: string; error?: string; duplicate?: boolean };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ success: false, error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const asCaller = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await asCaller.auth.getUser(authHeader.slice(7));
    const userId = userData?.user?.id;
    if (!userId) return json({ success: false, error: "Unauthorized" }, 401);
    const { data: isOffice } = await asCaller.rpc("current_user_is_office_staff");
    if (isOffice !== true) return json({ success: false, error: "Not authorized", code: "not_authorized" }, 403);

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // deno-lint-ignore no-explicit-any
    const body: any = await req.json().catch(() => ({}));
    const outboundId = body?.outbound_quote_id;
    const channels: string[] = Array.isArray(body?.channels)
      ? [...new Set(body.channels.map((c: unknown) => String(c).toUpperCase()).filter((c: string) => c === "SMS" || c === "EMAIL"))] as string[]
      : [];
    if (typeof outboundId !== "string" || !UUID_RE.test(outboundId) || channels.length === 0) {
      return json({ success: false, error: "Missing outbound_quote_id or channels" }, 400);
    }
    const idemKey: string | null = typeof body?.idempotency_key === "string" && KEY_RE.test(body.idempotency_key)
      ? body.idempotency_key : null;
    const wantsLink = body?.include_schedule_link === true;

    const { data: quote } = await admin.from("outbound_quotes").select("*").eq("id", outboundId).maybeSingle();
    if (!quote) return json({ success: false, error: "Quote not found" }, 404);

    // Retry with the same key after every channel was already handled: return the recorded result.
    const results: ChannelResult[] = [];
    let pending = channels;
    if (idemKey) {
      const { data: prior } = await admin.from("outbound_quote_messages")
        .select("channel, status").eq("outbound_quote_id", outboundId).eq("idempotency_key", idemKey);
      const done = new Map((prior ?? []).map((r: { channel: string; status: string }) => [r.channel, r.status]));
      pending = channels.filter((c) => !done.has(c));
      for (const c of channels) if (done.has(c)) results.push({ channel: c, status: String(done.get(c)), duplicate: true });
    }

    const testContact = isTestContact(quote.customer_email);

    // Messaging mode (LIVE sends through HighLevel; anything else is a dry run).
    const { data: modeRow } = await admin.from("config_settings").select("value").eq("key", "ghl.messaging_mode").maybeSingle();
    let isLive = false;
    try {
      const v = typeof modeRow?.value === "string" ? JSON.parse(modeRow.value) : modeRow?.value;
      isLive = v === "LIVE";
    } catch { isLive = false; }

    // Secure schedule link (only when asked, only for a saved quote, only if something will be sent).
    let scheduleUrl: string | null = null;
    let linkExpiresAt: string | null = null;
    let linkCode: string | null = null;
    if (wantsLink && pending.length > 0) {
      if (quote.quote_id) {
        const issued = await issueScheduleLink(admin, { quoteId: quote.quote_id, outboundQuoteId: outboundId, userId });
        if (issued.ok) {
          scheduleUrl = `${SCHEDULE_SITE_ORIGIN}${issued.path}`;
          linkExpiresAt = issued.expiresAt;
        } else {
          linkCode = issued.code;
        }
      } else {
        linkCode = "missing_quote_id";
      }
    }

    const vars: Record<string, string> = {
      customer_name: quote.customer_name || "Customer",
      size: String(quote.size_yd),
      price: String(Math.round(quote.customer_price)),
      included_days: String(quote.included_days),
      included_tons: quote.included_tons || "2.0",
      overage_rule: quote.overage_rule_text || "$165/ton overage",
      schedule_link: scheduleUrl ?? CALL_TEXT,
      payment_link: quote.payment_link || "#",
      portal_link: quote.portal_link || "#",
    };

    const customerType = String(quote.customer_type || "homeowner").toLowerCase();
    const isHeavy = ["HEAVY", "DEBRIS_HEAVY"].includes(String(quote.material_category || "").toUpperCase());

    for (const ch of pending) {
      const kind = ch === "SMS" ? "sms" : "email";
      const templateKey = ["homeowner", "contractor", "commercial"].includes(customerType)
        ? `outbound_quote_${kind}_${customerType}` : `outbound_quote_${kind}_homeowner`;

      const { data: tmpl } = await admin.from("message_templates").select("subject, body").eq("key", templateKey).maybeSingle();
      if (!tmpl) { results.push({ channel: ch, status: "FAILED", error: `Template ${templateKey} not found` }); continue; }

      let text: string = tmpl.body;
      let subject: string | null = tmpl.subject || null;
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), v);
        if (subject) subject = subject.replace(new RegExp(`\\{${k}\\}`, "g"), v);
      }
      if (ch === "SMS" && isHeavy) {
        text += "\nHeavy materials: fill-line required. If contamination is found, reclassification may apply at $165/ton.";
      }

      const toAddress = ch === "SMS" ? quote.customer_phone : quote.customer_email;
      if (!toAddress) { results.push({ channel: ch, status: "FAILED", error: `No ${ch} address on quote` }); continue; }

      const provider = testContact ? "TEST" : isLive ? "GHL" : "DRY_RUN";

      // Claim the channel before sending. A concurrent or repeated request with the
      // same key hits the unique index and does not send.
      let claimId: string | null = null;
      if (idemKey) {
        const { data: claim, error: claimErr } = await admin.from("outbound_quote_messages").insert({
          outbound_quote_id: outboundId, channel: ch, provider, to_address: toAddress,
          message_body: text, status: "PENDING", idempotency_key: idemKey,
        }).select("id").single();
        if (claimErr) {
          if ((claimErr as { code?: string }).code === "23505") {
            results.push({ channel: ch, status: "PENDING", duplicate: true });
            continue;
          }
          results.push({ channel: ch, status: "FAILED", error: "Could not record message" });
          continue;
        }
        claimId = claim.id;
      }

      let status = testContact ? "TEST_SUPPRESSED" : isLive ? "SENT" : "DRY_RUN";
      let providerMessageId: string | null = null;
      let errorText: string | undefined;

      if (!testContact && isLive) {
        try {
          const sendRes = await admin.functions.invoke("ghl-send-outbound", {
            body: { channel: kind, to_address: toAddress, subject, body: text, entity_type: "outbound_quote", entity_id: outboundId },
          });
          if (sendRes.error) { status = "FAILED"; errorText = sendRes.error.message; }
          else providerMessageId = sendRes.data?.id || null;
        } catch (e) {
          status = "FAILED"; errorText = e instanceof Error ? e.message : "send failed";
        }
      } else if (testContact) {
        console.log(`TEST_TRANSPORT: outbound quote ${ch} suppressed`);
      }

      if (claimId) {
        await admin.from("outbound_quote_messages")
          .update({ status, provider_message_id: providerMessageId }).eq("id", claimId);
      } else {
        await admin.from("outbound_quote_messages").insert({
          outbound_quote_id: outboundId, channel: ch, provider, to_address: toAddress,
          message_body: text, status, provider_message_id: providerMessageId,
        });
      }
      results.push({ channel: ch, status, ...(errorText ? { error: errorText } : {}) });
    }

    const fresh = results.filter((r) => !r.duplicate);
    const allFailed = results.length > 0 && results.every((r) => r.status === "FAILED");
    const anySent = results.some((r) => r.status === "SENT");
    const newStatus = allFailed ? "FAILED" : anySent ? "SENT" : results.some((r) => r.status === "TEST_SUPPRESSED") ? "TEST" : "DRAFT";

    if (fresh.length > 0) {
      await admin.from("outbound_quotes").update({
        status: newStatus,
        error_message: allFailed ? results.map((r) => r.error).filter(Boolean).join("; ") : null,
      }).eq("id", outboundId);
    }

    return json({
      success: !allFailed,
      status: newStatus,
      results,
      duplicate: fresh.length === 0,
      schedule_link_included: !!scheduleUrl,
      schedule_link_expires_at: linkExpiresAt,
      schedule_link_unavailable_reason: wantsLink && !scheduleUrl && pending.length > 0 ? linkCode : null,
    });
  } catch (err) {
    console.error("send-outbound-quote error:", err instanceof Error ? err.message : "unknown");
    return json({ success: false, error: "Internal error" }, 500);
  }
});
