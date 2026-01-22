import { DollarSign, Calendar, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MobileInvoiceCardProps {
  invoice: {
    id: string;
    invoice_number: string;
    amount_due: number;
    amount_paid: number;
    balance_due: number;
    payment_status: string;
    due_date?: string | null;
    created_at: string;
  };
  onView: () => void;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  unpaid: 'bg-red-100 text-red-800',
  overdue: 'bg-red-100 text-red-800',
};

export function MobileInvoiceCard({ 
  invoice, 
  onView, 
  onPrimaryAction, 
  primaryActionLabel 
}: MobileInvoiceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isOverdue = invoice.due_date && 
    new Date(invoice.due_date) < new Date() && 
    invoice.payment_status !== 'paid';

  return (
    <Card className="p-4 active:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Status badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge className={STATUS_COLORS[isOverdue ? 'overdue' : invoice.payment_status] || 'bg-muted'}>
              {isOverdue ? 'Overdue' : invoice.payment_status}
            </Badge>
          </div>

          {/* Invoice number */}
          <p className="text-sm font-medium">{invoice.invoice_number}</p>

          {/* Balance */}
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(invoice.balance_due)}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                of {formatCurrency(invoice.amount_due)}
              </span>
            </div>
          </div>

          {/* Due date */}
          {invoice.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                Due {formatDate(invoice.due_date)}
              </span>
            </div>
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={onView}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Primary action */}
      {onPrimaryAction && primaryActionLabel && invoice.balance_due > 0 && (
        <Button 
          className="w-full mt-3" 
          size="sm"
          onClick={(e) => { e.stopPropagation(); onPrimaryAction(); }}
        >
          {primaryActionLabel}
        </Button>
      )}
    </Card>
  );
}
