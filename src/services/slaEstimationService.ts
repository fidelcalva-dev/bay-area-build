// Service layer for SLA estimation — DB read/write helpers

import { supabase } from '@/integrations/supabase/client';
import { estimateSla, type SlaEstimationInput, type SlaEstimationResult, type SlaTier, type TrafficMode } from '@/lib/logistics/slaEstimation';

// ── Fetch admin traffic mode toggle ───────────────────────────

export async function getTrafficMode(): Promise<TrafficMode> {
  const { data } = await supabase
    .from('config_settings')
    .select('value')
    .eq('key', 'logistics.traffic_mode')
    .single();

  if (data?.value) {
    const mode = typeof data.value === 'string'
      ? data.value.replace(/"/g, '')
      : String(data.value);
    if (mode === 'LIVE' || mode === 'STATIC') return mode;
  }
  return 'STATIC';
}

// ── Determine SLA tier from order context ─────────────────────

export function resolveSlaTier(params: {
  customerType?: string;
  paymentStatus?: string;
  isScheduled?: boolean;
}): SlaTier {
  const { customerType, paymentStatus, isScheduled } = params;

  // HIGH: contractors, paid in full, scheduled deliveries
  if (customerType === 'contractor' || customerType === 'commercial') return 'HIGH';
  if (paymentStatus === 'paid' || paymentStatus === 'captured') return 'HIGH';
  if (isScheduled) return 'HIGH';

  // LOW: pay-later pending verification
  if (paymentStatus === 'pending' || paymentStatus === 'pay_later') return 'LOW';

  return 'STANDARD';
}

// ── Persist ETA to orders table ───────────────────────────────

export async function updateOrderEta(
  orderId: string,
  result: SlaEstimationResult,
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({
      eta_min_minutes: result.eta_min_minutes,
      eta_max_minutes: result.eta_max_minutes,
      eta_confidence: result.eta_confidence,
      sla_tier: result.sla_tier,
      eta_updated_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq('id', orderId);

  if (error) {
    console.error('Failed to update order ETA:', error);
  }
}

// ── Full estimation flow ──────────────────────────────────────

export async function computeAndStoreEta(
  orderId: string,
  input: Omit<SlaEstimationInput, 'traffic_mode' | 'sla_tier'> & {
    customerType?: string;
    paymentStatus?: string;
    isScheduled?: boolean;
  },
): Promise<SlaEstimationResult> {
  const trafficMode = await getTrafficMode();
  const slaTier = resolveSlaTier({
    customerType: input.customerType,
    paymentStatus: input.paymentStatus,
    isScheduled: input.isScheduled,
  });

  const result = estimateSla({
    ...input,
    traffic_mode: trafficMode,
    sla_tier: slaTier,
  });

  await updateOrderEta(orderId, result);

  return result;
}
