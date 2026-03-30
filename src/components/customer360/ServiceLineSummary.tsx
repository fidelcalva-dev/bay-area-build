import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, Sparkles, RefreshCw, HardHat, Layers } from 'lucide-react';
import type { Order, Quote } from './types';

interface ServiceLineSummaryProps {
  customerServiceLine: string | null;
  orders: Order[];
  quotes: Quote[];
}

export function ServiceLineSummary({ customerServiceLine, orders, quotes }: ServiceLineSummaryProps) {
  const serviceLine = customerServiceLine || 'DUMPSTER';

  // Derive service activity from quotes
  const dumpsterQuotes = quotes.filter(q => !q.material_type?.toLowerCase().includes('cleanup'));
  const cleanupQuotes = quotes.filter(q => q.material_type?.toLowerCase().includes('cleanup'));
  const hasDumpster = dumpsterQuotes.length > 0 || serviceLine === 'DUMPSTER' || serviceLine === 'BOTH';
  const hasCleanup = cleanupQuotes.length > 0 || serviceLine === 'CLEANUP' || serviceLine === 'BOTH';
  const isBundle = (hasDumpster && hasCleanup) || serviceLine === 'BOTH';

  const latestDumpsterQuote = dumpsterQuotes[0];
  const latestCleanupQuote = cleanupQuotes[0];

  const serviceLineLabel = isBundle ? 'Bundle (Dumpster + Cleanup)'
    : hasCleanup ? 'Cleanup'
    : 'Dumpster Rental';

  const serviceLineColor = isBundle
    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    : hasCleanup
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          Service Line Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Service Lines */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={serviceLineColor}>{serviceLineLabel}</Badge>
          {hasDumpster && (
            <Badge variant="outline" className="text-xs gap-1">
              <Truck className="w-3 h-3" /> Dumpster
            </Badge>
          )}
          {hasCleanup && (
            <Badge variant="outline" className="text-xs gap-1">
              <HardHat className="w-3 h-3" /> Cleanup
            </Badge>
          )}
          {isBundle && (
            <Badge variant="outline" className="text-xs gap-1 border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300">
              <Layers className="w-3 h-3" /> Bundle Opportunity
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Dumpster</p>
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{orders.length} orders</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{dumpsterQuotes.length} quotes</span>
            </div>
            {latestDumpsterQuote && (
              <p className="text-xs text-muted-foreground">
                Latest: {latestDumpsterQuote.status} — ${latestDumpsterQuote.subtotal?.toFixed(0) || '0'}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Cleanup</p>
            <div className="flex items-center gap-2">
              <HardHat className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{cleanupQuotes.length} quotes</span>
            </div>
            {latestCleanupQuote && (
              <p className="text-xs text-muted-foreground">
                Latest: {latestCleanupQuote.status} — ${latestCleanupQuote.subtotal?.toFixed(0) || '0'}
              </p>
            )}
            {!hasCleanup && (
              <p className="text-xs text-muted-foreground italic">No cleanup activity</p>
            )}
          </div>
        </div>

        {/* No data state */}
        {orders.length === 0 && quotes.length === 0 && (
          <p className="text-xs text-muted-foreground">No orders or quotes yet</p>
        )}
      </CardContent>
    </Card>
  );
}
