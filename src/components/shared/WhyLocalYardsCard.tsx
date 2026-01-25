import { MapPin, Truck, DollarSign, Clock, Shield } from 'lucide-react';
import { LOCAL_YARD_BENEFITS } from '@/lib/categoryPositioning';
import { cn } from '@/lib/utils';

interface WhyLocalYardsCardProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const ICONS = {
  'faster-delivery': Clock,
  'real-availability': MapPin,
  'lower-cost': DollarSign,
  'fewer-surprises': Shield,
  'better-accountability': Truck,
} as const;

export function WhyLocalYardsCard({ variant = 'compact', className }: WhyLocalYardsCardProps) {
  if (variant === 'compact') {
    return (
      <div className={cn(
        "bg-primary/5 border border-primary/10 rounded-xl p-4",
        className
      )}>
        <h4 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Why Local Yards Matter
        </h4>
        <ul className="space-y-1.5">
          {LOCAL_YARD_BENEFITS.slice(0, 4).map((benefit) => (
            <li key={benefit.id} className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
              {benefit.shortText}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={cn("bg-card border border-border rounded-2xl p-6 md:p-8", className)}>
      <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        Why Local Yards Matter
      </h3>
      <div className="grid gap-4">
        {LOCAL_YARD_BENEFITS.map((benefit) => {
          const Icon = ICONS[benefit.id as keyof typeof ICONS] || MapPin;
          return (
            <div key={benefit.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">{benefit.title}</h4>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
