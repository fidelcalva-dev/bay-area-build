// Local Readiness Score — Gates expansion until core Bay Area system is strong
// Readiness must be HIGH before launching new vendor markets

export interface ReadinessCategory {
  key: string;
  label: string;
  weight: number;
  checks: ReadinessCheck[];
}

export interface ReadinessCheck {
  id: string;
  label: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  notes?: string;
}

export type ReadinessLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_READY';

export interface LocalReadinessScore {
  overall: ReadinessLevel;
  score: number; // 0–100
  categories: ReadinessCategory[];
  expansionGateOpen: boolean;
  timestamp: string;
}

/** Evaluate current local readiness based on system state */
export function evaluateLocalReadiness(): LocalReadinessScore {
  const categories: ReadinessCategory[] = [
    {
      key: 'seo',
      label: 'SEO Readiness',
      weight: 25,
      checks: [
        { id: 'homepage_optimized', label: 'Homepage has strong hero, ZIP start, trust blocks', status: 'PASS' },
        { id: 'core_city_pages', label: 'Oakland/SJ/SF pages have 900+ words, local intro, FAQs', status: 'PASS' },
        { id: 'ring_city_pages', label: 'Support ring pages have unique H1, local content, CTAs', status: 'WARN', notes: '13 pages need content depth upgrade' },
        { id: 'sitemap_focused', label: 'Sitemap excludes outside-area pages', status: 'PASS' },
        { id: 'canonicals_clean', label: 'No duplicate canonicals or conflicting URLs', status: 'PASS' },
        { id: 'titles_meta', label: 'All core pages have valid title + meta description', status: 'PASS' },
      ],
    },
    {
      key: 'conversion',
      label: 'Conversion Readiness',
      weight: 25,
      checks: [
        { id: 'quote_flow_stable', label: 'Quote flow preserves ZIP, progressive capture works', status: 'PASS' },
        { id: 'cta_hierarchy', label: 'Get Exact Price > Upload Photo > Call/Text', status: 'PASS' },
        { id: 'pricing_consistent', label: 'One pricing source of truth across all pages', status: 'PASS' },
        { id: 'size_material_rules', label: '5–50yd general, 5–10yd heavy enforced everywhere', status: 'PASS' },
        { id: 'lead_capture', label: 'Progressive lead ingest at 4 milestones', status: 'PASS' },
      ],
    },
    {
      key: 'local_profile',
      label: 'Local Profile Readiness',
      weight: 20,
      checks: [
        { id: 'gbp_complete', label: 'GBP profiles verified and optimized', status: 'WARN', notes: 'Photo and post cadence needs activation' },
        { id: 'review_cadence', label: 'Review requests sent after delivery/pickup/payment', status: 'WARN', notes: 'Automation templates ready, not yet triggered' },
        { id: 'photo_cadence', label: '8+ geo-tagged photos per week across markets', status: 'FAIL', notes: 'Photo pipeline not yet active' },
        { id: 'bing_apple', label: 'Bing Places and Apple Business Connect claimed', status: 'WARN', notes: 'Profiles tracked, verification pending' },
      ],
    },
    {
      key: 'crm',
      label: 'CRM Readiness',
      weight: 20,
      checks: [
        { id: 'lead_to_dispatch', label: 'Lead → Quote → Contract → Payment → Order → Dispatch flow works', status: 'PASS' },
        { id: 'customer_360', label: 'Customer 360 with 12 tabs operational', status: 'PASS' },
        { id: 'manual_create', label: 'Manual customer create/edit with duplicate prevention', status: 'PASS' },
        { id: 'sales_workspace', label: 'Sales role has complete tools', status: 'PASS' },
        { id: 'cs_workspace', label: 'CS role has complete tools', status: 'PASS' },
      ],
    },
    {
      key: 'pricing',
      label: 'Pricing Readiness',
      weight: 10,
      checks: [
        { id: 'pricing_sot', label: 'pricingConfig.ts is single source of truth', status: 'PASS' },
        { id: 'heavy_rules', label: 'Heavy material restricted to 5/8/10yd', status: 'PASS' },
        { id: 'surcharges', label: '$150 contamination and reroute surcharges enforced', status: 'PASS' },
      ],
    },
  ];

  // Calculate score
  let totalScore = 0;
  for (const cat of categories) {
    const passCount = cat.checks.filter(c => c.status === 'PASS').length;
    const warnCount = cat.checks.filter(c => c.status === 'WARN').length;
    const total = cat.checks.length;
    const catScore = ((passCount + warnCount * 0.5) / total) * cat.weight;
    totalScore += catScore;
  }

  const score = Math.round(totalScore);
  const overall: ReadinessLevel =
    score >= 85 ? 'HIGH' :
    score >= 65 ? 'MEDIUM' :
    score >= 45 ? 'LOW' : 'NOT_READY';

  return {
    overall,
    score,
    categories,
    expansionGateOpen: overall === 'HIGH',
    timestamp: new Date().toISOString(),
  };
}
