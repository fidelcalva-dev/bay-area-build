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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !userData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userId = userData.claims.sub as string;

    const { toNumber, orderId, contactId, purpose } = await req.json();

    if (!toNumber) {
      return new Response(JSON.stringify({ error: 'toNumber is required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get a company phone number for the purpose
    const adminSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: phoneNumber } = await adminSupabase
      .from('phone_numbers')
      .select('id, twilio_number, purpose')
      .eq('purpose', purpose || 'SALES')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (!phoneNumber) {
      return new Response(JSON.stringify({ error: 'No phone number available' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Format destination number
    const formattedTo = toNumber.startsWith('+') ? toNumber : `+1${toNumber.replace(/\D/g, '')}`;

    // Create call event record first
    const { data: callEvent, error: callError } = await adminSupabase
      .from('call_events')
      .insert({
        direction: 'OUTBOUND',
        from_number: phoneNumber.twilio_number,
        to_number: formattedTo,
        phone_number_id: phoneNumber.id,
        contact_id: contactId || null,
        order_id: orderId || null,
        assigned_user_id: userId,
        call_status: 'RINGING',
      })
      .select('id')
      .single();

    if (callError) {
      console.error('Error creating call event:', callError);
      return new Response(JSON.stringify({ error: 'Failed to create call record' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Initialize Twilio call
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      return new Response(JSON.stringify({ error: 'Twilio not configured' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/calls-status-callback`;
    
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: phoneNumber.twilio_number,
          Url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/calls-outbound-connect`,
          StatusCallback: callbackUrl,
          StatusCallbackEvent: 'initiated ringing answered completed',
          Record: 'true',
          RecordingStatusCallback: callbackUrl,
        }),
      }
    );

    if (!twilioResponse.ok) {
      const error = await twilioResponse.text();
      console.error('Twilio error:', error);
      
      // Update call status to failed
      await adminSupabase
        .from('call_events')
        .update({ call_status: 'FAILED' })
        .eq('id', callEvent.id);

      return new Response(JSON.stringify({ error: 'Failed to initiate call' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const twilioData = await twilioResponse.json();

    // Update call event with Twilio SID
    await adminSupabase
      .from('call_events')
      .update({ twilio_call_sid: twilioData.sid })
      .eq('id', callEvent.id);

    // Update agent availability
    await adminSupabase
      .from('agent_availability')
      .upsert({
        user_id: userId,
        status: 'BUSY',
        current_call_id: callEvent.id,
      }, { onConflict: 'user_id' });

    return new Response(JSON.stringify({
      success: true,
      callId: callEvent.id,
      twilioSid: twilioData.sid,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error initiating outbound call:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
