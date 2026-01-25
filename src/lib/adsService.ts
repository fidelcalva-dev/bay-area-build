// Google Ads Engine Service - Simplified type-safe version
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

export const BASE_PRICES: Record<number, number> = {
  6: 390, 8: 440, 10: 499, 20: 599, 30: 749, 40: 899, 50: 1135
};

// Helper for type-safe queries
const adsQuery = (table: string) => supabase.from(table as 'orders');

export async function getAdsMarkets(): Promise<AdsMarket[]> {
  const { data, error } = await adsQuery('ads_markets').select('*').order('priority');
  if (error) throw error;
  return (data || []) as unknown as AdsMarket[];
}

export async function getAdsCampaigns(marketCode?: string): Promise<AdsCampaign[]> {
  let query = adsQuery('ads_campaigns').select('*').order('created_at', { ascending: false });
  if (marketCode) query = query.eq('market_code', marketCode);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as unknown as AdsCampaign[];
}

export async function updateCampaignStatus(id: string, status: string, pauseReason?: string): Promise<void> {
  const { error } = await adsQuery('ads_campaigns')
    .update({ status, pause_reason: pauseReason || null, updated_at: new Date().toISOString() } as never)
    .eq('id', id);
  if (error) throw error;
}

export async function updateCampaignMessagingTier(id: string, tier: string): Promise<void> {
  const { error } = await adsQuery('ads_campaigns')
    .update({ messaging_tier: tier, updated_at: new Date().toISOString() } as never)
    .eq('id', id);
  if (error) throw error;
}

export async function getTodayMetricsSummary(): Promise<AdsMetricsSummary> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await adsQuery('ads_metrics').select('impressions, clicks, cost, conversions, conversion_value').eq('date', today);
  if (error) throw error;
  
  const metrics = (data || []) as unknown as Array<{ impressions: number; clicks: number; cost: number; conversions: number; conversion_value: number }>;
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
  const { data, error } = await adsQuery('ads_metrics')
    .select('impressions, clicks, cost, conversions, conversion_value')
    .eq('campaign_id', campaignId).gte('date', startDate).lte('date', endDate);
  if (error) throw error;
  
  const metrics = (data || []) as unknown as Array<{ impressions: number; clicks: number; cost: number; conversions: number; conversion_value: number }>;
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
  const { data, error } = await adsQuery('ads_alerts').select('*').eq('is_resolved', false).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as AdsAlert[];
}

export async function getSyncLogs(limit = 20) {
  const { data, error } = await adsQuery('ads_sync_log').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []) as unknown as Array<{ id: string; sync_type: string; status: string; records_processed: number; duration_ms: number | null; created_at: string }>;
}

export async function getAdsRules() {
  const { data, error } = await adsQuery('ads_rules').select('*').order('priority');
  if (error) throw error;
  return (data || []) as unknown as Array<{ id: string; rule_name: string; rule_type: string; conditions: Record<string, unknown>; actions: Record<string, unknown>; priority: number; is_active: boolean; last_triggered_at: string | null; trigger_count: number }>;
}

export async function toggleRule(ruleId: string, isActive: boolean): Promise<void> {
  const { error } = await adsQuery('ads_rules').update({ is_active: isActive } as never).eq('id', ruleId);
  if (error) throw error;
}
