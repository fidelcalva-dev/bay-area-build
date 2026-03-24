// ============================================================
// UNIVERSAL PROJECT TYPES — Customer-facing project selection
// Replaces per-customer-type project cards with universal list
// ============================================================

export interface UniversalProject {
  id: string;
  label: string;
  description: string;
  icon: string;
  materialCategory: 'GENERAL_DEBRIS' | 'HEAVY_MATERIALS' | 'MIXED';
  isHeavy: boolean;
  suggestedSize: number;
  /** Which customer segments commonly pick this */
  segments: ('homeowner' | 'contractor' | 'commercial')[];
  /** Display order priority (lower = shown first) */
  sortOrder: number;
}

export const UNIVERSAL_PROJECTS: UniversalProject[] = [
  {
    id: 'home-cleanout',
    label: 'Home Cleanout',
    description: 'Furniture, boxes, household items',
    icon: 'home',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 20,
    segments: ['homeowner'],
    sortOrder: 1,
  },
  {
    id: 'kitchen-remodel',
    label: 'Kitchen Remodel',
    description: 'Cabinets, counters, drywall, flooring',
    icon: 'utensils-crossed',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 20,
    segments: ['homeowner', 'contractor'],
    sortOrder: 2,
  },
  {
    id: 'bathroom-remodel',
    label: 'Bathroom Remodel',
    description: 'Tile, fixtures, drywall, plumbing debris',
    icon: 'bath',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 10,
    segments: ['homeowner', 'contractor'],
    sortOrder: 3,
  },
  {
    id: 'garage-cleanout',
    label: 'Garage Cleanout',
    description: 'Old furniture, tools, storage items',
    icon: 'warehouse',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 20,
    segments: ['homeowner'],
    sortOrder: 4,
  },
  {
    id: 'roofing',
    label: 'Roofing',
    description: 'Shingles, underlayment, flashing',
    icon: 'home',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 30,
    segments: ['homeowner', 'contractor'],
    sortOrder: 5,
  },
  {
    id: 'construction-debris',
    label: 'Construction Debris',
    description: 'Drywall, wood, mixed construction waste',
    icon: 'hammer',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 30,
    segments: ['contractor'],
    sortOrder: 6,
  },
  {
    id: 'demolition',
    label: 'Demolition',
    description: 'Full or partial demo, mixed debris',
    icon: 'construction',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 30,
    segments: ['contractor', 'commercial'],
    sortOrder: 7,
  },
  {
    id: 'yard-cleanup',
    label: 'Yard Cleanup',
    description: 'Branches, grass, landscaping debris',
    icon: 'trees',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 10,
    segments: ['homeowner'],
    sortOrder: 8,
  },
  {
    id: 'concrete-soil-sand',
    label: 'Concrete / Soil / Sand',
    description: 'Heavy materials — smaller dumpsters only',
    icon: 'mountain',
    materialCategory: 'HEAVY_MATERIALS',
    isHeavy: true,
    suggestedSize: 10,
    segments: ['contractor', 'homeowner'],
    sortOrder: 9,
  },
  {
    id: 'contractor-recurring',
    label: 'Contractor / Recurring',
    description: 'Ongoing service, multiple pickups',
    icon: 'refresh-cw',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 30,
    segments: ['contractor', 'commercial'],
    sortOrder: 10,
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Tell us about your project',
    icon: 'help-circle',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 20,
    segments: ['homeowner', 'contractor', 'commercial'],
    sortOrder: 11,
  },
];

export function getUniversalProjects(): UniversalProject[] {
  return [...UNIVERSAL_PROJECTS].sort((a, b) => a.sortOrder - b.sortOrder);
}
