import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, Sparkles, RefreshCw } from 'lucide-react';
import type { Order, Quote } from './types';

interface ServiceLineSummaryProps {
  customerServiceLine: string | null;
  orders: Order[];
  quotes: Quote[];
}

export function ServiceLineSummary({ customerServiceLine, orders, quotes }: ServiceLineSummaryProps) {
  // Determine active service lines from orders/quotes
  const hasAnyData = orders.length > 0 || quotes.length > 0;
  
  const serviceLine = customerServiceLine || 'DUMPSTER';
  
  const serviceLineLabel = serviceLine === 'BOTH' ? 'Bundle (Dumpster + Cleanup)' 
    : serviceLine === 'CLEANUP' ? 'Cleanup' 
    : 'Dumpster Rental';

  const serviceLineColor = serviceLine === 'BOTH' 
    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    : serviceLine === 'CLEANUP'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          Service Line
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className={serviceLineColor}>{serviceLineLabel}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Orders:</span>
            <span className="font-medium">{orders.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Quotes:</span>
            <span className="font-medium">{quotes.length}</span>
          </div>
        </div>

        {!hasAnyData && (
          <p className="text-xs text-muted-foreground">No orders or quotes yet</p>
        )}
      </CardContent>
    </Card>
  );
}
