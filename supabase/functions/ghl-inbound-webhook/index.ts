import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GHLInboundMessage {
  type: string;
  locationId: string;
  contactId: string;
  conversationId: string;
  messageId: string;
  body: string;
  direction: string;
  status: string;
  dateAdded: string;
  phone?: string;
  email?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const data: GHLInboundMessage = await req.json();
    console.log("GHL Inbound Webhook:", JSON.stringify(data).substring(0, 500));

    // Only process inbound messages
    if (data.direction !== "inbound") {
      return new Response(
        JSON.stringify({ success: true, message: "Ignoring non-inbound message" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messageBody = data.body?.toLowerCase() || "";

    // Handle SMS opt-out (STOP keyword)
    if (data.phone && (messageBody === "stop" || messageBody === "unsubscribe")) {
      // Find customer by phone
      const phone = data.phone.replace(/\D/g, "").slice(-10);
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .or(`billing_phone.eq.${phone},billing_phone.ilike.%${phone}%`)
        .limit(1)
        .single();

      if (customer) {
        await supabase
          .from("customers")
          .update({
            sms_opt_out: true,
            sms_opt_out_at: new Date().toISOString(),
          })
          .eq("id", customer.id);

        console.log(`Customer ${customer.id} opted out of SMS`);
      }

      // Log the opt-out
      await supabase.from("message_logs").insert({
        channel: "sms",
        to_address: data.phone,
        body: data.body,
        provider: "GHL",
        provider_message_id: data.messageId,
        status: "RECEIVED",
        response: { action: "opt_out", contact_id: data.contactId },
      });

      return new Response(
        JSON.stringify({ success: true, action: "opt_out_processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find matching customer/contact
    let contactId: string | null = null;
    let orderId: string | null = null;

    if (data.phone) {
      const phone = data.phone.replace(/\D/g, "").slice(-10);
      
      // Check customers
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .or(`billing_phone.eq.${phone},billing_phone.ilike.%${phone}%`)
        .limit(1)
        .single();

      if (customer) {
        contactId = customer.id;

        // Find most recent active order
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("customer_id", customer.id)
          .in("status", ["scheduled", "delivered", "pending"])
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (order) {
          orderId = order.id;
        }
      }
    }

    // Log inbound message
    await supabase.from("message_logs").insert({
      channel: data.phone ? "sms" : "email",
      to_address: data.phone || data.email || "unknown",
      body: data.body,
      provider: "GHL",
      provider_message_id: data.messageId,
      status: "RECEIVED",
      response: {
        ghl_contact_id: data.contactId,
        ghl_conversation_id: data.conversationId,
        matched_customer_id: contactId,
        matched_order_id: orderId,
      },
    });

    // Create task for follow-up if matched to a customer
    if (contactId) {
      await supabase.from("crm_tasks").insert({
        entity_type: orderId ? "order" : "customer",
        entity_id: orderId || contactId,
        task_type: "inbound_reply",
        subject: `Inbound ${data.phone ? "SMS" : "Email"} Reply`,
        description: data.body?.substring(0, 500),
        priority: "high",
        due_date: new Date().toISOString(),
        assigned_team: "cs",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        contact_id: contactId,
        order_id: orderId,
        message: "Inbound message processed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("ghl-inbound-webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
