import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RENTAL_PERIODS } from '@/components/quote/constants';

interface RentalDurationProps {
  value: number;
  onChange: (days: number) => void;
}

export function RentalDuration({ value, onChange }: RentalDurationProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Calendar className="w-4 h-4" />
        Rental Duration
      </label>
      
      <div className="grid grid-cols-4 gap-2">
        {RENTAL_PERIODS.map((period) => (
          <button
            key={period.value}
            type="button"
            onClick={() => onChange(period.value)}
            className={cn(
              "relative py-3 px-2 rounded-xl border-2 text-center transition-all duration-200",
              "flex flex-col items-center justify-center gap-1",
              "hover:shadow-md",
              value === period.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-input bg-background hover:border-primary/50"
            )}
          >
            {period.popular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-success text-success-foreground text-[10px] font-bold rounded-full whitespace-nowrap">
                STD
              </span>
            )}
            
            <span className={cn(
              "text-sm font-semibold",
              value === period.value ? "text-primary" : "text-foreground"
            )}>
              {period.label}
            </span>
            
            {period.extraCost > 0 && (
              <span className="text-[10px] text-muted-foreground">+${period.extraCost}</span>
            )}
            
            {value === period.value && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
