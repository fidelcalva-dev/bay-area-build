import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const {
      session_id,
      user_message,
      current_route,
      entity_type,
      entity_id,
    } = await req.json();

    // Fetch user role
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const roles = rolesData?.map((r: { role: string }) => r.role) || [];
    const primaryRole = roles[0] || "unknown";

    // Detect mode from route
    let detectedMode = "ADMIN";
    if (current_route?.startsWith("/sales")) detectedMode = "SALES";
    else if (current_route?.startsWith("/dispatch")) detectedMode = "DISPATCH";
    else if (current_route?.startsWith("/finance")) detectedMode = "FINANCE";
    else if (current_route?.startsWith("/cs") || current_route?.startsWith("/billing")) detectedMode = "CS";
    else if (current_route?.startsWith("/driver")) detectedMode = "DRIVER";
    else if (current_route?.includes("maintenance")) detectedMode = "MAINTENANCE";

    // Build or get session
    let activeSessionId = session_id;
    if (!activeSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from("ai_control_sessions")
        .insert({
          user_id: userId,
          user_role: primaryRole,
          mode: "DRY_RUN",
          current_route: current_route || null,
          current_entity_type: entity_type || null,
          current_entity_id: entity_id || null,
        })
        .select("id")
        .single();

      if (sessionError) throw sessionError;
      activeSessionId = newSession.id;
    } else {
      await supabase
        .from("ai_control_sessions")
        .update({
          last_active_at: new Date().toISOString(),
          current_route: current_route || null,
          current_entity_type: entity_type || null,
          current_entity_id: entity_id || null,
        })
        .eq("id", activeSessionId);
    }

    // Save user message
    const { data: userMsg } = await supabase
      .from("ai_control_messages")
      .insert({
        session_id: activeSessionId,
        role: "user",
        message_text: user_message,
      })
      .select("id")
      .single();

    // Build context snapshot
    let contextSnapshot: Record<string, unknown> = {
      mode: detectedMode,
      roles,
      route: current_route,
    };

    // Fetch entity context if provided
    if (entity_type && entity_id) {
      try {
        if (entity_type === "LEAD") {
          const { data } = await supabase.from("sales_leads").select("*").eq("id", entity_id).single();
          if (data) contextSnapshot.entity = data;
        } else if (entity_type === "QUOTE") {
          const { data } = await supabase.from("quotes").select("*").eq("id", entity_id).single();
          if (data) contextSnapshot.entity = data;
        } else if (entity_type === "ORDER") {
          const { data } = await supabase.from("orders").select("*").eq("id", entity_id).single();
          if (data) contextSnapshot.entity = data;
        } else if (entity_type === "RUN") {
          const { data } = await supabase.from("runs").select("*").eq("id", entity_id).single();
          if (data) contextSnapshot.entity = data;
        } else if (entity_type === "CUSTOMER") {
          const { data } = await supabase.from("customers").select("*").eq("id", entity_id).single();
          if (data) contextSnapshot.entity = data;
        }
      } catch {
        // Entity fetch failed, continue without
      }
    }

    // Fetch relevant knowledge
    const categoryMap: Record<string, string[]> = {
      SALES: ["SALES_PLAYBOOK", "PRICING_POLICY", "CRM_HOWTO"],
      DISPATCH: ["DISPATCH_RULES", "CRM_HOWTO"],
      FINANCE: ["BILLING_RULES", "PRICING_POLICY", "CRM_HOWTO"],
      CS: ["BILLING_RULES", "SALES_PLAYBOOK", "CRM_HOWTO"],
      ADMIN: ["CRM_HOWTO", "PRICING_POLICY", "DISPATCH_RULES", "BILLING_RULES", "HEAVY_RULES"],
      DRIVER: ["DISPATCH_RULES", "CRM_HOWTO"],
      MAINTENANCE: ["CRM_HOWTO"],
    };

    const relevantCategories = categoryMap[detectedMode] || ["CRM_HOWTO"];
    const { data: knowledgeData } = await supabase
      .from("ai_control_knowledge")
      .select("title, content_markdown, category")
      .in("category", relevantCategories)
      .eq("is_active", true)
      .limit(10);

    const knowledgeContext = (knowledgeData || [])
      .map((k: { title: string; content_markdown: string }) => `### ${k.title}\n${k.content_markdown}`)
      .join("\n\n");

    // Fetch conversation history
    const { data: historyData } = await supabase
      .from("ai_control_messages")
      .select("role, message_text")
      .eq("session_id", activeSessionId)
      .order("created_at", { ascending: true })
      .limit(20);

    const conversationHistory = (historyData || []).map((m: { role: string; message_text: string }) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.message_text,
    }));

    // Build system prompt
    const systemPrompt = `You are the Calsan AI Control Brain -- an internal operations assistant for Calsan Dumpsters Pro.

MODE: ${detectedMode}
USER ROLE: ${primaryRole}
CURRENT ROUTE: ${current_route || "unknown"}

RULES:
- Never hallucinate pricing. Only reference actual values from the context or knowledge base.
- Never reveal yard addresses, vendor rates, facility contracts, or internal cost structures.
- Never execute destructive actions. Only suggest actions that require human confirmation.
- Always operate in DRY_RUN mode: provide suggestions only.
- No emojis. Professional tone.
- Keep answers concise and actionable.
- If asked about pricing, reference META 2026 rates and the $165/ton overage standard.
- If you don't know something, say so clearly.

ENTITY CONTEXT:
${contextSnapshot.entity ? JSON.stringify(contextSnapshot.entity, null, 2) : "No entity loaded."}

KNOWLEDGE BASE:
${knowledgeContext || "No knowledge loaded."}

Respond with a JSON object containing:
{
  "answer": "your concise response text",
  "suggested_actions": [{"type": "ACTION_TYPE", "label": "human-readable label", "payload": {}, "requires_confirmation": true}],
  "risk_flags": [{"type": "FLAG_TYPE", "severity": "LOW|MEDIUM|HIGH", "reason": "explanation"}],
  "confidence": 0.0-1.0
}

ACTION TYPES: SUGGEST_CALL, SUGGEST_SMS, SUGGEST_QUOTE, SUGGEST_ASSIGN, SUGGEST_ROUTE, SUGGEST_FACILITY, SUGGEST_PRICE_TIER, SUGGEST_APPROVAL, HOW_TO_GUIDE

If no actions or risks apply, return empty arrays.`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
    ];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // Parse structured response
    let parsed: {
      answer: string;
      suggested_actions: Array<{ type: string; label: string; payload: Record<string, unknown>; requires_confirmation: boolean }>;
      risk_flags: Array<{ type: string; severity: string; reason: string }>;
      confidence: number;
    };

    try {
      // Try to extract JSON from the response
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { answer: rawContent, suggested_actions: [], risk_flags: [], confidence: 0.7 };
    } catch {
      parsed = { answer: rawContent, suggested_actions: [], risk_flags: [], confidence: 0.5 };
    }

    // Save assistant message
    await supabase.from("ai_control_messages").insert({
      session_id: activeSessionId,
      role: "assistant",
      message_text: parsed.answer,
      response_json: {
        suggested_actions: parsed.suggested_actions,
        risk_flags: parsed.risk_flags,
        confidence: parsed.confidence,
      },
    });

    // Save suggested actions
    if (parsed.suggested_actions?.length > 0) {
      const actions = parsed.suggested_actions.map((a) => ({
        session_id: activeSessionId,
        message_id: userMsg?.id || null,
        action_type: a.type,
        payload_json: a.payload || {},
        requires_confirmation: a.requires_confirmation !== false,
        status: "SUGGESTED",
      }));
      await supabase.from("ai_control_actions").insert(actions);
    }

    // Update session context
    await supabase
      .from("ai_control_sessions")
      .update({ context_snapshot_json: contextSnapshot })
      .eq("id", activeSessionId);

    return new Response(
      JSON.stringify({
        session_id: activeSessionId,
        answer: parsed.answer,
        suggested_actions: parsed.suggested_actions || [],
        risk_flags: parsed.risk_flags || [],
        confidence: parsed.confidence || 0.5,
        mode: detectedMode,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-control-brain error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
