import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    const { data: claims, error: claimsErr } = await supabaseUser.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { clip_id } = await req.json();
    if (!clip_id) {
      return new Response(JSON.stringify({ error: "clip_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch clip
    const { data: clip, error: clipErr } = await supabaseAdmin
      .from("camera_clips")
      .select("file_url")
      .eq("id", clip_id)
      .single();

    if (clipErr || !clip) {
      return new Response(JSON.stringify({ error: "Clip not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If file_url is a storage path, create signed URL
    const fileUrl = clip.file_url;
    if (fileUrl.startsWith("camera-videos/") || fileUrl.startsWith("/")) {
      const path = fileUrl.replace(/^\//, "");
      const { data: signedData, error: signErr } = await supabaseAdmin.storage
        .from("camera-videos")
        .createSignedUrl(path, 3600); // 1 hour

      if (signErr) throw signErr;

      return new Response(
        JSON.stringify({ signed_url: signedData.signedUrl, expires_in: 3600 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // External URL — return as-is
    return new Response(
      JSON.stringify({ signed_url: fileUrl, expires_in: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("camera-clip-url error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
