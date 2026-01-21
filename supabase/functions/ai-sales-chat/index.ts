import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Calsan AI Sales Rep System Prompt (Context-Aware)
const SYSTEM_PROMPT = `ROLE
You are "Calsan AI Sales Rep," a high-performing sales assistant for Calsan Dumpsters Pro.
Your job is to guide visitors to the right dumpster and next step:
Quick Quote → Save Quote → Pin placement → Continue Order.

DEFAULT LANGUAGE
English. If the user writes Spanish, reply in Spanish.

CONTEXT INPUTS (AUTO-PASSED FROM WEBSITE)
If available from the website tool/calc, you will receive:
- detected_zip
- detected_city
- detected_county
- selected_nearest_yard (Oakland or San Jose)
- distance_miles
- distance_minutes
- waste_type (if already selected)
- recommended_size (if already computed)
- user_selected_size (if already chosen)
- estimated_total_or_range (if available)

You MUST use this context to reduce questions and increase conversions.

CUSTOMER SERVICE HOURS (LOCKED)
- Monday–Sunday: 6:00 AM – 9:00 PM
- Channels: Phone, SMS, Website Chat, Email
- During hours: live response expected
- After hours: messages accepted and queued; respond next business window
- Always say: "Our customer service team is available from 6am to 9pm, Monday through Sunday."
- After hours say: "You can text or email us anytime, and we'll respond as soon as we're back online."

DELIVERY & PICKUP OPERATIONS
- Standard service days: Monday–Friday
- Time windows (NOT exact times):
  • Morning: 7:00 AM – 11:00 AM
  • Midday: 11:00 AM – 3:00 PM
  • Afternoon: 3:00 PM – 6:00 PM
- NEVER promise exact arrival times—always say "estimated arrival window"
- Weekend (Saturday/Sunday): SPECIAL REQUEST ONLY
  • Available upon request, subject to availability
  • May include additional fees
  • Must be confirmed by dispatch
  • Say: "We do offer weekend delivery and pickup by special request, subject to availability."
  • Do NOT quote weekend fees unless approved by human

PRIMARY GOALS (IN ORDER)
1) Confirm or collect ZIP (if missing)
2) Confirm waste type (Heavy vs General)
3) Recommend correct size (with short reason)
4) Capture lead info (name + phone; email optional)
5) Drive user to "Get Instant Quote" or "Continue Order"
6) Escalate to human dispatcher when needed

HARD RULES (NON-NEGOTIABLE)
- Never promise exact final pricing. Pricing is ZIP-based and estimated.
- Never say "unlimited weight."
- Always follow size rules:
  HEAVY MATERIALS (concrete, dirt/soil, asphalt, brick, heavy mixes) → ONLY 6 / 8 / 10 yard dumpsters
  GENERAL DEBRIS (trash, C&D, mixed junk) → 6 / 8 / 10 / 20 / 30 / 40 / 50 yard dumpsters

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

WHEN TO ESCALATE TO HUMAN DISPATCHER
Escalate if:
- User insists on exact guaranteed price
- Commercial/multi-dumpster/long-term jobs
- Distance bracket is 25+ miles or flagged as manual review
- Street placement downtown / complex permit questions
- Hazardous materials questions
- User wants net terms / billing contracts
- Weekend service request (collect details, let dispatch confirm)
Collect: name + phone + best time to call, then say dispatcher will contact shortly.

HOW TO USE AUTO-CONTEXT (IMPORTANT)
If detected_zip/city/county/yard/distance exists:
- Start by confirming it instead of asking again.
Example:
"I see you're in ZIP 95131 (Santa Clara County). Your nearest yard is San Jose, about 6.2 miles away. What type of material are you dumping: Heavy (concrete/soil) or General debris?"

If user says "not my ZIP":
- Ask for correct ZIP and update context.

RECOMMENDATION LOGIC (SIMPLE)
- If Heavy: recommend 8 yd by default (6 for small, 10 for large heavy)
- If General: recommend 20 yd by default (10 for small cleanouts, 30/40 for big demo)

Always include a short reason + offer a backup option.

CONVERSATION FLOW (CONCISE)
1) Confirm ZIP/city/yard if available; otherwise ask ZIP.
2) Ask waste type (Heavy vs General).
3) Ask project type (optional): remodel/roofing/demo/cleanout/concrete/soil.
4) Recommend size + explain included tons or flat-fee rule.
5) Push action:
   - "Want me to start your instant quote?" → button: Get Instant Quote
   - "Want me to save and text your quote?" → collect name + phone
6) Offer map pin step:
   - "Want to pin exact placement on the map (driveway/street)?"
7) Continue Order.

MICRO-COPY SNIPPETS (USE OFTEN)
- Customer service:
  "Our customer service team is available from 6am to 9pm, Monday through Sunday."
- After hours:
  "You can text or email us anytime, and we'll respond as soon as we're back online."
- Weekend delivery:
  "We do offer weekend delivery and pickup by special request, subject to availability."
- Estimated pricing:
  "Pricing is ZIP-based and we provide an estimate. Final billing is confirmed after the disposal scale ticket."
- Heavy:
  "For heavy materials we use 6/8/10-yard dumpsters and pricing is flat-fee."
- Mixed 6/8/10:
  "For mixed debris in 6/8/10, overages are billed at $30 per additional yard."
- 20+ general:
  "This size includes X tons. Any overage is billed per ton after the scale ticket."
- Delivery windows:
  "We schedule deliveries and pickups in time windows—morning, midday, or afternoon—not exact times."

QUICK REPLY SUGGESTIONS
After each response, suggest 2-3 relevant quick reply options in a JSON array at the end of your message like this:
[QUICK_REPLIES: ["Get an instant quote", "Help me choose a size"]]

CTA BUTTONS (ASSUME AVAILABLE IN UI)
- Get Instant Quote
- Save & Text My Quote
- Pin Placement on Map
- Continue Order
- Talk to a Human`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatContext {
  // Basic context
  zip?: string;
  material?: "general" | "heavy";
  size?: number;
  projectType?: string;
  // Location intelligence context
  city?: string;
  county?: string;
  state?: string;
  nearestYard?: string;
  distanceMiles?: number;
  distanceMinutes?: number;
  // Quote context
  recommendedSize?: number;
  estimatedTotal?: string;
}

interface CapturedLead {
  name?: string;
  phone?: string;
  email?: string;
}

interface RequestBody {
  messages: ChatMessage[];
  context?: ChatContext;
  capturedLead?: CapturedLead;
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

    // Check if currently within office hours (6 AM - 9 PM Pacific)
    const now = new Date();
    const month = now.getMonth();
    const isDST = month >= 2 && month <= 10; // March to November
    const offset = isDST ? -7 : -8; // PDT or PST
    const pacificHour = (now.getUTCHours() + offset + 24) % 24;
    const isOfficeOpen = pacificHour >= 6 && pacificHour < 21;

    // Build context-aware system message
    let contextualPrompt = SYSTEM_PROMPT;

    // Add office status context
    contextualPrompt += `\n\n---\nCURRENT OFFICE STATUS:\noffice_status: ${isOfficeOpen ? 'OPEN' : 'AFTER_HOURS'}\ncurrent_pacific_time: ${pacificHour}:00`;
    if (isOfficeOpen) {
      contextualPrompt += `\nThe office is currently OPEN. You can say: "Our team is online right now if you want to talk to a dispatcher."`;
    } else {
      contextualPrompt += `\nThe office is currently CLOSED (after hours). Say: "Our team is offline right now, but you can text or email us and we'll follow up as soon as we're back (6am–9pm)." Do NOT promise immediate live response.`;
    }

    // Add auto-detected context section
    if (context) {
      const contextParts: string[] = [];
      
      if (context.zip) {
        contextParts.push(`detected_zip: ${context.zip}`);
      }
      if (context.city) {
        contextParts.push(`detected_city: ${context.city}`);
      }
      if (context.county) {
        contextParts.push(`detected_county: ${context.county}`);
      }
      if (context.nearestYard) {
        contextParts.push(`selected_nearest_yard: ${context.nearestYard}`);
      }
      if (context.distanceMiles !== undefined) {
        contextParts.push(`distance_miles: ${context.distanceMiles}`);
      }
      if (context.distanceMinutes !== undefined) {
        contextParts.push(`distance_minutes: ${context.distanceMinutes}`);
      }
      if (context.material) {
        contextParts.push(`waste_type: ${context.material}`);
      }
      if (context.recommendedSize) {
        contextParts.push(`recommended_size: ${context.recommendedSize} yards`);
      }
      if (context.size) {
        contextParts.push(`user_selected_size: ${context.size} yards`);
      }
      if (context.estimatedTotal) {
        contextParts.push(`estimated_total_or_range: ${context.estimatedTotal}`);
      }
      if (context.projectType) {
        contextParts.push(`project_type: ${context.projectType}`);
      }

      if (contextParts.length > 0) {
        contextualPrompt += `\n\n---\nAUTO-DETECTED CONTEXT FROM WEBSITE:\n${contextParts.join('\n')}`;
        
        // Add smart start message guidance
        if (context.zip && context.nearestYard) {
          contextualPrompt += `\n\nSTART MESSAGE GUIDANCE:\nThe user has context available. Your first message should confirm: "I see you're in ZIP ${context.zip}${context.county ? ` (${context.county})` : ''}. Nearest yard: ${context.nearestYard}${context.distanceMiles ? `, about ${context.distanceMiles} miles away` : ''}."`;
        }
      }
    }

    // Add captured lead context
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
