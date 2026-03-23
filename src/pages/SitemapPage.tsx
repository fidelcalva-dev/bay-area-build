import { useEffect, useState } from 'react';
import { generateFullSitemapXml } from '@/lib/sitemap';
import { SEO_ZIP_DATA } from '@/lib/seo-zips';
import { SEO_JOB_TYPES } from '@/lib/seo-jobs';
import { SEO_MATERIALS } from '@/lib/seo-engine';
import { SEO_COUNTIES } from '@/lib/seo-counties';
import { SEO_USE_CASES } from '@/lib/seo-use-cases';
import { BUSINESS_INFO } from '@/lib/seo';
import { supabase } from '@/integrations/supabase/client';

/**
 * Dynamic Sitemap Page
 * Renders raw XML sitemap content including all SEO engine pages.
 * Access at /sitemap.xml
 */
export default function SitemapPage() {
  const [xml, setXml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generate() {
      try {
        // Get base sitemap from existing generator
        let baseXml = await generateFullSitemapXml();
        
        // Parse existing URLs to avoid duplicates
        const existingUrls = new Set<string>();
        const locRegex = /<loc>([^<]+)<\/loc>/g;
        let match;
        while ((match = locRegex.exec(baseXml)) !== null) {
          existingUrls.add(match[1]);
        }

        // Generate additional entries for ZIP pages
        const additionalEntries: string[] = [];
        const today = new Date().toISOString().split('T')[0];
        
        for (const z of SEO_ZIP_DATA) {
          const url = `${BUSINESS_INFO.url}/service-area/${z.zip}/dumpster-rental`;
          if (!existingUrls.has(url)) {
            additionalEntries.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${z.tier === 'A' ? '0.8' : '0.7'}</priority>
  </url>`);
          }
        }

        // Generate entries for city+job and city+material pages from DB cities
        try {
          const { data: cities } = await supabase.from('seo_cities').select('city_slug, common_sizes_json').eq('is_active', true);
          if (cities) {
            for (const city of cities) {
              // Job pages
              for (const j of SEO_JOB_TYPES) {
                const url = `${BUSINESS_INFO.url}/dumpster-rental/${city.city_slug}/${j.slug}`;
                if (!existingUrls.has(url)) {
                  additionalEntries.push(`  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.75</priority>\n  </url>`);
                }
              }
              // Material pages
              for (const m of SEO_MATERIALS) {
                const url = `${BUSINESS_INFO.url}/dumpster-rental/${city.city_slug}/${m.slug}`;
                if (!existingUrls.has(url)) {
                  additionalEntries.push(`  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
                }
              }
            }
          }
        } catch { /* silent */ }

        // County pages — Bay Area only
        const bayAreaCountySlugs = new Set([
          'alameda-county', 'santa-clara-county', 'contra-costa-county',
          'san-francisco-county', 'san-mateo-county', 'solano-county',
          'marin-county', 'sonoma-county', 'napa-county',
        ]);
        for (const county of SEO_COUNTIES.filter(c => bayAreaCountySlugs.has(c.slug))) {
          const url = `${BUSINESS_INFO.url}/county/${county.slug}/dumpster-rental`;
          if (!existingUrls.has(url)) {
            additionalEntries.push(`  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
          }
        }

        // Use case pages
        for (const uc of SEO_USE_CASES) {
          const url = `${BUSINESS_INFO.url}/use-cases/${uc.slug}`;
          if (!existingUrls.has(url)) {
            additionalEntries.push(`  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
          }
        }
        
        // Inject additional entries before closing </urlset>
        if (additionalEntries.length > 0) {
          baseXml = baseXml.replace('</urlset>', additionalEntries.join('\n') + '\n</urlset>');
        }
        
        setXml(baseXml);
      } catch (err) {
        console.error('Sitemap generation error:', err);
        setXml('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      } finally {
        setLoading(false);
      }
    }
    generate();
  }, []);

  // Render as plain text (browsers will display XML)
  if (loading) return <div style={{ fontFamily: 'monospace', padding: 20 }}>Generating sitemap...</div>;

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', padding: 20, background: '#f9f9f9' }}>
      {xml}
    </div>
  );
}
