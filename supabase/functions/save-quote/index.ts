import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Normalize phone to E.164 format
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return phone; // Return as-is if format is unexpected
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('[save-quote] Received payload:', JSON.stringify(payload, null, 2));

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

    // Normalize phone if present
    if (payload.customer_phone) {
      payload.customer_phone = normalizePhone(payload.customer_phone);
      console.log('[save-quote] Normalized phone:', payload.customer_phone);
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
