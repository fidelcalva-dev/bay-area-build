// Contractor Application Form Types
export interface ContractorFormData {
  // Step 1: Company Info
  legal_business_name: string;
  dba_name: string;
  contact_name: string;
  role_title: string;
  phone: string;
  email: string;
  website: string;
  business_address: string;
  city: string;
  state: string;
  zip: string;

  // Step 2: Contractor Profile
  contractor_type: string;
  license_number: string;
  is_insured: boolean;
  years_in_business: string;
  service_area: string;
  typical_project_type: string;
  current_active_projects: string;
  average_project_size: string;

  // Step 3: Service Needs
  service_line_interest: 'DUMPSTER' | 'CLEANUP' | 'BOTH';
  monthly_dumpster_usage_estimate: string;
  monthly_cleanup_usage_estimate: string;
  recurring_service_interest: boolean;
  preferred_cleanup_frequency: string;
  common_dumpster_sizes: string[];
  common_materials: string[];
  need_priority_service: boolean;
  need_net_terms: boolean;
  required_dump_sites: string;
  notes: string;

  // Step 4: Uploads
  uploadedFiles: UploadedFile[];
}

export interface UploadedFile {
  name: string;
  path: string;
  category: 'license' | 'insurance' | 'w9' | 'project_photos' | 'company_logo';
}

export const CONTRACTOR_TYPES = [
  'General Contractor',
  'Subcontractor',
  'Demolition Contractor',
  'Roofing Contractor',
  'Landscaping Contractor',
  'Excavation Contractor',
  'Property Manager',
  'Real Estate Developer',
  'Restoration Company',
  'Other',
];

export const PROJECT_TYPES = [
  'New Construction',
  'Renovation / Remodel',
  'Roofing',
  'Demolition',
  'Landscaping / Excavation',
  'Commercial Buildout',
  'Multi-Family Cleanout',
  'Residential Cleanout',
  'Post-Construction Cleanup',
  'Other',
];

export const DUMPSTER_SIZES = ['5 yd', '8 yd', '10 yd', '20 yd', '30 yd', '40 yd'];

export const MATERIAL_OPTIONS = [
  'General Debris',
  'Clean Concrete',
  'Clean Soil',
  'Mixed Soil',
  'Roofing Materials',
  'Yard Waste',
  'Mixed Construction',
  'Asphalt',
  'Drywall',
];

export const SERVICE_CITIES = [
  'Oakland', 'San Jose', 'San Francisco', 'Berkeley', 'Alameda',
  'San Leandro', 'Hayward', 'Fremont', 'Walnut Creek', 'Concord',
  'Pleasanton', 'Dublin', 'Livermore', 'Santa Clara', 'Sunnyvale', 'Mountain View',
];

export const CLEANUP_FREQUENCIES = [
  'One-time',
  'Weekly',
  'Bi-weekly',
  'Monthly',
  'As-needed',
];

export const APPLICATION_STEPS = [
  { id: 1, label: 'Company Info' },
  { id: 2, label: 'Profile' },
  { id: 3, label: 'Service Needs' },
  { id: 4, label: 'Documents' },
  { id: 5, label: 'Review' },
];

export function getInitialFormData(): ContractorFormData {
  return {
    legal_business_name: '',
    dba_name: '',
    contact_name: '',
    role_title: '',
    phone: '',
    email: '',
    website: '',
    business_address: '',
    city: '',
    state: 'CA',
    zip: '',
    contractor_type: '',
    license_number: '',
    is_insured: false,
    years_in_business: '',
    service_area: '',
    typical_project_type: '',
    current_active_projects: '',
    average_project_size: '',
    service_line_interest: 'DUMPSTER',
    monthly_dumpster_usage_estimate: '',
    monthly_cleanup_usage_estimate: '',
    recurring_service_interest: false,
    preferred_cleanup_frequency: '',
    common_dumpster_sizes: [],
    common_materials: [],
    need_priority_service: false,
    need_net_terms: false,
    required_dump_sites: '',
    notes: '',
    uploadedFiles: [],
  };
}

/**
 * Calculate contractor fit score (0-100)
 */
export function calculateContractorFitScore(data: ContractorFormData): number {
  let score = 0;

  // Bay Area service area
  const bayAreaCities = ['Oakland', 'San Jose', 'San Francisco', 'Berkeley', 'Alameda', 'Hayward', 'Fremont'];
  if (bayAreaCities.some(c => data.service_area?.toLowerCase().includes(c.toLowerCase()) || data.city?.toLowerCase().includes(c.toLowerCase()))) {
    score += 15;
  }

  // Good business email (not free)
  const freeEmails = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
  if (data.email && !freeEmails.some(d => data.email.endsWith(d))) {
    score += 10;
  }

  // Strong phone/contact
  if (data.phone && data.contact_name) score += 10;

  // Recurring interest
  if (data.recurring_service_interest) score += 10;

  // Multiple active projects
  const activeProjects = parseInt(data.current_active_projects) || 0;
  if (activeProjects >= 3) score += 15;
  else if (activeProjects >= 1) score += 8;

  // Both service lines
  if (data.service_line_interest === 'BOTH') score += 10;

  // Docs uploaded
  if (data.uploadedFiles.length >= 2) score += 10;
  else if (data.uploadedFiles.length >= 1) score += 5;

  // Contractor type aligned to services
  const alignedTypes = ['General Contractor', 'Demolition Contractor', 'Roofing Contractor'];
  if (alignedTypes.includes(data.contractor_type)) score += 5;

  // Insurance
  if (data.is_insured) score += 5;

  // Years in business
  const yib = parseInt(data.years_in_business) || 0;
  if (yib >= 5) score += 5;
  else if (yib >= 2) score += 3;

  // License
  if (data.license_number) score += 5;

  return Math.min(score, 100);
}
