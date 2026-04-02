// Ads Generate Campaigns Edge Function — V2 Growth Architect
// Creates campaigns, ad groups, ads, and keywords for all active markets
// Campaign types: Core (size-based), Contractor, Heavy Material, Same-Day
// Supports DRY_RUN mode (DB only) or LIVE mode (Google Ads API sync)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Pricing & Sizes ──
const DUMPSTER_SIZES = [10, 20, 30, 40];
const BASE_PRICES: Record<number, number> = {
  5: 395, 8: 425, 10: 495, 20: 650, 30: 775, 40: 925, 50: 1095
};

// ── Campaign Blueprints ──
// Each market gets 4 campaign types
const CAMPAIGN_TYPES = [
  { suffix: 'Core', service_type: 'dumpster_rental', budgetPct: 0.50 },
  { suffix: 'Contractor', service_type: 'contractor_program', budgetPct: 0.20 },
  { suffix: 'Heavy Material', service_type: 'heavy_material', budgetPct: 0.15 },
  { suffix: 'Same-Day', service_type: 'same_day', budgetPct: 0.15 },
];

// ── Ad Copy by Campaign Type ──
const AD_COPY: Record<string, { headlines: string[]; descriptions: string[] }> = {
  dumpster_rental: {
    headlines: [
      'Dumpster Rental {city}',
      '{size} Yard from ${price}',
      'Not a Broker · Local Yards',
      '7-Day Rental Included',
      'Book Online · See Pricing',
      'Licensed & Insured',
    ],
    descriptions: [
      'ZIP-based pricing from nearby yards in {city}. Fast delivery, no hidden fees. See instant pricing online.',
      'Local yard-powered dumpster rental. 7-day rentals with delivery & pickup included. Real prices, real availability.',
    ],
  },
  contractor_program: {
    headlines: [
      'Contractor Dumpsters {city}',
      'Volume Pricing Available',
      'Priority Scheduling · Pros',
      'Net-30 for Contractors',
      'Dedicated Account Rep',
      'Multi-Job Discounts',
    ],
    descriptions: [
      'Contractor dumpster program in {city}. Volume pricing, priority delivery, and a dedicated account rep for your jobs.',
      'Licensed contractors get preferred rates, Net-30 terms, and same-day scheduling. Apply online in 2 minutes.',
    ],
  },
  heavy_material: {
    headlines: [
      'Concrete Dumpster {city}',
      'Dirt & Debris Hauling',
      'Heavy Load Specialists',
      'From ${price} · No Surprises',
      'Tonnage Included',
      'Yard-Direct · Not a Broker',
    ],
    descriptions: [
      'Concrete, dirt, and heavy debris dumpster rental in {city}. Tonnage included. Local yards, transparent pricing.',
      'Need a dumpster for concrete or dirt? We specialize in heavy loads. See weight limits and instant pricing online.',
    ],
  },
  same_day: {
    headlines: [
      'Same-Day Dumpster {city}',
      'Order by Noon · Get Today',
      'Emergency Dumpster Rental',
      'Fast Delivery Available',
      'Book Now · Deliver Today',
      'Local Yards · Quick Turnaround',
    ],
    descriptions: [
      'Need a dumpster today in {city}? Order before noon for same-day delivery from local yards. Real-time availability.',
      'Same-day dumpster rental with guaranteed delivery windows. Check availability and book online in 60 seconds.',
    ],
  },
};

// ── Keyword Templates by Campaign Type ──
const KEYWORD_SETS: Record<string, { exact: string[]; phrase: string[] }> = {
  dumpster_rental: {
    exact: [
      '{size} yard dumpster {city}',
      '{size} yard roll off {city}',
      '{size} yd dumpster rental {city}',
      '{size} yard dumpster rental near me',
      'rent {size} yard dumpster {city}',
      'dumpster rental {city} {size} yard',
    ],
    phrase: [
      'dumpster rental {city}',
      'roll off dumpster {city}',
      'construction dumpster {city}',
      'dumpster rental near me',
      'roll off container {city}',
      'rent a dumpster {city}',
    ],
  },
  contractor_program: {
    exact: [
      'contractor dumpster rental {city}',
      'commercial dumpster {city}',
      'construction dumpster service {city}',
      'bulk dumpster rental {city}',
    ],
    phrase: [
      'contractor dumpster {city}',
      'commercial roll off {city}',
      'construction waste removal {city}',
      'builder dumpster rental',
      'GC dumpster service {city}',
    ],
  },
  heavy_material: {
    exact: [
      'concrete dumpster {city}',
      'dirt removal dumpster {city}',
      'heavy debris dumpster {city}',
      'concrete hauling {city}',
    ],
    phrase: [
      'concrete dumpster rental',
      'dirt dumpster {city}',
      'heavy load dumpster',
      'demolition dumpster {city}',
      'asphalt removal {city}',
      'rock debris dumpster',
    ],
  },
  same_day: {
    exact: [
      'same day dumpster {city}',
      'same day dumpster rental {city}',
      'emergency dumpster rental {city}',
      'rush dumpster delivery {city}',
    ],
    phrase: [
      'same day dumpster',
      'dumpster delivery today {city}',
      'urgent dumpster rental',
      'next day dumpster {city}',
      'fast dumpster rental {city}',
    ],
  },
};

// ── Comprehensive Negative Keywords ──
const NEGATIVE_KEYWORDS = [
  // Irrelevant services
  'junk removal', 'trash pickup weekly', 'garbage service', 'recycling center',
  'dump hours', 'landfill', 'donation pickup', 'hazardous waste',
  'septic tank', 'porta potty', 'portable toilet', 'grease trap',
  // Free / DIY
  'free dumpster', 'free pickup', 'free junk removal', 'diy',
  // Municipal
  'municipal trash', 'city dump', 'county landfill', 'waste management bill',
  // Jobs / careers
  'dumpster driver jobs', 'waste management careers', 'trash collector salary',
  'garbage truck driver', 'hiring',
  // Unrelated
  'dumpster diving', 'dumpster fire', 'dumpster pool', 'dumpster baby',
  // Competitors (brand protection)
  'waste management', 'republic services', 'bagster',
];

// Valid landing page prefixes
const VALID_LANDING_ROUTES = ['/quote', '/pricing', '/sizes', '/dumpster-rental'];

interface AdsMarket {
  market_code: string;
  city: string;
  daily_budget: number;
  is_active: boolean;
}

// ── Helpers ──
async function getAdsMode(supabase: any): Promise<'DRY_RUN' | 'LIVE'> {
  const { data } = await supabase
    .from('config_settings')
    .select('value')
    .eq('category', 'ads')
    .eq('key', 'mode')
    .maybeSingle();
  const mode = data?.value as string | undefined;
  return (mode?.replace(/"/g, '') || 'DRY_RUN') === 'LIVE' ? 'LIVE' : 'DRY_RUN';
}

async function getDefaultCampaignStatus(supabase: any): Promise<string> {
  const { data } = await supabase
    .from('config_settings')
    .select('value')
    .eq('category', 'ads')
    .eq('key', 'default_campaign_status')
    .maybeSingle();
  return (data?.value as string)?.replace(/"/g, '') || 'draft';
}

function isValidLandingPage(path: string): boolean {
  return VALID_LANDING_ROUTES.some(route => path.startsWith(route));
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [k, v] of Object.entries(vars)) {
    result = result.replaceAll(`{${k}}`, v);
    result = result.replaceAll(`\${${k}}`, `$${v}`); // handle ${price} pattern
  }
  return result;
}

// ── Main Handler ──
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const adsMode = await getAdsMode(supabase);
    const defaultStatus = await getDefaultCampaignStatus(supabase);
    console.log(`Campaign generation V2: ${adsMode} mode, default status: ${defaultStatus}`);

    await supabase.from('ads_sync_log').insert({
      sync_type: 'campaigns_v2',
      status: 'started',
      metadata: { triggered_by: 'edge_function', mode: adsMode, default_status: defaultStatus },
    });

    const { data: markets, error: marketsError } = await supabase
      .from('ads_markets')
      .select('market_code, city, daily_budget, is_active')
      .eq('is_active', true);
    if (marketsError) throw marketsError;

    const stats = { campaigns: 0, adgroups: 0, ads: 0, keywords: 0, negatives: 0, skipped: 0 };

    for (const market of (markets || []) as AdsMarket[]) {
      const { market_code, city, daily_budget } = market;
      const citySlug = city.toLowerCase().replace(/\s+/g, '-');
      const cityLower = city.toLowerCase();

      for (const cType of CAMPAIGN_TYPES) {
        const campaignName = `${city} – ${cType.suffix}`;
        const campaignBudget = Math.round((daily_budget || 50) * cType.budgetPct);

        // Skip if already exists
        const { data: existing } = await supabase
          .from('ads_campaigns')
          .select('id')
          .eq('market_code', market_code)
          .eq('service_type', cType.service_type)
          .maybeSingle();

        if (existing) {
          console.log(`Campaign exists: ${campaignName}, skipping`);
          continue;
        }

        // Create campaign
        const { data: campaign, error: cErr } = await supabase
          .from('ads_campaigns')
          .insert({
            campaign_name: campaignName,
            campaign_type: 'SEARCH',
            market_code,
            service_type: cType.service_type,
            status: defaultStatus,
            daily_budget: Math.max(campaignBudget, 10),
            messaging_tier: 'BASE',
          })
          .select()
          .single();

        if (cErr) { console.error(`Campaign create fail: ${campaignName}`, cErr); continue; }
        stats.campaigns++;

        // Negative keywords (batch insert)
        const negRows = NEGATIVE_KEYWORDS.map(kw => ({
          campaign_id: campaign.id,
          keyword: kw,
          match_type: 'phrase',
        }));
        await supabase.from('ads_negative_keywords').insert(negRows);
        stats.negatives += negRows.length;

        // Determine sizes for this campaign type
        const sizes = cType.service_type === 'same_day' ? [10, 20] : DUMPSTER_SIZES;
        const copy = AD_COPY[cType.service_type];
        const kwSet = KEYWORD_SETS[cType.service_type];

        for (const size of sizes) {
          const price = BASE_PRICES[size]?.toString() || '599';
          const vars = { city, size: size.toString(), price, citySlug };
          const finalUrlPath = `/dumpster-rental/${citySlug}-ca/${size}-yard`;

          if (!isValidLandingPage(finalUrlPath)) { stats.skipped++; continue; }

          // Create ad group
          const agName = cType.service_type === 'contractor_program'
            ? `Contractor ${size}yd`
            : cType.service_type === 'heavy_material'
            ? `Heavy ${size}yd`
            : cType.service_type === 'same_day'
            ? `Same-Day ${size}yd`
            : `${size} Yard Dumpster`;

          const { data: ag, error: agErr } = await supabase
            .from('ads_adgroups')
            .insert({
              campaign_id: campaign.id,
              adgroup_name: agName,
              keyword_theme: `${size} yard ${cType.suffix.toLowerCase()} ${cityLower}`,
              size_yd: size,
              status: 'active',
              max_cpc: cType.service_type === 'same_day' ? 12.00
                : cType.service_type === 'contractor_program' ? 10.00
                : cType.service_type === 'heavy_material' ? 9.00
                : 8.00,
            })
            .select()
            .single();

          if (agErr) { console.error(`AdGroup fail: ${agName}`, agErr); continue; }
          stats.adgroups++;

          // Create ad
          const headlines = copy.headlines.map(h => fillTemplate(h, vars).substring(0, 30));
          const descs = copy.descriptions.map(d => fillTemplate(d, vars).substring(0, 90));

          const { error: adErr } = await supabase.from('ads_ads').insert({
            adgroup_id: ag.id,
            ad_type: 'responsive_search',
            headline_1: headlines[0],
            headline_2: headlines[1],
            headline_3: headlines[2],
            description_1: descs[0],
            description_2: descs[1] || descs[0],
            final_url: finalUrlPath,
            display_url: `calsandumpsters.com/${size}-yard`,
            status: 'active',
          });
          if (!adErr) stats.ads++;

          // Keywords — exact
          const exactKws = (kwSet.exact || []).map(t => ({
            adgroup_id: ag.id,
            keyword: fillTemplate(t, { ...vars, city: cityLower }),
            match_type: 'exact',
            status: 'active',
            max_cpc: cType.service_type === 'same_day' ? 14.00 : 10.00,
          }));
          if (exactKws.length) {
            const { error: ekErr } = await supabase.from('ads_keywords').insert(exactKws);
            if (!ekErr) stats.keywords += exactKws.length;
          }

          // Keywords — phrase
          const phraseKws = (kwSet.phrase || []).map(t => ({
            adgroup_id: ag.id,
            keyword: fillTemplate(t, { ...vars, city: cityLower }),
            match_type: 'phrase',
            status: 'active',
            max_cpc: cType.service_type === 'same_day' ? 10.00 : 6.00,
          }));
          if (phraseKws.length) {
            const { error: pkErr } = await supabase.from('ads_keywords').insert(phraseKws);
            if (!pkErr) stats.keywords += phraseKws.length;
          }
        }

        if (adsMode === 'LIVE') {
          console.log(`[LIVE] Would sync campaign ${campaignName} to Google Ads API`);
        }
      }
    }

    const durationMs = Date.now() - startTime;

    await supabase.from('ads_sync_log').insert({
      sync_type: 'campaigns_v2',
      status: 'completed',
      records_processed: markets?.length || 0,
      records_created: stats.campaigns,
      duration_ms: durationMs,
      metadata: { mode: adsMode, default_status: defaultStatus, ...stats },
    });

    console.log(`Campaign generation V2 completed in ${durationMs}ms`);

    return new Response(
      JSON.stringify({ success: true, mode: adsMode, default_status: defaultStatus, ...stats, duration_ms: durationMs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Campaign generation error:', error);
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    await supabase.from('ads_sync_log').insert({
      sync_type: 'campaigns_v2',
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
    });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
