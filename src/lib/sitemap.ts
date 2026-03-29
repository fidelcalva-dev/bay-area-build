// Dynamic Sitemap Generator
// Generates sitemap.xml content for all public routes + SEO engine pages

import { DUMPSTER_SIZES_DATA } from './shared-data';
import { BUSINESS_INFO } from './seo';
import { SERVICE_CITIES } from './cityData';
import { SEO_COUNTIES } from './seo-counties';
import { SEO_USE_CASES } from './seo-use-cases';
import { SEO_BLOG_TOPICS } from './seo-blog-topics';
import { YARD_HUBS } from './yard-hub-data';
import { GRID_SERVICE_TYPES, GRID_SIZES, getAllGridCities } from './seo-grid';
import { SEO_ZIP_DATA } from './seo-zips';
import { supabase } from '@/integrations/supabase/client';

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const BASE_URL = BUSINESS_INFO.url;
const TODAY = new Date().toISOString().split('T')[0];

// Static public pages
const STATIC_PAGES: SitemapEntry[] = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/pricing', changefreq: 'weekly', priority: 0.9 },
  { url: '/sizes', changefreq: 'monthly', priority: 0.9 },
  { url: '/areas', changefreq: 'monthly', priority: 0.8 },
  { url: '/materials', changefreq: 'monthly', priority: 0.8 },
  { url: '/capacity-guide', changefreq: 'monthly', priority: 0.7 },
  { url: '/contractors', changefreq: 'monthly', priority: 0.8 },
  { url: '/contractor-best-practices', changefreq: 'monthly', priority: 0.6 },
  { url: '/contractor-resources', changefreq: 'monthly', priority: 0.7 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/blog', changefreq: 'weekly', priority: 0.7 },
  { url: '/careers', changefreq: 'monthly', priority: 0.5 },
  { url: '/quote', changefreq: 'monthly', priority: 0.9 },
  { url: '/quote/contractor', changefreq: 'monthly', priority: 0.8 },
  // Utility/demo pages excluded from sitemap: green-halo, green-impact, waste-vision, visualizer, technology
  // /locations excluded — redirects to /areas
  { url: '/why-local-yards', changefreq: 'monthly', priority: 0.7 },
  { url: '/not-a-broker', changefreq: 'monthly', priority: 0.7 },
  { url: '/how-it-works', changefreq: 'monthly', priority: 0.7 },
  { url: '/why-calsan', changefreq: 'monthly', priority: 0.7 },
  { url: '/terms', changefreq: 'yearly', priority: 0.3 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
  // Hub pages — only active regions in sitemap
  { url: '/california-dumpster-rental', changefreq: 'monthly', priority: 0.7 },
  { url: '/bay-area-dumpster-rental', changefreq: 'weekly', priority: 0.9 },
  { url: '/north-bay-dumpster-rental', changefreq: 'monthly', priority: 0.7 },
  // Southern CA & Central Valley hubs paused — noindex until partner launch
  // Regional pages
  { url: '/dumpster-rental-east-bay', changefreq: 'weekly', priority: 0.9 },
  { url: '/dumpster-rental-south-bay', changefreq: 'weekly', priority: 0.9 },
  // Flagship city pages
  { url: '/dumpster-rental-oakland-ca', changefreq: 'weekly', priority: 0.95 },
  { url: '/dumpster-rental-san-jose-ca', changefreq: 'weekly', priority: 0.95 },
  { url: '/dumpster-rental-san-francisco-ca', changefreq: 'weekly', priority: 0.95 },
  // Commercial pages
  { url: '/commercial-dumpster-rental', changefreq: 'monthly', priority: 0.8 },
  { url: '/construction-dumpsters', changefreq: 'monthly', priority: 0.8 },
  { url: '/warehouse-cleanout-dumpsters', changefreq: 'monthly', priority: 0.7 },
];

// Blog articles — dynamically generated from SEO_BLOG_TOPICS
const BLOG_PAGES: SitemapEntry[] = SEO_BLOG_TOPICS.map(topic => ({
  url: `/blog/${topic.slug}`,
  changefreq: 'monthly' as const,
  priority: 0.7,
}));

// Size-specific pages
const SIZE_PAGES: SitemapEntry[] = DUMPSTER_SIZES_DATA.map(size => ({
  url: `/${size.yards}-yard-dumpster`,
  changefreq: 'monthly' as const,
  priority: 0.8,
}));

// Material-specific pages  
const MATERIAL_PAGES: SitemapEntry[] = [
  { url: '/concrete-dumpster-rental', changefreq: 'monthly', priority: 0.8 },
  { url: '/dirt-dumpster-rental', changefreq: 'monthly', priority: 0.8 },
  { url: '/construction-debris-dumpster', changefreq: 'monthly', priority: 0.8 },
  { url: '/green-waste-dumpster', changefreq: 'monthly', priority: 0.7 },
  { url: '/roofing-dumpster-rental', changefreq: 'monthly', priority: 0.7 },
];

// Yard hub pages
const YARD_PAGES: SitemapEntry[] = YARD_HUBS.map(yard => ({
  url: `/yards/${yard.slug}`,
  changefreq: 'weekly' as const,
  priority: 0.9,
}));

// Grid service-type city pages (concrete-disposal/oakland, etc.)
const GRID_SERVICE_PAGES: SitemapEntry[] = (() => {
  const pages: SitemapEntry[] = [];
  const gridCities = getAllGridCities();
  for (const city of gridCities) {
    for (const svc of GRID_SERVICE_TYPES) {
      if (svc.slug === 'dumpster-rental') continue; // already in CITY_PAGES
      pages.push({
        url: `${svc.routePrefix}/${city.slug}`,
        changefreq: 'weekly',
        priority: 0.75,
      });
    }
    // Size pages for grid cities
    for (const size of GRID_SIZES) {
      pages.push({
        url: `/dumpster-rental/${city.slug}/${size}-yard`,
        changefreq: 'weekly',
        priority: 0.8,
      });
    }
  }
  return pages;
})();

// City pages — use market classification to control sitemap inclusion
import { CITY_DIRECTORY } from './service-area-config';
import { getMarketClassification, isMarketIndexable } from './market-classification';

const CITY_PAGES: SitemapEntry[] = SERVICE_CITIES
  .map(city => {
    const canonical = city.slug.endsWith('-ca') ? city.slug.slice(0, -3) : city.slug;
    const market = getMarketClassification(canonical);
    // Skip non-indexable markets (paused, noindex, future partner)
    if (market && !market.indexable) return null;
    const priority = market?.sitemapPriority ?? 0.6;
    const cf: SitemapEntry['changefreq'] = market?.sitemapChangefreq ?? 'monthly';
    return {
      url: `/dumpster-rental/${canonical}`,
      changefreq: cf,
      priority,
    } as SitemapEntry;
  })
  .filter((entry): entry is SitemapEntry => entry !== null);

// County pages — Bay Area only
const BAY_AREA_COUNTY_SLUGS = new Set([
  'alameda-county', 'santa-clara-county', 'contra-costa-county',
  'san-francisco-county', 'san-mateo-county', 'solano-county',
  'marin-county', 'sonoma-county', 'napa-county',
]);
const COUNTY_PAGES: SitemapEntry[] = SEO_COUNTIES
  .filter(county => BAY_AREA_COUNTY_SLUGS.has(county.slug))
  .map(county => ({
  url: `/county/${county.slug}/dumpster-rental`,
  changefreq: 'monthly' as const,
  priority: 0.8,
}));

// Use case pages
const USE_CASE_PAGES: SitemapEntry[] = SEO_USE_CASES.map(uc => ({
  url: `/use-cases/${uc.slug}`,
  changefreq: 'monthly' as const,
  priority: 0.8,
}));

// Cleanup division pages
const CLEANUP_SITEMAP_PAGES: SitemapEntry[] = [
  { url: '/cleanup', changefreq: 'weekly', priority: 0.8 },
  { url: '/cleanup/services', changefreq: 'monthly', priority: 0.7 },
  { url: '/cleanup/construction-cleanup', changefreq: 'monthly', priority: 0.75 },
  { url: '/cleanup/post-construction-cleanup', changefreq: 'monthly', priority: 0.75 },
  { url: '/cleanup/demolition-debris-cleanup', changefreq: 'monthly', priority: 0.75 },
  { url: '/cleanup/recurring-jobsite-cleanup', changefreq: 'monthly', priority: 0.75 },
  { url: '/cleanup/for-contractors', changefreq: 'monthly', priority: 0.7 },
  { url: '/cleanup/pricing', changefreq: 'monthly', priority: 0.7 },
  { url: '/cleanup/about', changefreq: 'monthly', priority: 0.5 },
  { url: '/cleanup/faqs', changefreq: 'monthly', priority: 0.5 },
  { url: '/cleanup/contact', changefreq: 'monthly', priority: 0.6 },
  { url: '/cleanup/quote', changefreq: 'monthly', priority: 0.7 },
  { url: '/cleanup/before-after', changefreq: 'monthly', priority: 0.5 },
  { url: '/cleanup/service-areas', changefreq: 'monthly', priority: 0.6 },
  { url: '/cleanup/oakland', changefreq: 'monthly', priority: 0.75 },
  { url: '/cleanup/alameda', changefreq: 'monthly', priority: 0.7 },
  { url: '/cleanup/bay-area', changefreq: 'monthly', priority: 0.7 },
];

// ZIP pages (300+ targeted ZIP codes)
const ZIP_PAGES: SitemapEntry[] = SEO_ZIP_DATA.map(z => ({
  url: `/service-area/${z.zip}/dumpster-rental`,
  changefreq: 'monthly' as const,
  priority: z.tier === 'A' ? 0.8 : z.tier === 'B' ? 0.7 : 0.6,
}));

// Fetch SEO engine pages from database
async function fetchSeoPages(): Promise<SitemapEntry[]> {
  try {
    const { data } = await supabase
      .from('seo_pages')
      .select('url_path, page_type, last_generated_at')
      .eq('is_published', true);

    if (!data) return [];

    return data.map(page => {
      const priority = page.page_type === 'CITY' ? 0.9 : 0.8;
      return {
        url: page.url_path,
        lastmod: page.last_generated_at?.split('T')[0] || TODAY,
        changefreq: 'weekly' as const,
        priority,
      };
    });
  } catch {
    return [];
  }
}

// Fetch location registry cities for sitemap
async function fetchRegistryLocations(): Promise<SitemapEntry[]> {
  try {
    const { data } = await supabase
      .from('seo_locations_registry')
      .select('slug, page_exists')
      .eq('is_active', true);

    if (!data) return [];

    // Standalone pages are already in STATIC_PAGES; only add /dumpster-rental/{slug} entries
    const standalonePages = new Set(['oakland-ca', 'san-jose-ca', 'san-francisco-ca']);
    return data
      .filter(loc => !standalonePages.has(loc.slug))
      .map(loc => ({
        url: `/dumpster-rental/${loc.slug}`,
        changefreq: 'weekly' as const,
        priority: 0.8,
      }));
  } catch {
    return [];
  }
}

function renderEntries(entries: SitemapEntry[]): string {
  return entries.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod || TODAY}</lastmod>
    <changefreq>${page.changefreq || 'monthly'}</changefreq>
    <priority>${page.priority || 0.5}</priority>
  </url>`).join('\n');
}

export function generateSitemapXml(seoPages: SitemapEntry[] = []): string {
  const allPages = [...STATIC_PAGES, ...BLOG_PAGES, ...SIZE_PAGES, ...MATERIAL_PAGES, ...CITY_PAGES, ...COUNTY_PAGES, ...USE_CASE_PAGES, ...ZIP_PAGES, ...YARD_PAGES, ...GRID_SERVICE_PAGES, ...seoPages];

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allPages.filter(p => {
    if (seen.has(p.url)) return false;
    seen.add(p.url);
    return true;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${renderEntries(unique)}
</urlset>`;
}

// Async version that fetches SEO pages from DB
export async function generateFullSitemapXml(): Promise<string> {
  const [seoPages, registryLocations] = await Promise.all([
    fetchSeoPages(),
    fetchRegistryLocations(),
  ]);
  return generateSitemapXml([...seoPages, ...registryLocations]);
}

// Get all entries for programmatic use
export function getAllSitemapEntries(): SitemapEntry[] {
  return [...STATIC_PAGES, ...BLOG_PAGES, ...SIZE_PAGES, ...MATERIAL_PAGES, ...CITY_PAGES, ...ZIP_PAGES, ...YARD_PAGES, ...GRID_SERVICE_PAGES];
}

// Get all entries including async SEO pages
export async function getAllSitemapEntriesWithSeo(): Promise<SitemapEntry[]> {
  const seoPages = await fetchSeoPages();
  return [...STATIC_PAGES, ...BLOG_PAGES, ...SIZE_PAGES, ...MATERIAL_PAGES, ...CITY_PAGES, ...ZIP_PAGES, ...seoPages];
}
