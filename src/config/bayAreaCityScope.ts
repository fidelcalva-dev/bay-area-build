/**
 * BAY_AREA_CITY_SCOPE — Canonical source of truth for public SEO city coverage
 * 
 * Rules:
 * - Only 9 Bay Area counties are in scope
 * - Tier 1 = Flagship domination pages (hand-optimized)
 * - Tier 2 = Programmatic city pages (template-driven, strong local content)
 * - Tier 3 = Partner network cities (lighter content, PARTNER_NETWORK model)
 * - Any city outside this scope must NOT be generated or published
 */

export type CityTier = 1 | 2 | 3;

export interface BayAreaCity {
  citySlug: string;
  cityName: string;
  county: string;
  tier: CityTier;
  activeForPublicSeo: boolean;
  activeForQuotes: boolean;
  principalZip: string;
  nearestYardId: string;
  supportRing: boolean;
  region: 'east-bay' | 'south-bay' | 'san-francisco' | 'north-bay' | 'peninsula';
}

export const BAY_AREA_COUNTIES = [
  'Alameda',
  'Contra Costa',
  'Marin',
  'Napa',
  'San Francisco',
  'San Mateo',
  'Santa Clara',
  'Solano',
  'Sonoma',
] as const;

export type BayAreaCounty = typeof BAY_AREA_COUNTIES[number];

// ============================================================
// TIER 1 — Flagship domination markets
// ============================================================
const TIER_1_CITIES: BayAreaCity[] = [
  { citySlug: 'oakland', cityName: 'Oakland', county: 'Alameda', tier: 1, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94601', nearestYardId: 'oakland-yard', supportRing: false, region: 'east-bay' },
  { citySlug: 'san-jose', cityName: 'San Jose', county: 'Santa Clara', tier: 1, activeForPublicSeo: true, activeForQuotes: true, principalZip: '95112', nearestYardId: 'sanjose-yard', supportRing: false, region: 'south-bay' },
  { citySlug: 'san-francisco', cityName: 'San Francisco', county: 'San Francisco', tier: 1, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94110', nearestYardId: 'oakland-yard', supportRing: false, region: 'san-francisco' },
];

// ============================================================
// TIER 2 — Core direct markets (programmatic pages)
// ============================================================
const TIER_2_CITIES: BayAreaCity[] = [
  // Alameda County
  { citySlug: 'berkeley', cityName: 'Berkeley', county: 'Alameda', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94704', nearestYardId: 'oakland-yard', supportRing: true, region: 'east-bay' },
  { citySlug: 'alameda', cityName: 'Alameda', county: 'Alameda', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94501', nearestYardId: 'oakland-yard', supportRing: true, region: 'east-bay' },
  { citySlug: 'san-leandro', cityName: 'San Leandro', county: 'Alameda', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94577', nearestYardId: 'oakland-yard', supportRing: true, region: 'east-bay' },
  { citySlug: 'hayward', cityName: 'Hayward', county: 'Alameda', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94541', nearestYardId: 'oakland-yard', supportRing: true, region: 'east-bay' },
  { citySlug: 'fremont', cityName: 'Fremont', county: 'Alameda', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94538', nearestYardId: 'sanjose-yard', supportRing: true, region: 'east-bay' },
  { citySlug: 'pleasanton', cityName: 'Pleasanton', county: 'Alameda', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94566', nearestYardId: 'oakland-yard', supportRing: true, region: 'east-bay' },
  { citySlug: 'dublin', cityName: 'Dublin', county: 'Alameda', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94568', nearestYardId: 'oakland-yard', supportRing: true, region: 'east-bay' },
  { citySlug: 'livermore', cityName: 'Livermore', county: 'Alameda', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94550', nearestYardId: 'oakland-yard', supportRing: true, region: 'east-bay' },
  { citySlug: 'emeryville', cityName: 'Emeryville', county: 'Alameda', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94608', nearestYardId: 'oakland-yard', supportRing: true, region: 'east-bay' },
  // Contra Costa County
  { citySlug: 'walnut-creek', cityName: 'Walnut Creek', county: 'Contra Costa', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94596', nearestYardId: 'oakland-yard', supportRing: true, region: 'east-bay' },
  { citySlug: 'concord', cityName: 'Concord', county: 'Contra Costa', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94520', nearestYardId: 'oakland-yard', supportRing: true, region: 'east-bay' },
  { citySlug: 'richmond', cityName: 'Richmond', county: 'Contra Costa', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94804', nearestYardId: 'oakland-yard', supportRing: true, region: 'east-bay' },
  // Santa Clara County
  { citySlug: 'santa-clara', cityName: 'Santa Clara', county: 'Santa Clara', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '95050', nearestYardId: 'sanjose-yard', supportRing: true, region: 'south-bay' },
  { citySlug: 'sunnyvale', cityName: 'Sunnyvale', county: 'Santa Clara', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94086', nearestYardId: 'sanjose-yard', supportRing: true, region: 'south-bay' },
  { citySlug: 'mountain-view', cityName: 'Mountain View', county: 'Santa Clara', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94043', nearestYardId: 'sanjose-yard', supportRing: true, region: 'south-bay' },
  { citySlug: 'palo-alto', cityName: 'Palo Alto', county: 'Santa Clara', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94301', nearestYardId: 'sanjose-yard', supportRing: true, region: 'south-bay' },
  { citySlug: 'milpitas', cityName: 'Milpitas', county: 'Santa Clara', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '95035', nearestYardId: 'sanjose-yard', supportRing: true, region: 'south-bay' },
  { citySlug: 'cupertino', cityName: 'Cupertino', county: 'Santa Clara', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '95014', nearestYardId: 'sanjose-yard', supportRing: true, region: 'south-bay' },
  // San Mateo County
  { citySlug: 'redwood-city', cityName: 'Redwood City', county: 'San Mateo', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94063', nearestYardId: 'sanjose-yard', supportRing: true, region: 'peninsula' },
  { citySlug: 'san-mateo', cityName: 'San Mateo', county: 'San Mateo', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94401', nearestYardId: 'sanjose-yard', supportRing: true, region: 'peninsula' },
  { citySlug: 'south-san-francisco', cityName: 'South San Francisco', county: 'San Mateo', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94080', nearestYardId: 'oakland-yard', supportRing: true, region: 'peninsula' },
  { citySlug: 'daly-city', cityName: 'Daly City', county: 'San Mateo', tier: 2, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94014', nearestYardId: 'oakland-yard', supportRing: true, region: 'peninsula' },
];

// ============================================================
// TIER 3 — Partner network markets (Bay Area scope but lighter SEO)
// ============================================================
const TIER_3_CITIES: BayAreaCity[] = [
  // Marin County
  { citySlug: 'san-rafael', cityName: 'San Rafael', county: 'Marin', tier: 3, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94901', nearestYardId: 'oakland-yard', supportRing: true, region: 'north-bay' },
  // Sonoma County
  { citySlug: 'santa-rosa', cityName: 'Santa Rosa', county: 'Sonoma', tier: 3, activeForPublicSeo: true, activeForQuotes: true, principalZip: '95401', nearestYardId: 'oakland-yard', supportRing: true, region: 'north-bay' },
  { citySlug: 'petaluma', cityName: 'Petaluma', county: 'Sonoma', tier: 3, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94952', nearestYardId: 'oakland-yard', supportRing: true, region: 'north-bay' },
  // Napa County
  { citySlug: 'napa', cityName: 'Napa', county: 'Napa', tier: 3, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94559', nearestYardId: 'oakland-yard', supportRing: true, region: 'north-bay' },
  // Solano County
  { citySlug: 'vallejo', cityName: 'Vallejo', county: 'Solano', tier: 3, activeForPublicSeo: true, activeForQuotes: true, principalZip: '94590', nearestYardId: 'oakland-yard', supportRing: true, region: 'north-bay' },
];

// ============================================================
// COMBINED SCOPE
// ============================================================
export const BAY_AREA_CITY_SCOPE: BayAreaCity[] = [
  ...TIER_1_CITIES,
  ...TIER_2_CITIES,
  ...TIER_3_CITIES,
];

// ============================================================
// HELPERS
// ============================================================

/** Check if a city slug is within Bay Area scope */
export function isInBayAreaScope(citySlug: string): boolean {
  return BAY_AREA_CITY_SCOPE.some(c => c.citySlug === citySlug);
}

/** Get city config by slug */
export function getBayAreaCity(citySlug: string): BayAreaCity | undefined {
  return BAY_AREA_CITY_SCOPE.find(c => c.citySlug === citySlug);
}

/** Get all cities for a specific tier */
export function getCitiesByTier(tier: CityTier): BayAreaCity[] {
  return BAY_AREA_CITY_SCOPE.filter(c => c.tier === tier);
}

/** Get all cities in a specific county */
export function getCitiesByCounty(county: BayAreaCounty): BayAreaCity[] {
  return BAY_AREA_CITY_SCOPE.filter(c => c.county === county);
}

/** Get all cities active for public SEO */
export function getActiveSeoScopeCities(): BayAreaCity[] {
  return BAY_AREA_CITY_SCOPE.filter(c => c.activeForPublicSeo);
}

/** Get flagship (Tier 1) cities */
export function getFlagshipCities(): BayAreaCity[] {
  return TIER_1_CITIES;
}

/** Get the canonical domination URL for a Tier 1 city */
export function getDominationUrl(citySlug: string): string | null {
  const city = TIER_1_CITIES.find(c => c.citySlug === citySlug);
  if (!city) return null;
  return `/dumpster-rental-${citySlug}-ca`;
}

/** Get the programmatic URL for any in-scope city */
export function getProgrammaticUrl(citySlug: string): string {
  return `/dumpster-rental/${citySlug}`;
}

/** Total city count for display */
export const TOTAL_BAY_AREA_CITIES = BAY_AREA_CITY_SCOPE.length;
