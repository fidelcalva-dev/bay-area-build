// Google Ads Engine Service - Type-safe version using any-typed helper
import { supabase } from '@/integrations/supabase/client';

// Types
export interface AdsMarket {
  id: string;
  market_code: string;
  city: string;
  state: string;
  zip_list: string[];
  yard_id: string | null;
  priority: number;
  daily_budget: number;
  is_active: boolean;
  inventory_threshold: number;
  utilization_pause_threshold: number;
  utilization_premium_threshold: number;
}

export interface AdsCampaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  market_code: string | null;
  service_type: string;
  size_yd: number | null;
  status: string;
  daily_budget: number;
  messaging_tier: string;
  pause_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdsAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  is_resolved: boolean;
  created_at: string;
}

export interface AdsMetricsSummary {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversion_value: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

export interface AdsRule {
  id: string;
  rule_name: string;
  rule_type: string;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  priority: number;
  is_active: boolean;
  last_triggered_at: string | null;
  trigger_count: number;
}

export interface AdsSyncLog {
  id: string;
  sync_type: string;
  status: string;
  records_processed: number;
  duration_ms: number | null;
  created_at: string;
  error_message: string | null;
}

export const BASE_PRICES: Record<number, number> = {
  6: 390, 8: 440, 10: 499, 20: 599, 30: 749, 40: 899, 50: 1135
};

// Helper function to access ads tables without type recursion issues
// We use a helper that returns any, then cast the result to the proper type
async function queryAdsTable<T>(
  tableName: string, 
  queryFn: (client: any) => Promise<{ data: any; error: any }>
): Promise<T[]> {
  const client = supabase as any;
  const { data, error } = await queryFn(client.from(tableName));
  if (error) throw error;
  return (data || []) as T[];
}

async function mutateAdsTable(
  tableName: string,
  mutateFn: (client: any) => Promise<{ error: any }>
): Promise<void> {
  const client = supabase as any;
  const { error } = await mutateFn(client.from(tableName));
  if (error) throw error;
}

export async function getAdsMarkets(): Promise<AdsMarket[]> {
  return queryAdsTable<AdsMarket>('ads_markets', (table) => 
    table.select('*').order('priority')
  );
}

export async function getAdsCampaigns(marketCode?: string): Promise<AdsCampaign[]> {
  return queryAdsTable<AdsCampaign>('ads_campaigns', (table) => {
    let query = table.select('*').order('created_at', { ascending: false });
    if (marketCode) query = query.eq('market_code', marketCode);
    return query;
  });
}

export async function updateCampaignStatus(id: string, status: string, pauseReason?: string): Promise<void> {
  return mutateAdsTable('ads_campaigns', (table) =>
    table.update({ 
      status, 
      pause_reason: pauseReason || null, 
      updated_at: new Date().toISOString() 
    }).eq('id', id)
  );
}

export async function updateCampaignMessagingTier(id: string, tier: string): Promise<void> {
  return mutateAdsTable('ads_campaigns', (table) =>
    table.update({ 
      messaging_tier: tier, 
      updated_at: new Date().toISOString() 
    }).eq('id', id)
  );
}

export async function getTodayMetricsSummary(): Promise<AdsMetricsSummary> {
  const today = new Date().toISOString().split('T')[0];
  const metrics = await queryAdsTable<{ impressions: number; clicks: number; cost: number; conversions: number; conversion_value: number }>(
    'ads_metrics',
    (table) => table.select('impressions, clicks, cost, conversions, conversion_value').eq('date', today)
  );
  
  const totals = metrics.reduce((acc, m) => ({
    impressions: acc.impressions + (m.impressions || 0),
    clicks: acc.clicks + (m.clicks || 0),
    cost: acc.cost + (m.cost || 0),
    conversions: acc.conversions + (m.conversions || 0),
    conversion_value: acc.conversion_value + (m.conversion_value || 0)
  }), { impressions: 0, clicks: 0, cost: 0, conversions: 0, conversion_value: 0 });
  
  return {
    ...totals,
    ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    cpc: totals.clicks > 0 ? totals.cost / totals.clicks : 0,
    cpa: totals.conversions > 0 ? totals.cost / totals.conversions : 0,
    roas: totals.cost > 0 ? totals.conversion_value / totals.cost : 0
  };
}

export async function getCampaignMetrics(campaignId: string, startDate: string, endDate: string): Promise<AdsMetricsSummary> {
  const metrics = await queryAdsTable<{ impressions: number; clicks: number; cost: number; conversions: number; conversion_value: number }>(
    'ads_metrics',
    (table) => table.select('impressions, clicks, cost, conversions, conversion_value')
      .eq('campaign_id', campaignId)
      .gte('date', startDate)
      .lte('date', endDate)
  );
  
  const totals = metrics.reduce((acc, m) => ({
    impressions: acc.impressions + (m.impressions || 0),
    clicks: acc.clicks + (m.clicks || 0),
    cost: acc.cost + (m.cost || 0),
    conversions: acc.conversions + (m.conversions || 0),
    conversion_value: acc.conversion_value + (m.conversion_value || 0)
  }), { impressions: 0, clicks: 0, cost: 0, conversions: 0, conversion_value: 0 });
  
  return {
    ...totals,
    ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    cpc: totals.clicks > 0 ? totals.cost / totals.clicks : 0,
    cpa: totals.conversions > 0 ? totals.cost / totals.conversions : 0,
    roas: totals.cost > 0 ? totals.conversion_value / totals.cost : 0
  };
}

export async function getUnresolvedAlerts(): Promise<AdsAlert[]> {
  return queryAdsTable<AdsAlert>('ads_alerts', (table) =>
    table.select('*').eq('is_resolved', false).order('created_at', { ascending: false })
  );
}

export async function getSyncLogs(limit = 20): Promise<AdsSyncLog[]> {
  return queryAdsTable<AdsSyncLog>('ads_sync_log', (table) =>
    table.select('*').order('created_at', { ascending: false }).limit(limit)
  );
}

export async function getAdsRules(): Promise<AdsRule[]> {
  return queryAdsTable<AdsRule>('ads_rules', (table) =>
    table.select('*').order('priority')
  );
}

export async function toggleRule(ruleId: string, isActive: boolean): Promise<void> {
  return mutateAdsTable('ads_rules', (table) =>
    table.update({ is_active: isActive }).eq('id', ruleId)
  );
}

// Get ads mode from config
export async function getAdsMode(): Promise<'DRY_RUN' | 'LIVE'> {
  const { data } = await supabase
    .from('config_settings')
    .select('value')
    .eq('category', 'ads')
    .eq('key', 'mode')
    .maybeSingle();
  
  const mode = data?.value as string | undefined;
  return mode === 'LIVE' ? 'LIVE' : 'DRY_RUN';
}

// Set ads mode in config
export async function setAdsMode(mode: 'DRY_RUN' | 'LIVE'): Promise<void> {
  const { error } = await supabase
    .from('config_settings')
    .update({ value: JSON.stringify(mode), updated_at: new Date().toISOString() })
    .eq('category', 'ads')
    .eq('key', 'mode');
  
  if (error) throw error;
}

// Ad copy generation based on tier
export function generateAdCopy(
  city: string, 
  size: number, 
  tier: 'BASE' | 'CORE' | 'PREMIUM'
): { headlines: string[]; descriptions: string[] } {
  const price = BASE_PRICES[size] || 599;
  
  const tierMessages = {
    BASE: {
      urgency: '',
      value: 'Best Value',
    },
    CORE: {
      urgency: 'Book Now',
      value: 'Popular Choice',
    },
    PREMIUM: {
      urgency: 'Limited Availability',
      value: 'Premium Service',
    }
  };
  
  const msg = tierMessages[tier];
  
  return {
    headlines: [
      `${size} Yard Dumpster ${city}`,
      `From $${price} – ${msg.value}`,
      msg.urgency || 'Local Yard Delivery',
      'Not a Broker · Real Availability'
    ].filter(Boolean),
    descriptions: [
      `ZIP-based pricing from nearby yards in ${city}. Fast delivery, no hidden fees.`,
      `${size} yard dumpster rental with delivery & pickup included. See instant pricing online.`
    ]
  };
}
