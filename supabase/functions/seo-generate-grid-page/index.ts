import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { city_name, city_slug, yard_name, yard_slug, yard_distance_miles, delivery_estimate, service_type, size_yards } = await req.json();

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

    // Build URL path
    let pageSlug: string;
    if (size_yards) {
      pageSlug = `/dumpster-rental/${city_slug}/${size_yards}-yard`;
    } else if (service_type && service_type !== 'dumpster-rental') {
      pageSlug = `/${service_type}/${city_slug}`;
    } else {
      pageSlug = `/dumpster-rental/${city_slug}`;
    }

    // Check duplicates
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
      .insert({ job_type: "CREATE", status: "PROCESSING" })
      .select()
      .single();

    const serviceLabel = (service_type || 'dumpster-rental').replace(/-/g, ' ');
    const sizeLabel = size_yards ? `${size_yards}-yard dumpster` : serviceLabel;
    const pricingDisclaimer = rulesMap.pricing_disclaimer || "Final pricing depends on material type, weight, and delivery location.";
    const minWords = parseInt(rulesMap.min_word_count || "900");

    const systemPrompt = `You are a professional SEO copywriter for Calsan Dumpsters Pro, a local dumpster rental company in the San Francisco Bay Area. You write unique, helpful, locally-relevant content. Never use fake reviews, misleading claims, or keyword stuffing. Always be factual and professional. Include the city name naturally throughout. Each page you write must be at least 40% unique compared to similar pages — vary sentence structure, local references, and section ordering.`;

    const userPrompt = `Generate a complete SEO page for: "${sizeLabel} in ${city_name}, CA"

Service type: ${serviceLabel}
City: ${city_name}, California
Nearest yard: ${yard_name} (${yard_distance_miles} miles away)
Delivery estimate: ${delivery_estimate}
${size_yards ? `Dumpster size: ${size_yards} cubic yards` : ""}

IMPORTANT: This page must emphasize the proximity advantage of our ${yard_name}. Mention that deliveries from this yard reach ${city_name} quickly because we're only ${yard_distance_miles} miles away.

Generate a JSON object with these exact keys:
- "title": SEO title tag (under 60 chars), include city and service
- "meta_description": Meta description (under 160 chars), include city
- "h1": Page H1 heading, include city name
- "body_content": Full article body in markdown format, minimum ${minWords} words. Include sections:
  1. Local introduction mentioning ${city_name} and proximity to our ${yard_name}
  2. Service explanation specific to ${serviceLabel}
  3. Available dumpster sizes and what they're best for
  4. Pricing overview (use ranges, mention starting prices)
  5. Delivery speed advantage from ${yard_name} (${yard_distance_miles} miles, ${delivery_estimate})
  6. What materials can and cannot go in the dumpster
  7. Local permit information for ${city_name}
  8. Why choose a local yard over a broker
  9. Call-to-action with ZIP code quote calculator
- "faq_json": Array of 6 FAQ objects with "question" and "answer" keys, locally relevant to ${city_name}
- "schema_json": JSON-LD schema combining LocalBusiness + Service + FAQPage, with serviceArea set to ${city_name} and areaServed listing nearby cities
- "internal_links": Array of 5 related page paths like ["/quote", "/dumpster-rental/${city_slug}", "/sizes", "/materials", "/yards/${yard_slug}"]

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

    const requireApproval = rulesMap.approval_required === true || rulesMap.approval_required === "true";
    const status = requireApproval ? "DRAFT" : "PUBLISHED";
    const wordCount = (parsed.body_content || "").split(/\s+/).length;

    const { data: page, error: pageErr } = await supabase
      .from("seo_pages")
      .insert({
        url_path: pageSlug,
        page_type: service_type || 'dumpster-rental',
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

    await supabase.from("seo_queue").update({
      status: "COMPLETE",
      page_id: page.id,
      completed_at: new Date().toISOString(),
    }).eq("id", queueEntry.id);

    return new Response(JSON.stringify({
      success: true,
      page_id: page.id,
      status,
      url_path: pageSlug,
      word_count: wordCount,
      yard: yard_name,
      city: city_name,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seo-generate-grid-page error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
