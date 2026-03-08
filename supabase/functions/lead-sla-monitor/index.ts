import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SLA Tiers (minutes)
const SLA_ALERT_MIN = 5;       // Level 1: 5-minute alert
const SLA_REMINDER_MIN = 30;   // Level 2: 30-minute reminder
const SLA_ESCALATION_MIN = 120; // Level 3: 2-hour escalation
const SLA_DORMANT_MIN = 1440;   // 24-hour auto-dormant

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
    let alerts = 0;
    let reminders = 0;
    let escalations = 0;
    let dormantCount = 0;
    let riskAlerts = 0;

    // ========================================
    // 1) Find leads with no first contact
    // ========================================
    const { data: openLeads, error } = await supabase
      .from('sales_leads')
      .select('id, created_at, owner_user_id, assigned_to, escalation_level, customer_name, lead_status, first_contact_at, first_response_at, first_response_sent_at, channel_key')
      .in('lead_status', ['new', 'contacted'])
      .is('first_contact_at', null)
      .is('first_response_at', null)
      .is('first_response_sent_at', null);

    if (error) throw error;

    for (const lead of openLeads || []) {
      const ageMin = (now.getTime() - new Date(lead.created_at).getTime()) / 60000;
      const ownerId = lead.owner_user_id || lead.assigned_to;
      const currentLevel = lead.escalation_level || 0;

      // === LEVEL 1: 5-minute alert ===
      if (ageMin >= SLA_ALERT_MIN && currentLevel < 1) {
        await supabase.from('sales_leads').update({
          escalation_level: 1,
          sla_due_at: new Date(new Date(lead.created_at).getTime() + SLA_REMINDER_MIN * 60000).toISOString(),
          last_activity_at: now.toISOString(),
        }).eq('id', lead.id);

        await supabase.from('lead_activity_log').insert({
          lead_id: lead.id,
          action_type: 'SLA_5MIN_ALERT',
          metadata: { escalation_level: 1, owner: ownerId, age_minutes: Math.round(ageMin) },
        });

        await supabase.from('lead_alerts').insert({
          lead_id: lead.id,
          alert_type: 'SLA_BREACH',
          severity: 'LOW',
          assigned_team: 'SALES',
          message: `5-min Alert: ${lead.customer_name || 'New lead'} from ${lead.channel_key || 'unknown'} awaiting response.`,
        });

        alerts++;
      }
      // === LEVEL 2: 30-minute reminder ===
      else if (ageMin >= SLA_REMINDER_MIN && currentLevel < 2) {
        await supabase.from('sales_leads').update({
          escalation_level: 2,
          sla_due_at: new Date(new Date(lead.created_at).getTime() + SLA_ESCALATION_MIN * 60000).toISOString(),
          last_activity_at: now.toISOString(),
        }).eq('id', lead.id);

        await supabase.from('lead_activity_log').insert({
          lead_id: lead.id,
          action_type: 'SLA_30MIN_REMINDER',
          metadata: { escalation_level: 2, owner: ownerId, age_minutes: Math.round(ageMin) },
        });

        await supabase.from('lead_alerts').insert({
          lead_id: lead.id,
          alert_type: 'SLA_BREACH',
          severity: 'MED',
          assigned_team: 'SALES',
          message: `30-min Reminder: ${lead.customer_name || 'Unknown'} still awaiting first contact. Respond now.`,
        });

        // Notify owner
        try {
          await supabase.rpc('enqueue_notification', {
            p_channel: 'IN_APP',
            p_target_team: 'SALES',
            p_title: '30-Min SLA Reminder',
            p_body: `Lead ${lead.customer_name || 'Unknown'} needs immediate response.`,
            p_entity_type: 'lead',
            p_entity_id: lead.id,
            p_priority: 'HIGH',
            p_mode: 'LIVE_INTERNAL',
          });
        } catch { /* optional */ }

        reminders++;
      }
      // === LEVEL 3: 2-hour escalation ===
      else if (ageMin >= SLA_ESCALATION_MIN && currentLevel < 3) {
        await supabase.from('sales_leads').update({
          escalation_level: 3,
          is_sla_breached: true,
          last_activity_at: now.toISOString(),
        }).eq('id', lead.id);

        await supabase.from('lead_activity_log').insert({
          lead_id: lead.id,
          action_type: 'SLA_2HR_ESCALATION',
          metadata: { escalation_level: 3, owner: ownerId, age_minutes: Math.round(ageMin) },
        });

        await supabase.from('lead_alerts').insert({
          lead_id: lead.id,
          alert_type: 'SLA_BREACH',
          severity: 'HIGH',
          assigned_team: 'ADMIN',
          message: `ESCALATION: Lead ${lead.customer_name || 'Unknown'} has NOT been contacted in ${Math.round(ageMin)} min. Manager action required.`,
        });

        try {
          await supabase.rpc('enqueue_notification', {
            p_channel: 'IN_APP',
            p_target_team: 'ADMIN',
            p_title: '2-Hour SLA Escalation',
            p_body: `Lead ${lead.customer_name || 'Unknown'} breached SLA — ${Math.round(ageMin)} min with no contact.`,
            p_entity_type: 'lead',
            p_entity_id: lead.id,
            p_priority: 'HIGH',
            p_mode: 'LIVE_INTERNAL',
          });
        } catch { /* optional */ }

        escalations++;
      }
    }

    // ========================================
    // 2) Auto-Dormant: leads with no activity for 24h
    // ========================================
    const dormantCutoff = new Date(now.getTime() - SLA_DORMANT_MIN * 60000).toISOString();
    const { data: staleLeads } = await supabase
      .from('sales_leads')
      .select('id, customer_name')
      .in('lead_status', ['new', 'contacted'])
      .is('first_contact_at', null)
      .is('first_response_at', null)
      .lt('created_at', dormantCutoff);

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
    // 3) High Risk alerts
    // ========================================
    const { data: riskyLeads } = await supabase
      .from('sales_leads')
      .select('id, lead_risk_score, customer_name')
      .gte('lead_risk_score', 50)
      .in('lead_status', ['new', 'contacted', 'qualified']);

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

    console.log(`SLA Monitor: ${alerts} alerts (5m), ${reminders} reminders (30m), ${escalations} escalations (2h), ${dormantCount} dormant, ${riskAlerts} risk`);

    return new Response(
      JSON.stringify({
        success: true,
        leads_checked: openLeads?.length || 0,
        alerts_5min: alerts,
        reminders_30min: reminders,
        escalations_2hr: escalations,
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
