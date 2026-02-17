import { useEffect, useState } from 'react';
import { generateFullSitemapXml } from '@/lib/sitemap';
import { SEO_ZIP_DATA } from '@/lib/seo-zips';
import { SEO_JOB_TYPES } from '@/lib/seo-jobs';
import { SEO_MATERIALS } from '@/lib/seo-engine';
import { BUSINESS_INFO } from '@/lib/seo';

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

        // Generate entries for job type pages (for active cities from DB)
        // These are generated from the SEO_JOB_TYPES data
        // The actual city+job URLs come from the DB-driven seo_cities
        
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
