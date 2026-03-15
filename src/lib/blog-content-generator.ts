// Blog Content Generator — expands seo-blog-topics.ts outlines into full articles
// Each generated article targets 900–1500 words with unique, substantive content

import { type SeoBlogTopic } from './seo-blog-topics';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from './shared-data';
import { BUSINESS_INFO } from './seo';

interface GeneratedArticle {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  date: string;
  readTime: string;
  category: string;
  sections: { heading: string; body: string }[];
  faqs: { question: string; answer: string }[];
  internalLinks: Array<{ url: string; anchorText: string }>;
  relatedSlugs: string[];
}

// Content expansion templates keyed by category + outline heading patterns
const CATEGORY_CONTENT: Record<string, Record<string, (topic: SeoBlogTopic) => string>> = {
  cost: {
    'pricing by size': () => DUMPSTER_SIZES_DATA.map(s =>
      `${s.yards}-Yard Dumpster: Starting from $${s.priceFrom}. Holds ${s.loads} (approximately ${s.includedTons} tons included). Dimensions: ${s.dimensions}. Best suited for ${s.useCases.slice(0, 2).join(' and ')}.`
    ).join('\n\n'),
    'heavy vs general': () =>
      `General debris dumpsters include a base tonnage allowance. Weight beyond the included amount is billed at $${PRICING_POLICIES.overagePerTonGeneral} per ton, verified by a certified scale ticket at the disposal facility. This is the standard pricing model for mixed waste, renovation debris, and household cleanouts.\n\nHeavy material dumpsters operate on a completely different model. Available in 5, 8, and 10 yard sizes only, these containers use flat-fee pricing. Disposal is included regardless of weight. For dense materials like concrete, dirt, and rock, flat-fee pricing eliminates the risk of surprise overage charges. A 5-yard dumpster filled with concrete can easily weigh 8 to 10 tons — under per-ton pricing, that would cost hundreds more than the flat fee.\n\nThe key rule: heavy material loads must be clean. Mixing concrete with wood, trash, or other general debris triggers reclassification to general debris rates with per-ton overage. Keep heavy materials separated for the best pricing.`,
    'budget tips': () =>
      `Right-size your dumpster. Ordering a container too large wastes money; ordering too small means paying for a second haul. A 20-yard handles most single-room renovations and cleanouts. For concrete or dirt, use a dedicated heavy material container to lock in flat-fee pricing.\n\nSchedule ahead when possible. Same-day delivery carries a $${PRICING_POLICIES.sameDayDelivery} premium over standard next-business-day service. Planning your delivery 24 to 48 hours in advance avoids this surcharge.\n\nSeparate materials. If your project generates both heavy materials (concrete, brick) and general debris (wood, drywall, trash), use two separate containers. The heavy material dumpster qualifies for flat-fee pricing, while the general debris container uses standard per-ton rates. This separation almost always costs less than throwing everything into one large container.\n\nAsk about volume pricing. If you need multiple dumpsters over the course of a project — common for ADU builds, whole-house renovations, and commercial tenant improvements — volume pricing may apply. Regular customers and contractors with recurring needs qualify for preferred rates.`,
  },
  permits: {
    'when permits are needed': (topic) =>
      `Whether you need a permit depends entirely on WHERE the dumpster is placed — not the size or duration of your rental.\n\nPrivate property placement (your driveway, yard, or private lot) does NOT require a permit in ${topic.targetCity || 'most Bay Area cities'}. This is the most common placement for residential customers and avoids any permitting process entirely.\n\nPublic right-of-way placement (the street in front of your home, a public sidewalk, or any city-owned property) DOES require an encroachment permit from the local Department of Transportation or Public Works.\n\nThe distinction matters because permit applications take time — typically 3 to 7 business days — and carry fees that vary by jurisdiction. If your project timeline is tight, driveway placement is the fastest option.`,
    'application process': (topic) =>
      `To obtain a dumpster placement permit in ${topic.targetCity || 'your city'}:\n\n1. Contact the local Department of Transportation or Public Works office. Most Bay Area cities have online application portals.\n2. Specify the exact placement location, including street address and side of the street.\n3. Indicate the dumpster size and expected duration (typically 3 to 14 days).\n4. Pay the application fee — fees range from $50 to $250 depending on the city, location, and duration.\n5. Allow 3 to 7 business days for processing. Some cities offer expedited processing for an additional fee.\n6. Once approved, the permit must be displayed on or near the dumpster for the duration of the rental.\n\nOur team is familiar with permit requirements across the Bay Area. While we do not apply for permits on your behalf, we can advise on the process and recommend the best placement strategy to avoid permits when possible.`,
    'driveway vs street': () =>
      `Driveway placement is the preferred option for most residential customers. It avoids the permitting process, keeps the dumpster on your private property, and is typically more convenient for loading.\n\nTo protect your driveway surface, place plywood sheets or thick boards under the dumpster contact points. This distributes weight and prevents scratching or cracking on concrete and asphalt driveways.\n\nStreet placement becomes necessary when:\n- Your driveway cannot accommodate the dumpster size\n- The driveway has limited access (low-hanging wires, narrow entrance)\n- The project requires the driveway to remain clear for other vehicles or equipment\n- There is no driveway (common in dense urban areas)\n\nWhen street placement is required, apply for the permit before scheduling delivery. We can coordinate delivery timing with your permit approval.`,
  },
  sizing: {
    'size comparison': () =>
      DUMPSTER_SIZES_DATA.map(s =>
        `${s.yards}-Yard Dumpster\nDimensions: ${s.dimensions}\nCapacity: ${s.loads}\nIncluded weight: ${s.includedTons} tons\nStarting from: $${s.priceFrom}\nBest for: ${s.useCases.join(', ')}`
      ).join('\n\n'),
    'by project type': () =>
      `Small bathroom remodel or single-room cleanout: 6 to 10 yard. These compact containers fit in tight driveways and hold the equivalent of 2 to 4 pickup truck loads.\n\nKitchen remodel or garage cleanout: 10 to 20 yard. Kitchen demolition generates cabinets, countertops, flooring, and appliances — a 10-yard handles most kitchens, but full gut renovations may need a 20-yard.\n\nWhole-room renovation or roofing job: 20 to 30 yard. A standard residential roof tearoff fills a 20-yard dumpster. Multi-layer roofs or larger homes may need a 30-yard.\n\nEstate cleanout or whole-house renovation: 30 to 40 yard. Full estate cleanouts with furniture, appliances, and accumulated belongings from every room typically require a 30 or 40 yard container.\n\nCommercial project, warehouse cleanout, or demolition: 40 to 50 yard. Large-scale commercial work generates high volumes of debris. The 50-yard container holds up to 20 pickup truck loads.`,
    'when to size up': () =>
      `A common mistake is choosing a dumpster that is too small to save money upfront. In practice, needing a second container almost always costs more than ordering the next size up from the start.\n\nConsider sizing up when:\n- Your project scope is uncertain or may expand\n- You are combining debris from multiple rooms or areas\n- The materials include bulky items (furniture, appliances, cabinetry)\n- You have both light and heavy materials mixed together\n\nConversely, you can size down when:\n- The project is clearly defined and materials are predictable\n- You are disposing of dense, heavy materials (concrete, dirt) where volume is less of an issue than weight\n- You have access to separate containers for different material types`,
  },
  materials: {
    'flat-fee pricing': () =>
      `Heavy material dumpsters — available in 5, 8, and 10 yard sizes — use flat-fee pricing. This means the quoted price includes delivery, pickup, rental period, AND disposal, with no per-ton overage charges.\n\nThis pricing model exists because heavy materials like concrete, dirt, and rock are predictably dense. A 5-yard dumpster of concrete weighs roughly 8 to 10 tons. Under standard per-ton pricing at $${PRICING_POLICIES.overagePerTonGeneral}/ton overage, the disposal cost alone would far exceed the flat fee.\n\nFlat-fee pricing benefits the customer by providing cost certainty and benefits the operator by ensuring loads go to appropriate recycling facilities rather than mixed-waste landfills.\n\nThe trade-off: flat-fee containers must contain ONLY the specified heavy material. Any contamination with general debris (wood, plastic, drywall, household trash) triggers reclassification to general debris rates.`,
    'clean load requirements': () =>
      `A "clean load" means the dumpster contains only the specified heavy material with no contamination from other waste types.\n\nFor concrete dumpsters: Only concrete, block, brick, and masonry. Rebar is acceptable if cut below the fill line. No wood, drywall, plastic, or general trash.\n\nFor dirt dumpsters: Only clean fill dirt, topsoil, clay, or sand. No rocks larger than 12 inches, no vegetation or root balls, no contaminated soil.\n\nFor mixed heavy dumpsters: Concrete, asphalt, brick, block, and rock may be combined in one container. No general debris.\n\nWhy this matters: Disposal facilities that accept heavy materials for recycling require clean, source-separated loads. If contamination is found, the entire load is redirected to a general waste facility at higher cost — and the customer is billed accordingly.\n\nOur drivers conduct a visual inspection at pickup. If contamination is visible, the load classification may change before transport.`,
    'disposal facilities': () =>
      `The Bay Area has several certified facilities that process heavy materials for recycling:\n\nOakland: Argent Materials on Baldwin Street processes concrete and asphalt into recycled aggregate for road base and construction fill.\n\nSan Jose: Zanker Recycling handles concrete, dirt, and mixed construction debris with one of the highest diversion rates in the region.\n\nHayward: Davis Street Transfer Station accepts concrete, dirt, and green waste with separate processing streams.\n\nSan Francisco: Recology SF manages construction and demolition debris with material recovery facilities that sort and recycle applicable materials.\n\nWe route each load to the most appropriate facility based on material type and pickup location. Customers do not need to arrange disposal independently — fill the dumpster with clean material, and we handle the rest.`,
  },
  guides: {
    'scheduling': () =>
      `Effective dumpster scheduling aligns container availability with your project phases. For renovation projects, the typical pattern is:\n\nPhase 1 — Demolition: Schedule the first dumpster for the start of demolition. This catches the heaviest debris volume. If the project involves concrete removal, use a separate heavy material container for this phase.\n\nPhase 2 — Construction: As framing, rough-in, and finish work progress, a second container handles ongoing construction waste (wood scraps, packaging, cutoffs, drywall).\n\nPhase 3 — Final cleanup: A smaller container for the last sweep — leftover materials, packaging, and general cleanup debris.\n\nFor ADU construction and whole-house renovations, plan for 2 to 4 dumpster loads over the project duration. Our swap service allows seamless container exchanges — when one fills up, we swap it for an empty one, often same-day.\n\nStandard rental period is ${PRICING_POLICIES.standardRentalDays} days. Extensions are available at $${PRICING_POLICIES.extraDayCost} per additional day.`,
    'what can go in': () =>
      `Accepted materials in general debris dumpsters:\n- Construction and renovation debris (wood, drywall, insulation, roofing)\n- Household items (furniture, appliances without refrigerant, mattresses)\n- Yard waste (branches, leaves, grass clippings)\n- Cardboard, paper, and packaging\n- Carpet and flooring materials\n- Cabinets, countertops, and fixtures\n\nNOT accepted in any dumpster:\n- Hazardous waste (paint, solvents, chemicals, pesticides)\n- Asbestos-containing materials\n- Tires (accepted separately with additional fee)\n- Batteries (lithium, lead-acid)\n- Appliances containing refrigerant (refrigerators, AC units — must be certified free of refrigerant)\n- Medical waste\n- Electronic waste (computers, monitors, TVs)\n\nWhen in doubt, call us before loading. Prohibited items found during pickup may result in load rejection or additional fees.`,
    'cost expectations': () =>
      `Dumpster rental pricing depends on three factors: container size, material type, and delivery location.\n\nContainer size: Prices start from $${DUMPSTER_SIZES_DATA[0].priceFrom} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard and go up to $${DUMPSTER_SIZES_DATA[DUMPSTER_SIZES_DATA.length - 1].priceFrom} for a ${DUMPSTER_SIZES_DATA[DUMPSTER_SIZES_DATA.length - 1].yards}-yard. Each size includes a base tonnage allowance.\n\nMaterial type: General debris uses standard per-ton overage ($${PRICING_POLICIES.overagePerTonGeneral}/ton beyond included weight). Heavy materials (concrete, dirt) use flat-fee pricing with no overage.\n\nDelivery location: Pricing varies slightly by distance from our yards. For exact pricing specific to your ZIP code, use our online quote tool.\n\nAdditional costs to plan for:\n- Same-day delivery: +$${PRICING_POLICIES.sameDayDelivery}\n- Extended rental: $${PRICING_POLICIES.extraDayCost}/day beyond standard ${PRICING_POLICIES.standardRentalDays}-day period\n- Overage on general debris: $${PRICING_POLICIES.overagePerTonGeneral}/ton`,
  },
  local: {
    'service coverage': (topic) =>
      `${topic.targetCity || 'This area'} falls within our primary service territory, served from our Oakland yard at 1000 46th Ave. Delivery is available to all residential and commercial addresses within the city limits.\n\nDelivery windows:\n- Morning: 7:00 AM to 11:00 AM\n- Midday: 11:00 AM to 3:00 PM\n- Afternoon: 3:00 PM to 6:00 PM\n\nSame-day delivery is available for orders placed before noon, subject to container availability. Standard service is next-business-day delivery.\n\nOur drivers are familiar with ${topic.targetCity || 'local'} streets, neighborhoods, and access requirements. Whether your project is in a residential neighborhood, a commercial district, or a hillside area, we can accommodate delivery and pickup.`,
    'available sizes': () =>
      `All standard sizes are available for delivery:\n\n` + DUMPSTER_SIZES_DATA.map(s =>
        `${s.yards}-Yard: From $${s.priceFrom} — ${s.loads}. ${s.dimensions}.`
      ).join('\n') + `\n\nHeavy material containers (5, 8, 10 yard) are also available for concrete, dirt, and rock at flat-fee pricing. Contact us for current flat-fee rates.`,
    'typical project types': (topic) =>
      `Common projects in ${topic.targetCity || 'this area'} that use our dumpster service:\n\nHome renovation: Kitchen and bathroom remodels, room additions, flooring replacement. The 10 and 20 yard sizes are most popular for residential renovation work.\n\nEstate and whole-house cleanouts: Properties changing hands often need full cleanout service. The 30 and 40 yard sizes handle entire households efficiently.\n\nLandscaping and yard work: Tree removal, deck demolition, fence replacement, and hardscape projects generate debris that is too bulky for curbside collection.\n\nConstruction: New builds, ADUs, and additions require ongoing waste management throughout the construction timeline. We offer swap service for multi-load projects.\n\nCommercial tenant improvements: Office buildouts, retail renovations, and warehouse cleanouts are common in the area. We serve contractors and property managers with priority scheduling and volume pricing.`,
    'permit info': (topic) =>
      `Dumpster placement on private property (driveways, yards, private lots) does not require a permit in ${topic.targetCity || 'most Bay Area cities'}.\n\nStreet placement requires an encroachment permit from the local Public Works or Transportation department. Processing typically takes 3 to 7 business days.\n\nTo avoid the permit process entirely, place the dumpster on your driveway. Use plywood boards under the contact points to protect your driveway surface.\n\nContact us if you need guidance on placement options for your specific address. Our team can recommend the best approach based on your property layout and project needs.`,
  },
};

function expandOutlineSection(topic: SeoBlogTopic, outlineItem: string): string {
  const normalizedItem = outlineItem.toLowerCase();

  // Search category-specific content
  const categoryContent = CATEGORY_CONTENT[topic.category];
  if (categoryContent) {
    for (const [key, generator] of Object.entries(categoryContent)) {
      if (normalizedItem.includes(key) || key.split(' ').some(w => normalizedItem.includes(w))) {
        return generator(topic);
      }
    }
  }

  // Cross-category matches
  if (normalizedItem.includes('pricing') || normalizedItem.includes('cost')) {
    return CATEGORY_CONTENT.guides?.['cost expectations']?.(topic) ||
      `Pricing for this service starts from $${DUMPSTER_SIZES_DATA[0].priceFrom} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard container. Each dumpster includes delivery, pickup, and a ${PRICING_POLICIES.standardRentalDays}-day rental period with base tonnage allowance. Heavy material containers (5, 8, 10 yard) are available with flat-fee pricing — no weight overage charges. For exact pricing based on your address and project type, use our instant quote tool at ${BUSINESS_INFO.url}/quote.`;
  }
  if (normalizedItem.includes('size') || normalizedItem.includes('dimension')) {
    return CATEGORY_CONTENT.sizing?.['size comparison']?.(topic) || '';
  }
  if (normalizedItem.includes('permit')) {
    return CATEGORY_CONTENT.permits?.['driveway vs street']?.(topic) || '';
  }
  if (normalizedItem.includes('flat') || normalizedItem.includes('heavy')) {
    return CATEGORY_CONTENT.materials?.['flat-fee pricing']?.(topic) || '';
  }
  if (normalizedItem.includes('recycl') || normalizedItem.includes('facility') || normalizedItem.includes('disposal')) {
    return CATEGORY_CONTENT.materials?.['disposal facilities']?.(topic) || '';
  }
  if (normalizedItem.includes('schedule') || normalizedItem.includes('swap') || normalizedItem.includes('timeline')) {
    return CATEGORY_CONTENT.guides?.['scheduling']?.(topic) || '';
  }
  if (normalizedItem.includes('accept') || normalizedItem.includes('what can') || normalizedItem.includes('what goes')) {
    return CATEGORY_CONTENT.guides?.['what can go in']?.(topic) || '';
  }
  if (normalizedItem.includes('clean load') || normalizedItem.includes('contamination') || normalizedItem.includes('separation')) {
    return CATEGORY_CONTENT.materials?.['clean load requirements']?.(topic) || '';
  }

  // Fallback: generate contextual content from topic metadata
  const cityRef = topic.targetCity ? ` in ${topic.targetCity}` : ' in the Bay Area';
  return `${capitalizeFirst(outlineItem)} is an important consideration for dumpster rental projects${cityRef}. Understanding this aspect helps you make informed decisions about container selection, scheduling, and cost management.\n\nAt Calsan Dumpsters Pro, we provide guidance on ${outlineItem.toLowerCase()} based on decades of local experience. Our team has handled thousands of projects across Oakland, Berkeley, San Jose, and the greater Bay Area.\n\nFor specific questions about ${outlineItem.toLowerCase()}, contact our team at ${BUSINESS_INFO.phone.salesFormatted}. We are available ${BUSINESS_INFO.hours.customerService.days}, ${BUSINESS_INFO.hours.customerService.hours}.`;
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function estimateReadTime(sections: { body: string }[]): string {
  const totalWords = sections.reduce((sum, s) => sum + s.body.split(/\s+/).length, 0);
  const minutes = Math.max(4, Math.ceil(totalWords / 200));
  return `${minutes} min read`;
}

const CATEGORY_LABELS: Record<string, string> = {
  cost: 'Pricing',
  permits: 'Permits',
  sizing: 'Sizing',
  materials: 'Materials',
  guides: 'Guides',
  local: 'Local',
};

const TOPIC_DATES: Record<string, string> = {
  'dumpster-rental-cost-san-francisco': 'January 30, 2026',
  'roofing-dumpster-size-guide': 'January 25, 2026',
  'kitchen-remodel-dumpster-guide': 'January 22, 2026',
  'dumpster-permit-oakland': 'January 18, 2026',
  'adu-construction-dumpster-guide': 'January 14, 2026',
  'dumpster-rental-hayward-ca': 'January 10, 2026',
  'dumpster-rental-berkeley-ca': 'January 6, 2026',
  'dirt-removal-dumpster-bay-area': 'January 3, 2026',
  'commercial-construction-dumpster-rental': 'December 28, 2025',
  'dumpster-weight-limits-explained': 'December 22, 2025',
  'estate-cleanout-dumpster-guide': 'December 18, 2025',
  'demolition-debris-disposal-bay-area': 'December 14, 2025',
};

export function generateArticleFromTopic(topic: SeoBlogTopic): GeneratedArticle {
  const sections = topic.outline.map(outlineItem => ({
    heading: capitalizeFirst(outlineItem),
    body: expandOutlineSection(topic, outlineItem),
  }));

  // Add a closing section linking to /quote
  sections.push({
    heading: 'Get Started Today',
    body: `Ready to move forward with your project? Get an instant quote from Calsan Dumpsters Pro. Enter your ZIP code and project details for pricing specific to your address. Our team is available ${BUSINESS_INFO.hours.customerService.days}, ${BUSINESS_INFO.hours.customerService.hours} at ${BUSINESS_INFO.phone.salesFormatted}.\n\nWe serve ${topic.targetCity || 'the entire Bay Area'} with same-day delivery available for orders placed before noon. No broker markups — direct-from-operator pricing from our local yards.`,
  });

  // Build related slugs from internal links
  const relatedSlugs = topic.internalLinks
    .filter(l => l.url.startsWith('/blog/'))
    .map(l => l.url.replace('/blog/', ''));

  return {
    slug: topic.slug,
    title: topic.title,
    metaTitle: topic.title.length <= 60 ? topic.title : topic.title.substring(0, 57) + '...',
    metaDescription: topic.metaDescription,
    h1: topic.title,
    date: TOPIC_DATES[topic.slug] || 'January 1, 2026',
    readTime: estimateReadTime(sections),
    category: CATEGORY_LABELS[topic.category] || topic.category,
    sections,
    faqs: topic.faqs,
    internalLinks: topic.internalLinks,
    relatedSlugs,
  };
}
