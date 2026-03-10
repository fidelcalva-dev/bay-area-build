import { TrendingUp, Repeat, Ruler, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Customer360Data } from './types';

interface Props {
  data: Customer360Data;
}

export function AnalyticsTab({ data }: Props) {
  const { orders, invoices, payments } = data;

  const completedPayments = payments.filter(p => p.status === 'approved' || p.status === 'completed');
  const totalRevenue = completedPayments.reduce((s, p) => s + p.amount, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Order frequency
  const orderDates = orders.map(o => new Date(o.created_at).getTime()).sort();
  let avgDaysBetween = 0;
  if (orderDates.length > 1) {
    const diffs: number[] = [];
    for (let i = 1; i < orderDates.length; i++) {
      diffs.push((orderDates[i] - orderDates[i - 1]) / (1000 * 60 * 60 * 24));
    }
    avgDaysBetween = Math.round(diffs.reduce((s, d) => s + d, 0) / diffs.length);
  }

  // Payment reliability
  const paidInvoices = invoices.filter(i => i.payment_status === 'paid');
  const overdueInvoices = invoices.filter(i => i.payment_status === 'overdue');
  const paymentReliability = invoices.length > 0
    ? Math.round((paidInvoices.length / invoices.length) * 100)
    : 100;

  // Most common dumpster size (from orders)
  const sizeCounts: Record<string, number> = {};
  orders.forEach(o => {
    if (o.dumpster_size_id) {
      sizeCounts[o.dumpster_size_id] = (sizeCounts[o.dumpster_size_id] || 0) + 1;
    }
  });
  const preferredSize = Object.entries(sizeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

  const metrics = [
    { icon: DollarSign, label: 'Lifetime Revenue', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
    { icon: BarChart3, label: 'Avg Order Value', value: `$${avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
    { icon: Repeat, label: 'Total Orders', value: String(orders.length) },
    { icon: Calendar, label: 'Avg Days Between Orders', value: avgDaysBetween > 0 ? `${avgDaysBetween} days` : 'N/A' },
    { icon: Ruler, label: 'Preferred Size', value: preferredSize },
    { icon: TrendingUp, label: 'Payment Reliability', value: `${paymentReliability}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {metrics.map(m => (
          <Card key={m.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <m.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <p className="text-xl font-bold">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Intelligence</CardTitle>
          <CardDescription>Automatically detected patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {orders.length >= 3 && (
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
                <Repeat className="w-4 h-4" />
                Repeat customer — {orders.length} orders placed
              </div>
            )}
            {totalRevenue >= 5000 && (
              <div className="flex items-center gap-2 p-2 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400">
                <DollarSign className="w-4 h-4" />
                High-value account — ${totalRevenue.toLocaleString()} lifetime
              </div>
            )}
            {overdueInvoices.length > 0 && (
              <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 text-destructive">
                <DollarSign className="w-4 h-4" />
                {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''} — payment risk
              </div>
            )}
            {paymentReliability === 100 && invoices.length >= 2 && (
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                100% payment reliability — excellent standing
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
