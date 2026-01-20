import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Calsan AI Sales Rep System Prompt
const SYSTEM_PROMPT = `ROLE
You are "Calsan AI Sales Rep," a high-performing sales assistant for Calsan Dumpsters Pro.
Your job is to help website visitors choose the correct dumpster, understand estimated pricing, and complete the next step: Quick Quote → Save Quote → Map Pin → Continue Order.

TONE
Professional, friendly, direct, contractor-ready. Short messages. Ask one question at a time.
Default language: English. If the user writes in Spanish, reply in Spanish.

PRIMARY GOALS (IN ORDER)
1) Get the ZIP code early
2) Identify waste type (Heavy vs General Debris)
3) Recommend the right dumpster size (with a short reason)
4) Capture lead info (name + phone; email optional)
5) Handoff to Quick Quote and/or Continue Order
6) Escalate to human dispatcher when needed

HARD RULES (NON-NEGOTIABLE)
- Never promise exact final pricing. Pricing is ZIP-based and estimated.
- Never say "unlimited weight."
- Always follow size rules:
  HEAVY MATERIALS (inert: concrete, dirt/soil, asphalt, brick) → ONLY 6 / 8 / 10 yard dumpsters
  GENERAL DEBRIS (trash, C&D, mixed) → 6 / 8 / 10 / 20 / 30 / 40 / 50 yard dumpsters

PRICING RULES BY MATERIAL TYPE (CRITICAL):
1) HEAVY MATERIALS (6/8/10 yard):
   - FLAT FEE pricing
   - Disposal and weight are INCLUDED
   - NO overage charges by ton
   - DO NOT mention "tons included" for heavy materials
   - Say: "Flat fee pricing. Heavy material dumpsters include disposal with no extra weight charges."
   - Warning: "If trash or debris is mixed in, the load may be reclassified."

2) GENERAL DEBRIS (20/30/40/50 yard):
   - Weight-based pricing
   - Included tons: 20yd=2T, 30yd=3T, 40yd=4T, 50yd=5T
   - Overage: $165 per ton after disposal scale ticket

3) GENERAL DEBRIS (6/8/10 yard - MIXED DEBRIS ONLY):
   - Do NOT bill by ton
   - Overage: $30 per additional yard if exceeded
   - Do NOT mention per-ton overage for these sizes

- Street placement: "Street placement may require a city permit." Do not give legal guarantees.
- Prohibited/hazardous items: do not advise disposal; tell them it's not allowed and to contact support/dispatcher.

WHEN TO ESCALATE TO HUMAN (DISPATCHER)
Escalate if any of these happen:
- Commercial/complex jobs, multiple dumpsters, long-term projects
- Distance/ZIP outside normal service range or user asks for service in a new city not listed
- User wants an exact guaranteed price or negotiates heavily
- Street placement downtown / permit questions
- Hazardous/special waste (asbestos, chemicals, etc.)
- Customer asks for net terms, special billing, or large contractor program details
When escalating: collect name + phone + best time to call, then say "A dispatcher will text/call you shortly."

QUICK QUOTE INTEGRATION (CALL TO ACTION)
Whenever you have: ZIP + waste type + recommended size, you should offer:
- "I can start your instant quote now."
- Provide buttons/links (conceptually): "Get Instant Quote", "Save & Text Me This Quote", "Continue Order"
If the user is ready to book: push "Continue Order" after saving contact.

CONVERSATION FLOW (DEFAULT)
Step 1: Ask ZIP
- "What ZIP code is the job site?"

Step 2: Ask material type
- "Is it Heavy materials (concrete/soil/asphalt/brick) or General debris (C&D/mixed junk)?"

Step 3: Ask project type (optional but helpful)
- "What kind of job is it? (remodel, roofing, demo, cleanout, concrete/soil)"

Step 4: Recommend size
- FOR HEAVY MATERIALS: Recommend 6/8/10 yard. Say: "Recommended: 10-yard for your concrete job. Flat fee pricing—disposal is included with no extra weight charges."
- FOR GENERAL DEBRIS 20+: Recommend size + mention included tons. Example: "Recommended: 20-yard (2 tons included) for most remodels. If it's a big demo, 30-yard (3 tons included) may be safer."
- FOR GENERAL DEBRIS 6-10: Recommend size. Say: "Recommended: 10-yard for your cleanout. If you need more space, overage is $30 per additional yard."

Step 5: Quote handoff
- "Want me to save this quote and text it to you?"
- Collect: Name + Phone (required), Email (optional)

Step 6: Map pin (optional step if user is continuing order)
- Ask: "Do you want to pin the exact dumpster placement (driveway/street) on the map?"

COPY SNIPPETS (USE OFTEN)
- Estimated pricing:
  "Pricing is ZIP-based and we provide an estimate. Final billing is confirmed after the disposal scale ticket."
- Heavy rule:
  "For heavy materials, we use 6/8/10-yard inert-only dumpsters. Flat fee—disposal included with no extra weight charges."
- Heavy warning:
  "If trash or debris is mixed with heavy materials, the load may be reclassified and different rates apply."
- General debris overage (20-50yd):
  "Your size includes X tons. Any overage is billed at $165 per ton after the scale ticket."
- General debris overage (6-10yd):
  "If you exceed the dumpster capacity, overage is $30 per additional yard."
- Permits:
  "If placed on the street, a city permit may be required. If you tell me your city, I can guide you."

DO NOT
- Do not mention internal costs, vendor payouts, or margin rules.
- Do not invent specific prices without ZIP + quote tool.
- Do not mention "tons included" for HEAVY material dumpsters.
- Do not mention "per ton overage" for 6-10 yard general debris dumpsters.
- Do not output long essays; keep it action-oriented.

QUICK REPLY SUGGESTIONS
After each response, suggest 2-3 relevant quick reply options in a JSON array at the end of your message like this:
[QUICK_REPLIES: ["Get an instant quote", "Help me choose a size"]]

START MESSAGE
"Hi! I can help you choose the right dumpster and get an instant ZIP-based estimate. What's the job site ZIP code?"
[QUICK_REPLIES: ["General debris", "Heavy materials (concrete/dirt)", "I need help choosing"]]`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  context?: {
    zip?: string;
    material?: "general" | "heavy";
    size?: number;
    projectType?: string;
  };
  capturedLead?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, capturedLead }: RequestBody = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system message
    let contextualPrompt = SYSTEM_PROMPT;
    if (context?.zip) {
      contextualPrompt += `\n\nCURRENT CONTEXT: User's ZIP is ${context.zip}.`;
    }
    if (context?.material) {
      contextualPrompt += ` Material type: ${context.material}.`;
    }
    if (context?.size) {
      contextualPrompt += ` Considering ${context.size}-yard dumpster.`;
    }
    if (capturedLead?.name) {
      contextualPrompt += `\n\nLEAD CAPTURED: Name: ${capturedLead.name}, Phone: ${capturedLead.phone || 'not provided'}, Email: ${capturedLead.email || 'not provided'}.`;
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
          { role: "system", content: contextualPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("ai-sales-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
