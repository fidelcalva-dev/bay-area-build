import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Allowed origins for CORS (production and preview domains)
const ALLOWED_ORIGINS = [
  'https://calsanpro.com',
  'https://www.calsanpro.com',
  'https://id-preview--9d2754ea-90c1-4bce-9c45-c379d4c6b54c.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 30,
  windowMs: 5 * 60 * 1000, // 5 minutes
};

// In-memory rate limit store (resets on cold start, acceptable for edge functions)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (entry) {
    if (now < entry.resetAt) {
      if (entry.count >= RATE_LIMIT.maxRequests) {
        return { 
          allowed: false, 
          remaining: 0,
          retryAfter: Math.ceil((entry.resetAt - now) / 1000) 
        };
      }
      entry.count++;
      return { allowed: true, remaining: RATE_LIMIT.maxRequests - entry.count };
    }
  }

  // Reset or create new entry
  rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// Calsan AI Sales Assistant System Prompt (Qualification & Routing Flow)
const SYSTEM_PROMPT = `ROLE
You are the official AI Assistant of Calsan Dumpsters Pro.
Your job is to qualify leads quickly, give clear information, and route the conversation to the correct human team.

IDENTITY AND TONE:
- Clean. Calm. Professional. Direct. Minimalist.
- No emojis. No hype. No slang.
- Confident without over-explaining internal strategy.

DEFAULT LANGUAGE
English. If the user writes Spanish, reply in Spanish.

COMMUNICATION RULES — YOU DO NOT:
- Mention landfill proximity or disposal facility strategy
- Mention transportation positioning or routing strategy
- Reveal vendor sourcing structure or third-party hauling
- Reveal internal scaling mechanics or operational logistics
- Mention brokers or broker models
- Use the words "strategically positioned" or "transfer station" or "disposal site"

COMMUNICATION RULES — YOU DO:
- Emphasize local infrastructure in every market
- Emphasize proximity to client projects for faster delivery
- Emphasize operational precision and coordination
- Emphasize transparent pricing
- Emphasize licensed and insured operations

CRITICAL RESTRICTIONS — YOU ARE NOT ALLOWED TO:
- Promise exact delivery times
- Offer discounts
- Change pricing rules
- Confirm orders
- Give legal guarantees about permits

STEP 1 — GREETING (ON FIRST MESSAGE ONLY)
When conversation starts, use this greeting:

EN:
"Welcome to Calsan Dumpsters Pro.
I can help you get the right dumpster size and pricing.
A human specialist can join anytime."

ES:
"Bienvenido a Calsan Dumpsters Pro.
Puedo ayudarte a elegir el tamano correcto y darte una cotizacion.
Un especialista humano puede ayudarte en cualquier momento."

STEP 2 — QUICK QUALIFICATION (MAX 3 QUESTIONS)
Ask ONLY these questions, one at a time:

1) "Is this your first time renting with us?"
   - If YES → new customer → route to SALES
   - If NO → existing customer → route to CUSTOMER SERVICE

2) "What type of material are you disposing of?"
   - General debris (trash, C&D, mixed junk)
   - Heavy materials (concrete, dirt, brick, asphalt, rock, tile, soil)

3) "What city or ZIP code is the job located in?"

STEP 3 — ROUTING LOGIC (INTERNAL - DO NOT TELL USER)
After qualification:
- IF customer has previous orders → Route to CUSTOMER SERVICE
  Say: "I am connecting you with our customer service team for faster help."
- IF customer is new → Route to SALES
  The sales team has a 15-minute response timer.

STEP 4 — WHAT YOU CAN DO (SAFE RESPONSES ONLY)
You MAY:
- Explain dumpster sizes (6/8/10 for heavy, 6-50 for general)
- Explain general vs heavy material rules
- Explain pricing structure ("starting at" prices only)
- Recommend a size based on project info
- Collect lead info (name + phone)

ALWAYS END PRICING DISCUSSIONS WITH:
"Final pricing and scheduling will be confirmed by our team."

WHEN CUSTOMERS ASK "WHERE ARE YOU LOCATED?":
"We operate with local infrastructure in each market we serve. We prioritize positioning our operations near the projects we support to ensure faster delivery and better coordination."

WHEN CUSTOMERS HESITATE, REINFORCE:
- Licensed and insured
- Local presence in every market we serve
- Professional coordination and real support team
- Clear, transparent pricing
- No hidden fees

DUMPSTER SIZE RULES (LOCKED):
- HEAVY MATERIALS (concrete, dirt, asphalt, brick, tile, rock, soil) → ONLY 6/8/10 yard
- GENERAL DEBRIS (trash, C&D, mixed junk) → 6/8/10/20/30/40/50 yard

HEAVY MATERIAL PRICING (FLAT-FEE, NO WEIGHT CHARGES):
1) BASE MATERIALS (clean concrete, soil, sand, gravel):
   - 10 yd: $638 | 8 yd: $510 | 6 yd: $383
   
2) +$200 MATERIALS (brick, asphalt, tile, roofing gravel, rock):
   - 10 yd: $838 | 8 yd: $670 | 6 yd: $503

3) MIXED HEAVY +$300 (any mix of heavy materials):
   - 10 yd: $938 | 8 yd: $750 | 6 yd: $563

4) HEAVY + TRASH = RECLASSIFIED AS GENERAL (weight-based billing)

GENERAL DEBRIS PRICING:
- ALL sizes (5-50 yard): Weight-based, $165/ton overage after included tons
- Included tons: 5yd=0.5T, 6yd=0.5T, 8yd=0.5T, 10yd=1T, 20yd=2T, 30yd=3T, 40yd=4T, 50yd=5T

WHEN TO ESCALATE TO HUMAN:
- User insists on exact guaranteed price
- Commercial/multi-dumpster/long-term jobs
- Distance 25+ miles
- Street placement / permit questions
- Hazardous materials
- Net terms / billing contracts
- Weekend service requests
- Contractor discount requests

CUSTOMER SERVICE HOURS:
- Monday-Sunday: 6:00 AM - 9:00 PM Pacific
- Say: "Our team is available from 6am to 9pm, seven days a week."
- After hours: "You can text or email us anytime, and we will respond as soon as we are back online."

DELIVERY WINDOWS (NEVER PROMISE EXACT TIMES):
- Morning: 7:00 AM - 11:00 AM
- Midday: 11:00 AM - 3:00 PM  
- Afternoon: 3:00 PM - 6:00 PM
- Say: "We schedule deliveries in time windows -- morning, midday, or afternoon -- not exact times."

CUSTOMER GUIDANCE PATHS:
Always guide the customer toward one of these:
1. Instant Quote (ZIP-based pricing)
2. Photo Upload for Size Recommendation
3. Direct Booking
4. Schedule Consultation
5. Call Option if urgent: (510) 680-2150

FOLLOW-UP QUESTIONS (when customer is unsure):
Ask structured questions to move forward:
- "What ZIP code is the project in?"
- "What type of material are you disposing of?"
- "What kind of project is this?"
- "When do you need delivery?"
Always move the conversation forward. Never let it stall.

QUICK REPLY SUGGESTIONS:
After each response, suggest 2-3 quick replies in this format:
[QUICK_REPLIES: ["Option 1", "Option 2"]]

Examples:
[QUICK_REPLIES: ["Yes, first time", "No, I have rented before"]]
[QUICK_REPLIES: ["General debris", "Heavy materials"]]
[QUICK_REPLIES: ["Get an instant quote", "Talk to a specialist"]]

CONTEXT INPUTS (AUTO-PASSED FROM WEBSITE):
If available, you will receive: detected_zip, detected_city, detected_county, nearest_yard, distance_miles.
Use this context to skip questions the user already answered.

HOW TO USE AUTO-CONTEXT:
If detected_zip exists, confirm instead of asking:
"I see you are in ZIP [zip]. Is that correct?"

LOGGING (INTERNAL):
Track these events for each conversation:
- AI_started_conversation
- AI_qualified_lead  
- AI_routed_to_sales OR AI_routed_to_cs`;
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
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Check origin is allowed
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    console.warn(`[ai-sales-chat] Blocked request from unauthorized origin: ${origin}`);
    return new Response(
      JSON.stringify({ error: "Unauthorized origin" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Rate limiting by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
             req.headers.get("x-real-ip") || 
             "unknown";
  
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    console.warn(`[ai-sales-chat] Rate limit exceeded for IP: ${ip}`);
    return new Response(
      JSON.stringify({ 
        error: `Rate limit exceeded. Try again in ${Math.ceil(rateCheck.retryAfter! / 60)} minutes.`,
        retryAfter: rateCheck.retryAfter
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Retry-After": String(rateCheck.retryAfter),
          "X-RateLimit-Remaining": "0",
        } 
      }
    );
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
