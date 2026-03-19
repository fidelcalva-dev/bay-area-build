/**
 * Canonical Merge-Tag Resolver
 * 
 * Resolves {{customer.name}}, {{quote.total}}, {{company.phone}}, etc.
 * Used by contract templates, SMS templates, email templates,
 * PDF generation, and document previews.
 * 
 * All document-generation surfaces MUST use this resolver
 * instead of inline string interpolation.
 */

import { BUSINESS_INFO } from '@/lib/seo';
import {
  POLICY_VERSION,
  CONTRACT_VERSION,
  ADDENDUM_VERSION,
  TERMS_VERSION,
  ALL_POLICY_NOTICES,
} from '@/lib/policyLanguage';

// ── Types ────────────────────────────────────────────────────

export interface MergeTagContext {
  customer?: {
    name?: string | null;
    company_name?: string | null;
    phone?: string | null;
    email?: string | null;
    billing_address?: string | null;
    customer_type?: string | null;
    tier_code?: string | null;
  };
  contact?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    role?: string | null;
  };
  service_address?: {
    full?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    placement_instructions?: string | null;
    gate_code?: string | null;
    permit_notes?: string | null;
  };
  quote?: {
    id?: string | null;
    subtotal?: number | null;
    material_type?: string | null;
    material_class?: string | null;
    heavy_group?: string | null;
    size_yd?: number | null;
    rental_days?: number | null;
    included_tons?: number | null;
    overage_rate?: number | null;
    zone_surcharge?: number | null;
    rush_fee?: number | null;
    discount_pct?: number | null;
    extras_total?: number | null;
    base_price?: number | null;
    dump_fee_total?: number | null;
    delivery_date?: string | null;
    delivery_window?: string | null;
  };
  pricing?: {
    weight_or_flat_rate_rule?: string | null;
    pricing_mode?: string | null;
  };
  yard?: {
    name?: string | null;
    address?: string | null;
  };
  zone?: {
    name?: string | null;
    code?: string | null;
    surcharge?: number | null;
  };
  contract?: {
    id?: string | null;
    type?: string | null;
    version?: string | null;
    parent_id?: string | null;
    agreement_number?: string | null;
  };
  rep?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  };
}

// ── Resolver ─────────────────────────────────────────────────

/**
 * Resolve merge tags in a template string.
 * Tags use {{namespace.field}} format.
 * Unknown tags are replaced with empty string.
 */
export function resolveMergeTags(template: string, ctx: MergeTagContext): string {
  return template.replace(/\{\{(\w+)\.(\w+)\}\}/g, (_match, namespace, field) => {
    const value = resolveTag(namespace, field, ctx);
    return value ?? '';
  });
}

function resolveTag(ns: string, field: string, ctx: MergeTagContext): string | null {
  switch (ns) {
    case 'customer':
      return resolveCustomer(field, ctx);
    case 'contact':
      return resolveContact(field, ctx);
    case 'service_address':
      return resolveServiceAddress(field, ctx);
    case 'quote':
      return resolveQuote(field, ctx);
    case 'pricing':
      return resolvePricing(field, ctx);
    case 'yard':
      return resolveYard(field, ctx);
    case 'zone':
      return resolveZone(field, ctx);
    case 'contract':
      return resolveContract(field, ctx);
    case 'company':
      return resolveCompany(field);
    case 'rep':
      return resolveRep(field, ctx);
    case 'policy':
      return resolvePolicy(field);
    default:
      return null;
  }
}

function resolveCustomer(field: string, ctx: MergeTagContext): string | null {
  const c = ctx.customer;
  if (!c) return null;
  switch (field) {
    case 'name': return c.name || null;
    case 'company_name': return c.company_name || null;
    case 'phone': return c.phone || null;
    case 'email': return c.email || null;
    case 'billing_address': return c.billing_address || null;
    case 'customer_type': return c.customer_type || null;
    case 'tier_code': return c.tier_code || null;
    default: return null;
  }
}

function resolveContact(field: string, ctx: MergeTagContext): string | null {
  const c = ctx.contact;
  if (!c) return null;
  switch (field) {
    case 'name': return c.name || null;
    case 'phone': return c.phone || null;
    case 'email': return c.email || null;
    case 'role': return c.role || null;
    default: return null;
  }
}

function resolveServiceAddress(field: string, ctx: MergeTagContext): string | null {
  const a = ctx.service_address;
  if (!a) return null;
  switch (field) {
    case 'full': return a.full || null;
    case 'city': return a.city || null;
    case 'state': return a.state || null;
    case 'zip': return a.zip || null;
    case 'placement_instructions': return a.placement_instructions || null;
    case 'gate_code': return a.gate_code || null;
    case 'permit_notes': return a.permit_notes || null;
    default: return null;
  }
}

function resolveQuote(field: string, ctx: MergeTagContext): string | null {
  const q = ctx.quote;
  if (!q) return null;
  switch (field) {
    case 'id': return q.id || null;
    case 'subtotal':
    case 'total': return q.subtotal != null ? `$${q.subtotal.toFixed(2)}` : null;
    case 'material_type': return q.material_type || null;
    case 'material_class': return q.material_class || null;
    case 'heavy_group': return q.heavy_group || null;
    case 'size_yd': return q.size_yd != null ? `${q.size_yd}` : null;
    case 'rental_days': return q.rental_days != null ? `${q.rental_days}` : null;
    case 'included_tons': return q.included_tons != null ? `${q.included_tons}` : null;
    case 'overage_rate': return q.overage_rate != null ? `$${q.overage_rate}` : null;
    case 'zone_surcharge': return q.zone_surcharge != null ? `$${q.zone_surcharge.toFixed(2)}` : null;
    case 'rush_fee': return q.rush_fee != null ? `$${q.rush_fee.toFixed(2)}` : null;
    case 'discount_pct': return q.discount_pct != null ? `${q.discount_pct}%` : null;
    case 'extras_total': return q.extras_total != null ? `$${q.extras_total.toFixed(2)}` : null;
    case 'base_price': return q.base_price != null ? `$${q.base_price.toFixed(2)}` : null;
    case 'dump_fee_total': return q.dump_fee_total != null ? `$${q.dump_fee_total.toFixed(2)}` : null;
    case 'delivery_date': return q.delivery_date || null;
    case 'delivery_window': return q.delivery_window || null;
    default: return null;
  }
}

function resolvePricing(field: string, ctx: MergeTagContext): string | null {
  const p = ctx.pricing;
  if (!p) return null;
  switch (field) {
    case 'weight_or_flat_rate_rule': return p.weight_or_flat_rate_rule || null;
    case 'pricing_mode': return p.pricing_mode || null;
    default: return null;
  }
}

function resolveYard(field: string, ctx: MergeTagContext): string | null {
  const y = ctx.yard;
  if (!y) return null;
  switch (field) {
    case 'name': return y.name || null;
    case 'address': return y.address || null;
    default: return null;
  }
}

function resolveZone(field: string, ctx: MergeTagContext): string | null {
  const z = ctx.zone;
  if (!z) return null;
  switch (field) {
    case 'name': return z.name || null;
    case 'code': return z.code || null;
    case 'surcharge': return z.surcharge != null ? `$${z.surcharge.toFixed(2)}` : null;
    default: return null;
  }
}

function resolveContract(field: string, ctx: MergeTagContext): string | null {
  const c = ctx.contract;
  if (!c) return null;
  switch (field) {
    case 'id': return c.id || null;
    case 'type': return c.type || null;
    case 'version': return c.version || CONTRACT_VERSION;
    case 'parent_id': return c.parent_id || null;
    case 'agreement_number': return c.agreement_number || null;
    default: return null;
  }
}

function resolveCompany(field: string): string | null {
  switch (field) {
    case 'name': return BUSINESS_INFO.name;
    case 'phone': return BUSINESS_INFO.phone.salesFormatted;
    case 'email': return BUSINESS_INFO.email;
    case 'mailing_address': return BUSINESS_INFO.address.full;
    case 'city': return BUSINESS_INFO.address.city;
    case 'state': return BUSINESS_INFO.address.state;
    case 'zip': return BUSINESS_INFO.address.zip;
    default: return null;
  }
}

function resolveRep(field: string, ctx: MergeTagContext): string | null {
  const r = ctx.rep;
  if (!r) return null;
  switch (field) {
    case 'name': return r.name || null;
    case 'phone': return r.phone || null;
    case 'email': return r.email || null;
    default: return null;
  }
}

function resolvePolicy(field: string): string | null {
  switch (field) {
    case 'version': return POLICY_VERSION;
    case 'contract_version': return CONTRACT_VERSION;
    case 'addendum_version': return ADDENDUM_VERSION;
    case 'terms_version': return TERMS_VERSION;
    default: {
      // Try to resolve from ALL_POLICY_NOTICES
      const notice = (ALL_POLICY_NOTICES as Record<string, { en: string }>)[field];
      return notice?.en || null;
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * List all available merge tags for documentation/preview purposes.
 */
export function listAvailableMergeTags(): string[] {
  return [
    '{{customer.name}}', '{{customer.company_name}}', '{{customer.phone}}',
    '{{customer.email}}', '{{customer.billing_address}}', '{{customer.customer_type}}',
    '{{contact.name}}', '{{contact.phone}}', '{{contact.email}}', '{{contact.role}}',
    '{{service_address.full}}', '{{service_address.city}}', '{{service_address.zip}}',
    '{{service_address.placement_instructions}}', '{{service_address.gate_code}}',
    '{{quote.total}}', '{{quote.material_type}}', '{{quote.material_class}}',
    '{{quote.heavy_group}}', '{{quote.size_yd}}', '{{quote.rental_days}}',
    '{{quote.included_tons}}', '{{quote.overage_rate}}', '{{quote.base_price}}',
    '{{quote.dump_fee_total}}', '{{quote.zone_surcharge}}', '{{quote.rush_fee}}',
    '{{quote.delivery_date}}', '{{quote.delivery_window}}',
    '{{pricing.weight_or_flat_rate_rule}}',
    '{{yard.name}}', '{{yard.address}}',
    '{{zone.name}}', '{{zone.code}}', '{{zone.surcharge}}',
    '{{contract.id}}', '{{contract.type}}', '{{contract.version}}',
    '{{company.name}}', '{{company.phone}}', '{{company.email}}', '{{company.mailing_address}}',
    '{{rep.name}}', '{{rep.phone}}', '{{rep.email}}',
    '{{policy.version}}', '{{policy.contract_version}}', '{{policy.addendum_version}}',
  ];
}
