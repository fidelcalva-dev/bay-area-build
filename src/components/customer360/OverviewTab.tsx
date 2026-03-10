import { Link } from 'react-router-dom';
import { Package, DollarSign, Receipt, Calendar, TrendingUp, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimelineView } from '@/components/timeline';
import { HealthScoreCard } from '@/components/health';
import type { TimelineEvent } from '@/lib/timelineService';
import type { Customer360Data } from './types';
import { SalesIntelligencePanel } from './SalesIntelligencePanel';
import { RecommendedScriptWidget } from './RecommendedScriptWidget';

interface Props {
  data: Customer360Data;
  timelineEvents: TimelineEvent[];
  isTimelineLoading: boolean;
}

export function OverviewTab({ data, timelineEvents, isTimelineLoading }: Props) {
  const { customer, orders, invoices, payments, contacts, sites } = data;

  const totalRevenue = payments
    .filter(p => p.status === 'approved' || p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + (i.balance_due || 0), 0);
  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
  const lastServiceDate = orders.length > 0
    ? new Date(orders[0].created_at).toLocaleDateString()
    : 'N/A';

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* KPI Row */}
      <div className="lg:col-span-3 grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        <KPI label="Total Orders" value={orders.length} icon={Package} />
        <KPI label="Active Orders" value={activeOrders} icon={Package} alert={activeOrders > 0} />
        <KPI label="Total Revenue" value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={DollarSign} />
        <KPI label="Outstanding" value={`$${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={Receipt} alert={totalOutstanding > 0} />
        <KPI label="Contacts" value={contacts.length} icon={Users} />
        <KPI label="Sites" value={sites.length} icon={MapPin} />
      </div>

      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Service Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Service Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <Row label="Customer Type" value={customer.customer_type || '—'} />
              <Row label="Status" value={customer.is_active ? 'Active' : 'Inactive'} />
              <Row label="Activation" value={customer.activation_status} />
              <Row label="Last Service" value={lastServiceDate} />
              <Row label="Total Invoices" value={String(invoices.length)} />
              <Row label="Total Payments" value={String(payments.length)} />
              <Row label="Open Invoices" value={String(invoices.filter(i => i.balance_due > 0).length)} />
              <Row label="Member Since" value={new Date(customer.created_at).toLocaleDateString()} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Badge variant="outline">{activeOrders} active</Badge>
          </CardHeader>
          <CardContent>
            {orders.slice(0, 5).map(order => (
              <Link
                key={order.id}
                to={`/admin/orders?id=${order.id}`}
                className="flex items-center justify-between py-2.5 border-b last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                    {order.status}
                  </Badge>
                  {order.amount_due != null && (
                    <span className="text-sm font-medium">${order.amount_due.toFixed(2)}</span>
                  )}
                </div>
              </Link>
            ))}
            {orders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No orders yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Sales Intelligence */}
        <SalesIntelligencePanel data={data} timelineEvents={timelineEvents} />

        {/* Recommended Script */}
        <RecommendedScriptWidget
          customerType={customer.customer_type}
          quoteStatus={data.quotes[0]?.status}
          hasOverdue={invoices.some(i => i.payment_status === 'overdue')}
          isExistingCustomer={orders.length > 0}
        />

        {/* Health */}
        <HealthScoreCard customerId={customer.id} />

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineView
              events={timelineEvents.slice(0, 8)}
              isLoading={isTimelineLoading}
              showFilters={false}
              title=""
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPI({ label, value, icon: Icon, alert }: { label: string; value: string | number; icon: typeof Package; alert?: boolean }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-5 pb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${alert ? 'bg-destructive/10' : 'bg-primary/10'}`}>
          <Icon className={`w-4 h-4 ${alert ? 'text-destructive' : 'text-primary'}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className={`text-lg font-bold ${alert ? 'text-destructive' : ''}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
