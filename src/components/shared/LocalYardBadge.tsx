import { MapPin, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LocalYardBadgeProps {
  yardName: string;
  distanceMiles?: number;
  cityName?: string;
  variant?: 'inline' | 'card' | 'minimal';
  className?: string;
}

export function LocalYardBadge({ 
  yardName, 
  distanceMiles, 
  cityName,
  variant = 'inline',
  className 
}: LocalYardBadgeProps) {
  const tooltipContent = cityName 
    ? `This price is based on distance from our ${cityName} yard.`
    : 'Unlike brokers, pricing is based on real availability from nearby yards.';

  if (variant === 'minimal') {
    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 text-xs text-primary font-medium",
        className
      )}>
        <MapPin className="w-3 h-3" />
        Local Yard Selected
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        "bg-success/10 border border-success/20 rounded-lg p-3 flex items-start gap-3",
        className
      )}>
        <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-success text-sm">Local Yard Selected</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {distanceMiles 
              ? `Dispatched from ${yardName} • ${distanceMiles.toFixed(1)} mi away`
              : `Dispatched from ${yardName}`
            }
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[250px]">
            <p className="text-xs">{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // Default inline variant
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full text-xs font-medium text-success cursor-help",
          className
        )}>
          <MapPin className="w-3.5 h-3.5" />
          <span>Local Yard Selected</span>
          {distanceMiles && (
            <span className="text-success/70">• {distanceMiles.toFixed(1)} mi</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[250px]">
        <p className="text-xs">{tooltipContent}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// Micro-copy component for quote confirmation
interface ConfirmationYardInfoProps {
  yardName: string;
  distanceMiles: number;
  className?: string;
}

export function ConfirmationYardInfo({ yardName, distanceMiles, className }: ConfirmationYardInfoProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      <MapPin className="w-4 h-4 inline-block mr-1.5 text-primary" />
      You're scheduling from a local yard{' '}
      <strong className="text-foreground">{distanceMiles.toFixed(1)} miles</strong> away ({yardName}).
    </p>
  );
}

// Micro-copy for pricing transparency
interface PricingTransparencyNoteProps {
  className?: string;
}

export function PricingTransparencyNote({ className }: PricingTransparencyNoteProps) {
  return (
    <p className={cn("text-xs text-muted-foreground italic", className)}>
      Unlike brokers, pricing is based on real availability from nearby yards.
    </p>
  );
}
