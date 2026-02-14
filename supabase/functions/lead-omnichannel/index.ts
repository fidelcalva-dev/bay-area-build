import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Inline scoring logic
function scoreLead(input: Record<string, unknown>) {
  const FREE_DOMAINS = ['gmail.com','yahoo.com','hotmail.com','outlook.com','aol.com','icloud.com','mail.com','protonmail.com','live.com'];
  const DISPOSABLE = ['mailinator.com','guerrillamail.com','tempmail.com','throwaway.email','yopmail.com'];
  let qs = 0, rs = 0;
  const email = (input.email || input.customer_email) as string || '';
  const domain = email.split('@')[1]?.toLowerCase();
  let companyDomain: string|null = null;
  let custType = 'unknown';
  if (domain && !FREE_DOMAINS.includes(domain) && !DISPOSABLE.includes(domain)) { qs += 15; companyDomain = domain; custType = 'contractor'; }
  else if (domain && FREE_DOMAINS.includes(domain)) { qs += 5; custType = 'homeowner'; }
  if (domain && DISPOSABLE.includes(domain)) rs += 30;
  const name = (input.contact_name || input.customer_name) as string || '';
  if (name.trim().length > 2) qs += 10; else rs += 10;
  const phone = (input.phone || input.customer_phone) as string || '';
  if (phone.replace(/\D/g,'').length >= 10) qs += 10; else if (phone) rs += 20;
  if (input.address || input.city) qs += 10;
  if (input.zip) qs += 15;
  if (input.company_name) { qs += 10; if (custType === 'unknown') custType = 'contractor'; }
  const text = [input.message_excerpt].filter(Boolean).join(' ').toLowerCase();
  if (/need today|ready to book|asap|urgent|same day|tomorrow/.test(text)) qs += 15;
  if (/free|test|testing|asdf|xxx|fake/.test(text)) rs += 20;
  if (name.trim().length === 1) rs += 15;
  qs = Math.min(100, qs); rs = Math.min(100, rs);
  const label = rs >= 50 || qs < 20 ? 'RED' : rs >= 25 || qs < 40 ? 'AMBER' : 'GREEN';
  return { quality_score: qs, risk_score: rs, quality_label: label, company_domain: companyDomain, customer_type_inferred: custType };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OmnichannelLeadPayload {
  channel_key: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  company_name?: string;
  address?: string;
  city?: string;
  zip?: string;
  message_excerpt?: string;
  consent_status?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_term?: string;
  gclid?: string;
  raw_payload?: Record<string, unknown>;
  dedup_window_days?: number;
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

    const payload: OmnichannelLeadPayload = await req.json();
    console.log('Omnichannel lead payload:', payload);

    // Validate required fields
    if (!payload.channel_key) {
      return new Response(
        JSON.stringify({ error: 'channel_key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Must have at least phone or email
    if (!payload.phone && !payload.email) {
      return new Response(
        JSON.stringify({ error: 'Either phone or email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if channel is active
    const { data: channel } = await supabase
      .from('lead_channels')
      .select('is_active')
      .eq('channel_key', payload.channel_key)
      .maybeSingle();

    if (channel && !channel.is_active) {
      return new Response(
        JSON.stringify({ error: 'Channel is disabled', channel_key: payload.channel_key }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call the unified capture function
    const { data: leadId, error: captureError } = await supabase.rpc('capture_omnichannel_lead', {
      p_channel_key: payload.channel_key,
      p_contact_name: payload.contact_name || null,
      p_phone: payload.phone || null,
      p_email: payload.email || null,
      p_company_name: payload.company_name || null,
      p_address: payload.address || null,
      p_city: payload.city || null,
      p_zip: payload.zip || null,
      p_message_excerpt: payload.message_excerpt || null,
      p_consent_status: payload.consent_status || 'UNKNOWN',
      p_utm_source: payload.utm_source || null,
      p_utm_campaign: payload.utm_campaign || null,
      p_utm_term: payload.utm_term || null,
      p_gclid: payload.gclid || null,
      p_raw_payload: payload.raw_payload || {},
      p_dedup_window_days: payload.dedup_window_days || 30,
    });

    if (captureError) {
      console.error('Error capturing lead:', captureError);
      throw captureError;
    }

    console.log('Lead captured:', leadId);

    // Auto-assign the lead
    const { data: assignResult } = await supabase.rpc('auto_assign_lead', {
      p_lead_id: leadId,
    });

    console.log('Assignment result:', assignResult);

    // Enqueue AI classification job (DRY_RUN)
    const { data: jobId } = await supabase.rpc('enqueue_ai_job', {
      p_job_type: 'CLASSIFY_LEAD',
      p_payload: { lead_id: leadId, channel_key: payload.channel_key },
      p_priority: 2,
    });

    console.log('AI job enqueued:', jobId);

    // Send internal notification (LIVE_INTERNAL mode)
    const { data: lead } = await supabase
      .from('sales_leads')
      .select('assignment_type, customer_name, city')
      .eq('id', leadId)
      .single();

    // Score the lead
    const captureIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;
    const captureUserAgent = req.headers.get('user-agent') || null;
    const scoring = scoreLead(payload as unknown as Record<string, unknown>);
    
    await supabase.from('sales_leads').update({
      lead_quality_score: scoring.quality_score,
      lead_risk_score: scoring.risk_score,
      lead_quality_label: scoring.quality_label,
      company_domain: scoring.company_domain,
      capture_ip: captureIp,
      capture_user_agent: captureUserAgent,
    }).eq('id', leadId);

    // Store source metadata
    if (captureIp || captureUserAgent) {
      const ua = captureUserAgent || '';
      await supabase.from('lead_source_metadata').insert({
        lead_id: leadId,
        ip_address: captureIp,
        user_agent: captureUserAgent,
        device_type: /mobile|android|iphone/i.test(ua) ? 'mobile' : /tablet|ipad/i.test(ua) ? 'tablet' : 'desktop',
        os: /windows/i.test(ua) ? 'Windows' : /mac/i.test(ua) ? 'macOS' : /android/i.test(ua) ? 'Android' : /iphone|ipad/i.test(ua) ? 'iOS' : 'Unknown',
        browser: /chrome/i.test(ua) ? 'Chrome' : /firefox/i.test(ua) ? 'Firefox' : /safari/i.test(ua) ? 'Safari' : 'Unknown',
      });
    }

    // Log initial action
    await supabase.from('lead_actions').insert({
      lead_id: leadId,
      action_type: 'STATUS_CHANGE',
      summary: `Lead captured from ${payload.channel_key}`,
      provider: 'SYSTEM',
    });

    if (lead) {
      await supabase.rpc('enqueue_notification', {
        p_channel: 'IN_APP',
        p_target_team: lead.assignment_type === 'cs' ? 'CS' : 'SALES',
        p_title: `🆕 New Lead from ${payload.channel_key}`,
        p_body: `${lead.customer_name || 'Unknown'} ${lead.city ? '(' + lead.city + ')' : ''}`,
        p_entity_type: 'lead',
        p_entity_id: leadId,
        p_priority: 'NORMAL',
        p_mode: 'LIVE_INTERNAL',
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: leadId,
        channel_key: payload.channel_key,
        assignment: assignResult,
        ai_job_id: jobId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Omnichannel lead error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
