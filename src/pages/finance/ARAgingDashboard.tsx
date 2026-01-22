import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, AlertTriangle, Clock, Flag, 
  TrendingDown, Users, ArrowRight, Loader2,
  BarChart3, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useARAgingData, ARBucketSummary } from '@/hooks/useARAgingData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const BUCKET_COLORS: Record<string, string> = {
  'current': 'hsl(var(--primary))',
  '0-7': 'hsl(142, 76%, 36%)', // green
  '8-30': 'hsl(48, 96%, 53%)', // yellow
  '31-60': 'hsl(25, 95%, 53%)', // orange
  '61-90': 'hsl(0, 84%, 60%)', // red
  '90+': 'hsl(0, 72%, 51%)', // dark red
};

export default function ARAgingDashboard() {
  const [bucketFilter, setBucketFilter] = useState<string>('all');
  const { 
    invoices, 
    bucketSummary, 
    topDebtors, 
    loading, 
    totalAR, 
    overdueAR,
    criticalAR,
    refetch 
  } = useARAgingData({ bucket: bucketFilter });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);

  const getBucketBadge = (bucket: string) => {
    const variants: Record<string, string> = {
      'current': 'bg-primary/10 text-primary',
      '0-7': 'bg-green-100 text-green-800',
      '8-30': 'bg-yellow-100 text-yellow-800',
      '31-60': 'bg-orange-100 text-orange-800',
      '61-90': 'bg-red-100 text-red-800',
      '90+': 'bg-red-200 text-red-900',
    };
    const labels: Record<string, string> = {
      'current': 'Current',
      '0-7': '1-7 Days',
      '8-30': '8-30 Days',
      '31-60': '31-60 Days',
      '61-90': '61-90 Days',
      '90+': '90+ Days',
    };
    return <Badge className={variants[bucket] || 'bg-muted'}>{labels[bucket] || bucket}</Badge>;
  };

  const chartData = bucketSummary.map((b) => ({
    name: b.bucketLabel,
    bucket: b.bucket,
    amount: b.totalBalance,
    count: b.invoiceCount,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AR Aging Dashboard</h1>
          <p className="text-muted-foreground">Track and manage overdue balances</p>
        </div>
        <div className="flex gap-2">
          <Select value={bucketFilter} onValueChange={setBucketFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter bucket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buckets</SelectItem>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="0-7">1-7 Days</SelectItem>
              <SelectItem value="8-30">8-30 Days</SelectItem>
              <SelectItem value="31-60">31-60 Days</SelectItem>
              <SelectItem value="61-90">61-90 Days</SelectItem>
              <SelectItem value="90+">90+ Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refetch}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total AR</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalAR)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {invoices.length} invoices
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue AR</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(overdueAR)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalAR > 0 ? ((overdueAR / totalAR) * 100).toFixed(0) : 0}% of total
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical (61-90+)</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(criticalAR)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Needs immediate action
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collections Flagged</p>
                <p className="text-2xl font-bold text-foreground">
                  {invoices.filter(i => i.collections_flagged).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Invoices in collections
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Flag className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bucket Summary Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aging Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bucketSummary.map((b) => (
              <div key={b.bucket} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{b.bucketLabel}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(b.totalBalance)} ({b.invoiceCount} invoices)
                  </span>
                </div>
                <Progress
                  value={totalAR > 0 ? (b.totalBalance / totalAR) * 100 : 0}
                  className="h-3"
                  style={{
                    ['--progress-foreground' as string]: BUCKET_COLORS[b.bucket],
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Balance by Aging Bucket
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No AR data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Balance']}
                    labelFormatter={(label) => `Bucket: ${label}`}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.bucket}
                        fill={BUCKET_COLORS[entry.bucket] || 'hsl(var(--muted))'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Debtors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Debtors
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/finance/ar-aging/customers">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {topDebtors.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No debtors</p>
            ) : (
              <div className="space-y-3">
                {topDebtors.slice(0, 5).map((debtor, idx) => (
                  <div
                    key={debtor.customerPhone || debtor.customerId || idx}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-sm">{debtor.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {debtor.invoiceCount} invoice{debtor.invoiceCount !== 1 ? 's' : ''} · {debtor.oldestDaysPastDue} days oldest
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-red-600">
                        {formatCurrency(debtor.totalBalance)}
                      </p>
                      {getBucketBadge(debtor.worstBucket)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Overdue Invoices Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Top 20 Overdue Invoices
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/finance/ar-aging/invoices">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No overdue invoices</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Balance</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Days Overdue</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Bucket</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices
                    .filter(i => i.days_past_due > 0)
                    .sort((a, b) => b.days_past_due - a.days_past_due)
                    .slice(0, 20)
                    .map((invoice) => (
                      <tr key={invoice.id} className="border-b last:border-b-0 hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <span className="font-mono text-sm">{invoice.invoice_number}</span>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-sm">{invoice.customer_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {invoice.delivery_city || invoice.customer_phone || '—'}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-2 font-medium text-red-600">
                          {formatCurrency(invoice.balance_due)}
                        </td>
                        <td className="py-3 px-2">
                          <span className={invoice.days_past_due >= 60 ? 'text-red-600 font-medium' : ''}>
                            {invoice.days_past_due} days
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {getBucketBadge(invoice.aging_bucket)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/finance/invoices/${invoice.order_id}`}>
                              View
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
