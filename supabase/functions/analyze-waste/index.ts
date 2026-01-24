import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// ============================================================
// WASTE VISION AI - Image Analysis Edge Function
// Analyzes debris/waste photos for material detection, hazard
// flagging, volume/weight estimation, and dumpster recommendations
// ============================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================
// MATERIAL TAXONOMY (CANON)
// ============================================================

const MATERIAL_TAXONOMY = [
  { id: "mixed_cd", label: "Mixed C&D", labelEs: "C&D Mixto", category: "mixed" },
  { id: "lumber_wood", label: "Lumber/Wood", labelEs: "Madera", category: "mixed" },
  { id: "drywall", label: "Drywall/Plaster", labelEs: "Panel de Yeso", category: "mixed" },
  { id: "roofing", label: "Roofing Shingles", labelEs: "Tejas", category: "heavy" },
  { id: "concrete", label: "Concrete", labelEs: "Concreto", category: "heavy" },
  { id: "dirt_soil", label: "Dirt/Soil", labelEs: "Tierra", category: "heavy" },
  { id: "brick_tile", label: "Brick/Tile", labelEs: "Ladrillo/Azulejo", category: "heavy" },
  { id: "asphalt", label: "Asphalt", labelEs: "Asfalto", category: "heavy" },
  { id: "metal", label: "Metal", labelEs: "Metal", category: "mixed" },
  { id: "green_waste", label: "Green Waste", labelEs: "Residuos Verdes", category: "mixed" },
  { id: "plastic", label: "Construction Plastic", labelEs: "Plástico", category: "mixed" },
  { id: "appliances", label: "Appliances/Bulky", labelEs: "Electrodomésticos", category: "mixed" },
  { id: "furniture", label: "Furniture", labelEs: "Muebles", category: "mixed" },
  { id: "unknown", label: "Unknown/Other", labelEs: "Desconocido", category: "mixed" },
];

const HAZARD_TAXONOMY = [
  { id: "paint_chemicals", label: "Paint/Solvents/Chemicals", severity: "high" },
  { id: "asbestos_possible", label: "Possible Asbestos-like Material", severity: "critical" },
  { id: "batteries", label: "Batteries", severity: "medium" },
  { id: "medical_waste", label: "Medical Waste", severity: "critical" },
  { id: "pressurized_tanks", label: "Pressurized Tanks (Propane/CO2)", severity: "high" },
  { id: "fuel_containers", label: "Fuel Containers", severity: "high" },
  { id: "ewaste", label: "E-Waste/Electronics", severity: "medium" },
  { id: "tires", label: "Tires", severity: "low" },
  { id: "appliance_freon", label: "Appliance with Freon", severity: "medium" },
];

// Density ranges (tons per cubic yard) for weight estimation
const DENSITY_RANGES: Record<string, { low: number; high: number }> = {
  mixed_cd: { low: 0.15, high: 0.35 },
  lumber_wood: { low: 0.10, high: 0.25 },
  drywall: { low: 0.25, high: 0.50 },
  roofing: { low: 0.35, high: 0.60 },
  concrete: { low: 1.2, high: 1.6 },
  dirt_soil: { low: 1.0, high: 1.5 },
  brick_tile: { low: 1.0, high: 1.4 },
  asphalt: { low: 1.1, high: 1.5 },
  metal: { low: 0.50, high: 1.50 },
  green_waste: { low: 0.10, high: 0.30 },
  plastic: { low: 0.05, high: 0.15 },
  appliances: { low: 0.20, high: 0.40 },
  furniture: { low: 0.10, high: 0.25 },
  unknown: { low: 0.15, high: 0.40 },
};

// Dumpster sizes
const HEAVY_SIZES = [6, 8, 10];
const GENERAL_SIZES = [6, 8, 10, 20, 30, 40, 50];
const SIZE_CAPACITIES: Record<number, number> = {
  6: 6, 8: 8, 10: 10, 20: 20, 30: 30, 40: 40, 50: 50,
};

// ============================================================
// SYSTEM PROMPT FOR VISION AI
// ============================================================

const VISION_SYSTEM_PROMPT = `You are a waste/debris analysis AI for Calsan Dumpsters Pro, a dumpster rental company.

TASK: Analyze the provided images of debris/waste and return structured JSON with your analysis.

MATERIAL CATEGORIES TO DETECT (return confidence 0-1 for each detected):
${MATERIAL_TAXONOMY.map(m => `- ${m.id}: ${m.label}`).join('\n')}

HAZARDS TO FLAG (return confidence 0-1, NEVER claim certainty, always say "potential" or "possible"):
${HAZARD_TAXONOMY.map(h => `- ${h.id}: ${h.label} (severity: ${h.severity})`).join('\n')}

VOLUME ESTIMATION GUIDELINES:
- Use reference objects if mentioned (pickup truck bed ≈ 2 cubic yards, standard door ≈ 7ft tall, person ≈ 5.5ft tall, 5-gallon bucket ≈ 0.02 cubic yards)
- Estimate pile/bulk volume as a range in cubic yards
- Consider pile density and air gaps

WEIGHT ESTIMATION (use these density ranges in tons/cubic yard):
${Object.entries(DENSITY_RANGES).map(([k, v]) => `- ${k}: ${v.low}-${v.high} tons/cy`).join('\n')}

DUMPSTER SIZE RULES (LOCKED - NEVER DEVIATE):
- HEAVY MATERIALS (concrete, dirt, asphalt, brick, tile, rock, soil, roofing): ONLY 6, 8, or 10 yard containers allowed
- GENERAL/MIXED DEBRIS: 6, 8, 10, 20, 30, 40, or 50 yard containers

RECOMMENDATION LOGIC:
1. If dominant materials are heavy (>60% by estimated volume) → recommend heavy flow, sizes 6/8/10 only
2. If heavy materials mixed with trash → recommend "mixed" flow, any size based on volume
3. If hazards detected with confidence >= 0.6 → flag "hazard_review_required"
4. Green Halo eligible if: clean concrete, clean wood, clean roofing, green waste, clean C&D

SAFETY RULES (CRITICAL):
- NEVER claim certainty about hazardous materials
- For asbestos-like materials, say "possible" or "potential" only
- For any hazard, recommend user contact Customer Service
- Never provide disposal instructions for hazardous items

OUTPUT FORMAT (strict JSON):
{
  "materials": [{"id": "concrete", "label": "Concrete", "confidence": 0.92, "estimated_volume_pct": 60}],
  "hazards": [{"id": "paint_chemicals", "label": "Paint/Solvents", "confidence": 0.75, "note": "Potential paint cans visible"}],
  "volume_cy": {"low": 3, "high": 5},
  "weight_tons": {"low": 2.5, "high": 4.2},
  "pickup_loads": {"low": 2, "high": 3},
  "recommended_flow": {
    "waste_type": "heavy",
    "recommended_size": 10,
    "alternate_sizes": [8],
    "fit_confidence": "safe",
    "notes": ["Clean concrete appears to be dominant material", "No trash visible - qualifies for flat-fee heavy pricing"]
  },
  "green_halo": {
    "eligible": true,
    "note": "Concrete can be recycled as aggregate"
  },
  "hazard_review_required": false,
  "overall_confidence": "high",
  "disclaimers": [
    "Estimates vary by actual loading and moisture content",
    "Final billing based on disposal scale ticket"
  ]
}`;

interface AnalysisRequest {
  images: string[]; // Base64 encoded images
  referenceObject?: "pickup" | "door" | "person" | "bucket" | "none";
  sessionId?: string;
  quoteId?: string;
}

interface MaterialDetection {
  id: string;
  label: string;
  confidence: number;
  estimated_volume_pct?: number;
}

interface HazardDetection {
  id: string;
  label: string;
  confidence: number;
  note?: string;
}

interface AnalysisResult {
  materials: MaterialDetection[];
  hazards: HazardDetection[];
  volume_cy: { low: number; high: number };
  weight_tons: { low: number; high: number };
  pickup_loads: { low: number; high: number };
  recommended_flow: {
    waste_type: "heavy" | "mixed";
    recommended_size: number;
    alternate_sizes: number[];
    fit_confidence: "safe" | "tight" | "risk" | "overflow";
    notes: string[];
  };
  green_halo: {
    eligible: boolean;
    note?: string;
  };
  hazard_review_required: boolean;
  overall_confidence: "high" | "medium" | "low";
  disclaimers: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: AnalysisRequest = await req.json();
    const { images, referenceObject, sessionId, quoteId } = body;

    if (!images || images.length === 0) {
      return new Response(
        JSON.stringify({ error: "No images provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (images.length > 8) {
      return new Response(
        JSON.stringify({ error: "Maximum 8 images allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[analyze-waste] Processing ${images.length} images, reference: ${referenceObject || 'none'}`);

    // Build user message with reference context
    let userPrompt = "Analyze the debris/waste in these images and provide structured JSON output.";
    if (referenceObject && referenceObject !== "none") {
      const referenceDescriptions: Record<string, string> = {
        pickup: "A pickup truck bed is visible for scale reference (≈2 cubic yards capacity)",
        door: "A standard door is visible for scale reference (≈7 feet tall, 3 feet wide)",
        person: "A person is visible for scale reference (average height ≈5.5 feet)",
        bucket: "A 5-gallon bucket is visible for scale reference (≈0.02 cubic yards)",
      };
      userPrompt += ` ${referenceDescriptions[referenceObject]}`;
    }

    // Build content array with images
    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: userPrompt },
    ];

    for (const image of images) {
      // Handle both base64 and URL formats
      const imageUrl = image.startsWith("data:") 
        ? image 
        : image.startsWith("http") 
          ? image 
          : `data:image/jpeg;base64,${image}`;
      
      content.push({
        type: "image_url",
        image_url: { url: imageUrl },
      });
    }

    // Call Lovable AI with vision model
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro", // Vision-capable model
        messages: [
          { role: "system", content: VISION_SYSTEM_PROMPT },
          { role: "user", content },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[analyze-waste] AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const responseContent = aiResult.choices?.[0]?.message?.content;

    if (!responseContent) {
      throw new Error("No response from AI model");
    }

    // Parse the JSON response
    let analysis: AnalysisResult;
    try {
      analysis = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("[analyze-waste] Failed to parse AI response:", responseContent);
      throw new Error("Failed to parse AI analysis result");
    }

    console.log("[analyze-waste] Analysis complete:", {
      materials: analysis.materials?.length,
      hazards: analysis.hazards?.length,
      recommendedSize: analysis.recommended_flow?.recommended_size,
      hazardReview: analysis.hazard_review_required,
    });

    // Save to database if Supabase is configured
    let analysisId: string | null = null;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const insertData = {
          session_id: sessionId,
          quote_id: quoteId || null,
          image_count: images.length,
          input_type: "photo",
          reference_object: referenceObject || "none",
          materials_detected: analysis.materials,
          hazards_detected: analysis.hazards,
          volume_cy_low: analysis.volume_cy?.low,
          volume_cy_high: analysis.volume_cy?.high,
          weight_tons_low: analysis.weight_tons?.low,
          weight_tons_high: analysis.weight_tons?.high,
          pickup_loads_low: analysis.pickup_loads?.low,
          pickup_loads_high: analysis.pickup_loads?.high,
          recommended_waste_type: analysis.recommended_flow?.waste_type,
          recommended_size: analysis.recommended_flow?.recommended_size,
          alternate_sizes: analysis.recommended_flow?.alternate_sizes,
          fit_confidence: analysis.recommended_flow?.fit_confidence,
          recommendation_notes: analysis.recommended_flow?.notes,
          green_halo_eligible: analysis.green_halo?.eligible,
          green_halo_note: analysis.green_halo?.note,
          hazard_review_required: analysis.hazard_review_required,
          hazard_review_status: analysis.hazard_review_required ? "pending" : "none",
          overall_confidence: analysis.overall_confidence,
          raw_ai_response: aiResult,
        };

        const { data, error } = await supabase
          .from("waste_vision_analyses")
          .insert(insertData)
          .select("id")
          .single();

        if (error) {
          console.error("[analyze-waste] Database insert error:", error);
        } else {
          analysisId = data.id;
          console.log("[analyze-waste] Saved analysis:", analysisId);
        }
      } catch (dbError) {
        console.error("[analyze-waste] Database error:", dbError);
        // Continue without saving - analysis still valid
      }
    }

    // Return the analysis with ID
    return new Response(
      JSON.stringify({
        success: true,
        analysisId,
        ...analysis,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[analyze-waste] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Analysis failed",
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});