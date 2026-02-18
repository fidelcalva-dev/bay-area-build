// Hook wrapper for the Logistics Buffers Engine

import { useMemo } from 'react';
import {
  calculateBufferedWindow,
  type BuffersInput,
  type BuffersResult,
} from '@/lib/logistics/buffersEngine';

/**
 * Compute buffered operational time windows.
 * Returns null when required drive minutes are missing.
 */
export function useLogisticsBuffers(input: BuffersInput | null): BuffersResult | null {
  return useMemo(() => {
    if (!input || input.yard_to_site_drive_minutes <= 0) return null;
    return calculateBufferedWindow(input);
  }, [
    input?.yard_to_site_drive_minutes,
    input?.site_to_facility_drive_minutes,
    input?.facility_to_yard_drive_minutes,
    input?.city,
    input?.service_type,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(input?.access_flags),
    input?.facility_queue_level,
  ]);
}
