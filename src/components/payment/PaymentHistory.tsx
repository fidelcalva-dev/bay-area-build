import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, XCircle, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Payment {
  id: string;
  order_id: string;
  payment_type: string;
  amount: number;
  status: string;
  provider: string;
  transaction_id: string | null;
  card_last_four: string | null;
  card_type: string | null;
  created_at: string;
}

interface PaymentHistoryProps {
  orderId: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  initiated: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-3 h-3" /> },
  authorized: { label: 'Authorized', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" /> },
  captured: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3" /> },
  settled: { label: 'Settled', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3" /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" /> },
  refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-800', icon: <RefreshCw className="w-3 h-3" /> },
  voided: { label: 'Voided', color: 'bg-gray-100 text-gray-800', icon: <XCircle className="w-3 h-3" /> },
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  deposit: 'Deposit',
  balance: 'Balance',
  overage: 'Overage',
};

export function PaymentHistory({ orderId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPayments(data);
      }
      setIsLoading(false);
    }

    fetchPayments();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No payments recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => {
        const statusConfig = STATUS_CONFIG[payment.status] || STATUS_CONFIG.initiated;
        
        return (
          <div
            key={payment.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    ${payment.amount.toFixed(2)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {PAYMENT_TYPE_LABELS[payment.payment_type] || payment.payment_type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(payment.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {payment.card_last_four && (
                    <span className="ml-2">
                      •••• {payment.card_last_four}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Badge className={statusConfig.color}>
              <span className="flex items-center gap-1">
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
