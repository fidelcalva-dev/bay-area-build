// SEO Blog Topics — Data-driven blog cluster engine
// Each topic targets a long-tail keyword with unique, high-quality content outline
// Links to: city pages, size pages, /quote

import { getStartingPrice } from '@/config/pricingConfig';

export interface SeoBlogTopic {
  slug: string;
  title: string;
  metaDescription: string;
  targetKeyword: string;
  targetCity?: string;
  category: 'cost' | 'permits' | 'sizing' | 'materials' | 'guides' | 'local';
  outline: string[];
  internalLinks: Array<{ url: string; anchorText: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

export const SEO_BLOG_TOPICS: SeoBlogTopic[] = [
  // ── Existing articles (match current routes) ──
  {
    slug: 'dumpster-cost-oakland',
    title: 'How Much Does a Dumpster Rental Cost in Oakland?',
    metaDescription: 'Oakland dumpster rental pricing breakdown. 5-50 yard sizes, heavy material flat-fees, overage costs, and tips to save money. Updated 2025.',
    targetKeyword: 'dumpster rental cost oakland',
    targetCity: 'Oakland',
    category: 'cost',
    outline: ['Average cost by size', 'Heavy vs general pricing', 'Factors affecting price', 'Tips to minimize cost', 'Hidden fees to watch for'],
    internalLinks: [
      { url: '/dumpster-rental/oakland', anchorText: 'Dumpster Rental Oakland' },
      { url: '/sizes', anchorText: 'Dumpster Sizes Guide' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'What is the cheapest dumpster rental in Oakland?', answer: `A 5-yard dumpster starts from $${getStartingPrice()} in Oakland. This is ideal for small cleanouts and single-room projects.` },
      { question: 'Do Oakland dumpster companies charge by weight?', answer: 'General debris dumpsters include base tonnage. Overage is $165/ton. Heavy material dumpsters (concrete, dirt) are flat-fee with no weight overage.' },
    ],
  },
  {
    slug: 'concrete-disposal-bay-area',
    title: 'Concrete Disposal in the Bay Area: Rules, Costs & Options',
    metaDescription: 'How to dispose of concrete in the SF Bay Area. Flat-fee dumpster options, recycling facilities, weight rules, and clean-load requirements explained.',
    targetKeyword: 'concrete disposal bay area',
    category: 'materials',
    outline: ['Concrete recycling options', 'Dumpster vs self-haul', 'Flat-fee pricing explained', 'Clean load requirements', 'Local recycling facilities'],
    internalLinks: [
      { url: '/dumpster-rental/oakland', anchorText: 'Dumpster Rental Oakland' },
      { url: '/concrete-dumpster-rental', anchorText: 'Concrete Dumpster Rental' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'How much does it cost to dump concrete in the Bay Area?', answer: 'Concrete dumpsters are flat-fee — disposal included, no weight overage. Self-haul to a recycling facility costs $10-25/ton.' },
    ],
  },
  {
    slug: 'dumpster-permit-san-jose',
    title: 'Do You Need a Dumpster Permit in San Jose?',
    metaDescription: 'San Jose dumpster permit requirements explained. When you need one, how to apply, costs, and how to avoid needing a permit entirely.',
    targetKeyword: 'dumpster permit san jose',
    targetCity: 'San Jose',
    category: 'permits',
    outline: ['When a permit is required', 'Application process', 'Costs and timelines', 'How to avoid a permit', 'Street placement rules'],
    internalLinks: [
      { url: '/dumpster-rental-san-jose-ca', anchorText: 'Dumpster Rental San Jose' },
      { url: '/sizes', anchorText: 'Dumpster Sizes' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'How much does a dumpster permit cost in San Jose?', answer: 'Contact San Jose Public Works for current fees. Placing the dumpster on your private driveway avoids the permit requirement entirely.' },
    ],
  },
  {
    slug: 'heavy-material-dumpsters-explained',
    title: 'Heavy Material Dumpsters Explained: Concrete, Dirt & Rock',
    metaDescription: 'Everything about heavy material dumpsters: flat-fee pricing, size limits (5-10 yard), clean load rules, and when to use them vs general debris containers.',
    targetKeyword: 'heavy material dumpster',
    category: 'materials',
    outline: ['What qualifies as heavy material', 'Size restrictions (5-10yd)', 'Flat-fee vs overage pricing', 'Clean load requirements', 'Contamination reclassification'],
    internalLinks: [
      { url: '/concrete-dumpster-rental', anchorText: 'Concrete Dumpster Rental' },
      { url: '/dumpster-rental/oakland', anchorText: 'Oakland Dumpster Service' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'What happens if I mix trash with concrete?', answer: 'Mixed loads are reclassified as general debris at $165/ton overage instead of flat-fee. Keep heavy material loads clean for best pricing.' },
    ],
  },
  {
    slug: 'dumpster-sizes-guide',
    title: 'What Size Dumpster Do I Need? Complete Sizing Guide',
    metaDescription: 'Dumpster size guide: 6 to 50 yard containers compared. Dimensions, capacity, weight limits, and best uses for each size. Find your perfect fit.',
    targetKeyword: 'what size dumpster do i need',
    category: 'sizing',
    outline: ['Size comparison chart', 'Dimensions and capacity', 'Best size by project type', 'Heavy vs general sizing', 'When to size up'],
    internalLinks: [
      { url: '/sizes', anchorText: 'All Dumpster Sizes' },
      { url: '/dumpster-rental/oakland', anchorText: 'Oakland Dumpster Rental' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'What is the most popular dumpster size?', answer: 'The 20-yard dumpster is the most popular. It handles most home renovation and cleanout projects with a 2-ton included weight allowance.' },
    ],
  },
  {
    slug: 'same-day-dumpster-delivery-bay-area',
    title: 'Same-Day Dumpster Delivery in the Bay Area',
    metaDescription: 'How to get same-day dumpster delivery in Oakland, San Jose, and SF. Ordering deadlines, availability, and tips to ensure on-time arrival.',
    targetKeyword: 'same day dumpster delivery bay area',
    category: 'guides',
    outline: ['How same-day works', 'Ordering deadline (before noon)', 'Yard locations and coverage', 'Tips for fast delivery', 'Weekend availability'],
    internalLinks: [
      { url: '/dumpster-rental/oakland', anchorText: 'Oakland Dumpster Rental' },
      { url: '/dumpster-rental-san-jose-ca', anchorText: 'San Jose Dumpster Rental' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'Can I get a dumpster delivered today?', answer: 'Yes, same-day delivery is available for most Bay Area addresses when ordered before noon. Call (510) 680-2150 for fastest service.' },
    ],
  },
  // ── NEW long-tail topics ──
  {
    slug: 'dumpster-rental-cost-san-francisco',
    title: 'Dumpster Rental Cost in San Francisco: 2025 Pricing',
    metaDescription: 'SF dumpster rental pricing: 6-50 yard sizes, SFMTA permit costs, steep-grade surcharges, and tips to save on your San Francisco project.',
    targetKeyword: 'dumpster rental cost san francisco',
    targetCity: 'San Francisco',
    category: 'cost',
    outline: ['SF pricing by size', 'SFMTA permit costs', 'Steep-grade surcharges', 'Heavy vs general pricing in SF', 'Budget tips'],
    internalLinks: [
      { url: '/dumpster-rental-san-francisco-ca', anchorText: 'SF Dumpster Rental' },
      { url: '/sizes', anchorText: 'Size Guide' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'Why are dumpsters more expensive in San Francisco?', answer: 'SF has higher permit fees, stricter regulations, and logistical challenges (narrow streets, hills) that can add to delivery costs.' },
    ],
  },
  {
    slug: 'roofing-dumpster-size-guide',
    title: 'What Size Dumpster for a Roofing Job? Complete Guide',
    metaDescription: 'Roofing dumpster sizing: shingle weight calculations, single vs multi-layer tearoffs, and recommended container sizes for residential and commercial roofs.',
    targetKeyword: 'what size dumpster for roofing',
    category: 'sizing',
    outline: ['Shingle weight per square', 'Single vs multi-layer', 'Residential roof sizes', 'Commercial flat roof', 'Overage and tonnage'],
    internalLinks: [
      { url: '/dumpster-rental/oakland', anchorText: 'Oakland Dumpsters' },
      { url: '/sizes', anchorText: 'All Sizes' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'How many squares of shingles fit in a 20-yard dumpster?', answer: 'A 20-yard dumpster can hold approximately 25-35 squares of single-layer asphalt shingles (by weight, about 2 tons worth).' },
    ],
  },
  {
    slug: 'kitchen-remodel-dumpster-guide',
    title: 'Dumpster Rental for Kitchen Remodel: Sizes, Cost & Tips',
    metaDescription: 'Plan your kitchen remodel dumpster rental. What size you need, expected costs, what goes in vs what doesn\'t, and scheduling tips for a smooth renovation.',
    targetKeyword: 'dumpster rental kitchen remodel',
    category: 'guides',
    outline: ['Kitchen demo debris volume', 'Recommended sizes (10-20yd)', 'Timeline and scheduling', 'What can go in', 'Cost expectations'],
    internalLinks: [
      { url: '/dumpster-rental/oakland', anchorText: 'Oakland Dumpster Rental' },
      { url: '/sizes', anchorText: 'Dumpster Sizes' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'What size dumpster for a kitchen remodel?', answer: 'Most kitchen remodels fit in a 10-yard dumpster. Full gut renovations with cabinetry, flooring, and appliances may need a 20-yard.' },
    ],
  },
  {
    slug: 'dumpster-permit-oakland',
    title: 'Oakland Dumpster Permit: Do You Need One?',
    metaDescription: 'Oakland dumpster permit guide. When a permit is required, how to apply, fees, and how driveway placement avoids the entire process.',
    targetKeyword: 'dumpster permit oakland',
    targetCity: 'Oakland',
    category: 'permits',
    outline: ['When permits are needed', 'Oakland Public Works process', 'Fee schedule', 'Driveway vs street placement', 'Timeline expectations'],
    internalLinks: [
      { url: '/dumpster-rental/oakland', anchorText: 'Oakland Dumpster Rental' },
      { url: '/dumpster-rental-oakland-ca', anchorText: 'Oakland Service Page' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'How long does it take to get a dumpster permit in Oakland?', answer: 'Typically 3-7 business days. Placing on your private driveway avoids the need for a permit entirely.' },
    ],
  },
  {
    slug: 'adu-construction-dumpster-guide',
    title: 'Dumpster Rental for ADU Construction in the Bay Area',
    metaDescription: 'ADU construction dumpster guide: how many loads to expect, phase-by-phase sizing, swap scheduling, and concrete separation for Bay Area ADU builds.',
    targetKeyword: 'adu construction dumpster rental',
    category: 'guides',
    outline: ['ADU phases and debris types', 'Sizing by phase', 'Swap scheduling', 'Concrete separation', 'Permit considerations'],
    internalLinks: [
      { url: '/dumpster-rental/oakland', anchorText: 'Oakland Dumpster Rental' },
      { url: '/dumpster-rental-san-jose-ca', anchorText: 'San Jose Dumpster Rental' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'How many dumpsters do I need for an ADU build?', answer: 'Most ADU projects need 2-4 dumpster loads. Start with a 10-yard for concrete, then 20-30 yard swaps for framing and finish debris.' },
    ],
  },
  {
    slug: 'dumpster-rental-hayward-ca',
    title: 'Dumpster Rental in Hayward, CA: Local Guide',
    metaDescription: 'Hayward dumpster rental guide: available sizes, pricing, delivery areas, and local disposal information for residential and commercial projects.',
    targetKeyword: 'dumpster rental hayward ca',
    targetCity: 'Hayward',
    category: 'local',
    outline: ['Hayward service coverage', 'Available sizes', 'Typical project types', 'Local disposal sites', 'Permit info'],
    internalLinks: [
      { url: '/dumpster-rental/hayward', anchorText: 'Hayward Dumpster Rental' },
      { url: '/dumpster-rental/oakland', anchorText: 'Oakland Hub' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'How fast can I get a dumpster in Hayward?', answer: 'Same-day delivery is available for most Hayward addresses when ordered before noon from our Oakland yard.' },
    ],
  },
  {
    slug: 'dumpster-rental-berkeley-ca',
    title: 'Dumpster Rental in Berkeley, CA: Sizes, Costs & Tips',
    metaDescription: 'Berkeley dumpster rental: all sizes, local pricing, permit requirements, and neighborhood delivery coverage from our Oakland yard.',
    targetKeyword: 'dumpster rental berkeley ca',
    targetCity: 'Berkeley',
    category: 'local',
    outline: ['Berkeley delivery coverage', 'Pricing overview', 'Hillside access notes', 'University area projects', 'Permit info'],
    internalLinks: [
      { url: '/dumpster-rental/berkeley', anchorText: 'Berkeley Dumpster Rental' },
      { url: '/dumpster-rental/oakland', anchorText: 'Oakland Hub' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'Can dumpsters be delivered to Berkeley hills?', answer: 'Yes, but hillside addresses may require advance coordination for placement. Our drivers handle steep driveways regularly.' },
    ],
  },
  {
    slug: 'dirt-removal-dumpster-bay-area',
    title: 'Dirt Removal Dumpsters in the Bay Area: Flat-Fee Options',
    metaDescription: 'Dirt and soil removal dumpster rental. Flat-fee pricing, clean-load rules, 6-8-10 yard sizes, and tips for excavation and grading projects.',
    targetKeyword: 'dirt removal dumpster bay area',
    category: 'materials',
    outline: ['Dirt dumpster sizing', 'Flat-fee pricing', 'Clean load requirements', 'Excavation projects', 'Disposal facilities'],
    internalLinks: [
      { url: '/dirt-dumpster-rental', anchorText: 'Dirt Dumpster Rental' },
      { url: '/dumpster-rental/oakland', anchorText: 'Oakland Service' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'How much dirt fits in a 10-yard dumpster?', answer: 'A 10-yard dumpster holds approximately 5-6 cubic yards of dirt (filled to the safe line). Dirt is heavy — the fill-line restriction keeps loads within transport limits.' },
    ],
  },
  {
    slug: 'commercial-construction-dumpster-rental',
    title: 'Commercial Construction Dumpster Rental: Bay Area Guide',
    metaDescription: 'Commercial dumpster rental for Bay Area construction. 20-50 yard sizes, multi-swap scheduling, tenant improvement debris, and volume pricing.',
    targetKeyword: 'commercial construction dumpster rental',
    category: 'guides',
    outline: ['Commercial sizes (20-50yd)', 'Multi-swap scheduling', 'Tenant improvements', 'Volume pricing', 'Loading dock access'],
    internalLinks: [
      { url: '/commercial-dumpster-rental', anchorText: 'Commercial Dumpster Rental' },
      { url: '/construction-dumpsters', anchorText: 'Construction Dumpsters' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'Do you offer volume discounts for commercial projects?', answer: 'Yes. Contractors and businesses with recurring needs qualify for volume pricing, priority scheduling, and Net-30 terms.' },
    ],
  },
  {
    slug: 'dumpster-weight-limits-explained',
    title: 'Dumpster Weight Limits Explained: Avoid Overage Fees',
    metaDescription: 'Understand dumpster weight limits, included tonnage by size, overage rates, and how to estimate your project weight to avoid surprise charges.',
    targetKeyword: 'dumpster weight limit',
    category: 'guides',
    outline: ['Included tonnage by size', 'Overage rate ($165/ton)', 'Estimating project weight', 'Heavy vs general rules', 'Tips to stay under limit'],
    internalLinks: [
      { url: '/sizes', anchorText: 'Dumpster Sizes' },
      { url: '/pricing', anchorText: 'Pricing Page' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'What happens if I go over the weight limit?', answer: 'General debris overage is billed at $165/ton based on certified scale ticket. Heavy material dumpsters (6-10yd) are flat-fee with no overage.' },
    ],
  },
  {
    slug: 'estate-cleanout-dumpster-guide',
    title: 'Estate Cleanout Dumpster Guide: Sizes & Planning Tips',
    metaDescription: 'Estate cleanout dumpster rental: recommended sizes, planning timeline, prohibited items, and tips for efficient whole-house clearing.',
    targetKeyword: 'estate cleanout dumpster',
    category: 'guides',
    outline: ['Estimating volume', 'Recommended sizes (30-40yd)', 'Room-by-room strategy', 'Prohibited items', 'Swap scheduling'],
    internalLinks: [
      { url: '/dumpster-rental/oakland', anchorText: 'Oakland Dumpster Rental' },
      { url: '/sizes', anchorText: 'Dumpster Sizes' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'How many dumpsters for a full estate cleanout?', answer: 'Most full estate cleanouts need 1-2 loads in a 30 or 40 yard dumpster. We can swap containers if you need more capacity.' },
    ],
  },
  {
    slug: 'demolition-debris-disposal-bay-area',
    title: 'Demolition Debris Disposal in the Bay Area',
    metaDescription: 'How to dispose of demolition debris in the SF Bay Area. Dumpster options, recycling requirements, material separation rules, and local disposal sites.',
    targetKeyword: 'demolition debris disposal bay area',
    category: 'materials',
    outline: ['Demolition waste types', 'Separation requirements', 'Recycling mandates', 'Dumpster sizing for demo', 'Local disposal facilities'],
    internalLinks: [
      { url: '/construction-dumpsters', anchorText: 'Construction Dumpsters' },
      { url: '/dumpster-rental/oakland', anchorText: 'Oakland Dumpsters' },
      { url: '/quote', anchorText: 'Get Instant Quote' },
    ],
    faqs: [
      { question: 'Do Bay Area cities require demolition waste recycling?', answer: 'Yes. Most Bay Area cities have construction and demolition debris diversion requirements (typically 65-75%). We route loads to certified facilities.' },
    ],
  },
];

export function getBlogTopicBySlug(slug: string): SeoBlogTopic | undefined {
  return SEO_BLOG_TOPICS.find(t => t.slug === slug);
}

export function getBlogTopicsByCategory(category: SeoBlogTopic['category']): SeoBlogTopic[] {
  return SEO_BLOG_TOPICS.filter(t => t.category === category);
}
