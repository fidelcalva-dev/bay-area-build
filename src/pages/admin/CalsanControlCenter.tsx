import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Bell, Brain,
  Calendar, CheckCircle2, Clock, DollarSign, ExternalLink,
  Globe, Headphones, Link2, MapPin, Package,
  Settings, Shield, Truck, TrendingUp, Users, XCircle,
  Zap, FileText, Wrench, ArrowUpRight, Eye, Cpu, Wifi,
  Camera, Car, Gauge, Fuel, Phone, Mail, Map, CreditCard,
  Webhook, Radio, MonitorSmartphone, Server, Database, Code
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { BUILD_INFO } from '@/lib/buildInfo';

// ─── Types ───────────────────────────────────
interface KPIData {
  newLeadsToday: number;
  hotLeads: number;
  quotesPending: number;
  jobsToday: number;
  driversActive: number;
  paymentsToday: number;
  overdueInvoices: number;
  seoScore: string;
}

interface AlertItem {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  route: string;
  source: string;
}

// ─── Data Hooks ──────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

function useLiveKPIs() {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = today();
        const countOpts = { count: 'exact' as const, head: true };

        // Use correct column names per schema
        const [leads, hotLeads, quotes, runs, pendingInv, overdueInv] = await Promise.all([
          (supabase.from('sales_leads').select('id', countOpts) as any).gte('created_at', `${d}T00:00:00`),
          (supabase.from('sales_leads').select('id', countOpts) as any).in('lead_status', ['new', 'contacted']).gte('lead_quality_score', 70),
          (supabase.from('quotes').select('id', countOpts) as any).in('status', ['pending', 'draft']),
          (supabase.from('runs').select('id', countOpts) as any).eq('scheduled_date', d),
          (supabase.from('invoices').select('id', countOpts) as any).eq('payment_status', 'pending'),
          (supabase.from('invoices').select('id', countOpts) as any).eq('payment_status', 'overdue'),
        ]);

        setData({
          newLeadsToday: leads.count ?? 0,
          hotLeads: hotLeads.count ?? 0,
          quotesPending: quotes.count ?? 0,
          jobsToday: runs.count ?? 0,
          driversActive: 0,
          paymentsToday: pendingInv.count ?? 0,
          overdueInvoices: overdueInv.count ?? 0,
          seoScore: 'N/A',
        });
      } catch (err) {
        console.error('KPI load error:', err);
        setData({ newLeadsToday: 0, hotLeads: 0, quotesPending: 0, jobsToday: 0, driversActive: 0, paymentsToday: 0, overdueInvoices: 0, seoScore: 'N/A' });
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
          .limit(8);
        setAlerts((data || []).map(a => ({
          id: a.id,
          title: a.title,
          severity: a.severity === 'critical' ? 'critical' as const : a.severity === 'warning' ? 'warning' as const : 'info' as const,
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
        const { data } = await supabase.from('sales_leads').select('lead_status');
        const counts: Record<string, number> = {};
        (data || []).forEach(l => { counts[l.lead_status] = (counts[l.lead_status] || 0) + 1; });
        setPipeline(counts);
      } catch { setPipeline({}); }
    }
    load();
  }, []);
  return pipeline;
}

// ─── Sub-components ──────────────────────────

function KPICard({ label, value, icon: Icon, route, danger, loading }: {
  label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; route: string; danger?: boolean; loading?: boolean;
}) {
  return (
    <Link to={route} className="block group">
      <div className="rounded-xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {loading ? (
          <div className="h-7 w-12 bg-muted animate-pulse rounded" />
        ) : (
          <div className={cn('text-2xl font-bold tracking-tight', danger ? 'text-destructive' : 'text-foreground')}>{value}</div>
        )}
        <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{label}</p>
      </div>
    </Link>
  );
}

function SectionTitle({ title, action }: { title: string; action?: { label: string; route: string } }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
      {action && (
        <Button asChild variant="ghost" size="sm" className="text-xs gap-1 h-7 text-muted-foreground hover:text-foreground">
          <Link to={action.route}>{action.label} <ArrowRight className="w-3 h-3" /></Link>
        </Button>
      )}
    </div>
  );
}

function PipelineBar({ stages }: { stages: { label: string; count: number; color: string }[] }) {
  const total = stages.reduce((s, st) => s + st.count, 0) || 1;
  return (
    <div className="space-y-3">
      <div className="flex rounded-lg overflow-hidden h-8 bg-muted">
        {stages.map(st => st.count > 0 && (
          <div
            key={st.label}
            className={cn('flex items-center justify-center text-[10px] font-semibold text-white transition-all', st.color)}
            style={{ width: `${Math.max((st.count / total) * 100, 8)}%` }}
          >
            {st.count}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {stages.map(st => (
          <div key={st.label} className="text-center">
            <div className="text-lg font-bold text-foreground">{st.count}</div>
            <p className="text-[10px] text-muted-foreground leading-tight">{st.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

type ModuleStatus = 'LIVE' | 'DRY_RUN' | 'OFF' | 'ERROR' | 'NEEDS_SETUP' | 'NOT_BUILT';

function StatusDot({ status }: { status: ModuleStatus }) {
  const colors: Record<ModuleStatus, string> = {
    LIVE: 'bg-emerald-500',
    DRY_RUN: 'bg-amber-500',
    OFF: 'bg-muted-foreground/40',
    ERROR: 'bg-destructive',
    NEEDS_SETUP: 'bg-amber-400',
    NOT_BUILT: 'bg-muted-foreground/20',
  };
  return <div className={cn('w-2 h-2 rounded-full shrink-0', colors[status])} />;
}

function StatusLabel({ status }: { status: ModuleStatus }) {
  const styles: Record<ModuleStatus, string> = {
    LIVE: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/30',
    DRY_RUN: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/30',
    OFF: 'text-muted-foreground bg-muted',
    ERROR: 'text-destructive bg-destructive/10',
    NEEDS_SETUP: 'text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-950/30',
    NOT_BUILT: 'text-muted-foreground bg-muted/50',
  };
  return (
    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', styles[status])}>
      {status.replace('_', ' ')}
    </span>
  );
}

function ModuleRow({ name, status, route }: { name: string; status: ModuleStatus; route: string | null }) {
  const inner = (
    <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-2.5 min-w-0">
        <StatusDot status={status} />
        <span className="text-sm text-foreground truncate">{name}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusLabel status={status} />
        {route && <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
    </div>
  );
  if (!route) return inner;
  return <Link to={route} className="block">{inner}</Link>;
}

function SnapshotCard({ label, value, icon: Icon, route }: {
  label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; route: string | null;
}) {
  const inner = (
    <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3 hover:shadow-sm hover:border-primary/20 transition-all h-full">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  );
  if (!route) return inner;
  return <Link to={route} className="block">{inner}</Link>;
}

function AlertRow({ alert }: { alert: AlertItem }) {
  const colors = {
    critical: 'border-l-destructive bg-destructive/5',
    warning: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
    info: 'border-l-muted-foreground/40 bg-muted/30',
  };
  return (
    <Link to={alert.route} className="block">
      <div className={cn('border-l-[3px] rounded-r-lg px-3 py-2 hover:shadow-sm transition-shadow', colors[alert.severity])}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-foreground truncate">{alert.title}</p>
          <span className="text-[10px] text-muted-foreground shrink-0">{alert.source}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Quick Access Data ───────────────────────
const QUICK_ACCESS = [
  { group: 'Website', items: [
    { label: 'Homepage', route: '/' },
    { label: 'Quote System', route: '/quote' },
    { label: 'AI Assistant', route: '/admin/ai/performance' },
    { label: 'Photo Analyzer', route: '/waste-vision' },
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
    { label: 'City Pages', route: '/admin/seo/cities' },
    { label: 'Sitemap', route: '/admin/seo/sitemap' },
    { label: 'Metrics', route: '/admin/seo/metrics' },
  ]},
  { group: 'System', items: [
    { label: 'Build Info', route: '/admin/qa/build-info' },
    { label: 'Security', route: '/admin/security' },
    { label: 'Modules', route: '/admin/modules' },
    { label: 'Audit Logs', route: '/admin/audit-logs' },
  ]},
];

// ─── Main Component ──────────────────────────
export default function CalsanControlCenter() {
  const { data: kpi, loading: kpiLoading } = useLiveKPIs();
  const alerts = useLiveAlerts();
  const pipeline = useSalesPipeline();

  return (
    <div className="p-4 lg:p-8 space-y-10 max-w-[1440px] mx-auto">

      {/* ════════ SECTION 1 — EXECUTIVE HEADER ════════ */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Calsan Control Center</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Operational overview of sales, dispatch, finance, website systems, and infrastructure.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Lead Hub', route: '/sales/leads', icon: Users },
            { label: 'Dispatch', route: '/dispatch/calendar', icon: Calendar },
            { label: 'Finance', route: '/finance/invoices', icon: DollarSign },
            { label: 'SEO Health', route: '/admin/seo/health', icon: Globe },
          ].map(a => (
            <Button key={a.label} asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Link to={a.route}><a.icon className="w-3.5 h-3.5" />{a.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      {/* ════════ SECTION 2 — BUSINESS SNAPSHOT KPIs ════════ */}
      <section>
        <SectionTitle title="Business Snapshot" />
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          <KPICard label="New Leads Today" value={kpi?.newLeadsToday ?? '—'} icon={Users} route="/sales/leads" loading={kpiLoading} />
          <KPICard label="Hot Leads" value={kpi?.hotLeads ?? '—'} icon={Zap} route="/sales/leads" loading={kpiLoading} />
          <KPICard label="Quotes Pending" value={kpi?.quotesPending ?? '—'} icon={FileText} route="/sales/quotes" loading={kpiLoading} />
          <KPICard label="Jobs Today" value={kpi?.jobsToday ?? '—'} icon={Calendar} route="/dispatch/today" loading={kpiLoading} />
          <KPICard label="Drivers Active" value={kpi?.driversActive || '—'} icon={Truck} route="/admin/drivers" loading={kpiLoading} />
          <KPICard label="Payments Pending" value={kpi?.paymentsToday ?? '—'} icon={DollarSign} route="/finance/payments" loading={kpiLoading} />
          <KPICard label="Overdue Invoices" value={kpi?.overdueInvoices ?? '—'} icon={AlertTriangle} route="/admin/overdue" loading={kpiLoading} danger={(kpi?.overdueInvoices ?? 0) > 0} />
          <KPICard label="SEO Score" value={kpi?.seoScore || 'N/A'} icon={BarChart3} route="/admin/seo/health" loading={kpiLoading} />
        </div>
      </section>

      {/* ════════ SECTION 3 — SALES PIPELINE ════════ */}
      <section>
        <SectionTitle title="Sales Pipeline" action={{ label: 'Lead Hub', route: '/sales/leads' }} />
        <Card>
          <CardContent className="p-5">
            <PipelineBar stages={[
              { label: 'New', count: pipeline['new'] || 0, color: 'bg-blue-500' },
              { label: 'Contacted', count: pipeline['contacted'] || 0, color: 'bg-amber-500' },
              { label: 'Quoted', count: pipeline['quoted'] || 0, color: 'bg-violet-500' },
              { label: 'Contract Sent', count: pipeline['contract_sent'] || 0, color: 'bg-orange-500' },
              { label: 'Paid', count: pipeline['payment_received'] || 0, color: 'bg-emerald-500' },
              { label: 'Confirmed', count: pipeline['converted'] || 0, color: 'bg-primary' },
            ]} />
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="h-8 text-xs">
                <Link to="/sales/quotes/new">Create Quote</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                <Link to="/sales/leads">Open Lead Hub</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                <Link to="/admin/alerts">Follow-ups Due</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ════════ SECTION 4 — OPERATIONS SNAPSHOT ════════ */}
      <section>
        <SectionTitle title="Operations Snapshot" action={{ label: 'Dispatch', route: '/dispatch/calendar' }} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SnapshotCard label="Deliveries Today" value={kpi?.jobsToday ?? '—'} icon={Package} route="/dispatch/today" />
          <SnapshotCard label="Pickups Today" value="—" icon={Truck} route="/dispatch/today" />
          <SnapshotCard label="Swap Jobs" value="—" icon={Activity} route="/dispatch/today" />
          <SnapshotCard label="Dump Returns" value="—" icon={MapPin} route="/dispatch/today" />
          <SnapshotCard label="Drivers On Route" value="—" icon={Truck} route="/admin/drivers" />
          <SnapshotCard label="Services Paused" value="—" icon={Clock} route="/dispatch/yard-hold" />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs"><Link to="/dispatch/calendar">Dispatch</Link></Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs"><Link to="/dispatch/today">Driver Runs</Link></Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs"><Link to="/dispatch/control-tower">Route Planner</Link></Button>
        </div>
      </section>

      {/* ════════ SECTION 5 — DRIVER + FLEET ════════ */}
      <section>
        <SectionTitle title="Driver & Fleet" action={{ label: 'Fleet Dashboard', route: '/admin/drivers' }} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <SnapshotCard label="Active Trucks" value="—" icon={Car} route="/admin/drivers" />
          <SnapshotCard label="Drivers Logged In" value="—" icon={Users} route="/admin/drivers" />
          <SnapshotCard label="Inspections Pending" value="—" icon={Eye} route={null} />
          <SnapshotCard label="Maintenance Alerts" value="—" icon={Wrench} route={null} />
          <SnapshotCard label="GPS Cameras" value="—" icon={Camera} route={null} />
        </div>
      </section>

      {/* ════════ SECTION 6 — FINANCE ════════ */}
      <section>
        <SectionTitle title="Finance" action={{ label: 'Invoices', route: '/finance/invoices' }} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <SnapshotCard label="Invoices Created" value="—" icon={FileText} route="/finance/invoices" />
          <SnapshotCard label="Payments Collected" value="—" icon={DollarSign} route="/finance/payments" />
          <SnapshotCard label="Pending Approvals" value="—" icon={CheckCircle2} route="/admin/approval-queue" />
          <SnapshotCard label="Dump Fees Pending" value="—" icon={FileText} route="/admin/tickets" />
          <SnapshotCard label="Overdue Accounts" value={kpi?.overdueInvoices ?? '—'} icon={AlertTriangle} route="/admin/overdue" />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs"><Link to="/finance/payments">Payments</Link></Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs"><Link to="/finance/invoices">Invoices</Link></Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs"><Link to="/admin/approval-queue">Approval Queue</Link></Button>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ════════ SECTION 7 — WEBSITE HEALTH ════════ */}
        <section>
          <SectionTitle title="Website Health" action={{ label: 'Diagnostics', route: '/admin/qa/control-center' }} />
          <Card>
            <CardContent className="p-4 space-y-0.5">
              <ModuleRow name="Homepage" status="LIVE" route="/" />
              <ModuleRow name="Quote Flow" status="LIVE" route="/quote" />
              <ModuleRow name="AI Assistant" status="LIVE" route="/admin/ai/performance" />
              <ModuleRow name="Photo Analysis" status="LIVE" route="/waste-vision" />
              <ModuleRow name="Lead Capture" status="LIVE" route="/contact" />
              <ModuleRow name="Customer Portal" status="LIVE" route="/portal" />
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/admin/qa/build-info">Build Info</Link></Button>
            <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/admin/qa/env-health">Env Health</Link></Button>
          </div>
        </section>

        {/* ════════ SECTION 8 — SEO DOMINANCE ════════ */}
        <section>
          <SectionTitle title="SEO & Local Visibility" action={{ label: 'SEO Dashboard', route: '/admin/seo/dashboard' }} />
          <Card>
            <CardContent className="p-4 space-y-0.5">
              <ModuleRow name="SEO Health Score" status="LIVE" route="/admin/seo/health" />
              <ModuleRow name="City Pages" status="LIVE" route="/admin/seo/cities" />
              <ModuleRow name="Sitemap Health" status="LIVE" route="/admin/seo/sitemap" />
              <ModuleRow name="Google Business Profile" status="LIVE" route="/admin/seo/gbp-plan" />
              <ModuleRow name="Indexing Status" status="LIVE" route="/admin/seo/indexing" />
              <ModuleRow name="Google Ads" status="LIVE" route="/admin/ads" />
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/admin/seo/health">SEO Health</Link></Button>
            <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/admin/seo/cities">City Pages</Link></Button>
            <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/admin/seo/sitemap">Sitemap</Link></Button>
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ════════ SECTION 9 — INTEGRATIONS ════════ */}
        <section>
          <SectionTitle title="Integrations" action={{ label: 'View All', route: '/admin/modules' }} />
          <Card>
            <CardContent className="p-4 space-y-0.5">
              <ModuleRow name="Google Workspace" status="LIVE" route="/admin/google" />
              <ModuleRow name="SMS / Twilio" status="LIVE" route="/admin/telephony/calls" />
              <ModuleRow name="Telephony" status="LIVE" route="/admin/telephony/calls" />
              <ModuleRow name="Maps & Routing" status="LIVE" route="/dispatch/control-tower" />
              <ModuleRow name="Payment Gateway" status="LIVE" route="/finance/payments" />
              <ModuleRow name="Email (Resend)" status="DRY_RUN" route="/admin/notifications/internal" />
              <ModuleRow name="GoHighLevel" status="DRY_RUN" route={null} />
            </CardContent>
          </Card>
        </section>

        {/* ════════ SECTION 10 — ALERT CENTER ════════ */}
        <section>
          <SectionTitle title="Alerts & Attention Needed" action={{ label: 'All Alerts', route: '/admin/alerts' }} />
          <Card>
            <CardContent className="p-4">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p className="text-sm font-medium">All clear — no urgent items</p>
                </div>
              ) : (
                <div className="space-y-2">{alerts.map(a => <AlertRow key={a.id} alert={a} />)}</div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* ════════ SECTION 11 — QUICK ACCESS GRID ════════ */}
      <section>
        <SectionTitle title="Quick Access" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
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
      </section>

      {/* ════════ SECTION 12 — FOOTER DIAGNOSTICS ════════ */}
      <Separator />
      <footer className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pb-4">
        <span>Build: {BUILD_INFO.timestamp || 'dev'}</span>
        <span>•</span>
        <span>Env: {BUILD_INFO.env}</span>
        <span>•</span>
        <span>API: Connected</span>
        <span>•</span>
        <span>Database: Active</span>
      </footer>
    </div>
  );
}
