// SEO Job Types — Content data for city + job-type pages
// Each job type has unique copy blocks, recommended sizes, and FAQs

export interface SeoJobType {
  slug: string;
  name: string;
  category: 'residential' | 'commercial' | 'contractor';
  recommendedSizes: number[];
  description: string;
  typicalProjects: string;
  whyDumpster: string;
  faqs: Array<{ question: string; answer: string }>;
}

export const SEO_JOB_TYPES: SeoJobType[] = [
  {
    slug: 'roofing-dumpster',
    name: 'Roofing',
    category: 'contractor',
    recommendedSizes: [20, 30, 40],
    description: 'Roll-off dumpsters sized for roofing tear-offs. Shingles, underlayment, flashing, and old decking — we handle the heavy, bulky debris that roofing jobs produce.',
    typicalProjects: 'Full roof replacements, partial tear-offs, commercial flat roof removal, and storm damage repair',
    whyDumpster: 'Roofing debris is heavy and awkward to handle. A dumpster on-site lets your crew toss shingles directly from the roof, keeping the ground clear and the project on schedule.',
    faqs: [
      { question: 'What size dumpster for a roofing job?', answer: 'Most residential roofs need a 20 or 30 yard dumpster. Multi-layer tear-offs or commercial roofs may need a 40 yard. Shingles are heavy — the included tonnage matters more than volume.' },
      { question: 'How heavy are roofing shingles?', answer: 'Asphalt shingles weigh approximately 2-3 tons per 1,000 sq ft of roof (single layer). A 20-yard dumpster with 2 tons included handles most single-layer residential roofs up to about 1,000 sq ft.' },
      { question: 'Can I put old flashing and nails in the dumpster?', answer: 'Yes. Metal flashing, roofing nails, underlayment, and tar paper are all accepted in general debris dumpsters.' },
    ],
  },
  {
    slug: 'demolition-dumpster',
    name: 'Demolition',
    category: 'contractor',
    recommendedSizes: [20, 30, 40],
    description: 'Heavy-duty dumpsters for full and partial demolition projects. Interior gut jobs, garage teardowns, and structural demo — we deliver the right container and pick it up when you are done.',
    typicalProjects: 'Interior demolition, garage removal, shed teardown, partial structural demo, pool demolition, and foundation removal',
    whyDumpster: 'Demolition produces massive volumes of mixed debris quickly. Having the right size dumpster on-site from day one prevents delays, keeps the site safe, and ensures proper disposal.',
    faqs: [
      { question: 'What size dumpster for demolition?', answer: 'Interior demo of a single room typically needs a 20-yard. Full house gut or garage teardown usually requires 30-40 yards. If the demo includes concrete or foundation, consider a separate heavy-material dumpster (6-10 yard).' },
      { question: 'Can I put concrete from demolition in a regular dumpster?', answer: 'We recommend separating concrete into a dedicated heavy-material dumpster (6-10 yard, flat-fee pricing). Mixing concrete with general debris triggers $165/ton overage charges instead of flat-fee pricing.' },
      { question: 'Do I need a permit for a demolition dumpster?', answer: 'The dumpster itself only needs a permit if placed on a public street. However, your demolition project likely requires separate building permits from your city.' },
    ],
  },
  {
    slug: 'adu-dumpster',
    name: 'ADU Construction',
    category: 'contractor',
    recommendedSizes: [10, 20, 30],
    description: 'Dumpster service tailored for ADU (Accessory Dwelling Unit) builds across the Bay Area. From foundation excavation to finish carpentry waste, we support every phase of your ADU project.',
    typicalProjects: 'New ADU construction, garage conversions, detached unit builds, JADU (Junior ADU) conversions, and foundation work',
    whyDumpster: 'ADU projects span weeks or months, producing different types of debris at each phase. Having a reliable dumpster swap service means clean sites, happy neighbors, and no project delays.',
    faqs: [
      { question: 'How many dumpsters will I need for an ADU build?', answer: 'Most ADU projects need 2-4 dumpster loads over the build timeline. A 10-yard for foundation/concrete (flat-fee), then 20-30 yard swaps for framing, rough-in, and finish waste.' },
      { question: 'Can I keep the dumpster for the entire ADU build?', answer: 'Standard rental is 7 days at $35/day extra after that. For multi-week projects, many contractors schedule a swap service — we pick up the full container and drop a fresh one.' },
      { question: 'What permits do I need for an ADU in Oakland?', answer: 'Oakland has streamlined ADU permitting. The dumpster itself only needs a permit if street-placed. Your ADU project requires building permits from Oakland Planning & Building.' },
    ],
  },
  {
    slug: 'home-remodel-dumpster',
    name: 'Home Remodel',
    category: 'residential',
    recommendedSizes: [10, 20, 30],
    description: 'Dumpster rental for whole-home and multi-room remodels. Drywall, flooring, cabinetry, fixtures — get rid of the old so your contractor can build the new.',
    typicalProjects: 'Kitchen remodels, bathroom renovations, multi-room updates, flooring replacement, and whole-house renovations',
    whyDumpster: 'Remodeling debris piles up fast. Drywall, old cabinets, flooring, and fixtures need to go somewhere. A dumpster in your driveway keeps the work area clear and your project on timeline.',
    faqs: [
      { question: 'What size dumpster for a home remodel?', answer: 'A single room remodel (kitchen or bathroom) typically fits in a 10-20 yard dumpster. Multi-room or whole-house renovations usually need 20-30 yards.' },
      { question: 'Can drywall go in the dumpster?', answer: 'Yes. Drywall, sheetrock, and plaster are accepted in general debris dumpsters. No special handling required.' },
      { question: 'How long does a remodel dumpster rental last?', answer: 'Standard rental is 7 days. Most homeowner remodels are done within that window. Extensions are $35/day if you need more time.' },
    ],
  },
  {
    slug: 'garage-cleanout-dumpster',
    name: 'Garage Cleanout',
    category: 'residential',
    recommendedSizes: [6, 8, 10, 20],
    description: 'Clean out years of accumulated junk from your garage with the right-sized dumpster. Furniture, old equipment, boxes, and household items — toss it all and reclaim your space.',
    typicalProjects: 'Garage declutter, storage unit cleanout, attic cleanout, basement clearing, and pre-move cleanups',
    whyDumpster: 'A dumpster in your driveway means you can work at your own pace over a few days. No multiple trips to the dump, no renting a truck, no scheduling hassles.',
    faqs: [
      { question: 'What size dumpster for a garage cleanout?', answer: 'A standard 2-car garage cleanout typically fits in a 10-yard dumpster. If you have unusually large amounts or bulky furniture, step up to a 20-yard.' },
      { question: 'Can I put furniture in the dumpster?', answer: 'Yes. Furniture, mattresses (additional $50 recycling fee per mattress in California), appliances without freon, and general household items are accepted.' },
      { question: 'What about appliances?', answer: 'Most appliances are accepted. Freon-containing appliances (refrigerators, freezers, AC units) have a $75 removal fee. TVs and monitors are prohibited.' },
    ],
  },
  {
    slug: 'estate-cleanout-dumpster',
    name: 'Estate Cleanout',
    category: 'residential',
    recommendedSizes: [20, 30, 40],
    description: 'Large-capacity dumpsters for full estate and house cleanouts. When you need to clear an entire property — furniture, clothing, personal items, and general household contents — we have the capacity.',
    typicalProjects: 'Estate clearing, probate property cleanout, hoarder cleanup, tenant move-out cleanup, and foreclosure property clearing',
    whyDumpster: 'Estate cleanouts involve entire households of belongings. A 30 or 40 yard dumpster handles the volume without multiple trips or extended timelines.',
    faqs: [
      { question: 'What size dumpster for an estate cleanout?', answer: 'Full estate cleanouts typically need a 30 or 40 yard dumpster. Smaller estates or condos may fit in a 20-yard. We can always swap if you need more capacity.' },
      { question: 'How do I handle a property with a lot of items?', answer: 'Start with a 30-yard dumpster and work room by room. If you fill it before finishing, call us for a swap — we pick up the full one and drop a fresh container.' },
      { question: 'Are there items I cannot put in the dumpster?', answer: 'Hazardous waste, paint, chemicals, batteries, and electronics (TVs, monitors) are prohibited. Mattresses are accepted with a $50 CA recycling fee. Freon appliances have a $75 fee.' },
    ],
  },
  {
    slug: 'concrete-removal-dumpster',
    name: 'Concrete Removal',
    category: 'contractor',
    recommendedSizes: [5, 8, 10],
    description: 'Flat-fee concrete dumpsters for driveway removal, patio demolition, foundation work, and sidewalk replacement. Heavy material — no weight overage charges.',
    typicalProjects: 'Driveway replacement, patio demolition, sidewalk removal, foundation demo, pool removal concrete, and retaining wall teardown',
    whyDumpster: 'Concrete is extremely heavy — a single driveway can weigh 5-10 tons. Our heavy-material dumpsters are flat-fee, so you know the exact cost upfront with no surprise weight charges.',
    faqs: [
      { question: 'How much concrete fits in a dumpster?', answer: 'A 6-yard dumpster holds approximately 3-4 cubic yards of broken concrete (half full by volume due to weight). A 10-yard handles a typical single-car driveway removal.' },
      { question: 'Is there a weight limit for concrete dumpsters?', answer: 'Our heavy-material dumpsters are flat-fee — disposal is included and there are no weight overage charges. The key rule is keeping loads clean: only concrete, no trash or mixed debris.' },
      { question: 'Can I mix concrete with other debris?', answer: 'No. Heavy material dumpsters must be clean loads only (concrete, brick, block, asphalt, rock, dirt). If trash or mixed debris is found, the load is reclassified to general debris at $165/ton overage.' },
    ],
  },
  {
    slug: 'commercial-cleanout-dumpster',
    name: 'Commercial Cleanout',
    category: 'commercial',
    recommendedSizes: [20, 30, 40, 50],
    description: 'Commercial-scale dumpsters for office buildouts, warehouse clearing, retail space renovations, and restaurant remodels. We handle the logistics so your project stays on schedule.',
    typicalProjects: 'Office renovation, warehouse cleanout, retail buildout, restaurant remodel, tenant improvement, and commercial tenant move-out',
    whyDumpster: 'Commercial projects generate massive volumes of debris on tight timelines. Our 30-50 yard dumpsters handle the volume, and our professional dispatch ensures on-time delivery and pickup.',
    faqs: [
      { question: 'What size dumpster for a commercial cleanout?', answer: 'Office renovations typically need 20-30 yards. Warehouse cleanouts may require 40-50 yards. Restaurant remodels usually fit in a 30-yard. We can schedule multiple swaps for large projects.' },
      { question: 'Do you offer commercial accounts?', answer: 'Yes. Contractors and businesses with recurring needs can set up a commercial account with volume pricing, priority scheduling, and dedicated account support. Contact us for details.' },
      { question: 'Can you deliver to multi-story buildings?', answer: 'We deliver ground-level dumpsters to your designated area — parking lot, loading dock, or street (with permit). Multi-story debris must be brought down to the dumpster level.' },
    ],
  },
];

export function getJobTypeBySlug(slug: string): SeoJobType | undefined {
  return SEO_JOB_TYPES.find(j => j.slug === slug);
}
