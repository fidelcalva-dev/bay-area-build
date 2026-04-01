import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a random 6-digit code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simple hash function for OTP (in production, use bcrypt)
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Format phone to E.164 with validation
function formatPhone(phone: string): { formatted: string; valid: boolean } {
  // Strip all non-digits
  let digits = phone.replace(/\D/g, "");
  
  // Handle numbers that start with country code
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.substring(1); // Remove leading 1
  }
  
  // US phone numbers should have exactly 10 digits
  if (digits.length !== 10) {
    return { formatted: "", valid: false };
  }
  
  // Validate area code (can't start with 0 or 1)
  const areaCode = digits.substring(0, 3);
  if (areaCode.startsWith("0") || areaCode.startsWith("1")) {
    return { formatted: "", valid: false };
  }
  
  return { formatted: `+1${digits}`, valid: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { formatted: formattedPhone, valid } = formatPhone(phone);

    if (!valid) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format. Please enter a valid 10-digit US phone number." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Check for existing OTP with cooldown
    const { data: existingOtp } = await supabase
      .from("phone_otps")
      .select("*")
      .eq("phone", formattedPhone)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Check cooldown
    if (existingOtp?.cooldown_until) {
      const cooldownTime = new Date(existingOtp.cooldown_until);
      if (cooldownTime > new Date()) {
        const waitMinutes = Math.ceil((cooldownTime.getTime() - Date.now()) / 60000);
        return new Response(
          JSON.stringify({ 
            error: `Too many attempts. Please wait ${waitMinutes} minutes.`,
            cooldown: true,
            waitMinutes
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Rate limit: max 3 OTPs per 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("phone_otps")
      .select("*", { count: "exact", head: true })
      .eq("phone", formattedPhone)
      .gte("created_at", tenMinutesAgo);

    if (count && count >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many code requests. Please wait a few minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate and hash OTP
    const code = generateOTP();
    const codeHash = await hashCode(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Store OTP
    const { error: insertError } = await supabase.from("phone_otps").insert({
      phone: formattedPhone,
      code_hash: codeHash,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error("Failed to store OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send SMS via Twilio
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error("Twilio credentials not configured - SMS service unavailable");
      return new Response(
        JSON.stringify({ error: "SMS service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const smsResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: twilioPhoneNumber,
        Body: `Your Calsan login code is ${code}. Expires in 5 minutes.`,
      }),
    });

    if (!smsResponse.ok) {
      const smsError = await smsResponse.text();
      console.error("Twilio error:", smsError);
      return new Response(
        JSON.stringify({ error: "Failed to send SMS" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Code sent" }),
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
