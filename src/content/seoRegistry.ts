/**
 * Central SEO Registry — single source of truth for all public page metadata.
 * 
 * This file enables:
 * - Audit coverage of every public route
 * - Sitemap generation with correct priorities
 * - Validation that every public page has unique title + description
 * - Route-level metadata for blog, city, and service pages
 * 
 * Pages that receive dynamic metadata (city pages, blog articles, ZIP pages)
 * are listed here with template patterns for validation purposes.
 */

export interface SeoPageEntry {
  /** Route path (exact or pattern) */
  path: string;
  /** Unique page title (without brand suffix — SEOHead appends it) */
  title: string;
  /** Meta description — conversion-oriented, <160 chars */
  description: string;
  /** Canonical path (relative to domain root) */
  canonical: string;
  /** Sitemap priority 0.0–1.0 */
  priority: number;
  /** Sitemap changefreq */
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /** Set true only for intentionally hidden pages */
  noindex?: boolean;
  /** Page category for reporting */
  category: 'core' | 'service' | 'location' | 'content' | 'conversion' | 'legal' | 'cleanup' | 'blog' | 'seo-engine';
  /** Whether metadata is hardcoded or comes from DB/dynamic source */
  metadataSource: 'static' | 'dynamic';
}

// ─── Core Marketing Pages ───────────────────────────────────────────
export const CORE_PAGES: SeoPageEntry[] = [
  {
    path: '/',
    title: 'Dumpster Rental Bay Area',
    description: 'Same-day dumpster rental in Oakland, San Jose & San Francisco. Transparent pricing, real local yards, 5-50 yard roll-off dumpsters. Instant quote in 60 seconds.',
    canonical: '/',
    priority: 1.0,
    changefreq: 'weekly',
    category: 'core',
    metadataSource: 'static',
  },
  {
    path: '/pricing',
    title: 'Dumpster Rental Prices Bay Area | Transparent Flat-Rate Pricing',
    description: 'Bay Area dumpster rental pricing. No hidden fees, flat-rate for concrete & dirt. 5-50 yard sizes. Oakland, San Jose, SF. Get instant quote.',
    canonical: '/pricing',
    priority: 0.9,
    changefreq: 'weekly',
    category: 'core',
    metadataSource: 'static',
  },
  {
    path: '/sizes',
    title: 'Dumpster Sizes Guide | 5 to 50 Yard Dumpsters',
    description: 'Compare dumpster sizes from 5 to 50 yards. Heavy material sizes for concrete and dirt. General debris sizes for renovations and cleanouts.',
    canonical: '/sizes',
    priority: 0.9,
    changefreq: 'monthly',
    category: 'core',
    metadataSource: 'static',
  },
  {
    path: '/areas',
    title: 'Service Areas | Bay Area Dumpster Delivery',
    description: 'Dumpster delivery in 9 Bay Area counties: Alameda, SF, Santa Clara, Contra Costa, San Mateo, Marin, Napa, Solano, Sonoma. Same-day available.',
    canonical: '/areas',
    priority: 0.8,
    changefreq: 'monthly',
    category: 'core',
    metadataSource: 'static',
  },
  {
    path: '/materials',
    title: 'Accepted Materials | What Can Go in a Dumpster',
    description: 'Guide to acceptable dumpster materials. Prohibited items, special disposal for concrete, dirt, and hazardous waste. Bay Area disposal rules.',
    canonical: '/materials',
    priority: 0.8,
    changefreq: 'monthly',
    category: 'core',
    metadataSource: 'static',
  },
  {
    path: '/capacity-guide',
    title: 'Dumpster Capacity Guide | How Much Fits in Each Size',
    description: 'Visual guide to dumpster capacity. See how much fits in 5, 10, 20, 30, and 40 yard dumpsters. Pick the right size for your project.',
    canonical: '/capacity-guide',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'core',
    metadataSource: 'static',
  },
  {
    path: '/about',
    title: 'About Us | Local Bay Area Dumpster Company',
    description: 'Calsan Dumpsters Pro is a locally owned dumpster rental company serving the SF Bay Area. Family operated with real local yards.',
    canonical: '/about',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'core',
    metadataSource: 'static',
  },
  {
    path: '/how-it-works',
    title: 'How It Works | Dumpster Rental Process',
    description: 'Five simple steps to rent a dumpster. Enter ZIP, get quote, schedule delivery, and manage everything online. Same-day delivery available.',
    canonical: '/how-it-works',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'core',
    metadataSource: 'static',
  },
  {
    path: '/why-calsan',
    title: 'Dumpster Rental Done Right',
    description: 'Calsan Dumpsters Pro manages dispatch directly through local yard operations, structured routing, and technology-enhanced service across the Bay Area.',
    canonical: '/why-calsan',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'content',
    metadataSource: 'static',
  },
  {
    path: '/why-local-yards',
    title: 'Why Local Yards Matter | Dumpster Rental',
    description: 'Why yard-based dumpster operators outperform brokers. Faster delivery, transparent pricing, and better accountability from local yards.',
    canonical: '/why-local-yards',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'content',
    metadataSource: 'static',
  },
  {
    path: '/not-a-broker',
    title: "We're Not a Broker | Local Yard Dumpster Operator",
    description: 'Calsan Dumpsters Pro is not a broker. We own our fleet, operate local yards, and dispatch directly. Transparent pricing, real accountability.',
    canonical: '/not-a-broker',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'content',
    metadataSource: 'static',
  },
];

// ─── Contractor Pages ───────────────────────────────────────────────
export const CONTRACTOR_PAGES: SeoPageEntry[] = [
  {
    path: '/contractors',
    title: 'Contractor Dumpster Rental | Volume Discounts',
    description: 'Contractor-friendly dumpster service with volume discounts, priority scheduling, and dedicated account support. Net-30 available.',
    canonical: '/contractors',
    priority: 0.8,
    changefreq: 'monthly',
    category: 'service',
    metadataSource: 'static',
  },
  {
    path: '/contractor-best-practices',
    title: 'Dumpster Rental Best Practices for Contractors',
    description: 'Contractor dumpster rental best practices for the Bay Area. Choose the right size, avoid fees, stay compliant with WMP requirements.',
    canonical: '/contractor-best-practices',
    priority: 0.6,
    changefreq: 'monthly',
    category: 'content',
    metadataSource: 'static',
  },
  {
    path: '/contractor-resources',
    title: 'Contractor Resource Hub | Permit Guides & Dumpster Planning',
    description: 'Contractor resources for dumpster rental in the Bay Area. Permit guides for Oakland, San Jose, and San Francisco. Sizing and planning tools.',
    canonical: '/contractor-resources',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'content',
    metadataSource: 'static',
  },
  {
    path: '/contractor-application',
    title: 'Contractor Account Application',
    description: 'Apply for a contractor or commercial dumpster rental account. Priority dispatch, volume pricing, and dedicated support for Bay Area pros.',
    canonical: '/contractor-application',
    priority: 0.6,
    changefreq: 'monthly',
    category: 'conversion',
    metadataSource: 'static',
  },
];

// ─── Conversion Pages ───────────────────────────────────────────────
export const CONVERSION_PAGES: SeoPageEntry[] = [
  {
    path: '/quote',
    title: 'Get Dumpster Rental Quote | Instant Pricing',
    description: 'Get a dumpster rental quote in 60 seconds. Enter your ZIP code for exact pricing. Same-day delivery available across the Bay Area.',
    canonical: '/quote',
    priority: 0.9,
    changefreq: 'monthly',
    category: 'conversion',
    metadataSource: 'static',
  },
  {
    path: '/quote/contractor',
    title: 'Contractor Quote | Volume Programs',
    description: 'Exclusive contractor volume programs with discounts up to 10%. Priority scheduling, Net-30 terms for Bay Area contractors.',
    canonical: '/quote/contractor',
    priority: 0.8,
    changefreq: 'monthly',
    category: 'conversion',
    metadataSource: 'static',
  },
  {
    path: '/contact',
    title: 'Contact Us | Get in Touch',
    description: 'Contact Calsan Dumpsters Pro. Call (510) 680-2150 for sales, text us, or email. Office in Oakland, CA. Hablamos Español.',
    canonical: '/contact',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'conversion',
    metadataSource: 'static',
  },
  {
    path: '/contact-us',
    title: 'Contact Us | Calsan Dumpsters Pro',
    description: 'Get in touch with Calsan Dumpsters Pro for dumpster rental in the Bay Area. Call, text, or request a quote online.',
    canonical: '/contact-us',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'conversion',
    metadataSource: 'static',
  },
  {
    path: '/thank-you',
    title: 'Thank You | Quote Submitted',
    description: 'Your dumpster rental quote has been submitted. We will contact you shortly.',
    canonical: '/thank-you',
    priority: 0.2,
    changefreq: 'yearly',
    category: 'conversion',
    metadataSource: 'static',
    noindex: true,
  },
  {
    path: '/download-price-list',
    title: 'Download Price List',
    description: 'Download our current dumpster rental price list for the Bay Area.',
    canonical: '/download-price-list',
    priority: 0.3,
    changefreq: 'monthly',
    category: 'conversion',
    metadataSource: 'static',
    noindex: true,
  },
];

// ─── Blog ───────────────────────────────────────────────────────────
export const BLOG_PAGES: SeoPageEntry[] = [
  {
    path: '/blog',
    title: 'Dumpster Rental Blog | Tips, Guides & News',
    description: 'Expert tips on dumpster rental, sizing guides, permit information, and waste disposal best practices for Bay Area residents and contractors.',
    canonical: '/blog',
    priority: 0.7,
    changefreq: 'weekly',
    category: 'blog',
    metadataSource: 'static',
  },
  // Individual blog articles: /blog/:articleSlug — metadata from seo-blog-topics.ts
  {
    path: '/blog/:articleSlug',
    title: '[Dynamic] Blog Article',
    description: '[Dynamic] Individual blog article metadata comes from seo-blog-topics.ts',
    canonical: '/blog/:articleSlug',
    priority: 0.6,
    changefreq: 'monthly',
    category: 'blog',
    metadataSource: 'dynamic',
  },
];

// ─── Flagship City Pages (hand-optimized domination pages) ──────────
export const FLAGSHIP_PAGES: SeoPageEntry[] = [
  {
    path: '/dumpster-rental-oakland-ca',
    title: 'Dumpster Rental Oakland CA | Same-Day Delivery',
    description: 'Oakland dumpster rental from a local yard on 46th Ave. 5-50 yard roll-off dumpsters, same-day delivery, transparent pricing. Get quote now.',
    canonical: '/dumpster-rental-oakland-ca',
    priority: 0.95,
    changefreq: 'weekly',
    category: 'location',
    metadataSource: 'static',
  },
  {
    path: '/dumpster-rental-san-jose-ca',
    title: 'Dumpster Rental San Jose CA | Local Yard Service',
    description: 'San Jose dumpster rental from our Ringwood Ave yard. 5-50 yard roll-offs for construction, roofing, and cleanouts. Same-day available.',
    canonical: '/dumpster-rental-san-jose-ca',
    priority: 0.95,
    changefreq: 'weekly',
    category: 'location',
    metadataSource: 'static',
  },
  {
    path: '/dumpster-rental-san-francisco-ca',
    title: 'Dumpster Rental San Francisco CA | SF Peninsula',
    description: 'San Francisco dumpster rental with SF-based dispatch. Permit guidance included. Roll-off dumpsters for construction, remodels, and cleanouts.',
    canonical: '/dumpster-rental-san-francisco-ca',
    priority: 0.95,
    changefreq: 'weekly',
    category: 'location',
    metadataSource: 'static',
  },
];

// ─── Regional Hub Pages ─────────────────────────────────────────────
export const REGIONAL_PAGES: SeoPageEntry[] = [
  {
    path: '/bay-area-dumpster-rental',
    title: 'Bay Area Dumpster Rental | 9-County Coverage',
    description: 'Dumpster rental across the San Francisco Bay Area. Local yards in Oakland, San Jose, and SF. Same-day delivery, transparent pricing.',
    canonical: '/bay-area-dumpster-rental',
    priority: 0.9,
    changefreq: 'weekly',
    category: 'location',
    metadataSource: 'static',
  },
  {
    path: '/dumpster-rental-east-bay',
    title: 'East Bay Dumpster Rental | Oakland, Berkeley, Hayward',
    description: 'East Bay dumpster rental from our Oakland yard. Serving Berkeley, Hayward, Fremont, San Leandro, and all of Alameda & Contra Costa County.',
    canonical: '/dumpster-rental-east-bay',
    priority: 0.9,
    changefreq: 'weekly',
    category: 'location',
    metadataSource: 'static',
  },
  {
    path: '/dumpster-rental-south-bay',
    title: 'South Bay Dumpster Rental | San Jose, Santa Clara',
    description: 'South Bay dumpster rental from our San Jose yard. Serving Milpitas, Sunnyvale, Santa Clara, and all of Santa Clara County.',
    canonical: '/dumpster-rental-south-bay',
    priority: 0.9,
    changefreq: 'weekly',
    category: 'location',
    metadataSource: 'static',
  },
  {
    path: '/california-dumpster-rental',
    title: 'California Dumpster Rental | Bay Area Coverage',
    description: 'California dumpster rental focused on the San Francisco Bay Area. Local yards, transparent pricing, same-day delivery.',
    canonical: '/california-dumpster-rental',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'location',
    metadataSource: 'static',
  },
  {
    path: '/north-bay-dumpster-rental',
    title: 'North Bay Dumpster Rental | Marin, Sonoma, Napa',
    description: 'North Bay dumpster rental covering Marin, Sonoma, and Napa counties. Partner yard network for reliable service.',
    canonical: '/north-bay-dumpster-rental',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'location',
    metadataSource: 'static',
  },
];

// ─── SEO Engine Pages (dynamic / DB-driven) ─────────────────────────
export const SEO_ENGINE_PATTERNS: SeoPageEntry[] = [
  {
    path: '/dumpster-rental/:citySlug',
    title: '[Dynamic] Dumpster Rental in {City}, CA',
    description: '[Dynamic] City-specific dumpster rental page from seo_cities DB table',
    canonical: '/dumpster-rental/:citySlug',
    priority: 0.85,
    changefreq: 'monthly',
    category: 'seo-engine',
    metadataSource: 'dynamic',
  },
  {
    path: '/dumpster-rental/:citySlug/:sizeSlug-yard',
    title: '[Dynamic] {Size} Yard Dumpster Rental in {City}',
    description: '[Dynamic] City+size combination page',
    canonical: '/dumpster-rental/:citySlug/:sizeSlug-yard',
    priority: 0.8,
    changefreq: 'monthly',
    category: 'seo-engine',
    metadataSource: 'dynamic',
  },
  {
    path: '/dumpster-rental/:citySlug/:materialSlug',
    title: '[Dynamic] {Material} Dumpster in {City}',
    description: '[Dynamic] City+material combination page',
    canonical: '/dumpster-rental/:citySlug/:materialSlug',
    priority: 0.8,
    changefreq: 'monthly',
    category: 'seo-engine',
    metadataSource: 'dynamic',
  },
  {
    path: '/dumpster-rental/:citySlug/:jobSlug',
    title: '[Dynamic] {Job} Dumpster Rental in {City}',
    description: '[Dynamic] City+job type combination page',
    canonical: '/dumpster-rental/:citySlug/:jobSlug',
    priority: 0.75,
    changefreq: 'monthly',
    category: 'seo-engine',
    metadataSource: 'dynamic',
  },
  {
    path: '/service-area/:zip/dumpster-rental',
    title: '[Dynamic] Dumpster Rental Near {ZIP}',
    description: '[Dynamic] ZIP-based service area page from SEO_ZIP_DATA',
    canonical: '/service-area/:zip/dumpster-rental',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'seo-engine',
    metadataSource: 'dynamic',
  },
  {
    path: '/county/:countySlug/dumpster-rental',
    title: '[Dynamic] Dumpster Rental in {County}',
    description: '[Dynamic] County landing page',
    canonical: '/county/:countySlug/dumpster-rental',
    priority: 0.8,
    changefreq: 'monthly',
    category: 'seo-engine',
    metadataSource: 'dynamic',
  },
  {
    path: '/use-cases/:slug',
    title: '[Dynamic] {Use Case} Dumpster Rental',
    description: '[Dynamic] Use case landing page',
    canonical: '/use-cases/:slug',
    priority: 0.8,
    changefreq: 'monthly',
    category: 'seo-engine',
    metadataSource: 'dynamic',
  },
  {
    path: '/yards/:yardSlug',
    title: '[Dynamic] {Yard} — Local Dumpster Yard',
    description: '[Dynamic] Yard hub page',
    canonical: '/yards/:yardSlug',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'seo-engine',
    metadataSource: 'dynamic',
  },
];

// ─── Cleanup Division Pages ─────────────────────────────────────────
export const CLEANUP_PAGES: SeoPageEntry[] = [
  {
    path: '/cleanup',
    title: 'Construction Cleanup & Debris Removal | Oakland & Bay Area',
    description: 'Construction cleanup, post-construction cleanup, demolition debris removal in Oakland, Alameda, and the Bay Area. CSLB #1152237.',
    canonical: '/cleanup',
    priority: 0.8,
    changefreq: 'weekly',
    category: 'cleanup',
    metadataSource: 'static',
  },
  {
    path: '/cleanup/services',
    title: 'Cleanup Services | Construction, Post-Construction, Demolition',
    description: 'Professional cleanup services: construction cleanup, post-construction cleaning, demolition debris removal, and recurring jobsite cleanup.',
    canonical: '/cleanup/services',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'static',
  },
  {
    path: '/cleanup/construction-cleanup',
    title: 'Construction Cleanup Services | Bay Area',
    description: 'Construction site cleanup and debris removal. Licensed CSLB #1152237. Serving Oakland, Alameda, and the Bay Area.',
    canonical: '/cleanup/construction-cleanup',
    priority: 0.75,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'dynamic',
  },
  {
    path: '/cleanup/post-construction-cleanup',
    title: 'Post-Construction Cleanup | Final Clean for Move-In',
    description: 'Post-construction final cleaning for residential and commercial projects. Dust removal, surface prep, and move-in ready cleaning.',
    canonical: '/cleanup/post-construction-cleanup',
    priority: 0.75,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'dynamic',
  },
  {
    path: '/cleanup/demolition-debris-cleanup',
    title: 'Demolition Debris Cleanup | Bay Area',
    description: 'Demolition debris cleanup and removal. Concrete, wood, drywall, and mixed demo debris. Licensed and insured.',
    canonical: '/cleanup/demolition-debris-cleanup',
    priority: 0.75,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'dynamic',
  },
  {
    path: '/cleanup/recurring-jobsite-cleanup',
    title: 'Recurring Jobsite Cleanup | Scheduled Maintenance',
    description: 'Scheduled recurring cleanup for active construction sites. Daily, weekly, or custom cadence. Keep your jobsite clean and compliant.',
    canonical: '/cleanup/recurring-jobsite-cleanup',
    priority: 0.75,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'dynamic',
  },
  {
    path: '/cleanup/for-contractors',
    title: 'Cleanup for Contractors | Priority Scheduling',
    description: 'Construction cleanup services designed for contractors. Volume programs, priority scheduling, and dedicated account support.',
    canonical: '/cleanup/for-contractors',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'static',
  },
  {
    path: '/cleanup/pricing',
    title: 'Cleanup Pricing | Construction Cleanup Rates',
    description: 'Transparent pricing for construction cleanup services. Per-project and recurring rates. No hidden fees.',
    canonical: '/cleanup/pricing',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'static',
  },
  {
    path: '/cleanup/about',
    title: 'About Calsan C&D Waste Removal | Cleanup Division',
    description: 'Calsan C&D Waste Removal is the cleanup-focused division of Calsan Services. CSLB #1152237.',
    canonical: '/cleanup/about',
    priority: 0.5,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'static',
  },
  {
    path: '/cleanup/faqs',
    title: 'Cleanup FAQs | Construction Cleanup Questions',
    description: 'Frequently asked questions about construction cleanup, pricing, scheduling, and service areas in the Bay Area.',
    canonical: '/cleanup/faqs',
    priority: 0.5,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'static',
  },
  {
    path: '/cleanup/contact',
    title: 'Contact Cleanup Division | Request a Quote',
    description: 'Contact Calsan C&D Waste Removal for construction cleanup quotes. Call or submit a request online.',
    canonical: '/cleanup/contact',
    priority: 0.6,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'static',
  },
  {
    path: '/cleanup/quote',
    title: 'Cleanup Quote | Construction Cleanup Estimate',
    description: 'Request a construction cleanup quote. Describe your project and get a fast estimate for cleanup services.',
    canonical: '/cleanup/quote',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'static',
  },
  {
    path: '/cleanup/before-after',
    title: 'Before & After | Cleanup Project Gallery',
    description: 'See before and after photos from our construction cleanup projects across the Bay Area.',
    canonical: '/cleanup/before-after',
    priority: 0.5,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'static',
  },
  {
    path: '/cleanup/service-areas',
    title: 'Cleanup Service Areas | Oakland, Alameda, Bay Area',
    description: 'Construction cleanup service areas covering Oakland, Alameda, Berkeley, and the greater Bay Area.',
    canonical: '/cleanup/service-areas',
    priority: 0.6,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'static',
  },
  {
    path: '/cleanup/oakland',
    title: 'Construction Cleanup Oakland | Local Service',
    description: 'Construction cleanup in Oakland, CA. Same-day availability, licensed CSLB #1152237. Serving all Oakland neighborhoods.',
    canonical: '/cleanup/oakland',
    priority: 0.75,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'dynamic',
  },
  {
    path: '/cleanup/alameda',
    title: 'Construction Cleanup Alameda | Local Service',
    description: 'Construction cleanup in Alameda, CA. Professional debris removal and jobsite cleanup. CSLB #1152237.',
    canonical: '/cleanup/alameda',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'dynamic',
  },
  {
    path: '/cleanup/bay-area',
    title: 'Construction Cleanup Bay Area | Regional Coverage',
    description: 'Bay Area construction cleanup and debris removal. Serving Oakland, Alameda, Berkeley, and surrounding cities. CSLB #1152237.',
    canonical: '/cleanup/bay-area',
    priority: 0.7,
    changefreq: 'monthly',
    category: 'cleanup',
    metadataSource: 'dynamic',
  },
];

// ─── Utility / Green / Legal Pages ──────────────────────────────────
export const UTILITY_PAGES: SeoPageEntry[] = [
  {
    path: '/green-halo',
    title: 'Green Halo™ Sustainability Program',
    description: 'Track your recycling impact with verified data. Real-time dashboards, sustainability reports, and environmental certifications.',
    canonical: '/green-halo',
    priority: 0.5,
    changefreq: 'monthly',
    category: 'content',
    metadataSource: 'static',
    noindex: true,
  },
  {
    path: '/green-impact',
    title: 'Green Impact Map | Verified Recycling Projects',
    description: 'See verified recycling impact across California. Real project data showing tons diverted and environmental metrics.',
    canonical: '/green-impact',
    priority: 0.5,
    changefreq: 'monthly',
    category: 'content',
    metadataSource: 'static',
    noindex: true,
  },
  {
    path: '/careers',
    title: 'Careers & Operator Opportunities',
    description: 'Join Calsan Dumpsters Pro. Driver positions, sales roles, and Owner Operator partnerships. Expanding across California.',
    canonical: '/careers',
    priority: 0.5,
    changefreq: 'monthly',
    category: 'core',
    metadataSource: 'static',
  },
  {
    path: '/terms',
    title: 'Terms of Service',
    description: 'Terms of service for Calsan Dumpsters Pro dumpster rental services in the San Francisco Bay Area.',
    canonical: '/terms',
    priority: 0.3,
    changefreq: 'yearly',
    category: 'legal',
    metadataSource: 'static',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy',
    description: 'Privacy policy for Calsan Dumpsters Pro. Learn how we collect, use, and protect your personal information.',
    canonical: '/privacy',
    priority: 0.3,
    changefreq: 'yearly',
    category: 'legal',
    metadataSource: 'static',
  },
];

// ─── Noindex / Internal Pages (not in sitemap) ──────────────────────
export const NOINDEX_PAGES: SeoPageEntry[] = [
  {
    path: '/visualizer',
    title: 'Dumpster Size Visualizer',
    description: 'Interactive dumpster size comparison tool.',
    canonical: '/visualizer',
    priority: 0,
    changefreq: 'monthly',
    category: 'core',
    metadataSource: 'static',
    noindex: true,
  },
  {
    path: '/waste-vision',
    title: 'Waste Vision AI',
    description: 'AI-powered waste analysis tool.',
    canonical: '/waste-vision',
    priority: 0,
    changefreq: 'monthly',
    category: 'core',
    metadataSource: 'static',
    noindex: true,
  },
  {
    path: '/technology',
    title: 'Technology Platform',
    description: 'Technology behind Calsan Dumpsters Pro operations.',
    canonical: '/technology',
    priority: 0,
    changefreq: 'monthly',
    category: 'core',
    metadataSource: 'static',
    noindex: true,
  },
  {
    path: '/quick-order',
    title: 'Quick Order',
    description: 'Quick dumpster rental order form.',
    canonical: '/quick-order',
    priority: 0,
    changefreq: 'monthly',
    category: 'conversion',
    metadataSource: 'static',
    noindex: true,
  },
  {
    path: '/schedule-delivery',
    title: 'Schedule Delivery',
    description: 'Schedule your dumpster delivery.',
    canonical: '/schedule-delivery',
    priority: 0,
    changefreq: 'monthly',
    category: 'conversion',
    metadataSource: 'static',
    noindex: true,
  },
  {
    path: '/cleanup/thank-you',
    title: 'Thank You | Cleanup Quote Submitted',
    description: 'Your cleanup quote request has been submitted.',
    canonical: '/cleanup/thank-you',
    priority: 0,
    changefreq: 'yearly',
    category: 'cleanup',
    metadataSource: 'static',
    noindex: true,
  },
];

// ─── Aggregate Export ───────────────────────────────────────────────

/** All registered SEO pages */
export const SEO_REGISTRY: SeoPageEntry[] = [
  ...CORE_PAGES,
  ...CONTRACTOR_PAGES,
  ...CONVERSION_PAGES,
  ...BLOG_PAGES,
  ...FLAGSHIP_PAGES,
  ...REGIONAL_PAGES,
  ...SEO_ENGINE_PATTERNS,
  ...CLEANUP_PAGES,
  ...UTILITY_PAGES,
  ...NOINDEX_PAGES,
];

/** Get registry entry by exact path */
export function getRegistryEntry(path: string): SeoPageEntry | undefined {
  return SEO_REGISTRY.find(e => e.path === path);
}

/** All indexable pages (for sitemap generation validation) */
export function getIndexablePages(): SeoPageEntry[] {
  return SEO_REGISTRY.filter(e => !e.noindex && e.metadataSource === 'static');
}

/** Coverage stats for audit dashboards */
export function getRegistryCoverage() {
  const total = SEO_REGISTRY.length;
  const indexed = SEO_REGISTRY.filter(e => !e.noindex).length;
  const noindexed = SEO_REGISTRY.filter(e => e.noindex).length;
  const staticMeta = SEO_REGISTRY.filter(e => e.metadataSource === 'static').length;
  const dynamicMeta = SEO_REGISTRY.filter(e => e.metadataSource === 'dynamic').length;
  const byCategory = SEO_REGISTRY.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { total, indexed, noindexed, staticMeta, dynamicMeta, byCategory };
}
