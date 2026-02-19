import { ArrowRight, Phone, MessageSquare, DollarSign, Truck, Camera, FileText, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NextAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  actionLabel: string;
  onAction?: () => void;
  variant?: 'default' | 'destructive';
}

const STAGE_ACTIONS: Record<string, NextAction> = {
  LEAD_NEW: {
    label: 'Contact lead within 15 minutes',
    description: 'Make first outbound call or send SMS to establish contact.',
    icon: <Phone className="w-4 h-4" />,
    actionLabel: 'Call Now',
  },
  LEAD_CONTACTED: {
    label: 'Qualify and send quote',
    description: 'Confirm requirements, material type, and delivery address.',
    icon: <FileText className="w-4 h-4" />,
    actionLabel: 'Create Quote',
  },
  QUALIFIED: {
    label: 'Send quote to customer',
    description: 'Prepare and send a formal quote via SMS or email.',
    icon: <Send className="w-4 h-4" />,
    actionLabel: 'Create Quote',
  },
  QUOTE_SENT: {
    label: 'Follow up on sent quote',
    description: 'Customer has not responded. Call or send follow-up.',
    icon: <Phone className="w-4 h-4" />,
    actionLabel: 'Follow Up',
  },
  FOLLOW_UP_PENDING: {
    label: 'Follow up on sent quote',
    description: 'No response received. Attempt follow-up call.',
    icon: <Phone className="w-4 h-4" />,
    actionLabel: 'Call Now',
  },
  QUOTE_ACCEPTED: {
    label: 'Send contract for signature',
    description: 'Customer accepted. Send contract and terms.',
    icon: <FileText className="w-4 h-4" />,
    actionLabel: 'Send Contract',
  },
  CONTRACT_SENT: {
    label: 'Await contract signature',
    description: 'Contract sent to customer. Monitor for completion.',
    icon: <FileText className="w-4 h-4" />,
    actionLabel: 'Check Status',
  },
  CONTRACT_SIGNED: {
    label: 'Start verification process',
    description: 'Contract signed. Begin ID and payment verification.',
    icon: <FileText className="w-4 h-4" />,
    actionLabel: 'Start Verification',
  },
  ID_VERIFICATION_PENDING: {
    label: 'Complete ID verification',
    description: 'Customer ID and documents need review.',
    icon: <FileText className="w-4 h-4" />,
    actionLabel: 'Review ID',
  },
  DEPOSIT_REQUESTED: {
    label: 'Collect deposit payment',
    description: 'Payment link sent. Awaiting deposit.',
    icon: <DollarSign className="w-4 h-4" />,
    actionLabel: 'Send Reminder',
  },
  DEPOSIT_PAID: {
    label: 'Schedule delivery',
    description: 'Deposit received. Confirm delivery date and window.',
    icon: <Truck className="w-4 h-4" />,
    actionLabel: 'Schedule',
  },
  PAYMENT_FAILED: {
    label: 'Resolve payment failure',
    description: 'Payment was declined. Contact customer for new payment method.',
    icon: <DollarSign className="w-4 h-4" />,
    actionLabel: 'Call Customer',
    variant: 'destructive',
  },
  PAYMENT_OVERDUE: {
    label: 'Collect overdue payment',
    description: 'Payment is past due. Escalate collection.',
    icon: <DollarSign className="w-4 h-4" />,
    actionLabel: 'Send Notice',
    variant: 'destructive',
  },
  SCHEDULED: {
    label: 'Assign driver and prepare for delivery',
    description: 'Delivery is scheduled. Assign driver and confirm route.',
    icon: <Truck className="w-4 h-4" />,
    actionLabel: 'Assign Driver',
  },
  DELIVERED: {
    label: 'Monitor usage and prepare pickup',
    description: 'Dumpster delivered. Await customer pickup request.',
    icon: <Truck className="w-4 h-4" />,
    actionLabel: 'Schedule Pickup',
  },
  IN_USE: {
    label: 'Send pickup reminder',
    description: 'Dumpster is on site. Remind customer of rental period.',
    icon: <MessageSquare className="w-4 h-4" />,
    actionLabel: 'Send Reminder',
  },
  PICKUP_SCHEDULED: {
    label: 'Execute pickup',
    description: 'Pickup date confirmed. Assign driver.',
    icon: <Truck className="w-4 h-4" />,
    actionLabel: 'Assign Driver',
  },
  PICKED_UP: {
    label: 'Upload dump ticket',
    description: 'Dumpster picked up. Upload disposal documentation.',
    icon: <Camera className="w-4 h-4" />,
    actionLabel: 'Upload Ticket',
  },
  DUMP_TICKET_UPLOADED: {
    label: 'Verify dump weight',
    description: 'Dump ticket uploaded. Confirm weight and calculate charges.',
    icon: <FileText className="w-4 h-4" />,
    actionLabel: 'Verify Weight',
  },
  FINAL_BILL_CALCULATED: {
    label: 'Collect final payment',
    description: 'Final bill ready. Send payment request to customer.',
    icon: <DollarSign className="w-4 h-4" />,
    actionLabel: 'Send Invoice',
  },
  FINAL_PAYMENT_REQUIRED: {
    label: 'Collect final payment',
    description: 'Balance due. Send payment link.',
    icon: <DollarSign className="w-4 h-4" />,
    actionLabel: 'Send Payment Link',
  },
  JOB_COMPLETED: {
    label: 'Request customer review',
    description: 'Job complete. Send review request for feedback.',
    icon: <MessageSquare className="w-4 h-4" />,
    actionLabel: 'Send Review Request',
  },
};

interface NextRequiredActionProps {
  stageKey: string;
  onAction?: () => void;
  className?: string;
}

export function NextRequiredAction({ stageKey, onAction, className }: NextRequiredActionProps) {
  const action = STAGE_ACTIONS[stageKey];
  if (!action) return null;

  return (
    <Card className={cn('border-primary/20 bg-primary/[0.02]', className)}>
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {action.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Next Required Action
              </p>
              <p className="text-sm font-semibold truncate">{action.label}</p>
              <p className="text-xs text-muted-foreground truncate">{action.description}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant={action.variant === 'destructive' ? 'destructive' : 'default'}
            className="flex-shrink-0"
            onClick={onAction}
          >
            {action.actionLabel}
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
