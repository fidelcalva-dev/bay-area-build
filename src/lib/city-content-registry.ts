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
const JUNK_BLOCK = {
  title: 'Junk & Debris Removal',
  description: 'Estate cleanouts, garage purges, and general junk removal. 10–30 yard sizes.',
  link: '/services/junk-debris-dumpsters',
};

// Standard 5-block set for most cities
const STANDARD_SERVICE_BLOCKS = [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, ROOFING_BLOCK, HEAVY_BLOCK, COMMERCIAL_BLOCK];

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
    nearbySlugs: ['oakland', 'emeryville', 'richmond', 'albany', 'el-cerrito'],
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
    permitNote: `Dumpsters on private property in Fremont generally do not need a permit. For public street placement, the City of Fremont requires an encroachment permit through the Engineering Division. We recommend driveway placement whenever possible to keep your project on schedule.`,
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
    permitNote: `Dumpsters on your driveway or private lot in Hayward do not require a permit. Public street placement in Hayward may require a temporary encroachment permit through the city's Public Works department. Contact us for guidance specific to your Hayward address.`,
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
    permitNote: `Dumpsters placed on private driveways or lots in San Leandro do not require a permit. Public street or sidewalk placement may require a temporary encroachment permit from the City of San Leandro Engineering Department. We recommend calling us before placing on a public right-of-way.`,
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
    permitNote: `Dumpsters on private driveways in Sunnyvale do not need a permit. Public street placement requires a temporary street use permit from the City of Sunnyvale Department of Public Works. We recommend applying at least 3 business days in advance.`,
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

  // ── ALAMEDA ───────────────────────────────────
  {
    slug: 'alameda',
    name: 'Alameda',
    localIntro: `Alameda's island geography and historic Victorian housing stock make dumpster logistics unique. The city's tight residential streets around Park Street and Webster Street corridors require experienced drivers who understand island access points. Calsan delivers to Alameda daily from our Oakland yard via the Park Street or Posey Tube bridges — and our drivers know exactly which streets can handle roll-off placement.`,
    permitNote: `Private property placement in Alameda (driveways, rear yards) requires no permit. Street placement on Alameda's public roads requires a temporary encroachment permit from the City of Alameda Public Works. Due to narrow streets and historic district restrictions, we strongly recommend driveway placement when available.`,
    showPermitVerification: false,
    neighborhoods: ['West End', 'East End', 'Park Street District', 'Fernside', 'South Shore', 'Bay Farm Island', 'Gold Coast', 'Central Alameda'],
    zips: ['94501', '94502'],
    nearbySlugs: ['oakland', 'san-leandro', 'berkeley', 'emeryville'],
    logisticsNote: 'Served from our Oakland yard via Park Street Bridge — typical Alameda delivery takes 30–45 minutes. Island logistics require advance scheduling for larger containers.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, ROOFING_BLOCK, HEAVY_BLOCK, JUNK_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Alameda?', answer: 'No permit is needed for placement on your private driveway or lot. Street placement on Alameda Island requires an encroachment permit from Public Works. Due to narrow streets, driveway placement is strongly recommended.' },
      { question: 'Can you deliver to Alameda Island?', answer: `Yes — we deliver to all Alameda neighborhoods including Bay Farm Island daily from our Oakland yard. Our drivers are experienced with island bridge access and tight residential streets. Call ${BUSINESS_INFO.phone.salesFormatted} for scheduling.` },
      { question: 'What size dumpster fits on an Alameda driveway?', answer: 'Most Alameda driveways accommodate a 10 or 20-yard dumpster. Victorian-era homes often have narrower driveways — a 10-yard is safest. For larger projects, we can place a 20–30 yard on the street with a permit.' },
      { question: 'Do you offer same-day delivery to Alameda?', answer: `Same-day delivery is available for most Alameda addresses when ordered before noon. Bridge traffic can affect timing — we recommend morning orders for fastest delivery.` },
      { question: 'What materials are restricted in Alameda dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are not accepted. Concrete and dirt go in dedicated flat-fee containers. The fill line must not be exceeded for safe bridge transport.' },
    ],
  },

  // ── WALNUT CREEK ──────────────────────────────
  {
    slug: 'walnut-creek',
    name: 'Walnut Creek',
    localIntro: `Walnut Creek's affluent residential areas and active commercial district generate strong demand for dumpster rental. High-end home renovations in neighborhoods like Rossmoor, Larkey Park, and Northgate create projects that need reliable debris hauling. The city's proximity to I-680 makes delivery logistics efficient from our Oakland yard, and Walnut Creek's well-maintained infrastructure means driveway placement is straightforward in most neighborhoods.`,
    permitNote: `Private property placement in Walnut Creek requires no permit. Public street or right-of-way placement requires a temporary encroachment permit from the City of Walnut Creek Engineering Division. HOA communities like Rossmoor may have additional placement rules — check with your HOA before scheduling.`,
    showPermitVerification: false,
    neighborhoods: ['Downtown Walnut Creek', 'Rossmoor', 'Larkey Park', 'Northgate', 'Saranap', 'Parkmead', 'Indian Valley', 'Rudgear'],
    zips: ['94595', '94596', '94597', '94598'],
    nearbySlugs: ['concord', 'pleasant-hill', 'lafayette', 'danville', 'oakland'],
    logisticsNote: 'Dispatched from our Oakland yard via I-580/I-680 — most Walnut Creek deliveries arrive within 60–90 minutes.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, ROOFING_BLOCK, COMMERCIAL_BLOCK, HEAVY_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Walnut Creek?', answer: 'No permit is needed for private driveways or lots. Street placement requires a city encroachment permit. HOA communities like Rossmoor may have their own rules — verify before scheduling.' },
      { question: 'Can I place a dumpster in an HOA community in Walnut Creek?', answer: 'Yes, but check your HOA rules first. Rossmoor and other managed communities may restrict placement locations or require advance notice. We can work with your HOA requirements.' },
      { question: 'What size dumpster is best for a Walnut Creek home remodel?', answer: 'Walnut Creek homes are often larger, so a 20 or 30-yard dumpster is typical for kitchen and bathroom remodels. For whole-house renovations, a 30 or 40-yard handles the volume.' },
      { question: 'Do you offer same-day delivery to Walnut Creek?', answer: `Same-day delivery is available when ordered before noon. Our Oakland yard reaches Walnut Creek via I-680 in about 30 minutes. Call ${BUSINESS_INFO.phone.salesFormatted} for current availability.` },
      { question: 'What materials are restricted in Walnut Creek dumpsters?', answer: 'Hazardous materials, paint, batteries, tires, and electronics are prohibited. Concrete and dirt use flat-fee heavy containers. Yard waste and green waste are accepted in general debris containers.' },
    ],
  },

  // ── CONCORD ───────────────────────────────────
  {
    slug: 'concord',
    name: 'Concord',
    localIntro: `Concord is the largest city in Contra Costa County, and its mix of older suburban homes, newer developments near the former Naval Weapons Station, and active commercial corridors along Willow Pass Road drives consistent dumpster rental demand. Calsan serves all Concord neighborhoods from our Oakland yard, with efficient delivery via Highway 4 and I-680. The city's ongoing redevelopment means construction dumpsters are always in demand.`,
    permitNote: `Dumpsters on private property in Concord do not require a permit. Public street placement requires a temporary encroachment permit from the City of Concord Engineering Division. Permits are typically processed within a few business days.`,
    showPermitVerification: false,
    neighborhoods: ['Downtown Concord', 'Clayton Valley', 'Sun Terrace', 'Dana Estates', 'Four Corners', 'Meadow Homes', 'Concord BART Area', 'Todos Santos'],
    zips: ['94518', '94519', '94520', '94521'],
    nearbySlugs: ['walnut-creek', 'pleasant-hill', 'martinez', 'pittsburg', 'clayton'],
    logisticsNote: 'Served from our Oakland yard via Highway 24 and I-680 — typical Concord delivery takes 60–75 minutes.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, HEAVY_BLOCK, ROOFING_BLOCK, COMMERCIAL_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Concord?', answer: 'No permit for private property. Street placement requires an encroachment permit from Concord Engineering. Most permits are processed within a few business days.' },
      { question: 'Can I place a dumpster on the street in Concord?', answer: 'Yes, with a city encroachment permit. Most Concord residential streets can accommodate a roll-off. Driveway placement is faster and permit-free.' },
      { question: 'What size dumpster is best for a remodel in Concord?', answer: 'A 20-yard is the go-to for Concord home remodels. For larger renovation projects or estate cleanouts, a 30-yard provides extra capacity. Concrete jobs use 5–10 yard heavy containers.' },
      { question: 'Do you offer same-day delivery to Concord?', answer: `Same-day delivery is available for Concord addresses when ordered before noon. Call ${BUSINESS_INFO.phone.salesFormatted} to confirm same-day availability.` },
      { question: 'What materials are restricted in Concord dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are not accepted. Concrete and dirt require dedicated heavy-material containers. Mixed loads may be reclassified at the disposal facility.' },
    ],
  },

  // ── PLEASANTON ────────────────────────────────
  {
    slug: 'pleasanton',
    name: 'Pleasanton',
    localIntro: `Pleasanton's upscale residential neighborhoods and family-oriented community create strong demand for renovation and cleanout dumpsters. From Stoneridge-area home upgrades to Kottinger Ranch remodels, the city's well-maintained properties often undergo periodic renovation. Calsan delivers to all Pleasanton neighborhoods from our Oakland yard via I-580, and the Tri-Valley's wide residential streets make dumpster placement straightforward.`,
    permitNote: `Private property dumpster placement in Pleasanton requires no permit. Street placement requires a temporary encroachment permit from the City of Pleasanton Public Works. HOA neighborhoods may have additional restrictions — check with your association before scheduling.`,
    showPermitVerification: false,
    neighborhoods: ['Downtown Pleasanton', 'Stoneridge', 'Kottinger Ranch', 'Ruby Hill', 'Birdland', 'Vintage Hills', 'Laguna Oaks', 'Val Vista'],
    zips: ['94566', '94588'],
    nearbySlugs: ['dublin', 'livermore', 'san-ramon', 'fremont', 'hayward'],
    logisticsNote: 'Served from our Oakland yard via I-580 — typical Pleasanton delivery takes 45–60 minutes.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, ROOFING_BLOCK, HEAVY_BLOCK, JUNK_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Pleasanton?', answer: 'No permit for private driveways or lots. Street placement requires an encroachment permit from Public Works. Some HOA neighborhoods have additional rules — always verify with your association.' },
      { question: 'Can I place a dumpster on the street in Pleasanton?', answer: 'Yes, with a city permit. Pleasanton residential streets are generally wide enough for roll-off placement. Driveway placement is the simplest option and requires no permit.' },
      { question: 'What size dumpster is best for a remodel in Pleasanton?', answer: 'A 20-yard handles most Pleasanton kitchen and bathroom remodels. Larger Tri-Valley homes often need a 30-yard for full renovations. ADU and addition projects typically use 20–30 yard sizes.' },
      { question: 'Do you offer same-day delivery to Pleasanton?', answer: `Same-day delivery is available for most Pleasanton addresses when ordered before noon. We serve the Tri-Valley daily. Call ${BUSINESS_INFO.phone.salesFormatted} for current scheduling.` },
      { question: 'What materials are restricted in Pleasanton dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are prohibited. Concrete and dirt go in flat-fee heavy containers. Clean concrete qualifies for our lowest rate.' },
    ],
  },

  // ── DUBLIN ────────────────────────────────────
  {
    slug: 'dublin',
    name: 'Dublin',
    localIntro: `Dublin's rapid growth along the I-580 corridor — from East Dublin's new communities to the established neighborhoods near Dublin Ranch and Shannon Park — generates steady demand for both construction and residential dumpsters. New home construction, ADU builds, and commercial tenant improvements in the Dublin Village and Transit area keep our trucks busy. Calsan serves Dublin daily from our Oakland yard.`,
    permitNote: `Private property dumpster placement in Dublin (driveways, construction sites) needs no permit. Street placement requires a city encroachment permit from Dublin Public Works. Most Dublin neighborhoods have wide streets that easily accommodate roll-off containers.`,
    showPermitVerification: false,
    neighborhoods: ['Dublin Ranch', 'Shannon Park', 'East Dublin', 'Dublin Village', 'Positano', 'Fallon Village', 'Emerald Glen', 'Iron Horse Trail Area'],
    zips: ['94568'],
    nearbySlugs: ['pleasanton', 'livermore', 'san-ramon', 'fremont', 'hayward'],
    logisticsNote: 'Dispatched from our Oakland yard via I-580 — most Dublin deliveries arrive within 45–60 minutes during business hours.',
    serviceBlocks: [CONSTRUCTION_BLOCK, RESIDENTIAL_BLOCK, HEAVY_BLOCK, COMMERCIAL_BLOCK, ROOFING_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Dublin?', answer: 'No permit needed for private property. Street placement requires an encroachment permit from Dublin Public Works. Most permits are straightforward given Dublin's wide residential streets.' },
      { question: 'Can I place a dumpster on the street in Dublin?', answer: 'Yes, with a city permit. Dublin's newer developments have wider streets that accommodate roll-offs easily. Driveway placement is faster and requires no permit.' },
      { question: 'What size dumpster is best for new construction in Dublin?', answer: 'New construction in Dublin typically requires a 30 or 40-yard dumpster. For remodels and cleanouts, a 20-yard is the most popular choice.' },
      { question: 'Do you offer same-day delivery to Dublin?', answer: `Same-day delivery is available for Dublin addresses when ordered before noon. We serve the entire Tri-Valley daily. Call ${BUSINESS_INFO.phone.salesFormatted}.` },
      { question: 'What materials are restricted in Dublin dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are not accepted. New construction debris (lumber, drywall, shingles) is fine. Concrete and dirt use flat-fee heavy containers.' },
    ],
  },

  // ── LIVERMORE ─────────────────────────────────
  {
    slug: 'livermore',
    name: 'Livermore',
    localIntro: `Livermore's wine country setting belies its active construction and renovation market. From Downtown Livermore's revitalized commercial district to residential communities like Springtown and South Livermore's ranch properties, the city generates consistent dumpster demand. Rural properties and hobby farms in the Livermore Valley often need heavy-material containers for land clearing and concrete removal. Calsan serves Livermore via I-580 from our Oakland yard.`,
    permitNote: `Private property dumpster placement in Livermore does not require a permit. For public street placement, contact the City of Livermore Public Works for encroachment permit requirements. Rural and unincorporated areas near Livermore may fall under Alameda County jurisdiction.`,
    showPermitVerification: false,
    neighborhoods: ['Downtown Livermore', 'Springtown', 'South Livermore', 'Sunset East', 'Sunset West', 'North Livermore', 'Arroyo Seco', 'Del Valle Area'],
    zips: ['94550', '94551'],
    nearbySlugs: ['pleasanton', 'dublin', 'tracy', 'san-ramon'],
    logisticsNote: 'Served from our Oakland yard via I-580 — Livermore is the furthest Tri-Valley city we serve, with typical delivery times of 60–90 minutes.',
    serviceBlocks: [CONSTRUCTION_BLOCK, RESIDENTIAL_BLOCK, HEAVY_BLOCK, ROOFING_BLOCK, JUNK_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Livermore?', answer: 'No permit for private property placement. Street placement requires a city encroachment permit. Properties in unincorporated Alameda County near Livermore may have different requirements.' },
      { question: 'Can I get a dumpster for a rural Livermore property?', answer: 'Yes — we deliver to rural Livermore properties including South Livermore ranches and vineyard areas. Larger containers may require confirmed access for our trucks. Call ahead for rural deliveries.' },
      { question: 'What size dumpster is best for a Livermore remodel?', answer: 'A 20-yard handles most residential remodels. Ranch-style Livermore homes with larger footprints may need a 30-yard. Land clearing and concrete projects use 5–10 yard heavy containers.' },
      { question: 'Do you offer same-day delivery to Livermore?', answer: `Same-day delivery is available for most Livermore addresses when ordered before noon, depending on scheduling. Call ${BUSINESS_INFO.phone.salesFormatted} to check availability.` },
      { question: 'What materials are restricted in Livermore dumpsters?', answer: 'Hazardous waste, paint, batteries, and tires are prohibited. Concrete, dirt, and rock use flat-fee heavy containers. Green waste from vineyard or agricultural clearing is accepted in general debris containers.' },
    ],
  },

  // ── EMERYVILLE ────────────────────────────────
  {
    slug: 'emeryville',
    name: 'Emeryville',
    localIntro: `Emeryville's compact urban footprint between Oakland and Berkeley makes it a unique dumpster rental market. The city's ongoing transformation from industrial to mixed-use means construction and demolition dumpsters are in constant demand. Loft conversions along the Shellmound corridor, tech office build-outs near the Bay Street mall, and residential projects in the Doyle-Hollis neighborhood keep our Oakland yard dispatching to Emeryville daily.`,
    permitNote: `Private property placement in Emeryville requires no permit. Street or public right-of-way placement requires a temporary encroachment permit from the City of Emeryville Public Works. Given Emeryville's compact streets and heavy traffic, we strongly recommend off-street placement when possible.`,
    showPermitVerification: false,
    neighborhoods: ['Shellmound', 'Doyle-Hollis', 'Bay Street Area', 'Triangle', 'Park Avenue District', 'Powell Street Corridor'],
    zips: ['94608'],
    nearbySlugs: ['oakland', 'berkeley', 'albany', 'richmond'],
    logisticsNote: 'Our Oakland yard is less than 10 minutes from Emeryville — the fastest delivery zone in our coverage area.',
    serviceBlocks: [COMMERCIAL_BLOCK, CONSTRUCTION_BLOCK, RESIDENTIAL_BLOCK, HEAVY_BLOCK, JUNK_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Emeryville?', answer: 'No permit for private property. Street placement in Emeryville requires a city encroachment permit. Given the compact street layout, off-street placement is strongly recommended.' },
      { question: 'Can you deliver to tight Emeryville construction sites?', answer: `Yes — our drivers navigate Emeryville's narrow industrial-to-residential streets daily. We can place dumpsters in loading zones, rear lots, and construction staging areas with proper coordination.` },
      { question: 'What size dumpster works for Emeryville loft renovations?', answer: 'Loft conversions and tenant improvements in Emeryville typically need a 20-yard. For full commercial build-outs or demolition, 30–40 yard sizes handle the volume.' },
      { question: 'Do you offer same-day delivery to Emeryville?', answer: `Yes — Emeryville is our fastest delivery zone, just minutes from our Oakland yard. Same-day and sometimes same-hour delivery is available. Call ${BUSINESS_INFO.phone.salesFormatted}.` },
      { question: 'What materials are restricted in Emeryville dumpsters?', answer: 'Hazardous waste, paint, batteries, and tires are not accepted. Construction debris (drywall, lumber, metal) is standard. Concrete uses dedicated flat-fee containers.' },
    ],
  },

  // ── RICHMOND ──────────────────────────────────
  {
    slug: 'richmond',
    name: 'Richmond',
    localIntro: `Richmond's diverse mix of historic neighborhoods, industrial corridors, and waterfront redevelopment drives steady dumpster rental demand. From Hilltop-area residential renovations to Point Richmond's Victorian restorations and Marina Bay's modern development, Calsan serves all Richmond communities from our Oakland yard. The city's industrial heritage means commercial and demolition dumpsters are a regular need along the I-80 corridor.`,
    permitNote: `Private property dumpster placement in Richmond requires no permit. Street placement requires a temporary encroachment permit from the City of Richmond Engineering Services. Industrial zone placement may have different requirements — contact us for guidance.`,
    showPermitVerification: false,
    neighborhoods: ['Point Richmond', 'Marina Bay', 'Hilltop', 'Iron Triangle', 'El Cerrito Hills', 'Atchison Village', 'Pullman', 'Parchester Village'],
    zips: ['94801', '94803', '94804', '94805', '94806'],
    nearbySlugs: ['berkeley', 'el-cerrito', 'san-pablo', 'hercules', 'oakland'],
    logisticsNote: 'Dispatched from our Oakland yard via I-80 — most Richmond deliveries arrive within 30–45 minutes.',
    serviceBlocks: [CONSTRUCTION_BLOCK, RESIDENTIAL_BLOCK, COMMERCIAL_BLOCK, HEAVY_BLOCK, JUNK_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Richmond?', answer: 'No permit for private property. Street placement requires a city encroachment permit from Richmond Engineering Services. Industrial sites may have different placement requirements.' },
      { question: 'Can I place a dumpster on the street in Richmond?', answer: 'Yes, with a city encroachment permit. Most Richmond residential streets can accommodate a dumpster. We recommend driveway placement when available.' },
      { question: 'What size dumpster is best for a remodel in Richmond?', answer: 'A 20-yard handles most residential remodels. Point Richmond Victorian restorations may generate more debris — a 30-yard is common for larger projects. Concrete uses 5–10 yard heavy containers.' },
      { question: 'Do you offer same-day delivery to Richmond?', answer: `Yes — same-day delivery is available for most Richmond addresses when ordered before noon. Our Oakland yard reaches Richmond in under 30 minutes via I-80. Call ${BUSINESS_INFO.phone.salesFormatted}.` },
      { question: 'What materials are restricted in Richmond dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are prohibited. Industrial waste may require special handling — call us to confirm your material type. Concrete and dirt use flat-fee containers.' },
    ],
  },

  // ── REDWOOD CITY ──────────────────────────────
  {
    slug: 'redwood-city',
    name: 'Redwood City',
    localIntro: `Redwood City is the San Mateo County seat and one of the Peninsula's most active construction markets. Downtown Redwood City's condo developments, Woodside Plaza residential renovations, and commercial projects along El Camino Real keep dumpster demand high. Calsan serves Redwood City from our San Jose yard via US-101, and the city's central Peninsula location gives contractors easy access to our scheduling team.`,
    permitNote: `Private property placement in Redwood City requires no permit. Public street placement requires a temporary encroachment permit from the Redwood City Public Works Department. Downtown construction sites may have specific staging requirements — coordinate with us early.`,
    showPermitVerification: false,
    neighborhoods: ['Downtown Redwood City', 'Woodside Plaza', 'Stambaugh-Heller', 'Redwood Shores', 'Farm Hill', 'Roosevelt', 'Friendly Acres', 'Palm Park'],
    zips: ['94061', '94062', '94063', '94065'],
    nearbySlugs: ['san-mateo', 'palo-alto', 'menlo-park', 'san-carlos', 'belmont'],
    logisticsNote: 'Served from our San Jose yard via US-101 — most Redwood City deliveries arrive within 45–60 minutes.',
    serviceBlocks: [CONSTRUCTION_BLOCK, RESIDENTIAL_BLOCK, COMMERCIAL_BLOCK, HEAVY_BLOCK, ROOFING_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Redwood City?', answer: 'No permit for private property placement. Street placement requires a city encroachment permit from Public Works. Downtown construction sites may need additional staging coordination.' },
      { question: 'Can I place a dumpster on the street in Redwood City?', answer: 'Yes, with a city permit. Most residential streets in Redwood City can accommodate a roll-off container. Downtown areas may have time-of-day restrictions.' },
      { question: 'What size dumpster is best for a remodel in Redwood City?', answer: 'A 20-yard is the standard for kitchen and bathroom remodels. Peninsula homes often have multi-level construction that generates extra debris — a 30-yard is common for full renovations.' },
      { question: 'Do you offer same-day delivery to Redwood City?', answer: `Same-day delivery is available for most Redwood City addresses when ordered before noon. Call ${BUSINESS_INFO.phone.salesFormatted} for current scheduling.` },
      { question: 'What materials are restricted in Redwood City dumpsters?', answer: 'Hazardous waste, paint, batteries, and tires are not accepted. Concrete and dirt use flat-fee heavy containers. Demolition debris (drywall, lumber, metal) is accepted in general debris containers.' },
    ],
  },

  // ── SAN MATEO ─────────────────────────────────
  {
    slug: 'san-mateo',
    name: 'San Mateo',
    localIntro: `San Mateo's mix of established residential neighborhoods along the Hillsdale corridor and active commercial development near the Bridgepointe Shopping Center drives year-round dumpster rental demand. The city's housing stock ranges from 1950s ranch homes in Beresford to newer developments near Bay Meadows, creating diverse renovation needs. Calsan delivers to all San Mateo neighborhoods from our San Jose yard via US-101.`,
    permitNote: `Private property dumpster placement in San Mateo requires no permit. Public street placement requires a temporary encroachment permit from the San Mateo Public Works Department. Residential parking zones may have additional restrictions.`,
    showPermitVerification: false,
    neighborhoods: ['Downtown San Mateo', 'Hillsdale', 'Beresford', 'Bay Meadows', 'Fiesta Gardens', 'San Mateo Village', 'Sugarloaf', 'Baywood'],
    zips: ['94401', '94402', '94403', '94404'],
    nearbySlugs: ['redwood-city', 'south-san-francisco', 'burlingame', 'foster-city', 'belmont'],
    logisticsNote: 'Served from our San Jose yard via US-101 — most San Mateo deliveries arrive within 50–70 minutes.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, ROOFING_BLOCK, COMMERCIAL_BLOCK, HEAVY_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in San Mateo?', answer: 'No permit for private driveways or lots. Public street placement requires a city encroachment permit from Public Works. Residential parking zones may have extra restrictions.' },
      { question: 'Can I place a dumpster on the street in San Mateo?', answer: 'Yes, with a city permit. Most San Mateo residential streets accommodate dumpsters. We recommend driveway placement for fastest turnaround.' },
      { question: 'What size dumpster is best for a San Mateo remodel?', answer: 'A 20-yard handles most kitchen and bathroom remodels. Ranch-style homes in Beresford and Hillsdale often generate more debris — consider a 30-yard for larger projects.' },
      { question: 'Do you offer same-day delivery to San Mateo?', answer: `Same-day delivery is available for most San Mateo addresses when ordered before noon. Call ${BUSINESS_INFO.phone.salesFormatted} for current availability.` },
      { question: 'What materials are restricted in San Mateo dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are prohibited. Concrete and dirt go in dedicated flat-fee containers with no weight overage.' },
    ],
  },

  // ── SOUTH SAN FRANCISCO ───────────────────────
  {
    slug: 'south-san-francisco',
    name: 'South San Francisco',
    localIntro: `South San Francisco — "The Industrial City" — lives up to its nickname with a robust biotech corridor and active commercial construction market. Residential neighborhoods like Westborough, Sunshine Gardens, and the Old Town area also generate steady renovation dumpster demand. The city's proximity to SFO and the biotechnology hub along Oyster Point Boulevard means commercial and construction dumpsters are a daily need. Calsan serves SSF from our Oakland yard.`,
    permitNote: `Private property placement in South San Francisco requires no permit. Street placement requires a temporary encroachment permit from the City of South San Francisco Public Works. Biotech corridor locations may have private property management requirements — coordinate with your site manager.`,
    showPermitVerification: false,
    neighborhoods: ['Downtown SSF', 'Westborough', 'Sunshine Gardens', 'Avalon', 'Old Town', 'Oyster Point', 'Lindenville', 'Sign Hill'],
    zips: ['94080', '94083'],
    nearbySlugs: ['san-mateo', 'daly-city', 'san-bruno', 'pacifica', 'colma'],
    logisticsNote: 'Dispatched from our Oakland yard via US-101 — most South San Francisco deliveries arrive within 40–60 minutes.',
    serviceBlocks: [COMMERCIAL_BLOCK, CONSTRUCTION_BLOCK, RESIDENTIAL_BLOCK, HEAVY_BLOCK, ROOFING_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in South San Francisco?', answer: 'No permit for private property. Street placement requires an encroachment permit from Public Works. Biotech and commercial campuses may have their own placement requirements.' },
      { question: 'Can I get a dumpster for a biotech facility in South San Francisco?', answer: 'Yes — we serve commercial and biotech sites throughout SSF, including the Oyster Point corridor. Priority scheduling is available for commercial accounts. Contact us for volume pricing.' },
      { question: 'What size dumpster is best for a remodel in South San Francisco?', answer: 'A 20-yard is standard for residential remodels. Commercial tenant improvements typically need 20–30 yard sizes. For biotech lab decommissioning, call us to discuss material requirements.' },
      { question: 'Do you offer same-day delivery to South San Francisco?', answer: `Yes — same-day delivery is available for most SSF addresses when ordered before noon. Call ${BUSINESS_INFO.phone.salesFormatted} for scheduling.` },
      { question: 'What materials are restricted in South San Francisco dumpsters?', answer: 'Hazardous waste, chemicals, paint, batteries, and tires are not accepted. Biotech materials may require special disposal — call to confirm. Concrete and dirt use flat-fee heavy containers.' },
    ],
  },

  // ── CUPERTINO ─────────────────────────────────
  {
    slug: 'cupertino',
    name: 'Cupertino',
    localIntro: `Cupertino's high-value residential properties and proximity to Apple Park create a distinctive dumpster rental market. Homeowners in neighborhoods like Rancho Rinconada, Monta Vista, and the Garden Gate area invest heavily in remodels, ADU construction, and landscaping projects that require debris hauling. Calsan serves Cupertino from our San Jose yard — just 15 minutes away on I-280 — making same-day delivery routine.`,
    permitNote: `Private property dumpster placement in Cupertino requires no permit. Public street placement requires a temporary encroachment permit from the City of Cupertino Public Works Department. Some Cupertino neighborhoods have narrow streets — driveway placement is strongly recommended.`,
    showPermitVerification: false,
    neighborhoods: ['Rancho Rinconada', 'Monta Vista', 'Garden Gate', 'Homestead Acres', 'South Blaney', 'Oak Valley', 'Cupertino City Center', 'Rancho San Antonio Area'],
    zips: ['95014', '95015'],
    nearbySlugs: ['sunnyvale', 'santa-clara', 'san-jose', 'mountain-view', 'saratoga'],
    logisticsNote: 'Dispatched from our San Jose yard via I-280 — most Cupertino deliveries arrive within 25–40 minutes.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, ROOFING_BLOCK, HEAVY_BLOCK, JUNK_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Cupertino?', answer: 'No permit for private driveways or lots. Street placement requires a city encroachment permit from Public Works. Many Cupertino neighborhoods have narrower streets — driveway placement is recommended.' },
      { question: 'What size dumpster is best for a Cupertino home remodel?', answer: 'A 20-yard handles most kitchen and bathroom remodels. Cupertino homeowners doing full-house renovations or ADU construction typically need a 30-yard. Landscaping projects may use a 10 or 20-yard.' },
      { question: 'Can I place a dumpster on the street in Cupertino?', answer: 'Yes, with a city encroachment permit. Some Cupertino streets are narrow — we recommend measuring your driveway first. Our team can advise on the best placement option.' },
      { question: 'Do you offer same-day delivery to Cupertino?', answer: `Yes — same-day delivery is available for Cupertino when ordered before noon. Our San Jose yard is just 15 minutes away. Call ${BUSINESS_INFO.phone.salesFormatted}.` },
      { question: 'What materials are restricted in Cupertino dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are not accepted. Concrete, dirt, and rock use flat-fee heavy containers. Green waste and yard debris are accepted in general debris containers.' },
    ],
  },

  // ── DALY CITY ─────────────────────────────────
  {
    slug: 'daly-city',
    name: 'Daly City',
    localIntro: `Daly City is the most densely populated city in San Mateo County, and its tightly packed residential neighborhoods create unique dumpster placement challenges. Homes along Westlake, Broadmoor Village, and the Serramonte area — many built in the 1940s–60s — frequently undergo renovation, driving demand for residential dumpster rentals. Calsan serves Daly City from our Oakland yard, with drivers experienced in the city's steep hillside driveways and narrow streets.`,
    permitNote: `Private property placement in Daly City requires no permit. Street placement requires a temporary encroachment permit from Daly City Public Works. Due to narrow, hilly streets, we strongly recommend driveway placement. Some Daly City streets may not accommodate roll-off trucks — call ahead to verify.`,
    showPermitVerification: false,
    neighborhoods: ['Westlake', 'Broadmoor Village', 'Serramonte', 'Original Daly City', 'Hillside', 'Crocker', 'Colma BART Area', 'Top of the Hill'],
    zips: ['94014', '94015', '94017'],
    nearbySlugs: ['south-san-francisco', 'san-francisco', 'pacifica', 'colma', 'san-bruno'],
    logisticsNote: 'Served from our Oakland yard via I-280 — most Daly City deliveries arrive within 40–60 minutes. Steep driveways may require advance assessment.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, ROOFING_BLOCK, HEAVY_BLOCK, JUNK_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Daly City?', answer: 'No permit for private driveways or lots. Street placement requires a city encroachment permit from Public Works. Due to narrow, hilly streets, we strongly recommend driveway placement when possible.' },
      { question: 'Can you deliver to steep Daly City driveways?', answer: 'Yes — our drivers are experienced with Daly City hillside driveways. For very steep or narrow access, we recommend calling ahead so we can assess placement. A smaller dumpster (10 or 20-yard) may fit better.' },
      { question: 'What size dumpster is best for a Daly City home remodel?', answer: 'A 20-yard is standard for Daly City kitchen and bathroom remodels. For tighter driveways, a 10-yard may be more practical. Full renovations typically need a 30-yard.' },
      { question: 'Do you offer same-day delivery to Daly City?', answer: `Same-day delivery is available for most Daly City addresses when ordered before noon. Call ${BUSINESS_INFO.phone.salesFormatted} to confirm accessibility for your address.` },
      { question: 'What materials are restricted in Daly City dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are prohibited. Concrete and dirt use flat-fee heavy containers. The fill line must not be exceeded — especially important for safe transport on Daly City hills.' },
    ],
  },

  // ── MOUNTAIN VIEW ─────────────────────────────
  {
    slug: 'mountain-view',
    name: 'Mountain View',
    localIntro: `Mountain View's Google campus presence and active residential renovation market drive strong dumpster rental demand. From Old Mountain View's charming bungalow renovations to North Bayshore commercial construction and Cuesta Park-area home remodels, the city generates diverse debris hauling needs. Calsan delivers from our San Jose yard — just 20 minutes away — with same-day availability for most Mountain View addresses.`,
    permitNote: `Private property placement in Mountain View requires no permit. Public street placement requires a temporary street use permit from the City of Mountain View Public Works. Downtown Mountain View and areas near Google campus may have specific staging restrictions.`,
    showPermitVerification: false,
    neighborhoods: ['Old Mountain View', 'Cuesta Park', 'Rex Manor', 'Monta Loma', 'North Bayshore', 'Sylvan Park', 'Waverly Park', 'Shoreline West'],
    zips: ['94040', '94041', '94043'],
    nearbySlugs: ['sunnyvale', 'palo-alto', 'los-altos', 'santa-clara', 'cupertino'],
    logisticsNote: 'Dispatched from our San Jose yard via US-101 — most Mountain View deliveries arrive within 25–40 minutes.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, COMMERCIAL_BLOCK, HEAVY_BLOCK, ROOFING_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Mountain View?', answer: 'No permit for private property. Street placement requires a temporary street use permit from Public Works. Downtown and North Bayshore areas may have additional restrictions.' },
      { question: 'Can I place a dumpster on the street in Mountain View?', answer: 'Yes, with a city permit. Most Mountain View residential streets can accommodate roll-off containers. Driveway placement is the fastest option and requires no permit.' },
      { question: 'What size dumpster is best for a Mountain View home remodel?', answer: 'A 20-yard is the go-to for Mountain View kitchen and bathroom remodels. Bungalow and ranch-home renovations often generate more debris than expected — a 30-yard gives extra margin.' },
      { question: 'Do you offer same-day delivery to Mountain View?', answer: `Yes — same-day delivery is available for most Mountain View addresses when ordered before noon. Call ${BUSINESS_INFO.phone.salesFormatted} for current scheduling.` },
      { question: 'What materials are restricted in Mountain View dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are not accepted. Concrete and dirt use flat-fee heavy containers. Green waste and landscaping debris are accepted in general debris containers.' },
    ],
  },

  // ── PALO ALTO ─────────────────────────────────
  {
    slug: 'palo-alto',
    name: 'Palo Alto',
    localIntro: `Palo Alto's high-value properties and active renovation market make it one of the Bay Area's most demanding dumpster rental markets. From Crescent Park estate remodels to Professorville historic renovations, College Terrace ADU construction, and University Avenue commercial build-outs, the city's projects demand reliable, on-time debris hauling. Calsan serves Palo Alto from our San Jose yard with same-day capability.`,
    permitNote: `Private property dumpster placement in Palo Alto requires no permit. Street placement requires a temporary encroachment permit from the City of Palo Alto Public Works. Historic districts may have additional aesthetic or placement requirements. HOA-governed properties should verify rules before scheduling.`,
    showPermitVerification: false,
    neighborhoods: ['Crescent Park', 'Professorville', 'College Terrace', 'Old Palo Alto', 'Barron Park', 'Charleston Meadows', 'Midtown', 'Downtown University Ave'],
    zips: ['94301', '94303', '94304', '94306'],
    nearbySlugs: ['mountain-view', 'menlo-park', 'redwood-city', 'los-altos', 'stanford'],
    logisticsNote: 'Dispatched from our San Jose yard via I-280 — most Palo Alto deliveries arrive within 30–45 minutes.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, COMMERCIAL_BLOCK, ROOFING_BLOCK, HEAVY_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Palo Alto?', answer: 'No permit for private property. Street placement requires a city encroachment permit from Public Works. Historic districts like Professorville may have additional placement restrictions.' },
      { question: 'Can I place a dumpster on the street in Palo Alto?', answer: 'Yes, with a city permit. Most Palo Alto residential streets can accommodate a dumpster. Street cleaning schedules and neighborhood rules may affect timing.' },
      { question: 'What size dumpster is best for a Palo Alto home remodel?', answer: 'A 20-yard is standard for kitchen and bathroom remodels. Palo Alto homes are often larger — full renovations typically need a 30-yard. Estate-scale projects may require 40-yard containers.' },
      { question: 'Do you offer same-day delivery to Palo Alto?', answer: `Yes — same-day delivery is available for most Palo Alto addresses when ordered before noon. Call ${BUSINESS_INFO.phone.salesFormatted} for scheduling.` },
      { question: 'What materials are restricted in Palo Alto dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are prohibited. Concrete and dirt use flat-fee heavy containers. Historic home materials (lead paint debris) require special handling — call to discuss.' },
    ],
  },

  // ── SAN RAFAEL ────────────────────────────────
  {
    slug: 'san-rafael',
    name: 'San Rafael',
    localIntro: `San Rafael is the largest city in Marin County and the gateway to North Bay dumpster service. The city's mix of downtown commercial properties, hillside residential neighborhoods, and the Canal District's dense housing creates diverse dumpster needs. From Terra Linda remodels to Dominican-area estate cleanouts and Fourth Street commercial renovations, Calsan provides North Bay coverage through our Oakland yard with bridge-accessible delivery via the Richmond-San Rafael Bridge.`,
    permitNote: `Private property placement in San Rafael requires no permit. Street placement requires a temporary encroachment permit from the City of San Rafael Department of Public Works. Hillside streets and narrow Marin roads may limit placement options — call ahead for assessment.`,
    showPermitVerification: true,
    neighborhoods: ['Downtown San Rafael', 'Terra Linda', 'Dominican', 'Canal District', 'Gerstle Park', 'Sun Valley', 'Lincoln-San Rafael Hill', 'Loch Lomond'],
    zips: ['94901', '94903', '94912', '94913'],
    nearbySlugs: ['mill-valley', 'novato', 'san-anselmo', 'larkspur', 'corte-madera'],
    logisticsNote: 'Served from our Oakland yard via the Richmond-San Rafael Bridge — typical delivery takes 45–60 minutes. Bridge toll is included in your rate.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, ROOFING_BLOCK, HEAVY_BLOCK, COMMERCIAL_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in San Rafael?', answer: 'No permit for private property. Street placement requires a city encroachment permit from Public Works. Hillside streets may have limited placement options — our team can advise.' },
      { question: 'Can you deliver across the Richmond-San Rafael Bridge?', answer: `Yes — we cross the bridge daily to serve San Rafael and Marin County. Bridge toll is included in your rate — no surprises. Call ${BUSINESS_INFO.phone.salesFormatted} for scheduling.` },
      { question: 'What size dumpster is best for a San Rafael remodel?', answer: 'A 20-yard handles most Marin County home remodels. San Rafael hillside homes may have access limitations — a 10-yard fits narrow driveways while a 30-yard is ideal for larger renovations.' },
      { question: 'Do you offer same-day delivery to San Rafael?', answer: `Same-day delivery is available for most San Rafael addresses when ordered before noon. Bridge traffic may affect delivery windows during commute hours.` },
      { question: 'What materials are restricted in San Rafael dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are not accepted. Concrete and dirt use flat-fee heavy containers. Marin County disposal rates may apply to certain materials.' },
    ],
  },

  // ── SANTA ROSA ────────────────────────────────
  {
    slug: 'santa-rosa',
    name: 'Santa Rosa',
    localIntro: `Santa Rosa is the largest city in Sonoma County and the hub of our North Bay partner market. Post-fire rebuilding efforts, ongoing residential development in the Fountaingrove and Coffey Park areas, and commercial growth along the Santa Rosa Avenue corridor create strong dumpster rental demand. Calsan partners with local haulers to serve Santa Rosa while maintaining our quality and pricing standards for North Bay customers.`,
    permitNote: `Private property placement in Santa Rosa requires no permit. Street placement requires a temporary encroachment permit from the City of Santa Rosa Transportation & Public Works. Fire-rebuild zones may have specific staging requirements — contact us for guidance.`,
    showPermitVerification: false,
    neighborhoods: ['Fountaingrove', 'Coffey Park', 'Railroad Square', 'Montgomery Village', 'Rincon Valley', 'Bennett Valley', 'Downtown Santa Rosa', 'Roseland'],
    zips: ['95401', '95403', '95404', '95405', '95407', '95409'],
    nearbySlugs: ['petaluma', 'rohnert-park', 'windsor', 'sebastopol', 'napa'],
    logisticsNote: 'Served through our North Bay partner network — typical delivery within 24 hours of scheduling. Same-day may be available based on partner availability.',
    serviceBlocks: [CONSTRUCTION_BLOCK, RESIDENTIAL_BLOCK, ROOFING_BLOCK, HEAVY_BLOCK, JUNK_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Santa Rosa?', answer: 'No permit for private property. Street placement requires a city encroachment permit from Transportation & Public Works. Fire-rebuild zones may have specific requirements.' },
      { question: 'Can I place a dumpster on the street in Santa Rosa?', answer: 'Yes, with a city permit. Most Santa Rosa residential streets can accommodate roll-off containers. Driveway placement is always the fastest option.' },
      { question: 'What size dumpster is best for a Santa Rosa fire-rebuild project?', answer: 'Fire-rebuild and new construction projects in Santa Rosa typically require 30 or 40-yard dumpsters. For smaller residential remodels, a 20-yard is standard.' },
      { question: 'Do you offer same-day delivery to Santa Rosa?', answer: `Same-day delivery to Santa Rosa depends on partner availability. Most deliveries are completed within 24 hours. Call ${BUSINESS_INFO.phone.salesFormatted} for scheduling.` },
      { question: 'What materials are restricted in Santa Rosa dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are not accepted. Fire debris may require special handling — contact us to discuss your project. Concrete uses flat-fee containers.' },
    ],
  },

  // ── PETALUMA ──────────────────────────────────
  {
    slug: 'petaluma',
    name: 'Petaluma',
    localIntro: `Petaluma's charming downtown, agricultural heritage, and growing residential areas create a distinctive dumpster rental market in southern Sonoma County. Historic Victorian renovations along the Petaluma River corridor, new development in East Petaluma, and rural property cleanouts drive consistent demand. Calsan serves Petaluma through our North Bay partner network while maintaining quality standards and transparent pricing.`,
    permitNote: `Private property placement in Petaluma requires no permit. Street placement requires a temporary encroachment permit from the City of Petaluma Department of Public Works & Utilities. Downtown historic district may have additional placement restrictions.`,
    showPermitVerification: false,
    neighborhoods: ['Downtown Petaluma', 'East Petaluma', 'West Petaluma', 'McNear Landing', 'Petaluma Marina', 'Casa Grande', 'Old East Side', 'Mountain View Area'],
    zips: ['94952', '94954'],
    nearbySlugs: ['santa-rosa', 'novato', 'rohnert-park', 'san-rafael', 'napa'],
    logisticsNote: 'Served through our North Bay partner network — typical delivery within 24 hours of scheduling.',
    serviceBlocks: [RESIDENTIAL_BLOCK, CONSTRUCTION_BLOCK, HEAVY_BLOCK, ROOFING_BLOCK, JUNK_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Petaluma?', answer: 'No permit for private property. Street placement requires a city encroachment permit. The downtown historic district may have additional placement rules.' },
      { question: 'Can I place a dumpster on the street in Petaluma?', answer: 'Yes, with a city permit. Most Petaluma residential streets are wide enough for roll-off placement. Driveway placement is the simplest option.' },
      { question: 'What size dumpster is best for a Petaluma home remodel?', answer: 'A 20-yard handles most Petaluma remodels. Victorian-era home renovations often generate more debris — a 30-yard gives extra capacity for plaster, lathe, and old framing.' },
      { question: 'Do you offer same-day delivery to Petaluma?', answer: `Same-day delivery to Petaluma depends on partner availability. Most deliveries complete within 24 hours. Call ${BUSINESS_INFO.phone.salesFormatted} for scheduling.` },
      { question: 'What materials are restricted in Petaluma dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are not accepted. Agricultural waste may have specific handling requirements — call to discuss. Concrete uses flat-fee containers.' },
    ],
  },

  // ── NAPA ──────────────────────────────────────
  {
    slug: 'napa',
    name: 'Napa',
    localIntro: `Napa's wine country economy extends beyond vineyards — the city's residential renovation market, downtown commercial development, and hospitality construction drive consistent dumpster demand. From the Oxbow District's commercial build-outs to Browns Valley home remodels and Silverado residential projects, Calsan serves Napa through our North Bay partner network. Earthquake retrofit and fire-resilience upgrades add to the city's renovation activity.`,
    permitNote: `Private property placement in Napa requires no permit. Street placement requires a temporary encroachment permit from the City of Napa Public Works. Winery and vineyard properties outside city limits fall under Napa County jurisdiction — contact us for rural property guidance.`,
    showPermitVerification: false,
    neighborhoods: ['Downtown Napa', 'Oxbow District', 'Browns Valley', 'Silverado', 'Alta Heights', 'Bel Aire', 'Old Town', 'Westwood'],
    zips: ['94558', '94559'],
    nearbySlugs: ['vallejo', 'american-canyon', 'sonoma', 'fairfield', 'petaluma'],
    logisticsNote: 'Served through our North Bay partner network — typical delivery within 24 hours. Winery and rural properties may require advance scheduling.',
    serviceBlocks: [CONSTRUCTION_BLOCK, RESIDENTIAL_BLOCK, COMMERCIAL_BLOCK, HEAVY_BLOCK, JUNK_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Napa?', answer: 'No permit for private property. Street placement requires a city encroachment permit from Public Works. Properties outside city limits fall under Napa County jurisdiction.' },
      { question: 'Can I get a dumpster for a Napa winery or vineyard property?', answer: 'Yes — we serve winery and vineyard properties throughout the Napa Valley. Rural access may require advance scheduling for larger containers. Contact us for rural property logistics.' },
      { question: 'What size dumpster is best for a Napa home remodel?', answer: 'A 20-yard is standard for residential remodels. Napa homes undergoing earthquake retrofit may need 10–20 yard sizes. Commercial hospitality projects typically use 30–40 yard containers.' },
      { question: 'Do you offer same-day delivery to Napa?', answer: `Same-day delivery to Napa depends on partner availability. Most deliveries complete within 24 hours. Call ${BUSINESS_INFO.phone.salesFormatted} for scheduling.` },
      { question: 'What materials are restricted in Napa dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are not accepted. Wine barrel debris and vineyard materials are accepted in general debris containers. Concrete uses flat-fee containers.' },
    ],
  },

  // ── VALLEJO ───────────────────────────────────
  {
    slug: 'vallejo',
    name: 'Vallejo',
    localIntro: `Vallejo sits at the gateway between the East Bay and North Bay, making it a strategically important market for dumpster rental. The city's waterfront redevelopment along Mare Island, residential renovation activity in Glen Cove and Hiddenbrooke, and ongoing commercial construction create diverse debris hauling needs. Calsan serves Vallejo from our Oakland yard via I-80 — one of our most efficient North Bay delivery routes.`,
    permitNote: `Private property placement in Vallejo requires no permit. Street placement requires a temporary encroachment permit from the City of Vallejo Public Works. Mare Island development area may have specific staging requirements from the site management team.`,
    showPermitVerification: false,
    neighborhoods: ['Downtown Vallejo', 'Glen Cove', 'Hiddenbrooke', 'Mare Island', 'South Vallejo', 'North Vallejo', 'Vallejo Heights', 'Blue Rock Springs'],
    zips: ['94589', '94590', '94591', '94592'],
    nearbySlugs: ['benicia', 'american-canyon', 'napa', 'hercules', 'richmond'],
    logisticsNote: 'Dispatched from our Oakland yard via I-80 — most Vallejo deliveries arrive within 40–55 minutes. One of our most efficient North Bay routes.',
    serviceBlocks: [CONSTRUCTION_BLOCK, RESIDENTIAL_BLOCK, COMMERCIAL_BLOCK, HEAVY_BLOCK, JUNK_BLOCK],
    faqs: [
      { question: 'Do I need a permit for a dumpster in Vallejo?', answer: 'No permit for private property. Street placement requires a city encroachment permit from Public Works. Mare Island locations may have site-specific staging rules.' },
      { question: 'Can I place a dumpster on the street in Vallejo?', answer: 'Yes, with a city permit. Most Vallejo residential streets can accommodate a dumpster. We recommend driveway placement for fastest delivery.' },
      { question: 'What size dumpster is best for a Vallejo remodel?', answer: 'A 20-yard handles most Vallejo residential remodels. For Mare Island development projects or commercial construction, 30–40 yard sizes are common.' },
      { question: 'Do you offer same-day delivery to Vallejo?', answer: `Yes — same-day delivery is available for most Vallejo addresses when ordered before noon. Vallejo is one of our fastest North Bay delivery zones. Call ${BUSINESS_INFO.phone.salesFormatted}.` },
      { question: 'What materials are restricted in Vallejo dumpsters?', answer: 'Hazardous waste, paint, batteries, tires, and electronics are not accepted. Mare Island renovation debris (lead paint, asbestos) requires special handling — call to discuss. Concrete uses flat-fee containers.' },
    ],
  },
];

// ─── LOOKUP HELPER ────────────────────────────────────────────

export function getCityContent(slug: string): CityContent | undefined {
  return CITY_CONTENT.find(c => c.slug === slug);
}
