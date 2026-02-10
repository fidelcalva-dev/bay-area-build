import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { loadEmailConfig, sendEmail } from "../_shared/email-sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller identity
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Check role - only admin/sales_manager
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (!roleData || !["admin", "sales_manager"].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: max 3 test emails per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("message_logs")
      .select("id", { count: "exact", head: true })
      .eq("to_address", "test-email")
      .eq("provider", "RESEND")
      .gte("created_at", oneHourAgo);

    if ((count || 0) >= 3) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Max 3 test emails per hour." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const toEmail = body.to_email || "hi@calsandumpsterspro.com";
    const subject = body.subject || "Test Email from Calsan CRM";
    const emailBody = body.body || "This is a test email sent from the Calsan CRM admin panel.";

    const emailConfig = await loadEmailConfig(supabaseAdmin);

    const html = `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #0F4C3A; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h2 style="margin: 0;">📧 Test Email</h2>
    <p style="margin: 8px 0 0 0; opacity: 0.8;">Calsan CRM Email Verification</p>
  </div>
  <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p><strong>Subject:</strong> ${subject}</p>
    <p>${emailBody}</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
    <p style="color: #6b7280; font-size: 13px;">
      Mode: <strong>${emailConfig.mode}</strong><br/>
      Domain Verified: <strong>${emailConfig.domainVerified}</strong><br/>
      From: <strong>${emailConfig.fromName} &lt;${emailConfig.fromEmail}&gt;</strong><br/>
      Sent at: ${new Date().toISOString()}<br/>
      Sent by user: ${userId}
    </p>
  </div>
</body>
</html>`;

    const result = await sendEmail(supabaseAdmin, emailConfig, {
      to: toEmail,
      subject,
      html,
      entityType: "test",
      entityId: userId,
    });

    return new Response(
      JSON.stringify({
        success: result.success,
        status: result.status,
        messageId: result.messageId,
        logId: result.logId,
        error: result.error,
        config: {
          mode: emailConfig.mode,
          domainVerified: emailConfig.domainVerified,
          from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Send test email error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
