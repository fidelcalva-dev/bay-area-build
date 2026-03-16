import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// Build system prompt dynamically from DB templates
// ============================================================
function buildSystemPrompt(templates: any[]): string {
  let templateLines = "";
  for (const t of templates) {
    const unit = t.estimation_unit;
    if (unit === "sqft" && t.yd3_per_unit_min > 0) {
      templateLines += `- ${t.display_label}: ${t.yd3_per_unit_min}–${t.yd3_per_unit_max} yd³ per sq ft (typical ${t.typical_range_min}–${t.typical_range_max} yd)${t.heavy_material_flag ? " [HEAVY MATERIAL]" : ""}\n`;
    } else if (unit === "linear_ft" && t.yd3_per_unit_min > 0) {
      templateLines += `- ${t.display_label}: ${t.yd3_per_unit_min}–${t.yd3_per_unit_max} yd³ per linear ft (typical ${t.typical_range_min}–${t.typical_range_max} yd)\n`;
    } else {
      templateLines += `- ${t.display_label}: ${t.typical_range_min}–${t.typical_range_max} yd (typical)${t.heavy_material_flag ? " [HEAVY: 5/8/10 yd ONLY]" : ""}\n`;
    }
  }

  const projectTypeIds = templates.map((t: any) => t.project_type).join(", ");

  return `You are a project estimator and dumpster rental specialist for Calsan Dumpsters Pro, serving the San Francisco Bay Area.

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
${templateLines}
DUMPSTER SIZE OPTIONS:
General Debris: 5, 8, 10, 20, 30, 40, 50 yard
Heavy Materials: 5, 8, 10 yard ONLY

HEAVY MATERIAL RULES (CRITICAL):
- Heavy materials: clean soil, clean concrete, mixed heavy, concrete with rebar, brick, asphalt, rock, gravel, sand, tile, roofing gravel.
- ONLY available in 5, 8, and 10 yard containers. NEVER recommend 20/30/40/50 for heavy materials.
- Clean loads get flat-rate pricing with no weight overage — this is a benefit.
- If trash is mixed into heavy material (>20%), it gets reclassified to general debris rates with $165/ton overage.
- If more than 5% of a different heavy material is present, load may be reclassified as Mixed Heavy.
- If customer does not notify in advance and a reroute occurs, a $150-$300 surcharge may apply.
- Concrete with rebar is its own pricing class — extra disposal charges may apply.
- Fill-line rule: heavy containers must not be filled above the marked line.
- Green Halo premium may apply for environmentally certified disposal.

MULTI-CONTAINER RECOMMENDATIONS:
For large projects (>50 yd³), recommend container combinations:
- Use swap service when possible (we pick up full, drop empty).
- Example: 120 yd³ demolition = recommend 3x 40-yard or 2x 50-yard + 1x 20-yard.

SAVINGS ADVICE — include at least ONE relevant tip in every estimation response:
- Separate concrete/soil from mixed debris for flat-rate pricing (no weight overage).
- Keep clean loads clean — mixing trash into heavy containers triggers reclassification and higher rates.
- Separate metal to reduce load weight and potential overage charges.
- Notify Calsan in advance if material type changes to avoid surcharges.
- Use same-day delivery only when truly needed (it carries a surcharge).
- Right-size the container — uploading photos helps us recommend accurately.
- For large projects, swap service can be more efficient than multiple separate deliveries.
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

INTENT RESPONSES (use these as guides, adapt to context):
- SIZE_HELP: Estimate volume, recommend size, suggest photo upload for accuracy.
- HOW_MUCH_DOES_IT_COST: Explain pricing depends on ZIP, size, and material. Direct to Get Exact Price.
- HOW_FAST_CAN_YOU_DELIVER: Next-day delivery available in most areas. Same-day carries a surcharge. Direct to Schedule Delivery.
- PERMIT: Street placement may require a city permit. Calsan can help coordinate. Direct to Talk to a Specialist.
- CONTRACTOR_OR_COMMERCIAL: Mention contractor accounts, volume pricing, priority scheduling. Direct to Apply for Contractor Account.
- READY_TO_BOOK: Great! Direct to Get Exact Price or Schedule Delivery immediately.
- NEED_HUMAN: Offer Text Us, Call Now, or Have a Specialist Reach Out. Capture phone if offered.
- WHAT_CAN_I_PUT: List accepted materials. Mention hazardous exclusions. If heavy material detected, switch to heavy mode.

STRUCTURED OUTPUT — include these tags on separate lines at the END of your response:

[INTENT:XX] - one of: PROJECT_ESTIMATE, SIZE_HELP, MATERIAL_RULES, PRICING_HELP, DELIVERY_SPEED, HEAVY_MATERIAL, PERMIT_HELP, CONTRACTOR_INTEREST, READY_TO_BOOK, HUMAN_HANDOFF, UNKNOWN
[STAGE:XX] - one of: EXPLORING, COMPARING, READY, NEEDS_HELP
[ACTION:XX] - one of: QUOTE, PHOTO, SCHEDULE, CALL, CONTRACTOR
[LANG:XX] - EN or ES

If you provided a volume estimate, also include:
[PROJECT_TYPE:xx] - one of: ${projectTypeIds}
[VOLUME_MIN:XX] - minimum estimated cubic yards (integer)
[VOLUME_MAX:XX] - maximum estimated cubic yards (integer)
[HEAVY_MODE:true/false] - whether heavy material mode applies
[RECOMMENDED_PLAN:XxYY,XxYY] - container plan e.g. "1x40,1x30" or "1x20"
[RECYCLABLES:material1,material2] - separable materials identified
[SIZE_RANGE:XX-YY] or [SIZE_RANGE:XX] - single recommended size range
[MATERIAL_CLASS:XX] - CLEAN_CONCRETE, CLEAN_SOIL, MIXED_HEAVY, CONCRETE_REBAR, GENERAL_DEBRIS, ROOFING, YARD_WASTE
[SAVINGS_TIPS:tip1|tip2] - pipe-separated savings tips (1-3 tips, keep each under 20 words)
[CONFIDENCE:high/medium/low] - estimation confidence level`;
}

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

    // Load templates from DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { data: templates } = await sb
      .from("estimation_templates")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    const systemPrompt = buildSystemPrompt(templates || []);

    let userMessage = question.trim().slice(0, 800);
    if (zip) userMessage += ` (ZIP: ${zip})`;
    if (city) userMessage += ` (City: ${city})`;

    // Build messages array with conversation history
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    const recentHistory = conversation_history.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({ role: msg.role, content: msg.text || msg.content || "" });
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
    const tagPatterns: Record<string, RegExp> = {
      intent: /\[INTENT:(\w+)\]/,
      action: /\[ACTION:(\w+)\]/,
      sizeRange: /\[SIZE_RANGE:([\d\-]+)\]/,
      stage: /\[STAGE:(\w+)\]/,
      lang: /\[LANG:(\w+)\]/,
      materialClass: /\[MATERIAL_CLASS:([\w_]+)\]/,
      projectType: /\[PROJECT_TYPE:([\w_]+)\]/,
      volumeMin: /\[VOLUME_MIN:(\d+)\]/,
      volumeMax: /\[VOLUME_MAX:(\d+)\]/,
      heavyMode: /\[HEAVY_MODE:(true|false)\]/,
      plan: /\[RECOMMENDED_PLAN:([^\]]+)\]/,
      recyclables: /\[RECYCLABLES:([^\]]+)\]/,
      savingsTips: /\[SAVINGS_TIPS:([^\]]+)\]/,
      confidence: /\[CONFIDENCE:(\w+)\]/,
    };

    const parsed: Record<string, string | null> = {};
    for (const [key, regex] of Object.entries(tagPatterns)) {
      const match = rawContent.match(regex);
      parsed[key] = match ? match[1] : null;
    }

    // Clean answer text — remove all tags
    const answerText = rawContent
      .replace(/\[\w+:[^\]]*\]/g, "")
      .trim();

    const intent = parsed.intent || "UNKNOWN";
    const action = parsed.action || "QUOTE";
    const sizeRange = parsed.sizeRange || null;
    const stage = parsed.stage || "EXPLORING";
    const lang = parsed.lang || "EN";
    const materialClass = parsed.materialClass || null;
    const projectType = parsed.projectType || null;
    const volumeMin = parsed.volumeMin ? parseInt(parsed.volumeMin) : null;
    const volumeMax = parsed.volumeMax ? parseInt(parsed.volumeMax) : null;
    const heavyMode = parsed.heavyMode === "true";
    const recommendedPlan = parsed.plan || null;
    const recyclables = parsed.recyclables ? parsed.recyclables.split(",").map((s: string) => s.trim()) : [];
    const savingsTips = parsed.savingsTips ? parsed.savingsTips.split("|").map((s: string) => s.trim()).filter(Boolean) : [];
    const confidence = parsed.confidence || "medium";

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
      confidence,
    } : null;

    // Lead enrichment: fire-and-forget
    if (enrich_lead && (zip || intent !== "UNKNOWN" || estimation)) {
      try {
        const crmStageMap: Record<string, string> = {
          PROJECT_ESTIMATE: "ai_project_estimated",
          SIZE_HELP: "ai_project_estimated",
          MATERIAL_RULES: "ai_started",
          PRICING_HELP: "ai_quote_routed",
          HEAVY_MATERIAL: "ai_heavy_material_detected",
          READY_TO_BOOK: "ai_ready_to_book",
          HUMAN_HANDOFF: "ai_human_handoff",
          CONTRACTOR_INTEREST: "ai_quote_routed",
          DELIVERY_SPEED: "ai_started",
          PERMIT_HELP: "ai_started",
          UNKNOWN: "ai_started",
        };

        const enrichmentData: Record<string, unknown> = {
          source_channel: "WEBSITE_ASSISTANT",
          source_detail: `homepage_ai_estimator_${crmStageMap[intent] || "ai_started"}`,
          zip: zip || undefined,
          notes: `AI Estimator [${lang}]: ${question.slice(0, 200)} | Vol: ${volumeMin ? `${volumeMin}-${volumeMax}yd` : "N/A"} | Plan: ${recommendedPlan || "N/A"} | Stage: ${stage} | Material: ${materialClass || "N/A"} | Confidence: ${confidence}`,
          project_type: projectType || session_context?.project_type || undefined,
          material_type: materialClass ? materialClass.toLowerCase().replace(/_/g, " ") : session_context?.material_type || undefined,
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

        await sb.functions.invoke("lead-ingest", { body: enrichmentData });
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
