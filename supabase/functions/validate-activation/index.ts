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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { token, action } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "Token required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up token
    const { data: tokenRecord, error: tokenErr } = await supabase
      .from("activation_tokens")
      .select("*, customers(id, company_name, contact_name, billing_email, phone, customer_type, activation_status)")
      .eq("token", token)
      .single();

    if (tokenErr || !tokenRecord) {
      return new Response(JSON.stringify({ error: "Invalid activation link", valid: false }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiry
    if (new Date(tokenRecord.expires_at) < new Date()) {
      await supabase.from("activation_tokens").update({ status: "expired" }).eq("id", tokenRecord.id);
      await supabase.from("customers").update({ activation_status: "expired" }).eq("id", tokenRecord.customer_id);
      return new Response(JSON.stringify({ error: "This activation link has expired", valid: false, expired: true }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already used
    if (tokenRecord.used_at) {
      return new Response(JSON.stringify({ error: "This link has already been used", valid: false, used: true }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record click if first time
    if (!tokenRecord.clicked_at) {
      await supabase
        .from("activation_tokens")
        .update({ clicked_at: new Date().toISOString(), status: "clicked" })
        .eq("id", tokenRecord.id);
      
      // Update customer status
      const currentStatus = tokenRecord.customers?.activation_status;
      if (currentStatus !== "activated") {
        await supabase
          .from("customers")
          .update({ activation_status: "opened" })
          .eq("id", tokenRecord.customer_id);
      }
    }

    const customer = tokenRecord.customers;

    // Action: activate (mark as activated after successful OTP or password setup)
    if (action === "activate") {
      await supabase
        .from("activation_tokens")
        .update({ used_at: new Date().toISOString(), status: "activated" })
        .eq("id", tokenRecord.id);

      await supabase
        .from("customers")
        .update({ activation_status: "activated", activated_at: new Date().toISOString() })
        .eq("id", tokenRecord.customer_id);

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Account activated successfully" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: validate and return customer info
    return new Response(JSON.stringify({
      valid: true,
      customer: customer ? {
        id: customer.id,
        company_name: customer.company_name,
        contact_name: customer.contact_name,
        billing_email: customer.billing_email,
        phone: customer.phone,
        customer_type: customer.customer_type,
      } : null,
      channel: tokenRecord.channel,
      has_phone: !!(customer?.phone && customer.phone.length >= 7),
      has_email: !!(customer?.billing_email && customer.billing_email.includes("@")),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
