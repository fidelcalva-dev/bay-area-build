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

    const now = new Date();
    let warnings = 0;
    let escalations = 0;
    let dormantCount = 0;

    // ========================================
    // 1) Find leads past SLA with no first contact
    // ========================================
    const { data: slaLeads, error } = await supabase
      .from('sales_leads')
      .select('id, created_at, sla_due_at, owner_user_id, assigned_to, escalation_level, customer_name, lead_status, first_contact_at, first_response_at, first_response_sent_at')
      .in('lead_status', ['new', 'contacted'])
      .is('first_contact_at', null)
      .is('first_response_at', null)
      .is('first_response_sent_at', null)
      .not('sla_due_at', 'is', null)
      .lt('sla_due_at', now.toISOString());

    if (error) throw error;

    for (const lead of slaLeads || []) {
      const ownerId = lead.owner_user_id || lead.assigned_to;

      if (lead.escalation_level === 0) {
        // === LEVEL 1: SLA WARNING — notify owner ===
        await supabase.from('sales_leads').update({
          escalation_level: 1,
          last_activity_at: now.toISOString(),
        }).eq('id', lead.id);

        await supabase.from('lead_activity_log').insert({
          lead_id: lead.id,
          action_type: 'SLA_WARNING',
          metadata: { escalation_level: 1, owner: ownerId },
        });

        // Create alert for owner
        await supabase.from('lead_alerts').insert({
          lead_id: lead.id,
          alert_type: 'SLA_BREACH',
          severity: 'MED',
          assigned_team: 'SALES',
          message: `SLA Warning: No response for ${lead.customer_name || 'Unknown'}. Please contact immediately.`,
        });

        warnings++;
      } else if (lead.escalation_level === 1) {
        // === LEVEL 2: SLA ESCALATED — notify manager, mark breached ===
        await supabase.from('sales_leads').update({
          escalation_level: 2,
          is_sla_breached: true,
          last_activity_at: now.toISOString(),
        }).eq('id', lead.id);

        await supabase.from('lead_activity_log').insert({
          lead_id: lead.id,
          action_type: 'SLA_ESCALATED',
          metadata: { escalation_level: 2, owner: ownerId },
        });

        // Alert for manager/admin
        await supabase.from('lead_alerts').insert({
          lead_id: lead.id,
          alert_type: 'SLA_BREACH',
          severity: 'HIGH',
          assigned_team: 'ADMIN',
          message: `ESCALATION: Lead ${lead.customer_name || 'Unknown'} has not been contacted. SLA breached.`,
        });

        // Try to send internal notification
        try {
          await supabase.rpc('enqueue_notification', {
            p_channel: 'IN_APP',
            p_target_team: 'ADMIN',
            p_title: 'SLA Breach Escalation',
            p_body: `Lead ${lead.customer_name || 'Unknown'} has not been contacted within SLA.`,
            p_entity_type: 'lead',
            p_entity_id: lead.id,
            p_priority: 'HIGH',
            p_mode: 'LIVE_INTERNAL',
          });
        } catch { /* notification optional */ }

        escalations++;
      }
      // Level 2+ = already fully escalated, don't re-escalate
    }

    // ========================================
    // 2) Auto-Dormant: leads with no activity for 24h
    // ========================================
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const { data: staleLeads } = await supabase
      .from('sales_leads')
      .select('id, customer_name')
      .in('lead_status', ['new', 'contacted'])
      .is('first_contact_at', null)
      .is('first_response_at', null)
      .lt('created_at', twentyFourHoursAgo);

    for (const lead of staleLeads || []) {
      await supabase.from('sales_leads').update({
        lead_status: 'dormant',
        last_activity_at: now.toISOString(),
      }).eq('id', lead.id);

      await supabase.from('lead_activity_log').insert({
        lead_id: lead.id,
        action_type: 'AUTO_DORMANT',
        metadata: { reason: 'No contact within 24 hours' },
      });

      dormantCount++;
    }

    // ========================================
    // 3) High Risk alerts (existing logic preserved)
    // ========================================
    const { data: riskyLeads } = await supabase
      .from('sales_leads')
      .select('id, lead_risk_score, customer_name')
      .gte('lead_risk_score', 50)
      .in('lead_status', ['new', 'contacted', 'qualified']);

    let riskAlerts = 0;
    for (const lead of riskyLeads || []) {
      const { data: existingRisk } = await supabase
        .from('lead_alerts')
        .select('id')
        .eq('lead_id', lead.id)
        .eq('alert_type', 'HIGH_RISK')
        .eq('is_resolved', false)
        .maybeSingle();

      if (!existingRisk) {
        await supabase.from('lead_alerts').insert({
          lead_id: lead.id,
          alert_type: 'HIGH_RISK',
          severity: 'HIGH',
          assigned_team: 'SALES',
          message: `Risk score: ${lead.lead_risk_score}/100 for ${lead.customer_name || 'Unknown'}`,
        });
        riskAlerts++;
      }
    }

    console.log(`SLA Monitor: ${warnings} warnings, ${escalations} escalations, ${dormantCount} dormant, ${riskAlerts} risk alerts`);

    return new Response(
      JSON.stringify({
        success: true,
        leads_checked: (slaLeads?.length || 0),
        warnings,
        escalations,
        dormant: dormantCount,
        risk_alerts: riskAlerts,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('SLA Monitor error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
