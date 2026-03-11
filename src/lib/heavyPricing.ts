// Heavy Material Pricing Logic - CALSAN CANON SCRIPT
// Imports from shared-data.ts as single source of truth
// Implements proportional pricing (10→8→6) with sub-classification

import { 
  HEAVY_BASE_10YD, 
  HEAVY_SIZE_FACTORS, 
  HEAVY_INCREMENTS,
  PRICING_POLICIES,
  type HeavyMaterialClass as SharedHeavyMaterialClass 
} from './shared-data';

// Re-export type for backward compatibility
export type HeavyMaterialClass = SharedHeavyMaterialClass;

// ============================================================
// HEAVY MATERIAL CLASSIFICATIONS
// ============================================================

export interface HeavyMaterialCategory {
  id: HeavyMaterialClass;
  label: string;
  labelEs: string;
  description: string;
  descriptionEs: string;
  materials: string[];
  materialsEs: string[];
  increment: number; // From HEAVY_INCREMENTS
  icon: string;
}

// Heavy Clean Base Materials (Recyclable depending on facility/zone)
// Heavy Clean +$200 Materials (higher handling cost)
// Heavy Mixed (between heavy materials) +$300
export const HEAVY_MATERIAL_CATEGORIES: HeavyMaterialCategory[] = [
  {
    id: 'base',
    label: 'Clean Single Material',
    labelEs: 'Material Único Limpio',
    description: 'Clean concrete, soil/dirt, sand, or gravel only (no mixing)',
    descriptionEs: 'Solo concreto, tierra, arena o grava limpia (sin mezclar)',
    materials: ['Clean concrete', 'Clean soil/dirt', 'Clean sand', 'Clean gravel'],
    materialsEs: ['Concreto limpio', 'Tierra limpia', 'Arena limpia', 'Grava limpia'],
    increment: HEAVY_INCREMENTS.base,
    icon: '🪨',
  },
  {
    id: 'plus_200',
    label: 'Specialty Heavy Materials',
    labelEs: 'Materiales Pesados Especializados',
    description: 'Brick, asphalt, tile, roofing gravel, or rock/stone',
    descriptionEs: 'Ladrillo, asfalto, azulejo, grava de techo o piedra',
    materials: ['Brick', 'Asphalt', 'Roofing gravel', 'Tile (ceramic/porcelain/stone)', 'Rock/stone/granite'],
    materialsEs: ['Ladrillo', 'Asfalto', 'Grava de techo', 'Azulejo (cerámica/porcelana/piedra)', 'Piedra/granito'],
    increment: HEAVY_INCREMENTS.plus_200,
    icon: '🧱',
  },
  {
    id: 'mixed_heavy',
    label: 'Mixed Heavy Materials',
    labelEs: 'Materiales Pesados Mezclados',
    description: 'Any mix of heavy materials together (e.g., concrete + soil)',
    descriptionEs: 'Cualquier mezcla de materiales pesados (ej: concreto + tierra)',
    materials: ['Concrete + soil', 'Brick + gravel', 'Tile + rock', 'Any heavy material combination'],
    materialsEs: ['Concreto + tierra', 'Ladrillo + grava', 'Azulejo + piedra', 'Cualquier combinación de pesados'],
    increment: HEAVY_INCREMENTS.mixed_heavy,
    icon: '🔀',
  },
];

// ============================================================
// CITY-BASED RATE CONFIGURATION
// Uses canonical values from shared-data.ts
// ============================================================

export interface CityHeavyPricing {
  cityId: string;
  cityName: string;
  heavyBase10yd: number;
  extraTonRateStandard: number;
  extraTonRatePrepay: number;
  discountPct: number;
}

// Current rates (Oakland & San Jose) - Uses canonical HEAVY_BASE_10YD
export const CITY_HEAVY_PRICING: Record<string, CityHeavyPricing> = {
  'oakland': {
    cityId: 'oakland',
    cityName: 'Oakland',
    heavyBase10yd: HEAVY_BASE_10YD,
    extraTonRateStandard: PRICING_POLICIES.overagePerTonGeneral,
    extraTonRatePrepay: PRICING_POLICIES.overagePerTonGeneral * 0.95, // 5% off
    discountPct: 0.05,
  },
  'san_jose': {
    cityId: 'san_jose',
    cityName: 'San Jose',
    heavyBase10yd: HEAVY_BASE_10YD,
    extraTonRateStandard: PRICING_POLICIES.overagePerTonGeneral,
    extraTonRatePrepay: PRICING_POLICIES.overagePerTonGeneral * 0.95,
    discountPct: 0.05,
  },
};

// Default city pricing (used when city not specified)
export const DEFAULT_CITY_PRICING = CITY_HEAVY_PRICING['oakland'];

// ============================================================
// PROPORTIONAL PRICING FACTORS - From shared-data.ts
// ============================================================

export const SIZE_FACTORS = HEAVY_SIZE_FACTORS;

// ============================================================
// PRICING CALCULATION FUNCTIONS
// ============================================================

export interface HeavyPriceResult {
  size: number;
  basePrice10yd: number;
  incrementApplied: number;
  adjustedBase: number;
  factor: number;
  finalPrice: number;
  roundedPrice: number;
  materialClass: HeavyMaterialClass;
  isFlatFee: true;
  savingsMessage: string | null;
}

/**
 * Calculate heavy material price based on approved flat-rate ladder
 * Base prices: 6yd=$495, 8yd=$595, 10yd=$695.50 + material increment
 */
export function calculateHeavyPrice(
  size: 5 | 8 | 10,
  materialClass: HeavyMaterialClass,
  cityId: string = 'oakland'
): HeavyPriceResult {
  const cityPricing = CITY_HEAVY_PRICING[cityId] || DEFAULT_CITY_PRICING;
  const category = HEAVY_MATERIAL_CATEGORIES.find(c => c.id === materialClass);
  const increment = category?.increment || 0;
  
  const basePrice10yd = cityPricing.heavyBase10yd;
  const adjustedBase = basePrice10yd + increment;
  const factor = SIZE_FACTORS[size] || 1.0;
  const finalPrice = adjustedBase * factor;
  const roundedPrice = Math.round(finalPrice * 100) / 100; // Round to cents
  
  // Calculate savings message for smaller sizes
  let savingsMessage: string | null = null;
  const savings10yd = ((adjustedBase - roundedPrice) / adjustedBase * 100);
  if (size === 8 && savings10yd > 0) {
    savingsMessage = `${Math.round(savings10yd)}% less than 10 yd`;
  } else if (size === 6 && savings10yd > 0) {
    savingsMessage = `${Math.round(savings10yd)}% less than 10 yd`;
  }
  
  return {
    size,
    basePrice10yd,
    incrementApplied: increment,
    adjustedBase,
    factor,
    finalPrice,
    roundedPrice,
    materialClass,
    isFlatFee: true,
    savingsMessage,
  };
}

/**
 * Get all heavy prices for a given material class and city
 */
export function getAllHeavyPrices(
  materialClass: HeavyMaterialClass,
  cityId: string = 'oakland'
): HeavyPriceResult[] {
  return [10, 8, 5].map(size => 
    calculateHeavyPrice(size as 5 | 8 | 10, materialClass, cityId)
  );
}

/**
 * Get heavy pricing table for display
 */
export function getHeavyPricingTable(cityId: string = 'oakland'): Record<HeavyMaterialClass, HeavyPriceResult[]> {
  return {
    base: getAllHeavyPrices('base', cityId),
    plus_200: getAllHeavyPrices('plus_200', cityId),
    mixed_heavy: getAllHeavyPrices('mixed_heavy', cityId),
  };
}

// ============================================================
// TRASH CONTAMINATION / RECLASSIFICATION
// ============================================================

export interface ReclassificationResult {
  reclassified: boolean;
  newMaterialType: 'general' | 'heavy';
  reason: string;
  reasonEs: string;
  allowedSizes: number[];
}

/**
 * Check if load should be reclassified to mixed debris
 * If trash/C&D is present with heavy materials, switch to general debris
 */
export function checkTrashContamination(
  hasTrash: boolean,
  originalMaterialType: 'heavy' | 'general'
): ReclassificationResult {
  if (originalMaterialType === 'heavy' && hasTrash) {
    return {
      reclassified: true,
      newMaterialType: 'general',
      reason: 'Reclassified as mixed debris due to trash contamination. Per-ton billing applies.',
      reasonEs: 'Reclasificado como escombros mixtos debido a contaminación con basura. Se aplica facturación por tonelada.',
      allowedSizes: [6, 8, 10, 20, 30, 40, 50], // General debris sizes
    };
  }
  
  if (originalMaterialType === 'heavy') {
    return {
      reclassified: false,
      newMaterialType: 'heavy',
      reason: 'Clean heavy material qualifies for flat-fee pricing.',
      reasonEs: 'Material pesado limpio califica para tarifa plana.',
      allowedSizes: [6, 8, 10], // Heavy-only sizes
    };
  }
  
  // Already general debris
  return {
    reclassified: false,
    newMaterialType: 'general',
    reason: '',
    reasonEs: '',
    allowedSizes: [6, 8, 10, 20, 30, 40, 50],
  };
}

// ============================================================
// DISPLAY HELPERS
// ============================================================

/**
 * Format price for display (rounded to nearest $1)
 */
export function formatHeavyPrice(price: number): string {
  return `$${Math.round(price)}`;
}

/**
 * Get material class label
 */
export function getMaterialClassLabel(materialClass: HeavyMaterialClass): string {
  const category = HEAVY_MATERIAL_CATEGORIES.find(c => c.id === materialClass);
  return category?.label || 'Unknown';
}

/**
 * Get material class increment display
 */
export function getMaterialClassIncrement(materialClass: HeavyMaterialClass): string {
  const category = HEAVY_MATERIAL_CATEGORIES.find(c => c.id === materialClass);
  if (!category) return '';
  if (category.increment === 0) return 'Base pricing';
  return `+$${category.increment}`;
}

// ============================================================
// VALIDATION
// ============================================================

/**
 * Validate size is allowed for heavy materials
 */
export function isValidHeavySize(size: number): size is 6 | 8 | 10 {
  return size === 6 || size === 8 || size === 10;
}

/**
 * Get heavy size recommendation for volume
 */
export function recommendHeavySize(estimatedVolumeCy: number): 6 | 8 | 10 {
  if (estimatedVolumeCy <= 6) return 6;
  if (estimatedVolumeCy <= 8) return 8;
  return 10;
}
