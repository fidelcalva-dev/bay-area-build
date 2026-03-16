/**
 * PaymentsTab — Shows payment requests, invoices, and payment history for Customer 360.
 */
import { useState, useEffect } from 'react';
import {
  CreditCard, Send, DollarSign, Clock, CheckCircle,
  AlertTriangle, Loader2, ExternalLink, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Invoice, Payment } from './types';

interface PaymentRequest {
  id: string;
  amount: number;
  status: string;
  sent_via: string;
  quote_id: string | null;
  order_id: string | null;
  created_at: string;
}

interface Props {
  customerId: string;
  invoices: Invoice[];
  payments: Payment[];
}

const PR_STATUS_STYLES: Record<string, string> = {
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  opened: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  expired: 'bg-muted text-muted-foreground',
};

export function PaymentsTab({ customerId, invoices, payments }: Props) {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadPaymentRequests(); }, [customerId]);

  async function loadPaymentRequests() {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('payment_requests' as 'orders')
        .select('id, amount, status, sent_via, quote_id, order_id, created_at' as '*')
        .eq('customer_id' as 'id', customerId)
        .order('created_at', { ascending: false });

      setPaymentRequests((data || []) as unknown as PaymentRequest[]);
    } catch (err) {
      console.error('Failed to load payment requests', err);
    }
    setIsLoading(false);
  }

  const totalPaid = payments
    .filter(p => p.status === 'approved' || p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOutstanding = invoices
    .filter(i => i.payment_status !== 'paid')
    .reduce((sum, i) => sum + i.balance_due, 0);

  const pendingRequests = paymentRequests.filter(pr => pr.status === 'sent' || pr.status === 'opened');

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Total Paid</p>
            <p className="text-xl font-bold text-foreground">${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Outstanding</p>
            <p className={`text-xl font-bold ${totalOutstanding > 0 ? 'text-destructive' : 'text-foreground'}`}>
              ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Invoices</p>
            <p className="text-xl font-bold text-foreground">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Pending Links</p>
            <p className="text-xl font-bold text-foreground">{pendingRequests.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Requests */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4" /> Payment Requests
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={loadPaymentRequests}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : paymentRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No payment requests sent yet</p>
          ) : (
            <div className="space-y-2">
              {paymentRequests.map(pr => (
                <div key={pr.id} className="flex items-center justify-between p-3 rounded-lg border gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">${pr.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pr.created_at).toLocaleDateString()} · via {pr.sent_via || 'link'}
                        {pr.quote_id && ' · Linked to quote'}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] ${PR_STATUS_STYLES[pr.status] || ''}`}>
                    {pr.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No invoices</p>
          ) : (
            <div className="space-y-2">
              {invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{inv.invoice_number || `INV-${inv.id.slice(0, 8)}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : new Date(inv.created_at).toLocaleDateString()}
                        {inv.due_date && ` · Due ${new Date(inv.due_date).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={inv.payment_status === 'paid' ? 'default' : inv.payment_status === 'overdue' ? 'destructive' : 'secondary'} className="text-xs">
                      {inv.payment_status}
                    </Badge>
                    <div className="text-right">
                      <p className="font-medium text-sm">${inv.amount_due.toFixed(2)}</p>
                      {inv.balance_due > 0 && <p className="text-[10px] text-destructive">Bal: ${inv.balance_due.toFixed(2)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No payments recorded</p>
          ) : (
            <div className="space-y-2">
              {payments.map(pmt => (
                <div key={pmt.id} className="flex items-center justify-between p-3 rounded-lg border gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{pmt.payment_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pmt.created_at).toLocaleDateString()}
                        {pmt.card_type && pmt.card_last_four && ` · ${pmt.card_type} ****${pmt.card_last_four}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={pmt.status === 'approved' || pmt.status === 'completed' ? 'default' : pmt.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs">
                      {pmt.status}
                    </Badge>
                    <span className="font-medium text-sm">${pmt.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
