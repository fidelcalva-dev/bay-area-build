/**
 * SalesReadinessPanel — Shows stuck deals, missing info, and commercial pipeline health
 * at a glance for the Sales Dashboard.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, FileText, ScrollText,
  CreditCard, Truck, Clock, ArrowRight, Loader2, XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface StuckDeal {
  id: string;
  label: string;
  detail: string;
  age: string;
  severity: 'urgent' | 'attention' | 'info';
  link: string;
}

interface ReadinessStats {
  quotesReadyToSend: number;
  quotesReadyToSchedule: number;
  quotesWaitingContract: number;
  quotesWaitingPayment: number;
  quotesMissingSize: number;
  quotesMissingDelivery: number;
  stuckDeals: StuckDeal[];
}

export function SalesReadinessPanel() {
  const [stats, setStats] = useState<ReadinessStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReadiness();
  }, []);

  async function fetchReadiness() {
    setIsLoading(true);
    try {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

      const [quotesRes, contractsRes, paymentsRes] = await Promise.all([
        supabase.from('quotes').select('id, customer_name, customer_phone, status, subtotal, created_at, material_type, zip_code, user_selected_size_yards, recommended_size_yards, delivery_date_preference')
          .in('status', ['saved', 'pending', 'sent'])
          .order('created_at', { ascending: false })
          .limit(200),
        supabase.from('quote_contracts').select('id, customer_name, status, sent_at, created_at, quote_id')
          .in('status', ['pending', 'sent'])
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.from('payment_requests' as 'orders').select('id, status, amount, created_at, customer_id' as '*')
          .in('status' as any, ['sent', 'pending'])
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      const quotes = quotesRes.data || [];
      const contracts = (contractsRes.data || []) as any[];
      const payments = (paymentsRes.data || []) as any[];

      const missingSize = quotes.filter(q => !q.user_selected_size_yards && !q.recommended_size_yards);
      const missingDelivery = quotes.filter(q => !q.delivery_date_preference);
      const readyToSend = quotes.filter(q => 
        q.status === 'saved' && q.customer_name && q.customer_phone && q.subtotal && 
        (q.user_selected_size_yards || q.recommended_size_yards)
      );
      const readyToSchedule = quotes.filter(q =>
        q.customer_name && q.customer_phone && q.subtotal &&
        (q.user_selected_size_yards || q.recommended_size_yards) &&
        q.delivery_date_preference
      );

      // Build stuck deals
      const stuckDeals: StuckDeal[] = [];

      // Contracts sent but not signed (older than 2 days)
      contracts
        .filter((c: any) => c.status === 'sent' && c.sent_at && c.sent_at < twoDaysAgo)
        .slice(0, 5)
        .forEach((c: any) => {
          stuckDeals.push({
            id: c.id,
            label: c.customer_name || 'Contract',
            detail: 'Contract sent but not signed',
            age: formatDistanceToNow(new Date(c.sent_at), { addSuffix: true }),
            severity: new Date(c.sent_at) < new Date(fiveDaysAgo) ? 'urgent' : 'attention',
            link: `/sales/quotes/${c.quote_id}`,
          });
        });

      // Payment links sent but unpaid (older than 2 days)
      payments
        .filter((p: any) => p.status === 'sent' && p.created_at < twoDaysAgo)
        .slice(0, 5)
        .forEach((p: any) => {
          stuckDeals.push({
            id: p.id,
            label: `Payment $${(p.amount || 0).toFixed(0)}`,
            detail: 'Payment link sent but unpaid',
            age: formatDistanceToNow(new Date(p.created_at), { addSuffix: true }),
            severity: new Date(p.created_at) < new Date(fiveDaysAgo) ? 'urgent' : 'attention',
            link: '/finance/payments',
          });
        });

      // Quotes missing critical info but old enough to be stuck
      missingSize
        .filter(q => q.created_at < twoDaysAgo)
        .slice(0, 3)
        .forEach(q => {
          stuckDeals.push({
            id: q.id,
            label: q.customer_name || 'Quote',
            detail: 'Quote missing dumpster size',
            age: formatDistanceToNow(new Date(q.created_at), { addSuffix: true }),
            severity: 'info',
            link: `/sales/quotes/${q.id}`,
          });
        });

      setStats({
        quotesReadyToSend: readyToSend.length,
        quotesReadyToSchedule: readyToSchedule.length,
        quotesWaitingContract: contracts.filter((c: any) => c.status === 'sent').length,
        quotesWaitingPayment: payments.filter((p: any) => p.status === 'sent').length,
        quotesMissingSize: missingSize.length,
        quotesMissingDelivery: missingDelivery.length,
        stuckDeals,
      });
    } catch (err) {
      console.error('Error fetching sales readiness:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const severityIcon = {
    urgent: <XCircle className="w-4 h-4 text-destructive shrink-0" />,
    attention: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    info: <Clock className="w-4 h-4 text-muted-foreground shrink-0" />,
  };

  return (
    <div className="space-y-4">
      {/* Pipeline Readiness Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Sales Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <ReadinessItem
              icon={<FileText className="w-4 h-4 text-blue-600" />}
              label="Ready to Send"
              value={stats.quotesReadyToSend}
              link="/sales/quotes"
            />
            <ReadinessItem
              icon={<Truck className="w-4 h-4 text-green-600" />}
              label="Ready to Schedule"
              value={stats.quotesReadyToSchedule}
              link="/sales/quotes"
            />
            <ReadinessItem
              icon={<ScrollText className="w-4 h-4 text-purple-600" />}
              label="Waiting on Contract"
              value={stats.quotesWaitingContract}
              link="/sales/quotes"
              alert={stats.quotesWaitingContract > 0}
            />
            <ReadinessItem
              icon={<CreditCard className="w-4 h-4 text-emerald-600" />}
              label="Waiting on Payment"
              value={stats.quotesWaitingPayment}
              link="/finance/payments"
              alert={stats.quotesWaitingPayment > 0}
            />
            <ReadinessItem
              icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
              label="Missing Size"
              value={stats.quotesMissingSize}
              link="/sales/quotes"
              alert={stats.quotesMissingSize > 0}
            />
            <ReadinessItem
              icon={<Clock className="w-4 h-4 text-muted-foreground" />}
              label="Missing Delivery"
              value={stats.quotesMissingDelivery}
              link="/sales/quotes"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stuck Deals */}
      {stats.stuckDeals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Attention Needed
              <Badge variant="secondary" className="ml-auto text-xs">{stats.stuckDeals.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.stuckDeals.map(deal => (
              <Link
                key={deal.id}
                to={deal.link}
                className="flex items-center gap-3 p-2.5 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                {severityIcon[deal.severity]}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{deal.label}</p>
                  <p className="text-xs text-muted-foreground">{deal.detail}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{deal.age}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReadinessItem({ icon, label, value, link, alert }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  link: string;
  alert?: boolean;
}) {
  return (
    <Link
      to={link}
      className={`flex items-center gap-2.5 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${alert ? 'border-amber-300/50 bg-amber-50/30 dark:border-amber-700/30 dark:bg-amber-900/10' : ''}`}
    >
      {icon}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className={`text-lg font-bold ${alert ? 'text-amber-600 dark:text-amber-400' : ''}`}>{value}</p>
      </div>
    </Link>
  );
}
