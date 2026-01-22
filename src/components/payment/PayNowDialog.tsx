import { useState, useEffect, useRef } from 'react';
import { CreditCard, Loader2, ExternalLink, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PayNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  amountDue: number;
  balanceDue: number;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess?: () => void;
}

type PaymentType = 'balance' | 'deposit' | 'overage';

export function PayNowDialog({
  open,
  onOpenChange,
  orderId,
  amountDue,
  balanceDue,
  customerEmail,
  customerPhone,
  onSuccess,
}: PayNowDialogProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>('balance');
  const [amount, setAmount] = useState(balanceDue.toFixed(2));
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [hostedData, setHostedData] = useState<{
    token: string;
    formPostUrl: string;
  } | null>(null);
  const { toast } = useToast();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setAmount(balanceDue.toFixed(2));
      setError(null);
      setHostedData(null);
    }
  }, [open, balanceDue]);

  // Auto-submit form when hosted data is ready
  useEffect(() => {
    if (hostedData && formRef.current) {
      formRef.current.submit();
    }
  }, [hostedData]);

  const handlePayment = async () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (paymentType !== 'overage' && paymentAmount > balanceDue) {
      setError(`Amount cannot exceed balance due ($${balanceDue.toFixed(2)})`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get the current origin for return URLs
      const origin = window.location.origin;
      const returnUrl = `${origin}/portal/payment-complete?orderId=${orderId}`;
      const cancelUrl = `${origin}/portal/orders/${orderId}`;

      // Call our edge function to create hosted session
      const { data, error: fnError } = await supabase.functions.invoke('create-hosted-session', {
        body: {
          orderId,
          paymentType,
          amount: paymentAmount,
          returnUrl,
          cancelUrl,
        },
      });

      if (fnError) throw fnError;

      if (data?.success && data?.token) {
        // Store the data and redirect via form post
        setHostedData({
          token: data.token,
          formPostUrl: data.formPostUrl,
        });

        toast({
          title: 'Redirecting to payment...',
          description: 'You will be redirected to the secure payment page.',
        });
      } else {
        throw new Error(data?.error || 'Failed to create payment session');
      }
    } catch (err: unknown) {
      console.error('Payment session error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate payment';
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Pay Now
          </DialogTitle>
          <DialogDescription>
            Balance due: <strong>${balanceDue.toFixed(2)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Payment Type</Label>
            <Select value={paymentType} onValueChange={(v) => setPaymentType(v as PaymentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balance">Balance Payment</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="overage">Overage Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={paymentType === 'overage' ? undefined : balanceDue}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                  disabled={isProcessing}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAmount(balanceDue.toFixed(2))}
                disabled={isProcessing}
              >
                Pay Full
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <Lock className="w-4 h-4 inline-block mr-1" />
              You will be redirected to a secure Authorize.Net payment page to enter your card details.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            Your payment is secured with 256-bit encryption
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isProcessing || parseFloat(amount) <= 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Pay ${parseFloat(amount || '0').toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>

        {/* Hidden form for Accept Hosted redirect */}
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
      </DialogContent>
    </Dialog>
  );
}
