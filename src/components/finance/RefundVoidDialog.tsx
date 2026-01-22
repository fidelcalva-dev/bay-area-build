import { useState } from 'react';
import { Loader2, RotateCcw, XCircle } from 'lucide-react';
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
import { createAuditLog } from '@/lib/auditLog';

interface RefundVoidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: {
    id: string;
    order_id: string;
    amount: number;
    transaction_id: string | null;
    refunded_amount?: number;
  };
  invoiceId?: string;
  onSuccess: () => void;
}

const REASON_CODES = [
  { value: 'customer_request', label: 'Customer Request' },
  { value: 'duplicate', label: 'Duplicate Payment' },
  { value: 'fraud', label: 'Suspected Fraud' },
  { value: 'service_issue', label: 'Service Issue' },
  { value: 'pricing_error', label: 'Pricing Error' },
  { value: 'other', label: 'Other' },
];

export function RefundVoidDialog({
  open,
  onOpenChange,
  payment,
  invoiceId,
  onSuccess,
}: RefundVoidDialogProps) {
  const [actionType, setActionType] = useState<'refund' | 'void'>('refund');
  const [amount, setAmount] = useState('');
  const [reasonCode, setReasonCode] = useState('');
  const [reasonNotes, setReasonNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const refundedAmount = payment.refunded_amount || 0;
  const maxRefundable = payment.amount - refundedAmount;

  const handleSubmit = async () => {
    if (!reasonCode) {
      toast({ title: 'Please select a reason', variant: 'destructive' });
      return;
    }

    const requestAmount = actionType === 'void' ? payment.amount : parseFloat(amount);
    
    if (isNaN(requestAmount) || requestAmount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }

    if (requestAmount > maxRefundable) {
      toast({ 
        title: 'Amount exceeds refundable balance', 
        description: `Maximum: $${maxRefundable.toFixed(2)}`,
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create payment action request (table just created, using explicit types)
      const { data: action, error } = await (supabase as any)
        .from('payment_actions')
        .insert({
          payment_id: payment.id,
          order_id: payment.order_id,
          invoice_id: invoiceId || null,
          action_type: actionType,
          amount: requestAmount,
          reason_code: reasonCode,
          reason_notes: reasonNotes || null,
          status: 'requested',
          requested_by: user.id,
          provider: 'AuthorizeNet',
          provider_transaction_id: payment.transaction_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create audit log
      await createAuditLog({
        action: 'create',
        entityType: 'approval_request',
        entityId: action.id,
        afterData: {
          action_type: actionType,
          amount: requestAmount,
          reason_code: reasonCode,
          payment_id: payment.id,
        },
        changesSummary: `${actionType === 'void' ? 'Void' : 'Refund'} requested: $${requestAmount.toFixed(2)} - ${reasonCode}`,
      });

      toast({ 
        title: `${actionType === 'void' ? 'Void' : 'Refund'} requested`,
        description: 'Awaiting approval' 
      });

      // Reset form
      setAmount('');
      setReasonCode('');
      setReasonNotes('');
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error('Error creating payment action:', err);
      toast({ title: 'Failed to create request', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    setAmount(maxRefundable.toFixed(2));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {actionType === 'void' ? (
              <XCircle className="w-5 h-5 text-destructive" />
            ) : (
              <RotateCcw className="w-5 h-5 text-orange-600" />
            )}
            Request {actionType === 'void' ? 'Void' : 'Refund'}
          </DialogTitle>
          <DialogDescription>
            Original payment: <strong>${payment.amount.toFixed(2)}</strong>
            {refundedAmount > 0 && (
              <> · Already refunded: <strong>${refundedAmount.toFixed(2)}</strong></>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Action Type */}
          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select value={actionType} onValueChange={(v: 'refund' | 'void') => setActionType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="refund">Refund (Partial or Full)</SelectItem>
                <SelectItem value="void">Void (Cancel entire transaction)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount (only for refunds) */}
          {actionType === 'refund' && (
            <div className="space-y-2">
              <Label>Amount to Refund</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={maxRefundable}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
                <Button type="button" variant="outline" onClick={handleQuickFill}>
                  Max (${maxRefundable.toFixed(2)})
                </Button>
              </div>
            </div>
          )}

          {/* Reason Code */}
          <div className="space-y-2">
            <Label>Reason *</Label>
            <Select value={reasonCode} onValueChange={setReasonCode}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REASON_CODES.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={reasonNotes}
              onChange={(e) => setReasonNotes(e.target.value)}
              placeholder="Provide additional context for this request..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !reasonCode}
            variant={actionType === 'void' ? 'destructive' : 'default'}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : actionType === 'void' ? (
              <XCircle className="w-4 h-4 mr-2" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
