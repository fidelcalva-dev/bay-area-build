import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================================
// INPUT VALIDATION FUNCTIONS
// =====================================================

// Normalize phone to E.164 format
function normalizePhone(phone: string): string | null {
  if (!phone) return null;
  
  let digits = phone.replace(/\D/g, '');
  
  // Handle leading country code
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.substring(1);
  }
  
  // US phone numbers should have exactly 10 digits
  if (digits.length !== 10) {
    return null; // Invalid
  }
  
  // Validate area code (can't start with 0 or 1)
  if (digits.startsWith('0') || digits.startsWith('1')) {
    return null; // Invalid area code
  }
  
  return `+1${digits}`;
}

// Validate and sanitize name
function sanitizeName(name: string): string | null {
  if (!name) return null;
  
  // Remove HTML tags and dangerous characters
  let sanitized = name
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove potential XSS chars
    .trim();
  
  // Check length
  if (sanitized.length < 2 || sanitized.length > 100) {
    return null;
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes, accented chars)
  if (!/^[a-zA-Z\s\-'À-ÿ]+$/.test(sanitized)) {
    return null;
  }
  
  return sanitized;
}

// Validate email format
function validateEmail(email: string): string | null {
  if (!email || email.trim() === '') return undefined as any; // Optional field
  
  const trimmed = email.trim().toLowerCase();
  
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return null;
  }
  
  if (trimmed.length > 255) {
    return null;
  }
  
  return trimmed;
}

// Validate ZIP code
function validateZip(zip: string): string | null {
  if (!zip) return null;
  
  const digits = zip.replace(/\D/g, '');
  if (digits.length !== 5) {
    return null;
  }
  
  return digits;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('[save-quote] Received payload');

    // =====================================================
    // VALIDATE AND SANITIZE INPUTS
    // =====================================================
    
    // Validate required fields
    const requiredFields = ['material_type', 'estimated_min', 'estimated_max', 'user_type', 'zip_code'];
    for (const field of requiredFields) {
      if (payload[field] === undefined || payload[field] === null) {
        console.error(`[save-quote] Missing required field: ${field}`);
        return new Response(
          JSON.stringify({ success: false, error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate ZIP code
    const validatedZip = validateZip(payload.zip_code);
    if (!validatedZip) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid ZIP code format (must be 5 digits)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    payload.zip_code = validatedZip;

    // Validate and sanitize customer name if provided
    if (payload.customer_name) {
      const sanitizedName = sanitizeName(payload.customer_name);
      if (sanitizedName === null) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid name format (2-100 characters, letters only)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      payload.customer_name = sanitizedName;
    }

    // Validate and normalize phone if provided
    if (payload.customer_phone) {
      const normalizedPhone = normalizePhone(payload.customer_phone);
      if (normalizedPhone === null) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid phone number (must be 10 digits with valid area code)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      payload.customer_phone = normalizedPhone;
      console.log('[save-quote] Normalized phone:', payload.customer_phone);
    }

    // Validate email if provided
    if (payload.customer_email && payload.customer_email.trim() !== '') {
      const validatedEmail = validateEmail(payload.customer_email);
      if (validatedEmail === null) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid email format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      payload.customer_email = validatedEmail;
    } else {
      payload.customer_email = null;
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert quote using service role
    console.log('[save-quote] Inserting quote into database...');
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        customer_phone: payload.customer_phone,
        user_type: payload.user_type,
        zip_code: payload.zip_code,
        zone_id: payload.zone_id,
        size_id: payload.size_id,
        material_type: payload.material_type,
        rental_days: payload.rental_days || 7,
        extras: payload.extras,
        subtotal: payload.subtotal,
        estimated_min: payload.estimated_min,
        estimated_max: payload.estimated_max,
        discount_percent: payload.discount_percent || 0,
        selected_vendor_id: payload.selected_vendor_id,
        vendor_cost: payload.vendor_cost,
        margin: payload.margin,
        is_calsan_fulfillment: payload.is_calsan_fulfillment ?? true,
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
        yard_id: payload.yard_id,
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
        reclassified_to_mixed: payload.reclassified_to_mixed,
        original_material_type: payload.original_material_type,
        // Volume commitment discount fields
        volume_commitment_count: payload.volume_commitment_count || 0,
        volume_discount_pct: payload.volume_discount_pct || 0,
        discount_cap_applied: payload.discount_cap_applied || false,
        volume_agreement_id: payload.volume_agreement_id,
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
        quick_link_id: payload.quick_link_id,
        // Attribution tracking
        gclid: payload.gclid || null,
        utm_source: payload.utm_source || null,
        utm_campaign: payload.utm_campaign || null,
        utm_medium: payload.utm_medium || null,
        utm_term: payload.utm_term || null,
        utm_content: payload.utm_content || null,
      })
      .select('id')
      .single();

    if (quoteError) {
      console.error('[save-quote] Database insert error:', quoteError);
      return new Response(
        JSON.stringify({ success: false, error: quoteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[save-quote] Quote saved successfully:', quote.id);

    // Log quote event (best effort)
    try {
      await supabase.from('quote_events').insert({
        quote_id: quote.id,
        event_type: 'QUOTE_SAVED',
        event_data: {
          source: payload.source || 'website',
          customer_phone: payload.customer_phone,
          customer_name: payload.customer_name,
        },
      });
      console.log('[save-quote] Quote event logged');
    } catch (eventError) {
      console.error('[save-quote] Failed to log quote event (non-critical):', eventError);
    }

    // Build resume link
    const projectId = Deno.env.get('SUPABASE_URL')?.match(/https:\/\/([^.]+)/)?.[1] || '';
    const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || `https://${projectId}.supabase.co`;
    const resumeLink = `${baseUrl}/quote?resume=${quote.id}`;

    return new Response(
      JSON.stringify({
        success: true,
        quote_id: quote.id,
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
