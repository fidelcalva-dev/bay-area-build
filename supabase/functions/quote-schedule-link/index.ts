// CAL 010 — Secure schedule link for one quote.
// Actions:
//   issue   (staff)  -> creates a link for a quote; returns the raw token once.
//   revoke  (staff)  -> revokes one link or every active link of a quote.
//   preview (link)   -> read-only summary; never creates orders or sends anything.
//   confirm (link)   -> customer explicitly confirms date/window; creates the order
//                       through create-order-from-quote; retries return the same order.
// Holding the link authorizes these customer actions for that quote only; it is not
// identity verification and is recorded as "link holder".
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkScheduleLink, issueScheduleLink } from "../_shared/schedule-link.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const WINDOWS = new Set(["morning", "midday", "afternoon"]);
const STAFF_LINK_ROLES = [
  "admin", "system_admin", "owner", "executive", "ops_admin",
  "sales", "sales_admin", "sales_rep", "dispatcher", "cs", "cs_agent", "customer_service",
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// deno-lint-ignore no-explicit-any
async function staffUser(req: Request, admin: any): Promise<string | null> {
  const auth = req.headers.get("Authorization") || "";
  const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!jwt) return null;
  const { data } = await admin.auth.getUser(jwt);
  const userId = data?.user?.id as string | undefined;
  if (!userId) return null;
  const { data: roleOk } = await admin.rpc("has_any_role", { _user_id: userId, _roles: STAFF_LINK_ROLES });
  if (roleOk !== true) return null;
  const { data: active } = await admin.rpc("is_staff", { _user_id: userId });
  return active === true ? userId : null;
}

// "Today" in Oakland, as YYYY-MM-DD.
function todayLA(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  // deno-lint-ignore no-explicit-any
  const body: any = await req.json().catch(() => ({}));
  const action = body?.action;

  try {
    // ---------------- staff: issue ----------------
    if (action === "issue") {
      const userId = await staffUser(req, admin);
      if (!userId) return json({ error: "Not authorized", code: "not_authorized" }, 401);

      let quoteId: string | null = typeof body.quote_id === "string" ? body.quote_id : null;
      const outboundId: string | null = typeof body.outbound_quote_id === "string" ? body.outbound_quote_id : null;
      if (outboundId && !UUID_RE.test(outboundId)) return json({ error: "Invalid outbound quote", code: "invalid_outbound_quote_id" }, 400);
      if (!quoteId && outboundId) {
        const { data: oq } = await admin.from("outbound_quotes").select("quote_id").eq("id", outboundId).maybeSingle();
        quoteId = oq?.quote_id ?? null;
      }
      if (!quoteId || !UUID_RE.test(quoteId)) return json({ error: "A saved quote is required", code: "missing_quote_id" }, 400);

      const issued = await issueScheduleLink(admin, {
        quoteId, outboundQuoteId: outboundId, userId, days: Number(body.expires_in_days) || 7,
      });
      if (!issued.ok) return json({ error: "Could not create link", code: issued.code }, issued.status);
      return json({ success: true, link_id: issued.linkId, path: issued.path, expires_at: issued.expiresAt });
    }

    // ---------------- staff: revoke ----------------
    if (action === "revoke") {
      const userId = await staffUser(req, admin);
      if (!userId) return json({ error: "Not authorized", code: "not_authorized" }, 401);
      const linkId = typeof body.link_id === "string" && UUID_RE.test(body.link_id) ? body.link_id : null;
      const quoteId = typeof body.quote_id === "string" && UUID_RE.test(body.quote_id) ? body.quote_id : null;
      if (!linkId && !quoteId) return json({ error: "link_id or quote_id required", code: "missing_target" }, 400);
      let q = admin.from("quote_schedule_links")
        .update({ revoked_at: new Date().toISOString(), revoked_by: userId })
        .is("revoked_at", null);
      q = linkId ? q.eq("id", linkId) : q.eq("quote_id", quoteId);
      const { data, error } = await q.select("id, quote_id");
      if (error) return json({ error: "Could not revoke", code: "db_error" }, 500);
      for (const r of data ?? []) {
        await admin.from("quote_events").insert({
          quote_id: r.quote_id, event_type: "SCHEDULE_LINK_REVOKED", event_data: { link_id: r.id, revoked_by: userId },
        });
      }
      return json({ success: true, revoked: (data ?? []).length });
    }

    // ---------------- link holder: preview (read-only) ----------------
    if (action === "preview") {
      const check = await checkScheduleLink(admin, body.token);
      if (!check.ok) return json({ error: "Link not valid", code: check.code }, check.status);
      const link = check.row;
      const { data: quote } = await admin.from("quotes")
        .select("customer_name, user_selected_size_yards, recommended_size_yards, material_type, delivery_address, zip_code, subtotal, rental_days, preferred_delivery_date, preferred_delivery_window, status")
        .eq("id", link.quote_id).maybeSingle();
      if (!quote) return json({ error: "Quote not found", code: "quote_not_found" }, 404);
      await admin.from("quote_schedule_links")
        .update({ last_viewed_at: new Date().toISOString() })
        .eq("id", link.id);
      const firstName = String(quote.customer_name || "").trim().split(/\s+/)[0] || null;
      return json({
        success: true,
        expires_at: link.expires_at,
        confirmed: !!link.confirmed_at,
        order_id: link.order_id,
        requested_delivery_date: link.requested_delivery_date,
        requested_delivery_window: link.requested_delivery_window,
        quote: {
          first_name: firstName,
          size_yards: quote.user_selected_size_yards ?? quote.recommended_size_yards ?? null,
          material_type: quote.material_type,
          delivery_address: quote.delivery_address,
          zip_code: quote.zip_code,
          subtotal: quote.subtotal,
          rental_days: quote.rental_days,
        },
        earliest_date: addDays(todayLA(), 1),
      });
    }

    // ---------------- link holder: explicit confirmation ----------------
    if (action === "confirm") {
      if (body.confirm !== true) return json({ error: "Explicit confirmation required", code: "confirmation_required" }, 400);
      const check = await checkScheduleLink(admin, body.token);
      if (!check.ok) return json({ error: "Link not valid", code: check.code }, check.status);
      const link = check.row;

      // Retry after a confirmed (or uncertain) response: return the same result.
      if (link.order_id) {
        return json({ success: true, orderId: link.order_id, alreadyConfirmed: true,
          delivery_date: link.requested_delivery_date, delivery_window: link.requested_delivery_window });
      }

      const date = String(body.delivery_date || "");
      const win = String(body.delivery_window || "");
      const earliest = addDays(todayLA(), 1);
      const latest = addDays(todayLA(), 60);
      if (!DATE_RE.test(date) || date < earliest || date > latest) {
        return json({ error: "Choose a delivery date between tomorrow and 60 days out", code: "invalid_date" }, 400);
      }
      if (!WINDOWS.has(win)) return json({ error: "Choose a delivery window", code: "invalid_window" }, 400);

      // Store the requested date on the quote only while it is still unconverted,
      // so the order is created with it.
      await admin.from("quotes")
        .update({ preferred_delivery_date: date, preferred_delivery_window: win })
        .eq("id", link.quote_id).is("order_id", null).neq("status", "converted");

      const res = await fetch(`${supabaseUrl}/functions/v1/create-order-from-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        body: JSON.stringify({ quoteId: link.quote_id, scheduleToken: body.token }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out?.orderId) {
        console.error("[quote-schedule-link] order creation failed", res.status, out?.code);
        return json({ error: "We could not confirm this order. Please call us.", code: out?.code || "order_failed" }, res.status >= 400 ? res.status : 502);
      }

      await admin.from("quote_schedule_links")
        .update({ confirmed_at: new Date().toISOString(), order_id: out.orderId,
          requested_delivery_date: date, requested_delivery_window: win })
        .eq("id", link.id).is("order_id", null);
      if (link.outbound_quote_id) {
        await admin.from("outbound_quotes").update({ order_id: out.orderId }).eq("id", link.outbound_quote_id).is("order_id", null);
      }
      // Read back whatever is recorded (a concurrent confirmation may have won).
      const { data: final } = await admin.from("quote_schedule_links")
        .select("order_id, requested_delivery_date, requested_delivery_window").eq("id", link.id).single();
      return json({ success: true, orderId: final?.order_id ?? out.orderId, alreadyConfirmed: !!out.alreadyExists,
        delivery_date: final?.requested_delivery_date ?? date, delivery_window: final?.requested_delivery_window ?? win });
    }

    return json({ error: "Unknown action", code: "unknown_action" }, 400);
  } catch (e) {
    console.error("[quote-schedule-link] error", e);
    return json({ error: "Internal error", code: "internal" }, 500);
  }
});
