// Market Classification System — Single source of truth for market focus tiers
// Controls which markets get SEO priority, sitemap inclusion, and expansion gating

export type MarketFocus = 'CORE_DIRECT' | 'SUPPORT_RING' | 'OUTSIDE_CURRENT_FOCUS' | 'FUTURE_PARTNER';

export interface MarketClassification {
  slug: string;
  name: string;
  focus: MarketFocus;
  region: string;
  county: string;
  nearestYard: string;
  sitemapPriority: number;
  sitemapChangefreq: 'weekly' | 'monthly';
  indexable: boolean;
  pageStatus: 'ACTIVE' | 'PAUSED' | 'REDIRECT' | 'NOINDEX' | 'ARCHIVED';
  redirectTarget?: string;
  retirementReason?: string;
}

// ============================================================
// CORE DIRECT — Yard cities, highest priority
// ============================================================
const CORE_DIRECT_MARKETS: MarketClassification[] = [
  { slug: 'oakland', name: 'Oakland', focus: 'CORE_DIRECT', region: 'east-bay', county: 'Alameda County', nearestYard: 'oakland', sitemapPriority: 0.95, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'san-jose', name: 'San Jose', focus: 'CORE_DIRECT', region: 'south-bay', county: 'Santa Clara County', nearestYard: 'sanjose', sitemapPriority: 0.95, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'san-francisco', name: 'San Francisco', focus: 'CORE_DIRECT', region: 'san-francisco', county: 'San Francisco County', nearestYard: 'sf', sitemapPriority: 0.95, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
];

// ============================================================
// SUPPORT RING — Bay Area ring, strong priority
// ============================================================
const SUPPORT_RING_MARKETS: MarketClassification[] = [
  { slug: 'berkeley', name: 'Berkeley', focus: 'SUPPORT_RING', region: 'east-bay', county: 'Alameda County', nearestYard: 'oakland', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'alameda', name: 'Alameda', focus: 'SUPPORT_RING', region: 'east-bay', county: 'Alameda County', nearestYard: 'oakland', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'san-leandro', name: 'San Leandro', focus: 'SUPPORT_RING', region: 'east-bay', county: 'Alameda County', nearestYard: 'oakland', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'hayward', name: 'Hayward', focus: 'SUPPORT_RING', region: 'east-bay', county: 'Alameda County', nearestYard: 'oakland', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'fremont', name: 'Fremont', focus: 'SUPPORT_RING', region: 'east-bay', county: 'Alameda County', nearestYard: 'sanjose', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'walnut-creek', name: 'Walnut Creek', focus: 'SUPPORT_RING', region: 'east-bay', county: 'Contra Costa County', nearestYard: 'oakland', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'concord', name: 'Concord', focus: 'SUPPORT_RING', region: 'east-bay', county: 'Contra Costa County', nearestYard: 'oakland', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'pleasanton', name: 'Pleasanton', focus: 'SUPPORT_RING', region: 'east-bay', county: 'Alameda County', nearestYard: 'oakland', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'dublin', name: 'Dublin', focus: 'SUPPORT_RING', region: 'east-bay', county: 'Alameda County', nearestYard: 'oakland', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'livermore', name: 'Livermore', focus: 'SUPPORT_RING', region: 'east-bay', county: 'Alameda County', nearestYard: 'oakland', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'santa-clara', name: 'Santa Clara', focus: 'SUPPORT_RING', region: 'south-bay', county: 'Santa Clara County', nearestYard: 'sanjose', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'sunnyvale', name: 'Sunnyvale', focus: 'SUPPORT_RING', region: 'south-bay', county: 'Santa Clara County', nearestYard: 'sanjose', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'mountain-view', name: 'Mountain View', focus: 'SUPPORT_RING', region: 'south-bay', county: 'Santa Clara County', nearestYard: 'sanjose', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'palo-alto', name: 'Palo Alto', focus: 'SUPPORT_RING', region: 'south-bay', county: 'Santa Clara County', nearestYard: 'sanjose', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'milpitas', name: 'Milpitas', focus: 'SUPPORT_RING', region: 'south-bay', county: 'Santa Clara County', nearestYard: 'sanjose', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'cupertino', name: 'Cupertino', focus: 'SUPPORT_RING', region: 'south-bay', county: 'Santa Clara County', nearestYard: 'sanjose', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'redwood-city', name: 'Redwood City', focus: 'SUPPORT_RING', region: 'south-bay', county: 'San Mateo County', nearestYard: 'sanjose', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'richmond', name: 'Richmond', focus: 'SUPPORT_RING', region: 'east-bay', county: 'Contra Costa County', nearestYard: 'oakland', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
  { slug: 'emeryville', name: 'Emeryville', focus: 'SUPPORT_RING', region: 'east-bay', county: 'Alameda County', nearestYard: 'oakland', sitemapPriority: 0.85, sitemapChangefreq: 'weekly', indexable: true, pageStatus: 'ACTIVE' },
];

// ============================================================
// OUTSIDE CURRENT FOCUS — Paused/deprioritized, redirect to regional
// ============================================================
const OUTSIDE_FOCUS_MARKETS: MarketClassification[] = [
  { slug: 'hollister', name: 'Hollister', focus: 'OUTSIDE_CURRENT_FOCUS', region: 'south-bay', county: 'San Benito County', nearestYard: 'sanjose', sitemapPriority: 0.4, sitemapChangefreq: 'monthly', indexable: false, pageStatus: 'REDIRECT', redirectTarget: '/dumpster-rental-south-bay', retirementReason: 'Outside 100-mile core radius, low search volume' },
  { slug: 'vallejo', name: 'Vallejo', focus: 'OUTSIDE_CURRENT_FOCUS', region: 'north-bay', county: 'Solano County', nearestYard: 'oakland', sitemapPriority: 0.4, sitemapChangefreq: 'monthly', indexable: false, pageStatus: 'NOINDEX', retirementReason: 'North Bay partner market, not yet active' },
];

// ============================================================
// FUTURE PARTNER — Not yet launched, archived from public SEO
// ============================================================
const FUTURE_PARTNER_MARKETS: MarketClassification[] = [
  { slug: 'modesto', name: 'Modesto', focus: 'FUTURE_PARTNER', region: 'central-valley', county: 'Stanislaus County', nearestYard: 'sanjose', sitemapPriority: 0.3, sitemapChangefreq: 'monthly', indexable: false, pageStatus: 'REDIRECT', redirectTarget: '/bay-area-dumpster-rental', retirementReason: 'Outside Bay Area — redirected' },
  { slug: 'stockton', name: 'Stockton', focus: 'FUTURE_PARTNER', region: 'central-valley', county: 'San Joaquin County', nearestYard: 'oakland', sitemapPriority: 0.3, sitemapChangefreq: 'monthly', indexable: false, pageStatus: 'REDIRECT', redirectTarget: '/bay-area-dumpster-rental', retirementReason: 'Outside Bay Area — redirected' },
  { slug: 'sacramento', name: 'Sacramento', focus: 'FUTURE_PARTNER', region: 'central-valley', county: 'Sacramento County', nearestYard: 'oakland', sitemapPriority: 0.3, sitemapChangefreq: 'monthly', indexable: false, pageStatus: 'REDIRECT', redirectTarget: '/bay-area-dumpster-rental', retirementReason: 'Outside Bay Area — redirected' },
  { slug: 'santa-rosa', name: 'Santa Rosa', focus: 'FUTURE_PARTNER', region: 'north-bay', county: 'Sonoma County', nearestYard: 'oakland', sitemapPriority: 0.3, sitemapChangefreq: 'monthly', indexable: false, pageStatus: 'NOINDEX', retirementReason: 'North Bay future partner — noindex until launch' },
  { slug: 'bakersfield', name: 'Bakersfield', focus: 'FUTURE_PARTNER', region: 'central-valley', county: 'Kern County', nearestYard: 'sanjose', sitemapPriority: 0.3, sitemapChangefreq: 'monthly', indexable: false, pageStatus: 'REDIRECT', redirectTarget: '/bay-area-dumpster-rental', retirementReason: 'Outside Bay Area — redirected' },
  { slug: 'fresno', name: 'Fresno', focus: 'FUTURE_PARTNER', region: 'central-valley', county: 'Fresno County', nearestYard: 'sanjose', sitemapPriority: 0.3, sitemapChangefreq: 'monthly', indexable: false, pageStatus: 'REDIRECT', redirectTarget: '/bay-area-dumpster-rental', retirementReason: 'Outside Bay Area — redirected' },
  { slug: 'los-angeles', name: 'Los Angeles', focus: 'FUTURE_PARTNER', region: 'southern-california', county: 'Los Angeles County', nearestYard: 'sanjose', sitemapPriority: 0.3, sitemapChangefreq: 'monthly', indexable: false, pageStatus: 'REDIRECT', redirectTarget: '/bay-area-dumpster-rental', retirementReason: 'Outside Bay Area — redirected' },
  { slug: 'san-diego', name: 'San Diego', focus: 'FUTURE_PARTNER', region: 'southern-california', county: 'San Diego County', nearestYard: 'sanjose', sitemapPriority: 0.3, sitemapChangefreq: 'monthly', indexable: false, pageStatus: 'REDIRECT', redirectTarget: '/bay-area-dumpster-rental', retirementReason: 'Outside Bay Area — redirected' },
  { slug: 'riverside', name: 'Riverside', focus: 'FUTURE_PARTNER', region: 'southern-california', county: 'Riverside County', nearestYard: 'sanjose', sitemapPriority: 0.3, sitemapChangefreq: 'monthly', indexable: false, pageStatus: 'REDIRECT', redirectTarget: '/bay-area-dumpster-rental', retirementReason: 'Outside Bay Area — redirected' },
  { slug: 'anaheim', name: 'Anaheim', focus: 'FUTURE_PARTNER', region: 'southern-california', county: 'Orange County', nearestYard: 'sanjose', sitemapPriority: 0.3, sitemapChangefreq: 'monthly', indexable: false, pageStatus: 'REDIRECT', redirectTarget: '/bay-area-dumpster-rental', retirementReason: 'Outside Bay Area — redirected' },
];

// ============================================================
// COMBINED REGISTRY
// ============================================================
export const MARKET_REGISTRY: MarketClassification[] = [
  ...CORE_DIRECT_MARKETS,
  ...SUPPORT_RING_MARKETS,
  ...OUTSIDE_FOCUS_MARKETS,
  ...FUTURE_PARTNER_MARKETS,
];

// ============================================================
// HELPERS
// ============================================================

export function getMarketClassification(slug: string): MarketClassification | undefined {
  return MARKET_REGISTRY.find(m => m.slug === slug);
}

export function getActiveMarkets(): MarketClassification[] {
  return MARKET_REGISTRY.filter(m => m.pageStatus === 'ACTIVE');
}

export function getCoreDirectMarkets(): MarketClassification[] {
  return MARKET_REGISTRY.filter(m => m.focus === 'CORE_DIRECT');
}

export function getSupportRingMarkets(): MarketClassification[] {
  return MARKET_REGISTRY.filter(m => m.focus === 'SUPPORT_RING');
}

export function getPausedMarkets(): MarketClassification[] {
  return MARKET_REGISTRY.filter(m => m.pageStatus !== 'ACTIVE');
}

export function getFuturePartnerMarkets(): MarketClassification[] {
  return MARKET_REGISTRY.filter(m => m.focus === 'FUTURE_PARTNER');
}

export function isMarketIndexable(slug: string): boolean {
  const m = getMarketClassification(slug);
  return m?.indexable ?? false;
}

export function getMarketRedirectTarget(slug: string): string | undefined {
  const m = getMarketClassification(slug);
  return m?.redirectTarget;
}

/** Returns all markets that should appear in the sitemap */
export function getSitemapMarkets(): MarketClassification[] {
  return MARKET_REGISTRY.filter(m => m.indexable && m.pageStatus === 'ACTIVE');
}

// ============================================================
// OUTSIDE-AREA RETIREMENT PLAN
// ============================================================
export interface RetirementPlanEntry {
  route: string;
  pageType: string;
  market: string;
  currentValue: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  action: 'KEEP' | 'REDIRECT_TO_REGIONAL' | 'REMOVE_FROM_SITEMAP' | 'NOINDEX_TEMPORARY' | 'ARCHIVE';
  redirectTarget?: string;
  reason: string;
}

export const OUTSIDE_AREA_RETIREMENT_PLAN: RetirementPlanEntry[] = [
  // Out-of-area hub pages redirected to Bay Area hub
  { route: '/southern-california-dumpster-rental', pageType: 'regional_hub', market: 'southern-california', currentValue: 'LOW', action: 'REDIRECT_TO_REGIONAL', redirectTarget: '/bay-area-dumpster-rental', reason: 'Outside Bay Area focus — redirected' },
  { route: '/central-valley-dumpster-rental', pageType: 'regional_hub', market: 'central-valley', currentValue: 'LOW', action: 'REDIRECT_TO_REGIONAL', redirectTarget: '/bay-area-dumpster-rental', reason: 'Outside Bay Area focus — redirected' },
  // Outside-area city pages
  { route: '/dumpster-rental/hollister', pageType: 'city', market: 'hollister', currentValue: 'LOW', action: 'REDIRECT_TO_REGIONAL', redirectTarget: '/dumpster-rental-south-bay', reason: 'Minimal traffic, outside core radius' },
  { route: '/dumpster-rental/modesto', pageType: 'city', market: 'modesto', currentValue: 'LOW', action: 'REDIRECT_TO_REGIONAL', redirectTarget: '/bay-area-dumpster-rental', reason: 'Outside Bay Area — redirected' },
  { route: '/dumpster-rental/stockton', pageType: 'city', market: 'stockton', currentValue: 'LOW', action: 'REDIRECT_TO_REGIONAL', redirectTarget: '/bay-area-dumpster-rental', reason: 'Outside Bay Area — redirected' },
  { route: '/dumpster-rental/sacramento', pageType: 'city', market: 'sacramento', currentValue: 'MEDIUM', action: 'REDIRECT_TO_REGIONAL', redirectTarget: '/bay-area-dumpster-rental', reason: 'Outside Bay Area — redirected' },
  { route: '/dumpster-rental/santa-rosa', pageType: 'city', market: 'santa-rosa', currentValue: 'LOW', action: 'NOINDEX_TEMPORARY', reason: 'North Bay partner market — not yet active' },
  { route: '/dumpster-rental/bakersfield', pageType: 'city', market: 'bakersfield', currentValue: 'LOW', action: 'REDIRECT_TO_REGIONAL', redirectTarget: '/bay-area-dumpster-rental', reason: 'Outside Bay Area — redirected' },
  { route: '/dumpster-rental/fresno', pageType: 'city', market: 'fresno', currentValue: 'LOW', action: 'REDIRECT_TO_REGIONAL', redirectTarget: '/bay-area-dumpster-rental', reason: 'Outside Bay Area — redirected' },
  { route: '/dumpster-rental/los-angeles', pageType: 'city', market: 'los-angeles', currentValue: 'MEDIUM', action: 'REDIRECT_TO_REGIONAL', redirectTarget: '/bay-area-dumpster-rental', reason: 'Outside Bay Area — redirected' },
  { route: '/dumpster-rental/san-diego', pageType: 'city', market: 'san-diego', currentValue: 'MEDIUM', action: 'REDIRECT_TO_REGIONAL', redirectTarget: '/bay-area-dumpster-rental', reason: 'Outside Bay Area — redirected' },
  { route: '/dumpster-rental/riverside', pageType: 'city', market: 'riverside', currentValue: 'LOW', action: 'REDIRECT_TO_REGIONAL', redirectTarget: '/bay-area-dumpster-rental', reason: 'Outside Bay Area — redirected' },
  { route: '/dumpster-rental/anaheim', pageType: 'city', market: 'anaheim', currentValue: 'LOW', action: 'REDIRECT_TO_REGIONAL', redirectTarget: '/bay-area-dumpster-rental', reason: 'Outside Bay Area — redirected' },
  { route: '/dumpster-rental/vallejo', pageType: 'city', market: 'vallejo', currentValue: 'LOW', action: 'NOINDEX_TEMPORARY', reason: 'North Bay partner — not yet active' },
];
