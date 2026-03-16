import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// SYSTEM PROMPT — Project Estimator + Sales Assistant
// ============================================================
const SYSTEM_PROMPT = `You are a project estimator and dumpster rental specialist for Calsan Dumpsters Pro, serving the San Francisco Bay Area.

LANGUAGE RULE:
- Detect whether the user writes in Spanish or English.
- ALWAYS respond in the SAME language the user used.
- Do NOT mix languages within the same response.

YOUR ROLE:
You are a "super quote estimator." When a customer describes a project, you:
1. Estimate the likely debris volume in cubic yards (as a range).
2. Recommend the best dumpster size(s) or container combination.
3. Identify recyclable or separable materials that could save money.
4. Explain how the customer can save money (1-2 specific tips).
5. Move the customer toward exact pricing, photo upload, or human support.

RESPONSE RULES:
- Keep responses SHORT (4-6 sentences max for estimates, 2-3 for simple questions).
- Be professional and confident. No emojis.
- Present estimates as RANGES, never guarantees. Use phrases like "based on typical projects" or "initial estimate."
- NEVER quote exact dollar amounts. Say "pricing depends on your ZIP code and project details."
- Always end with a clear next step.
- Ask at MOST 1-2 clarifying questions before estimating. If the customer gives a project type, estimate immediately with the typical range.

ESTIMATION GUIDELINES (cubic yards per project):
- Full house demolition: 0.05-0.08 yd3 per sq ft (e.g. 1800 sq ft = 90-144 yd3)
- Interior demolition: 0.02-0.04 yd3 per sq ft
- Kitchen remodel: 10-20 yd (typical)
- Bathroom remodel: 5-10 yd (typical)
- Garage cleanout: 10-20 yd (single 10, double 20)
- Roofing tear-off: 0.008-0.015 yd3 per sq ft (single layer lower, multi-layer higher)
- Construction debris: 20-40 yd (typical)
- Office cleanout: 10-30 yd
- Yard cleanup: 5-20 yd
- Concrete/soil: 5-10 yd (heavy material, 5/8/10 yd containers ONLY)
- Deck/fence demo: 0.05-0.10 yd3 per linear ft
- Estate/eviction cleanout: 20-40 yd

DUMPSTER SIZE OPTIONS:
General Debris: 5, 8, 10, 20, 30, 40, 50 yard
Heavy Materials: 5, 8, 10 yard ONLY

HEAVY MATERIAL RULES (CRITICAL):
- Heavy materials: clean soil, clean concrete, mixed heavy, concrete with rebar, brick, asphalt, rock, gravel, sand.
- ONLY available in 5, 8, and 10 yard containers. NEVER recommend 20/30/40/50 for heavy materials.
- Clean loads get flat-rate pricing with no weight overage — this is a benefit.
- If trash is mixed into heavy material, it gets reclassified to general debris rates with $165/ton overage.
- If customer does not notify in advance and a reroute occurs, a $150-$300 surcharge may apply.
- Concrete with rebar is its own pricing class.
- Fill-line rule: heavy containers must not be filled above the marked line.

MULTI-CONTAINER RECOMMENDATIONS:
For large projects (>50 yd3), recommend container combinations:
- Use swap service when possible (we pick up full, drop empty).
- Example: 120 yd3 demolition = recommend 3x 40-yard or 2x 50-yard + 1x 20-yard.

SAVINGS ADVICE — include at least ONE relevant tip in every estimation response:
- Separate concrete/soil from mixed debris for flat-rate pricing (no weight overage).
- Keep clean loads clean — mixing trash into heavy containers triggers reclassification and higher rates.
- Separate metal to reduce load weight and potential overage charges.
- Notify Calsan in advance if material type changes to avoid surcharges.
- Use same-day delivery only when truly needed (it carries a surcharge).
- Right-size the container — uploading photos helps us recommend accurately.
- For large projects, swap service (we pick up full, drop empty) can be more efficient than multiple separate deliveries.
- Contractors: apply for a contractor account for volume pricing and priority scheduling.
- Flatten cardboard and break down lumber to maximize container space.

RECYCLABLE MATERIALS TO IDENTIFY:
- Concrete (separate for flat-rate pricing)
- Metal/steel (separate to reduce weight)
- Clean soil/dirt (separate for flat-rate)
- Wood (can be kept together with general debris)
- Cardboard (flatten to maximize space)
- Appliances without Freon (accepted at no extra charge)

MATERIALS NOT ACCEPTED:
- Hazardous waste, tires, batteries, paint, chemicals, medical waste, asbestos, electronics (monitors, TVs).

STRUCTURED OUTPUT — include these tags on separate lines at the END of your response:

[INTENT:XX] - one of: PROJECT_ESTIMATE, SIZE_HELP, MATERIAL_RULES, PRICING_HELP, DELIVERY_SPEED, HEAVY_MATERIAL, PERMIT_HELP, CONTRACTOR_INTEREST, READY_TO_BOOK, HUMAN_HANDOFF, UNKNOWN
[STAGE:XX] - one of: EXPLORING, COMPARING, READY, NEEDS_HELP
[ACTION:XX] - one of: QUOTE, PHOTO, SCHEDULE, CALL, CONTRACTOR
[LANG:XX] - EN or ES

If you provided a volume estimate, also include:
[PROJECT_TYPE:xx] - the detected project template id (e.g. full_house_demo, kitchen_remodel, bathroom_remodel, garage_cleanout, roofing, construction_debris, office_cleanout, yard_cleanup, concrete_removal, soil_excavation, deck_fence_demo, estate_cleanout, interior_demo)
[VOLUME_MIN:XX] - minimum estimated cubic yards (integer)
[VOLUME_MAX:XX] - maximum estimated cubic yards (integer)
[HEAVY_MODE:true/false] - whether heavy material mode applies
[RECOMMENDED_PLAN:XxYY,XxYY] - container plan e.g. "1x40,1x30" or "1x20"
[RECYCLABLES:material1,material2] - separable materials identified
[SIZE_RANGE:XX-YY] or [SIZE_RANGE:XX] - single recommended size range
[MATERIAL_CLASS:XX] - CLEAN_CONCRETE, CLEAN_SOIL, MIXED_HEAVY, GENERAL_DEBRIS, ROOFING, YARD_WASTE
[SAVINGS_TIPS:tip1|tip2] - pipe-separated savings tips (1-3 tips, keep each under 20 words)`;

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
    const conversation_history = body?.conversation_history || [];

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

    let userMessage = question.trim().slice(0, 800);
    if (zip) userMessage += ` (ZIP: ${zip})`;
    if (city) userMessage += ` (City: ${city})`;

    // Build messages array with conversation history
    const messages: Array<{role: string; content: string}> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];
    
    const recentHistory = conversation_history.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.text || msg.content || '' });
      }
    }
    
    messages.push({ role: "user", content: userMessage });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 700,
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

    // Parse all tags
    const intentMatch = rawContent.match(/\[INTENT:(\w+)\]/);
    const actionMatch = rawContent.match(/\[ACTION:(\w+)\]/);
    const sizeRangeMatch = rawContent.match(/\[SIZE_RANGE:([\d\-]+)\]/);
    const stageMatch = rawContent.match(/\[STAGE:(\w+)\]/);
    const langMatch = rawContent.match(/\[LANG:(\w+)\]/);
    const materialClassMatch = rawContent.match(/\[MATERIAL_CLASS:(\w+)\]/);
    const projectTypeMatch = rawContent.match(/\[PROJECT_TYPE:(\w+)\]/);
    const volumeMinMatch = rawContent.match(/\[VOLUME_MIN:(\d+)\]/);
    const volumeMaxMatch = rawContent.match(/\[VOLUME_MAX:(\d+)\]/);
    const heavyModeMatch = rawContent.match(/\[HEAVY_MODE:(true|false)\]/);
    const planMatch = rawContent.match(/\[RECOMMENDED_PLAN:([^\]]+)\]/);
    const recyclablesMatch = rawContent.match(/\[RECYCLABLES:([^\]]+)\]/);
    const savingsTipsMatch = rawContent.match(/\[SAVINGS_TIPS:([^\]]+)\]/);

    // Clean answer text — remove all tags
    const answerText = rawContent
      .replace(/\[INTENT:\w+\]/g, "")
      .replace(/\[ACTION:\w+\]/g, "")
      .replace(/\[SIZE_RANGE:[\d\-]+\]/g, "")
      .replace(/\[SIZE:\d+\]/g, "")
      .replace(/\[STAGE:\w+\]/g, "")
      .replace(/\[LANG:\w+\]/g, "")
      .replace(/\[MATERIAL_CLASS:\w+\]/g, "")
      .replace(/\[PROJECT_TYPE:\w+\]/g, "")
      .replace(/\[VOLUME_MIN:\d+\]/g, "")
      .replace(/\[VOLUME_MAX:\d+\]/g, "")
      .replace(/\[HEAVY_MODE:\w+\]/g, "")
      .replace(/\[RECOMMENDED_PLAN:[^\]]+\]/g, "")
      .replace(/\[RECYCLABLES:[^\]]+\]/g, "")
      .replace(/\[SAVINGS_TIPS:[^\]]+\]/g, "")
      .trim();

    const intent = intentMatch ? intentMatch[1] : "UNKNOWN";
    const action = actionMatch ? actionMatch[1] : "QUOTE";
    const sizeRange = sizeRangeMatch ? sizeRangeMatch[1] : null;
    const stage = stageMatch ? stageMatch[1] : "EXPLORING";
    const lang = langMatch ? langMatch[1] : "EN";
    const materialClass = materialClassMatch ? materialClassMatch[1] : null;
    const projectType = projectTypeMatch ? projectTypeMatch[1] : null;
    const volumeMin = volumeMinMatch ? parseInt(volumeMinMatch[1]) : null;
    const volumeMax = volumeMaxMatch ? parseInt(volumeMaxMatch[1]) : null;
    const heavyMode = heavyModeMatch ? heavyModeMatch[1] === 'true' : false;
    const recommendedPlan = planMatch ? planMatch[1] : null;
    const recyclables = recyclablesMatch ? recyclablesMatch[1].split(',').map((s: string) => s.trim()) : [];
    const savingsTips = savingsTipsMatch ? savingsTipsMatch[1].split('|').map((s: string) => s.trim()).filter(Boolean) : [];

    const shouldCaptureLead =
      ["READY_TO_BOOK", "PRICING_HELP", "HUMAN_HANDOFF", "CONTRACTOR_INTEREST", "PROJECT_ESTIMATE"].includes(intent) ||
      stage === "READY" ||
      stage === "NEEDS_HELP" ||
      volumeMin !== null;

    // Build estimation result
    const estimation = volumeMin !== null ? {
      volume_min: volumeMin,
      volume_max: volumeMax || volumeMin,
      recommended_plan: recommendedPlan,
      heavy_mode: heavyMode,
      recyclable_materials: recyclables,
      savings_tips: savingsTips,
      project_type: projectType,
      material_class: materialClass,
    } : null;

    // Lead enrichment: fire-and-forget
    if (enrich_lead && (zip || intent !== "UNKNOWN" || estimation)) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const sb = createClient(supabaseUrl, supabaseKey);

        const crmStageMap: Record<string, string> = {
          PROJECT_ESTIMATE: "ai_project_estimated",
          SIZE_HELP: "ai_size_recommended",
          MATERIAL_RULES: "ai_material_help",
          PRICING_HELP: "ai_price_intent",
          HEAVY_MATERIAL: "ai_heavy_material_detected",
          READY_TO_BOOK: "ai_ready_to_book",
          HUMAN_HANDOFF: "ai_human_handoff",
          CONTRACTOR_INTEREST: "ai_price_intent",
          UNKNOWN: "ai_started",
          DELIVERY_SPEED: "ai_started",
          PERMIT_HELP: "ai_started",
        };

        const enrichmentData: Record<string, unknown> = {
          source_channel: "WEBSITE_ASSISTANT",
          source_detail: `homepage_ai_estimator_${(crmStageMap[intent] || "ai_started")}`,
          zip: zip || undefined,
          notes: `AI Estimator: ${question.slice(0, 200)} | Vol: ${volumeMin ? `${volumeMin}-${volumeMax}yd` : 'N/A'} | Plan: ${recommendedPlan || 'N/A'} | Stage: ${stage} | Material: ${materialClass || 'N/A'} | Lang: ${lang}`,
          project_type: projectType || session_context?.project_type || undefined,
          material_type: materialClass ? materialClass.toLowerCase().replace(/_/g, ' ') : session_context?.material_type || undefined,
          probable_size: sizeRange ? parseInt(sizeRange) : undefined,
          consent_status: "AI_INTERACTION",
          ...session_context,
        };

        if (estimation) {
          enrichmentData.estimated_total_yards_min = estimation.volume_min;
          enrichmentData.estimated_total_yards_max = estimation.volume_max;
          enrichmentData.recommended_dumpster_plan = estimation.recommended_plan;
          enrichmentData.recyclable_materials = estimation.recyclable_materials;
        }

        await sb.functions.invoke("lead-ingest", {
          body: enrichmentData,
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
      estimation,
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
