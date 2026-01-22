import { useState } from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logOrderEvent } from '@/lib/orderEventService';

interface PaymentRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  currentAmountDue: number;
  currentAmountPaid: number;
  currentBalanceDue: number;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'ach', label: 'ACH / Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'cash', label: 'Cash' },
  { value: 'invoice', label: 'Invoiced' },
  { value: 'other', label: 'Other' },
];

export function PaymentRecordDialog({
  open,
  onOpenChange,
  orderId,
  currentAmountDue,
  currentAmountPaid,
  currentBalanceDue,
  onSuccess,
}: PaymentRecordDialogProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('credit_card');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }

    if (paymentAmount > currentBalanceDue) {
      toast({ 
        title: 'Amount exceeds balance', 
        description: `Maximum payment: $${currentBalanceDue.toFixed(2)}`,
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newAmountPaid = currentAmountPaid + paymentAmount;
      const newBalanceDue = currentAmountDue - newAmountPaid;
      
      // Determine new payment status
      let newPaymentStatus: string;
      if (newBalanceDue <= 0) {
        newPaymentStatus = 'paid';
      } else if (newAmountPaid > 0) {
        newPaymentStatus = 'partial';
      } else {
        newPaymentStatus = 'unpaid';
      }

      // Update order
      const { error } = await supabase
        .from('orders')
        .update({
          amount_paid: newAmountPaid,
          balance_due: Math.max(0, newBalanceDue),
          payment_status: newPaymentStatus,
        })
        .eq('id', orderId);

      if (error) throw error;

      // Log the payment event
      await logOrderEvent({
        orderId,
        eventType: 'PAYMENT_STATUS_UPDATED',
        message: `Payment recorded: $${paymentAmount.toFixed(2)} via ${method}${reference ? ` (ref: ${reference})` : ''}`,
        beforeJson: {
          amount_paid: currentAmountPaid,
          balance_due: currentBalanceDue,
          payment_status: currentBalanceDue === currentAmountDue ? 'unpaid' : 'partial',
        },
        afterJson: {
          amount_paid: newAmountPaid,
          balance_due: Math.max(0, newBalanceDue),
          payment_status: newPaymentStatus,
          payment_method: method,
          payment_reference: reference,
          payment_notes: notes,
        },
      });

      toast({ 
        title: 'Payment recorded', 
        description: newPaymentStatus === 'paid' 
          ? 'Order is now fully paid' 
          : `Balance remaining: $${newBalanceDue.toFixed(2)}` 
      });

      // Reset form
      setAmount('');
      setReference('');
      setNotes('');
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error('Payment error:', err);
      toast({ title: 'Failed to record payment', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    setAmount(currentBalanceDue.toFixed(2));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Current balance due: <strong>${currentBalanceDue.toFixed(2)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={currentBalanceDue}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
              <Button type="button" variant="outline" onClick={handleQuickFill}>
                Pay Full
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reference / Check # (optional)</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g., Check #1234 or transaction ID"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this payment"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !amount}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <DollarSign className="w-4 h-4 mr-2" />
            )}
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
