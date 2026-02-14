// Vendor Payout + Margin by Tier Component

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, Building2 } from 'lucide-react';
import type { PricingTier, TierCalculationResult } from '@/services/pricingTierService';

interface VendorTierPricingProps {
  vendorName: string;
  vendorPayout: number;
  tierResult: TierCalculationResult;
}

function getMarginColor(pct: number): string {
  if (pct >= 30) return 'text-green-700';
  if (pct >= 20) return 'text-amber-700';
  return 'text-red-700';
}

function getMarginBg(pct: number): string {
  if (pct >= 30) return 'bg-green-50';
  if (pct >= 20) return 'bg-amber-50';
  return 'bg-red-50';
}

export function VendorTierPricing({ vendorName, vendorPayout, tierResult }: VendorTierPricingProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <TrendingUp className="h-3.5 w-3.5" />
        Tier Pricing for {vendorName}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {(['BASE', 'CORE', 'PREMIUM'] as PricingTier[]).map(tier => {
          const pricing = tierResult.tiers[tier];
          const marginColor = getMarginColor(pricing.gross_margin_pct);
          const marginBg = getMarginBg(pricing.gross_margin_pct);

          return (
            <div key={tier} className={`p-2 rounded-lg border ${pricing.is_recommended ? 'ring-1 ring-primary border-primary/30' : ''}`}>
              <p className="font-semibold text-[10px] text-muted-foreground mb-1">{tier}</p>
              <div className="space-y-1">
                <div className="p-1 rounded bg-muted/50">
                  <p className="font-bold">${vendorPayout}</p>
                  <p className="text-[9px] text-muted-foreground">Vendor Pay</p>
                </div>
                <div className="p-1 rounded bg-muted/50">
                  <p className="font-bold">${pricing.customer_price.toFixed(0)}</p>
                  <p className="text-[9px] text-muted-foreground">Customer</p>
                </div>
                <div className={`p-1 rounded ${marginBg}`}>
                  <p className={`font-bold ${marginColor}`}>{pricing.gross_margin_pct.toFixed(1)}%</p>
                  <p className="text-[9px] text-muted-foreground">Margin</p>
                </div>
              </div>
              {pricing.is_recommended && (
                <Badge className="bg-primary/10 text-primary border-0 text-[8px] mt-1">
                  Best
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
