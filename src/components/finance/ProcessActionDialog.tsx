import { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createAuditLog } from '@/lib/auditLog';

interface PaymentAction {
  id: string;
  payment_id: string;
  order_id: string;
  invoice_id: string | null;
  action_type: string;
  amount: number;
  reason_code: string;
  status: string;
  provider_transaction_id: string | null;
}

interface ProcessActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: PaymentAction;
  onSuccess: () => void;
}

export function ProcessActionDialog({
  open,
  onOpenChange,
  action,
  onSuccess,
}: ProcessActionDialogProps) {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [refundTransactionId, setRefundTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const handleAutoProcess = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update action to processing (table just created, using explicit types)
      await (supabase as any)
        .from('payment_actions')
        .update({ status: 'processing', processed_by: user.id })
        .eq('id', action.id);

      // Call the refund edge function
      const response = await supabase.functions.invoke('process-refund', {
        body: {
          actionId: action.id,
          paymentId: action.payment_id,
          orderId: action.order_id,
          invoiceId: action.invoice_id,
          actionType: action.action_type,
          amount: action.amount,
          originalTransactionId: action.provider_transaction_id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Refund processing failed');
      }

      const result = response.data;

      if (result.success) {
        toast({ 
          title: `${action.action_type === 'void' ? 'Void' : 'Refund'} processed`,
          description: `Transaction ID: ${result.refundTransactionId}` 
        });
        onOpenChange(false);
        onSuccess();
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (err) {
      console.error('Auto process error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Processing failed';
      
      // Update action to failed
      await (supabase as any)
        .from('payment_actions')
        .update({ 
          status: 'failed', 
          error_message: errorMessage 
        })
        .eq('id', action.id);

      toast({ 
        title: 'Processing failed', 
        description: errorMessage,
        variant: 'destructive' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualProcess = async () => {
    if (!evidenceUrl) {
      toast({ 
        title: 'Evidence required', 
        description: 'Please provide a screenshot or receipt URL',
        variant: 'destructive' 
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update action to completed (table just created, using explicit types)
      const { error: actionError } = await (supabase as any)
        .from('payment_actions')
        .update({ 
          status: 'completed', 
          processed_by: user.id,
          evidence_url: evidenceUrl,
          provider_refund_transaction_id: refundTransactionId || null,
        })
        .eq('id', action.id);

      if (actionError) throw actionError;

      // Update payment refunded_amount (column just added, using explicit types)
      const { data: payment } = await (supabase as any)
        .from('payments')
        .select('refunded_amount')
        .eq('id', action.payment_id)
        .single();

      const newRefundedAmount = ((payment?.refunded_amount as number) || 0) + action.amount;

      await (supabase as any)
        .from('payments')
        .update({ refunded_amount: newRefundedAmount })
        .eq('id', action.payment_id);

      // Update order balance
      const { data: order } = await supabase
        .from('orders')
        .select('amount_paid, amount_due, balance_due')
        .eq('id', action.order_id)
        .single();

      if (order) {
        const newAmountPaid = Math.max(0, (order.amount_paid || 0) - action.amount);
        const newBalanceDue = (order.amount_due || 0) - newAmountPaid;
        const newPaymentStatus = newBalanceDue <= 0 ? 'paid' : newAmountPaid > 0 ? 'partial' : 'unpaid';

        await supabase
          .from('orders')
          .update({
            amount_paid: newAmountPaid,
            balance_due: Math.max(0, newBalanceDue),
            payment_status: newPaymentStatus,
          })
          .eq('id', action.order_id);

        // Update invoice if exists
        if (action.invoice_id) {
          await supabase
            .from('invoices')
            .update({
              amount_paid: newAmountPaid,
              balance_due: Math.max(0, newBalanceDue),
              payment_status: newPaymentStatus,
            })
            .eq('id', action.invoice_id);
        }
      }

      // Create audit log
      await createAuditLog({
        action: 'update',
        entityType: 'approval_request',
        entityId: action.id,
        afterData: {
          status: 'completed',
          mode: 'manual',
          evidence_url: evidenceUrl,
          refund_transaction_id: refundTransactionId,
        },
        changesSummary: `${action.action_type} completed manually: $${action.amount.toFixed(2)}`,
      });

      // Create order event
      await supabase.from('order_events').insert({
        order_id: action.order_id,
        event_type: 'PAYMENT_REFUND_APPLIED',
        message: `${action.action_type === 'void' ? 'Void' : 'Refund'} of $${action.amount.toFixed(2)} applied (manual)`,
        after_json: {
          action_id: action.id,
          amount: action.amount,
          mode: 'manual',
        },
      });

      toast({ 
        title: 'Marked as processed',
        description: 'Balances have been updated' 
      });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error('Manual process error:', err);
      toast({ title: 'Failed to mark as processed', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Process {action.action_type === 'void' ? 'Void' : 'Refund'}
          </DialogTitle>
          <DialogDescription>
            Amount: <strong>${action.amount.toFixed(2)}</strong> · 
            Original Transaction: <code className="text-xs">{action.provider_transaction_id || 'N/A'}</code>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'auto' | 'manual')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="auto">Auto (API)</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="space-y-4 pt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will call the Authorize.Net API to process the {action.action_type}.
                The customer will be refunded automatically.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAutoProcess} 
                disabled={isProcessing}
                className="bg-primary"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Process via API
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 pt-4">
            <Alert variant="default" className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Use this if you've already processed the refund in the Authorize.Net dashboard.
                Provide evidence for audit purposes.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Evidence URL (screenshot/receipt) *</Label>
                <div className="flex gap-2">
                  <Input
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <Button variant="outline" size="icon" disabled>
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Refund Transaction ID (optional)</Label>
                <Input
                  value={refundTransactionId}
                  onChange={(e) => setRefundTransactionId(e.target.value)}
                  placeholder="From Authorize.Net dashboard"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleManualProcess} 
                disabled={isProcessing || !evidenceUrl}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Mark as Processed
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
