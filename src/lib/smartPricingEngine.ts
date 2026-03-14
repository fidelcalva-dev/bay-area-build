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

export interface ExtraItemSummary {
  code: string;
  label: string;
  category: string;
  amount: number;
  pricing_mode: string;
  status: string;
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
  
  // Zone surcharge
  zoneSurcharge?: ZoneSurcharge | null;
  zoneSurchargeAmount: number;
  
  // Rush delivery
  rushState: string;
  rushFee: number;
  rushConfig?: RushConfig | null;
  
  // Contractor
  contractorTier?: string;
  contractorRule?: ContractorRule | null;
  contractorDiscount: number;
  lowMarginWarning: boolean;
  
  // Extras & exceptions
  extras: ExtraItemSummary[];
  extrasTotal: number;
  
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
  contractorTier?: string;
  isSameDay?: boolean;
    rushState?: 'STANDARD' | 'NEXT_DAY' | 'PRIORITY_NEXT_DAY' | 'SAME_DAY' | 'PRIORITY' | 'AFTER_HOURS';
}

// =====================================================
// ZONE SURCHARGE ENGINE
// =====================================================

export interface ZoneSurcharge {
  zone_name: string;
  quote_surcharge: number;
  dispatch_cost_adjustment: number;
  remote_area_flag: boolean;
}

async function getZoneSurcharge(yardId: string, distanceMiles: number): Promise<ZoneSurcharge | null> {
  const { data } = await supabase
    .from('zone_surcharges')
    .select('*')
    .eq('yard_id', yardId)
    .eq('is_active', true)
    .order('miles_from_yard_min');

  if (!data?.length) return null;

  for (const zone of data) {
    const min = Number(zone.miles_from_yard_min);
    const max = zone.miles_from_yard_max ? Number(zone.miles_from_yard_max) : Infinity;
    if (distanceMiles >= min && distanceMiles < max) {
      return {
        zone_name: zone.zone_name,
        quote_surcharge: Number(zone.quote_surcharge),
        dispatch_cost_adjustment: Number(zone.dispatch_cost_adjustment),
        remote_area_flag: zone.remote_area_flag,
      };
    }
  }
  // Beyond all zones — return last (remote)
  const last = data[data.length - 1];
  return {
    zone_name: last.zone_name,
    quote_surcharge: Number(last.quote_surcharge),
    dispatch_cost_adjustment: Number(last.dispatch_cost_adjustment),
    remote_area_flag: last.remote_area_flag,
  };
}

// =====================================================
// RUSH DELIVERY ENGINE
// =====================================================

export interface RushConfig {
  allow_same_day: boolean;
  same_day_cutoff_hour: number;
  next_day_cutoff_hour: number;
  daily_capacity: number;
  rush_fee_same_day: number;
  rush_fee_same_day_small_medium: number;
  rush_fee_same_day_large: number;
  rush_fee_next_day: number;
  rush_fee_priority: number;
  rush_fee_priority_next_day: number;
  rush_fee_after_hours: number;
}

async function getRushConfig(yardId: string): Promise<RushConfig | null> {
  const { data } = await supabase
    .from('rush_delivery_config')
    .select('*')
    .eq('yard_id', yardId)
    .eq('is_active', true)
    .maybeSingle();

  if (!data) return null;
  return {
    allow_same_day: data.allow_same_day,
    same_day_cutoff_hour: data.same_day_cutoff_hour,
    next_day_cutoff_hour: data.next_day_cutoff_hour,
    daily_capacity: data.daily_capacity,
    rush_fee_same_day: Number(data.rush_fee_same_day),
    rush_fee_same_day_small_medium: Number((data as any).rush_fee_same_day_small_medium ?? 95),
    rush_fee_same_day_large: Number((data as any).rush_fee_same_day_large ?? 145),
    rush_fee_next_day: Number(data.rush_fee_next_day),
    rush_fee_priority: Number(data.rush_fee_priority),
    rush_fee_priority_next_day: Number((data as any).rush_fee_priority_next_day ?? 45),
    rush_fee_after_hours: Number(data.rush_fee_after_hours),
  };
}

function calculateRushFee(rushState: string | undefined, config: RushConfig | null, sizeYd?: number): number {
  if (!rushState || rushState === 'STANDARD' || !config) return 0;
  const isLarge = (sizeYd ?? 20) >= 30;
  switch (rushState) {
    case 'SAME_DAY': return isLarge ? config.rush_fee_same_day_large : config.rush_fee_same_day_small_medium;
    case 'NEXT_DAY': return config.rush_fee_next_day;
    case 'PRIORITY_NEXT_DAY': return config.rush_fee_priority_next_day;
    case 'PRIORITY': return config.rush_fee_priority;
    case 'AFTER_HOURS': return config.rush_fee_after_hours;
    default: return 0;
  }
}

// =====================================================
// CONTRACTOR PRICING ENGINE
// =====================================================

export interface ContractorRule {
  tier_name: string;
  discount_percent: number;
  base_override: number | null;
  included_tons_override: number | null;
  zone_surcharge_behavior: string;
  rush_fee_behavior: string;
  minimum_margin_pct: number;
}

async function getContractorRule(
  tier: string,
  sizeYd?: number,
  materialClass?: string,
): Promise<ContractorRule | null> {
  // Try specific size+material match first, then size only, then tier default
  let query = supabase
    .from('contractor_pricing_rules')
    .select('*')
    .eq('tier_name', tier as any)
    .eq('is_active', true);

  const { data } = await query;
  if (!data?.length) return null;

  // Find best match: specific > general
  const specific = data.find(r => r.size_yd === sizeYd && r.material_class === materialClass);
  const sizeMatch = data.find(r => r.size_yd === sizeYd && !r.material_class);
  const general = data.find(r => !r.size_yd && !r.material_class);
  const best = specific || sizeMatch || general || data[0];

  return {
    tier_name: best.tier_name,
    discount_percent: Number(best.discount_percent),
    base_override: best.base_override ? Number(best.base_override) : null,
    included_tons_override: best.included_tons_override ? Number(best.included_tons_override) : null,
    zone_surcharge_behavior: best.zone_surcharge_behavior,
    rush_fee_behavior: best.rush_fee_behavior,
    minimum_margin_pct: Number(best.minimum_margin_pct),
  };
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
// PRICING RULES ENGINE
// =====================================================

interface PricingRule {
  base_delivery_cost: number;
  base_pickup_cost: number;
  per_mile_cost: number;
  per_mile_threshold: number;
  overweight_cost_per_ton: number;
  minimum_margin_percent: number;
  surge_threshold_pct: number;
  surge_multiplier: number;
  same_day_premium: number;
}

const DEFAULT_RULES: PricingRule = {
  base_delivery_cost: 85,
  base_pickup_cost: 65,
  per_mile_cost: 2,
  per_mile_threshold: 15,
  overweight_cost_per_ton: 165,
  minimum_margin_percent: 15,
  surge_threshold_pct: 85,
  surge_multiplier: 1.08,
  same_day_premium: 100,
};

async function fetchPricingRules(): Promise<PricingRule> {
  const { data } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('is_active', true)
    .order('created_at')
    .limit(1)
    .maybeSingle();

  if (!data) return DEFAULT_RULES;
  return {
    base_delivery_cost: Number(data.base_delivery_cost),
    base_pickup_cost: Number(data.base_pickup_cost),
    per_mile_cost: Number(data.per_mile_cost),
    per_mile_threshold: Number(data.per_mile_threshold),
    overweight_cost_per_ton: Number(data.overweight_cost_per_ton),
    minimum_margin_percent: Number(data.minimum_margin_percent),
    surge_threshold_pct: Number(data.surge_threshold_pct),
    surge_multiplier: Number(data.surge_multiplier),
    same_day_premium: Number(data.same_day_premium),
  };
}

// =====================================================
// CAPACITY SURGE ENGINE
// =====================================================

async function getCapacityUtilization(yardId: string): Promise<number> {
  // Check how many assets are deployed vs total for this yard
  const { count: totalCount } = await supabase
    .from('assets_dumpsters')
    .select('id', { count: 'exact', head: true })
    .eq('home_yard_id', yardId);

  const { count: deployedCount } = await supabase
    .from('assets_dumpsters')
    .select('id', { count: 'exact', head: true })
    .eq('home_yard_id', yardId)
    .eq('asset_status', 'deployed');

  const total = totalCount || 1;
  const deployed = deployedCount || 0;
  return Math.round((deployed / total) * 100);
}

// =====================================================
// VENDOR FALLBACK ENGINE
// =====================================================

export interface VendorQuote {
  vendorName: string;
  vendorPrice: number;
  customerPrice: number;
  markupPct: number;
  reliabilityScore: number;
}

async function findVendorFallback(
  zip: string,
  sizeYd: number,
): Promise<VendorQuote | null> {
  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_active', true)
    .contains('size_support', [sizeYd]);

  if (!vendors?.length) return null;

  // Find vendors serving this ZIP
  const matching = vendors.filter(v => {
    const zips = v.coverage_zips || [];
    return zips.includes(zip) || zips.length === 0;
  });

  if (!matching.length) return null;

  // Pick best by reliability
  const best = matching.sort((a, b) => (b.reliability_score || 0) - (a.reliability_score || 0))[0];

  // Estimate vendor price from internal cost baseline (no vendor-specific price columns)
  // Use a conservative estimate based on market rates
  const vendorBasePrices: Record<number, number> = { 5: 300, 8: 350, 10: 400, 20: 550, 30: 650, 40: 800, 50: 950 };
  const vendorPrice = vendorBasePrices[sizeYd] || 500;
  const markupPct = 35;
  const customerPrice = strategicRound(vendorPrice * (1 + markupPct / 100));

  return {
    vendorName: best.name,
    vendorPrice,
    customerPrice,
    markupPct,
    reliabilityScore: Number(best.reliability_score) || 0,
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
    const flatRate = materialRule.flat_rate_json[String(sizeYd)];
    dumpFee = flatRate ? flatRate - delivery - pickup : dumpSite.dumpCostBasis * sizeYd * 0.3;
  } else {
    const includedTons = materialRule.included_tons_json[String(sizeYd)] || 0;
    dumpFee = includedTons * dumpSite.dumpCostBasis;
  }

  const fuel = yard.yard.base_fuel_cost + (yard.distanceMiles > 15 ? (yard.distanceMiles - 15) * 1.5 : 0);
  const labor = yard.yard.base_labor_cost;
  const routeAdjustment = dumpSite.distanceFromYardMiles > 10
    ? Math.round((dumpSite.distanceFromYardMiles - 10) * 2)
    : 0;
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

  // 5. Capacity-based surge pricing
  const pricingRules = await fetchPricingRules();
  let capacityUtilization = 0;
  let surgeMultiplier = 1.0;
  try {
    capacityUtilization = await getCapacityUtilization(yard.yard.id);
    if (capacityUtilization >= pricingRules.surge_threshold_pct) {
      surgeMultiplier = pricingRules.surge_multiplier;
      warnings.push(`High demand area — ${capacityUtilization}% capacity utilization.`);
    }
  } catch {
    // Non-critical, continue without surge
  }

  // 6. Zone surcharge
  const zoneSurcharge = await getZoneSurcharge(yard.yard.id, yard.distanceMiles);
  let zoneSurchargeAmount = zoneSurcharge?.quote_surcharge || 0;
  if (zoneSurcharge) {
    if (zoneSurcharge.remote_area_flag) {
      warnings.push(`Remote area (${zoneSurcharge.zone_name}) — additional surcharge of $${zoneSurchargeAmount}.`);
    } else if (zoneSurchargeAmount > 0) {
      warnings.push(`Zone: ${zoneSurcharge.zone_name} (+$${zoneSurchargeAmount}).`);
    }
  }

  // 7. Rush delivery
  const rushState = input.rushState || (input.isSameDay ? 'SAME_DAY' : 'STANDARD');
  const rushConfig = await getRushConfig(yard.yard.id);
  let rushFee = calculateRushFee(rushState, rushConfig, input.sizeYd);
  if (rushFee > 0) {
    warnings.push(`${rushState.replace(/_/g, ' ')} delivery: +$${rushFee}.`);
  }
  if (rushState === 'SAME_DAY' && rushConfig && !rushConfig.allow_same_day) {
    warnings.push('Same-day delivery not available at this yard.');
    rushFee = 0;
  }

  // 8. Contractor pricing
  let contractorRule: ContractorRule | null = null;
  let contractorDiscount = 0;
  const contractorTier = input.contractorTier;
  if (contractorTier && contractorTier !== 'RETAIL') {
    contractorRule = await getContractorRule(contractorTier, input.sizeYd, input.materialClass);
    if (contractorRule) {
      contractorDiscount = contractorRule.discount_percent;
      // Handle zone surcharge behavior
      if (contractorRule.zone_surcharge_behavior === 'waive') {
        zoneSurchargeAmount = 0;
        warnings.push(`Zone surcharge waived for ${contractorTier}.`);
      } else if (contractorRule.zone_surcharge_behavior === 'half') {
        zoneSurchargeAmount = Math.round(zoneSurchargeAmount / 2);
      }
      // Handle rush fee behavior
      if (contractorRule.rush_fee_behavior === 'waive') {
        rushFee = 0;
        warnings.push(`Rush fee waived for ${contractorTier}.`);
      } else if (contractorRule.rush_fee_behavior === 'half') {
        rushFee = Math.round(rushFee / 2);
      }
    }
  } else if (input.contractorDiscountPct) {
    contractorDiscount = input.contractorDiscountPct;
  }

  // 9. Calculate public price
  // Contractor discounts apply ONLY to general debris base, NOT to heavy flat rates,
  // surcharges, contamination, reroute, Green Halo, permits, or overage.
  let publicPrice: number;
  const isManualReview = materialRule.pricing_mode === 'manual_review';

  if (materialRule.pricing_mode === 'flat_rate') {
    // Heavy material flat rates — contractor discount does NOT apply unless base_override
    const baseFlat = contractorRule?.base_override 
      || materialRule.flat_rate_json[String(input.sizeYd)] 
      || strategicRound(internalCost.totalInternal * (1 + DEFAULT_MARGIN_PCT / 100));
    publicPrice = baseFlat + zoneSurchargeAmount + rushFee;
  } else {
    // General debris / included_tons — contractor discount applies to base only
    const rawBase = contractorRule?.base_override 
      || strategicRound((internalCost.totalInternal) * surgeMultiplier * (1 + DEFAULT_MARGIN_PCT / 100));
    const discountedBase = contractorDiscount > 0
      ? strategicRound(rawBase * (1 - contractorDiscount / 100))
      : rawBase;
    publicPrice = discountedBase + zoneSurchargeAmount + rushFee;
  }

  const publicPriceLow = publicPrice;
  const publicPriceHigh = publicPrice + RANGE_SPREAD;

  // Included tons
  const includedTons = materialRule.pricing_mode === 'included_tons'
    ? (contractorRule?.included_tons_override ?? materialRule.included_tons_json[String(input.sizeYd)] ?? 0)
    : 0;

  // Low margin warning — estimate effective margin
  const marginPct = publicPriceLow > 0 
    ? Math.round(((publicPriceLow - internalCost.totalInternal) / publicPriceLow) * 100) 
    : DEFAULT_MARGIN_PCT;
  const minMargin = contractorRule?.minimum_margin_pct ?? DEFAULT_MARGIN_PCT;
  const lowMarginWarning = marginPct < minMargin;
  if (lowMarginWarning) {
    warnings.push(`Low margin warning: ${marginPct}% < minimum ${minMargin}%. Manager approval recommended.`);
  }

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
    surgeMultiplier,
    capacityUtilization,
    zoneSurcharge,
    zoneSurchargeAmount,
    rushState,
    rushFee,
    rushConfig,
    contractorTier,
    contractorRule,
    contractorDiscount,
    lowMarginWarning,
    isVendorFallback: false,
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
    contractorTier?: string;
    lat?: number;
    lng?: number;
    isSameDay?: boolean;
    rushState?: 'STANDARD' | 'NEXT_DAY' | 'PRIORITY_NEXT_DAY' | 'SAME_DAY' | 'PRIORITY' | 'AFTER_HOURS';
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

  // Try smart engine first
  const smartResult = await calculateSmartQuote({
    lat,
    lng,
    zip,
    materialClass,
    sizeYd,
    greenHaloRequired: options?.greenHaloRequired,
    isContractor: options?.isContractor,
    contractorDiscountPct: options?.contractorDiscountPct,
    contractorTier: options?.contractorTier,
    isSameDay: options?.isSameDay,
    rushState: options?.rushState,
  });

  if (smartResult) return smartResult;

  // Vendor fallback: if no local coverage, try vendor marketplace
  const vendorQuote = await findVendorFallback(zip, sizeYd);
  if (vendorQuote) {
    // Build a synthetic SmartQuote from vendor data
    return {
      yard: null as any,
      dumpSite: null as any,
      materialRule: (await getMaterialRule(materialClass))!,
      internalCost: {
        delivery: 0, pickup: 0, dumpFee: 0, fuel: 0, labor: 0,
        overhead: 0, routeAdjustment: 0, greenHaloCost: 0,
        totalInternal: vendorQuote.vendorPrice,
      },
      publicPriceLow: vendorQuote.customerPrice,
      publicPriceHigh: vendorQuote.customerPrice + RANGE_SPREAD,
      includedTons: 0,
      overweightFeePerTon: 165,
      isFlatFee: false,
      isManualReview: true,
      marginPct: vendorQuote.markupPct,
      surgeMultiplier: 1,
      capacityUtilization: 0,
      zoneSurcharge: null,
      zoneSurchargeAmount: 0,
      rushState: 'STANDARD',
      rushFee: 0,
      rushConfig: null,
      contractorDiscount: 0,
      lowMarginWarning: false,
      isVendorFallback: true,
      vendorName: vendorQuote.vendorName,
      warnings: [`Vendor fulfillment via ${vendorQuote.vendorName}. Manual review required.`],
      greenHaloApplied: false,
      contaminationRisk: false,
      outsideServiceRadius: true,
    };
  }

  return null;
}
