import { useState } from 'react';
import { Loader2, MessageSquare, Mail, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ARInvoice } from '@/hooks/useARAgingData';
import { 
  createARAction, 
  markInvoiceDisputed, 
  flagForCollections,
  ARChannel 
} from '@/lib/arActionsService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ARActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: ARInvoice;
  actionType: 'reminder' | 'payment_request' | 'dispute' | 'collections' | 'note';
  onSuccess?: () => void;
}

export function ARActionDialog({
  open,
  onOpenChange,
  invoice,
  actionType,
  onSuccess,
}: ARActionDialogProps) {
  const [channel, setChannel] = useState<ARChannel>('sms');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const getTitle = () => {
    switch (actionType) {
      case 'reminder': return 'Send Payment Reminder';
      case 'payment_request': return 'Create Payment Request';
      case 'dispute': return 'Mark Invoice as Disputed';
      case 'collections': return 'Flag for Collections';
      case 'note': return 'Add Note';
      default: return 'Action';
    }
  };

  const getDescription = () => {
    switch (actionType) {
      case 'reminder': return `Send a payment reminder for invoice ${invoice.invoice_number} (${formatCurrency(invoice.balance_due)} due)`;
      case 'payment_request': return `Generate a payment link for ${formatCurrency(invoice.balance_due)}`;
      case 'dispute': return 'Mark this invoice as disputed. Provide the reason below.';
      case 'collections': return 'Flag this invoice for external collections. This action is logged.';
      case 'note': return 'Add an internal note to this invoice.';
      default: return '';
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);

    try {
      switch (actionType) {
        case 'reminder':
          // Call edge function to send reminder
          const { error: reminderError } = await supabase.functions.invoke('send-payment-request', {
            body: {
              orderId: invoice.order_id,
              paymentType: 'balance',
              amount: invoice.balance_due,
              sendSms: channel === 'sms',
              sendEmail: channel === 'email',
              customerName: invoice.customer_name,
              customerPhone: invoice.customer_phone,
              customerEmail: invoice.customer_email,
              note: notes || 'Payment reminder',
            },
          });
          if (reminderError) throw reminderError;
          
          await createARAction({
            invoiceId: invoice.id,
            orderId: invoice.order_id,
            actionType: 'reminder_sent',
            channel,
            notes: notes || 'Payment reminder sent',
          });
          break;

        case 'payment_request':
          const { data: paymentData, error: paymentError } = await supabase.functions.invoke('send-payment-request', {
            body: {
              orderId: invoice.order_id,
              paymentType: 'balance',
              amount: invoice.balance_due,
              sendSms: channel === 'sms',
              sendEmail: channel === 'email',
              customerName: invoice.customer_name,
              customerPhone: invoice.customer_phone,
              customerEmail: invoice.customer_email,
              note: notes || 'Payment request',
            },
          });
          if (paymentError) throw paymentError;
          
          await createARAction({
            invoiceId: invoice.id,
            orderId: invoice.order_id,
            actionType: 'payment_request_sent',
            channel,
            notes: notes || 'Payment request sent',
            metadata: { paymentLink: paymentData?.paymentLink },
          });
          break;

        case 'dispute':
          if (!notes.trim()) {
            toast.error('Please provide a dispute reason');
            setIsProcessing(false);
            return;
          }
          const disputeResult = await markInvoiceDisputed(invoice.id, notes);
          if (!disputeResult.success) throw new Error(disputeResult.error);
          break;

        case 'collections':
          const collectionsResult = await flagForCollections(invoice.id, notes);
          if (!collectionsResult.success) throw new Error(collectionsResult.error);
          break;

        case 'note':
          if (!notes.trim()) {
            toast.error('Please enter a note');
            setIsProcessing(false);
            return;
          }
          await createARAction({
            invoiceId: invoice.id,
            orderId: invoice.order_id,
            actionType: 'note_added',
            channel: 'system',
            notes,
          });
          break;
      }

      toast.success('Action completed successfully');
      onSuccess?.();
      onOpenChange(false);
      setNotes('');
    } catch (err) {
      console.error('AR action error:', err);
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const showChannelSelector = ['reminder', 'payment_request'].includes(actionType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Channel selector for reminders/payment requests */}
          {showChannelSelector && (
            <div className="space-y-2">
              <Label>Send via</Label>
              <RadioGroup value={channel} onValueChange={(v) => setChannel(v as ARChannel)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms" />
                  <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="w-4 h-4" />
                    SMS {invoice.customer_phone ? `(${invoice.customer_phone})` : '(no phone)'}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                    <Mail className="w-4 h-4" />
                    Email {invoice.customer_email ? `(${invoice.customer_email})` : '(no email)'}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Notes/reason field */}
          <div className="space-y-2">
            <Label>
              {actionType === 'dispute' ? 'Dispute Reason *' : 
               actionType === 'note' ? 'Note *' : 
               'Additional Notes (optional)'}
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                actionType === 'dispute' ? 'Enter the reason for the dispute...' :
                actionType === 'note' ? 'Enter your note...' :
                'Add any additional context...'
              }
              rows={3}
            />
          </div>

          {/* Invoice summary */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice:</span>
              <span className="font-mono">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer:</span>
              <span>{invoice.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance Due:</span>
              <span className="font-medium text-red-600">{formatCurrency(invoice.balance_due)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Days Past Due:</span>
              <span>{invoice.days_past_due}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {actionType === 'reminder' ? 'Send Reminder' :
             actionType === 'payment_request' ? 'Send Request' :
             actionType === 'dispute' ? 'Mark Disputed' :
             actionType === 'collections' ? 'Flag Collections' :
             'Add Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
