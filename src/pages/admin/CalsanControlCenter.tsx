import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Bell,
  Calendar, CheckCircle2, Clock, DollarSign, ExternalLink,
  Globe, Headphones, MapPin, Package,
  Shield, Truck, TrendingUp, Users, Zap,
  FileText, Wrench, ArrowUpRight, Eye, Camera, Car,
  Phone, Mail, Map, CreditCard, Webhook, Star,
  Layers, Search as SearchIcon, Link2, Brain, Hash,
  Home, MessageSquare, Megaphone, CircleDot, Route
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { BUILD_INFO } from '@/lib/buildInfo';
import { format } from 'date-fns';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useControlCenterKPIs, useControlCenterAlerts, useControlCenterPipeline } from '@/hooks/useControlCenterData';
import { StatusStrip, buildSystemStatuses } from '@/components/control-center/StatusStrip';
import {
  SectionHeader, KPICard, SnapshotCard, QuickAction,
  QuickAccessCard, AlertRow, ModuleRow, PipelineBar,
} from '@/components/control-center/SummaryPanel';

// ─── Role helpers ────────────────────────────
function useRoleVisibility() {
  const { roles, isAdmin, isDispatcher, isFinance, isSales, isCS } = useAdminAuth();
  const isExec = roles.some(r => ['owner', 'admin', 'executive', 'system_admin'].includes(r));
  const isOps = isDispatcher || roles.includes('ops_admin');
  const isReadOnly = roles.includes('read_only') || roles.includes('read_only_admin');

  return {
    showSales: isAdmin || isExec || isSales || isCS,
    showCustomers: isAdmin || isExec || isSales || isCS || isOps,
    showDispatch: isAdmin || isExec || isOps,
    showDriver: isAdmin || isExec || isOps,
    showFleet: isAdmin || isExec || isOps || roles.includes('fleet_maintenance'),
    showFinance: isAdmin || isExec || isFinance,
    showSEO: isAdmin || isExec || roles.includes('marketing_seo'),
    showIntegrations: isAdmin,
    showAI: isAdmin || isExec,
    showAlerts: true,
    showQuickAccess: true,
    isReadOnly,
  };
}

// ─── Main Component ──────────────────────────
export default function CalsanControlCenter() {
  const { data: kpi, loading: kpiLoading } = useControlCenterKPIs();
  const { alerts, loading: alertsLoading } = useControlCenterAlerts();
  const { pipeline, loading: pipelineLoading } = useControlCenterPipeline();
  const { user, roles, getPrimaryRole } = useAdminAuth();
  const vis = useRoleVisibility();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const primaryRole = getPrimaryRole();

  return (
    <div className="p-4 lg:p-8 space-y-5 md:space-y-8 max-w-[1440px] mx-auto">

      {/* ════════ HEADER ════════ */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Calsan Control Center</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-xl hidden md:block">
            Executive view of sales, customers, dispatch, finance, SEO, and system health.
          </p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[10px] md:text-xs text-muted-foreground/70">
              {format(now, 'EEE, MMM d · h:mm a')}
            </p>
            {user?.email && (
              <>
                <span className="text-muted-foreground/30 hidden md:inline">·</span>
                <p className="text-xs text-muted-foreground/70 hidden md:block">{user.email}</p>
              </>
            )}
            {primaryRole && (
              <>
                <span className="text-muted-foreground/30 hidden md:inline">·</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary hidden md:inline">
                  {primaryRole.replace(/_/g, ' ').toUpperCase()}
                </span>
              </>
            )}
          </div>
        </div>
        {/* Quick links */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-2 w-max md:w-auto">
            {[
              { label: 'Lead Hub', route: '/sales/leads', icon: Users, show: vis.showSales },
              { label: 'Sales', route: '/sales/dashboard', icon: TrendingUp, show: vis.showSales },
              { label: 'Dispatch', route: '/dispatch/calendar', icon: Calendar, show: vis.showDispatch },
              { label: 'Finance', route: '/finance/invoices', icon: DollarSign, show: vis.showFinance },
              { label: 'SEO', route: '/admin/seo/health', icon: Globe, show: vis.showSEO },
              { label: 'Customers', route: '/admin/customers', icon: SearchIcon, show: vis.showCustomers },
            ].filter(a => a.show).map(a => (
              <Button key={a.label} asChild variant="outline" size="sm" className="h-9 text-xs gap-1.5 rounded-xl shrink-0">
                <Link to={a.route}><a.icon className="w-3.5 h-3.5" />{a.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ GLOBAL STATUS STRIP ════════ */}
      <StatusStrip statuses={buildSystemStatuses(kpi)} />

      {/* ════════ KPI STRIP ════════ */}
      <section>
        <SectionHeader title="Business Snapshot" subtitle="Key performance indicators across all departments" />
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          <div className="flex gap-2.5 w-max md:w-auto md:grid md:grid-cols-5 xl:grid-cols-10">
            {[
              { label: 'New Leads Today', value: kpi?.newLeadsToday, icon: Users, route: '/sales/leads', helper: 'All channels' },
              { label: 'Hot Leads', value: kpi?.hotLeads, icon: Zap, route: '/sales/leads', helper: 'Score ≥ 70' },
              { label: 'Quotes Pending', value: kpi?.quotesPending, icon: FileText, route: '/sales/quotes', helper: 'Draft & pending' },
              { label: 'Contracts Pending', value: kpi?.contractsPending, icon: FileText, route: '/sales/quotes', helper: 'Sent, not signed' },
              { label: 'Payments Pending', value: kpi?.paymentsPending, icon: DollarSign, route: '/finance/payments', helper: 'Awaiting payment' },
              { label: 'Orders → Dispatch', value: kpi?.ordersReadyForDispatch, icon: Package, route: '/admin/orders', helper: 'Ready to schedule' },
              { label: 'Jobs Today', value: kpi?.jobsToday, icon: Calendar, route: '/dispatch/today', helper: 'Scheduled runs' },
              { label: 'Overdue Invoices', value: kpi?.overdueInvoices, icon: AlertTriangle, route: '/admin/overdue', helper: 'Past due', danger: true },
              { label: 'SEO Score', value: kpi?.cityPagesActive ? `${kpi.cityPagesActive} cities` : 'N/A', icon: BarChart3, route: '/admin/seo/health', helper: 'Site health' },
              { label: 'Open Alerts', value: kpi?.alertCount, icon: Bell, route: '/admin/alerts', helper: 'Unresolved', danger: (kpi?.alertCount ?? 0) > 0 },
            ].map(item => (
              <div key={item.label} className="w-[130px] md:w-auto shrink-0">
                <KPICard
                  label={item.label}
                  value={item.value ?? '—'}
                  helper={item.helper}
                  icon={item.icon}
                  route={item.route}
                  loading={kpiLoading}
                  danger={item.danger}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ ALERTS ════════ */}
      {vis.showAlerts && (
        <section>
          <SectionHeader
            title="Alerts & Attention Needed"
            subtitle="Unresolved issues requiring action"
            action={{ label: 'All Alerts', route: '/admin/alerts' }}
          />
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {alertsLoading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
                  <p className="text-sm font-medium">All clear — no urgent items</p>
                </div>
              ) : (
                <div className="p-3 space-y-1.5">{alerts.map(a => <AlertRow key={a.id} alert={a} />)}</div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* ════════ SALES + CUSTOMER 360 ROW ════════ */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales Summary */}
        {vis.showSales && (
          <section>
            <SectionHeader
              title="Sales & Lead Pipeline"
              subtitle="Funnel from leads to confirmed orders"
              action={{ label: 'Lead Hub', route: '/sales/leads' }}
            />
            <Card>
              <CardContent className="p-5 space-y-4">
                <PipelineBar
                  loading={pipelineLoading}
                  stages={[
                    { label: 'New', count: pipeline['new'] || 0, color: 'bg-blue-500' },
                    { label: 'Contacted', count: pipeline['contacted'] || 0, color: 'bg-amber-500' },
                    { label: 'Quoted', count: pipeline['quoted'] || 0, color: 'bg-violet-500' },
                    { label: 'Contract Sent', count: pipeline['contract_sent'] || 0, color: 'bg-orange-500' },
                    { label: 'Paid', count: pipeline['payment_received'] || 0, color: 'bg-emerald-500' },
                    { label: 'Order Created', count: pipeline['order_created'] || 0, color: 'bg-blue-700' },
                    { label: 'Confirmed', count: pipeline['converted'] || 0, color: 'bg-primary' },
                  ]}
                />
                <Separator />
                <div className="text-xs font-semibold text-muted-foreground mb-2">Sales Readiness</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Quotes ready</span>
                    <span className="font-bold text-foreground">{kpi?.quotesPending ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Contracts pending</span>
                    <span className="font-bold text-foreground">{kpi?.contractsPending ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Payments pending</span>
                    <span className="font-bold text-foreground">{kpi?.paymentsPending ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Fallback queue</span>
                    <span className="font-bold text-foreground">{kpi?.fallbackQueueCount ?? 0}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <QuickAction label="Create Quote" route="/sales/quotes/new" icon={FileText} />
                  <QuickAction label="Open Lead Hub" route="/sales/leads" icon={Users} />
                  <QuickAction label="Follow-ups" route="/admin/alerts" icon={Bell} />
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Customer 360 Summary */}
        {vis.showCustomers && (
          <section>
            <SectionHeader
              title="Customer 360"
              subtitle="Customer operations snapshot"
              action={{ label: 'Customer Search', route: '/admin/customers' }}
            />
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <SnapshotCard label="Active Customers" value={kpi?.activeCustomers || 'N/A'} icon={Users} route="/admin/customers" />
                  <SnapshotCard label="Open Orders" value={kpi?.ordersReadyForDispatch || 'N/A'} icon={Package} route="/admin/orders" />
                  <SnapshotCard label="Outstanding Balances" value={kpi?.overdueInvoices || 'N/A'} icon={DollarSign} route="/admin/overdue" />
                  <SnapshotCard label="Open Requests" value={kpi?.openRequests || 'N/A'} icon={MessageSquare} route="/admin/alerts" />
                </div>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <QuickAction label="Customer Search" route="/admin/customers" icon={SearchIcon} />
                  <QuickAction label="Outstanding Balances" route="/admin/overdue" icon={DollarSign} />
                  <QuickAction label="Recent Orders" route="/admin/orders" icon={Package} />
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      {/* ════════ DISPATCH OPERATIONS ════════ */}
      {vis.showDispatch && (
        <section>
          <SectionHeader
            title="Dispatch Operations"
            subtitle="Today's dispatch and service activity"
            action={{ label: 'Open Dispatch', route: '/dispatch/calendar' }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <SnapshotCard label="Deliveries Today" value={kpi?.deliveriesToday || 'N/A'} icon={Package} route="/dispatch/today" />
            <SnapshotCard label="Pickups Today" value={kpi?.pickupsToday || 'N/A'} icon={Truck} route="/dispatch/today" />
            <SnapshotCard label="Unassigned Orders" value={kpi?.ordersReadyForDispatch || 'N/A'} icon={AlertTriangle} route="/admin/orders" />
            <SnapshotCard label="Active Runs" value={kpi?.jobsToday || 'N/A'} icon={Route} route="/dispatch/today" />
            <SnapshotCard label="Drivers On Route" value={kpi?.driversActive || 'N/A'} icon={Truck} route="/admin/drivers" />
            <SnapshotCard label="Paused Services" value="N/A" icon={Clock} route="/dispatch/yard-hold" />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="text-xs text-muted-foreground">Operations Readiness:</div>
            <div className="flex gap-1.5">
              {[
                { label: 'Ready', count: kpi?.ordersReadyForDispatch ?? 0, color: 'bg-emerald-500' },
                { label: 'Blocked', count: 0, color: 'bg-destructive' },
                { label: 'Pending Payment', count: kpi?.paymentsPending ?? 0, color: 'bg-amber-500' },
              ].map(r => (
                <span key={r.label} className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full text-white', r.color)}>
                  {r.count} {r.label}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mt-3">
            <div className="flex gap-2 w-max md:w-auto md:flex-wrap">
              <QuickAction label="Dispatch Calendar" route="/dispatch/calendar" icon={Calendar} />
              <QuickAction label="Today's Board" route="/dispatch/today" icon={Activity} />
              <QuickAction label="Control Tower" route="/dispatch/control-tower" icon={MapPin} />
              <QuickAction label="Yard Hold" route="/dispatch/yard-hold" icon={Home} />
              <QuickAction label="Route Planner" route="/dispatch/control-tower" icon={Route} />
            </div>
          </div>
        </section>
      )}

      {/* ════════ DRIVER + FLEET ROW ════════ */}
      <div className="grid lg:grid-cols-2 gap-6">
        {vis.showDriver && (
          <section>
            <SectionHeader title="Driver & Field Ops" action={{ label: 'Driver App', route: '/driver' }} />
            <div className="grid grid-cols-2 gap-2.5">
              <SnapshotCard label="Drivers Active" value={kpi?.driversActive || 'N/A'} icon={Users} route="/admin/drivers" />
              <SnapshotCard label="Runs In Progress" value={kpi?.jobsToday ?? 'N/A'} icon={Truck} route="/dispatch/today" />
              <SnapshotCard label="Dump Tickets Pending" value="No data yet" icon={FileText} route="/admin/tickets" />
              <SnapshotCard label="Missing Proof" value="No data yet" icon={Camera} route="/admin/tickets" />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <QuickAction label="Driver App" route="/driver" icon={Truck} />
              <QuickAction label="Dump Tickets" route="/admin/tickets" icon={FileText} />
            </div>
          </section>
        )}

        {vis.showFleet && (
          <section>
            <SectionHeader title="Fleet & Maintenance" action={{ label: 'Fleet', route: '/admin/drivers' }} />
            <div className="grid grid-cols-2 gap-2.5">
              <SnapshotCard label="Active Trucks" value="No data yet" icon={Car} route="/admin/drivers" />
              <SnapshotCard label="Maintenance Alerts" value="No data yet" icon={Wrench} route="/admin/maintenance" />
              <SnapshotCard label="Insurance Expiring" value="No data yet" icon={Shield} route="/admin/drivers" />
              <SnapshotCard label="Camera/GPS Status" value="No data yet" icon={Camera} route="/admin/fleet/cameras" />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <QuickAction label="Fleet Dashboard" route="/admin/drivers" icon={Car} />
              <QuickAction label="Cameras" route="/admin/fleet/cameras" icon={Camera} />
              <QuickAction label="Maintenance" route="/admin/maintenance" icon={Wrench} />
            </div>
          </section>
        )}
      </div>

      {/* ════════ FINANCE ════════ */}
      {vis.showFinance && (
        <section>
          <SectionHeader
            title="Finance Overview"
            subtitle="Billing, payments, and accounts receivable"
            action={{ label: 'Invoices', route: '/finance/invoices' }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <SnapshotCard label="Invoices Today" value="No data yet" icon={FileText} route="/finance/invoices" />
            <SnapshotCard label="Payments Collected" value="No data yet" icon={DollarSign} route="/finance/payments" />
            <SnapshotCard label="Approvals Pending" value={kpi?.approvalsPending ?? 'N/A'} icon={CheckCircle2} route="/admin/approval-queue" />
            <SnapshotCard label="Outstanding Balance" value="No data yet" icon={Layers} route="/finance/ar-aging" />
            <SnapshotCard label="Overdue Accounts" value={kpi?.overdueInvoices ?? 'N/A'} icon={AlertTriangle} route="/admin/overdue" />
            <SnapshotCard label="Dump Fee Reconciliation" value="No data yet" icon={FileText} route="/admin/tickets" />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <QuickAction label="Invoices" route="/finance/invoices" icon={FileText} />
            <QuickAction label="Payments" route="/finance/payments" icon={DollarSign} />
            <QuickAction label="Approval Queue" route="/admin/approval-queue" icon={CheckCircle2} />
            <QuickAction label="Overdue" route="/admin/overdue" icon={AlertTriangle} />
          </div>
        </section>
      )}

      {/* ════════ SEO + AI ROW ════════ */}
      <div className="grid lg:grid-cols-2 gap-6">
        {vis.showSEO && (
          <section>
            <SectionHeader title="SEO & Growth" action={{ label: 'SEO Dashboard', route: '/admin/seo/dashboard' }} />
            <Card>
              <CardContent className="p-4 space-y-0.5">
                <ModuleRow name="SEO Health Score" status="LIVE" route="/admin/seo/health" />
                <ModuleRow name={`City Pages (${kpi?.cityPagesActive ?? '…'})`} status="LIVE" route="/admin/seo/cities" />
                <ModuleRow name={`ZIP Pages (${kpi?.zipPagesActive ?? '…'})`} status="LIVE" route="/admin/seo/pages" />
                <ModuleRow name="Sitemap Status" status="LIVE" route="/admin/seo/sitemap" />
                <ModuleRow name="Google Business Profile" status="LIVE" route="/admin/seo/gbp-plan" />
                <ModuleRow name="Google Ads" status="LIVE" route="/admin/ads" />
              </CardContent>
            </Card>
            <div className="flex flex-wrap gap-2 mt-3">
              <QuickAction label="SEO Health" route="/admin/seo/health" icon={BarChart3} />
              <QuickAction label="Route Health" route="/admin/qa/route-health" icon={Activity} />
              <QuickAction label="Duplicate Pages" route="/admin/qa/duplicate-pages" icon={Layers} />
            </div>
          </section>
        )}

        {vis.showAI && (
          <section>
            <SectionHeader title="AI Control Layer" action={{ label: 'AI Control Center', route: '/admin/ai/control-center' }} />
            <Card>
              <CardContent className="p-4 space-y-0.5">
                <ModuleRow name="AI Mode" status="DRY_RUN" route="/admin/ai/control-center" />
                <ModuleRow name="Sales Copilot" status="LIVE" route="/admin/ai/sales" />
                <ModuleRow name="CS Copilot" status="LIVE" route="/admin/ai/customer-service" />
                <ModuleRow name="Dispatch Copilot" status="LIVE" route="/admin/ai/dispatch" />
                <ModuleRow name="AI Performance" status="LIVE" route="/admin/ai/performance" />
                <ModuleRow name="AI Chat Console" status="LIVE" route="/admin/ai/chat" />
              </CardContent>
            </Card>
            <div className="flex flex-wrap gap-2 mt-3">
              <QuickAction label="AI Control" route="/admin/ai/control-center" icon={Brain} />
              <QuickAction label="Sales AI" route="/admin/ai/sales" icon={TrendingUp} />
              <QuickAction label="AI Performance" route="/admin/ai/performance" icon={BarChart3} />
            </div>
          </section>
        )}
      </div>

      {/* ════════ INTEGRATIONS ════════ */}
      {vis.showIntegrations && (
        <section>
          <SectionHeader
            title="Integrations"
            subtitle="External service connectivity"
            action={{ label: 'Functions Map', route: '/admin/setup/functions' }}
          />
          <Card>
            <CardContent className="p-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0.5">
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
      )}

      {/* ════════ QUICK ACCESS GRID ════════ */}
      {vis.showQuickAccess && (
        <section>
          <SectionHeader title="Quick Access" subtitle="Jump to any department" />
          <div className="space-y-4">
            {[
              {
                group: 'Sales', items: [
                  { label: 'Lead Hub', icon: Users, route: '/sales/leads', description: 'All leads' },
                  { label: 'Quotes', icon: FileText, route: '/sales/quotes', description: 'Quote management' },
                  { label: 'Contracts', icon: FileText, route: '/sales/quotes', description: 'Contract flow' },
                  { label: 'Follow-Ups', icon: Bell, route: '/admin/alerts', description: 'Pending actions' },
                ], show: vis.showSales,
              },
              {
                group: 'Customers', items: [
                  { label: 'Customer Search', icon: SearchIcon, route: '/admin/customers', description: 'Find customers' },
                  { label: 'Customer 360', icon: Users, route: '/admin/customers', description: 'Full profiles' },
                  { label: 'Requests', icon: MessageSquare, route: '/admin/alerts', description: 'Service requests' },
                  { label: 'Health', icon: Activity, route: '/admin/customer-health', description: 'Customer health' },
                ], show: vis.showCustomers,
              },
              {
                group: 'Operations', items: [
                  { label: 'Dispatch', icon: Calendar, route: '/dispatch/calendar', description: 'Schedule & assign' },
                  { label: 'Runs', icon: Route, route: '/dispatch/today', description: "Today's runs" },
                  { label: 'Driver App', icon: Truck, route: '/driver', description: 'Field execution' },
                  { label: 'Fleet', icon: Car, route: '/admin/drivers', description: 'Vehicles & maintenance' },
                ], show: vis.showDispatch,
              },
              {
                group: 'Finance', items: [
                  { label: 'Invoices', icon: FileText, route: '/finance/invoices', description: 'Invoice mgmt' },
                  { label: 'Payments', icon: DollarSign, route: '/finance/payments', description: 'Collections' },
                  { label: 'Approval Queue', icon: CheckCircle2, route: '/admin/approval-queue', description: 'Pending approvals' },
                  { label: 'Overdue', icon: AlertTriangle, route: '/admin/overdue', description: 'Past-due accounts' },
                ], show: vis.showFinance,
              },
              {
                group: 'Growth', items: [
                  { label: 'SEO Health', icon: BarChart3, route: '/admin/seo/health', description: 'Page scores' },
                  { label: 'Route Health', icon: Activity, route: '/admin/qa/route-health', description: 'Route audit' },
                  { label: 'Duplicate Pages', icon: Layers, route: '/admin/qa/duplicate-pages', description: 'Dedup audit' },
                  { label: 'Google Ads', icon: Megaphone, route: '/admin/ads', description: 'Campaigns' },
                ], show: vis.showSEO,
              },
              {
                group: 'System', items: [
                  { label: 'Integrations', icon: Link2, route: '/admin/setup/functions', description: 'API connections' },
                  { label: 'Domain Health', icon: Globe, route: '/admin/qa/route-health', description: 'DNS & SSL' },
                  { label: 'Build Info', icon: Shield, route: '/admin/qa/build-info', description: 'Version info' },
                  { label: 'Module Registry', icon: Layers, route: '/admin/modules', description: 'All modules' },
                ], show: vis.showIntegrations,
              },
            ].filter(g => g.show).map(group => (
              <div key={group.group}>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.group}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {group.items.map(item => (
                    <QuickAccessCard key={item.label} {...item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
