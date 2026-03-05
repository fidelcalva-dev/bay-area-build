import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { BarChart3, Globe, Link2, FileText, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { getAllSitemapEntries } from '@/lib/sitemap';
import { DUMPSTER_SIZES_DATA } from '@/lib/shared-data';

// ── Internal Link Strength Score Calculator ──────────────────
interface PageMetric {
  url: string;
  title: string;
  type: string;
  linksIn: number;
  linksOut: number;
  anchorDiversity: number;
  score: number;
  grade: 'green' | 'yellow' | 'red';
}

function calculateLinkScore(linksIn: number, linksOut: number, anchorDiversity: number): { score: number; grade: 'green' | 'yellow' | 'red' } {
  // Score: 0-100 based on incoming links, outgoing links, and anchor diversity
  const inScore = Math.min(linksIn * 10, 30); // max 30 pts
  const outScore = Math.min(linksOut * 5, 30); // max 30 pts
  const diversityScore = Math.min(anchorDiversity * 10, 40); // max 40 pts
  const score = inScore + outScore + diversityScore;
  const grade = score >= 60 ? 'green' : score >= 30 ? 'yellow' : 'red';
  return { score, grade };
}

const gradeColors = {
  green: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  yellow: 'bg-amber-500/10 text-amber-700 border-amber-200',
  red: 'bg-red-500/10 text-red-700 border-red-200',
};

const gradeLabels = { green: 'Strong', yellow: 'Moderate', red: 'Weak' };

export default function SeoAdminDashboard() {
  // Fetch all SEO pages from DB
  const { data: seoPages } = useQuery({
    queryKey: ['admin-seo-dashboard-pages'],
    queryFn: async () => {
      const { data } = await supabase
        .from('seo_pages')
        .select('id, url_path, title, page_type, is_published, faq_json, sections_json, schema_json')
        .order('url_path');
      return data || [];
    },
  });

  // Fetch cities
  const { data: cities } = useQuery({
    queryKey: ['admin-seo-dashboard-cities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('seo_cities')
        .select('id, city_name, city_slug, is_active, neighborhoods_json, nearby_cities_json')
        .order('city_name');
      return data || [];
    },
  });

  // Fetch location registry
  const { data: registry } = useQuery({
    queryKey: ['admin-seo-dashboard-registry'],
    queryFn: async () => {
      const { data } = await supabase
        .from('seo_locations_registry')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });
      return data || [];
    },
  });

  // Static sitemap entries
  const sitemapEntries = getAllSitemapEntries();

  // Calculate page metrics
  const flagshipPages = [
    { url: '/dumpster-rental-oakland-ca', title: 'Dumpster Rental Oakland CA', type: 'Flagship' },
    { url: '/dumpster-rental-san-jose-ca', title: 'Dumpster Rental San Jose CA', type: 'Flagship' },
    { url: '/dumpster-rental-san-francisco-ca', title: 'Dumpster Rental San Francisco CA', type: 'Flagship' },
  ];

  const allPages: PageMetric[] = [
    ...flagshipPages.map(p => {
      // Flagship pages have strong internal linking
      const { score, grade } = calculateLinkScore(5, 8, 4);
      return { ...p, linksIn: 5, linksOut: 8, anchorDiversity: 4, score, grade };
    }),
    ...(seoPages || []).map((p: any) => {
      const faqs = Array.isArray(p.faq_json) ? p.faq_json.length : 0;
      const sections = Array.isArray(p.sections_json) ? p.sections_json.length : 0;
      const schemas = Array.isArray(p.schema_json) ? p.schema_json.length : 0;
      const linksIn = p.page_type === 'CITY' ? 4 : 2;
      const linksOut = sections + faqs > 0 ? 6 : 3;
      const anchorDiversity = p.page_type === 'CITY' ? 3 : 2;
      const { score, grade } = calculateLinkScore(linksIn, linksOut, anchorDiversity);
      return {
        url: p.url_path,
        title: p.title || p.url_path,
        type: p.page_type,
        linksIn,
        linksOut,
        anchorDiversity,
        score,
        grade,
      };
    }),
  ];

  const totalPages = sitemapEntries.length + (seoPages?.length || 0);
  const publishedSeoPages = seoPages?.filter((p: any) => p.is_published).length || 0;
  const activeCities = cities?.filter((c: any) => c.is_active).length || 0;
  const registryCount = registry?.length || 0;
  const avgScore = allPages.length > 0 ? Math.round(allPages.reduce((sum, p) => sum + p.score, 0) / allPages.length) : 0;
  const weakPages = allPages.filter(p => p.grade === 'red').length;

  // Content depth scoring
  const contentScores = (seoPages || []).map((p: any) => {
    const faqs = Array.isArray(p.faq_json) ? p.faq_json.length : 0;
    const sections = Array.isArray(p.sections_json) ? p.sections_json.length : 0;
    const schemas = Array.isArray(p.schema_json) ? p.schema_json.length : 0;
    const hasTitle = !!p.title && p.title.length > 0 && p.title.length <= 70;
    const depthScore = Math.min(
      (faqs > 0 ? 20 : 0) +
      (sections >= 4 ? 25 : sections * 6) +
      (schemas >= 2 ? 20 : schemas * 10) +
      (hasTitle ? 15 : 0) +
      (p.is_published ? 20 : 0),
      100
    );
    return { url: p.url_path, title: p.title, depthScore, faqs, sections, schemas, published: p.is_published };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SEO Dashboard</h1>
        <p className="text-muted-foreground">Internal link strength, content depth, and page metrics.</p>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Sitemap Pages', value: totalPages, icon: Globe, color: 'text-primary' },
          { label: 'SEO Engine Pages', value: publishedSeoPages, icon: FileText, color: 'text-primary' },
          { label: 'Active Cities', value: activeCities, icon: BarChart3, color: 'text-primary' },
          { label: 'Registry Locations', value: registryCount, icon: Link2, color: 'text-primary' },
          { label: 'Avg Link Score', value: avgScore, icon: TrendingUp, color: avgScore >= 60 ? 'text-emerald-600' : 'text-amber-600' },
          { label: 'Weak Pages', value: weakPages, icon: AlertTriangle, color: weakPages > 0 ? 'text-red-600' : 'text-emerald-600' },
        ].map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* ── Internal Link Strength ─────────────────────────── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Internal Link Strength Score</h2>
          <div className="flex gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded border ${gradeColors.green}`}>Strong 60+</span>
            <span className={`px-2 py-0.5 rounded border ${gradeColors.yellow}`}>Moderate 30-59</span>
            <span className={`px-2 py-0.5 rounded border ${gradeColors.red}`}>Weak &lt;30</span>
          </div>
        </div>
        <div className="max-h-[400px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/50">
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">Page</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Links In</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Links Out</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Anchor Div.</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Score</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Grade</th>
              </tr>
            </thead>
            <tbody>
              {allPages.sort((a, b) => b.score - a.score).map((page, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{page.url}</code>
                  </td>
                  <td className="p-3"><Badge variant="outline" className="text-xs">{page.type}</Badge></td>
                  <td className="p-3 text-center">{page.linksIn}</td>
                  <td className="p-3 text-center">{page.linksOut}</td>
                  <td className="p-3 text-center">{page.anchorDiversity}</td>
                  <td className="p-3 text-center font-semibold">{page.score}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs border ${gradeColors[page.grade]}`}>
                      {gradeLabels[page.grade]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Content Depth Scores ───────────────────────────── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Content Depth Score</h2>
          <p className="text-xs text-muted-foreground">Based on FAQ count, sections, schema, title length, and publish status.</p>
        </div>
        <div className="max-h-[400px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/50">
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">URL</th>
                <th className="text-center p-3 font-medium text-muted-foreground">FAQs</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Sections</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Schemas</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Published</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Depth Score</th>
              </tr>
            </thead>
            <tbody>
              {contentScores.sort((a, b) => b.depthScore - a.depthScore).map((page, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{page.url}</code></td>
                  <td className="p-3 text-center">{page.faqs}</td>
                  <td className="p-3 text-center">{page.sections}</td>
                  <td className="p-3 text-center">{page.schemas}</td>
                  <td className="p-3 text-center">{page.published ? <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">-</span>}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs border ${page.depthScore >= 60 ? gradeColors.green : page.depthScore >= 30 ? gradeColors.yellow : gradeColors.red}`}>
                      {page.depthScore}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Location Registry Status ──────────────────────── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Location Registry</h2>
          <p className="text-xs text-muted-foreground">Cities in the internal link automation system.</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {(registry || []).map((loc: any) => (
              <div key={loc.id} className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-lg">
                <CheckCircle className={`w-4 h-4 shrink-0 ${loc.page_exists ? 'text-emerald-600' : 'text-amber-500'}`} />
                <div className="min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">{loc.city_name}</div>
                  <div className="text-xs text-muted-foreground">{loc.page_exists ? 'Standalone page' : 'Dynamic page'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Links ───────────────────────────────────── */}
      <div className="grid sm:grid-cols-5 gap-4">
        <Link to="/admin/seo/gbp-plan" className="bg-card border border-primary/30 rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-primary">📍 GBP Domination Plan</h3>
          <p className="text-xs text-muted-foreground">90-day playbook for Map Pack Top 3.</p>
        </Link>
        <Link to="/admin/seo/cities" className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-primary">Manage Cities</h3>
          <p className="text-xs text-muted-foreground">Add, edit, and configure SEO cities.</p>
        </Link>
        <Link to="/admin/seo/pages" className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-primary">SEO Pages</h3>
          <p className="text-xs text-muted-foreground">Manage generated SEO pages and schemas.</p>
        </Link>
        <Link to="/admin/seo/sitemap" className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-primary">Sitemap</h3>
          <p className="text-xs text-muted-foreground">View and regenerate sitemap.xml.</p>
        </Link>
        <Link to="/admin/seo/health" className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-primary">Health Check</h3>
          <p className="text-xs text-muted-foreground">Quality gates & content validation.</p>
        </Link>
        <Link to="/admin/seo/indexing" className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-primary">Indexation</h3>
          <p className="text-xs text-muted-foreground">Track pages & ping Google.</p>
        </Link>
        <Link to="/admin/seo/generate" className="bg-card border border-primary/30 rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-primary">✨ Generate Page</h3>
          <p className="text-xs text-muted-foreground">AI-generate new SEO pages.</p>
        </Link>
        <Link to="/admin/seo/queue" className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-primary">Job Queue</h3>
          <p className="text-xs text-muted-foreground">Generation & refresh job status.</p>
        </Link>
        <Link to="/admin/seo/rules" className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-primary">Content Rules</h3>
          <p className="text-xs text-muted-foreground">Guardrails & publish limits.</p>
        </Link>
        <Link to="/admin/seo/metrics" className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-primary">Metrics</h3>
          <p className="text-xs text-muted-foreground">Rankings, clicks & impressions.</p>
        </Link>
      </div>

      {/* ── Backlink Strategy Checklist ────────────────────── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Backlink Strategy Checklist</h2>
          <p className="text-xs text-muted-foreground">Actionable outreach and citation building tasks.</p>
        </div>
        <div className="p-4 space-y-6">
          {/* Citations */}
          <div>
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Directory Citations
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                'Google Business Profile', 'Yelp Business', 'BBB (Better Business Bureau)',
                'Angi (formerly Angie\'s List)', 'HomeAdvisor', 'Thumbtack',
                'Apple Maps Connect', 'Bing Places for Business',
                'Facebook Business Page', 'Yellow Pages / YP.com',
                'Nextdoor Business', 'Foursquare / Swarm',
              ].map(dir => (
                <label key={dir} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-sm cursor-pointer hover:bg-muted/50">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-foreground">{dir}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Guest Post Topics */}
          <div>
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Guest Post Topic Ideas
            </h3>
            <div className="space-y-2">
              {[
                'How to Choose the Right Dumpster Size for Your Home Renovation (for home improvement blogs)',
                'Bay Area Construction Waste Management: A Contractor\'s Guide (for construction industry sites)',
                'Sustainable Debris Disposal in the San Francisco Bay Area (for green/sustainability blogs)',
                'What Every Oakland Homeowner Should Know About Dumpster Permits (for local news/community sites)',
                'The Hidden Costs of Using a Dumpster Broker vs. a Local Hauler (for real estate/contractor sites)',
                'Concrete Recycling in the Bay Area: Why It Matters (for environmental/recycling publications)',
              ].map((topic, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg text-sm">
                  <span className="text-primary font-semibold shrink-0">{i + 1}.</span>
                  <span className="text-muted-foreground">{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contractor Outreach Template */}
          <div>
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" /> Contractor Partnership Outreach Template
            </h3>
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
              <p><strong className="text-foreground">Subject:</strong> Partnership Opportunity — Dumpster Rental for Your [Oakland/San Jose/SF] Projects</p>
              <p><strong className="text-foreground">Body:</strong> Hi [Name], I noticed your company does great work in [City]. We provide local dumpster rental services from our Bay Area yards — no brokers, transparent pricing, same-day delivery. We are looking for contractor partners who could benefit from volume discounts and priority scheduling. Would you be open to a quick call this week? We also feature trusted contractors on our website resources page.</p>
              <p><strong className="text-foreground">CTA:</strong> Link to /contractors or /quote/contractor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
