/**
 * Pricing Catalog Service — DB-backed editable pricing source of truth
 * 
 * All pricing consumers should use this service. Falls back to config constants
 * when DB rows are not yet populated.
 */
import { supabase } from '@/integrations/supabase/client';
import { GENERAL_DEBRIS_SIZES, POLICIES } from '@/config/pricingConfig';
import {
  HEAVY_SERVICE_COSTS,
  HEAVY_MATERIAL_GROUPS,
  HEAVY_ALLOWED_SIZES,
  type HeavySize,
  type HeavyMaterialGroup,
} from '@/config/heavyMaterialConfig';

// ── Types ────────────────────────────────────────────────────

export interface GeneralDebrisRow {
  id: string;
  size_yd: number;
  market_code: string;
  base_price: number;
  included_tons: number;
  rental_days: number;
  overage_rate: number;
  best_for: string | null;
  public_visible: boolean;
  active: boolean;
  notes: string | null;
}

export interface HeavyServiceCostRow {
  id: string;
  size_yd: number;
  service_cost: number;
  active: boolean;
}

export interface HeavyGroupRow {
  id: string;
  heavy_group_code: string;
  label: string;
  label_es: string | null;
  customer_label: string | null;
  description: string | null;
  materials_json: string[];
  dump_fee_per_yard: number;
  rebar_premium: number;
  green_halo_premium: number;
  display_order: number;
  active: boolean;
}

export interface PolicyRow {
  id: string;
  policy_code: string;
  label: string;
  amount: number;
  description: string | null;
  active: boolean;
}

export interface PricingVersionRow {
  id: string;
  version_code: string;
  status: string;
  published_at: string | null;
  created_by: string | null;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface PricingAuditRow {
  id: string;
  changed_by_email: string | null;
  changed_at: string;
  config_area: string;
  entity_type: string;
  entity_id: string | null;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  change_reason: string | null;
}

// ── Fetch Functions ──────────────────────────────────────────

export async function fetchGeneralDebrisPricing(marketCode = 'default'): Promise<GeneralDebrisRow[]> {
  const { data, error } = await supabase
    .from('pricing_general_debris')
    .select('*')
    .eq('market_code', marketCode)
    .eq('active', true)
    .order('size_yd');

  if (error || !data?.length) {
    // Fallback to config constants
    return GENERAL_DEBRIS_SIZES.map((s, i) => ({
      id: `fallback-${s.size}`,
      size_yd: s.size,
      market_code: marketCode,
      base_price: s.price,
      included_tons: s.includedTons,
      rental_days: 7,
      overage_rate: POLICIES.overweightCostPerTon,
      best_for: s.bestFor,
      public_visible: true,
      active: true,
      notes: null,
    }));
  }

  return data.map(r => ({
    id: r.id,
    size_yd: r.size_yd,
    market_code: r.market_code,
    base_price: Number(r.base_price),
    included_tons: Number(r.included_tons),
    rental_days: r.rental_days,
    overage_rate: Number(r.overage_rate),
    best_for: r.best_for,
    public_visible: r.public_visible,
    active: r.active,
    notes: r.notes,
  }));
}

export async function fetchHeavyServiceCosts(): Promise<HeavyServiceCostRow[]> {
  const { data, error } = await supabase
    .from('pricing_heavy_service_costs')
    .select('*')
    .eq('active', true)
    .order('size_yd');

  if (error || !data?.length) {
    return HEAVY_ALLOWED_SIZES.map(size => ({
      id: `fallback-${size}`,
      size_yd: size,
      service_cost: HEAVY_SERVICE_COSTS[size],
      active: true,
    }));
  }

  return data.map(r => ({
    id: r.id,
    size_yd: r.size_yd,
    service_cost: Number(r.service_cost),
    active: r.active,
  }));
}

export async function fetchHeavyGroups(): Promise<HeavyGroupRow[]> {
  const { data, error } = await supabase
    .from('pricing_heavy_groups')
    .select('*')
    .eq('active', true)
    .order('display_order');

  if (error || !data?.length) {
    return HEAVY_MATERIAL_GROUPS.map(g => ({
      id: `fallback-${g.id}`,
      heavy_group_code: g.id,
      label: g.label,
      label_es: g.labelEs,
      customer_label: g.customerLabel,
      description: g.description,
      materials_json: g.materials,
      dump_fee_per_yard: g.dumpFeePerYard,
      rebar_premium: 50,
      green_halo_premium: 75,
      display_order: g.displayOrder,
      active: true,
    }));
  }

  return data.map(r => ({
    id: r.id,
    heavy_group_code: r.heavy_group_code,
    label: r.label,
    label_es: r.label_es,
    customer_label: r.customer_label,
    description: r.description,
    materials_json: Array.isArray(r.materials_json) ? r.materials_json as string[] : [],
    dump_fee_per_yard: Number(r.dump_fee_per_yard),
    rebar_premium: Number(r.rebar_premium),
    green_halo_premium: Number(r.green_halo_premium),
    display_order: r.display_order,
    active: r.active,
  }));
}

export async function fetchPolicies(): Promise<PolicyRow[]> {
  const { data, error } = await supabase
    .from('pricing_policies')
    .select('*')
    .eq('active', true)
    .order('policy_code');

  if (error || !data?.length) {
    return Object.entries(POLICIES)
      .filter(([, v]) => typeof v === 'number')
      .map(([k, v]) => ({
        id: `fallback-${k}`,
        policy_code: k,
        label: k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
        amount: v as number,
        description: null,
        active: true,
      }));
  }

  return data.map(r => ({
    id: r.id,
    policy_code: r.policy_code,
    label: r.label,
    amount: Number(r.amount),
    description: r.description,
    active: r.active,
  }));
}

export async function fetchPricingVersions(): Promise<PricingVersionRow[]> {
  const { data } = await supabase
    .from('pricing_versions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  return (data || []).map(r => ({
    id: r.id,
    version_code: r.version_code,
    status: r.status,
    published_at: r.published_at,
    created_by: r.created_by,
    approved_by: r.approved_by,
    notes: r.notes,
    created_at: r.created_at,
  }));
}

export async function fetchPricingAuditLog(limit = 50): Promise<PricingAuditRow[]> {
  const { data } = await supabase
    .from('pricing_audit_log')
    .select('*')
    .order('changed_at', { ascending: false })
    .limit(limit);

  return (data || []).map(r => ({
    id: r.id,
    changed_by_email: r.changed_by_email,
    changed_at: r.changed_at,
    config_area: r.config_area,
    entity_type: r.entity_type,
    entity_id: r.entity_id,
    field_name: r.field_name,
    old_value: r.old_value,
    new_value: r.new_value,
    change_reason: r.change_reason,
  }));
}

// ── Update Functions ─────────────────────────────────────────

export async function updateGeneralDebrisPrice(
  id: string,
  updates: Partial<Pick<GeneralDebrisRow, 'base_price' | 'included_tons' | 'rental_days' | 'overage_rate' | 'best_for' | 'active' | 'public_visible'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('pricing_general_debris')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}

export async function updateHeavyServiceCost(
  id: string,
  service_cost: number
): Promise<boolean> {
  const { error } = await supabase
    .from('pricing_heavy_service_costs')
    .update({ service_cost, updated_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}

export async function updateHeavyGroup(
  id: string,
  updates: Partial<Pick<HeavyGroupRow, 'dump_fee_per_yard' | 'rebar_premium' | 'green_halo_premium' | 'label' | 'description' | 'active'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('pricing_heavy_groups')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}

export async function updatePolicy(
  id: string,
  amount: number
): Promise<boolean> {
  const { error } = await supabase
    .from('pricing_policies')
    .update({ amount, updated_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}

// ── Audit Logging ────────────────────────────────────────────

export async function logPricingChange(params: {
  config_area: string;
  entity_type: string;
  entity_id?: string;
  field_name: string;
  old_value?: string | number;
  new_value?: string | number;
  change_reason?: string;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from('pricing_audit_log').insert({
    changed_by_user_id: user?.id || null,
    changed_by_email: user?.email || null,
    config_area: params.config_area,
    entity_type: params.entity_type,
    entity_id: params.entity_id || null,
    field_name: params.field_name,
    old_value: params.old_value?.toString() || null,
    new_value: params.new_value?.toString() || null,
    change_reason: params.change_reason || null,
  });
}
