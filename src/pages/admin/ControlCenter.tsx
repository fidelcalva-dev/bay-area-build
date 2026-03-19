import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Globe, Users, ShoppingCart, Headphones, Truck, Wrench,
  DollarSign, BarChart3, Link2, Shield, ArrowRight, AlertTriangle,
  CheckCircle2, Clock, XCircle, Settings, Brain, Bell, Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type ModuleStatus = 'LIVE' | 'DRY_RUN' | 'OFF' | 'NEEDS_SETUP' | 'NOT_BUILT';

interface ModuleCard {
  name: string;
  description: string;
  status: ModuleStatus;
  openRoute: string | null;
  configRoute?: string | null;
}

interface Section {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  modules: ModuleCard[];
}

// ──────────────────────────────────────────────
// Status badge component
// ──────────────────────────────────────────────
function StatusBadge({ status }: { status: ModuleStatus }) {
  const cfg: Record<ModuleStatus, { label: string; className: string }> = {
    LIVE: { label: 'LIVE', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    DRY_RUN: { label: 'DRY RUN', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    OFF: { label: 'OFF', className: 'bg-muted text-muted-foreground border-border' },
    NEEDS_SETUP: { label: 'NEEDS SETUP', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
    NOT_BUILT: { label: 'NOT BUILT', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800' },
  };
  const c = cfg[status];
  return <Badge variant="outline" className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5', c.className)}>{c.label}</Badge>;
}

// ──────────────────────────────────────────────
// FULL MODULE REGISTRY (audited from routes)
// ──────────────────────────────────────────────
const SECTIONS: Section[] = [
  {
    key: 'website',
    label: 'Website Systems',
    icon: Globe,
    modules: [
      { name: 'Homepage & Content', description: 'Public landing page and service pages', status: 'LIVE', openRoute: '/', configRoute: null },
      { name: 'Quote System', description: 'Instant price calculator for customers', status: 'LIVE', openRoute: '/quote', configRoute: '/admin/pricing' },
      { name: 'Photo Upload & Size AI', description: 'AI waste analysis and size recommendation', status: 'LIVE', openRoute: '/quote', configRoute: '/admin/qa/photo-ai-test' },
      { name: 'AI Assistant (Ask a Specialist)', description: 'Website chatbot for lead capture', status: 'LIVE', openRoute: null, configRoute: '/admin/ai/performance' },
      { name: 'City & SEO Pages', description: 'Localized landing pages for each city', status: 'LIVE', openRoute: '/admin/seo/pages', configRoute: '/admin/seo/dashboard' },
      { name: 'Sitemap & Robots', description: 'Search engine crawl configuration', status: 'LIVE', openRoute: '/admin/seo/sitemap', configRoute: null },
      { name: 'Public Contact Form', description: 'Contact page lead capture', status: 'LIVE', openRoute: '/contact', configRoute: null },
      { name: 'Customer Portal', description: 'Secure portal for quotes, scheduling, payment', status: 'LIVE', openRoute: '/portal', configRoute: '/admin/activation' },
    ],
  },
  {
    key: 'sales',
    label: 'Lead & Sales Systems',
    icon: ShoppingCart,
    modules: [
      { name: 'Lead Ingest Pipeline', description: 'Unified gateway for all lead sources', status: 'LIVE', openRoute: '/admin/leads/settings', configRoute: '/admin/leads/settings' },
      { name: 'Lead Hub', description: 'Omni-channel inbox for all leads', status: 'LIVE', openRoute: '/sales/leads', configRoute: null },
      { name: 'Quote Builder', description: 'Internal quote creation for sales staff', status: 'LIVE', openRoute: '/sales/quotes/new', configRoute: '/admin/pricing' },
      { name: 'Contract Signing', description: 'Digital contract flow with e-signature', status: 'LIVE', openRoute: '/sales/quotes', configRoute: null },
      { name: 'Payment Request', description: 'Send payment links to customers', status: 'LIVE', openRoute: '/finance/payment-actions', configRoute: '/admin/email-config' },
      { name: 'Lead SLA Monitor', description: '5min/30min/2hr escalation system', status: 'LIVE', openRoute: '/admin/alerts', configRoute: null },
      { name: 'Lead Scoring Engine', description: 'Quality/risk scoring by location, project, material', status: 'LIVE', openRoute: '/sales/leads', configRoute: null },
      { name: 'Assistant Learning', description: 'AI training data from chat sessions', status: 'LIVE', openRoute: '/admin/ai/performance', configRoute: null },
      { name: 'Sales Performance', description: 'Sales team KPIs and funnel metrics', status: 'LIVE', openRoute: '/admin/sales-performance', configRoute: null },
    ],
  },
  {
    key: 'cs',
    label: 'Customer Service',
    icon: Headphones,
    modules: [
      { name: 'Customer Messages (GHL)', description: 'Omnichannel messaging via GoHighLevel', status: 'DRY_RUN', openRoute: '/admin/ghl', configRoute: '/admin/ghl' },
      { name: 'Customer 360', description: 'Unified customer profile with timeline', status: 'LIVE', openRoute: '/admin/customers', configRoute: null },
      { name: 'Customer Health Scoring', description: 'Automated health scores with alerts', status: 'LIVE', openRoute: '/admin/customer-health', configRoute: null },
      { name: 'Portal Requests', description: 'Customer portal actions and scheduling', status: 'LIVE', openRoute: '/admin/activation', configRoute: null },
      { name: 'Callbacks & Escalations', description: 'Missed call callback tasks and SLA escalation', status: 'LIVE', openRoute: '/admin/alerts', configRoute: null },
      { name: 'Review Requests', description: 'Post-service review solicitation', status: 'NOT_BUILT', openRoute: null, configRoute: null },
    ],
  },
  {
    key: 'dispatch',
    label: 'Dispatch & Logistics',
    icon: Truck,
    modules: [
      { name: 'Dispatch Calendar', description: 'Daily/weekly run scheduling', status: 'LIVE', openRoute: '/dispatch/calendar', configRoute: null },
      { name: 'Route Control Tower', description: 'Live map with traffic-aware routing', status: 'LIVE', openRoute: '/dispatch/control-tower', configRoute: null },
      { name: 'Today\'s Board', description: 'Today\'s runs with status tracking', status: 'LIVE', openRoute: '/dispatch/today', configRoute: null },
      { name: 'Yard Manager', description: 'Operational yards with coordinates and capacity', status: 'LIVE', openRoute: '/admin/yards', configRoute: '/admin/yards' },
      { name: 'Facility Finder', description: 'Dump site search by material and distance', status: 'LIVE', openRoute: '/admin/facilities/finder', configRoute: '/admin/facilities' },
      { name: 'Driver Assignments', description: 'Assign drivers to routes and vehicles', status: 'LIVE', openRoute: '/admin/drivers', configRoute: null },
      { name: 'Route History', description: 'Completed route replay and auditing', status: 'LIVE', openRoute: '/dispatch/history', configRoute: null },
      { name: 'Asset Control Tower', description: 'Fleet-wide asset tracking and inventory', status: 'LIVE', openRoute: '/admin/assets', configRoute: null },
      { name: 'Yard Hold Board', description: 'Full dumpsters awaiting dump-and-return', status: 'LIVE', openRoute: '/dispatch/yard-hold', configRoute: null },
      { name: 'Movement Log', description: 'Append-only asset movement history', status: 'LIVE', openRoute: '/admin/movements', configRoute: null },
    ],
  },
  {
    key: 'driver',
    label: 'Driver App',
    icon: Truck,
    modules: [
      { name: 'Driver Dashboard', description: 'Mobile-first driver home screen', status: 'LIVE', openRoute: '/driver', configRoute: null },
      { name: 'Today\'s Runs', description: 'Active runs list with checkpoint tracking', status: 'LIVE', openRoute: '/driver/runs', configRoute: null },
      { name: 'Run Detail / Checkpoints', description: 'Delivery and pickup checkpoints with geo-stamps', status: 'LIVE', openRoute: '/driver/runs', configRoute: null },
      { name: 'Photo Proof Upload', description: 'Delivery and pickup photo evidence', status: 'LIVE', openRoute: '/driver/runs', configRoute: null },
      { name: 'Truck Selection', description: 'Pre-shift vehicle selection', status: 'LIVE', openRoute: '/driver/truck-select', configRoute: null },
      { name: 'Pre-Trip Inspection', description: 'DOT-compliant vehicle inspection forms', status: 'LIVE', openRoute: '/driver/inspect', configRoute: null },
      { name: 'Report Issue', description: 'Driver-initiated maintenance or service issues', status: 'LIVE', openRoute: '/driver/report-issue', configRoute: null },
      { name: 'Dump Ticket Upload', description: 'Scale ticket capture at dump facilities', status: 'LIVE', openRoute: '/driver/runs', configRoute: null },
    ],
  },
  {
    key: 'maintenance',
    label: 'Maintenance & Fleet',
    icon: Wrench,
    modules: [
      { name: 'Vehicle Profiles', description: 'Truck specs, registration, and insurance', status: 'LIVE', openRoute: '/admin/drivers', configRoute: null },
      { name: 'Fleet Cameras', description: 'Camera feeds and event linking', status: 'LIVE', openRoute: '/admin/fleet/cameras', configRoute: null },
      { name: 'Maintenance Requests', description: 'Driver-reported issues and repairs', status: 'LIVE', openRoute: '/driver/report-issue', configRoute: null },
      { name: 'Inspection Records', description: 'Pre-trip inspection history', status: 'LIVE', openRoute: '/driver/inspect', configRoute: null },
      { name: 'GPS / Telematics', description: 'Real-time vehicle location tracking', status: 'NOT_BUILT', openRoute: null, configRoute: null },
      { name: 'Fleet Alerts', description: 'Automated alerts for maintenance due dates', status: 'NOT_BUILT', openRoute: null, configRoute: null },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    icon: DollarSign,
    modules: [
      { name: 'Invoices', description: 'Invoice management and generation', status: 'LIVE', openRoute: '/finance/invoices', configRoute: null },
      { name: 'Payments', description: 'Payment tracking and receipts', status: 'LIVE', openRoute: '/finance/payments', configRoute: null },
      { name: 'Approval Queue', description: 'Discount and pricing approval workflow', status: 'LIVE', openRoute: '/admin/approval-queue', configRoute: null },
      { name: 'Overdue Dashboard', description: 'Past-due accounts with collection actions', status: 'LIVE', openRoute: '/admin/overdue', configRoute: null },
      { name: 'AR Aging', description: 'Accounts receivable aging by customer', status: 'LIVE', openRoute: '/finance/ar-aging', configRoute: null },
      { name: 'Dump Fee Reconciliation', description: 'Tickets & receipts management', status: 'LIVE', openRoute: '/admin/tickets', configRoute: null },
      { name: 'Profitability Dashboard', description: 'Revenue, cost, and margin analysis', status: 'LIVE', openRoute: '/admin/profitability', configRoute: null },
      { name: 'Revenue Reports', description: 'Finance analytics and KPIs', status: 'LIVE', openRoute: '/admin/dashboards/finance', configRoute: null },
    ],
  },
  {
    key: 'seo',
    label: 'SEO & Local Marketing',
    icon: BarChart3,
    modules: [
      { name: 'SEO Dashboard', description: 'Centralized SEO management', status: 'LIVE', openRoute: '/admin/seo/dashboard', configRoute: null },
      { name: 'SEO Audit Engine', description: 'Automated page scoring and improvement', status: 'LIVE', openRoute: '/admin/seo/audit', configRoute: null },
      { name: 'City Pages', description: 'City-specific SEO landing pages', status: 'LIVE', openRoute: '/admin/seo/cities', configRoute: null },
      { name: 'SEO Health Monitor', description: 'Site-wide SEO score tracking', status: 'LIVE', openRoute: '/admin/seo/health', configRoute: null },
      { name: 'Page Queue', description: 'Generate and publish new SEO pages', status: 'LIVE', openRoute: '/admin/seo/queue', configRoute: null },
      { name: 'SEO Metrics', description: 'Impressions, clicks, CTR by page', status: 'LIVE', openRoute: '/admin/seo/metrics', configRoute: null },
      { name: 'Google Business Profile', description: 'GBP optimization plan', status: 'LIVE', openRoute: '/admin/seo/gbp-plan', configRoute: null },
      { name: 'Indexing Status', description: 'Page indexing and crawl monitoring', status: 'LIVE', openRoute: '/admin/seo/indexing', configRoute: null },
      { name: 'SEO Rules', description: 'Automated SEO generation rules', status: 'LIVE', openRoute: '/admin/seo/rules', configRoute: null },
      { name: 'Visitor Intelligence', description: 'First-party visitor tracking', status: 'LIVE', openRoute: '/admin/marketing/visitors', configRoute: null },
      { name: 'Google Ads', description: 'Campaign management and optimization', status: 'LIVE', openRoute: '/admin/ads', configRoute: '/admin/ads/markets' },
      { name: 'Marketing Dashboard', description: 'Unified marketing analytics', status: 'LIVE', openRoute: '/admin/marketing/dashboard', configRoute: null },
    ],
  },
  {
    key: 'integrations',
    label: 'Integrations',
    icon: Link2,
    modules: [
      { name: 'Google Workspace', description: 'Gmail, Calendar, Drive integration', status: 'NEEDS_SETUP', openRoute: '/admin/google', configRoute: '/admin/google/setup' },
      { name: 'SMS / Twilio', description: 'SMS messaging and OTP verification', status: 'NEEDS_SETUP', openRoute: '/admin/telephony/calls', configRoute: '/admin/telephony/numbers' },
      { name: 'Telephony System', description: 'Inbound/outbound call routing and recording', status: 'NEEDS_SETUP', openRoute: '/admin/telephony/calls', configRoute: '/admin/telephony/migration' },
      { name: 'GoHighLevel (GHL)', description: 'CRM sync, messaging bridge, webhooks (canonical: ghl-send-outbound, ghl-webhook-inbound, ghl-sync-poller, highlevel-webhook)', status: 'DRY_RUN', openRoute: '/admin/ghl', configRoute: '/admin/ghl' },
      { name: 'Maps & Routing', description: 'Google Maps for traffic-aware routing', status: 'LIVE', openRoute: '/dispatch/control-tower', configRoute: null },
      { name: 'Payment Gateway', description: 'Authorize.Net payment processing', status: 'NEEDS_SETUP', openRoute: '/finance/payments', configRoute: null },
      { name: 'Email Pipeline', description: 'Transactional emails for quotes, receipts', status: 'NEEDS_SETUP', openRoute: '/admin/email-config', configRoute: '/admin/email-config' },
      { name: 'Functions Map', description: 'Edge functions connectivity and status', status: 'LIVE', openRoute: '/admin/setup/functions', configRoute: null },
      { name: 'Missing Connections', description: 'Scan for disconnected integrations', status: 'LIVE', openRoute: '/admin/setup/what-missing', configRoute: null },
    ],
  },
  {
    key: 'ai',
    label: 'AI Systems',
    icon: Brain,
    modules: [
      { name: 'AI Performance', description: 'AI model usage, accuracy, and session metrics', status: 'LIVE', openRoute: '/admin/ai/performance', configRoute: null },
      { name: 'AI Chat Console', description: 'Internal AI assistant for operations', status: 'LIVE', openRoute: '/admin/ai/chat', configRoute: null },
      { name: 'Master AI Worker', description: 'Background AI job processing', status: 'LIVE', openRoute: '/admin/qa/control-center', configRoute: null },
      { name: 'AI Decisions Log', description: 'Automated decision audit trail', status: 'LIVE', openRoute: '/admin/qa/control-center', configRoute: null },
      { name: 'Quote AI Recommender', description: 'AI-powered price and size suggestions', status: 'LIVE', openRoute: '/admin/calculator/logs', configRoute: null },
    ],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: Bell,
    modules: [
      { name: 'Internal Alerts', description: 'Email/chat alerts for business events', status: 'LIVE', openRoute: '/admin/notifications/internal', configRoute: null },
      { name: 'Alert Dashboard', description: 'Unresolved alerts and escalations', status: 'LIVE', openRoute: '/admin/alerts', configRoute: null },
      { name: 'Messaging Center', description: 'SMS/Email template management', status: 'LIVE', openRoute: '/admin/messaging', configRoute: null },
      { name: 'Email Config', description: 'Email mode (DRY_RUN/LIVE) and domain setup', status: 'DRY_RUN', openRoute: '/admin/email-config', configRoute: '/admin/email-config' },
    ],
  },
  {
    key: 'security',
    label: 'Security & System Health',
    icon: Shield,
    modules: [
      { name: 'Security Health', description: 'RLS policies, access control, vulnerability scan', status: 'LIVE', openRoute: '/admin/security', configRoute: null },
      { name: 'QA Control Center', description: 'Automated testing and go-live readiness', status: 'LIVE', openRoute: '/admin/qa/control-center', configRoute: null },
      { name: 'Build Info', description: 'Current build version and deployment info', status: 'LIVE', openRoute: '/admin/qa/build-info', configRoute: null },
      { name: 'Env Health', description: 'Environment variables and secret status', status: 'LIVE', openRoute: '/admin/qa/env-health', configRoute: null },
      { name: 'Build Health', description: 'Build process status and error tracking', status: 'LIVE', openRoute: '/admin/qa/build-health', configRoute: null },
      { name: 'Audit Logs', description: 'Full action audit trail for compliance', status: 'LIVE', openRoute: '/admin/audit-logs', configRoute: null },
      { name: 'User Management', description: 'Staff accounts, roles, and permissions', status: 'LIVE', openRoute: '/admin/users', configRoute: '/admin/access-requests' },
      { name: 'Fraud Flags', description: 'Suspicious activity detection', status: 'LIVE', openRoute: '/admin/fraud-flags', configRoute: null },
      { name: 'Risk Review', description: 'High-risk order and customer review', status: 'LIVE', openRoute: '/admin/risk', configRoute: null },
      { name: 'Config Health', description: 'Database configuration consistency check', status: 'LIVE', openRoute: '/admin/config/health', configRoute: null },
    ],
  },
];

const CATEGORY_FILTERS = [
  { key: 'all', label: 'All' },
  ...SECTIONS.map(s => ({ key: s.key, label: s.label.split(' ')[0] })),
];

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export default function ControlCenter() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'errors' | 'setup'>('all');

  const filtered = useMemo(() => {
    return SECTIONS.map(section => {
      if (category !== 'all' && section.key !== category) return null;

      const modules = section.modules.filter(m => {
        if (search) {
          const q = search.toLowerCase();
          if (!m.name.toLowerCase().includes(q) && !m.description.toLowerCase().includes(q)) return false;
        }
        if (statusFilter === 'errors' && m.status !== 'NOT_BUILT') return false;
        if (statusFilter === 'setup' && m.status !== 'NEEDS_SETUP' && m.status !== 'NOT_BUILT') return false;
        return true;
      });

      if (modules.length === 0) return null;
      return { ...section, modules };
    }).filter(Boolean) as Section[];
  }, [search, category, statusFilter]);

  // Summary counts
  const summary = useMemo(() => {
    const all = SECTIONS.flatMap(s => s.modules);
    return {
      total: all.length,
      live: all.filter(m => m.status === 'LIVE').length,
      dryRun: all.filter(m => m.status === 'DRY_RUN').length,
      needsSetup: all.filter(m => m.status === 'NEEDS_SETUP').length,
      notBuilt: all.filter(m => m.status === 'NOT_BUILT').length,
      off: all.filter(m => m.status === 'OFF').length,
    };
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Control Center</h1>
        <p className="text-sm text-muted-foreground">Platform-wide operations headquarters — every system, one page</p>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard
          label="Total Modules"
          value={summary.total}
          icon={<Settings className="w-4 h-4" />}
          className="text-foreground"
        />
        <SummaryCard
          label="Live"
          value={summary.live}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          className="text-emerald-600"
          onClick={() => setStatusFilter('all')}
        />
        <SummaryCard
          label="Dry Run"
          value={summary.dryRun}
          icon={<Clock className="w-4 h-4 text-amber-600" />}
          className="text-amber-600"
        />
        <SummaryCard
          label="Needs Setup"
          value={summary.needsSetup}
          icon={<AlertTriangle className="w-4 h-4 text-orange-600" />}
          className="text-orange-600"
          onClick={() => setStatusFilter('setup')}
        />
        <SummaryCard
          label="Not Built"
          value={summary.notBuilt}
          icon={<XCircle className="w-4 h-4 text-red-600" />}
          className="text-red-600"
          onClick={() => setStatusFilter('errors')}
        />
        <SummaryCard
          label="Off"
          value={summary.off}
          icon={<XCircle className="w-4 h-4 text-muted-foreground" />}
          className="text-muted-foreground"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_FILTERS.map(f => (
            <Button
              key={f.key}
              variant={category === f.key ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-8"
              onClick={() => setCategory(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-auto">
          <Button
            variant={statusFilter === 'errors' ? 'destructive' : 'outline'}
            size="sm"
            className="text-xs h-8 gap-1"
            onClick={() => setStatusFilter(statusFilter === 'errors' ? 'all' : 'errors')}
          >
            <XCircle className="w-3 h-3" /> Not Built
          </Button>
          <Button
            variant={statusFilter === 'setup' ? 'secondary' : 'outline'}
            size="sm"
            className="text-xs h-8 gap-1"
            onClick={() => setStatusFilter(statusFilter === 'setup' ? 'all' : 'setup')}
          >
            <AlertTriangle className="w-3 h-3" /> Needs Setup
          </Button>
        </div>
      </div>

      {/* Sections */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No modules match your search or filters.
        </div>
      ) : (
        filtered.map(section => {
          const Icon = section.icon;
          return (
            <div key={section.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{section.label}</h2>
                <Badge variant="secondary" className="text-xs ml-1">{section.modules.length}</Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {section.modules.map(mod => (
                  <ModuleCardComponent key={mod.name} module={mod} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────
function SummaryCard({ label, value, icon, className, onClick }: {
  label: string; value: number; icon: React.ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <Card
      className={cn('cursor-default', onClick && 'cursor-pointer hover:border-primary/50 transition-colors')}
      onClick={onClick}
    >
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center gap-2">
          {icon}
          <span className={cn('text-2xl font-bold', className)}>{value}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function ModuleCardComponent({ module: m }: { module: ModuleCard }) {
  const isDisabled = !m.openRoute;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground leading-tight">{m.name}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{m.description}</p>
          </div>
          <StatusBadge status={m.status} />
        </div>
        <div className="flex items-center gap-2">
          {isDisabled ? (
            <span className="text-[11px] text-muted-foreground italic">Not built yet</span>
          ) : (
            <Button asChild variant="default" size="sm" className="h-7 text-xs gap-1 flex-1">
              <Link to={m.openRoute!}>
                Open <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          )}
          {m.configRoute && (
            <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Link to={m.configRoute}>
                <Settings className="w-3 h-3" /> Config
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
