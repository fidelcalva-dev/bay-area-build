// ============================================================
// Unified pipeline: delegate to lead-ingest.
// This function handles website lead capture form submissions.
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadPayload {
  source_key: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  company_name?: string;
  address?: string;
  city?: string;
  zip?: string;
  notes?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_medium?: string;
  gclid?: string;
  project_category?: string;
  requested_service?: string;
  consent_status?: string;
  raw_payload?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: LeadPayload = await req.json();
    console.log('Lead capture payload:', payload);

    // Validate required fields
    if (!payload.source_key) {
      return new Response(
        JSON.stringify({ error: 'source_key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.customer_phone && !payload.customer_email) {
      return new Response(
        JSON.stringify({ error: 'Either phone or email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // Unified pipeline: delegate to lead-ingest
    // =====================================================
    const ingestResponse = await fetch(`${supabaseUrl}/functions/v1/lead-ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        source_channel: payload.source_key,
        source_detail: 'lead_capture_form',
        name: payload.customer_name ?? null,
        phone: payload.customer_phone ?? null,
        email: payload.customer_email ?? null,
        company_name: payload.company_name ?? null,
        address: payload.address ?? null,
        city: payload.city ?? null,
        zip: payload.zip ?? null,
        message: payload.notes ?? null,
        project_type: payload.project_category ?? null,
        material_category: payload.project_category ?? null,
        utm_source: payload.utm_source ?? null,
        utm_medium: payload.utm_medium ?? null,
        utm_campaign: payload.utm_campaign ?? null,
        utm_term: payload.utm_term ?? null,
        gclid: payload.gclid ?? null,
        consent_status: payload.consent_status || 'UNKNOWN',
        raw_payload: payload.raw_payload || {},
      }),
    });

    const ingestResult = await ingestResponse.json();

    if (!ingestResponse.ok) {
      console.error('lead-ingest error:', ingestResult);
      throw new Error(ingestResult.error || 'lead-ingest failed');
    }

    const leadId = ingestResult.lead_id;
    console.log('Lead captured via unified pipeline:', leadId);

    // Update supplemental fields not in lead-ingest
    if (payload.requested_service) {
      await supabase
        .from('sales_leads')
        .update({ requested_service: payload.requested_service })
        .eq('id', leadId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: leadId,
        quality: ingestResult.quality,
        routing: ingestResult.routing,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Lead capture error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
