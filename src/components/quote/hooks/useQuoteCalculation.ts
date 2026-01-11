// Quote Calculation Hook
import { useMemo } from 'react';
import type { QuoteFormData, QuoteResult, PricingZone } from '@/components/quote/types';
import { 
  PRICING_ZONES, 
  DUMPSTER_SIZES, 
  MATERIAL_TYPES, 
  EXTRAS, 
  RENTAL_PERIODS,
  USER_TYPES,
  OVERAGE_COST_PER_TON,
  EXTRA_DAY_COST,
} from '@/components/quote/constants';

export function getZoneByZip(zip: string): PricingZone | null {
  for (const zone of PRICING_ZONES) {
    if (zone.zipCodes.includes(zip)) {
      return zone;
    }
  }
  return null;
}

export function useQuoteCalculation(formData: QuoteFormData): QuoteResult {
  return useMemo(() => {
    const errors: string[] = [];
    const lineItems: QuoteResult['lineItems'] = [];

    // Validate ZIP
    const zone = getZoneByZip(formData.zip);
    if (!zone && formData.zip.length === 5) {
      errors.push('ZIP code is outside our service area');
    }

    // Get material type
    const material = MATERIAL_TYPES.find((m) => m.value === formData.material);
    if (!material) {
      errors.push('Invalid material type');
    }

    // Get size
    const size = DUMPSTER_SIZES.find((s) => s.value === formData.size);
    if (!size) {
      errors.push('Invalid dumpster size');
    }

    // Validate size for material
    if (material && size && !material.allowedSizes.includes(size.value)) {
      errors.push(`${size.label} is not available for ${material.label}`);
    }

    // Get rental period
    const rental = RENTAL_PERIODS.find((r) => r.value === formData.rentalDays);
    if (!rental) {
      errors.push('Invalid rental duration');
    }

    // Get user type
    const userTypeData = USER_TYPES.find((u) => u.value === formData.userType);
    const discount = userTypeData?.discount || 0;

    if (errors.length > 0 || !size || !material || !rental || !zone) {
      return {
        lineItems: [],
        subtotal: 0,
        estimatedMin: 0,
        estimatedMax: 0,
        includedTons: 0,
        overageCostPerTon: OVERAGE_COST_PER_TON,
        extraDayCost: EXTRA_DAY_COST,
        zone: null,
        isValid: false,
        errors,
      };
    }

    // Calculate base price with zone multiplier
    const basePrice = Math.round(size.basePrice * zone.baseMultiplier);
    lineItems.push({
      label: `${size.label} Dumpster`,
      subLabel: `${rental.label} rental • ${size.includedTons}T included`,
      amount: basePrice,
      type: 'base',
    });

    // Material adjustment
    if (material.priceAdjustment > 0) {
      lineItems.push({
        label: `${material.label} Surcharge`,
        subLabel: 'Heavy material handling',
        amount: material.priceAdjustment,
        type: 'addition',
      });
    }

    // Extended rental days from period selection
    if (rental.extraCost > 0) {
      lineItems.push({
        label: `Extended Rental`,
        subLabel: `+${rental.extraDays} extra days`,
        amount: rental.extraCost,
        type: 'addition',
      });
    }

    // Process extras with quantities
    let extrasTotal = 0;
    for (const extraSelection of formData.extras) {
      const extra = EXTRAS.find((e) => e.id === extraSelection.id);
      if (extra && extraSelection.quantity > 0) {
        const extraCost = extra.price * extraSelection.quantity;
        extrasTotal += extraCost;
        
        lineItems.push({
          label: extra.label,
          subLabel: extraSelection.quantity > 1 ? `${extraSelection.quantity} × $${extra.price}` : extra.description,
          amount: extraCost,
          type: 'addition',
        });
      }
    }

    // Calculate subtotal before discount
    const subtotalBeforeDiscount = lineItems.reduce((sum, item) => sum + item.amount, 0);

    // Apply discount
    if (discount > 0) {
      const discountAmount = Math.round(subtotalBeforeDiscount * discount);
      lineItems.push({
        label: `${userTypeData?.label} Discount`,
        subLabel: `${(discount * 100).toFixed(0)}% off`,
        amount: -discountAmount,
        type: 'discount',
      });
    }

    // Calculate final subtotal
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

    // Estimated range (accounts for potential weight variance)
    const estimatedMin = subtotal;
    const estimatedMax = subtotal + Math.round(subtotal * 0.1);

    return {
      lineItems,
      subtotal,
      estimatedMin,
      estimatedMax,
      includedTons: size.includedTons,
      overageCostPerTon: OVERAGE_COST_PER_TON,
      extraDayCost: EXTRA_DAY_COST,
      zone,
      isValid: true,
      errors: [],
    };
  }, [formData]);
}

export function calculateDebrisEstimate(items: { itemId: string; quantity: number }[]): {
  totalWeight: number;
  totalVolume: number;
  tonsEstimate: number;
  recommendedSize: number;
  isHeavy: boolean;
} {
  const { DEBRIS_ITEMS, SIZE_RECOMMENDATIONS } = require('../constants');
  
  let totalWeight = 0;
  let totalVolume = 0;
  let hasHeavy = false;

  for (const { itemId, quantity } of items) {
    const item = DEBRIS_ITEMS.find((d: any) => d.id === itemId);
    if (item && quantity > 0) {
      totalWeight += item.weightPerUnit * quantity;
      totalVolume += item.volumePerUnit * quantity;
      if (item.category === 'Heavy') {
        hasHeavy = true;
      }
    }
  }

  const tonsEstimate = totalWeight / 2000; // Convert lbs to tons

  // Find recommended size
  let recommendedSize = 10;
  for (const rec of SIZE_RECOMMENDATIONS) {
    if (totalVolume <= rec.maxVolume) {
      recommendedSize = rec.size;
      break;
    }
  }

  // If heavy materials, cap at 10 yard
  if (hasHeavy && recommendedSize > 10) {
    recommendedSize = 10;
  }

  return {
    totalWeight,
    totalVolume,
    tonsEstimate,
    recommendedSize,
    isHeavy: hasHeavy,
  };
}
