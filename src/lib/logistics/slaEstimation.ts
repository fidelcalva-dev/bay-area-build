// Traffic-Aware SLA Estimation Engine
// Adjusts ETA windows based on traffic mode (LIVE/STATIC) and SLA tier

import { calculateBufferedWindow, type BuffersInput, type BuffersResult } from './buffersEngine';
import { resolveMarketKey, DRIVE_MULTIPLIERS } from './buffersConfig';
import type { AccessFlag, FacilityQueueLevel, BufferedServiceType } from './buffersConfig';

// ── Types ─────────────────────────────────────────────────────

export type SlaTier = 'HIGH' | 'STANDARD' | 'LOW';
export type TrafficMode = 'LIVE' | 'STATIC';
export type EtaConfidence = 'HIGH' | 'MED' | 'LOW';

export interface SlaEstimationInput {
  /** Base drive minutes from routing (yard → site) */
  yard_to_site_drive_minutes: number;
  /** If Google Routes returned duration_in_traffic, pass it here */
  yard_to_site_traffic_minutes?: number;
  site_to_facility_drive_minutes?: number;
  site_to_facility_traffic_minutes?: number;
  facility_to_yard_drive_minutes?: number;
  facility_to_yard_traffic_minutes?: number;

  city?: string;
  service_type: BufferedServiceType;
  access_flags?: AccessFlag[];
  facility_queue_level?: FacilityQueueLevel;

  /** Customer SLA tier for priority adjustments */
  sla_tier: SlaTier;
  /** Admin toggle: LIVE uses traffic data when available, STATIC uses multipliers */
  traffic_mode: TrafficMode;
}

export interface SlaEstimationResult {
  eta_min_minutes: number;
  eta_max_minutes: number;
  eta_confidence: EtaConfidence;
  sla_tier: SlaTier;
  traffic_source: 'LIVE' | 'STATIC';
  customer_summary: string;
  staff_breakdown: BuffersResult['staff_breakdown'];
  disclaimer: string;
}

// ── SLA priority adjustments ──────────────────────────────────
// HIGH tier gets tighter (more optimistic) windows
// LOW tier gets wider (more conservative) windows

const SLA_ADJUSTMENTS: Record<SlaTier, { minFactor: number; maxFactor: number; confidenceBoost: number }> = {
  HIGH: { minFactor: 0.90, maxFactor: 1.00, confidenceBoost: 1 },
  STANDARD: { minFactor: 1.00, maxFactor: 1.00, confidenceBoost: 0 },
  LOW: { minFactor: 1.00, maxFactor: 1.15, confidenceBoost: -1 },
};

// ── Confidence scoring ────────────────────────────────────────

function computeConfidence(
  hasTraffic: boolean,
  slaTier: SlaTier,
  accessFlags: AccessFlag[],
  queueLevel: FacilityQueueLevel,
): EtaConfidence {
  let score = 5; // base

  if (hasTraffic) score += 2;
  score += SLA_ADJUSTMENTS[slaTier].confidenceBoost;
  if (accessFlags.length > 2) score -= 1;
  if (queueLevel === 'HIGH') score -= 1;

  if (score >= 7) return 'HIGH';
  if (score >= 4) return 'MED';
  return 'LOW';
}

// ── Main engine ───────────────────────────────────────────────

export function estimateSla(input: SlaEstimationInput): SlaEstimationResult {
  const useLive = input.traffic_mode === 'LIVE';

  // Decide which drive minutes to use per segment
  const yardToSite = (useLive && input.yard_to_site_traffic_minutes)
    ? input.yard_to_site_traffic_minutes
    : input.yard_to_site_drive_minutes;

  const siteToFacility = (useLive && input.site_to_facility_traffic_minutes)
    ? input.site_to_facility_traffic_minutes
    : input.site_to_facility_drive_minutes;

  const facilityToYard = (useLive && input.facility_to_yard_traffic_minutes)
    ? input.facility_to_yard_traffic_minutes
    : input.facility_to_yard_drive_minutes;

  const trafficSource: 'LIVE' | 'STATIC' = (useLive && input.yard_to_site_traffic_minutes)
    ? 'LIVE'
    : 'STATIC';

  // When using live traffic, bypass city multiplier (set to 1.0)
  // by passing a special city value; otherwise use normal buffers engine
  const buffersInput: BuffersInput = {
    yard_to_site_drive_minutes: yardToSite,
    site_to_facility_drive_minutes: siteToFacility,
    facility_to_yard_drive_minutes: facilityToYard,
    city: trafficSource === 'LIVE' ? undefined : input.city, // no multiplier for live traffic
    service_type: input.service_type,
    access_flags: input.access_flags,
    facility_queue_level: input.facility_queue_level,
  };

  // For LIVE traffic, we still want 0.9–1.15 range but without city multiplier doubling
  // The buffersEngine default multiplier is 1.25, but live traffic already accounts for conditions
  // We override by using raw minutes with default multiplier = 1.0
  const buffered = calculateBufferedWindow(
    trafficSource === 'LIVE'
      ? { ...buffersInput, city: '__live_traffic__' } // resolves to 'default' = 1.25... 
      : buffersInput
  );

  // If live traffic, we need to correct for the default multiplier
  // Since live traffic data already includes real-world conditions,
  // we scale down from the buffered result
  let etaMin = buffered.total_min;
  let etaMax = buffered.total_max;

  if (trafficSource === 'LIVE') {
    // Live traffic already has real conditions baked in, reduce conservative buffer
    const liveCorrection = 1.0 / DRIVE_MULTIPLIERS.default;
    // Only correct the drive portions, not handling times
    const handlingMin = (buffered.staff_breakdown.yard_prep ?? 0)
      + buffered.staff_breakdown.dropoff.min
      + buffered.staff_breakdown.pickup.min
      + buffered.staff_breakdown.dump.min
      + buffered.staff_breakdown.swap_extra.min;
    const handlingMax = (buffered.staff_breakdown.yard_prep ?? 0)
      + buffered.staff_breakdown.dropoff.max
      + buffered.staff_breakdown.pickup.max
      + buffered.staff_breakdown.dump.max
      + buffered.staff_breakdown.swap_extra.max;

    const driveMin = etaMin - handlingMin;
    const driveMax = etaMax - handlingMax;

    etaMin = Math.round(handlingMin + driveMin * liveCorrection);
    etaMax = Math.round(handlingMax + driveMax * liveCorrection);
  }

  // Apply SLA tier adjustments
  const adj = SLA_ADJUSTMENTS[input.sla_tier];
  etaMin = Math.round(etaMin * adj.minFactor);
  etaMax = Math.round(etaMax * adj.maxFactor);

  // Confidence
  const confidence = computeConfidence(
    trafficSource === 'LIVE',
    input.sla_tier,
    input.access_flags ?? [],
    input.facility_queue_level ?? 'MED',
  );

  // Customer summary
  const serviceLabel = input.service_type === 'DELIVERY' ? 'delivery'
    : input.service_type === 'PICKUP' ? 'pickup'
    : input.service_type === 'SWAP' ? 'swap'
    : input.service_type === 'LIVE_LOAD' ? 'arrival'
    : 'service';

  const customerSummary = `Estimated ${serviceLabel} window: ${etaMin}-${etaMax} minutes`;
  const disclaimer = 'Timing depends on traffic conditions, site access, and disposal facility queues. This is an operational estimate, not a guaranteed arrival time.';

  return {
    eta_min_minutes: etaMin,
    eta_max_minutes: etaMax,
    eta_confidence: confidence,
    sla_tier: input.sla_tier,
    traffic_source: trafficSource,
    customer_summary: customerSummary,
    staff_breakdown: buffered.staff_breakdown,
    disclaimer,
  };
}
