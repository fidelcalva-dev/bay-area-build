import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// PRICING ENGINE (server-side mirror of shared-data.ts)
// ============================================================

const ZONE_1_ZIPS = new Set([
  // Alameda
  '94501','94502','94536','94538','94539','94540','94541','94542','94543','94544','94545','94546','94550','94551','94552','94555','94557','94560','94566','94568','94577','94578','94579','94580','94586','94587','94588','94601','94602','94603','94604','94605','94606','94607','94608','94609','94610','94611','94612','94613','94614','94615','94617','94618','94619','94620','94621','94622','94623','94624','94625','94649','94659','94660','94661','94662','94666','94701','94702','94703','94704','94705','94706','94707','94708','94709','94710','94712','94720',
  // San Francisco
  '94102','94103','94104','94105','94107','94108','94109','94110','94111','94112','94114','94115','94116','94117','94118','94119','94120','94121','94122','94123','94124','94125','94126','94127','94128','94129','94130','94131','94132','94133','94134','94137','94139','94140','94141','94142','94143','94144','94145','94146','94147','94151','94158','94159','94160','94161','94163','94164','94172','94177','94188',
  // Contra Costa
  '94506','94507','94509','94517','94518','94519','94520','94521','94522','94523','94524','94525','94526','94527','94528','94529','94530','94531','94553','94556','94563','94564','94565','94569','94570','94572','94575','94582','94583','94595','94596','94597','94598','94801','94802','94803','94804','94805','94806','94807','94808','94820','94850',
  // Santa Clara
  '94022','94023','94024','94035','94039','94040','94041','94042','94043','94085','94086','94087','94088','94089','94301','94302','94303','94304','94305','94306','95002','95008','95009','95011','95013','95014','95015','95020','95021','95026','95030','95031','95032','95035','95036','95037','95038','95042','95044','95046','95050','95051','95052','95053','95054','95055','95056','95070','95071','95101','95103','95106','95108','95109','95110','95111','95112','95113','95115','95116','95117','95118','95119','95120','95121','95122','95123','95124','95125','95126','95127','95128','95129','95130','95131','95132','95133','95134','95135','95136','95138','95139','95140','95141','95148','95150','95151','95152','95153','95154','95155','95156','95157','95158','95159','95160','95161','95164','95170','95172','95173','95190','95191','95192','95193','95194','95196',
  // San Mateo
  '94002','94005','94010','94011','94014','94015','94016','94017','94018','94019','94020','94021','94025','94026','94027','94028','94030','94037','94038','94044','94060','94061','94062','94063','94064','94065','94066','94070','94074','94080','94083','94401','94402','94403','94404','94497',
]);

const ZONE_2_ZIPS = new Set([
  // Marin
  '94901','94903','94904','94912','94913','94914','94915','94920','94924','94925','94929','94930','94933','94937','94938','94939','94940','94941','94942','94945','94946','94947','94948','94949','94950','94956','94957','94960','94963','94964','94965','94966','94970','94971','94973','94974','94976','94977','94978','94979','94998','94999',
  // Sonoma
  '94922','94923','94926','94927','94928','94931','94951','94952','94953','94954','94955','94972','94975','95401','95402','95403','95404','95405','95406','95407','95409','95412','95416','95419','95421','95425','95430','95431','95433','95436','95439','95441','95442','95444','95446','95448','95450','95452','95462','95465','95471','95472','95473','95476','95486','95492','95497',
  // Napa
  '94503','94508','94515','94558','94559','94562','94567','94573','94574','94576','94581','94599',
  // Solano
  '94510','94512','94533','94534','94535','94571','94585','94589','94590','94591','94592',
]);

interface SizeInfo {
  yards: number;
  basePrice: number;
  includedTons: number;
  category: string;
}

const SIZES: SizeInfo[] = [
  { yards: 6, basePrice: 390, includedTons: 0.5, category: 'both' },
  { yards: 8, basePrice: 460, includedTons: 0.5, category: 'both' },
  { yards: 10, basePrice: 580, includedTons: 1, category: 'both' },
  { yards: 20, basePrice: 620, includedTons: 2, category: 'general' },
  { yards: 30, basePrice: 770, includedTons: 3, category: 'general' },
  { yards: 40, basePrice: 895, includedTons: 4, category: 'general' },
  { yards: 50, basePrice: 1135, includedTons: 5, category: 'general' },
];

function getZone(zip: string): { name: string; multiplier: number } | null {
  if (ZONE_1_ZIPS.has(zip)) return { name: 'Core Bay Area', multiplier: 1.0 };
  if (ZONE_2_ZIPS.has(zip)) return { name: 'Extended Bay Area', multiplier: 1.15 };
  return null;
}

function calculatePrice(zip: string, sizeYards: number, material: string): { price: number; includedTons: number; zone: string } | null {
  const zone = getZone(zip);
  if (!zone) return null;
  
  const size = SIZES.find(s => s.yards === sizeYards);
  if (!size) return null;
  
  // Validate heavy material size restriction
  if (material === 'heavy' && !['both'].includes(size.category) && size.category !== 'heavy') {
    return null;
  }
  if (material === 'heavy' && sizeYards > 10) return null;
  
  const price = Math.round(size.basePrice * zone.multiplier);
  return { price, includedTons: size.includedTons, zone: zone.name };
}

// ============================================================
// SYSTEM PROMPT
// ============================================================

const SYSTEM_PROMPT = `You are Calsan Dumpster AI, the virtual assistant for Calsan Dumpsters Pro.
You help customers rent dumpsters in the San Francisco Bay Area.

IDENTITY AND TONE:
- Professional, clear, contractor-friendly
- Never use emojis
- Always end responses with a helpful next step or question
- Keep responses concise (2-4 sentences per point)

WHAT YOU CAN ANSWER:
- Dumpster sizes: Standard general debris sizes are 6, 8, 10, 20, 30, 40, and 50 yard. Heavy material sizes are 6, 8, and 10 yard only.
- Materials: General debris (household, C&D, furniture, roofing) and Heavy/Inert (concrete, dirt, brick, asphalt, rock)
- Included tonnage: 6yd=0.5T, 8yd=0.5T, 10yd=1T, 20yd=2T, 30yd=3T, 40yd=4T, 50yd=5T
- Heavy material rules: Flat fee pricing, disposal included, no overage charges, must be clean loads, fill-line enforcement required
- General debris overage: $165 per ton beyond included amount, based on certified scale ticket
- Standard rental: 7 days included, extra days at $35/day
- Delivery windows: Morning (7-11 AM), Midday (11 AM-3 PM), Afternoon (3-6 PM) - estimated, not guaranteed
- Permits: Private property = typically no permit needed. Street placement = city permit required.
- Prohibited items: Hazardous waste, paint, chemicals, batteries, medical waste, pressurized tanks, asbestos
- Special items: Mattress ($50 CA recycling fee), Appliance with freon ($75), Tires ($25 each)
- Service area: Entire SF Bay Area including Oakland, San Jose, San Francisco, and surrounding cities
- Office hours: Monday-Sunday, 6:00 AM - 9:00 PM PT
- Phone: (510) 680-2150

WHAT YOU CANNOT DO:
- Never claim an exact price without the customer's ZIP code. If they ask for pricing, ask for their ZIP first.
- Never promise same-day delivery - say "subject to availability" and mention orders before noon have the best chance
- Never disclose yard addresses or internal operational details
- Never provide legal advice about permits - provide general guidance only
- Never answer questions outside of dumpster rental and waste disposal services
- Never use emojis

PRICING BEHAVIOR:
- When a customer provides a ZIP code AND a size/material preference, calculate the price using the pricing engine
- Always mention what is included: delivery, pickup, 7-day rental, and included tonnage
- For general debris, always mention the $165/ton overage policy
- For heavy materials, emphasize flat fee with disposal included

LEAD QUALIFICATION:
- To generate a quote, you need: ZIP code, material type, and preferred size
- When all info is gathered, present the quote clearly
- After presenting a quote, ask if they want to proceed with booking
- If the customer provides contact info (name, phone, email), capture it for lead creation

QUICK REPLIES:
- End each message with suggested quick reply buttons using this exact format: [QUICK_REPLIES: ["option1", "option2", "option3"]]
- Limit to 2-4 options that make sense for the conversation flow

CONTEXT AWARENESS:
- You will receive context about the conversation state (zip, material, size, etc.)
- Use this context to avoid re-asking questions the customer already answered
- If context includes a calculated quote, reference it in your response

OUT OF SCOPE:
If the customer asks about anything unrelated to dumpster rental, waste disposal, or Calsan services, politely redirect: "I specialize in dumpster rental services. For other questions, please call us at (510) 680-2150."`;

// ============================================================
// EDGE FUNCTION HANDLER
// ============================================================

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, conversation_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build context-aware system message
    let contextInfo = "";
    if (context?.zip) {
      const zone = getZone(context.zip);
      contextInfo += `\nCustomer ZIP: ${context.zip}`;
      if (zone) {
        contextInfo += ` (${zone.name} - within service area)`;
      } else {
        contextInfo += ` (Outside service area)`;
      }
    }
    if (context?.material) contextInfo += `\nMaterial type: ${context.material}`;
    if (context?.size) contextInfo += `\nPreferred size: ${context.size} yard`;
    if (context?.projectType) contextInfo += `\nProject type: ${context.projectType}`;

    // If we have enough info, calculate a quote
    let quoteInfo = "";
    if (context?.zip && context?.size && context?.material) {
      const result = calculatePrice(context.zip, context.size, context.material);
      if (result) {
        quoteInfo = `\n\nCALCULATED QUOTE (present this to the customer):
- Size: ${context.size} yard dumpster
- Zone: ${result.zone}
- Estimated Price: $${result.price}
- Includes: Delivery, pickup, 7-day rental, ${result.includedTons} ton${result.includedTons !== 1 ? 's' : ''} of disposal
- ${context.material === 'heavy' ? 'Flat fee pricing - disposal included, no overage charges' : `Overage: $165 per ton beyond ${result.includedTons} ton${result.includedTons !== 1 ? 's' : ''}`}
- Extra days: $35/day after 7 days`;
      } else if (context.material === 'heavy' && context.size > 10) {
        quoteInfo = `\n\nIMPORTANT: Heavy material dumpsters are only available in 6, 8, and 10 yard sizes. The customer requested ${context.size} yard. Suggest an appropriate size.`;
      }
    }

    const fullSystemPrompt = SYSTEM_PROMPT + (contextInfo ? `\n\nCURRENT CONTEXT:${contextInfo}` : '') + quoteInfo;

    // Determine next action based on context
    let nextAction = "CHAT";
    if (!context?.zip) nextAction = "ASK_ZIP";
    else if (!context?.material) nextAction = "ASK_MATERIAL";
    else if (!context?.size) nextAction = "ASK_SIZE";
    else if (context?.zip && context?.material && context?.size) nextAction = "GENERATE_QUOTE";

    // Call AI gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save the user message to DB if we have a conversation_id
    if (conversation_id && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'user') {
        await supabase.from('chat_messages').insert({
          conversation_id,
          role: 'user',
          content: lastMsg.content,
          next_action: nextAction,
        }).select().maybeSingle();
      }
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("calsan-dumpster-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
