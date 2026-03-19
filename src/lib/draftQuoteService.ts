// ============================================================
// DRAFT QUOTE SERVICE — Creates/updates draft quotes progressively
// A draft quote is created when threshold is met: ZIP + material + size
// ============================================================
import { supabase } from '@/integrations/supabase/client';
import { sanitizeUuid } from '@/lib/uuidValidation';

export interface DraftQuoteData {
  zip: string;
  materialType: string;
  size: number;
  customerType?: string;
  projectType?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  zoneId?: string;
  zoneName?: string;
  cityName?: string;
  yardId?: string;
  yardName?: string;
  distanceMiles?: number;
  distanceBracket?: string;
  subtotal?: number;
  subtotalHigh?: number;
  includedTons?: number;
  isFlatFee?: boolean;
  isHeavy?: boolean;
  materialClass?: string;
  recommendedSize?: number;
  addressLine1?: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  deliveryDate?: string;
  deliveryTimeWindow?: string;
  deliveryPreference?: string;
  driverNotes?: string;
  placementType?: string;
  placementNotes?: string;
  accessFlags?: Record<string, boolean>;
  gateCode?: string;
  wantsSwap?: boolean;
}

// Minimum threshold to create a draft quote
export function meetsQuoteThreshold(data: DraftQuoteData): boolean {
  return !!(
    data.zip &&
    data.zip.length === 5 &&
    data.materialType &&
    data.size > 0
  );
}

// Session-level draft quote ID tracker (prevents duplicate creation per session)
let currentDraftQuoteId: string | null = null;
let currentDraftLeadId: string | null = null;

export function getDraftQuoteId(): string | null {
  return currentDraftQuoteId;
}

export function getDraftLeadId(): string | null {
  return currentDraftLeadId;
}

export function setDraftIds(quoteId: string | null, leadId: string | null) {
  currentDraftQuoteId = quoteId;
  currentDraftLeadId = leadId;
}

export function clearDraftIds() {
  currentDraftQuoteId = null;
  currentDraftLeadId = null;
}

/**
 * Creates or updates a draft quote in the quotes table.
 * Uses the save-quote edge function with draft_mode=true.
 * Returns the quote ID.
 */
export async function upsertDraftQuote(data: DraftQuoteData): Promise<{
  quoteId: string | null;
  leadId: string | null;
  isNew: boolean;
  error?: string;
}> {
  if (!meetsQuoteThreshold(data)) {
    return { quoteId: null, leadId: null, isNew: false, error: 'Threshold not met' };
  }

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const payload: Record<string, unknown> = {
      draft_mode: true,
      existing_quote_id: currentDraftQuoteId || null,
      user_type: data.customerType || 'homeowner',
      zip_code: data.zip,
      material_type: data.materialType,
      rental_days: 7,
      extras: [],
      subtotal: data.subtotal || 0,
      estimated_min: data.subtotal || 0,
      estimated_max: data.subtotalHigh || data.subtotal || 0,
      is_calsan_fulfillment: true,
      // Size
      user_selected_size_yards: data.size,
      recommended_size_yards: data.recommendedSize || data.size,
      // Project
      project_type: data.projectType || null,
      // Zone
      zone_id: sanitizeUuid(data.zoneId),
      // Yard
      yard_id: sanitizeUuid(data.yardId),
      yard_name: data.yardName || null,
      distance_miles: data.distanceMiles || null,
      distance_bracket: data.distanceBracket || null,
      // Location
      customer_lat: data.lat || null,
      customer_lng: data.lng || null,
      // Address
      street_address: data.addressLine1 || null,
      city: data.city || null,
      state: data.state || null,
      // Contact (may be null for early drafts)
      customer_name: data.customerName || null,
      customer_phone: data.customerPhone || null,
      customer_email: data.customerEmail || null,
      // Heavy material
      is_heavy_material: data.isHeavy || false,
      material_class: data.materialClass || null,
      // Access
      access_flags: data.accessFlags || null,
      placement_type: data.placementType || null,
      gate_code: data.gateCode || null,
      // Delivery
      delivery_date: data.deliveryDate || null,
      delivery_time_window: data.deliveryTimeWindow || null,
      preferred_delivery_window: data.deliveryPreference || null,
      driver_notes: data.driverNotes || null,
      // Source
      source: 'website',
    };

    const response = await fetch(`${supabaseUrl}/functions/v1/save-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.warn('[DraftQuote] Save failed:', result.error);
      return { quoteId: currentDraftQuoteId, leadId: currentDraftLeadId, isNew: false, error: result.error };
    }

    const isNew = !currentDraftQuoteId;
    currentDraftQuoteId = result.quote_id || currentDraftQuoteId;

    // If lead was linked
    if (result.linked_lead_id) {
      currentDraftLeadId = result.linked_lead_id;
    }

    console.log(`[DraftQuote] ${isNew ? 'Created' : 'Updated'} draft:`, currentDraftQuoteId);
    return { quoteId: currentDraftQuoteId, leadId: currentDraftLeadId, isNew };
  } catch (err) {
    console.warn('[DraftQuote] Network error:', err);
    return { quoteId: currentDraftQuoteId, leadId: currentDraftLeadId, isNew: false, error: 'Network error' };
  }
}

/**
 * Log a quote milestone to the timeline (best-effort).
 */
export async function logQuoteMilestone(
  milestone: string,
  data: {
    quoteId?: string | null;
    leadId?: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    // Log to quote_events if we have a quote ID
    if (data.quoteId) {
      await supabase.from('quote_events').insert([{
        quote_id: data.quoteId,
        event_type: milestone.toUpperCase(),
        event_data: (data.metadata || {}) as Record<string, string>,
      }]);
    }

    // Log to lead_events if we have a lead ID
    if (data.leadId) {
      await supabase.from('lead_events').insert([{
        lead_id: data.leadId,
        event_type: milestone.toUpperCase(),
        payload_json: data.metadata || {},
      }]);
    }
  } catch (err) {
    console.warn('[DraftQuote] Milestone log failed:', err);
  }
}
