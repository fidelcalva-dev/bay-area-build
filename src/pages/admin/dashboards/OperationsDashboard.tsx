import { useState } from 'react';
import { subDays } from 'date-fns';
import { Truck, Calendar, Boxes, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  DashboardKPICard, 
  DashboardFilters, 
  DashboardChart, 
  DashboardTable,
  type DashboardFilterValues 
} from '@/components/dashboard';
import { useDashboardData, exportToCSV } from '@/hooks/useDashboardData';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function OperationsDashboard() {
  const [filters, setFilters] = useState<DashboardFilterValues>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [exporting, setExporting] = useState(false);

  const { 
    loading, 
    funnelMetrics,
    inventoryMetrics,
    scheduleMetrics,
  } = useDashboardData(filters);

  const handleExport = () => {
    setExporting(true);
    const inventoryData = inventoryMetrics?.by_yard.map(y => ({
      yard: y.yard_name,
      total: y.total,
      available: y.available,
      in_use: y.in_use,
      reserved: y.reserved,
      utilization: `${y.utilization.toFixed(1)}%`,
    })) || [];
    exportToCSV(inventoryData, 'operations_inventory');
    setExporting(false);
  };

  const totalInventory = inventoryMetrics?.by_yard.reduce((sum, y) => sum + y.total, 0) || 0;
  const totalInUse = inventoryMetrics?.by_yard.reduce((sum, y) => sum + y.in_use, 0) || 0;
  const overallUtilization = totalInventory > 0 ? (totalInUse / totalInventory) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Operations Dashboard</h1>
        <p className="text-muted-foreground">Inventory, scheduling, and fleet utilization</p>
      </div>

      <DashboardFilters
        filters={filters}
        onFiltersChange={setFilters}
        showYardFilter
        yards={inventoryMetrics?.by_yard.map(y => ({ id: y.yard_id, name: y.yard_name })) || []}
        onExport={handleExport}
        exporting={exporting}
      />

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKPICard
          title="Fleet Utilization"
          value={`${overallUtilization.toFixed(0)}%`}
          subtitle={`${totalInUse} of ${totalInventory} in use`}
          icon={<Truck className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Low Stock Alerts"
          value={inventoryMetrics?.low_stock_alerts || 0}
          subtitle="Need attention"
          icon={<AlertTriangle className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Avg Daily Jobs"
          value={scheduleMetrics?.avg_daily_jobs.toFixed(1) || '0'}
          subtitle="Deliveries + pickups"
          icon={<Calendar className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Orders Completed"
          value={funnelMetrics?.orders_completed || 0}
          subtitle="This period"
          icon={<CheckCircle className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      {/* Inventory by Yard with visual bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardTable
          title="Inventory by Yard"
          subtitle="Current stock allocation"
          data={inventoryMetrics?.by_yard || []}
          columns={[
            { key: 'yard_name', header: 'Yard' },
            { key: 'total', header: 'Total', align: 'right' },
            { key: 'available', header: 'Available', align: 'right' },
            { key: 'in_use', header: 'In Use', align: 'right' },
            { 
              key: 'utilization', 
              header: 'Utilization', 
              align: 'right',
              render: (row) => (
                <div className="flex items-center gap-2 justify-end">
                  <Progress 
                    value={row.utilization} 
                    className="w-16 h-2"
                  />
                  <span className="text-xs w-10 text-right">{row.utilization.toFixed(0)}%</span>
                </div>
              ),
            },
          ]}
          loading={loading}
        />

        <DashboardTable
          title="Inventory by Size"
          subtitle="Stock levels per dumpster size"
          data={inventoryMetrics?.by_size || []}
          columns={[
            { key: 'label', header: 'Size' },
            { key: 'total', header: 'Total', align: 'right' },
            { key: 'available', header: 'Available', align: 'right' },
            { 
              key: 'in_use', 
              header: 'In Use', 
              align: 'right',
              render: (row) => {
                const utilization = row.total > 0 ? (row.in_use / row.total) * 100 : 0;
                return (
                  <Badge variant={utilization > 80 ? 'destructive' : utilization > 50 ? 'secondary' : 'outline'}>
                    {row.in_use}
                  </Badge>
                );
              },
            },
          ]}
          loading={loading}
        />
      </div>

      {/* Schedule utilization chart */}
      <DashboardChart
        title="Daily Schedule"
        subtitle="Deliveries and pickups by day"
        data={scheduleMetrics?.by_day || []}
        type="stacked-bar"
        dataKeys={[
          { key: 'deliveries', label: 'Deliveries', color: 'hsl(var(--chart-1))' },
          { key: 'pickups', label: 'Pickups', color: 'hsl(var(--chart-2))' },
        ]}
        xAxisKey="date"
        height={350}
        loading={loading}
      />
    </div>
  );
}
