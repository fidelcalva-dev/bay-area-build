// Service Area Configuration — Single source of truth for regions, service model, and city hierarchy
// Used by /Areas page, regional hubs, internal linking, and city pages

export type ServiceModel = 'DIRECT_OPERATION' | 'PARTNER_NETWORK';

export interface RegionConfig {
  slug: string;          // URL path segment
  name: string;          // Display name
  hubUrl: string;        // Hub page route
  description: string;
  yardId?: string;       // Primary yard for direct regions
  counties: string[];    // County names for display
  serviceModel: ServiceModel;
}

export interface CityConfig {
  slug: string;          // Canonical city slug (no -ca suffix)
  name: string;
  region: string;        // Region slug
  serviceModel: ServiceModel;
  tier: 1 | 2 | 3;      // Priority tier
}

// ============================================================
// REGIONAL HIERARCHY
// ============================================================

export const REGIONS: RegionConfig[] = [
  {
    slug: 'east-bay',
    name: 'East Bay',
    hubUrl: '/dumpster-rental-east-bay',
    description: 'Direct operations from our Oakland yard — same-day delivery to Oakland, Berkeley, Hayward, Fremont, and all Alameda & Contra Costa communities.',
    yardId: 'oakland',
    counties: ['Alameda County', 'Contra Costa County'],
    serviceModel: 'DIRECT_OPERATION',
  },
  {
    slug: 'south-bay',
    name: 'South Bay',
    hubUrl: '/dumpster-rental-south-bay',
    description: 'Direct operations from our San Jose yard — fast delivery across San Jose, Santa Clara, Sunnyvale, and Silicon Valley.',
    yardId: 'sanjose',
    counties: ['Santa Clara County', 'San Mateo County'],
    serviceModel: 'DIRECT_OPERATION',
  },
  {
    slug: 'san-francisco',
    name: 'San Francisco',
    hubUrl: '/dumpster-rental-san-francisco-ca',
    description: 'Direct service across all San Francisco neighborhoods — expert placement for tight streets and permitted locations.',
    yardId: 'sf',
    counties: ['San Francisco County'],
    serviceModel: 'DIRECT_OPERATION',
  },
  {
    slug: 'north-bay',
    name: 'North Bay',
    hubUrl: '/north-bay-dumpster-rental',
    description: 'Service coordination across Marin, Sonoma, Napa, and Solano counties through our trusted logistics network.',
    counties: ['Marin County', 'Sonoma County', 'Napa County', 'Solano County'],
    serviceModel: 'PARTNER_NETWORK',
  },
];

// ============================================================
// CITY DIRECTORY — Tier 1/2 = Direct, Tier 3 = Partner
// ============================================================

export const CITY_DIRECTORY: CityConfig[] = [
  // Tier 1 — Domination markets
  { slug: 'oakland', name: 'Oakland', region: 'east-bay', serviceModel: 'DIRECT_OPERATION', tier: 1 },
  { slug: 'san-jose', name: 'San Jose', region: 'south-bay', serviceModel: 'DIRECT_OPERATION', tier: 1 },
  { slug: 'san-francisco', name: 'San Francisco', region: 'san-francisco', serviceModel: 'DIRECT_OPERATION', tier: 1 },

  // Tier 2 — Core direct markets
  { slug: 'berkeley', name: 'Berkeley', region: 'east-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'alameda', name: 'Alameda', region: 'east-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'san-leandro', name: 'San Leandro', region: 'east-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'hayward', name: 'Hayward', region: 'east-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'fremont', name: 'Fremont', region: 'east-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'walnut-creek', name: 'Walnut Creek', region: 'east-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'concord', name: 'Concord', region: 'east-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'pleasanton', name: 'Pleasanton', region: 'east-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'dublin', name: 'Dublin', region: 'east-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'livermore', name: 'Livermore', region: 'east-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'santa-clara', name: 'Santa Clara', region: 'south-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'sunnyvale', name: 'Sunnyvale', region: 'south-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'mountain-view', name: 'Mountain View', region: 'south-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'palo-alto', name: 'Palo Alto', region: 'south-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'milpitas', name: 'Milpitas', region: 'south-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'cupertino', name: 'Cupertino', region: 'south-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'redwood-city', name: 'Redwood City', region: 'south-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'richmond', name: 'Richmond', region: 'east-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },
  { slug: 'emeryville', name: 'Emeryville', region: 'east-bay', serviceModel: 'DIRECT_OPERATION', tier: 2 },

  // Tier 3 — North Bay partner markets (within Bay Area scope)
  { slug: 'santa-rosa', name: 'Santa Rosa', region: 'north-bay', serviceModel: 'PARTNER_NETWORK', tier: 3 },
  { slug: 'vallejo', name: 'Vallejo', region: 'north-bay', serviceModel: 'PARTNER_NETWORK', tier: 3 },
];

// ============================================================
// HELPERS
// ============================================================

export function getRegion(slug: string): RegionConfig | undefined {
  return REGIONS.find(r => r.slug === slug);
}

export function getCitiesForRegion(regionSlug: string): CityConfig[] {
  return CITY_DIRECTORY.filter(c => c.region === regionSlug);
}

export function getDirectCities(): CityConfig[] {
  return CITY_DIRECTORY.filter(c => c.serviceModel === 'DIRECT_OPERATION');
}

export function getPartnerCities(): CityConfig[] {
  return CITY_DIRECTORY.filter(c => c.serviceModel === 'PARTNER_NETWORK');
}

export function getCityConfig(slug: string): CityConfig | undefined {
  return CITY_DIRECTORY.find(c => c.slug === slug);
}

/** Trust copy based on service model */
export function getServiceModelCopy(model: ServiceModel, cityName: string, regionName?: string): string {
  if (model === 'DIRECT_OPERATION') {
    return `Serving ${cityName} from our local yard operations — direct dispatch, fast delivery, full fleet availability.`;
  }
  return `Service available in ${cityName}${regionName ? ` and the ${regionName}` : ''} through our coordinated logistics network.`;
}

// ============================================================
// YARD CLUSTER MAPPING — Links cities to their support yard
// ============================================================

export type YardCluster = 'oakland' | 'sanjose' | 'sf';

export const YARD_CLUSTER_MAP: Record<string, YardCluster> = {
  // Oakland support cluster
  'oakland': 'oakland',
  'berkeley': 'oakland',
  'alameda': 'oakland',
  'san-leandro': 'oakland',
  'hayward': 'oakland',
  'walnut-creek': 'oakland',
  'concord': 'oakland',
  'pleasanton': 'oakland',
  'dublin': 'oakland',
  'livermore': 'oakland',
  'richmond': 'oakland',
  'emeryville': 'oakland',
  // San Jose support cluster
  'san-jose': 'sanjose',
  'fremont': 'sanjose',
  'santa-clara': 'sanjose',
  'sunnyvale': 'sanjose',
  'mountain-view': 'sanjose',
  'palo-alto': 'sanjose',
  'milpitas': 'sanjose',
  'cupertino': 'sanjose',
  'redwood-city': 'sanjose',
  // SF cluster
  'san-francisco': 'sf',
};

export const YARD_CLUSTER_LABELS: Record<YardCluster, { yardCity: string; regionLabel: string }> = {
  oakland: { yardCity: 'Oakland', regionLabel: 'East Bay' },
  sanjose: { yardCity: 'San Jose', regionLabel: 'South Bay' },
  sf: { yardCity: 'San Francisco', regionLabel: 'San Francisco' },
};

export function getYardCluster(citySlug: string): { cluster: YardCluster; yardCity: string; regionLabel: string } | undefined {
  const cluster = YARD_CLUSTER_MAP[citySlug];
  if (!cluster) return undefined;
  return { cluster, ...YARD_CLUSTER_LABELS[cluster] };
}
