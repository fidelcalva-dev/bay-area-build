/**
 * Configuration validation rules to prevent breaking business logic
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// =====================================================
// PRICING VALIDATION RULES
// =====================================================

export function validateExtraTonRate(rate: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (rate <= 0) {
    errors.push('Extra ton rate must be greater than $0');
  }
  if (rate > 500) {
    errors.push('Extra ton rate cannot exceed $500');
  }
  if (rate < 100) {
    warnings.push('Extra ton rate below $100 may not cover disposal costs');
  }
  if (rate > 250) {
    warnings.push('Extra ton rate above $250 is unusually high');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validatePrepayDiscount(discountPct: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (discountPct < 0) {
    errors.push('Prepay discount cannot be negative');
  }
  if (discountPct > 10) {
    errors.push('Prepay discount cannot exceed 10% (margin protection)');
  }
  if (discountPct > 7) {
    warnings.push('Prepay discount above 7% significantly impacts margin');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateContractorDiscount(discountPct: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (discountPct < 0) {
    errors.push('Contractor discount cannot be negative');
  }
  if (discountPct > 10) {
    errors.push('Contractor discount cannot exceed 10% (margin protection)');
  }
  if (discountPct > 8) {
    warnings.push('Contractor discount above 8% may require volume commitment');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// =====================================================
// HEAVY MATERIAL VALIDATION RULES
// =====================================================

export function validateHeavyFactors(factors: Record<number, number>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 10-yard must be 1.0
  if (factors[10] !== 1.0) {
    errors.push('10-yard factor must be exactly 1.0 (base reference)');
  }

  // 8-yard should be between 0.6-0.9
  if (factors[8] !== undefined) {
    if (factors[8] < 0.6 || factors[8] > 0.9) {
      errors.push('8-yard factor must be between 0.6 and 0.9');
    }
  }

  // 6-yard should be between 0.4-0.8
  if (factors[6] !== undefined) {
    if (factors[6] < 0.4 || factors[6] > 0.8) {
      errors.push('6-yard factor must be between 0.4 and 0.8');
    }
  }

  // Factors should be in descending order
  if (factors[6] >= factors[8]) {
    errors.push('6-yard factor must be less than 8-yard factor');
  }
  if (factors[8] >= factors[10]) {
    errors.push('8-yard factor must be less than 10-yard factor');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateHeavySizeLimit(sizes: number[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const allowedSizes = [6, 8, 10];
  
  for (const size of sizes) {
    if (!allowedSizes.includes(size)) {
      errors.push(`Heavy material size ${size}-yard is not allowed. Only 6, 8, 10 permitted.`);
    }
  }

  if (sizes.length === 0) {
    errors.push('At least one heavy material size must be enabled');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateHeavyIncrement(increment: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (increment < 0) {
    errors.push('Material increment cannot be negative');
  }
  if (increment > 500) {
    errors.push('Material increment cannot exceed $500');
  }
  if (increment > 300) {
    warnings.push('Material increment above $300 may reduce competitiveness');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// =====================================================
// ZONE & DISTANCE VALIDATION
// =====================================================

export function validateZoneMultiplier(multiplier: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (multiplier < 0.5) {
    errors.push('Zone multiplier cannot be less than 0.5');
  }
  if (multiplier > 2.0) {
    errors.push('Zone multiplier cannot exceed 2.0');
  }
  if (multiplier < 1.0) {
    warnings.push('Zone multiplier below 1.0 reduces revenue');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateDistanceCap(maxMiles: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (maxMiles <= 0) {
    errors.push('Distance cap must be greater than 0');
  }
  if (maxMiles > 100) {
    warnings.push('Distance cap above 100 miles may result in unprofitable trips');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateSurcharge(amount: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (amount < 0) {
    errors.push('Surcharge cannot be negative');
  }
  if (amount > 500) {
    errors.push('Surcharge cannot exceed $500');
  }
  if (amount > 200) {
    warnings.push('Surcharge above $200 may deter customers');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// =====================================================
// YARD VALIDATION
// =====================================================

export function validateYardCoordinates(lat: number, lng: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Bay Area bounds check
  const bayAreaBounds = {
    minLat: 36.5,
    maxLat: 38.5,
    minLng: -123.0,
    maxLng: -121.0,
  };

  if (lat < -90 || lat > 90) {
    errors.push('Invalid latitude value');
  }
  if (lng < -180 || lng > 180) {
    errors.push('Invalid longitude value');
  }

  if (lat < bayAreaBounds.minLat || lat > bayAreaBounds.maxLat ||
      lng < bayAreaBounds.minLng || lng > bayAreaBounds.maxLng) {
    warnings.push('Coordinates appear to be outside Bay Area service region');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// =====================================================
// GENERAL VALIDATION HELPERS
// =====================================================

export function validateRequired(value: unknown, fieldName: string): ValidationResult {
  const errors: string[] = [];

  if (value === null || value === undefined || value === '') {
    errors.push(`${fieldName} is required`);
  }

  return { isValid: errors.length === 0, errors, warnings: [] };
}

export function validatePositiveNumber(value: number, fieldName: string): ValidationResult {
  const errors: string[] = [];

  if (typeof value !== 'number' || isNaN(value)) {
    errors.push(`${fieldName} must be a valid number`);
  } else if (value <= 0) {
    errors.push(`${fieldName} must be greater than 0`);
  }

  return { isValid: errors.length === 0, errors, warnings: [] };
}

export function validatePercentage(value: number, fieldName: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (value < 0 || value > 100) {
    errors.push(`${fieldName} must be between 0 and 100`);
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Combine multiple validation results
 */
export function combineValidations(...results: ValidationResult[]): ValidationResult {
  return {
    isValid: results.every((r) => r.isValid),
    errors: results.flatMap((r) => r.errors),
    warnings: results.flatMap((r) => r.warnings),
  };
}

/**
 * Check if "unlimited weight" is enabled anywhere (not allowed)
 */
export function validateNoUnlimitedWeight(config: { includedTons?: number; overageRate?: number }): ValidationResult {
  const errors: string[] = [];

  if (config.includedTons !== undefined && config.includedTons > 20) {
    errors.push('Included tons cannot exceed 20 (unlimited weight not allowed)');
  }
  if (config.overageRate === 0) {
    errors.push('Overage rate cannot be $0 (would enable unlimited weight)');
  }

  return { isValid: errors.length === 0, errors, warnings: [] };
}
