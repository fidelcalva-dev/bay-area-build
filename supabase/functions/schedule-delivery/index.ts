import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { orderId, deliveryDate, deliveryWindow, flexOption } = await req.json();

    // Validate required fields
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify order exists
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, quote_id, customer_id, status")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      console.error("Order lookup failed:", orderErr);
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      status: "scheduled",
    };

    // Handle flex options (ASAP, Flexible, Call Me)
    if (flexOption) {
      updatePayload.scheduled_delivery_date = null;
      updatePayload.scheduled_delivery_window = null;
      updatePayload.delivery_notes = `Customer preference: ${flexOption}`;
      // Must match orders_status_check allowed values
      updatePayload.status = "scheduled_requested";
    } else if (deliveryDate && deliveryWindow) {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(deliveryDate)) {
        return new Response(JSON.stringify({ error: "Invalid date format. Use YYYY-MM-DD" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Normalize window to lowercase enum value
      const normalizedWindow = deliveryWindow.toLowerCase();
      const validWindows = ["morning", "midday", "afternoon"];
      if (!validWindows.includes(normalizedWindow)) {
        return new Response(JSON.stringify({ error: `Invalid delivery window. Must be one of: ${validWindows.join(", ")}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      updatePayload.scheduled_delivery_date = deliveryDate;
      updatePayload.scheduled_delivery_window = normalizedWindow;
    } else {
      return new Response(JSON.stringify({ error: "deliveryDate + deliveryWindow or flexOption required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update order
    const { error: updateErr } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId);

    if (updateErr) {
      console.error("Order update failed:", updateErr);
      return new Response(JSON.stringify({ error: "Failed to update order schedule" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log order event
    const eventMessage = flexOption
      ? `Customer selected flex option: ${flexOption}`
      : `Customer selected delivery: ${deliveryDate} (${deliveryWindow})`;

    await supabase.from("order_events").insert({
      order_id: orderId,
      event_type: "DELIVERY_DATE_SELECTED",
      actor_role: "customer",
      message: eventMessage,
      after_json: flexOption
        ? { flex_option: flexOption }
        : { scheduled_delivery_date: deliveryDate, scheduled_delivery_window: deliveryWindow },
    });

    // Log to schedule_logs
    await supabase.from("schedule_logs").insert({
      order_id: orderId,
      action: "confirmed",
      new_date: flexOption ? null : deliveryDate,
      new_window: flexOption || deliveryWindow,
      actor_role: "customer",
      reason: flexOption
        ? `Customer selected: ${flexOption}`
        : "Customer confirmed via quote flow",
    });

    // Update lead timeline if quote has a lead
    if (order.quote_id) {
      const { data: quote } = await supabase
        .from("quotes")
        .select("lead_id")
        .eq("id", order.quote_id)
        .single();

      if (quote?.lead_id) {
        await supabase.from("lead_events").insert({
          lead_id: quote.lead_id,
          event_type: "DELIVERY_DATE_SELECTED",
          description: eventMessage,
          metadata: flexOption
            ? { flex_option: flexOption, order_id: orderId }
            : { delivery_date: deliveryDate, delivery_window: deliveryWindow, order_id: orderId },
        });
      }
    }

    console.log(`Schedule saved for order ${orderId}: ${flexOption || `${deliveryDate} ${deliveryWindow}`}`);

    return new Response(JSON.stringify({ success: true, orderId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("schedule-delivery error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
