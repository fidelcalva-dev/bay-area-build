import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FacilityConfig {
  cnd_debris: {
    facility_name: string;
    cost_per_ton: number;
    min_charge?: number;
  };
  green_waste: {
    facility_name: string;
    cost_per_ton: number;
    min_charge?: number;
  };
  heavy_clean: {
    facility_name: string;
    cost_per_load_concrete?: number;
    cost_per_load_asphalt?: number;
    cost_per_load_soil?: number;
    environmental_fee?: number;
  };
}

interface SeedRequest {
  market_code: string;
  market_name: string;
  city: string;
  state?: string;
  yard_id?: string;
  template_id: string;
  facilities: FacilityConfig;
  adjustments?: Array<{
    applies_to: string;
    adjustment_pct: number;
    reason?: string;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: SeedRequest = await req.json();
    const {
      market_code,
      market_name,
      city,
      state = "CA",
      yard_id,
      template_id,
      facilities,
      adjustments = [],
    } = body;

    // Normalize market code to lowercase with underscores
    const normalizedMarketCode = market_code.toLowerCase().replace(/[\s-]+/g, '_');

    // Validate required fields
    if (!market_code || !template_id || !facilities) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: market_code, template_id, facilities" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get template
    const { data: template, error: templateError } = await supabase
      .from("market_templates")
      .select("*")
      .eq("id", template_id)
      .single();

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ error: "Template not found", details: templateError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      market_code: normalizedMarketCode,
      market_created: false,
      dump_fee_profiles_created: 0,
      market_size_pricing_created: 0,
      heavy_material_rates_created: 0,
      adjustments_applied: 0,
      version_created: false,
      errors: [] as string[],
    };

    // 1) Create market record in 'markets' table if it doesn't exist
    const { data: existingMarket } = await supabase
      .from("markets")
      .select("id")
      .eq("id", normalizedMarketCode)
      .single();

    if (!existingMarket) {
      const { error: marketError } = await supabase
        .from("markets")
        .insert({
          id: normalizedMarketCode,
          name: market_name,
          status: "coming_soon",
          default_yard_id: yard_id || null,
          notes: `Auto-created by seed-market-pricing at ${new Date().toISOString()}`,
        });

      if (marketError) {
        results.errors.push(`Market creation: ${marketError.message}`);
      } else {
        results.market_created = true;
      }
    }

    // 2) Create/update market_onboarding record
    const { error: onboardingError } = await supabase
      .from("market_onboarding")
      .upsert({
        market_code: normalizedMarketCode,
        market_name,
        city,
        state,
        yard_id: yard_id || null,
        template_id,
        status: "SEEDED",
        facilities_config_json: facilities,
      }, { onConflict: "market_code" });

    if (onboardingError) {
      results.errors.push(`Onboarding: ${onboardingError.message}`);
    }

    // 3) Create dump_fee_profiles - check existence first, then insert
    const dumpFeeProfiles = [
      {
        market_code: normalizedMarketCode,
        material_category: "DEBRIS",
        material_stream: "CND_DEBRIS",
        dump_cost_model: "PER_TON",
        default_cost_per_ton: facilities.cnd_debris.cost_per_ton,
        min_charge: facilities.cnd_debris.min_charge || null,
        facility_name: facilities.cnd_debris.facility_name,
        notes: "C&D and general debris - auto-seeded",
        is_active: true,
      },
      {
        market_code: normalizedMarketCode,
        material_category: "DEBRIS",
        material_stream: "GREEN_WASTE",
        dump_cost_model: "PER_TON",
        default_cost_per_ton: facilities.green_waste.cost_per_ton,
        min_charge: facilities.green_waste.min_charge || null,
        facility_name: facilities.green_waste.facility_name,
        notes: "Green waste, clean wood, clean drywall - auto-seeded",
        is_active: true,
      },
      {
        market_code: normalizedMarketCode,
        material_category: "DEBRIS",
        material_stream: "CLEAN_WOOD",
        dump_cost_model: "PER_TON",
        default_cost_per_ton: facilities.green_waste.cost_per_ton,
        facility_name: facilities.green_waste.facility_name,
        notes: "Clean wood (shares green waste rate) - auto-seeded",
        is_active: true,
      },
      {
        market_code: normalizedMarketCode,
        material_category: "DEBRIS",
        material_stream: "CLEAN_DRYWALL",
        dump_cost_model: "PER_TON",
        default_cost_per_ton: facilities.green_waste.cost_per_ton,
        facility_name: facilities.green_waste.facility_name,
        notes: "Clean drywall (shares green waste rate) - auto-seeded",
        is_active: true,
      },
      {
        market_code: normalizedMarketCode,
        material_category: "HEAVY",
        material_stream: "CLEAN_CONCRETE",
        dump_cost_model: "PER_LOAD",
        default_cost_per_load: facilities.heavy_clean.cost_per_load_concrete || 150,
        facility_name: facilities.heavy_clean.facility_name,
        notes: `Heavy clean concrete - Env fee: $${facilities.heavy_clean.environmental_fee || 15}/load`,
        is_active: true,
      },
      {
        market_code: normalizedMarketCode,
        material_category: "HEAVY",
        material_stream: "CLEAN_ASPHALT",
        dump_cost_model: "PER_LOAD",
        default_cost_per_load: facilities.heavy_clean.cost_per_load_asphalt || 225,
        facility_name: facilities.heavy_clean.facility_name,
        notes: "Heavy clean asphalt - auto-seeded",
        is_active: true,
      },
      {
        market_code: normalizedMarketCode,
        material_category: "HEAVY",
        material_stream: "CLEAN_SOIL",
        dump_cost_model: "PER_LOAD",
        default_cost_per_load: facilities.heavy_clean.cost_per_load_soil || 100,
        facility_name: facilities.heavy_clean.facility_name,
        notes: "Clean soil/dirt - auto-seeded",
        is_active: true,
      },
    ];

    for (const profile of dumpFeeProfiles) {
      // Check if profile already exists
      const { data: existing } = await supabase
        .from("dump_fee_profiles")
        .select("id")
        .eq("market_code", normalizedMarketCode)
        .eq("material_stream", profile.material_stream)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("dump_fee_profiles")
          .update(profile)
          .eq("id", existing.id);
        
        if (error) {
          results.errors.push(`Update dump fee ${profile.material_stream}: ${error.message}`);
        } else {
          results.dump_fee_profiles_created++;
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from("dump_fee_profiles")
          .insert(profile);
        
        if (error) {
          results.errors.push(`Insert dump fee ${profile.material_stream}: ${error.message}`);
        } else {
          results.dump_fee_profiles_created++;
        }
      }
    }

    // 4) Calculate and create market_size_pricing for standard debris
    const includedTons = template.default_included_tons_json as Record<string, number>;
    const serviceFees = template.default_service_fee_by_size_json as Record<string, number>;
    const coreMarkup = 1 + (template.default_core_markup_pct / 100);
    const premiumMarkup = 1 + (template.default_premium_markup_pct / 100);

    // Get adjustment for standard debris
    const debrisAdjustment = adjustments.find(
      (a) => a.applies_to === "STANDARD_DEBRIS" || a.applies_to === "ALL"
    );
    const debrisAdjustPct = 1 + ((debrisAdjustment?.adjustment_pct || 0) / 100);

    for (const [sizeStr, tons] of Object.entries(includedTons)) {
      const size = parseInt(sizeStr);
      const serviceFee = serviceFees[sizeStr] || 300;
      const dumpCost = tons * facilities.cnd_debris.cost_per_ton;
      
      // Base price = service fee + dump cost + margin buffer (20%)
      const rawBase = (serviceFee + dumpCost) * 1.20 * debrisAdjustPct;
      const basePrice = Math.round(rawBase / 5) * 5; // Round to nearest $5
      const corePrice = Math.round((basePrice * coreMarkup) / 5) * 5;
      const premiumPrice = Math.round((basePrice * premiumMarkup) / 5) * 5;

      const tiers = [
        { tier: "BASE", price: basePrice },
        { tier: "CORE", price: corePrice },
        { tier: "PREMIUM", price: premiumPrice },
      ];

      for (const { tier, price } of tiers) {
        const pricingData = {
          market_code: normalizedMarketCode,
          size_yd: size,
          tier,
          base_price: price,
          included_days: template.default_days_included,
          included_tons: tons,
          extra_ton_rate: template.default_extra_ton_rate,
          overdue_daily_rate: template.default_overdue_daily_rate,
          same_day_fee: template.default_same_day_fee,
          service_fee_component: serviceFee,
          dump_cost_assumption: dumpCost,
          notes: `Auto-seeded from ${template.template_name}`,
          is_active: true,
        };

        // Check if exists
        const { data: existingPricing } = await supabase
          .from("market_size_pricing")
          .select("id")
          .eq("market_code", normalizedMarketCode)
          .eq("size_yd", size)
          .eq("tier", tier)
          .single();

        if (existingPricing) {
          const { error } = await supabase
            .from("market_size_pricing")
            .update(pricingData)
            .eq("id", existingPricing.id);

          if (error) {
            results.errors.push(`Update size pricing ${size}yd ${tier}: ${error.message}`);
          } else {
            results.market_size_pricing_created++;
          }
        } else {
          const { error } = await supabase
            .from("market_size_pricing")
            .insert(pricingData);

          if (error) {
            results.errors.push(`Insert size pricing ${size}yd ${tier}: ${error.message}`);
          } else {
            results.market_size_pricing_created++;
          }
        }
      }
    }

    // 5) Create heavy_material_rates for sizes 5/6/8/10
    const heavyBasePrices = template.heavy_base_prices_json as Record<string, number>;
    const greenHaloPrices = template.green_halo_prices_json as Record<string, number>;

    // Get adjustments for heavy
    const heavyBaseAdjustment = adjustments.find(
      (a) => a.applies_to === "HEAVY_BASE" || a.applies_to === "ALL"
    );
    const greenHaloAdjustment = adjustments.find(
      (a) => a.applies_to === "GREEN_HALO" || a.applies_to === "ALL"
    );
    const heavyAdjustPct = 1 + ((heavyBaseAdjustment?.adjustment_pct || 0) / 100);
    const greenAdjustPct = 1 + ((greenHaloAdjustment?.adjustment_pct || 0) / 100);

    const heavyMaterials = [
      "CLEAN_CONCRETE",
      "CLEAN_ASPHALT",
      "CLEAN_SOIL",
      "CLEAN_ROCK_SAND",
    ];

    const greenHaloMaterials = [
      "GREEN_WASTE",
      "CLEAN_WOOD",
    ];

    for (const sizeStr of ["5", "8", "10"]) {
      const size = parseInt(sizeStr);
      
      // HEAVY_BASE rates
      for (const material of heavyMaterials) {
        const basePrice = heavyBasePrices[sizeStr] || 500;
        const adjustedPrice = Math.round((basePrice * heavyAdjustPct) / 5) * 5;

        const rateData = {
          market_code: normalizedMarketCode,
          size_yd: size,
          heavy_category: "HEAVY_BASE",
          material_stream: material,
          base_price_flat: adjustedPrice,
          max_tons: template.heavy_max_tons,
          included_days: template.heavy_included_days,
          facility_name: facilities.heavy_clean.facility_name,
          reclass_to_debris_heavy: true,
          notes: `Auto-seeded HEAVY_BASE for ${material}`,
          is_active: true,
        };

        // Check existence
        const { data: existingRate } = await supabase
          .from("heavy_material_rates")
          .select("id")
          .eq("market_code", normalizedMarketCode)
          .eq("size_yd", size)
          .eq("heavy_category", "HEAVY_BASE")
          .eq("material_stream", material)
          .single();

        if (existingRate) {
          const { error } = await supabase
            .from("heavy_material_rates")
            .update(rateData)
            .eq("id", existingRate.id);

          if (error) {
            results.errors.push(`Update heavy ${size}yd ${material}: ${error.message}`);
          } else {
            results.heavy_material_rates_created++;
          }
        } else {
          const { error } = await supabase
            .from("heavy_material_rates")
            .insert(rateData);

          if (error) {
            results.errors.push(`Insert heavy ${size}yd ${material}: ${error.message}`);
          } else {
            results.heavy_material_rates_created++;
          }
        }
      }

      // GREEN_HALO rates
      for (const material of greenHaloMaterials) {
        const basePrice = greenHaloPrices[sizeStr] || 400;
        const adjustedPrice = Math.round((basePrice * greenAdjustPct) / 5) * 5;

        const rateData = {
          market_code: normalizedMarketCode,
          size_yd: size,
          heavy_category: "GREEN_HALO",
          material_stream: material,
          base_price_flat: adjustedPrice,
          max_tons: template.heavy_max_tons,
          included_days: template.heavy_included_days,
          facility_name: facilities.green_waste.facility_name,
          reclass_to_debris_heavy: true,
          notes: `Auto-seeded GREEN_HALO for ${material}`,
          is_active: true,
        };

        // Check existence
        const { data: existingRate } = await supabase
          .from("heavy_material_rates")
          .select("id")
          .eq("market_code", normalizedMarketCode)
          .eq("size_yd", size)
          .eq("heavy_category", "GREEN_HALO")
          .eq("material_stream", material)
          .single();

        if (existingRate) {
          const { error } = await supabase
            .from("heavy_material_rates")
            .update(rateData)
            .eq("id", existingRate.id);

          if (error) {
            results.errors.push(`Update green halo ${size}yd ${material}: ${error.message}`);
          } else {
            results.heavy_material_rates_created++;
          }
        } else {
          const { error } = await supabase
            .from("heavy_material_rates")
            .insert(rateData);

          if (error) {
            results.errors.push(`Insert green halo ${size}yd ${material}: ${error.message}`);
          } else {
            results.heavy_material_rates_created++;
          }
        }
      }
    }

    // 6) Save adjustments if provided
    for (const adj of adjustments) {
      const { error } = await supabase
        .from("market_price_adjustments")
        .insert({
          market_code: normalizedMarketCode,
          applies_to: adj.applies_to,
          adjustment_pct: adj.adjustment_pct,
          reason: adj.reason || "Applied during market seeding",
          is_active: true,
        });

      if (error) {
        results.errors.push(`Adjustment ${adj.applies_to}: ${error.message}`);
      } else {
        results.adjustments_applied++;
      }
    }

    // 7) Create version record
    const { error: versionError } = await supabase
      .from("market_price_versions")
      .insert({
        market_code: normalizedMarketCode,
        version_label: "v1",
        status: "DRAFT",
        pricing_snapshot_json: {
          template_used: template.template_name,
          facilities,
          adjustments,
          seeded_at: new Date().toISOString(),
        },
        notes: `Initial seeding from ${template.template_name}`,
      });

    if (versionError) {
      results.errors.push(`Version: ${versionError.message}`);
    } else {
      results.version_created = true;
    }

    const success = results.errors.length === 0;
    return new Response(
      JSON.stringify({
        success,
        results,
        message: success
          ? `Market ${normalizedMarketCode} seeded successfully. Status: SEEDED (requires review before activation).`
          : `Market ${normalizedMarketCode} seeded with ${results.errors.length} errors.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Seed market pricing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
