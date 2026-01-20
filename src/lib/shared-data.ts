// Shared Data - Single Source of Truth
// This file contains all shared data used across the site to prevent inconsistencies

import { BUSINESS_INFO, SERVICE_AREAS } from './seo';

// ============================================================
// DUMPSTER SIZES - Official inventory
// Official Included Tonnage: 6yd=0.5T, 8yd=0.5T, 10yd=1T, 20yd=2T, 30yd=3T, 40yd=4T, 50yd=5T
// Heavy Materials: 6, 8, 10 yard only
// General Debris: 6, 8, 10, 20, 30, 40, 50 yard
// ============================================================

export interface DumpsterSizeData {
  yards: number;
  dimensions: string;
  height: string;
  length: string;
  width: string;
  includedTons: number;
  category: 'heavy' | 'general' | 'both';
  priceFrom: number;
  useCases: string[];
  loads: string;
  description: string;
  popular?: boolean;
}

// Pricing data derived from v56 spreadsheet (Plan A base prices)
export const DUMPSTER_SIZES_DATA: DumpsterSizeData[] = [
  // Both Heavy and General (6 yard) - 6 × 12 × 2.25 = 162 cu ft / 27 = 6 cu yd
  {
    yards: 6,
    dimensions: "12' L × 6' W × 2.25' H",
    length: "12'",
    width: "6'",
    height: "2.25'",
    includedTons: 0.5,
    category: 'both',
    priceFrom: 390,  // v56 Plan A base
    useCases: ['Concrete removal', 'Dirt & soil', 'Small cleanouts', 'Yard debris'],
    loads: '1-2 pickup loads',
    description: 'Compact size for small jobs.',
  },
  // Both Heavy and General (8 yard) - 6 × 12 × 3 = 216 cu ft / 27 = 8 cu yd
  {
    yards: 8,
    dimensions: "12' L × 6' W × 3' H",
    length: "12'",
    width: "6'",
    height: "3'",
    includedTons: 0.5,
    category: 'both',
    priceFrom: 460,  // v56 Plan A base
    useCases: ['Foundation demo', 'Brick & block', 'Garage cleanouts', 'Bathroom remodel'],
    loads: '2-3 pickup loads',
    description: 'Popular for driveway and foundation work.',
    popular: true,
  },
  // Both Heavy and General (10 yard) - 7.5 × 12 × 3 = 270 cu ft / 27 = 10 cu yd
  {
    yards: 10,
    dimensions: "12' L × 7.5' W × 3' H",
    length: "12'",
    width: "7.5'",
    height: "3'",
    includedTons: 1,
    category: 'both',
    priceFrom: 580,  // v56 Plan A base
    useCases: ['Large concrete jobs', 'Small renovations', 'Deck removal'],
    loads: '3-4 pickup loads',
    description: 'Versatile size for small to medium projects.',
  },
  // General Debris Only (20 yard) - 7.5 × 18 × 4 = 540 cu ft / 27 = 20 cu yd
  {
    yards: 20,
    dimensions: "18' L × 7.5' W × 4' H",
    length: "18'",
    width: "7.5'",
    height: "4'",
    includedTons: 2,
    category: 'general',
    priceFrom: 620,  // v56 Plan A base
    useCases: ['Full room renovations', 'Roofing projects', 'Large cleanouts'],
    loads: '6-8 pickup loads',
    description: 'Our most popular size for home renovations.',
    popular: true,
  },
  // General Debris Only (30 yard) - 7.5 × 18 × 6 = 810 cu ft / 27 = 30 cu yd
  {
    yards: 30,
    dimensions: "18' L × 7.5' W × 6' H",
    length: "18'",
    width: "7.5'",
    height: "6'",
    includedTons: 3,
    category: 'general',
    priceFrom: 770,  // v56 Plan A base
    useCases: ['Major renovations', 'New construction', 'Estate cleanouts'],
    loads: '9-12 pickup loads',
    description: 'High walls for bulky items and major projects.',
  },
  // General Debris Only (40 yard) - 7.5 × 24 × 6 = 1080 cu ft / 27 = 40 cu yd
  {
    yards: 40,
    dimensions: "24' L × 7.5' W × 6' H",
    length: "24'",
    width: "7.5'",
    height: "6'",
    includedTons: 4,
    category: 'general',
    priceFrom: 895,  // v56 Plan A base
    useCases: ['Commercial projects', 'Large demolition', 'Industrial waste'],
    loads: '12-16 pickup loads',
    description: 'Commercial-grade capacity for large-scale projects.',
  },
  // General Debris Only (50 yard) - 7.5 × 24 × 7.5 = 1350 cu ft / 27 = 50 cu yd
  {
    yards: 50,
    dimensions: "24' L × 7.5' W × 7.5' H",
    length: "24'",
    width: "7.5'",
    height: "7.5'",
    includedTons: 5,
    category: 'general',
    priceFrom: 1135,  // v56 Plan A base
    useCases: ['Largest projects', 'Industrial sites', 'Warehouse cleanouts'],
    loads: '16-20 pickup loads',
    description: 'Maximum volume for the largest jobs.',
  },
];

// Helper functions
export const getHeavySizes = () => DUMPSTER_SIZES_DATA.filter(s => s.category === 'heavy' || s.category === 'both');
export const getGeneralSizes = () => DUMPSTER_SIZES_DATA.filter(s => s.category === 'general' || s.category === 'both');
export const getSizeByYards = (yards: number) => DUMPSTER_SIZES_DATA.find(s => s.yards === yards);

// ============================================================
// FAQ - Single source of truth
// ============================================================

export interface FAQItem {
  question: string;
  questionEs: string;
  answer: string;
  answerEs: string;
  category?: 'general' | 'pricing' | 'materials' | 'scheduling';
}

export const MASTER_FAQS: FAQItem[] = [
  // General FAQs
  {
    question: 'How quickly can I get a dumpster delivered?',
    questionEs: '¿Qué tan rápido pueden entregar un contenedor?',
    answer: 'We offer same-day delivery for most Bay Area locations when you order before noon. Next-day delivery is available for all orders placed by 5 PM.',
    answerEs: 'Ofrecemos entrega el mismo día para la mayoría de las ubicaciones del Área de la Bahía cuando ordena antes del mediodía.',
    category: 'scheduling',
  },
  {
    question: 'What happens if I go over the weight limit?',
    questionEs: '¿Qué pasa si excedo el límite de peso?',
    answer: 'Each dumpster size has a weight limit. If you exceed it, you\'ll be charged $165/ton for general debris or $165/ton for heavy materials. We weigh every load at the landfill.',
    answerEs: 'Cada tamaño de contenedor tiene un límite de peso. Si lo excede, se le cobrará $165/tonelada para escombros generales o $165/tonelada para materiales pesados.',
    category: 'pricing',
  },
  {
    question: 'Can I keep the dumpster longer than 7 days?',
    questionEs: '¿Puedo quedarme el contenedor más de 7 días?',
    answer: 'Yes! The standard rental is 7 days, but you can extend as needed. Extra days are $35 per day. Just let us know before your rental period ends.',
    answerEs: '¡Sí! El alquiler estándar es de 7 días, pero puede extenderlo según sea necesario. Los días adicionales cuestan $35 por día.',
    category: 'pricing',
  },
  {
    question: 'Can I overfill the dumpster?',
    questionEs: '¿Puedo llenar el contenedor por encima del borde?',
    answer: 'No, overfilling is not allowed for safety and legal reasons. Materials must not extend above the top of the dumpster walls. Overfilled dumpsters require excess removal before pickup.',
    answerEs: 'No, no se permite llenar en exceso por razones de seguridad y legales. Los materiales no deben extenderse por encima de las paredes del contenedor.',
    category: 'general',
  },
  {
    question: 'How do I schedule a pickup?',
    questionEs: '¿Cómo programo una recolección?',
    answer: 'You can call, text, or use our online form to schedule pickup. We typically pick up within 1-3 business days. For urgent pickups, call us directly.',
    answerEs: 'Puede llamar, enviar un mensaje de texto o usar nuestro formulario en línea para programar la recolección.',
    category: 'scheduling',
  },
  {
    question: 'Do I need a permit for the dumpster?',
    questionEs: '¿Necesito un permiso para el contenedor?',
    answer: 'If the dumpster will be placed on your private property (driveway, yard), no permit is needed. If it must go on the street or public right-of-way, you\'ll need a permit from your city.',
    answerEs: 'Si el contenedor se colocará en su propiedad privada, no se necesita permiso. Si debe ir en la calle, necesitará un permiso de su ciudad.',
    category: 'general',
  },
  {
    question: 'What materials are NOT allowed in the dumpster?',
    questionEs: '¿Qué materiales NO se permiten en el contenedor?',
    answer: 'Prohibited items include: hazardous waste, paint, chemicals, batteries, tires, appliances with freon, medical waste, and electronics. See our Materials page for a complete list.',
    answerEs: 'Los artículos prohibidos incluyen: desechos peligrosos, pintura, químicos, baterías, llantas, electrodomésticos con freón.',
    category: 'materials',
  },
  {
    question: 'Do you offer dumpsters for concrete and dirt?',
    questionEs: '¿Ofrecen contenedores para concreto y tierra?',
    answer: 'Yes! We have heavy material dumpsters (6, 8, and 10 yard) specifically for concrete, dirt, rock, and asphalt. Included tonnage: 6yd=0.5T, 8yd=0.5T, 10yd=1T. Heavy materials cannot be mixed with other debris.',
    answerEs: '¡Sí! Tenemos contenedores para materiales pesados (6, 8 y 10 yardas) específicamente para concreto, tierra, roca y asfalto.',
    category: 'materials',
  },
  // Contractor-focused FAQs
  {
    question: 'What is the difference between inert and general debris dumpsters?',
    questionEs: '¿Cuál es la diferencia entre contenedores para materiales inertes y escombros generales?',
    answer: 'Inert dumpsters (6-10yd) are for heavy materials like concrete, dirt, brick, and asphalt only—pure loads with no trash. General debris dumpsters (6-50yd) are for mixed waste like wood, drywall, and packaging. Mixing trash with inert materials triggers reclassification and additional fees.',
    answerEs: 'Los contenedores para materiales inertes (6-10yd) son solo para materiales pesados como concreto, tierra, ladrillo y asfalto—cargas puras sin basura.',
    category: 'materials',
  },
  {
    question: 'How does weight/overage billing work for contractors?',
    questionEs: '¿Cómo funciona la facturación por peso/exceso para contratistas?',
    answer: 'Each dumpster includes weight by size: 6yd=0.5T, 8yd=0.5T, 10yd=1T, 20yd=2T, 30yd=3T, 40yd=4T, 50yd=5T. Overage is billed per ton after disposal scale ticket—$165/ton for general debris, $165/ton for heavy materials.',
    answerEs: 'Cada contenedor incluye peso por tamaño: 6yd=0.5T, 8yd=0.5T, 10yd=1T, 20yd=2T, etc. El exceso se factura por tonelada después del boleto de báscula—$165/tonelada.',
    category: 'pricing',
  },
  {
    question: 'What is the overfill policy and why does it matter?',
    questionEs: '¿Cuál es la política de sobrecarga y por qué es importante?',
    answer: 'Materials must not extend above the top of the dumpster walls. Overfilled dumpsters cannot be legally transported and require excess removal before pickup, potentially causing project delays and additional charges.',
    answerEs: 'Los materiales no deben extenderse por encima de las paredes del contenedor. Los contenedores sobrecargados no pueden transportarse legalmente y requieren la eliminación del exceso antes de la recolección.',
    category: 'general',
  },
  {
    question: 'Do contractors need permits for street-placed dumpsters?',
    questionEs: '¿Los contratistas necesitan permisos para contenedores en la calle?',
    answer: 'Yes, if the dumpster must be placed on the street or public right-of-way, you\'ll need a permit from your city. Contractors are responsible for obtaining permits. We can point you in the right direction by city—see our City Permit Helper.',
    answerEs: 'Sí, si el contenedor debe colocarse en la calle o vía pública, necesitará un permiso de su ciudad. Los contratistas son responsables de obtener los permisos.',
    category: 'general',
  },
  {
    question: 'What items are prohibited in dumpsters on job sites?',
    questionEs: '¿Qué artículos están prohibidos en los contenedores de obra?',
    answer: 'Prohibited: hazardous waste, batteries, medical waste, pressurized tanks, certain electronics/appliances. Some items (mattresses, appliances, tires) may be accepted with additional fees—always ask first. See our Materials page for the complete list.',
    answerEs: 'Prohibidos: residuos peligrosos, baterías, desechos médicos, tanques presurizados, ciertos electrodomésticos. Algunos artículos pueden aceptarse con tarifas adicionales—siempre pregunte primero.',
    category: 'materials',
  },
];

// Get FAQs for schema (simplified format)
export const getFAQsForSchema = (count = 4) => 
  MASTER_FAQS.slice(0, count).map(faq => ({
    question: faq.question,
    answer: faq.answer,
  }));

// ============================================================
// PRICING POLICIES - Single source of truth (from v56 spreadsheet)
// ============================================================

export const PRICING_POLICIES = {
  // Rental fees (v56 Page 14)
  extraDayCost: 35,  // Updated from v56
  tripFee: 250,  // Blocked access / dead run
  sameDayDelivery: 100,
  relocationFee: 125,
  cancellation24h: 100,
  wrongMaterialsCleaning: 300,
  
  // Overweight rates (v56 Page 12) - varies by customer type
  overagePerTonGeneral: 165,  // Standard rate from v56
  overagePerTonHeavy: 165,    // Lowboy rate 
  overagePerTonHomeowner: 165,  // Range: $135-$200
  overagePerTonContractor: 135,  // Preferred rate
  overagePerTonBusiness: 145,
  
  // Special items
  mattressDisposal: 50,
  applianceWithFreon: 75,
  tireDisposal: 25,
  
  // Rental period
  standardRentalDays: 7,
  
  // Surcharges
  heavyMaterialSurcharge: 100,  // Flat surcharge for heavy in general container
} as const;

// Standard overage note for display
export const OVERAGE_NOTE = 'Overage billed per ton after disposal scale ticket.';

// Official included tonnage by size (single source of truth - v56 Page 15)
export const INCLUDED_TONS_BY_SIZE: Record<number, number> = {
  6: 0.5,
  8: 0.5,
  10: 1,
  20: 2,
  30: 3,
  40: 4,
  50: 5,
};

// ============================================================
// V56 BASE PRICING (Plan A - Homeowner all-in pricing)
// ============================================================

export interface V56PricingTier {
  size: number;
  basePrice: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  includedTons: number;
  category: 'heavy' | 'general' | 'both';
}

// Plan A pricing (General Debris - includes tons)
export const PLAN_A_PRICING: V56PricingTier[] = [
  { size: 6, basePrice: 390, priceRangeLow: 390, priceRangeHigh: 475, includedTons: 0.5, category: 'both' },
  { size: 8, basePrice: 460, priceRangeLow: 460, priceRangeHigh: 550, includedTons: 0.5, category: 'both' },
  { size: 10, basePrice: 580, priceRangeLow: 580, priceRangeHigh: 675, includedTons: 1, category: 'both' },
  { size: 20, basePrice: 620, priceRangeLow: 620, priceRangeHigh: 750, includedTons: 2, category: 'general' },
  { size: 30, basePrice: 770, priceRangeLow: 770, priceRangeHigh: 895, includedTons: 3, category: 'general' },
  { size: 40, basePrice: 895, priceRangeLow: 895, priceRangeHigh: 1050, includedTons: 4, category: 'general' },
  { size: 50, basePrice: 1135, priceRangeLow: 1135, priceRangeHigh: 1350, includedTons: 5, category: 'general' },
];

// Heavy Material / Lowboy pricing (6, 8, 10 only)
export const HEAVY_MATERIAL_PRICING: V56PricingTier[] = [
  { size: 6, basePrice: 490, priceRangeLow: 490, priceRangeHigh: 600, includedTons: 0.5, category: 'heavy' },
  { size: 8, basePrice: 550, priceRangeLow: 550, priceRangeHigh: 675, includedTons: 0.5, category: 'heavy' },
  { size: 10, basePrice: 600, priceRangeLow: 600, priceRangeHigh: 750, includedTons: 1, category: 'heavy' },
];

// Helper to get pricing by size and category
export const getPricingBySize = (size: number, isHeavy: boolean = false) => {
  if (isHeavy) {
    return HEAVY_MATERIAL_PRICING.find(p => p.size === size);
  }
  return PLAN_A_PRICING.find(p => p.size === size);
};

// Get general debris pricing (for Pricing page)
export const getGeneralDebrisPricing = () => 
  PLAN_A_PRICING.filter(p => p.category === 'general' || p.category === 'both');

// Get heavy material pricing (for Pricing page)  
export const getHeavyMaterialPricing = () => HEAVY_MATERIAL_PRICING;

// ============================================================
// TRUCKING RATES (v56 Page 7)
// ============================================================

export const TRUCKING_RATES = {
  endDump: { hourlyRate: 175, minHours: 4, capacity: '18-22 tons / up to 20 CY' },
  tenWheeler: { hourlyRate: 155, minHours: 4, capacity: '10-12 tons' },
  superTen: { hourlyRate: 175, minHours: 4, capacity: '14-16 tons', dumpFeeSeparate: true },
  highSideTrailer: { hourlyRate: 195, minHours: 4, capacity: '18-20 tons / 70-80 CY' },
} as const;

// ============================================================
// MARKET/ZONE DEFINITIONS (v56 Pages 17-18)
// ============================================================

export type MarketZone = 'OAK' | 'SJ' | 'TRACY' | 'CENTRAL' | 'SAC';

export const MARKET_ZONES: Record<MarketZone, { name: string; baseMultiplier: number }> = {
  OAK: { name: 'Oakland / East Bay', baseMultiplier: 1.0 },
  SJ: { name: 'San Jose / South Bay', baseMultiplier: 1.05 },
  TRACY: { name: 'Tracy / Stockton', baseMultiplier: 0.95 },
  CENTRAL: { name: 'Central Valley', baseMultiplier: 1.1 },
  SAC: { name: 'Sacramento Region', baseMultiplier: 1.15 },
};

// ============================================================
// CONTACT INFO - Re-export from seo.ts for convenience
// ============================================================

export { BUSINESS_INFO, SERVICE_AREAS };

// Standard CTA destinations
export const CTA_LINKS = {
  quote: '/#quote',
  quotePage: '/quote',
  call: `tel:${BUSINESS_INFO.phone.sales}`,
  text: `sms:${BUSINESS_INFO.phone.sales}`,
  email: `mailto:${BUSINESS_INFO.email}`,
  trashlab: 'https://app.trashlab.com',
} as const;
