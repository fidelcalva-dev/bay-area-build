// Ads Generate Campaigns Edge Function
// Creates campaigns, ad groups, ads, and keywords for all active markets
// Supports DRY_RUN mode (DB only) or LIVE mode (Google Ads API sync)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Dumpster sizes for ad groups
const DUMPSTER_SIZES = [10, 20, 30, 40];

// BASE pricing by size
const BASE_PRICES: Record<number, number> = {
  6: 390, 8: 440, 10: 499, 20: 599, 30: 749, 40: 899, 50: 1135
};

// Ad copy templates
const AD_HEADLINES = {
  BASE: [
    'Dumpster Rental in {city} – Local Yards',
    '{size} Yard Dumpster from ${price}',
    'Not a Broker · Real Local Availability',
    '7-Day Rental · Delivery Included',
    'Same-Day Available · Book Online',
    'Licensed & Insured · Bay Area'
  ]
};

const AD_DESCRIPTIONS = {
  BASE: [
    'ZIP-based pricing from nearby yards. Fast delivery, no hidden fees. See availability and get instant pricing online.',
    'Local yard-powered dumpster rental. 7-day rentals with delivery & pickup included. Real availability, real prices.'
  ]
};

// Keyword templates
const KEYWORD_TEMPLATES = {
  exact: [
    '{size} yard dumpster {city}',
    '{size} yard roll off {city}',
    '{size} yd dumpster rental {city}'
  ],
  phrase: [
    'dumpster rental {city}',
    'roll off dumpster {city}',
    'construction dumpster {city}'
  ]
};

// Negative keywords
const NEGATIVE_KEYWORDS = [
  'junk removal', 'trash pickup weekly', 'free dumpster', 'municipal trash',
  'garbage service', 'recycling center', 'dump hours', 'landfill', 'free pickup', 'donation pickup'
];

// Valid internal routes for landing pages
const VALID_LANDING_ROUTES = ['/quote', '/pricing', '/sizes', '/dumpster-rental'];

interface AdsMarket {
  market_code: string;
  city: string;
  daily_budget: number;
  is_active: boolean;
}

async function getAdsMode(supabase: any): Promise<'DRY_RUN' | 'LIVE'> {
  const { data } = await supabase
    .from('config_settings')
    .select('value')
    .eq('category', 'ads')
    .eq('key', 'mode')
    .maybeSingle();
  
  const mode = data?.value as string | undefined;
  const cleanMode = mode?.replace(/"/g, '') || 'DRY_RUN';
  return cleanMode === 'LIVE' ? 'LIVE' : 'DRY_RUN';
}

async function getDefaultCampaignStatus(supabase: any): Promise<string> {
  const { data } = await supabase
    .from('config_settings')
    .select('value')
    .eq('category', 'ads')
    .eq('key', 'default_campaign_status')
    .maybeSingle();
  
  const status = data?.value as string | undefined;
  return status?.replace(/"/g, '') || 'draft';
}

function isValidLandingPage(path: string): boolean {
  return VALID_LANDING_ROUTES.some(route => path.startsWith(route));
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

    // Get ads mode and default status from config
    const adsMode = await getAdsMode(supabase);
    const defaultStatus = await getDefaultCampaignStatus(supabase);
    
    console.log(`Starting campaign generation in ${adsMode} mode (default status: ${defaultStatus})...`);

    // Log sync start
    await supabase.from('ads_sync_log').insert({
      sync_type: 'campaigns',
      status: 'started',
      metadata: { triggered_by: 'edge_function', mode: adsMode, default_status: defaultStatus }
    });

    // Get active markets
    const { data: markets, error: marketsError } = await supabase
      .from('ads_markets')
      .select('market_code, city, daily_budget, is_active')
      .eq('is_active', true);

    if (marketsError) throw marketsError;

    let campaignsCreated = 0;
    let adgroupsCreated = 0;
    let adsCreated = 0;
    let keywordsCreated = 0;
    let skippedLandingPage = 0;

    for (const market of (markets || []) as AdsMarket[]) {
      const { market_code, city, daily_budget } = market;

      // Check if campaign already exists
      const { data: existingCampaign } = await supabase
        .from('ads_campaigns')
        .select('id')
        .eq('market_code', market_code)
        .eq('service_type', 'dumpster_rental')
        .maybeSingle();

      if (existingCampaign) {
        console.log(`Campaign already exists for ${market_code}, skipping...`);
        continue;
      }

      // Create campaign with default status (usually 'draft' - requires manual approval)
      const { data: campaign, error: campaignError } = await supabase
        .from('ads_campaigns')
        .insert({
          campaign_name: `Dumpster Rental ${city}`,
          campaign_type: 'SEARCH',
          market_code,
          service_type: 'dumpster_rental',
          status: defaultStatus, // Uses 'draft' by default
          daily_budget: daily_budget || 25,
          messaging_tier: 'BASE'
        })
        .select()
        .single();

      if (campaignError) {
        console.error(`Failed to create campaign for ${market_code}:`, campaignError);
        continue;
      }

      campaignsCreated++;
      console.log(`Created campaign: ${campaign.campaign_name} with status: ${defaultStatus}`);

      // In LIVE mode, would sync to Google Ads API
      if (adsMode === 'LIVE') {
        console.log(`[LIVE] Would create campaign ${campaign.campaign_name} via Google Ads API`);
        // TODO: Implement Google Ads API campaign creation
      }

      // Add negative keywords at campaign level
      for (const keyword of NEGATIVE_KEYWORDS) {
        await supabase.from('ads_negative_keywords').insert({
          campaign_id: campaign.id,
          keyword,
          match_type: 'phrase'
        });
      }

      // Create ad groups for each size
      for (const size of DUMPSTER_SIZES) {
        const price = BASE_PRICES[size];
        const citySlug = city.toLowerCase().replace(/\s+/g, '-');
        const finalUrlPath = `/dumpster-rental/${citySlug}-ca/${size}-yard`;

        // Validate landing page before creating ad
        if (!isValidLandingPage(finalUrlPath)) {
          console.warn(`Invalid landing page: ${finalUrlPath}, skipping ad creation`);
          skippedLandingPage++;
          continue;
        }

        // Create ad group
        const { data: adgroup, error: adgroupError } = await supabase
          .from('ads_adgroups')
          .insert({
            campaign_id: campaign.id,
            adgroup_name: `${size} Yard Dumpster`,
            keyword_theme: `${size} yard dumpster ${city.toLowerCase()}`,
            size_yd: size,
            status: 'active',
            max_cpc: 8.00
          })
          .select()
          .single();

        if (adgroupError) {
          console.error(`Failed to create ad group for ${size}yd:`, adgroupError);
          continue;
        }

        adgroupsCreated++;

        // Create ad
        const headlines = AD_HEADLINES.BASE.map(h => 
          h.replace('{city}', city)
           .replace('{size}', size.toString())
           .replace('${price}', `$${price}`)
        );

        const descriptions = AD_DESCRIPTIONS.BASE.map(d => d.replace('{city}', city));

        const { error: adError } = await supabase.from('ads_ads').insert({
          adgroup_id: adgroup.id,
          ad_type: 'responsive_search',
          headline_1: headlines[0].substring(0, 30),
          headline_2: headlines[1].substring(0, 30),
          headline_3: headlines[2].substring(0, 30),
          description_1: descriptions[0].substring(0, 90),
          description_2: descriptions[1].substring(0, 90),
          final_url: finalUrlPath,
          display_url: `calsandumpsters.com/${size}-yard`,
          status: 'active'
        });

        if (!adError) adsCreated++;

        // Create keywords
        for (const template of KEYWORD_TEMPLATES.exact) {
          const keyword = template
            .replace('{size}', size.toString())
            .replace('{city}', city.toLowerCase());

          const { error: kwError } = await supabase.from('ads_keywords').insert({
            adgroup_id: adgroup.id,
            keyword,
            match_type: 'exact',
            status: 'active',
            max_cpc: 10.00
          });

          if (!kwError) keywordsCreated++;
        }

        for (const template of KEYWORD_TEMPLATES.phrase) {
          const keyword = template.replace('{city}', city.toLowerCase());

          const { error: kwError } = await supabase.from('ads_keywords').insert({
            adgroup_id: adgroup.id,
            keyword,
            match_type: 'phrase',
            status: 'active',
            max_cpc: 6.00
          });

          if (!kwError) keywordsCreated++;
        }
      }
    }

    const durationMs = Date.now() - startTime;

    // Log completion
    await supabase.from('ads_sync_log').insert({
      sync_type: 'campaigns',
      status: 'completed',
      records_processed: markets?.length || 0,
      records_created: campaignsCreated,
      duration_ms: durationMs,
      metadata: {
        mode: adsMode,
        default_status: defaultStatus,
        campaigns_created: campaignsCreated,
        adgroups_created: adgroupsCreated,
        ads_created: adsCreated,
        keywords_created: keywordsCreated,
        skipped_landing_page: skippedLandingPage
      }
    });

    console.log(`Campaign generation completed in ${durationMs}ms (${adsMode} mode)`);

    return new Response(
      JSON.stringify({
        success: true,
        mode: adsMode,
        default_status: defaultStatus,
        markets_processed: markets?.length || 0,
        campaigns_created: campaignsCreated,
        adgroups_created: adgroupsCreated,
        ads_created: adsCreated,
        keywords_created: keywordsCreated,
        skipped_landing_page: skippedLandingPage,
        duration_ms: durationMs
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Campaign generation error:', error);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from('ads_sync_log').insert({
      sync_type: 'campaigns',
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
