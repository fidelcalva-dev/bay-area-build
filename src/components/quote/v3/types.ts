// V3 Quote Flow Types

export type V3Step = 'zip' | 'customer-type' | 'project' | 'size' | 'price' | 'confirm';

export type CustomerType = 'homeowner' | 'contractor' | 'commercial';

export interface ProjectCard {
  id: string;
  label: string;
  description: string;
  icon: string; // lucide icon name
  materialCategory: 'GENERAL_DEBRIS' | 'HEAVY_MATERIALS' | 'YARD_WASTE' | 'CLEAN_RECYCLING';
  isHeavy: boolean;
  suggestedSize: number;
  customerTypes: CustomerType[];
}

export interface V3QuoteState {
  zip: string;
  customerType: CustomerType | null;
  project: ProjectCard | null;
  size: number;
  price: number;
  includedTons: number;
  isFlatFee: boolean;
  isValid: boolean;
}

// Project cards by customer type
export const HOMEOWNER_PROJECTS: ProjectCard[] = [
  {
    id: 'garage-cleanout',
    label: 'Garage Cleanout',
    description: 'Old furniture, boxes, household items',
    icon: 'warehouse',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 20,
    customerTypes: ['homeowner'],
  },
  {
    id: 'kitchen-remodel',
    label: 'Kitchen Remodel',
    description: 'Cabinets, counters, drywall, flooring',
    icon: 'utensils-crossed',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 20,
    customerTypes: ['homeowner'],
  },
  {
    id: 'roofing-tearoff',
    label: 'Roofing Tear-Off',
    description: 'Shingles, underlayment, flashing',
    icon: 'home',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 30,
    customerTypes: ['homeowner'],
  },
  {
    id: 'yard-cleanup',
    label: 'Yard Cleanup',
    description: 'Branches, grass, landscaping debris',
    icon: 'trees',
    materialCategory: 'YARD_WASTE',
    isHeavy: false,
    suggestedSize: 10,
    customerTypes: ['homeowner'],
  },
];

export const CONTRACTOR_PROJECTS: ProjectCard[] = [
  {
    id: 'demo-debris',
    label: 'Demo Debris',
    description: 'Drywall, wood, mixed construction waste',
    icon: 'hammer',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 30,
    customerTypes: ['contractor'],
  },
  {
    id: 'concrete-removal',
    label: 'Concrete Removal',
    description: 'Slabs, sidewalks, foundations',
    icon: 'hard-hat',
    materialCategory: 'HEAVY_MATERIALS',
    isHeavy: true,
    suggestedSize: 10,
    customerTypes: ['contractor'],
  },
  {
    id: 'dirt-excavation',
    label: 'Dirt / Excavation',
    description: 'Clean fill, soil, grading material',
    icon: 'mountain',
    materialCategory: 'HEAVY_MATERIALS',
    isHeavy: true,
    suggestedSize: 10,
    customerTypes: ['contractor'],
  },
  {
    id: 'mixed-cd',
    label: 'Mixed C&D',
    description: 'Construction & demolition mix',
    icon: 'construction',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 30,
    customerTypes: ['contractor'],
  },
];

export const COMMERCIAL_PROJECTS: ProjectCard[] = [
  {
    id: 'tenant-moveout',
    label: 'Tenant Move-Out',
    description: 'Furniture, fixtures, general waste',
    icon: 'door-open',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 20,
    customerTypes: ['commercial'],
  },
  {
    id: 'warehouse-cleanout',
    label: 'Warehouse Cleanout',
    description: 'Pallets, racking, bulk items',
    icon: 'warehouse',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 40,
    customerTypes: ['commercial'],
  },
  {
    id: 'store-remodel',
    label: 'Store Remodel',
    description: 'Fixtures, drywall, flooring',
    icon: 'store',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 30,
    customerTypes: ['commercial'],
  },
  {
    id: 'ongoing-waste',
    label: 'Ongoing Waste',
    description: 'Regular pickups, recurring service',
    icon: 'refresh-cw',
    materialCategory: 'GENERAL_DEBRIS',
    isHeavy: false,
    suggestedSize: 20,
    customerTypes: ['commercial'],
  },
];

export function getProjectsForCustomerType(type: CustomerType): ProjectCard[] {
  switch (type) {
    case 'homeowner': return HOMEOWNER_PROJECTS;
    case 'contractor': return CONTRACTOR_PROJECTS;
    case 'commercial': return COMMERCIAL_PROJECTS;
  }
}
