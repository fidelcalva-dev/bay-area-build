// CAL 011 — Short-lived link to one customer photo/video from the size analysis.
// Only active office staff (current_user_is_office_staff) may open customer media.
// Files always come from the private "waste-uploads" bucket; the caller cannot choose
// another bucket or an arbitrary path.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BUCKET = "waste-uploads";
// Same file names the website uses when it uploads (see storage rule in migration 0005).
const PATH_RE = /^(photo_[0-9]{10,16}_[a-z0-9]{0,12}\.jpg|(photo|video)-assessments\/[0-9]{10,16}_[a-z0-9]{0,12}\.(jpg|mp4))$/;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const asCaller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await asCaller.auth.getUser(authHeader.slice(7));
    if (!userData?.user?.id) return json({ error: "Unauthorized" }, 401);

    const { data: allowed, error: roleErr } = await asCaller.rpc("current_user_is_office_staff");
    if (roleErr || allowed !== true) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    let path = typeof body?.storage_path === "string" ? body.storage_path.trim() : "";
    if (path.startsWith(`${BUCKET}/`)) path = path.slice(BUCKET.length + 1);
    if (path.startsWith("uploads/")) path = path.slice("uploads/".length);
    if (!PATH_RE.test(path)) return json({ error: "Invalid file", code: "invalid_path" }, 400);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: signed, error: signErr } = await admin.storage.from(BUCKET).createSignedUrl(path, 300);
    if (signErr || !signed?.signedUrl) return json({ error: "File not found", code: "not_found" }, 404);

    return json({ signed_url: signed.signedUrl, expires_in: 300 });
  } catch (error) {
    console.error("get-assessment-media-url error:", error instanceof Error ? error.message : "unknown");
    return json({ error: "Internal error" }, 500);
  }
});
