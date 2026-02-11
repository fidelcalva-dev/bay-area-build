// Dynamic Sitemap Generator
// Generates sitemap.xml content for all public routes + SEO engine pages

import { DUMPSTER_SIZES_DATA } from './shared-data';
import { BUSINESS_INFO } from './seo';
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
  { url: '/green-halo', changefreq: 'monthly', priority: 0.6 },
  { url: '/green-impact', changefreq: 'monthly', priority: 0.5 },
  { url: '/locations', changefreq: 'monthly', priority: 0.7 },
  { url: '/why-local-yards', changefreq: 'monthly', priority: 0.7 },
  { url: '/not-a-broker', changefreq: 'monthly', priority: 0.7 },
  { url: '/how-it-works', changefreq: 'monthly', priority: 0.7 },
  { url: '/waste-vision', changefreq: 'monthly', priority: 0.5 },
  { url: '/terms', changefreq: 'yearly', priority: 0.3 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
];

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

// Fetch SEO engine pages from database
async function fetchSeoPages(): Promise<SitemapEntry[]> {
  try {
    const { data } = await supabase
      .from('seo_pages')
      .select('url_path, page_type, last_generated_at')
      .eq('is_published', true);

    if (!data) return [];

    return data.map(page => {
      // City mother pages get higher priority
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

function renderEntries(entries: SitemapEntry[]): string {
  return entries.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod || TODAY}</lastmod>
    <changefreq>${page.changefreq || 'monthly'}</changefreq>
    <priority>${page.priority || 0.5}</priority>
  </url>`).join('\n');
}

export function generateSitemapXml(seoPages: SitemapEntry[] = []): string {
  const allPages = [...STATIC_PAGES, ...SIZE_PAGES, ...MATERIAL_PAGES, ...seoPages];

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
  const seoPages = await fetchSeoPages();
  return generateSitemapXml(seoPages);
}

// Get all entries for programmatic use
export function getAllSitemapEntries(): SitemapEntry[] {
  return [...STATIC_PAGES, ...SIZE_PAGES, ...MATERIAL_PAGES];
}

// Get all entries including async SEO pages
export async function getAllSitemapEntriesWithSeo(): Promise<SitemapEntry[]> {
  const seoPages = await fetchSeoPages();
  return [...STATIC_PAGES, ...SIZE_PAGES, ...MATERIAL_PAGES, ...seoPages];
}
