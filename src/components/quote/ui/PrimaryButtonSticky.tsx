// ============================================================
// PRIMARY BUTTON STICKY - Fixed CTA for mobile Step 4
// ============================================================
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { type LucideIcon } from 'lucide-react';

interface PrimaryButtonStickyProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  show?: boolean;
  className?: string;
}

export function PrimaryButtonSticky({
  label,
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  show = true,
  className,
}: PrimaryButtonStickyProps) {
  if (!show) return null;

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border',
      'md:hidden', // Only show on mobile
      'z-50',
      className
    )}>
      <Button
        variant="cta"
        size="lg"
        className="w-full h-14 text-base shadow-lg"
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading ? (
          <span className="animate-pulse">Processing...</span>
        ) : (
          <>
            {Icon && <Icon className="w-5 h-5" />}
            {label}
          </>
        )}
      </Button>
      
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
}

export default PrimaryButtonSticky;
