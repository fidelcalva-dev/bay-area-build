// ============================================================
// Unified pipeline: do not insert leads directly; use lead-ingest.
// This function normalizes inbound phone call data and delegates
// to lead-ingest as the single source of truth.
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhoneLeadPayload {
  from_number: string;
  to_number: string;
  call_sid?: string;
  call_status?: string;
  recording_url?: string;
  recording_sid?: string;
  duration_seconds?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: PhoneLeadPayload = await req.json();
    console.log('Phone lead payload:', payload);

    if (!payload.from_number) {
      return new Response(
        JSON.stringify({ error: 'from_number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number
    const phone = payload.from_number.replace(/\D/g, '').slice(-10);

    // Lookup existing contact for enrichment
    const { data: existingContact } = await supabase
      .from('customers')
      .select('id, customer_name, billing_email')
      .eq('billing_phone', phone)
      .maybeSingle();

    // Delegate to lead-ingest
    const ingestResponse = await fetch(`${supabaseUrl}/functions/v1/lead-ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        source_channel: 'PHONE_CALL',
        source_detail: 'inbound_call',
        name: existingContact?.customer_name ?? null,
        phone: phone,
        email: existingContact?.billing_email ?? null,
        message: `Inbound call${payload.duration_seconds ? ` (${payload.duration_seconds}s)` : ''}`,
        consent_status: 'OPTED_IN',
        raw_payload: {
          call_sid: payload.call_sid,
          call_status: payload.call_status,
          recording_url: payload.recording_url,
          recording_sid: payload.recording_sid,
          duration_seconds: payload.duration_seconds,
          to_number: payload.to_number,
          existing_contact_id: existingContact?.id ?? null,
        },
      }),
    });

    const ingestResult = await ingestResponse.json();

    if (!ingestResponse.ok) {
      console.error('lead-ingest error:', ingestResult);
      throw new Error(ingestResult.error || 'lead-ingest failed');
    }

    const leadId = ingestResult.lead_id;
    console.log('Phone lead ingested:', leadId);

    // Link recording + contact (supplemental, non-blocking)
    try {
      const updates: Record<string, unknown> = {};
      if (payload.recording_sid) updates.call_recording_id = payload.recording_sid;
      if (existingContact) updates.linked_contact_id = existingContact.id;
      if (Object.keys(updates).length > 0) {
        await supabase.from('sales_leads').update(updates).eq('id', leadId);
      }
    } catch (e) {
      console.error('Supplemental update failed (non-critical):', e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: leadId,
        channel_key: 'PHONE_CALL',
        existing_contact: !!existingContact,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Phone lead error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
