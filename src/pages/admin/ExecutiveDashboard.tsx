import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, RefreshCw, TrendingUp, Users, Truck, DollarSign, 
  AlertTriangle, Package, Plus, Calculator, Calendar, BarChart3,
  Send, Search, Zap, Clock, Phone, FileText, ArrowRight,
  ChevronRight, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format, differenceInMinutes, startOfDay, subDays } from 'date-fns';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────
interface LiveStats {
  leadsToday: number;
  ordersToday: number;
  revenueToday: number;
  dumpFeesToday: number;
  activeTrucks: number;
  activeJobs: number;
  openAlerts: number;
}

interface TimelineItem {
  id: string;
  time: string;
  event_type: string;
  summary: string;
  source: string;
  entity_type: string;
}

interface LeadItem {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  channel_key: string | null;
  created_at: string;
  lead_status: string | null;
  assigned_to: string | null;
  urgency_score: number | null;
  market_code: string | null;
}

// ─── Live Status Bar ─────────────────────────────────────────────
function LiveStatusBar({ stats, loading }: { stats: LiveStats; loading: boolean }) {
  const items = [
    { label: 'Leads Today', value: stats.leadsToday, icon: Users, color: 'text-blue-500' },
    { label: 'Orders Today', value: stats.ordersToday, icon: Package, color: 'text-green-500' },
    { label: 'Revenue', value: `$${stats.revenueToday.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
    { label: 'Dump Fees', value: `$${stats.dumpFeesToday.toLocaleString()}`, icon: Truck, color: 'text-orange-500' },
    { label: 'Active Trucks', value: stats.activeTrucks, icon: Truck, color: 'text-purple-500' },
    { label: 'Active Jobs', value: stats.activeJobs, icon: Activity, color: 'text-cyan-500' },
    { label: 'Open Alerts', value: stats.openAlerts, icon: AlertTriangle, color: stats.openAlerts > 0 ? 'text-red-500' : 'text-muted-foreground' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="relative overflow-hidden">
            <CardContent className="p-4">
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{item.value}</p>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Quick Actions ───────────────────────────────────────────────
function QuickActions() {
  const navigate = useNavigate();
  const actions = [
    { label: 'New Order', icon: Plus, path: '/sales/quotes/new', color: 'bg-primary text-primary-foreground' },
    { label: 'Lead Inbox', icon: Users, path: '/admin/leads', color: 'bg-blue-600 text-white' },
    { label: 'Calculator', icon: Calculator, path: '/internal/calculator', color: 'bg-emerald-600 text-white' },
    { label: 'Dispatch', icon: Calendar, path: '/admin/dispatch', color: 'bg-purple-600 text-white' },
    { label: 'Finance', icon: DollarSign, path: '/admin/dashboards/finance', color: 'bg-amber-600 text-white' },
    { label: 'Pricing', icon: BarChart3, path: '/admin/pricing', color: 'bg-cyan-600 text-white' },
    { label: 'Activation', icon: Send, path: '/admin/activation', color: 'bg-pink-600 text-white' },
    { label: 'SEO', icon: Search, path: '/admin/seo', color: 'bg-teal-600 text-white' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Button
            key={a.label}
            size="sm"
            className={`${a.color} hover:opacity-90`}
            onClick={() => navigate(a.path)}
          >
            <Icon className="w-4 h-4 mr-1.5" />
            {a.label}
          </Button>
        );
      })}
    </div>
  );
}

// ─── Activity Timeline ──────────────────────────────────────────
function ActivityTimeline({ events, loading }: { events: TimelineItem[]; loading: boolean }) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CALL': return Phone;
      case 'ORDER': case 'DISPATCH': return Package;
      case 'DELIVERY': case 'PICKUP': case 'SWAP': return Truck;
      case 'PAYMENT': case 'BILLING': return DollarSign;
      case 'QUOTE': return FileText;
      default: return Activity;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'CALL': return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      case 'ORDER': return 'border-green-500 bg-green-50 dark:bg-green-950';
      case 'DELIVERY': case 'PICKUP': return 'border-purple-500 bg-purple-50 dark:bg-purple-950';
      case 'PAYMENT': return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950';
      default: return 'border-muted-foreground bg-muted';
    }
  };

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No events today yet.</p>;
  }

  return (
    <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
      {events.map((event) => {
        const Icon = getEventIcon(event.event_type);
        return (
          <div key={event.id} className={`flex items-start gap-3 p-2.5 rounded-lg border-l-2 ${getEventColor(event.event_type)}`}>
            <div className="flex-shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{event.summary}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">{format(new Date(event.time), 'h:mm a')}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{event.event_type}</Badge>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{event.source}</Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Lead Velocity Panel ─────────────────────────────────────────
function LeadVelocityPanel({ leads, loading }: { leads: LeadItem[]; loading: boolean }) {
  const navigate = useNavigate();

  const hotLeads = useMemo(() => {
    const now = new Date();
    return leads
      .filter(l => !l.assigned_to || l.lead_status === 'new' || l.lead_status === 'contacted')
      .map(l => ({
        ...l,
        minutesSinceArrival: differenceInMinutes(now, new Date(l.created_at)),
      }))
      .sort((a, b) => b.minutesSinceArrival - a.minutesSinceArrival)
      .slice(0, 10);
  }, [leads]);

  const overSLA = hotLeads.filter(l => l.minutesSinceArrival > 15 && !l.assigned_to).length;

  if (loading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-3">
      {overSLA > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">{overSLA} leads over 15 min SLA</span>
        </div>
      )}
      {hotLeads.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">All leads contacted ✓</p>
      ) : (
        <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
          {hotLeads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate(`/sales/leads/${lead.id}`)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{lead.customer_name || 'Unknown'}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{lead.channel_key || 'Direct'}</span>
                  {lead.market_code && <span className="text-xs text-muted-foreground">• {lead.market_code}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={lead.minutesSinceArrival > 15 ? 'destructive' : 'secondary'} className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {lead.minutesSinceArrival}m
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Revenue Chart (Last 7 Days) ────────────────────────────────
function RevenueChart({ data, loading }: { data: { day: string; revenue: number }[]; loading: boolean }) {
  if (loading) return <Skeleton className="h-48 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}>
        <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Lead Source Chart ────────────────────────────────────────────
function LeadSourceChart({ data, loading }: { data: { source: string; count: number }[]; loading: boolean }) {
  const COLORS = ['hsl(220, 70%, 55%)', 'hsl(150, 60%, 45%)', 'hsl(35, 80%, 55%)', 'hsl(280, 60%, 55%)', 'hsl(0, 60%, 55%)'];
  if (loading) return <Skeleton className="h-48 w-full" />;
  if (data.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">No lead data</p>;
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="source" innerRadius={35} outerRadius={60} paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5">
        {data.map((item, i) => (
          <div key={item.source} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-xs">{item.source}</span>
            <span className="text-xs font-bold ml-auto">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Alerts Panel ─────────────────────────────────────────────────
function AlertsPanel({ alerts, loading }: { alerts: { id: string; severity: string; title: string; created_at: string }[]; loading: boolean }) {
  const navigate = useNavigate();
  if (loading) return <Skeleton className="h-32 w-full" />;
  if (alerts.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">No open alerts ✓</p>;

  return (
    <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
            alert.severity === 'critical' ? 'border-destructive/40 bg-destructive/5' :
            alert.severity === 'warning' ? 'border-amber-500/40 bg-amber-50 dark:bg-amber-950/20' :
            'border-border'
          }`}
          onClick={() => navigate('/admin/alerts')}
        >
          <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
            alert.severity === 'critical' ? 'text-destructive' :
            alert.severity === 'warning' ? 'text-amber-500' : 'text-muted-foreground'
          }`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{alert.title}</p>
            <span className="text-xs text-muted-foreground">{format(new Date(alert.created_at), 'h:mm a')}</span>
          </div>
          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'} className="text-[10px]">
            {alert.severity}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// ─── Main Executive Dashboard ────────────────────────────────────
export default function ExecutiveDashboard() {
  const [stats, setStats] = useState<LiveStats>({ leadsToday: 0, ordersToday: 0, revenueToday: 0, dumpFeesToday: 0, activeTrucks: 0, activeJobs: 0, openAlerts: 0 });
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [alerts, setAlerts] = useState<{ id: string; severity: string; title: string; created_at: string }[]>([]);
  const [revenueData, setRevenueData] = useState<{ day: string; revenue: number }[]>([]);
  const [leadSources, setLeadSources] = useState<{ source: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [timelineFilter, setTimelineFilter] = useState<string>('All');

  const todayStart = useMemo(() => startOfDay(new Date()).toISOString(), []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const today = startOfDay(new Date()).toISOString();
    const sevenDaysAgo = subDays(new Date(), 7).toISOString();

    try {
      const [
        leadsRes, ordersRes, timelineRes, alertsRes, revenueRes,
        runsRes
      ] = await Promise.all([
        // Leads today
        supabase.from('sales_leads').select('id, customer_name, customer_phone, channel_key, created_at, lead_status, assigned_to, urgency_score, market_code').gte('created_at', today).order('created_at', { ascending: false }),
        // Orders today
        supabase.from('orders').select('id, status, amount_due, amount_paid, created_at').gte('created_at', today),
        // Timeline today
        supabase.from('timeline_events' as never).select('id, created_at, event_type, summary, source, entity_type').gte('created_at', today).eq('visibility', 'INTERNAL').order('created_at', { ascending: false }).limit(50),
        // Open alerts
        (supabase as any).from('alerts').select('id, severity, title, created_at').eq('is_resolved', false).order('created_at', { ascending: false }).limit(20),
        // Revenue last 7 days
        supabase.from('orders').select('created_at, amount_due').gte('created_at', sevenDaysAgo),
        // Active runs
        supabase.from('runs' as never).select('id, status, driver_id').in('status', ['EN_ROUTE', 'ARRIVED', 'ASSIGNED']),
      ]);

      // Process stats
      const leadsData = (leadsRes.data || []) as unknown as LeadItem[];
      const ordersData = ordersRes.data || [];
      const runsData = (runsRes.data || []) as { id: string; status: string; driver_id: string | null }[];
      const alertsData = (alertsRes.data || []) as { id: string; severity: string; title: string; created_at: string }[];

      setLeads(leadsData);
      setAlerts(alertsData);

      const totalRevenue = ordersData.reduce((sum, o: any) => sum + (o.amount_due || 0), 0);
      const activeDriverIds = new Set(runsData.filter(r => r.driver_id).map(r => r.driver_id));

      setStats({
        leadsToday: leadsData.length,
        ordersToday: ordersData.length,
        revenueToday: totalRevenue,
        dumpFeesToday: 0, // Would come from dump_tickets if available
        activeTrucks: activeDriverIds.size,
        activeJobs: runsData.length,
        openAlerts: alertsData.length,
      });

      // Timeline
      const timelineData = ((timelineRes.data || []) as any[]).map((e: any) => ({
        id: e.id,
        time: e.created_at,
        event_type: e.event_type,
        summary: e.summary,
        source: e.source,
        entity_type: e.entity_type,
      }));
      setTimeline(timelineData);

      // Revenue chart
      const revByDay: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        revByDay[format(d, 'EEE')] = 0;
      }
      (revenueRes.data || []).forEach((o: any) => {
        const day = format(new Date(o.created_at), 'EEE');
        if (revByDay[day] !== undefined) revByDay[day] += (o.amount_due || 0);
      });
      setRevenueData(Object.entries(revByDay).map(([day, revenue]) => ({ day, revenue })));

      // Lead sources
      const sourceMap: Record<string, number> = {};
      leadsData.forEach(l => {
        const src = l.channel_key || 'Direct';
        sourceMap[src] = (sourceMap[src] || 0) + 1;
      });
      setLeadSources(
        Object.entries(sourceMap)
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );
    } catch (err) {
      console.error('Executive dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [todayStart]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Real-time timeline subscription
  useEffect(() => {
    const channel = supabase
      .channel('exec-timeline')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'timeline_events' }, (payload) => {
        const e = payload.new as any;
        if (e.visibility === 'INTERNAL') {
          setTimeline(prev => [{ id: e.id, time: e.created_at, event_type: e.event_type, summary: e.summary, source: e.source, entity_type: e.entity_type }, ...prev].slice(0, 50));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredTimeline = useMemo(() => {
    if (timelineFilter === 'All') return timeline;
    const filterMap: Record<string, string[]> = {
      Sales: ['CALL', 'QUOTE', 'SMS', 'EMAIL'],
      'Customer Service': ['NOTE', 'CALL'],
      Dispatch: ['DISPATCH', 'DELIVERY', 'PICKUP', 'SWAP', 'PLACEMENT'],
      Finance: ['PAYMENT', 'BILLING', 'OVERDUE'],
    };
    const types = filterMap[timelineFilter] || [];
    return timeline.filter(e => types.includes(e.event_type));
  }, [timeline, timelineFilter]);

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="w-6 h-6 text-primary" />
            Executive Command Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Live operations • Last refreshed {format(lastRefresh, 'h:mm:ss a')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium">LIVE</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Live Status Bar */}
      <LiveStatusBar stats={stats} loading={loading} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline - 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Today's Activity
              </CardTitle>
              <div className="flex gap-1">
                {['All', 'Sales', 'Customer Service', 'Dispatch', 'Finance'].map(f => (
                  <Badge
                    key={f}
                    variant={timelineFilter === f ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => setTimelineFilter(f)}
                  >
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityTimeline events={filteredTimeline} loading={loading} />
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Open Alerts
                {stats.openAlerts > 0 && (
                  <Badge variant="destructive" className="ml-auto">{stats.openAlerts}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AlertsPanel alerts={alerts} loading={loading} />
            </CardContent>
          </Card>

          {/* Lead Velocity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Lead Velocity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeadVelocityPanel leads={leads} loading={loading} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Last 7 Days */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Revenue (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} loading={loading} />
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lead Sources (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LeadSourceChart data={leadSources} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
