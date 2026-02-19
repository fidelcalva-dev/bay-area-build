// ============================================================
// Unified pipeline: do not insert leads directly; use lead-ingest.
// This function handles manual lead entry by authenticated staff.
// ============================================================
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Validate channel key
    const manualChannels = ['YELP', 'NEXTDOOR', 'CRAIGSLIST', 'REFERRAL', 'GBP_MESSAGE', 'YOUTUBE', 'MANUAL_ENTRY', 'LEAD_PLATFORM', 'ANGI', 'THUMBTACK'];
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

    // Delegate to lead-ingest
    const ingestResponse = await fetch(`${supabaseUrl}/functions/v1/lead-ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        source_channel: payload.channel_key,
        source_detail: 'manual_entry',
        name: payload.contact_name ?? null,
        phone: payload.phone ?? null,
        email: payload.email ?? null,
        company_name: payload.company_name ?? null,
        address: payload.address ?? null,
        city: payload.city ?? null,
        zip: payload.zip ?? null,
        message: payload.message || payload.notes || null,
        project_type: payload.project_category ?? null,
        consent_status: payload.consent_status || 'UNKNOWN',
        performed_by_user_id: user.id,
        raw_payload: {
          added_by: user.id,
          added_by_email: user.email,
          notes: payload.notes,
          project_category: payload.project_category,
        },
      }),
    });

    const ingestResult = await ingestResponse.json();

    if (!ingestResponse.ok) {
      console.error('lead-ingest error:', ingestResult);
      throw new Error(ingestResult.error || 'lead-ingest failed');
    }

    const leadId = ingestResult.lead_id;
    console.log('Manual lead ingested:', leadId);

    // Supplemental: update project category + log manual entry event
    try {
      if (payload.project_category) {
        await supabase
          .from('sales_leads')
          .update({ project_category: payload.project_category })
          .eq('id', leadId);
      }

      await supabase.from('lead_events').insert({
        lead_id: leadId,
        event_type: 'MANUAL_ENTRY',
        channel_key: payload.channel_key,
        payload_json: {
          added_by: user.id,
          channel: payload.channel_key,
        },
      });
    } catch (e) {
      console.error('Supplemental update failed (non-critical):', e);
    }

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
