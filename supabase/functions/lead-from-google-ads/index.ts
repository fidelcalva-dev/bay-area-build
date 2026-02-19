// ============================================================
// Unified pipeline: do not insert leads directly; use lead-ingest.
// This function normalizes Google Ads Lead Form data and delegates.
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleAdsLeadPayload {
  lead_id?: string;
  form_id?: string;
  campaign_id?: string;
  adgroup_id?: string;
  creative_id?: string;
  gcl_id?: string;
  gclid?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  city?: string;
  postal_code?: string;
  custom_questions?: Record<string, string>;
  utm_source?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_medium?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const payload: GoogleAdsLeadPayload = await req.json();
    console.log('Google Ads lead payload:', payload);

    // Construct name
    let contactName = payload.full_name;
    if (!contactName && (payload.first_name || payload.last_name)) {
      contactName = [payload.first_name, payload.last_name].filter(Boolean).join(' ');
    }

    const gclid = payload.gclid || payload.gcl_id;

    // Delegate to lead-ingest
    const ingestResponse = await fetch(`${supabaseUrl}/functions/v1/lead-ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        source_channel: 'GOOGLE_ADS',
        source_detail: `campaign_${payload.campaign_id || 'unknown'}`,
        name: contactName ?? null,
        phone: payload.phone_number ?? null,
        email: payload.email ?? null,
        city: payload.city ?? null,
        zip: payload.postal_code ?? null,
        message: 'Google Ads Lead Form',
        consent_status: 'OPTED_IN',
        utm_source: payload.utm_source || 'google',
        utm_campaign: payload.utm_campaign || payload.campaign_id || null,
        utm_term: payload.utm_term ?? null,
        utm_medium: payload.utm_medium || 'cpc',
        gclid: gclid ?? null,
        raw_payload: {
          lead_id: payload.lead_id,
          form_id: payload.form_id,
          campaign_id: payload.campaign_id,
          adgroup_id: payload.adgroup_id,
          creative_id: payload.creative_id,
          custom_questions: payload.custom_questions,
        },
      }),
    });

    const ingestResult = await ingestResponse.json();

    if (!ingestResponse.ok) {
      console.error('lead-ingest error:', ingestResult);
      throw new Error(ingestResult.error || 'lead-ingest failed');
    }

    const leadId = ingestResult.lead_id;
    console.log('Google Ads lead ingested:', leadId);

    // Paid leads get higher urgency (supplemental)
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase
        .from('sales_leads')
        .update({ urgency_score: 75 })
        .eq('id', leadId);
    } catch (e) {
      console.error('Urgency update failed (non-critical):', e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: leadId,
        channel_key: 'GOOGLE_ADS',
        gclid: gclid,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Google Ads lead error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
