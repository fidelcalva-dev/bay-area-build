/**
 * Vite plugin — generates static sitemap.xml during production builds.
 * Ensures Googlebot gets a server-accessible XML file without JS execution.
 */
import type { Plugin } from 'vite';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

export function sitemapPlugin(): Plugin {
  return {
    name: 'generate-static-sitemap',
    apply: 'build',
    async buildStart() {
      try {
        // Dynamic import to handle TS module resolution
        const { generateSitemapXml } = await import('../src/lib/sitemap');
        const xml = generateSitemapXml();
        const dest = resolve(process.cwd(), 'public/sitemap.xml');
        writeFileSync(dest, xml, 'utf-8');
        const count = (xml.match(/<url>/g) || []).length;
        console.log(`[sitemap] ✅ Generated ${count} URLs → public/sitemap.xml`);
      } catch (err) {
        console.warn('[sitemap] ⚠️ Failed to generate sitemap:', err);
      }
    },
  };
}
