// Disposal Cost Engine — Phases 2, 3, 4, 7, 8
// Calculates real cost-driven pricing using disposal sites, material weights, and yard config

import { supabase } from '@/integrations/supabase/client';
import type {
  DisposalSite,
  DisposalRate,
  MaterialWeightReference,
  YardDisposalConfig,
  DisposalCostInput,
  DisposalRouteOption,
  DisposalCostResult,
  MaterialBreakdownItem,
} from '@/types/disposal';
import { getMarginClass } from '@/services/calculatorService';

// ── Defaults ──
const DEFAULT_CONFIG: Omit<YardDisposalConfig, 'id' | 'yard_id' | 'created_at' | 'updated_at' | 'default_disposal_site_ids' | 'notes'> = {
  markup_pct: 0,
  fuel_cost_per_mile: 3.50,
  labor_hourly_rate: 55,
  overhead_factor: 1.15,
  min_margin_pct: 20,
  compliance_mode: false,
};

// ── Haversine distance (miles) ──
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Fetch disposal sites ──
export async function getDisposalSites(): Promise<DisposalSite[]> {
  const { data, error } = await supabase
    .from('disposal_sites')
    .select('*')
    .eq('is_active', true)
    .order('compliance_rating', { ascending: false });
  if (error) {
    console.error('Failed to fetch disposal sites:', error);
    return [];
  }
  return data as unknown as DisposalSite[];
}

// ── Fetch disposal rates for a site ──
export async function getDisposalRates(siteId: string): Promise<DisposalRate[]> {
  const { data, error } = await supabase
    .from('disposal_rates')
    .select('*')
    .eq('disposal_site_id', siteId)
    .eq('is_active', true);
  if (error) {
    console.error('Failed to fetch disposal rates:', error);
    return [];
  }
  return data as unknown as DisposalRate[];
}

// ── Fetch material weight references ──
export async function getMaterialWeights(): Promise<MaterialWeightReference[]> {
  const { data, error } = await supabase
    .from('material_weight_reference')
    .select('*')
    .order('material_name');
  if (error) {
    console.error('Failed to fetch material weights:', error);
    return [];
  }
  return data as unknown as MaterialWeightReference[];
}

// ── Fetch yard config ──
export async function getYardConfig(yardId: string): Promise<YardDisposalConfig | null> {
  const { data, error } = await supabase
    .from('yard_disposal_config')
    .select('*')
    .eq('yard_id', yardId)
    .maybeSingle();
  if (error) {
    console.error('Failed to fetch yard config:', error);
    return null;
  }
  return data as unknown as YardDisposalConfig | null;
}

// ── Phase 2: Match best disposal sites ──
function rankDisposalSites(
  sites: DisposalSite[],
  siteLat: number,
  siteLng: number,
  materialType: string,
  complianceMode: boolean,
): Array<DisposalSite & { distance_miles: number; score: number }> {
  return sites
    .filter((s) => {
      if (!s.lat || !s.lng) return false;
      // Material compatibility
      const accepted = s.materials_accepted.map((m) => m.toLowerCase());
      const matLower = materialType.toLowerCase();
      const compatible =
        accepted.length === 0 ||
        accepted.includes(matLower) ||
        accepted.includes('all') ||
        accepted.includes('general');
      if (!compatible) return false;
      // Compliance filter
      if (complianceMode && s.type !== 'recycling') return false;
      return true;
    })
    .map((s) => {
      const distance = haversineDistance(siteLat, siteLng, s.lat!, s.lng!);
      // Score: lower is better. Weighted by distance, wait time, and inverse compliance
      const score =
        distance * 2 +
        (s.typical_wait_time_min || 20) * 0.5 -
        (s.compliance_rating || 3) * 5;
      return { ...s, distance_miles: Math.round(distance * 10) / 10, score };
    })
    .sort((a, b) => a.score - b.score);
}

// ── Phase 3: Calculate truck cycle cost ──
function calculateTruckCycleCost(
  config: typeof DEFAULT_CONFIG,
  totalMiles: number,
  totalMinutes: number,
): { truckCost: number; overheadCost: number } {
  const laborHours = totalMinutes / 60;
  const laborCost = laborHours * config.labor_hourly_rate;
  const fuelCost = totalMiles * config.fuel_cost_per_mile;
  const truckCost = laborCost + fuelCost;
  const overheadCost = truckCost * (config.overhead_factor - 1);
  return { truckCost: Math.round(truckCost * 100) / 100, overheadCost: Math.round(overheadCost * 100) / 100 };
}

// ── Phase 3: Build time breakdown ──
function buildTimeBreakdown(
  travelToSiteMiles: number,
  travelToDisposalMiles: number,
  serviceType: DisposalCostInput['service_type'],
  dumpWaitMin: number,
): DisposalRouteOption['breakdown'] {
  const travelToSiteMin = Math.round((travelToSiteMiles / 25) * 60); // ~25mph avg
  const travelToDisposalMin = Math.round((travelToDisposalMiles / 30) * 60); // ~30mph avg
  const returnMiles = travelToDisposalMiles * 0.9; // slightly less on return
  const returnMin = Math.round((returnMiles / 30) * 60);

  return {
    yard_prep_min: 10,
    travel_to_site_min: travelToSiteMin,
    dropoff_min: serviceType === 'SWAP' ? 20 : 15,
    pickup_secure_min: serviceType === 'SWAP' ? 30 : 15,
    travel_to_disposal_min: travelToDisposalMin,
    dump_wait_min: dumpWaitMin,
    return_to_yard_min: returnMin,
  };
}

// ── Phase 6: Material breakdown ──
export function calculateMaterialBreakdown(
  materials: MaterialWeightReference[],
  selections: Array<{ material_name: string; cubic_yards: number }>,
  disposalRatePerTon: number,
): MaterialBreakdownItem[] {
  return selections.map((sel) => {
    const ref = materials.find(
      (m) => m.material_name.toLowerCase() === sel.material_name.toLowerCase(),
    );
    const weightPerYd = ref?.estimated_weight_per_cubic_yard || 400;
    const totalLbs = weightPerYd * sel.cubic_yards;
    const tons = totalLbs / 2000;
    const disposalCost = Math.round(tons * disposalRatePerTon * 100) / 100;

    return {
      material_name: sel.material_name,
      cubic_yards: sel.cubic_yards,
      estimated_weight_lbs: Math.round(totalLbs),
      estimated_tons: Math.round(tons * 100) / 100,
      estimated_disposal_cost: disposalCost,
      is_heavy: ref?.heavy_only || false,
      requires_separation: ref?.requires_separation || false,
    };
  });
}

// ── Main Engine (Phases 2-4, 7-8) ──
export async function calculateDisposalCost(
  input: DisposalCostInput,
): Promise<DisposalCostResult> {
  const warnings: string[] = [];

  try {
    // Fetch all data in parallel
    const [sites, materials, yardConfig] = await Promise.all([
      getDisposalSites(),
      getMaterialWeights(),
      getYardConfig(input.yard_id),
    ]);

    const config = {
      ...DEFAULT_CONFIG,
      ...(yardConfig || {}),
    };

    const complianceMode = input.compliance_mode ?? config.compliance_mode;

    // Find material weight info
    const materialRef = materials.find(
      (m) => m.material_name.toLowerCase() === input.material_type.toLowerCase(),
    );
    const weightPerYd = materialRef?.estimated_weight_per_cubic_yard || 400;
    const estimatedTons = (weightPerYd * input.dumpster_size_yd) / 2000;
    const isHeavy = materialRef?.heavy_only || false;

    // Heavy enforcement
    if (isHeavy && input.dumpster_size_yd > (materialRef?.max_dumpster_size || 10)) {
      warnings.push(
        `Heavy material ${input.material_type} restricted to ${materialRef?.max_dumpster_size || 10}yd containers`,
      );
    }

    // Phase 2: Rank disposal sites
    const ranked = rankDisposalSites(
      sites,
      input.destination_lat,
      input.destination_lng,
      input.material_type,
      complianceMode,
    );

    if (ranked.length === 0) {
      return {
        success: false,
        material_weight: {
          material_name: input.material_type,
          estimated_tons: estimatedTons,
          density_class: materialRef?.typical_density_class || 'medium',
          is_heavy: isHeavy,
        },
        warnings,
        error: 'No compatible disposal sites found for this material and location',
      };
    }

    // Build two options: affordable (cheapest) and premium (best facility)
    const buildOption = async (
      site: (typeof ranked)[0],
      label: 'affordable' | 'premium',
    ): Promise<DisposalRouteOption | null> => {
      // Fetch rates for this site
      const rates = await getDisposalRates(site.id);
      const matchedRate = rates.find(
        (r) => r.material_type.toLowerCase() === input.material_type.toLowerCase(),
      ) || rates.find((r) => r.material_type.toLowerCase() === 'general');

      // Calculate disposal cost
      let disposalCost = 0;
      if (matchedRate?.flat_fee) {
        disposalCost = Number(matchedRate.flat_fee);
      } else if (matchedRate?.price_per_ton) {
        disposalCost = Number(matchedRate.price_per_ton) * estimatedTons;
      } else {
        // Fallback estimate
        disposalCost = estimatedTons * 115;
      }
      if (matchedRate?.minimum_fee && disposalCost < Number(matchedRate.minimum_fee)) {
        disposalCost = Number(matchedRate.minimum_fee);
      }

      // Distance calculations
      const travelToSiteMiles = site.distance_miles;
      const travelToDisposalMiles = site.distance_miles * 0.6; // disposal usually closer to site
      const totalMiles = travelToSiteMiles + travelToDisposalMiles + travelToDisposalMiles * 0.9;

      const breakdown = buildTimeBreakdown(
        travelToSiteMiles,
        travelToDisposalMiles,
        input.service_type,
        site.typical_wait_time_min || 20,
      );
      const totalMinutes = Object.values(breakdown).reduce((a, b) => a + b, 0);

      const { truckCost, overheadCost } = calculateTruckCycleCost(config, totalMiles, totalMinutes);
      const totalInternalCost = Math.round((truckCost + overheadCost + disposalCost) * 100) / 100;

      // Margin-protected pricing
      const minMargin = config.min_margin_pct / 100;
      const suggestedPrice = Math.ceil(totalInternalCost / (1 - Math.max(minMargin, 0.25)) / 5) * 5;
      const marginPct = ((suggestedPrice - totalInternalCost) / suggestedPrice) * 100;

      return {
        route_label: label,
        disposal_site: {
          id: site.id,
          name: site.name,
          type: site.type,
          city: site.city,
          compliance_rating: site.compliance_rating,
          typical_wait_time_min: site.typical_wait_time_min,
        },
        distance_miles: site.distance_miles,
        disposal_cost: Math.round(disposalCost * 100) / 100,
        truck_cycle_cost: truckCost,
        overhead_cost: overheadCost,
        total_internal_cost: totalInternalCost,
        suggested_price: suggestedPrice,
        margin_pct: Math.round(marginPct * 10) / 10,
        margin_class: getMarginClass(marginPct),
        estimated_cycle_minutes: totalMinutes,
        breakdown,
      };
    };

    // Affordable = lowest score (closest/cheapest), Premium = highest compliance
    const affordable = await buildOption(ranked[0], 'affordable');
    const premiumCandidate = ranked.find(
      (s) => s.compliance_rating >= 4 && s.id !== ranked[0].id,
    ) || ranked[Math.min(1, ranked.length - 1)];
    const premium =
      premiumCandidate.id !== ranked[0].id
        ? await buildOption(premiumCandidate, 'premium')
        : null;

    // Phase 8: Margin protection warnings
    if (affordable && affordable.margin_pct < config.min_margin_pct) {
      warnings.push(
        `Affordable route margin (${affordable.margin_pct}%) is below minimum threshold (${config.min_margin_pct}%). Admin override required.`,
      );
    }

    return {
      success: true,
      affordable_option: affordable || undefined,
      premium_option: premium || undefined,
      material_weight: {
        material_name: input.material_type,
        estimated_tons: Math.round(estimatedTons * 100) / 100,
        density_class: materialRef?.typical_density_class || 'medium',
        is_heavy: isHeavy,
      },
      warnings,
    };
  } catch (error) {
    console.error('Disposal cost engine error:', error);
    return {
      success: false,
      material_weight: {
        material_name: input.material_type,
        estimated_tons: 0,
        density_class: 'medium',
        is_heavy: false,
      },
      warnings,
      error: 'Failed to calculate disposal cost',
    };
  }
}

// ── CRUD helpers for admin ──

export async function createDisposalSite(
  site: Omit<DisposalSite, 'id' | 'created_at' | 'updated_at'>,
): Promise<DisposalSite | null> {
  const { data, error } = await supabase
    .from('disposal_sites')
    .insert([site as any])
    .select()
    .single();
  if (error) {
    console.error('Failed to create disposal site:', error);
    return null;
  }
  return data as unknown as DisposalSite;
}

export async function updateDisposalSite(
  id: string,
  updates: Partial<DisposalSite>,
): Promise<boolean> {
  const { error } = await supabase
    .from('disposal_sites')
    .update(updates as any)
    .eq('id', id);
  if (error) {
    console.error('Failed to update disposal site:', error);
    return false;
  }
  return true;
}

export async function createDisposalRate(
  rate: Omit<DisposalRate, 'id' | 'created_at' | 'updated_at'>,
): Promise<DisposalRate | null> {
  const { data, error } = await supabase
    .from('disposal_rates')
    .insert([rate as any])
    .select()
    .single();
  if (error) {
    console.error('Failed to create disposal rate:', error);
    return null;
  }
  return data as unknown as DisposalRate;
}

export async function saveYardConfig(
  config: Omit<YardDisposalConfig, 'id' | 'created_at' | 'updated_at'>,
): Promise<boolean> {
  const { error } = await supabase
    .from('yard_disposal_config')
    .upsert([config as any], { onConflict: 'yard_id' });
  if (error) {
    console.error('Failed to save yard config:', error);
    return false;
  }
  return true;
}
