// ============================================================
// SIZE RECOMMENDATION ENGINE
// Determines category and recommends dumpster size based on selected items
// ============================================================
import { useMemo } from 'react';
import type { DisposalItem, ItemSelection } from './useDisposalItemCatalog';

type MaterialCategory = 'GENERAL_DEBRIS' | 'HEAVY_MATERIALS' | 'YARD_WASTE' | 'CLEAN_RECYCLING';

export interface SizeRecommendation {
  category: MaterialCategory;
  recommendedSize: number;
  alternativeSizes: number[];
  reasonShort: string;
  volumeScore: number;
  isHeavy: boolean;
  forcesDebrisHeavy: boolean; // Yard waste routes to debris heavy
  allowGreenHalo: boolean;
}

// Quantity multipliers for volume scoring
const QUANTITY_MULTIPLIERS: Record<string, number> = {
  SMALL: 0.7,
  MED: 1.0,
  LARGE: 1.4,
};

// Standard debris size mapping by volume score
const DEBRIS_SIZE_MAP = [
  { maxScore: 10, size: 10 },
  { maxScore: 20, size: 20 },
  { maxScore: 30, size: 30 },
  { maxScore: Infinity, size: 40 },
];

// Heavy sizes (only 5-10 available)
const HEAVY_SIZES = [5, 6, 8, 10];
const DEBRIS_SIZES = [10, 20, 30, 40];
const RECYCLING_SIZES = [10, 20, 30];

export function calculateSizeRecommendation(
  selections: ItemSelection[],
  catalogItems: DisposalItem[],
  marketAvailableSizes?: number[]
): SizeRecommendation {
  if (selections.length === 0) {
    return {
      category: 'GENERAL_DEBRIS',
      recommendedSize: 20,
      alternativeSizes: [10, 30],
      reasonShort: 'Most customers choose 20 yard for general projects.',
      volumeScore: 0,
      isHeavy: false,
      forcesDebrisHeavy: false,
      allowGreenHalo: false,
    };
  }

  // Build a lookup map
  const itemMap = new Map<string, DisposalItem>();
  for (const item of catalogItems) {
    itemMap.set(item.item_code, item);
  }

  // Analyze selections
  let volumeScore = 0;
  let hasHeavy = false;
  let hasYardWaste = false;
  let allRecycling = true;
  let hasCleanWoodOnly = true;

  for (const selection of selections) {
    const item = itemMap.get(selection.itemCode);
    if (!item) continue;

    const multiplier = QUANTITY_MULTIPLIERS[selection.quantity] || 1;
    volumeScore += item.volume_points * multiplier;

    // Check for forced categories
    if (item.forces_category === 'HEAVY_MATERIALS') {
      hasHeavy = true;
      allRecycling = false;
      hasCleanWoodOnly = false;
    } else if (item.forces_category === 'YARD_WASTE') {
      hasYardWaste = true;
      allRecycling = false;
      hasCleanWoodOnly = false;
    } else if (item.forces_category === 'CLEAN_RECYCLING') {
      // Check if it's clean wood/chips
      if (!['CLEAN_WOOD', 'WOOD_CHIPS'].includes(item.item_code)) {
        hasCleanWoodOnly = false;
      }
    } else {
      allRecycling = false;
      hasCleanWoodOnly = false;
    }
  }

  // Determine category priority:
  // 1. YARD_WASTE selected -> forces DEBRIS_HEAVY (no Green Halo)
  // 2. Any HEAVY item -> HEAVY_MATERIALS
  // 3. All recycling streams -> CLEAN_RECYCLING
  // 4. Otherwise -> GENERAL_DEBRIS

  let category: MaterialCategory;
  let isHeavy = false;
  let forcesDebrisHeavy = false;
  let allowGreenHalo = false;

  if (hasYardWaste) {
    // CRITICAL: Yard waste routes to DEBRIS_HEAVY pricing (no Green Halo)
    category = 'YARD_WASTE';
    forcesDebrisHeavy = true;
    isHeavy = true;
  } else if (hasHeavy) {
    category = 'HEAVY_MATERIALS';
    isHeavy = true;
  } else if (allRecycling && selections.length > 0) {
    category = 'CLEAN_RECYCLING';
    // Allow Green Halo only for clean wood/chips
    allowGreenHalo = hasCleanWoodOnly;
  } else {
    category = 'GENERAL_DEBRIS';
  }

  // Determine recommended size based on category
  let recommendedSize: number;
  let alternativeSizes: number[];
  let reasonShort: string;

  if (isHeavy || forcesDebrisHeavy) {
    // Heavy materials: only 5/6/8/10 available, recommend 10 unless small volume
    if (volumeScore <= 4) {
      recommendedSize = 6;
      alternativeSizes = [8, 10];
    } else if (volumeScore <= 7) {
      recommendedSize = 8;
      alternativeSizes = [6, 10];
    } else {
      recommendedSize = 10;
      alternativeSizes = [8, 6];
    }
    reasonShort = forcesDebrisHeavy
      ? 'Yard waste requires heavy-rated sizes. We recommend 10 yard for most projects.'
      : 'Heavy materials require smaller dumpsters for weight limits. 10 yard handles most jobs.';
  } else if (category === 'CLEAN_RECYCLING') {
    // Recycling: prefer 20, alternatives 10/30
    if (volumeScore <= 8) {
      recommendedSize = 10;
      alternativeSizes = [20];
    } else if (volumeScore <= 18) {
      recommendedSize = 20;
      alternativeSizes = [10, 30];
    } else {
      recommendedSize = 30;
      alternativeSizes = [20];
    }
    reasonShort = 'Clean recyclable materials work great in standard sizes.';
  } else {
    // Standard debris: map by volume score
    const mapping = DEBRIS_SIZE_MAP.find(m => volumeScore <= m.maxScore);
    recommendedSize = mapping?.size || 20;
    
    // Build alternatives
    const idx = DEBRIS_SIZES.indexOf(recommendedSize);
    alternativeSizes = DEBRIS_SIZES.filter((_, i) => Math.abs(i - idx) === 1);
    
    reasonShort = 'Based on your selections, this size fits most projects like yours.';
  }

  // Apply market availability filter if provided
  if (marketAvailableSizes && marketAvailableSizes.length > 0) {
    const validSizes = isHeavy ? HEAVY_SIZES : DEBRIS_SIZES;
    const availableSizes = validSizes.filter(s => marketAvailableSizes.includes(s));
    
    if (!availableSizes.includes(recommendedSize)) {
      // Find closest available size (prefer larger)
      const sorted = [...availableSizes].sort((a, b) => 
        Math.abs(a - recommendedSize) - Math.abs(b - recommendedSize)
      );
      recommendedSize = sorted[0] || recommendedSize;
    }
    
    alternativeSizes = alternativeSizes.filter(s => availableSizes.includes(s));
  }

  return {
    category,
    recommendedSize,
    alternativeSizes,
    reasonShort,
    volumeScore,
    isHeavy,
    forcesDebrisHeavy,
    allowGreenHalo,
  };
}

// React hook wrapper
export function useSizeRecommendation(
  selections: ItemSelection[],
  catalogItems: DisposalItem[],
  marketAvailableSizes?: number[]
): SizeRecommendation {
  return useMemo(
    () => calculateSizeRecommendation(selections, catalogItems, marketAvailableSizes),
    [selections, catalogItems, marketAvailableSizes]
  );
}
