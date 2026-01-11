import { Plus, Minus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXTRAS } from '@/components/quote/constants';
import type { ExtraSelection } from '@/components/quote/types';

interface ExtrasSelectorProps {
  value: ExtraSelection[];
  onChange: (extras: ExtraSelection[]) => void;
}

export function ExtrasSelector({ value, onChange }: ExtrasSelectorProps) {
  const getQuantity = (id: string) => {
    const selection = value.find((e) => e.id === id);
    return selection?.quantity || 0;
  };

  const updateQuantity = (id: string, delta: number) => {
    const extra = EXTRAS.find((e) => e.id === id);
    if (!extra) return;

    const currentQty = getQuantity(id);
    const newQty = Math.max(0, Math.min(extra.maxQuantity || 10, currentQty + delta));

    if (newQty === 0) {
      onChange(value.filter((e) => e.id !== id));
    } else {
      const existing = value.find((e) => e.id === id);
      if (existing) {
        onChange(value.map((e) => (e.id === id ? { ...e, quantity: newQty } : e)));
      } else {
        onChange([...value, { id, quantity: newQty }]);
      }
    }
  };

  const toggleExtra = (id: string) => {
    const extra = EXTRAS.find((e) => e.id === id);
    if (!extra) return;

    if (extra.allowQuantity) {
      if (getQuantity(id) > 0) {
        onChange(value.filter((e) => e.id !== id));
      } else {
        onChange([...value, { id, quantity: 1 }]);
      }
    } else {
      if (getQuantity(id) > 0) {
        onChange(value.filter((e) => e.id !== id));
      } else {
        onChange([...value, { id, quantity: 1 }]);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Plus className="w-4 h-4" />
        Add Extras <span className="font-normal text-muted-foreground">(optional)</span>
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {EXTRAS.map((extra) => {
          const qty = getQuantity(extra.id);
          const isSelected = qty > 0;
          
          return (
            <div
              key={extra.id}
              className={cn(
                "relative p-3 rounded-xl border-2 transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-input bg-background hover:border-primary/50"
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleExtra(extra.id)}
                  className="text-2xl shrink-0"
                >
                  {extra.icon}
                </button>
                
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleExtra(extra.id)}
                    className="text-left w-full"
                  >
                    <div className="font-medium text-foreground text-sm">{extra.label}</div>
                    <div className="text-xs text-muted-foreground">{extra.description}</div>
                  </button>
                </div>
                
                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold text-foreground">
                    ${extra.price}
                    {extra.allowQuantity && <span className="text-muted-foreground font-normal">/ea</span>}
                  </div>
                  
                  {extra.allowQuantity ? (
                    <div className="flex items-center gap-1 mt-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(extra.id, -1)}
                        disabled={qty === 0}
                        className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center transition-colors",
                          qty > 0
                            ? "bg-muted text-foreground hover:bg-muted/80"
                            : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      
                      <span className={cn(
                        "w-6 text-center text-sm font-semibold",
                        qty > 0 ? "text-primary" : "text-muted-foreground"
                      )}>
                        {qty}
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => updateQuantity(extra.id, 1)}
                        disabled={qty >= (extra.maxQuantity || 10)}
                        className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center transition-colors",
                          qty < (extra.maxQuantity || 10)
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleExtra(extra.id)}
                      className={cn(
                        "mt-1.5 w-6 h-6 rounded-md flex items-center justify-center transition-colors ml-auto",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
