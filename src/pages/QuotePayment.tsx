import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CreditCard, Loader2, ArrowLeft, ChevronRight, CheckCircle,
  Calendar, Lock, Shield, Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import logoCalsan from '@/assets/logo-calsan.jpeg';

export default function QuotePayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const orderId = searchParams.get('orderId');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{
    total: number;
    size: string;
    schedDate: string | null;
    schedWindow: string | null;
  } | null>(null);
  const [hostedData, setHostedData] = useState<{
    token: string;
    formPostUrl: string;
    paymentId: string;
  } | null>(null);

  // Fetch order info
  useEffect(() => {
    if (!orderId) return;
    supabase
      .from('orders')
      .select('final_total, balance_due, scheduled_delivery_date, scheduled_delivery_window, quotes(size_id, dumpster_sizes:size_id(label))')
      .eq('id', orderId)
      .single()
      .then(({ data }) => {
        if (data) {
          const sizeLabel = (data.quotes as any)?.dumpster_sizes?.label || 'Dumpster';
          setOrderInfo({
            total: data.balance_due || data.final_total || 0,
            size: sizeLabel,
            schedDate: data.scheduled_delivery_date,
            schedWindow: data.scheduled_delivery_window,
          });
        }
      });
  }, [orderId]);

  // Auto-submit form when hosted data is ready
  useEffect(() => {
    if (hostedData && formRef.current) {
      formRef.current.submit();
    }
  }, [hostedData]);

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Missing order information.</p>
      </div>
    );
  }

  const handlePayDeposit = async () => {
    if (!orderInfo) return;
    setIsProcessing(true);

    try {
      const depositAmount = Math.min(orderInfo.total, Math.max(100, Math.round(orderInfo.total * 0.5)));
      const origin = window.location.origin;

      const { data, error } = await supabase.functions.invoke('create-hosted-session', {
        body: {
          orderId,
          paymentType: 'deposit',
          amount: depositAmount,
          returnUrl: `${origin}/portal/payment-complete?orderId=${orderId}`,
          cancelUrl: `${origin}/quote/pay?orderId=${orderId}`,
        },
      });

      if (error) throw error;

      if (data?.success && data?.token) {
        setHostedData({
          token: data.token,
          formPostUrl: data.formPostUrl,
          paymentId: data.paymentId,
        });
      } else {
        throw new Error(data?.error || 'Failed to create payment session');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({ title: 'Payment Error', description: 'Failed to start payment. Please try again.', variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  const handlePayFull = async () => {
    if (!orderInfo) return;
    setIsProcessing(true);

    try {
      const origin = window.location.origin;

      const { data, error } = await supabase.functions.invoke('create-hosted-session', {
        body: {
          orderId,
          paymentType: 'balance',
          amount: orderInfo.total,
          returnUrl: `${origin}/portal/payment-complete?orderId=${orderId}`,
          cancelUrl: `${origin}/quote/pay?orderId=${orderId}`,
        },
      });

      if (error) throw error;

      if (data?.success && data?.token) {
        setHostedData({
          token: data.token,
          formPostUrl: data.formPostUrl,
          paymentId: data.paymentId,
        });
      } else {
        throw new Error(data?.error || 'Failed to create payment session');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({ title: 'Payment Error', description: 'Failed to start payment. Please try again.', variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  const depositAmount = orderInfo ? Math.min(orderInfo.total, Math.max(100, Math.round(orderInfo.total * 0.5))) : 0;

  return (
    <div className="min-h-screen bg-[hsl(150_10%_98%)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Secure Payment</p>
            <p className="text-xs text-muted-foreground">Step 3 of 3</p>
          </div>
          <img src={logoCalsan} alt="Calsan" className="h-8 w-auto rounded" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <CheckCircle className="w-3 h-3 mr-1" /> Confirmed
          </Badge>
          <ChevronRight className="w-3 h-3" />
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <CheckCircle className="w-3 h-3 mr-1" /> Scheduled
          </Badge>
          <ChevronRight className="w-3 h-3" />
          <Badge className="bg-primary text-primary-foreground">
            <CreditCard className="w-3 h-3 mr-1" /> Payment
          </Badge>
        </div>

        {/* Order summary */}
        {orderInfo && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{orderInfo.size}</p>
                  <p className="text-xs text-muted-foreground">Order #{orderId.slice(0, 8)}</p>
                </div>
                <p className="font-bold text-foreground text-xl">${orderInfo.total.toLocaleString()}</p>
              </div>
              {orderInfo.schedDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>
                    {new Date(orderInfo.schedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {orderInfo.schedWindow && ` — ${orderInfo.schedWindow}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment options */}
        <div className="space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Choose Payment Option
          </h3>

          {/* Pay Deposit */}
          <button
            onClick={handlePayDeposit}
            disabled={isProcessing}
            className="w-full p-4 rounded-xl border-2 border-primary bg-primary/5 text-left transition-all hover:bg-primary/10 disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-primary">Pay Deposit</p>
              <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
            </div>
            <p className="text-2xl font-bold text-foreground">${depositAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              50% deposit — remaining balance due before delivery
            </p>
          </button>

          {/* Pay Full */}
          <button
            onClick={handlePayFull}
            disabled={isProcessing}
            className="w-full p-4 rounded-xl border border-border bg-card text-left transition-all hover:border-primary/40 disabled:opacity-50"
          >
            <p className="font-semibold text-foreground">Pay in Full</p>
            <p className="text-2xl font-bold text-foreground">${orderInfo?.total.toLocaleString() || '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Pay the full amount now — no balance remaining
            </p>
          </button>
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="text-sm text-foreground font-medium">Connecting to secure payment...</p>
          </div>
        )}

        {/* Security note */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            256-bit encryption — PCI-DSS compliant
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            Powered by Authorize.Net — your card info never touches our servers
          </div>
        </div>

        {/* Skip payment option */}
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground mb-2">
            Prefer to pay later or by phone?
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() => {
              toast({
                title: 'No problem!',
                description: 'Our team will reach out about payment options.',
              });
              navigate(`/thank-you?orderId=${orderId}`);
            }}
          >
            <Phone className="w-3.5 h-3.5 mr-1" />
            Pay Later / Call Us
          </Button>
        </div>
      </main>

      {/* Hidden form for Authorize.Net redirect */}
      {hostedData && (
        <form
          ref={formRef}
          method="POST"
          action={hostedData.formPostUrl}
          target="_self"
          style={{ display: 'none' }}
        >
          <input type="hidden" name="token" value={hostedData.token} />
        </form>
      )}
    </div>
  );
}
