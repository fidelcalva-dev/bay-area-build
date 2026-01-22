import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  quoteId: string;
}

interface OrderSnapshot {
  quote_id: string;
  customer_id: string | null;
  scheduled_delivery_date: string | null;
  scheduled_delivery_window: string | null;
  scheduled_pickup_date: string | null;
  assigned_yard_id: string | null;
  status: string;
  final_total: number | null;
  route_notes: string | null;
  driver_notes: string | null;
  text_before_arrival: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { quoteId }: CreateOrderRequest = await req.json();

    if (!quoteId) {
      return new Response(
        JSON.stringify({ error: "quoteId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Check if order already exists for this quote (prevent duplicates)
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, status")
      .eq("quote_id", quoteId)
      .single();

    if (existingOrder) {
      console.log(`Order already exists for quote ${quoteId}: ${existingOrder.id}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          orderId: existingOrder.id, 
          status: existingOrder.status,
          alreadyExists: true,
          message: "Order already exists for this quote" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch the quote with all relevant data
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select(`
        *,
        dumpster_sizes:size_id (id, label, size_value, base_price, included_tons)
      `)
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      console.error("Quote not found:", quoteError);
      return new Response(
        JSON.stringify({ error: "Quote not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Look up yard by yard_id or yard_name
    let assignedYardId: string | null = null;
    if (quote.yard_id) {
      const { data: yard } = await supabase
        .from("yards")
        .select("id")
        .eq("id", quote.yard_id)
        .single();
      if (yard) assignedYardId = yard.id;
    } else if (quote.yard_name) {
      const { data: yard } = await supabase
        .from("yards")
        .select("id")
        .ilike("name", `%${quote.yard_name}%`)
        .limit(1)
        .single();
      if (yard) assignedYardId = yard.id;
    }

    // 4. Find or create customer
    let customerId: string | null = quote.customer_id;
    if (!customerId && quote.customer_phone) {
      // Try to find customer by phone
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .or(`phone.eq.${quote.customer_phone},billing_phone.eq.${quote.customer_phone}`)
        .limit(1)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create a placeholder customer record
        const { data: newCustomer } = await supabase
          .from("customers")
          .insert({
            phone: quote.customer_phone,
            billing_phone: quote.customer_phone,
            billing_email: quote.customer_email,
            company_name: quote.company_name,
            customer_type: quote.user_type === "contractor" ? "contractor" : "homeowner",
            user_id: crypto.randomUUID(), // Placeholder for phone-based customers
          })
          .select("id")
          .single();
        
        if (newCustomer) customerId = newCustomer.id;
      }
    }

    // 5. Build route notes from quote data
    const routeNotes: string[] = [];
    if (quote.truck_distance_miles) {
      routeNotes.push(`Distance: ${quote.truck_distance_miles.toFixed(1)} mi`);
    }
    if (quote.truck_duration_min) {
      routeNotes.push(`ETA: ${quote.truck_duration_min}-${quote.truck_duration_max || quote.truck_duration_min + 10} min`);
    }
    if (quote.toll_surcharge && quote.toll_surcharge > 0) {
      routeNotes.push(`Toll: $${quote.toll_surcharge}`);
    }
    if (quote.distance_bracket) {
      routeNotes.push(`Zone: ${quote.distance_bracket}`);
    }

    // 6. Build driver notes from placement
    const driverNotes: string[] = [];
    if (quote.placement_type) {
      driverNotes.push(`Placement: ${quote.placement_type}`);
    }
    if (quote.placement_notes) {
      driverNotes.push(quote.placement_notes);
    }
    if (quote.delivery_address) {
      driverNotes.push(`Address: ${quote.delivery_address}`);
    }

    // 7. Create the order
    const orderData: OrderSnapshot = {
      quote_id: quoteId,
      customer_id: customerId,
      scheduled_delivery_date: quote.preferred_delivery_date,
      scheduled_delivery_window: quote.preferred_delivery_window,
      scheduled_pickup_date: quote.suggested_pickup_date,
      assigned_yard_id: assignedYardId,
      status: "scheduled_requested",
      final_total: quote.subtotal || quote.estimated_min,
      route_notes: routeNotes.length > 0 ? routeNotes.join(" | ") : null,
      driver_notes: driverNotes.length > 0 ? driverNotes.join(" | ") : null,
      text_before_arrival: true, // Default to on
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order", details: orderError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Update quote status to 'converted'
    await supabase
      .from("quotes")
      .update({ 
        status: "converted",
        converted_at: new Date().toISOString(),
        customer_id: customerId, // Link customer if created
      })
      .eq("id", quoteId);

    // 9. Create quote event for audit trail
    await supabase
      .from("quote_events")
      .insert({
        quote_id: quoteId,
        event_type: "ORDER_CREATED_FROM_QUOTE",
        event_data: {
          order_id: order.id,
          order_status: order.status,
          customer_id: customerId,
          assigned_yard_id: assignedYardId,
          scheduled_delivery_date: quote.preferred_delivery_date,
          scheduled_delivery_window: quote.preferred_delivery_window,
          final_total: orderData.final_total,
          pricing_snapshot: {
            subtotal: quote.subtotal,
            estimated_min: quote.estimated_min,
            estimated_max: quote.estimated_max,
            material_type: quote.material_type,
            size_id: quote.size_id,
            rental_days: quote.rental_days,
            extras: quote.extras,
            toll_surcharge: quote.toll_surcharge,
            extra_tons_prepurchased: quote.extra_tons_prepurchased,
            prepurchase_rate: quote.prepurchase_rate,
            green_halo_dump_fee: quote.green_halo_dump_fee,
            green_halo_handling_fee: quote.green_halo_handling_fee,
            heavy_material_class: quote.heavy_material_class,
            heavy_material_increment: quote.heavy_material_increment,
          },
          placement_data: {
            placement_type: quote.placement_type,
            placement_notes: quote.placement_notes,
            placement_lat: quote.placement_lat,
            placement_lng: quote.placement_lng,
            delivery_address: quote.delivery_address,
            delivery_lat: quote.delivery_lat,
            delivery_lng: quote.delivery_lng,
          },
          route_data: {
            yard_id: quote.yard_id,
            yard_name: quote.yard_name,
            truck_distance_miles: quote.truck_distance_miles,
            truck_duration_min: quote.truck_duration_min,
            truck_duration_max: quote.truck_duration_max,
            routing_provider: quote.routing_provider,
          },
        },
      });

    // 10. Create order_event for traceability
    await supabase
      .from("order_events")
      .insert({
        order_id: order.id,
        event_type: "ORDER_CREATED",
        actor_role: "system",
        message: `Order created from quote. Delivery: ${quote.preferred_delivery_date || 'TBD'} (${quote.preferred_delivery_window || 'TBD'})`,
        after_json: {
          status: "scheduled_requested",
          delivery_date: quote.preferred_delivery_date,
          delivery_window: quote.preferred_delivery_window,
          pickup_date: quote.suggested_pickup_date,
        },
      });

    // 11. Create schedule_logs entry
    await supabase
      .from("schedule_logs")
      .insert({
        order_id: order.id,
        action: "requested",
        new_date: quote.preferred_delivery_date,
        new_window: quote.preferred_delivery_window,
        actor_role: "customer",
        reason: "Customer scheduled via quote flow",
      });

    console.log(`Order ${order.id} created from quote ${quoteId}`);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        status: order.status,
        alreadyExists: false,
        message: "Order created successfully",
        customerId,
        assignedYardId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
