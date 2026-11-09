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
// is issued by the server (ensureSecureScheduleLink) for quotes linked to a saved quote.
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

// CAL 010 — Issue (once) a secure schedule link for an outbound quote that is linked
// to a saved quote. The server checks the staff member's role, stores only a hash of
// the token, and the link expires after 7 days. Returns null when no link can be issued
// (e.g. the outbound quote has no saved quote); the message then asks the customer to call.
export async function ensureSecureScheduleLink(outboundQuoteId: string): Promise<string | null> {
  const { data: row } = await supabase
    .from('outbound_quotes')
    .select('schedule_link, quote_id')
    .eq('id', outboundQuoteId)
    .maybeSingle();
  const current = (row as { schedule_link?: string | null } | null)?.schedule_link;
  if (current && current.includes('/portal/schedule?t=')) return current;
  if (!(row as { quote_id?: string | null } | null)?.quote_id) {
    if (current) await supabase.from('outbound_quotes').update({ schedule_link: null } as any).eq('id', outboundQuoteId);
    return null;
  }
  const { data, error } = await supabase.functions.invoke('quote-schedule-link', {
    body: { action: 'issue', outbound_quote_id: outboundQuoteId },
  });
  if (error || !data?.path) {
    console.error('[outboundQuote] secure schedule link not issued', error || data);
    return null;
  }
  const url = `${window.location.origin}${data.path}`;
  await supabase.from('outbound_quotes').update({ schedule_link: url } as any).eq('id', outboundQuoteId);
  return url;
}

// CAL 010 — Revoke every active schedule link for a saved quote.
export async function revokeScheduleLinks(quoteId: string): Promise<number> {
  const { data, error } = await supabase.functions.invoke('quote-schedule-link', {
    body: { action: 'revoke', quote_id: quoteId },
  });
  if (error) throw error;
  return data?.revoked ?? 0;
}

// Send an outbound quote via edge function
export async function sendOutboundQuote(
  outboundQuoteId: string,
  channels: ('SMS' | 'EMAIL')[],
): Promise<{ success: boolean; status: string; error?: string }> {
  await ensureSecureScheduleLink(outboundQuoteId);
  const { data, error } = await supabase.functions.invoke('send-outbound-quote', {
    body: { outbound_quote_id: outboundQuoteId, channels },
  });

  if (error) {
    return { success: false, status: 'FAILED', error: error.message };
  }

  return data;
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

  let msg = `Hi ${input.customer_name}, your ${typeLabel} is $${input.customer_price} (delivery + pickup + ${input.included_days} days + ${input.included_tons}T included). Overage: ${input.overage_rule_text}. Schedule: ${input.schedule_link} Pay: ${input.payment_link} Track: ${input.portal_link} - Calsan Dumpsters Pro`;

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
