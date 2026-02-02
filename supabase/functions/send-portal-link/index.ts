import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeBase64 } from "https://deno.land/std@0.220.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendPortalLinkRequest {
  order_id: string;
  trigger_source: "SIGNED" | "CONFIRMED" | "PAID" | "MANUAL";
  force_resend?: boolean;
}

interface CustomerData {
  id?: string;
  billing_phone?: string;
  billing_email?: string;
  company_name?: string;
  sms_opt_out?: boolean;
}

interface QuoteData {
  id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: SendPortalLinkRequest = await req.json();
    const { order_id, trigger_source, force_resend = false } = body;

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "order_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get order details with customer and quote info
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        customer_id,
        portal_link_sent_at,
        quotes (
          id,
          customer_name,
          customer_phone,
          customer_email
        ),
        customers (
          id,
          billing_phone,
          billing_email,
          company_name,
          sms_opt_out
        )
      `)
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate send (within 24 hours) unless force_resend
    if (!force_resend && order.portal_link_sent_at) {
      const lastSent = new Date(order.portal_link_sent_at);
      const hoursSince = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Portal link already sent within 24 hours",
            last_sent_at: order.portal_link_sent_at 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check SMS opt-out
    const customer = order.customers as CustomerData | null;
    if (customer?.sms_opt_out) {
      return new Response(
        JSON.stringify({ error: "Customer has opted out of SMS" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate secure token (32 bytes = 256 bits)
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = encodeBase64(tokenBytes)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Hash the token for storage
    const encoder = new TextEncoder();
    const tokenData = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", tokenData);
    const hashArray = new Uint8Array(hashBuffer);
    const tokenHash = encodeBase64(hashArray);

    // Create portal link in database
    const { data: linkId, error: linkError } = await supabase
      .rpc("create_portal_link", {
        p_order_id: order_id,
        p_token_hash: tokenHash,
        p_trigger_source: trigger_source,
      });

    if (linkError) {
      console.error("Failed to create portal link:", linkError);
      return new Response(
        JSON.stringify({ error: "Failed to create portal link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build portal URL
    const portalBaseUrl = Deno.env.get("PORTAL_BASE_URL") || "https://bay-area-build.lovable.app";
    const portalLink = `${portalBaseUrl}/portal/order/${order_id}?token=${token}`;

    // Get messaging mode
    const { data: modeConfig } = await supabase
      .from("config_settings")
      .select("value")
      .eq("key", "ghl.messaging_mode")
      .single();
    
    const mode = (modeConfig?.value as string)?.replace(/"/g, "") || "DRY_RUN";

    // Get customer details
    const quote = order.quotes as QuoteData | null;
    const customerName = quote?.customer_name || customer?.company_name || "Customer";
    const customerPhone = quote?.customer_phone || customer?.billing_phone;
    const customerEmail = quote?.customer_email || customer?.billing_email;

    // Select template based on trigger
    const templateKey = trigger_source === "SIGNED" 
      ? "portal_link_signed"
      : trigger_source === "PAID"
        ? "portal_link_paid"
        : "portal_link_confirmed";

    // Get template
    const { data: template } = await supabase
      .from("message_templates")
      .select("body")
      .eq("key", templateKey)
      .single();

    // Build message body
    let messageBody = template?.body || 
      `Hi ${customerName}, your order is confirmed. Track your dumpster here: ${portalLink} Reply STOP to opt out.`;
    messageBody = messageBody
      .replace("{{customer_name}}", customerName.split(" ")[0])
      .replace("{{portal_link}}", portalLink);

    // Enqueue SMS if phone available
    let smsQueued = false;
    if (customerPhone) {
      const { error: queueError } = await supabase
        .from("message_queue")
        .insert({
          channel: "sms",
          to_address: customerPhone,
          template_key: templateKey,
          body: messageBody,
          entity_type: "order",
          entity_id: order_id,
          provider: "GHL",
          mode,
          status: mode === "LIVE" ? "PENDING" : "DRAFT",
          payload: {
            trigger_source,
            portal_link: portalLink,
            customer_name: customerName,
          },
        });

      if (queueError) {
        console.error("Failed to queue SMS:", queueError);
      } else {
        smsQueued = true;
      }
    }

    // Optionally queue email
    let emailQueued = false;
    if (customerEmail) {
      const { data: emailTemplate } = await supabase
        .from("message_templates")
        .select("subject, body")
        .eq("key", "portal_link_email")
        .single();

      if (emailTemplate) {
        let emailBody = emailTemplate.body
          .replace("{{customer_name}}", customerName.split(" ")[0])
          .replace("{{portal_link}}", portalLink);

        const { error: emailQueueError } = await supabase
          .from("message_queue")
          .insert({
            channel: "email",
            to_address: customerEmail,
            template_key: "portal_link_email",
            subject: emailTemplate.subject || "Track Your Dumpster Order",
            body: emailBody,
            entity_type: "order",
            entity_id: order_id,
            provider: "RESEND",
            mode,
            status: mode === "LIVE" ? "PENDING" : "DRAFT",
            payload: {
              trigger_source,
              portal_link: portalLink,
              customer_name: customerName,
            },
          });

        if (!emailQueueError) {
          emailQueued = true;
        }
      }
    }

    // Update order with sent timestamp
    await supabase
      .from("orders")
      .update({ portal_link_sent_at: new Date().toISOString() })
      .eq("id", order_id);

    // Log to audit
    await supabase
      .from("audit_logs")
      .insert({
        action: "PORTAL_LINK_SENT",
        entity_type: "order",
        entity_id: order_id,
        after_data: {
          trigger_source,
          mode,
          sms_queued: smsQueued,
          email_queued: emailQueued,
          portal_link: portalLink,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        portal_link: portalLink,
        sms_queued: smsQueued,
        email_queued: emailQueued,
        link_id: linkId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send portal link error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
