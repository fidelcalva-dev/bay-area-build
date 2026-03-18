// ══════════════════════════════════════════════════════════════
// HEAVY MATERIAL PRICING CONFIG — Service Cost + Dump Fee Model
// Canonical source for all heavy material pricing groups.
// Components, calculators, CRM, and admin MUST import from here.
// ══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────
export type HeavyMaterialGroup = 'CLEAN_NO_1' | 'CLEAN_NO_2' | 'ALL_MIXED' | 'OTHER_HEAVY';

export interface HeavyMaterialGroupConfig {
  id: HeavyMaterialGroup;
  label: string;
  labelEs: string;
  customerLabel: string; // Simplified label for customer-facing UI
  description: string;
  materials: string[];
  dumpFeePerYard: number;
  icon: string;
  displayOrder: number;
}

export interface HeavyServiceCost {
  size: 5 | 8 | 10;
  serviceCost: number;
}

export interface HeavyPriceBreakdown {
  size: 5 | 8 | 10;
  serviceCost: number;
  dumpFeePerYard: number;
  dumpFee: number;
  totalPrice: number;
  group: HeavyMaterialGroup;
  groupLabel: string;
}

// ── Allowed Sizes ────────────────────────────────────────────
export const HEAVY_ALLOWED_SIZES = [5, 8, 10] as const;
export type HeavySize = typeof HEAVY_ALLOWED_SIZES[number];

// ── Service Costs (configurable) ─────────────────────────────
export const HEAVY_SERVICE_COSTS: Record<HeavySize, number> = {
  5: 290,
  8: 340,
  10: 390,
};

// ── Material Groups ──────────────────────────────────────────
export const HEAVY_MATERIAL_GROUPS: HeavyMaterialGroupConfig[] = [
  {
    id: 'CLEAN_NO_1',
    label: 'Clean No. 1',
    labelEs: 'Limpio No. 1',
    customerLabel: 'Clean No. 1',
    description: 'Clean single-type base materials — lowest dump fee',
    materials: ['Concrete', 'Soil', 'Sand'],
    dumpFeePerYard: 30,
    icon: 'mountain',
    displayOrder: 1,
  },
  {
    id: 'CLEAN_NO_2',
    label: 'Clean No. 2',
    labelEs: 'Limpio No. 2',
    customerLabel: 'Clean No. 2',
    description: 'Specialty heavy materials — moderate dump fee',
    materials: ['Tile', 'Rocks', 'Asphalt', 'Granite', 'Concrete with rebar', 'Bricks'],
    dumpFeePerYard: 40,
    icon: 'grip',
    displayOrder: 2,
  },
  {
    id: 'ALL_MIXED',
    label: 'All Mixed',
    labelEs: 'Todo Mezclado',
    customerLabel: 'All Mixed',
    description: 'Any mixture of heavy materials',
    materials: ['Any combination of heavy materials'],
    dumpFeePerYard: 50,
    icon: 'shuffle',
    displayOrder: 3,
  },
  {
    id: 'OTHER_HEAVY',
    label: 'Other / Need Help',
    labelEs: 'Otro / Necesita Ayuda',
    customerLabel: 'Other / Need Help',
    description: 'Unlisted material — describe in notes',
    materials: ['Other heavy material'],
    dumpFeePerYard: 50, // default to highest tier pending review
    icon: 'help-circle',
    displayOrder: 4,
  },
];

// ── Lookup Helpers ───────────────────────────────────────────

export function getGroupConfig(groupId: HeavyMaterialGroup): HeavyMaterialGroupConfig | undefined {
  return HEAVY_MATERIAL_GROUPS.find(g => g.id === groupId);
}

export function getServiceCost(size: HeavySize): number {
  return HEAVY_SERVICE_COSTS[size];
}

export function getDumpFee(size: HeavySize, groupId: HeavyMaterialGroup): number {
  const group = getGroupConfig(groupId);
  if (!group) return 0;
  return size * group.dumpFeePerYard;
}

export function calculateHeavyTotalPrice(size: HeavySize, groupId: HeavyMaterialGroup): number {
  return getServiceCost(size) + getDumpFee(size, groupId);
}

export function getHeavyPriceBreakdown(size: HeavySize, groupId: HeavyMaterialGroup): HeavyPriceBreakdown {
  const group = getGroupConfig(groupId);
  const serviceCost = getServiceCost(size);
  const dumpFeePerYard = group?.dumpFeePerYard ?? 50;
  const dumpFee = size * dumpFeePerYard;

  return {
    size,
    serviceCost,
    dumpFeePerYard,
    dumpFee,
    totalPrice: serviceCost + dumpFee,
    group: groupId,
    groupLabel: group?.label ?? 'Unknown',
  };
}

/** Get all breakdowns for a group across all sizes */
export function getAllPriceBreakdowns(groupId: HeavyMaterialGroup): HeavyPriceBreakdown[] {
  return HEAVY_ALLOWED_SIZES.map(size => getHeavyPriceBreakdown(size, groupId));
}

/** Get complete pricing table: group → size → breakdown */
export function getFullPricingTable(): Record<HeavyMaterialGroup, HeavyPriceBreakdown[]> {
  return {
    CLEAN_NO_1: getAllPriceBreakdowns('CLEAN_NO_1'),
    CLEAN_NO_2: getAllPriceBreakdowns('CLEAN_NO_2'),
    ALL_MIXED: getAllPriceBreakdowns('ALL_MIXED'),
    OTHER_HEAVY: getAllPriceBreakdowns('OTHER_HEAVY'),
  };
}

/** Validate size for heavy materials */
export function isValidHeavySize(size: number): size is HeavySize {
  return (HEAVY_ALLOWED_SIZES as readonly number[]).includes(size);
}

/** Format price for display */
export function formatHeavyTotalPrice(size: HeavySize, groupId: HeavyMaterialGroup): string {
  const total = calculateHeavyTotalPrice(size, groupId);
  return `$${total.toLocaleString()}`;
}

export default {
  HEAVY_ALLOWED_SIZES,
  HEAVY_SERVICE_COSTS,
  HEAVY_MATERIAL_GROUPS,
  getGroupConfig,
  getServiceCost,
  getDumpFee,
  calculateHeavyTotalPrice,
  getHeavyPriceBreakdown,
  getAllPriceBreakdowns,
  getFullPricingTable,
  isValidHeavySize,
  formatHeavyTotalPrice,
};
