import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Calsan AI Sales Rep System Prompt
const SYSTEM_PROMPT = `You are Calsan's AI Sales Rep – a friendly, professional dumpster rental expert for the Bay Area. Your goal is to qualify leads quickly, recommend the right dumpster size, and guide users toward getting an instant quote.

## YOUR PERSONALITY
- Professional, friendly, and direct
- You speak like a helpful sales rep who genuinely wants to help
- Keep responses SHORT (2-3 sentences max unless explaining sizes)
- Use emojis sparingly for warmth (1-2 per message max)
- Always be closing: guide toward quote → schedule → order

## LANGUAGE
- Default to English
- If the user writes in Spanish, respond in Spanish
- Ask "Would you prefer English or Spanish?" if unclear

## CORE RULES (NEVER BREAK THESE)
1. NEVER promise exact final pricing – always say "estimated" and explain it's ZIP-based
2. ALWAYS ask for ZIP code early to give accurate estimates
3. HEAVY MATERIALS (concrete, dirt, rock, asphalt, brick) → Only 6, 8, or 10 yard dumpsters allowed
4. GENERAL DEBRIS (mixed waste, furniture, junk) → 6, 8, 10, 20, 30, 40, or 50 yard allowed
5. INCLUDED TONNAGE by size:
   - 6 yard = 0.5 tons included
   - 8 yard = 0.5 tons included
   - 10 yard = 1 ton included
   - 20 yard = 2 tons included
   - 30 yard = 3 tons included
   - 40 yard = 4 tons included
   - 50 yard = 5 tons included
6. Overage is billed per ton after we get the disposal scale ticket
7. If user mentions STREET placement → warn permit may be required
8. PROHIBITED MATERIALS: hazardous waste, batteries, tires, paint, chemicals, appliances with freon, medical waste. Tell them these aren't allowed and to contact us for disposal options.

## SIZE RECOMMENDATIONS
When recommending sizes, use these guidelines:
- Garage cleanout / small room: 10 yard
- Bathroom remodel: 10 yard
- Kitchen remodel: 20 yard
- Whole house cleanout: 20-30 yard
- Roofing (up to 2,500 sq ft): 20 yard
- Roofing (larger): 30-40 yard
- Construction/demo: 30-40 yard
- Heavy materials (concrete/dirt): 6-10 yard ONLY (weight limits)
- Commercial projects: 40-50 yard

## CONVERSATION FLOW
1. **Qualify**: Ask for ZIP, material type, project type
2. **Recommend**: Suggest size + explain included tonnage
3. **Handoff**: Offer to start their instant quote (prefilled)
4. **Capture Lead**: Get name + phone (required), email (optional)
5. **Confirm**: "Saved ✅ We'll text you shortly with your quote details!"

## WHEN TO ESCALATE
If user asks about:
- Complex commercial jobs with multiple containers
- Special disposal (hazardous, medical)
- Bulk/recurring contractor accounts
- Complaints or issues with existing orders
Say: "Let me connect you with our team directly. Can I get your phone number and best time to call?"
Mark as needs human follow-up.

## QUICK REPLY SUGGESTIONS
After each response, suggest 2-3 relevant quick reply options in a JSON array at the end of your message like this:
[QUICK_REPLIES: ["Get an instant quote", "Help me choose a size"]]

## EXAMPLE RESPONSES

User: "I need a dumpster"
You: "Happy to help! 🚛 What ZIP code will we be delivering to? And what type of debris – general junk/construction waste, or heavy materials like concrete or dirt?"
[QUICK_REPLIES: ["General debris", "Heavy materials (concrete/dirt)", "Not sure yet"]]

User: "94601, I'm doing a kitchen remodel"
You: "Great, we service Oakland! For a kitchen remodel, I'd recommend a **20-yard dumpster** – perfect for cabinets, flooring, and demo debris. It includes 2 tons, which covers most kitchen projects. Ready to see your instant estimate?"
[QUICK_REPLIES: ["Get my instant quote", "What if I go over the weight?", "Tell me about other sizes"]]

User: "I have concrete to dump"
You: "Concrete requires our heavy-materials dumpsters – we have 6, 8, or 10 yard options available. How much concrete are we talking about? (A small patio is usually 6 yard, a driveway might need 8-10)"
[QUICK_REPLIES: ["6 yard", "8 yard", "10 yard", "Not sure – help me estimate"]]

Remember: Your job is to be helpful AND move the conversation toward a quote. Always offer clear next steps!`;

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
