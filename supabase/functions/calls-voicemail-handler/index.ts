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

    const url = new URL(req.url);
    const callId = url.searchParams.get('callId');

    const formData = await req.formData();
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingDuration = formData.get('RecordingDuration') as string;
    const transcriptionText = formData.get('TranscriptionText') as string;

    console.log('Voicemail received:', { callId, recordingUrl, recordingDuration });

    if (!callId) {
      console.error('No callId provided');
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Thank you for your message. Goodbye.</Say>
          <Hangup/>
        </Response>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }

    // Update call event status
    await supabase
      .from('call_events')
      .update({ 
        call_status: 'VOICEMAIL',
        ended_at: new Date().toISOString(),
        duration_seconds: recordingDuration ? parseInt(recordingDuration, 10) : 0,
      })
      .eq('id', callId);

    // Create voicemail record
    if (recordingUrl) {
      await supabase.from('voicemails').insert({
        call_id: callId,
        audio_path: `${recordingUrl}.mp3`,
        transcription: transcriptionText || null,
      });

      // Create task for voicemail review
      await supabase.from('call_tasks').insert({
        call_id: callId,
        task_type: 'VOICEMAIL_REVIEW',
        priority: 2,
        notes: 'New voicemail requires review',
      });
    }

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Thank you for your message. We will get back to you as soon as possible. Goodbye.</Say>
        <Hangup/>
      </Response>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    );
  } catch (error) {
    console.error('Error handling voicemail:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Thank you. Goodbye.</Say>
        <Hangup/>
      </Response>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    );
  }
});
