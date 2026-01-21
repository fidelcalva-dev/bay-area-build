// Estimator Calculation Hook

import { useMemo } from 'react';
import type { EstimatorInputs, EstimatorResult, ConfidenceLevel } from './types';
import { 
  getCategoryConfig, 
  INCLUDED_TONS, 
  SIZE_THRESHOLDS, 
  HEAVY_MAX_SIZE,
  ROOFING_FACTOR,
  DRYWALL_SHEET_VOLUME,
  AVG_BULKY_ITEM_VOLUME,
} from './constants';

export function useEstimatorCalculation(inputs: EstimatorInputs): EstimatorResult | null {
  return useMemo(() => {
    const { category, inputMethod } = inputs;
    
    if (!category || !inputMethod) {
      return null;
    }
    
    const categoryConfig = getCategoryConfig(category);
    if (!categoryConfig) {
      return null;
    }
    
    // Calculate volume based on input method
    let volumeCy = 0;
    
    switch (inputMethod) {
      case 'sqft': {
        const sqft = inputs.squareFeet || 0;
        if (sqft <= 0) return null;
        
        if (category === 'concrete') {
          // Concrete: sqft × thickness / 27 (convert to cubic yards)
          const thicknessInches = inputs.thicknessInches || 4;
          const thicknessFt = thicknessInches / 12;
          volumeCy = (sqft * thicknessFt) / 27;
        } else if (category === 'roofing') {
          // Roofing: sqft × layers × factor
          const layers = inputs.layers || 1;
          volumeCy = (sqft / 100) * ROOFING_FACTOR * layers * 100; // Simplified
          // More realistic: ~1 cy per 33 sqft per layer for 3-tab shingles
          volumeCy = (sqft * layers) / 33;
        } else if (category === 'drywall') {
          // Drywall from sqft: estimate sheets (4x8 = 32 sqft per sheet)
          const sheets = Math.ceil(sqft / 32);
          volumeCy = sheets * DRYWALL_SHEET_VOLUME;
        } else {
          // General: assume a depth factor for debris pile
          // Roughly 0.5 feet deep pile
          volumeCy = (sqft * 0.5) / 27;
        }
        break;
      }
      
      case 'cuyd': {
        volumeCy = inputs.cubicYards || 0;
        if (volumeCy <= 0) return null;
        break;
      }
      
      case 'dimensions': {
        const length = inputs.length || 0;
        const width = inputs.width || 0;
        const height = inputs.height || 0;
        if (length <= 0 || width <= 0 || height <= 0) return null;
        
        // Convert cubic feet to cubic yards
        volumeCy = (length * width * height) / 27;
        break;
      }
      
      case 'count': {
        const count = inputs.count || 0;
        if (count <= 0) return null;
        
        if (category === 'drywall' && inputs.sheetCount) {
          // Drywall sheets
          volumeCy = inputs.sheetCount * DRYWALL_SHEET_VOLUME;
        } else if (category === 'appliances') {
          // Appliances/bulky items
          volumeCy = count * AVG_BULKY_ITEM_VOLUME;
        } else {
          // Generic count (rare)
          volumeCy = count * 0.5;
        }
        break;
      }
    }
    
    if (volumeCy <= 0) return null;
    
    // Calculate weight range
    const weightLow = volumeCy * categoryConfig.densityLow;
    const weightHigh = volumeCy * categoryConfig.densityHigh;
    const weightAvg = (weightLow + weightHigh) / 2;
    
    // Determine recommended size
    const isHeavy = categoryConfig.isHeavy;
    let recommendedSize = 10;
    let alternateSize: number | undefined;
    let multipleRequired = false;
    let multipleCount: number | undefined;
    
    if (isHeavy) {
      // Heavy materials: 6/8/10 only
      if (volumeCy <= 6) {
        recommendedSize = 6;
        alternateSize = 8;
      } else if (volumeCy <= 8) {
        recommendedSize = 8;
        alternateSize = 10;
      } else if (volumeCy <= 10) {
        recommendedSize = 10;
      } else {
        // Multiple dumpsters needed
        recommendedSize = 10;
        multipleRequired = true;
        multipleCount = Math.ceil(volumeCy / 10);
      }
    } else {
      // General debris: find best fit
      for (const threshold of SIZE_THRESHOLDS) {
        if (volumeCy <= threshold.maxVolume) {
          recommendedSize = threshold.size;
          alternateSize = threshold.nextSize !== threshold.size ? threshold.nextSize : undefined;
          break;
        }
      }
      
      // If volume exceeds 50, multiple needed
      if (volumeCy > 50) {
        recommendedSize = 50;
        multipleRequired = true;
        multipleCount = Math.ceil(volumeCy / 50);
      }
    }
    
    // Calculate confidence based on weight vs included tons
    let confidence: ConfidenceLevel = 'safe';
    let confidenceLabel = 'Safe choice';
    let confidenceNote = 'Should handle your project well';
    
    if (isHeavy) {
      // Heavy materials are flat-fee, so confidence is based on volume fit
      if (volumeCy <= recommendedSize * 0.7) {
        confidence = 'safe';
        confidenceLabel = 'Safe choice';
        confidenceNote = 'Plenty of room for your heavy materials';
      } else if (volumeCy <= recommendedSize * 0.9) {
        confidence = 'safe';
        confidenceLabel = 'Good fit';
        confidenceNote = 'Volume should fit well in this size';
      } else if (volumeCy <= recommendedSize) {
        confidence = 'tight';
        confidenceLabel = 'Might be tight';
        confidenceNote = 'Close to capacity — load carefully';
      } else {
        confidence = 'overflow';
        confidenceLabel = 'Risk of overflow';
        confidenceNote = multipleRequired 
          ? `Estimated ${multipleCount} dumpsters needed`
          : 'Consider sizing up for safety margin';
      }
    } else {
      // General debris: check weight against included tons
      const includedTons = INCLUDED_TONS[recommendedSize] || 2;
      
      if (volumeCy > recommendedSize) {
        confidence = 'overflow';
        confidenceLabel = 'Risk of overflow';
        confidenceNote = 'Volume exceeds dumpster capacity';
      } else if (weightAvg > includedTons * 1.5) {
        confidence = 'overweight';
        confidenceLabel = 'Risk of overweight';
        confidenceNote = `Estimated weight exceeds ${includedTons}T included — consider next size`;
      } else if (weightAvg > includedTons) {
        confidence = 'tight';
        confidenceLabel = 'Watch the weight';
        confidenceNote = `May exceed ${includedTons}T included — overage rates apply`;
      } else if (volumeCy > recommendedSize * 0.8) {
        confidence = 'tight';
        confidenceLabel = 'Might be tight';
        confidenceNote = 'Close to capacity — load carefully';
      } else {
        confidence = 'safe';
        confidenceLabel = 'Safe choice';
        confidenceNote = 'Should handle your project well';
      }
    }
    
    return {
      volumeLow: Math.round(volumeCy * 0.9 * 10) / 10, // 10% variance
      volumeHigh: Math.round(volumeCy * 1.1 * 10) / 10,
      weightLow: Math.round(weightLow * 10) / 10,
      weightHigh: Math.round(weightHigh * 10) / 10,
      recommendedSize,
      alternateSize,
      confidence,
      confidenceLabel,
      confidenceNote,
      isHeavy,
      multipleRequired,
      multipleCount,
    };
  }, [inputs]);
}
