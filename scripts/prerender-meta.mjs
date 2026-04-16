/**
 * Post-build prerender script
 * Creates static HTML files with correct <title> and <meta description>
 * for priority public pages so Googlebot reads real meta tags without JS.
 *
 * Usage: node scripts/prerender-meta.mjs
 * Expects dist/index.html to exist (run after vite build).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const DIST = join(process.cwd(), 'dist');
const INDEX_HTML = join(DIST, 'index.html');

if (!existsSync(INDEX_HTML)) {
  console.error('[prerender] dist/index.html not found — run vite build first');
  process.exit(1);
}

const template = readFileSync(INDEX_HTML, 'utf-8');

// ── Route → meta mapping ──────────────────────────────────────
const PAGES = [
  {
    path: '/',
    title: 'Bay Area Dumpster Rental | Same-Day Delivery | Calsan Dumpsters Pro',
    description: 'Rent a dumpster in Oakland, San Jose & San Francisco. 5–50 yard sizes, transparent all-inclusive pricing, same-day delivery. Local yards, not a broker.',
  },
  {
    path: '/dumpster-rental-oakland-ca',
    title: 'Dumpster Rental Oakland CA | Same-Day Delivery | From $395 | Calsan',
    description: 'Local dumpster rental in Oakland, CA. 5-50 yard roll-off dumpsters from $395. Same-day delivery from our Oakland yard. Transparent pricing, no brokers. Get an instant quote.',
  },
  {
    path: '/dumpster-rental-san-jose-ca',
    title: 'Dumpster Rental San Jose CA | Same-Day Delivery | From $395 | Calsan',
    description: 'Local dumpster rental in San Jose, CA from $395. 5-50 yard roll-off dumpsters with same-day delivery from our San Jose yard. Transparent pricing, no brokers. Get an instant quote in 60 seconds.',
  },
  {
    path: '/dumpster-rental-san-francisco-ca',
    title: 'Dumpster Rental San Francisco CA | Same-Day | From $395 | Calsan',
    description: 'Local dumpster rental in San Francisco, CA from $395. 5-50 yard roll-off dumpsters for construction, renovation, and cleanouts. Same-day delivery, transparent pricing, no brokers. Hablamos Español.',
  },
  {
    path: '/quote',
    title: 'Get Instant Dumpster Quote | 60-Second Pricing',
    description: 'Get an instant dumpster rental quote in 60 seconds. Enter your ZIP for all-inclusive pricing. Same-day delivery available in the Bay Area.',
  },
  {
    path: '/blog',
    title: 'Dumpster Rental Tips & Guides | Bay Area Resources',
    description: 'Expert dumpster rental tips, sizing guides, permit info, and waste disposal best practices for Bay Area residents and contractors.',
  },
  {
    path: '/sizes',
    title: 'Dumpster Sizes: 5 to 50 Yard | Find the Right Size',
    description: 'Compare dumpster sizes from 5 to 50 yards with photos. See what fits, weight limits, and best-use projects. Bay Area delivery available.',
  },
  {
    path: '/pricing',
    title: 'Dumpster Rental Prices | Bay Area All-Inclusive Rates',
    description: 'Bay Area dumpster rental pricing from $399. Delivery, pickup & weight included. No hidden fees. 5–50 yard sizes for general debris and heavy materials.',
  },
  {
    path: '/about',
    title: 'About Calsan Dumpsters Pro | Bay Area Local Yard Operator',
    description: 'Locally owned dumpster rental company in Oakland, CA. Real yards, branded fleet, bilingual support. Serving 9 Bay Area counties with reliable service.',
  },
  {
    path: '/cleanup',
    title: 'Construction Cleanup & Debris Removal in Oakland & Alameda | Calsan C&D Waste Removal',
    description: 'Calsan C&D Waste Removal provides construction cleanup, post-construction cleanup, demolition debris cleanup, and recurring jobsite cleanup in Oakland, Alameda, and the Bay Area. CSLB #1152237.',
  },
  {
    path: '/cleanup/construction-cleanup',
    title: 'Construction Cleanup for Active Jobsites | Calsan C&D Waste Removal',
    description: 'Professional construction cleanup for active jobsites, remodels, ADUs, and trade-heavy phases in Oakland, Alameda, and the Bay Area. From $495. CSLB #1152237.',
  },
  {
    path: '/cleanup/post-construction-cleanup',
    title: 'Final & Post-Construction Cleanup | Calsan C&D Waste Removal',
    description: 'Post-construction and final cleanup for turnover-ready projects in Oakland, Alameda, and the Bay Area. $0.35–$0.65/sqft, $695 minimum. CSLB #1152237.',
  },
  {
    path: '/cleanup/demolition-debris-cleanup',
    title: 'Construction & Demolition Debris Cleanup | Calsan C&D Waste Removal',
    description: 'C&D debris cleanup for demolition phases in Oakland, Alameda, and the Bay Area. Labor, staging, haul-off, and disposal coordination. From $695. CSLB #1152237.',
  },
  {
    path: '/cleanup/recurring-jobsite-cleanup',
    title: 'Recurring Jobsite Cleanup for Contractors | Calsan C&D Waste Removal',
    description: 'Scheduled recurring jobsite cleanup for contractors with active projects in Oakland, Alameda, and the Bay Area. From $1,200/month. CSLB #1152237.',
  },
];

const SITE_URL = 'https://calsandumpsterspro.com';

function buildHtml(page) {
  let html = template;

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escHtml(page.title)}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escAttr(page.description)}" />`
  );

  // Replace OG title
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escAttr(page.title)}" />`
  );

  // Replace OG description
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escAttr(page.description)}" />`
  );

  // Add canonical link if not homepage (homepage may already have one via React)
  const canonicalUrl = `${SITE_URL}${page.path === '/' ? '' : page.path}`;
  if (!html.includes('rel="canonical"')) {
    html = html.replace(
      '</head>',
      `  <link rel="canonical" href="${canonicalUrl}" />\n  </head>`
    );
  }

  return html;
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Generate ──────────────────────────────────────────────────
let created = 0;
for (const page of PAGES) {
  const html = buildHtml(page);

  // For "/", overwrite dist/index.html directly
  // For "/quote", write dist/quote/index.html
  const filePath =
    page.path === '/'
      ? INDEX_HTML
      : join(DIST, page.path, 'index.html');

  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(filePath, html, 'utf-8');
  created++;
  console.log(`[prerender] ✓ ${page.path}`);
}

console.log(`\n[prerender] Done — ${created} pages pre-rendered with static meta tags.`);
