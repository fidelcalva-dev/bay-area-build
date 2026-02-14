// Order Cart Service — CRUD + audit trail for the Order Builder
import { supabase } from '@/integrations/supabase/client';

// ── Types ──────────────────────────────────────────────
export interface CartRow {
  id: string;
  customer_id: string | null;
  lead_id: string | null;
  created_by_user_id: string;
  status: string;
  service_address_text: string | null;
  service_lat: number | null;
  service_lng: number | null;
  zip: string | null;
  customer_type: string | null;
  notes_internal: string | null;
  notes_customer: string | null;
  total_estimated: number | null;
  total_final: number | null;
  portal_token: string | null;
  converted_order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItemRow {
  id: string;
  cart_id: string;
  item_type: string;
  title: string;
  description: string | null;
  qty: number;
  unit: string;
  unit_price: number | null;
  amount: number | null;
  is_price_pending: boolean;
  pricing_source: string;
  related_size_yd: number | null;
  related_material_category: string | null;
  sort_order: number;
  created_at: string;
}

export interface CartScheduleRow {
  id: string;
  cart_item_id: string;
  schedule_type: string;
  scheduled_date: string;
  time_window: string;
  notes: string | null;
  status: string;
  created_at: string;
}

export interface ExtraCatalogRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  default_price: number | null;
  is_active: boolean;
  requires_pricing: boolean;
  display_order: number;
}

export type CartAuditAction =
  | 'CREATE_CART' | 'ADD_ITEM' | 'REMOVE_ITEM' | 'EDIT_ITEM'
  | 'ADD_SCHEDULE' | 'REMOVE_SCHEDULE' | 'EDIT_SCHEDULE'
  | 'SEND_TO_CUSTOMER' | 'CONVERT_TO_ORDER' | 'FINALIZE_PRICE'
  | 'CANCEL' | 'STATUS_CHANGE';

// ── Helpers ────────────────────────────────────────────
async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

async function logAudit(cartId: string, action: CartAuditAction, details?: Record<string, unknown>) {
  const userId = await currentUserId();
  await supabase.from('cart_audit_log').insert([{
    cart_id: cartId,
    user_id: userId,
    action,
    details_json: (details ?? null) as any,
  }]);
}

// ── Cart CRUD ──────────────────────────────────────────
export async function createCart(params: {
  customerId?: string;
  leadId?: string;
  zip?: string;
  serviceAddress?: string;
  customerType?: string;
}): Promise<CartRow> {
  const userId = await currentUserId();
  const { data, error } = await supabase.from('order_carts').insert({
    created_by_user_id: userId,
    customer_id: params.customerId ?? null,
    lead_id: params.leadId ?? null,
    zip: params.zip ?? null,
    service_address_text: params.serviceAddress ?? null,
    customer_type: params.customerType ?? null,
    status: 'DRAFT',
  }).select().single();
  if (error) throw error;
  await logAudit(data.id, 'CREATE_CART', params);
  return data as CartRow;
}

export async function fetchCart(cartId: string) {
  const { data, error } = await supabase
    .from('order_carts')
    .select('*')
    .eq('id', cartId)
    .single();
  if (error) throw error;
  return data as CartRow;
}

export async function updateCart(cartId: string, fields: Partial<Pick<CartRow, 'notes_internal' | 'notes_customer' | 'zip' | 'service_address_text' | 'customer_type' | 'customer_id' | 'status' | 'total_estimated' | 'total_final'>>) {
  const { error } = await supabase.from('order_carts').update(fields as any).eq('id', cartId);
  if (error) throw error;
}

export async function fetchMyCarts(status?: string) {
  let q = supabase.from('order_carts').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as CartRow[];
}

// ── Items CRUD ─────────────────────────────────────────
export async function addCartItem(cartId: string, item: {
  item_type: string;
  title: string;
  description?: string;
  qty?: number;
  unit?: string;
  unit_price?: number | null;
  is_price_pending?: boolean;
  pricing_source?: string;
  related_size_yd?: number | null;
  related_material_category?: string | null;
}): Promise<CartItemRow> {
  const amount = (item.qty ?? 1) * (item.unit_price ?? 0);
  const { data, error } = await supabase.from('order_cart_items').insert({
    cart_id: cartId,
    item_type: item.item_type,
    title: item.title,
    description: item.description ?? null,
    qty: item.qty ?? 1,
    unit: item.unit ?? 'each',
    unit_price: item.unit_price ?? null,
    amount: item.unit_price != null ? amount : null,
    is_price_pending: item.is_price_pending ?? (item.unit_price == null),
    pricing_source: item.pricing_source ?? (item.unit_price != null ? 'MANUAL' : 'PENDING'),
    related_size_yd: item.related_size_yd ?? null,
    related_material_category: item.related_material_category ?? null,
  }).select().single();
  if (error) throw error;
  await logAudit(cartId, 'ADD_ITEM', { itemId: data.id, title: item.title });
  await recalcCartTotals(cartId);
  return data as CartItemRow;
}

export async function removeCartItem(cartId: string, itemId: string) {
  const { error } = await supabase.from('order_cart_items').delete().eq('id', itemId);
  if (error) throw error;
  await logAudit(cartId, 'REMOVE_ITEM', { itemId });
  await recalcCartTotals(cartId);
}

export async function updateCartItem(cartId: string, itemId: string, fields: Partial<CartItemRow>) {
  const update: any = { ...fields };
  if (fields.unit_price != null && fields.qty != null) {
    update.amount = fields.unit_price * fields.qty;
    update.is_price_pending = false;
    update.pricing_source = fields.pricing_source ?? 'MANUAL';
  }
  delete update.id;
  delete update.cart_id;
  delete update.created_at;
  const { error } = await supabase.from('order_cart_items').update(update).eq('id', itemId);
  if (error) throw error;
  await logAudit(cartId, 'EDIT_ITEM', { itemId, changes: fields });
  await recalcCartTotals(cartId);
}

export async function fetchCartItems(cartId: string): Promise<CartItemRow[]> {
  const { data, error } = await supabase
    .from('order_cart_items')
    .select('*')
    .eq('cart_id', cartId)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as CartItemRow[];
}

// ── Schedules CRUD ─────────────────────────────────────
export async function addSchedule(cartId: string, itemId: string, schedule: {
  schedule_type: string;
  scheduled_date: string;
  time_window: string;
  notes?: string;
}): Promise<CartScheduleRow> {
  const { data, error } = await supabase.from('order_cart_schedules').insert({
    cart_item_id: itemId,
    schedule_type: schedule.schedule_type,
    scheduled_date: schedule.scheduled_date,
    time_window: schedule.time_window,
    notes: schedule.notes ?? null,
  }).select().single();
  if (error) throw error;
  await logAudit(cartId, 'ADD_SCHEDULE', { itemId, scheduleId: data.id });
  return data as CartScheduleRow;
}

export async function removeSchedule(cartId: string, scheduleId: string) {
  const { error } = await supabase.from('order_cart_schedules').delete().eq('id', scheduleId);
  if (error) throw error;
  await logAudit(cartId, 'REMOVE_SCHEDULE', { scheduleId });
}

export async function fetchItemSchedules(itemId: string): Promise<CartScheduleRow[]> {
  const { data, error } = await supabase
    .from('order_cart_schedules')
    .select('*')
    .eq('cart_item_id', itemId)
    .order('scheduled_date');
  if (error) throw error;
  return (data ?? []) as CartScheduleRow[];
}

// ── Extra Catalog ──────────────────────────────────────
export async function fetchExtraCatalog(): Promise<ExtraCatalogRow[]> {
  const { data, error } = await supabase
    .from('extra_catalog')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  if (error) throw error;
  return (data ?? []) as ExtraCatalogRow[];
}

// ── Totals ─────────────────────────────────────────────
async function recalcCartTotals(cartId: string) {
  const items = await fetchCartItems(cartId);
  const estimated = items.reduce((sum, i) => sum + (i.amount ?? 0), 0);
  await supabase.from('order_carts').update({ total_estimated: estimated }).eq('id', cartId);
}

// ── Audit Log ──────────────────────────────────────────
export async function fetchCartAuditLog(cartId: string) {
  const { data, error } = await supabase
    .from('cart_audit_log')
    .select('*')
    .eq('cart_id', cartId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
