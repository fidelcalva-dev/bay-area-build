// Access Constraint Detection Engine
// Automatically detects access limitations from address, city, ZIP, and user input

import type { AccessFlag } from './buffersConfig';

// ── SF steep/hillside ZIP codes ───────────────────────────────
const SF_HILL_ZIPS = new Set([
  '94109', // Russian Hill / Nob Hill
  '94108', // Nob Hill
  '94133', // Telegraph Hill / North Beach
  '94123', // Marina / Cow Hollow (hills nearby)
  '94114', // Castro / Twin Peaks
  '94131', // Twin Peaks / Glen Park
  '94127', // St. Francis Wood / Mount Davidson
  '94117', // Haight / Buena Vista
  '94115', // Pacific Heights
  '94118', // Inner Richmond (hilly edges)
  '94121', // Outer Richmond (hilly edges)
  '94112', // Excelsior / Crocker-Amazon
]);

// Oakland hills ZIPs
const OAKLAND_HILL_ZIPS = new Set([
  '94611', // Montclair / Piedmont Ave hills
  '94618', // Rockridge / upper Claremont
  '94602', // Glenview / Dimond (hilly parts)
  '94619', // Redwood Heights
]);

// Berkeley hills ZIPs
const BERKELEY_HILL_ZIPS = new Set([
  '94708', // North Berkeley hills
  '94707', // Kensington / Tilden area
]);

// All hill ZIPs combined
const ALL_HILL_ZIPS = new Set([
  ...SF_HILL_ZIPS,
  ...OAKLAND_HILL_ZIPS,
  ...BERKELEY_HILL_ZIPS,
]);

// SF city ZIPs (for street_placement default)
const SF_CITY_ZIPS = new Set([
  '94102', '94103', '94104', '94105', '94107', '94108', '94109',
  '94110', '94111', '94112', '94114', '94115', '94116', '94117',
  '94118', '94121', '94122', '94123', '94124', '94127', '94129',
  '94130', '94131', '94132', '94133', '94134', '94158',
]);

// ── Detection input ───────────────────────────────────────────

export interface AccessDetectionInput {
  zip?: string;
  city?: string;
  /** User-selected placement type */
  placementType?: 'driveway' | 'street' | 'jobsite';
  /** User indicated tight access */
  isTightAccess?: boolean;
  /** User provided gate code → gated flag */
  hasGateCode?: boolean;
  /** Address type if known */
  addressType?: 'residential' | 'commercial';
}

export interface AccessDetectionResult {
  flags: AccessFlag[];
  flagsMap: Record<string, boolean>;
  warnings: string[];
  customerNote: string;
}

// ── Main detection ────────────────────────────────────────────

export function detectAccessConstraints(input: AccessDetectionInput): AccessDetectionResult {
  const flags: Set<AccessFlag> = new Set();
  const warnings: string[] = [];

  const zip = input.zip?.trim() || '';
  const cityLower = (input.city || '').toLowerCase();

  // 1. Hills detection — ZIP-based
  if (ALL_HILL_ZIPS.has(zip)) {
    flags.add('hills');
    warnings.push('Hillside area detected — steep grade may affect placement and timing.');
  }

  // 2. Street placement — user choice or SF default
  if (input.placementType === 'street') {
    flags.add('street_placement');
    warnings.push('Street placement selected — permit may be required.');
  } else if (!input.placementType && SF_CITY_ZIPS.has(zip)) {
    // In SF, default to street placement expectation
    flags.add('street_placement');
    warnings.push('San Francisco address — street placement is common. Confirm placement type.');
  }

  // 3. Tight access — user-confirmed or narrow street signals
  if (input.isTightAccess) {
    flags.add('tight_access');
    warnings.push('Tight access confirmed — allow extra time for placement.');
  }

  // 4. Gated property
  if (input.hasGateCode) {
    flags.add('gated');
    warnings.push('Gated access — driver will need gate code.');
  }

  // 5. Limited access heuristic — residential + hills + SF
  if (
    flags.has('hills') &&
    flags.has('street_placement') &&
    input.addressType === 'residential'
  ) {
    flags.add('limited_access');
    warnings.push('Limited access area — advance coordination recommended.');
  }

  const flagsArray = Array.from(flags);
  const flagsMap: Record<string, boolean> = {
    tight_access: flags.has('tight_access'),
    hills: flags.has('hills'),
    street_placement: flags.has('street_placement'),
    gated: flags.has('gated'),
    limited_access: flags.has('limited_access'),
  };

  const customerNote = flagsArray.length > 0
    ? 'Access conditions may affect delivery timing and placement. Our dispatch team will coordinate accordingly.'
    : '';

  return { flags: flagsArray, flagsMap, warnings, customerNote };
}

// ── Check if ZIP is in SF ─────────────────────────────────────
export function isSfZip(zip: string): boolean {
  return SF_CITY_ZIPS.has(zip.trim());
}

export function isHillZip(zip: string): boolean {
  return ALL_HILL_ZIPS.has(zip.trim());
}
