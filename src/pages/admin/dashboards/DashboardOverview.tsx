import { useState } from 'react';
import { subDays } from 'date-fns';
import { BarChart3, TrendingUp, Package, DollarSign, Users, AlertTriangle, Truck, Calendar } from 'lucide-react';
import { 
  DashboardKPICard, 
  DashboardFilters, 
  DashboardChart, 
  DashboardTable,
  type DashboardFilterValues 
} from '@/components/dashboard';
import { useDashboardData, exportToCSV } from '@/hooks/useDashboardData';
import { Badge } from '@/components/ui/badge';

export default function DashboardOverview() {
  const [filters, setFilters] = useState<DashboardFilterValues>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [exporting, setExporting] = useState(false);

  const { 
    loading, 
    funnelMetrics, 
    arMetrics, 
    overageMetrics, 
    customerMetrics, 
    inventoryMetrics,
    scheduleMetrics,
    dailyTrend,
    revenueByMaterial,
  } = useDashboardData(filters);

  const handleExport = () => {
    setExporting(true);
    const exportData = [
      { metric: 'Quotes Created', value: funnelMetrics?.quotes_created || 0 },
      { metric: 'Orders Created', value: funnelMetrics?.orders_created || 0 },
      { metric: 'Conversion Rate', value: `${funnelMetrics?.conversion_rate.toFixed(1)}%` || '0%' },
      { metric: 'Total Invoiced', value: arMetrics?.total_invoiced || 0 },
      { metric: 'Total Paid', value: arMetrics?.total_paid || 0 },
      { metric: 'Outstanding Balance', value: arMetrics?.total_balance || 0 },
      { metric: 'Overdue Amount', value: arMetrics?.overdue_amount || 0 },
      { metric: 'Overage Revenue', value: overageMetrics?.total_overage_amount || 0 },
      { metric: 'Prepay Adoption', value: `${overageMetrics?.prepay_adoption_rate.toFixed(1)}%` || '0%' },
    ];
    exportToCSV(exportData, 'dashboard_overview');
    setExporting(false);
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Real-time operational metrics and KPIs</p>
      </div>

      <DashboardFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        exporting={exporting}
      />

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKPICard
          title="Total Quotes"
          value={funnelMetrics?.quotes_created || 0}
          subtitle="Period total"
          icon={<BarChart3 className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Total Orders"
          value={funnelMetrics?.orders_created || 0}
          subtitle={`${funnelMetrics?.conversion_rate.toFixed(1) || 0}% conversion`}
          icon={<Package className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Revenue"
          value={formatCurrency(arMetrics?.total_invoiced || 0)}
          subtitle={`${formatCurrency(arMetrics?.total_paid || 0)} collected`}
          icon={<DollarSign className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Outstanding"
          value={formatCurrency(arMetrics?.total_balance || 0)}
          subtitle={arMetrics?.overdue_count ? `${arMetrics.overdue_count} overdue` : 'No overdue'}
          icon={<AlertTriangle className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      {/* Second KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKPICard
          title="Customers"
          value={customerMetrics?.total_customers || 0}
          subtitle={`${customerMetrics?.repeat_customers || 0} repeat`}
          icon={<Users className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Avg Ticket"
          value={formatCurrency(customerMetrics?.avg_ticket_value || 0)}
          subtitle="Per order"
          icon={<TrendingUp className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Overages"
          value={formatCurrency(overageMetrics?.total_overage_amount || 0)}
          subtitle={`${overageMetrics?.orders_with_overage || 0} orders`}
          icon={<Truck className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Low Stock Alerts"
          value={inventoryMetrics?.low_stock_alerts || 0}
          subtitle="Inventory warnings"
          icon={<Calendar className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart
          title="Daily Trend"
          subtitle="Quotes, orders, and revenue over time"
          data={dailyTrend}
          type="area"
          dataKeys={[
            { key: 'quotes', label: 'Quotes', color: 'hsl(var(--chart-1))' },
            { key: 'orders', label: 'Orders', color: 'hsl(var(--chart-2))' },
          ]}
          xAxisKey="date"
          loading={loading}
        />

        <DashboardChart
          title="Revenue by Material"
          subtitle="Distribution across material types"
          data={revenueByMaterial}
          type="pie"
          dataKeys={[{ key: 'value', label: 'Revenue', color: '' }]}
          xAxisKey="name"
          loading={loading}
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardTable
          title="Inventory by Yard"
          subtitle="Current stock levels"
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
                <Badge variant={row.utilization > 80 ? 'destructive' : row.utilization > 50 ? 'secondary' : 'outline'}>
                  {row.utilization.toFixed(0)}%
                </Badge>
              ),
            },
          ]}
          loading={loading}
          maxHeight={300}
        />

        <DashboardTable
          title="Top Customers"
          subtitle="By revenue this period"
          data={customerMetrics?.top_customers.slice(0, 5) || []}
          columns={[
            { key: 'name', header: 'Customer' },
            { key: 'orders', header: 'Orders', align: 'right' },
            { 
              key: 'revenue', 
              header: 'Revenue', 
              align: 'right',
              render: (row) => formatCurrency(row.revenue),
            },
          ]}
          loading={loading}
          maxHeight={300}
        />
      </div>
    </div>
  );
}
