// SEO FAQ Pools — Curated, unique FAQ sets per page type
// Each pool contains 12+ questions to allow unique 8-FAQ selections per city

import { PRICING_POLICIES } from './shared-data';

export interface SeoFaq {
  id: string;
  question: string;
  answer: string;
  category: 'pricing' | 'sizes' | 'materials' | 'permits' | 'scheduling' | 'general';
}

// City core FAQs — generic enough for any city, localized via template
export const CITY_CORE_FAQ_POOL: SeoFaq[] = [
  { id: 'cc1', category: 'pricing', question: 'How much does a dumpster rental cost in {city}?', answer: 'Dumpster rental in {city} starts at $495 for a 5-yard container. Pricing depends on size, material type, and rental duration. Heavy materials (concrete, dirt) are flat-fee with no weight overage. General debris overage is $165/ton.' },
  { id: 'cc2', category: 'scheduling', question: 'How fast can I get a dumpster in {city}?', answer: 'Same-day delivery is available for most {city} addresses when ordered before noon. Our {yard} is nearby, ensuring fast turnaround. Next-day delivery is standard for all orders.' },
  { id: 'cc3', category: 'permits', question: 'Do I need a permit for a dumpster in {city}?', answer: 'If placing the dumpster on your private driveway or yard, no permit is needed. Street placement in {city} requires a permit from your city public works department. We recommend driveway placement when possible.' },
  { id: 'cc4', category: 'sizes', question: 'What dumpster sizes are available in {city}?', answer: 'We offer 5, 8, 10, 20, 30, 40, and 50 yard dumpsters in {city}. Heavy material dumpsters (concrete, dirt) are available in 5, 8, and 10 yard sizes only. General debris dumpsters come in all sizes.' },
  { id: 'cc5', category: 'materials', question: 'What materials can I put in a dumpster in {city}?', answer: 'Accepted: construction debris, concrete, dirt, rock, wood, drywall, roofing, yard waste, furniture, and general household junk. Prohibited: hazardous waste, paint, chemicals, batteries, and electronics.' },
  { id: 'cc6', category: 'pricing', question: 'Is there a weight limit on dumpsters in {city}?', answer: 'General debris dumpsters include base tonnage by size (e.g., 2 tons for a 20-yard). Overage is billed at $165/ton based on scale ticket. Heavy material dumpsters (6-10 yard) are flat-fee — no weight overage charges.' },
  { id: 'cc7', category: 'scheduling', question: 'Can I get weekend dumpster delivery in {city}?', answer: 'Weekend delivery may be available by special request. Standard deliveries are Monday-Friday with morning, midday, and afternoon windows. Contact us to check weekend availability for your {city} address.' },
  { id: 'cc8', category: 'general', question: 'How long can I keep the dumpster?', answer: 'Standard rental is 7 days. Extensions are available at $35/day. For longer projects, just call to extend before your rental period ends.' },
  { id: 'cc9', category: 'general', question: 'What happens if I overfill the dumpster?', answer: 'Materials must not extend above the top of the dumpster walls. Overfilled dumpsters cannot be legally transported and may require excess removal before pickup, causing delays.' },
  { id: 'cc10', category: 'pricing', question: 'Do you charge delivery and pickup fees?', answer: 'Delivery and pickup are included in the rental price. The only additional charges are weight overage (general debris only), extra rental days, or special item fees (mattress, freon appliance).' },
  { id: 'cc11', category: 'scheduling', question: 'How do I schedule a dumpster pickup in {city}?', answer: 'Call, text, or use our online form to request pickup. We typically pick up within 1-3 business days. For urgent pickups, call us directly at (510) 680-2150.' },
  { id: 'cc12', category: 'general', question: 'Are you a local company or a broker?', answer: 'We are a local company with our own yard, trucks, and drivers. We are not a broker. Your dumpster comes directly from our {yard}, operated by our own team.' },
];

// Size-specific FAQs
export const SIZE_FAQ_POOL: SeoFaq[] = [
  { id: 'sz1', category: 'sizes', question: 'How much does a {size}-yard dumpster cost in {city}?', answer: 'A {size}-yard dumpster in {city} starts from ${price}. Price includes {tons} ton(s) and 7-day rental. Exact pricing depends on your ZIP code and material type.' },
  { id: 'sz2', category: 'sizes', question: 'What fits in a {size}-yard dumpster?', answer: 'A {size}-yard dumpster ({dimensions}) holds approximately {loads}. Common uses include {useCases}.' },
  { id: 'sz3', category: 'scheduling', question: 'How fast can I get a {size}-yard dumpster in {city}?', answer: 'Same-day delivery is available for most {city} addresses when ordered before noon. Our local yard ensures fast turnaround for all {size}-yard orders.' },
  { id: 'sz4', category: 'sizes', question: 'Is a {size}-yard dumpster right for my project?', answer: 'The {size}-yard works best for {useCases}. If unsure, call us and describe your project — we will recommend the right size and save you from ordering too large or too small.' },
  { id: 'sz5', category: 'pricing', question: 'What is the weight limit for a {size}-yard dumpster?', answer: 'The {size}-yard includes {tons} ton(s). General debris overage is $165/ton based on certified scale ticket. Heavy material containers (6-10yd) are flat-fee with no weight overage.' },
];

// Material-specific FAQs
export const MATERIAL_FAQ_POOL: SeoFaq[] = [
  { id: 'mt1', category: 'materials', question: 'Can I put {material} in a dumpster in {city}?', answer: 'Yes. We offer dumpsters specifically for {material} in {city}. {pricingNote}' },
  { id: 'mt2', category: 'materials', question: 'What size dumpster for {material}?', answer: 'For {material}, we recommend {sizes} yard dumpsters. The right size depends on your project scope.' },
  { id: 'mt3', category: 'materials', question: 'What is the cost of a {material} dumpster in {city}?', answer: '{pricingNote} Get an exact quote by entering your ZIP code in our instant calculator.' },
  { id: 'mt4', category: 'materials', question: 'Can I mix {material} with other debris?', answer: 'Heavy materials (concrete, dirt, brick) must be clean, unmixed loads for flat-fee pricing. If trash or mixed debris is found, the load is reclassified to general debris at $165/ton.' },
];

// Permit-specific FAQs (especially SF)
export const PERMIT_FAQ_POOL: SeoFaq[] = [
  { id: 'pm1', category: 'permits', question: 'How do I get a dumpster permit in {city}?', answer: 'Contact your city public works department. Processing time varies by city — typically 3-7 business days. Driveway placement avoids the permit requirement entirely.' },
  { id: 'pm2', category: 'permits', question: 'How much does a dumpster permit cost in {city}?', answer: 'Permit fees vary by city. Contact {city} Public Works for current rates. We can guide you through the process.' },
  { id: 'pm3', category: 'permits', question: 'Can I avoid needing a permit?', answer: 'Yes — place the dumpster on your private driveway, yard, or parking lot. Permits are only required for public street or sidewalk placement.' },
];

/**
 * Select FAQs for a page, templated with city/yard/size details.
 * Uses a deterministic selection based on city slug to ensure consistency.
 */
export function selectCityFaqs(
  cityName: string,
  yardName: string,
  count: number = 8,
  citySlug: string = '',
): Array<{ question: string; answer: string }> {
  // Deterministic offset based on city slug hash
  const hash = citySlug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const offset = hash % 4; // Shift pool selection by city
  
  const pool = [...CITY_CORE_FAQ_POOL];
  // Rotate pool based on city to ensure different FAQ combos per city
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
  
  return rotated.slice(0, count).map(faq => ({
    question: faq.question.replace(/{city}/g, cityName).replace(/{yard}/g, yardName),
    answer: faq.answer.replace(/{city}/g, cityName).replace(/{yard}/g, yardName),
  }));
}

export function selectSizeFaqs(
  cityName: string,
  size: number,
  price: number,
  tons: number,
  dimensions: string,
  loads: string,
  useCases: string,
): Array<{ question: string; answer: string }> {
  return SIZE_FAQ_POOL.map(faq => ({
    question: faq.question
      .replace(/{city}/g, cityName)
      .replace(/{size}/g, String(size)),
    answer: faq.answer
      .replace(/{city}/g, cityName)
      .replace(/{size}/g, String(size))
      .replace(/{price}/g, String(price))
      .replace(/{tons}/g, String(tons))
      .replace(/{dimensions}/g, dimensions)
      .replace(/{loads}/g, loads)
      .replace(/{useCases}/g, useCases),
  }));
}
