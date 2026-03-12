// SEO City Engine - Content Generator & Utilities
// Generates unique, premium SEO content per city/size/material

import { BUSINESS_INFO, OPERATIONAL_YARDS, generateBreadcrumbSchema, generateFAQSchema, generateServiceSchema } from './seo';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES, MASTER_FAQS } from './shared-data';
import { cityUrl, citySizeUrl, cityMaterialUrl } from './seo-urls';

// ============================================================
// TYPES
// ============================================================

export type SeoPageType = 'CITY' | 'CITY_SIZE' | 'CITY_MATERIAL' | 'CITY_COMMERCIAL';

export interface SeoCity {
  id: string;
  city_name: string;
  state: string;
  city_slug: string;
  county: string | null;
  market_code: string | null;
  primary_yard_id: string | null;
  is_active: boolean;
  is_primary_market: boolean;
  lat: number | null;
  lng: number | null;
  population: string | null;
  local_intro: string | null;
  dump_rules: string | null;
  pricing_note: string | null;
  permit_info: string | null;
  common_sizes_json: number[];
  heavy_sizes_json: number[];
  neighborhoods_json: string[];
  nearby_cities_json: string[];
}

export interface SeoPage {
  id: string;
  page_type: SeoPageType;
  city_id: string;
  url_path: string;
  title: string;
  meta_description: string;
  h1: string;
  sections_json: ContentSection[];
  faq_json: FaqItem[];
  schema_json: object[];
  canonical_url: string | null;
  is_published: boolean;
  last_generated_at: string | null;
}

export interface ContentSection {
  type: 'hero' | 'sizes' | 'materials' | 'disposal' | 'permits' | 'pricing' | 'faq' | 'nearby' | 'cta' | 'internal_links';
  heading?: string;
  body?: string;
  items?: Array<{ label: string; value: string; link?: string }>;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface InternalLink {
  text: string;
  url: string;
  type: 'nearby_city' | 'size' | 'material' | 'service';
}

// ============================================================
// MATERIAL DEFINITIONS
// ============================================================

export const SEO_MATERIALS = [
  { slug: 'concrete-dumpster', name: 'Concrete', category: 'heavy', sizes: [5, 8, 10], description: 'Heavy concrete, block, and masonry disposal with flat-fee pricing.' },
  { slug: 'dirt-dumpster', name: 'Dirt & Soil', category: 'heavy', sizes: [5, 8, 10], description: 'Clean fill dirt, topsoil, and excavation material removal.' },
  { slug: 'construction-debris-dumpster', name: 'Construction Debris', category: 'general', sizes: [10, 20, 30, 40, 50], description: 'Mixed construction and demolition debris from remodels and builds.' },
  { slug: 'yard-waste-dumpster', name: 'Yard Waste & Green Waste', category: 'general', sizes: [10, 20, 30], description: 'Branches, leaves, grass, and organic yard debris removal.' },
  { slug: 'commercial-dumpster-rental', name: 'Commercial', category: 'general', sizes: [20, 30, 40, 50], description: 'Commercial-grade dumpsters for office buildouts, tenant improvements, and warehouse cleanouts.' },
] as const;

// ============================================================
// CITY-SPECIFIC CONTENT VARIATIONS
// ============================================================

const MARKET_VARIATIONS: Record<string, { projectTypes: string; accessNotes: string; localColor: string }> = {
  'OAK_EAST_BAY': {
    projectTypes: 'construction site cleanouts, home renovation debris, mixed demolition loads, and heavy material disposal',
    accessNotes: 'Most East Bay addresses have standard driveway access. Hill neighborhoods may require advance coordination for placement.',
    localColor: 'The East Bay construction market relies on efficient debris removal to keep projects on schedule. Our Oakland yard provides same-day turnaround for most addresses.',
  },
  'SJ_SOUTH_BAY': {
    projectTypes: 'home remodels, driveway replacements, contractor haul-offs, and tech campus buildouts',
    accessNotes: 'South Bay homes typically have wide driveways suitable for roll-off placement. HOA communities may require advance notice.',
    localColor: 'South Bay contractors and homeowners trust our San Jose yard for reliable, on-time dumpster delivery across Silicon Valley.',
  },
  'SF_PENINSULA': {
    projectTypes: 'tight-access renovations, permitted street placements, high-rise demolition support, and commercial tenant improvements',
    accessNotes: 'San Francisco requires careful placement planning due to narrow streets, steep grades, and parking restrictions. We handle the logistics.',
    localColor: 'San Francisco projects demand precision logistics. Our experienced drivers navigate tight streets and hills daily to deliver on time.',
  },
};

// ============================================================
// CONTENT GENERATORS
// ============================================================

export function generateCityPageContent(city: SeoCity): Omit<SeoPage, 'id' | 'city_id' | 'is_published' | 'last_generated_at'> {
  const yard = OPERATIONAL_YARDS.find(y => y.id === city.primary_yard_id);
  const market = MARKET_VARIATIONS[city.market_code || ''] || MARKET_VARIATIONS['OAK_EAST_BAY'];
  const neighborhoods = city.neighborhoods_json || [];
  const urlPath = cityUrl(city.city_slug);

  const title = `Dumpster Rental ${city.city_name} CA | Same-Day Delivery | Local Yard`;
  const metaDescription = `Local dumpster rental in ${city.city_name}, CA. Same-day delivery from our ${yard?.city || 'Bay Area'} yard. 5-50 yard sizes, flat-fee concrete, transparent pricing. Call ${BUSINESS_INFO.phone.salesFormatted}.`;
  const h1 = `Dumpster Rental in ${city.city_name}, CA`;

  const sections: ContentSection[] = [
    {
      type: 'hero',
      heading: h1,
      body: city.local_intro || market.localColor,
    },
    {
      type: 'sizes',
      heading: `Dumpster Sizes Available in ${city.city_name}`,
      body: `Choose from 7 sizes for your ${city.city_name} project. ${market.projectTypes}.`,
      items: DUMPSTER_SIZES_DATA.map(s => ({
        label: `${s.yards} Yard`,
        value: `From $${s.priceFrom}`,
        link: citySizeUrl(city.city_slug, s.yards),
      })),
    },
    {
      type: 'materials',
      heading: `Popular Materials in ${city.city_name}`,
      items: SEO_MATERIALS.map(m => ({
        label: m.name,
        value: m.description,
        link: cityMaterialUrl(city.city_slug, m.slug),
      })),
    },
    {
      type: 'disposal',
      heading: `${city.city_name} Disposal Rules & Regulations`,
      body: city.dump_rules || '',
    },
    {
      type: 'permits',
      heading: `${city.city_name} Dumpster Permit Information`,
      body: city.permit_info || '',
    },
    {
      type: 'pricing',
      heading: `${city.city_name} Dumpster Rental Pricing`,
      body: `${city.pricing_note || ''} Standard ${PRICING_POLICIES.standardRentalDays}-day rental included. Heavy materials are flat-fee with no weight overage. General debris overage: $${PRICING_POLICIES.overagePerTonGeneral}/ton.`,
    },
  ];

  if (neighborhoods.length > 0) {
    sections.push({
      type: 'nearby',
      heading: `Neighborhoods We Serve in ${city.city_name}`,
      body: `We deliver dumpsters throughout ${city.city_name}, including ${neighborhoods.slice(0, 6).join(', ')}, and more.`,
      items: neighborhoods.map(n => ({ label: n, value: '' })),
    });
  }

  const faqs = generateCityFaqs(city, yard);

  const schemas = [
    generateCityLocalBusinessSchema(city, yard),
    generateFAQSchema(faqs),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Service Areas', url: '/areas' },
      { name: city.city_name, url: urlPath },
    ]),
  ];

  return {
    page_type: 'CITY',
    url_path: urlPath,
    title,
    meta_description: metaDescription,
    h1,
    sections_json: sections,
    faq_json: faqs,
    schema_json: schemas,
    canonical_url: urlPath,
  };
}

export function generateCitySizePageContent(city: SeoCity, sizeYards: number): Omit<SeoPage, 'id' | 'city_id' | 'is_published' | 'last_generated_at'> {
  const sizeData = DUMPSTER_SIZES_DATA.find(s => s.yards === sizeYards);
  if (!sizeData) throw new Error(`Invalid size: ${sizeYards}`);

  const yard = OPERATIONAL_YARDS.find(y => y.id === city.primary_yard_id);
  const urlPath = citySizeUrl(city.city_slug, sizeYards);
  const title = `${sizeYards} Yard Dumpster Rental ${city.city_name} CA | From $${sizeData.priceFrom}`;
  const metaDescription = `Rent a ${sizeYards}-yard dumpster in ${city.city_name}, CA. ${sizeData.dimensions}, ${sizeData.loads}. From $${sizeData.priceFrom} with ${sizeData.includedTons}-ton included. Same-day delivery from our local yard.`;
  const h1 = `${sizeYards} Yard Dumpster Rental in ${city.city_name}, CA`;

  const sections: ContentSection[] = [
    {
      type: 'hero',
      heading: h1,
      body: `The ${sizeYards}-yard dumpster (${sizeData.dimensions}) is ideal for ${sizeData.useCases.join(', ').toLowerCase()} in ${city.city_name}. Holds approximately ${sizeData.loads}. Delivered from our ${yard?.city || 'local'} yard.`,
    },
    {
      type: 'pricing',
      heading: `${sizeYards} Yard Dumpster Pricing in ${city.city_name}`,
      body: `Starting from $${sizeData.priceFrom}. Includes ${sizeData.includedTons} ton${sizeData.includedTons > 1 ? 's' : ''} and ${PRICING_POLICIES.standardRentalDays}-day rental. ${sizeData.category === 'heavy' || sizeData.category === 'both' ? 'Available for heavy materials (concrete, dirt) at flat-fee pricing.' : `General debris overage: $${PRICING_POLICIES.overagePerTonGeneral}/ton.`}`,
    },
    {
      type: 'sizes',
      heading: `Other Sizes Available in ${city.city_name}`,
      items: DUMPSTER_SIZES_DATA.filter(s => s.yards !== sizeYards).map(s => ({
        label: `${s.yards} Yard`,
        value: `From $${s.priceFrom}`,
        link: citySizeUrl(city.city_slug, s.yards),
      })),
    },
  ];

  const faqs: FaqItem[] = [
    { question: `How much does a ${sizeYards}-yard dumpster cost in ${city.city_name}?`, answer: `A ${sizeYards}-yard dumpster in ${city.city_name} starts from $${sizeData.priceFrom}. Price includes ${sizeData.includedTons} ton${sizeData.includedTons > 1 ? 's' : ''} and ${PRICING_POLICIES.standardRentalDays}-day rental.` },
    { question: `What fits in a ${sizeYards}-yard dumpster?`, answer: `A ${sizeYards}-yard dumpster (${sizeData.dimensions}) holds approximately ${sizeData.loads}. Common uses: ${sizeData.useCases.join(', ')}.` },
    { question: `How fast can I get a ${sizeYards}-yard dumpster in ${city.city_name}?`, answer: `Same-day delivery is available for most ${city.city_name} addresses when ordered before noon. Our ${yard?.name || 'local yard'} ensures fast turnaround.` },
  ];

  const schemas = [
    generateServiceSchema({
      name: `${sizeYards} Yard Dumpster Rental in ${city.city_name}`,
      description: metaDescription,
      price: `$${sizeData.priceFrom}`,
      areaServed: [city.city_name, city.county || 'Bay Area', 'California'].filter(Boolean) as string[],
    }),
    generateFAQSchema(faqs),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: city.city_name, url: cityUrl(city.city_slug) },
      { name: `${sizeYards} Yard`, url: urlPath },
    ]),
  ];

  return {
    page_type: 'CITY_SIZE',
    url_path: urlPath,
    title,
    meta_description: metaDescription,
    h1,
    sections_json: sections,
    faq_json: faqs,
    schema_json: schemas,
    canonical_url: urlPath,
  };
}

export function generateCityMaterialPageContent(city: SeoCity, materialSlug: string): Omit<SeoPage, 'id' | 'city_id' | 'is_published' | 'last_generated_at'> {
  const material = SEO_MATERIALS.find(m => m.slug === materialSlug);
  if (!material) throw new Error(`Invalid material: ${materialSlug}`);

  const yard = OPERATIONAL_YARDS.find(y => y.id === city.primary_yard_id);
  const urlPath = cityMaterialUrl(city.city_slug, material.slug);
  const title = `${material.name} Dumpster Rental ${city.city_name} CA | ${material.category === 'heavy' ? 'Flat Fee' : `From $${DUMPSTER_SIZES_DATA.find(s => (material.sizes as readonly number[]).includes(s.yards))?.priceFrom || 395}`}`;
  const metaDescription = `${material.name} dumpster rental in ${city.city_name}, CA. ${material.description} Available in ${material.sizes.join(', ')} yard sizes. Same-day delivery from our ${yard?.city || 'local'} yard.`;
  const h1 = `${material.name} Dumpster Rental in ${city.city_name}, CA`;

  const pricingText = material.category === 'heavy'
    ? 'Heavy material dumpsters are flat-fee pricing. Disposal is included with no weight overage charges. Keep loads clean and unmixed for flat-fee qualification.'
    : `General debris dumpsters include base tonnage. Overage is billed at $${PRICING_POLICIES.overagePerTonGeneral}/ton based on scale ticket.`;

  const sections: ContentSection[] = [
    {
      type: 'hero',
      heading: h1,
      body: `${material.description} Serving ${city.city_name} and surrounding areas from our ${yard?.city || 'local'} yard with same-day delivery available.`,
    },
    {
      type: 'sizes',
      heading: `Recommended Sizes for ${material.name} in ${city.city_name}`,
      items: material.sizes.map(sz => {
        const s = DUMPSTER_SIZES_DATA.find(d => d.yards === sz);
        return s ? { label: `${s.yards} Yard`, value: `From $${s.priceFrom} — ${s.loads}`, link: citySizeUrl(city.city_slug, s.yards) } : { label: `${sz} Yard`, value: '' };
      }),
    },
    {
      type: 'pricing',
      heading: `${material.name} Disposal Pricing`,
      body: pricingText,
    },
    {
      type: 'disposal',
      heading: `${material.name} Disposal Rules in ${city.city_name}`,
      body: city.dump_rules || '',
    },
  ];

  const faqs: FaqItem[] = [
    { question: `Can I put ${material.name.toLowerCase()} in a dumpster in ${city.city_name}?`, answer: `Yes. We offer ${material.sizes.join(', ')} yard dumpsters specifically for ${material.name.toLowerCase()} in ${city.city_name}. ${pricingText}` },
    { question: `What size dumpster do I need for ${material.name.toLowerCase()}?`, answer: `For ${material.name.toLowerCase()}, we recommend ${material.sizes.join(' or ')} yard dumpsters. The right size depends on your project scope—call us for a recommendation.` },
  ];

  const schemas = [
    generateServiceSchema({
      name: `${material.name} Dumpster Rental in ${city.city_name}`,
      description: metaDescription,
      areaServed: [city.city_name, city.county || 'Bay Area', 'California'].filter(Boolean) as string[],
    }),
    generateFAQSchema(faqs),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: city.city_name, url: cityUrl(city.city_slug) },
      { name: material.name, url: urlPath },
    ]),
  ];

  return {
    page_type: 'CITY_MATERIAL',
    url_path: urlPath,
    title,
    meta_description: metaDescription,
    h1,
    sections_json: sections,
    faq_json: faqs,
    schema_json: schemas,
    canonical_url: urlPath,
  };
}

// ============================================================
// INTERNAL LINKING
// ============================================================

export function generateInternalLinks(city: SeoCity, pageType: SeoPageType, allCities: SeoCity[]): InternalLink[] {
  const links: InternalLink[] = [];

  // Nearby city links (max 6)
  const nearbySlugs = city.nearby_cities_json || [];
  const nearbyCities = nearbySlugs
    .map(slug => allCities.find(c => c.city_slug === slug))
    .filter(Boolean)
    .slice(0, 6);
  
  for (const nc of nearbyCities) {
    if (nc) {
      links.push({
        text: `Dumpster rental in ${nc.city_name}, CA`,
        url: cityUrl(nc.city_slug),
        type: 'nearby_city',
      });
    }
  }

  if (pageType === 'CITY') {
    // Size links
    for (const sz of (city.common_sizes_json || [5, 10, 20, 30, 40, 50])) {
      links.push({
        text: `${sz}-yard dumpster in ${city.city_name}`,
        url: citySizeUrl(city.city_slug, sz),
        type: 'size',
      });
    }
    // Material links
    for (const m of SEO_MATERIALS.slice(0, 4)) {
      links.push({
        text: `${m.name} dumpster in ${city.city_name}`,
        url: cityMaterialUrl(city.city_slug, m.slug),
        type: 'material',
      });
    }
    // Use-case links
    links.push(
      { text: 'Home Remodel Dumpster Guide', url: '/use-cases/home-remodel', type: 'service' },
      { text: 'Construction Debris Rental', url: '/use-cases/construction', type: 'service' },
      { text: 'Garage Cleanout Dumpsters', url: '/use-cases/garage-cleanout', type: 'service' },
    );
  }

  if (pageType === 'CITY_SIZE') {
    // Link back to city
    links.push({
      text: `All dumpsters in ${city.city_name}, CA`,
      url: cityUrl(city.city_slug),
      type: 'service',
    });
    // 2 nearby cities for same size (territorial cluster)
    for (const nc of nearbyCities.slice(0, 2)) {
      if (nc) {
        links.push({
          text: `Dumpster rental in ${nc.city_name}, CA`,
          url: cityUrl(nc.city_slug),
          type: 'nearby_city',
        });
      }
    }
  }

  if (pageType === 'CITY_MATERIAL') {
    links.push({
      text: `All dumpsters in ${city.city_name}, CA`,
      url: cityUrl(city.city_slug),
      type: 'service',
    });
  }

  // Cap at 12 links
  return links.slice(0, 12);
}

// ============================================================
// SCHEMA HELPERS
// ============================================================

function generateCityLocalBusinessSchema(city: SeoCity, yard?: typeof OPERATIONAL_YARDS[0]) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BUSINESS_INFO.url}${cityUrl(city.city_slug)}#business`,
    "name": `${BUSINESS_INFO.name} - ${city.city_name}`,
    "description": `Dumpster rental in ${city.city_name}, ${city.state}. Same-day delivery from our local yard.`,
    "telephone": BUSINESS_INFO.phone.sales,
    "email": BUSINESS_INFO.email,
    "url": `${BUSINESS_INFO.url}${cityUrl(city.city_slug)}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city.city_name,
      "addressRegion": city.state,
      "addressCountry": "US",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": city.lat,
      "longitude": city.lng,
    },
    "areaServed": [
      { "@type": "City", "name": city.city_name },
      ...(city.nearby_cities_json || []).slice(0, 4).map(slug => {
        const name = slug.replace('-ca', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return { "@type": "City", "name": name };
      }),
    ],
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "06:00",
      "closes": "21:00",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "200",
      "bestRating": "5",
      "worstRating": "1",
    },
  };
}

function generateCityFaqs(city: SeoCity, yard?: typeof OPERATIONAL_YARDS[0]): FaqItem[] {
  return [
    {
      question: `How much does a dumpster rental cost in ${city.city_name}?`,
      answer: `Dumpster rental in ${city.city_name} starts at $${DUMPSTER_SIZES_DATA[0].priceFrom} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard dumpster. Pricing depends on size, material type, and rental duration. Heavy materials (concrete, dirt) are flat-fee with no weight overage. General debris overages are billed at $${PRICING_POLICIES.overagePerTonGeneral}/ton.`,
    },
    {
      question: `How fast can I get a dumpster in ${city.city_name}?`,
      answer: `Same-day delivery is available for most ${city.city_name} addresses when ordered before noon. Our ${yard?.name || 'nearest yard'} is close by, ensuring fast turnaround. Next-day delivery is standard for all orders.`,
    },
    {
      question: `Do I need a permit for a dumpster in ${city.city_name}?`,
      answer: city.permit_info || 'Check with your local public works department for street placement permits. Dumpsters on private property typically do not require permits.',
    },
    {
      question: `What sizes are available in ${city.city_name}?`,
      answer: `We offer 5, 8, 10, 20, 30, 40, and 50 yard dumpsters in ${city.city_name}. Heavy material dumpsters (concrete, dirt) are available in 5, 8, and 10 yard sizes. General debris dumpsters are available in all sizes.`,
    },
    {
      question: `What materials can I put in a dumpster in ${city.city_name}?`,
      answer: `Accepted materials include construction debris, concrete, dirt, rock, wood, drywall, roofing, yard waste, and general household junk. Prohibited items include hazardous waste, paint, chemicals, batteries, and appliances with freon. See our materials page for details.`,
    },
  ];
}

// ============================================================
// FULL PAGE SET GENERATOR
// ============================================================

export function generateAllPagesForCity(city: SeoCity): Array<Omit<SeoPage, 'id' | 'city_id' | 'is_published' | 'last_generated_at'>> {
  const pages: Array<Omit<SeoPage, 'id' | 'city_id' | 'is_published' | 'last_generated_at'>> = [];

  // City mother page
  pages.push(generateCityPageContent(city));

  // City + Size pages (common sizes)
  for (const sz of (city.common_sizes_json || [10, 20, 30, 40])) {
    pages.push(generateCitySizePageContent(city, sz));
  }

  // City + Material pages
  for (const m of SEO_MATERIALS) {
    pages.push(generateCityMaterialPageContent(city, m.slug));
  }

  return pages;
}
