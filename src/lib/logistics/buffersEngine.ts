// Logistics Buffers Engine — Core Calculation
// Produces conservative min/max time windows per service leg

import {
  DRIVE_MULTIPLIERS,
  HANDLING_BUFFERS,
  QUEUE_BUFFERS,
  resolveMarketKey,
  sumAccessBuffers,
  type AccessFlag,
  type BufferedServiceType,
  type FacilityQueueLevel,
} from './buffersConfig';

// ── Input / Output types ──────────────────────────────────────

export interface BuffersInput {
  yard_to_site_drive_minutes: number;
  site_to_facility_drive_minutes?: number;
  facility_to_yard_drive_minutes?: number;
  city?: string;
  service_type: BufferedServiceType;
  access_flags?: AccessFlag[];
  facility_queue_level?: FacilityQueueLevel;
}

export interface DriveWindow { min: number; max: number }

export interface BuffersStaffBreakdown {
  yard_prep: number;
  drive_to_site: DriveWindow;
  dropoff: DriveWindow;
  pickup: DriveWindow;
  drive_to_facility: DriveWindow;
  dump: DriveWindow;
  drive_return: DriveWindow;
  swap_extra: DriveWindow;
}

export interface BuffersResult {
  service_type: BufferedServiceType;
  total_min: number;
  total_max: number;
  customer_summary: string;
  staff_breakdown: BuffersStaffBreakdown;
}

// ── Drive window calc ─────────────────────────────────────────

function driveWindow(baseMinutes: number, multiplier: number): DriveWindow {
  if (baseMinutes <= 0) return { min: 0, max: 0 };
  const adjusted = baseMinutes * multiplier;
  return {
    min: Math.round(adjusted * 0.9),
    max: Math.round(adjusted * 1.15),
  };
}

// ── Main engine ───────────────────────────────────────────────

export function calculateBufferedWindow(input: BuffersInput): BuffersResult {
  const H = HANDLING_BUFFERS;
  const marketKey = resolveMarketKey(input.city);
  const multiplier = DRIVE_MULTIPLIERS[marketKey];
  const queueLevel = input.facility_queue_level ?? 'MED';
  const queueAdd = QUEUE_BUFFERS[queueLevel];
  const access = sumAccessBuffers(input.access_flags ?? []);

  // Drive windows
  const driveToSite = driveWindow(input.yard_to_site_drive_minutes, multiplier);
  const driveToFacility = driveWindow(input.site_to_facility_drive_minutes ?? 0, multiplier);
  const driveReturn = driveWindow(input.facility_to_yard_drive_minutes ?? 0, multiplier);

  // Handling windows
  const dropoff: DriveWindow = {
    min: H.dropoff_min + access.min,
    max: H.dropoff_max + access.max,
  };

  const pickup: DriveWindow = {
    min: H.pickup_min + access.min,
    max: H.pickup_min + access.max,
  };

  const dump: DriveWindow = {
    min: H.dump_min + queueAdd,
    max: H.dump_max + queueAdd,
  };

  const swapExtra: DriveWindow = {
    min: H.swap_pickup_min + access.min + H.dropoff_min + access.min,
    max: H.swap_pickup_min + access.max + H.dropoff_max + access.max,
  };

  const yardPrep = H.yard_prep;

  // Total by service type
  let totalMin = 0;
  let totalMax = 0;
  let customerLabel = '';

  switch (input.service_type) {
    case 'DELIVERY':
      totalMin = yardPrep + driveToSite.min + dropoff.min;
      totalMax = yardPrep + driveToSite.max + dropoff.max;
      customerLabel = `Estimated delivery window: ${totalMin}-${totalMax} minutes (operational window)`;
      break;

    case 'PICKUP':
      totalMin = pickup.min + driveToFacility.min + dump.min + driveReturn.min;
      totalMax = pickup.max + driveToFacility.max + dump.max + driveReturn.max;
      customerLabel = `Estimated pickup cycle: ${totalMin}-${totalMax} minutes (operational window)`;
      break;

    case 'SWAP':
      totalMin = yardPrep + driveToSite.min + swapExtra.min + driveToFacility.min + dump.min + driveReturn.min;
      totalMax = yardPrep + driveToSite.max + swapExtra.max + driveToFacility.max + dump.max + driveReturn.max;
      customerLabel = `Estimated swap cycle: ${totalMin}-${totalMax} minutes (operational window)`;
      break;

    case 'LIVE_LOAD':
      totalMin = yardPrep + driveToSite.min + dropoff.min;
      totalMax = yardPrep + driveToSite.max + dropoff.max;
      customerLabel = `Estimated arrival window: ${totalMin}-${totalMax} minutes. On-site time billed separately.`;
      break;

    case 'DUMP_RETURN':
      totalMin = yardPrep + driveToSite.min + pickup.min + driveToFacility.min + dump.min + driveToSite.min + dropoff.min;
      totalMax = yardPrep + driveToSite.max + pickup.max + driveToFacility.max + dump.max + driveToSite.max + dropoff.max;
      customerLabel = `Estimated dump & return cycle: ${totalMin}-${totalMax} minutes (operational window)`;
      break;
  }

  const customerSummary = [
    customerLabel,
    input.service_type === 'PICKUP' ? 'Pickup scheduled on request.' : '',
    'Timing depends on traffic and site access.',
  ].filter(Boolean).join('\n');

  return {
    service_type: input.service_type,
    total_min: totalMin,
    total_max: totalMax,
    customer_summary: customerSummary,
    staff_breakdown: {
      yard_prep: yardPrep,
      drive_to_site: driveToSite,
      dropoff,
      pickup,
      drive_to_facility: driveToFacility,
      dump,
      drive_return: driveReturn,
      swap_extra: swapExtra,
    },
  };
}
