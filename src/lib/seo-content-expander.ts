// SEO Content Expander — Auto-generates filler sections, FAQs, local signals, and internal links
// Used by the SEO Repair tool and fallback rendering

export interface ExpandedSection {
  heading: string;
  body: string;
}

export interface ExpandedFaq {
  question: string;
  answer: string;
}

const STANDARD_INTERNAL_LINKS = [
  { url: '/pricing', label: 'Dumpster Rental Pricing' },
  { url: '/sizes', label: 'All Dumpster Sizes' },
  { url: '/materials', label: 'Materials Accepted' },
  { url: '/areas', label: 'Service Areas' },
  { url: '/contractors', label: 'Contractor Services' },
  { url: '/quote', label: 'Get Instant Quote' },
  { url: '/how-it-works', label: 'How It Works' },
  { url: '/capacity-guide', label: 'Capacity Guide' },
];

/**
 * Generate expansion sections when page content is below threshold
 */
export function generateSeoExpansion(cityName: string, countyName?: string): ExpandedSection[] {
  return [
    {
      heading: `What Dumpster Size Should You Choose in ${cityName}?`,
      body: `Choosing the right dumpster size for your ${cityName} project depends on the scope of work. A 10-yard dumpster is ideal for small cleanouts, bathroom remodels, or garage cleanups. A 20-yard dumpster handles full room renovations, roofing projects, and medium-sized property cleanouts. For larger construction projects, whole-house renovations, or commercial cleanouts in ${cityName}, a 30 or 40-yard dumpster provides the space you need. Our team at Calsan Dumpsters Pro can recommend the perfect size based on your specific project.`,
    },
    {
      heading: `Materials Accepted in ${cityName} Dumpsters`,
      body: `Our dumpster rental service in ${cityName} accepts a wide range of materials including household junk, furniture, drywall, wood, carpet, roofing shingles, and mixed construction debris. We also offer specialized heavy-material dumpsters for concrete, dirt, soil, brick, block, and asphalt — available in 5, 8, and 10-yard sizes with flat-fee pricing. Prohibited items include hazardous waste, paint, batteries, medical waste, and pressurized tanks.`,
    },
    {
      heading: `How Dumpster Delivery Works in ${cityName}`,
      body: `Dumpster rental in ${cityName} is commonly used for projects like home renovations, roofing, property cleanouts, and construction debris removal. Having a dumpster delivered directly to your property allows you to dispose of materials efficiently without multiple trips to the landfill. We offer same-day delivery for orders placed before noon, with flexible morning, midday, and afternoon windows. Your standard rental includes 7 days, with $35/day extensions available. We'll place the dumpster on your driveway or designated area and pick it up when you're done.`,
    },
    {
      heading: `Dumpster Permit Requirements in ${cityName}`,
      body: `If your dumpster is placed on private property like your driveway in ${cityName}, no permit is typically needed. If the dumpster must go on a public street or right-of-way, you'll likely need a permit from the ${cityName} public works department. We recommend placing dumpsters on driveways whenever possible. Our team can guide you on local ${cityName}${countyName ? ` (${countyName} County)` : ''} permit requirements.`,
    },
    {
      heading: `Popular ${cityName} Projects Using Dumpster Rentals`,
      body: `Homeowners and contractors in ${cityName} commonly rent dumpsters for kitchen and bathroom remodels, roof replacements, garage and basement cleanouts, landscaping projects, deck removal, estate cleanouts, and new construction. Commercial customers use our dumpsters for office renovations, warehouse cleanouts, retail buildouts, and demolition projects. Whatever your project in ${cityName}, we have the right size and service level.`,
    },
  ];
}

/**
 * Generate fallback FAQs when page has fewer than required
 */
export function generateFallbackFaqs(cityName: string, existingCount: number): ExpandedFaq[] {
  const allFaqs: ExpandedFaq[] = [
    {
      question: `What size dumpster do I need for my ${cityName} project?`,
      answer: `The right size depends on your project. A 10-yard dumpster works for small cleanouts and bathroom remodels. A 20-yard handles full room renovations and roofing. A 30-yard is ideal for major renovations, and a 40-yard suits large demolition and commercial projects. Call (510) 680-2150 for a personalized recommendation.`,
    },
    {
      question: `How much does dumpster rental cost in ${cityName}?`,
      answer: `Dumpster rental pricing in ${cityName} varies by size, material type, and distance from our yard. Prices start around $375 for a 10-yard general debris dumpster. Heavy material dumpsters (concrete, dirt) include flat-fee disposal. Use our online calculator for an instant, accurate quote.`,
    },
    {
      question: `How long can I keep the dumpster in ${cityName}?`,
      answer: `Standard rental includes 7 days. If you need more time, extensions are available at $35 per day. Just call us to extend — we're flexible and understand projects don't always go as planned.`,
    },
    {
      question: `Do I need a permit for a dumpster in ${cityName}?`,
      answer: `If the dumpster is placed on your driveway or private property, no permit is typically required. If it must go on a public street, you may need a permit from the ${cityName} public works department. We recommend driveway placement whenever possible.`,
    },
    {
      question: `Can I get same-day dumpster delivery in ${cityName}?`,
      answer: `Yes! Same-day delivery is available for orders placed before 12:00 PM. A $100 same-day surcharge applies. Standard orders are typically delivered the next business day.`,
    },
    {
      question: `What materials can I put in the dumpster?`,
      answer: `General debris dumpsters accept household junk, furniture, drywall, wood, carpet, roofing shingles, and mixed construction debris. Heavy-material dumpsters accept concrete, dirt, soil, brick, block, and asphalt. Hazardous waste, paint, batteries, and electronics are not accepted.`,
    },
    {
      question: `How does pricing work for heavy materials like concrete?`,
      answer: `Heavy material dumpsters (concrete, dirt, asphalt) are available in 5, 8, and 10-yard sizes only, with flat-fee pricing that includes disposal. No surprise weight charges. Loads must be clean — if mixed debris is found, overage rates of $165/ton apply.`,
    },
    {
      question: `What happens if I overfill the dumpster?`,
      answer: `Materials must not extend above the dumpster walls. Overfilled dumpsters cannot be legally transported and may incur additional fees. If you're running out of space, call us and we can arrange a swap or second dumpster delivery.`,
    },
  ];

  // Return only the FAQs needed to reach minimum 4
  const needed = Math.max(0, 4 - existingCount);
  return allFaqs.slice(0, Math.max(needed, 4));
}

/**
 * Generate local signal paragraph
 */
export function generateLocalSignal(cityName: string, countyName?: string, nearbyCities?: string[]): string {
  const nearby = nearbyCities?.length
    ? ` and surrounding areas including ${nearbyCities.slice(0, 4).join(', ')}`
    : ' and surrounding areas';
  const county = countyName ? ` in ${countyName} County` : '';
  return `Calsan Dumpsters Pro provides professional dumpster rental services in ${cityName}${county}${nearby}. Operating from local Bay Area yards, we offer faster delivery times and lower costs than national brokers. Our local teams know the ${cityName} area, local disposal facilities, and permit requirements.`;
}

/**
 * Get standard internal links for any SEO page
 */
export function getStandardInternalLinks(): Array<{ url: string; label: string }> {
  return STANDARD_INTERNAL_LINKS;
}
