// City Content Registry — Unique, hand-written content for priority city pages
// Supplements seo_cities DB data with richer local copy for SEO depth
// Used by SeoCityPage.tsx as fallback/enhancement when DB content is thin

import { BUSINESS_INFO } from './seo';

export interface CityContent {
  slug: string;
  name: string;
  /** Unique intro paragraph — never a city-name swap */
  localIntro: string;
  /** City-specific permit/placement guidance */
  permitNote: string;
  /** Show the "verify placement & permit" callout (Tier 1 cities) */
  showPermitVerification: boolean;
  /** Neighborhoods / areas served */
  neighborhoods: string[];
  /** Principal ZIP codes */
  zips: string[];
  /** Nearby city slugs for internal linking */
  nearbySlugs: string[];
  /** City-specific FAQs — minimum 5, all unique */
  faqs: { question: string; answer: string }[];
  /** Service verticals relevant to this city */
  serviceBlocks: { title: string; description: string; link: string }[];
  /** Logistics notes — unique operational detail */
  logisticsNote: string;
}

// ─── SERVICE BLOCKS (reusable across cities) ──────────────────
const CONSTRUCTION_BLOCK = {
  title: 'Construction Dumpsters',
  description: 'Roll-offs for new builds, remodels, and demolition. 20–50 yard sizes with flexible rental periods.',
  link: '/services/construction-dumpsters',
};
const ROOFING_BLOCK = {
  title: 'Roofing Dumpsters',
  description: 'Dedicated containers for shingle tear-offs and roofing debris. 20–30 yard sizes recommended.',
  link: '/services/roofing-dumpsters',
};
const RESIDENTIAL_BLOCK = {
  title: 'Residential Dumpsters',
  description: 'Cleanouts, remodels, and yard projects. 10–20 yard sizes fit most driveways.',
  link: '/services/residential-dumpsters',
};
const COMMERCIAL_BLOCK = {
  title: 'Commercial Dumpsters',
  description: 'Warehouse cleanouts, retail build-outs, and multi-unit projects. Priority scheduling available.',
  link: '/services/commercial-dumpsters',
};
const HEAVY_BLOCK = {
  title: 'Concrete & Dirt Dumpsters',
  description: 'Flat-fee heavy material containers — no weight overage charges. 5–10 yard sizes.',
  link: '/services/concrete-dirt-dumpsters',
};

// ─── CITY DATA ────────────────────────────────────────────────

export const CITY_CONTENT: CityContent[] = [
  // ── BERKELEY ──────────────────────────────────
  {
    slug: 'berkeley',
    name: 'Berkeley',
    localIntro: `Berkeley's mix of residential neighborhoods, UC campus-adjacent properties, and older Craftsman homes creates steady demand for dumpster rentals. Whether you're renovating a home near Solano Avenue, clearing construction debris from a North Berkeley remodel, or managing a cleanout in the Elmwood district, Calsan delivers from our nearby Oakland yard — typically within hours of your order.`,
    permitNote: `Dumpsters placed on private property in Berkeley (driveways, backyards, private lots) generally do not require a permit. Street placement may require a temporary encroachment permit from the City of Berkeley Public Works Department. Contact the city or call us — we can help you understand the requirements for your specific location.`,
    showPermitVerification: false,
    neighborhoods: ['Downtown Berkeley', 'North Berkeley', 'South Berkeley', 'Elmwood', 'Claremont', 'Westbrae', 'Thousand Oaks', 'Solano Ave District', 'UC Campus Area'],
    zips: ['94702', '94703', '94704', '94705', '94707', '94708', '94709', '94710'],
    nearbySlugs: ['oakland', 'emeryville', 'albany', 'richmond', 'el-cerrito'],
    logisticsNote: 'Dispatched from our Oakland yard on 46th Avenue — most Berkeley deliveries arrive in under 90 minutes during business hours.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, ROOFING_BLOCK, HEAVY_BLOCK, COMMERCIAL_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Berkeley?', answer: 'If the dumpster sits on your private driveway or yard, no permit is typically required. Placing a dumpster on a public street in Berkeley may require a temporary encroachment permit from Public Works. Our team can advise on your specific situation.' },
      { question: 'Can I place a dumpster on the street in Berkeley?', answer: 'Street placement is possible in most Berkeley neighborhoods, but you may need a city permit. Narrow streets near campus or in the hills may have additional restrictions. We recommend driveway placement when possible to avoid permitting delays.' },
      { question: 'What size dumpster is best for a Berkeley home remodel?', answer: `A 20-yard dumpster handles most kitchen and bathroom remodels in Berkeley's older homes. For full-house renovations in Craftsman-era homes, a 30-yard is recommended. Enter your ZIP for exact pricing.` },
      { question: 'Do you offer same-day dumpster delivery in Berkeley?', answer: `Yes — same-day delivery is available for most Berkeley addresses when ordered before noon. Our Oakland yard is less than 10 minutes away, so delivery is typically fast. Call ${BUSINESS_INFO.phone.salesFormatted} for current availability.` },
      { question: 'What materials are restricted in Berkeley dumpsters?', answer: 'Hazardous materials, paint, batteries, tires, and electronics are prohibited. Concrete and dirt require dedicated heavy-material containers with flat-fee pricing. Mixed loads (general debris + concrete) may be reclassified at the disposal facility.' },
    ],
  },

  // ── FREMONT ───────────────────────────────────
  {
    slug: 'fremont',
    name: 'Fremont',
    localIntro: `Fremont's residential growth — especially around Warm Springs, Irvington, and Mission San Jose — drives consistent demand for dumpster rentals. From tract home remodels and ADU construction to commercial build-outs near the Tesla factory corridor, Calsan provides same-day dumpster delivery across all Fremont communities from our San Jose yard operations.`,
    permitNote: `Dumpsters on private property in Fremont generally don't need a permit. For public street placement, the City of Fremont requires an encroachment permit through the Engineering Division. We recommend driveway placement whenever possible to keep your project on schedule.`,
    showPermitVerification: false,
    neighborhoods: ['Warm Springs', 'Irvington', 'Mission San Jose', 'Centerville', 'Niles', 'Ardenwood', 'Glenmoor Gardens', 'Sundale'],
    zips: ['94536', '94538', '94539', '94555'],
    nearbySlugs: ['milpitas', 'hayward', 'newark', 'union-city', 'san-jose'],
    logisticsNote: 'Served from our San Jose yard — most Fremont deliveries arrive within 60–90 minutes during standard hours.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, HEAVY_BLOCK, ROOFING_BLOCK, COMMERCIAL_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Fremont?', answer: 'Private property placement (driveway or yard) typically does not require a permit. Street placement in Fremont requires an encroachment permit from the Engineering Division. Our team can help you figure out what is needed.' },
      { question: 'Can I place a dumpster on the street in Fremont?', answer: 'Yes, with an encroachment permit from the City of Fremont. Most residential streets can accommodate a roll-off container. We recommend checking with us first — driveway placement is faster and avoids permitting.' },
      { question: 'What size dumpster is best for a remodel in Fremont?', answer: 'Most Fremont home remodels use a 20-yard dumpster. For ADU construction or large renovations, a 30-yard handles the extra volume. Bathroom-only remodels can often use a 10-yard.' },
      { question: 'Do you offer same-day dumpster delivery in Fremont?', answer: `Same-day delivery is available for Fremont addresses when ordered before noon. We dispatch from our San Jose yard. Call ${BUSINESS_INFO.phone.salesFormatted} for current scheduling.` },
      { question: 'What materials are restricted in Fremont dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and appliances with refrigerants are prohibited. Concrete and dirt go in dedicated heavy-material containers at flat-fee pricing — no weight overage charges.' },
    ],
  },

  // ── HAYWARD ───────────────────────────────────
  {
    slug: 'hayward',
    name: 'Hayward',
    localIntro: `Hayward's central East Bay location between Oakland and Fremont makes it a high-activity market for dumpster rental. From residential remodels along Mission Boulevard to industrial cleanouts near the Hayward Executive Airport corridor, Calsan delivers fast from our Oakland yard. Older neighborhoods like Hayward Hills and South Hayward see regular demand for renovation and cleanout dumpsters.`,
    permitNote: `Dumpsters on your driveway or private lot in Hayward don't require a permit. Public street placement in Hayward may require a temporary encroachment permit through the city's Public Works department. Contact us for guidance specific to your Hayward address.`,
    showPermitVerification: false,
    neighborhoods: ['Downtown Hayward', 'Hayward Hills', 'South Hayward', 'Tennyson', 'Jackson Triangle', 'Schafer Park', 'Mission-Foothill', 'Industrial Area'],
    zips: ['94541', '94542', '94544', '94545'],
    nearbySlugs: ['san-leandro', 'fremont', 'union-city', 'castro-valley', 'oakland'],
    logisticsNote: 'Dispatched from our Oakland yard — typical Hayward delivery window is under 60 minutes during business hours.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, HEAVY_BLOCK, COMMERCIAL_BLOCK, ROOFING_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Hayward?', answer: 'Driveway and private lot placement in Hayward typically requires no permit. Street placement may need a city encroachment permit. We can advise based on your specific address.' },
      { question: 'Can I place a dumpster on the street in Hayward?', answer: 'Street placement is available in most Hayward neighborhoods with a city permit. For residential streets, we recommend driveway placement for faster delivery and no permitting wait.' },
      { question: 'What size dumpster is best for a remodel in Hayward?', answer: 'A 20-yard dumpster covers most kitchen and bathroom remodels. For whole-house renovations or estate cleanouts, a 30-yard is recommended. Concrete and dirt jobs use our 5–10 yard heavy containers.' },
      { question: 'Do you offer same-day dumpster delivery in Hayward?', answer: `Yes — same-day delivery is available for most Hayward addresses when you order before noon. Our Oakland yard serves all Hayward neighborhoods quickly. Call ${BUSINESS_INFO.phone.salesFormatted}.` },
      { question: 'What materials are restricted in Hayward dumpsters?', answer: 'Hazardous materials, electronics, tires, and paint are not accepted. Concrete, dirt, and asphalt require dedicated flat-fee containers. Call before loading mixed materials.' },
    ],
  },

  // ── MILPITAS ──────────────────────────────────
  {
    slug: 'milpitas',
    name: 'Milpitas',
    localIntro: `Milpitas sits at the crossroads of I-680 and I-880, making it a logistics-friendly location for dumpster delivery. The city's blend of tech-corridor commercial properties and established residential neighborhoods like Calaveras Hills and Sunnyhills creates steady demand for both commercial and residential dumpster service. Calsan serves Milpitas from our San Jose yard — just minutes away via I-880.`,
    permitNote: `Private property dumpster placement in Milpitas (driveways, construction sites, private lots) generally needs no permit. For public street or right-of-way placement, contact the City of Milpitas Engineering Department for encroachment permit requirements. We can guide you through the process.`,
    showPermitVerification: false,
    neighborhoods: ['Calaveras Hills', 'Sunnyhills', 'Midtown', 'Milpitas Town Center', 'Berryessa', 'North Milpitas', 'Great Mall Area'],
    zips: ['95035', '95036'],
    nearbySlugs: ['fremont', 'san-jose', 'santa-clara', 'sunnyvale'],
    logisticsNote: 'Served from our San Jose yard via I-880 — most Milpitas deliveries arrive within 45 minutes during business hours.',
    serviceBlocks: [CONSTRUCTION_BLOCK, RESIDENTIAL_BLOCK, COMMERCIAL_BLOCK, HEAVY_BLOCK, ROOFING_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Milpitas?', answer: 'Driveway or private property placement typically needs no permit. Street placement may require an encroachment permit from the City of Milpitas. Contact us for guidance.' },
      { question: 'Can I place a dumpster on the street in Milpitas?', answer: 'Street placement is available with a city encroachment permit. Most Milpitas residential streets can accommodate a 10–20 yard container. Driveway placement avoids the permit process entirely.' },
      { question: 'What size dumpster is best for a remodel in Milpitas?', answer: 'For bathroom remodels, a 10-yard works well. Kitchen remodels and full-room renovations typically need a 20-yard. ADU construction in Milpitas usually calls for a 20–30 yard container.' },
      { question: 'Do you offer same-day dumpster delivery in Milpitas?', answer: `Yes — same-day delivery is available for Milpitas when you order before noon. Our San Jose yard is just minutes away via I-880. Call ${BUSINESS_INFO.phone.salesFormatted}.` },
      { question: 'What materials are restricted in Milpitas dumpsters?', answer: 'No hazardous waste, paint, batteries, tires, or electronics. Concrete, dirt, and asphalt use our flat-fee heavy containers — no weight overage charges.' },
    ],
  },

  // ── SAN LEANDRO ───────────────────────────────
  {
    slug: 'san-leandro',
    name: 'San Leandro',
    localIntro: `San Leandro's position between Oakland and Hayward gives it excellent dumpster delivery coverage from our Oakland yard. The city's older residential housing stock in neighborhoods like Estudillo Estates and Washington Manor drives consistent renovation demand, while the industrial corridor along Davis Street supports commercial and demolition dumpster needs.`,
    permitNote: `Dumpsters placed on private driveways or lots in San Leandro don't require a permit. Public street or sidewalk placement may require a temporary encroachment permit from the City of San Leandro Engineering Department. We recommend calling us before placing on a public right-of-way.`,
    showPermitVerification: false,
    neighborhoods: ['Downtown San Leandro', 'Estudillo Estates', 'Washington Manor', 'Bay-O-Vista', 'Broadmoor', 'Marina', 'Davis Street Area', 'Hesperian Corridor'],
    zips: ['94577', '94578', '94579'],
    nearbySlugs: ['oakland', 'hayward', 'castro-valley', 'alameda', 'san-lorenzo'],
    logisticsNote: 'Our Oakland yard is less than 15 minutes from most San Leandro addresses — fast delivery with minimal transit time.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, HEAVY_BLOCK, COMMERCIAL_BLOCK, ROOFING_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in San Leandro?', answer: 'No permit needed for private property placement. Public street placement in San Leandro may require an encroachment permit from the Engineering Department. Contact us before scheduling street placement.' },
      { question: 'Can I place a dumpster on the street in San Leandro?', answer: 'Yes, with a city encroachment permit. Most residential streets in San Leandro can handle a dumpster. We recommend driveway placement when available for faster turnaround.' },
      { question: 'What size dumpster is best for a remodel in San Leandro?', answer: `San Leandro's older homes often generate more debris during remodels. A 20-yard handles most kitchen and bathroom projects. For whole-house renovations, go with a 30-yard.` },
      { question: 'Do you offer same-day dumpster delivery in San Leandro?', answer: `Yes — our Oakland yard is under 15 minutes from most San Leandro addresses. Same-day delivery is available for orders placed before noon. Call ${BUSINESS_INFO.phone.salesFormatted}.` },
      { question: 'What materials are restricted in San Leandro dumpsters?', answer: 'Hazardous materials, paint, batteries, and tires are prohibited. Concrete and dirt require separate heavy-material containers with flat-fee pricing. No weight overage on heavy loads.' },
    ],
  },

  // ── SANTA CLARA ───────────────────────────────
  {
    slug: 'santa-clara',
    name: 'Santa Clara',
    localIntro: `Santa Clara combines tech campus commercial properties with established residential neighborhoods like Old Quad and Bowers. The city's active construction market — driven by tech expansion, residential renovations, and Santa Clara University-adjacent projects — creates strong demand for dumpster rental. Calsan serves Santa Clara directly from our San Jose yard, just minutes away on US-101.`,
    permitNote: `Private property dumpster placement in Santa Clara needs no permit. For public street or right-of-way placement, the City of Santa Clara requires an encroachment permit through the Streets Division. Processing time varies — we recommend applying early if street placement is your only option.`,
    showPermitVerification: false,
    neighborhoods: ['Old Quad', 'Bowers', 'Santa Clara University Area', 'Mission City', 'El Camino Corridor', 'Rivermark', 'North Santa Clara', 'Agnew'],
    zips: ['95050', '95051', '95054'],
    nearbySlugs: ['sunnyvale', 'san-jose', 'cupertino', 'milpitas', 'mountain-view'],
    logisticsNote: 'Dispatched from our San Jose yard — most Santa Clara deliveries arrive within 30–45 minutes.',
    serviceBlocks: [CONSTRUCTION_BLOCK, COMMERCIAL_BLOCK, RESIDENTIAL_BLOCK, HEAVY_BLOCK, ROOFING_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Santa Clara?', answer: 'Driveway placement on your private property needs no permit. Street or sidewalk placement requires an encroachment permit from the City of Santa Clara Streets Division.' },
      { question: 'Can I place a dumpster on the street in Santa Clara?', answer: 'Yes, with a city-issued encroachment permit. Processing times vary, so plan ahead. Driveway placement is faster and avoids the permit process.' },
      { question: 'What size dumpster is best for a remodel in Santa Clara?', answer: 'A 20-yard is the most popular for kitchen and bathroom remodels in Santa Clara. For larger renovations or commercial tenant improvements, a 30 or 40-yard provides the capacity you need.' },
      { question: 'Do you offer same-day dumpster delivery in Santa Clara?', answer: `Same-day delivery is available for Santa Clara when ordered before noon. Our San Jose yard is minutes away. Call ${BUSINESS_INFO.phone.salesFormatted} for scheduling.` },
      { question: 'What materials are restricted in Santa Clara dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and refrigerant-containing appliances are not accepted. Concrete and dirt go in dedicated flat-fee containers.' },
    ],
  },

  // ── SUNNYVALE ─────────────────────────────────
  {
    slug: 'sunnyvale',
    name: 'Sunnyvale',
    localIntro: `Sunnyvale's booming tech economy and established residential neighborhoods create year-round demand for dumpster rental. From home remodels in Cherry Chase and Lakewood Village to commercial build-outs along Mathilda Avenue and Moffett Park, Calsan delivers from our San Jose yard with same-day availability. The city's active ADU construction market makes us a regular partner for Sunnyvale contractors.`,
    permitNote: `Dumpsters on private driveways in Sunnyvale don't need a permit. Public street placement requires a temporary street use permit from the City of Sunnyvale Department of Public Works. We recommend applying at least 3 business days in advance.`,
    showPermitVerification: false,
    neighborhoods: ['Cherry Chase', 'Lakewood Village', 'Ponderosa Park', 'Moffett Park', 'Downtown Sunnyvale', 'Ortega Park', 'Birdland', 'Raynor Park'],
    zips: ['94085', '94086', '94087', '94089'],
    nearbySlugs: ['santa-clara', 'mountain-view', 'cupertino', 'milpitas', 'san-jose'],
    logisticsNote: 'Dispatched from our San Jose yard via US-101 — most Sunnyvale deliveries arrive within 30–45 minutes.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, COMMERCIAL_BLOCK, HEAVY_BLOCK, ROOFING_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Sunnyvale?', answer: 'Not for private property placement. Street or public right-of-way placement in Sunnyvale requires a temporary street use permit from Public Works. Plan for at least 3 business days of processing.' },
      { question: 'Can I place a dumpster on the street in Sunnyvale?', answer: 'Yes, with a temporary street use permit from the city. Most residential streets in Sunnyvale can accommodate a dumpster. Driveway placement is the fastest option.' },
      { question: 'What size dumpster is best for a remodel in Sunnyvale?', answer: 'A 20-yard is the standard choice for Sunnyvale kitchen remodels and ADU construction debris. For larger projects or multi-room renovations, consider a 30-yard.' },
      { question: 'Do you offer same-day dumpster delivery in Sunnyvale?', answer: `Yes — same-day delivery is available for most Sunnyvale addresses when you order before noon. Call ${BUSINESS_INFO.phone.salesFormatted} for current availability.` },
      { question: 'What materials are restricted in Sunnyvale dumpsters?', answer: 'Hazardous materials, paint, batteries, tires, and electronics are prohibited. Concrete and dirt require flat-fee heavy-material containers — no weight overage charges.' },
    ],
  },
];

// ─── LOOKUP HELPER ────────────────────────────────────────────

export function getCityContent(slug: string): CityContent | undefined {
  return CITY_CONTENT.find(c => c.slug === slug);
}
