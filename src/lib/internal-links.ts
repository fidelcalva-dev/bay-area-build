// Internal Link Automation Engine
// Registry-driven linking with anchor rotation and deduplication

export type PageType = 'CITY_PAGE' | 'BLOG_PAGE' | 'SIZE_PAGE' | 'SERVICE_PAGE' | 'OTHER';

export function getPageType(url: string): PageType {
  if (url.includes('/dumpster-rental-') || url.includes('/dumpster-rental/')) return 'CITY_PAGE';
  if (url.includes('/blog/') || url.includes('/blog')) return 'BLOG_PAGE';
  if (url.includes('/sizes') || url.match(/\/\d+-yard-dumpster/)) return 'SIZE_PAGE';
  if (url.includes('/green-halo') || url.includes('/commercial') || url.includes('/concrete') || url.includes('/construction')) return 'SERVICE_PAGE';
  return 'OTHER';
}

// Deterministic but varied anchor selection based on city+page context
// Avoids randomness (bad for SSR/hydration) while still rotating anchors
export function pickAnchor(anchors: string[], citySlug: string, pageContext: string): string {
  if (!anchors.length) return citySlug;
  const hash = (citySlug + pageContext).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return anchors[hash % anchors.length];
}

// Get the URL for a city based on whether it has a standalone page or uses /dumpster-rental/{slug}
export function getCityUrl(slug: string, pageExists: boolean): string {
  // Flagship cities with standalone SEO pages
  const standalonePages: Record<string, string> = {
    'oakland-ca': '/dumpster-rental-oakland-ca',
    'san-jose-ca': '/dumpster-rental-san-jose-ca',
  };
  if (standalonePages[slug]) return standalonePages[slug];
  // All others use the dynamic city page route
  return `/dumpster-rental/${slug}`;
}

// Static service + blog links for cross-linking
export const SERVICE_CROSS_LINKS = [
  { url: '/quote', label: 'Get Instant Quote' },
  { url: '/sizes', label: 'Dumpster Sizes Guide' },
  { url: '/green-halo', label: 'Green Halo Program' },
  { url: '/concrete-dumpster-rental', label: 'Concrete Dumpsters' },
  { url: '/commercial-dumpster-rental', label: 'Commercial Dumpster Rental' },
  { url: '/contractors', label: 'Contractor Services' },
  { url: '/areas', label: 'All Service Areas' },
] as const;

export const BLOG_CROSS_LINKS = [
  { url: '/blog/dumpster-cost-oakland', label: 'Dumpster Cost in Oakland' },
  { url: '/blog/concrete-disposal-bay-area', label: 'Concrete Disposal Guide' },
  { url: '/blog/dumpster-permit-san-jose', label: 'San Jose Permit Guide' },
  { url: '/blog/heavy-material-dumpsters-explained', label: 'Heavy Material Dumpsters' },
  { url: '/blog/dumpster-sizes-guide', label: 'Dumpster Sizes Guide' },
  { url: '/blog/same-day-dumpster-delivery-bay-area', label: 'Same-Day Delivery' },
] as const;
