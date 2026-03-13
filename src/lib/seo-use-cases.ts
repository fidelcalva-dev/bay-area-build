// SEO Use Case Data — Use case landing pages

export interface SeoUseCase {
  slug: string;
  name: string;
  h1: string;
  description: string;
  metaDescription: string;
  recommendedSizes: number[];
  benefits: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export const SEO_USE_CASES: SeoUseCase[] = [
  {
    slug: 'home-remodel-dumpster-rental',
    name: 'Home Remodel',
    h1: 'Dumpster Rental for Home Remodels in California',
    description: 'Whether you are renovating a single bathroom or gutting an entire house, having a dumpster on-site keeps the project moving. Drywall, flooring, cabinetry, fixtures, and trim — toss it all and keep your work area clear.',
    metaDescription: 'Rent a dumpster for your home remodel in California. 5-50 yard sizes, same-day delivery, transparent pricing. Get an instant quote from Calsan Dumpsters Pro.',
    recommendedSizes: [10, 20, 30],
    benefits: ['Keep work areas clear and safe', 'No trips to the dump', 'Professional delivery and pickup', 'Available in 10, 20, and 30 yard sizes'],
    faqs: [
      { question: 'What size dumpster do I need for a home remodel?', answer: 'A single-room remodel (kitchen or bathroom) typically fits in a 10-20 yard dumpster. Multi-room or whole-house renovations usually need 20-30 yards.' },
      { question: 'Can I put drywall in the dumpster?', answer: 'Yes. Drywall, sheetrock, plaster, tile, wood, and most construction materials are accepted in general debris dumpsters.' },
      { question: 'How long can I keep the dumpster for a remodel?', answer: 'Standard rental is 7-14 days. Extensions are available at daily rates for longer renovation projects.' },
      { question: 'Do I need a permit for a remodel dumpster?', answer: 'If placed on your driveway, typically no permit is needed. Street placement requires a city encroachment permit in most California cities.' },
    ],
  },
  {
    slug: 'roofing-dumpster-rental',
    name: 'Roofing',
    h1: 'Dumpster Rental for Roofing Projects in California',
    description: 'Roofing tear-offs produce heavy, bulky debris that demands the right container. Our roll-off dumpsters are sized for asphalt shingles, underlayment, flashing, and old decking — so your crew can focus on installation, not cleanup.',
    metaDescription: 'Roofing dumpster rental in California. 20-40 yard sizes for roof tear-offs and replacements. Same-day delivery, transparent pricing. Get an instant quote.',
    recommendedSizes: [20, 30, 40],
    benefits: ['Toss shingles directly from the roof', 'Heavy-duty containers for heavy materials', 'Same-day delivery for urgent jobs', 'Sizes for single-layer to multi-layer tear-offs'],
    faqs: [
      { question: 'What size dumpster for a roofing job?', answer: 'Most residential roofs need a 20 or 30 yard dumpster. Multi-layer tear-offs or commercial roofs may require a 40 yard.' },
      { question: 'How heavy are roofing shingles?', answer: 'Asphalt shingles weigh approximately 2-3 tons per 1,000 sq ft of roof (single layer).' },
      { question: 'Can I put old flashing and nails in the dumpster?', answer: 'Yes. Metal flashing, roofing nails, underlayment, and tar paper are all accepted.' },
      { question: 'How quickly can I get a roofing dumpster delivered?', answer: 'Same-day delivery is available for most California addresses when ordered before noon.' },
    ],
  },
  {
    slug: 'construction-dumpster-rental',
    name: 'Construction',
    h1: 'Construction Dumpster Rental in California',
    description: 'From new builds to commercial tenant improvements, construction generates massive volumes of debris. Our roll-off dumpsters keep your job site clean, safe, and compliant with California waste management regulations.',
    metaDescription: 'Construction dumpster rental in California. 5-50 yard sizes for job sites. Same-day delivery, contractor accounts, volume pricing. Get an instant quote.',
    recommendedSizes: [20, 30, 40],
    benefits: ['Contractor accounts with Net-30 terms', 'Volume pricing for recurring projects', 'Priority scheduling', 'Heavy material containers available'],
    faqs: [
      { question: 'Do you offer contractor accounts?', answer: 'Yes. Qualified contractors can set up accounts with volume pricing, priority scheduling, and Net-30 payment terms.' },
      { question: 'What size dumpster for a construction site?', answer: 'Most construction sites use 30-40 yard dumpsters for general debris. Foundation and concrete work may need dedicated heavy-material containers.' },
      { question: 'Can I schedule regular dumpster swaps?', answer: 'Yes. We offer scheduled swap service — when one container fills up, we replace it with an empty one to keep your project moving.' },
      { question: 'Do you handle mixed construction debris?', answer: 'Yes. General C&D debris including wood, drywall, metal, roofing, and mixed materials are accepted in standard dumpsters.' },
    ],
  },
  {
    slug: 'garage-cleanout-dumpster-rental',
    name: 'Garage Cleanout',
    h1: 'Dumpster Rental for Garage Cleanouts in California',
    description: 'Reclaim your garage space with the right-sized dumpster. From years of accumulated household items to old furniture and equipment, a dumpster in your driveway makes cleanout day easy.',
    metaDescription: 'Rent a dumpster for your garage cleanout in California. 10-20 yard sizes, same-day delivery, no trips to the dump. Get an instant quote.',
    recommendedSizes: [10, 15, 20],
    benefits: ['Work at your own pace over several days', 'No multiple trips to the dump', 'Fits in standard driveways', 'Perfect for 1-2 car garages'],
    faqs: [
      { question: 'What size dumpster for a garage cleanout?', answer: 'A standard 2-car garage cleanout typically fits in a 10-yard dumpster. For larger garages or heavy accumulation, step up to a 20-yard.' },
      { question: 'Can I put furniture in the dumpster?', answer: 'Yes. Furniture, mattresses (with CA recycling fee), appliances without freon, and general household items are accepted.' },
      { question: 'How long do I have the dumpster?', answer: 'Standard rental is 7 days — plenty of time to sort and toss at your own pace. Extensions available if needed.' },
      { question: 'What items are not allowed?', answer: 'Hazardous waste, paint, chemicals, batteries, TVs/monitors, and tires are prohibited. Freon appliances have a removal fee.' },
    ],
  },
  {
    slug: 'demolition-dumpster-rental',
    name: 'Demolition',
    h1: 'Demolition Dumpster Rental in California',
    description: 'Demolition projects produce massive volumes of debris fast. From interior gut jobs to full structural teardowns, having the right dumpster on-site from day one is critical for safety, efficiency, and proper disposal.',
    metaDescription: 'Demolition dumpster rental in California. 20-40 yard sizes for interior demo, garage teardown, and structural demolition. Same-day delivery available.',
    recommendedSizes: [20, 30, 40],
    benefits: ['Heavy-duty containers for demo debris', 'Separate containers for concrete/heavy materials', 'Same-day delivery for urgent projects', 'Professional dispatch for job site coordination'],
    faqs: [
      { question: 'What size dumpster for demolition?', answer: 'Interior demo of a single room typically needs a 20-yard. Full house gut or garage teardown usually requires 30-40 yards.' },
      { question: 'Can I mix concrete with regular demo debris?', answer: 'We recommend separating concrete into a dedicated heavy-material dumpster for flat-fee pricing. Mixing triggers per-ton overage charges.' },
      { question: 'Do I need a permit for a demolition dumpster?', answer: 'The dumpster only needs a permit if placed on a public street. Your demolition project likely requires separate building permits.' },
      { question: 'How fast can you deliver a demo dumpster?', answer: 'Same-day delivery is available for most addresses when ordered before noon. We prioritize demo and construction projects.' },
    ],
  },
  {
    slug: 'estate-cleanout-dumpster-rental',
    name: 'Estate Cleanout',
    h1: 'Dumpster Rental for Estate Cleanouts in California',
    description: 'When you need to clear an entire property — furniture, clothing, personal items, and household contents — our large-capacity dumpsters handle the volume. Estate cleanouts, probate properties, and hoarder situations all handled professionally.',
    metaDescription: 'Estate cleanout dumpster rental in California. 20-40 yard sizes for whole-house clearing. Same-day delivery, professional service. Get an instant quote.',
    recommendedSizes: [20, 30, 40],
    benefits: ['Large capacity for entire households', 'Swap service if you need more than one load', 'Work at your own pace', 'Sensitive handling of estate situations'],
    faqs: [
      { question: 'What size dumpster for an estate cleanout?', answer: 'Full estate cleanouts typically need a 30 or 40 yard dumpster. Smaller estates or condos may fit in a 20-yard.' },
      { question: 'Can I donate items before using the dumpster?', answer: 'Absolutely. We recommend donating usable items first, then using the dumpster for everything else. We can work around your timeline.' },
      { question: 'How do you handle sensitive situations?', answer: 'We understand estate cleanouts can be emotional. Our team provides professional, respectful service and works around your schedule.' },
      { question: 'What items cannot go in the dumpster?', answer: 'Hazardous waste, paint, chemicals, batteries, and electronics (TVs, monitors) are prohibited. Mattresses are accepted with a CA recycling fee.' },
    ],
  },
];

export function getUseCaseBySlug(slug: string): SeoUseCase | undefined {
  return SEO_USE_CASES.find(u => u.slug === slug);
}
