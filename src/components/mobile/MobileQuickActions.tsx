import { useState } from 'react';
import { 
  MoreVertical, Phone, MessageSquare, Copy, 
  StickyNote, CheckCircle, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'success';
  disabled?: boolean;
}

interface MobileQuickActionsProps {
  customerPhone?: string | null;
  address?: string | null;
  orderId?: string;
  onConfirm?: () => void;
  onAddNote?: () => void;
  extraActions?: QuickAction[];
}

export function MobileQuickActions({
  customerPhone,
  address,
  orderId,
  onConfirm,
  onAddNote,
  extraActions = [],
}: MobileQuickActionsProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
    setOpen(false);
  };

  const callCustomer = () => {
    if (customerPhone) {
      window.location.href = `tel:${customerPhone}`;
    }
    setOpen(false);
  };

  const textCustomer = () => {
    if (customerPhone) {
      window.location.href = `sms:${customerPhone}`;
    }
    setOpen(false);
  };

  const actions: QuickAction[] = [
    ...(customerPhone ? [
      {
        icon: <Phone className="w-5 h-5" />,
        label: 'Call Customer',
        onClick: callCustomer,
      },
      {
        icon: <MessageSquare className="w-5 h-5" />,
        label: 'Text Customer',
        onClick: textCustomer,
      },
    ] : []),
    ...(address ? [
      {
        icon: <Copy className="w-5 h-5" />,
        label: 'Copy Address',
        onClick: () => copyToClipboard(address, 'Address'),
      },
    ] : []),
    ...(orderId ? [
      {
        icon: <Copy className="w-5 h-5" />,
        label: 'Copy Order ID',
        onClick: () => copyToClipboard(orderId, 'Order ID'),
      },
    ] : []),
    ...(onConfirm ? [
      {
        icon: <CheckCircle className="w-5 h-5" />,
        label: 'Mark Confirmed',
        onClick: () => { onConfirm(); setOpen(false); },
        variant: 'success' as const,
      },
    ] : []),
    ...(onAddNote ? [
      {
        icon: <StickyNote className="w-5 h-5" />,
        label: 'Add Note',
        onClick: () => { onAddNote(); setOpen(false); },
      },
    ] : []),
    ...extraActions,
  ];

  if (actions.length === 0) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <MoreVertical className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="mb-4">
          <SheetTitle>Quick Actions</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-1 gap-2 pb-4">
          {actions.map((action, i) => (
            <Button
              key={i}
              variant="outline"
              className={`w-full justify-start h-12 ${
                action.variant === 'success' ? 'border-green-500 text-green-700 hover:bg-green-50' :
                action.variant === 'destructive' ? 'border-red-500 text-red-700 hover:bg-red-50' : ''
              }`}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon}
              <span className="ml-3">{action.label}</span>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
