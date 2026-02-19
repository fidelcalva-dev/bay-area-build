// ============================================================
// Unified pipeline: do not insert leads directly; use lead-ingest.
// This function handles Twilio SMS webhooks and delegates to lead-ingest.
// ============================================================
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      await supabase
        .from('sales_leads')
        .update({ consent_status: 'OPTED_OUT' })
        .eq('customer_phone', phone);

      await supabase.from('lead_events').insert({
        lead_id: null,
        event_type: 'OPTED_OUT',
        channel_key: 'SMS_INBOUND',
        payload_json: { phone, message: payload.Body },
      });

      console.log('Opt-out processed for:', phone);
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }

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
        source_channel: 'SMS_INBOUND',
        source_detail: 'twilio_sms',
        name: existingContact?.customer_name ?? null,
        phone: phone,
        email: existingContact?.billing_email ?? null,
        message: payload.Body.substring(0, 500),
        consent_status: 'OPTED_IN',
        raw_payload: {
          message_sid: payload.MessageSid,
          to_number: payload.To,
          full_body: payload.Body,
          existing_contact_id: existingContact?.id ?? null,
        },
      }),
    });

    const ingestResult = await ingestResponse.json();
    if (!ingestResponse.ok) {
      console.error('lead-ingest error:', ingestResult);
    } else {
      console.log('SMS lead ingested:', ingestResult.lead_id);

      // Link contact if found
      if (existingContact && ingestResult.lead_id) {
        await supabase
          .from('sales_leads')
          .update({ linked_contact_id: existingContact.id })
          .eq('id', ingestResult.lead_id);
      }
    }

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
