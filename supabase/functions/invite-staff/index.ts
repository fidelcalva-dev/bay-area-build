import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { encode as hexEncode } from "https://deno.land/std@0.190.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateToken(length = 48): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  return new TextDecoder().decode(hexEncode(hashArray));
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    // Validate caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller } } = await supabaseUser.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const isAdmin = callerRoles?.some(
      (r: any) => r.role === "admin" || r.role === "system_admin"
    );
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, role, full_name } = await req.json();

    if (!email || !role) {
      return new Response(JSON.stringify({ error: "Email and role required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate secure invite token
    const inviteToken = generateToken(48);
    const inviteTokenHash = await hashToken(inviteToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Save invite record (token is hashed, never stored in plain text)
    const { error: inviteError } = await supabaseAdmin.from("staff_invites").insert({
      email: email.toLowerCase(),
      role,
      invite_token_hash: inviteTokenHash,
      expires_at: expiresAt,
      created_by: caller.id,
    });

    if (inviteError) {
      console.error("Invite insert error:", inviteError);
      throw inviteError;
    }

    // Create staff_users record if not exists
    await supabaseAdmin.from("staff_users").upsert(
      {
        email: email.toLowerCase(),
        full_name: full_name || email.split("@")[0],
        department: role,
        status: "pending",
      },
      { onConflict: "email" }
    );

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      action: "create",
      entity_type: "staff_invite",
      entity_id: email.toLowerCase(),
      user_id: caller.id,
      user_email: caller.email,
      changes_summary: `Created invite link for ${email} with role ${role}`,
    });

    // Build invite link
    const origin = req.headers.get("origin") || "https://bay-area-build.lovable.app";
    const inviteLink = `${origin}/set-password?token=${inviteToken}`;

    // Send email via Resend
    if (resendKey) {
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "Calsan CRM <onboarding@resend.dev>",
        to: [email],
        subject: "You've been invited to Calsan CRM",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a1a2e;">Welcome to Calsan Dumpsters Pro</h1>
            <p>You've been invited to access the internal CRM as <strong>${role}</strong>.</p>
            <p>Create your password using the one-time link below:</p>
            <div style="background: #f4f4f8; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <a href="${inviteLink}" style="display: inline-block; background: #1a1a2e; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">Create Your Password</a>
            </div>
            <p style="color: #e63946; font-weight: bold;">⚠️ This link expires in 24 hours and can only be used once.</p>
            <p style="color: #666; font-size: 14px; margin-top: 24px;">After setting your password, log in at:<br/>
              <a href="${origin}/admin/login" style="color: #1a1a2e;">${origin}/admin/login</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #888; font-size: 12px;">— Calsan Dumpsters Pro</p>
            <p style="color: #888; font-size: 12px;">If you did not expect this invite, please ignore this email.</p>
          </div>
        `,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Invite link sent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("invite-staff error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
