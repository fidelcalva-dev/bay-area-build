/**
 * MobileStickyAction — Fixed bottom CTA bar for mobile workflows.
 * Shows only on mobile screens. Includes safe area padding.
 */
import { Button } from '@/components/ui/button';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileStickyActionProps {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'cta' | 'destructive';
  className?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

export function MobileStickyAction({
  label,
  onClick,
  icon: Icon,
  disabled = false,
  loading = false,
  variant = 'default',
  className,
  secondaryAction,
}: MobileStickyActionProps) {
  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-50 md:hidden',
      'bg-background/95 backdrop-blur-sm border-t border-border',
      'p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]',
      className,
    )}>
      <div className="flex gap-2">
        {secondaryAction && (
          <Button
            variant="outline"
            size="lg"
            className="h-12 flex-1"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4 mr-1.5" />}
            {secondaryAction.label}
          </Button>
        )}
        <Button
          variant={variant === 'cta' ? 'default' : variant}
          size="lg"
          className={cn('h-12 min-h-[44px]', secondaryAction ? 'flex-[2]' : 'w-full')}
          onClick={onClick}
          disabled={disabled || loading}
        >
          {loading ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <>
              {Icon && <Icon className="w-5 h-5 mr-1.5" />}
              {label}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
