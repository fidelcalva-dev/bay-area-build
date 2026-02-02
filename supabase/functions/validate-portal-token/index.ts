import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeBase64 } from "https://deno.land/std@0.220.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ValidateTokenRequest {
  order_id: string;
  token: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: ValidateTokenRequest = await req.json();
    const { order_id, token } = body;

    if (!order_id || !token) {
      return new Response(
        JSON.stringify({ valid: false, error: "order_id and token are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash the provided token
    const encoder = new TextEncoder();
    const tokenData = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", tokenData);
    const hashArray = new Uint8Array(hashBuffer);
    const tokenHash = encodeBase64(hashArray);

    // Validate using the database function
    const { data, error } = await supabase
      .rpc("validate_portal_token", {
        p_order_id: order_id,
        p_token_hash: tokenHash,
      });

    if (error) {
      console.error("Validation error:", error);
      return new Response(
        JSON.stringify({ valid: false, error: "Validation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = data?.[0];
    if (!result?.valid) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch order details for the portal
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        scheduled_delivery_date,
        scheduled_delivery_window,
        scheduled_pickup_date,
        scheduled_pickup_window,
        actual_delivery_at,
        actual_pickup_at,
        payment_status,
        amount_due,
        balance_due,
        quotes (
          id,
          customer_name,
          customer_phone,
          customer_email,
          delivery_address,
          material_type,
          placement_type,
          placement_notes,
          size_id,
          subtotal
        )
      `)
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ valid: false, error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        order_id: result.order_id,
        customer_id: result.customer_id,
        link_id: result.link_id,
        order,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Validate portal token error:", error);
    return new Response(
      JSON.stringify({ valid: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
