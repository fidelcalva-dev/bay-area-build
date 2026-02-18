// React hook for SLA estimation

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estimateSla, type SlaEstimationInput, type SlaEstimationResult, type TrafficMode } from '@/lib/logistics/slaEstimation';
import { getTrafficMode, resolveSlaTier } from '@/services/slaEstimationService';

/** Fetch the admin traffic mode toggle (cached 2 min) */
export function useTrafficMode() {
  return useQuery<TrafficMode>({
    queryKey: ['logistics-traffic-mode'],
    queryFn: getTrafficMode,
    staleTime: 2 * 60 * 1000,
  });
}

/** Compute SLA estimation reactively */
export function useSlaEstimation(
  input: Omit<SlaEstimationInput, 'traffic_mode' | 'sla_tier'> & {
    customerType?: string;
    paymentStatus?: string;
    isScheduled?: boolean;
  } | null,
): SlaEstimationResult | null {
  const { data: trafficMode } = useTrafficMode();

  return useMemo(() => {
    if (!input || !trafficMode || input.yard_to_site_drive_minutes <= 0) return null;

    const slaTier = resolveSlaTier({
      customerType: input.customerType,
      paymentStatus: input.paymentStatus,
      isScheduled: input.isScheduled,
    });

    return estimateSla({
      ...input,
      traffic_mode: trafficMode,
      sla_tier: slaTier,
    });
  }, [input, trafficMode]);
}
