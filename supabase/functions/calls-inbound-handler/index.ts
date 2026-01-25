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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Parse Twilio webhook (form-urlencoded)
    const formData = await req.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const callStatus = formData.get('CallStatus') as string;
    const callerName = formData.get('CallerName') as string || '';

    console.log('Inbound call received:', { callSid, from, to, callStatus });

    // Find the phone number and its purpose
    const { data: phoneNumber } = await supabase
      .from('phone_numbers')
      .select('id, purpose, market_code')
      .eq('twilio_number', to)
      .eq('is_active', true)
      .maybeSingle();

    if (!phoneNumber) {
      console.error('Phone number not found:', to);
      // Return TwiML to reject the call
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>We're sorry, this number is not in service.</Say>
          <Hangup/>
        </Response>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }

    // Look up contact by phone number
    const cleanPhone = from.replace(/\D/g, '').slice(-10);
    const { data: contact } = await supabase
      .from('customers')
      .select('id, full_name, billing_email')
      .eq('billing_phone', cleanPhone)
      .maybeSingle();

    // Find available agent using the database function
    const { data: agentId } = await supabase.rpc('find_available_agent', {
      p_purpose: phoneNumber.purpose
    });

    // Create call event record
    const { data: callEvent, error: callError } = await supabase
      .from('call_events')
      .insert({
        twilio_call_sid: callSid,
        direction: 'INBOUND',
        from_number: from,
        to_number: to,
        phone_number_id: phoneNumber.id,
        contact_id: contact?.id || null,
        assigned_user_id: agentId || null,
        call_status: 'RINGING',
        caller_name: callerName || contact?.full_name || null,
      })
      .select('id')
      .single();

    if (callError) {
      console.error('Error creating call event:', callError);
    }

    // Create call assignment if agent found
    if (agentId && callEvent) {
      await supabase.from('call_assignments').insert({
        call_id: callEvent.id,
        user_id: agentId,
        role: phoneNumber.purpose,
      });

      // Update agent status to BUSY
      await supabase
        .from('agent_availability')
        .update({ 
          status: 'BUSY', 
          current_call_id: callEvent.id 
        })
        .eq('user_id', agentId);
    }

    // Generate TwiML response
    const recordingDisclaimer = 'This call may be recorded for quality and training purposes.';
    
    let twiml: string;
    
    if (agentId) {
      // Route to agent - in production, this would dial the agent's SIP endpoint or phone
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>${recordingDisclaimer}</Say>
          <Say>Please hold while we connect you to an agent.</Say>
          <Play>https://api.twilio.com/cowbell.mp3</Play>
          <Pause length="30"/>
          <Say>We're sorry, all agents are busy. Please leave a message after the beep.</Say>
          <Record 
            maxLength="120" 
            action="${Deno.env.get('SUPABASE_URL')}/functions/v1/calls-voicemail-handler?callId=${callEvent?.id}"
            transcribe="true"
            transcribeCallback="${Deno.env.get('SUPABASE_URL')}/functions/v1/calls-transcription-handler"
          />
        </Response>`;
    } else {
      // No agent available - go to voicemail
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>${recordingDisclaimer}</Say>
          <Say>Thank you for calling. All of our representatives are currently assisting other customers. Please leave your name, phone number, and a brief message, and we will return your call as soon as possible.</Say>
          <Record 
            maxLength="120" 
            action="${Deno.env.get('SUPABASE_URL')}/functions/v1/calls-voicemail-handler?callId=${callEvent?.id}"
            transcribe="true"
            transcribeCallback="${Deno.env.get('SUPABASE_URL')}/functions/v1/calls-transcription-handler"
          />
        </Response>`;

      // Create a callback task for missed call
      if (callEvent) {
        await supabase.from('call_tasks').insert({
          call_id: callEvent.id,
          task_type: 'CALLBACK',
          priority: 2,
          scheduled_for: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
          notes: `Missed inbound call from ${from}`,
        });
      }
    }

    return new Response(twiml, {
      headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Error handling inbound call:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>We're experiencing technical difficulties. Please try again later.</Say>
        <Hangup/>
      </Response>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    );
  }
});
