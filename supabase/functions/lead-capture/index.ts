import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Inline scoring logic for edge function context
function scoreLead(input: Record<string, unknown>) {
  const FREE_DOMAINS = ['gmail.com','yahoo.com','hotmail.com','outlook.com','aol.com','icloud.com','mail.com','protonmail.com','live.com'];
  const DISPOSABLE = ['mailinator.com','guerrillamail.com','tempmail.com','throwaway.email','yopmail.com'];
  
  let qs = 0, rs = 0;
  const email = (input.customer_email || input.email) as string || '';
  const domain = email.split('@')[1]?.toLowerCase();
  let companyDomain: string|null = null;
  let custType = 'unknown';
  
  if (domain && !FREE_DOMAINS.includes(domain) && !DISPOSABLE.includes(domain)) { qs += 15; companyDomain = domain; custType = 'contractor'; }
  else if (domain && FREE_DOMAINS.includes(domain)) { qs += 5; custType = 'homeowner'; }
  if (domain && DISPOSABLE.includes(domain)) rs += 30;
  
  const name = (input.customer_name || input.contact_name) as string || '';
  if (name.trim().length > 2) qs += 10; else rs += 10;
  
  const phone = (input.customer_phone || input.phone) as string || '';
  if (phone.replace(/\D/g,'').length >= 10) qs += 10; else if (phone) rs += 20;
  
  if (input.address || input.city) qs += 10;
  if (input.zip) qs += 15;
  if (input.project_category) qs += 10;
  if (input.company_name) { qs += 10; if (custType === 'unknown') custType = 'contractor'; }
  
  const text = [input.notes, input.message_excerpt].filter(Boolean).join(' ').toLowerCase();
  if (/need today|ready to book|asap|urgent|same day|tomorrow|this week/.test(text)) qs += 15;
  if (/free|test|testing|asdf|xxx|fake/.test(text)) rs += 20;
  if (name.trim().length === 1) rs += 15;
  
  qs = Math.min(100, qs);
  rs = Math.min(100, rs);
  const label = rs >= 50 || qs < 20 ? 'RED' : rs >= 25 || qs < 40 ? 'AMBER' : 'GREEN';
  
  return { quality_score: qs, risk_score: rs, quality_label: label, company_domain: companyDomain, customer_type_inferred: custType };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadPayload {
  source_key: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  company_name?: string;
  address?: string;
  city?: string;
  zip?: string;
  notes?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_medium?: string;
  gclid?: string;
  project_category?: string;
  requested_service?: string;
  consent_status?: string;
  raw_payload?: Record<string, unknown>;
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

    const payload: LeadPayload = await req.json();
    console.log('Lead capture payload:', payload);

    // Capture IP and User-Agent from request headers
    const captureIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') || null;
    const captureUserAgent = req.headers.get('user-agent') || null;

    // Validate required fields
    if (!payload.source_key) {
      return new Response(
        JSON.stringify({ error: 'source_key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Must have at least phone or email
    if (!payload.customer_phone && !payload.customer_email) {
      return new Response(
        JSON.stringify({ error: 'Either phone or email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get config for dedup window
    const { data: configData } = await supabase
      .from('config_settings')
      .select('value')
      .eq('key', 'dedup_window_hours')
      .maybeSingle();
    
    const dedupHours = configData?.value ? JSON.parse(configData.value) : 24;

    // Call the dedup function
    const { data: leadId, error: createError } = await supabase.rpc('create_or_update_lead', {
      p_source_key: payload.source_key,
      p_customer_name: payload.customer_name || null,
      p_customer_phone: payload.customer_phone || null,
      p_customer_email: payload.customer_email || null,
      p_company_name: payload.company_name || null,
      p_address: payload.address || null,
      p_city: payload.city || null,
      p_zip: payload.zip || null,
      p_notes: payload.notes || null,
      p_utm_source: payload.utm_source || null,
      p_utm_campaign: payload.utm_campaign || null,
      p_utm_term: payload.utm_term || null,
      p_gclid: payload.gclid || null,
      p_raw_payload: payload.raw_payload || {},
      p_dedup_hours: dedupHours,
    });

    if (createError) {
      console.error('Error creating lead:', createError);
      throw createError;
    }

    console.log('Lead created/updated:', leadId);

    // Score the lead
    const scoring = scoreLead(payload);
    await supabase.from('sales_leads').update({
      lead_quality_score: scoring.quality_score,
      lead_risk_score: scoring.risk_score,
      lead_quality_label: scoring.quality_label,
      company_domain: scoring.company_domain,
      customer_type_detected: scoring.customer_type_inferred !== 'unknown' 
        ? scoring.customer_type_inferred 
        : (payload.raw_payload as Record<string, unknown>)?.customer_type as string || null,
      landing_url: (payload.raw_payload as Record<string, unknown>)?.landing_url as string || null,
      referrer_url: (payload.raw_payload as Record<string, unknown>)?.referrer_url as string || null,
      utm_content: (payload.raw_payload as Record<string, unknown>)?.utm_content as string || null,
      capture_ip: captureIp,
      capture_user_agent: captureUserAgent,
    }).eq('id', leadId);

    // Store source metadata (staff-only table)
    if (captureIp || captureUserAgent) {
      const ua = captureUserAgent || '';
      const deviceType = /mobile|android|iphone/i.test(ua) ? 'mobile' : /tablet|ipad/i.test(ua) ? 'tablet' : 'desktop';
      const os = /windows/i.test(ua) ? 'Windows' : /mac/i.test(ua) ? 'macOS' : /linux/i.test(ua) ? 'Linux' : /android/i.test(ua) ? 'Android' : /iphone|ipad/i.test(ua) ? 'iOS' : 'Unknown';
      const browser = /chrome/i.test(ua) ? 'Chrome' : /firefox/i.test(ua) ? 'Firefox' : /safari/i.test(ua) ? 'Safari' : /edge/i.test(ua) ? 'Edge' : 'Unknown';

      await supabase.from('lead_source_metadata').insert({
        lead_id: leadId,
        ip_address: captureIp,
        user_agent: captureUserAgent,
        device_type: deviceType,
        os,
        browser,
      });
    }

    // Log initial action
    await supabase.from('lead_actions').insert({
      lead_id: leadId,
      action_type: 'STATUS_CHANGE',
      summary: `Lead captured from ${payload.source_key}`,
      provider: 'SYSTEM',
    });

    // Dispatch internal alert (best effort)
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      await fetch(`${supabaseUrl}/functions/v1/internal-alert-dispatcher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          event_type: 'LEAD_CREATED',
          entity_type: 'LEAD',
          entity_id: leadId,
          source: 'WEBSITE',
          payload: {
            customer_name: payload.customer_name,
            customer_phone: payload.customer_phone,
            customer_email: payload.customer_email,
            city: payload.city,
            zip_code: payload.zip,
            source_key: payload.source_key,
          },
        }),
      });
    } catch (alertErr) {
      console.error('Internal alert failed (non-critical):', alertErr);
    }

    // Update additional fields not in the function
    if (payload.project_category || payload.requested_service || payload.consent_status) {
      await supabase
        .from('sales_leads')
        .update({
          project_category: payload.project_category,
          requested_service: payload.requested_service || 'dumpster',
          consent_status: payload.consent_status || 'unknown',
          utm_medium: payload.utm_medium,
        })
        .eq('id', leadId);
    }

    // Classify and route the lead
    const { data: classifyResult, error: classifyError } = await supabase.rpc('classify_and_route_lead', {
      p_lead_id: leadId,
    });

    if (classifyError) {
      console.error('Error classifying lead:', classifyError);
    } else {
      console.log('Lead classified:', classifyResult);
    }

    // Check if AI first response is enabled
    const { data: aiModeConfig } = await supabase
      .from('config_settings')
      .select('value')
      .eq('key', 'ai_mode')
      .maybeSingle();
    
    const aiMode = aiModeConfig?.value ? JSON.parse(aiModeConfig.value) : 'DRY_RUN';

    const { data: autoResponseConfig } = await supabase
      .from('config_settings')
      .select('value')
      .eq('key', 'auto_first_response_enabled')
      .maybeSingle();
    
    const autoResponseEnabled = autoResponseConfig?.value === 'true' || autoResponseConfig?.value === true;

    let aiResponseQueued = false;

    // Only queue AI response if enabled and we have phone
    if (autoResponseEnabled && payload.customer_phone && aiMode !== 'OFF') {
      // Check consent for SMS
      const { data: consentConfig } = await supabase
        .from('config_settings')
        .select('value')
        .eq('key', 'consent_required_for_sms')
        .maybeSingle();
      
      const consentRequired = consentConfig?.value !== 'false';
      const canSendSms = !consentRequired || payload.consent_status === 'opted_in';

      if (canSendSms) {
        // Generate first response message
        const firstResponseMessage = generateFirstResponse(payload);

        // Queue message
        await supabase.from('message_queue').insert({
          recipient_phone: payload.customer_phone,
          recipient_email: payload.customer_email,
          channel: 'sms',
          template_key: 'lead_first_response',
          message_body: firstResponseMessage,
          status: aiMode === 'LIVE' ? 'pending' : 'dry_run',
          priority: 1,
          metadata: {
            lead_id: leadId,
            source_key: payload.source_key,
            ai_mode: aiMode,
          },
        });

        aiResponseQueued = true;

        // Log event
        await supabase.from('lead_events').insert({
          lead_id: leadId,
          event_type: aiMode === 'LIVE' ? 'FIRST_RESPONSE_QUEUED' : 'FIRST_RESPONSE_QUEUED_DRY_RUN',
          payload_json: { message: firstResponseMessage, ai_mode: aiMode },
        });

        // Update lead
        if (aiMode === 'LIVE') {
          await supabase
            .from('sales_leads')
            .update({ first_response_sent_at: new Date().toISOString() })
            .eq('id', leadId);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: leadId,
        classification: classifyResult,
        ai_response_queued: aiResponseQueued,
        ai_mode: aiMode,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Lead capture error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateFirstResponse(payload: LeadPayload): string {
  const name = payload.customer_name?.split(' ')[0] || 'there';
  const city = payload.city ? ` in ${payload.city}` : '';
  
  return `Hi ${name}! Thanks for reaching out to Calsan Dumpsters${city}. We have availability for same-day or next-day delivery. To get you a quick quote, what size dumpster are you looking for? Reply or click here to get an instant quote: https://calsandumpsterspro.com/quote

Reply STOP to opt out.`;
}
