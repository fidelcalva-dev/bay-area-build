// New Market Template — Reusable structure for launching vendor-supported locations
// Every new market must pass this template checklist before going live

export interface NewMarketTemplate {
  // A. Market Identity
  identity: {
    marketName: string;
    city: string;
    county: string;
    state: string;
    serviceModel: 'DIRECT_OPERATION' | 'PARTNER_NETWORK';
    nearestYard: string;
    regionHub: string;
    slug: string;
  };

  // B. Page Structure
  pages: {
    cityPage: boolean;
    regionPage: boolean;
    zipPages: string[];       // Approved ZIP codes
    useCasePages: string[];   // Linked use-case slugs
    materialPages: string[];  // Linked material slugs
    sizePages: number[];      // Linked size yards
  };

  // C. Public Copy Blocks
  copy: {
    localHero: string;
    serviceExplanation: string;
    trustCopy: string;
    projectTypes: string[];
    faqs: Array<{ question: string; answer: string }>;
    partnerWording?: string;  // Honest coordinated-service copy for PARTNER_NETWORK
  };

  // D. CRM / Ops Fields
  ops: {
    marketTag: string;
    serviceRadiusMiles: number;
    vendorPartnerId?: string;
    pricingZone: string;
    dumpSites: string[];
    customerSla: string;
    quoteFlowEnabled: boolean;
    dispatchRules: string;
  };

  // E. SEO / Local Signals
  seo: {
    nearbyCities: string[];
    countyContext: string;
    internalLinks: string[];
    quoteCta: string;
    serviceAreaNotes: string;
    reviewReadiness: boolean;
    photoReadiness: boolean;
  };

  // F. Launch Gate
  launchGate: {
    templateComplete: boolean;
    vendorConfirmed: boolean;
    pricingSet: boolean;
    copyApproved: boolean;
    indexable: boolean;
    activatedAt?: string;
  };
}

// ============================================================
// VENDOR MARKET TEMPLATE — Additional fields for partner markets
// ============================================================
export interface VendorMarketTemplate extends NewMarketTemplate {
  vendor: {
    vendorPartnerId: string;
    vendorName: string;
    coverageRadiusMiles: number;
    sla: string;
    acceptedMaterials: string[];
    pricingMethod: 'FLAT_RATE' | 'ZONE_BASED' | 'NEGOTIATED';
    escalationContact: string;
    active: boolean;
  };
}

// ============================================================
// EXPANSION TIERS
// ============================================================
export const EXPANSION_TIERS = {
  TIER_1: {
    label: 'Tier 1 — Near Bay Area',
    markets: ['hollister', 'modesto', 'stockton', 'sacramento', 'santa-rosa'],
    prerequisite: 'Local readiness HIGH',
  },
  TIER_2: {
    label: 'Tier 2 — Statewide',
    markets: ['bakersfield', 'los-angeles', 'san-diego'],
    prerequisite: 'Tier 1 markets active + 90-day review',
  },
} as const;

// ============================================================
// TEMPLATE FACTORY
// ============================================================
export function createMarketTemplate(
  city: string,
  county: string,
  serviceModel: 'DIRECT_OPERATION' | 'PARTNER_NETWORK',
  nearestYard: string,
  regionHub: string,
): NewMarketTemplate {
  const slug = city.toLowerCase().replace(/\s+/g, '-');
  const isPartner = serviceModel === 'PARTNER_NETWORK';

  return {
    identity: {
      marketName: `${city} Dumpster Rental`,
      city,
      county,
      state: 'CA',
      serviceModel,
      nearestYard,
      regionHub,
      slug,
    },
    pages: {
      cityPage: true,
      regionPage: false,
      zipPages: [],
      useCasePages: ['home-renovation', 'construction-cleanup', 'garage-cleanout'],
      materialPages: ['general-debris', 'concrete', 'soil'],
      sizePages: [10, 20, 30],
    },
    copy: {
      localHero: `Dumpster Rental in ${city}, CA — Fast Local Delivery`,
      serviceExplanation: isPartner
        ? `Professional dumpster rental in ${city} through our coordinated local service network. Same quality standards, reliable delivery.`
        : `Direct dumpster rental in ${city} from our ${nearestYard} yard. Same-day delivery available.`,
      trustCopy: isPartner
        ? 'Service coordinated through our trusted logistics network with the same Calsan quality standards.'
        : `Dispatched directly from our ${nearestYard} yard — no brokers, no middlemen.`,
      projectTypes: ['Home Renovation', 'Construction', 'Garage Cleanout', 'Roofing', 'Landscaping'],
      faqs: [
        { question: `What dumpster sizes are available in ${city}?`, answer: 'We offer 5, 8, 10, 20, 30, 40, and 50 yard dumpsters for general debris. Heavy materials (soil, concrete) are available in 5, 8, and 10 yard sizes.' },
        { question: `How fast can I get a dumpster delivered in ${city}?`, answer: isPartner ? 'Most deliveries in the area are completed within 24–48 hours.' : 'Same-day and next-day delivery available for most orders.' },
        { question: 'What materials can I put in the dumpster?', answer: 'General construction debris, household junk, yard waste, concrete, soil, and roofing materials. Hazardous waste, tires, and appliances with refrigerant are not accepted.' },
        { question: 'How long can I keep the dumpster?', answer: 'Standard rental includes 7 days. Extensions available at $35/day.' },
        { question: `Do I need a permit for a dumpster in ${city}?`, answer: 'If placed on a public street, a permit may be required. We can help coordinate. Dumpsters on private property typically do not need a permit.' },
        { question: 'What happens if I go over the weight limit?', answer: 'Additional weight is charged at the posted overage rate per ton. We always communicate this upfront.' },
      ],
      partnerWording: isPartner ? `Service in ${city} is provided through our coordinated logistics network — same Calsan standards, local delivery.` : undefined,
    },
    ops: {
      marketTag: slug,
      serviceRadiusMiles: isPartner ? 30 : 15,
      pricingZone: isPartner ? 'partner_standard' : 'bay_area_core',
      dumpSites: [],
      customerSla: isPartner ? '48h delivery' : 'Same-day available',
      quoteFlowEnabled: true,
      dispatchRules: isPartner ? 'Route to vendor partner' : 'Direct yard dispatch',
    },
    seo: {
      nearbyCities: [],
      countyContext: `${county}, California`,
      internalLinks: ['/quote', '/sizes', '/materials', '/pricing'],
      quoteCta: 'Get Exact Price',
      serviceAreaNotes: `Serving ${city} and surrounding ${county} communities.`,
      reviewReadiness: false,
      photoReadiness: false,
    },
    launchGate: {
      templateComplete: false,
      vendorConfirmed: !isPartner,
      pricingSet: false,
      copyApproved: false,
      indexable: false,
    },
  };
}
