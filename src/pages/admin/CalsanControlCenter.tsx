import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Bell,
  Calendar, CheckCircle2, Clock, DollarSign, ExternalLink,
  Globe, Headphones, MapPin, Package,
  Shield, Truck, TrendingUp, Users, Zap,
  FileText, Wrench, ArrowUpRight, Eye, Camera, Car,
  Phone, Mail, Map, CreditCard, Webhook, Star,
  Layers, Search as SearchIcon, Link2, Brain
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { BUILD_INFO } from '@/lib/buildInfo';
import { format } from 'date-fns';

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

        const [leads, hotLeads, quotes, runs, pendingInv, overdueInv, approvals] = await Promise.all([
          (supabase.from('sales_leads').select('id', countOpts) as any).gte('created_at', `${d}T00:00:00`),
          (supabase.from('sales_leads').select('id', countOpts) as any).in('lead_status', ['new', 'contacted']).gte('lead_quality_score', 70),
          (supabase.from('quotes').select('id', countOpts) as any).in('status', ['pending', 'draft']),
          (supabase.from('runs').select('id', countOpts) as any).eq('scheduled_date', d),
          (supabase.from('invoices').select('id', countOpts) as any).eq('payment_status', 'pending'),
          (supabase.from('invoices').select('id', countOpts) as any).eq('payment_status', 'overdue'),
          (supabase.from('approval_requests').select('id', countOpts) as any).eq('status', 'pending'),
        ]);

        // Try to get delivery/pickup breakdown from service_requests
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
        });
      } catch (err) {
        console.error('KPI load error:', err);
        setData({
          newLeadsToday: 0, hotLeads: 0, quotesPending: 0, jobsToday: 0,
          driversActive: 0, paymentsPending: 0, overdueInvoices: 0, seoScore: 'N/A',
          approvalsPending: 0, deliveriesToday: 0, pickupsToday: 0,
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
          .select('id, title, severity, alert_type, entity_type, created_at')
          .eq('is_resolved', false)
          .order('created_at', { ascending: false })
          .limit(10);
        setAlerts((data || []).map(a => ({
          id: a.id,
          title: a.title,
          severity: a.severity === 'critical' ? 'critical' as const : a.severity === 'warning' ? 'warning' as const : 'info' as const,
          route: '/admin/alerts',
          source: a.entity_type || a.alert_type,
          created_at: a.created_at,
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

function KPICard({ label, value, helper, icon: Icon, route, danger, loading }: {
  label: string; value: number | string; helper?: string; icon: React.ComponentType<{ className?: string }>; route: string; danger?: boolean; loading?: boolean;
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
        {helper && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{helper}</p>}
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

type ModuleStatus = 'LIVE' | 'DRY_RUN' | 'OFF' | 'ERROR' | 'NEEDS_SETUP' | 'NOT_BUILT' | 'NO_DATA';

function StatusDot({ status }: { status: ModuleStatus }) {
  const colors: Record<ModuleStatus, string> = {
    LIVE: 'bg-emerald-500',
    DRY_RUN: 'bg-amber-500',
    OFF: 'bg-muted-foreground/40',
    ERROR: 'bg-destructive',
    NEEDS_SETUP: 'bg-amber-400',
    NOT_BUILT: 'bg-muted-foreground/20',
    NO_DATA: 'bg-muted-foreground/30',
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
    NO_DATA: 'text-muted-foreground bg-muted/50',
  };
  return (
    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', styles[status])}>
      {status.replace(/_/g, ' ')}
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

function QuickAccessCard({ label, icon: Icon, route, description }: {
  label: string; icon: React.ComponentType<{ className?: string }>; route: string; description: string;
}) {
  return (
    <Link to={route} className="block group">
      <div className="rounded-xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all h-full text-center">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
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
  const alerts = useLiveAlerts();
  const pipeline = useSalesPipeline();
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
          <p className="text-xs text-muted-foreground/70 mt-1">
            {format(now, 'EEEE, MMMM d, yyyy · h:mm a')}
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

      {/* ════════ SECTION 2 — KPI STRIP ════════ */}
      <section>
        <SectionTitle title="Business Snapshot" />
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          <KPICard label="New Leads Today" helper="From all channels" value={kpi?.newLeadsToday ?? '—'} icon={Users} route="/sales/leads" loading={kpiLoading} />
          <KPICard label="Hot Leads" helper="Score ≥ 70" value={kpi?.hotLeads ?? '—'} icon={Zap} route="/sales/leads" loading={kpiLoading} />
          <KPICard label="Quotes Pending" helper="Draft & pending" value={kpi?.quotesPending ?? '—'} icon={FileText} route="/sales/quotes" loading={kpiLoading} />
          <KPICard label="Jobs Today" helper="Scheduled runs" value={kpi?.jobsToday ?? '—'} icon={Calendar} route="/dispatch/today" loading={kpiLoading} />
          <KPICard label="Drivers Active" helper="On route now" value={kpi?.driversActive || '—'} icon={Truck} route="/admin/drivers" loading={kpiLoading} />
          <KPICard label="Payments Pending" helper="Awaiting payment" value={kpi?.paymentsPending ?? '—'} icon={DollarSign} route="/finance/payments" loading={kpiLoading} />
          <KPICard label="Overdue Invoices" helper="Past due date" value={kpi?.overdueInvoices ?? '—'} icon={AlertTriangle} route="/admin/overdue" loading={kpiLoading} danger={(kpi?.overdueInvoices ?? 0) > 0} />
          <KPICard label="SEO Score" helper="Site health" value={kpi?.seoScore || 'N/A'} icon={BarChart3} route="/admin/seo/health" loading={kpiLoading} />
        </div>
      </section>

      {/* ════════ SECTION 3 — ALERTS ════════ */}
      <section>
        <SectionTitle title="Alerts & Attention Needed" action={{ label: 'All Alerts', route: '/admin/alerts' }} />
        <Card>
          <CardContent className="p-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <p className="text-sm font-medium">All clear — no urgent items</p>
                <p className="text-xs text-muted-foreground/70 mt-1">System is operating normally</p>
              </div>
            ) : (
              <div className="space-y-2">{alerts.map(a => <AlertRow key={a.id} alert={a} />)}</div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ════════ SECTION 4 — SALES PIPELINE ════════ */}
      <section>
        <SectionTitle title="Sales & Lead Pipeline" action={{ label: 'Lead Hub', route: '/sales/leads' }} />
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

      {/* ════════ SECTION 5 — OPERATIONS SNAPSHOT ════════ */}
      <section>
        <SectionTitle title="Operations Snapshot" action={{ label: 'Dispatch', route: '/dispatch/calendar' }} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SnapshotCard label="Deliveries Today" value={kpi?.deliveriesToday || '—'} icon={Package} route="/dispatch/today" />
          <SnapshotCard label="Pickups Today" value={kpi?.pickupsToday || '—'} icon={Truck} route="/dispatch/today" />
          <SnapshotCard label="Swap Jobs" value="—" icon={Activity} route="/dispatch/today" />
          <SnapshotCard label="Dump Returns" value="—" icon={MapPin} route="/dispatch/yard-hold" />
          <SnapshotCard label="Drivers On Route" value="—" icon={Truck} route="/admin/drivers" />
          <SnapshotCard label="Services Paused" value="—" icon={Clock} route="/dispatch/yard-hold" />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs"><Link to="/dispatch/calendar">Open Dispatch</Link></Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs"><Link to="/dispatch/today">Runs Calendar</Link></Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs"><Link to="/dispatch/control-tower">Route Planner</Link></Button>
        </div>
      </section>

      {/* ════════ SECTION 6 — DRIVER + FLEET ════════ */}
      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <SectionTitle title="Driver App" action={{ label: 'Open Driver App', route: '/driver' }} />
          <div className="grid grid-cols-2 gap-3">
            <SnapshotCard label="Drivers Logged In" value="—" icon={Users} route="/admin/drivers" />
            <SnapshotCard label="Runs In Progress" value={kpi?.jobsToday ?? '—'} icon={Truck} route="/dispatch/today" />
            <SnapshotCard label="Dump Tickets Pending" value="—" icon={FileText} route="/admin/tickets" />
            <SnapshotCard label="Inspections Pending" value="—" icon={Eye} route={null} />
          </div>
        </section>
        <section>
          <SectionTitle title="Fleet & Maintenance" action={{ label: 'Fleet Dashboard', route: '/admin/drivers' }} />
          <div className="grid grid-cols-2 gap-3">
            <SnapshotCard label="Active Trucks" value="—" icon={Car} route="/admin/drivers" />
            <SnapshotCard label="Maintenance Alerts" value="—" icon={Wrench} route={null} />
            <SnapshotCard label="Insurance Expiring" value="—" icon={Shield} route={null} />
            <SnapshotCard label="GPS / Camera Status" value="—" icon={Camera} route="/admin/fleet/cameras" />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/admin/drivers">Open Fleet</Link></Button>
            <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/admin/fleet/cameras">Cameras</Link></Button>
          </div>
        </section>
      </div>

      {/* ════════ SECTION 7 — FINANCE ════════ */}
      <section>
        <SectionTitle title="Finance Overview" action={{ label: 'Invoices', route: '/finance/invoices' }} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SnapshotCard label="Invoices Today" value="—" icon={FileText} route="/finance/invoices" />
          <SnapshotCard label="Payments Collected" value="—" icon={DollarSign} route="/finance/payments" />
          <SnapshotCard label="Approvals Pending" value={kpi?.approvalsPending ?? '—'} icon={CheckCircle2} route="/admin/approval-queue" />
          <SnapshotCard label="Outstanding Balance" value="—" icon={Layers} route="/finance/ar-aging" />
          <SnapshotCard label="Overdue Accounts" value={kpi?.overdueInvoices ?? '—'} icon={AlertTriangle} route="/admin/overdue" />
          <SnapshotCard label="Dump Fee Reconciliation" value="—" icon={FileText} route="/admin/tickets" />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs"><Link to="/finance/invoices">Open Invoices</Link></Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs"><Link to="/finance/payments">Open Payments</Link></Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs"><Link to="/admin/approval-queue">Approval Queue</Link></Button>
        </div>
      </section>

      {/* ════════ SECTION 8 — WEBSITE + SEO ════════ */}
      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <SectionTitle title="Website Health" action={{ label: 'Diagnostics', route: '/admin/qa/control-center' }} />
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
            <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/admin/qa/build-info">Build Info</Link></Button>
            <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/admin/qa/env-health">Env Health</Link></Button>
            <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/admin/qa/control-center">Website Diagnostics</Link></Button>
          </div>
        </section>

        <section>
          <SectionTitle title="SEO & Local Visibility" action={{ label: 'SEO Dashboard', route: '/admin/seo/dashboard' }} />
          <Card>
            <CardContent className="p-4 space-y-0.5">
              <ModuleRow name="SEO Health Score" status="LIVE" route="/admin/seo/health" />
              <ModuleRow name="City Pages Active" status="LIVE" route="/admin/seo/cities" />
              <ModuleRow name="ZIP Pages Active" status="LIVE" route="/admin/seo/pages" />
              <ModuleRow name="Sitemap Status" status="LIVE" route="/admin/seo/sitemap" />
              <ModuleRow name="Indexing Status" status="LIVE" route="/admin/seo/indexing" />
              <ModuleRow name="Google Business Profile" status="LIVE" route="/admin/seo/gbp-plan" />
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/admin/seo/health">SEO Health</Link></Button>
            <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/admin/qa/route-health">Route Health</Link></Button>
            <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/admin/qa/control-center">Website Diagnostics</Link></Button>
          </div>
        </section>
      </div>

      {/* ════════ SECTION 9 — INTEGRATIONS ════════ */}
      <section>
        <SectionTitle title="Integrations" action={{ label: 'Functions Map', route: '/admin/setup/functions' }} />
        <Card>
          <CardContent className="p-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
              <div className="space-y-0.5">
                <ModuleRow name="Google Workspace" status="LIVE" route="/admin/google" />
                <ModuleRow name="Gmail" status="LIVE" route="/admin/google" />
                <ModuleRow name="Google Calendar" status="LIVE" route="/admin/google" />
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
        <SectionTitle title="Quick Access" />
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
        <span>·</span>
        <span>Env: {BUILD_INFO.env}</span>
        <span>·</span>
        <span>API: Connected</span>
        <span>·</span>
        <span>Database: Active</span>
      </footer>
    </div>
  );
}
