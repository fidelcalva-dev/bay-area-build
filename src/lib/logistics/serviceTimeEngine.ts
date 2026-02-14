// ============================================================
// SERVICE TIME ENGINE — Calsan Operational Standards
// Shared logistics time calculator for Internal Calculator,
// Dispatch, Driver App, and V3 Quote Flow
// ============================================================

// ── Calsan Time Standards (minutes) ──────────────────────────
export const CALSAN_STANDARDS = {
  LOAD_ON_TRUCK: 10,
  DROPOFF_MIN: 10,
  DROPOFF_MAX: 20,
  PICKUP_ONLY: 15,
  SWAP_PICKUP: 30,
  DUMP_PROCESS_MIN: 15,
  DUMP_PROCESS_MAX: 25,
} as const;

export type LogisticsServiceType = 'DELIVERY' | 'PICKUP' | 'SWAP';

export interface RouteMinutes {
  yardToSiteMin: number;
  yardToSiteMax: number;
  siteToFacilityMin: number;
  siteToFacilityMax: number;
  facilityToYardMin: number;
  facilityToYardMax: number;
}

export interface TimeSegment {
  label: string;
  min: number;
  max: number;
}

export interface CycleEstimate {
  min: number;
  max: number;
  breakdown: TimeSegment[];
}

export interface ServiceTimeResult {
  delivery: CycleEstimate;
  pickup: CycleEstimate;
  swap: CycleEstimate;
  totals: { min: number; max: number };
  assumptions: typeof CALSAN_STANDARDS;
  requestedType: LogisticsServiceType;
  /** The cycle that matches the requested service type */
  primary: CycleEstimate;
}

/**
 * Build default route minutes from a single drive estimate
 * with ±15% traffic variance applied.
 */
export function buildRouteMinutes(params: {
  yardToSiteMinutes?: number;
  siteToFacilityMinutes?: number;
  facilityToYardMinutes?: number;
}): RouteMinutes {
  const yts = params.yardToSiteMinutes ?? 20;
  const stf = params.siteToFacilityMinutes ?? Math.round(yts * 0.8);
  const fty = params.facilityToYardMinutes ?? Math.round(yts * 1.1);

  return {
    yardToSiteMin: Math.round(yts * 0.85),
    yardToSiteMax: Math.round(yts * 1.15),
    siteToFacilityMin: Math.round(stf * 0.85),
    siteToFacilityMax: Math.round(stf * 1.15),
    facilityToYardMin: Math.round(fty * 0.85),
    facilityToYardMax: Math.round(fty * 1.15),
  };
}

/**
 * Compute full service time estimates for all three service types.
 */
export function calculateServiceTime(
  serviceType: LogisticsServiceType,
  route: RouteMinutes,
): ServiceTimeResult {
  const C = CALSAN_STANDARDS;

  // ── Delivery Cycle ──────────────────────────────────────
  const delivery: CycleEstimate = {
    min: C.LOAD_ON_TRUCK + route.yardToSiteMin + C.DROPOFF_MIN,
    max: C.LOAD_ON_TRUCK + route.yardToSiteMax + C.DROPOFF_MAX,
    breakdown: [
      { label: 'Load on truck', min: C.LOAD_ON_TRUCK, max: C.LOAD_ON_TRUCK },
      { label: 'Drive to site', min: route.yardToSiteMin, max: route.yardToSiteMax },
      { label: 'Drop-off', min: C.DROPOFF_MIN, max: C.DROPOFF_MAX },
    ],
  };

  // ── Pickup Cycle ────────────────────────────────────────
  const pickup: CycleEstimate = {
    min: C.PICKUP_ONLY + route.siteToFacilityMin + C.DUMP_PROCESS_MIN + route.facilityToYardMin,
    max: C.PICKUP_ONLY + route.siteToFacilityMax + C.DUMP_PROCESS_MAX + route.facilityToYardMax,
    breakdown: [
      { label: 'Pickup secure', min: C.PICKUP_ONLY, max: C.PICKUP_ONLY },
      { label: 'Drive to facility', min: route.siteToFacilityMin, max: route.siteToFacilityMax },
      { label: 'Dump processing', min: C.DUMP_PROCESS_MIN, max: C.DUMP_PROCESS_MAX },
      { label: 'Return to yard', min: route.facilityToYardMin, max: route.facilityToYardMax },
    ],
  };

  // ── Swap Cycle ──────────────────────────────────────────
  // Swap = pickup full container + drop off replacement
  // Route: yard→site (drop empty + pick full) → facility → yard
  const swap: CycleEstimate = {
    min:
      C.LOAD_ON_TRUCK +
      route.yardToSiteMin +
      C.SWAP_PICKUP +
      C.DROPOFF_MIN +
      route.siteToFacilityMin +
      C.DUMP_PROCESS_MIN +
      route.facilityToYardMin,
    max:
      C.LOAD_ON_TRUCK +
      route.yardToSiteMax +
      C.SWAP_PICKUP +
      C.DROPOFF_MAX +
      route.siteToFacilityMax +
      C.DUMP_PROCESS_MAX +
      route.facilityToYardMax,
    breakdown: [
      { label: 'Load replacement', min: C.LOAD_ON_TRUCK, max: C.LOAD_ON_TRUCK },
      { label: 'Drive to site', min: route.yardToSiteMin, max: route.yardToSiteMax },
      { label: 'Swap (pick + drop)', min: C.SWAP_PICKUP + C.DROPOFF_MIN, max: C.SWAP_PICKUP + C.DROPOFF_MAX },
      { label: 'Drive to facility', min: route.siteToFacilityMin, max: route.siteToFacilityMax },
      { label: 'Dump processing', min: C.DUMP_PROCESS_MIN, max: C.DUMP_PROCESS_MAX },
      { label: 'Return to yard', min: route.facilityToYardMin, max: route.facilityToYardMax },
    ],
  };

  const primary = serviceType === 'DELIVERY' ? delivery : serviceType === 'PICKUP' ? pickup : swap;

  return {
    delivery,
    pickup,
    swap,
    totals: { min: primary.min, max: primary.max },
    assumptions: C,
    requestedType: serviceType,
    primary,
  };
}

/**
 * Convert a CycleEstimate into the legacy ServiceTimeEstimate shape
 * used by ServiceTimeBreakdown.tsx and V3 quote flow.
 */
export function toLegacyEstimate(result: ServiceTimeResult): {
  yardLoadMin: number;
  driveToSiteMin: number;
  driveToSiteMax: number;
  dropoffMin: number;
  pickupMin: number;
  pickupMax: number;
  driveToFacilityMin: number;
  driveToFacilityMax: number;
  dumpTimeMin: number;
  dumpTimeMax: number;
  returnToYardMin: number;
  returnToYardMax: number;
  totalMin: number;
  totalMax: number;
  isSwap: boolean;
  swapExtraMin?: number;
  swapExtraMax?: number;
} {
  const C = CALSAN_STANDARDS;
  const d = result.delivery;
  const p = result.pickup;
  const isSwap = result.requestedType === 'SWAP';

  // Extract route segments from breakdown
  const driveToSite = d.breakdown.find(s => s.label === 'Drive to site');
  const driveToFacility = p.breakdown.find(s => s.label === 'Drive to facility');
  const returnToYard = p.breakdown.find(s => s.label === 'Return to yard');

  const totalMin = result.totals.min;
  const totalMax = result.totals.max;

  return {
    yardLoadMin: C.LOAD_ON_TRUCK,
    driveToSiteMin: driveToSite?.min ?? 0,
    driveToSiteMax: driveToSite?.max ?? 0,
    dropoffMin: C.DROPOFF_MIN,
    pickupMin: isSwap ? C.SWAP_PICKUP : C.PICKUP_ONLY,
    pickupMax: isSwap ? C.SWAP_PICKUP : C.PICKUP_ONLY,
    driveToFacilityMin: driveToFacility?.min ?? 0,
    driveToFacilityMax: driveToFacility?.max ?? 0,
    dumpTimeMin: C.DUMP_PROCESS_MIN,
    dumpTimeMax: C.DUMP_PROCESS_MAX,
    returnToYardMin: returnToYard?.min ?? 0,
    returnToYardMax: returnToYard?.max ?? 0,
    totalMin,
    totalMax,
    isSwap,
    swapExtraMin: isSwap ? C.SWAP_PICKUP - C.PICKUP_ONLY + C.DROPOFF_MIN : undefined,
    swapExtraMax: isSwap ? C.SWAP_PICKUP - C.PICKUP_ONLY + C.DROPOFF_MAX : undefined,
  };
}

/**
 * Format a time range for display.
 */
export function formatTimeRange(min: number, max: number): string {
  if (min === max) {
    return min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${min % 60}m`;
  }
  return `${min}–${max} min`;
}
