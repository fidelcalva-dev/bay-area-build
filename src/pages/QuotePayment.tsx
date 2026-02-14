import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CreditCard, Loader2, ArrowLeft, ChevronRight, CheckCircle,
  Calendar, Lock, Shield, Phone, ShieldAlert, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { checkGuardrail, type GuardrailResult } from '@/services/riskCheckService';
import logoCalsan from '@/assets/logo-calsan.jpeg';

export default function QuotePayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const orderId = searchParams.get('orderId');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<'deposit' | 'balance' | 'pay_later' | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
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
  const [guardrail, setGuardrail] = useState<GuardrailResult | null>(null);

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

  // Check guardrails for payment
  useEffect(() => {
    if (!orderId) return;
    checkGuardrail('ORDER', orderId, 'SEND_PAYMENT_LINK').then(setGuardrail);
  }, [orderId]);

  // Auto-submit form when hosted data is ready
  useEffect(() => {
    if (hostedData && formRef.current) {
      formRef.current.submit();
    }
  }, [hostedData]);

  // Computed amounts
  const fullAmount = orderInfo?.total ?? 0;
  const depositAmount = fullAmount > 0 ? Math.min(fullAmount, Math.max(100, Math.round(fullAmount * 0.5))) : 0;
  const paymentRequired = fullAmount > 0;

  // Auto-select logic
  useEffect(() => {
    if (!orderInfo || selectedPaymentOption) return;
    if (depositAmount > 0) {
      setSelectedPaymentOption('deposit');
    } else if (fullAmount > 0) {
      setSelectedPaymentOption('balance');
    }
  }, [orderInfo, depositAmount, fullAmount, selectedPaymentOption]);

  // Auto-skip if no payment needed
  useEffect(() => {
    if (orderInfo && fullAmount <= 0) {
      console.log('[QuotePayment] fullAmount <= 0, auto-skipping payment step');
      navigate(`/thank-you?orderId=${orderId}`);
    }
  }, [orderInfo, fullAmount, orderId, navigate]);

  // Diagnostic logging
  useEffect(() => {
    if (orderInfo) {
      console.log('[QuotePayment] Diagnostic:', {
        orderId,
        fullAmount,
        depositAmount,
        selectedPaymentOption,
        paymentRequired,
        riskBand: guardrail?.riskBand ?? 'GREEN',
        paymentBlocked: guardrail && !guardrail.allowed,
      });
    }
  }, [orderInfo, orderId, fullAmount, depositAmount, selectedPaymentOption, paymentRequired, guardrail]);

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Missing order information.</p>
      </div>
    );
  }

  const handlePay = async (type: 'deposit' | 'balance') => {
    if (!orderInfo) return;
    setIsProcessing(true);
    setSessionError(null);

    try {
      const amount = type === 'deposit' ? depositAmount : fullAmount;
      const origin = window.location.origin;

      const { data, error } = await supabase.functions.invoke('create-hosted-session', {
        body: {
          orderId,
          paymentType: type,
          amount,
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
    } catch (err: any) {
      console.error('[QuotePayment] Payment session error:', err);
      const msg = err?.message || 'Failed to start payment session.';
      setSessionError(msg);
      toast({ title: 'Payment Error', description: msg, variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  const handlePayLater = () => {
    toast({
      title: 'No problem!',
      description: 'Our team will reach out about payment options.',
    });
    navigate(`/thank-you?orderId=${orderId}`);
  };

  const handleContinue = () => {
    if (!selectedPaymentOption) return;
    if (selectedPaymentOption === 'pay_later') {
      handlePayLater();
    } else {
      handlePay(selectedPaymentOption);
    }
  };

  const isRed = guardrail?.riskBand === 'RED';
  const isAmber = guardrail?.riskBand === 'AMBER';
  const paymentBlocked = isRed || isAmber;

  return (
    <div className="min-h-screen bg-[hsl(150_10%_98%)]">
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
                <p className="font-bold text-foreground text-xl">${fullAmount.toLocaleString()}</p>
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

        {/* Risk guardrail warning */}
        {isRed && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-destructive text-sm">Verification Required</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verification required before payment. Please call us at (510) 680-2150.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isAmber && (
          <Card className="border-amber-500/50 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-700 text-sm">Details Confirmation Needed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We need to confirm a few details before payment. Please call (510) 680-2150.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment options — always visible */}
        <div className="space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Choose Payment Option
          </h3>

          {/* Pay Deposit — only show if deposit > 0 */}
          {depositAmount > 0 && (
            <button
              onClick={() => setSelectedPaymentOption('deposit')}
              disabled={isProcessing || paymentBlocked}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50',
                selectedPaymentOption === 'deposit'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <p className={cn('font-semibold', selectedPaymentOption === 'deposit' ? 'text-primary' : 'text-foreground')}>Pay Deposit</p>
                <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">${depositAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                50% deposit — remaining ${(fullAmount - depositAmount).toLocaleString()} due before delivery
              </p>
            </button>
          )}

          {/* Pay Full */}
          <button
            onClick={() => setSelectedPaymentOption('balance')}
            disabled={isProcessing || paymentBlocked}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50',
              selectedPaymentOption === 'balance'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border bg-card hover:border-primary/40'
            )}
          >
            <p className={cn('font-semibold', selectedPaymentOption === 'balance' ? 'text-primary' : 'text-foreground')}>Pay in Full</p>
            <p className="text-2xl font-bold text-foreground">${fullAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Pay the full amount now — no balance remaining
            </p>
          </button>

          {/* Pay Later — always available */}
          <button
            onClick={() => setSelectedPaymentOption('pay_later')}
            disabled={isProcessing}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50',
              selectedPaymentOption === 'pay_later'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border bg-card hover:border-primary/40'
            )}
          >
            <p className={cn('font-semibold', selectedPaymentOption === 'pay_later' ? 'text-primary' : 'text-foreground')}>Reserve Now / Pay Later</p>
            <p className="text-xs text-muted-foreground mt-1">
              No charge now — our team will reach out about payment options
            </p>
          </button>

          {/* Session error fallback */}
          {sessionError && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-destructive text-sm">Payment could not be started</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please call (510) 680-2150 or try again.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 gap-1.5"
                      onClick={() => {
                        setSessionError(null);
                        if (selectedPaymentOption && selectedPaymentOption !== 'pay_later') {
                          handlePay(selectedPaymentOption);
                        }
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirm Payment Button — always present */}
          <Button
            onClick={handleContinue}
            disabled={!selectedPaymentOption || isProcessing}
            className="w-full h-12 text-base font-semibold gap-2"
            size="lg"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : selectedPaymentOption === 'pay_later' ? (
              <Phone className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {isProcessing
              ? 'Connecting...'
              : selectedPaymentOption === 'pay_later'
                ? 'Confirm Reservation'
                : selectedPaymentOption
                  ? 'Proceed to Secure Payment'
                  : 'Select a payment option'}
          </Button>
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
            Powered by Authorize.Net
          </div>
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
