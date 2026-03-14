import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a dumpster rental specialist for Calsan Dumpsters Pro, serving the San Francisco Bay Area.

LANGUAGE RULE:
- Detect whether the user writes in Spanish or English.
- ALWAYS respond in the SAME language the user used.
- If Spanish, use professional but friendly Latin-American Spanish.
- Do NOT mix languages within the same response.

RULES:
- Answer in 2-3 sentences max. Be helpful, direct, and confidence-building.
- Structure your answer as: recommendation, short reason, next step.
- NEVER quote exact pricing or dollar amounts. Always say pricing depends on ZIP code and project details.
- Keep a professional, confident, local-service tone.
- Do NOT use emojis.
- Do NOT reveal internal operations, margins, or yard locations.

SIZING GUIDELINES:
- Bathroom remodel: 10 yard
- Kitchen remodel: 20 yard
- Single room cleanout: 10 yard
- Whole house cleanout: 20-30 yard
- Roofing (single layer): 10-20 yard
- Roofing (multiple layers): 20-30 yard
- New construction: 30-40 yard
- Garage cleanout: 10-15 yard
- Yard waste / landscaping: 10-20 yard

HEAVY MATERIAL RULES (CRITICAL — enforce strictly):
- Heavy materials include: clean soil, clean concrete, mixed soil, mixed heavy, brick, asphalt, rock, gravel.
- Heavy materials are ONLY available in 5, 8, and 10 yard containers. Never recommend larger sizes for heavy materials.
- Clean soil and clean concrete containers use flat-rate pricing with no weight overage. This is a benefit — mention it.
- Clean containers must stay clean. If a different heavy material is added to a clean load, it becomes "mixed heavy" and pricing changes.
- If trash or mixed debris is added to a heavy material container, it becomes general debris and may be charged by the ton for overage.
- If the customer does not notify in advance and a reroute to a different disposal facility is required, actual extra disposal costs plus a $150 surcharge may apply.
- Always recommend the customer call if unsure about material classification.
- The "fill to the line" rule applies: heavy material containers must not be filled above the fill line.

MATERIALS ACCEPTED (general debris):
- Wood, drywall, carpet, furniture, appliances (no Freon), roofing shingles, yard waste, general household junk, construction debris.
- NOT accepted: hazardous waste, tires, batteries, paint, chemicals, medical waste, asbestos.

CONTRACTOR / COMMERCIAL:
- For contractors needing regular service, multiple dumpsters, or job-site deliveries, recommend applying for a contractor account for volume pricing and priority scheduling.

INTENT CLASSIFICATION — include exactly one tag on a new line:
[INTENT:SIZE_HELP] - asking about sizing
[INTENT:MATERIAL_RULES] - asking what goes in dumpster or material policies
[INTENT:PRICING_HELP] - asking about cost
[INTENT:DELIVERY_SPEED] - asking about timing
[INTENT:HEAVY_MATERIAL] - concrete, dirt, soil, rock, brick
[INTENT:PERMIT_HELP] - permits or regulations
[INTENT:CONTRACTOR_INTEREST] - contractor, commercial, multiple units, ongoing
[INTENT:READY_TO_BOOK] - ready to order
[INTENT:HUMAN_HANDOFF] - wants to talk to someone, call me, text me
[INTENT:UNKNOWN] - anything else

CUSTOMER STAGE — include exactly one tag on a new line:
[STAGE:EXPLORING] - just learning, not ready yet
[STAGE:COMPARING] - evaluating options
[STAGE:READY] - ready to order or get pricing
[STAGE:NEEDS_HELP] - confused or needs human

ACTION TAG — include exactly one on a new line:
[ACTION:QUOTE] - should get a quote
[ACTION:PHOTO] - should upload photo for sizing help
[ACTION:SCHEDULE] - asking about delivery / scheduling
[ACTION:CALL] - needs to speak to someone
[ACTION:CONTRACTOR] - should apply for contractor account

SIZE RANGE TAG (optional, on new line):
[SIZE_RANGE:XX-YY] or [SIZE_RANGE:XX]

MATERIAL CLASS TAG (optional, on new line if heavy material detected):
[MATERIAL_CLASS:CLEAN_SOIL] or [MATERIAL_CLASS:CLEAN_CONCRETE] or [MATERIAL_CLASS:MIXED_HEAVY] or [MATERIAL_CLASS:GENERAL_DEBRIS] or [MATERIAL_CLASS:ROOFING] or [MATERIAL_CLASS:YARD_WASTE]

LANGUAGE TAG — include exactly one on a new line:
[LANG:EN] or [LANG:ES]`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const question = body?.question;
    const zip = body?.zip || null;
    const city = body?.city || null;
    const enrich_lead = body?.enrich_lead || false;
    const session_context = body?.session_context || {};

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let userMessage = question.trim().slice(0, 500);
    if (zip) userMessage += ` (ZIP: ${zip})`;
    if (city) userMessage += ` (City: ${city})`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_tokens: 350,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service is busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status, await response.text());
      return new Response(
        JSON.stringify({ error: "Unable to process your question right now." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // Parse tags
    const intentMatch = rawContent.match(/\[INTENT:(\w+)\]/);
    const actionMatch = rawContent.match(/\[ACTION:(\w+)\]/);
    const sizeRangeMatch = rawContent.match(/\[SIZE_RANGE:([\d\-]+)\]/);
    const stageMatch = rawContent.match(/\[STAGE:(\w+)\]/);
    const langMatch = rawContent.match(/\[LANG:(\w+)\]/);
    const materialClassMatch = rawContent.match(/\[MATERIAL_CLASS:(\w+)\]/);

    // Clean answer text
    const answerText = rawContent
      .replace(/\[INTENT:\w+\]/g, "")
      .replace(/\[ACTION:\w+\]/g, "")
      .replace(/\[SIZE_RANGE:[\d\-]+\]/g, "")
      .replace(/\[SIZE:\d+\]/g, "")
      .replace(/\[STAGE:\w+\]/g, "")
      .replace(/\[LANG:\w+\]/g, "")
      .replace(/\[MATERIAL_CLASS:\w+\]/g, "")
      .trim();

    const intent = intentMatch ? intentMatch[1] : "UNKNOWN";
    const action = actionMatch ? actionMatch[1] : "QUOTE";
    const sizeRange = sizeRangeMatch ? sizeRangeMatch[1] : null;
    const stage = stageMatch ? stageMatch[1] : "EXPLORING";
    const lang = langMatch ? langMatch[1] : "EN";
    const materialClass = materialClassMatch ? materialClassMatch[1] : null;

    const shouldCaptureLead =
      ["READY_TO_BOOK", "PRICING_HELP", "HUMAN_HANDOFF", "CONTRACTOR_INTEREST"].includes(intent) ||
      stage === "READY" ||
      stage === "NEEDS_HELP";

    // Lead enrichment: fire-and-forget
    if (enrich_lead && (zip || intent !== "UNKNOWN")) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const sb = createClient(supabaseUrl, supabaseKey);

        // Detect project type from question
        let projectType: string | null = null;
        let materialType: string | null = null;
        const q = question.toLowerCase();
        if (/kitchen/i.test(q)) projectType = "Kitchen Remodel";
        else if (/bathroom/i.test(q)) projectType = "Bathroom Remodel";
        else if (/garage/i.test(q)) projectType = "Garage Cleanout";
        else if (/roof/i.test(q)) projectType = "Roofing";
        else if (/demo|demolition/i.test(q)) projectType = "Demolition";
        else if (/cleanout|clean\s?out/i.test(q)) projectType = "Home Cleanout";
        else if (/yard|landscap/i.test(q)) projectType = "Yard Cleanup";
        else if (/construction/i.test(q)) projectType = "Construction";
        else if (/contractor/i.test(q)) projectType = "Contractor";

        if (/concrete|brick|asphalt/i.test(q)) materialType = "concrete";
        else if (/dirt|soil|rock|gravel/i.test(q)) materialType = "dirt";
        else if (/green|vegetation|yard waste/i.test(q)) materialType = "green_waste";
        else if (/shingle|roof/i.test(q)) materialType = "roofing";

        // Map AI stage to CRM stage
        const crmStageMap: Record<string, string> = {
          SIZE_HELP: "ai_size_recommended",
          MATERIAL_RULES: "ai_material_help",
          PRICING_HELP: "ai_price_intent",
          HEAVY_MATERIAL: "ai_material_help",
          READY_TO_BOOK: "ai_ready_to_book",
          HUMAN_HANDOFF: "ai_human_handoff",
          CONTRACTOR_INTEREST: "ai_price_intent",
          UNKNOWN: "ai_started",
          DELIVERY_SPEED: "ai_started",
          PERMIT_HELP: "ai_started",
        };

        await sb.functions.invoke("lead-ingest", {
          body: {
            source_channel: "WEBSITE_ASSISTANT",
            source_detail: `homepage_ai_${(crmStageMap[intent] || "ai_started")}`,
            zip: zip || undefined,
            notes: `AI Q: ${question.slice(0, 200)} | Size: ${sizeRange || "N/A"} | Stage: ${stage} | Material: ${materialClass || "N/A"} | Lang: ${lang}`,
            project_type: projectType || session_context?.project_type || undefined,
            material_type: materialType || session_context?.material_type || undefined,
            probable_size: sizeRange ? parseInt(sizeRange) : undefined,
            consent_status: "AI_INTERACTION",
            ...session_context,
          },
        });
      } catch (e) {
        console.error("Lead enrichment error (non-blocking):", e);
      }
    }

    const result = {
      answer_text: answerText,
      recommended_action: action,
      suggested_size_range: sizeRange,
      should_capture_lead: shouldCaptureLead,
      recommended_size: sizeRange ? parseInt(sizeRange) : null,
      customer_stage: stage,
      language: lang,
      intent,
      material_class: materialClass,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("website-assistant error:", e);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
