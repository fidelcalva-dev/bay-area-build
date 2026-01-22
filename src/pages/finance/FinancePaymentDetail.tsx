import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, Loader2, RefreshCw, RotateCcw,
  CheckCircle2, XCircle, Clock, ExternalLink, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { RefundVoidDialog } from '@/components/finance/RefundVoidDialog';

interface Payment {
  id: string;
  order_id: string;
  customer_id: string | null;
  amount: number;
  refunded_amount: number;
  payment_type: string;
  status: string;
  provider: string;
  transaction_id: string | null;
  auth_code: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  card_type: string | null;
  card_last_four: string | null;
  response_code: string | null;
  response_message: string | null;
  created_at: string;
  updated_at: string;
}

interface PaymentAction {
  id: string;
  action_type: string;
  amount: number;
  reason_code: string;
  reason_notes: string | null;
  status: string;
  created_at: string;
  evidence_url: string | null;
  provider_refund_transaction_id: string | null;
  error_message: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
}

export default function FinancePaymentDetail() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [actions, setActions] = useState<PaymentAction[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch payment (refunded_amount column just added, using explicit types)
      const { data: paymentData, error: paymentError } = await (supabase as any)
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;
      setPayment(paymentData as Payment);

      // Fetch related actions (table just created, using explicit types)
      const { data: actionsData } = await (supabase as any)
        .from('payment_actions')
        .select('*')
        .eq('payment_id', paymentId)
        .order('created_at', { ascending: false });

      setActions((actionsData as PaymentAction[]) || []);

      // Fetch invoice if exists
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('id, invoice_number')
        .eq('order_id', paymentData.order_id)
        .single();

      setInvoice(invoiceData);
    } catch (error) {
      console.error('Failed to fetch payment details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; icon: React.ReactNode }> = {
      captured: { className: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
      settled: { className: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
      failed: { className: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3 mr-1" /> },
      initiated: { className: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3 mr-1" /> },
    };
    const c = config[status] || { className: 'bg-muted', icon: null };
    return (
      <Badge className={c.className}>
        {c.icon}
        {status}
      </Badge>
    );
  };

  const getActionStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      requested: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      canceled: 'bg-muted text-muted-foreground',
    };
    return <Badge className={config[status] || 'bg-muted'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Payment not found</p>
      </div>
    );
  }

  const refundableAmount = payment.amount - (payment.refunded_amount || 0);
  const canRefund = payment.status === 'captured' || payment.status === 'settled';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/finance/payments">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Payment Details
            </h1>
            <p className="text-sm text-muted-foreground font-mono">{payment.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPaymentDetails}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {canRefund && refundableAmount > 0 && (
            <Button onClick={() => setShowRefundDialog(true)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Refund/Void
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaction Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(payment.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(payment.status)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Refunded</p>
                <p className="text-lg font-medium text-orange-600">
                  {formatCurrency(payment.refunded_amount || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Amount</p>
                <p className="text-lg font-medium text-green-600">
                  {formatCurrency(refundableAmount)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Transaction ID</p>
                <p className="font-mono">{payment.transaction_id || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Auth Code</p>
                <p className="font-mono">{payment.auth_code || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment Type</p>
                <Badge variant="outline" className="capitalize">{payment.payment_type}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Provider</p>
                <p>{payment.provider}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Card</p>
                <p>
                  {payment.card_type && payment.card_last_four
                    ? `${payment.card_type} •••• ${payment.card_last_four}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Response</p>
                <p className="text-xs">{payment.response_message || '—'}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Customer Email</p>
                <p>{payment.customer_email || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Customer Phone</p>
                <p>{payment.customer_phone || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{new Date(payment.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Updated</p>
                <p>{new Date(payment.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Related Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to={`/admin/orders`}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Order
                </Link>
              </Button>
              {invoice && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to={`/finance/invoices/${invoice.id}`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Invoice {invoice.invoice_number}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original</span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refunded</span>
                <span className="text-orange-600">-{formatCurrency(payment.refunded_amount || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Net</span>
                <span className="text-green-600">{formatCurrency(refundableAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Refund/Void History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {actions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No refunds or voids for this payment</p>
          ) : (
            <div className="space-y-4">
              {actions.map((action) => (
                <div key={action.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{action.action_type}</Badge>
                      {getActionStatusBadge(action.status)}
                    </div>
                    <p className="font-medium">{formatCurrency(action.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      Reason: {action.reason_code.replace('_', ' ')}
                    </p>
                    {action.reason_notes && (
                      <p className="text-sm text-muted-foreground">{action.reason_notes}</p>
                    )}
                    {action.error_message && (
                      <p className="text-sm text-red-600">{action.error_message}</p>
                    )}
                    {action.provider_refund_transaction_id && (
                      <p className="text-xs font-mono text-muted-foreground">
                        Refund ID: {action.provider_refund_transaction_id}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(action.created_at).toLocaleString()}
                    {action.evidence_url && (
                      <a 
                        href={action.evidence_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-primary hover:underline mt-1"
                      >
                        View Evidence
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      {showRefundDialog && (
        <RefundVoidDialog
          open={showRefundDialog}
          onOpenChange={setShowRefundDialog}
          payment={{
            id: payment.id,
            order_id: payment.order_id,
            amount: payment.amount,
            transaction_id: payment.transaction_id,
            refunded_amount: payment.refunded_amount,
          }}
          invoiceId={invoice?.id}
          onSuccess={fetchPaymentDetails}
        />
      )}
    </div>
  );
}
