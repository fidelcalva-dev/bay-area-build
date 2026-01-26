import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManualLeadPayload {
  channel_key: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  company_name?: string;
  address?: string;
  city?: string;
  zip?: string;
  message?: string;
  notes?: string;
  project_category?: string;
  consent_status?: string;
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

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: ManualLeadPayload = await req.json();
    console.log('Manual lead add payload:', payload);

    // Validate channel key (must be valid for manual entry)
    const manualChannels = ['YELP', 'NEXTDOOR', 'CRAIGSLIST', 'REFERRAL', 'GBP_MESSAGE', 'YOUTUBE'];
    if (!manualChannels.includes(payload.channel_key)) {
      return new Response(
        JSON.stringify({ error: 'Invalid channel for manual entry', allowed_channels: manualChannels }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Must have at least phone or email
    if (!payload.phone && !payload.email) {
      return new Response(
        JSON.stringify({ error: 'Either phone or email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Capture lead via omnichannel function
    const { data: leadId, error: captureError } = await supabase.rpc('capture_omnichannel_lead', {
      p_channel_key: payload.channel_key,
      p_contact_name: payload.contact_name || null,
      p_phone: payload.phone || null,
      p_email: payload.email || null,
      p_company_name: payload.company_name || null,
      p_address: payload.address || null,
      p_city: payload.city || null,
      p_zip: payload.zip || null,
      p_message_excerpt: payload.message || payload.notes || null,
      p_consent_status: payload.consent_status || 'UNKNOWN',
      p_raw_payload: {
        added_by: user.id,
        added_by_email: user.email,
        notes: payload.notes,
        project_category: payload.project_category,
      },
    });

    if (captureError) {
      console.error('Error capturing manual lead:', captureError);
      throw captureError;
    }

    // Update project category if provided
    if (payload.project_category) {
      await supabase
        .from('sales_leads')
        .update({ project_category: payload.project_category })
        .eq('id', leadId);
    }

    // Log manual entry event
    await supabase.from('lead_events').insert({
      lead_id: leadId,
      event_type: 'MANUAL_ENTRY',
      channel_key: payload.channel_key,
      payload_json: {
        added_by: user.id,
        channel: payload.channel_key,
      },
    });

    // Auto-assign
    await supabase.rpc('auto_assign_lead', { p_lead_id: leadId });

    console.log('Manual lead added:', leadId);

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: leadId,
        channel_key: payload.channel_key,
        added_by: user.email,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Manual lead error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
