import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmsLeadPayload {
  From: string;
  To: string;
  Body: string;
  MessageSid?: string;
  AccountSid?: string;
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

    // Parse form data (Twilio sends form-urlencoded)
    let payload: SmsLeadPayload;
    
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      payload = {
        From: formData.get('From') as string || '',
        To: formData.get('To') as string || '',
        Body: formData.get('Body') as string || '',
        MessageSid: formData.get('MessageSid') as string,
        AccountSid: formData.get('AccountSid') as string,
      };
    } else {
      payload = await req.json();
    }

    console.log('SMS lead payload:', payload);

    if (!payload.From || !payload.Body) {
      return new Response(
        JSON.stringify({ error: 'From and Body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number
    const phone = payload.From.replace(/\D/g, '').slice(-10);

    // Check for opt-out keywords
    const optOutKeywords = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'QUIT', 'END'];
    const messageUpper = payload.Body.trim().toUpperCase();
    const isOptOut = optOutKeywords.includes(messageUpper);

    if (isOptOut) {
      // Update consent status for this lead
      await supabase
        .from('sales_leads')
        .update({ consent_status: 'OPTED_OUT' })
        .eq('customer_phone', phone);

      // Log opt-out event
      await supabase.from('lead_events').insert({
        lead_id: null,
        event_type: 'OPTED_OUT',
        channel_key: 'SMS_INBOUND',
        payload_json: { phone, message: payload.Body },
      });

      console.log('Opt-out processed for:', phone);

      // Return TwiML empty response
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }

    // Check if we have an existing contact
    const { data: existingContact } = await supabase
      .from('customers')
      .select('id, customer_name, billing_email')
      .eq('billing_phone', phone)
      .maybeSingle();

    // Capture lead via omnichannel function
    const { data: leadId, error: captureError } = await supabase.rpc('capture_omnichannel_lead', {
      p_channel_key: 'SMS_INBOUND',
      p_contact_name: existingContact?.customer_name || null,
      p_phone: phone,
      p_email: existingContact?.billing_email || null,
      p_message_excerpt: payload.Body.substring(0, 500),
      p_consent_status: 'OPTED_IN', // Sender initiated contact
      p_raw_payload: {
        message_sid: payload.MessageSid,
        to_number: payload.To,
        full_body: payload.Body,
      },
    });

    if (captureError) {
      console.error('Error capturing SMS lead:', captureError);
      throw captureError;
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

    console.log('SMS lead captured:', leadId);

    // Return TwiML acknowledgment (no auto-reply - DRY_RUN mode)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    );
  } catch (error) {
    console.error('SMS lead error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
