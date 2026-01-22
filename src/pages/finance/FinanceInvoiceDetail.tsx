import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, FileText, User, MapPin, Phone, Mail,
  Calendar, DollarSign, CreditCard, Send, Loader2,
  CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { PaymentHistory } from '@/components/payment/PaymentHistory';
import { InvoiceLineItems } from '@/components/payment/InvoiceLineItems';
import { SendPaymentRequestDialog } from '@/components/finance/SendPaymentRequestDialog';

interface OrderDetails {
  id: string;
  status: string;
  final_total: number | null;
  amount_due: number | null;
  amount_paid: number | null;
  balance_due: number | null;
  payment_status: string | null;
  scheduled_delivery_date: string | null;
  scheduled_pickup_date: string | null;
  created_at: string;
  quotes: {
    id: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    delivery_address: string | null;
    material_type: string;
    size_id: string | null;
    subtotal: number;
    rental_days: number;
  } | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount_due: number;
  amount_paid: number;
  balance_due: number;
  payment_status: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
}

export default function FinanceInvoiceDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  const fetchOrderData = async () => {
    if (!orderId) return;
    setIsLoading(true);

    try {
      // Fetch order with quote
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          quotes (
            id,
            customer_name,
            customer_email,
            customer_phone,
            delivery_address,
            material_type,
            size_id,
            subtotal,
            rental_days
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      // Fetch invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (!invoiceError && invoiceData) {
        setInvoice(invoiceData);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
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
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The order you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/finance/invoices">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Invoices
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const balanceDue = order.balance_due ?? (order.amount_due ?? order.final_total ?? 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/finance/invoices">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {invoice?.invoice_number || `Order ${orderId?.slice(0, 8)}`}
            </h1>
            <p className="text-muted-foreground">
              {order.quotes?.customer_name || 'Unknown Customer'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(order.payment_status || 'unpaid')}
          {balanceDue > 0 && (
            <Button onClick={() => setSendDialogOpen(true)}>
              <Send className="w-4 h-4 mr-2" />
              Send Payment Request
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Customer Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span>{order.quotes?.customer_name || 'Not provided'}</span>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span>{order.quotes?.customer_phone || 'Not provided'}</span>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span>{order.quotes?.customer_email || 'Not provided'}</span>
            </div>
            <Separator />
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">{order.quotes?.delivery_address || 'Not provided'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Billing Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="w-4 h-4" />
              Billing Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Total</span>
              <span className="font-medium">{formatCurrency(order.final_total || order.amount_due || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="text-green-600 font-medium">{formatCurrency(order.amount_paid || 0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Balance Due</span>
              <span className={`font-bold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(balanceDue)}
              </span>
            </div>
            {invoice?.due_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <Calendar className="w-4 h-4" />
                <span>Due: {invoice.due_date}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4" />
              Order Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-sm">{order.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline">{order.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Material</span>
              <span className="capitalize">{order.quotes?.material_type || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rental Days</span>
              <span>{order.quotes?.rental_days || 7} days</span>
            </div>
            {order.scheduled_delivery_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{order.scheduled_delivery_date}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice Line Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceLineItems orderId={orderId!} />
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistory orderId={orderId!} />
        </CardContent>
      </Card>

      {/* Send Payment Request Dialog */}
      <SendPaymentRequestDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        orderId={orderId!}
        balanceDue={balanceDue}
        customerName={order.quotes?.customer_name || undefined}
        customerPhone={order.quotes?.customer_phone || undefined}
        customerEmail={order.quotes?.customer_email || undefined}
        onSuccess={fetchOrderData}
      />
    </div>
  );
}
