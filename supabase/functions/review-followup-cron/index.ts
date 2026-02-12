import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Market-specific Google review links
const REVIEW_LINKS: Record<string, string> = {
  OAK_EAST_BAY: "https://g.page/calsan-dumpsters-pro/review",
  SJ_SOUTH_BAY: "https://g.page/calsan-dumpsters-pro/review",
  SF_PENINSULA: "https://g.page/calsan-dumpsters-pro/review",
  DEFAULT: "https://g.page/calsan-dumpsters-pro/review",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();

    // --- FOLLOWUP 1: 3 days after initial send, no followup_1 yet ---
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: followup1List } = await supabase
      .from("review_requests")
      .select("id, customer_id, city_name, market_code, review_link, customer_type, channel")
      .eq("status", "sent")
      .eq("review_received", false)
      .eq("opted_out", false)
      .is("followup_1_sent_at", null)
      .lt("sent_at", threeDaysAgo)
      .limit(20);

    // --- FOLLOWUP 2: 7 days after initial send, followup_1 done, no followup_2 ---
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: followup2List } = await supabase
      .from("review_requests")
      .select("id, customer_id, city_name, market_code, review_link, customer_type, channel")
      .eq("status", "sent")
      .eq("review_received", false)
      .eq("opted_out", false)
      .not("followup_1_sent_at", "is", null)
      .is("followup_2_sent_at", null)
      .lt("sent_at", sevenDaysAgo)
      .limit(20);

    let sent = 0;

    // Process followup 1
    for (const rr of followup1List || []) {
      const { data: customer } = await supabase
        .from("customers")
        .select("first_name, phone, email")
        .eq("id", rr.customer_id)
        .single();

      if (!customer) continue;

      const name = customer.first_name || "there";
      const city = rr.city_name || "the Bay Area";
      const link = rr.review_link;
      const isContractor = rr.customer_type === "contractor";

      // SMS followup
      if (customer.phone && (rr.channel === "sms" || rr.channel === "both")) {
        const smsBody = isContractor
          ? `Hey ${name}, quick favor — your review helps other contractors find reliable dumpster rental in ${city}. Takes 30 sec: ${link} — Reply STOP to opt out.`
          : `Hi ${name}, we hope your dumpster rental went smoothly! A quick review helps neighbors in ${city} find us: ${link} — Reply STOP to opt out.`;

        try {
          await supabase.functions.invoke("send-sms", {
            body: { to: customer.phone, body: smsBody },
          });
        } catch (e) {
          console.error("Followup 1 SMS failed:", e);
        }
      }

      // Email followup
      if (customer.email && (rr.channel === "email" || rr.channel === "both")) {
        const subject = isContractor
          ? `${name}, your feedback matters to fellow contractors`
          : `${name}, how was your dumpster rental experience?`;

        const html = `<p>Hi ${name},</p>
<p>We noticed you haven't had a chance to leave a review yet — no worries! If you have 30 seconds, your feedback helps other ${isContractor ? "contractors" : "homeowners"} in ${city} find reliable same-day dumpster delivery.</p>
<p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#0F4C3A;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Leave a Quick Review</a></p>
<p>Thank you,<br/>The Calsan Dumpsters Pro Team<br/>(510) 680-2150</p>`;

        try {
          await supabase.functions.invoke("send-email", {
            body: { to: customer.email, subject, html },
          });
        } catch (e) {
          console.error("Followup 1 email failed:", e);
        }
      }

      await supabase
        .from("review_requests")
        .update({ followup_1_sent_at: now.toISOString() })
        .eq("id", rr.id);

      sent++;
    }

    // Process followup 2
    for (const rr of followup2List || []) {
      const { data: customer } = await supabase
        .from("customers")
        .select("first_name, phone, email")
        .eq("id", rr.customer_id)
        .single();

      if (!customer) continue;

      const name = customer.first_name || "there";
      const link = rr.review_link;

      // Final SMS reminder only
      if (customer.phone && (rr.channel === "sms" || rr.channel === "both")) {
        const smsBody = `Last reminder, ${name}! Your honest review means the world to our small local team: ${link} — Reply STOP to opt out.`;

        try {
          await supabase.functions.invoke("send-sms", {
            body: { to: customer.phone, body: smsBody },
          });
        } catch (e) {
          console.error("Followup 2 SMS failed:", e);
        }
      }

      await supabase
        .from("review_requests")
        .update({ followup_2_sent_at: now.toISOString() })
        .eq("id", rr.id);

      sent++;
    }

    return new Response(
      JSON.stringify({ success: true, followups_sent: sent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
