// =====================================================
// Calsan C&D Waste Removal — All page content config
// No hardcoded business values in page components
// =====================================================

export const CLEANUP_BRAND = {
  company_name: 'Calsan Services',
  dba: 'Calsan C&D Waste Removal',
  legacy_brand: 'Calsan Dumpsters Pro',
  legacy_url: 'https://calsandumpsterspro.com',
  license: 'CSLB #1152237',
  license_class: 'C-61 / D63 — Construction Clean-Up',
  locations: ['Oakland', 'Alameda', 'Bay Area'],
  phone: '[ADD_MAIN_PHONE]',
  email: '[ADD_EMAIL_DOMAIN]',
  address: '[ADD_ADDRESS]',
};

export const CORE_SERVICES = [
  {
    code: 'CONSTRUCTION_CLEANUP',
    name: 'Construction Cleanup',
    slug: 'construction-cleanup',
    tagline: 'Cleanup support for active jobsites, remodel phases, and work-area reset between trades.',
    startingPrice: 'From $495',
    pricingNote: 'Scope-based, labor-based, or scope plus disposal depending on site conditions.',
    icon: 'hard-hat',
  },
  {
    code: 'POST_CONSTRUCTION_CLEANUP',
    name: 'Final & Post-Construction Cleanup',
    slug: 'post-construction-cleanup',
    tagline: 'Detailed cleanup for turnover, final walkthroughs, inspections, and handoff-ready spaces.',
    startingPrice: '$0.35–$0.65/sqft',
    pricingNote: '$695 minimum. Photos and project condition help confirm the right scope.',
    icon: 'sparkles',
  },
  {
    code: 'DEMOLITION_SUPPORT',
    name: 'Demolition Debris Cleanup',
    slug: 'demolition-debris-cleanup',
    tagline: 'Cleanup and debris support for material resulting from construction and demolition activity.',
    startingPrice: 'From $695 + disposal',
    pricingNote: 'Final cost depends on debris volume, material type, loading conditions, and disposal path.',
    icon: 'hammer',
  },
  {
    code: 'RECURRING_SITE_SERVICE',
    name: 'Recurring Jobsite Cleanup',
    slug: 'recurring-jobsite-cleanup',
    tagline: 'Scheduled cleanup for contractors who need consistent site support during active projects.',
    startingPrice: 'From $1,200/month',
    pricingNote: 'Weekly visit base $295. Custom schedules available.',
    icon: 'calendar-check',
  },
] as const;

export const HOMEPAGE = {
  hero: {
    h1: 'Construction Cleanup & Debris Removal That Keeps Your Project Moving',
    sub: 'Professional cleanup support for active jobsites, remodels, ADUs, final turnover, and debris-heavy construction phases across Oakland, Alameda, and the Bay Area.',
    supportLine: 'Send photos for faster scope review and a better next-step recommendation.',
    bullets: [
      'Construction cleanup for active jobsites',
      'Final and post-construction cleanup',
      'Demolition debris cleanup and haul-off support',
      'Recurring cleanup service for contractors',
    ],
  },
  intro: {
    headline: 'Built for Real Jobsite Needs',
    body: 'Cleanup should not slow down your project. We help contractors, remodelers, ADU builders, property teams, and owners keep sites cleaner, safer, and ready for the next phase. Whether you need one cleanup visit after a busy phase or recurring support throughout the project, we keep the process fast, clear, and professional.',
  },
  whoWeServe: {
    headline: 'Who We Work With',
    body: 'We work with general contractors, remodelers, ADU builders, roofing and trade contractors, property managers, investors, and owners who need dependable cleanup service with clear communication and fast response.',
    segments: [
      'General Contractors',
      'Remodelers',
      'ADU Builders',
      'Property Managers',
      'Trade Contractors',
      'Owners & Investors',
    ],
  },
  whyChoose: {
    headline: 'Why Contractors and Property Teams Choose Calsan',
    points: [
      { title: 'Fast response', desc: 'When a site needs attention, we move quickly.' },
      { title: 'Professional service', desc: 'Cleanup with a jobsite mindset, not a generic hauling approach.' },
      { title: 'Clear pricing', desc: 'Pricing tied to scope, labor, disposal, and real site conditions.' },
      { title: 'Flexible support', desc: 'One-time, phase-based, final cleanup, or recurring service.' },
      { title: 'Brand continuity', desc: 'The same trusted team behind Calsan Dumpsters Pro.' },
    ],
  },
  howItWorks: {
    headline: 'Simple Process, Fast Turnaround',
    steps: [
      { title: 'Send the project details', desc: 'Location, timing, service type, and photos if available.' },
      { title: 'We review and recommend', desc: 'We confirm the best service, scope, and pricing structure.' },
      { title: 'We schedule and perform the work', desc: 'Our team arrives with a practical jobsite-ready scope.' },
      { title: 'Close-out and follow-up', desc: 'We help leave the site ready for the next phase or turnover.' },
    ],
  },
  dumpsterCrossover: {
    headline: 'Need a Dumpster Rental Too?',
    body: 'Dumpster rentals continue through Calsan Dumpsters Pro. If your project needs both dumpster rental and cleanup support, we can point you in the right direction and help keep the job moving.',
    cta: 'Visit Dumpster Rental Division',
  },
  serviceAreas: {
    headline: 'Serving Oakland, Alameda, and the Bay Area',
    body: 'We support residential remodels, ADUs, light commercial projects, active jobsites, and turnover cleanups across our core Bay Area service area. Contact us to confirm availability for your project location.',
  },
  faqPreview: [
    { q: 'What kinds of cleanup projects do you handle?', a: 'We handle construction cleanup, post-construction/final cleanup, demolition debris cleanup, recurring jobsite cleanup, material pickup, and labor-assisted cleanup for active jobsites across the Bay Area.' },
    { q: 'Do you still offer dumpster rentals?', a: 'Dumpster rentals continue through our sister brand, Calsan Dumpsters Pro. We can help connect you if your project needs both services.' },
    { q: 'How do I get a quote?', a: 'Use our quote form, call us directly, or send photos and project details. We review the scope and follow up with a recommendation and pricing.' },
    { q: 'Do you offer recurring service?', a: 'Yes. We offer weekly, bi-weekly, and custom recurring cleanup plans for contractors with active projects.' },
  ],
  finalCta: {
    headline: 'Need Reliable Cleanup Support for Your Next Project?',
    body: 'Tell us what kind of project you have and we will help you choose the right cleanup service.',
  },
};

export const SURCHARGES = [
  { label: 'Rush service', value: '+20%' },
  { label: 'After-hours', value: '+25%' },
  { label: 'Stairs / no elevator', value: '+15%' },
  { label: 'Long carry / poor access', value: '+10%' },
  { label: 'Mixed heavy debris', value: '+15%' },
  { label: 'Re-trip fee', value: '$95' },
  { label: 'Change order minimum', value: '$125' },
];

export const BRAND_CLARIFICATION =
  'Calsan Dumpsters Pro continues to handle dumpster rentals. Calsan C&D Waste Removal focuses on cleanup, debris support, and jobsite services.';
