import { Check, AlertCircle, Weight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuoteResult } from './types';

interface QuoteBreakdownProps {
  quote: QuoteResult;
  compact?: boolean;
}

export function QuoteBreakdown({ quote, compact = false }: QuoteBreakdownProps) {
  if (!quote.isValid) {
    return null;
  }

  return (
    <div className={cn(
      "bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-border",
      compact ? "p-3" : "p-4"
    )}>
      {!compact && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-primary" />
          </div>
          <h4 className="font-semibold text-foreground">Quote Breakdown</h4>
        </div>
      )}

      <div className="space-y-2">
        {quote.lineItems.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              "flex justify-between items-start gap-2",
              item.type === 'discount' && "text-success"
            )}
          >
            <div className="flex-1 min-w-0">
              <div className={cn(
                "text-sm",
                item.type === 'base' ? "font-medium text-foreground" : "text-foreground"
              )}>
                {item.label}
              </div>
              {item.subLabel && (
                <div className="text-xs text-muted-foreground">{item.subLabel}</div>
              )}
            </div>
            <div className={cn(
              "text-sm font-medium shrink-0",
              item.type === 'discount' ? "text-success" : "text-foreground"
            )}>
              {item.type === 'discount' ? '-' : ''}${Math.abs(item.amount)}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-border/60 my-3" />

      {/* Total */}
      <div className="flex justify-between items-end">
        <div>
          <div className="text-xs text-muted-foreground">Estimated Total</div>
          <div className="text-2xl font-extrabold text-foreground">
            ${quote.estimatedMin}
            <span className="text-base font-medium text-muted-foreground">
              –${quote.estimatedMax}
            </span>
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="text-success font-semibold">✓ All-inclusive</div>
          <div className="text-muted-foreground">Delivery + Pickup</div>
        </div>
      </div>

      {/* Included info */}
      <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Weight className="w-3 h-3" />
          {quote.includedTons}T included
        </span>
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Overage: ${quote.overageCostPerTon}/ton
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Extra days: ${quote.extraDayCost}/day
        </span>
      </div>

      {/* Disclaimer */}
      <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
        * Final price may vary based on actual weight. Prices include standard delivery & pickup 
        within service area. Additional fees apply for blocked access or overweight loads.
      </p>
    </div>
  );
}
