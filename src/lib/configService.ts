/**
 * Unified Configuration Service
 * Provides canonical access to all config_settings with fallback support for legacy keys
 */

import { supabase } from '@/integrations/supabase/client';

// =====================================================
// CANONICAL CONFIG KEYS (2026_Q1_ALIGNMENT)
// =====================================================

// Messaging mode type
export type MessagingMode = 'DRY_RUN' | 'LIVE';

// Quote AI mode type (controlled rollout phases)
export type QuoteAIMode = 'DRY_RUN' | 'LIVE_SOFT' | 'LIVE';

// Assistant Learning mode type
export type AssistantLearningMode = 'OFF' | 'DRY_RUN' | 'LIVE';

export const CANONICAL_CONFIG = {
  // Messaging
  'messaging.mode': { category: 'messaging', key: 'mode', default: 'DRY_RUN' as MessagingMode },
  'messaging.office_hours': { category: 'messaging', key: 'office_hours', default: { tz: 'America/Los_Angeles', start: '06:00', end: '21:00' } },
  'messaging.send_customer_confirmations': { category: 'messaging', key: 'send_customer_confirmations', default: true },
  'messaging.send_payment_requests': { category: 'messaging', key: 'send_payment_requests', default: true },
  'messaging.send_overdue_notices': { category: 'messaging', key: 'send_overdue_notices', default: true },

  // Pricing
  'pricing.version': { category: 'pricing', key: 'version', default: '2026_Q1_MARKET_STUDY' },
  'pricing.default_tier.web': { category: 'pricing', key: 'default_tier_web', default: 'BASE' },
  'pricing.default_tier.sales': { category: 'pricing', key: 'default_tier_sales', default: 'CORE' },
  'pricing.default_tier.dispatch': { category: 'pricing', key: 'default_tier_dispatch', default: 'CORE' },
  'pricing.extra_ton_rate': { category: 'pricing', key: 'extra_ton_rate_default', default: 165 },
  'pricing.prepay_discount_pct': { category: 'pricing', key: 'prepay_discount_pct', default: 5 },
  'pricing.same_day_fee': { category: 'pricing', key: 'same_day_fee', default: 100 },
  'pricing.weekend_fee': { category: 'pricing', key: 'weekend_fee', default: 75 },
  'pricing.override_requires_approval': { category: 'pricing', key: 'override_requires_approval', default: true },
  'pricing.max_discount_pct_without_approval': { category: 'pricing', key: 'max_discount_pct_without_approval', default: 10 },
  'pricing.heavy_base_10yd': { category: 'pricing', key: 'heavy_base_10yd', default: 638 },

  // Overdue
  'overdue.enabled': { category: 'overdue', key: 'enabled', default: true },
  'overdue.included_days_default': { category: 'overdue', key: 'included_days_default', default: 7 },
  'overdue.daily_rate': { category: 'overdue', key: 'daily_rate', default: 35 },
  'overdue.warning_days': { category: 'overdue', key: 'warning_days', default: 1 },
  'overdue.escalation_days': { category: 'overdue', key: 'escalation_days', default: 3 },
  'overdue.auto_bill_enabled': { category: 'overdue', key: 'auto_bill_enabled', default: true },
  'overdue.auto_bill_max': { category: 'overdue', key: 'auto_bill_max', default: 250 },
  'overdue.customer_type_policy': { category: 'overdue', key: 'customer_type_policy', default: {
    homeowner: { auto_bill: false, requires_approval: true },
    contractor: { auto_bill: true, requires_approval: false },
    commercial: { auto_bill: true, requires_approval: false },
  }},
  'overdue.max_billable_days_per_run': { category: 'overdue', key: 'max_billable_days_per_run', default: 7 },
  'overdue.require_pickup_task_after_days': { category: 'overdue', key: 'require_pickup_task_after_days', default: 3 },

  // Dispatch
  'dispatch.use_runs_as_source_of_truth': { category: 'dispatch', key: 'use_runs_as_source_of_truth', default: true },
  'dispatch.block_completion_without_photos': { category: 'dispatch', key: 'block_completion_without_photos', default: true },
  'dispatch.require_asset_for_delivery': { category: 'dispatch', key: 'require_asset_for_delivery', default: true },
  'dispatch.auto_create_delivery_run': { category: 'dispatch', key: 'auto_create_delivery_run', default: true },
  'dispatch.auto_create_pickup_run': { category: 'dispatch', key: 'auto_create_pickup_run', default: false },
  'dispatch.default_run_window_hours': { category: 'dispatch', key: 'default_run_window_hours', default: 2 },
  'dispatch.cancel_runs_on_order_closed': { category: 'dispatch', key: 'cancel_runs_on_order_closed', default: true },

  // Inventory
  'inventory.assets_source_of_truth': { category: 'inventory', key: 'assets_source_of_truth', default: 'assets_dumpsters' },
  'inventory.enable_movement_dedup': { category: 'inventory', key: 'enable_movement_dedup', default: true },
  'inventory.utilization_threshold_core': { category: 'inventory', key: 'utilization_threshold_core', default: 0.80 },
  'inventory.utilization_threshold_premium': { category: 'inventory', key: 'utilization_threshold_premium', default: 0.90 },

  // Approvals
  'approvals.enabled': { category: 'approvals', key: 'enabled', default: true },
  'approvals.auto_route_overdue_over_max': { category: 'approvals', key: 'auto_route_overdue_over_max', default: true },
  'approvals.auto_route_price_override': { category: 'approvals', key: 'auto_route_price_override', default: true },
  'approvals.auto_route_refunds': { category: 'approvals', key: 'auto_route_refunds', default: true },
  'approvals.max_auto_refund': { category: 'approvals', key: 'max_auto_refund', default: 0 },

  // Leads
  'leads.timeout_minutes': { category: 'leads', key: 'timeout_minutes', default: 15 },
  'leads.routing_enabled': { category: 'leads', key: 'routing_enabled', default: true },

  // Quote AI
  'quote_ai.enabled': { category: 'quote_ai', key: 'enabled', default: true },
  'quote_ai.mode': { category: 'quote_ai', key: 'mode', default: 'DRY_RUN' as QuoteAIMode },

  // Assistant Learning
  'assistant_learning.mode': { category: 'assistant_learning', key: 'mode', default: 'OFF' as AssistantLearningMode },

  // Portal
  'portal.otp_enabled': { category: 'portal', key: 'otp_enabled', default: true },
  'portal.show_overdue_balance': { category: 'portal', key: 'show_overdue_balance', default: true },
  'portal.allow_pay_overdue_online': { category: 'portal', key: 'allow_pay_overdue_online', default: true },

  // Office (legacy support)
  'office.hours': { category: 'office', key: 'hours', default: { open: '06:00', close: '21:00', timezone: 'America/Los_Angeles' } },
} as const;

export type ConfigKey = keyof typeof CANONICAL_CONFIG;

// Cache for loaded configs
let configCache: Map<string, unknown> | null = null;
let cacheLoadedAt: number = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

/**
 * Load all config settings into cache
 */
export async function loadConfigCache(): Promise<Map<string, unknown>> {
  const { data, error } = await supabase
    .from('config_settings')
    .select('category, key, value');

  if (error) {
    console.error('Failed to load config:', error);
    return new Map();
  }

  const cache = new Map<string, unknown>();
  for (const row of data || []) {
    const fullKey = `${row.category}.${row.key}`;
    let value: unknown = row.value;
    
    // Parse JSON strings if needed
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch {
        // Keep as string if not valid JSON
        value = (value as string).replace(/^"|"$/g, ''); // Remove surrounding quotes
      }
    }
    
    cache.set(fullKey, value);
  }
  
  configCache = cache;
  cacheLoadedAt = Date.now();
  return cache;
}

/**
 * Get a config value by canonical key
 */
export async function getConfig<K extends ConfigKey>(
  key: K
): Promise<typeof CANONICAL_CONFIG[K]['default']> {
  // Check cache freshness
  if (!configCache || Date.now() - cacheLoadedAt > CACHE_TTL_MS) {
    await loadConfigCache();
  }

  const spec = CANONICAL_CONFIG[key];
  const fullKey = `${spec.category}.${spec.key}`;
  
  if (configCache?.has(fullKey)) {
    return configCache.get(fullKey) as typeof CANONICAL_CONFIG[K]['default'];
  }

  // Return default
  return spec.default;
}

/**
 * Get multiple config values at once
 */
export async function getConfigs<K extends ConfigKey>(
  keys: K[]
): Promise<Record<K, typeof CANONICAL_CONFIG[K]['default']>> {
  if (!configCache || Date.now() - cacheLoadedAt > CACHE_TTL_MS) {
    await loadConfigCache();
  }

  const result = {} as Record<K, typeof CANONICAL_CONFIG[K]['default']>;
  for (const key of keys) {
    const spec = CANONICAL_CONFIG[key];
    const fullKey = `${spec.category}.${spec.key}`;
    result[key] = (configCache?.get(fullKey) ?? spec.default) as typeof CANONICAL_CONFIG[K]['default'];
  }
  return result;
}

/**
 * Update a config value
 */
export async function setConfig<K extends ConfigKey>(
  key: K,
  value: typeof CANONICAL_CONFIG[K]['default']
): Promise<boolean> {
  const spec = CANONICAL_CONFIG[key];
  
  const { error } = await supabase
    .from('config_settings')
    .update({ 
      value: typeof value === 'object' ? JSON.stringify(value) : value,
      updated_at: new Date().toISOString()
    })
    .eq('category', spec.category)
    .eq('key', spec.key);

  if (error) {
    console.error('Failed to update config:', error);
    return false;
  }

  // Invalidate cache
  configCache = null;
  return true;
}

/**
 * Force refresh the config cache
 */
export function invalidateConfigCache(): void {
  configCache = null;
  cacheLoadedAt = 0;
}

// =====================================================
// HEALTH CHECK TYPES
// =====================================================

export interface ConfigHealthResult {
  status: 'PASS' | 'WARN' | 'FAIL';
  missing_keys: string[];
  conflicting_keys: string[];
  dangerous_values: { key: string; reason: string }[];
  drift_warnings: string[];
  overdue_contradictions: string[];
  messaging_preflight: { ready: boolean; issues: string[] };
  summary: string;
}

/**
 * Validate system configuration health
 */
export async function validateConfigHealth(): Promise<ConfigHealthResult> {
  await loadConfigCache();
  
  const result: ConfigHealthResult = {
    status: 'PASS',
    missing_keys: [],
    conflicting_keys: [],
    dangerous_values: [],
    drift_warnings: [],
    overdue_contradictions: [],
    messaging_preflight: { ready: true, issues: [] },
    summary: '',
  };

  // Check for missing keys
  for (const [key, spec] of Object.entries(CANONICAL_CONFIG)) {
    const fullKey = `${spec.category}.${spec.key}`;
    if (!configCache?.has(fullKey)) {
      result.missing_keys.push(key);
    }
  }

  // Check messaging preflight for LIVE mode
  const messagingMode = await getConfig('messaging.mode');
  if (messagingMode === 'LIVE') {
    // Check if templates exist (simplified check)
    const { data: templates } = await supabase
      .from('config_settings')
      .select('key')
      .eq('category', 'messaging')
      .like('key', 'template_%');
    
    if (!templates || templates.length === 0) {
      result.messaging_preflight.ready = false;
      result.messaging_preflight.issues.push('No SMS templates configured');
    }

    // Check office hours
    const officeHours = await getConfig('messaging.office_hours');
    if (!officeHours || !officeHours.start || !officeHours.end) {
      result.messaging_preflight.ready = false;
      result.messaging_preflight.issues.push('Office hours not configured');
    }
  }

  // Check overdue contradictions
  const overdueEnabled = await getConfig('overdue.enabled');
  const autoBillEnabled = await getConfig('overdue.auto_bill_enabled');
  const autoBillMax = await getConfig('overdue.auto_bill_max');
  
  if (overdueEnabled && autoBillEnabled && Number(autoBillMax) === 0) {
    result.overdue_contradictions.push('Auto-billing enabled but max amount is $0 - no charges will be created');
  }

  // Check dispatch contradictions
  const runsSourceOfTruth = await getConfig('dispatch.use_runs_as_source_of_truth');
  const autoCreateDelivery = await getConfig('dispatch.auto_create_delivery_run');
  
  if (runsSourceOfTruth && !autoCreateDelivery) {
    result.drift_warnings.push('Runs is source of truth but auto-create delivery is disabled - manual run creation required');
  }

  // Check pricing version
  const pricingVersion = await getConfig('pricing.version');
  if (!pricingVersion || !pricingVersion.includes('2026')) {
    result.drift_warnings.push(`Pricing version "${pricingVersion}" may be outdated`);
  }

  // Check dangerous values
  const maxDiscount = await getConfig('pricing.max_discount_pct_without_approval');
  if (typeof maxDiscount === 'number' && maxDiscount > 25) {
    result.dangerous_values.push({
      key: 'pricing.max_discount_pct_without_approval',
      reason: `Discount of ${maxDiscount}% without approval is dangerously high`,
    });
  }

  // Determine overall status
  if (result.dangerous_values.length > 0 || result.overdue_contradictions.length > 0) {
    result.status = 'FAIL';
  } else if (result.missing_keys.length > 0 || result.drift_warnings.length > 0 || !result.messaging_preflight.ready) {
    result.status = 'WARN';
  }

  // Build summary
  const issues = [
    ...result.missing_keys.map(k => `Missing: ${k}`),
    ...result.dangerous_values.map(d => `Dangerous: ${d.key}`),
    ...result.overdue_contradictions,
    ...result.drift_warnings,
    ...result.messaging_preflight.issues,
  ];
  
  result.summary = issues.length === 0 
    ? 'All configuration checks passed'
    : `${issues.length} issue(s) found`;

  return result;
}

/**
 * Apply missing configs with defaults
 */
export async function applyMissingConfigs(): Promise<{ applied: string[]; errors: string[] }> {
  const health = await validateConfigHealth();
  const applied: string[] = [];
  const errors: string[] = [];

  for (const key of health.missing_keys) {
    const spec = CANONICAL_CONFIG[key as ConfigKey];
    if (!spec) continue;

    const { error } = await supabase
      .from('config_settings')
      .insert({
        category: spec.category,
        key: spec.key,
        value: typeof spec.default === 'object' ? JSON.stringify(spec.default) : spec.default,
        description: `Auto-applied default for ${key}`,
        is_locked: false,
      });

    if (error) {
      errors.push(`Failed to apply ${key}: ${error.message}`);
    } else {
      applied.push(key);
    }
  }

  invalidateConfigCache();
  return { applied, errors };
}

/**
 * Check if system is ready to switch to LIVE messaging
 */
export async function canSwitchToLive(): Promise<{ ready: boolean; blockers: string[] }> {
  const health = await validateConfigHealth();
  const blockers: string[] = [];

  if (!health.messaging_preflight.ready) {
    blockers.push(...health.messaging_preflight.issues);
  }

  if (health.overdue_contradictions.length > 0) {
    blockers.push('Overdue billing has configuration contradictions');
  }

  if (health.dangerous_values.length > 0) {
    blockers.push('Dangerous configuration values detected');
  }

  return { ready: blockers.length === 0, blockers };
}
