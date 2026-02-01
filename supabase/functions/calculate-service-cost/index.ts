// Service Cost Calculator Edge Function
// Computes operational cost and margin using IN_HOUSE or OWNER_OPERATOR models

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ServiceType = 'DELIVERY' | 'PICKUP' | 'SWAP';
type MaterialCategory = 'DEBRIS' | 'HEAVY' | 'DEBRIS_HEAVY' | 'CLEAN_RECYCLING';
type CostModel = 'IN_HOUSE' | 'OWNER_OPERATOR';
type VehicleType = 'ROLLOFF' | 'HIGHSIDE' | 'END_DUMP' | 'SUPER10' | 'TENWHEEL' | 'PICKUP';
type DumpCostModel = 'PER_TON' | 'PER_LOAD' | 'FLAT';

interface ServiceCostRequest {
  market_code: string;
  vehicle_type?: VehicleType;
  cost_model_override?: CostModel;
  service_type: ServiceType;
  origin_yard_id: string;
  destination_address?: string;
  destination_lat?: number;
  destination_lng?: number;
  facility_id?: string;
  material_category: MaterialCategory;
  material_code?: string;
  dumpster_size?: number;
  customer_price: number;
  actual_weight_tons?: number;
  route_miles?: number;
  compare_models?: boolean;
  entity_type?: 'QUOTE' | 'ORDER' | 'RUN';
  entity_id?: string;
}

interface CostBreakdown {
  model: CostModel;
  hours?: number;
  miles?: number;
  base_payout?: number;
  mileage_cost?: number;
  toll_estimate?: number;
  minimum_applied: boolean;
  overhead_multiplier?: number;
  total_truck_cost: number;
}

interface DumpFeeBreakdown {
  model: DumpCostModel;
  assumed_tons?: number;
  cost_per_ton?: number;
  cost_per_load?: number;
  total_dump_cost: number;
}

interface ModelEstimate {
  cost_model: CostModel;
  truck_cost: number;
  dump_cost: number;
  total_cost: number;
  customer_price: number;
  margin: number;
  margin_pct: number;
  breakdown: CostBreakdown;
}

interface ServiceCostResponse {
  success: boolean;
  primary_estimate: ModelEstimate;
  alternative_estimate?: ModelEstimate;
  best_model: CostModel;
  margin_delta?: number;
  cost_delta?: number;
  time_breakdown?: {
    total_minutes: number;
    drive_minutes: number;
    handling_minutes: number;
    dump_minutes: number;
  };
  dump_breakdown: DumpFeeBreakdown;
  guardrail?: {
    severity: 'INFO' | 'WARN' | 'CRITICAL';
    reason: string;
    recommended_action: string;
  };
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: ServiceCostRequest = await req.json();
    const {
      market_code,
      vehicle_type = 'ROLLOFF',
      cost_model_override,
      service_type,
      origin_yard_id,
      destination_address,
      destination_lat,
      destination_lng,
      facility_id,
      material_category,
      material_code,
      dumpster_size = 10,
      customer_price,
      actual_weight_tons,
      route_miles,
      compare_models = false,
      entity_type,
      entity_id,
    } = body;

    // Validate required fields
    if (!market_code || !service_type || !origin_yard_id || !material_category || customer_price === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Load config thresholds
    const { data: configData } = await supabase
      .from('config_settings')
      .select('key, value')
      .eq('category', 'cost_engine');

    let marginWarnThreshold = 30;
    let marginCriticalThreshold = 20;
    let overheadMultiplier = 1.15;

    configData?.forEach((row: { key: string; value: unknown }) => {
      const value = typeof row.value === 'string' ? parseFloat(row.value.replace(/"/g, '')) : row.value;
      if (row.key === 'margin_warn_threshold_pct') marginWarnThreshold = Number(value) || 30;
      if (row.key === 'margin_critical_threshold_pct') marginCriticalThreshold = Number(value) || 20;
      if (row.key === 'overhead_multiplier') overheadMultiplier = Number(value) || 1.15;
    });

    // Get vehicle cost profile to determine default model
    const { data: vehicleProfile } = await supabase
      .from('vehicle_cost_profiles')
      .select('default_cost_model')
      .eq('market_code', market_code)
      .eq('vehicle_type', vehicle_type)
      .eq('is_active', true)
      .single();

    const defaultCostModel: CostModel = vehicleProfile?.default_cost_model || 'IN_HOUSE';
    const primaryModel: CostModel = cost_model_override || defaultCostModel;

    // Get in-house rates
    const { data: inhouseRates } = await supabase
      .from('inhouse_cost_rates')
      .select('*')
      .eq('market_code', market_code)
      .eq('vehicle_type', vehicle_type)
      .eq('is_active', true)
      .single();

    // Get owner-operator rates
    const { data: ownerOpRates } = await supabase
      .from('owner_operator_rates')
      .select('*')
      .eq('market_code', market_code)
      .eq('vehicle_type', vehicle_type)
      .eq('is_active', true)
      .single();

    // Get dump fee profile
    const { data: dumpProfile } = await supabase
      .from('dump_fee_profiles')
      .select('*')
      .eq('market_code', market_code)
      .eq('material_category', material_category)
      .eq('is_active', true)
      .single();

    // Call calculate-operational-time to get time breakdown
    let totalMinutes = 120;
    let driveMinutes = 60;
    let handlingMinutes = 40;
    let dumpMinutes = 20;
    let totalMiles = route_miles || 25;

    try {
      const opTimeResponse = await fetch(`${supabaseUrl}/functions/v1/calculate-operational-time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          origin_yard_id,
          destination_address,
          destination_lat,
          destination_lng,
          service_type,
          material_category,
          dumpster_size,
          disposal_facility_id: facility_id,
          market_code,
        }),
      });

      const opTimeData = await opTimeResponse.json();
      
      if (opTimeData.success) {
        totalMinutes = opTimeData.total_time_minutes || 120;
        driveMinutes = opTimeData.breakdown?.drive_time || 60;
        handlingMinutes = (opTimeData.breakdown?.yard_time || 10) + 
                         (opTimeData.breakdown?.jobsite_time || 15);
        dumpMinutes = opTimeData.breakdown?.dump_time || 20;
        
        // Sum route miles
        const rd = opTimeData.route_details || {};
        totalMiles = (rd.yard_to_site_miles || 0) + 
                    (rd.site_to_dump_miles || 0) + 
                    (rd.dump_to_yard_miles || 0) +
                    (rd.dump_to_site_miles || 0) +
                    (rd.site_to_yard_miles || 0);
        if (totalMiles === 0) totalMiles = route_miles || 25;
      }
    } catch (opTimeError) {
      console.log('Operational time fetch failed, using defaults:', opTimeError);
    }

    // Calculate dump fee
    const dumpBreakdown: DumpFeeBreakdown = {
      model: (dumpProfile?.dump_cost_model as DumpCostModel) || 'PER_TON',
      total_dump_cost: 0,
    };

    // Determine assumed tons
    let assumedTons = actual_weight_tons || 2;
    if (!actual_weight_tons && dumpProfile?.assumed_tons_defaults_json) {
      const defaults = dumpProfile.assumed_tons_defaults_json as { 
        by_size?: Record<string, number>;
        heavy_cap?: number;
        debris_heavy_multiplier?: number;
      };
      const sizeKey = String(dumpster_size);
      assumedTons = defaults.by_size?.[sizeKey] || 2;
      
      if (material_category === 'HEAVY') {
        assumedTons = Math.min(assumedTons * 3, defaults.heavy_cap || 10);
      } else if (material_category === 'DEBRIS_HEAVY') {
        assumedTons = assumedTons * (defaults.debris_heavy_multiplier || 1.25);
      }
    }

    if (dumpBreakdown.model === 'PER_TON') {
      const costPerTon = dumpProfile?.default_cost_per_ton || 65;
      dumpBreakdown.cost_per_ton = costPerTon;
      dumpBreakdown.assumed_tons = assumedTons;
      dumpBreakdown.total_dump_cost = Math.round(costPerTon * assumedTons * 100) / 100;
    } else if (dumpBreakdown.model === 'PER_LOAD') {
      const costPerLoad = dumpProfile?.default_cost_per_load || 150;
      dumpBreakdown.cost_per_load = costPerLoad;
      dumpBreakdown.total_dump_cost = costPerLoad;
    } else {
      dumpBreakdown.total_dump_cost = dumpProfile?.default_cost_per_load || 100;
    }

    // Calculate costs for each model
    function calculateInHouseCost(): CostBreakdown {
      const rates = inhouseRates || {
        cost_per_hour: 85,
        cost_per_mile: 2.5,
        minimum_charge_per_run: 125,
        overhead_multiplier: overheadMultiplier,
      };

      const hours = totalMinutes / 60;
      const hourCost = hours * (rates.cost_per_hour || 85);
      const mileCost = totalMiles * (rates.cost_per_mile || 0);
      const rawCost = (hourCost + mileCost) * (rates.overhead_multiplier || overheadMultiplier);
      const minCharge = rates.minimum_charge_per_run || 0;
      const finalCost = Math.max(rawCost, minCharge);

      return {
        model: 'IN_HOUSE',
        hours: Math.round(hours * 100) / 100,
        miles: totalMiles,
        mileage_cost: Math.round(mileCost * 100) / 100,
        overhead_multiplier: rates.overhead_multiplier || overheadMultiplier,
        minimum_applied: rawCost < minCharge,
        total_truck_cost: Math.round(finalCost * 100) / 100,
      };
    }

    function calculateOwnerOpCost(): CostBreakdown {
      const rates = ownerOpRates || {
        payout_delivery: 150,
        payout_pickup: 175,
        payout_swap: 225,
        mileage_rate: 0.75,
        minimum_payout: 125,
        toll_policy_json: { reimburse: true, max_per_run: 25 },
      };

      let basePayout: number;
      switch (service_type) {
        case 'DELIVERY':
          basePayout = rates.payout_delivery || 150;
          break;
        case 'PICKUP':
          basePayout = rates.payout_pickup || 175;
          break;
        case 'SWAP':
          basePayout = rates.payout_swap || 225;
          break;
        default:
          basePayout = 150;
      }

      const mileageCost = totalMiles * (rates.mileage_rate || 0);
      const tollPolicy = rates.toll_policy_json as { reimburse?: boolean; max_per_run?: number } | null;
      const tollEstimate = tollPolicy?.reimburse ? Math.min(10, tollPolicy.max_per_run || 25) : 0;
      const rawCost = basePayout + mileageCost + tollEstimate;
      const minPayout = rates.minimum_payout || 0;
      const finalCost = Math.max(rawCost, minPayout);

      return {
        model: 'OWNER_OPERATOR',
        base_payout: basePayout,
        miles: totalMiles,
        mileage_cost: Math.round(mileageCost * 100) / 100,
        toll_estimate: tollEstimate,
        minimum_applied: rawCost < minPayout,
        total_truck_cost: Math.round(finalCost * 100) / 100,
      };
    }

    function createEstimate(breakdown: CostBreakdown): ModelEstimate {
      const totalCost = breakdown.total_truck_cost + dumpBreakdown.total_dump_cost;
      const margin = customer_price - totalCost;
      const marginPct = customer_price > 0 ? (margin / customer_price) * 100 : 0;

      return {
        cost_model: breakdown.model,
        truck_cost: breakdown.total_truck_cost,
        dump_cost: dumpBreakdown.total_dump_cost,
        total_cost: Math.round(totalCost * 100) / 100,
        customer_price,
        margin: Math.round(margin * 100) / 100,
        margin_pct: Math.round(marginPct * 100) / 100,
        breakdown,
      };
    }

    // Calculate primary model
    const primaryBreakdown = primaryModel === 'IN_HOUSE' ? calculateInHouseCost() : calculateOwnerOpCost();
    const primaryEstimate = createEstimate(primaryBreakdown);

    // Calculate alternative model if requested
    let alternativeEstimate: ModelEstimate | undefined;
    let bestModel: CostModel = primaryModel;
    let marginDelta: number | undefined;
    let costDelta: number | undefined;

    if (compare_models) {
      const altBreakdown = primaryModel === 'IN_HOUSE' ? calculateOwnerOpCost() : calculateInHouseCost();
      alternativeEstimate = createEstimate(altBreakdown);

      if (alternativeEstimate.margin > primaryEstimate.margin) {
        bestModel = alternativeEstimate.cost_model;
      }
      marginDelta = Math.round((alternativeEstimate.margin_pct - primaryEstimate.margin_pct) * 100) / 100;
      costDelta = Math.round((alternativeEstimate.total_cost - primaryEstimate.total_cost) * 100) / 100;
    }

    // Check guardrails
    let guardrail: ServiceCostResponse['guardrail'];
    const effectiveMarginPct = compare_models && alternativeEstimate && alternativeEstimate.margin_pct > primaryEstimate.margin_pct
      ? alternativeEstimate.margin_pct
      : primaryEstimate.margin_pct;

    if (effectiveMarginPct < marginCriticalThreshold) {
      let recommendedAction = 'Requires manager approval. ';
      if (compare_models && alternativeEstimate && alternativeEstimate.margin > primaryEstimate.margin) {
        recommendedAction += `Consider switching to ${alternativeEstimate.cost_model} for +${marginDelta}% margin.`;
      } else {
        recommendedAction += 'Consider renegotiating price or using different facility.';
      }
      
      guardrail = {
        severity: 'CRITICAL',
        reason: `Margin ${effectiveMarginPct.toFixed(1)}% is below critical threshold (${marginCriticalThreshold}%)`,
        recommended_action: recommendedAction,
      };
    } else if (effectiveMarginPct < marginWarnThreshold) {
      guardrail = {
        severity: 'WARN',
        reason: `Margin ${effectiveMarginPct.toFixed(1)}% is below warning threshold (${marginWarnThreshold}%)`,
        recommended_action: compare_models && alternativeEstimate && alternativeEstimate.margin > primaryEstimate.margin
          ? `Consider ${alternativeEstimate.cost_model} model for better margin.`
          : 'Monitor job profitability.',
      };
    }

    // Store result in service_cost_estimates
    if (entity_type && entity_id) {
      const comparisonJson = compare_models ? {
        primary: primaryEstimate,
        alternative: alternativeEstimate,
        best_model: bestModel,
        margin_delta: marginDelta,
        cost_delta: costDelta,
      } : null;

      await supabase.from('service_cost_estimates').upsert({
        entity_type,
        entity_id,
        market_code,
        service_type,
        vehicle_type,
        material_category,
        material_code,
        estimated_total_minutes: totalMinutes,
        estimated_drive_minutes: driveMinutes,
        estimated_handling_minutes: handlingMinutes,
        estimated_dump_minutes: dumpMinutes,
        assumed_dump_fee_cost: dumpBreakdown.total_dump_cost,
        estimated_truck_cost: primaryEstimate.truck_cost,
        estimated_total_cost: primaryEstimate.total_cost,
        customer_price,
        estimated_margin: primaryEstimate.margin,
        estimated_margin_pct: primaryEstimate.margin_pct,
        cost_model_used: primaryModel,
        truck_cost_breakdown_json: primaryBreakdown,
        dump_cost_breakdown_json: dumpBreakdown,
        comparison_json: comparisonJson,
        route_miles: totalMiles,
        alternative_model_cost: alternativeEstimate?.total_cost,
        alternative_model_margin_pct: alternativeEstimate?.margin_pct,
        best_model: compare_models ? bestModel : null,
      }, {
        onConflict: 'entity_type,entity_id',
        ignoreDuplicates: false,
      });

      // Create guardrail event if needed
      if (guardrail && (guardrail.severity === 'WARN' || guardrail.severity === 'CRITICAL')) {
        await supabase.from('profit_guardrail_events').insert({
          entity_type,
          entity_id,
          severity: guardrail.severity,
          reason: guardrail.reason,
          recommended_action: guardrail.recommended_action,
        });
      }
    }

    const response: ServiceCostResponse = {
      success: true,
      primary_estimate: primaryEstimate,
      alternative_estimate: alternativeEstimate,
      best_model: bestModel,
      margin_delta: marginDelta,
      cost_delta: costDelta,
      time_breakdown: {
        total_minutes: totalMinutes,
        drive_minutes: driveMinutes,
        handling_minutes: handlingMinutes,
        dump_minutes: dumpMinutes,
      },
      dump_breakdown: dumpBreakdown,
      guardrail,
    };

    console.log('Service cost calculated:', JSON.stringify(response));

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Calculate service cost error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
