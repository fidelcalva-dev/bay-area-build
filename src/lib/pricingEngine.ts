// Pricing Engine for Instant Quote Calculator
// Derives from shared-data.ts MASTER source

import { 
  DUMPSTER_SIZES_DATA, 
  getHeavySizes, 
  getGeneralSizes,
  PRICING_POLICIES,
  OVERAGE_NOTE,
  INCLUDED_TONS_BY_SIZE 
} from './shared-data';

// Re-export for convenience
export { OVERAGE_NOTE, INCLUDED_TONS_BY_SIZE };

export interface PricingZone {
  id: string;
  name: string;
  baseMultiplier: number;
  zipCodes: string[];
}

export interface DumpsterSize {
  value: string;
  label: string;
  basePrice: number;
  includedTons: number;
  description: string;
  dimensions: string;
  popular?: boolean;
  heavyOnly?: boolean;
}

export interface MaterialType {
  value: string;
  label: string;
  icon: string;
  description: string;
  priceAdjustment: number;
  allowedSizes: string[];
}

export interface Extra {
  id: string;
  label: string;
  description: string;
  price: number;
  icon: string;
}

export interface QuoteLineItem {
  label: string;
  amount: number;
  type: 'base' | 'addition' | 'discount' | 'subtotal';
}

export interface QuoteResult {
  lineItems: QuoteLineItem[];
  subtotal: number;
  estimatedMin: number;
  estimatedMax: number;
  includedTons: number;
  overageCostPerTon: number;
  zone: PricingZone | null;
  isValid: boolean;
  errors: string[];
}

// Service Zones - Bay Area coverage
export const PRICING_ZONES: PricingZone[] = [
  {
    id: 'zone-1',
    name: 'Core Bay Area',
    baseMultiplier: 1.0,
    zipCodes: [
      // Alameda County
      '94501', '94502', '94536', '94538', '94539', '94540', '94541', '94542', '94543', '94544',
      '94545', '94546', '94550', '94551', '94552', '94555', '94557', '94560', '94566', '94568',
      '94577', '94578', '94579', '94580', '94586', '94587', '94588', '94601', '94602', '94603',
      '94604', '94605', '94606', '94607', '94608', '94609', '94610', '94611', '94612', '94613',
      '94614', '94615', '94617', '94618', '94619', '94620', '94621', '94622', '94623', '94624',
      '94625', '94649', '94659', '94660', '94661', '94662', '94666', '94701', '94702', '94703',
      '94704', '94705', '94706', '94707', '94708', '94709', '94710', '94712', '94720',
      // San Francisco
      '94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112',
      '94114', '94115', '94116', '94117', '94118', '94119', '94120', '94121', '94122', '94123',
      '94124', '94125', '94126', '94127', '94128', '94129', '94130', '94131', '94132', '94133',
      '94134', '94137', '94139', '94140', '94141', '94142', '94143', '94144', '94145', '94146',
      '94147', '94151', '94158', '94159', '94160', '94161', '94163', '94164', '94172', '94177',
      '94188',
      // Contra Costa Core
      '94506', '94507', '94509', '94517', '94518', '94519', '94520', '94521', '94522', '94523',
      '94524', '94525', '94526', '94527', '94528', '94529', '94530', '94531', '94553', '94556',
      '94563', '94564', '94565', '94569', '94570', '94572', '94575', '94582', '94583', '94595',
      '94596', '94597', '94598', '94801', '94802', '94803', '94804', '94805', '94806', '94807',
      '94808', '94820', '94850',
      // Santa Clara Core
      '94022', '94023', '94024', '94035', '94039', '94040', '94041', '94042', '94043', '94085',
      '94086', '94087', '94088', '94089', '94301', '94302', '94303', '94304', '94305', '94306',
      '95002', '95008', '95009', '95011', '95013', '95014', '95015', '95020', '95021', '95026',
      '95030', '95031', '95032', '95035', '95036', '95037', '95038', '95042', '95044', '95046',
      '95050', '95051', '95052', '95053', '95054', '95055', '95056', '95070', '95071', '95101',
      '95103', '95106', '95108', '95109', '95110', '95111', '95112', '95113', '95115', '95116',
      '95117', '95118', '95119', '95120', '95121', '95122', '95123', '95124', '95125', '95126',
      '95127', '95128', '95129', '95130', '95131', '95132', '95133', '95134', '95135', '95136',
      '95138', '95139', '95140', '95141', '95148', '95150', '95151', '95152', '95153', '95154',
      '95155', '95156', '95157', '95158', '95159', '95160', '95161', '95164', '95170', '95172',
      '95173', '95190', '95191', '95192', '95193', '95194', '95196',
      // San Mateo
      '94002', '94005', '94010', '94011', '94014', '94015', '94016', '94017', '94018', '94019',
      '94020', '94021', '94025', '94026', '94027', '94028', '94030', '94037', '94038', '94044',
      '94060', '94061', '94062', '94063', '94064', '94065', '94066', '94070', '94074', '94080',
      '94083', '94401', '94402', '94403', '94404', '94497',
    ],
  },
  {
    id: 'zone-2',
    name: 'Extended Bay Area',
    baseMultiplier: 1.15,
    zipCodes: [
      // Marin
      '94901', '94903', '94904', '94912', '94913', '94914', '94915', '94920', '94924', '94925',
      '94929', '94930', '94933', '94937', '94938', '94939', '94940', '94941', '94942', '94945',
      '94946', '94947', '94948', '94949', '94950', '94956', '94957', '94960', '94963', '94964',
      '94965', '94966', '94970', '94971', '94973', '94974', '94976', '94977', '94978', '94979',
      '94998', '94999',
      // Sonoma
      '94922', '94923', '94926', '94927', '94928', '94931', '94951', '94952', '94953', '94954',
      '94955', '94972', '94975', '95401', '95402', '95403', '95404', '95405', '95406', '95407',
      '95409', '95412', '95416', '95419', '95421', '95425', '95430', '95431', '95433', '95436',
      '95439', '95441', '95442', '95444', '95446', '95448', '95450', '95452', '95462', '95465',
      '95471', '95472', '95473', '95476', '95486', '95492', '95497',
      // Napa
      '94503', '94508', '94515', '94558', '94559', '94562', '94567', '94573', '94574', '94576',
      '94581', '94599',
      // Solano
      '94510', '94512', '94533', '94534', '94535', '94571', '94585', '94589', '94590', '94591',
      '94592',
    ],
  },
];

// ============================================================
// DUMPSTER SIZES - Derived from MASTER shared-data.ts
// ============================================================

export const DUMPSTER_SIZES: DumpsterSize[] = DUMPSTER_SIZES_DATA.map(size => ({
  value: String(size.yards),
  label: `${size.yards} yd`,
  basePrice: size.priceFrom,
  includedTons: size.includedTons,
  description: size.description,
  dimensions: size.dimensions,
  popular: size.popular,
  heavyOnly: size.category === 'heavy',
}));

// ============================================================
// MATERIAL TYPES - Dynamically derived from MASTER data
// ============================================================

export const MATERIAL_TYPES: MaterialType[] = [
  {
    value: 'general',
    label: 'General Debris',
    icon: '🏠',
    description: 'Household items, furniture, general waste',
    priceAdjustment: 0,
    allowedSizes: getGeneralSizes().map(s => String(s.yards)),
  },
  {
    value: 'heavy',
    label: 'Heavy Materials',
    icon: '🪨',
    description: 'Concrete, dirt, brick, asphalt, rocks',
    priceAdjustment: PRICING_POLICIES.heavyMaterialSurcharge,
    allowedSizes: getHeavySizes().map(s => String(s.yards)),
  },
];

// Extra services - derived from PRICING_POLICIES
export const EXTRAS: Extra[] = [
  {
    id: 'same-day',
    label: 'Same-Day Delivery',
    description: 'Guaranteed same-day drop-off',
    price: PRICING_POLICIES.sameDayDelivery,
    icon: '⚡',
  },
  {
    id: 'weekend',
    label: 'Weekend Delivery',
    description: 'Saturday or Sunday delivery',
    price: 50,
    icon: '📅',
  },
  {
    id: 'mattress',
    label: 'Mattress Disposal',
    description: 'Per mattress (CA recycling fee)',
    price: PRICING_POLICIES.mattressDisposal,
    icon: '🛏️',
  },
  {
    id: 'appliance',
    label: 'Appliance w/ Freon',
    description: 'Fridge, freezer, AC unit',
    price: PRICING_POLICIES.applianceWithFreon,
    icon: '❄️',
  },
  {
    id: 'tires',
    label: 'Tire Disposal (up to 4)',
    description: 'Passenger car tires',
    price: 40,
    icon: '🛞',
  },
];

// Rental day options
export const RENTAL_DAYS = [
  { value: 3, label: '3 days', extraDays: 0, extraCost: 0 },
  { value: 7, label: '7 days', extraDays: 0, extraCost: 0, popular: true },
  { value: 14, label: '14 days', extraDays: 7, extraCost: PRICING_POLICIES.extraDayCost * 7 },
  { value: 21, label: '21 days', extraDays: 14, extraCost: PRICING_POLICIES.extraDayCost * 14 },
];

// Extra day cost - from PRICING_POLICIES
export const EXTRA_DAY_COST = PRICING_POLICIES.extraDayCost;

// Overage cost per ton - from PRICING_POLICIES
export const OVERAGE_COST_PER_TON = PRICING_POLICIES.overagePerTonGeneral;

// User types with discounts
export const USER_TYPES = [
  { value: 'homeowner', label: 'Homeowner', discount: 0, icon: '🏠' },
  { value: 'contractor', label: 'Contractor', discount: 0.1, icon: '🔨' },
  { value: 'business', label: 'Business', discount: 0.05, icon: '🏢' },
];

// Get zone by ZIP code
export function getZoneByZip(zip: string): PricingZone | null {
  for (const zone of PRICING_ZONES) {
    if (zone.zipCodes.includes(zip)) {
      return zone;
    }
  }
  return null;
}

// Calculate quote
export function calculateQuote(params: {
  zip: string;
  materialType: string;
  sizeValue: string;
  rentalDays: number;
  extras: string[];
  userType: string;
}): QuoteResult {
  const errors: string[] = [];
  const lineItems: QuoteLineItem[] = [];

  // Validate ZIP
  const zone = getZoneByZip(params.zip);
  if (!zone && params.zip.length === 5) {
    errors.push('ZIP code is outside our service area');
  }

  // Get material type
  const material = MATERIAL_TYPES.find((m) => m.value === params.materialType);
  if (!material) {
    errors.push('Invalid material type');
  }

  // Get size
  const size = DUMPSTER_SIZES.find((s) => s.value === params.sizeValue);
  if (!size) {
    errors.push('Invalid dumpster size');
  }

  // Validate size for material
  if (material && size && !material.allowedSizes.includes(size.value)) {
    errors.push(`${size.label} is not available for ${material.label}`);
  }

  // Get rental days
  const rental = RENTAL_DAYS.find((r) => r.value === params.rentalDays);
  if (!rental) {
    errors.push('Invalid rental duration');
  }

  // Get user type
  const userTypeData = USER_TYPES.find((u) => u.value === params.userType);
  const discount = userTypeData?.discount || 0;

  if (errors.length > 0 || !size || !material || !rental || !zone) {
    return {
      lineItems: [],
      subtotal: 0,
      estimatedMin: 0,
      estimatedMax: 0,
      includedTons: 0,
      overageCostPerTon: OVERAGE_COST_PER_TON,
      zone: null,
      isValid: false,
      errors,
    };
  }

  // Calculate base price with zone multiplier
  const basePrice = Math.round(size.basePrice * zone.baseMultiplier);
  lineItems.push({
    label: `${size.label} Dumpster (${rental.label} rental)`,
    amount: basePrice,
    type: 'base',
  });

  // Material adjustment
  if (material.priceAdjustment > 0) {
    lineItems.push({
      label: `${material.label} Surcharge`,
      amount: material.priceAdjustment,
      type: 'addition',
    });
  }

  // Extra rental days
  if (rental.extraCost > 0) {
    lineItems.push({
      label: `Extended Rental (+${rental.extraDays} days)`,
      amount: rental.extraCost,
      type: 'addition',
    });
  }

  // Extras
  for (const extraId of params.extras) {
    const extra = EXTRAS.find((e) => e.id === extraId);
    if (extra) {
      lineItems.push({
        label: extra.label,
        amount: extra.price,
        type: 'addition',
      });
    }
  }

  // Calculate subtotal before discount
  const subtotalBeforeDiscount = lineItems.reduce((sum, item) => sum + item.amount, 0);

  // Apply discount
  if (discount > 0) {
    const discountAmount = Math.round(subtotalBeforeDiscount * discount);
    lineItems.push({
      label: `${userTypeData?.label} Discount (${discount * 100}%)`,
      amount: -discountAmount,
      type: 'discount',
    });
  }

  // Calculate final subtotal
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  // Estimated range (accounts for potential weight variance)
  const estimatedMin = subtotal;
  const estimatedMax = subtotal + 75;

  return {
    lineItems,
    subtotal,
    estimatedMin,
    estimatedMax,
    includedTons: size.includedTons,
    overageCostPerTon: OVERAGE_COST_PER_TON,
    zone,
    isValid: true,
    errors: [],
  };
}
