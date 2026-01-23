/**
 * Fit Indicator - Visual feedback for "Will it fit?" calculation
 */
import { cn } from '@/lib/utils';
import { FitResult } from './constants';
import { CheckCircle, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FitIndicatorProps {
  result: FitResult;
  onSelectRecommended?: (size: number) => void;
  className?: string;
}

export function FitIndicator({ result, onSelectRecommended, className }: FitIndicatorProps) {
  const { status, label, message, recommendedSize } = result;
  
  const statusConfig = {
    fits: {
      icon: CheckCircle,
      bg: 'bg-success/10',
      border: 'border-success/30',
      iconColor: 'text-success',
      labelColor: 'text-success',
    },
    tight: {
      icon: AlertTriangle,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-500',
      labelColor: 'text-amber-600 dark:text-amber-400',
    },
    overflow: {
      icon: XCircle,
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      iconColor: 'text-destructive',
      labelColor: 'text-destructive',
    },
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <div className={cn(
      "rounded-xl border p-4",
      config.bg,
      config.border,
      className
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn("w-6 h-6 shrink-0 mt-0.5", config.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold text-base", config.labelColor)}>
            {label}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {message}
          </p>
          
          {recommendedSize && onSelectRecommended && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => onSelectRecommended(recommendedSize)}
            >
              Try {recommendedSize}-yard instead
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
