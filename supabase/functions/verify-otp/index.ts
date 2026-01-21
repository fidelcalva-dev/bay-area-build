import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple hash function for OTP verification
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate secure session token
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Format phone to E.164
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { phone, code } = await req.json();

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "Phone and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedPhone = formatPhone(phone);
    const codeHash = await hashCode(code);

    // Find the most recent OTP for this phone
    const { data: otp, error: otpError } = await supabase
      .from("phone_otps")
      .select("*")
      .eq("phone", formattedPhone)
      .is("verified_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otp) {
      return new Response(
        JSON.stringify({ error: "No pending code found. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (new Date(otp.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Code expired. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check cooldown
    if (otp.cooldown_until && new Date(otp.cooldown_until) > new Date()) {
      const waitMinutes = Math.ceil((new Date(otp.cooldown_until).getTime() - Date.now()) / 60000);
      return new Response(
        JSON.stringify({ 
          error: `Too many attempts. Please wait ${waitMinutes} minutes.`,
          cooldown: true 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify code
    if (otp.code_hash !== codeHash) {
      const newAttempts = otp.attempts + 1;
      const updateData: Record<string, unknown> = { attempts: newAttempts };

      // After 5 failed attempts, set 15-minute cooldown
      if (newAttempts >= 5) {
        updateData.cooldown_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }

      await supabase
        .from("phone_otps")
        .update(updateData)
        .eq("id", otp.id);

      const attemptsLeft = 5 - newAttempts;
      return new Response(
        JSON.stringify({ 
          error: attemptsLeft > 0 
            ? `Invalid code. ${attemptsLeft} attempts remaining.`
            : "Too many failed attempts. Please wait 15 minutes."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Code is valid - mark as verified
    await supabase
      .from("phone_otps")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", otp.id);

    // Find or create customer
    let { data: customer } = await supabase
      .from("customers")
      .select("*")
      .or(`phone.eq.${formattedPhone},billing_phone.eq.${formattedPhone}`)
      .limit(1)
      .single();

    if (!customer) {
      // Create a new customer record
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          phone: formattedPhone,
          billing_phone: formattedPhone,
          customer_type: "homeowner",
          user_id: crypto.randomUUID(), // Placeholder for phone-only customers
        })
        .select()
        .single();

      if (customerError) {
        console.error("Failed to create customer:", customerError);
      } else {
        customer = newCustomer;
      }
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days

    const { error: sessionError } = await supabase.from("customer_sessions").insert({
      phone: formattedPhone,
      customer_id: customer?.id,
      session_token: sessionToken,
      expires_at: expiresAt,
    });

    if (sessionError) {
      console.error("Failed to create session:", sessionError);
      return new Response(
        JSON.stringify({ error: "Failed to create session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        session_token: sessionToken,
        expires_at: expiresAt,
        customer: customer ? {
          id: customer.id,
          phone: formattedPhone,
          company_name: customer.company_name,
          customer_type: customer.customer_type,
        } : null
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
