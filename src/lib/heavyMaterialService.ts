// Heavy Material Weight & Fill-Line Enforcement Service
// Phase 2: Weight Estimation Engine

import { supabase } from '@/integrations/supabase/client';

export interface HeavyMaterialProfile {
  id: string;
  material_code: string;
  display_name: string;
  display_name_es: string | null;
  density_ton_per_yd3_min: number;
  density_ton_per_yd3_max: number;
  recommended_fill_pct: number;
  max_tons_cap: number;
  green_halo_allowed: boolean;
  icon: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

export interface HeavyWeightRule {
  id: string;
  size_yd: number;
  material_code: string;
  fill_line_pct: number;
  estimated_weight_min_tons: number;
  estimated_weight_max_tons: number;
  allow_full_fill: boolean;
  hard_stop_over_tons: boolean;
}

export interface WeightEstimation {
  volumeEffective: number;
  weightMinTons: number;
  weightMaxTons: number;
  riskLevel: 'LOW' | 'MED' | 'HIGH';
  recommendedFillPct: number;
  allowFullFill: boolean;
  greenHaloAllowed: boolean;
}

export interface HeavyQuoteData {
  isHeavyMaterial: boolean;
  heavyMaterialCode: string | null;
  requestedGreenHalo: boolean;
  estimatedFillPct: number | null;
  estimatedWeightTonsMin: number | null;
  estimatedWeightTonsMax: number | null;
  weightRiskLevel: 'LOW' | 'MED' | 'HIGH' | null;
  requiresFillLine: boolean;
  requiresPrePickupPhotos: boolean;
  reclassifyOnContamination: boolean;
}

// Constants
export const HEAVY_SIZES = [5, 6, 8, 10] as const;
export const MAX_WEIGHT_TONS = 10;
export const EXTRA_TON_RATE = 165; // $165/ton
export const OVERDUE_DAILY_RATE = 35; // $35/day

// Included tons by size for debris reclassification
export const DEBRIS_INCLUDED_TONS: Record<number, number> = {
  5: 0.50,
  6: 0.60,
  8: 0.80,
  10: 1.00,
};

// Fetch all active heavy material profiles
export async function fetchHeavyMaterialProfiles(): Promise<HeavyMaterialProfile[]> {
  const { data, error } = await supabase
    .from('heavy_material_profiles')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching heavy material profiles:', error);
    return [];
  }

  return data || [];
}

// Fetch weight rules for a specific size
export async function fetchWeightRulesForSize(sizeYd: number): Promise<HeavyWeightRule[]> {
  const { data, error } = await supabase
    .from('heavy_weight_rules')
    .select('*')
    .eq('size_yd', sizeYd)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching weight rules:', error);
    return [];
  }

  return data || [];
}

// Client-side weight estimation (mirrors DB function)
export function estimateHeavyWeight(
  sizeYd: number,
  profile: HeavyMaterialProfile,
  fillPct?: number
): WeightEstimation {
  const fill = fillPct ?? profile.recommended_fill_pct;
  const volumeEffective = sizeYd * fill;
  const weightMinTons = Math.round(volumeEffective * profile.density_ton_per_yd3_min * 100) / 100;
  const weightMaxTons = Math.round(volumeEffective * profile.density_ton_per_yd3_max * 100) / 100;
  
  let riskLevel: 'LOW' | 'MED' | 'HIGH';
  if (weightMaxTons > MAX_WEIGHT_TONS) {
    riskLevel = 'HIGH';
  } else if (weightMinTons > 9 || weightMaxTons > 9) {
    riskLevel = 'MED';
  } else {
    riskLevel = 'LOW';
  }

  const allowFullFill = ['WOOD_CLEAN', 'GRASS_CLEAN', 'WOOD_CHIPS_CLEAN'].includes(profile.material_code);

  return {
    volumeEffective,
    weightMinTons,
    weightMaxTons,
    riskLevel,
    recommendedFillPct: profile.recommended_fill_pct,
    allowFullFill,
    greenHaloAllowed: profile.green_halo_allowed,
  };
}

// Force fill percentage to recommended if trying to overfill heavy material
export function enforceFillLimit(
  profile: HeavyMaterialProfile,
  requestedFillPct: number
): { fillPct: number; wasEnforced: boolean; message?: string } {
  const allowFullFill = ['WOOD_CLEAN', 'GRASS_CLEAN', 'WOOD_CHIPS_CLEAN'].includes(profile.material_code);
  
  if (allowFullFill) {
    return { fillPct: requestedFillPct, wasEnforced: false };
  }

  if (requestedFillPct > profile.recommended_fill_pct) {
    return {
      fillPct: profile.recommended_fill_pct,
      wasEnforced: true,
      message: `Heavy materials cannot be filled above ${Math.round(profile.recommended_fill_pct * 100)}%. Fill level has been adjusted to prevent overweight.`,
    };
  }

  return { fillPct: requestedFillPct, wasEnforced: false };
}

// Calculate extra tons charge for reclassified orders
export function calculateExtraTonsCharge(
  actualWeightTons: number,
  sizeYd: number
): { includedTons: number; extraTons: number; extraCharge: number } {
  const includedTons = DEBRIS_INCLUDED_TONS[sizeYd] || 1.0;
  const extraTons = Math.max(0, actualWeightTons - includedTons);
  const extraCharge = Math.round(extraTons * EXTRA_TON_RATE * 100) / 100;

  return { includedTons, extraTons, extraCharge };
}

// Generate warning messages for weight risk
export function getWeightWarningMessage(
  riskLevel: 'LOW' | 'MED' | 'HIGH',
  weightMinTons: number,
  weightMaxTons: number
): { message: string; severity: 'info' | 'warning' | 'error' } | null {
  if (riskLevel === 'HIGH') {
    return {
      message: `⚠️ Overweight Risk: Estimated ${weightMinTons.toFixed(1)}–${weightMaxTons.toFixed(1)} tons exceeds 10-ton limit. Must follow fill line.`,
      severity: 'error',
    };
  }

  if (riskLevel === 'MED') {
    return {
      message: `⚡ Close to Weight Limit: Estimated ${weightMinTons.toFixed(1)}–${weightMaxTons.toFixed(1)} tons. Follow fill line carefully.`,
      severity: 'warning',
    };
  }

  return null;
}

// Build heavy quote data from form inputs
export function buildHeavyQuoteData(
  profile: HeavyMaterialProfile | null,
  sizeYd: number,
  fillPct: number,
  requestGreenHalo: boolean
): HeavyQuoteData {
  if (!profile) {
    return {
      isHeavyMaterial: false,
      heavyMaterialCode: null,
      requestedGreenHalo: false,
      estimatedFillPct: null,
      estimatedWeightTonsMin: null,
      estimatedWeightTonsMax: null,
      weightRiskLevel: null,
      requiresFillLine: false,
      requiresPrePickupPhotos: false,
      reclassifyOnContamination: true,
    };
  }

  const estimation = estimateHeavyWeight(sizeYd, profile, fillPct);
  const requiresFillLine = !estimation.allowFullFill;

  return {
    isHeavyMaterial: true,
    heavyMaterialCode: profile.material_code,
    requestedGreenHalo: requestGreenHalo && profile.green_halo_allowed,
    estimatedFillPct: fillPct,
    estimatedWeightTonsMin: estimation.weightMinTons,
    estimatedWeightTonsMax: estimation.weightMaxTons,
    weightRiskLevel: estimation.riskLevel,
    requiresFillLine,
    requiresPrePickupPhotos: true, // All heavy orders require pre-pickup photos
    reclassifyOnContamination: true,
  };
}

// Get education text for customers
export function getHeavyEducationText(profile: HeavyMaterialProfile, sizeYd: number): string {
  const fullFillEstimate = estimateHeavyWeight(sizeYd, profile, 1.0);
  const recommendedEstimate = estimateHeavyWeight(sizeYd, profile);

  if (fullFillEstimate.allowFullFill) {
    return `A ${sizeYd}-yard dumpster of ${profile.display_name.toLowerCase()} can be filled to the top (${fullFillEstimate.weightMinTons.toFixed(1)}–${fullFillEstimate.weightMaxTons.toFixed(1)} tons estimated).`;
  }

  return `A ${sizeYd}-yard dumpster filled 100% with ${profile.display_name.toLowerCase()} can weigh ${fullFillEstimate.weightMinTons.toFixed(0)}–${fullFillEstimate.weightMaxTons.toFixed(0)} tons (over limit). Fill to ${Math.round(profile.recommended_fill_pct * 100)}% line for safe ${recommendedEstimate.weightMinTons.toFixed(1)}–${recommendedEstimate.weightMaxTons.toFixed(1)} tons.`;
}
