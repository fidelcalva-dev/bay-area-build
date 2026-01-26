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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

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

    // Check if we have an existing contact
    const { data: existingContact } = await supabase
      .from('customers')
      .select('id, customer_name, billing_email')
      .eq('billing_phone', phone)
      .maybeSingle();

    // Capture lead via omnichannel function
    const { data: leadId, error: captureError } = await supabase.rpc('capture_omnichannel_lead', {
      p_channel_key: 'PHONE_CALL',
      p_contact_name: existingContact?.customer_name || null,
      p_phone: phone,
      p_email: existingContact?.billing_email || null,
      p_message_excerpt: `Inbound call${payload.duration_seconds ? ` (${payload.duration_seconds}s)` : ''}`,
      p_consent_status: 'OPTED_IN', // Caller initiated contact
      p_raw_payload: {
        call_sid: payload.call_sid,
        call_status: payload.call_status,
        recording_url: payload.recording_url,
        recording_sid: payload.recording_sid,
        duration_seconds: payload.duration_seconds,
        to_number: payload.to_number,
      },
    });

    if (captureError) {
      console.error('Error capturing phone lead:', captureError);
      throw captureError;
    }

    // Link recording to lead if available
    if (payload.recording_sid) {
      await supabase
        .from('sales_leads')
        .update({ call_recording_id: payload.recording_sid })
        .eq('id', leadId);
    }

    // Link contact if found
    if (existingContact) {
      await supabase
        .from('sales_leads')
        .update({ linked_contact_id: existingContact.id })
        .eq('id', leadId);
    }

    // Auto-assign
    await supabase.rpc('auto_assign_lead', { p_lead_id: leadId });

    console.log('Phone lead captured:', leadId);

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
