// ============================================================
// save-quote-session — Anonymous progressive quote session persistence
// Creates or updates quote_sessions + logs lead_source_events
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action } = body;

    // ---- UPSERT session ----
    if (!action || action === 'upsert') {
      const {
        session_token, brand_origin, service_line, source_channel, source_page,
        landing_page, referrer_url,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        gclid, fbclid, device_type, browser_name, os_name,
        // Quote progress
        zip, city, customer_type, project_type, material_type, material_class,
        heavy_group, selected_size_yd, rental_days, extras_json,
        current_step, completed_steps_json,
        // Contact (triggers lead promotion consideration)
        customer_name, customer_phone, customer_email, company_name, customer_notes,
        photos_uploaded_flag,
        // Delivery/placement
        requested_delivery_date, requested_time_window, placement_type_requested,
        placement_notes, access_notes, gate_code,
        // Session linkage
        quote_id, lead_id,
      } = body;

      if (!session_token) {
        return new Response(
          JSON.stringify({ error: 'session_token is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check for existing session
      const { data: existing } = await supabase
        .from('quote_sessions')
        .select('id, lead_id, status')
        .eq('session_token', session_token)
        .maybeSingle();

      const sessionData: Record<string, unknown> = {
        session_token,
        current_step: current_step || null,
        last_saved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Only set attribution on creation (don't overwrite)
      if (!existing) {
        Object.assign(sessionData, {
          brand_origin: brand_origin || 'CALSAN_DUMPSTERS_PRO',
          service_line: service_line || 'DUMPSTER',
          source_channel: source_channel || 'QUOTE_FLOW',
          source_page: source_page || null,
          landing_page: landing_page || null,
          referrer_url: referrer_url || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          utm_content: utm_content || null,
          utm_term: utm_term || null,
          gclid: gclid || null,
          fbclid: fbclid || null,
          device_type: device_type || null,
          browser_name: browser_name || null,
          os_name: os_name || null,
          status: 'active',
        });
      }

      // Progressive fields — always update if provided
      if (zip) sessionData.zip = zip;
      if (city) sessionData.city = city;
      if (customer_type) sessionData.customer_type = customer_type;
      if (project_type) sessionData.project_type = project_type;
      if (material_type) sessionData.material_type = material_type;
      if (material_class) sessionData.material_class = material_class;
      if (heavy_group) sessionData.heavy_group = heavy_group;
      if (selected_size_yd) sessionData.selected_size_yd = selected_size_yd;
      if (rental_days) sessionData.rental_days = rental_days;
      if (extras_json) sessionData.extras_json = extras_json;
      if (completed_steps_json) sessionData.completed_steps_json = completed_steps_json;
      if (customer_name) sessionData.customer_name = customer_name;
      if (customer_phone) sessionData.customer_phone = customer_phone;
      if (customer_email) sessionData.customer_email = customer_email;
      if (company_name) sessionData.company_name = company_name;
      if (customer_notes) sessionData.customer_notes = customer_notes;
      if (photos_uploaded_flag) sessionData.photos_uploaded_flag = true;
      if (requested_delivery_date) sessionData.requested_delivery_date = requested_delivery_date;
      if (requested_time_window) sessionData.requested_time_window = requested_time_window;
      if (placement_type_requested) sessionData.placement_type_requested = placement_type_requested;
      if (placement_notes) sessionData.placement_notes = placement_notes;
      if (access_notes) sessionData.access_notes = access_notes;
      if (gate_code) sessionData.gate_code = gate_code;
      if (quote_id) sessionData.quote_id = quote_id;
      if (lead_id) sessionData.lead_id = lead_id;

      let sessionId: string;

      if (existing) {
        const { error } = await supabase
          .from('quote_sessions')
          .update(sessionData)
          .eq('id', existing.id);
        if (error) throw error;
        sessionId = existing.id;
      } else {
        const { data: inserted, error } = await supabase
          .from('quote_sessions')
          .insert(sessionData)
          .select('id')
          .single();
        if (error) throw error;
        sessionId = inserted.id;
      }

      // Check if we should promote to lead
      let promotedLeadId = existing?.lead_id || lead_id || null;
      const hasContact = !!(customer_phone || customer_email);
      if (hasContact && !promotedLeadId) {
        try {
          const ingestResponse = await fetch(`${supabaseUrl}/functions/v1/lead-ingest`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              source_channel: source_channel || 'QUOTE_FLOW',
              source_detail: 'quote_session_promotion',
              source_page: source_page || '/quote',
              source_module: 'quote_session_tracker',
              brand: brand_origin || 'CALSAN_DUMPSTERS_PRO',
              lead_intent: 'QUOTE_REQUEST',
              name: customer_name || null,
              phone: customer_phone || null,
              email: customer_email || null,
              zip: zip || null,
              city: city || null,
              project_type: project_type || null,
              material_category: material_type || null,
              size_preference: selected_size_yd ? String(selected_size_yd) : null,
              selected_size: selected_size_yd || null,
              customer_type: customer_type || null,
              last_step_completed: current_step || null,
              consent_status: 'TRANSACTIONAL',
              utm_source: utm_source || null,
              utm_medium: utm_medium || null,
              utm_campaign: utm_campaign || null,
              utm_term: utm_term || null,
              gclid: gclid || null,
              raw_payload: {
                quote_session_id: sessionId,
                company_name: company_name || null,
                customer_notes: customer_notes || null,
              },
            }),
          });

          const ingestResult = await ingestResponse.json();
          if (ingestResponse.ok && ingestResult.lead_id) {
            promotedLeadId = ingestResult.lead_id;
            await supabase
              .from('quote_sessions')
              .update({
                lead_id: promotedLeadId,
                promoted_to_lead_at: new Date().toISOString(),
              })
              .eq('id', sessionId);
          }
        } catch (err) {
          console.error('Lead promotion failed:', err);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          session_id: sessionId,
          lead_id: promotedLeadId,
          is_new: !existing,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ---- LOG EVENT ----
    if (action === 'log_event') {
      const { session_id, lead_id: eventLeadId, event_name, event_payload } = body;

      if (!event_name) {
        return new Response(
          JSON.stringify({ error: 'event_name is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('lead_source_events')
        .insert({
          quote_session_id: session_id || null,
          lead_id: eventLeadId || null,
          event_name,
          event_payload_json: event_payload || {},
        });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ---- MARK ABANDONED ----
    if (action === 'abandon') {
      const { session_token: abandonToken } = body;
      if (abandonToken) {
        await supabase
          .from('quote_sessions')
          .update({
            status: 'abandoned',
            abandoned_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('session_token', abandonToken);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('save-quote-session error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
