// ============================================================
// QUOTE AI RECOMMENDER - Edge Function
// Hybrid: Deterministic Rules + AI-crafted Reason
// ============================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HARD RULES
const HEAVY_ITEM_CODES = [
  'CONCRETE', 'BRICK', 'ASPHALT', 'DIRT', 'ROCK', 'GRAVEL', 'GRANITE',
  'CONCRETE_BRICK', 'CLEAN_DIRT', 'FILL_DIRT', 'TOPSOIL',
];
const YARD_WASTE_CODES = ['GRASS_YARD_WASTE', 'YARD_WASTE', 'GRASS', 'LEAVES', 'BRANCHES'];
const RECYCLING_CODES = ['CLEAN_WOOD', 'WOOD_CHIPS', 'CARDBOARD', 'METAL_SCRAP'];
const CLEAN_WOOD_CODES = ['CLEAN_WOOD', 'WOOD_CHIPS'];

const HEAVY_SIZES = [5, 8, 10];
const DEBRIS_SIZES = [5, 8, 10, 20, 30, 40, 50];
const RECYCLING_SIZES = [10, 20, 30];

// Volume scoring (East Bay tuned)
const VOLUME_POINTS: Record<string, number> = {
  GENERAL_JUNK: 4,
  HOUSEHOLD_JUNK: 4,
  REMODEL: 8,
  CONSTRUCTION: 10,
  CONCRETE: 9,
  BRICK: 8,
  ASPHALT: 8,
  DIRT: 7,
  ROCK: 9,
  GRAVEL: 8,
  CLEAN_WOOD: 5,
  WOOD_CHIPS: 4,
  GRASS_YARD_WASTE: 6,
  COMMERCIAL: 6,
  FURNITURE: 3,
  APPLIANCES: 4,
  ROOFING_SHINGLES: 8,
  DRYWALL: 5,
  CABINETS: 4,
  FLOORING: 4,
};

const QUANTITY_MULTIPLIERS: Record<string, number> = {
  SMALL: 0.7,
  MED: 1.0,
  LARGE: 1.4,
};

interface AINotice {
  type: 'INFO' | 'WARNING';
  code: string;
  text: string;
}

interface AIRecommendation {
  category: 'GENERAL_DEBRIS' | 'HEAVY' | 'DEBRIS_HEAVY' | 'CLEAN_RECYCLING';
  material_code: string | null;
  recommended_size_yd: number;
  alternatives: number[];
  service_type: 'HEAVY_BASE' | 'GREEN_HALO' | null;
  confidence_score: number;
  reason_short: string;
  notices: AINotice[];
  must_enforce: {
    allowed_sizes: number[];
    hide_green_halo: boolean;
    force_debris_heavy: boolean;
  };
}

function calculateRecommendation(input: {
  selected_chips: { code: string; quantity: string }[];
  available_sizes: number[];
  recycling_receipt_required?: boolean;
}): AIRecommendation {
  const { selected_chips, available_sizes, recycling_receipt_required } = input;

  if (!selected_chips || selected_chips.length === 0) {
    return {
      category: 'GENERAL_DEBRIS',
      material_code: null,
      recommended_size_yd: 20,
      alternatives: [10, 30],
      service_type: null,
      confidence_score: 75,
      reason_short: 'Based on typical projects, this size works well for most needs.',
      notices: [],
      must_enforce: {
        allowed_sizes: DEBRIS_SIZES.filter(s => available_sizes.includes(s)),
        hide_green_halo: false,
        force_debris_heavy: false,
      },
    };
  }

  // Analyze selections
  const codes = selected_chips.map(c => c.code.toUpperCase());
  let hasHeavy = codes.some(c => HEAVY_ITEM_CODES.some(h => c.includes(h)));
  let hasYardWaste = codes.some(c => YARD_WASTE_CODES.some(y => c.includes(y)));
  let hasRecycling = codes.some(c => RECYCLING_CODES.some(r => c.includes(r)));
  let hasOnlyCleanWood = codes.every(c => CLEAN_WOOD_CODES.some(w => c.includes(w)));
  let allRecycling = codes.every(c => RECYCLING_CODES.some(r => c.includes(r)));

  // Calculate volume score
  let volumeScore = 0;
  for (const chip of selected_chips) {
    const basePoints = VOLUME_POINTS[chip.code.toUpperCase()] || 4;
    const multiplier = QUANTITY_MULTIPLIERS[chip.quantity] || 1.0;
    volumeScore += basePoints * multiplier;
  }

  // Safety buffers
  if (hasHeavy) {
    volumeScore *= 1.15;
  }
  if (codes.includes('APPLIANCES') || codes.includes('ROOFING_SHINGLES')) {
    volumeScore += 2;
  }

  volumeScore = Math.round(volumeScore * 100) / 100;

  // PHASE A: Determine category (deterministic rules)
  let category: AIRecommendation['category'];
  let forcesDebrisHeavy = false;
  let hideGreenHalo = false;
  let allowedSizes: number[];
  let materialCode: string | null = null;
  let serviceType: AIRecommendation['service_type'] = null;
  const notices: AINotice[] = [];

  if (hasYardWaste) {
    // HARD RULE: Yard waste -> DEBRIS_HEAVY, no Green Halo
    category = 'DEBRIS_HEAVY';
    forcesDebrisHeavy = true;
    hideGreenHalo = true;
    allowedSizes = HEAVY_SIZES;
    materialCode = 'GRASS_YARD_WASTE';
    notices.push({
      type: 'INFO',
      code: 'YARD_WASTE',
      text: 'Yard waste must be kept free of trash or debris.',
    });
  } else if (hasHeavy) {
    // HARD RULE: Heavy materials -> HEAVY, sizes 5-10
    category = 'HEAVY';
    allowedSizes = HEAVY_SIZES;
    materialCode = codes.find(c => HEAVY_ITEM_CODES.includes(c)) || 'CONCRETE';
    serviceType = 'HEAVY_BASE';
    notices.push({
      type: 'WARNING',
      code: 'FILL_LINE',
      text: 'Heavy materials have weight limits. Fill lines will be provided.',
    });

    // Check if recycling receipt requested -> switch to GREEN_HALO
    if (recycling_receipt_required && hasOnlyCleanWood) {
      serviceType = 'GREEN_HALO';
    }
  } else if (allRecycling && !hasYardWaste) {
    // Recycling streams only
    category = 'CLEAN_RECYCLING';
    allowedSizes = RECYCLING_SIZES;
    if (hasOnlyCleanWood) {
      serviceType = recycling_receipt_required ? 'GREEN_HALO' : null;
      notices.push({
        type: 'INFO',
        code: 'CLEAN_ONLY',
        text: 'Materials must be clean and separated to qualify for recycling.',
      });
    }
  } else {
    // Default: General debris
    category = 'GENERAL_DEBRIS';
    allowedSizes = DEBRIS_SIZES;
  }

  // Filter by market availability
  const marketAllowedSizes = allowedSizes.filter(s => available_sizes.includes(s));
  if (marketAllowedSizes.length === 0) {
    // Fallback to available sizes
    if (category === 'HEAVY' || category === 'DEBRIS_HEAVY') {
      allowedSizes = HEAVY_SIZES;
    } else {
      allowedSizes = DEBRIS_SIZES;
    }
  } else {
    allowedSizes = marketAllowedSizes;
  }

  // PHASE B: Size recommendation based on volume score
  let recommendedSize: number;
  let alternatives: number[];

  if (category === 'HEAVY' || category === 'DEBRIS_HEAVY') {
    // Heavy: only 5-10 available
    if (volumeScore <= 3) {
      recommendedSize = 5;
    } else if (volumeScore <= 4) {
      recommendedSize = 6;
    } else if (volumeScore <= 6) {
      recommendedSize = 8;
    } else {
      recommendedSize = 10;
    }
  } else if (category === 'CLEAN_RECYCLING') {
    // Recycling: prefer 10-30
    if (volumeScore <= 8) {
      recommendedSize = 10;
    } else if (volumeScore <= 20) {
      recommendedSize = 20;
    } else {
      recommendedSize = 30;
    }
  } else {
    // General debris: 10-40
    if (volumeScore <= 10) {
      recommendedSize = 10;
    } else if (volumeScore <= 20) {
      recommendedSize = 20;
    } else if (volumeScore <= 30) {
      recommendedSize = 30;
    } else {
      recommendedSize = 40;
    }
  }

  // Ensure recommended size is in allowed sizes
  if (!allowedSizes.includes(recommendedSize)) {
    // Find closest allowed size
    const sorted = [...allowedSizes].sort((a, b) => 
      Math.abs(a - recommendedSize) - Math.abs(b - recommendedSize)
    );
    recommendedSize = sorted[0] || 10;
  }

  // Generate alternatives
  alternatives = allowedSizes
    .filter(s => s !== recommendedSize)
    .sort((a, b) => a - b)
    .slice(0, 2);

  // Confidence score based on selection clarity
  let confidenceScore = 75;
  if (selected_chips.length >= 3) {
    confidenceScore = 85;
  } else if (selected_chips.length === 2) {
    confidenceScore = 80;
  }
  if (hasHeavy || hasYardWaste) {
    confidenceScore = Math.min(confidenceScore + 5, 95);
  }

  // Generate reason_short (AI-crafted style, but deterministic)
  let reasonShort: string;
  if (hasYardWaste) {
    reasonShort = 'Based on your yard waste selection, this size accommodates typical landscaping projects.';
  } else if (hasHeavy) {
    reasonShort = 'Heavy materials require smaller dumpsters for weight compliance.';
  } else if (allRecycling) {
    reasonShort = 'Clean recyclables work well in this size for efficient disposal.';
  } else if (selected_chips.length >= 3) {
    reasonShort = 'Based on your selections, this size fits most projects like yours.';
  } else {
    reasonShort = 'Recommended based on your items and typical projects in this area.';
  }

  return {
    category,
    material_code: materialCode,
    recommended_size_yd: recommendedSize,
    alternatives,
    service_type: serviceType,
    confidence_score: confidenceScore,
    reason_short: reasonShort,
    notices,
    must_enforce: {
      allowed_sizes: allowedSizes,
      hide_green_halo: hideGreenHalo,
      force_debris_heavy: forcesDebrisHeavy,
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      zip,
      market_code,
      yard_id,
      available_sizes = [10, 20, 30, 40],
      customer_type_detected,
      selected_chips = [],
      free_text_note,
      requested_speed,
      recycling_receipt_required,
      constraints,
    } = body;

    console.log(`[quote-ai-recommend] Processing for ZIP ${zip}, chips: ${selected_chips.length}`);

    // Calculate recommendation using deterministic rules
    const recommendation = calculateRecommendation({
      selected_chips,
      available_sizes,
      recycling_receipt_required,
    });

    // Log to database (optional, for analytics)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from("audit_logs" as "orders").insert({
          entity_type: "quote_ai_recommendation",
          action: "generate",
          after_data: {
            zip,
            market_code,
            selected_chips,
            recommendation,
            version: "v1.0.0",
          },
        } as never);
      } catch (logError) {
        console.error("[quote-ai-recommend] Logging error:", logError);
      }
    }

    return new Response(JSON.stringify(recommendation), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[quote-ai-recommend] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
