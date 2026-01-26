import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleAdsLeadPayload {
  // Google Ads Lead Form fields
  lead_id?: string;
  form_id?: string;
  campaign_id?: string;
  adgroup_id?: string;
  creative_id?: string;
  gcl_id?: string;
  gclid?: string;
  
  // User data columns
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  city?: string;
  postal_code?: string;
  
  // Custom questions
  custom_questions?: Record<string, string>;
  
  // UTM parameters (if available)
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const payload: GoogleAdsLeadPayload = await req.json();
    console.log('Google Ads lead payload:', payload);

    // Construct name from parts if needed
    let contactName = payload.full_name;
    if (!contactName && (payload.first_name || payload.last_name)) {
      contactName = [payload.first_name, payload.last_name].filter(Boolean).join(' ');
    }

    // Use gclid or gcl_id
    const gclid = payload.gclid || payload.gcl_id;

    // Capture lead via omnichannel function
    const { data: leadId, error: captureError } = await supabase.rpc('capture_omnichannel_lead', {
      p_channel_key: 'GOOGLE_ADS',
      p_contact_name: contactName || null,
      p_phone: payload.phone_number || null,
      p_email: payload.email || null,
      p_city: payload.city || null,
      p_zip: payload.postal_code || null,
      p_message_excerpt: 'Google Ads Lead Form',
      p_consent_status: 'OPTED_IN', // Lead form submissions are explicit opt-in
      p_utm_source: payload.utm_source || 'google',
      p_utm_campaign: payload.utm_campaign || payload.campaign_id || null,
      p_utm_term: payload.utm_term || null,
      p_gclid: gclid || null,
      p_raw_payload: {
        lead_id: payload.lead_id,
        form_id: payload.form_id,
        campaign_id: payload.campaign_id,
        adgroup_id: payload.adgroup_id,
        creative_id: payload.creative_id,
        custom_questions: payload.custom_questions,
      },
    });

    if (captureError) {
      console.error('Error capturing Google Ads lead:', captureError);
      throw captureError;
    }

    // Update urgency score (paid traffic = higher intent)
    await supabase
      .from('sales_leads')
      .update({ urgency_score: 75 }) // Higher urgency for paid leads
      .eq('id', leadId);

    // Auto-assign
    await supabase.rpc('auto_assign_lead', { p_lead_id: leadId });

    // Enqueue AI classification
    await supabase.rpc('enqueue_ai_job', {
      p_job_type: 'CLASSIFY_LEAD',
      p_payload: { lead_id: leadId, channel_key: 'GOOGLE_ADS', is_paid: true },
      p_priority: 1, // High priority for paid leads
    });

    console.log('Google Ads lead captured:', leadId);

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
