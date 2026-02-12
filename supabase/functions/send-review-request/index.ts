import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google review links per market
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

    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get order with customer info
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, customer_id, market_code, delivery_city")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if review request already exists
    const { data: existing } = await supabase
      .from("review_requests")
      .select("id")
      .eq("order_id", order_id)
      .neq("status", "failed")
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ message: "Review request already exists", id: existing.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get customer details
    const { data: customer } = await supabase
      .from("customers")
      .select("id, first_name, last_name, phone, email")
      .eq("id", order.customer_id)
      .single();

    if (!customer) {
      return new Response(JSON.stringify({ error: "Customer not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reviewLink = REVIEW_LINKS[order.market_code || ""] || REVIEW_LINKS.DEFAULT;
    const cityName = order.delivery_city || "the Bay Area";
    const channel = customer.phone && customer.email ? "both" : customer.phone ? "sms" : "email";
    
    // Determine customer type from order context
    const customerType = "residential"; // default; could be enriched from order data

    // Create review request record
    const { data: reviewRequest, error: insertError } = await supabase
      .from("review_requests")
      .insert({
        order_id: order.id,
        customer_id: customer.id,
        city_name: cityName,
        market_code: order.market_code,
        review_link: reviewLink,
        channel,
        customer_type: customerType,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send via existing email/SMS infrastructure
    const firstName = customer.first_name || "Valued Customer";
    const smsBody = `Hi ${firstName}, thanks for choosing Calsan Dumpsters Pro! We'd love your feedback. Please leave a quick review: ${reviewLink} — Reply STOP to opt out.`;
    const emailSubject = `How was your dumpster rental experience, ${firstName}?`;
    const emailBody = `<p>Hi ${firstName},</p><p>Thank you for choosing Calsan Dumpsters Pro for your recent dumpster rental in ${cityName}.</p><p>We'd appreciate it if you could take a moment to share your experience:</p><p><a href="${reviewLink}" style="display:inline-block;padding:12px 24px;background:#1a5276;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Leave a Review</a></p><p>Your feedback helps other homeowners and contractors find reliable dumpster service in the Bay Area.</p><p>Thank you,<br/>The Calsan Dumpsters Pro Team<br/>(510) 680-2150</p>`;

    const updates: Record<string, string> = {};

    // Send SMS if phone available
    if (customer.phone && (channel === "sms" || channel === "both")) {
      try {
        await supabase.functions.invoke("send-sms", {
          body: { to: customer.phone, body: smsBody },
        });
        updates.sms_sent_at = new Date().toISOString();
      } catch (e) {
        console.error("SMS send failed:", e);
      }
    }

    // Send email if available
    if (customer.email && (channel === "email" || channel === "both")) {
      try {
        await supabase.functions.invoke("send-email", {
          body: {
            to: customer.email,
            subject: emailSubject,
            html: emailBody,
          },
        });
        updates.email_sent_at = new Date().toISOString();
      } catch (e) {
        console.error("Email send failed:", e);
      }
    }

    // Update review request with sent timestamps
    if (Object.keys(updates).length > 0) {
      await supabase
        .from("review_requests")
        .update({ ...updates, sent_at: new Date().toISOString(), status: "sent" })
        .eq("id", reviewRequest.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        id: reviewRequest.id,
        channel,
        review_link: reviewLink,
      }),
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
