// SEO City Content — Enhanced content depth for city pages
// Provides default FAQs, project tables, and common projects per city

import { BUSINESS_INFO } from './seo';

// ============================================================
// SIZE BY PROJECT TABLE — Universal recommendations
// ============================================================
export const SIZE_BY_PROJECT_TABLE = [
  { project: 'Garage cleanout', sizes: '10–15 yd', note: 'Single-car garage or small storage' },
  { project: 'Bathroom remodel', sizes: '10 yd', note: 'Fixtures, tile, and vanity removal' },
  { project: 'Kitchen remodel', sizes: '15–20 yd', note: 'Cabinets, countertops, flooring' },
  { project: 'Whole-home renovation', sizes: '30–40 yd', note: 'Full interior or multi-room demo' },
  { project: 'Roof tear-off (single layer)', sizes: '20 yd', note: 'Up to ~25 squares' },
  { project: 'Roof tear-off (2+ layers)', sizes: '30 yd', note: '25+ squares or heavy material' },
  { project: 'Concrete removal', sizes: '6–10 yd (heavy)', note: 'Flat-fee pricing, no weight overage' },
  { project: 'Dirt / soil removal', sizes: '6–10 yd (heavy)', note: 'Clean fill or excavation soil' },
  { project: 'Landscaping project', sizes: '10–15 yd', note: 'Green waste, sod, branches, soil' },
  { project: 'Estate cleanout', sizes: '20–30 yd', note: 'Furniture, household items, debris' },
  { project: 'Construction debris (new build)', sizes: '30–40 yd', note: 'Framing, drywall, general C&D' },
  { project: 'ADU / granny flat build', sizes: '20–30 yd', note: 'Demo + new construction debris' },
] as const;

// ============================================================
// COMMON PROJECTS — Used when city has no custom projects
// ============================================================
export const DEFAULT_COMMON_PROJECTS = [
  'Home remodeling and renovation',
  'Roof replacement and repair',
  'Garage and basement cleanouts',
  'Construction debris removal',
  'Concrete and dirt removal',
  'Landscaping and yard cleanup',
  'Estate and property cleanouts',
  'ADU and addition construction',
] as const;

// ============================================================
// ENHANCED DEFAULT FAQs — 12 per city, with city name interpolation
// ============================================================
export function generateCityFAQs(cityName: string, county: string) {
  return [
    {
      question: `What dumpster sizes are available in ${cityName}?`,
      answer: `We offer 5, 8, 10, 20, 30, 40, and 50 yard roll-off dumpsters in ${cityName}. For heavy materials like concrete or dirt, we have 5, 8, and 10 yard heavy-duty containers with flat-fee pricing.`
    },
    {
      question: `How fast can you deliver a dumpster in ${cityName}?`,
      answer: `Same-day delivery is available for most ${cityName} addresses, depending on inventory and scheduling. Next-day delivery is standard. Call ${BUSINESS_INFO.phone.salesFormatted} for current availability.`
    },
    {
      question: `Do I need a permit for a dumpster in ${cityName}?`,
      answer: `If the dumpster is placed on your private property (driveway or yard), typically no permit is needed. Dumpsters placed on public streets in ${cityName} usually require an encroachment permit from the city. Our team can advise on your specific situation.`
    },
    {
      question: `How much does a dumpster rental cost in ${cityName}?`,
      answer: `Pricing depends on the dumpster size, material type, and delivery location within ${cityName}. Enter your ZIP code in our instant quote system for exact pricing. Heavy materials like concrete and dirt are flat-fee with no weight overage charges.`
    },
    {
      question: `What can I put in a dumpster in ${cityName}?`,
      answer: `Most construction debris, household items, furniture, appliances, roofing materials, and yard waste are accepted. Hazardous materials, tires, batteries, and paint are prohibited. Concrete, dirt, and asphalt go in dedicated heavy-material containers.`
    },
    {
      question: `How long can I keep the dumpster?`,
      answer: `Standard rental is 7–14 days depending on the size and project. Extensions are available at daily rates. Let us know your project timeline and we can recommend the best option.`
    },
    {
      question: `Do you serve contractors in ${cityName}?`,
      answer: `Yes. Many of our customers in ${cityName} are contractors and construction professionals. We offer volume programs, priority scheduling, and Net-30 terms for qualified contractors.`
    },
    {
      question: `What happens if I go over the weight limit?`,
      answer: `For general debris dumpsters, overage is charged per ton based on the scale ticket at the disposal facility. For heavy materials (concrete, dirt), pricing is flat-fee with no weight overage—the quoted price is the final price.`
    },
    {
      question: `Can you place a dumpster on my driveway in ${cityName}?`,
      answer: `Yes, driveway placement is the most common option and typically does not require a permit. We recommend placing plywood under the container to protect your driveway surface.`
    },
    {
      question: `Do you offer same-day dumpster pickup in ${cityName}?`,
      answer: `Yes, same-day pickup is available based on scheduling. Once your dumpster is full, call us to schedule removal. Most pickups in ${cityName} can be completed within 24 hours of your request.`
    },
    {
      question: `What areas near ${cityName} do you serve?`,
      answer: `We serve ${cityName} and all surrounding communities throughout ${county} and the broader Bay Area. Our service area covers 9 counties with local yard operations in Oakland and San Jose.`
    },
    {
      question: `How do I get an exact dumpster rental price for ${cityName}?`,
      answer: `Enter your ZIP code in our instant quote system for exact pricing specific to your ${cityName} address. You'll see transparent pricing with no hidden fees before confirming your order.`
    },
  ];
}

// ============================================================
// WHY CHOOSE — Per-city trust points
// ============================================================
export const WHY_CHOOSE_POINTS = [
  { title: 'Local Yard Operations', description: 'Dispatch from nearby yards means faster delivery and lower costs.' },
  { title: 'Same-Day Delivery', description: 'Available for most addresses based on inventory and scheduling.' },
  { title: 'Transparent Pricing', description: 'See your exact price before confirming. No hidden fees or surprise charges.' },
  { title: 'Contractor-Ready', description: 'Volume programs, priority scheduling, and Net-30 terms for qualified contractors.' },
  { title: 'Professional Dispatch', description: 'Coordinated delivery windows with experienced, licensed drivers.' },
  { title: 'Flat-Fee Heavy Materials', description: 'Concrete, dirt, and asphalt at flat rates with no weight overage charges.' },
] as const;
