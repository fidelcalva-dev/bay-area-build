import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Inline lead scoring
// SF Bay Area high-value ZIP codes
const HIGH_VALUE_ZIPS = [
  '94102','94103','94104','94105','94107','94108','94109','94110','94111','94112', // SF
  '94601','94602','94603','94606','94607','94608','94609','94610','94611','94612', // Oakland
  '95110','95111','95112','95113','95116','95117','95118','95119','95120','95121', // San Jose
  '94710','94702','94703','94704','94705','94709', // Berkeley
];

const PROJECT_SCORE: Record<string, number> = {
  'construction': 15, 'demolition': 15, 'renovation': 12, 'roofing': 12,
  'commercial': 15, 'concrete': 10, 'landscaping': 8, 'cleanout': 8,
  'junk_removal': 6, 'yard_waste': 5, 'residential': 5,
};

const MATERIAL_SCORE: Record<string, number> = {
  'concrete': 12, 'heavy_debris': 12, 'construction_debris': 10,
  'roofing': 10, 'mixed': 8, 'dirt': 8, 'yard_waste': 5, 'household': 5,
};

function scoreLead(input: Record<string, unknown>) {
  const FREE = ['gmail.com','yahoo.com','hotmail.com','outlook.com','aol.com','icloud.com','mail.com','protonmail.com','live.com'];
  const DISPOSABLE = ['mailinator.com','guerrillamail.com','tempmail.com','throwaway.email','yopmail.com'];
  let qs = 0, rs = 0;
  const email = (input.email || input.customer_email || '') as string;
  const domain = email.split('@')[1]?.toLowerCase();
  let companyDomain: string | null = null;
  let custType = 'unknown';
  if (domain && !FREE.includes(domain) && !DISPOSABLE.includes(domain)) { qs += 12; companyDomain = domain; custType = 'contractor'; }
  else if (domain && FREE.includes(domain)) { qs += 3; custType = 'homeowner'; }
  if (domain && DISPOSABLE.includes(domain)) rs += 30;

  const name = (input.name || input.contact_name || input.customer_name || '') as string;
  if (name.trim().length > 2) qs += 8; else rs += 10;
  const phone = (input.phone || input.customer_phone || '') as string;
  if (phone.replace(/\D/g, '').length >= 10) qs += 8; else if (phone) rs += 20;
  if (input.address || input.city) qs += 8;

  // Location scoring — high-value ZIP
  const zip = (input.zip || '') as string;
  if (zip) {
    qs += 10;
    if (HIGH_VALUE_ZIPS.includes(zip.slice(0, 5))) qs += 5;
  }

  if (input.company_name) { qs += 8; if (custType === 'unknown') custType = 'contractor'; }

  // Project type scoring
  const projectType = ((input.project_type || input.project_category || '') as string).toLowerCase().replace(/[\s-]/g, '_');
  const projectBonus = PROJECT_SCORE[projectType] || 0;
  qs += projectBonus;

  // Material scoring
  const material = ((input.material_category || input.material_type || '') as string).toLowerCase().replace(/[\s-]/g, '_');
  const materialBonus = MATERIAL_SCORE[material] || 0;
  qs += materialBonus;

  // Urgency / high-intent keywords
  const text = [input.message, input.message_excerpt].filter(Boolean).join(' ').toLowerCase();
  if (/need today|ready to book|asap|urgent|same day|tomorrow|this week|need now|schedule/.test(text)) qs += 12;
  if (/free|test|testing|asdf|xxx|fake/.test(text)) rs += 20;
  if (name.trim().length === 1) rs += 15;

  qs = Math.min(100, qs); rs = Math.min(100, rs);
  const label = rs >= 50 || qs < 20 ? 'RED' : rs >= 25 || qs < 40 ? 'AMBER' : 'GREEN';
  return { quality_score: qs, risk_score: rs, quality_label: label, company_domain: companyDomain, customer_type_inferred: custType };
}

interface IngestPayload {
  source_channel: string;
  source_detail?: string;
  name?: string;
  phone?: string;
  email?: string;
  company_name?: string;
  message?: string;
  address?: string;
  city?: string;
  zip?: string;
  customer_type?: string;
  project_type?: string;
  material_category?: string;
  size_preference?: string;
  lat?: number;
  lng?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  landing_url?: string;
  referrer_url?: string;
  consent_status?: string;
  raw_payload?: Record<string, unknown>;
  dedup_window_days?: number;
  performed_by_user_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let rawPayload: IngestPayload | null = null;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const payload: IngestPayload = await req.json();
    rawPayload = payload;
    console.log('Lead ingest payload:', JSON.stringify(payload).slice(0, 500));

    if (!payload.source_channel) {
      return new Response(
        JSON.stringify({ error: 'source_channel is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.phone && !payload.email) {
      return new Response(
        JSON.stringify({ error: 'Either phone or email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use existing capture_omnichannel_lead RPC for dedup + creation
    const { data: leadId, error: captureError } = await supabase.rpc('capture_omnichannel_lead', {
      p_channel_key: payload.source_channel,
      p_contact_name: payload.name || null,
      p_phone: payload.phone || null,
      p_email: payload.email || null,
      p_company_name: payload.company_name || null,
      p_address: payload.address || null,
      p_city: payload.city || null,
      p_zip: payload.zip || null,
      p_message_excerpt: payload.message || null,
      p_consent_status: payload.consent_status || 'UNKNOWN',
      p_utm_source: payload.utm_source || null,
      p_utm_campaign: payload.utm_campaign || null,
      p_utm_term: payload.utm_term || null,
      p_gclid: payload.gclid || null,
      p_raw_payload: payload.raw_payload || {},
      p_dedup_window_days: payload.dedup_window_days || 30,
    });

    if (captureError) {
      console.error('Capture error:', captureError);
      throw captureError;
    }

    console.log('Lead captured/deduped:', leadId);

    // Update additional fields not in the RPC
    const extraUpdates: Record<string, unknown> = {};
    if (payload.utm_medium) extraUpdates.utm_medium = payload.utm_medium;
    if (payload.utm_content) extraUpdates.utm_content = payload.utm_content;
    if (payload.landing_url) extraUpdates.landing_url = payload.landing_url;
    if (payload.referrer_url) extraUpdates.referrer_url = payload.referrer_url;
    if (payload.source_detail) extraUpdates.source_key = payload.source_detail;
    if (payload.project_type) extraUpdates.project_category = payload.project_type;
    if (payload.customer_type) extraUpdates.customer_type_detected = payload.customer_type;
    if (payload.material_category) extraUpdates.material_category = payload.material_category;
    if (payload.size_preference) extraUpdates.size_preference = payload.size_preference;
    if (payload.lat != null) extraUpdates.lat = payload.lat;
    if (payload.lng != null) extraUpdates.lng = payload.lng;

    // Score the lead
    const captureIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const captureUserAgent = req.headers.get('user-agent') || null;
    const scoring = scoreLead(payload as unknown as Record<string, unknown>);

    extraUpdates.lead_quality_score = scoring.quality_score;
    extraUpdates.lead_risk_score = scoring.risk_score;
    extraUpdates.lead_quality_label = scoring.quality_label;
    extraUpdates.company_domain = scoring.company_domain;
    if (captureIp) extraUpdates.capture_ip = captureIp;
    if (captureUserAgent) extraUpdates.capture_user_agent = captureUserAgent;
    if (scoring.customer_type_inferred !== 'unknown' && !payload.customer_type) {
      extraUpdates.customer_type_detected = scoring.customer_type_inferred;
    }

    if (Object.keys(extraUpdates).length > 0) {
      await supabase.from('sales_leads').update(extraUpdates).eq('id', leadId);
    }

    // Apply routing rules
    const { data: routeResult } = await supabase.rpc('apply_routing_rules', {
      p_lead_id: leadId,
    });
    console.log('Routing result:', routeResult);

    // Auto-assign agent
    const { data: assignResult } = await supabase.rpc('auto_assign_lead', {
      p_lead_id: leadId,
    });
    console.log('Assignment result:', assignResult);

    // === SLA AUTOPILOT: Auto-assign owner + set SLA ===
    // Check if owner was already set by routing/assignment
    const { data: currentLead } = await supabase
      .from('sales_leads')
      .select('owner_user_id, assigned_to, sla_due_at')
      .eq('id', leadId)
      .single();

    let assignedOwner = currentLead?.owner_user_id || currentLead?.assigned_to;

    if (!assignedOwner) {
      // Round-robin: find sales user with least active leads
      const { data: salesUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'sales');

      if (salesUsers && salesUsers.length > 0) {
        // Count active leads per sales user
        const userIds = salesUsers.map(u => u.user_id);
        const { data: leadCounts } = await supabase
          .from('sales_leads')
          .select('owner_user_id')
          .in('owner_user_id', userIds)
          .in('lead_status', ['new', 'contacted', 'qualified']);

        const countMap: Record<string, number> = {};
        userIds.forEach(id => { countMap[id] = 0; });
        (leadCounts || []).forEach(l => {
          if (l.owner_user_id) countMap[l.owner_user_id] = (countMap[l.owner_user_id] || 0) + 1;
        });

        // Pick user with fewest active leads
        const sorted = userIds.sort((a, b) => (countMap[a] || 0) - (countMap[b] || 0));
        assignedOwner = sorted[0];
      }

      // Fallback: try admin/manager
      if (!assignedOwner) {
        const { data: admins } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin')
          .limit(1);
        if (admins && admins.length > 0) {
          assignedOwner = admins[0].user_id;
        }
      }
    }

    // Update lead with owner and SLA
    const slaUpdates: Record<string, unknown> = {};
    if (assignedOwner) {
      slaUpdates.owner_user_id = assignedOwner;
      slaUpdates.assigned_to = assignedOwner;
      slaUpdates.assigned_at = new Date().toISOString();
    }

    if (Object.keys(slaUpdates).length > 0) {
      await supabase.from('sales_leads').update(slaUpdates).eq('id', leadId);
    }

    // Log assignment
    await supabase.from('lead_activity_log').insert({
      lead_id: leadId,
      action_type: 'AUTO_ASSIGNED',
      user_id: assignedOwner || null,
      metadata: { method: 'round_robin', channel: payload.source_channel },
    });

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
      }).then(() => {});
    }

    // Log ingest action
    await supabase.from('lead_actions').insert({
      lead_id: leadId,
      action_type: 'INGEST',
      summary: `Lead ingested from ${payload.source_channel}${payload.source_detail ? ' (' + payload.source_detail + ')' : ''}`,
      provider: 'SYSTEM',
    });

    // Enqueue AI classification if available
    try {
      await supabase.rpc('enqueue_ai_job', {
        p_job_type: 'CLASSIFY_LEAD',
        p_payload: { lead_id: leadId, channel_key: payload.source_channel },
        p_priority: 2,
      });
    } catch { /* AI job queue optional */ }

    // Send internal notification
    try {
      const { data: lead } = await supabase
        .from('sales_leads')
        .select('assignment_type, customer_name, city')
        .eq('id', leadId)
        .single();

      if (lead) {
        await supabase.rpc('enqueue_notification', {
          p_channel: 'IN_APP',
          p_target_team: lead.assignment_type === 'cs' ? 'CS' : 'SALES',
          p_title: `New Lead from ${payload.source_channel}`,
          p_body: `${lead.customer_name || 'Unknown'} ${lead.city ? '(' + lead.city + ')' : ''}`,
          p_entity_type: 'lead',
          p_entity_id: leadId,
          p_priority: 'NORMAL',
          p_mode: 'LIVE_INTERNAL',
        });
      }
    } catch { /* notification optional */ }

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: leadId,
        source_channel: payload.source_channel,
        routing: routeResult,
        assignment: assignResult,
        quality: scoring.quality_label,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Lead ingest error:', error);

    // =====================================================
    // FAILSAFE: Write to lead_fallback_queue so no lead is lost
    // =====================================================
    try {
      const fallbackSb = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      await fallbackSb.from('lead_fallback_queue').insert({
        source_channel: rawPayload?.source_channel || 'UNKNOWN',
        payload: (rawPayload || {}) as unknown as Record<string, unknown>,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
      console.log('Lead saved to fallback queue');
    } catch (fallbackErr) {
      console.error('Fallback queue write also failed:', fallbackErr);
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
