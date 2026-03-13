// Yard Hub Data — single source of truth for yard authority pages
import { OPERATIONAL_YARDS, BUSINESS_INFO } from './seo';
import { DUMPSTER_SIZES_DATA } from './shared-data';

export interface YardCoverageCity {
  name: string;
  slug: string;
  distanceMiles: number;
  deliveryEstimate: string;
}

export interface YardHubData {
  yardId: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  region: string;
  coverageDescription: string;
  deliverySpeed: string;
  equipmentStored: string[];
  coverageCities: YardCoverageCity[];
  localPermitInfo: string;
  drivewayTips: string;
  prohibitedMaterials: string[];
  constructionRules: string;
  faqs: { question: string; answer: string }[];
}

export const YARD_HUBS: YardHubData[] = [
  {
    yardId: 'oakland',
    slug: 'oakland',
    name: 'Oakland Yard',
    address: '1000 46th Ave, Oakland, CA 94601',
    city: 'Oakland',
    lat: 37.7692,
    lng: -122.2189,
    region: 'East Bay / North Bay',
    coverageDescription: 'Our Oakland yard is the primary hub for the East Bay and North Bay, serving Oakland, Berkeley, Alameda, San Leandro, Hayward, Emeryville, and surrounding communities. With direct freeway access via I-880 and I-580, deliveries from this yard reach most East Bay addresses within 1–3 hours.',
    deliverySpeed: 'Most deliveries from our Oakland yard arrive within 1–3 hours during business hours.',
    equipmentStored: [
      '5-yard roll-off dumpsters (heavy material rated)',
      '8-yard roll-off dumpsters (heavy material rated)',
      '10-yard roll-off dumpsters (heavy material rated)',
      '20-yard roll-off dumpsters (general debris)',
      '30-yard roll-off dumpsters (general debris)',
      '40-yard roll-off dumpsters (general debris)',
      'Hook-lift trucks and roll-off trucks',
      'Driveway protection boards',
    ],
    coverageCities: [
      { name: 'Oakland', slug: 'oakland', distanceMiles: 0, deliveryEstimate: 'Same-day, under 1 hour' },
      { name: 'Berkeley', slug: 'berkeley', distanceMiles: 5, deliveryEstimate: '1–2 hours' },
      { name: 'Alameda', slug: 'alameda', distanceMiles: 4, deliveryEstimate: '1–2 hours' },
      { name: 'San Leandro', slug: 'san-leandro', distanceMiles: 6, deliveryEstimate: '1–2 hours' },
      { name: 'Hayward', slug: 'hayward', distanceMiles: 14, deliveryEstimate: '1–3 hours' },
      { name: 'Emeryville', slug: 'emeryville', distanceMiles: 3, deliveryEstimate: 'Under 1 hour' },
      { name: 'Richmond', slug: 'richmond', distanceMiles: 10, deliveryEstimate: '1–2 hours' },
      { name: 'El Cerrito', slug: 'el-cerrito', distanceMiles: 8, deliveryEstimate: '1–2 hours' },
    ],
    localPermitInfo: 'Most Oakland residential dumpster placements on private property (driveways) do not require a permit. Street placements require an encroachment permit from the City of Oakland Public Works Department. Berkeley and Alameda have similar rules — check with local public works if placing on public streets.',
    drivewayTips: 'We provide plywood boards under all dumpster placements to protect your driveway. For stamped or decorative concrete, let us know in advance so we can use additional protection. Keep the area around the dumpster clear for safe pickup access.',
    prohibitedMaterials: [
      'Hazardous waste (paint, chemicals, solvents)',
      'Asbestos-containing materials',
      'Tires and automotive fluids',
      'Batteries and electronics',
      'Medical / biohazard waste',
      'Refrigerators and appliances with refrigerant (unless drained)',
    ],
    constructionRules: 'Construction debris in Alameda County must be sorted for recycling per CALGreen requirements. At least 65% of construction and demolition waste must be diverted from landfills. We help contractors meet these requirements by routing loads to certified C&D recycling facilities.',
    faqs: [
      { question: 'How quickly can I get a dumpster delivered in Oakland?', answer: 'Most Oakland deliveries happen within 1–3 hours during business hours. Same-day delivery is available for orders placed before 2 PM.' },
      { question: 'Do I need a permit for a dumpster in Oakland?', answer: 'No permit is needed for dumpsters placed on private property like driveways. Street placements require an encroachment permit from Oakland Public Works.' },
      { question: 'What sizes are available from the Oakland yard?', answer: 'We stock 5, 8, 10, 20, 30, 40, and 50 yard dumpsters. Heavy material sizes (5–10 yard) are available for concrete, dirt, and asphalt.' },
      { question: 'Can I rent a dumpster for concrete removal in Oakland?', answer: 'Yes, we offer flat-fee concrete dumpsters in 5, 8, and 10 yard sizes with no weight overage charges for clean concrete.' },
      { question: 'What areas does the Oakland yard serve?', answer: 'We serve Oakland, Berkeley, Alameda, San Leandro, Hayward, Emeryville, Castro Valley, and surrounding East Bay communities.' },
      { question: 'How much does a dumpster rental cost in Oakland?', answer: `Prices start at $${DUMPSTER_SIZES_DATA[0].priceFrom} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard dumpster. Final pricing depends on material type, weight, and delivery location. Get an exact price with our instant quote calculator.` },
    ],
  },
  {
    yardId: 'sanjose',
    slug: 'san-jose',
    name: 'San Jose Yard',
    address: '2071 Ringwood Ave, San Jose, CA 95131',
    city: 'San Jose',
    lat: 37.3861,
    lng: -121.9187,
    region: 'South Bay / Silicon Valley',
    coverageDescription: 'Our San Jose yard is the South Bay and Silicon Valley hub, providing fast dumpster delivery to San Jose, Santa Clara, Sunnyvale, Milpitas, Campbell, and the greater South Bay area. Located near the US-101 and I-880 interchange for rapid access across the region.',
    deliverySpeed: 'Most deliveries from our San Jose yard arrive within 1–3 hours during business hours.',
    equipmentStored: [
      '5-yard roll-off dumpsters (heavy material rated)',
      '8-yard roll-off dumpsters (heavy material rated)',
      '10-yard roll-off dumpsters (heavy material rated)',
      '20-yard roll-off dumpsters (general debris)',
      '30-yard roll-off dumpsters (general debris)',
      '40-yard roll-off dumpsters (general debris)',
      'Hook-lift trucks and roll-off trucks',
      'Driveway protection boards',
    ],
    coverageCities: [
      { name: 'San Jose', slug: 'san-jose', distanceMiles: 0, deliveryEstimate: 'Same-day, under 1 hour' },
      { name: 'Santa Clara', slug: 'santa-clara', distanceMiles: 5, deliveryEstimate: '1–2 hours' },
      { name: 'Sunnyvale', slug: 'sunnyvale', distanceMiles: 9, deliveryEstimate: '1–2 hours' },
      { name: 'Milpitas', slug: 'milpitas', distanceMiles: 6, deliveryEstimate: '1–2 hours' },
      { name: 'Campbell', slug: 'campbell', distanceMiles: 7, deliveryEstimate: '1–2 hours' },
      { name: 'Mountain View', slug: 'mountain-view', distanceMiles: 14, deliveryEstimate: '1–3 hours' },
      { name: 'Cupertino', slug: 'cupertino', distanceMiles: 8, deliveryEstimate: '1–2 hours' },
    ],
    localPermitInfo: 'San Jose does not require a permit for dumpsters placed on private property. For street placements, a temporary encroachment permit from the City of San Jose Department of Transportation is required. Santa Clara and Sunnyvale have similar policies.',
    drivewayTips: 'We provide plywood boards under all dumpster placements to protect your driveway. For stamped or decorative concrete, let us know in advance so we can use additional protection. Keep the area around the dumpster clear for safe pickup access.',
    prohibitedMaterials: [
      'Hazardous waste (paint, chemicals, solvents)',
      'Asbestos-containing materials',
      'Tires and automotive fluids',
      'Batteries and electronics',
      'Medical / biohazard waste',
      'Refrigerators and appliances with refrigerant (unless drained)',
    ],
    constructionRules: 'Santa Clara County requires construction and demolition waste diversion of at least 65% per CALGreen standards. All mixed C&D loads are routed to certified recycling facilities. Contractors should separate clean concrete and dirt for flat-fee pricing.',
    faqs: [
      { question: 'How quickly can I get a dumpster in San Jose?', answer: 'Most San Jose deliveries happen within 1–3 hours during business hours. Same-day delivery is available for orders placed before 2 PM.' },
      { question: 'Do I need a permit for a dumpster in San Jose?', answer: 'No permit is needed for dumpsters on private property. Street placements require a temporary encroachment permit from San Jose DOT.' },
      { question: 'What dumpster sizes are available in San Jose?', answer: 'We stock 5, 8, 10, 20, 30, 40, and 50 yard dumpsters at our San Jose yard for both heavy materials and general debris.' },
      { question: 'Can I rent a dumpster for a roofing project in San Jose?', answer: 'Yes, our 20 and 30 yard dumpsters are popular for roofing projects. Pricing includes delivery, pickup, and disposal at certified facilities.' },
      { question: 'What areas does the San Jose yard serve?', answer: 'We serve San Jose, Santa Clara, Sunnyvale, Milpitas, Campbell, Cupertino, Los Gatos, and surrounding South Bay communities.' },
      { question: 'How much does a dumpster cost in San Jose?', answer: `Prices start at $${DUMPSTER_SIZES_DATA[0].priceFrom} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard dumpster. Get an exact price based on your ZIP code with our instant quote calculator.` },
    ],
  },
  {
    yardId: 'sanfrancisco',
    slug: 'san-francisco',
    name: 'San Francisco Yard',
    address: '1200 17th St, San Francisco, CA 94107',
    city: 'San Francisco',
    lat: 37.7650,
    lng: -122.3964,
    region: 'San Francisco / Peninsula',
    coverageDescription: 'Our San Francisco yard serves the city of San Francisco, Daly City, South San Francisco, and Pacifica. Located in the Potrero Hill / Dogpatch area with quick access to I-280 and US-101, this yard enables rapid delivery across the Peninsula and SF neighborhoods.',
    deliverySpeed: 'Most deliveries from our San Francisco yard arrive within 1–3 hours during business hours.',
    equipmentStored: [
      '5-yard roll-off dumpsters (heavy material rated)',
      '8-yard roll-off dumpsters (heavy material rated)',
      '10-yard roll-off dumpsters (heavy material rated)',
      '20-yard roll-off dumpsters (general debris)',
      '30-yard roll-off dumpsters (general debris)',
      'Hook-lift trucks (compact for SF streets)',
      'Driveway protection boards',
    ],
    coverageCities: [
      { name: 'San Francisco', slug: 'san-francisco', distanceMiles: 0, deliveryEstimate: 'Same-day, under 1 hour' },
      { name: 'Daly City', slug: 'daly-city', distanceMiles: 6, deliveryEstimate: '1–2 hours' },
      { name: 'South San Francisco', slug: 'south-san-francisco', distanceMiles: 8, deliveryEstimate: '1–2 hours' },
      { name: 'Pacifica', slug: 'pacifica', distanceMiles: 12, deliveryEstimate: '1–3 hours' },
      { name: 'San Bruno', slug: 'san-bruno', distanceMiles: 10, deliveryEstimate: '1–2 hours' },
      { name: 'Brisbane', slug: 'brisbane', distanceMiles: 7, deliveryEstimate: '1–2 hours' },
    ],
    localPermitInfo: 'San Francisco requires a Street Space permit from SFMTA for any dumpster placed on a public street or sidewalk. Permits typically take 3–5 business days. Dumpsters on private driveways or within construction sites do not require a permit. We can assist with the permit application process.',
    drivewayTips: 'Many San Francisco properties have limited driveway space or steep grades. We use compact hook-lift trucks that can navigate tight streets. For hillside placements, we ensure the dumpster is properly stabilized. Plywood boards are always provided for driveway protection.',
    prohibitedMaterials: [
      'Hazardous waste (paint, chemicals, solvents)',
      'Asbestos-containing materials',
      'Tires and automotive fluids',
      'Batteries and electronics',
      'Medical / biohazard waste',
      'Refrigerators and appliances with refrigerant (unless drained)',
    ],
    constructionRules: 'San Francisco has some of the strictest C&D recycling mandates in California, requiring 100% diversion of designated materials. We route all SF loads to certified facilities that meet Recology and SF Environment requirements.',
    faqs: [
      { question: 'How quickly can I get a dumpster in San Francisco?', answer: 'Most SF deliveries happen within 1–3 hours during business hours. For street placements, allow time for the SFMTA permit process.' },
      { question: 'Do I need a permit for a dumpster in San Francisco?', answer: 'Dumpsters on private property do not need a permit. Street placements require a Street Space permit from SFMTA, typically 3–5 business days.' },
      { question: 'What sizes are available for San Francisco projects?', answer: 'We stock 5, 8, 10, 20, 30, 40, and 50 yard dumpsters. Our compact hook-lift trucks can navigate tight San Francisco streets.' },
      { question: 'Can you deliver to steep San Francisco hills?', answer: 'Yes, our drivers are experienced with SF terrain. We use stabilization techniques for hillside placements and compact trucks for narrow streets.' },
      { question: 'What areas does the San Francisco yard serve?', answer: 'We serve all San Francisco neighborhoods, Daly City, South San Francisco, Pacifica, and parts of San Mateo County.' },
      { question: 'How much does a dumpster cost in San Francisco?', answer: `Prices start at $${DUMPSTER_SIZES_DATA[0].priceFrom} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard dumpster. SF pricing may include a city surcharge. Get an exact price with our quote calculator.` },
    ],
  },
];

export function getYardHub(slug: string): YardHubData | undefined {
  return YARD_HUBS.find(y => y.slug === slug);
}

export function getYardHubByYardId(yardId: string): YardHubData | undefined {
  return YARD_HUBS.find(y => y.yardId === yardId);
}
