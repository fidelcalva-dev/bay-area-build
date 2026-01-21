// Recycling & Environmental Commitment
// ACCURATE messaging only - no greenwashing
// Use: "recycling-focused", "diversion-supportive", "environmentally responsible hauling"
// Avoid: "100% recycled", "zero waste", unverified claims

import { Recycle, Truck, FileText, Leaf, Scale, Building2, LucideIcon } from 'lucide-react';

export interface RecyclingFact {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

// What Calsan actually does - be accurate
export const WHAT_WE_DO: RecyclingFact[] = [
  {
    id: 'haul',
    icon: Truck,
    title: 'Haul & Deliver',
    description: 'We haul and deliver material to approved, licensed facilities.',
  },
  {
    id: 'support',
    icon: Recycle,
    title: 'Support Recycling Programs',
    description: 'We work with transfer stations that recycle construction and demolition materials whenever possible.',
  },
  {
    id: 'documentation',
    icon: FileText,
    title: 'Provide Documentation',
    description: 'We provide weight tickets and documentation when required for WMP/diversion tracking.',
  },
  {
    id: 'compliance',
    icon: Building2,
    title: 'Compliance Partnership',
    description: 'We partner with licensed transfer stations that follow local recycling regulations.',
  },
];

// Materials commonly recycled at transfer stations
export const RECYCLABLE_MATERIALS = [
  { name: 'Concrete', category: 'heavy' },
  { name: 'Asphalt', category: 'heavy' },
  { name: 'Clean Soil', category: 'heavy' },
  { name: 'Wood', category: 'general' },
  { name: 'Metal', category: 'general' },
  { name: 'Green Waste', category: 'organic' },
  { name: 'Select Plastics', category: 'general' },
] as const;

// Recycling process explanation - factual
export const RECYCLING_PROCESS = {
  title: 'Our Recycling Commitment',
  mainStatement: 'We work with licensed transfer stations that are required to recycle construction and demolition materials whenever possible.',
  steps: [
    {
      step: 1,
      title: 'Collection',
      description: 'We collect debris from your job site or property.',
    },
    {
      step: 2,
      title: 'Transport',
      description: 'Materials are delivered to licensed transfer stations.',
    },
    {
      step: 3,
      title: 'Sorting',
      description: 'Transfer stations sort materials per local regulations.',
    },
    {
      step: 4,
      title: 'Processing',
      description: 'Recyclable materials are processed and diverted from landfill.',
    },
  ],
} as const;

// Green waste & organics section
export const GREEN_WASTE_INFO = {
  title: 'Green Waste & Organics',
  description: 'Trees, branches, and organic material are delivered to facilities that process green waste. Materials are diverted from landfill when possible.',
} as const;

// Metal recycling section
export const METAL_RECYCLING_INFO = {
  title: 'Metal Recycling',
  description: 'Metals are separated and delivered to recycling facilities.',
} as const;

// Disclaimer copy - IMPORTANT
export const RECYCLING_DISCLAIMER = 
  'Recycling rates vary by material type and local facility capabilities. We support recycling and diversion programs but do not operate recycling facilities ourselves.';

// Green Halo future-ready note
export const GREEN_HALO_NOTE = {
  title: 'Recycling Support Available',
  description: 'Recycling reporting and diversion summaries available upon request for qualifying projects.',
  label: 'Green Halo – Recycling Support',
} as const;
