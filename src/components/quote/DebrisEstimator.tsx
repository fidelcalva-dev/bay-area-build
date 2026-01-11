import { useState, useMemo } from 'react';
import { X, HelpCircle, Package, ArrowRight, Minus, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DEBRIS_ITEMS, DUMPSTER_SIZES, SIZE_RECOMMENDATIONS } from './constants';
import type { DebrisItem } from './types';

interface DebrisEstimatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: number, isHeavy: boolean) => void;
}

export function DebrisEstimator({ isOpen, onClose, onSelectSize }: DebrisEstimatorProps) {
  const [selections, setSelections] = useState<Record<string, number>>({});

  const updateQuantity = (itemId: string, delta: number) => {
    setSelections((prev) => {
      const current = prev[itemId] || 0;
      const newQty = Math.max(0, current + delta);
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const estimate = useMemo(() => {
    let totalWeight = 0;
    let totalVolume = 0;
    let hasHeavy = false;

    Object.entries(selections).forEach(([itemId, qty]) => {
      const item = DEBRIS_ITEMS.find((d) => d.id === itemId);
      if (item && qty > 0) {
        totalWeight += item.weightPerUnit * qty;
        totalVolume += item.volumePerUnit * qty;
        if (item.category === 'Heavy') {
          hasHeavy = true;
        }
      }
    });

    const tonsEstimate = totalWeight / 2000;

    // Find recommended size
    let recommendedSize = 10;
    for (const rec of SIZE_RECOMMENDATIONS) {
      if (totalVolume <= rec.maxVolume) {
        recommendedSize = rec.size;
        break;
      }
    }

    // If heavy materials, cap at 10 yard
    if (hasHeavy && recommendedSize > 10) {
      recommendedSize = 10;
    }

    // Round up for safety margin
    if (totalVolume > 0 && totalVolume > recommendedSize * 0.8) {
      const currentIdx = SIZE_RECOMMENDATIONS.findIndex((r) => r.size === recommendedSize);
      if (currentIdx < SIZE_RECOMMENDATIONS.length - 1 && !hasHeavy) {
        recommendedSize = SIZE_RECOMMENDATIONS[currentIdx + 1].size;
      }
    }

    return {
      totalWeight,
      totalVolume: Math.round(totalVolume * 10) / 10,
      tonsEstimate: Math.round(tonsEstimate * 10) / 10,
      recommendedSize,
      isHeavy: hasHeavy,
    };
  }, [selections]);

  const hasItems = Object.keys(selections).length > 0;
  
  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, DebrisItem[]> = {};
    DEBRIS_ITEMS.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-card rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Debris Weight Estimator</h3>
              <p className="text-xs text-muted-foreground">Select items to find the right size</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {category}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {items.map((item) => {
                  const qty = selections[item.id] || 0;
                  const isSelected = qty > 0;
                  
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "p-2.5 rounded-lg border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-input bg-background"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            ~{item.weightPerUnit} lbs/{item.unit}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={qty === 0}
                          className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
                            qty > 0
                              ? "bg-muted text-foreground hover:bg-muted/80"
                              : "bg-muted/30 text-muted-foreground cursor-not-allowed"
                          )}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        
                        <span className={cn(
                          "w-8 text-center text-sm font-bold",
                          qty > 0 ? "text-primary" : "text-muted-foreground"
                        )}>
                          {qty}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Results Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 space-y-3">
          {hasItems ? (
            <>
              {/* Estimate stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Volume</div>
                  <div className="text-sm font-bold text-foreground">{estimate.totalVolume} yd³</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Weight</div>
                  <div className="text-sm font-bold text-foreground">{Math.round(estimate.totalWeight).toLocaleString()} lbs</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Tons</div>
                  <div className="text-sm font-bold text-foreground">~{estimate.tonsEstimate}T</div>
                </div>
              </div>

              {/* Recommendation */}
              <div className={cn(
                "p-3 rounded-lg flex items-center gap-3",
                estimate.isHeavy ? "bg-amber-500/10 border border-amber-500/30" : "bg-success/10 border border-success/30"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                  estimate.isHeavy ? "bg-amber-500/20" : "bg-success/20"
                )}>
                  <Package className={cn(
                    "w-6 h-6",
                    estimate.isHeavy ? "text-amber-600" : "text-success"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground">
                    Recommended: {estimate.recommendedSize} Yard
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {DUMPSTER_SIZES.find((s) => s.value === estimate.recommendedSize)?.description}
                  </div>
                  {estimate.isHeavy && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      Heavy materials detected
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="cta"
                className="w-full gap-2"
                onClick={() => {
                  onSelectSize(estimate.recommendedSize, estimate.isHeavy);
                  onClose();
                }}
              >
                Use This Size
                <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Add items above to get a size recommendation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
