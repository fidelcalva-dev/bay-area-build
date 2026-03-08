import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Bell, Brain,
  Calendar, CheckCircle2, Clock, DollarSign, ExternalLink, Filter,
  Globe, Headphones, Link2, Loader2, MapPin, Package, Search,
  Settings, Shield, ShoppingCart, Truck, TrendingUp, Users, XCircle,
  Zap, FileText, Wrench, Eye, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ───────────────────────────────────
interface KPIData {
  newLeadsToday: number;
  hotLeads: number;
  quotesPending: number;
  jobsScheduledToday: number;
  activeRuns: number;
  paymentsPending: number;
  overdueInvoices: number;
  seoScore: number;
}

interface AlertItem {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  route: string | null;
  source: string;
}

// ─── Helpers ─────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

function useLiveKPIs() {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = today();
        const [leads, hotLeads, quotes, runs, invoices, overdueInv] = await Promise.all([
          supabase.from('sales_leads').select('id', { count: 'exact', head: true }).gte('created_at', `${d}T00:00:00`),
          supabase.from('sales_leads').select('id', { count: 'exact', head: true }).in('lead_status', ['new', 'contacted']).gte('lead_quality_score', 70),
          supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('quote_status', 'draft'),
          supabase.from('runs').select('id', { count: 'exact', head: true }).eq('run_date', d),
          supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
        ]);

        setData({
          newLeadsToday: leads.count ?? 0,
          hotLeads: hotLeads.count ?? 0,
          quotesPending: quotes.count ?? 0,
          jobsScheduledToday: runs.count ?? 0,
          activeRuns: runs.count ?? 0,
          paymentsPending: invoices.count ?? 0,
          overdueInvoices: overdueInv.count ?? 0,
          seoScore: 0,
        });
      } catch (err) {
        console.error('KPI load error:', err);
        setData({
          newLeadsToday: 0, hotLeads: 0, quotesPending: 0, jobsScheduledToday: 0,
          activeRuns: 0, paymentsPending: 0, overdueInvoices: 0, seoScore: 0,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { data, loading };
}

function useLiveAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('alerts')
          .select('id, title, severity, alert_type, entity_type')
          .eq('is_resolved', false)
          .order('created_at', { ascending: false })
          .limit(10);

        setAlerts((data || []).map(a => ({
          id: a.id,
          title: a.title,
          severity: a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'warning' : 'info',
          route: '/admin/alerts',
          source: a.entity_type || a.alert_type,
        })));
      } catch { setAlerts([]); }
    }
    load();
  }, []);
  return alerts;
}

function useSalesPipeline() {
  const [pipeline, setPipeline] = useState<Record<string, number>>({});
  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from('sales_leads').select('status');
        const counts: Record<string, number> = {};
        (data || []).forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });
        setPipeline(counts);
      } catch { setPipeline({}); }
    }
    load();
  }, []);
  return pipeline;
}

// ─── Sub-components ──────────────────────────
function KPICard({ label, value, icon, route, accent, loading }: {
  label: string; value: number | string; icon: React.ReactNode; route: string; accent?: string; loading?: boolean;
}) {
  return (
    <Link to={route} className="block group">
      <Card className="hover:shadow-lg transition-all hover:border-primary/30 h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1" />
          ) : (
            <div className={cn('text-2xl font-bold', accent || 'text-foreground')}>{value}</div>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function SectionHeader({ icon: Icon, title, action }: {
  icon: React.ComponentType<{ className?: string }>; title: string; action?: { label: string; route: string };
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {action && (
        <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
          <Link to={action.route}>{action.label} <ArrowRight className="w-3 h-3" /></Link>
        </Button>
      )}
    </div>
  );
}

function MiniCard({ label, value, route, icon }: {
  label: string; value: string | number; route: string | null; icon: React.ReactNode;
}) {
  const inner = (
    <Card className={cn('h-full', route && 'hover:shadow-md hover:border-primary/30 transition-all cursor-pointer')}>
      <CardContent className="p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{value}</p>
          <p className="text-[11px] text-muted-foreground truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
  if (!route) return inner;
  return <Link to={route} className="block">{inner}</Link>;
}

type SystemStatus = 'LIVE' | 'DRY_RUN' | 'OFF' | 'ERROR' | 'NEEDS_SETUP' | 'NOT_BUILT';

function StatusBadge({ status }: { status: SystemStatus }) {
  const styles: Record<SystemStatus, string> = {
    LIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    DRY_RUN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    OFF: 'bg-muted text-muted-foreground',
    ERROR: 'bg-destructive/10 text-destructive',
    NEEDS_SETUP: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    NOT_BUILT: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
  };
  return <Badge variant="outline" className={cn('text-[10px] font-semibold px-1.5 py-0', styles[status])}>{status.replace('_', ' ')}</Badge>;
}

function SystemCard({ name, status, route }: { name: string; status: SystemStatus; route: string | null }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <div className={cn('w-2 h-2 rounded-full shrink-0', status === 'LIVE' ? 'bg-emerald-500' : status === 'ERROR' ? 'bg-destructive' : status === 'DRY_RUN' ? 'bg-amber-500' : 'bg-muted-foreground')} />
        <span className="text-sm text-foreground truncate">{name}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={status} />
        {route && (
          <Button asChild variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Link to={route}><ExternalLink className="w-3 h-3" /></Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function PipelineStage({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex-1 text-center">
      <div className={cn('text-xl font-bold', color)}>{count}</div>
      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

function AlertRow({ alert }: { alert: AlertItem }) {
  const colors = {
    critical: 'border-l-destructive bg-destructive/5',
    warning: 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20',
    info: 'border-l-muted-foreground bg-muted/30',
  };
  return (
    <Link to={alert.route || '/admin/alerts'} className="block">
      <div className={cn('border-l-4 rounded-r-lg px-3 py-2 hover:shadow-sm transition-shadow', colors[alert.severity])}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-foreground truncate">{alert.title}</p>
          <Badge variant="outline" className="text-[10px] shrink-0">{alert.source}</Badge>
        </div>
      </div>
    </Link>
  );
}

// Quick access data
const QUICK_ACCESS = [
  { group: 'Website', items: [
    { label: 'Homepage', route: '/' },
    { label: 'Quote System', route: '/quote' },
    { label: 'AI Assistant', route: '/admin/ai/performance' },
    { label: 'SEO Pages', route: '/admin/seo/dashboard' },
  ]},
  { group: 'Sales', items: [
    { label: 'Lead Hub', route: '/sales/leads' },
    { label: 'Quote Builder', route: '/sales/quotes/new' },
    { label: 'Contracts', route: '/sales/quotes' },
    { label: 'Follow-ups', route: '/admin/alerts' },
  ]},
  { group: 'Operations', items: [
    { label: 'Dispatch', route: '/dispatch/calendar' },
    { label: 'Runs Board', route: '/dispatch/today' },
    { label: 'Driver App', route: '/driver' },
    { label: 'Yards', route: '/admin/yards' },
  ]},
  { group: 'Finance', items: [
    { label: 'Invoices', route: '/finance/invoices' },
    { label: 'Payments', route: '/finance/payments' },
    { label: 'Overdue', route: '/admin/overdue' },
    { label: 'Approval Queue', route: '/admin/approval-queue' },
  ]},
  { group: 'SEO', items: [
    { label: 'SEO Health', route: '/admin/seo/health' },
    { label: 'City Health', route: '/admin/seo/cities' },
    { label: 'Sitemap', route: '/admin/seo/sitemap' },
    { label: 'Metrics', route: '/admin/seo/metrics' },
  ]},
  { group: 'System', items: [
    { label: 'Build Info', route: '/admin/qa/build-info' },
    { label: 'Security', route: '/admin/security' },
    { label: 'Admin Config', route: '/admin/modules' },
    { label: 'Audit Logs', route: '/admin/audit-logs' },
  ]},
];

// ─── Main Component ──────────────────────────
export default function CalsanControlCenter() {
  const { data: kpi, loading: kpiLoading } = useLiveKPIs();
  const alerts = useLiveAlerts();
  const pipeline = useSalesPipeline();

  return (
    <div className="p-4 lg:p-6 xl:p-8 space-y-8 max-w-[1440px] mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Calsan Control Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Executive overview of operations, leads, dispatch, finance, SEO, integrations, and system health.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Lead Hub', route: '/sales/leads', icon: Users },
            { label: 'Dispatch', route: '/dispatch/calendar', icon: Calendar },
            { label: 'Finance', route: '/finance/invoices', icon: DollarSign },
            { label: 'SEO Health', route: '/admin/seo/health', icon: Globe },
            { label: 'Admin Config', route: '/admin/modules', icon: Settings },
          ].map(a => (
            <Button key={a.label} asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Link to={a.route}><a.icon className="w-3.5 h-3.5" />{a.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      {/* ── Section 2: KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        <KPICard label="New Leads Today" value={kpi?.newLeadsToday ?? '—'} icon={<Users className="w-4 h-4" />} route="/sales/leads" loading={kpiLoading} />
        <KPICard label="Hot Leads" value={kpi?.hotLeads ?? '—'} icon={<Zap className="w-4 h-4" />} route="/sales/leads" accent="text-amber-600" loading={kpiLoading} />
        <KPICard label="Quotes Pending" value={kpi?.quotesPending ?? '—'} icon={<FileText className="w-4 h-4" />} route="/sales/quotes" loading={kpiLoading} />
        <KPICard label="Jobs Today" value={kpi?.jobsScheduledToday ?? '—'} icon={<Calendar className="w-4 h-4" />} route="/dispatch/today" loading={kpiLoading} />
        <KPICard label="Active Runs" value={kpi?.activeRuns ?? '—'} icon={<Truck className="w-4 h-4" />} route="/dispatch/today" loading={kpiLoading} />
        <KPICard label="Payments Pending" value={kpi?.paymentsPending ?? '—'} icon={<DollarSign className="w-4 h-4" />} route="/finance/payments" loading={kpiLoading} />
        <KPICard label="Overdue Invoices" value={kpi?.overdueInvoices ?? '—'} icon={<AlertTriangle className="w-4 h-4" />} route="/admin/overdue" accent={kpi && kpi.overdueInvoices > 0 ? 'text-destructive' : undefined} loading={kpiLoading} />
        <KPICard label="SEO Score" value={kpi?.seoScore || 'N/A'} icon={<BarChart3 className="w-4 h-4" />} route="/admin/seo/health" loading={kpiLoading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Section 3: Operations Snapshot ── */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <SectionHeader icon={Truck} title="Operations" action={{ label: 'Dispatch', route: '/dispatch/calendar' }} />
          </CardHeader>
          <CardContent className="space-y-1.5">
            <MiniCard label="Deliveries Today" value={kpi?.jobsScheduledToday ?? '—'} route="/dispatch/today" icon={<Package className="w-4 h-4 text-primary" />} />
            <MiniCard label="Pickups Today" value="—" route="/dispatch/today" icon={<Truck className="w-4 h-4 text-primary" />} />
            <MiniCard label="Active Runs" value={kpi?.activeRuns ?? '—'} route="/dispatch/today" icon={<Activity className="w-4 h-4 text-emerald-600" />} />
            <MiniCard label="Yard Holds" value="—" route="/dispatch/yard-hold" icon={<Clock className="w-4 h-4 text-amber-600" />} />
          </CardContent>
        </Card>

        {/* ── Section 4: Sales Pipeline ── */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <SectionHeader icon={ShoppingCart} title="Sales Pipeline" action={{ label: 'Lead Hub', route: '/sales/leads' }} />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-1 mb-4">
              <PipelineStage label="New" count={pipeline['new'] || 0} color="text-blue-600" />
              <PipelineStage label="Contacted" count={pipeline['contacted'] || 0} color="text-amber-600" />
              <PipelineStage label="Quoted" count={pipeline['quoted'] || 0} color="text-violet-600" />
            </div>
            <div className="grid grid-cols-3 gap-1 mb-4">
              <PipelineStage label="Contract Sent" count={pipeline['contract_sent'] || 0} color="text-orange-600" />
              <PipelineStage label="Paid" count={pipeline['payment_received'] || 0} color="text-emerald-600" />
              <PipelineStage label="Confirmed" count={pipeline['job_confirmed'] || 0} color="text-primary" />
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button asChild variant="default" size="sm" className="flex-1 h-8 text-xs">
                <Link to="/sales/quotes/new">Create Quote</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs">
                <Link to="/sales/leads">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Section 5: Finance ── */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <SectionHeader icon={DollarSign} title="Finance" action={{ label: 'Invoices', route: '/finance/invoices' }} />
          </CardHeader>
          <CardContent className="space-y-1.5">
            <MiniCard label="Payments Pending" value={kpi?.paymentsPending ?? '—'} route="/finance/payments" icon={<Clock className="w-4 h-4 text-amber-600" />} />
            <MiniCard label="Overdue Invoices" value={kpi?.overdueInvoices ?? '—'} route="/admin/overdue" icon={<AlertTriangle className="w-4 h-4 text-destructive" />} />
            <MiniCard label="Approval Queue" value="—" route="/admin/approval-queue" icon={<CheckCircle2 className="w-4 h-4 text-primary" />} />
            <MiniCard label="Dump Fee Recon" value="—" route="/admin/tickets" icon={<FileText className="w-4 h-4 text-muted-foreground" />} />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Section 6: Platform Health ── */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={Activity} title="Platform Health" action={{ label: 'Diagnostics', route: '/admin/qa/control-center' }} />
          </CardHeader>
          <CardContent className="space-y-0.5">
            {[
              { name: 'Website', status: 'LIVE' as SystemStatus, route: '/' },
              { name: 'Quote Flow', status: 'LIVE' as SystemStatus, route: '/quote' },
              { name: 'AI Assistant', status: 'LIVE' as SystemStatus, route: '/admin/ai/performance' },
              { name: 'CRM / Lead Hub', status: 'LIVE' as SystemStatus, route: '/sales/leads' },
              { name: 'Customer Portal', status: 'LIVE' as SystemStatus, route: '/portal' },
              { name: 'Email Pipeline', status: 'DRY_RUN' as SystemStatus, route: '/admin/email-config' },
              { name: 'GoHighLevel', status: 'DRY_RUN' as SystemStatus, route: '/admin/ghl' },
              { name: 'Build Health', status: 'LIVE' as SystemStatus, route: '/admin/qa/build-health' },
            ].map(s => <SystemCard key={s.name} {...s} />)}
          </CardContent>
        </Card>

        {/* ── Section 7: SEO & Local Visibility ── */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={Globe} title="SEO & Local Visibility" action={{ label: 'SEO Dashboard', route: '/admin/seo/dashboard' }} />
          </CardHeader>
          <CardContent className="space-y-0.5">
            {[
              { name: 'SEO Health Score', status: 'LIVE' as SystemStatus, route: '/admin/seo/health' },
              { name: 'City Pages', status: 'LIVE' as SystemStatus, route: '/admin/seo/cities' },
              { name: 'Sitemap Health', status: 'LIVE' as SystemStatus, route: '/admin/seo/sitemap' },
              { name: 'Google Business Profile', status: 'LIVE' as SystemStatus, route: '/admin/seo/gbp-plan' },
              { name: 'Indexing Status', status: 'LIVE' as SystemStatus, route: '/admin/seo/indexing' },
              { name: 'SEO Audit Engine', status: 'LIVE' as SystemStatus, route: '/admin/seo/audit' },
              { name: 'Visitor Intelligence', status: 'LIVE' as SystemStatus, route: '/admin/marketing/visitors' },
              { name: 'Google Ads', status: 'LIVE' as SystemStatus, route: '/admin/ads' },
            ].map(s => <SystemCard key={s.name} {...s} />)}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Section 8: Integrations ── */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={Link2} title="Integrations" action={{ label: 'View All', route: '/admin/modules' }} />
          </CardHeader>
          <CardContent className="space-y-0.5">
            {[
              { name: 'Google Workspace', status: 'LIVE' as SystemStatus, route: '/admin/google' },
              { name: 'SMS / Twilio', status: 'LIVE' as SystemStatus, route: '/admin/telephony/calls' },
              { name: 'Telephony', status: 'LIVE' as SystemStatus, route: '/admin/telephony/calls' },
              { name: 'Maps & Routing', status: 'LIVE' as SystemStatus, route: '/dispatch/control-tower' },
              { name: 'Payment Gateway', status: 'LIVE' as SystemStatus, route: '/finance/payments' },
              { name: 'GoHighLevel', status: 'DRY_RUN' as SystemStatus, route: '/admin/ghl' },
              { name: 'Email (Resend)', status: 'DRY_RUN' as SystemStatus, route: '/admin/email-config' },
            ].map(s => <SystemCard key={s.name} {...s} />)}
          </CardContent>
        </Card>

        {/* ── Section 9: Alert Center ── */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={Bell} title="Alerts & Attention Needed" action={{ label: 'All Alerts', route: '/admin/alerts' }} />
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <p className="text-sm font-medium">All clear — no urgent items</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map(a => <AlertRow key={a.id} alert={a} />)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Section 10: Quick Access ── */}
      <div>
        <SectionHeader icon={Zap} title="Quick Access" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-3">
          {QUICK_ACCESS.map(g => (
            <div key={g.group}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{g.group}</p>
              <div className="space-y-1">
                {g.items.map(item => (
                  <Link key={item.label} to={item.route} className="block text-sm text-foreground hover:text-primary transition-colors py-0.5">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
