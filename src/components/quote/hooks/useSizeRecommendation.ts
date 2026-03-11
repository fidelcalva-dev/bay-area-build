// ============================================================
// EAST BAY-TUNED SIZE RECOMMENDATION ENGINE
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
  confidenceMessage: string;
  confidenceScore: number; // 0-100
  volumeScore: number;
  isHeavy: boolean;
  forcesDebrisHeavy: boolean;
  allowGreenHalo: boolean;
}

// Quantity multipliers for volume scoring
const QUANTITY_MULTIPLIERS: Record<string, number> = {
  SMALL: 0.7,
  MED: 1.0,
  LARGE: 1.4,
};

// Items that trigger safety buffer additions
const APPLIANCE_SHINGLE_CODES = ['APPLIANCES', 'ROOFING_SHINGLES'];

// Heavy sizes (only 5-10 available)
const HEAVY_SIZES = [5, 8, 10];
const DEBRIS_SIZES = [10, 20, 30, 40, 50];
const RECYCLING_SIZES = [10, 20, 30];

// Heavy fallback order
const HEAVY_FALLBACK_ORDER = [10, 8, 5];
// Debris fallback order
const DEBRIS_FALLBACK_ORDER = [20, 10, 30, 40];

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
      confidenceMessage: 'This size fits most projects like yours.',
      confidenceScore: 75,
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
  let hasHeavyWeightClass = false;
  let hasAppliancesOrShingles = false;

  for (const selection of selections) {
    const item = itemMap.get(selection.itemCode);
    if (!item) continue;

    const multiplier = QUANTITY_MULTIPLIERS[selection.quantity] || 1;
    volumeScore += item.volume_points * multiplier;

    // Check weight class for safety buffer
    if (item.weight_class === 'HEAVY') {
      hasHeavyWeightClass = true;
    }

    // Check for appliances or shingles
    if (APPLIANCE_SHINGLE_CODES.includes(item.item_code)) {
      hasAppliancesOrShingles = true;
    }

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

  // Apply East Bay safety buffers
  if (hasHeavyWeightClass) {
    volumeScore *= 1.15;
  }
  if (hasAppliancesOrShingles) {
    volumeScore += 2;
  }

  // Round volume score for cleaner logic
  volumeScore = Math.round(volumeScore * 100) / 100;

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

  // Determine recommended size based on category and East Bay mapping
  let recommendedSize: number;
  let alternativeSizes: number[];
  let reasonShort: string;
  let confidenceScore: number;
  let confidenceMessage: string;

  if (isHeavy || forcesDebrisHeavy) {
    // Heavy materials: only 5/6/8/10 available
    // East Bay mapping: default 10, smaller based on score
    if (volumeScore <= 3) {
      recommendedSize = 5;
      alternativeSizes = [8];
      confidenceScore = 70;
    } else if (volumeScore <= 4) {
      recommendedSize = 5;
      alternativeSizes = [8];
      confidenceScore = 75;
    } else if (volumeScore <= 6) {
      recommendedSize = 8;
      alternativeSizes = [5, 10];
      confidenceScore = 80;
    } else {
      recommendedSize = 10;
      alternativeSizes = [8, 5];
      confidenceScore = 90;
    }

    reasonShort = forcesDebrisHeavy
      ? 'Yard waste requires heavy-rated sizes due to soil content.'
      : 'Heavy materials require smaller dumpsters for weight limits.';
    
    confidenceMessage = confidenceScore >= 85
      ? 'Most customers with similar projects choose this size.'
      : confidenceScore >= 70
        ? 'This size fits most projects like yours.'
        : 'You can adjust the size if you\'re unsure.';

  } else if (category === 'CLEAN_RECYCLING') {
    // Recycling: prefer 20, alternatives 10/30
    if (volumeScore <= 8) {
      recommendedSize = 10;
      alternativeSizes = [20];
      confidenceScore = 80;
    } else if (volumeScore <= 20) {
      recommendedSize = 20;
      alternativeSizes = [10, 30];
      confidenceScore = 85;
    } else {
      recommendedSize = 30;
      alternativeSizes = [20];
      confidenceScore = 75;
    }
    
    reasonShort = 'Clean recyclable materials work great in standard sizes.';
    confidenceMessage = confidenceScore >= 85
      ? 'Most customers with similar projects choose this size.'
      : 'This size fits most projects like yours.';

  } else {
    // Standard debris: East Bay mapping
    if (volumeScore <= 10) {
      recommendedSize = 10;
      alternativeSizes = [20];
      confidenceScore = 75;
    } else if (volumeScore <= 20) {
      recommendedSize = 20;
      alternativeSizes = [10, 30];
      confidenceScore = 90;
    } else if (volumeScore <= 30) {
      recommendedSize = 30;
      alternativeSizes = [20, 40];
      confidenceScore = 85;
    } else {
      recommendedSize = 40;
      alternativeSizes = [30];
      confidenceScore = 80;
    }
    
    reasonShort = 'Based on your selections, this size fits most projects like yours.';
    confidenceMessage = confidenceScore >= 85
      ? 'Most customers with similar projects choose this size.'
      : confidenceScore >= 70
        ? 'This size fits most projects like yours.'
        : 'You can adjust the size if you\'re unsure.';
  }

  // Apply market availability filter
  if (marketAvailableSizes && marketAvailableSizes.length > 0) {
    const validSizes = isHeavy ? HEAVY_SIZES : (category === 'CLEAN_RECYCLING' ? RECYCLING_SIZES : DEBRIS_SIZES);
    const availableSizes = validSizes.filter(s => marketAvailableSizes.includes(s));
    
    if (!availableSizes.includes(recommendedSize)) {
      // Use fallback order based on category
      const fallbackOrder = isHeavy ? HEAVY_FALLBACK_ORDER : DEBRIS_FALLBACK_ORDER;
      const fallback = fallbackOrder.find(s => availableSizes.includes(s));
      recommendedSize = fallback || recommendedSize;
      
      // Lower confidence when we had to fallback
      confidenceScore = Math.max(confidenceScore - 10, 60);
      confidenceMessage = 'This size fits most projects like yours.';
    }
    
    alternativeSizes = alternativeSizes.filter(s => availableSizes.includes(s) && s !== recommendedSize);
  }

  // Ensure we have at most 2 alternatives
  alternativeSizes = alternativeSizes.slice(0, 2);

  return {
    category,
    recommendedSize,
    alternativeSizes,
    reasonShort,
    confidenceMessage,
    confidenceScore,
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
