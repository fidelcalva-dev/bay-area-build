import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClassificationResult {
  customer_type: 'homeowner' | 'contractor' | 'commercial' | 'unknown';
  project_category: string;
  urgency_score: number;
  recommended_action: 'sms' | 'call' | 'email' | 'quote';
  reasoning: string;
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

    const { lead_id } = await req.json();
    
    if (!lead_id) {
      return new Response(
        JSON.stringify({ error: 'lead_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI classifying lead:', lead_id);

    // Get lead details
    const { data: lead, error: leadError } = await supabase
      .from('sales_leads')
      .select('*')
      .eq('id', lead_id)
      .maybeSingle();

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check AI mode
    const { data: aiModeConfig } = await supabase
      .from('config_settings')
      .select('value')
      .eq('key', 'ai_mode')
      .maybeSingle();
    
    const aiMode = aiModeConfig?.value ? JSON.parse(aiModeConfig.value) : 'DRY_RUN';

    if (aiMode === 'OFF') {
      return new Response(
        JSON.stringify({ error: 'AI mode is OFF', ai_mode: aiMode }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare classification prompt
    const prompt = `Classify this dumpster rental lead:
Name: ${lead.customer_name || 'Unknown'}
Email: ${lead.customer_email || 'None'}
Phone: ${lead.customer_phone || 'None'}
Company: ${lead.company_name || 'None'}
Address: ${lead.address || 'None'}
City: ${lead.city || 'Unknown'}
ZIP: ${lead.zip || 'Unknown'}
Notes: ${lead.notes || 'None'}
Source: ${lead.source_key || lead.lead_source || 'Unknown'}

Determine:
1. Customer type (homeowner, contractor, commercial)
2. Project category (renovation, cleanout, roofing, construction, landscaping, other)
3. Urgency score (0-100)
4. Recommended next action (sms, call, email, quote)

Respond in JSON format only.`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    let classification: ClassificationResult;

    if (LOVABLE_API_KEY) {
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a lead classification assistant for a dumpster rental company. Respond only with valid JSON.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
        }),
      });

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        const content = aiResult.choices?.[0]?.message?.content || '';
        
        try {
          // Extract JSON from response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            classification = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', content);
          classification = fallbackClassification(lead);
        }
      } else {
        console.error('AI API error:', await aiResponse.text());
        classification = fallbackClassification(lead);
      }
    } else {
      classification = fallbackClassification(lead);
    }

    // Update lead with AI classification
    const { error: updateError } = await supabase
      .from('sales_leads')
      .update({
        customer_type_detected: classification.customer_type,
        project_category: classification.project_category,
        urgency_score: classification.urgency_score,
        ai_classification_json: {
          ...classification,
          classified_at: new Date().toISOString(),
          ai_mode: aiMode,
        },
      })
      .eq('id', lead_id);

    if (updateError) {
      console.error('Error updating lead:', updateError);
    }

    // Log event
    await supabase.from('lead_events').insert({
      lead_id,
      event_type: 'AI_CLASSIFIED',
      payload_json: {
        ...classification,
        ai_mode: aiMode,
      },
    });

    console.log('Lead classified:', classification);

    return new Response(
      JSON.stringify({
        success: true,
        lead_id,
        classification,
        ai_mode: aiMode,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI classification error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function fallbackClassification(lead: Record<string, unknown>): ClassificationResult {
  // Rule-based fallback classification
  let customerType: ClassificationResult['customer_type'] = 'unknown';
  let projectCategory = 'general';
  let urgencyScore = 50;
  let recommendedAction: ClassificationResult['recommended_action'] = 'call';

  const companyName = (lead.company_name as string || '').toLowerCase();
  const email = (lead.customer_email as string || '').toLowerCase();
  const notes = (lead.notes as string || '').toLowerCase();

  // Customer type detection
  if (companyName.includes('llc') || companyName.includes('inc') || 
      companyName.includes('construction') || companyName.includes('builders') ||
      companyName.includes('roofing') || companyName.includes('plumbing')) {
    customerType = 'contractor';
    urgencyScore = 70;
  } else if (email.includes('@gmail') || email.includes('@yahoo') || 
             email.includes('@hotmail') || email.includes('@icloud')) {
    customerType = 'homeowner';
    urgencyScore = 60;
  } else if (companyName) {
    customerType = 'commercial';
    urgencyScore = 65;
  }

  // Project category from notes
  if (notes.includes('roof')) projectCategory = 'roofing';
  else if (notes.includes('remodel') || notes.includes('renovation')) projectCategory = 'renovation';
  else if (notes.includes('cleanout') || notes.includes('clean out')) projectCategory = 'cleanout';
  else if (notes.includes('landscape') || notes.includes('yard')) projectCategory = 'landscaping';
  else if (notes.includes('construction') || notes.includes('build')) projectCategory = 'construction';
  else if (notes.includes('demo') || notes.includes('demolition')) projectCategory = 'demolition';

  // Recommended action based on source
  const sourceKey = lead.source_key as string || '';
  if (sourceKey === 'WEBSITE_CHAT' || sourceKey === 'WEBSITE_QUOTE') {
    recommendedAction = 'sms';
  } else if (sourceKey === 'CALL_INBOUND') {
    recommendedAction = 'call';
  }

  return {
    customer_type: customerType,
    project_category: projectCategory,
    urgency_score: urgencyScore,
    recommended_action: recommendedAction,
    reasoning: 'Rule-based classification (AI fallback)',
  };
}
