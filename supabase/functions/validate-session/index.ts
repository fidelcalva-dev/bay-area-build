import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { session_token } = await req.json();

    if (!session_token) {
      return new Response(
        JSON.stringify({ valid: false, error: "Session token required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find session
    const { data: session, error: sessionError } = await supabase
      .from("customer_sessions")
      .select("*, customers(*)")
      .eq("session_token", session_token)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase
        .from("customer_sessions")
        .delete()
        .eq("id", session.id);

      return new Response(
        JSON.stringify({ valid: false, error: "Session expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last active
    await supabase
      .from("customer_sessions")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", session.id);

    return new Response(
      JSON.stringify({ 
        valid: true,
        phone: session.phone,
        customer: session.customers ? {
          id: session.customers.id,
          company_name: session.customers.company_name,
          customer_type: session.customers.customer_type,
          billing_email: session.customers.billing_email,
        } : null
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
