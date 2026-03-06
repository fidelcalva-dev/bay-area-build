import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// All known SEO route patterns from the grid
const SERVICE_TYPES = [
  { slug: "dumpster-rental", label: "Dumpster Rental" },
  { slug: "concrete-disposal", label: "Concrete Disposal" },
  { slug: "yard-waste-disposal", label: "Yard Waste Disposal" },
  { slug: "construction-debris", label: "Construction Debris" },
  { slug: "debris-removal", label: "Debris Removal" },
  { slug: "yard-waste-removal", label: "Yard Waste Removal" },
];
const SIZES = [10, 20, 30, 40];

const PAGE_TYPE_MAP: Record<string, string> = {
  "dumpster-rental": "CITY",
  "concrete-disposal": "CITY_MATERIAL",
  "yard-waste-disposal": "CITY_MATERIAL",
  "construction-debris": "CITY_MATERIAL",
  "debris-removal": "CITY_MATERIAL",
  "yard-waste-removal": "CITY_MATERIAL",
};

function calculateSeoScore(audit: any): number {
  let score = 0;
  if (audit.has_h1) score += 10;
  if (audit.has_h2_structure) score += 10;
  if (audit.has_meta_title) score += 15;
  if (audit.has_meta_description) score += 15;
  if (audit.word_count >= 900) score += 15;
  else if (audit.word_count >= 600) score += 8;
  if (audit.city_mentions >= 3) score += 10;
  else if (audit.city_mentions >= 1) score += 5;
  if (audit.internal_link_count >= 5) score += 10;
  else if (audit.internal_link_count >= 3) score += 5;
  if (audit.has_quote_cta) score += 5;
  if (audit.has_schema) score += 10;
  if (audit.duplicate_risk) score -= 15;
  return Math.max(0, Math.min(100, score));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "full"; // "discover", "audit", "full", "improve"

    let stats = { discovered: 0, audited: 0, improved: 0, gaps_found: 0 };

    // ─── PHASE 1: DISCOVERY ─────────────────────────────
    if (mode === "discover" || mode === "full") {
      // Get all cities from seo_cities
      const { data: cities } = await supabase
        .from("seo_cities")
        .select("id, city_name, city_slug, county, neighborhoods");

      // Get all yards
      const { data: yards } = await supabase
        .from("seo_pages")
        .select("url_path, page_type")
        .like("url_path", "/yards/%");

      // Get existing seo_pages
      const { data: existingPages } = await supabase
        .from("seo_pages")
        .select("id, url_path, page_type, title, meta_description, h1, body_content, faq_json, schema_json, internal_links, word_count, status");

      const pagesToIndex: any[] = [];
      const seen = new Set<string>();

      // Index existing DB pages
      for (const p of existingPages || []) {
        if (seen.has(p.url_path)) continue;
        seen.add(p.url_path);
        const citySlug = p.url_path.split("/")[2] || "";
        const city = (cities || []).find((c: any) => c.city_slug === citySlug);
        pagesToIndex.push({
          url: p.url_path,
          page_type: p.page_type || "CITY",
          city: city?.city_name || citySlug,
          service: p.page_type === "CITY_SIZE" ? "dumpster-rental" : "general",
          yard: null,
          word_count: p.word_count || 0,
          status: p.status || "PUBLISHED",
          last_scanned_at: new Date().toISOString(),
        });
      }

      // Discover expected pages from cities
      for (const city of cities || []) {
        // City landing page
        const cityUrl = `/dumpster-rental/${city.city_slug}`;
        if (!seen.has(cityUrl)) {
          seen.add(cityUrl);
          pagesToIndex.push({
            url: cityUrl,
            page_type: "CITY",
            city: city.city_name,
            service: "dumpster-rental",
            word_count: 0,
            status: "MISSING",
            last_scanned_at: new Date().toISOString(),
          });
          stats.gaps_found++;
        }

        // Size pages
        for (const size of SIZES) {
          const sizeUrl = `/dumpster-rental/${city.city_slug}/${size}-yard`;
          if (!seen.has(sizeUrl)) {
            seen.add(sizeUrl);
            pagesToIndex.push({
              url: sizeUrl,
              page_type: "CITY_SIZE",
              city: city.city_name,
              service: `${size}-yard`,
              word_count: 0,
              status: "MISSING",
              last_scanned_at: new Date().toISOString(),
            });
            stats.gaps_found++;
          }
        }

        // Material/service pages
        for (const svc of SERVICE_TYPES) {
          if (svc.slug === "dumpster-rental") continue;
          const svcUrl = `/${svc.slug}/${city.city_slug}`;
          if (!seen.has(svcUrl)) {
            seen.add(svcUrl);
            pagesToIndex.push({
              url: svcUrl,
              page_type: PAGE_TYPE_MAP[svc.slug] || "CITY_MATERIAL",
              city: city.city_name,
              service: svc.slug,
              word_count: 0,
              status: "MISSING",
              last_scanned_at: new Date().toISOString(),
            });
            stats.gaps_found++;
          }
        }
      }

      // Yard pages
      for (const y of yards || []) {
        if (!seen.has(y.url_path)) {
          seen.add(y.url_path);
          pagesToIndex.push({
            url: y.url_path,
            page_type: "YARD",
            city: null,
            service: "yard-hub",
            word_count: 0,
            status: "PUBLISHED",
            last_scanned_at: new Date().toISOString(),
          });
        }
      }

      // Upsert into seo_page_index
      for (const page of pagesToIndex) {
        await supabase
          .from("seo_page_index")
          .upsert({
            url: page.url,
            page_type: page.page_type,
            city: page.city,
            service: page.service,
            yard: page.yard,
            word_count: page.word_count,
            status: page.status,
            last_scanned_at: page.last_scanned_at,
            last_updated: new Date().toISOString(),
          }, { onConflict: "url" });
        stats.discovered++;
      }
    }

    // ─── PHASE 2: AUDIT ─────────────────────────────────
    if (mode === "audit" || mode === "full") {
      const { data: indexedPages } = await supabase
        .from("seo_page_index")
        .select("*")
        .neq("status", "MISSING");

      const { data: seoPages } = await supabase
        .from("seo_pages")
        .select("*");

      const seoPagesMap = new Map<string, any>();
      for (const p of seoPages || []) {
        seoPagesMap.set(p.url_path, p);
      }

      // Check for duplicate content (same title or very similar body)
      const titleCount = new Map<string, number>();
      for (const p of seoPages || []) {
        if (p.title) {
          titleCount.set(p.title, (titleCount.get(p.title) || 0) + 1);
        }
      }

      for (const indexed of indexedPages || []) {
        const page = seoPagesMap.get(indexed.url);
        if (!page) continue;

        const bodyContent = page.body_content || "";
        const cityName = indexed.city || "";
        const cityMentions = cityName
          ? (bodyContent.toLowerCase().match(new RegExp(cityName.toLowerCase(), "g")) || []).length
          : 0;

        const faqJson = Array.isArray(page.faq_json) ? page.faq_json : [];
        const internalLinks = Array.isArray(page.internal_links) ? page.internal_links : [];
        const wordCount = bodyContent.split(/\s+/).filter((w: string) => w.length > 0).length;

        const hasSchema = !!page.schema_json && Object.keys(page.schema_json).length > 0;
        const hasQuoteCta = bodyContent.toLowerCase().includes("quote") || 
                           bodyContent.toLowerCase().includes("/quote") ||
                           (internalLinks as string[]).some((l: string) => l.includes("/quote"));

        const isDuplicate = (titleCount.get(page.title) || 0) > 1;

        const missingMeta: string[] = [];
        if (!page.title) missingMeta.push("title");
        if (!page.meta_description) missingMeta.push("meta_description");
        if (!page.h1) missingMeta.push("h1");

        const missingSchema: string[] = [];
        if (!hasSchema) missingSchema.push("LocalBusiness", "Service", "FAQPage");

        const audit = {
          has_h1: !!page.h1,
          has_h2_structure: bodyContent.includes("##") || bodyContent.includes("<h2"),
          has_meta_title: !!page.title && page.title.length <= 60,
          has_meta_description: !!page.meta_description && page.meta_description.length <= 160,
          word_count: wordCount,
          city_mentions: cityMentions,
          internal_link_count: internalLinks.length,
          has_quote_cta: hasQuoteCta,
          has_schema: hasSchema,
          duplicate_risk: isDuplicate,
          missing_meta: missingMeta,
          missing_schema: missingSchema,
          thin_content: wordCount < 800,
          internal_link_score: Math.min(100, internalLinks.length * 20),
        };

        const seoScore = calculateSeoScore(audit);

        // Build recommended actions
        const actions: string[] = [];
        if (!audit.has_h1) actions.push("Add H1 heading");
        if (!audit.has_h2_structure) actions.push("Add H2 subheadings for structure");
        if (!audit.has_meta_title) actions.push("Add/fix meta title (under 60 chars)");
        if (!audit.has_meta_description) actions.push("Add/fix meta description (under 160 chars)");
        if (audit.thin_content) actions.push(`Expand content (currently ${wordCount} words, need 900+)`);
        if (audit.city_mentions < 3) actions.push("Add more natural city name mentions");
        if (audit.internal_link_count < 5) actions.push("Add more internal links (need 5+)");
        if (!audit.has_quote_cta) actions.push("Add quote CTA button/link");
        if (!audit.has_schema) actions.push("Add LocalBusiness + FAQPage schema");
        if (audit.duplicate_risk) actions.push("Fix duplicate title — make unique");

        // Upsert audit result
        const { data: existingAudit } = await supabase
          .from("seo_audit_results")
          .select("id")
          .eq("page_id", indexed.id)
          .maybeSingle();

        if (existingAudit) {
          await supabase
            .from("seo_audit_results")
            .update({ ...audit, seo_score: seoScore, recommended_actions: actions, audited_at: new Date().toISOString() })
            .eq("id", existingAudit.id);
        } else {
          await supabase
            .from("seo_audit_results")
            .insert({ page_id: indexed.id, ...audit, seo_score: seoScore, recommended_actions: actions });
        }

        // Update index score
        await supabase
          .from("seo_page_index")
          .update({ seo_score: seoScore, word_count: wordCount })
          .eq("id", indexed.id);

        stats.audited++;
      }
    }

    // ─── PHASE 3: IMPROVE (AI) ──────────────────────────
    if (mode === "improve" || mode === "full") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        console.warn("LOVABLE_API_KEY not set, skipping improvement phase");
      } else {
        // Get pages with score < 80
        const { data: weakPages } = await supabase
          .from("seo_audit_results")
          .select("*, seo_page_index!inner(url, city, service, page_type)")
          .lt("seo_score", 80)
          .order("seo_score", { ascending: true })
          .limit(3); // Improve max 3 per run

        for (const weak of weakPages || []) {
          const pageIndex = (weak as any).seo_page_index;
          const { data: seoPage } = await supabase
            .from("seo_pages")
            .select("*")
            .eq("url_path", pageIndex.url)
            .maybeSingle();

          if (!seoPage) continue;

          const actions = Array.isArray(weak.recommended_actions) ? weak.recommended_actions : [];
          if (actions.length === 0) continue;

          const improvePrompt = `You are an SEO expert for Calsan Dumpsters Pro, a dumpster rental company in the San Francisco Bay Area.

Current page: ${pageIndex.url}
City: ${pageIndex.city || "N/A"}
Current word count: ${weak.word_count}
Current SEO score: ${weak.seo_score}/100

Issues to fix:
${actions.map((a: string) => `- ${a}`).join("\n")}

Current body content:
${(seoPage.body_content || "").substring(0, 3000)}

Current FAQs: ${JSON.stringify(seoPage.faq_json || []).substring(0, 1000)}

Generate improved content as JSON with these keys:
- "body_content": Improved markdown body, minimum 900 words, naturally mention ${pageIndex.city} at least 6 times, include H2 subheadings, internal links to /quote, /sizes, /materials, /areas, and related city pages
- "faq_json": Array of 6+ FAQs with "question" and "answer" keys, locally relevant
- "internal_links": Array of 5+ internal link paths
- "schema_json": Combined LocalBusiness + Service + FAQPage JSON-LD schema

Return ONLY valid JSON, no markdown fences.`;

          try {
            const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                  { role: "system", content: "You are a professional SEO copywriter. Return only valid JSON." },
                  { role: "user", content: improvePrompt },
                ],
              }),
            });

            if (!aiResp.ok) {
              console.error("AI improve error:", aiResp.status);
              continue;
            }

            const aiData = await aiResp.json();
            let content = aiData.choices?.[0]?.message?.content || "";
            content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

            const parsed = JSON.parse(content);
            const newWordCount = (parsed.body_content || "").split(/\s+/).length;

            await supabase
              .from("seo_pages")
              .update({
                body_content: parsed.body_content || seoPage.body_content,
                faq_json: parsed.faq_json || seoPage.faq_json,
                internal_links: parsed.internal_links || seoPage.internal_links,
                schema_json: parsed.schema_json || seoPage.schema_json,
                word_count: newWordCount,
                last_generated_at: new Date().toISOString(),
                status: "DRAFT", // Requires re-approval after improvement
              })
              .eq("id", seoPage.id);

            stats.improved++;
          } catch (e) {
            console.error("AI improvement failed for", pageIndex.url, e);
          }
        }
      }
    }

    // ─── PHASE 4: GAP DETECTION → QUEUE ──────────────────
    if (mode === "full") {
      const { data: missingPages } = await supabase
        .from("seo_page_index")
        .select("*")
        .eq("status", "MISSING")
        .limit(10);

      // Get city IDs
      const { data: cities } = await supabase
        .from("seo_cities")
        .select("id, city_name, city_slug");

      const cityMap = new Map<string, any>();
      for (const c of cities || []) {
        cityMap.set(c.city_slug, c);
      }

      for (const missing of missingPages || []) {
        // Check if already in queue
        const { data: existingQueue } = await supabase
          .from("seo_queue")
          .select("id")
          .eq("status", "PENDING")
          .limit(1);

        // Extract city slug from URL
        const urlParts = missing.url.split("/").filter(Boolean);
        let citySlug = urlParts[1] || "";
        if (urlParts[0] !== "dumpster-rental") {
          citySlug = urlParts[1] || "";
        }

        const city = cityMap.get(citySlug);
        if (!city) continue;

        // Add to seo_queue for generation
        await supabase
          .from("seo_queue")
          .insert({
            job_type: "CREATE",
            location_id: city.id,
            status: "PENDING",
          });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      stats,
      message: `Discovered ${stats.discovered} pages, audited ${stats.audited}, improved ${stats.improved}, found ${stats.gaps_found} gaps`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seo-audit-pages error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
