/**
 * Smart Pricing Engine — Location-Aware Cost & Pricing Calculator
 * 
 * Architecture:
 *   Customer Input → Location Engine → Disposal Engine → Cost Engine → Pricing Engine
 * 
 * Supports:
 *   - Multiple yards (current + future)
 *   - Multiple dump sites per city
 *   - Material-specific disposal routing
 *   - Green Halo compliance
 *   - Contractor pricing layer
 *   - Future location expansion without code changes
 */
import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TYPES
// =====================================================

export interface Yard {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  latitude: number;
  longitude: number;
  is_active: boolean;
  service_radius_miles: number;
  base_delivery_fee: number;
  base_pickup_fee: number;
  base_fuel_cost: number;
  base_labor_cost: number;
  overhead_pct: number;
  market: string;
  market_id: string | null;
}

export interface DumpSite {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  materials_accepted: string[];
  is_active: boolean;
  dump_fee_per_ton: number;
  flat_rate_json: Record<string, number>;
  clean_only_flag: boolean;
  mixed_allowed_flag: boolean;
  green_halo_supported_flag: boolean;
  contamination_surcharge: number;
  reroute_surcharge: number;
}

export interface MaterialRule {
  material_class: string;
  display_label: string;
  is_heavy: boolean;
  allowed_sizes: number[];
  pricing_mode: 'included_tons' | 'flat_rate' | 'manual_review';
  included_tons_json: Record<string, number>;
  flat_rate_json: Record<string, number>;
  overweight_fee_per_ton: number;
  requires_clean_load: boolean;
  green_halo_eligible: boolean;
  contamination_policy: string | null;
  reroute_policy: string | null;
  public_warning: string | null;
}

export interface YardSelection {
  yard: Yard;
  distanceMiles: number;
  deliveryFee: number;
  pickupFee: number;
  zoneAdjustment: number;
}

export interface DumpSiteSelection {
  site: DumpSite;
  distanceFromJobMiles: number;
  distanceFromYardMiles: number;
  dumpCostBasis: number;
  materialAccepted: boolean;
  surchargeRules: {
    contamination: number;
    reroute: number;
  };
  isGreenHalo: boolean;
}

export interface InternalCost {
  delivery: number;
  pickup: number;
  dumpFee: number;
  fuel: number;
  labor: number;
  overhead: number;
  routeAdjustment: number;
  greenHaloCost: number;
  totalInternal: number;
}

export interface SmartQuote {
  // Location context
  yard: YardSelection;
  dumpSite: DumpSiteSelection;
  materialRule: MaterialRule;
  
  // Cost breakdown (internal only)
  internalCost: InternalCost;
  
  // Public pricing
  publicPriceLow: number;
  publicPriceHigh: number;
  includedTons: number;
  overweightFeePerTon: number;
  isFlatFee: boolean;
  isManualReview: boolean;
  marginPct: number;
  
  // Capacity & surge
  surgeMultiplier: number;
  capacityUtilization: number;
  
  // Vendor fallback
  isVendorFallback: boolean;
  vendorName?: string;
  
  // Warnings
  warnings: string[];
  
  // Flags
  greenHaloApplied: boolean;
  contaminationRisk: boolean;
  outsideServiceRadius: boolean;
}

export interface SmartQuoteInput {
  lat: number;
  lng: number;
  zip: string;
  materialClass: string;
  sizeYd: number;
  rentalDays?: number;
  greenHaloRequired?: boolean;
  isContractor?: boolean;
  contractorDiscountPct?: number;
  isSameDay?: boolean;
}

// =====================================================
// HAVERSINE DISTANCE
// =====================================================

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// =====================================================
// YARD ENGINE
// =====================================================

/** Fetch all active yards */
async function fetchActiveYards(): Promise<Yard[]> {
  const { data } = await supabase
    .from('yards')
    .select('*')
    .eq('is_active', true)
    .order('priority_rank');

  if (!data) return [];
  return data.map((y) => ({
    id: y.id,
    name: y.name,
    slug: y.slug,
    city: y.city,
    state: y.state,
    zip: y.zip,
    latitude: Number(y.latitude),
    longitude: Number(y.longitude),
    is_active: y.is_active,
    service_radius_miles: Number(y.service_radius_miles),
    base_delivery_fee: Number(y.base_delivery_fee),
    base_pickup_fee: Number(y.base_pickup_fee),
    base_fuel_cost: Number(y.base_fuel_cost),
    base_labor_cost: Number(y.base_labor_cost),
    overhead_pct: Number(y.overhead_pct),
    market: y.market,
    market_id: y.market_id,
  }));
}

/** Select the best yard for a service address */
export async function selectBestYard(lat: number, lng: number): Promise<YardSelection | null> {
  const yards = await fetchActiveYards();
  if (!yards.length) return null;

  const candidates = yards
    .map((yard) => ({
      yard,
      distanceMiles: haversineDistance(lat, lng, yard.latitude, yard.longitude),
    }))
    .filter((c) => c.distanceMiles <= c.yard.service_radius_miles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles);

  if (!candidates.length) {
    // Outside all service radii — return nearest with flag
    const nearest = yards
      .map((yard) => ({
        yard,
        distanceMiles: haversineDistance(lat, lng, yard.latitude, yard.longitude),
      }))
      .sort((a, b) => a.distanceMiles - b.distanceMiles)[0];

    if (!nearest) return null;

    const distAdj = Math.max(0, (nearest.distanceMiles - nearest.yard.service_radius_miles) * 3);
    return {
      yard: nearest.yard,
      distanceMiles: nearest.distanceMiles,
      deliveryFee: nearest.yard.base_delivery_fee + distAdj,
      pickupFee: nearest.yard.base_pickup_fee + distAdj,
      zoneAdjustment: distAdj,
    };
  }

  const best = candidates[0];
  // Distance-based adjustment: $2/mile over 15 miles
  const extraMiles = Math.max(0, best.distanceMiles - 15);
  const distAdj = Math.round(extraMiles * 2);

  return {
    yard: best.yard,
    distanceMiles: best.distanceMiles,
    deliveryFee: best.yard.base_delivery_fee + distAdj,
    pickupFee: best.yard.base_pickup_fee + distAdj,
    zoneAdjustment: distAdj,
  };
}

// =====================================================
// DUMP SITE ENGINE
// =====================================================

/** Fetch all active disposal sites */
async function fetchActiveDumpSites(): Promise<DumpSite[]> {
  const { data } = await supabase
    .from('disposal_sites')
    .select('*')
    .eq('is_active', true);

  if (!data) return [];
  return data.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    city: d.city,
    state: d.state,
    lat: d.lat,
    lng: d.lng,
    materials_accepted: d.materials_accepted || [],
    is_active: d.is_active,
    dump_fee_per_ton: Number(d.dump_fee_per_ton),
    flat_rate_json: (d.flat_rate_json as Record<string, number>) || {},
    clean_only_flag: d.clean_only_flag,
    mixed_allowed_flag: d.mixed_allowed_flag,
    green_halo_supported_flag: d.green_halo_supported_flag,
    contamination_surcharge: Number(d.contamination_surcharge),
    reroute_surcharge: Number(d.reroute_surcharge),
  }));
}

/** Map canonical material class to accepted_materials values */
function materialClassToAccepted(materialClass: string): string[] {
  const map: Record<string, string[]> = {
    GENERAL_DEBRIS: ['general_debris', 'mixed_cd'],
    CLEAN_SOIL: ['clean_soil'],
    CLEAN_CONCRETE: ['clean_concrete'],
    MIXED_SOIL: ['mixed_soil'],
    ROOFING: ['roofing'],
    YARD_WASTE: ['yard_waste'],
    MIXED_CONSTRUCTION: ['mixed_cd', 'construction_debris'],
    UNKNOWN: ['general_debris', 'mixed_cd'],
  };
  return map[materialClass] || ['general_debris'];
}

/** Select the best dump site for a job */
export async function selectBestDumpSite(
  jobLat: number,
  jobLng: number,
  yardLat: number,
  yardLng: number,
  materialClass: string,
  greenHaloRequired: boolean = false,
): Promise<DumpSiteSelection | null> {
  const sites = await fetchActiveDumpSites();
  if (!sites.length) return null;

  const acceptedTypes = materialClassToAccepted(materialClass);
  const isHeavy = ['CLEAN_SOIL', 'CLEAN_CONCRETE', 'MIXED_SOIL'].includes(materialClass);

  // Filter sites by material acceptance
  const eligible = sites.filter((site) => {
    // Material must be accepted
    const accepts = site.materials_accepted.some((m) => acceptedTypes.includes(m));
    if (!accepts) return false;

    // Clean material requires clean_only or clean_fill site
    if (isHeavy && site.clean_only_flag) return true;
    if (isHeavy && !site.materials_accepted.some(m => ['clean_soil', 'clean_concrete', 'mixed_soil'].includes(m))) return false;

    // Green Halo requirement
    if (greenHaloRequired && !site.green_halo_supported_flag) return false;

    return true;
  });

  if (!eligible.length) return null;

  // Score by distance from job (primary) + distance from yard (secondary)
  const scored = eligible
    .filter((s) => s.lat != null && s.lng != null)
    .map((site) => {
      const distFromJob = haversineDistance(jobLat, jobLng, site.lat!, site.lng!);
      const distFromYard = haversineDistance(yardLat, yardLng, site.lat!, site.lng!);
      // Weighted score: 60% job proximity, 40% yard proximity
      const score = distFromJob * 0.6 + distFromYard * 0.4;
      return { site, distFromJob, distFromYard, score };
    })
    .sort((a, b) => a.score - b.score);

  if (!scored.length) return null;

  const best = scored[0];
  return {
    site: best.site,
    distanceFromJobMiles: Math.round(best.distFromJob * 10) / 10,
    distanceFromYardMiles: Math.round(best.distFromYard * 10) / 10,
    dumpCostBasis: best.site.dump_fee_per_ton,
    materialAccepted: true,
    surchargeRules: {
      contamination: best.site.contamination_surcharge,
      reroute: best.site.reroute_surcharge,
    },
    isGreenHalo: greenHaloRequired && best.site.green_halo_supported_flag,
  };
}

// =====================================================
// MATERIAL RULES ENGINE
// =====================================================

/** Fetch material rule from database */
export async function getMaterialRule(materialClass: string): Promise<MaterialRule | null> {
  const { data } = await supabase
    .from('material_rules')
    .select('*')
    .eq('material_class', materialClass)
    .eq('is_active', true)
    .maybeSingle();

  if (!data) return null;

  return {
    material_class: data.material_class,
    display_label: data.display_label,
    is_heavy: data.is_heavy,
    allowed_sizes: data.allowed_sizes,
    pricing_mode: data.pricing_mode as MaterialRule['pricing_mode'],
    included_tons_json: (data.included_tons_json as Record<string, number>) || {},
    flat_rate_json: (data.flat_rate_json as Record<string, number>) || {},
    overweight_fee_per_ton: Number(data.overweight_fee_per_ton),
    requires_clean_load: data.requires_clean_load,
    green_halo_eligible: data.green_halo_eligible,
    contamination_policy: data.contamination_policy,
    reroute_policy: data.reroute_policy,
    public_warning: data.public_warning,
  };
}

// =====================================================
// COST ENGINE
// =====================================================

const GREEN_HALO_RATE = 165; // $/ton
const DEFAULT_MARGIN_PCT = 15;
const RANGE_SPREAD = 70;

function calculateInternalCost(
  yard: YardSelection,
  dumpSite: DumpSiteSelection,
  materialRule: MaterialRule,
  sizeYd: number,
  greenHaloRequired: boolean,
): InternalCost {
  const delivery = yard.deliveryFee;
  const pickup = yard.pickupFee;

  // Dump fee calculation
  let dumpFee: number;
  if (materialRule.pricing_mode === 'flat_rate') {
    // Flat rate from material rule or dump site
    const flatRate = materialRule.flat_rate_json[String(sizeYd)];
    dumpFee = flatRate ? flatRate - delivery - pickup : dumpSite.dumpCostBasis * sizeYd * 0.3;
  } else {
    // Included tons pricing
    const includedTons = materialRule.included_tons_json[String(sizeYd)] || 0;
    dumpFee = includedTons * dumpSite.dumpCostBasis;
  }

  // Fuel: base + distance-based
  const fuel = yard.yard.base_fuel_cost + (yard.distanceMiles > 15 ? (yard.distanceMiles - 15) * 1.5 : 0);

  // Labor
  const labor = yard.yard.base_labor_cost;

  // Route adjustment: dump site distance from yard adds cost
  const routeAdjustment = dumpSite.distanceFromYardMiles > 10
    ? Math.round((dumpSite.distanceFromYardMiles - 10) * 2)
    : 0;

  // Green Halo surcharge
  const greenHaloCost = greenHaloRequired
    ? (materialRule.included_tons_json[String(sizeYd)] || 1) * GREEN_HALO_RATE
    : 0;

  const subtotal = delivery + pickup + dumpFee + fuel + labor + routeAdjustment + greenHaloCost;
  const overhead = subtotal * (yard.yard.overhead_pct / 100);

  return {
    delivery,
    pickup,
    dumpFee: Math.round(dumpFee * 100) / 100,
    fuel: Math.round(fuel * 100) / 100,
    labor,
    overhead: Math.round(overhead * 100) / 100,
    routeAdjustment,
    greenHaloCost: Math.round(greenHaloCost * 100) / 100,
    totalInternal: Math.round((subtotal + overhead) * 100) / 100,
  };
}

// =====================================================
// STRATEGIC ROUNDING
// =====================================================

function strategicRound(price: number): number {
  // Round to nearest $5 or clean .50
  if (price <= 500) return Math.round(price / 5) * 5;
  if (price <= 1000) return Math.round(price / 5) * 5;
  return Math.round(price / 10) * 10;
}

// =====================================================
// SMART PRICING ENGINE — MAIN ENTRY
// =====================================================

export async function calculateSmartQuote(input: SmartQuoteInput): Promise<SmartQuote | null> {
  const warnings: string[] = [];

  // 1. Get material rule
  const materialRule = await getMaterialRule(input.materialClass);
  if (!materialRule) {
    console.error(`No material rule for: ${input.materialClass}`);
    return null;
  }

  // Validate size
  if (!materialRule.allowed_sizes.includes(input.sizeYd)) {
    warnings.push(`Size ${input.sizeYd}yd not allowed for ${materialRule.display_label}. Max: ${Math.max(...materialRule.allowed_sizes)}yd.`);
  }

  // 2. Select best yard
  const yard = await selectBestYard(input.lat, input.lng);
  if (!yard) {
    console.error('No yard found for location');
    return null;
  }

  const outsideRadius = yard.distanceMiles > yard.yard.service_radius_miles;
  if (outsideRadius) {
    warnings.push(`Address is ${Math.round(yard.distanceMiles)} miles from nearest yard (${yard.yard.name}). Outside standard service radius.`);
  }

  // 3. Select best dump site
  const greenHalo = input.greenHaloRequired ?? false;
  const dumpSite = await selectBestDumpSite(
    input.lat, input.lng,
    yard.yard.latitude, yard.yard.longitude,
    input.materialClass,
    greenHalo,
  );

  if (!dumpSite) {
    console.error('No dump site found for material');
    return null;
  }

  // 4. Calculate internal cost
  const internalCost = calculateInternalCost(yard, dumpSite, materialRule, input.sizeYd, greenHalo);

  // 5. Calculate public price
  const marginPct = input.contractorDiscountPct
    ? DEFAULT_MARGIN_PCT - input.contractorDiscountPct
    : DEFAULT_MARGIN_PCT;

  let publicPrice: number;
  const isManualReview = materialRule.pricing_mode === 'manual_review';

  if (materialRule.pricing_mode === 'flat_rate') {
    // Flat rate: use canonical price directly
    publicPrice = materialRule.flat_rate_json[String(input.sizeYd)] || strategicRound(internalCost.totalInternal * (1 + marginPct / 100));
  } else {
    // Cost-plus pricing
    publicPrice = strategicRound(internalCost.totalInternal * (1 + marginPct / 100));
  }

  const publicPriceLow = publicPrice;
  const publicPriceHigh = publicPrice + RANGE_SPREAD;

  // Included tons
  const includedTons = materialRule.pricing_mode === 'included_tons'
    ? (materialRule.included_tons_json[String(input.sizeYd)] || 0)
    : 0;

  // Add material warnings
  if (materialRule.public_warning) warnings.push(materialRule.public_warning);
  if (greenHalo) warnings.push(`Green Halo compliance applied at $${GREEN_HALO_RATE}/ton.`);

  return {
    yard,
    dumpSite,
    materialRule,
    internalCost,
    publicPriceLow,
    publicPriceHigh,
    includedTons,
    overweightFeePerTon: materialRule.overweight_fee_per_ton,
    isFlatFee: materialRule.pricing_mode === 'flat_rate',
    isManualReview,
    marginPct,
    warnings,
    greenHaloApplied: greenHalo,
    contaminationRisk: materialRule.requires_clean_load,
    outsideServiceRadius: outsideRadius,
  };
}

// =====================================================
// CONVENIENCE: ZIP-based (geocode to lat/lng first)
// =====================================================

export async function calculateSmartQuoteFromZip(
  zip: string,
  materialClass: string,
  sizeYd: number,
  options?: {
    greenHaloRequired?: boolean;
    isContractor?: boolean;
    contractorDiscountPct?: number;
    lat?: number;
    lng?: number;
  },
): Promise<SmartQuote | null> {
  let lat = options?.lat;
  let lng = options?.lng;

  // If no lat/lng, resolve from zone_zip_codes or yard proximity
  if (!lat || !lng) {
    const { data } = await supabase
      .from('zone_zip_codes')
      .select('zip_code, city_name')
      .eq('zip_code', zip)
      .maybeSingle();

    // Fallback: use Oakland yard coords as approximate
    if (!data) {
      lat = 37.78;
      lng = -122.23;
    } else {
      // Use a rough geocode based on city
      const cityCoords: Record<string, [number, number]> = {
        'oakland': [37.80, -122.27],
        'berkeley': [37.87, -122.27],
        'san francisco': [37.77, -122.42],
        'san jose': [37.34, -121.89],
        'fremont': [37.55, -121.99],
        'hayward': [37.67, -122.08],
        'richmond': [37.94, -122.35],
        'san leandro': [37.73, -122.16],
        'palo alto': [37.44, -122.14],
        'mountain view': [37.39, -122.08],
        'sunnyvale': [37.37, -122.04],
        'santa clara': [37.35, -121.95],
        'milpitas': [37.43, -121.90],
        'daly city': [37.69, -122.47],
        'south san francisco': [37.65, -122.41],
        'san mateo': [37.56, -122.31],
        'redwood city': [37.49, -122.24],
      };
      const cityKey = (data.city_name || '').toLowerCase();
      const coords = cityCoords[cityKey] || [37.78, -122.23];
      lat = coords[0];
      lng = coords[1];
    }
  }

  return calculateSmartQuote({
    lat,
    lng,
    zip,
    materialClass,
    sizeYd,
    greenHaloRequired: options?.greenHaloRequired,
    isContractor: options?.isContractor,
    contractorDiscountPct: options?.contractorDiscountPct,
  });
}
