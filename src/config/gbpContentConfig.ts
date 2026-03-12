/**
 * Google Business Profile Content Configuration
 * Single source of truth for GBP optimization strategy.
 */

import { BUSINESS_INFO } from './localPresenceConfig';

// ─── GBP Audit Report ────────────────────────────────────────────

export interface GbpAuditField {
  field: string;
  currentValue: string;
  issue: string | null;
  recommendedFix: string | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'ok' | 'needs_fix' | 'missing' | 'review';
}

export const GBP_AUDIT_REPORT: GbpAuditField[] = [
  { field: 'Verification Status', currentValue: 'Verified (Oakland)', issue: null, recommendedFix: null, priority: 'critical', status: 'ok' },
  { field: 'Business Name', currentValue: BUSINESS_INFO.name, issue: null, recommendedFix: null, priority: 'critical', status: 'ok' },
  { field: 'Primary Category', currentValue: 'Dumpster Rental Service', issue: null, recommendedFix: null, priority: 'critical', status: 'ok' },
  { field: 'Additional Categories', currentValue: '2 set', issue: 'May need expansion', recommendedFix: 'Add up to 9 relevant categories', priority: 'high', status: 'needs_fix' },
  { field: 'Business Description', currentValue: 'Set', issue: 'May not match approved copy', recommendedFix: 'Replace with approved 750-char description', priority: 'high', status: 'review' },
  { field: 'Services Listed', currentValue: 'Partial', issue: 'Incomplete service groups', recommendedFix: 'Add full structured service list', priority: 'high', status: 'needs_fix' },
  { field: 'Service Areas', currentValue: '~10 set', issue: 'Under-utilizing 20-area limit', recommendedFix: 'Expand to 20 priority markets', priority: 'high', status: 'needs_fix' },
  { field: 'Hours', currentValue: 'Mon–Sun 6AM–9PM', issue: null, recommendedFix: null, priority: 'medium', status: 'ok' },
  { field: 'Phone', currentValue: BUSINESS_INFO.primaryPhone, issue: null, recommendedFix: null, priority: 'critical', status: 'ok' },
  { field: 'Website', currentValue: BUSINESS_INFO.website, issue: null, recommendedFix: null, priority: 'critical', status: 'ok' },
  { field: 'Quote Link', currentValue: 'Not set', issue: 'Missing appointment/quote URL', recommendedFix: 'Set to /quote', priority: 'high', status: 'missing' },
  { field: 'Photo Count', currentValue: '<10', issue: 'Below recommended minimum', recommendedFix: 'Upload 20+ geo-tagged photos', priority: 'high', status: 'needs_fix' },
  { field: 'Review Count', currentValue: 'Low', issue: 'Needs growth', recommendedFix: 'Activate review request engine', priority: 'high', status: 'needs_fix' },
  { field: 'Average Rating', currentValue: 'TBD', issue: 'Monitor', recommendedFix: 'Maintain 4.5+ target', priority: 'medium', status: 'review' },
  { field: 'Latest Post Date', currentValue: 'Unknown', issue: 'Posts may be stale', recommendedFix: 'Publish weekly', priority: 'medium', status: 'review' },
  { field: 'Q&A Coverage', currentValue: 'None', issue: 'Empty Q&A section', recommendedFix: 'Seed with 6+ Q&A entries', priority: 'medium', status: 'missing' },
];

// ─── Category Strategy ───────────────────────────────────────────

export interface GbpCategory {
  name: string;
  type: 'primary' | 'additional';
  rationale: string;
  verified: boolean;
}

export const GBP_CATEGORIES: GbpCategory[] = [
  { name: 'Dumpster Rental Service', type: 'primary', rationale: 'Most specific available category for roll-off dumpster rental', verified: true },
  { name: 'Waste Management Service', type: 'additional', rationale: 'Broad category covering debris disposal operations', verified: true },
  { name: 'Roll Off Dumpster Rental', type: 'additional', rationale: 'Directly describes core service offering', verified: false },
  { name: 'Construction & Demolition Waste Service', type: 'additional', rationale: 'Supports contractor and construction project targeting', verified: false },
  { name: 'Junk Removal Service', type: 'additional', rationale: 'Captures adjacent cleanup search intent', verified: false },
  { name: 'Recycling Center', type: 'additional', rationale: 'Relevant if recycling/diversion is part of operations', verified: false },
];

// ─── Business Descriptions ──────────────────────────────────────

export const GBP_DESCRIPTIONS = {
  primary: 'Calsan Dumpsters Pro provides roll-off dumpster rental and debris hauling support across the Bay Area and selected California markets. We help homeowners, contractors, and businesses with cleanouts, remodeling, roofing, construction debris, soil, and concrete disposal using transparent pricing and professional coordination. Serving core Bay Area operations from Oakland and San Jose, Calsan focuses on fast scheduling, clear service terms, and reliable local support.',
  directMarket: 'Calsan Dumpsters Pro delivers roll-off dumpster rental from our local yards in Oakland and San Jose. We serve homeowners, contractors, and businesses with cleanouts, remodeling, roofing, construction debris, and heavy material disposal. Fast scheduling, transparent pricing, and direct local operations.',
  networkMarket: 'Calsan Dumpsters Pro coordinates reliable dumpster rental service across California through a trusted logistics network. We help homeowners, contractors, and businesses with project debris, cleanouts, and construction waste removal with transparent pricing and professional support.',
} as const;

// ─── Service Areas (Priority Order, max 20) ─────────────────────

export const GBP_SERVICE_AREAS: string[] = [
  'Oakland', 'San Jose', 'San Francisco', 'Berkeley',
  'Alameda', 'San Leandro', 'Hayward', 'Fremont',
  'Walnut Creek', 'Concord', 'Pleasanton', 'Dublin',
  'Livermore', 'Santa Clara', 'Sunnyvale', 'Mountain View',
  'Sacramento', 'Stockton', 'Modesto', 'Santa Rosa',
];

// ─── Services Structure ─────────────────────────────────────────

export interface GbpServiceGroup {
  group: string;
  services: { name: string; description: string }[];
}

export const GBP_SERVICES: GbpServiceGroup[] = [
  {
    group: 'Dumpster Rental',
    services: [
      { name: '5 Yard Dumpster Rental', description: 'Compact container for small cleanouts and minor projects. Ideal for garage cleanups and single-room work.' },
      { name: '8 Yard Dumpster Rental', description: 'Mid-small container for residential cleanouts and small remodel debris.' },
      { name: '10 Yard Dumpster Rental', description: 'Popular size for bathroom remodels, deck removals, and moderate cleanouts.' },
      { name: '20 Yard Dumpster Rental', description: 'Standard contractor size for kitchen remodels, roofing tear-offs, and mid-size projects.' },
      { name: '30 Yard Dumpster Rental', description: 'Large container for major remodels, new construction debris, and commercial cleanouts.' },
      { name: '40 Yard Dumpster Rental', description: 'Extra-large container for large-scale construction, demolition, and commercial projects.' },
      { name: '50 Yard Dumpster Rental', description: 'Maximum capacity container for the largest commercial and industrial debris removal jobs.' },
    ],
  },
  {
    group: 'Heavy Material Dumpsters',
    services: [
      { name: 'Clean Soil Dumpster', description: 'Specialized small containers (5–10 yd) for clean dirt and soil removal from excavation and grading projects.' },
      { name: 'Clean Concrete Dumpster', description: 'Heavy-duty small containers (5–10 yd) for concrete, brick, and masonry disposal.' },
      { name: 'Heavy Material Dumpster', description: 'Weight-rated containers for dense materials. Limited to 5, 8, and 10 yard sizes to prevent overloading.' },
    ],
  },
  {
    group: 'Common Project Services',
    services: [
      { name: 'Construction Dumpster Rental', description: 'Reliable roll-off service for active job sites with flexible scheduling and swap options.' },
      { name: 'Roofing Dumpster Rental', description: 'Dumpster delivery timed for roofing tear-off projects with fast turnaround.' },
      { name: 'Home Remodel Dumpster Rental', description: 'Container rental for kitchen, bathroom, and whole-home renovation debris.' },
      { name: 'Garage Cleanout Dumpster Rental', description: 'Small to mid-size dumpsters for residential garage, attic, and storage cleanouts.' },
      { name: 'Estate Cleanout Dumpster Rental', description: 'Full-service container rental for estate and property cleanout projects.' },
    ],
  },
  {
    group: 'Customer Actions',
    services: [
      { name: 'Same-Day Dumpster Delivery', description: 'Subject to availability. Fast delivery for urgent project needs in core service areas.' },
      { name: 'Pickup Request', description: 'Schedule your dumpster pickup when your project is complete.' },
      { name: 'Swap / Replacement Service', description: 'Replace a full container with an empty one to keep your project moving.' },
      { name: 'Contractor Service', description: 'Dedicated dumpster service for contractors with multi-project and recurring needs.' },
    ],
  },
];

// ─── Q&A Bank ───────────────────────────────────────────────────

export interface GbpQA {
  question: string;
  answer: string;
  priority: 'high' | 'medium';
}

export const GBP_QA_BANK: GbpQA[] = [
  {
    question: 'What dumpster sizes do you offer?',
    answer: 'We offer 5, 8, 10, 20, 30, 40, and 50 yard dumpsters for general debris. Heavy materials like clean soil and clean concrete are limited to 5, 8, and 10 yard containers.',
    priority: 'high',
  },
  {
    question: 'Do you offer same-day delivery?',
    answer: 'Same-day delivery may be available depending on your location, schedule, and inventory. Contact us for current availability.',
    priority: 'high',
  },
  {
    question: 'Can I put dirt or concrete in any dumpster?',
    answer: 'Heavy materials like soil and concrete require special containers rated for the extra weight. This helps avoid overweight loads and disposal issues.',
    priority: 'high',
  },
  {
    question: 'Do you work with contractors?',
    answer: 'Yes. We support homeowners, contractors, and businesses with reliable dumpster service and project coordination.',
    priority: 'high',
  },
  {
    question: 'How do I get pricing?',
    answer: 'The fastest way is to request an exact quote through our website or call/text our team directly at (510) 680-2150.',
    priority: 'high',
  },
  {
    question: 'Do I need a permit?',
    answer: 'Permit requirements depend on where the dumpster will be placed. Street or public right-of-way placement rules vary by city. Driveway placement typically does not require a permit.',
    priority: 'high',
  },
  {
    question: 'How long can I keep the dumpster?',
    answer: 'Standard rental periods vary by size and project type. Extensions are available. Contact us to discuss your timeline.',
    priority: 'medium',
  },
  {
    question: 'What areas do you serve?',
    answer: 'We serve the San Francisco Bay Area including Oakland, San Jose, San Francisco, and surrounding cities. Extended service is available across California.',
    priority: 'medium',
  },
  {
    question: 'What can I put in a dumpster?',
    answer: 'General debris like construction waste, household junk, furniture, roofing, and remodel materials. Hazardous waste, tires, batteries, and certain liquids are prohibited.',
    priority: 'medium',
  },
  {
    question: 'Do you offer recurring service for job sites?',
    answer: 'Yes. We coordinate regular delivery and swap schedules for active construction and commercial job sites.',
    priority: 'medium',
  },
];

// ─── Posts Engine ────────────────────────────────────────────────

export interface GbpPostTemplate {
  id: string;
  theme: string;
  title: string;
  body: string;
  cta: string;
  ctaUrl: string;
  rotationWeek: number; // 1-8 weekly rotation
}

export const GBP_POST_TEMPLATES: GbpPostTemplate[] = [
  {
    id: 'size-education',
    theme: 'Size Education',
    title: 'Choosing the Right Dumpster Size',
    body: 'Not sure which dumpster size fits your project? From 5-yard containers for small cleanouts to 50-yard roll-offs for major construction, Calsan Dumpsters Pro helps you choose the right fit. Get an exact quote today.',
    cta: 'Get Quote',
    ctaUrl: `${BUSINESS_INFO.website}/quote`,
    rotationWeek: 1,
  },
  {
    id: 'common-projects',
    theme: 'Common Projects',
    title: 'Dumpster Rental for Home Remodels',
    body: 'Kitchen tear-out? Bathroom remodel? Calsan Dumpsters Pro delivers the right container to your driveway so you can focus on your project. Transparent pricing, fast delivery, reliable pickup.',
    cta: 'Get Quote',
    ctaUrl: `${BUSINESS_INFO.website}/quote`,
    rotationWeek: 2,
  },
  {
    id: 'same-day',
    theme: 'Same-Day Delivery',
    title: 'Need a Dumpster Today?',
    body: 'Same-day dumpster delivery may be available in your area. Call or text us to check availability and get your project started without delay.',
    cta: 'Call Now',
    ctaUrl: `tel:${BUSINESS_INFO.primaryPhoneE164}`,
    rotationWeek: 3,
  },
  {
    id: 'contractor',
    theme: 'Contractor Service',
    title: 'Dumpster Service for Contractors',
    body: 'Calsan Dumpsters Pro supports contractors with reliable roll-off delivery, scheduled swaps, and multi-project coordination across the Bay Area. Dedicated service for professionals.',
    cta: 'Get Quote',
    ctaUrl: `${BUSINESS_INFO.website}/contractors`,
    rotationWeek: 4,
  },
  {
    id: 'city-spotlight',
    theme: 'City Spotlight',
    title: 'Dumpster Rental in {City}',
    body: 'Calsan Dumpsters Pro helps homeowners and contractors in {City} with roll-off dumpster rental for remodels, cleanouts, roofing, and construction debris. Need help choosing the right size? Get an exact quote today.',
    cta: 'Get Quote',
    ctaUrl: `${BUSINESS_INFO.website}/quote`,
    rotationWeek: 5,
  },
  {
    id: 'heavy-material',
    theme: 'Heavy Material Rules',
    title: 'Heavy Material Dumpster Rental',
    body: 'Clean soil, concrete, and masonry require weight-rated containers limited to 5, 8, and 10 yard sizes. Calsan Dumpsters Pro provides the right container to handle dense materials safely.',
    cta: 'Get Quote',
    ctaUrl: `${BUSINESS_INFO.website}/quote`,
    rotationWeek: 6,
  },
  {
    id: 'seasonal-cleanup',
    theme: 'Seasonal Cleanup',
    title: 'Spring Cleanup Dumpster Rental',
    body: 'Clearing out the garage, yard, or storage? Rent a dumpster for your spring cleanup project. Fast delivery, easy scheduling, and transparent pricing from Calsan Dumpsters Pro.',
    cta: 'Get Quote',
    ctaUrl: `${BUSINESS_INFO.website}/quote`,
    rotationWeek: 7,
  },
  {
    id: 'trust-reviews',
    theme: 'Trust & Reviews',
    title: 'Why Customers Choose Calsan',
    body: 'Transparent pricing, reliable local service, and professional communication. Calsan Dumpsters Pro serves homeowners and contractors across the Bay Area with a focus on clear service terms and fast scheduling.',
    cta: 'Learn More',
    ctaUrl: BUSINESS_INFO.website,
    rotationWeek: 8,
  },
];

// ─── Photo Strategy ─────────────────────────────────────────────

export interface GbpPhotoTarget {
  category: string;
  weeklyGoal: number;
  examples: string[];
}

export const GBP_PHOTO_TARGETS: GbpPhotoTarget[] = [
  { category: 'Dumpster Delivery', weeklyGoal: 2, examples: ['Truck placing dumpster on driveway', 'Residential delivery setup'] },
  { category: 'On-Site Project', weeklyGoal: 1, examples: ['Dumpster at active job site', 'Container alongside remodel work'] },
  { category: 'Before/After', weeklyGoal: 1, examples: ['Cleanout before and after shot', 'Yard cleanup transformation'] },
  { category: 'Contractor Project', weeklyGoal: 1, examples: ['Dumpster at construction site', 'Multi-container setup'] },
  { category: 'Heavy Material', weeklyGoal: 1, examples: ['Concrete in container', 'Soil removal project'] },
  { category: 'Yard Operations', weeklyGoal: 1, examples: ['Yard staging area', 'Fleet lineup'] },
  { category: 'Branded Equipment', weeklyGoal: 1, examples: ['Branded truck', 'Clean container with logo'] },
];

// ─── Review Templates (Updated) ─────────────────────────────────

export const GBP_REVIEW_REQUEST = {
  sms: `Hi {FirstName}, thank you for choosing ${BUSINESS_INFO.name}. If we helped with your project, would you mind leaving a quick Google review? Your feedback helps other homeowners and contractors find a reliable local dumpster service. {ReviewLink}`,
  emailSubject: 'Quick favor — would you leave us a review?',
  emailBody: `Thank you for choosing ${BUSINESS_INFO.name}. If you have a moment, we'd really appreciate a Google review about your experience. Your feedback helps other customers find a reliable dumpster rental team.\n\n{ReviewLink}`,
  reminderSms: `Hi {FirstName}, just a quick follow-up from ${BUSINESS_INFO.name}. If you have a moment, a short Google review would really help our team. {ReviewLink} — Reply STOP to opt out.`,
} as const;

export const GBP_REVIEW_RESPONSES = {
  fiveStarResidential: 'Thank you, {Name}. We appreciate you choosing Calsan Dumpsters Pro for your project and we\'re glad the delivery and pickup went smoothly.',
  fiveStarContractor: 'Thank you, {Name}. We appreciate the opportunity to support your project and look forward to helping again on future jobs.',
  neutral: 'Thank you for the feedback, {Name}. We appreciate the opportunity to improve and are glad you shared your experience.',
  negative: 'Thank you for your feedback, {Name}. We\'re sorry your experience did not meet expectations. We\'d like to understand what happened and help resolve it. Please reach out to us at (510) 680-2150.',
} as const;
