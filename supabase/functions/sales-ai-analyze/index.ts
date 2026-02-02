import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalyzeRequest {
  lead_id?: string;
  contact_id?: string;
  entity_type: "LEAD" | "QUOTE" | "ORDER";
  entity_id: string;
  messages?: string[];
  source_channel?: string;
  zip?: string;
  market?: string;
  material_category?: string;
  size_yd?: number;
  customer_type?: string;
  customer_tier?: string;
  is_heavy?: boolean;
  quote_price?: number;
  user_role?: string;
}

interface AIInsight {
  intent_score: number;
  urgency_score: number;
  value_score: number;
  churn_risk_score: number;
  objections: {
    price: boolean;
    schedule: boolean;
    size: boolean;
    rules: boolean;
    trust: boolean;
    notes: string[];
  };
  recommended_next_action: "CALL" | "SMS" | "EMAIL" | "QUOTE" | "FOLLOW_UP";
  scripts: {
    short_close: string;
    clarify_close: string;
  };
  offer_suggestion: {
    type: string;
    description: string;
    allowed: boolean;
    reason: string;
  };
  reasoning: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header for user context
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const userClient = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id || null;
    }

    // Check if Sales AI is enabled
    const { data: configEnabled } = await supabase
      .from("config_settings")
      .select("value")
      .eq("key", "sales_ai.enabled")
      .single();

    if (configEnabled?.value !== true && configEnabled?.value !== "true") {
      return new Response(
        JSON.stringify({ error: "Sales AI is disabled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get config settings
    const { data: configMode } = await supabase
      .from("config_settings")
      .select("value")
      .eq("key", "sales_ai.mode")
      .single();

    const { data: configMaxDiscount } = await supabase
      .from("config_settings")
      .select("value")
      .eq("key", "sales_ai.max_discount_pct_sales")
      .single();

    const mode = (configMode?.value as string)?.replace(/"/g, "") || "DRY_RUN";
    const maxDiscountPct = parseInt(configMaxDiscount?.value as string) || 5;

    const body: AnalyzeRequest = await req.json();
    const {
      lead_id,
      contact_id,
      entity_type,
      entity_id,
      messages = [],
      source_channel = "unknown",
      zip,
      market,
      material_category,
      size_yd,
      customer_type = "homeowner",
      customer_tier = "standard",
      is_heavy = false,
      quote_price,
      user_role = "sales",
    } = body;

    // Build the analysis prompt
    const systemPrompt = `You are a Sales AI Closer for Cal's Dumpsters Pro, a dumpster rental company serving the Bay Area.

Your job is to analyze leads/customers and help staff close sales faster.

CRITICAL RULES:
1. Never promise prices outside the pricing engine - only suggest offers within guardrails
2. Never apply discounts beyond role limits (Sales max: ${maxDiscountPct}%)
3. No emojis in customer messages - keep it professional
4. Always cite reasoning for recommendations
5. Heavy materials require fill-line compliance reminder
6. Yard waste/grass = route as debris heavy, NO Green Halo

CUSTOMER TYPES:
- Homeowner: Usually one-time, price-sensitive, needs guidance on size
- Contractor: Repeat potential, schedule-focused, may negotiate
- Commercial: Volume-oriented, longer-term relationship

ALLOWED OFFERS (no unauthorized discounts):
- Same-day delivery if available
- Right-size recommendation
- Transparent yard-based availability
- Quick scheduling confirmation
- For Preferred/VIP only: Up to ${maxDiscountPct}% discount if margin allows

Respond with a JSON object only, no markdown.`;

    const userPrompt = `Analyze this lead/customer and provide closing assistance:

CONTEXT:
- Entity Type: ${entity_type}
- Source Channel: ${source_channel}
- ZIP: ${zip || "unknown"}
- Market: ${market || "unknown"}
- Material: ${material_category || "not specified"}
- Size: ${size_yd ? `${size_yd} yard` : "not specified"}
- Customer Type: ${customer_type}
- Customer Tier: ${customer_tier}
- Is Heavy Material: ${is_heavy}
- Quote Price: ${quote_price ? `$${quote_price}` : "not quoted yet"}
- User Role: ${user_role}

CONVERSATION HISTORY:
${messages.length > 0 ? messages.join("\n") : "No messages yet - this is a new lead"}

Provide analysis as JSON with this exact structure:
{
  "intent_score": <0-100, how likely to buy>,
  "urgency_score": <0-100, how urgent is their need>,
  "value_score": <0-100, potential lifetime value>,
  "churn_risk_score": <0-100, risk of losing this lead>,
  "objections": {
    "price": <true/false>,
    "schedule": <true/false>,
    "size": <true/false>,
    "rules": <true/false>,
    "trust": <true/false>,
    "notes": [<specific objection notes>]
  },
  "recommended_next_action": "<CALL|SMS|EMAIL|QUOTE|FOLLOW_UP>",
  "scripts": {
    "short_close": "<1-2 lines, direct closing message>",
    "clarify_close": "<3-4 lines, clarify and close>"
  },
  "offer_suggestion": {
    "type": "<same_day|right_size|quick_schedule|discount|none>",
    "description": "<what to offer>",
    "allowed": <true/false based on customer tier and limits>,
    "reason": "<why this offer>"
  },
  "reasoning": "<brief explanation of analysis>"
}

${is_heavy ? "IMPORTANT: Include fill-line compliance reminder in scripts." : ""}
${material_category?.toLowerCase().includes("grass") || material_category?.toLowerCase().includes("yard") ? "IMPORTANT: This is yard waste - route as debris heavy, do NOT mention Green Halo." : ""}`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No content in AI response");
    }

    // Parse AI response
    let insight: AIInsight;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      insight = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    const latencyMs = Date.now() - startTime;
    const tokensUsed = aiData.usage?.total_tokens || null;

    // Store insight in database
    const { data: savedInsight, error: insertError } = await supabase
      .from("sales_ai_insights")
      .insert({
        lead_id: lead_id || null,
        contact_id: contact_id || null,
        entity_type,
        entity_id,
        intent_score: insight.intent_score,
        urgency_score: insight.urgency_score,
        value_score: insight.value_score,
        churn_risk_score: insight.churn_risk_score,
        objections_json: insight.objections,
        recommended_next_action: insight.recommended_next_action,
        recommended_script_json: insight.scripts,
        recommended_offer_json: insight.offer_suggestion,
        reasoning: insight.reasoning,
        model_used: "google/gemini-3-flash-preview",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to save insight:", insertError);
    }

    // Generate draft messages
    const drafts = [];
    if (savedInsight) {
      // SMS short close
      const { data: smsDraft } = await supabase
        .from("sales_ai_messages_drafts")
        .insert({
          lead_id: lead_id || null,
          contact_id: contact_id || null,
          insight_id: savedInsight.id,
          channel: "SMS",
          draft_type: "SHORT_CLOSE",
          draft_body: insight.scripts.short_close,
          status: "DRAFT",
          created_by_user_id: userId,
        })
        .select()
        .single();
      if (smsDraft) drafts.push(smsDraft);

      // Email clarify close
      const { data: emailDraft } = await supabase
        .from("sales_ai_messages_drafts")
        .insert({
          lead_id: lead_id || null,
          contact_id: contact_id || null,
          insight_id: savedInsight.id,
          channel: "EMAIL",
          draft_type: "CLARIFY_CLOSE",
          subject: "Your Dumpster Rental Quote",
          draft_body: insight.scripts.clarify_close,
          status: "DRAFT",
          created_by_user_id: userId,
        })
        .select()
        .single();
      if (emailDraft) drafts.push(emailDraft);
    }

    // Log audit
    await supabase.from("sales_ai_audit").insert({
      user_id: userId,
      user_role,
      lead_id: lead_id || null,
      contact_id: contact_id || null,
      entity_type,
      entity_id,
      action_type: "ANALYZE",
      input_summary_json: {
        source_channel,
        zip,
        market,
        material_category,
        size_yd,
        customer_type,
        customer_tier,
        is_heavy,
        messages_count: messages.length,
      },
      ai_output_json: insight,
      model_used: "google/gemini-3-flash-preview",
      tokens_used: tokensUsed,
      latency_ms: latencyMs,
    });

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        insight: savedInsight || insight,
        drafts,
        latency_ms: latencyMs,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sales AI analyze error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
