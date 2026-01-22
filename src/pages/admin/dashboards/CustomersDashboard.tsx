import { useState } from 'react';
import { subDays } from 'date-fns';
import { Users, UserPlus, Repeat, DollarSign, TrendingUp, Star } from 'lucide-react';
import { 
  DashboardKPICard, 
  DashboardFilters, 
  DashboardChart, 
  DashboardTable,
  type DashboardFilterValues 
} from '@/components/dashboard';
import { useDashboardData, exportToCSV } from '@/hooks/useDashboardData';
import { Badge } from '@/components/ui/badge';

export default function CustomersDashboard() {
  const [filters, setFilters] = useState<DashboardFilterValues>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [exporting, setExporting] = useState(false);

  const { 
    loading, 
    customerMetrics,
    revenueByMaterial,
  } = useDashboardData(filters);

  const handleExport = () => {
    setExporting(true);
    const exportData = customerMetrics?.top_customers.map(c => ({
      customer: c.name,
      orders: c.orders,
      revenue: c.revenue,
    })) || [];
    exportToCSV(exportData, 'customers_dashboard');
    setExporting(false);
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const repeatRate = customerMetrics && customerMetrics.total_customers > 0
    ? (customerMetrics.repeat_customers / customerMetrics.total_customers) * 100
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Customers Dashboard</h1>
        <p className="text-muted-foreground">Customer acquisition, retention, and lifetime value</p>
      </div>

      <DashboardFilters
        filters={filters}
        onFiltersChange={setFilters}
        showCustomerTypeFilter
        onExport={handleExport}
        exporting={exporting}
      />

      {/* Customer KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKPICard
          title="Total Customers"
          value={customerMetrics?.total_customers || 0}
          subtitle="Active this period"
          icon={<Users className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="New Customers"
          value={customerMetrics?.new_customers || 0}
          subtitle="First-time orders"
          icon={<UserPlus className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Repeat Customers"
          value={customerMetrics?.repeat_customers || 0}
          subtitle={`${repeatRate.toFixed(0)}% repeat rate`}
          icon={<Repeat className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Avg Orders/Customer"
          value={customerMetrics?.avg_orders_per_customer.toFixed(1) || '0'}
          subtitle="Order frequency"
          icon={<TrendingUp className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardKPICard
          title="Average Ticket Value"
          value={formatCurrency(customerMetrics?.avg_ticket_value || 0)}
          subtitle="Revenue per order"
          icon={<DollarSign className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Customer Lifetime Value"
          value={formatCurrency((customerMetrics?.avg_ticket_value || 0) * (customerMetrics?.avg_orders_per_customer || 0))}
          subtitle="Avg ticket × avg orders"
          icon={<Star className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart
          title="Revenue by Material"
          subtitle="Customer preferences"
          data={revenueByMaterial}
          type="pie"
          dataKeys={[{ key: 'value', label: 'Revenue', color: '' }]}
          xAxisKey="name"
          loading={loading}
        />

        <DashboardTable
          title="Top Customers"
          subtitle="Highest revenue this period"
          data={customerMetrics?.top_customers || []}
          columns={[
            { 
              key: 'name', 
              header: 'Customer',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                    {row.name.charAt(0)}
                  </div>
                  <span>{row.name}</span>
                </div>
              ),
            },
            { key: 'orders', header: 'Orders', align: 'right' },
            { 
              key: 'revenue', 
              header: 'Revenue', 
              align: 'right',
              render: (row) => (
                <span className="font-medium">{formatCurrency(row.revenue)}</span>
              ),
            },
            {
              key: 'tier',
              header: 'Tier',
              align: 'right',
              render: (row) => {
                if (row.orders >= 10) return <Badge>VIP</Badge>;
                if (row.orders >= 5) return <Badge variant="secondary">Gold</Badge>;
                if (row.orders >= 2) return <Badge variant="outline">Silver</Badge>;
                return <Badge variant="outline">New</Badge>;
              },
            },
          ]}
          loading={loading}
          maxHeight={400}
        />
      </div>
    </div>
  );
}
