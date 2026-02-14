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

    // Get SLA rules
    const { data: rules } = await supabase
      .from('lead_sla_rules')
      .select('*')
      .eq('is_active', true);

    const defaultRule = rules?.find(r => !r.customer_type && !r.source_channel) || {
      response_minutes: 15,
      escalation_minutes: 60,
    };

    // Find leads with no first response and not lost/converted
    const { data: staleLeads, error } = await supabase
      .from('sales_leads')
      .select('id, created_at, first_response_at, first_response_sent_at, customer_type_detected, source_key, channel_key, customer_name, lead_status')
      .in('lead_status', ['new', 'contacted'])
      .is('first_response_at', null)
      .is('first_response_sent_at', null);

    if (error) throw error;

    const now = new Date();
    let breachCount = 0;
    let escalationCount = 0;

    for (const lead of staleLeads || []) {
      const created = new Date(lead.created_at);
      const elapsedMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

      // Find matching SLA rule
      const matchedRule = rules?.find(r =>
        (r.customer_type === lead.customer_type_detected || !r.customer_type) &&
        (r.source_channel === (lead.source_key || lead.channel_key) || !r.source_channel)
      ) || defaultRule;

      const responseMinutes = matchedRule.response_minutes || 15;
      const escalationMinutes = matchedRule.escalation_minutes || 60;

      // Check for existing unresolved SLA_BREACH alert
      const { data: existingAlert } = await supabase
        .from('lead_alerts')
        .select('id')
        .eq('lead_id', lead.id)
        .eq('alert_type', 'SLA_BREACH')
        .eq('is_resolved', false)
        .maybeSingle();

      if (elapsedMinutes > responseMinutes && !existingAlert) {
        const severity = elapsedMinutes > escalationMinutes ? 'HIGH' : 'MED';

        await supabase.from('lead_alerts').insert({
          lead_id: lead.id,
          alert_type: 'SLA_BREACH',
          severity,
          assigned_team: 'SALES',
          message: `No response in ${elapsedMinutes}m (SLA: ${responseMinutes}m). Lead: ${lead.customer_name || 'Unknown'}`,
        });

        breachCount++;

        if (elapsedMinutes > escalationMinutes) {
          escalationCount++;
          // Escalation: also notify ADMIN
          await supabase.from('lead_alerts').insert({
            lead_id: lead.id,
            alert_type: 'SLA_BREACH',
            severity: 'HIGH',
            assigned_team: 'ADMIN',
            message: `ESCALATION: ${elapsedMinutes}m without response (limit: ${escalationMinutes}m)`,
          });
        }
      }
    }

    // Also check for leads with high risk scores and no HIGH_RISK alert
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

    console.log(`SLA Monitor: ${breachCount} breaches, ${escalationCount} escalations, ${riskAlerts} risk alerts`);

    return new Response(
      JSON.stringify({
        success: true,
        leads_checked: staleLeads?.length || 0,
        breaches_created: breachCount,
        escalations: escalationCount,
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
