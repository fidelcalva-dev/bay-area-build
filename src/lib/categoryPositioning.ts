// Category Positioning - Single Source of Truth
// This file centralizes all category messaging for brand differentiation

export const CATEGORY_PHRASE = 'ZIP-Based Dumpster Rentals with Local Yards';
export const CATEGORY_TAGLINE = 'Powered by Real Local Yards, Not Brokers';

// Why Local Yards Matter - Benefits
export const LOCAL_YARD_BENEFITS = [
  {
    id: 'faster-delivery',
    title: 'Faster Delivery',
    shortText: 'Short distance means quicker arrivals',
    description: 'When your dumpster comes from a nearby yard, delivery windows are tighter and more reliable. Less driving means more accurate ETAs.',
  },
  {
    id: 'real-availability',
    title: 'Accurate Availability',
    shortText: 'Real inventory, not guesswork',
    description: 'We know exactly what\'s in our yards. No calling around to subcontractors or hoping someone is free.',
  },
  {
    id: 'lower-cost',
    title: 'Lower Transport Distance',
    shortText: 'Less fuel, fewer surcharges',
    description: 'Shorter hauls mean lower costs that we can pass on to you. No mysterious "distance fees" tacked on at the end.',
  },
  {
    id: 'fewer-surprises',
    title: 'Fewer Surprise Fees',
    shortText: 'Transparent, predictable pricing',
    description: 'We control the process end-to-end. No middlemen adding markups or unexpected charges.',
  },
  {
    id: 'better-accountability',
    title: 'Better Accountability',
    shortText: 'One company, one point of contact',
    description: 'If something goes wrong, you\'re not bounced between a broker and a subcontractor. We own the problem and fix it.',
  },
] as const;

// Broker vs Local Yard Comparison - Factual, Neutral
export const COMPARISON_DATA = {
  headers: ['Factor', 'Broker Model', 'Local Yard Operator'],
  rows: [
    {
      factor: 'Who owns the dumpsters?',
      broker: 'Various subcontractors',
      localYard: 'We own and manage our fleet',
    },
    {
      factor: 'Dispatch control',
      broker: 'Passed to third parties',
      localYard: 'Dispatched directly from local yards',
    },
    {
      factor: 'Pricing transparency',
      broker: 'May vary by subcontractor',
      localYard: 'ZIP-based pricing from our system',
    },
    {
      factor: 'Customer service',
      broker: 'Multiple points of contact',
      localYard: 'One team handles everything',
    },
    {
      factor: 'Same-day availability',
      broker: 'Depends on vendor availability',
      localYard: 'Based on real inventory at nearby yard',
    },
    {
      factor: 'Delivery accuracy',
      broker: 'Varies by vendor',
      localYard: 'Drivers know local routes',
    },
  ],
} as const;

// How Calsan Operates - Transparency
export const OPERATIONAL_MODEL = {
  points: [
    'We own and maintain a fleet of dumpsters',
    'We operate multiple yards across the Bay Area',
    'We dispatch from the location nearest to you',
    'We manage pricing and scheduling directly',
    'We work with trusted partners when needed, but always manage dispatch and pricing ourselves',
  ],
  disclaimer: 'We work with trusted partners when needed, but always manage dispatch and pricing directly.',
} as const;

// How It Works Steps - Detailed
export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Enter Your ZIP Code',
    description: 'We instantly identify the nearest operational yard to your location for faster service.',
    detail: 'ZIP-based routing ensures accurate pricing and availability.',
  },
  {
    step: 2,
    title: 'Nearest Yard Selected',
    description: 'Our system automatically routes your order to the closest yard with available inventory.',
    detail: 'Shorter distance = faster delivery + lower transport costs.',
  },
  {
    step: 3,
    title: 'See Real Availability & Price',
    description: 'View actual dumpster inventory and transparent pricing—no hidden fees or surprise markups.',
    detail: 'What you see is what you pay.',
  },
  {
    step: 4,
    title: 'Schedule Your Delivery',
    description: 'Pick a delivery window that works for you. Same-day may be available depending on capacity.',
    detail: 'Flexible scheduling with text confirmations.',
  },
  {
    step: 5,
    title: 'Track & Manage Online',
    description: 'Monitor your order, request pickup, and manage everything from your portal.',
    detail: 'Full visibility from order to completion.',
  },
] as const;

// FAQ for Differentiation Pages
export const DIFFERENTIATION_FAQS = [
  {
    question: 'Are you a broker?',
    answer: 'No. We own and manage dumpsters at local yards. We dispatch directly and control pricing. We work with trusted partners when volume requires, but we manage the relationship and service quality.',
  },
  {
    question: 'Why is your price different from other websites?',
    answer: 'Our pricing is ZIP-based and reflects the actual distance from our nearest yard. Brokers often show low teaser prices, then add fees or match you with a distant vendor. Our price is transparent from the start.',
  },
  {
    question: 'How do you guarantee availability?',
    answer: 'We track inventory in real-time at each yard. When you get a quote, it\'s based on actual dumpster availability at the nearest location—not a hope that some subcontractor is free.',
  },
  {
    question: 'What if something goes wrong?',
    answer: 'You call us directly. One team handles your issue from start to finish. No finger-pointing between brokers and vendors.',
  },
  {
    question: 'Do you ever use subcontractors?',
    answer: 'We may partner with trusted operators for specific areas or high-demand periods, but we always manage the dispatch, pricing, and customer relationship directly.',
  },
] as const;

// Trust Badges for Quote Flow
export interface LocalYardBadgeData {
  yardName: string;
  distanceMiles: number;
}

export function getLocalYardBadgeText(data: LocalYardBadgeData): string {
  return `Dispatched from ${data.yardName} • ${data.distanceMiles.toFixed(1)} mi away`;
}

export function getPricingExplanation(yardCity: string): string {
  return `This price is based on distance from our ${yardCity} yard.`;
}

// SEO Snippets
export const SEO_SNIPPETS = {
  localYardNear: (city: string) => `Local yard near ${city}`,
  realAvailability: 'Real availability based on inventory',
  sameDayWhenAvailable: 'Same-day delivery when available',
  zipBasedPricing: 'ZIP-based pricing with no hidden fees',
} as const;
