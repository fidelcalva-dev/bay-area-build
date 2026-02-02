import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AnalyzeRequest {
  callId: string;
  transcriptChunk: string;
  fullTranscript?: string;
  isFinal?: boolean;
}

const SYSTEM_PROMPT = `You are an AI call coach for a dumpster rental company. Analyze the call transcript and provide real-time coaching.

BUSINESS RULES (NEVER VIOLATE):
1. Grass/Yard Waste → Debris Heavy category (no Green Halo)
2. Heavy materials (concrete, dirt, rock) → Remind about fill-line briefly
3. No discount suggestions unless customer tier is Preferred/VIP
4. Never reveal internal pricing calculations to customers

ANALYSIS OUTPUT (JSON):
{
  "intentScore": 0-100 (likelihood to book),
  "urgencyScore": 0-100 (how soon they need service),
  "churnRiskScore": 0-100 (risk of losing this customer),
  "objections": ["price", "schedule", "size", "rules", "trust", "competitor"],
  "detectedTopics": ["delivery_date", "material_type", "pricing", "sizing"],
  "competitorMentions": [],
  "nextBestAction": "ask_zip" | "confirm_size" | "quote_now" | "schedule_callback" | "address_objection",
  "suggestedResponses": [
    {"type": "short", "text": "Response for quick close"},
    {"type": "clarify", "text": "Question to gather missing info"},
    {"type": "overcome", "text": "Address detected objection"}
  ],
  "riskFlags": [],
  "detectedMaterialCategory": null,
  "detectedSizePreference": null,
  "detectedZipCode": null,
  "summaryBullets": ["Key point 1", "Key point 2", "Key point 3"]
}

Analyze the transcript and return ONLY valid JSON.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { callId, transcriptChunk, fullTranscript, isFinal } = await req.json() as AnalyzeRequest;

    if (!callId) {
      return new Response(
        JSON.stringify({ error: 'callId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if Call AI is enabled
    const { data: configData } = await supabase
      .from('config_settings')
      .select('value')
      .eq('key', 'call_ai.enabled')
      .single();

    const isEnabled = configData?.value === 'true' || configData?.value === true;
    if (!isEnabled) {
      return new Response(
        JSON.stringify({ error: 'Call AI is disabled' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get mode
    const { data: modeData } = await supabase
      .from('config_settings')
      .select('value')
      .eq('key', 'call_ai.mode')
      .single();
    const mode = (modeData?.value || 'DRY_RUN').replace(/"/g, '');

    // Get call details for context
    const { data: callData } = await supabase
      .from('call_events')
      .select(`
        *,
        contact:customers(full_name, billing_email, customer_tier)
      `)
      .eq('id', callId)
      .single();

    // Get or create transcript
    let transcript = fullTranscript || transcriptChunk || '';
    
    if (!fullTranscript && transcriptChunk) {
      // Append chunk to existing transcript
      const { data: existingTranscript } = await supabase
        .from('call_transcripts')
        .select('transcript_text')
        .eq('call_id', callId)
        .eq('status', 'LIVE')
        .single();
      
      if (existingTranscript) {
        transcript = (existingTranscript.transcript_text || '') + ' ' + transcriptChunk;
      } else {
        transcript = transcriptChunk;
      }
    }

    // Analyze with Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const customerContext = callData?.contact 
      ? `Customer: ${callData.contact.full_name}, Tier: ${callData.contact.customer_tier || 'Standard'}`
      : 'New/Unknown Customer';

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: `${customerContext}\n\nCall Direction: ${callData?.direction || 'INBOUND'}\n\nTranscript:\n${transcript}\n\nAnalyze this ${isFinal ? 'completed' : 'ongoing'} call and provide coaching insights.`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '{}';
    
    // Parse AI response
    let analysis;
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      analysis = {
        intentScore: 50,
        urgencyScore: 50,
        churnRiskScore: 30,
        objections: [],
        detectedTopics: [],
        nextBestAction: 'continue_listening',
        suggestedResponses: [],
        riskFlags: [],
        summaryBullets: []
      };
    }

    const latencyMs = Date.now() - startTime;
    const tokensUsed = aiData.usage?.total_tokens || 0;

    // Store insight
    const insightData = {
      call_id: callId,
      intent_score: analysis.intentScore || 50,
      urgency_score: analysis.urgencyScore || 50,
      churn_risk_score: analysis.churnRiskScore || 30,
      objection_tags_json: analysis.objections || [],
      detected_topics_json: analysis.detectedTopics || [],
      competitor_mentions: analysis.competitorMentions || [],
      next_best_action: analysis.nextBestAction,
      suggested_responses_json: analysis.suggestedResponses || [],
      risk_flags_json: analysis.riskFlags || [],
      detected_material_category: analysis.detectedMaterialCategory,
      detected_size_preference: analysis.detectedSizePreference,
      detected_zip_code: analysis.detectedZipCode,
      summary_bullets: analysis.summaryBullets || [],
      model_used: 'google/gemini-3-flash-preview',
      tokens_used: tokensUsed,
      latency_ms: latencyMs,
      is_final: isFinal || false,
    };

    const { data: insight, error: insightError } = await supabase
      .from('call_ai_insights')
      .insert(insightData)
      .select()
      .single();

    if (insightError) {
      console.error('Error storing insight:', insightError);
    }

    // Log event
    await supabase.from('call_ai_events').insert({
      call_id: callId,
      event_type: 'INSIGHT_UPDATE',
      payload_json: {
        insight_id: insight?.id,
        is_final: isFinal,
        mode,
        latency_ms: latencyMs,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        insight: {
          id: insight?.id,
          intentScore: analysis.intentScore,
          urgencyScore: analysis.urgencyScore,
          churnRiskScore: analysis.churnRiskScore,
          objections: analysis.objections,
          nextBestAction: analysis.nextBestAction,
          suggestedResponses: analysis.suggestedResponses,
          riskFlags: analysis.riskFlags,
          detectedMaterial: analysis.detectedMaterialCategory,
          detectedSize: analysis.detectedSizePreference,
          detectedZip: analysis.detectedZipCode,
          summaryBullets: analysis.summaryBullets,
        },
        latencyMs,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Call AI analyze error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
