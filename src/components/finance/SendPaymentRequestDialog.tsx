import { useState } from 'react';
import { Send, Loader2, Phone, Mail, MessageSquare, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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

interface SendPaymentRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  balanceDue: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  onSuccess?: () => void;
}

type PaymentType = 'balance' | 'deposit' | 'overage';

export function SendPaymentRequestDialog({
  open,
  onOpenChange,
  orderId,
  balanceDue,
  customerName,
  customerPhone,
  customerEmail,
  onSuccess,
}: SendPaymentRequestDialogProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>('balance');
  const [amount, setAmount] = useState(balanceDue.toFixed(2));
  const [note, setNote] = useState('');
  const [sendSms, setSendSms] = useState(!!customerPhone);
  const [sendEmail, setSendEmail] = useState(!!customerEmail);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const { toast } = useToast();

  const resetForm = () => {
    setAmount(balanceDue.toFixed(2));
    setNote('');
    setError(null);
    setGeneratedLink(null);
  };

  const handleSend = async () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!sendSms && !sendEmail) {
      setError('Please select at least one delivery method (SMS or Email)');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Call edge function to create hosted session and send notification
      const { data, error: fnError } = await supabase.functions.invoke('send-payment-request', {
        body: {
          orderId,
          paymentType,
          amount: paymentAmount,
          note,
          sendSms: sendSms && customerPhone,
          sendEmail: sendEmail && customerEmail,
          customerName,
          customerPhone,
          customerEmail,
        },
      });

      if (fnError) throw fnError;

      if (data?.success) {
        setGeneratedLink(data.paymentLink);
        toast({
          title: 'Payment request sent!',
          description: `A payment link for $${paymentAmount.toFixed(2)} has been sent.`,
        });
        onSuccess?.();
      } else {
        throw new Error(data?.error || 'Failed to send payment request');
      }
    } catch (err: unknown) {
      console.error('Send payment request error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send payment request';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Send Payment Request
          </DialogTitle>
          <DialogDescription>
            Create and send a secure payment link to {customerName || 'the customer'}.
          </DialogDescription>
        </DialogHeader>

        {generatedLink ? (
          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-800 mb-1">Payment Request Sent!</h3>
              <p className="text-sm text-green-700">
                The customer has been notified via {sendSms && sendEmail ? 'SMS and Email' : sendSms ? 'SMS' : 'Email'}.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Payment Link</Label>
              <div className="flex gap-2">
                <Input value={generatedLink} readOnly className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink);
                    toast({ title: 'Link copied!' });
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
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
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="balance">Balance Payment</SelectItem>
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
                  Full Balance
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Current balance due: ${balanceDue.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a message to the customer..."
                rows={2}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-sm font-medium">Send via:</Label>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">SMS</p>
                    <p className="text-xs text-muted-foreground">{customerPhone || 'No phone'}</p>
                  </div>
                </div>
                <Switch
                  checked={sendSms}
                  onCheckedChange={setSendSms}
                  disabled={!customerPhone}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-muted-foreground">{customerEmail || 'No email'}</p>
                  </div>
                </div>
                <Switch
                  checked={sendEmail}
                  onCheckedChange={setSendEmail}
                  disabled={!customerEmail}
                />
              </div>
            </div>
          </div>
        )}

        {!generatedLink && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
