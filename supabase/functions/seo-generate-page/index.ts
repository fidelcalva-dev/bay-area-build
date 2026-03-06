import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { location_id, service_id, city_name, service_type, size_yards, city_slug, service_slug } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check daily limit
    const { data: rules } = await supabase.from("seo_rules").select("key, value_json");
    const rulesMap: Record<string, any> = {};
    for (const r of rules || []) rulesMap[r.key] = r.value_json;

    const maxPerDay = parseInt(rulesMap.max_pages_per_day || "5");
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("seo_queue")
      .select("*", { count: "exact", head: true })
      .eq("job_type", "CREATE")
      .eq("status", "COMPLETE")
      .gte("completed_at", today);

    if ((count || 0) >= maxPerDay) {
      return new Response(JSON.stringify({ error: `Daily limit of ${maxPerDay} pages reached` }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build slug and check duplicates
    const pageSlug = size_yards
      ? `/dumpster-rental/${city_slug}/${size_yards}-yard`
      : `/${service_slug}/${city_slug}`;

    const { data: existing } = await supabase
      .from("seo_pages")
      .select("id")
      .eq("url_path", pageSlug)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "Page already exists", page_id: existing.id }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create queue entry
    const { data: queueEntry } = await supabase
      .from("seo_queue")
      .insert({ job_type: "CREATE", location_id, service_id, status: "PROCESSING" })
      .select()
      .single();

    // Generate content via AI
    const sizeLabel = size_yards ? `${size_yards}-yard dumpster` : service_type.replace(/-/g, " ");
    const serviceLabel = service_type.replace(/-/g, " ");
    const pricingDisclaimer = rulesMap.pricing_disclaimer || "Final pricing depends on material type, weight, and delivery location.";
    const minWords = parseInt(rulesMap.min_word_count || "800");

    const systemPrompt = `You are a professional SEO copywriter for Calsan Dumpsters Pro, a local dumpster rental company in the San Francisco Bay Area. Write unique, helpful, locally-relevant content. Never use fake reviews, misleading claims, or keyword stuffing. Always be factual and professional. Include the city name naturally throughout.`;

    const userPrompt = `Generate a complete SEO page for: "${sizeLabel} in ${city_name}, CA"

Service type: ${serviceLabel}
City: ${city_name}, California
${size_yards ? `Dumpster size: ${size_yards} cubic yards` : ""}

Generate a JSON object with these exact keys:
- "title": SEO title tag (under 60 chars), include city and service
- "meta_description": Meta description (under 160 chars), include city
- "h1": Page H1 heading, include city name
- "body_content": Full article body in markdown format, minimum ${minWords} words. Include sections: local introduction mentioning ${city_name} neighborhoods, service explanation, what's included, sizing guide, pricing overview (use ranges, mention starting prices), local regulations/permits, and a call-to-action. Reference that we operate from local yards for faster delivery.
- "faq_json": Array of 6 FAQ objects with "question" and "answer" keys, locally relevant to ${city_name}
- "schema_json": JSON-LD schema object for a LocalBusiness + Service + FAQPage combined schema
- "internal_links": Array of 5 related page paths like ["/quote", "/dumpster-rental/${city_slug}", "/sizes", "/materials", "/areas"]

Include this disclaimer naturally: "${pricingDisclaimer}"

Return ONLY valid JSON, no markdown code fences.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI error:", aiResp.status, errText);
      await supabase.from("seo_queue").update({ status: "FAILED", error_log: `AI error: ${aiResp.status}` }).eq("id", queueEntry.id);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Strip markdown fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      await supabase.from("seo_queue").update({ status: "FAILED", error_log: "Failed to parse AI response" }).eq("id", queueEntry.id);
      return new Response(JSON.stringify({ error: "Failed to parse AI content" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine status based on approval rules
    const requireApproval = rulesMap.approval_required === true || rulesMap.approval_required === "true";
    const status = requireApproval ? "DRAFT" : "PUBLISHED";

    // Map service_type to valid page_type enum
    const pageTypeMap: Record<string, string> = {
      'dumpster-rental': 'CITY',
      'concrete-disposal': 'CITY_MATERIAL',
      'yard-waste-removal': 'CITY_MATERIAL',
      'construction-debris': 'CITY_MATERIAL',
      'debris-removal': 'CITY_MATERIAL',
      'commercial-dumpster': 'CITY_COMMERCIAL',
    };
    const resolvedPageType = size_yards ? 'CITY_SIZE' : (pageTypeMap[service_type] || 'CITY');

    // Insert page
    const wordCount = (parsed.body_content || "").split(/\s+/).length;
    const { data: page, error: pageErr } = await supabase
      .from("seo_pages")
      .insert({
        url_path: pageSlug,
        page_type: resolvedPageType,
        city_id: location_id,
        service_id,
        title: parsed.title,
        meta_description: parsed.meta_description,
        h1: parsed.h1,
        body_content: parsed.body_content,
        faq_json: parsed.faq_json,
        schema_json: parsed.schema_json,
        internal_links: parsed.internal_links,
        canonical_url: pageSlug,
        is_published: status === "PUBLISHED",
        status,
        word_count: wordCount,
        last_generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (pageErr) {
      await supabase.from("seo_queue").update({ status: "FAILED", error_log: pageErr.message }).eq("id", queueEntry.id);
      throw pageErr;
    }

    // Update queue
    await supabase.from("seo_queue").update({
      status: "COMPLETE",
      page_id: page.id,
      completed_at: new Date().toISOString(),
    }).eq("id", queueEntry.id);

    return new Response(JSON.stringify({ success: true, page_id: page.id, status, url_path: pageSlug, word_count: wordCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seo-generate-page error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
