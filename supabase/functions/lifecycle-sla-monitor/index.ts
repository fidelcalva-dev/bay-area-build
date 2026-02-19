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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get all active lifecycle entities
    const { data: entities, error: entitiesErr } = await supabase
      .from('lifecycle_entities')
      .select('*');

    if (entitiesErr) throw entitiesErr;

    // 2. Get all stages with SLA
    const { data: stages, error: stagesErr } = await supabase
      .from('lifecycle_stages')
      .select('*')
      .eq('is_active', true)
      .not('sla_minutes', 'is', null);

    if (stagesErr) throw stagesErr;

    const stageMap = new Map(stages.map((s: any) => [s.stage_key, s]));
    const now = Date.now();
    let alertsCreated = 0;

    for (const entity of (entities || [])) {
      const stage = stageMap.get(entity.current_stage_key);
      if (!stage || !stage.sla_minutes) continue;

      const elapsedMinutes = (now - new Date(entity.entered_stage_at).getTime()) / 60000;
      if (elapsedMinutes <= stage.sla_minutes) continue;

      // Check for existing unresolved alert
      const { data: existing } = await supabase
        .from('lifecycle_alerts')
        .select('id')
        .eq('entity_type', entity.entity_type)
        .eq('entity_id', entity.entity_id)
        .eq('stage_key', entity.current_stage_key)
        .eq('is_resolved', false)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Determine severity
      const ratio = elapsedMinutes / stage.sla_minutes;
      const severity = ratio > 3 ? 'HIGH' : ratio > 1.5 ? 'MED' : 'LOW';

      // Create alert
      const { error: alertErr } = await supabase
        .from('lifecycle_alerts')
        .insert({
          entity_type: entity.entity_type,
          entity_id: entity.entity_id,
          stage_key: entity.current_stage_key,
          department: entity.current_department,
          alert_type: 'SLA_BREACH',
          severity,
        });

      if (!alertErr) {
        alertsCreated++;

        // Also log an SLA_BREACH event
        await supabase
          .from('lifecycle_events')
          .insert({
            entity_type: entity.entity_type,
            entity_id: entity.entity_id,
            stage_key: entity.current_stage_key,
            department: entity.current_department,
            event_type: 'SLA_BREACH',
            notes: `SLA breached: ${Math.round(elapsedMinutes)}m elapsed (limit: ${stage.sla_minutes}m)`,
          });
      }
    }

    return new Response(
      JSON.stringify({ success: true, alertsCreated, entitiesChecked: entities?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('SLA monitor error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
