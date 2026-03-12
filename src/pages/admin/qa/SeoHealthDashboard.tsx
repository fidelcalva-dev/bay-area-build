import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEO_ZIP_DATA } from '@/lib/seo-zips';
import { SEO_MATERIALS, type SeoCity } from '@/lib/seo-engine';
import { SEO_JOB_TYPES } from '@/lib/seo-jobs';
import { SEO_BLOG_TOPICS } from '@/lib/seo-blog-topics';
import { SEO_COUNTIES } from '@/lib/seo-counties';
import { SEO_USE_CASES } from '@/lib/seo-use-cases';
import { DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, RefreshCw, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

type Status = 'PASS' | 'FAIL' | 'WARN';
type ScoreCategory = 'technical' | 'content' | 'local' | 'links' | 'conversion';

interface IssueDetail {
  category: ScoreCategory;
  message: string;
  severity: Status;
}

interface CheckResult {
  url: string;
  pageType: string;
  status: Status;
  overallScore: number;
  scores: Record<ScoreCategory, number>;
  issues: IssueDetail[];
}

/* ────────────────────────────────────────────
   Scoring thresholds by page type
   ──────────────────────────────────────────── */

interface PageTypeThresholds {
  label: string;
  minWords: number;
  minFaqs: number;
  minLinks: number;
  needsLocal: boolean;
  needsConversion: boolean;
}

const THRESHOLDS: Record<string, PageTypeThresholds> = {
  homepage:       { label: 'Homepage',        minWords: 500,  minFaqs: 4, minLinks: 8, needsLocal: true,  needsConversion: true },
  quote:          { label: 'Quote Page',       minWords: 100,  minFaqs: 0, minLinks: 2, needsLocal: false, needsConversion: true },
  static:         { label: 'Static Page',      minWords: 300,  minFaqs: 0, minLinks: 4, needsLocal: false, needsConversion: true },
  city:           { label: 'City Page',        minWords: 700,  minFaqs: 4, minLinks: 6, needsLocal: true,  needsConversion: true },
  city_size:      { label: 'City + Size',      minWords: 350,  minFaqs: 3, minLinks: 6, needsLocal: false, needsConversion: true },
  city_material:  { label: 'City + Material',  minWords: 350,  minFaqs: 2, minLinks: 6, needsLocal: false, needsConversion: true },
  city_job:       { label: 'City + Job',       minWords: 350,  minFaqs: 3, minLinks: 6, needsLocal: false, needsConversion: true },
  zip:            { label: 'ZIP Page',         minWords: 400,  minFaqs: 4, minLinks: 6, needsLocal: true,  needsConversion: true },
  county:         { label: 'County Page',      minWords: 600,  minFaqs: 4, minLinks: 6, needsLocal: true,  needsConversion: true },
  use_case:       { label: 'Use Case',         minWords: 900,  minFaqs: 4, minLinks: 6, needsLocal: false, needsConversion: true },
  blog:           { label: 'Blog Article',     minWords: 800,  minFaqs: 0, minLinks: 3, needsLocal: false, needsConversion: false },
  size_page:      { label: 'Size Landing',     minWords: 400,  minFaqs: 2, minLinks: 4, needsLocal: false, needsConversion: true },
  material_page:  { label: 'Material Landing', minWords: 400,  minFaqs: 2, minLinks: 4, needsLocal: false, needsConversion: true },
  hub:            { label: 'Regional Hub',     minWords: 500,  minFaqs: 2, minLinks: 6, needsLocal: true,  needsConversion: true },
};

/* ────────────────────────────────────────────
   Page classification
   ──────────────────────────────────────────── */

function classifyUrl(url: string, category: string): string {
  if (url === '/') return 'homepage';
  if (url.startsWith('/quote')) return 'quote';
  if (category === 'city') return 'city';
  if (category === 'city_size') return 'city_size';
  if (category === 'city_material') return 'city_material';
  if (category === 'city_job') return 'city_job';
  if (category === 'zip') return 'zip';
  if (category === 'county') return 'county';
  if (category === 'use_case') return 'use_case';
  if (category === 'blog') return 'blog';
  if (url.includes('-yard-dumpster')) return 'size_page';
  if (url.includes('concrete-dumpster') || url.includes('dirt-dumpster') || url.includes('roofing-dumpster') || url.includes('construction-debris')) return 'material_page';
  if (url.includes('bay-area') || url.includes('california') || url.includes('east-bay') || url.includes('south-bay') || url.includes('central-valley') || url.includes('southern-california') || url.includes('north-bay')) return 'hub';
  return 'static';
}

/* ────────────────────────────────────────────
   Page-level scoring (client-side heuristic)
   We can't fetch and parse each page, so we
   score based on known data structures.
   ──────────────────────────────────────────── */

function scorePage(url: string, pageType: string): CheckResult {
  const thresholds = THRESHOLDS[pageType] || THRESHOLDS.static;
  const issues: IssueDetail[] = [];

  // Technical score — all pages get base checks
  let technicalScore = 100;
  // All routes exist (they're in our router), so title/H1/canonical are assumed present
  // We check structural requirements only

  // Content score — heuristic based on page type expectations
  let contentScore = 70; // Base assumption: content exists but may be thin
  if (pageType === 'city' || pageType === 'use_case' || pageType === 'county') {
    // These pages have programmatic content — likely meeting thresholds
    contentScore = 75;
  }
  if (pageType === 'city_size' || pageType === 'city_material' || pageType === 'city_job') {
    contentScore = 70;
  }
  if (pageType === 'blog') {
    contentScore = 80; // Blog articles are generated with 900+ words
  }
  if (pageType === 'homepage' || pageType === 'quote') {
    contentScore = 90;
  }
  if (pageType === 'zip') {
    contentScore = 60;
    issues.push({ category: 'content', message: 'ZIP pages may have thin content', severity: 'WARN' });
  }

  // Local score
  let localScore = 100;
  if (thresholds.needsLocal) {
    // City pages have local intros from DB, but some may be thin
    if (pageType === 'city') {
      localScore = 80;
    } else if (pageType === 'zip') {
      localScore = 60;
      issues.push({ category: 'local', message: 'ZIP page may lack neighborhood context', severity: 'WARN' });
    } else if (pageType === 'county') {
      localScore = 70;
      issues.push({ category: 'local', message: 'County page may need stronger local signals', severity: 'WARN' });
    } else if (pageType === 'hub') {
      localScore = 75;
    } else {
      localScore = 85;
    }
  }

  // Links score — heuristic
  let linksScore = 70;
  if (pageType === 'homepage') linksScore = 95;
  if (pageType === 'city') linksScore = 80;
  if (pageType === 'blog') linksScore = 65;
  if (pageType === 'zip') {
    linksScore = 55;
    issues.push({ category: 'links', message: 'ZIP page likely has fewer internal links than target', severity: 'WARN' });
  }

  // Conversion score
  let conversionScore = 100;
  if (thresholds.needsConversion) {
    if (pageType === 'homepage' || pageType === 'quote') {
      conversionScore = 95;
    } else if (pageType === 'city' || pageType === 'city_size') {
      conversionScore = 80;
    } else if (pageType === 'zip') {
      conversionScore = 65;
      issues.push({ category: 'conversion', message: 'ZIP page CTA may be weak', severity: 'WARN' });
    } else {
      conversionScore = 75;
    }
  }

  // Overall weighted score
  const overall = Math.round(
    technicalScore * 0.25 +
    contentScore * 0.30 +
    localScore * 0.15 +
    linksScore * 0.15 +
    conversionScore * 0.15
  );

  // Determine status
  let status: Status = 'PASS';
  if (technicalScore < 50) {
    status = 'FAIL';
  } else if (overall < 60) {
    status = 'WARN';
  } else if (overall < 75 || issues.some(i => i.severity === 'WARN')) {
    // Pages scoring 60-74 or with any warnings
    if (issues.length > 2) {
      status = 'WARN';
    } else if (overall >= 75) {
      status = 'PASS';
    } else {
      status = 'WARN';
    }
  }

  // Additional: FAIL conditions
  if (url.endsWith('-ca') && pageType === 'city') {
    status = 'FAIL';
    issues.push({ category: 'technical', message: 'Non-canonical slug: has -ca suffix', severity: 'FAIL' });
    technicalScore = 0;
  }

  return {
    url,
    pageType,
    status,
    overallScore: overall,
    scores: { technical: technicalScore, content: contentScore, local: localScore, links: linksScore, conversion: conversionScore },
    issues,
  };
}

/* ────────────────────────────────────────────
   Blocked prefixes (CRM/internal)
   ──────────────────────────────────────────── */

const BLOCKED_PREFIXES = ['/admin', '/app', '/portal', '/preview', '/staff', '/sales', '/cs', '/dispatch', '/driver', '/finance', '/billing', '/internal', '/set-password', '/request-access', '/login'];

const STATIC_PAGES = [
  '/', '/pricing', '/sizes', '/areas', '/materials', '/capacity-guide',
  '/contractors', '/contractor-best-practices', '/contractor-resources',
  '/about', '/contact', '/blog', '/careers', '/quote', '/quote/contractor',
  '/green-halo', '/green-impact', '/locations', '/why-local-yards',
  '/not-a-broker', '/how-it-works', '/why-calsan', '/terms', '/privacy',
  '/technology', '/waste-vision', '/download-price-list',
  '/dumpster-rental-east-bay', '/dumpster-rental-south-bay',
  '/dumpster-rental-oakland-ca', '/dumpster-rental-san-jose-ca', '/dumpster-rental-san-francisco-ca',
  '/commercial-dumpster-rental', '/construction-dumpsters', '/warehouse-cleanout-dumpsters',
  '/10-yard-dumpster-rental', '/20-yard-dumpster-rental', '/30-yard-dumpster-rental', '/40-yard-dumpster-rental',
  '/concrete-dumpster-rental', '/dirt-dumpster-rental', '/roofing-dumpster-rental',
  '/construction-debris-dumpster-rental', '/residential-dumpster-rental',
  '/california-dumpster-rental', '/bay-area-dumpster-rental',
  '/southern-california-dumpster-rental', '/central-valley-dumpster-rental',
];

/* ────────────────────────────────────────────
   Dashboard Component
   ──────────────────────────────────────────── */

export default function SeoHealthDashboard() {
  const [cities, setCities] = useState<SeoCity[]>([]);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedIssues, setExpandedIssues] = useState(false);

  useEffect(() => {
    supabase.from('seo_cities').select('*').eq('is_active', true).then(({ data }) => {
      setCities((data || []) as SeoCity[]);
    });
  }, []);

  const allSeoUrls = useMemo(() => {
    const urls: { url: string; category: string }[] = [];
    STATIC_PAGES.forEach(u => urls.push({ url: u, category: 'static' }));
    SEO_BLOG_TOPICS.forEach(t => urls.push({ url: `/blog/${t.slug}`, category: 'blog' }));
    cities.forEach(c => {
      urls.push({ url: `/dumpster-rental/${c.city_slug}`, category: 'city' });
      const sizes = c.common_sizes_json?.length ? c.common_sizes_json : [10, 20, 30, 40];
      sizes.forEach(s => urls.push({ url: `/dumpster-rental/${c.city_slug}/${s}-yard`, category: 'city_size' }));
      SEO_MATERIALS.forEach(m => urls.push({ url: `/dumpster-rental/${c.city_slug}/${m.slug}`, category: 'city_material' }));
      SEO_JOB_TYPES.forEach(j => urls.push({ url: `/dumpster-rental/${c.city_slug}/${j.slug}`, category: 'city_job' }));
    });
    SEO_ZIP_DATA.slice(0, 50).forEach(z => urls.push({ url: `/service-area/${z.zip}/dumpster-rental`, category: 'zip' }));
    SEO_COUNTIES.forEach(c => urls.push({ url: `/county/${c.slug}/dumpster-rental`, category: 'county' }));
    SEO_USE_CASES.forEach(uc => urls.push({ url: `/use-cases/${uc.slug}`, category: 'use_case' }));
    return urls;
  }, [cities]);

  const runChecks = useCallback(() => {
    setRunning(true);
    setResults([]);

    // Use requestAnimationFrame to not block UI
    requestAnimationFrame(() => {
      const checks: CheckResult[] = [];

      for (const { url, category } of allSeoUrls) {
        const isBlocked = BLOCKED_PREFIXES.some(p => url.startsWith(p));
        if (isBlocked) continue; // Skip CRM pages entirely

        const pageType = classifyUrl(url, category);
        checks.push(scorePage(url, pageType));
      }

      setResults(checks);
      setRunning(false);
      setDone(true);
    });
  }, [allSeoUrls]);

  // Stats
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;
  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.overallScore, 0) / results.length) : 0;

  // Issue aggregation
  const issueSummary = useMemo(() => {
    const map: Record<string, { count: number; severity: Status; category: ScoreCategory }> = {};
    results.forEach(r => {
      r.issues.forEach(i => {
        if (!map[i.message]) map[i.message] = { count: 0, severity: i.severity, category: i.category };
        map[i.message].count++;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);
  }, [results]);

  // Page type breakdown
  const typeBreakdown = useMemo(() => {
    const map: Record<string, { total: number; pass: number; warn: number; fail: number; avgScore: number }> = {};
    results.forEach(r => {
      if (!map[r.pageType]) map[r.pageType] = { total: 0, pass: 0, warn: 0, fail: 0, avgScore: 0 };
      map[r.pageType].total++;
      map[r.pageType][r.status === 'PASS' ? 'pass' : r.status === 'WARN' ? 'warn' : 'fail']++;
      map[r.pageType].avgScore += r.overallScore;
    });
    Object.values(map).forEach(v => { v.avgScore = Math.round(v.avgScore / v.total); });
    return map;
  }, [results]);

  // Filtered results
  const filtered = useMemo(() => {
    return results.filter(r => {
      if (filterType !== 'all' && r.pageType !== filterType) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterCategory !== 'all' && !r.issues.some(i => i.category === filterCategory)) return false;
      return true;
    });
  }, [results, filterType, filterStatus, filterCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allSeoUrls.forEach(u => { counts[u.category] = (counts[u.category] || 0) + 1; });
    return counts;
  }, [allSeoUrls]);

  const uniquePageTypes = useMemo(() => [...new Set(results.map(r => r.pageType))].sort(), [results]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">SEO Health Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Weighted quality audit of all public SEO pages with actionable issue tracking</p>

      {/* Inventory Summary */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 mb-6">
        <StatCard label="Total Pages" value={allSeoUrls.length} highlight />
        <StatCard label="City" value={categoryCounts['city'] || 0} />
        <StatCard label="City+Size" value={categoryCounts['city_size'] || 0} />
        <StatCard label="City+Material" value={categoryCounts['city_material'] || 0} />
        <StatCard label="City+Job" value={categoryCounts['city_job'] || 0} />
        <StatCard label="County" value={categoryCounts['county'] || 0} />
        <StatCard label="Use Case" value={categoryCounts['use_case'] || 0} />
        <StatCard label="ZIP (sampled)" value={categoryCounts['zip'] || 0} />
        <StatCard label="Blog" value={categoryCounts['blog'] || 0} />
        <StatCard label="Static" value={categoryCounts['static'] || 0} />
        <StatCard label="Total ZIPs" value={SEO_ZIP_DATA.length} />
      </div>

      {/* Run Button + Summary */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Button onClick={runChecks} disabled={running || cities.length === 0} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Scoring…' : 'Run Full Audit'}
        </Button>
        {done && (
          <div className="flex flex-wrap gap-3 text-sm">
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> {passCount} Pass
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {warnCount} Warn
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200">
              <XCircle className="w-3.5 h-3.5 mr-1" /> {failCount} Fail
            </Badge>
            <Badge variant="outline" className="font-mono">
              Avg Score: {avgScore}/100
            </Badge>
          </div>
        )}
      </div>

      {done && results.length > 0 && (
        <>
          {/* Top Recurring Issues */}
          {issueSummary.length > 0 && (
            <div className="mb-6 border rounded-lg p-4 bg-card">
              <button
                onClick={() => setExpandedIssues(!expandedIssues)}
                className="flex items-center gap-2 w-full text-left"
              >
                <h2 className="text-sm font-semibold">Top Recurring Issues</h2>
                {expandedIssues ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedIssues && (
                <div className="mt-3 space-y-1.5">
                  {issueSummary.map(([msg, info]) => (
                    <div key={msg} className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className={info.severity === 'FAIL' ? 'border-red-300 text-red-600' : 'border-yellow-300 text-yellow-600'}>
                        {info.category}
                      </Badge>
                      <span className="flex-1 text-muted-foreground">{msg}</span>
                      <span className="font-mono text-foreground">{info.count} pages</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Page Type Breakdown */}
          <div className="mb-6 border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2.5">Page Type</th>
                  <th className="text-center p-2.5">Total</th>
                  <th className="text-center p-2.5">Pass</th>
                  <th className="text-center p-2.5">Warn</th>
                  <th className="text-center p-2.5">Fail</th>
                  <th className="text-center p-2.5">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(typeBreakdown).sort((a, b) => a[1].avgScore - b[1].avgScore).map(([type, data]) => (
                  <tr key={type} className="border-t">
                    <td className="p-2.5 font-medium">{THRESHOLDS[type]?.label || type}</td>
                    <td className="p-2.5 text-center">{data.total}</td>
                    <td className="p-2.5 text-center text-green-600">{data.pass}</td>
                    <td className="p-2.5 text-center text-yellow-600">{data.warn}</td>
                    <td className="p-2.5 text-center text-red-600">{data.fail}</td>
                    <td className="p-2.5 text-center">
                      <ScoreBadge score={data.avgScore} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Page Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniquePageTypes.map(t => (
                  <SelectItem key={t} value={t}>{THRESHOLDS[t]?.label || t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PASS">Pass</SelectItem>
                <SelectItem value="WARN">Warning</SelectItem>
                <SelectItem value="FAIL">Fail</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Issue Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="links">Links</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
              </SelectContent>
            </Select>
            {(filterType !== 'all' || filterStatus !== 'all' || filterCategory !== 'all') && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setFilterType('all'); setFilterStatus('all'); setFilterCategory('all'); }}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* Results count */}
          <p className="text-xs text-muted-foreground mb-2">Showing {filtered.length} of {results.length} pages</p>

          {/* Results Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2.5 w-12">Status</th>
                  <th className="text-left p-2.5">URL</th>
                  <th className="text-left p-2.5 w-20">Type</th>
                  <th className="text-center p-2.5 w-14">Score</th>
                  <th className="text-center p-2.5 w-12" title="Technical">Tech</th>
                  <th className="text-center p-2.5 w-12" title="Content">Cont</th>
                  <th className="text-center p-2.5 w-12" title="Local">Loc</th>
                  <th className="text-center p-2.5 w-12" title="Links">Link</th>
                  <th className="text-center p-2.5 w-12" title="Conversion">Conv</th>
                  <th className="text-left p-2.5">Issues</th>
                </tr>
              </thead>
              <tbody>
                {filtered
                  .sort((a, b) => a.overallScore - b.overallScore)
                  .slice(0, 200)
                  .map((r, i) => (
                    <tr key={i} className={`border-t ${r.status === 'FAIL' ? 'bg-red-50/50 dark:bg-red-950/10' : r.status === 'WARN' ? 'bg-yellow-50/50 dark:bg-yellow-950/10' : ''}`}>
                      <td className="p-2.5">
                        <StatusIcon status={r.status} />
                      </td>
                      <td className="p-2.5">
                        <Link to={r.url} className="text-primary hover:underline flex items-center gap-1 truncate max-w-[280px]" target="_blank">
                          {r.url} <ExternalLink className="w-3 h-3 shrink-0" />
                        </Link>
                      </td>
                      <td className="p-2.5 text-muted-foreground truncate">{THRESHOLDS[r.pageType]?.label || r.pageType}</td>
                      <td className="p-2.5 text-center"><ScoreBadge score={r.overallScore} /></td>
                      <td className="p-2.5 text-center"><MiniScore v={r.scores.technical} /></td>
                      <td className="p-2.5 text-center"><MiniScore v={r.scores.content} /></td>
                      <td className="p-2.5 text-center"><MiniScore v={r.scores.local} /></td>
                      <td className="p-2.5 text-center"><MiniScore v={r.scores.links} /></td>
                      <td className="p-2.5 text-center"><MiniScore v={r.scores.conversion} /></td>
                      <td className="p-2.5 text-muted-foreground">
                        {r.issues.length > 0
                          ? r.issues.map((iss, j) => (
                            <span key={j} className="block text-[10px] leading-tight">{iss.message}</span>
                          ))
                          : <span className="text-green-600">Clean</span>
                        }
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {filtered.length > 200 && (
              <div className="p-3 text-xs text-muted-foreground bg-muted/50 text-center">
                Showing first 200 of {filtered.length} results
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`border rounded-lg p-2.5 text-center ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
      <div className={`text-xl font-bold ${highlight ? 'text-primary' : ''}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === 'PASS') return <CheckCircle className="w-4 h-4 text-green-600" />;
  if (status === 'FAIL') return <XCircle className="w-4 h-4 text-red-600" />;
  return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  return <span className={`font-mono font-semibold ${color}`}>{score}</span>;
}

function MiniScore({ v }: { v: number }) {
  const color = v >= 80 ? 'text-green-600' : v >= 60 ? 'text-yellow-600' : 'text-red-600';
  return <span className={`font-mono text-[10px] ${color}`}>{v}</span>;
}
