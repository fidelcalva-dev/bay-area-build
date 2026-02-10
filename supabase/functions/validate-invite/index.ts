import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { encode as hexEncode } from "https://deno.land/std@0.190.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { token, password, action } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "Token required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Hash the provided token to match against stored hash
    const tokenHash = await hashToken(token);

    // Look up invite by token hash
    const { data: invite, error: lookupError } = await supabaseAdmin
      .from("staff_invites")
      .select("*")
      .eq("invite_token_hash", tokenHash)
      .is("used_at", null)
      .single();

    if (lookupError || !invite) {
      return new Response(
        JSON.stringify({ error: "Invalid or already used invite link" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (new Date(invite.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "This invite link has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: validate — just check token is valid, return invite info
    if (action === "validate") {
      return new Response(
        JSON.stringify({
          valid: true,
          email: invite.email,
          role: invite.role,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: set-password — create user account and set password
    if (!password || password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists in auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email?.toLowerCase() === invite.email.toLowerCase()
    );

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // Update password
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
      });
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: invite.email.toLowerCase(),
        password,
        email_confirm: true,
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Assign role
    const { error: roleError } = await supabaseAdmin.from("user_roles").upsert(
      { user_id: userId, role: invite.role },
      { onConflict: "user_id,role" }
    );
    if (roleError) console.error("Role assign error:", roleError);

    // Update staff_users record
    await supabaseAdmin.from("staff_users").upsert(
      {
        user_id: userId,
        email: invite.email.toLowerCase(),
        full_name: invite.email.split("@")[0],
        department: invite.role,
        status: "active",
        must_reset_password: false,
      },
      { onConflict: "email" }
    );

    // Mark invite as used
    await supabaseAdmin
      .from("staff_invites")
      .update({ used_at: new Date().toISOString() })
      .eq("id", invite.id);

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      action: "create",
      entity_type: "user_account",
      entity_id: userId,
      user_id: userId,
      user_email: invite.email,
      changes_summary: `User ${invite.email} set password via invite link (role: ${invite.role})`,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Account created successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("validate-invite error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
