// Dynamic Sitemap Generator — builds sitemap from DB + static data
// Generates XML sitemap with all active SEO pages

import { BUSINESS_INFO } from './seo';
import { SEO_MATERIALS } from './seo-engine';
import { SEO_JOB_TYPES } from './seo-jobs';
import { SEO_ZIP_DATA } from './seo-zips';
import { DUMPSTER_SIZES_DATA } from './shared-data';

export interface SitemapEntry {
  url: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  lastmod?: string;
}

// Static pages that always appear
const STATIC_PAGES: SitemapEntry[] = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/quote', changefreq: 'weekly', priority: 0.9 },
  { url: '/sizes', changefreq: 'monthly', priority: 0.9 },
  { url: '/materials', changefreq: 'monthly', priority: 0.8 },
  { url: '/areas', changefreq: 'monthly', priority: 0.8 },
  { url: '/contractors', changefreq: 'monthly', priority: 0.8 },
  { url: '/pricing', changefreq: 'weekly', priority: 0.9 },
  { url: '/about', changefreq: 'monthly', priority: 0.6 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/locations', changefreq: 'monthly', priority: 0.7 },
  { url: '/quote/contractor', changefreq: 'monthly', priority: 0.7 },
  { url: '/careers', changefreq: 'monthly', priority: 0.5 },
  { url: '/why-local-yards', changefreq: 'monthly', priority: 0.7 },
  { url: '/not-a-broker', changefreq: 'monthly', priority: 0.7 },
  { url: '/how-it-works', changefreq: 'monthly', priority: 0.7 },
  { url: '/green-halo', changefreq: 'monthly', priority: 0.6 },
  { url: '/capacity-guide', changefreq: 'monthly', priority: 0.6 },
  { url: '/blog', changefreq: 'weekly', priority: 0.7 },
  { url: '/terms', changefreq: 'yearly', priority: 0.3 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
];

// Blog articles (static for now)
const BLOG_ARTICLES: SitemapEntry[] = [
  { url: '/blog/dumpster-cost-oakland', changefreq: 'monthly', priority: 0.7 },
  { url: '/blog/concrete-disposal-bay-area', changefreq: 'monthly', priority: 0.7 },
  { url: '/blog/dumpster-permit-san-jose', changefreq: 'monthly', priority: 0.7 },
  { url: '/blog/heavy-material-dumpsters-explained', changefreq: 'monthly', priority: 0.7 },
  { url: '/blog/dumpster-sizes-guide', changefreq: 'monthly', priority: 0.7 },
  { url: '/blog/same-day-dumpster-delivery-bay-area', changefreq: 'monthly', priority: 0.7 },
];

export interface CityForSitemap {
  city_slug: string;
  is_primary_market: boolean;
  common_sizes_json: number[];
}

/**
 * Generate all sitemap entries for active cities
 */
export function generateSitemapEntries(cities: CityForSitemap[]): SitemapEntry[] {
  const entries: SitemapEntry[] = [...STATIC_PAGES, ...BLOG_ARTICLES];
  const today = new Date().toISOString().split('T')[0];

  for (const city of cities) {
    const isPrimary = city.is_primary_market;

    // City page
    entries.push({
      url: `/dumpster-rental/${city.city_slug}`,
      changefreq: 'weekly',
      priority: isPrimary ? 0.95 : 0.85,
      lastmod: today,
    });

    // City + Size pages
    const sizes = city.common_sizes_json?.length ? city.common_sizes_json : [10, 20, 30, 40];
    for (const sz of sizes) {
      entries.push({
        url: `/dumpster-rental/${city.city_slug}/${sz}-yard`,
        changefreq: 'monthly',
        priority: isPrimary ? 0.85 : 0.75,
        lastmod: today,
      });
    }

    // City + Material pages
    for (const m of SEO_MATERIALS) {
      entries.push({
        url: `/dumpster-rental/${city.city_slug}/${m.slug}`,
        changefreq: 'monthly',
        priority: isPrimary ? 0.85 : 0.75,
        lastmod: today,
      });
    }

    // City + Job pages
    for (const j of SEO_JOB_TYPES) {
      entries.push({
        url: `/dumpster-rental/${city.city_slug}/${j.slug}`,
        changefreq: 'monthly',
        priority: isPrimary ? 0.8 : 0.7,
        lastmod: today,
      });
    }
  }

  // ZIP pages
  for (const z of SEO_ZIP_DATA) {
    entries.push({
      url: `/service-area/${z.zip}/dumpster-rental`,
      changefreq: 'monthly',
      priority: z.tier === 'A' ? 0.8 : 0.7,
      lastmod: today,
    });
  }

  return entries;
}

/**
 * Render sitemap entries to XML string
 */
export function renderSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map(e => {
    const lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : '';
    return `  <url>
    <loc>${BUSINESS_INFO.url}${e.url}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>${lastmod}
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}
