import { useState } from 'react';
import { subDays } from 'date-fns';
import { BarChart3, TrendingUp, Target, Users, ArrowRight } from 'lucide-react';
import { 
  DashboardKPICard, 
  DashboardFilters, 
  DashboardChart, 
  DashboardTable,
  KPICardGrid,
  type DashboardFilterValues 
} from '@/components/dashboard';
import { useDashboardData, exportToCSV } from '@/hooks/useDashboardData';
import { useKPIData } from '@/hooks/useKPIData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SalesDashboard() {
  const [filters, setFilters] = useState<DashboardFilterValues>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [exporting, setExporting] = useState(false);

  const { 
    loading, 
    funnelMetrics, 
    customerMetrics, 
    dailyTrend,
    revenueByMaterial,
  } = useDashboardData(filters);

  const { kpiData, loading: kpiLoading } = useKPIData(filters);

  const handleExport = () => {
    setExporting(true);
    const exportData = dailyTrend.map(d => ({
      date: d.date,
      quotes: d.quotes,
      orders: d.orders,
      revenue: d.revenue,
    }));
    exportToCSV(exportData, 'sales_dashboard');
    setExporting(false);
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  // Funnel data for visualization
  const funnelData = funnelMetrics ? [
    { stage: 'Quotes', count: funnelMetrics.quotes_created, rate: 100 },
    { stage: 'Saved', count: funnelMetrics.quotes_saved, rate: funnelMetrics.quotes_created > 0 ? (funnelMetrics.quotes_saved / funnelMetrics.quotes_created) * 100 : 0 },
    { stage: 'Scheduled', count: funnelMetrics.quotes_scheduled, rate: funnelMetrics.quotes_created > 0 ? (funnelMetrics.quotes_scheduled / funnelMetrics.quotes_created) * 100 : 0 },
    { stage: 'Orders', count: funnelMetrics.orders_created, rate: funnelMetrics.quotes_created > 0 ? (funnelMetrics.orders_created / funnelMetrics.quotes_created) * 100 : 0 },
    { stage: 'Completed', count: funnelMetrics.orders_completed, rate: funnelMetrics.quotes_created > 0 ? (funnelMetrics.orders_completed / funnelMetrics.quotes_created) * 100 : 0 },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sales Dashboard</h1>
        <p className="text-muted-foreground">Quote-to-order funnel and conversion metrics</p>
      </div>

      <DashboardFilters
        filters={filters}
        onFiltersChange={setFilters}
        showCustomerTypeFilter
        onExport={handleExport}
        exporting={exporting}
      />

      {/* Sales KPIs with Targets */}
      {kpiData.sales.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Sales KPI Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KPICardGrid kpis={kpiData.sales} loading={kpiLoading} showSparkline />
          </CardContent>
        </Card>
      )}

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKPICard
          title="Quotes Created"
          value={funnelMetrics?.quotes_created || 0}
          subtitle="Total inquiries"
          icon={<BarChart3 className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Orders Won"
          value={funnelMetrics?.orders_created || 0}
          subtitle="Converted to orders"
          icon={<Target className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Conversion Rate"
          value={`${funnelMetrics?.conversion_rate.toFixed(1) || 0}%`}
          subtitle="Quote to order"
          icon={<TrendingUp className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Avg Ticket"
          value={formatCurrency(customerMetrics?.avg_ticket_value || 0)}
          subtitle="Per order"
          icon={<Users className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      {/* Sales Funnel Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sales Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-24 bg-muted animate-pulse rounded" />
          ) : (
            <div className="flex items-center justify-between gap-2">
              {funnelData.map((stage, i) => (
                <div key={stage.stage} className="flex items-center gap-2 flex-1">
                  <div 
                    className="flex-1 rounded-lg p-4 text-center transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, hsl(var(--primary) / ${0.2 + (0.8 * (1 - i / funnelData.length))}) 0%, hsl(var(--primary) / ${0.1 + (0.6 * (1 - i / funnelData.length))}) 100%)`,
                    }}
                  >
                    <div className="text-2xl font-bold text-foreground">{stage.count}</div>
                    <div className="text-sm text-muted-foreground">{stage.stage}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stage.rate.toFixed(1)}%
                    </div>
                  </div>
                  {i < funnelData.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart
          title="Quote & Order Trend"
          subtitle="Daily activity over time"
          data={dailyTrend}
          type="line"
          dataKeys={[
            { key: 'quotes', label: 'Quotes', color: 'hsl(var(--chart-1))' },
            { key: 'orders', label: 'Orders', color: 'hsl(var(--chart-2))' },
          ]}
          xAxisKey="date"
          loading={loading}
        />

        <DashboardChart
          title="Revenue by Material Type"
          subtitle="Estimated revenue distribution"
          data={revenueByMaterial}
          type="bar"
          dataKeys={[{ key: 'value', label: 'Revenue', color: 'hsl(var(--primary))' }]}
          xAxisKey="name"
          loading={loading}
        />
      </div>

      {/* Funnel breakdown table */}
      <DashboardTable
        title="Funnel Stage Breakdown"
        subtitle="Conversion at each stage"
        data={funnelData}
        columns={[
          { key: 'stage', header: 'Stage' },
          { key: 'count', header: 'Count', align: 'right' },
          { 
            key: 'rate', 
            header: 'Conversion Rate', 
            align: 'right',
            render: (row) => (
              <Badge variant={row.rate > 50 ? 'default' : row.rate > 20 ? 'secondary' : 'outline'}>
                {row.rate.toFixed(1)}%
              </Badge>
            ),
          },
        ]}
        loading={loading}
      />
    </div>
  );
}
