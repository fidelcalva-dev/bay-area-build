// 3-Tier Pricing Selector for Internal Calculator

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DollarSign, Star, Zap, Shield, Save, FileText, ShoppingCart,
  AlertTriangle, Lock, CheckCircle2,
} from 'lucide-react';
import type { PricingTier, TierPricing, TierCalculationResult } from '@/services/pricingTierService';

interface TierSelectorProps {
  tierResult: TierCalculationResult;
  userRole: string;
  dumpsterSize: number;
  onSelectTier: (tier: PricingTier, overridePrice?: number, overrideReason?: string) => void;
  onSave: () => void;
  onCreateQuote?: () => void;
  onCreateOrder?: () => void;
  selectedTier?: PricingTier;
}

const TIER_ICONS: Record<PricingTier, React.ReactNode> = {
  BASE: <DollarSign className="h-4 w-4" />,
  CORE: <Star className="h-4 w-4" />,
  PREMIUM: <Zap className="h-4 w-4" />,
};

const TIER_STYLES: Record<PricingTier, { ring: string; badge: string; accent: string }> = {
  BASE: {
    ring: 'ring-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    accent: 'text-blue-700',
  },
  CORE: {
    ring: 'ring-primary',
    badge: 'bg-primary/10 text-primary',
    accent: 'text-primary',
  },
  PREMIUM: {
    ring: 'ring-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    accent: 'text-amber-700',
  },
};

function getMarginColor(pct: number): string {
  if (pct >= 30) return 'text-green-700';
  if (pct >= 20) return 'text-amber-700';
  return 'text-red-700';
}

function getMarginBg(pct: number): string {
  if (pct >= 30) return 'bg-green-100';
  if (pct >= 20) return 'bg-amber-100';
  return 'bg-red-100';
}

function getIncludedTons(size: number): string {
  if (size <= 10) return '0.5–1.0';
  if (size <= 20) return '2.0';
  return `${Math.floor(size / 10)}.0`;
}

export function TierSelector({
  tierResult,
  userRole,
  dumpsterSize,
  onSelectTier,
  onSave,
  onCreateQuote,
  onCreateOrder,
  selectedTier,
}: TierSelectorProps) {
  const [showOverride, setShowOverride] = useState(false);
  const [overridePrice, setOverridePrice] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState('');
  const [activeTier, setActiveTier] = useState<PricingTier>(selectedTier || tierResult.recommended_tier);

  const canSeePricing = userRole !== 'dispatcher';
  const canConvert = userRole === 'admin' || userRole === 'sales';
  const canOverride = userRole === 'admin';

  if (!canSeePricing) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-5 w-5" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Pricing details are restricted for this role.</p>
        </CardContent>
      </Card>
    );
  }

  const handleTierClick = (tier: PricingTier) => {
    setActiveTier(tier);
    setShowOverride(false);
    onSelectTier(tier);
  };

  const handleOverrideApply = () => {
    if (overridePrice > 0 && overrideReason.trim()) {
      onSelectTier(activeTier, overridePrice, overrideReason);
      setShowOverride(false);
    }
  };

  const activePricing = tierResult.tiers[activeTier];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5" />
            Recommended Customer Quote
          </CardTitle>
          {tierResult.surcharges_applied > 0 && (
            <Badge variant="outline" className="text-[10px]">
              +${tierResult.surcharges_applied} surcharges
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3 Tier Cards */}
        <div className="grid grid-cols-3 gap-2">
          {(['BASE', 'CORE', 'PREMIUM'] as PricingTier[]).map(tier => {
            const pricing = tierResult.tiers[tier];
            const styles = TIER_STYLES[tier];
            const isActive = activeTier === tier;
            const marginColor = getMarginColor(pricing.gross_margin_pct);
            const marginBg = getMarginBg(pricing.gross_margin_pct);

            return (
              <button
                key={tier}
                type="button"
                onClick={() => handleTierClick(tier)}
                className={`relative p-3 rounded-lg border-2 text-left transition-all ${
                  isActive
                    ? `${styles.ring} ring-2 border-transparent`
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                {/* Recommended badge */}
                {pricing.is_recommended && (
                  <Badge className={`${styles.badge} border-0 absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0`}>
                    Recommended
                  </Badge>
                )}

                <div className="flex items-center gap-1.5 mb-2 mt-1">
                  {TIER_ICONS[tier]}
                  <span className={`text-xs font-semibold ${isActive ? styles.accent : 'text-muted-foreground'}`}>
                    {tier}
                  </span>
                </div>

                <p className="text-xl font-bold">${pricing.customer_price.toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{pricing.label}</p>

                <div className={`mt-2 px-1.5 py-0.5 rounded text-[10px] font-medium inline-block ${marginBg} ${marginColor}`}>
                  {pricing.gross_margin_pct.toFixed(1)}% margin
                </div>

                {isActive && (
                  <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected tier details */}
        <div className="p-3 rounded-lg border bg-muted/30 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer Price</span>
            <span className="font-medium">${activePricing.customer_price.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Internal Cost</span>
            <span className="font-medium">${activePricing.internal_cost.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gross Margin</span>
            <span className={`font-medium ${getMarginColor(activePricing.gross_margin_pct)}`}>
              ${activePricing.gross_margin_dollars.toFixed(0)} ({activePricing.gross_margin_pct.toFixed(1)}%)
            </span>
          </div>
          {activePricing.surcharges > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Surcharges Included</span>
              <span className="font-medium">${activePricing.surcharges}</span>
            </div>
          )}
          <Separator className="my-1" />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Included Tons</span>
            <span className="font-medium">{getIncludedTons(dumpsterSize)} ton</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Included Days</span>
            <span className="font-medium">7 days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Overage Rate</span>
            <span className="font-medium">$165/ton</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Extra Day</span>
            <span className="font-medium">$35/day</span>
          </div>
        </div>

        {/* Guardrail warning */}
        {activePricing.gross_margin_pct < 20 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Margin below 20% — requires manager approval before proceeding.
            </AlertDescription>
          </Alert>
        )}

        {/* Risk flags summary */}
        {(tierResult.risk_flags.is_same_day || tierResult.risk_flags.is_heavy_risk || tierResult.risk_flags.is_tight_access || tierResult.risk_flags.is_low_inventory) && (
          <div className="flex flex-wrap gap-1.5">
            {tierResult.risk_flags.is_same_day && (
              <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">Same-Day</Badge>
            )}
            {tierResult.risk_flags.is_heavy_risk && (
              <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">Heavy Risk</Badge>
            )}
            {tierResult.risk_flags.is_tight_access && (
              <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200">Tight Access</Badge>
            )}
            {tierResult.risk_flags.is_low_inventory && (
              <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">Low Inventory</Badge>
            )}
          </div>
        )}

        {/* Admin Override */}
        {canOverride && (
          <>
            {!showOverride ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => {
                  setOverridePrice(activePricing.customer_price);
                  setShowOverride(true);
                }}
              >
                <Shield className="h-3 w-3 mr-1" />
                Admin Override
              </Button>
            ) : (
              <div className="p-3 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 space-y-3">
                <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Admin Price Override
                </p>
                <div className="space-y-1.5">
                  <Label className="text-xs">Custom Price ($)</Label>
                  <Input
                    type="number"
                    value={overridePrice}
                    onChange={(e) => setOverridePrice(parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Reason (required for audit)</Label>
                  <Textarea
                    placeholder="Reason for override..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                </div>
                {overridePrice > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Override margin: {((overridePrice - activePricing.internal_cost) / overridePrice * 100).toFixed(1)}%
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" className="text-xs" onClick={handleOverrideApply} disabled={!overrideReason.trim()}>
                    Apply Override
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowOverride(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={onSave} variant="outline" size="sm">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save Estimate
          </Button>
          {canConvert && onCreateQuote && (
            <Button onClick={onCreateQuote} variant="outline" size="sm">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Create Quote
            </Button>
          )}
          {canConvert && onCreateOrder && (
            <Button onClick={onCreateOrder} size="sm">
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              Create Order
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
