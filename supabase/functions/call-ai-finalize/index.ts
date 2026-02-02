import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface FinalizeRequest {
  callId: string;
}

const SUMMARY_PROMPT = `You are an AI assistant for a dumpster rental company. Generate a post-call summary and follow-up messages.

Based on the call transcript and insights, generate:
1. A 3-bullet summary of the call
2. Recommended next action
3. SMS follow-up draft (under 160 chars, professional, no emojis)
4. Email follow-up draft (subject + body, professional)

RULES:
- Never include internal pricing details
- If heavy materials mentioned, remind about fill-line compliance
- If yard waste, it's Debris Heavy category
- Be concise and actionable

Return JSON:
{
  "summaryBullets": ["Bullet 1", "Bullet 2", "Bullet 3"],
  "nextAction": "create_quote" | "schedule_callback" | "send_followup" | "no_action",
  "smsFollowup": "Brief professional SMS text",
  "emailFollowup": {
    "subject": "Email subject line",
    "body": "Email body text"
  }
}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { callId } = await req.json() as FinalizeRequest;

    if (!callId) {
      return new Response(
        JSON.stringify({ error: 'callId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if enabled
    const { data: configData } = await supabase
      .from('config_settings')
      .select('value')
      .eq('key', 'call_ai.enabled')
      .single();

    if (configData?.value !== 'true' && configData?.value !== true) {
      return new Response(
        JSON.stringify({ error: 'Call AI is disabled' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get call details
    const { data: callData } = await supabase
      .from('call_events')
      .select(`
        *,
        contact:customers(full_name, billing_email, billing_phone)
      `)
      .eq('id', callId)
      .single();

    if (!callData) {
      return new Response(
        JSON.stringify({ error: 'Call not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get transcript
    const { data: transcriptData } = await supabase
      .from('call_transcripts')
      .select('*')
      .eq('call_id', callId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Finalize transcript
    if (transcriptData && transcriptData.status === 'LIVE') {
      await supabase
        .from('call_transcripts')
        .update({ status: 'FINAL' })
        .eq('id', transcriptData.id);
    }

    // Get latest insights
    const { data: insightData } = await supabase
      .from('call_ai_insights')
      .select('*')
      .eq('call_id', callId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const transcript = transcriptData?.transcript_text || '';
    const customerName = callData.contact?.full_name || callData.caller_name || 'Customer';

    // Generate final summary with AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const contextInfo = `
Customer: ${customerName}
Call Direction: ${callData.direction}
Duration: ${callData.duration_seconds || 0} seconds
Intent Score: ${insightData?.intent_score || 'N/A'}
Urgency Score: ${insightData?.urgency_score || 'N/A'}
Detected Objections: ${JSON.stringify(insightData?.objection_tags_json || [])}
Detected Material: ${insightData?.detected_material_category || 'N/A'}
`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SUMMARY_PROMPT },
          { 
            role: 'user', 
            content: `${contextInfo}\n\nTranscript:\n${transcript}\n\nGenerate the post-call summary and follow-up messages.`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '{}';

    let summary;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      summary = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
      console.error('Failed to parse summary:', e);
      summary = {
        summaryBullets: ['Call completed', 'Follow-up recommended', 'Review transcript for details'],
        nextAction: 'send_followup',
        smsFollowup: `Hi ${customerName}, thanks for calling! Let us know if you have questions.`,
        emailFollowup: {
          subject: 'Thank you for calling Bay Area Build',
          body: `Hi ${customerName},\n\nThank you for reaching out to us today. We appreciate the opportunity to assist you.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nBay Area Build Team`
        }
      };
    }

    // Update insight with final summary
    if (insightData) {
      await supabase
        .from('call_ai_insights')
        .update({
          summary_bullets: summary.summaryBullets || [],
          next_best_action: summary.nextAction,
          is_final: true,
        })
        .eq('id', insightData.id);
    } else {
      // Create final insight if none exists
      await supabase.from('call_ai_insights').insert({
        call_id: callId,
        summary_bullets: summary.summaryBullets || [],
        next_best_action: summary.nextAction,
        is_final: true,
        model_used: 'google/gemini-3-flash-preview',
      });
    }

    // Create follow-up drafts
    const followups = [];

    if (summary.smsFollowup) {
      const { data: smsFollowup } = await supabase
        .from('call_followups')
        .insert({
          call_id: callId,
          channel: 'SMS',
          draft_body: summary.smsFollowup,
          status: 'DRAFT',
        })
        .select()
        .single();
      if (smsFollowup) followups.push(smsFollowup);
    }

    if (summary.emailFollowup) {
      const { data: emailFollowup } = await supabase
        .from('call_followups')
        .insert({
          call_id: callId,
          channel: 'EMAIL',
          subject: summary.emailFollowup.subject,
          draft_body: summary.emailFollowup.body,
          status: 'DRAFT',
        })
        .select()
        .single();
      if (emailFollowup) followups.push(emailFollowup);
    }

    // Log finalization event
    await supabase.from('call_ai_events').insert({
      call_id: callId,
      event_type: 'INSIGHT_UPDATE',
      payload_json: {
        action: 'finalized',
        summary_bullets: summary.summaryBullets,
        next_action: summary.nextAction,
        followups_created: followups.length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          bullets: summary.summaryBullets,
          nextAction: summary.nextAction,
        },
        followups,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Call AI finalize error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
