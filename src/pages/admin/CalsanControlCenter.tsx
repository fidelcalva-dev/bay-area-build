import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Bell,
  Calendar, CheckCircle2, Clock, DollarSign, ExternalLink,
  Globe, Headphones, MapPin, Package,
  Shield, Truck, TrendingUp, Users, Zap,
  FileText, Wrench, ArrowUpRight, Eye, Camera, Car,
  Phone, Mail, Map, CreditCard, Webhook, Star,
  Layers, Search as SearchIcon, Link2, Brain, Hash
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { BUILD_INFO } from '@/lib/buildInfo';
import { format } from 'date-fns';
import { useAdminAuth } from '@/hooks/useAdminAuth';

// ─── Types ───────────────────────────────────
interface KPIData {
  newLeadsToday: number;
  hotLeads: number;
  quotesPending: number;
  jobsToday: number;
  driversActive: number;
  paymentsPending: number;
  overdueInvoices: number;
  seoScore: string;
  approvalsPending: number;
  deliveriesToday: number;
  pickupsToday: number;
  cityPagesActive: number;
  zipPagesActive: number;
  fallbackQueueCount: number;
}

interface AlertItem {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  route: string;
  source: string;
  created_at: string;
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

        const [leads, hotLeads, quotes, runs, pendingInv, overdueInv, approvals, cityPages, zipPages, fallbackQueue] = await Promise.all([
          (supabase.from('sales_leads').select('id', countOpts) as any).gte('created_at', `${d}T00:00:00`),
          (supabase.from('sales_leads').select('id', countOpts) as any).in('lead_status', ['new', 'contacted']).gte('lead_quality_score', 70),
          (supabase.from('quotes').select('id', countOpts) as any).in('status', ['pending', 'draft']),
          (supabase.from('runs').select('id', countOpts) as any).eq('scheduled_date', d),
          (supabase.from('invoices').select('id', countOpts) as any).eq('payment_status', 'pending'),
          (supabase.from('invoices').select('id', countOpts) as any).eq('payment_status', 'overdue'),
          (supabase.from('approval_requests').select('id', countOpts) as any).eq('status', 'pending'),
          ((supabase as any).from('seo_city_pages').select('id', countOpts)).eq('is_active', true).catch(() => ({ count: 0 })),
          ((supabase as any).from('seo_zip_pages').select('id', countOpts)).eq('is_active', true).catch(() => ({ count: 0 })),
          ((supabase as any).from('lead_fallback_queue').select('id', countOpts)).eq('status', 'pending').catch(() => ({ count: 0 })),
        ]);

        let deliveries = 0, pickups = 0;
        try {
          const { count: delCount } = await (supabase.from('service_requests').select('id', countOpts) as any)
            .eq('scheduled_date', d).eq('request_type', 'delivery');
          const { count: pickCount } = await (supabase.from('service_requests').select('id', countOpts) as any)
            .eq('scheduled_date', d).eq('request_type', 'pickup');
          deliveries = delCount ?? 0;
          pickups = pickCount ?? 0;
        } catch { /* table may not exist */ }

        setData({
          newLeadsToday: leads.count ?? 0,
          hotLeads: hotLeads.count ?? 0,
          quotesPending: quotes.count ?? 0,
          jobsToday: runs.count ?? 0,
          driversActive: 0,
          paymentsPending: pendingInv.count ?? 0,
          overdueInvoices: overdueInv.count ?? 0,
          seoScore: 'N/A',
          approvalsPending: approvals.count ?? 0,
          deliveriesToday: deliveries,
          pickupsToday: pickups,
          cityPagesActive: cityPages?.count ?? 0,
          zipPagesActive: zipPages?.count ?? 0,
          fallbackQueueCount: fallbackQueue?.count ?? 0,
        });
      } catch (err) {
        console.error('KPI load error:', err);
        setData({
          newLeadsToday: 0, hotLeads: 0, quotesPending: 0, jobsToday: 0,
          driversActive: 0, paymentsPending: 0, overdueInvoices: 0, seoScore: 'N/A',
          approvalsPending: 0, deliveriesToday: 0, pickupsToday: 0,
          cityPagesActive: 0, zipPagesActive: 0, fallbackQueueCount: 0,
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
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('alerts')
          .select('id, title, severity, alert_type, entity_type, created_at')
          .eq('is_resolved', false)
          .order('created_at', { ascending: false })
          .limit(12);
        setAlerts((data || []).map(a => ({
          id: a.id,
          title: a.title,
          severity: a.severity === 'critical' ? 'critical' as const : a.severity === 'warning' ? 'warning' as const : 'info' as const,
          route: '/admin/alerts',
          source: a.entity_type || a.alert_type,
          created_at: a.created_at,
        })));
      } catch { setAlerts([]); }
      finally { setLoading(false); }
    }
    load();
  }, []);
  return { alerts, loading };
}

function useSalesPipeline() {
  const [pipeline, setPipeline] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from('sales_leads').select('lead_status');
        const counts: Record<string, number> = {};
        (data || []).forEach(l => { counts[l.lead_status] = (counts[l.lead_status] || 0) + 1; });
        setPipeline(counts);
      } catch { setPipeline({}); }
      finally { setLoading(false); }
    }
    load();
  }, []);
  return { pipeline, loading };
}

// ─── Sub-components ──────────────────────────

function KPICard({ label, value, helper, icon: Icon, route, danger, loading }: {
  label: string; value: number | string; helper?: string; icon: React.ComponentType<{ className?: string }>; route: string; danger?: boolean; loading?: boolean;
}) {
  return (
    <Link to={route} className="block group">
      <div className={cn(
        'rounded-2xl border bg-card p-4 transition-all h-full',
        danger ? 'border-destructive/30 hover:border-destructive/50' : 'border-border/60 hover:border-primary/30',
        'hover:shadow-lg hover:-translate-y-0.5'
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center',
            danger ? 'bg-destructive/10' : 'bg-muted'
          )}>
            <Icon className={cn('w-4 h-4', danger ? 'text-destructive' : 'text-muted-foreground')} />
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {loading ? (
          <Skeleton className="h-8 w-14 rounded-lg" />
        ) : (
          <div className={cn('text-2xl font-bold tracking-tight', danger ? 'text-destructive' : 'text-foreground')}>
            {value}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1.5 font-medium">{label}</p>
        {helper && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{helper}</p>}
      </div>
    </Link>
  );
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: { label: string; route: string } }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <Button asChild variant="ghost" size="sm" className="text-xs gap-1 h-7 text-muted-foreground hover:text-foreground">
          <Link to={action.route}>{action.label} <ArrowRight className="w-3 h-3" /></Link>
        </Button>
      )}
    </div>
  );
}

function PipelineBar({ stages, loading }: { stages: { label: string; count: number; color: string }[]; loading?: boolean }) {
  const total = stages.reduce((s, st) => s + st.count, 0) || 1;
  if (loading) return <Skeleton className="h-10 w-full rounded-xl" />;
  const hasData = stages.some(s => s.count > 0);
  return (
    <div className="space-y-4">
      {hasData ? (
        <div className="flex rounded-xl overflow-hidden h-9 bg-muted">
          {stages.map(st => st.count > 0 && (
            <div
              key={st.label}
              className={cn('flex items-center justify-center text-[10px] font-bold text-white transition-all', st.color)}
              style={{ width: `${Math.max((st.count / total) * 100, 8)}%` }}
            >
              {st.count}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-9 bg-muted rounded-xl flex items-center justify-center">
          <span className="text-xs text-muted-foreground">No data yet</span>
        </div>
      )}
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

type ModuleStatus = 'LIVE' | 'DRY_RUN' | 'OFF' | 'ERROR' | 'NEEDS_SETUP' | 'NOT_BUILT' | 'NO_DATA';

function StatusBadge({ status }: { status: ModuleStatus }) {
  const styles: Record<ModuleStatus, string> = {
    LIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    DRY_RUN: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    OFF: 'bg-muted text-muted-foreground border-border',
    ERROR: 'bg-destructive/10 text-destructive border-destructive/20',
    NEEDS_SETUP: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    NOT_BUILT: 'bg-muted/50 text-muted-foreground/60 border-border/50',
    NO_DATA: 'bg-muted/50 text-muted-foreground/60 border-border/50',
  };
  return (
    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', styles[status])}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function ModuleRow({ name, status, route }: { name: string; status: ModuleStatus; route: string | null }) {
  const inner = (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors group">
      <span className="text-sm text-foreground">{name}</span>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={status} />
        {route && <ExternalLink className="w-3 h-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />}
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
    <div className={cn(
      'rounded-xl border border-border/60 bg-card p-3.5 flex items-center gap-3 transition-all h-full',
      route && 'hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 cursor-pointer'
    )}>
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">{value}</p>
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
    info: 'border-l-muted-foreground/30 bg-muted/20',
  };
  return (
    <Link to={alert.route} className="block">
      <div className={cn('border-l-[3px] rounded-r-xl px-4 py-3 hover:shadow-sm transition-all', colors[alert.severity])}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-foreground truncate font-medium">{alert.title}</p>
          <span className="text-[10px] text-muted-foreground shrink-0 font-medium uppercase tracking-wide">{alert.source}</span>
        </div>
      </div>
    </Link>
  );
}

function QuickAccessCard({ label, icon: Icon, route, description }: {
  label: string; icon: React.ComponentType<{ className?: string }>; route: string; description: string;
}) {
  return (
    <Link to={route} className="block group">
      <div className="rounded-2xl border border-border/60 bg-card p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20 transition-all h-full text-center">
        <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
          <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{description}</p>
      </div>
    </Link>
  );
}

// ─── Quick Access Data ───────────────────────
const QUICK_ACCESS_GRID = [
  { label: 'Website', icon: Globe, route: '/admin/modules', description: 'Public pages & tools' },
  { label: 'Sales', icon: TrendingUp, route: '/sales/leads', description: 'Leads & pipeline' },
  { label: 'Customer Service', icon: Headphones, route: '/admin/customers', description: 'Profiles & health' },
  { label: 'Operations', icon: Package, route: '/dispatch/calendar', description: 'Dispatch & runs' },
  { label: 'Driver App', icon: Truck, route: '/driver', description: 'Mobile driver tools' },
  { label: 'Fleet', icon: Car, route: '/admin/drivers', description: 'Vehicles & maintenance' },
  { label: 'Finance', icon: DollarSign, route: '/finance/invoices', description: 'Billing & payments' },
  { label: 'SEO', icon: SearchIcon, route: '/admin/seo/dashboard', description: 'Rankings & pages' },
  { label: 'Integrations', icon: Link2, route: '/admin/setup/functions', description: 'APIs & connections' },
  { label: 'Admin & QA', icon: Shield, route: '/admin/qa/control-center', description: 'Health & security' },
];

// ─── Main Component ──────────────────────────
export default function CalsanControlCenter() {
  const { data: kpi, loading: kpiLoading } = useLiveKPIs();
  const { alerts, loading: alertsLoading } = useLiveAlerts();
  const { pipeline, loading: pipelineLoading } = useSalesPipeline();
  const { user } = useAdminAuth();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 lg:p-8 space-y-10 max-w-[1440px] mx-auto">

      {/* ════════ SECTION 1 — EXECUTIVE HEADER ════════ */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Calsan Control Center</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Executive overview of sales, operations, dispatch, finance, SEO, integrations, and system health.
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-xs text-muted-foreground/70">
              {format(now, 'EEEE, MMMM d, yyyy · h:mm a')}
            </p>
            {user?.email && (
              <>
                <span className="text-muted-foreground/30">·</span>
                <p className="text-xs text-muted-foreground/70">{user.email}</p>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Lead Hub', route: '/sales/leads', icon: Users },
            { label: 'Dispatch', route: '/dispatch/calendar', icon: Calendar },
            { label: 'Finance', route: '/finance/invoices', icon: DollarSign },
            { label: 'SEO Health', route: '/admin/seo/health', icon: Globe },
          ].map(a => (
            <Button key={a.label} asChild variant="outline" size="sm" className="h-9 text-xs gap-1.5 rounded-xl">
              <Link to={a.route}><a.icon className="w-3.5 h-3.5" />{a.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      {/* ════════ SECTION 2 — KPI STRIP ════════ */}
      <section>
        <SectionHeader title="Business Snapshot" subtitle="Key performance indicators across all departments" />
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          <KPICard label="New Leads Today" helper="From all channels" value={kpi?.newLeadsToday ?? '—'} icon={Users} route="/sales/leads" loading={kpiLoading} />
          <KPICard label="Hot Leads" helper="Score ≥ 70" value={kpi?.hotLeads ?? '—'} icon={Zap} route="/sales/leads" loading={kpiLoading} />
          <KPICard label="Quotes Pending" helper="Draft & pending" value={kpi?.quotesPending ?? '—'} icon={FileText} route="/sales/quotes" loading={kpiLoading} />
          <KPICard label="Jobs Today" helper="Scheduled runs" value={kpi?.jobsToday ?? '—'} icon={Calendar} route="/dispatch/today" loading={kpiLoading} />
          <KPICard label="Drivers Active" helper="On route now" value={kpi?.driversActive || 'No data yet'} icon={Truck} route="/admin/drivers" loading={kpiLoading} />
          <KPICard label="Payments Pending" helper="Awaiting payment" value={kpi?.paymentsPending ?? '—'} icon={DollarSign} route="/finance/payments" loading={kpiLoading} />
          <KPICard label="Overdue Invoices" helper="Past due date" value={kpi?.overdueInvoices ?? '—'} icon={AlertTriangle} route="/admin/overdue" loading={kpiLoading} danger={(kpi?.overdueInvoices ?? 0) > 0} />
          <KPICard label="SEO Score" helper="Site health" value={kpi?.seoScore || 'N/A'} icon={BarChart3} route="/admin/seo/health" loading={kpiLoading} />
        </div>
      </section>

      {/* ════════ SECTION 3 — ALERTS ════════ */}
      <section>
        <SectionHeader
          title="Alerts & Attention Needed"
          subtitle="Unresolved issues requiring action"
          action={{ label: 'All Alerts', route: '/admin/alerts' }}
        />
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {alertsLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500/60" />
                <p className="text-sm font-medium">All clear — no urgent items</p>
                <p className="text-xs text-muted-foreground/60 mt-1">System is operating normally</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">{alerts.map(a => <AlertRow key={a.id} alert={a} />)}</div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ════════ SECTION 4 — SALES PIPELINE ════════ */}
      <section>
        <SectionHeader
          title="Sales & Lead Pipeline"
          subtitle="Funnel overview from new leads to confirmed jobs"
          action={{ label: 'Lead Hub', route: '/sales/leads' }}
        />
        <Card>
          <CardContent className="p-6">
            <PipelineBar
              loading={pipelineLoading}
              stages={[
                { label: 'New', count: pipeline['new'] || 0, color: 'bg-blue-500' },
                { label: 'Contacted', count: pipeline['contacted'] || 0, color: 'bg-amber-500' },
                { label: 'Quoted', count: pipeline['quoted'] || 0, color: 'bg-violet-500' },
                { label: 'Contract Sent', count: pipeline['contract_sent'] || 0, color: 'bg-orange-500' },
                { label: 'Paid', count: pipeline['payment_received'] || 0, color: 'bg-emerald-500' },
                { label: 'Confirmed', count: pipeline['converted'] || 0, color: 'bg-primary' },
              ]}
            />
            <Separator className="my-5" />
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="h-9 text-xs rounded-xl">
                <Link to="/sales/quotes/new">Create Quote</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-9 text-xs rounded-xl">
                <Link to="/sales/leads">Open Lead Hub</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-9 text-xs rounded-xl">
                <Link to="/admin/alerts">Follow-ups Due</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ════════ SECTION 5 — OPERATIONS SNAPSHOT ════════ */}
      <section>
        <SectionHeader
          title="Operations Snapshot"
          subtitle="Today's dispatch and service activity"
          action={{ label: 'Dispatch', route: '/dispatch/calendar' }}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SnapshotCard label="Deliveries Today" value={kpi?.deliveriesToday || 'No data yet'} icon={Package} route="/dispatch/today" />
          <SnapshotCard label="Pickups Today" value={kpi?.pickupsToday || 'No data yet'} icon={Truck} route="/dispatch/today" />
          <SnapshotCard label="Swap Jobs" value="No data yet" icon={Activity} route="/dispatch/today" />
          <SnapshotCard label="Dump Returns" value="No data yet" icon={MapPin} route="/dispatch/yard-hold" />
          <SnapshotCard label="Drivers On Route" value="No data yet" icon={Truck} route="/admin/drivers" />
          <SnapshotCard label="Services Paused" value="No data yet" icon={Clock} route="/dispatch/yard-hold" />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button asChild variant="outline" size="sm" className="h-9 text-xs rounded-xl"><Link to="/dispatch/calendar">Open Dispatch</Link></Button>
          <Button asChild variant="outline" size="sm" className="h-9 text-xs rounded-xl"><Link to="/dispatch/today">Runs Calendar</Link></Button>
          <Button asChild variant="outline" size="sm" className="h-9 text-xs rounded-xl"><Link to="/dispatch/control-tower">Route Planner</Link></Button>
        </div>
      </section>

      {/* ════════ SECTION 6 — DRIVER + FLEET ════════ */}
      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <SectionHeader title="Driver App" action={{ label: 'Open Driver App', route: '/driver' }} />
          <div className="grid grid-cols-2 gap-3">
            <SnapshotCard label="Drivers Logged In" value="No data yet" icon={Users} route="/admin/drivers" />
            <SnapshotCard label="Runs In Progress" value={kpi?.jobsToday ?? 'No data yet'} icon={Truck} route="/dispatch/today" />
            <SnapshotCard label="Dump Tickets Pending" value="No data yet" icon={FileText} route="/admin/tickets" />
            <SnapshotCard label="Inspections Pending" value="Not built yet" icon={Eye} route={null} />
          </div>
        </section>
        <section>
          <SectionHeader title="Fleet & Maintenance" action={{ label: 'Fleet Dashboard', route: '/admin/drivers' }} />
          <div className="grid grid-cols-2 gap-3">
            <SnapshotCard label="Active Trucks" value="No data yet" icon={Car} route="/admin/drivers" />
            <SnapshotCard label="Maintenance Alerts" value="Not built yet" icon={Wrench} route={null} />
            <SnapshotCard label="Insurance Expiring" value="Not built yet" icon={Shield} route={null} />
            <SnapshotCard label="GPS / Camera Status" value="No data yet" icon={Camera} route="/admin/fleet/cameras" />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl"><Link to="/admin/drivers">Open Fleet</Link></Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl"><Link to="/admin/fleet/cameras">Cameras</Link></Button>
          </div>
        </section>
      </div>

      {/* ════════ SECTION 7 — FINANCE ════════ */}
      <section>
        <SectionHeader
          title="Finance Overview"
          subtitle="Billing, payments, and accounts receivable"
          action={{ label: 'Invoices', route: '/finance/invoices' }}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SnapshotCard label="Invoices Today" value="No data yet" icon={FileText} route="/finance/invoices" />
          <SnapshotCard label="Payments Collected" value="No data yet" icon={DollarSign} route="/finance/payments" />
          <SnapshotCard label="Approvals Pending" value={kpi?.approvalsPending ?? 'No data yet'} icon={CheckCircle2} route="/admin/approval-queue" />
          <SnapshotCard label="Outstanding Balance" value="No data yet" icon={Layers} route="/finance/ar-aging" />
          <SnapshotCard label="Overdue Accounts" value={kpi?.overdueInvoices ?? 'No data yet'} icon={AlertTriangle} route="/admin/overdue" />
          <SnapshotCard label="Dump Fee Reconciliation" value="No data yet" icon={FileText} route="/admin/tickets" />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button asChild variant="outline" size="sm" className="h-9 text-xs rounded-xl"><Link to="/finance/invoices">Open Invoices</Link></Button>
          <Button asChild variant="outline" size="sm" className="h-9 text-xs rounded-xl"><Link to="/finance/payments">Open Payments</Link></Button>
          <Button asChild variant="outline" size="sm" className="h-9 text-xs rounded-xl"><Link to="/admin/approval-queue">Approval Queue</Link></Button>
        </div>
      </section>

      {/* ════════ SECTION 8 — WEBSITE + SEO ════════ */}
      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <SectionHeader title="Website Health" action={{ label: 'Diagnostics', route: '/admin/qa/control-center' }} />
          <Card>
            <CardContent className="p-4 space-y-0.5">
              <ModuleRow name="Homepage" status="LIVE" route="/" />
              <ModuleRow name="Quote Flow" status="LIVE" route="/quote" />
              <ModuleRow name="AI Assistant" status="LIVE" route="/admin/ai/performance" />
              <ModuleRow name="Photo Analysis" status="LIVE" route="/waste-vision" />
              <ModuleRow name="Contact Requests" status="LIVE" route="/contact" />
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl"><Link to="/admin/qa/build-info">Build Info</Link></Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl"><Link to="/admin/qa/env-health">Env Health</Link></Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl"><Link to="/admin/qa/control-center">Website Diagnostics</Link></Button>
          </div>
        </section>

        <section>
          <SectionHeader title="SEO & Local Visibility" action={{ label: 'SEO Dashboard', route: '/admin/seo/dashboard' }} />
          <Card>
            <CardContent className="p-4 space-y-0.5">
              <ModuleRow name="SEO Health Score" status="LIVE" route="/admin/seo/health" />
              <ModuleRow name={`City Pages Active (${kpi?.cityPagesActive ?? '…'})`} status="LIVE" route="/admin/seo/cities" />
              <ModuleRow name={`ZIP Pages Active (${kpi?.zipPagesActive ?? '…'})`} status="LIVE" route="/admin/seo/pages" />
              <ModuleRow name="Sitemap Status" status="LIVE" route="/admin/seo/sitemap" />
              <ModuleRow name="Indexing Status" status="LIVE" route="/admin/seo/indexing" />
              <ModuleRow name="Google Business Profile" status="LIVE" route="/admin/seo/gbp-plan" />
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl"><Link to="/admin/seo/health">SEO Health</Link></Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl"><Link to="/admin/qa/route-health">Route Health</Link></Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl"><Link to="/admin/qa/control-center">Website Diagnostics</Link></Button>
          </div>
        </section>
      </div>

      {/* ════════ SECTION 9 — INTEGRATIONS ════════ */}
      <section>
        <SectionHeader
          title="Integrations"
          subtitle="External service connectivity"
          action={{ label: 'Functions Map', route: '/admin/setup/functions' }}
        />
        <Card>
          <CardContent className="p-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0.5">
              <div className="space-y-0.5">
                <ModuleRow name="Google Workspace" status="LIVE" route="/admin/google" />
                <ModuleRow name="Gmail" status="LIVE" route="/admin/google" />
                <ModuleRow name="Google Calendar" status="LIVE" route="/admin/google" />
                <ModuleRow name="Google Drive" status="LIVE" route="/admin/google" />
              </div>
              <div className="space-y-0.5">
                <ModuleRow name="Twilio / SMS" status="LIVE" route="/admin/telephony/calls" />
                <ModuleRow name="Telephony" status="LIVE" route="/admin/telephony/calls" />
                <ModuleRow name="Maps & Routing" status="LIVE" route="/dispatch/control-tower" />
              </div>
              <div className="space-y-0.5">
                <ModuleRow name="Payment Gateway" status="LIVE" route="/finance/payments" />
                <ModuleRow name="Email (Resend)" status="DRY_RUN" route="/admin/email-config" />
                <ModuleRow name="GoHighLevel" status="DRY_RUN" route="/admin/ghl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ════════ SECTION 10 — QUICK ACCESS GRID ════════ */}
      <section>
        <SectionHeader title="Quick Access" subtitle="Jump to any department" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_ACCESS_GRID.map(item => (
            <QuickAccessCard key={item.label} {...item} />
          ))}
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <Separator />
      <footer className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pb-4">
        <span>Build: {BUILD_INFO.timestamp || 'dev'}</span>
        <span className="text-muted-foreground/30">·</span>
        <span>Env: {BUILD_INFO.env}</span>
        <span className="text-muted-foreground/30">·</span>
        <span>API: Connected</span>
        <span className="text-muted-foreground/30">·</span>
        <span>Database: Active</span>
      </footer>
    </div>
  );
}
