import { useState, useEffect } from 'react';
import { Loader2, Package, AlertTriangle, Minus, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceLineItem {
  id: string;
  line_type: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface InvoiceLineItemsProps {
  orderId: string;
}

export function InvoiceLineItems({ orderId }: InvoiceLineItemsProps) {
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLineItems();
  }, [orderId]);

  const fetchLineItems = async () => {
    try {
      // Use raw query since types may not be updated yet
      const { data, error } = await (supabase as any)
        .from('invoice_line_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLineItems((data as InvoiceLineItem[]) || []);
    } catch (error) {
      console.error('Failed to fetch line items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getLineIcon = (type: string) => {
    switch (type) {
      case 'overage':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'discount':
        return <Minus className="w-4 h-4 text-green-600" />;
      case 'extra':
        return <Plus className="w-4 h-4 text-blue-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLineStyle = (type: string) => {
    switch (type) {
      case 'overage':
        return 'bg-amber-50 border-amber-200';
      case 'discount':
        return 'bg-green-50 border-green-200';
      case 'prepurchase':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (lineItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Invoice Details</p>
      <div className="space-y-2">
        {lineItems.map((item) => (
          <div 
            key={item.id} 
            className={`flex items-start justify-between p-3 rounded-lg border ${getLineStyle(item.line_type)}`}
          >
            <div className="flex items-start gap-2">
              {getLineIcon(item.line_type)}
              <div>
                <p className="text-sm font-medium capitalize">{item.line_type}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <span className={`text-sm font-semibold ${item.line_type === 'discount' ? 'text-green-600' : item.line_type === 'overage' ? 'text-amber-700' : ''}`}>
              {item.line_type === 'discount' ? '-' : ''}{formatCurrency(item.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
