// Auto-Suggest Pre-Purchase Extra Tons (Risk-Based Logic)
// Triggers when confidence is "tight" or "overflow" for General 20+ yd
// Note: "tight" = "Might be tight" / "Watch the weight"
//       "overflow" = "Risk of overflow" / "Risk of overweight" (weight-based)

import { useState } from 'react';
import { Scale, Check, X, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ConfidenceLevel } from './SmartRecommendation';

// City-based pricing configuration (can be moved to DB later)
export interface ExtraTonPricing {
  standardRate: number;
  discountPct: number;
  prepurchaseRate: number;
}

// Default pricing (Oakland/San Jose zone)
export const DEFAULT_EXTRA_TON_PRICING: ExtraTonPricing = {
  standardRate: 165,
  discountPct: 0.05,
  prepurchaseRate: 156.75, // 165 * 0.95
};

export interface ExtraTonsRecommendationProps {
  materialType: 'general' | 'heavy';
  sizeYards: number;
  confidence: ConfidenceLevel;
  confidenceLabel: string;
  pricing?: ExtraTonPricing;
  onAddExtraTons: (tons: number) => void;
  onSkip: () => void;
  currentExtraTons?: number;
}

/**
 * Determines if the extra tons recommendation should show
 */
export function shouldShowExtraTonsRecommendation(
  materialType: 'general' | 'heavy',
  sizeYards: number,
  confidence: ConfidenceLevel
): boolean {
  // Only show for general debris 20+ yd
  if (materialType === 'heavy') return false;
  if (sizeYards < 20) return false;
  
  // Only show for risk-based confidence levels
  // "tight" = might be tight / watch the weight
  // "overflow" = risk of overflow (can indicate weight issues too)
  return confidence === 'tight' || confidence === 'overflow';
}

/**
 * Get suggested extra tons based on confidence level
 */
export function getSuggestedExtraTons(confidence: ConfidenceLevel): number {
  switch (confidence) {
    case 'tight':
      return 1; // Soft suggestion - "Might be tight"
    case 'overflow':
      return 2; // Strong suggestion - "Risk of overflow/overweight"
    default:
      return 0;
  }
}

export function ExtraTonsRecommendation({
  materialType,
  sizeYards,
  confidence,
  confidenceLabel,
  pricing = DEFAULT_EXTRA_TON_PRICING,
  onAddExtraTons,
  onSkip,
  currentExtraTons = 0,
}: ExtraTonsRecommendationProps) {
  const suggestedTons = getSuggestedExtraTons(confidence);
  const [selectedTons, setSelectedTons] = useState(suggestedTons);
  
  // Don't render if conditions aren't met
  const shouldShow = shouldShowExtraTonsRecommendation(materialType, sizeYards, confidence);
  if (!shouldShow) return null;
  
  const isStrongSuggestion = confidence === 'overflow';
  const savingsPerTon = pricing.standardRate - pricing.prepurchaseRate;
  const totalSavings = selectedTons * savingsPerTon;
  const totalCost = selectedTons * pricing.prepurchaseRate;
  
  // Calculate savings percentage
  const savingsPct = Math.round(pricing.discountPct * 100);
  
  return (
    <div className={cn(
      "rounded-xl border-2 p-4 transition-all",
      isStrongSuggestion 
        ? "border-amber-500/50 bg-amber-500/5" 
        : "border-primary/30 bg-primary/5"
    )}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          isStrongSuggestion ? "bg-amber-500/20" : "bg-primary/20"
        )}>
          <Scale className={cn(
            "w-5 h-5",
            isStrongSuggestion ? "text-amber-600" : "text-primary"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={cn(
              "font-semibold text-sm",
              isStrongSuggestion ? "text-amber-700 dark:text-amber-400" : "text-foreground"
            )}>
              {isStrongSuggestion ? 'Recommended:' : 'Consider:'} Pre-purchase Extra Tons
            </h4>
            {isStrongSuggestion && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {savingsPct}% SAVINGS
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isStrongSuggestion 
              ? `Your estimate may exceed the included weight by a significant margin.`
              : `Your estimate is close to the included weight limit.`
            }
            {' '}Pre-purchasing extra tons saves {savingsPct}% and helps avoid post-service charges.
          </p>
        </div>
      </div>
      
      {/* Pricing Display */}
      <div className="bg-background/60 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Standard rate:</span>
          <span className="text-foreground line-through opacity-60">${pricing.standardRate}/ton</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Pre-purchase rate:</span>
          <span className="text-primary font-semibold">
            ${pricing.prepurchaseRate.toFixed(2)}/ton
            <span className="ml-1 text-xs text-success">({savingsPct}% off)</span>
          </span>
        </div>
      </div>
      
      {/* Quantity Selector */}
      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm font-medium text-foreground">Extra tons:</label>
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((tons) => (
            <button
              key={tons}
              type="button"
              onClick={() => setSelectedTons(tons)}
              className={cn(
                "w-10 h-10 rounded-lg border-2 font-semibold text-sm transition-all",
                selectedTons === tons
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/50"
              )}
            >
              {tons}
            </button>
          ))}
        </div>
        {selectedTons > 0 && (
          <div className="text-sm ml-auto">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-semibold text-foreground">${totalCost.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      {/* Micro-copy */}
      <p className="text-[11px] text-muted-foreground mb-3 flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        Any unused pre-purchased tons are simply not charged.
      </p>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={selectedTons > 0 ? "default" : "outline"}
          size="sm"
          onClick={() => onAddExtraTons(selectedTons)}
          disabled={selectedTons === 0 && currentExtraTons === 0}
          className="flex-1"
        >
          {selectedTons > 0 ? (
            <>
              <Check className="w-4 h-4 mr-1.5" />
              Add {selectedTons} {selectedTons === 1 ? 'Ton' : 'Tons'}
              {totalSavings > 0 && ` (Save $${totalSavings.toFixed(2)})`}
            </>
          ) : currentExtraTons > 0 ? (
            <>
              <X className="w-4 h-4 mr-1.5" />
              Remove Extra Tons
            </>
          ) : (
            'Select Quantity'
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground"
        >
          Skip for now
        </Button>
      </div>
      
      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border">
        Estimates vary by material and loading. Final billing is confirmed after the disposal scale ticket.
      </p>
    </div>
  );
}

/**
 * Compact badge to show prepurchased tons in the summary
 */
export function PrepurchasedTonsBadge({ 
  tons, 
  rate,
  className 
}: { 
  tons: number; 
  rate: number;
  className?: string;
}) {
  if (tons <= 0) return null;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary",
      className
    )}>
      <Scale className="w-3 h-3" />
      <span>{tons}T pre-purchased @ ${rate.toFixed(2)}/ton</span>
    </div>
  );
}
