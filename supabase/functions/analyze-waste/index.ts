import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// ============================================================
// WASTE VISION AI - Image Analysis Edge Function
// Analyzes debris/waste photos for material detection, hazard
// flagging, volume/weight estimation, and dumpster recommendations
// Supports DRY_RUN mode for testing
// ============================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

const HEAVY_SIZES = [6, 8, 10];
const GENERAL_SIZES = [6, 8, 10, 20, 30, 40, 50];

// ============================================================
// DRY_RUN SAMPLE RESULT
// ============================================================
const DRY_RUN_RESULT = {
  ok: true,
  success: true,
  detected_materials: ["lumber_wood", "drywall", "mixed_cd"],
  heavy_flag: false,
  recommended_size: 20,
  confidence: 0.82,
  notes: "DRY_RUN: Sample result. Mixed C&D debris with lumber and drywall. 20-yard recommended.",
  materials: [
    { id: "lumber_wood", label: "Lumber/Wood", confidence: 0.88, estimated_volume_pct: 40 },
    { id: "drywall", label: "Drywall/Plaster", confidence: 0.75, estimated_volume_pct: 30 },
    { id: "mixed_cd", label: "Mixed C&D", confidence: 0.70, estimated_volume_pct: 30 },
  ],
  hazards: [],
  volume_cy: { low: 8, high: 14 },
  weight_tons: { low: 1.5, high: 3.0 },
  pickup_loads: { low: 4, high: 7 },
  recommended_flow: {
    waste_type: "mixed" as const,
    recommended_size: 20,
    alternate_sizes: [30],
    fit_confidence: "safe" as const,
    notes: ["DRY_RUN mode - deterministic sample result"],
  },
  green_halo: { eligible: false, note: "Mixed materials" },
  hazard_review_required: false,
  overall_confidence: "high" as const,
  disclaimers: ["DRY_RUN mode - not a real analysis"],
  // Legacy compat fields
  recommendation: {
    recommendedSize: 20,
    materialCategory: "general",
    confidence: 0.82,
    explanation: "DRY_RUN: Estimated 8-14 cubic yards of mixed C&D debris.",
  },
  analysis: {
    materials: [
      { name: "Lumber/Wood", percentage: 40 },
      { name: "Drywall", percentage: 30 },
      { name: "Mixed C&D", percentage: 30 },
    ],
  },
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
  images: string[];
  referenceObject?: "pickup" | "door" | "person" | "bucket" | "none";
  sessionId?: string;
  quoteId?: string;
  zip?: string;
  address?: string;
  customer_type?: string;
  lead_id?: string;
  image_storage_path?: string;
  video_storage_path?: string;
  media_type?: "PHOTO" | "VIDEO";
  mode?: "LIVE" | "DRY_RUN";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let supabase: ReturnType<typeof createClient> | null = null;
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }

  try {
    let body: AnalysisRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid JSON body", fallback: { message: "Invalid request", next_action: "manual_size_select" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { images, referenceObject, sessionId, quoteId, zip, address, customer_type, lead_id, image_storage_path, video_storage_path, media_type } = body;

    if (!images || images.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "No images provided", fallback: { message: "No photo received", next_action: "manual_size_select" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (images.length > 8) {
      return new Response(
        JSON.stringify({ ok: false, error: "Maximum 8 images allowed", fallback: { message: "Too many photos", next_action: "manual_size_select" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================================
    // CHECK MODE: DRY_RUN vs LIVE
    // ============================================================
    let mode = body.mode || "LIVE";
    if (mode !== "DRY_RUN" && supabase) {
      try {
        const { data: configRow } = await supabase
          .from("config_settings")
          .select("value")
          .eq("key", "photo_ai.mode")
          .maybeSingle();
        if (configRow?.value) {
          const configMode = JSON.parse(configRow.value);
          if (configMode === "DRY_RUN") mode = "DRY_RUN";
        }
      } catch { /* use default */ }
    }

    // ============================================================
    // LEAD CREATION / ATTACHMENT (via lead-ingest, non-blocking)
    // ============================================================
    let resolvedLeadId = lead_id || null;
    if (supabase && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const ingestResponse = await fetch(`${SUPABASE_URL}/functions/v1/lead-ingest`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source_channel: media_type === "VIDEO" ? "WEBSITE_VIDEO" : "WEBSITE_PHOTO",
            source_detail: "photo_ai",
            zip: zip || undefined,
            address: address || undefined,
            customer_type: customer_type || undefined,
            message: `${media_type === "VIDEO" ? "Video" : "Photo"} uploaded for analysis`,
            raw_payload: { image_count: images.length, session_id: sessionId },
          }),
        });
        if (ingestResponse.ok) {
          const ingestResult = await ingestResponse.json();
          resolvedLeadId = ingestResult.lead_id || resolvedLeadId;
          console.log("[analyze-waste] Lead ingested:", resolvedLeadId);
        } else {
          const errText = await ingestResponse.text();
          console.error("[analyze-waste] lead-ingest error (non-critical):", errText);
        }
      } catch (ingestErr) {
        console.error("[analyze-waste] lead-ingest failed (non-critical):", ingestErr);
      }
    }

    // ============================================================
    // LOG: PHOTO_UPLOADED event
    // ============================================================
    if (supabase && resolvedLeadId) {
      try {
        await supabase.from("lead_events").insert({
          lead_id: resolvedLeadId,
          event_type: media_type === "VIDEO" ? "VIDEO_UPLOADED" : "PHOTO_UPLOADED",
          event_data: { image_count: images.length, session_id: sessionId, mode, media_type: media_type || "PHOTO" },
        });
      } catch { /* non-blocking */ }
    }

    // ============================================================
    // DRY_RUN: Return sample result
    // ============================================================
    if (mode === "DRY_RUN") {
      console.log("[analyze-waste] DRY_RUN mode - returning sample result");
      const dryResult = { ...DRY_RUN_RESULT, analysisId: `dry_${Date.now()}`, lead_id: resolvedLeadId };

      // Save to DB
      if (supabase) {
        try {
          const { data } = await supabase.from("waste_vision_analyses").insert({
            session_id: sessionId,
            quote_id: quoteId || null,
            lead_id: resolvedLeadId,
            image_count: images.length,
            input_type: media_type === "VIDEO" ? "video_frames" : "photo",
            mode: "DRY_RUN",
            zip, address, customer_type,
            image_storage_path: image_storage_path || null,
            recommended_waste_type: "mixed",
            recommended_size: 20,
            heavy_flag: false,
            confidence: 0.82,
            detected_materials: DRY_RUN_RESULT.materials,
            materials_detected: DRY_RUN_RESULT.materials,
            overall_confidence: "high",
            hazard_review_required: false,
            hazard_review_status: "none",
          }).select("id").single();
          if (data) dryResult.analysisId = data.id;
        } catch { /* non-blocking */ }
      }

      // Log PHOTO_ANALYZED event
      if (supabase && resolvedLeadId) {
        try {
        await supabase.from("lead_events").insert({
            lead_id: resolvedLeadId,
            event_type: media_type === "VIDEO" ? "VIDEO_ANALYZED" : "PHOTO_ANALYZED",
            event_data: { mode: "DRY_RUN", recommended_size: 20, heavy_flag: false, media_type: media_type || "PHOTO" },
          });
        } catch { /* non-blocking */ }
      }

      return new Response(JSON.stringify(dryResult), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // LIVE MODE: Call AI
    // ============================================================
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[analyze-waste] LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ ok: false, error: "AI service not configured", fallback: { message: "Service temporarily unavailable", next_action: "manual_size_select" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[analyze-waste] Processing ${images.length} images, reference: ${referenceObject || 'none'}`);

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

    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: userPrompt },
    ];

    for (const image of images) {
      const imageUrl = image.startsWith("data:")
        ? image
        : image.startsWith("http")
          ? image
          : `data:image/jpeg;base64,${image}`;
      content.push({ type: "image_url", image_url: { url: imageUrl } });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
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
          JSON.stringify({ ok: false, error: "Rate limit exceeded", fallback: { message: "Service busy. Please try again in a moment.", next_action: "manual_size_select" } }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ ok: false, error: "AI service temporarily unavailable", fallback: { message: "Service unavailable", next_action: "manual_size_select" } }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log system error
      if (supabase) {
        try {
          await supabase.from("lead_events").insert({
            lead_id: resolvedLeadId || "00000000-0000-0000-0000-000000000000",
            event_type: "system_error",
            event_data: { source: "analyze-waste", status: aiResponse.status, error: errorText.slice(0, 500) },
          });
        } catch { /* non-blocking */ }
      }

      return new Response(
        JSON.stringify({ ok: false, error: "Analysis failed", fallback: { message: "Could not analyze photo. Please select size manually.", next_action: "manual_size_select" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await aiResponse.json();
    const responseContent = aiResult.choices?.[0]?.message?.content;

    if (!responseContent) {
      return new Response(
        JSON.stringify({ ok: false, error: "Empty AI response", fallback: { message: "Photo unclear. Please select size manually.", next_action: "manual_size_select" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let analysis: any;
    try {
      analysis = JSON.parse(responseContent);
    } catch {
      console.error("[analyze-waste] Failed to parse AI response:", responseContent.slice(0, 500));
      return new Response(
        JSON.stringify({ ok: false, error: "Failed to parse analysis", fallback: { message: "Could not interpret photo. Please select size manually.", next_action: "manual_size_select" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[analyze-waste] Analysis complete:", {
      materials: analysis.materials?.length,
      hazards: analysis.hazards?.length,
      recommendedSize: analysis.recommended_flow?.recommended_size,
      hazardReview: analysis.hazard_review_required,
    });

    // Derive normalized fields
    const heavyMaterials = (analysis.materials || []).filter((m: any) =>
      ["concrete", "dirt_soil", "brick_tile", "asphalt", "roofing"].includes(m.id)
    );
    const totalHeavyPct = heavyMaterials.reduce((sum: number, m: any) => sum + (m.estimated_volume_pct || 0), 0);
    const heavyFlag = totalHeavyPct > 60 || analysis.recommended_flow?.waste_type === "heavy";
    const recommendedSize = analysis.recommended_flow?.recommended_size || 20;
    const confidenceScore = (() => {
      if (analysis.overall_confidence === "high") return 0.85;
      if (analysis.overall_confidence === "medium") return 0.65;
      return 0.4;
    })();

    // Save to database
    let analysisId: string | null = null;
    if (supabase) {
      try {
        const insertData = {
          session_id: sessionId,
          quote_id: quoteId || null,
          lead_id: resolvedLeadId,
          image_count: images.length,
          input_type: media_type === "VIDEO" ? "video_frames" : "photo",
          reference_object: referenceObject || "none",
          mode: "LIVE",
          zip, address, customer_type,
          image_storage_path: image_storage_path || video_storage_path || null,
          materials_detected: analysis.materials,
          hazards_detected: analysis.hazards,
          volume_cy_low: analysis.volume_cy?.low,
          volume_cy_high: analysis.volume_cy?.high,
          weight_tons_low: analysis.weight_tons?.low,
          weight_tons_high: analysis.weight_tons?.high,
          pickup_loads_low: analysis.pickup_loads?.low,
          pickup_loads_high: analysis.pickup_loads?.high,
          recommended_waste_type: analysis.recommended_flow?.waste_type,
          recommended_size: recommendedSize,
          alternate_sizes: analysis.recommended_flow?.alternate_sizes,
          fit_confidence: analysis.recommended_flow?.fit_confidence,
          recommendation_notes: analysis.recommended_flow?.notes,
          green_halo_eligible: analysis.green_halo?.eligible,
          green_halo_note: analysis.green_halo?.note,
          hazard_review_required: analysis.hazard_review_required,
          hazard_review_status: analysis.hazard_review_required ? "pending" : "none",
          overall_confidence: analysis.overall_confidence,
          raw_ai_response: aiResult,
          detected_materials: analysis.materials,
          heavy_flag: heavyFlag,
          confidence: confidenceScore,
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
      }
    }

    // Log PHOTO_ANALYZED event
    if (supabase && resolvedLeadId) {
      try {
        await supabase.from("lead_events").insert({
          lead_id: resolvedLeadId,
          event_type: media_type === "VIDEO" ? "VIDEO_ANALYZED" : "PHOTO_ANALYZED",
          event_data: {
            analysis_id: analysisId,
            recommended_size: recommendedSize,
            heavy_flag: heavyFlag,
            confidence: analysis.overall_confidence,
            materials_count: analysis.materials?.length || 0,
          },
        });
      } catch { /* non-blocking */ }
    }

    // Log lifecycle event
    if (supabase && resolvedLeadId) {
      try {
        await supabase.from("lifecycle_events").insert({
          entity_type: "LEAD",
          entity_id: resolvedLeadId,
          from_stage: "LEAD_NEW",
          to_stage: "LEAD_QUALIFIED",
          trigger_type: "auto",
          trigger_detail: "photo_ai_analysis",
          metadata: { analysis_id: analysisId, recommended_size: recommendedSize, heavy_flag: heavyFlag },
        });
      } catch { /* non-blocking */ }
    }

    // Build response with BOTH new standardized AND legacy-compat fields
    const materialNames = (analysis.materials || []).map((m: any) => m.id);
    const response = {
      ok: true,
      success: true,
      analysisId,
      lead_id: resolvedLeadId,
      // Standardized fields
      detected_materials: materialNames,
      heavy_flag: heavyFlag,
      recommended_size: recommendedSize,
      confidence: confidenceScore,
      notes: (analysis.recommended_flow?.notes || []).join(". "),
      // Full analysis data
      ...analysis,
      // Legacy compatibility (for CalsanAIChat, ConversationalHero, PhotoUploadModal)
      recommendation: {
        recommendedSize,
        materialCategory: heavyFlag ? "heavy" : "general",
        confidence: confidenceScore,
        explanation: (analysis.recommended_flow?.notes || []).join(". ") || `Estimated ${analysis.volume_cy?.low || '?'}-${analysis.volume_cy?.high || '?'} cubic yards.`,
      },
      analysis: {
        materials: (analysis.materials || []).map((m: any) => ({
          name: m.label,
          label: m.label,
          percentage: m.estimated_volume_pct || 0,
        })),
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[analyze-waste] Unhandled error:", error);

    // Log system error
    if (supabase) {
      try {
        await supabase.from("lead_events").insert({
          lead_id: "00000000-0000-0000-0000-000000000000",
          event_type: "system_error",
          event_data: { source: "analyze-waste", error: error instanceof Error ? error.message : String(error) },
        });
      } catch { /* non-blocking */ }
    }

    return new Response(
      JSON.stringify({
        ok: false,
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
        fallback: {
          message: "Could not analyze photo. Please select size manually.",
          next_action: "manual_size_select",
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
