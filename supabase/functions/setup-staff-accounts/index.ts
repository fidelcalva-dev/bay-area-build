import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map department to app_role
function departmentToRole(dept: string): string {
  const map: Record<string, string> = {
    system_admin: "system_admin",
    executive: "admin",
    operations_admin: "ops_admin",
    sales: "sales",
    customer_service: "sales", // CS agents use sales role
    finance_billing: "finance",
    dispatch_logistics: "dispatcher",
  };
  return map[dept] || "read_only_admin";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { password, dry_run } = await req.json();

    if (!password || password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all staff users without auth accounts
    const { data: staffUsers, error: fetchError } = await supabase
      .from("staff_users")
      .select("id, email, department")
      .is("user_id", null)
      .eq("status", "active");

    if (fetchError) throw fetchError;

    if (!staffUsers || staffUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No staff users need accounts", results: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (dry_run) {
      return new Response(
        JSON.stringify({
          message: `Would create ${staffUsers.length} accounts`,
          users: staffUsers.map((u) => ({
            email: u.email,
            department: u.department,
            role: departmentToRole(u.department),
          })),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const staff of staffUsers) {
      try {
        // Check if auth user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = existingUsers?.users?.find(
          (u: any) => u.email?.toLowerCase() === staff.email.toLowerCase()
        );

        let userId: string;

        if (existing) {
          userId = existing.id;
          // Update password
          await supabase.auth.admin.updateUserById(userId, { password });
        } else {
          // Create new auth user
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: staff.email.toLowerCase(),
            password,
            email_confirm: true,
          });
          if (createError) throw createError;
          userId = newUser.user.id;
        }

        // Assign role
        const role = departmentToRole(staff.department);
        await supabase.from("user_roles").upsert(
          { user_id: userId, role },
          { onConflict: "user_id,role" }
        );

        // Link staff_users record
        await supabase
          .from("staff_users")
          .update({ user_id: userId, must_reset_password: true })
          .eq("id", staff.id);

        results.push({
          email: staff.email,
          department: staff.department,
          role,
          status: "created",
          userId,
        });
      } catch (err: any) {
        results.push({
          email: staff.email,
          status: "error",
          error: err.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} accounts`,
        password_set: password,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("setup-staff-accounts error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
