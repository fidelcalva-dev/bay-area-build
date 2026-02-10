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

function generateTempPassword(length = 14): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
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

    // Generate temp password
    const tempPassword = generateTempPassword();
    const tempPasswordHash = await hashPassword(tempPassword);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Create or get user in Supabase Auth
    // First check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    );

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // Update password to temp password
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: tempPassword,
      });
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password: tempPassword,
        email_confirm: true,
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Assign role
    const { error: roleError } = await supabaseAdmin.from("user_roles").upsert(
      { user_id: userId, role },
      { onConflict: "user_id,role" }
    );
    if (roleError) console.error("Role assign error:", roleError);

    // Update staff_users record
    await supabaseAdmin.from("staff_users").upsert(
      {
        user_id: userId,
        email: email.toLowerCase(),
        full_name: full_name || email.split("@")[0],
        department: role,
        status: "active",
        must_reset_password: true,
      },
      { onConflict: "email" }
    );

    // Save invite record
    await supabaseAdmin.from("staff_invites").insert({
      email: email.toLowerCase(),
      role,
      temp_password_hash: tempPasswordHash,
      expires_at: expiresAt,
      created_by: caller.id,
    });

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      action: "create",
      entity_type: "user_roles",
      entity_id: userId,
      user_id: caller.id,
      user_email: caller.email,
      changes_summary: `Invited ${email} with role ${role} (temp password)`,
    });

    // Send email via Resend
    if (resendKey) {
      const resend = new Resend(resendKey);
      const loginUrl = `${req.headers.get("origin") || "https://bay-area-build.lovable.app"}/admin/login`;

      await resend.emails.send({
        from: "CRM Access <onboarding@resend.dev>",
        to: [email],
        subject: "Your CRM Access - Temporary Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a1a2e;">Welcome to Cal's CRM</h1>
            <p>You've been invited to access the CRM system as <strong>${role}</strong>.</p>
            <div style="background: #f4f4f8; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 8px;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0 0 8px;"><strong>Temporary Password:</strong></p>
              <code style="background: #fff; padding: 8px 16px; border-radius: 4px; font-size: 18px; letter-spacing: 1px; display: inline-block;">${tempPassword}</code>
            </div>
            <p style="color: #e63946; font-weight: bold;">⚠️ This password expires in 24 hours. You must change it on first login.</p>
            <a href="${loginUrl}" style="display: inline-block; background: #1a1a2e; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">Login to CRM</a>
            <p style="color: #888; font-size: 12px; margin-top: 24px;">If you did not expect this invite, please ignore this email.</p>
          </div>
        `,
      });
    }

    return new Response(
      JSON.stringify({ success: true, userId, message: "Invite sent" }),
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
