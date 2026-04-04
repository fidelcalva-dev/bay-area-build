// ============================================================
// WASTE CATALOG — Full material taxonomy for multi-select UI
// ============================================================

export interface WasteMaterial {
  id: string;
  label: string;
  category: 'general' | 'heavy';
  group: string; // display grouping
  recyclableEligible?: boolean;
  specialHandling?: boolean;
  reviewRequired?: boolean;
  sortOrder: number;
}

export interface ProjectUseCase {
  id: string;
  label: string;
  icon: string;
  sortOrder: number;
}

// ── Project / Use Case Options ──────────────────────────────
export const PROJECT_USE_CASES: ProjectUseCase[] = [
  { id: 'home-cleanout', label: 'Home Cleanout', icon: 'home', sortOrder: 1 },
  { id: 'garage-cleanout', label: 'Garage Cleanout', icon: 'warehouse', sortOrder: 2 },
  { id: 'moving-estate', label: 'Moving / Estate Cleanout', icon: 'truck', sortOrder: 3 },
  { id: 'kitchen-remodel', label: 'Kitchen Remodel', icon: 'utensils-crossed', sortOrder: 4 },
  { id: 'bathroom-remodel', label: 'Bathroom Remodel', icon: 'bath', sortOrder: 5 },
  { id: 'flooring-removal', label: 'Flooring Removal', icon: 'layers', sortOrder: 6 },
  { id: 'roofing-tearoff', label: 'Roofing Tear-off', icon: 'home', sortOrder: 7 },
  { id: 'yard-cleanup', label: 'Yard Cleanup', icon: 'trees', sortOrder: 8 },
  { id: 'adu-addition', label: 'ADU / Addition', icon: 'building', sortOrder: 9 },
  { id: 'construction-jobsite', label: 'Construction Jobsite', icon: 'hammer', sortOrder: 10 },
  { id: 'demolition-cleanup', label: 'Demolition Cleanup', icon: 'construction', sortOrder: 11 },
  { id: 'tenant-turnover', label: 'Tenant Turnover', icon: 'door-open', sortOrder: 12 },
  { id: 'commercial-cleanup', label: 'Commercial Cleanup', icon: 'building-2', sortOrder: 13 },
  { id: 'concrete-dirt', label: 'Concrete / Dirt Removal', icon: 'mountain', sortOrder: 14 },
  { id: 'not-sure', label: 'Not Sure', icon: 'help-circle', sortOrder: 15 },
];

// ── General Debris Materials ────────────────────────────────
export const GENERAL_DEBRIS_MATERIALS: WasteMaterial[] = [
  { id: 'household-junk', label: 'Household Junk', category: 'general', group: 'Household', sortOrder: 1 },
  { id: 'furniture', label: 'Furniture', category: 'general', group: 'Household', sortOrder: 2 },
  { id: 'mattresses', label: 'Mattresses', category: 'general', group: 'Household', sortOrder: 3 },
  { id: 'cardboard', label: 'Cardboard', category: 'general', group: 'Household', recyclableEligible: true, sortOrder: 4 },
  { id: 'paper-packaging', label: 'Paper / Packaging', category: 'general', group: 'Household', sortOrder: 5 },
  { id: 'plastic', label: 'Plastic', category: 'general', group: 'Household', sortOrder: 6 },
  { id: 'clothing-toys', label: 'Clothing / Toys', category: 'general', group: 'Household', sortOrder: 7 },
  { id: 'wood-lumber', label: 'Wood / Lumber', category: 'general', group: 'Construction', recyclableEligible: true, sortOrder: 8 },
  { id: 'cabinets-trim', label: 'Cabinets / Trim', category: 'general', group: 'Construction', sortOrder: 9 },
  { id: 'pallets', label: 'Pallets', category: 'general', group: 'Construction', sortOrder: 10 },
  { id: 'drywall-sheetrock', label: 'Drywall / Sheetrock', category: 'general', group: 'Construction', sortOrder: 11 },
  { id: 'plaster', label: 'Plaster', category: 'general', group: 'Construction', sortOrder: 12 },
  { id: 'insulation', label: 'Insulation', category: 'general', group: 'Construction', sortOrder: 13 },
  { id: 'carpet', label: 'Carpet', category: 'general', group: 'Flooring', sortOrder: 14 },
  { id: 'carpet-padding', label: 'Carpet Padding', category: 'general', group: 'Flooring', sortOrder: 15 },
  { id: 'laminate-flooring', label: 'Laminate Flooring', category: 'general', group: 'Flooring', sortOrder: 16 },
  { id: 'vinyl-flooring', label: 'Vinyl Flooring', category: 'general', group: 'Flooring', sortOrder: 17 },
  { id: 'tile-backing', label: 'Tile Backing / Underlayment', category: 'general', group: 'Flooring', sortOrder: 18 },
  { id: 'roofing-shingles', label: 'Roofing Shingles', category: 'general', group: 'Roofing & Exterior', sortOrder: 19 },
  { id: 'siding', label: 'Siding', category: 'general', group: 'Roofing & Exterior', sortOrder: 20 },
  { id: 'mixed-construction', label: 'Mixed Construction Debris', category: 'general', group: 'Mixed', sortOrder: 21 },
  { id: 'mixed-remodel', label: 'Mixed Remodel Debris', category: 'general', group: 'Mixed', sortOrder: 22 },
  { id: 'demolition-debris', label: 'Demolition Debris', category: 'general', group: 'Mixed', sortOrder: 23 },
  { id: 'yard-waste-brush', label: 'Yard Waste / Brush', category: 'general', group: 'Yard', recyclableEligible: true, sortOrder: 24 },
  { id: 'green-waste', label: 'Green Waste', category: 'general', group: 'Yard', recyclableEligible: true, sortOrder: 25 },
  { id: 'branches-leaves', label: 'Branches / Leaves', category: 'general', group: 'Yard', sortOrder: 26 },
  { id: 'dirt-with-roots', label: 'Dirt with Roots', category: 'general', group: 'Yard', reviewRequired: true, sortOrder: 27 },
  { id: 'other-general', label: 'Other General Debris', category: 'general', group: 'Other', sortOrder: 28 },
];

// ── Heavy Materials ─────────────────────────────────────────
export const HEAVY_MATERIALS: WasteMaterial[] = [
  { id: 'clean-concrete', label: 'Clean Concrete', category: 'heavy', group: 'Concrete & Masonry', recyclableEligible: true, sortOrder: 1 },
  { id: 'concrete-rebar', label: 'Concrete with Rebar', category: 'heavy', group: 'Concrete & Masonry', sortOrder: 2 },
  { id: 'clean-soil', label: 'Clean Soil / Dirt', category: 'heavy', group: 'Earth & Aggregate', recyclableEligible: true, sortOrder: 3 },
  { id: 'sand', label: 'Sand', category: 'heavy', group: 'Earth & Aggregate', sortOrder: 4 },
  { id: 'gravel', label: 'Gravel', category: 'heavy', group: 'Earth & Aggregate', sortOrder: 5 },
  { id: 'brick', label: 'Brick', category: 'heavy', group: 'Concrete & Masonry', sortOrder: 6 },
  { id: 'block-cmu', label: 'Block / CMU', category: 'heavy', group: 'Concrete & Masonry', sortOrder: 7 },
  { id: 'tile-ceramic', label: 'Tile / Ceramic', category: 'heavy', group: 'Concrete & Masonry', sortOrder: 8 },
  { id: 'rock-stone', label: 'Rock / Stone', category: 'heavy', group: 'Earth & Aggregate', sortOrder: 9 },
  { id: 'asphalt', label: 'Asphalt', category: 'heavy', group: 'Paving', recyclableEligible: true, sortOrder: 10 },
  { id: 'granite', label: 'Granite', category: 'heavy', group: 'Earth & Aggregate', sortOrder: 11 },
  { id: 'stucco-mortar', label: 'Stucco / Mortar', category: 'heavy', group: 'Concrete & Masonry', sortOrder: 12 },
  { id: 'mixed-heavy', label: 'Mixed Heavy Materials', category: 'heavy', group: 'Mixed', sortOrder: 13 },
  { id: 'other-heavy', label: 'Other Heavy Material', category: 'heavy', group: 'Other', sortOrder: 14 },
];

// ── Special Handling Items ──────────────────────────────────
export const SPECIAL_HANDLING_ITEMS: WasteMaterial[] = [
  { id: 'appliances', label: 'Appliances', category: 'general', group: 'Special', specialHandling: true, sortOrder: 1 },
  { id: 'refrigerators', label: 'Refrigerators', category: 'general', group: 'Special', specialHandling: true, sortOrder: 2 },
  { id: 'water-heaters', label: 'Water Heaters', category: 'general', group: 'Special', specialHandling: true, sortOrder: 3 },
  { id: 'tires', label: 'Tires', category: 'general', group: 'Special', specialHandling: true, sortOrder: 4 },
  { id: 'dirt-mixed-trash', label: 'Dirt Mixed with Trash', category: 'heavy', group: 'Special', specialHandling: true, reviewRequired: true, sortOrder: 5 },
  { id: 'wet-debris', label: 'Wet Debris', category: 'general', group: 'Special', specialHandling: true, sortOrder: 6 },
  { id: 'treated-wood', label: 'Treated Wood', category: 'general', group: 'Special', specialHandling: true, sortOrder: 7 },
  { id: 'painted-material', label: 'Painted Material', category: 'general', group: 'Special', specialHandling: true, sortOrder: 8 },
  { id: 'glass-large', label: 'Glass (large quantity)', category: 'general', group: 'Special', specialHandling: true, sortOrder: 9 },
  { id: 'concrete-mixed-trash', label: 'Concrete with Mixed Trash', category: 'heavy', group: 'Special', specialHandling: true, reviewRequired: true, sortOrder: 10 },
  { id: 'mixed-heavy-general', label: 'Mixed Heavy + General', category: 'heavy', group: 'Special', specialHandling: true, reviewRequired: true, sortOrder: 11 },
  { id: 'bagged-unknown', label: 'Bagged Unknown Material', category: 'general', group: 'Special', specialHandling: true, reviewRequired: true, sortOrder: 12 },
];

// ── Prohibited Items ────────────────────────────────────────
export const PROHIBITED_ITEMS = [
  'Paint', 'Solvents', 'Chemicals', 'Asbestos', 'Biohazard',
  'Medical Waste', 'Batteries', 'Fuel / Oil', 'Propane Tanks',
  'Explosives', 'Hazardous Waste',
];

// ── Recyclable Credit Copy ──────────────────────────────────
export const RECYCLING_CREDIT_COPY = {
  badge: 'Recycling Credit Possible',
  disclaimer: 'Clean, source-separated recyclable loads may qualify for a recycling credit or reduced disposal charge after final inspection, contamination check, actual weight, and facility confirmation.',
};

// ── Mixed Load Warning ──────────────────────────────────────
export const MIXED_LOAD_WARNING = 'For more accurate pricing, we recommend separate dumpsters for general debris and heavy materials. Mixed loads may be repriced and may not qualify for recycling credit.';

// ── Helpers ─────────────────────────────────────────────────
export function groupMaterialsByGroup(materials: WasteMaterial[]): Record<string, WasteMaterial[]> {
  const groups: Record<string, WasteMaterial[]> = {};
  for (const m of materials) {
    if (!groups[m.group]) groups[m.group] = [];
    groups[m.group].push(m);
  }
  return groups;
}

export function hasRecyclableSelection(selectedIds: string[]): boolean {
  const all = [...GENERAL_DEBRIS_MATERIALS, ...HEAVY_MATERIALS];
  return selectedIds.some(id => all.find(m => m.id === id)?.recyclableEligible);
}

export function hasHeavySelection(selectedIds: string[]): boolean {
  return selectedIds.some(id => HEAVY_MATERIALS.some(m => m.id === id));
}

export function hasGeneralSelection(selectedIds: string[]): boolean {
  return selectedIds.some(id => GENERAL_DEBRIS_MATERIALS.some(m => m.id === id));
}

export function hasSpecialHandling(selectedIds: string[]): boolean {
  return selectedIds.some(id => SPECIAL_HANDLING_ITEMS.some(m => m.id === id));
}

export function isMixedLoad(selectedIds: string[]): boolean {
  return hasGeneralSelection(selectedIds) && hasHeavySelection(selectedIds);
}

export function needsManualReview(selectedIds: string[]): boolean {
  const all = [...GENERAL_DEBRIS_MATERIALS, ...HEAVY_MATERIALS, ...SPECIAL_HANDLING_ITEMS];
  return selectedIds.some(id => all.find(m => m.id === id)?.reviewRequired);
}
