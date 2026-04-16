/**
 * Build-time sitemap generator
 * Generates a static public/sitemap.xml from the sync sitemap generator.
 * Run: npx tsx scripts/generate-sitemap.ts
 * Also invoked automatically by the Vite sitemap plugin during production builds.
 */

import { generateSitemapXml } from '../src/lib/sitemap';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const xml = generateSitemapXml();
const dest = resolve(__dirname, '../public/sitemap.xml');
writeFileSync(dest, xml, 'utf-8');

// Count URLs
const count = (xml.match(/<url>/g) || []).length;
console.log(`✅ sitemap.xml generated with ${count} URLs → public/sitemap.xml`);
