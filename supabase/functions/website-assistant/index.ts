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

RULES:
- Answer in 2-3 sentences max. Be helpful, direct, and confidence-building.
- Structure your answer as: recommendation → short reason → next step.
- NEVER quote exact pricing or dollar amounts. Always say pricing depends on ZIP code.
- If asked about prohibited items, list what IS allowed and suggest calling.
- Keep a professional, confident, local-service tone.
- Do NOT use emojis.
- Do NOT reveal internal operations, margins, or yard locations.

SIZING GUIDELINES (general only):
- Bathroom remodel: 10 yard
- Kitchen remodel: 20 yard
- Single room cleanout: 10 yard
- Whole house cleanout: 20-30 yard
- Roofing (single layer): 10-20 yard
- Roofing (multiple layers): 20-30 yard
- New construction: 30-40 yard
- Concrete/dirt: 5-10 yard (flat-fee, no weight overage)
- Yard waste/landscaping: 10-20 yard
- Garage cleanout: 10-15 yard

INTENT CLASSIFICATION:
After your answer, on a new line, include exactly one intent tag:
[INTENT:PRICE] - asking about cost
[INTENT:SIZE] - asking about sizing
[INTENT:MATERIALS_ALLOWED] - asking what goes in dumpster
[INTENT:DELIVERY_SPEED] - asking about timing
[INTENT:HEAVY_MATERIAL] - concrete, dirt, soil
[INTENT:PERMIT] - permits or regulations
[INTENT:READY_TO_BOOK] - ready to order
[INTENT:OTHER] - anything else

CUSTOMER STAGE (classify on new line):
[STAGE:EXPLORING] - just learning, not ready yet
[STAGE:COMPARING] - evaluating options
[STAGE:READY] - ready to order or get pricing
[STAGE:NEEDS_HELP] - confused or needs human

ACTION TAG (on new line, exactly one):
[ACTION:QUOTE] - should get a quote
[ACTION:PHOTO] - should upload photo for sizing
[ACTION:SCHEDULE] - asking about delivery timing
[ACTION:CALL] - needs to speak to someone

SIZE RANGE TAG (optional, on new line):
[SIZE_RANGE:XX-YY] or [SIZE_RANGE:XX]

LANGUAGE TAG (on new line):
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
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_tokens: 400,
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

    // Clean answer text
    const answerText = rawContent
      .replace(/\[INTENT:\w+\]/g, "")
      .replace(/\[ACTION:\w+\]/g, "")
      .replace(/\[SIZE_RANGE:[\d\-]+\]/g, "")
      .replace(/\[SIZE:\d+\]/g, "")
      .replace(/\[STAGE:\w+\]/g, "")
      .replace(/\[LANG:\w+\]/g, "")
      .trim();

    const intent = intentMatch ? intentMatch[1] : "OTHER";
    const action = actionMatch ? actionMatch[1] : "QUOTE";
    const sizeRange = sizeRangeMatch ? sizeRangeMatch[1] : null;
    const stage = stageMatch ? stageMatch[1] : "EXPLORING";
    const lang = langMatch ? langMatch[1] : "EN";

    const shouldCaptureLead = ["READY_TO_BOOK", "PRICE"].includes(intent) || stage === "READY";

    // Lead enrichment: fire-and-forget
    if (enrich_lead && (zip || intent !== "OTHER")) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const sb = createClient(supabaseUrl, supabaseKey);

        // Detect project/material from question
        let projectType: string | null = null;
        let materialType: string | null = null;
        const q = question.toLowerCase();
        if (/kitchen/i.test(q)) projectType = "Kitchen Remodel";
        else if (/bathroom/i.test(q)) projectType = "Bathroom Remodel";
        else if (/garage/i.test(q)) projectType = "Garage Cleanout";
        else if (/roof/i.test(q)) projectType = "Roofing";
        else if (/demo|demolition/i.test(q)) projectType = "Demolition";
        else if (/cleanout|clean out/i.test(q)) projectType = "Home Cleanout";
        else if (/yard|landscap/i.test(q)) projectType = "Yard Cleanup";
        else if (/construction/i.test(q)) projectType = "Construction";

        if (/concrete|brick|asphalt/i.test(q)) materialType = "concrete";
        else if (/dirt|soil|rock/i.test(q)) materialType = "dirt";
        else if (/green|vegetation/i.test(q)) materialType = "green_waste";

        await sb.functions.invoke("lead-ingest", {
          body: {
            source_channel: "WEBSITE_ASSISTANT",
            source_detail: "homepage_ai_assistant",
            zip: zip || undefined,
            notes: `AI Assistant Q: ${question.slice(0, 200)}\nRecommended: ${sizeRange ? sizeRange + ' yd' : 'N/A'}\nStage: ${stage}`,
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
