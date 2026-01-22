import { useState } from 'react';
import { subDays } from 'date-fns';
import { DollarSign, TrendingUp, AlertTriangle, CreditCard, Receipt, Percent } from 'lucide-react';
import { 
  DashboardKPICard, 
  DashboardFilters, 
  DashboardChart, 
  DashboardTable,
  type DashboardFilterValues 
} from '@/components/dashboard';
import { useDashboardData, exportToCSV } from '@/hooks/useDashboardData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function FinanceDashboardPage() {
  const [filters, setFilters] = useState<DashboardFilterValues>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [exporting, setExporting] = useState(false);

  const { 
    loading, 
    arMetrics,
    overageMetrics,
    dailyTrend,
  } = useDashboardData(filters);

  const handleExport = () => {
    setExporting(true);
    const exportData = [
      { metric: 'Total Invoiced', value: arMetrics?.total_invoiced || 0 },
      { metric: 'Total Collected', value: arMetrics?.total_paid || 0 },
      { metric: 'Outstanding Balance', value: arMetrics?.total_balance || 0 },
      { metric: 'Overdue Count', value: arMetrics?.overdue_count || 0 },
      { metric: 'Overdue Amount', value: arMetrics?.overdue_amount || 0 },
      { metric: 'Overage Revenue', value: overageMetrics?.total_overage_amount || 0 },
      { metric: 'Orders with Overage', value: overageMetrics?.orders_with_overage || 0 },
      { metric: 'Prepay Adoption Rate', value: `${overageMetrics?.prepay_adoption_rate.toFixed(1)}%` || '0%' },
      { metric: 'Prepay Savings', value: overageMetrics?.prepay_savings || 0 },
    ];
    exportToCSV(exportData, 'finance_dashboard');
    setExporting(false);
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const collectionRate = arMetrics && arMetrics.total_invoiced > 0 
    ? (arMetrics.total_paid / arMetrics.total_invoiced) * 100 
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Finance Dashboard</h1>
        <p className="text-muted-foreground">Accounts receivable, overages, and prepay metrics</p>
      </div>

      <DashboardFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        exporting={exporting}
      />

      {/* AR KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKPICard
          title="Total Invoiced"
          value={formatCurrency(arMetrics?.total_invoiced || 0)}
          subtitle="This period"
          icon={<Receipt className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Collected"
          value={formatCurrency(arMetrics?.total_paid || 0)}
          subtitle={`${collectionRate.toFixed(0)}% collection rate`}
          icon={<CreditCard className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Outstanding"
          value={formatCurrency(arMetrics?.total_balance || 0)}
          subtitle="Awaiting payment"
          icon={<DollarSign className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Overdue"
          value={formatCurrency(arMetrics?.overdue_amount || 0)}
          subtitle={`${arMetrics?.overdue_count || 0} invoices`}
          icon={<AlertTriangle className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      {/* Collection Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Collection Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-8 bg-muted animate-pulse rounded" />
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Collected: {formatCurrency(arMetrics?.total_paid || 0)}</span>
                <span>Target: {formatCurrency(arMetrics?.total_invoiced || 0)}</span>
              </div>
              <Progress value={collectionRate} className="h-4" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{collectionRate.toFixed(1)}% collected</span>
                <span>{formatCurrency(arMetrics?.total_balance || 0)} remaining</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overage KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKPICard
          title="Overage Revenue"
          value={formatCurrency(overageMetrics?.total_overage_amount || 0)}
          subtitle={`${overageMetrics?.orders_with_overage || 0} orders`}
          icon={<TrendingUp className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Avg Overage"
          value={formatCurrency(overageMetrics?.avg_overage_per_order || 0)}
          subtitle="Per order with overage"
          icon={<DollarSign className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Prepay Adoption"
          value={`${overageMetrics?.prepay_adoption_rate.toFixed(1) || 0}%`}
          subtitle="Customers prepurchasing tons"
          icon={<Percent className="w-5 h-5" />}
          loading={loading}
        />
        <DashboardKPICard
          title="Prepay Savings"
          value={formatCurrency(overageMetrics?.prepay_savings || 0)}
          subtitle="Customer discounts given"
          icon={<CreditCard className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      {/* Revenue trend chart */}
      <DashboardChart
        title="Revenue Trend"
        subtitle="Daily revenue over time"
        data={dailyTrend}
        type="area"
        dataKeys={[
          { key: 'revenue', label: 'Revenue', color: 'hsl(var(--primary))' },
        ]}
        xAxisKey="date"
        height={350}
        loading={loading}
      />

      {/* Summary breakdown */}
      <DashboardTable
        title="AR Aging Summary"
        subtitle="Outstanding balances by status"
        data={[
          { category: 'Current', count: (arMetrics?.overdue_count || 0) > 0 ? 1 : 0, amount: arMetrics?.total_balance || 0, status: 'current' },
          { category: 'Overdue (1-30 days)', count: arMetrics?.overdue_count || 0, amount: arMetrics?.overdue_amount || 0, status: 'overdue' },
        ].filter(r => r.count > 0 || r.amount > 0)}
        columns={[
          { key: 'category', header: 'Category' },
          { key: 'count', header: 'Invoices', align: 'right' },
          { 
            key: 'amount', 
            header: 'Amount', 
            align: 'right',
            render: (row) => formatCurrency(row.amount),
          },
          { 
            key: 'status', 
            header: 'Status', 
            align: 'right',
            render: (row) => (
              <Badge variant={row.status === 'overdue' ? 'destructive' : 'outline'}>
                {row.status === 'overdue' ? 'Action Required' : 'On Track'}
              </Badge>
            ),
          },
        ]}
        loading={loading}
      />
    </div>
  );
}
