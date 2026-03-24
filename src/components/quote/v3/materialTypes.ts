// ============================================================
// CUSTOMER-FACING MATERIAL / WASTE TYPES
// Simple groups for customer selection; maps to internal classification
// ============================================================

export type MaterialGroup = 'general' | 'heavy' | 'unsure';

export interface MaterialOption {
  id: string;
  label: string;
  group: MaterialGroup;
  /** Internal classification for pricing */
  internalClass: string;
  sortOrder: number;
}

export const GENERAL_DEBRIS_OPTIONS: MaterialOption[] = [
  { id: 'household-junk', label: 'Household Junk', group: 'general', internalClass: 'GENERAL_DEBRIS', sortOrder: 1 },
  { id: 'furniture-bulk', label: 'Furniture / Bulk Items', group: 'general', internalClass: 'GENERAL_DEBRIS', sortOrder: 2 },
  { id: 'garage-storage', label: 'Garage / Storage Cleanout', group: 'general', internalClass: 'GENERAL_DEBRIS', sortOrder: 3 },
  { id: 'office-cleanout', label: 'Office Cleanout', group: 'general', internalClass: 'GENERAL_DEBRIS', sortOrder: 4 },
  { id: 'drywall-plaster', label: 'Drywall / Plaster', group: 'general', internalClass: 'GENERAL_DEBRIS', sortOrder: 5 },
  { id: 'wood-framing', label: 'Wood / Framing', group: 'general', internalClass: 'GENERAL_DEBRIS', sortOrder: 6 },
  { id: 'cabinets-trim', label: 'Cabinets / Trim', group: 'general', internalClass: 'GENERAL_DEBRIS', sortOrder: 7 },
  { id: 'carpet-flooring', label: 'Carpet / Flooring', group: 'general', internalClass: 'GENERAL_DEBRIS', sortOrder: 8 },
  { id: 'roofing-shingles', label: 'Roofing / Shingles', group: 'general', internalClass: 'GENERAL_DEBRIS', sortOrder: 9 },
  { id: 'green-waste', label: 'Green Waste / Yard Debris', group: 'general', internalClass: 'YARD_WASTE', sortOrder: 10 },
  { id: 'mixed-remodel', label: 'Mixed Remodel Debris', group: 'general', internalClass: 'GENERAL_DEBRIS', sortOrder: 11 },
  { id: 'construction-debris', label: 'Construction Debris', group: 'general', internalClass: 'GENERAL_DEBRIS', sortOrder: 12 },
  { id: 'demolition-debris', label: 'Demolition Debris', group: 'general', internalClass: 'GENERAL_DEBRIS', sortOrder: 13 },
  { id: 'other-general', label: 'Other General Debris', group: 'general', internalClass: 'GENERAL_DEBRIS', sortOrder: 14 },
];

export const HEAVY_MATERIAL_OPTIONS: MaterialOption[] = [
  { id: 'clean-concrete', label: 'Clean Concrete', group: 'heavy', internalClass: 'CLEAN_NO_1', sortOrder: 1 },
  { id: 'clean-soil', label: 'Clean Soil', group: 'heavy', internalClass: 'CLEAN_NO_1', sortOrder: 2 },
  { id: 'sand', label: 'Sand', group: 'heavy', internalClass: 'CLEAN_NO_1', sortOrder: 3 },
  { id: 'tile', label: 'Tile', group: 'heavy', internalClass: 'CLEAN_NO_2', sortOrder: 4 },
  { id: 'rocks-stone', label: 'Rocks / Stone', group: 'heavy', internalClass: 'CLEAN_NO_2', sortOrder: 5 },
  { id: 'asphalt', label: 'Asphalt', group: 'heavy', internalClass: 'CLEAN_NO_2', sortOrder: 6 },
  { id: 'granite', label: 'Granite', group: 'heavy', internalClass: 'CLEAN_NO_2', sortOrder: 7 },
  { id: 'concrete-rebar', label: 'Concrete with Rebar', group: 'heavy', internalClass: 'CLEAN_NO_2', sortOrder: 8 },
  { id: 'bricks', label: 'Bricks', group: 'heavy', internalClass: 'CLEAN_NO_2', sortOrder: 9 },
  { id: 'mixed-heavy', label: 'Mixed Heavy', group: 'heavy', internalClass: 'ALL_MIXED', sortOrder: 10 },
  { id: 'other-heavy', label: 'Other Heavy Material', group: 'heavy', internalClass: 'ALL_MIXED', sortOrder: 11 },
];

export function getMaterialOptionsForGroup(group: MaterialGroup): MaterialOption[] {
  if (group === 'general') return GENERAL_DEBRIS_OPTIONS;
  if (group === 'heavy') return HEAVY_MATERIAL_OPTIONS;
  return [];
}
