import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Get refresh interval from rules
    const { data: rules } = await supabase.from("seo_rules").select("key, value_json");
    const rulesMap: Record<string, any> = {};
    for (const r of rules || []) rulesMap[r.key] = r.value_json;
    const refreshDays = parseInt(rulesMap.refresh_interval_days || "7");

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - refreshDays);

    // Find stale published pages (top 10 by oldest update)
    const { data: stalePages } = await supabase
      .from("seo_pages")
      .select("id, url_path, title, h1, body_content, faq_json, city_id, page_type")
      .eq("is_published", true)
      .lt("last_generated_at", cutoff.toISOString())
      .order("last_generated_at", { ascending: true })
      .limit(10);

    if (!stalePages || stalePages.length === 0) {
      return new Response(JSON.stringify({ message: "No pages need refresh", refreshed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    for (const page of stalePages) {
      try {
        // Create queue entry
        await supabase.from("seo_queue").insert({
          job_type: "REFRESH",
          page_id: page.id,
          location_id: page.city_id,
          status: "PROCESSING",
        });

        // Refresh FAQs and update timestamp
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: "You are an SEO content editor for Calsan Dumpsters Pro. Refresh and improve the existing FAQ content. Keep facts accurate. Return only a JSON array of FAQ objects with 'question' and 'answer' keys.",
              },
              {
                role: "user",
                content: `Page: ${page.title}\nURL: ${page.url_path}\nExisting FAQs: ${JSON.stringify(page.faq_json)}\n\nRefresh these 6 FAQs with updated, locally-relevant content. Return ONLY a JSON array.`,
              },
            ],
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          let content = aiData.choices?.[0]?.message?.content || "[]";
          content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

          let newFaqs;
          try {
            newFaqs = JSON.parse(content);
          } catch {
            newFaqs = page.faq_json; // Keep existing if parse fails
          }

          await supabase.from("seo_pages").update({
            faq_json: newFaqs,
            last_generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq("id", page.id);

          results.push({ id: page.id, url: page.url_path, status: "refreshed" });
        } else {
          results.push({ id: page.id, url: page.url_path, status: "ai_error" });
        }

        // Update queue
        await supabase.from("seo_queue").update({
          status: "COMPLETE",
          completed_at: new Date().toISOString(),
        }).eq("page_id", page.id).eq("job_type", "REFRESH").eq("status", "PROCESSING");
      } catch (pageErr) {
        results.push({ id: page.id, url: page.url_path, status: "error", error: String(pageErr) });
      }
    }

    return new Response(JSON.stringify({ refreshed: results.filter(r => r.status === "refreshed").length, total: stalePages.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seo-refresh-pages error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
