/**
 * SalesIntelligencePanel — Shows sales-relevant fields for a customer.
 * Used inside the Customer 360 Overview tab.
 */
import {
  TrendingUp, Phone, Calendar, FileText, CreditCard,
  Package, MapPin, User, Clock, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Customer360Data } from './types';
import type { TimelineEvent } from '@/lib/timelineService';

interface Props {
  data: Customer360Data;
  timelineEvents: TimelineEvent[];
}

export function SalesIntelligencePanel({ data, timelineEvents }: Props) {
  const { customer, orders, invoices, payments, quotes } = data;

  const totalRevenue = payments
    .filter(p => p.status === 'approved' || p.status === 'completed')
    .reduce((s, p) => s + (p.amount || 0), 0);

  const paidInvoices = invoices.filter(i => i.payment_status === 'paid').length;
  const totalInvoices = invoices.length;
  const paymentReliability = totalInvoices > 0
    ? `${Math.round((paidInvoices / totalInvoices) * 100)}%`
    : 'No data yet';

  const latestQuote = quotes.length > 0 ? quotes[0] : null;
  const quoteStage = latestQuote
    ? latestQuote.status.charAt(0).toUpperCase() + latestQuote.status.slice(1)
    : 'No quotes';

  const overdueInvoices = invoices.filter(i => i.payment_status === 'overdue');
  const paymentStage = overdueInvoices.length > 0
    ? 'Overdue'
    : invoices.some(i => i.balance_due > 0)
      ? 'Pending'
      : invoices.length > 0
        ? 'Current'
        : 'No invoices';

  // Derive last contact from timeline
  const contactEvents = timelineEvents.filter(e =>
    ['CALL_IN', 'CALL_OUT', 'SMS_IN', 'SMS_OUT', 'EMAIL_IN', 'EMAIL_OUT'].includes(e.event_type)
  );
  const lastContact = contactEvents.length > 0
    ? new Date(contactEvents[0].created_at).toLocaleDateString()
    : 'No data yet';

  // Derive preferred size from orders
  const preferredSize = 'See orders';

  // Derive lead source from timeline
  const leadEvent = timelineEvents.find(e => e.event_type === 'SYSTEM');
  const leadSource = leadEvent
    ? (leadEvent.details_json as Record<string, unknown>)?.source_channel as string || 'Unknown'
    : 'Unknown';

  const fields: { label: string; value: string; icon: typeof TrendingUp; alert?: boolean }[] = [
    { label: 'Customer Type', value: customer.customer_type || 'Not set', icon: User },
    { label: 'Lead Source', value: leadSource, icon: Star },
    { label: 'Last Contact', value: lastContact, icon: Phone },
    { label: 'Quote Stage', value: quoteStage, icon: FileText },
    { label: 'Payment Stage', value: paymentStage, icon: CreditCard, alert: paymentStage === 'Overdue' },
    { label: 'Lifetime Revenue', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, icon: TrendingUp },
    { label: 'Total Orders', value: String(orders.length), icon: Package },
    { label: 'Payment Reliability', value: paymentReliability, icon: CreditCard },
    { label: 'Material Type', value: latestQuote?.material_type || 'No data yet', icon: MapPin },
    { label: 'Member Since', value: new Date(customer.created_at).toLocaleDateString(), icon: Calendar },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Sales Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {fields.map(f => (
            <div key={f.label} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30">
              <f.icon className={`w-3.5 h-3.5 shrink-0 ${f.alert ? 'text-destructive' : 'text-muted-foreground'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.label}</p>
                <p className={`text-sm font-medium truncate ${f.alert ? 'text-destructive' : ''}`}>{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
