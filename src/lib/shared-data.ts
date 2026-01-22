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
    question: 'What happens if I go over the weight/capacity limit?',
    questionEs: '¿Qué pasa si excedo el límite de peso/capacidad?',
    answer: 'For general debris dumpsters (20-50yd), overage is $165/ton. For small general debris dumpsters (6-10yd), overage is $30 per additional yard. Heavy material dumpsters (6-10yd) are flat fee—disposal is included with no extra weight charges.',
    answerEs: 'Para contenedores de escombros generales (20-50yd), el exceso es $165/tonelada. Para contenedores pequeños (6-10yd), el exceso es $30 por yarda adicional. Los contenedores de materiales pesados son tarifa plana—sin cargos adicionales por peso.',
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
    answer: 'Yes! We have heavy material dumpsters (6, 8, and 10 yard) specifically for concrete, dirt, rock, and asphalt. These are FLAT FEE—disposal is included with no extra weight charges. Heavy materials cannot be mixed with other debris.',
    answerEs: '¡Sí! Tenemos contenedores para materiales pesados (6, 8 y 10 yardas) específicamente para concreto, tierra, roca y asfalto. Son TARIFA PLANA—sin cargos adicionales por peso.',
    category: 'materials',
  },
  // Contractor-focused FAQs
  {
    question: 'What is the difference between inert and general debris dumpsters?',
    questionEs: '¿Cuál es la diferencia entre contenedores para materiales inertes y escombros generales?',
    answer: 'Inert/heavy dumpsters (6-10yd) are FLAT FEE for pure loads of concrete, dirt, brick, asphalt—no weight overage charges. General debris dumpsters (20-50yd) have weight limits with $165/ton overage. Small general debris dumpsters (6-10yd) have $30/yard overage. If trash is mixed in heavy loads, reclassification applies.',
    answerEs: 'Los contenedores inertes/pesados (6-10yd) son TARIFA PLANA para cargas puras—sin cargos por exceso de peso. Los contenedores de escombros generales (20-50yd) tienen $165/tonelada por exceso. Los pequeños (6-10yd) tienen $30/yarda por exceso.',
    category: 'materials',
  },
  {
    question: 'How does weight/overage billing work for contractors?',
    questionEs: '¿Cómo funciona la facturación por peso/exceso para contratistas?',
    answer: 'Heavy material dumpsters (6-10yd): FLAT FEE—no weight overage. General debris 20-50yd: includes 2-5 tons, overage at $165/ton. General debris 6-10yd: overage at $30 per additional yard (not per ton). Always keep heavy and general debris separate.',
    answerEs: 'Contenedores pesados (6-10yd): TARIFA PLANA—sin exceso por peso. Escombros generales 20-50yd: incluye 2-5 toneladas, exceso a $165/ton. Escombros generales 6-10yd: exceso a $30 por yarda adicional.',
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
  
  // Overweight rates (v56 Page 12) - varies by material and size
  // General debris 20-50yd: per-ton overage
  overagePerTonGeneral: 165,  // Standard rate from v56
  overagePerTonHomeowner: 165,  // Range: $135-$200
  overagePerTonContractor: 135,  // Preferred rate
  overagePerTonBusiness: 145,
  
  // General debris 6-10yd: per-yard overage (not per-ton)
  overagePerYardSmall: 30,  // $30 per additional yard for 6/8/10yd mixed debris
  
  // Heavy materials: FLAT FEE - no overage charges
  // heavyMaterialFlatFee: true (disposal included, no weight charges)
  
  // Special items
  mattressDisposal: 50,
  applianceWithFreon: 75,
  tireDisposal: 25,
  
  // Rental period
  standardRentalDays: 7,
  
  // Surcharges
  heavyMaterialSurcharge: 100,  // Flat surcharge for heavy in general container
  
  // Green Halo pricing (mid-range estimates)
  greenHaloDumpFeePerTon: 150,  // Mid-range estimate ($75-250)
  greenHaloHandlingFee: 150,  // Mid-range of $100-200
} as const;

// ============================================================
// EXTRA TON PRICING - Pre-purchase discounts
// ============================================================

export interface ExtraTonPricing {
  standardRate: number;
  discountPct: number;
  prepurchaseRate: number;
}

// Default pricing (Oakland/San Jose zone) - Single source of truth
export const DEFAULT_EXTRA_TON_PRICING: ExtraTonPricing = {
  standardRate: PRICING_POLICIES.overagePerTonGeneral, // 165
  discountPct: 0.05,
  get prepurchaseRate() { return this.standardRate * (1 - this.discountPct); }, // 156.75
};

// ============================================================
// CONTRACTOR VOLUME DISCOUNT TIERS (CONSERVATIVE)
// ============================================================
// Discounts ONLY apply with prepaid or contracted volume commitment
// NO automatic discounts for contractors

export const VOLUME_DISCOUNT_TIERS = [
  { min: 3, max: 5, discountPct: 0.03, label: '3-5 services' },
  { min: 6, max: 10, discountPct: 0.05, label: '6-10 services' },
  { min: 11, max: 20, discountPct: 0.07, label: '11-20 services' },
  { min: 21, max: Infinity, discountPct: 0.10, label: '20+ services' },
] as const;

export const MAX_DISCOUNT_PCT = 0.10; // 10% cap
export const WHOLESALER_APPROVAL_THRESHOLD = 0.07; // 7%+ requires manual approval

// ============================================================
// OVERAGE RULES BY MATERIAL AND SIZE
// ============================================================

// Heavy Materials (6/8/10yd): FLAT FEE - no overage, no tons displayed
// General Debris 6/8/10yd: $30 per additional yard overage
// General Debris 20-50yd: $165 per ton overage

export type OverageRule = 'flat_fee' | 'per_yard' | 'per_ton';

export interface OverageInfo {
  rule: OverageRule;
  rate?: number;
  unit?: string;
  displayMessage: string;
  showTons: boolean;
}

/**
 * Get the overage rule for a given material type and size
 */
export function getOverageInfo(materialType: 'general' | 'heavy', sizeYards: number): OverageInfo {
  // Heavy materials: FLAT FEE - no overage charges
  if (materialType === 'heavy') {
    return {
      rule: 'flat_fee',
      displayMessage: 'Flat fee pricing. Disposal included with no extra weight charges.',
      showTons: false,
    };
  }
  
  // General debris 6/8/10: $30 per additional yard
  if (sizeYards <= 10) {
    return {
      rule: 'per_yard',
      rate: PRICING_POLICIES.overagePerYardSmall,
      unit: 'yard',
      displayMessage: `Overage billed at $${PRICING_POLICIES.overagePerYardSmall} per additional yard.`,
      showTons: false,
    };
  }
  
  // General debris 20-50: per-ton overage
  return {
    rule: 'per_ton',
    rate: PRICING_POLICIES.overagePerTonGeneral,
    unit: 'ton',
    displayMessage: `Overage billed per ton after disposal scale ticket ($${PRICING_POLICIES.overagePerTonGeneral}/ton).`,
    showTons: true,
  };
}

// Standard overage note for display (legacy - use getOverageInfo instead)
export const OVERAGE_NOTE = 'Overage billed per ton after disposal scale ticket.';

// Official included tonnage by size for GENERAL DEBRIS (single source of truth - v56 Page 15)
// Note: For HEAVY materials, tonnage is NOT displayed (flat fee)
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

// ============================================================
// HEAVY MATERIAL PRICING CANON (Proportional 10→8→6)
// Base 10yd = $638, 8yd = 0.8×, 6yd = 0.6×
// ============================================================

// Heavy base rate for Oakland/San Jose (used as default)
export const HEAVY_BASE_10YD = 638;

// Size factors for proportional pricing
export const HEAVY_SIZE_FACTORS: Record<number, number> = {
  10: 1.0,
  8: 0.8,
  6: 0.6,
};

// Material class increments (applied to base BEFORE factor)
export const HEAVY_INCREMENTS = {
  base: 0,       // Clean concrete, soil, sand, gravel
  plus_200: 200, // Brick, asphalt, tile, roofing gravel, rock/stone
  mixed_heavy: 300, // Mix of heavy materials (no trash)
} as const;

export type HeavyMaterialClass = keyof typeof HEAVY_INCREMENTS;

// Calculate heavy price: (BASE + increment) × factor
export function calculateHeavyMaterialPrice(
  size: 6 | 8 | 10,
  materialClass: HeavyMaterialClass = 'base',
  baseRate: number = HEAVY_BASE_10YD
): number {
  const increment = HEAVY_INCREMENTS[materialClass];
  const factor = HEAVY_SIZE_FACTORS[size] || 1.0;
  return Math.round((baseRate + increment) * factor * 100) / 100;
}

// Heavy Material / Lowboy pricing (6, 8, 10 only) - Base materials pricing
// Note: These are BASE prices. +$200 and +$300 are applied on top via proportional calc
export const HEAVY_MATERIAL_PRICING: V56PricingTier[] = [
  { 
    size: 6, 
    basePrice: calculateHeavyMaterialPrice(6, 'base'), // 638 × 0.6 = 382.80
    priceRangeLow: Math.round(calculateHeavyMaterialPrice(6, 'base')), 
    priceRangeHigh: Math.round(calculateHeavyMaterialPrice(6, 'mixed_heavy')), 
    includedTons: 0, // FLAT FEE - no tons displayed
    category: 'heavy' 
  },
  { 
    size: 8, 
    basePrice: calculateHeavyMaterialPrice(8, 'base'), // 638 × 0.8 = 510.40
    priceRangeLow: Math.round(calculateHeavyMaterialPrice(8, 'base')), 
    priceRangeHigh: Math.round(calculateHeavyMaterialPrice(8, 'mixed_heavy')), 
    includedTons: 0, 
    category: 'heavy' 
  },
  { 
    size: 10, 
    basePrice: calculateHeavyMaterialPrice(10, 'base'), // 638 × 1.0 = 638.00
    priceRangeLow: Math.round(calculateHeavyMaterialPrice(10, 'base')), 
    priceRangeHigh: Math.round(calculateHeavyMaterialPrice(10, 'mixed_heavy')), 
    includedTons: 0, 
    category: 'heavy' 
  },
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

// Get detailed heavy pricing table for display
export function getHeavyPricingDisplay() {
  return {
    base: {
      label: 'Base Materials',
      description: 'Clean concrete, soil, sand, gravel',
      prices: {
        10: Math.round(calculateHeavyMaterialPrice(10, 'base')),
        8: Math.round(calculateHeavyMaterialPrice(8, 'base')),
        6: Math.round(calculateHeavyMaterialPrice(6, 'base')),
      },
    },
    plus_200: {
      label: '+$200 Materials',
      description: 'Brick, asphalt, tile, roofing gravel, rock/stone',
      prices: {
        10: Math.round(calculateHeavyMaterialPrice(10, 'plus_200')),
        8: Math.round(calculateHeavyMaterialPrice(8, 'plus_200')),
        6: Math.round(calculateHeavyMaterialPrice(6, 'plus_200')),
      },
    },
    mixed_heavy: {
      label: '+$300 Mixed Heavy',
      description: 'Mix of heavy materials (concrete + soil, etc.)',
      prices: {
        10: Math.round(calculateHeavyMaterialPrice(10, 'mixed_heavy')),
        8: Math.round(calculateHeavyMaterialPrice(8, 'mixed_heavy')),
        6: Math.round(calculateHeavyMaterialPrice(6, 'mixed_heavy')),
      },
    },
  };
}

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
// RECYCLING & DIVERSION SUPPORT SERVICE (Green Halo™)
// Sustainability / Compliance Services
// ============================================================

export interface RecyclingServiceComponent {
  id: string;
  title: string;
  description: string;
  items: string[];
}

export interface RecyclingSupportService {
  name: string;
  displayName: string;
  category: string;
  description: string;
  importantNote: string;
  components: RecyclingServiceComponent[];
  pricingDisplay: {
    type: 'request-based';
    label: string;
    note: string;
    structures: string[];
  };
  disclaimers: string[];
  integrationNote: string;
}

export const RECYCLING_SUPPORT_SERVICE: RecyclingSupportService = {
  name: 'recycling_diversion_support',
  displayName: 'Recycling & Diversion Support',
  category: 'Sustainability / Compliance Services',
  description: 'Calsan provides recycling-focused hauling coordination and diversion support for businesses and projects that are required or committed to recycling. This service supports compliance, separation, hauling coordination, and basic recycling/diversion reporting.',
  importantNote: 'Calsan does NOT operate recycling facilities. Calsan works with licensed transfer stations and approved facilities that are required to sort and recycle construction and demolition materials when possible.',
  components: [
    {
      id: 'setup_assessment',
      title: 'Setup & Assessment',
      description: 'One-time project evaluation',
      items: [
        'Review waste streams',
        'Identify recycling/diversion requirements (WMP, city rules, ESG)',
        'Recommend container strategy by material',
      ],
    },
    {
      id: 'container_coordination',
      title: 'Container Strategy & Coordination',
      description: 'Multi-material logistics',
      items: [
        'Multiple dumpsters by material type (as needed)',
        'Scheduling and coordination of pickups',
        'Material routing to correct facilities',
      ],
    },
    {
      id: 'tracking',
      title: 'Recycling & Diversion Tracking',
      description: 'Documentation collection',
      items: [
        'Collection of weight tickets',
        'Basic tracking by material type',
        'Diversion summaries when required',
      ],
    },
    {
      id: 'reporting',
      title: 'Reporting & Documentation',
      description: 'Compliance support',
      items: [
        'Recycling/diversion summary report',
        'Weight ticket copies',
        'Support documentation for WMP or inspections',
      ],
    },
  ],
  pricingDisplay: {
    type: 'request-based',
    label: 'Based on Project Scope',
    note: 'Pricing is customized based on project size, material types, and reporting requirements.',
    structures: [
      'One-time setup fee',
      'Monthly support',
      'Per-project reporting fee',
    ],
  },
  disclaimers: [
    'Recycling rates depend on material type and facility processes',
    'Diversion percentages are not guaranteed',
    'Final results depend on proper material separation and facility sorting',
  ],
  integrationNote: 'This service is NOT part of the Quick Quote calculator. This service is requested separately via "Request Recycling Support". Dumpster pricing rules remain unchanged.',
};

// ============================================================
// OPERATIONAL HOURS - Customer Service & Delivery Windows
// ============================================================

export const OPERATIONAL_HOURS = {
  customerService: {
    days: 'Monday – Sunday',
    hours: '6:00 AM – 9:00 PM',
    displayText: 'Customer Service available 6:00 AM – 9:00 PM, Monday through Sunday.',
    displayTextEs: 'Servicio al Cliente disponible 6:00 AM – 9:00 PM, Lunes a Domingo.',
    channels: ['Phone', 'SMS', 'Website Chat', 'Email'],
  },
  operations: {
    standardDays: 'Monday – Friday',
    weekendDays: 'Saturday & Sunday',
    weekendType: 'special_request' as const,
    weekendNote: 'Weekend delivery and pickup available by special request. Subject to availability and may include additional fees.',
    weekendNoteEs: 'Entrega y recogida de fin de semana disponible por solicitud especial. Sujeto a disponibilidad y puede incluir cargos adicionales.',
    timeWindows: [
      { id: 'morning', label: 'Morning', hours: '7:00 AM – 11:00 AM' },
      { id: 'midday', label: 'Midday', hours: '11:00 AM – 3:00 PM' },
      { id: 'afternoon', label: 'Afternoon', hours: '3:00 PM – 6:00 PM' },
    ],
    windowNote: 'Deliveries and pickups are scheduled in estimated time windows, not exact times.',
    windowNoteEs: 'Las entregas y recogidas se programan en ventanas de tiempo estimadas, no en horarios exactos.',
  },
  afterHours: {
    message: 'Messages and emails received after hours will be answered the next business window.',
    messageEs: 'Los mensajes y correos electrónicos recibidos fuera de horario serán respondidos en la próxima ventana de atención.',
    smsAutoReply: 'Thanks for reaching out! Our team is currently offline (6am–9pm). We\'ve received your message and will respond as soon as we\'re back.',
    smsAutoReplyEs: '¡Gracias por contactarnos! Nuestro equipo está fuera de línea (6am–9pm). Hemos recibido su mensaje y responderemos tan pronto como volvamos.',
  },
  timezone: 'America/Los_Angeles',
} as const;

// Helper to check if currently within business hours
export function isWithinBusinessHours(): boolean {
  const now = new Date();
  // Get Pacific time (simplified - doesn't account for DST perfectly)
  const pstOffset = -8;
  const utcHour = now.getUTCHours();
  const pstHour = (utcHour + pstOffset + 24) % 24;
  return pstHour >= 6 && pstHour < 21;
}

// Helper to check if a date is a weekend
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

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
  recyclingSupport: '/contact?service=recycling-support',
} as const;
