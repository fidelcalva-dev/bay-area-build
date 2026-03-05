import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a dumpster rental specialist for Calsan Dumpsters Pro, serving the San Francisco Bay Area.

RULES:
- Answer in 2-3 sentences max. Be helpful but concise.
- NEVER quote exact pricing. Always say "Pricing depends on your ZIP code and project details" and recommend getting an exact quote.
- If the user asks about prohibited items (hazardous waste, tires, batteries, paint, appliances with refrigerant), list what IS allowed and suggest they call for specifics.
- If the question is about scheduling or delivery urgency, confirm same-day delivery is available based on availability and recommend scheduling.
- If the question is about sizing, give a general recommendation based on common projects but always recommend getting an exact quote for accuracy.
- Do NOT use emojis.
- Do NOT reveal internal operations, margins, or yard locations.
- Keep a professional, helpful tone.

SIZING GUIDELINES (general only):
- Bathroom remodel: 10 yard
- Kitchen remodel: 20 yard
- Single room cleanout: 10 yard
- Whole house cleanout: 20-30 yard
- Roofing (single layer): 10-20 yard
- Roofing (multiple layers): 20-30 yard
- New construction: 30-40 yard
- Concrete/dirt: 10-20 yard (flat-fee, no weight overage)
- Yard waste/landscaping: 10-20 yard

RESPONSE FORMAT:
After your answer, on a new line write exactly one of these tags:
[ACTION:QUOTE] - if user should get a quote/pricing
[ACTION:PHOTO] - if user should upload a photo for sizing help
[ACTION:SCHEDULE] - if user is asking about delivery timing
[ACTION:CALL] - if user needs to speak to someone
[SIZE:XX] - optionally recommend a size (e.g., [SIZE:20])`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
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
          { role: "user", content: question.trim().slice(0, 500) },
        ],
        max_tokens: 300,
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

    // Parse action and size tags from the response
    const actionMatch = rawContent.match(/\[ACTION:(\w+)\]/);
    const sizeMatch = rawContent.match(/\[SIZE:(\d+)\]/);

    // Clean answer text (remove tags)
    const answerText = rawContent
      .replace(/\[ACTION:\w+\]/g, "")
      .replace(/\[SIZE:\d+\]/g, "")
      .trim();

    const result = {
      answer_text: answerText,
      recommended_action: actionMatch ? actionMatch[1] : "QUOTE",
      recommended_size: sizeMatch ? parseInt(sizeMatch[1]) : null,
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
