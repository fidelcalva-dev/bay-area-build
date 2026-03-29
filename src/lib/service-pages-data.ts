// Service Pages Data — Single source of truth for /services/:slug pages
import type { FAQItem } from '@/components/seo/PageFAQ';

export interface ServicePageData {
  slug: string;
  /** Primary keyword — used in title, H1, schema */
  keyword: string;
  title: string;
  metaDescription: string;
  h1: string;
  heroSubheadline: string;
  heroCta: string;
  /** Short intro paragraph */
  intro: string;
  /** "Best for" project types */
  bestFor: string[];
  /** Recommended dumpster sizes (yard values) */
  recommendedSizes: number[];
  /** Why this size recommendation? */
  sizeGuidance: string;
  /** Delivery / pickup / timing notes */
  deliveryNotes: string[];
  /** What affects price */
  pricingFactors: string[];
  /** Materials allowed */
  materialsAllowed: string[];
  /** Materials restricted or prohibited */
  materialsRestricted: string[];
  /** Permit / placement guidance */
  permitNote: string;
  faqs: FAQItem[];
  /** Schema service type */
  schemaServiceType: string;
}

export const SERVICE_PAGES: ServicePageData[] = [
  {
    slug: 'construction-dumpsters',
    keyword: 'construction dumpster rental Bay Area',
    title: 'Construction Dumpster Rental Bay Area',
    metaDescription: 'Rent construction dumpsters in Oakland, San Jose & SF. 10–50 yard roll-offs for job sites. Same-day delivery, transparent pricing, local yards. Get your quote.',
    h1: 'Construction Dumpster Rental in the Bay Area',
    heroSubheadline: 'Roll-off dumpsters sized for active job sites — delivered from local yards in Oakland, San Jose, and San Francisco.',
    heroCta: 'Get Your Construction Quote',
    intro: 'Active construction sites generate debris fast. We deliver 10–50 yard roll-off dumpsters directly to your job site from our Bay Area yards. No brokers, no surprise fees — just reliable containers ready when your crew needs them.',
    bestFor: [
      'New construction and ground-up builds',
      'Tenant improvements and commercial build-outs',
      'Foundation and structural demolition',
      'Multi-phase renovation projects',
      'Framing, drywall, and finish debris',
    ],
    recommendedSizes: [10, 20, 30, 40, 50],
    sizeGuidance: 'Most active construction sites use 20–40 yard dumpsters. Multi-trade projects often need scheduled swaps. Call us to set up a rotation schedule.',
    deliveryNotes: [
      'Same-day delivery available for orders placed before noon',
      'Standard 7-day rental period, extensions at $35/day',
      'Scheduled pickups and swap-outs for ongoing projects',
      'Morning, midday, and afternoon delivery windows',
    ],
    pricingFactors: [
      'Dumpster size (10–50 yards)',
      'Material type (general debris vs. heavy/inert)',
      'Distance from our yard to your site',
      'Rental duration beyond the included 7 days',
      'Weight overages beyond included tonnage',
    ],
    materialsAllowed: [
      'Wood, framing lumber, plywood',
      'Drywall and sheetrock',
      'Concrete, brick, block (5–10 yard only)',
      'Metal, pipe, conduit',
      'Roofing shingles and felt',
      'Carpet, flooring, tile',
    ],
    materialsRestricted: [
      'Hazardous waste, chemicals, and solvents',
      'Paint cans (must be dry/empty)',
      'Asbestos-containing materials',
      'Pressurized tanks or cylinders',
      'Electronics and batteries',
    ],
    permitNote: 'If the dumpster goes on your private property (driveway, lot), no permit is typically needed. Street placement may require a city encroachment permit — we can help you navigate the process.',
    faqs: [
      { question: 'What size dumpster do I need for a construction site?', answer: 'Most construction sites use 20–40 yard dumpsters. A 20-yard handles single-room renovations, while 30–40 yard containers work for full build-outs and demolition. We can schedule swaps for multi-phase projects.' },
      { question: 'Can I put concrete and dirt in a construction dumpster?', answer: 'Yes — but heavy materials like concrete, dirt, brick, and block require our heavy-material containers (5, 8, or 10 yard only) with flat-rate pricing. Mixing heavy materials into a general debris dumpster will result in reclassification charges.' },
      { question: 'Do you offer same-day delivery for construction projects?', answer: 'Yes. Orders placed before noon can receive same-day delivery. A $100 same-day surcharge applies. Standard orders are typically delivered next business day.' },
      { question: 'How long can I keep the dumpster on site?', answer: 'Standard rental includes 7 days. Extensions are $35/day. For ongoing projects, we offer scheduled swap-outs so you always have an empty container ready.' },
      { question: 'Do I need a permit to place a dumpster at my job site?', answer: 'If the dumpster is on private property, no permit is usually needed. Street or public right-of-way placement typically requires a city encroachment permit. Contact your local public works department or ask us for guidance.' },
    ],
    schemaServiceType: 'Construction Dumpster Rental',
  },
  {
    slug: 'roofing-dumpsters',
    keyword: 'roofing dumpster rental Bay Area',
    title: 'Roofing Dumpster Rental Bay Area',
    metaDescription: 'Dumpsters for roofing tear-offs in Oakland, San Jose & SF. 10–30 yard roll-offs for shingles, felt, and decking. Same-day delivery available.',
    h1: 'Roofing Dumpster Rental in the Bay Area',
    heroSubheadline: 'Purpose-sized dumpsters for roof tear-offs and re-roofing projects — delivered to your job site from our local yards.',
    heroCta: 'Get Your Roofing Quote',
    intro: 'Roofing debris is heavy and bulky. Our 10–30 yard roll-off dumpsters handle shingles, underlayment, decking, and flashing without weight surprises. We deliver from yards in Oakland, San Jose, and San Francisco.',
    bestFor: [
      'Residential roof tear-offs and replacements',
      'Commercial re-roofing projects',
      'Storm damage cleanup',
      'Gutter and fascia replacement debris',
      'Multi-layer shingle removal',
    ],
    recommendedSizes: [10, 20, 30],
    sizeGuidance: 'A 20-yard dumpster handles most residential roofs up to 2,500 sq ft. Larger homes or multi-layer tear-offs may need a 30-yard. Shingles are heavy — tonnage matters more than volume.',
    deliveryNotes: [
      'Same-day delivery available (orders before noon)',
      'Standard 7-day rental — most roofing jobs finish in 2–3 days',
      'Dumpster placed close to the work area for easy loading',
      'Next-day pickup available after completion',
    ],
    pricingFactors: [
      'Dumpster size (10, 20, or 30 yard)',
      'Weight of roofing materials — shingles are dense',
      'Number of roof layers being removed',
      'Distance from our yard to your site',
      'Rental duration beyond the included 7 days',
    ],
    materialsAllowed: [
      'Asphalt shingles',
      'Wood shakes and cedar shingles',
      'Roofing felt and underlayment',
      'Plywood and OSB decking',
      'Flashing, vents, and ridge caps',
      'Gutters and downspouts',
    ],
    materialsRestricted: [
      'Asbestos shingles (requires special abatement)',
      'Tar or hot-mop materials in liquid form',
      'Paint, solvents, and chemicals',
      'Household trash mixed with roofing debris',
    ],
    permitNote: 'Most roofing dumpsters are placed in the driveway — no permit needed. If you need street placement due to access constraints, contact your city\'s public works department for a temporary permit.',
    faqs: [
      { question: 'What size dumpster do I need for a roof tear-off?', answer: 'For most residential roofs (up to 2,500 sq ft, single layer), a 20-yard dumpster is ideal. Multi-layer roofs or homes over 3,000 sq ft typically need a 30-yard. Call us and we\'ll help you calculate.' },
      { question: 'How heavy are roofing shingles?', answer: 'A standard bundle of asphalt shingles weighs 60–80 lbs. A 2,000 sq ft roof generates roughly 2–3 tons of shingles alone. Our included tonnage is designed for typical roofing loads.' },
      { question: 'Can roofers throw shingles directly into the dumpster?', answer: 'Yes — we place the dumpster as close to the structure as possible. Many roofers slide debris directly off the roof into the container. Just stay within the fill line for safe transport.' },
      { question: 'How quickly can you deliver a roofing dumpster?', answer: 'Same-day delivery is available for orders placed before noon ($100 surcharge). Standard delivery is next business day with your choice of morning, midday, or afternoon window.' },
    ],
    schemaServiceType: 'Roofing Dumpster Rental',
  },
  {
    slug: 'residential-dumpsters',
    keyword: 'residential dumpster rental Bay Area',
    title: 'Residential Dumpster Rental Bay Area',
    metaDescription: 'Rent residential dumpsters for home cleanouts, renovations & yard work in Oakland, San Jose & SF. 5–30 yard sizes. Transparent pricing. Local delivery.',
    h1: 'Residential Dumpster Rental in the Bay Area',
    heroSubheadline: 'Driveway-friendly dumpsters for home projects — cleanouts, remodels, and yard work. Delivered from local yards.',
    heroCta: 'Get Your Home Project Quote',
    intro: 'Whether you\'re cleaning out a garage, remodeling a kitchen, or tackling a backyard project, our residential dumpsters fit in standard driveways and come with straightforward pricing. No hidden fees, no broker markups.',
    bestFor: [
      'Home cleanouts and decluttering',
      'Garage, attic, and basement cleanouts',
      'Kitchen and bathroom remodels',
      'Yard waste and landscaping debris',
      'Estate cleanouts and downsizing',
      'Moving and junk removal projects',
    ],
    recommendedSizes: [5, 8, 10, 20, 30],
    sizeGuidance: 'Most homeowners choose a 10 or 20-yard dumpster. A 10-yard fits in tight driveways and handles single-room projects. A 20-yard is our most popular size for whole-room renovations and large cleanouts.',
    deliveryNotes: [
      'Driveway-friendly delivery — we protect your surface',
      'Standard 7-day rental, extensions available',
      'Same-day delivery for urgent cleanouts (before noon)',
      'We call before delivery to confirm placement',
    ],
    pricingFactors: [
      'Dumpster size (5–30 yards)',
      'Type of debris (household vs. heavy materials)',
      'Your ZIP code and distance from our yard',
      'Rental duration beyond the standard 7 days',
      'Special items like mattresses ($50 each) or appliances with freon ($75)',
    ],
    materialsAllowed: [
      'Furniture and household items',
      'Wood, drywall, and carpet',
      'Yard waste, branches, and sod',
      'Appliances (without freon — or $75 fee for freon units)',
      'Clothing, boxes, and general junk',
    ],
    materialsRestricted: [
      'Hazardous waste and chemicals',
      'Paint (must be dry/empty cans)',
      'Electronics (TVs, monitors, computers)',
      'Batteries and fluorescent bulbs',
      'Medical waste',
    ],
    permitNote: 'Placing a dumpster in your driveway does not require a permit in most Bay Area cities. If you need street placement, check with your city\'s public works office — we can point you in the right direction.',
    faqs: [
      { question: 'What size dumpster do I need for a home cleanout?', answer: 'A 10-yard dumpster handles most single-room cleanouts (garage, bedroom, attic). For whole-house cleanouts or estate downsizing, a 20 or 30-yard is more practical.' },
      { question: 'Will a dumpster damage my driveway?', answer: 'We take precautions to protect your driveway surface. Our drivers are experienced with residential deliveries and can place boards under the container if needed.' },
      { question: 'Can I put a mattress in the dumpster?', answer: 'Yes — California requires a $50 recycling fee per mattress. Let us know at the time of booking so we can add it to your invoice.' },
      { question: 'How long can I keep the dumpster?', answer: 'Standard rental is 7 days. If you need more time, extensions are $35/day. Most homeowners finish in 3–5 days.' },
      { question: 'What if I don\'t fill the whole dumpster?', answer: 'You still pay the base rental price, which includes delivery, pickup, and disposal up to the included tonnage. There\'s no penalty for not filling it completely.' },
    ],
    schemaServiceType: 'Residential Dumpster Rental',
  },
  {
    slug: 'commercial-dumpsters',
    keyword: 'commercial dumpster rental Bay Area',
    title: 'Commercial Dumpster Rental Bay Area',
    metaDescription: 'Commercial roll-off dumpster rental in Oakland, San Jose & SF. 20–50 yard containers for retail, office, and industrial projects. Volume pricing available.',
    h1: 'Commercial Dumpster Rental in the Bay Area',
    heroSubheadline: 'Large-capacity roll-off dumpsters for commercial projects — tenant improvements, retail build-outs, and industrial cleanouts.',
    heroCta: 'Get Commercial Pricing',
    intro: 'Commercial projects demand reliability and capacity. We deliver 20–50 yard roll-off dumpsters to job sites across the Bay Area, with scheduled pickups and volume pricing for property managers, GCs, and facility operators.',
    bestFor: [
      'Tenant improvements and build-outs',
      'Retail store remodels and closures',
      'Office cleanouts and relocations',
      'Industrial facility cleanups',
      'Property management ongoing service',
      'Warehouse and storage unit cleanouts',
    ],
    recommendedSizes: [20, 30, 40, 50],
    sizeGuidance: 'Commercial projects typically use 30–40 yard dumpsters. Multi-tenant build-outs or industrial jobs may need 50-yard containers or scheduled swap-outs. We offer volume pricing for recurring service.',
    deliveryNotes: [
      'Dedicated account management for repeat customers',
      'Scheduled swap-outs for multi-phase projects',
      'Flexible delivery windows to fit job site operations',
      'COI and lien waivers available on request',
    ],
    pricingFactors: [
      'Container size (20–50 yards)',
      'Volume and frequency of service',
      'Material type and weight',
      'Project location and access requirements',
      'Rental duration and swap schedule',
    ],
    materialsAllowed: [
      'Office furniture, cubicles, and fixtures',
      'Construction and demolition debris',
      'Wood, metal, drywall, and carpet',
      'Retail fixtures and shelving',
      'General commercial waste',
    ],
    materialsRestricted: [
      'Hazardous materials and chemicals',
      'Regulated industrial waste',
      'Asbestos-containing materials',
      'Medical and biohazard waste',
      'Electronics (separate e-waste recycling required)',
    ],
    permitNote: 'Commercial properties usually have on-site staging areas for dumpsters, so permits are rarely needed. If the container must go on a public street, contact your city for an encroachment permit.',
    faqs: [
      { question: 'Do you offer volume pricing for commercial accounts?', answer: 'Yes. We provide competitive pricing for contractors, property managers, and businesses with recurring dumpster needs. Contact us for a custom rate based on your volume and schedule.' },
      { question: 'Can you provide a COI for my job site?', answer: 'Yes — we can provide Certificates of Insurance and lien waivers as needed for commercial projects. Just request them at the time of booking.' },
      { question: 'How do swap-outs work for long-term projects?', answer: 'We pick up your full dumpster and deliver an empty one on a set schedule — daily, weekly, or as-needed. This keeps your site clean without downtime.' },
      { question: 'What\'s the largest dumpster you offer?', answer: 'Our largest container is 50 yards (24\' L × 7.5\' W × 8\' H), with 5 tons of included disposal. It\'s designed for high-volume commercial and industrial projects.' },
    ],
    schemaServiceType: 'Commercial Dumpster Rental',
  },
  {
    slug: 'concrete-dirt-dumpsters',
    keyword: 'concrete dumpster rental Bay Area',
    title: 'Concrete & Dirt Dumpster Rental Bay Area',
    metaDescription: 'Rent dumpsters for concrete, dirt, soil, brick & asphalt in Oakland, San Jose & SF. Flat-rate pricing, no weight overages. 5–10 yard heavy-material containers.',
    h1: 'Concrete & Dirt Dumpster Rental in the Bay Area',
    heroSubheadline: 'Flat-rate dumpsters for heavy materials — concrete, dirt, soil, brick, and asphalt. No weight overage charges.',
    heroCta: 'Get Your Heavy Material Quote',
    intro: 'Heavy materials like concrete, dirt, and brick need specialized containers with flat-rate pricing. Our 5, 8, and 10-yard heavy-material dumpsters include disposal in the price — no surprise weight charges. Clean loads only.',
    bestFor: [
      'Concrete slab and driveway removal',
      'Foundation demolition',
      'Dirt and soil excavation',
      'Brick and block wall removal',
      'Asphalt driveway tear-out',
      'Rock and gravel disposal',
    ],
    recommendedSizes: [5, 8, 10],
    sizeGuidance: 'Heavy materials are limited to 5, 8, and 10-yard containers for safe transport. An 8-yard handles most residential concrete jobs. For larger foundation or excavation work, we can deliver multiple containers.',
    deliveryNotes: [
      'Same-day delivery available (before noon)',
      'Standard 7-day rental period',
      'Flat-rate pricing — disposal included',
      'Multiple container deliveries for large excavation jobs',
    ],
    pricingFactors: [
      'Container size (5, 8, or 10 yard)',
      'Distance from our yard to your site',
      'Load cleanliness — mixed loads are reclassified',
      'No weight overage charges for clean heavy loads',
    ],
    materialsAllowed: [
      'Concrete (plain and reinforced)',
      'Dirt, soil, and clay',
      'Brick and concrete block',
      'Asphalt and pavement',
      'Rock and gravel',
      'Sand',
    ],
    materialsRestricted: [
      'Trash, wood, or general debris mixed in (causes reclassification at $165/ton)',
      'Contaminated soil',
      'Drywall, carpet, or household waste',
      'Hazardous materials',
    ],
    permitNote: 'Most concrete and dirt dumpsters are placed in driveways or on the work surface. No permit is typically needed unless the container must go on a public street.',
    faqs: [
      { question: 'Why are heavy material dumpsters limited to 5, 8, and 10 yards?', answer: 'Concrete, dirt, and other inert materials are extremely heavy. Larger containers would exceed safe transport weight limits for our trucks and public roads.' },
      { question: 'What happens if I mix trash into a heavy material dumpster?', answer: 'If general debris (wood, drywall, household trash) is found mixed in, the load is reclassified as general debris and billed at $165/ton for weight overages beyond included tonnage.' },
      { question: 'Is disposal included in the flat rate?', answer: 'Yes — our heavy-material flat-rate pricing includes delivery, pickup, and full disposal. There are no additional weight charges for clean, uncontaminated loads.' },
      { question: 'Can I put rebar-reinforced concrete in the dumpster?', answer: 'Yes, reinforced concrete with rebar is accepted. Our recycling facilities handle standard rebar. Extremely large or protruding rebar should be cut down for safe loading.' },
    ],
    schemaServiceType: 'Heavy Material Dumpster Rental',
  },
  {
    slug: 'junk-debris-dumpsters',
    keyword: 'junk removal dumpster rental Bay Area',
    title: 'Junk & Debris Dumpster Rental Bay Area',
    metaDescription: 'Rent dumpsters for junk removal and debris cleanup in Oakland, San Jose & SF. 5–40 yard sizes. You load, we haul. Transparent pricing.',
    h1: 'Junk & Debris Dumpster Rental in the Bay Area',
    heroSubheadline: 'You load it, we haul it. Dumpsters for junk removal, cleanouts, and mixed debris — at a fraction of full-service junk hauling prices.',
    heroCta: 'Get Your Cleanup Quote',
    intro: 'A dumpster rental is the most cost-effective way to handle junk removal. Load at your pace, pay one transparent price, and we pick it up when you\'re done. No hourly labor fees, no per-item charges.',
    bestFor: [
      'Whole-house cleanouts and decluttering',
      'Estate cleanouts and hoarding remediation',
      'Garage and storage unit cleanouts',
      'Post-renovation debris removal',
      'Yard waste and landscaping cleanup',
      'Moving and downsizing',
    ],
    recommendedSizes: [5, 8, 10, 20, 30, 40],
    sizeGuidance: 'For a single-room cleanout, a 10-yard dumpster is sufficient. Whole-house cleanouts and estate jobs typically need 20–30 yards. You get 7 days to load at your own pace.',
    deliveryNotes: [
      'Load at your own pace — no hourly labor charges',
      'Standard 7-day rental with $35/day extensions',
      'Same-day delivery available for urgent cleanups',
      'We call before delivery to confirm placement',
    ],
    pricingFactors: [
      'Dumpster size (5–40 yards)',
      'Weight of materials disposed',
      'Special items (mattresses, freon appliances, tires)',
      'Your ZIP code and distance from our yard',
      'Rental duration beyond 7 days',
    ],
    materialsAllowed: [
      'Furniture, couches, tables, and chairs',
      'Clothing, books, and household items',
      'Yard waste, branches, and brush',
      'Wood, carpet, and flooring',
      'Appliances (freon units at $75 surcharge)',
      'Mattresses ($50 CA recycling fee each)',
    ],
    materialsRestricted: [
      'Hazardous waste and chemicals',
      'Paint (must be dry/empty cans only)',
      'Electronics (TVs, monitors)',
      'Batteries and fluorescent lighting',
      'Medical and biohazard waste',
      'Tires (accepted at $25/tire)',
    ],
    permitNote: 'Dumpsters placed on your driveway or property do not require a permit. Street placement rules vary by city — contact your public works department if needed.',
    faqs: [
      { question: 'Is a dumpster rental cheaper than hiring a junk removal service?', answer: 'In most cases, yes. A dumpster rental gives you 7 days to load at your own pace at a flat rate. Full-service junk removal charges hourly labor plus per-item fees, which adds up fast for large cleanouts.' },
      { question: 'Can I put old furniture in the dumpster?', answer: 'Yes — couches, tables, chairs, dressers, bookshelves, and other household furniture are all accepted. Just break down large pieces to maximize space.' },
      { question: 'What about electronics and old TVs?', answer: 'Electronics like TVs, monitors, and computers are prohibited and must be recycled through a certified e-waste program. Most Bay Area cities offer free e-waste drop-off days.' },
      { question: 'How much junk fits in a 20-yard dumpster?', answer: 'A 20-yard dumpster holds roughly 6–8 pickup truck loads of junk. It\'s enough for a full-room cleanout or a garage filled with miscellaneous items.' },
    ],
    schemaServiceType: 'Junk Removal Dumpster Rental',
  },
  {
    slug: 'same-day-dumpster-rental',
    keyword: 'same day dumpster rental Bay Area',
    title: 'Same-Day Dumpster Rental Bay Area',
    metaDescription: 'Need a dumpster today? Same-day delivery in Oakland, San Jose & SF. Order before noon. 5–50 yard roll-offs from local yards. Call (510) 680-2150.',
    h1: 'Same-Day Dumpster Rental in the Bay Area',
    heroSubheadline: 'Order before noon, get your dumpster today. Same-day delivery from our local yards in Oakland, San Jose, and San Francisco.',
    heroCta: 'Order Same-Day Delivery',
    intro: 'Urgent projects can\'t wait. Place your order before noon and we\'ll deliver a dumpster to your location the same day. Our local yards mean short haul distances and fast turnaround across the Bay Area.',
    bestFor: [
      'Emergency storm damage cleanup',
      'Last-minute contractor needs',
      'Unplanned demolition debris',
      'Same-day estate or eviction cleanouts',
      'Urgent code compliance deadlines',
      'Event or venue cleanup',
    ],
    recommendedSizes: [5, 8, 10, 20, 30, 40, 50],
    sizeGuidance: 'All sizes from 5 to 50 yards are available for same-day delivery, subject to yard inventory. The most commonly requested same-day sizes are 10 and 20-yard dumpsters.',
    deliveryNotes: [
      'Order must be placed before 12:00 PM local time',
      '$100 same-day delivery surcharge applies',
      'Subject to container availability at your nearest yard',
      'Morning, midday, and afternoon windows',
      'Call (510) 680-2150 for fastest service',
    ],
    pricingFactors: [
      'Standard rental pricing plus $100 same-day surcharge',
      'Dumpster size and material type',
      'Your ZIP code and distance from our yard',
      'Standard 7-day rental period included',
    ],
    materialsAllowed: [
      'General construction and demolition debris',
      'Household junk and furniture',
      'Yard waste and landscaping debris',
      'Roofing materials',
      'Heavy materials in appropriate containers (5–10 yd)',
    ],
    materialsRestricted: [
      'Hazardous waste and chemicals',
      'Electronics and batteries',
      'Paint (unless dry/empty)',
      'Medical and biohazard waste',
      'Asbestos-containing materials',
    ],
    permitNote: 'For same-day delivery, we recommend driveway placement to avoid permit delays. Street permits take time to process and may not be available same-day.',
    faqs: [
      { question: 'How late can I order for same-day delivery?', answer: 'Orders must be placed before 12:00 PM (noon) local time to qualify for same-day delivery. Orders after noon are delivered next business day.' },
      { question: 'Is there an extra charge for same-day delivery?', answer: 'Yes — a $100 same-day surcharge applies on top of the standard rental price. This covers the priority scheduling and expedited dispatch from our yard.' },
      { question: 'What if the size I need isn\'t available same-day?', answer: 'Same-day availability depends on current yard inventory. If your preferred size is unavailable, we\'ll offer the closest available alternative or schedule delivery for the next available date.' },
      { question: 'Can I get same-day delivery on weekends?', answer: 'Weekend same-day delivery is available by special request and subject to driver availability. Call us directly at (510) 680-2150 for the fastest response.' },
    ],
    schemaServiceType: 'Same-Day Dumpster Delivery',
  },
];

export function getServicePageBySlug(slug: string): ServicePageData | undefined {
  return SERVICE_PAGES.find(p => p.slug === slug);
}
