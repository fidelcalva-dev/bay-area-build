import { useDispatchIntelligence } from '@/hooks/useDispatchIntelligence';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck, Users, DollarSign, BarChart3, Scale, Route } from 'lucide-react';

function StatCard({ icon, label, value, subtitle, loading }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  loading?: boolean;
}) {
  if (loading) return <Skeleton className="h-24 w-full rounded-xl" />;
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function OperationsIntelligencePanel() {
  const { data, isLoading } = useDispatchIntelligence();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Operations Intelligence</h2>
        <p className="text-sm text-muted-foreground">Today's real-time dispatch metrics</p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={<Route className="w-4 h-4" />}
          label="Active Runs"
          value={data?.activeRuns ?? '—'}
          subtitle={`${data?.completedRunsToday ?? 0} completed`}
          loading={isLoading}
        />
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Drivers Active"
          value={`${data?.activeDrivers ?? 0}/${data?.totalDrivers ?? 0}`}
          subtitle={`${(data?.driverUtilization ?? 0).toFixed(0)}% util`}
          loading={isLoading}
        />
        <StatCard
          icon={<Truck className="w-4 h-4" />}
          label="Trucks Active"
          value={`${data?.activeTrucks ?? 0}/${data?.totalTrucks ?? 0}`}
          subtitle={`${(data?.truckUtilization ?? 0).toFixed(0)}% util`}
          loading={isLoading}
        />
        <StatCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Dump Costs"
          value={`$${(data?.totalDumpFees ?? 0).toLocaleString()}`}
          subtitle={`Avg $${(data?.avgDumpFee ?? 0).toFixed(0)}/ticket`}
          loading={isLoading}
        />
        <StatCard
          icon={<BarChart3 className="w-4 h-4" />}
          label="Revenue Today"
          value={`$${(data?.totalRevenue ?? 0).toLocaleString()}`}
          subtitle={`$${(data?.avgRevenuePerRun ?? 0).toFixed(0)}/run avg`}
          loading={isLoading}
        />
        <StatCard
          icon={<Scale className="w-4 h-4" />}
          label="Dump Tickets"
          value={data?.dumpTicketCount ?? 0}
          subtitle={data?.avgWeight ? `${data.avgWeight.toFixed(1)} tons avg` : 'No data'}
          loading={isLoading}
        />
      </div>

      {/* Utilization bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Driver Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-4 w-full" /> : (
              <div className="space-y-2">
                <Progress value={data?.driverUtilization ?? 0} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {data?.activeDrivers} of {data?.totalDrivers} drivers on runs
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Truck Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-4 w-full" /> : (
              <div className="space-y-2">
                <Progress value={data?.truckUtilization ?? 0} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {data?.activeTrucks} of {data?.totalTrucks} trucks deployed
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Runs breakdown */}
      {data && (data.runsByType.length > 0 || data.runsByStatus.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.runsByType.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Runs by Type</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {data.runsByType.map(r => (
                  <Badge key={r.type} variant="secondary" className="text-xs">
                    {r.type.replace(/_/g, ' ')}: {r.count}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
          {data.runsByStatus.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Runs by Status</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {data.runsByStatus.map(r => (
                  <Badge key={r.status} variant="outline" className="text-xs">
                    {r.status.replace(/_/g, ' ')}: {r.count}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
