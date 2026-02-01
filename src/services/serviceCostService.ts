// Service Cost Calculator Service

import { supabase } from '@/integrations/supabase/client';
import type {
  ServiceCostRequest,
  ServiceCostResponse,
  ServiceCostEstimate,
  ProfitGuardrailEvent,
  CostModel,
  VehicleType,
} from '@/types/serviceCost';

export async function calculateServiceCost(
  request: ServiceCostRequest
): Promise<ServiceCostResponse> {
  const { data, error } = await supabase.functions.invoke('calculate-service-cost', {
    body: request,
  });

  if (error) {
    console.error('Service cost calculation error:', error);
    throw new Error(error.message || 'Failed to calculate service cost');
  }

  return data as ServiceCostResponse;
}

export async function getServiceCostEstimate(
  entityType: 'QUOTE' | 'ORDER' | 'RUN',
  entityId: string
): Promise<ServiceCostEstimate | null> {
  const { data, error } = await supabase
    .from('service_cost_estimates')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch service cost estimate:', error);
    return null;
  }

  return data as unknown as ServiceCostEstimate | null;
}

export async function getProfitGuardrailEvents(
  entityType?: string,
  entityId?: string,
  unresolvedOnly = true
): Promise<ProfitGuardrailEvent[]> {
  let query = supabase
    .from('profit_guardrail_events')
    .select('*')
    .order('created_at', { ascending: false });

  if (entityType) {
    query = query.eq('entity_type', entityType);
  }
  if (entityId) {
    query = query.eq('entity_id', entityId);
  }
  if (unresolvedOnly) {
    query = query.is('resolved_at', null);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    console.error('Failed to fetch guardrail events:', error);
    return [];
  }

  return data as ProfitGuardrailEvent[];
}

export async function resolveGuardrailEvent(
  eventId: string,
  notes: string
): Promise<boolean> {
  const { error } = await supabase
    .from('profit_guardrail_events')
    .update({
      is_acknowledged: true,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', eventId);

  if (error) {
    console.error('Failed to resolve guardrail event:', error);
    return false;
  }

  return true;
}

// Get vehicle cost profiles for a market
export async function getVehicleCostProfiles(marketCode: string) {
  const { data, error } = await supabase
    .from('vehicle_cost_profiles')
    .select('*')
    .eq('market_code', marketCode)
    .eq('is_active', true);

  if (error) {
    console.error('Failed to fetch vehicle cost profiles:', error);
    return [];
  }

  return data;
}

// Get in-house rates for a market
export async function getInhouseCostRates(marketCode: string, vehicleType?: VehicleType) {
  let query = supabase
    .from('inhouse_cost_rates')
    .select('*')
    .eq('market_code', marketCode)
    .eq('is_active', true);

  if (vehicleType) {
    query = query.eq('vehicle_type', vehicleType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch in-house rates:', error);
    return [];
  }

  return data;
}

// Get owner-operator rates for a market
export async function getOwnerOperatorRates(marketCode: string, vehicleType?: VehicleType) {
  let query = supabase
    .from('owner_operator_rates')
    .select('*')
    .eq('market_code', marketCode)
    .eq('is_active', true);

  if (vehicleType) {
    query = query.eq('vehicle_type', vehicleType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch owner-operator rates:', error);
    return [];
  }

  return data;
}

// Get low margin jobs for profitability dashboard
export async function getLowMarginEstimates(
  thresholdPct = 30,
  limit = 50
): Promise<ServiceCostEstimate[]> {
  const { data, error } = await supabase
    .from('service_cost_estimates')
    .select('*')
    .lt('estimated_margin_pct', thresholdPct)
    .order('estimated_margin_pct', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch low margin estimates:', error);
    return [];
  }

  return data as unknown as ServiceCostEstimate[];
}

// Get margin summary by market
export async function getMarginSummaryByMarket(): Promise<
  { market_code: string; avg_margin_pct: number; count: number }[]
> {
  const { data, error } = await supabase
    .from('service_cost_estimates')
    .select('market_code, estimated_margin_pct');

  if (error) {
    console.error('Failed to fetch margin summary:', error);
    return [];
  }

  // Group and calculate averages
  const grouped: Record<string, { sum: number; count: number }> = {};
  (data || []).forEach((row) => {
    if (!grouped[row.market_code]) {
      grouped[row.market_code] = { sum: 0, count: 0 };
    }
    grouped[row.market_code].sum += row.estimated_margin_pct || 0;
    grouped[row.market_code].count += 1;
  });

  return Object.entries(grouped).map(([market_code, { sum, count }]) => ({
    market_code,
    avg_margin_pct: Math.round((sum / count) * 100) / 100,
    count,
  }));
}

// Get model distribution (how many runs in-house vs owner-op)
export async function getModelDistribution(): Promise<
  { cost_model: CostModel; count: number }[]
> {
  const { data, error } = await supabase
    .from('service_cost_estimates')
    .select('cost_model_used');

  if (error) {
    console.error('Failed to fetch model distribution:', error);
    return [];
  }

  const grouped: Record<CostModel, number> = { IN_HOUSE: 0, OWNER_OPERATOR: 0 };
  (data || []).forEach((row) => {
    const model = row.cost_model_used as CostModel;
    if (model && grouped[model] !== undefined) {
      grouped[model] += 1;
    }
  });

  return Object.entries(grouped).map(([cost_model, count]) => ({
    cost_model: cost_model as CostModel,
    count,
  }));
}

// Format margin as display string with color indicator
export function getMarginDisplay(marginPct: number): {
  text: string;
  color: string;
  bgColor: string;
} {
  if (marginPct >= 40) {
    return { text: `${marginPct.toFixed(1)}%`, color: 'text-green-700', bgColor: 'bg-green-100' };
  }
  if (marginPct >= 30) {
    return { text: `${marginPct.toFixed(1)}%`, color: 'text-blue-700', bgColor: 'bg-blue-100' };
  }
  if (marginPct >= 20) {
    return { text: `${marginPct.toFixed(1)}%`, color: 'text-amber-700', bgColor: 'bg-amber-100' };
  }
  return { text: `${marginPct.toFixed(1)}%`, color: 'text-red-700', bgColor: 'bg-red-100' };
}

// Format cost model for display
export function getCostModelDisplay(model: CostModel): {
  label: string;
  icon: string;
  color: string;
} {
  if (model === 'IN_HOUSE') {
    return { label: 'In-House', icon: '🏠', color: 'text-blue-600' };
  }
  return { label: 'Owner-Op', icon: '🚚', color: 'text-purple-600' };
}
