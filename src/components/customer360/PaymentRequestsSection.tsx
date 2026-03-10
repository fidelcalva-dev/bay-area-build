/**
 * PaymentRequestsSection — Shows payment request status and send action.
 */
import { useState } from 'react';
import { CreditCard, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Props {
  customerId: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  outstandingBalance?: number;
}

export function SendPaymentButton({ customerId, customerPhone, customerEmail, outstandingBalance = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(outstandingBalance > 0 ? outstandingBalance.toFixed(2) : '');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  async function handleSend() {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast({ title: 'Enter a valid amount', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    try {
      // Create payment request
      const { data, error } = await supabase
        .from('payment_requests' as 'orders')
        .insert({
          customer_id: customerId,
          amount: numAmount,
          status: 'sent',
          sent_via: customerPhone ? 'sms' : 'email',
        } as never)
        .select()
        .single();

      if (error) throw error;

      const pr = data as unknown as { id: string; token: string };

      // Timeline event
      await supabase.from('timeline_events').insert({
        entity_type: 'CUSTOMER',
        entity_id: customerId,
        customer_id: customerId,
        event_type: 'SYSTEM',
        summary: `Payment link sent for $${numAmount.toFixed(2)}`,
        details_json: { payment_request_id: pr.id, amount: numAmount, event: 'PAYMENT_LINK_SENT' },
      });

      toast({ title: 'Payment link sent', description: `$${numAmount.toFixed(2)} payment request created` });
      setOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to create payment request', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
          <CreditCard className="w-3 h-3" />Send Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Send Payment Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          {outstandingBalance > 0 && (
            <p className="text-xs text-muted-foreground">
              Outstanding balance: <span className="font-medium text-destructive">${outstandingBalance.toFixed(2)}</span>
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
            {isSending ? 'Sending...' : 'Send Link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
