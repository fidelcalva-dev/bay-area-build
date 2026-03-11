// ══════════════════════════════════════════════════════════════
// PRICING CONFIG — Single Source of Truth
// ALL public prices, included tons, sizes, and policies live here.
// Components, SEO pages, calculators, and CRM MUST import from
// this file. Never hardcode pricing strings in components.
// ══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────
export interface GeneralDebrisSize {
  size: number;
  price: number;
  includedTons: number;
  bestFor: string;
}

export interface HeavyMaterialPricing {
  allowedSizes: number[];
  prices: Record<number, number>;
}

export interface PricingPolicies {
  contaminationFee: number;
  misdeclaredMaterialFee: number;
  overweightCostPerTon: number;
  extraDayCost: number;
  standardRentalDays: number;
  sameDayDeliveryFee: number;
  tripFee: number;
  relocationFee: number;
  cancellation24hFee: number;
  wrongMaterialsCleaning: number;
  mattressDisposal: number;
  applianceWithFreon: number;
  tireDisposal: number;
  greenHaloSurchargePerTon: number;
  heavyMaterialRule: string;
  contaminationRule: string;
  misdeclaredRule: string;
  generalDebrisOverageRule: string;
}

// ── General Debris ───────────────────────────────────────────
export const GENERAL_DEBRIS_SIZES: GeneralDebrisSize[] = [
  { size: 5,  price: 395,  includedTons: 0.5, bestFor: 'small cleanouts and heavy materials' },
  { size: 8,  price: 425,  includedTons: 0.5, bestFor: 'small remodeling projects' },
  { size: 10, price: 495,  includedTons: 1,   bestFor: 'garage cleanouts and small remodels' },
  { size: 20, price: 650,  includedTons: 2,   bestFor: 'construction and renovation' },
  { size: 30, price: 775,  includedTons: 3,   bestFor: 'large construction jobs' },
  { size: 40, price: 925,  includedTons: 4,   bestFor: 'major demolition and commercial debris' },
  { size: 50, price: 1095, includedTons: 5,   bestFor: 'high volume debris and commercial use' },
];

// ── Heavy Materials ──────────────────────────────────────────
export const HEAVY_MATERIAL = {
  cleanSoil: {
    allowedSizes: [5, 8, 10] as number[],
    prices: { 5: 495, 8: 595, 10: 695.50 } as Record<number, number>,
  },
  cleanConcrete: {
    allowedSizes: [5, 8, 10] as number[],
    prices: { 5: 495, 8: 595, 10: 695.50 } as Record<number, number>,
  },
} satisfies Record<string, HeavyMaterialPricing>;

export const HEAVY_ALLOWED_SIZES = [5, 8, 10] as const;

// ── Policies ─────────────────────────────────────────────────
export const POLICIES: PricingPolicies = {
  contaminationFee: 150,
  misdeclaredMaterialFee: 150,
  overweightCostPerTon: 165,
  extraDayCost: 35,
  standardRentalDays: 7,
  sameDayDeliveryFee: 100,
  tripFee: 250,
  relocationFee: 125,
  cancellation24hFee: 100,
  wrongMaterialsCleaning: 300,
  mattressDisposal: 50,
  applianceWithFreon: 75,
  tireDisposal: 25,
  greenHaloSurchargePerTon: 165,
  heavyMaterialRule:
    'Heavy materials such as soil, dirt, and concrete must be placed only in 5, 8, or 10 yard dumpsters.',
  contaminationRule:
    'If a clean material container is contaminated with trash or mixed debris, additional disposal charges plus a $150 contamination surcharge may apply.',
  misdeclaredRule:
    'If materials are misdeclared and require disposal at a different facility, an additional charge plus a $150 reroute surcharge may apply.',
  generalDebrisOverageRule:
    'Additional weight beyond included tonnage will be charged at $165 per ton based on scale ticket.',
};

// ── Unified Config Export ────────────────────────────────────
export const PRICING_CONFIG = {
  GENERAL_DEBRIS: {
    sizes: GENERAL_DEBRIS_SIZES,
    overweightCostPerTon: POLICIES.overweightCostPerTon,
  },
  HEAVY_MATERIAL: HEAVY_MATERIAL,
  HEAVY_ALLOWED_SIZES,
  POLICIES,
} as const;

// ── Helpers ──────────────────────────────────────────────────

/** Get a general debris size entry by yard size */
export function getGeneralSize(yards: number): GeneralDebrisSize | undefined {
  return GENERAL_DEBRIS_SIZES.find(s => s.size === yards);
}

/** Get the public starting price for any general debris size */
export function getGeneralPrice(yards: number): number {
  return getGeneralSize(yards)?.price ?? 0;
}

/** Get included tons for a general debris size */
export function getIncludedTons(yards: number): number {
  return getGeneralSize(yards)?.includedTons ?? 0;
}

/** Get the smallest general debris price (for "starting at" copy) */
export function getStartingPrice(): number {
  return GENERAL_DEBRIS_SIZES[0].price;
}

/** Get heavy material price for a given material and size */
export function getHeavyPrice(material: keyof typeof HEAVY_MATERIAL, size: number): number {
  return HEAVY_MATERIAL[material]?.prices[size] ?? 0;
}

/** Check if a size is allowed for heavy materials */
export function isHeavyAllowedSize(size: number): boolean {
  return (HEAVY_ALLOWED_SIZES as readonly number[]).includes(size);
}

/** Format price for display: $395, $695.50, $1,095 */
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: price % 1 !== 0 ? 2 : 0 })}`;
  }
  return price % 1 !== 0 ? `$${price.toFixed(2)}` : `$${price}`;
}

/** Get the full size range label, e.g. "5 to 50 yard" */
export function getSizeRangeLabel(): string {
  const first = GENERAL_DEBRIS_SIZES[0].size;
  const last = GENERAL_DEBRIS_SIZES[GENERAL_DEBRIS_SIZES.length - 1].size;
  return `${first} to ${last} yard`;
}

/** All available general debris size numbers */
export function getGeneralSizeList(): number[] {
  return GENERAL_DEBRIS_SIZES.map(s => s.size);
}

/** Comma-separated size list for copy, e.g. "5, 8, 10, 20, 30, 40, and 50" */
export function getGeneralSizeListLabel(): string {
  const sizes = getGeneralSizeList();
  if (sizes.length <= 2) return sizes.join(' and ');
  return sizes.slice(0, -1).join(', ') + ', and ' + sizes[sizes.length - 1];
}

/** Heavy size list label, e.g. "5, 8, and 10" */
export function getHeavySizeListLabel(): string {
  const sizes = [...HEAVY_ALLOWED_SIZES];
  return sizes.slice(0, -1).join(', ') + ', and ' + sizes[sizes.length - 1];
}

export default PRICING_CONFIG;
