import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const STAFF_ROLES = ["admin", "sales", "dispatcher", "finance", "cs", "cs_agent", "ops_admin", "executive"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabaseUser.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub;

    // Verify staff role
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const hasStaffRole = (roles || []).some((r: any) => STAFF_ROLES.includes(r.role));
    if (!hasStaffRole) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { storage_path } = await req.json();
    if (!storage_path) {
      return new Response(JSON.stringify({ error: "storage_path required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine bucket and path
    let bucket = "photo-assessments";
    let filePath = storage_path;

    if (storage_path.startsWith("uploads/photo-assessments/")) {
      bucket = "photo-assessments";
      filePath = storage_path.replace("uploads/photo-assessments/", "");
    } else if (storage_path.startsWith("uploads/video-assessments/")) {
      bucket = "video-assessments";
      filePath = storage_path.replace("uploads/video-assessments/", "");
    } else if (storage_path.includes("/")) {
      // Try to extract bucket from path
      const parts = storage_path.split("/");
      bucket = parts[0];
      filePath = parts.slice(1).join("/");
    }

    const { data: signedData, error: signErr } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(filePath, 300); // 5 minutes

    if (signErr) {
      console.error("Signed URL error:", signErr);
      return new Response(JSON.stringify({ error: "Could not generate URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ signed_url: signedData.signedUrl, expires_in: 300 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("get-assessment-media-url error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
