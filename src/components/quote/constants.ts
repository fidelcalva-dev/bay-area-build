// Quote System Constants
import type { PricingZone, DumpsterSize, MaterialType, Extra, RentalPeriod, UserType, DebrisItem } from './types';

// Service Zones - Bay Area coverage
export const PRICING_ZONES: PricingZone[] = [
  {
    id: 'zone-1',
    name: 'Core Bay Area',
    slug: 'core-bay',
    baseMultiplier: 1.0,
    distanceMiles: 15,
    estimatedMinutes: 25,
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
    slug: 'extended-bay',
    baseMultiplier: 1.15,
    distanceMiles: 35,
    estimatedMinutes: 45,
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

// Dumpster Sizes with included tons by size
export const DUMPSTER_SIZES: DumpsterSize[] = [
  {
    id: 'size-6',
    value: 6,
    label: '6 Yard',
    basePrice: 325,
    includedTons: 1.0,
    description: 'Small cleanouts, bathroom remodel',
    dimensions: "10' × 4' × 3'",
    isHeavyOnly: true,
  },
  {
    id: 'size-8',
    value: 8,
    label: '8 Yard',
    basePrice: 365,
    includedTons: 1.0,
    description: 'Bathroom/kitchen demo',
    dimensions: "10' × 4' × 4'",
    isHeavyOnly: true,
  },
  {
    id: 'size-10',
    value: 10,
    label: '10 Yard',
    basePrice: 395,
    includedTons: 1.0,
    description: 'Garage cleanout, deck removal',
    dimensions: "12' × 8' × 3.5'",
  },
  {
    id: 'size-15',
    value: 15,
    label: '15 Yard',
    basePrice: 445,
    includedTons: 1.5,
    description: 'Kitchen remodel, flooring',
    dimensions: "16' × 7.5' × 4'",
  },
  {
    id: 'size-20',
    value: 20,
    label: '20 Yard',
    basePrice: 495,
    includedTons: 2.0,
    description: 'Full home renovation',
    dimensions: "22' × 7.5' × 4.5'",
    popular: true,
  },
  {
    id: 'size-30',
    value: 30,
    label: '30 Yard',
    basePrice: 595,
    includedTons: 3.0,
    description: 'Major construction, roofing',
    dimensions: "22' × 7.5' × 6'",
  },
  {
    id: 'size-40',
    value: 40,
    label: '40 Yard',
    basePrice: 695,
    includedTons: 4.0,
    description: 'Commercial demo, large builds',
    dimensions: "22' × 8' × 8'",
  },
];

// Material Types
export const MATERIAL_TYPES: MaterialType[] = [
  {
    value: 'general',
    label: 'General Debris',
    icon: '🏠',
    description: 'Household, furniture, wood, drywall',
    priceAdjustment: 0,
    allowedSizes: [10, 15, 20, 30, 40],
  },
  {
    value: 'heavy',
    label: 'Heavy Materials',
    icon: '🪨',
    description: 'Concrete, dirt, brick, asphalt',
    priceAdjustment: 150,
    allowedSizes: [6, 8, 10],
  },
];

// Extra services with quantities
export const EXTRAS: Extra[] = [
  {
    id: 'extra-days',
    value: 'extra-days',
    label: 'Extra Days',
    description: 'Beyond standard rental',
    price: 50,
    icon: '📅',
    allowQuantity: true,
    maxQuantity: 14,
  },
  {
    id: 'extra-tons',
    value: 'extra-tons',
    label: 'Extra Tons',
    description: 'Pre-purchase overage',
    price: 85,
    icon: '⚖️',
    allowQuantity: true,
    maxQuantity: 5,
  },
  {
    id: 'permit',
    value: 'permit',
    label: 'Street Permit',
    description: 'We handle city permit',
    price: 125,
    icon: '📋',
    allowQuantity: false,
  },
  {
    id: 'mattress',
    value: 'mattress',
    label: 'Mattress Disposal',
    description: 'CA recycling fee',
    price: 50,
    icon: '🛏️',
    allowQuantity: true,
    maxQuantity: 4,
  },
  {
    id: 'appliance',
    value: 'appliance',
    label: 'Appliance w/ Freon',
    description: 'Fridge, freezer, AC',
    price: 75,
    icon: '❄️',
    allowQuantity: true,
    maxQuantity: 4,
  },
  {
    id: 'same-day',
    value: 'same-day',
    label: 'Same-Day Delivery',
    description: 'Guaranteed today',
    price: 100,
    icon: '⚡',
    allowQuantity: false,
  },
  {
    id: 'trip-fee',
    value: 'trip-fee',
    label: 'Dry Run / Trip Fee',
    description: 'If blocked on pickup',
    price: 150,
    icon: '🚛',
    allowQuantity: false,
  },
];

// Rental periods
export const RENTAL_PERIODS: RentalPeriod[] = [
  { value: 3, label: '3 days', extraDays: 0, extraCost: 0 },
  { value: 7, label: '7 days', extraDays: 0, extraCost: 0, popular: true },
  { value: 14, label: '14 days', extraDays: 7, extraCost: 350 },
  { value: 21, label: '21 days', extraDays: 14, extraCost: 700 },
];

// User types with discounts
export const USER_TYPES: UserType[] = [
  { 
    value: 'homeowner', 
    label: 'Homeowner', 
    discount: 0, 
    icon: '🏠',
    benefits: ['No hidden fees', 'Same-day available', 'Flexible scheduling'],
  },
  { 
    value: 'contractor', 
    label: 'Contractor', 
    discount: 0.10, 
    icon: '🔨',
    benefits: ['10% off all rentals', 'Priority scheduling', 'Net-30 available'],
  },
  { 
    value: 'business', 
    label: 'Business', 
    discount: 0.05, 
    icon: '🏢',
    benefits: ['5% off all rentals', 'Recurring service', 'Dedicated support'],
  },
];

// Pricing constants
export const EXTRA_DAY_COST = 50;
export const OVERAGE_COST_PER_TON = 85;

// Debris items for weight estimator
export const DEBRIS_ITEMS: DebrisItem[] = [
  // Furniture
  { id: 'sofa', name: 'Sofa/Couch', icon: '🛋️', category: 'Furniture', weightPerUnit: 200, volumePerUnit: 0.8, unit: 'each' },
  { id: 'mattress', name: 'Mattress', icon: '🛏️', category: 'Furniture', weightPerUnit: 100, volumePerUnit: 0.5, unit: 'each' },
  { id: 'dresser', name: 'Dresser', icon: '🪑', category: 'Furniture', weightPerUnit: 150, volumePerUnit: 0.4, unit: 'each' },
  { id: 'table', name: 'Table', icon: '🪑', category: 'Furniture', weightPerUnit: 80, volumePerUnit: 0.3, unit: 'each' },
  { id: 'chairs', name: 'Chairs (set of 4)', icon: '🪑', category: 'Furniture', weightPerUnit: 60, volumePerUnit: 0.3, unit: 'set' },
  
  // Appliances
  { id: 'fridge', name: 'Refrigerator', icon: '❄️', category: 'Appliances', weightPerUnit: 250, volumePerUnit: 0.6, unit: 'each' },
  { id: 'washer', name: 'Washer/Dryer', icon: '🧺', category: 'Appliances', weightPerUnit: 200, volumePerUnit: 0.4, unit: 'each' },
  { id: 'dishwasher', name: 'Dishwasher', icon: '🍽️', category: 'Appliances', weightPerUnit: 100, volumePerUnit: 0.3, unit: 'each' },
  { id: 'stove', name: 'Stove/Oven', icon: '🔥', category: 'Appliances', weightPerUnit: 200, volumePerUnit: 0.4, unit: 'each' },
  
  // Construction
  { id: 'drywall', name: 'Drywall (per sheet)', icon: '🧱', category: 'Construction', weightPerUnit: 60, volumePerUnit: 0.1, unit: 'sheet' },
  { id: 'lumber', name: 'Lumber (per 10 boards)', icon: '🪵', category: 'Construction', weightPerUnit: 150, volumePerUnit: 0.5, unit: 'bundle' },
  { id: 'carpet', name: 'Carpet (per 100 sqft)', icon: '🟫', category: 'Construction', weightPerUnit: 100, volumePerUnit: 0.3, unit: '100sqft' },
  { id: 'shingles', name: 'Roofing Shingles (per square)', icon: '🏠', category: 'Construction', weightPerUnit: 250, volumePerUnit: 0.3, unit: 'square' },
  { id: 'cabinets', name: 'Cabinets (per unit)', icon: '🗄️', category: 'Construction', weightPerUnit: 80, volumePerUnit: 0.3, unit: 'each' },
  
  // Yard/Outdoor
  { id: 'dirt', name: 'Dirt (cubic yard)', icon: '🟤', category: 'Heavy', weightPerUnit: 2200, volumePerUnit: 1.0, unit: 'cuyd' },
  { id: 'concrete', name: 'Concrete (cubic yard)', icon: '⬜', category: 'Heavy', weightPerUnit: 4000, volumePerUnit: 1.0, unit: 'cuyd' },
  { id: 'branches', name: 'Tree Branches (pickup load)', icon: '🌿', category: 'Yard', weightPerUnit: 300, volumePerUnit: 2.0, unit: 'load' },
  { id: 'grass', name: 'Grass/Sod (per 100 sqft)', icon: '🌱', category: 'Yard', weightPerUnit: 150, volumePerUnit: 0.5, unit: '100sqft' },
  
  // Miscellaneous
  { id: 'boxes', name: 'Moving Boxes (per 10)', icon: '📦', category: 'Misc', weightPerUnit: 50, volumePerUnit: 0.5, unit: 'bundle' },
  { id: 'electronics', name: 'Electronics/TVs', icon: '📺', category: 'Misc', weightPerUnit: 50, volumePerUnit: 0.2, unit: 'each' },
  { id: 'tires', name: 'Tires (set of 4)', icon: '🛞', category: 'Misc', weightPerUnit: 100, volumePerUnit: 0.4, unit: 'set' },
];

// Size recommendations based on volume
export const SIZE_RECOMMENDATIONS: { maxVolume: number; size: number }[] = [
  { maxVolume: 6, size: 6 },
  { maxVolume: 8, size: 8 },
  { maxVolume: 10, size: 10 },
  { maxVolume: 15, size: 15 },
  { maxVolume: 20, size: 20 },
  { maxVolume: 30, size: 30 },
  { maxVolume: 40, size: 40 },
];
