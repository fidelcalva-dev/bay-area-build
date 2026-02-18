// Logistics Buffers Engine — Configuration
// City/market drive multipliers, handling times, access & queue buffers

export type MarketKey = 'oakland' | 'berkeley' | 'alameda' | 'sf' | 'sj' | 'default';
export type AccessFlag = 'tight_access' | 'hills' | 'street_placement' | 'limited_access' | 'gated';
export type FacilityQueueLevel = 'LOW' | 'MED' | 'HIGH';
export type BufferedServiceType = 'DELIVERY' | 'PICKUP' | 'SWAP' | 'LIVE_LOAD' | 'DUMP_RETURN';

// ── Drive multipliers per market ──────────────────────────────
export const DRIVE_MULTIPLIERS: Record<MarketKey, number> = {
  oakland: 1.25,
  berkeley: 1.25,
  alameda: 1.20,
  sf: 1.35,
  sj: 1.20,
  default: 1.25,
};

// ── Base handling times (minutes) ─────────────────────────────
export const HANDLING_BUFFERS = {
  yard_prep: 10,
  dropoff_min: 10,
  dropoff_max: 20,
  pickup_min: 15,
  swap_pickup_min: 30,
  dump_min: 15,
  dump_max: 25,
} as const;

// ── Access constraint additions [min, max] ────────────────────
export const ACCESS_BUFFERS: Record<AccessFlag, [number, number]> = {
  tight_access: [10, 20],
  hills: [10, 10],
  street_placement: [10, 10],
  gated: [5, 10],
  limited_access: [15, 15],
};

// ── Facility queue additions (minutes) ────────────────────────
export const QUEUE_BUFFERS: Record<FacilityQueueLevel, number> = {
  LOW: 0,
  MED: 10,
  HIGH: 20,
};

// ── Helpers ───────────────────────────────────────────────────

/** Resolve a city string to a market key */
export function resolveMarketKey(city?: string): MarketKey {
  if (!city) return 'default';
  const c = city.toLowerCase().trim();
  if (c.includes('oakland')) return 'oakland';
  if (c.includes('berkeley')) return 'berkeley';
  if (c.includes('alameda')) return 'alameda';
  if (c.includes('san francisco') || c === 'sf') return 'sf';
  if (c.includes('san jose') || c === 'sj') return 'sj';
  return 'default';
}

/** Sum access flag buffers */
export function sumAccessBuffers(flags: AccessFlag[]): { min: number; max: number } {
  let min = 0;
  let max = 0;
  const unique = [...new Set(flags)];
  for (const f of unique) {
    const [lo, hi] = ACCESS_BUFFERS[f];
    min += lo;
    max += hi;
  }
  return { min, max };
}
