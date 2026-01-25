// Ads Capacity Guard Edge Function
// Pauses/adjusts campaigns based on inventory utilization and capacity rules

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdsMarket {
  market_code: string;
  city: string;
  yard_id: string | null;
  is_active: boolean;
  inventory_threshold: number;
  utilization_pause_threshold: number;
  utilization_premium_threshold: number;
}

interface AdsCampaign {
  id: string;
  campaign_name: string;
  market_code: string;
  status: string;
  messaging_tier: string;
}

interface CapacityResult {
  market_code: string;
  available_count: number;
  total_count: number;
  utilization_pct: number;
  action_taken: string | null;
  campaigns_affected: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting capacity guard check...');

    // Log sync start
    await supabase.from('ads_sync_log').insert({
      sync_type: 'capacity_check',
      status: 'started',
      metadata: { triggered_by: 'edge_function' }
    });

    // Get all active markets
    const { data: markets, error: marketsError } = await supabase
      .from('ads_markets')
      .select('*')
      .eq('is_active', true);

    if (marketsError) throw marketsError;

    const results: CapacityResult[] = [];
    let totalPaused = 0;
    let totalUpdated = 0;
    const alertsCreated: string[] = [];

    for (const market of (markets || []) as AdsMarket[]) {
      if (!market.yard_id) {
        results.push({
          market_code: market.market_code,
          available_count: 0,
          total_count: 0,
          utilization_pct: 100,
          action_taken: 'skipped_no_yard',
          campaigns_affected: 0
        });
        continue;
      }

      // Get inventory for this yard
      const { data: assets } = await supabase
        .from('assets_dumpsters')
        .select('asset_status')
        .eq('current_yard_id', market.yard_id);

      const total = assets?.length || 0;
      const available = assets?.filter((a: { asset_status: string }) => 
        a.asset_status === 'available'
      ).length || 0;
      const utilizationPct = total > 0 ? ((total - available) / total) * 100 : 100;

      // Get campaigns for this market
      const { data: campaigns } = await supabase
        .from('ads_campaigns')
        .select('id, campaign_name, market_code, status, messaging_tier')
        .eq('market_code', market.market_code)
        .in('status', ['active', 'capacity_paused']);

      const marketCampaigns = (campaigns || []) as AdsCampaign[];
      let actionTaken: string | null = null;
      let campaignsAffected = 0;

      // Decision logic
      if (available < market.inventory_threshold) {
        // PAUSE all campaigns - low inventory
        for (const campaign of marketCampaigns) {
          if (campaign.status === 'active') {
            await supabase
              .from('ads_campaigns')
              .update({ 
                status: 'capacity_paused',
                pause_reason: `Low inventory: ${available} available (threshold: ${market.inventory_threshold})`,
                updated_at: new Date().toISOString()
              })
              .eq('id', campaign.id);
            campaignsAffected++;
            totalPaused++;
          }
        }
        actionTaken = 'paused_low_inventory';

        // Create alert
        await supabase.from('ads_alerts').insert({
          alert_type: 'capacity_low',
          severity: 'critical',
          title: `Low Inventory: ${market.city}`,
          message: `Only ${available} dumpsters available in ${market.city}. Campaigns paused.`,
          entity_type: 'market',
          metadata: { market_code: market.market_code, available, threshold: market.inventory_threshold }
        });
        alertsCreated.push(market.market_code);

      } else if (utilizationPct >= market.utilization_pause_threshold) {
        // HIGH utilization - switch to PREMIUM messaging (or pause if already PREMIUM)
        for (const campaign of marketCampaigns) {
          if (campaign.status === 'active' && campaign.messaging_tier !== 'PREMIUM') {
            await supabase
              .from('ads_campaigns')
              .update({ 
                messaging_tier: 'PREMIUM',
                updated_at: new Date().toISOString()
              })
              .eq('id', campaign.id);
            campaignsAffected++;
            totalUpdated++;
          }
        }
        actionTaken = 'switched_to_premium';

      } else if (utilizationPct >= market.utilization_premium_threshold) {
        // MEDIUM utilization - switch to CORE messaging
        for (const campaign of marketCampaigns) {
          if (campaign.status === 'active' && campaign.messaging_tier === 'BASE') {
            await supabase
              .from('ads_campaigns')
              .update({ 
                messaging_tier: 'CORE',
                updated_at: new Date().toISOString()
              })
              .eq('id', campaign.id);
            campaignsAffected++;
            totalUpdated++;
          }
        }
        actionTaken = 'switched_to_core';

      } else {
        // LOW utilization - resume paused campaigns & switch back to BASE
        for (const campaign of marketCampaigns) {
          if (campaign.status === 'capacity_paused') {
            await supabase
              .from('ads_campaigns')
              .update({ 
                status: 'active',
                pause_reason: null,
                messaging_tier: 'BASE',
                updated_at: new Date().toISOString()
              })
              .eq('id', campaign.id);
            campaignsAffected++;
            totalUpdated++;
          } else if (campaign.messaging_tier !== 'BASE') {
            await supabase
              .from('ads_campaigns')
              .update({ 
                messaging_tier: 'BASE',
                updated_at: new Date().toISOString()
              })
              .eq('id', campaign.id);
            campaignsAffected++;
            totalUpdated++;
          }
        }
        actionTaken = available > market.inventory_threshold ? 'restored_to_base' : null;
      }

      results.push({
        market_code: market.market_code,
        available_count: available,
        total_count: total,
        utilization_pct: Math.round(utilizationPct),
        action_taken: actionTaken,
        campaigns_affected: campaignsAffected
      });
    }

    const durationMs = Date.now() - startTime;

    // Log completion
    await supabase.from('ads_sync_log').insert({
      sync_type: 'capacity_check',
      status: 'completed',
      records_processed: markets?.length || 0,
      records_paused: totalPaused,
      records_updated: totalUpdated,
      duration_ms: durationMs,
      metadata: { 
        results,
        alerts_created: alertsCreated.length
      }
    });

    console.log(`Capacity guard completed in ${durationMs}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        markets_checked: markets?.length || 0,
        campaigns_paused: totalPaused,
        campaigns_updated: totalUpdated,
        alerts_created: alertsCreated.length,
        duration_ms: durationMs,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Capacity guard error:', error);

    // Log failure
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from('ads_sync_log').insert({
      sync_type: 'capacity_check',
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime
    });

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
