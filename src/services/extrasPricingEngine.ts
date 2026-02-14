// Dynamic Extras Pricing Rules Engine
// Resolves the correct price for any extra based on zone, size, material, and formula rules
import { supabase } from '@/integrations/supabase/client';

// ── Types ──────────────────────────────────────────────
export interface ExtraCatalogItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  default_price: number | null;
  pricing_model: string;
  applies_to_material: string;
  applies_to_sizes_json: number[] | null;
  requires_approval: boolean;
  formula_expression: string | null;
  category: string | null;
  is_active: boolean;
}

export interface PricingRuleMatch {
  ruleId: string | null;
  price: number | null;
  source: 'RULE_ZONE_SIZE_MAT' | 'RULE_ZONE_SIZE' | 'RULE_ZONE' | 'RULE_SIZE' | 'DEFAULT' | 'FORMULA' | 'PENDING' | 'VENDOR';
  marginPercent: number | null;
  vendorCost: number | null;
  vendorId: string | null;
  isPending: boolean;
  requiresApproval: boolean;
}

export interface VendorOption {
  vendorId: string;
  vendorName: string;
  estimatedCost: number;
  suggestedPrice: number;
  margin: number;
}

export interface ExtraResolutionContext {
  zoneId?: string;
  sizeYd?: number;
  materialType?: string; // 'general' | 'heavy' | 'green'
  basePrice?: number;    // for FORMULA extras (e.g. after-hours = base * 0.15)
  totalPrice?: number;   // for FORMULA extras (e.g. contamination = total * 0.25)
}

// ── Catalog Fetch ──────────────────────────────────────
export async function fetchFullExtraCatalog(): Promise<ExtraCatalogItem[]> {
  const { data, error } = await supabase
    .from('extra_catalog')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  if (error) throw error;
  return (data ?? []).map(d => ({
    ...d,
    applies_to_sizes_json: d.applies_to_sizes_json as number[] | null,
  })) as ExtraCatalogItem[];
}

// ── Core Pricing Resolution ────────────────────────────
export async function resolveExtraPrice(
  extra: ExtraCatalogItem,
  ctx: ExtraResolutionContext
): Promise<PricingRuleMatch> {
  // 1) FORMULA-based extras
  if (extra.pricing_model === 'FORMULA' && extra.formula_expression) {
    const price = evaluateFormula(extra.formula_expression, ctx);
    return {
      ruleId: null,
      price,
      source: 'FORMULA',
      marginPercent: null,
      vendorCost: null,
      vendorId: null,
      isPending: price == null,
      requiresApproval: extra.requires_approval,
    };
  }

  // 2) PENDING model — always pending
  if (extra.pricing_model === 'PENDING') {
    return {
      ruleId: null,
      price: null,
      source: 'PENDING',
      marginPercent: null,
      vendorCost: null,
      vendorId: null,
      isPending: true,
      requiresApproval: extra.requires_approval,
    };
  }

  // 3) FIXED model — use default_price
  if (extra.pricing_model === 'FIXED') {
    return {
      ruleId: null,
      price: extra.default_price,
      source: 'DEFAULT',
      marginPercent: null,
      vendorCost: null,
      vendorId: null,
      isPending: extra.default_price == null,
      requiresApproval: extra.requires_approval,
    };
  }

  // 4) Rule-based: PER_ZONE, PER_SIZE, PER_ZONE_AND_SIZE
  // Fetch all active rules for this extra
  const { data: rules, error } = await supabase
    .from('extra_pricing_rules')
    .select('*')
    .eq('extra_id', extra.id)
    .eq('is_active', true);

  if (error) {
    console.error('Failed to fetch pricing rules:', error);
    return fallbackResult(extra);
  }

  if (!rules || rules.length === 0) {
    return fallbackResult(extra);
  }

  // Priority matching: most specific first
  // Level 1: zone + size + material
  const l1 = rules.find(r =>
    r.zone_id === ctx.zoneId &&
    r.size_yd === ctx.sizeYd &&
    r.material_type === ctx.materialType
  );
  if (l1) return ruleToMatch(l1, 'RULE_ZONE_SIZE_MAT', extra);

  // Level 2: zone + size
  const l2 = rules.find(r =>
    r.zone_id === ctx.zoneId &&
    r.size_yd === ctx.sizeYd &&
    !r.material_type
  );
  if (l2) return ruleToMatch(l2, 'RULE_ZONE_SIZE', extra);

  // Level 3: zone only
  const l3 = rules.find(r =>
    r.zone_id === ctx.zoneId &&
    !r.size_yd &&
    !r.material_type
  );
  if (l3) return ruleToMatch(l3, 'RULE_ZONE', extra);

  // Level 4: size only (no zone)
  const l4 = rules.find(r =>
    !r.zone_id &&
    r.size_yd === ctx.sizeYd &&
    !r.material_type
  );
  if (l4) return ruleToMatch(l4, 'RULE_SIZE', extra);

  // Level 5: default rule (no zone, no size, no material)
  const l5 = rules.find(r => !r.zone_id && !r.size_yd && !r.material_type);
  if (l5) return ruleToMatch(l5, 'DEFAULT', extra);

  // No rule matched — use catalog default
  return fallbackResult(extra);
}

// ── Vendor Fallback ────────────────────────────────────
export async function findVendorOptions(
  zip: string,
  sizeYd: number,
  materialType: string,
  targetMargin: number = 0.30
): Promise<VendorOption[]> {
  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_active', true)
    .order('reliability_score', { ascending: false });

  if (error || !vendors) return [];

  return vendors
    .filter(v => {
      const zips = (v.coverage_zips as string[]) ?? [];
      const sizes = (v.size_support as number[]) ?? [];
      const mats = (v.material_support as string[]) ?? [];
      return (
        (zips.length === 0 || zips.includes(zip)) &&
        (sizes.length === 0 || sizes.includes(sizeYd)) &&
        (mats.length === 0 || mats.includes(materialType))
      );
    })
    .map(v => {
      const multiplier = (v as any).default_cost_multiplier ?? 1.0;
      // Estimate cost based on a baseline
      const baseCost = sizeYd * 20 * multiplier; // rough estimate
      const suggestedPrice = Math.round(baseCost / (1 - targetMargin) / 5) * 5;
      const margin = (suggestedPrice - baseCost) / suggestedPrice;
      return {
        vendorId: v.id,
        vendorName: v.name,
        estimatedCost: baseCost,
        suggestedPrice,
        margin,
      };
    });
}

// ── Log Override ───────────────────────────────────────
export async function logPricingOverride(params: {
  cartId?: string;
  orderId?: string;
  itemId?: string;
  extraCode?: string;
  originalPrice: number;
  newPrice: number;
  reason: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('pricing_override_log').insert([{
    cart_id: params.cartId ?? null,
    order_id: params.orderId ?? null,
    user_id: user.id,
    item_id: params.itemId ?? null,
    extra_code: params.extraCode ?? null,
    original_price: params.originalPrice,
    new_price: params.newPrice,
    reason: params.reason,
  }]);
}

// ── Filter extras by context ───────────────────────────
export function filterExtrasByContext(
  catalog: ExtraCatalogItem[],
  materialType?: string,
  sizeYd?: number
): ExtraCatalogItem[] {
  return catalog.filter(e => {
    // Material filter
    if (e.applies_to_material !== 'ALL' && materialType) {
      if (e.applies_to_material.toLowerCase() !== materialType.toLowerCase()) return false;
    }
    // Size filter
    if (e.applies_to_sizes_json && e.applies_to_sizes_json.length > 0 && sizeYd) {
      if (!e.applies_to_sizes_json.includes(sizeYd)) return false;
    }
    return true;
  });
}

// ── Margin Helpers ─────────────────────────────────────
export function calculateMargin(clientPrice: number, vendorCost: number): {
  margin: number;
  marginPercent: number;
  band: 'green' | 'yellow' | 'red';
} {
  if (clientPrice <= 0) return { margin: 0, marginPercent: 0, band: 'red' };
  const margin = clientPrice - vendorCost;
  const marginPercent = margin / clientPrice;
  const band = marginPercent >= 0.25 ? 'green' : marginPercent >= 0.10 ? 'yellow' : 'red';
  return { margin, marginPercent, band };
}

// ── Private Helpers ────────────────────────────────────
function evaluateFormula(
  expression: string,
  ctx: ExtraResolutionContext
): number | null {
  try {
    const base_price = ctx.basePrice ?? 0;
    const total = ctx.totalPrice ?? 0;
    // Simple safe evaluation for known patterns
    if (expression.includes('base_price')) {
      const multiplier = parseFloat(expression.replace('base_price *', '').trim());
      return Math.round(base_price * multiplier * 100) / 100;
    }
    if (expression.includes('total')) {
      const multiplier = parseFloat(expression.replace('total *', '').trim());
      return Math.round(total * multiplier * 100) / 100;
    }
    return null;
  } catch {
    return null;
  }
}

function ruleToMatch(
  rule: any,
  source: PricingRuleMatch['source'],
  extra: ExtraCatalogItem
): PricingRuleMatch {
  return {
    ruleId: rule.id,
    price: rule.price,
    source,
    marginPercent: rule.margin_percent,
    vendorCost: rule.vendor_cost,
    vendorId: rule.vendor_id,
    isPending: false,
    requiresApproval: extra.requires_approval,
  };
}

function fallbackResult(extra: ExtraCatalogItem): PricingRuleMatch {
  return {
    ruleId: null,
    price: extra.default_price,
    source: 'DEFAULT',
    marginPercent: null,
    vendorCost: null,
    vendorId: null,
    isPending: extra.default_price == null,
    requiresApproval: extra.requires_approval,
  };
}
