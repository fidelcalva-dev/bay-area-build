import { useState, useEffect } from 'react';
import { CreditCard, Loader2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
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

// Declare Accept.js types
declare global {
  interface Window {
    Accept?: {
      dispatchData: (
        secureData: {
          authData: { clientKey: string; apiLoginID: string };
          cardData: {
            cardNumber: string;
            month: string;
            year: string;
            cardCode: string;
          };
        },
        callback: (response: AcceptResponse) => void
      ) => void;
    };
  }
}

interface AcceptResponse {
  opaqueData?: {
    dataDescriptor: string;
    dataValue: string;
  };
  messages: {
    resultCode: string;
    message: Array<{ code: string; text: string }>;
  };
}

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
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  // Load Accept.js script
  useEffect(() => {
    if (open && !document.getElementById('accept-js')) {
      const script = document.createElement('script');
      script.id = 'accept-js';
      // Use sandbox for testing, production for live
      script.src = 'https://jstest.authorize.net/v1/Accept.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [open]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setAmount(balanceDue.toFixed(2));
      setCardNumber('');
      setExpMonth('');
      setExpYear('');
      setCvv('');
      setError(null);
      setSuccess(false);
    }
  }, [open, balanceDue]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const handlePayment = async () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (paymentAmount > balanceDue) {
      setError(`Amount cannot exceed balance due ($${balanceDue.toFixed(2)})`);
      return;
    }

    if (!cardNumber || !expMonth || !expYear || !cvv) {
      setError('Please fill in all card details');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Use Accept.js to tokenize card data
      if (!window.Accept) {
        throw new Error('Payment system not loaded. Please refresh and try again.');
      }

      // Get client key from environment or config
      // In production, this should come from your backend
      const clientKey = 'YOUR_ACCEPT_JS_CLIENT_KEY'; // This should be configured
      const apiLoginID = import.meta.env.VITE_AUTHNET_API_LOGIN_ID || '';

      const secureData = {
        authData: {
          clientKey,
          apiLoginID,
        },
        cardData: {
          cardNumber: cardNumber.replace(/\s/g, ''),
          month: expMonth.padStart(2, '0'),
          year: expYear.length === 2 ? `20${expYear}` : expYear,
          cardCode: cvv,
        },
      };

      // Tokenize the card
      window.Accept.dispatchData(secureData, async (response: AcceptResponse) => {
        if (response.messages.resultCode === 'Error') {
          const errorMsg = response.messages.message[0]?.text || 'Card validation failed';
          setError(errorMsg);
          setIsProcessing(false);
          return;
        }

        // Send tokenized data to our edge function
        try {
          const { data, error: fnError } = await supabase.functions.invoke('process-payment', {
            body: {
              orderId,
              amount: paymentAmount,
              paymentType,
              customerEmail,
              customerPhone,
              dataDescriptor: response.opaqueData?.dataDescriptor,
              dataValue: response.opaqueData?.dataValue,
            },
          });

          if (fnError) throw fnError;

          if (data?.success) {
            setSuccess(true);
            toast({
              title: 'Payment Successful!',
              description: `$${paymentAmount.toFixed(2)} has been processed.`,
            });
            setTimeout(() => {
              onOpenChange(false);
              onSuccess?.();
            }, 2000);
          } else {
            throw new Error(data?.error || 'Payment failed');
          }
        } catch (err: any) {
          console.error('Payment error:', err);
          setError(err.message || 'Payment processing failed');
        } finally {
          setIsProcessing(false);
        }
      });
    } catch (err: any) {
      console.error('Payment setup error:', err);
      setError(err.message || 'Failed to process payment');
      setIsProcessing(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-800">Payment Successful!</h3>
            <p className="text-gray-500 mt-2">
              Your payment of ${parseFloat(amount).toFixed(2)} has been processed.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
                  max={balanceDue}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAmount(balanceDue.toFixed(2))}
              >
                Pay Full
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Card Number</Label>
            <Input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={expMonth} onValueChange={setExpMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={expYear} onValueChange={setExpYear}>
                <SelectTrigger>
                  <SelectValue placeholder="YYYY" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>CVV</Label>
              <Input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                maxLength={4}
              />
            </div>
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
            disabled={isProcessing || !cardNumber || !expMonth || !expYear || !cvv}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ${parseFloat(amount || '0').toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
