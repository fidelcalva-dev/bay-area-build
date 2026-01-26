import { Check, AlertCircle, Weight, Calendar, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuoteResult } from './types';
import { getOverageInfo } from '@/lib/shared-data';

interface QuoteBreakdownProps {
  quote: QuoteResult;
  compact?: boolean;
  materialType?: 'general' | 'heavy';
  sizeYards?: number;
}

export function QuoteBreakdown({ quote, compact = false, materialType = 'general', sizeYards = 20 }: QuoteBreakdownProps) {
  if (!quote.isValid) {
    return null;
  }

  // Get the correct overage info based on material and size
  const overageInfo = getOverageInfo(materialType, sizeYards);
  const isHeavyMaterial = materialType === 'heavy';

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

      {/* Included info - different display based on material type */}
      <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {isHeavyMaterial ? (
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            Flat Fee – Disposal Included
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <Weight className="w-3 h-3" />
            {quote.includedTons}T Included
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Extra days: ${quote.extraDayCost}/day
        </span>
      </div>
      
      {/* Overage note - different based on material and size */}
      <div className={cn(
        "mt-2 text-xs rounded-md px-2 py-1.5",
        isHeavyMaterial 
          ? "bg-success/10 text-success" 
          : "bg-muted/50 text-muted-foreground"
      )}>
        <span className="flex items-center gap-1">
          {isHeavyMaterial ? (
            <Check className="w-3 h-3 shrink-0" />
          ) : (
            <AlertCircle className="w-3 h-3 shrink-0" />
          )}
          {overageInfo.displayMessage}
        </span>
      </div>

      {/* Heavy material warning */}
      {isHeavyMaterial && (
        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-md px-2 py-1.5">
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            If trash or debris is mixed in, the load may be reclassified.
          </span>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
        <strong>Disclaimer:</strong> This is an estimated quote. Final price confirmed after disposal 
        receipt{!isHeavyMaterial && overageInfo.showTons ? ' based on actual weight' : ''}. Prices include standard delivery & pickup within service area. 
        Additional fees may apply for blocked access{!isHeavyMaterial ? ', overweight loads,' : ''} or prohibited materials.
      </p>
    </div>
  );
}
