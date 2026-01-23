// Lead Performance Dashboard - Sales vs CS
import { useState } from 'react';
import { 
  Users, Clock, TrendingUp, AlertTriangle, UserCheck, 
  PhoneCall, Timer, ArrowRight, Download, Filter,
  ChevronDown, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  useLeadPerformanceData, 
  LeadPerformanceFilters,
  LeadListItem 
} from '@/hooks/useLeadPerformanceData';
import { format } from 'date-fns';

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  color = 'primary'
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: typeof Users;
  trend?: { value: number; label: string };
  color?: 'primary' | 'green' | 'amber' | 'red';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            {trend && (
              <p className={`text-sm mt-2 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Funnel Visualization
function LeadFunnel({ data }: { data: ReturnType<typeof useLeadPerformanceData>['funnelData'] }) {
  const stages = [
    { key: 'leadsIn', label: 'Leads In', value: data.leadsIn, color: 'bg-blue-500' },
    { key: 'aiQualified', label: 'AI Qualified', value: data.aiQualified, color: 'bg-indigo-500' },
    { key: 'salesAssigned', label: 'Sales Assigned', value: data.salesAssigned, color: 'bg-purple-500' },
    { key: 'salesClosed', label: 'Sales Closed', value: data.salesClosed, color: 'bg-green-500' },
    { key: 'salesTimeout', label: 'Sales Timeout', value: data.salesTimeout, color: 'bg-amber-500' },
    { key: 'csRecovered', label: 'CS Recovered', value: data.csRecovered, color: 'bg-teal-500' },
    { key: 'lost', label: 'Lost', value: data.lost, color: 'bg-red-500' },
  ];

  const maxValue = Math.max(...stages.map(s => s.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Lead Flow Funnel
        </CardTitle>
        <CardDescription>Visual breakdown of lead progression</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, i) => (
            <div key={stage.key} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-right">{stage.label}</div>
              <div className="flex-1">
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 ${stage.color} transition-all duration-500`}
                    style={{ width: `${(stage.value / maxValue) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {stage.value}
                  </div>
                </div>
              </div>
              {i < stages.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Lead List Table
function LeadListTable({ 
  leads, 
  title,
  emptyMessage 
}: { 
  leads: LeadListItem[]; 
  title: string;
  emptyMessage: string;
}) {
  const getStatusBadge = (status: LeadListItem['status']) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Waiting</Badge>;
      case 'contacted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Contacted</Badge>;
      case 'converted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Converted</Badge>;
      case 'timeout':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Timeout</Badge>;
    }
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Time Waiting</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.slice(0, 10).map(lead => (
            <TableRow key={lead.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.phone}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span className={lead.minutesSinceAssigned > 15 ? 'text-red-600 font-medium' : ''}>
                    {lead.minutesSinceAssigned} min
                  </span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(lead.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {leads.length > 10 && (
        <p className="text-center text-sm text-muted-foreground py-2">
          +{leads.length - 10} more leads
        </p>
      )}
    </div>
  );
}

// Alerts Panel
function AlertsPanel({ alerts }: { alerts: ReturnType<typeof useLeadPerformanceData>['alerts'] }) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>All clear! No alerts at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <Alert 
          key={alert.id} 
          variant={alert.severity === 'critical' ? 'destructive' : 'default'}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="ml-2">
            {alert.type === 'waiting_long' && 'Long Wait Time'}
            {alert.type === 'cs_backlog' && 'CS Backlog'}
            {alert.type === 'after_hours' && 'After Hours'}
          </AlertTitle>
          <AlertDescription className="ml-2">{alert.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

// Main Dashboard Component
export default function LeadPerformanceDashboard() {
  const [filters, setFilters] = useState<LeadPerformanceFilters>({
    dateRange: 'today',
  });

  const {
    isLoading,
    error,
    salesLeads,
    csLeads,
    globalMetrics,
    salesMetrics,
    csMetrics,
    funnelData,
    alerts,
  } = useLeadPerformanceData(filters);

  const handleExportCSV = () => {
    const allLeads = [...salesLeads, ...csLeads];
    const csvContent = [
      ['Name', 'Phone', 'Team', 'Status', 'Minutes Waiting', 'Assigned At'].join(','),
      ...allLeads.map(lead => [
        lead.name,
        lead.phone,
        lead.assignmentType.toUpperCase(),
        lead.status,
        lead.minutesSinceAssigned,
        format(lead.assignedAt, 'yyyy-MM-dd HH:mm'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead-performance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lead Performance Dashboard</h1>
          <p className="text-muted-foreground">Sales vs Customer Service metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filters */}
          <Select 
            value={filters.dateRange} 
            onValueChange={(v) => setFilters(f => ({ ...f, dateRange: v as any }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Section 1: Global Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Leads"
          value={globalMetrics.totalToday}
          subtitle={`${globalMetrics.totalWeek} this week`}
          icon={Users}
          color="primary"
        />
        <MetricCard
          title="New vs Existing"
          value={`${globalMetrics.newLeads} / ${globalMetrics.existingCustomers}`}
          subtitle="New / Returning"
          icon={UserCheck}
          color="primary"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${globalMetrics.conversionRate.toFixed(1)}%`}
          subtitle="Overall"
          icon={TrendingUp}
          color={globalMetrics.conversionRate > 30 ? 'green' : 'amber'}
        />
        <MetricCard
          title="Avg Response"
          value={`${globalMetrics.avgFirstResponseMinutes.toFixed(0)} min`}
          subtitle="First contact"
          icon={Clock}
          color={globalMetrics.avgFirstResponseMinutes < 10 ? 'green' : 'amber'}
        />
      </div>

      {/* Section 5: Alerts */}
      {alerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertsPanel alerts={alerts} />
          </CardContent>
        </Card>
      )}

      {/* Section 2 & 3: Sales vs CS Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sales Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-blue-600" />
              Sales Performance
            </CardTitle>
            <CardDescription>New lead handling metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sales Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{salesMetrics.assigned}</p>
                <p className="text-sm text-muted-foreground">Leads Assigned</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{salesMetrics.avgResponseMinutes.toFixed(0)}m</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Contacted within 15 min</span>
                  <span className="font-medium">{salesMetrics.contactedWithin15MinPercent.toFixed(0)}%</span>
                </div>
                <Progress value={salesMetrics.contactedWithin15MinPercent} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Converted by Sales</span>
                  <span className="font-medium text-green-600">{salesMetrics.convertedPercent.toFixed(0)}%</span>
                </div>
                <Progress value={salesMetrics.convertedPercent} className="h-2 [&>div]:bg-green-500" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Timed out to CS</span>
                  <span className="font-medium text-amber-600">{salesMetrics.timedOutPercent.toFixed(0)}%</span>
                </div>
                <Progress value={salesMetrics.timedOutPercent} className="h-2 [&>div]:bg-amber-500" />
              </div>
            </div>

            {/* Sales Lead List */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Active Sales Leads</p>
              <LeadListTable 
                leads={salesLeads.filter(l => l.status === 'waiting')} 
                title="Sales Leads"
                emptyMessage="No active sales leads"
              />
            </div>
          </CardContent>
        </Card>

        {/* CS Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-teal-600" />
              Customer Service Performance
            </CardTitle>
            <CardDescription>Existing customer & recovery metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* CS Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{csMetrics.fromTimeout}</p>
                <p className="text-sm text-muted-foreground">From Timeout</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{csMetrics.existingCustomer}</p>
                <p className="text-sm text-muted-foreground">Existing Customers</p>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Converted by CS</span>
                  <span className="font-medium text-teal-600">{csMetrics.convertedPercent.toFixed(0)}%</span>
                </div>
                <Progress value={csMetrics.convertedPercent} className="h-2 [&>div]:bg-teal-500" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Avg Follow-up Time</span>
                  <span className="font-medium">{csMetrics.avgFollowupMinutes.toFixed(0)} min</span>
                </div>
                <Progress 
                  value={Math.min(csMetrics.avgFollowupMinutes / 60 * 100, 100)} 
                  className="h-2" 
                />
              </div>
            </div>

            {/* CS Lead List */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Active CS Leads</p>
              <LeadListTable 
                leads={csLeads.filter(l => l.status === 'waiting')} 
                title="CS Leads"
                emptyMessage="No active CS leads"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Lead Flow Funnel */}
      <LeadFunnel data={funnelData} />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="flex items-center gap-2 bg-background p-4 rounded-lg shadow-lg">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      )}
    </div>
  );
}
