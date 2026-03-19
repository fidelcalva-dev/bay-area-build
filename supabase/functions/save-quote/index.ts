import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// =====================================================
// INPUT VALIDATION FUNCTIONS
// =====================================================

// Normalize phone to E.164 format
function normalizePhone(phone: string): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.substring(1);
  if (digits.length !== 10) return null;
  if (digits.startsWith('0') || digits.startsWith('1')) return null;
  return `+1${digits}`;
}

// Validate and sanitize name
function sanitizeName(name: string): string | null {
  if (!name) return null;
  let sanitized = name.replace(/<[^>]*>/g, '').replace(/[<>'"]/g, '').trim();
  if (sanitized.length < 2 || sanitized.length > 100) return null;
  if (!/^[a-zA-Z\s\-'À-ÿ]+$/.test(sanitized)) return null;
  return sanitized;
}

// Validate email format
function validateEmail(email: string): string | null {
  if (!email || email.trim() === '') return undefined as any;
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return null;
  if (trimmed.length > 255) return null;
  return trimmed;
}

// Validate ZIP code
function validateZip(zip: string): string | null {
  if (!zip) return null;
  const digits = zip.replace(/\D/g, '');
  if (digits.length !== 5) return null;
  return digits;
}

// UUID validation helper
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function sanitizeUuid(v: unknown): string | null {
  return typeof v === 'string' && UUID_RE.test(v) ? v : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const isDraftMode = payload.draft_mode === true;
    const existingQuoteId = sanitizeUuid(payload.existing_quote_id);

    console.log(`[save-quote] Received payload (draft_mode=${isDraftMode}, existing=${existingQuoteId || 'none'})`);

    // =====================================================
    // VALIDATE AND SANITIZE INPUTS
    // =====================================================
    
    // For draft mode, only require ZIP + material
    const requiredFields = isDraftMode
      ? ['material_type', 'user_type', 'zip_code']
      : ['material_type', 'estimated_min', 'estimated_max', 'user_type', 'zip_code'];
    for (const field of requiredFields) {
      if (payload[field] === undefined || payload[field] === null) {
        console.error(`[save-quote] Missing required field: ${field}`);
        return new Response(
          JSON.stringify({ success: false, error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const validatedZip = validateZip(payload.zip_code);
    if (!validatedZip) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid ZIP code format (must be 5 digits)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    payload.zip_code = validatedZip;

    // Validate optional fields
    if (payload.customer_name) {
      const sanitizedName = sanitizeName(payload.customer_name);
      if (sanitizedName === null) {
        // For drafts, don't reject — just skip the name
        if (!isDraftMode) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid name format (2-100 characters, letters only)' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        payload.customer_name = null;
      } else {
        payload.customer_name = sanitizedName;
      }
    }

    if (payload.customer_phone) {
      const normalizedPhone = normalizePhone(payload.customer_phone);
      if (normalizedPhone === null) {
        if (!isDraftMode) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid phone number (must be 10 digits with valid area code)' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        payload.customer_phone = null;
      } else {
        payload.customer_phone = normalizedPhone;
      }
    }

    if (payload.customer_email && payload.customer_email.trim() !== '') {
      const validatedEmail = validateEmail(payload.customer_email);
      if (validatedEmail === null) {
        if (!isDraftMode) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid email format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        payload.customer_email = null;
      } else {
        payload.customer_email = validatedEmail;
      }
    } else {
      payload.customer_email = null;
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // =====================================================
    // BUILD QUOTE DATA OBJECT
    // =====================================================
    const quoteData: Record<string, unknown> = {
      customer_name: payload.customer_name || null,
      customer_email: payload.customer_email || null,
      customer_phone: payload.customer_phone || null,
      user_type: payload.user_type,
      zip_code: payload.zip_code,
      zone_id: sanitizeUuid(payload.zone_id),
      size_id: sanitizeUuid(payload.size_id),
      material_type: payload.material_type,
      rental_days: payload.rental_days || 7,
      extras: payload.extras || [],
      subtotal: payload.subtotal || 0,
      estimated_min: payload.estimated_min || 0,
      estimated_max: payload.estimated_max || 0,
      discount_percent: payload.discount_percent || 0,
      selected_vendor_id: sanitizeUuid(payload.selected_vendor_id),
      vendor_cost: payload.vendor_cost,
      margin: payload.margin,
      is_calsan_fulfillment: payload.is_calsan_fulfillment ?? true,
      // Status: draft for draft_mode, otherwise existing behavior
      status: isDraftMode ? 'draft' : (payload.status || 'pending'),
      // Smart recommendation fields
      recommended_size_yards: payload.recommended_size_yards,
      recommendation_reason: payload.recommendation_reason,
      user_selected_size_yards: payload.user_selected_size_yards,
      project_type: payload.project_type,
      // Confidence fields
      confidence_level: payload.confidence_level,
      confidence_note: payload.confidence_note,
      // Distance-based pricing fields
      customer_lat: payload.customer_lat,
      customer_lng: payload.customer_lng,
      yard_id: sanitizeUuid(payload.yard_id),
      yard_name: payload.yard_name,
      distance_miles: payload.distance_miles,
      distance_bracket: payload.distance_bracket,
      // Truck-aware routing
      truck_distance_miles: payload.truck_distance_miles,
      truck_duration_min: payload.truck_duration_min,
      truck_duration_max: payload.truck_duration_max,
      route_polyline: payload.route_polyline,
      routing_provider: payload.routing_provider,
      route_calculated_at: payload.routing_provider ? new Date().toISOString() : undefined,
      // Pre-purchase extra tons
      pre_purchase_suggested: payload.pre_purchase_suggested,
      suggested_extra_tons: payload.suggested_extra_tons,
      extra_tons_prepurchased: payload.extra_tons_prepurchased,
      prepurchase_discount_pct: payload.prepurchase_discount_pct,
      prepurchase_rate: payload.prepurchase_rate,
      prepurchase_city_rate: payload.prepurchase_city_rate,
      // Heavy material classification
      heavy_material_class: payload.heavy_material_class,
      heavy_material_increment: payload.heavy_material_increment,
      is_trash_contaminated: payload.is_trash_contaminated,
      is_heavy_material: payload.is_heavy_material,
      material_class: payload.material_class,
      reclassified_to_mixed: payload.reclassified_to_mixed,
      original_material_type: payload.original_material_type,
      // Volume commitment discount fields
      volume_commitment_count: payload.volume_commitment_count || 0,
      volume_discount_pct: payload.volume_discount_pct || 0,
      discount_cap_applied: payload.discount_cap_applied || false,
      volume_agreement_id: sanitizeUuid(payload.volume_agreement_id),
      volume_validity_start: payload.volume_validity_start,
      volume_validity_end: payload.volume_validity_end,
      requires_discount_approval: payload.requires_discount_approval || false,
      // Green Halo pricing fields
      is_green_halo: payload.is_green_halo || false,
      green_halo_category: payload.green_halo_category,
      green_halo_dump_fee: payload.green_halo_dump_fee,
      green_halo_handling_fee: payload.green_halo_handling_fee,
      green_halo_dump_fee_per_ton: payload.green_halo_dump_fee_per_ton,
      // Quick link reference
      quick_link_id: sanitizeUuid(payload.quick_link_id),
      // Attribution tracking
      gclid: payload.gclid || null,
      utm_source: payload.utm_source || null,
      utm_campaign: payload.utm_campaign || null,
      utm_medium: payload.utm_medium || null,
      utm_term: payload.utm_term || null,
      utm_content: payload.utm_content || null,
      // Address fields
      delivery_address: payload.street_address || payload.delivery_address || null,
      // Access fields
      access_flags: payload.access_flags || null,
      placement_type: payload.placement_type || null,
      gate_code: payload.gate_code || null,
      // Delivery preferences
      delivery_date: payload.delivery_date || null,
      delivery_time_window: payload.delivery_time_window || null,
      preferred_delivery_window: payload.preferred_delivery_window || null,
      driver_notes: payload.driver_notes || null,
      // Timestamp
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    for (const key of Object.keys(quoteData)) {
      if (quoteData[key] === undefined) delete quoteData[key];
    }

    // =====================================================
    // UPSERT: Update existing or insert new
    // =====================================================
    let quoteId: string;

    if (existingQuoteId) {
      // Update existing draft quote
      console.log('[save-quote] Updating existing quote:', existingQuoteId);
      
      // Don't overwrite status if upgrading from draft to final
      if (!isDraftMode) {
        quoteData.status = 'pending';
      }

      const { data: updated, error: updateError } = await supabase
        .from('quotes')
        .update(quoteData)
        .eq('id', existingQuoteId)
        .select('id')
        .maybeSingle();

      if (updateError || !updated) {
        // Fallback: insert new if update fails (quote may have been deleted)
        console.warn('[save-quote] Update failed, inserting new:', updateError?.message);
        const { data: inserted, error: insertError } = await supabase
          .from('quotes')
          .insert(quoteData)
          .select('id')
          .single();

        if (insertError) {
          console.error('[save-quote] Insert fallback failed:', insertError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to save quote' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        quoteId = inserted.id;
      } else {
        quoteId = updated.id;
      }
    } else {
      // Insert new quote
      console.log('[save-quote] Inserting new quote...');
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert(quoteData)
        .select('id')
        .single();

      if (quoteError) {
        console.error('[save-quote] Database insert error:', quoteError);
        const userMessage = quoteError.message?.includes('uuid')
          ? 'A data formatting issue occurred. Your quote info has been preserved.'
          : 'We could not save your quote right now. Please try again or contact us.';
        return new Response(
          JSON.stringify({ success: false, error: userMessage, debug: quoteError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      quoteId = quote.id;
    }

    console.log('[save-quote] Quote saved successfully:', quoteId);

    // =====================================================
    // For draft mode, return early — no lead ingest or alerts
    // =====================================================
    if (isDraftMode) {
      // Log draft event
      try {
        await supabase.from('quote_events').insert({
          quote_id: quoteId,
          event_type: existingQuoteId ? 'DRAFT_UPDATED' : 'DRAFT_CREATED',
          event_data: {
            source: 'website',
            step: payload.step || 'unknown',
            material: payload.material_type,
            size: payload.user_selected_size_yards,
          },
        });
      } catch { /* non-critical */ }

      return new Response(
        JSON.stringify({ success: true, quote_id: quoteId }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // NON-DRAFT: Full pipeline — lead ingest + alerts
    // =====================================================
    let linkedLeadId: string | null = null;
    try {
      const leadIngestResponse = await fetch(`${supabaseUrl}/functions/v1/lead-ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          source_channel: 'WEBSITE_QUOTE',
          source_detail: 'instant_quote_v3',
          name: payload.customer_name ?? null,
          phone: payload.customer_phone ?? null,
          email: payload.customer_email ?? null,
          zip: payload.zip_code ?? null,
          city: payload.city ?? null,
          address: payload.street_address ?? payload.delivery_address ?? null,
          customer_type: payload.user_type ?? null,
          project_type: payload.project_type ?? null,
          material_category: payload.material_type ?? null,
          size_preference: payload.user_selected_size_yards
            ? `${payload.user_selected_size_yards}yd`
            : payload.recommended_size_yards
              ? `${payload.recommended_size_yards}yd`
              : null,
          selected_size: payload.user_selected_size_yards ?? payload.recommended_size_yards ?? null,
          lat: payload.customer_lat ?? null,
          lng: payload.customer_lng ?? null,
          landing_url: payload.landing_url ?? null,
          referrer_url: payload.referrer_url ?? null,
          utm_source: payload.utm_source ?? null,
          utm_medium: payload.utm_medium ?? null,
          utm_campaign: payload.utm_campaign ?? null,
          utm_term: payload.utm_term ?? null,
          utm_content: payload.utm_content ?? null,
          gclid: payload.gclid ?? null,
          consent_status: 'OPTED_IN',
          raw_payload: {
            quote_id: quoteId,
            subtotal: payload.subtotal,
            size_yards: payload.user_selected_size_yards ?? payload.recommended_size_yards ?? null,
            selected_size: payload.user_selected_size_yards ?? payload.recommended_size_yards ?? null,
            recommended_size_yd: payload.recommended_size_yards ?? null,
            selected_size_yd: payload.user_selected_size_yards ?? payload.recommended_size_yards ?? null,
            selected_size_label: payload.user_selected_size_yards
              ? `${payload.user_selected_size_yards} Yard`
              : null,
            selected_size_source: payload.user_selected_size_yards ? 'user_selected' : 'recommended',
            size_selected_at: new Date().toISOString(),
            project_type: payload.project_type ?? null,
            material_type: payload.material_type ?? null,
            source: 'save-quote',
          },
        }),
      });

      if (leadIngestResponse.ok) {
        const leadResult = await leadIngestResponse.json();
        linkedLeadId = leadResult.lead_id ?? null;
        console.log('[save-quote] Lead ingested via unified pipeline:', linkedLeadId);

        if (linkedLeadId) {
          await supabase.from('quotes').update({ linked_lead_id: linkedLeadId }).eq('id', quoteId);
          await supabase.from('sales_leads').update({ quote_id: quoteId }).eq('id', linkedLeadId);
        }
      } else {
        const errText = await leadIngestResponse.text();
        console.error('[save-quote] lead-ingest returned error (non-critical):', errText);
      }
    } catch (leadErr) {
      console.error('[save-quote] Lead ingest call failed (non-critical):', leadErr);
    }

    // Dispatch internal alert (best effort)
    try {
      await fetch(`${supabaseUrl}/functions/v1/internal-alert-dispatcher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          event_type: 'QUOTE_SAVED',
          entity_type: 'QUOTE',
          entity_id: quoteId,
          source: 'WEBSITE',
          payload: {
            customer_name: payload.customer_name,
            customer_phone: payload.customer_phone,
            customer_email: payload.customer_email,
            zip_code: payload.zip_code,
            material_type: payload.material_type,
            size_label: payload.user_selected_size_yards ? `${payload.user_selected_size_yards}` : undefined,
            subtotal: payload.subtotal,
            source_key: 'WEBSITE_QUOTE',
          },
        }),
      });
    } catch (alertErr) {
      console.error('[save-quote] Internal alert failed (non-critical):', alertErr);
    }

    // Log quote event (best effort)
    try {
      await supabase.from('quote_events').insert({
        quote_id: quoteId,
        event_type: 'QUOTE_SAVED',
        event_data: {
          source: payload.source || 'website',
          customer_phone: payload.customer_phone,
          customer_name: payload.customer_name,
        },
      });
    } catch (eventError) {
      console.error('[save-quote] Failed to log quote event (non-critical):', eventError);
    }

    // Build resume link
    const projectId = Deno.env.get('SUPABASE_URL')?.match(/https:\/\/([^.]+)/)?.[1] || '';
    const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || `https://${projectId}.supabase.co`;
    const resumeLink = `${baseUrl}/quote?resume=${quoteId}`;

    return new Response(
      JSON.stringify({
        success: true,
        quote_id: quoteId,
        linked_lead_id: linkedLeadId,
        resume_link: resumeLink,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[save-quote] Unexpected error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
