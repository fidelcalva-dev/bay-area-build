import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();

    // Load existing draft
    if (body.action === "load" && body.draftToken) {
      const { data, error } = await supabase
        .from("quote_drafts")
        .select("*")
        .eq("draft_token", body.draftToken)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (error || !data) {
        return new Response(
          JSON.stringify({ draft: null }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ draft: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert draft
    const draftData = {
      zip: body.zip || null,
      address: body.address || null,
      customer_type: body.customerType || null,
      project_id: body.projectId || null,
      size: body.size || 20,
      wants_swap: body.wantsSwap || false,
      name: body.name || null,
      email: body.email || null,
      phone: body.phone || null,
      step: body.step || "zip",
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (body.draftToken) {
      // Update existing
      const { data, error } = await supabase
        .from("quote_drafts")
        .update(draftData)
        .eq("draft_token", body.draftToken)
        .select("draft_token")
        .maybeSingle();

      if (error || !data) {
        // Token not found, create new
        const { data: newDraft, error: insertError } = await supabase
          .from("quote_drafts")
          .insert(draftData)
          .select("draft_token")
          .single();

        if (insertError) {
          return new Response(
            JSON.stringify({ error: insertError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ draftToken: newDraft.draft_token }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ draftToken: data.draft_token }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Create new
      const { data, error } = await supabase
        .from("quote_drafts")
        .insert(draftData)
        .select("draft_token")
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ draftToken: data.draft_token }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
