// Outbound Quote Service — create, send, and track quotes from Internal Calculator

import { supabase } from '@/integrations/supabase/client';
import type { PricingTier } from '@/services/pricingTierService';

export interface OutboundQuoteInput {
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  address_text?: string;
  zip?: string;
  customer_type: string;
  material_category: string;
  size_yd: number;
  tier: PricingTier;
  customer_price: number;
  included_days: number;
  included_tons: string;
  overage_rule_text: string;
  same_day_flag: boolean;
  order_id?: string;
  quote_id?: string;
}

export interface OutboundQuoteRecord {
  id: string;
  status: string;
  created_at: string;
  customer_price: number;
  tier: string;
}

// Build next-steps links (fallback when portal doesn't exist yet).
// CAL 010: the schedule link is no longer built from an id. A secure, expiring link
// is issued by the server (send-outbound-quote) for quotes linked to a saved quote.
export function buildCustomerNextStepsLinks(outboundQuoteId: string): {
  schedule_link: string;
  payment_link: string;
  portal_link: string;
} {
  const baseUrl = window.location.origin;
  return {
    schedule_link: `${baseUrl}/portal/schedule`,
    payment_link: `${baseUrl}/portal/pay?quote=${outboundQuoteId}`,
    portal_link: `${baseUrl}/portal/quote/${outboundQuoteId}`,
  };
}

// Get included tons string based on dumpster size
export function getIncludedTonsText(sizeYd: number): string {
  if (sizeYd <= 10) return '0.5-1.0';
  if (sizeYd <= 20) return '2.0';
  return `${Math.floor(sizeYd / 10)}.0`;
}

// Create an outbound quote record
export async function createOutboundQuote(
  input: OutboundQuoteInput,
  userId: string,
): Promise<OutboundQuoteRecord> {
  const links = buildCustomerNextStepsLinks('placeholder');

  const { data, error } = await supabase
    .from('outbound_quotes')
    .insert({
      created_by_user_id: userId,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone || null,
      customer_email: input.customer_email || null,
      address_text: input.address_text || null,
      zip: input.zip || null,
      customer_type: input.customer_type,
      material_category: input.material_category,
      size_yd: input.size_yd,
      tier: input.tier,
      customer_price: input.customer_price,
      included_days: input.included_days,
      included_tons: input.included_tons,
      overage_rule_text: input.overage_rule_text,
      same_day_flag: input.same_day_flag,
      order_id: input.order_id || null,
      quote_id: input.quote_id || null,
      payment_link: links.payment_link,
      schedule_link: links.schedule_link,
      portal_link: links.portal_link,
      status: 'DRAFT',
      quote_source: 'INTERNAL_CALCULATOR',
    } as any)
    .select('id, status, created_at, customer_price, tier')
    .single();

  if (error) throw error;

  // Update links with real quote ID
  const realLinks = buildCustomerNextStepsLinks(data.id);
  await supabase
    .from('outbound_quotes')
    .update({
      payment_link: realLinks.payment_link,
      schedule_link: null,
      portal_link: realLinks.portal_link,
    } as any)
    .eq('id', data.id);

  return data as OutboundQuoteRecord;
}

// CAL 010 — Revoke every active schedule link for a saved quote.
export async function revokeScheduleLinks(quoteId: string): Promise<number> {
  const { data, error } = await supabase.functions.invoke('quote-schedule-link', {
    body: { action: 'revoke', quote_id: quoteId },
  });
  if (error) throw error;
  return data?.revoked ?? 0;
}

export interface SendOutboundResult {
  success: boolean;
  status: string;
  error?: string;
  duplicate?: boolean;
  results?: { channel: string; status: string; error?: string; duplicate?: boolean }[];
  schedule_link_included?: boolean;
  schedule_link_expires_at?: string | null;
  schedule_link_unavailable_reason?: string | null;
}

// New key for one send attempt. Reuse the same key when retrying the same attempt
// (e.g. after a timeout) so the server never sends the message twice.
export function newSendKey(): string {
  return (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g, '');
}

// Send an outbound quote via edge function.
// CAL 011: the server checks the staff role, issues the secure schedule link itself
// (only the hash is stored) and uses idempotencyKey so a retry does not send twice.
export async function sendOutboundQuote(
  outboundQuoteId: string,
  channels: ('SMS' | 'EMAIL')[],
  opts: { idempotencyKey?: string; includeScheduleLink?: boolean } = {},
): Promise<SendOutboundResult> {
  const { data, error } = await supabase.functions.invoke('send-outbound-quote', {
    body: {
      outbound_quote_id: outboundQuoteId,
      channels,
      idempotency_key: opts.idempotencyKey,
      include_schedule_link: opts.includeScheduleLink === true,
    },
  });

  if (error) {
    let message = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === 'function') {
        const body = await ctx.json();
        if (body?.error) message = body.error;
      }
    } catch { /* keep original message */ }
    return { success: false, status: 'UNKNOWN', error: message };
  }

  return data as SendOutboundResult;
}

// Latest outbound quote created for a saved quote, if any.
export async function findOutboundForSavedQuote(quoteId: string): Promise<string | null> {
  const { data } = await supabase
    .from('outbound_quotes')
    .select('id')
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: false })
    .limit(1);
  return data && data.length > 0 ? data[0].id : null;
}

// Human summary of a send result for staff.
export function describeSendResult(r: SendOutboundResult): string {
  const parts = (r.results ?? []).map((x) => {
    const label = x.status === 'SENT' ? 'sent'
      : x.status === 'TEST_SUPPRESSED' ? 'test contact, not sent'
      : x.status === 'DRY_RUN' ? 'messaging off, not sent'
      : x.status === 'FAILED' ? `failed${x.error ? ` (${x.error})` : ''}`
      : x.status.toLowerCase();
    return `${x.channel}: ${label}${x.duplicate ? ' (already handled)' : ''}`;
  });
  const link = r.schedule_link_included
    ? ' Secure schedule link included.'
    : r.schedule_link_unavailable_reason ? ' No schedule link (customer asked to call).' : '';
  return `${parts.join(' · ')}.${link}`;
}

// Build the SMS message body for copy-to-clipboard
export function buildSmsPreview(input: {
  customer_name: string;
  customer_type: string;
  size_yd: number;
  customer_price: number;
  included_days: number;
  included_tons: string;
  overage_rule_text: string;
  material_category: string;
  schedule_link: string;
  payment_link: string;
  portal_link: string;
}): string {
  const typeLabel = input.customer_type === 'contractor' ? 'contractor quote' :
    input.customer_type === 'commercial' ? 'commercial quote' :
      `${input.size_yd} yd dumpster quote`;

  // CAL 010: only a secure, quote-specific link (?t=) may be shared; otherwise ask the customer to call.
  const schedulePart = input.schedule_link && input.schedule_link.includes('/portal/schedule?t=')
    ? `Schedule: ${input.schedule_link}`
    : 'To schedule, call (510) 680-2150.';
  let msg = `Hi ${input.customer_name}, your ${typeLabel} is $${input.customer_price} (delivery + pickup + ${input.included_days} days + ${input.included_tons}T included). Overage: ${input.overage_rule_text}. ${schedulePart} Pay: ${input.payment_link} Track: ${input.portal_link} - Calsan Dumpsters Pro`;

  if (['HEAVY', 'DEBRIS_HEAVY'].includes(input.material_category.toUpperCase())) {
    msg += '\nHeavy materials: fill-line required. If contamination is found, reclassification may apply at $165/ton.';
  }

  return msg;
}

// Get recent outbound quotes for a given ZIP/address
export async function getRecentOutboundQuotes(
  filters?: { zip?: string; customer_phone?: string },
  limit = 10,
): Promise<any[]> {
  let query = supabase
    .from('outbound_quotes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filters?.zip) query = query.eq('zip', filters.zip);
  if (filters?.customer_phone) query = query.eq('customer_phone', filters.customer_phone);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
