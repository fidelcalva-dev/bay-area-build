import { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Users, DollarSign, Truck, Package, 
  BarChart3, Target, Star, AlertTriangle, MapPin, Scale
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, subDays } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

interface HealthMetrics {
  leadsToday: number;
  ordersToday: number;
  revenueToday: number;
  dumpCostToday: number;
  activeDrivers: number;
  totalDrivers: number;
  activeTrucks: number;
  totalTrucks: number;
  completedRunsToday: number;
  avgRevenuePerJob: number;
  profitEstimate: number;
  vipCustomers: number;
  repeatCustomers: number;
  oneTimeCustomers: number;
  hotLeads: number;
  leadsBySource: { source: string; count: number }[];
  revenueByDay: { date: string; revenue: number }[];
}

const COLORS = [
  'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))',
];

function KPICard({ icon, title, value, subtitle, loading, accent }: {
  icon: React.ReactNode; title: string; value: string | number;
  subtitle?: string; loading?: boolean; accent?: string;
}) {
  if (loading) return <Skeleton className="h-28 rounded-xl" />;
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <div className={`p-2 rounded-lg ${accent || 'bg-primary/10 text-primary'}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BusinessIntelligenceDashboard() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

      const [leadsRes, ordersRes, runsRes, driversRes, trucksRes, customersRes, weekOrdersRes] = await Promise.all([
        supabase.from('sales_leads').select('id, channel_key, urgency_score').gte('created_at', `${today}T00:00:00`),
        supabase.from('orders').select('id, total_price, customer_id').gte('created_at', `${today}T00:00:00`),
        supabase.from('runs').select('id, status, dump_fee, assigned_driver_id, assigned_truck_id').eq('scheduled_date', today),
        supabase.from('drivers').select('id, is_active').eq('is_active', true),
        supabase.from('trucks').select('id, is_active').eq('is_active', true),
        supabase.from('customers').select('id').limit(1000),
        supabase.from('orders').select('id, total_price, created_at').gte('created_at', `${weekAgo}T00:00:00`),
      ]);

      const leads = leadsRes.data || [];
      const orders = ordersRes.data || [];
      const runs = runsRes.data || [];
      const drivers = driversRes.data || [];
      const trucks = trucksRes.data || [];
      const weekOrders = weekOrdersRes.data || [];

      const revenue = orders.reduce((s, o: any) => s + (Number(o.total_price) || 0), 0);
      const dumpCost = runs.reduce((s, r: any) => s + (Number(r.dump_fee) || 0), 0);
      const completedRuns = runs.filter((r: any) => r.status === 'COMPLETED').length;
      const activeDriverIds = new Set(
        runs.filter((r: any) => r.assigned_driver_id && !['COMPLETED','CANCELLED'].includes(r.status))
          .map((r: any) => r.assigned_driver_id)
      );
      const activeTruckIds = new Set(
        runs.filter((r: any) => r.assigned_truck_id && !['COMPLETED','CANCELLED'].includes(r.status))
          .map((r: any) => r.assigned_truck_id)
      );

      // Lead sources
      const sourceMap: Record<string, number> = {};
      leads.forEach((l: any) => {
        const src = l.channel_key || 'UNKNOWN';
        sourceMap[src] = (sourceMap[src] || 0) + 1;
      });
      const leadsBySource = Object.entries(sourceMap)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Revenue by day (last 7 days)
      const dayMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        dayMap[format(subDays(new Date(), i), 'MM/dd')] = 0;
      }
      weekOrders.forEach((o: any) => {
        const key = format(new Date(o.created_at), 'MM/dd');
        if (dayMap[key] !== undefined) dayMap[key] += Number(o.total_price) || 0;
      });

      // Customer segmentation (simplified)
      const { count: orderCustomerCount } = await supabase
        .from('orders')
        .select('customer_id', { count: 'exact', head: true });

      setMetrics({
        leadsToday: leads.length,
        ordersToday: orders.length,
        revenueToday: revenue,
        dumpCostToday: dumpCost,
        activeDrivers: activeDriverIds.size,
        totalDrivers: drivers.length,
        activeTrucks: activeTruckIds.size,
        totalTrucks: trucks.length,
        completedRunsToday: completedRuns,
        avgRevenuePerJob: completedRuns > 0 ? revenue / completedRuns : 0,
        profitEstimate: revenue - dumpCost,
        vipCustomers: 0,
        repeatCustomers: 0,
        oneTimeCustomers: (customersRes.data || []).length,
        hotLeads: leads.filter((l: any) => (l.urgency_score || 0) >= 70).length,
        leadsBySource,
        revenueByDay: Object.entries(dayMap).map(([date, rev]) => ({ date, revenue: rev })),
      });
    } catch (err) {
      console.error('Intelligence fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const m = metrics;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Business Intelligence</h1>
          <p className="text-sm text-muted-foreground">AI-powered operational insights — {format(new Date(), 'EEEE, MMM d')}</p>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard icon={<DollarSign className="w-4 h-4" />} title="Revenue Today" 
          value={`$${(m?.revenueToday ?? 0).toLocaleString()}`} loading={loading} accent="bg-emerald-100 text-emerald-700" />
        <KPICard icon={<TrendingUp className="w-4 h-4" />} title="Profit Est."
          value={`$${(m?.profitEstimate ?? 0).toLocaleString()}`} loading={loading} accent="bg-green-100 text-green-700" />
        <KPICard icon={<Users className="w-4 h-4" />} title="Leads Today"
          value={m?.leadsToday ?? 0} subtitle={`${m?.hotLeads ?? 0} hot`} loading={loading} accent="bg-blue-100 text-blue-700" />
        <KPICard icon={<Package className="w-4 h-4" />} title="Orders Today"
          value={m?.ordersToday ?? 0} loading={loading} accent="bg-purple-100 text-purple-700" />
        <KPICard icon={<Scale className="w-4 h-4" />} title="Dump Cost"
          value={`$${(m?.dumpCostToday ?? 0).toLocaleString()}`} loading={loading} accent="bg-orange-100 text-orange-700" />
        <KPICard icon={<BarChart3 className="w-4 h-4" />} title="Avg/Job"
          value={`$${(m?.avgRevenuePerJob ?? 0).toFixed(0)}`} loading={loading} accent="bg-sky-100 text-sky-700" />
      </div>

      {/* Utilization + Runs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Driver Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-6" /> : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {m?.activeDrivers}/{m?.totalDrivers}
                </div>
                <Progress value={m?.totalDrivers ? (m.activeDrivers / m.totalDrivers) * 100 : 0} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {m?.totalDrivers ? ((m.activeDrivers / m.totalDrivers) * 100).toFixed(0) : 0}% active
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="w-4 h-4" /> Truck Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-6" /> : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {m?.activeTrucks}/{m?.totalTrucks}
                </div>
                <Progress value={m?.totalTrucks ? (m.activeTrucks / m.totalTrucks) * 100 : 0} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {m?.totalTrucks ? ((m.activeTrucks / m.totalTrucks) * 100).toFixed(0) : 0}% deployed
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" /> Completed Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-6" /> : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{m?.completedRunsToday}</div>
                <p className="text-xs text-muted-foreground">Today's completed service runs</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">7-Day Revenue Trend</CardTitle>
            <CardDescription>Daily order revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={m?.revenueByDay || []}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Lead sources pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lead Sources Today</CardTitle>
            <CardDescription>Inbound channel breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48" /> : (
              m?.leadsBySource?.length ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={m.leadsBySource} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={70}>
                        {m.leadsBySource.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 flex-1">
                    {m.leadsBySource.map((s, i) => (
                      <div key={s.source} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground truncate flex-1">{s.source}</span>
                        <Badge variant="secondary" className="text-xs">{s.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No leads yet today
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Modules Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4" /> AI Modules Status
          </CardTitle>
          <CardDescription>Active intelligence systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[
              { name: 'Sales AI Coach', status: 'active' },
              { name: 'Lead Scoring', status: 'active' },
              { name: 'Smart Quote', status: 'active' },
              { name: 'Route Optimization', status: 'active' },
              { name: 'Price Intelligence', status: 'active' },
              { name: 'Marketing AI', status: 'active' },
              { name: 'Customer Experience', status: 'active' },
              { name: 'Driver Performance', status: 'active' },
              { name: 'Review Growth', status: 'active' },
              { name: 'Fraud Detection', status: 'active' },
              { name: 'Self-Learning', status: 'active' },
              { name: 'Cost Optimization', status: 'active' },
              { name: 'CLV Scoring', status: 'active' },
              { name: 'Contractor Program', status: 'active' },
              { name: 'Knowledge Base', status: 'active' },
              { name: 'Expansion Planner', status: 'beta' },
            ].map(mod => (
              <div key={mod.name} className="flex items-center gap-2 p-2 rounded-lg border bg-card">
                <span className={`w-2 h-2 rounded-full shrink-0 ${mod.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-xs text-foreground truncate">{mod.name}</span>
                {mod.status === 'beta' && <Badge variant="outline" className="text-[10px] px-1 py-0">β</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
