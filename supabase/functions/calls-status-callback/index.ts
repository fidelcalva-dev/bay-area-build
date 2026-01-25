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

    const formData = await req.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const callDuration = formData.get('CallDuration') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingSid = formData.get('RecordingSid') as string;

    console.log('Call status callback:', { callSid, callStatus, callDuration, recordingUrl });

    // Map Twilio status to our enum
    const statusMap: Record<string, string> = {
      'queued': 'RINGING',
      'ringing': 'RINGING',
      'in-progress': 'ANSWERED',
      'completed': 'COMPLETED',
      'busy': 'MISSED',
      'failed': 'FAILED',
      'no-answer': 'MISSED',
      'canceled': 'MISSED',
    };

    const mappedStatus = statusMap[callStatus] || 'COMPLETED';

    // Find the call event
    const { data: callEvent } = await supabase
      .from('call_events')
      .select('id, assigned_user_id, direction')
      .eq('twilio_call_sid', callSid)
      .maybeSingle();

    if (!callEvent) {
      console.error('Call event not found for SID:', callSid);
      return new Response('OK', { headers: corsHeaders });
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      call_status: mappedStatus,
    };

    if (callStatus === 'in-progress') {
      updateData.answered_at = new Date().toISOString();
    }

    if (callStatus === 'completed' || callStatus === 'busy' || callStatus === 'failed' || callStatus === 'no-answer' || callStatus === 'canceled') {
      updateData.ended_at = new Date().toISOString();
      if (callDuration) {
        updateData.duration_seconds = parseInt(callDuration, 10);
      }
    }

    if (recordingUrl) {
      // Secure recording URL with authentication
      const secureRecordingUrl = `${recordingUrl}.mp3`;
      updateData.recording_url = secureRecordingUrl;
      updateData.recording_sid = recordingSid;
    }

    // Update call event
    await supabase
      .from('call_events')
      .update(updateData)
      .eq('id', callEvent.id);

    // If call ended, update agent availability
    if (['completed', 'busy', 'failed', 'no-answer', 'canceled'].includes(callStatus)) {
      if (callEvent.assigned_user_id) {
        // Get current calls_today and increment
        const { data: currentAvail } = await supabase
          .from('agent_availability')
          .select('calls_today')
          .eq('user_id', callEvent.assigned_user_id)
          .maybeSingle();

        await supabase
          .from('agent_availability')
          .update({
            status: 'ONLINE',
            current_call_id: null,
            last_call_ended_at: new Date().toISOString(),
            calls_today: (currentAvail?.calls_today || 0) + 1,
          })
          .eq('user_id', callEvent.assigned_user_id);

        // Update call assignment
        await supabase
          .from('call_assignments')
          .update({ ended_at: new Date().toISOString() })
          .eq('call_id', callEvent.id)
          .eq('user_id', callEvent.assigned_user_id);
      }

      // Create follow-up task for missed calls
      if (mappedStatus === 'MISSED' && callEvent.direction === 'INBOUND') {
        await supabase.from('call_tasks').insert({
          call_id: callEvent.id,
          task_type: 'CALLBACK',
          priority: 2,
          scheduled_for: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          notes: 'Missed inbound call - requires callback',
        });
      }
    }

    return new Response('OK', { headers: corsHeaders });
  } catch (error) {
    console.error('Error handling status callback:', error);
    return new Response('OK', { headers: corsHeaders });
  }
});
