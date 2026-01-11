import { useState, useEffect } from 'react';
import { MapPin, Check, AlertCircle, Navigation, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PricingZone } from '@/components/quote/types';

interface ZipLookupProps {
  value: string;
  onChange: (zip: string) => void;
  zone: PricingZone | null;
}

export function ZipLookup({ value, onChange, zone }: ZipLookupProps) {
  const [isValidating, setIsValidating] = useState(false);
  const isComplete = value.length === 5;
  const isValid = isComplete && zone !== null;

  useEffect(() => {
    if (value.length === 5) {
      setIsValidating(true);
      const timer = setTimeout(() => setIsValidating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <MapPin className="w-4 h-4" />
        Service Location
      </label>
      
      <div className="relative">
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 5))}
          placeholder="Enter ZIP code"
          className={cn(
            "w-full px-4 py-4 rounded-xl border-2 bg-background text-lg font-semibold",
            "placeholder:font-normal placeholder:text-muted-foreground",
            "focus:outline-none transition-all duration-200",
            isComplete && !isValid && "border-destructive focus:border-destructive",
            isComplete && isValid && "border-success focus:border-success",
            !isComplete && "border-input focus:border-primary"
          )}
        />
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isValidating && (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          {!isValidating && isComplete && (
            <span className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              isValid ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
            )}>
              {isValid ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </span>
          )}
        </div>
      </div>

      {/* Zone info */}
      {isComplete && !isValidating && (
        <div className={cn(
          "rounded-lg p-3 flex items-start gap-3",
          isValid ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"
        )}>
          {isValid && zone ? (
            <>
              <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{zone.name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                  {zone.distanceMiles && (
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5" />
                      ~{zone.distanceMiles} miles
                    </span>
                  )}
                  {zone.estimatedMinutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      ~{zone.estimatedMinutes} min
                    </span>
                  )}
                </div>
                <p className="text-xs text-success font-medium mt-1">✓ Same-day delivery available</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Outside Service Area</p>
                <p className="text-sm text-muted-foreground">
                  We don't currently serve this ZIP. Call us for special arrangements.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
