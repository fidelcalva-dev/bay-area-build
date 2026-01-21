// Office Status Indicator - Shows real-time open/closed status
import { cn } from '@/lib/utils';
import { useOfficeStatus } from '@/hooks/useOfficeStatus';
import { useLanguage } from '@/contexts/LanguageContext';

interface OfficeStatusIndicatorProps {
  variant?: 'default' | 'compact' | 'badge' | 'inline';
  className?: string;
  showIcon?: boolean;
}

/**
 * Real-time office status indicator with different display variants
 * 
 * - default: Full text with colored dot
 * - compact: Just the dot and short status
 * - badge: Pill-style badge
 * - inline: Inline text for embedding in other components
 */
export function OfficeStatusIndicator({ 
  variant = 'default', 
  className,
  showIcon = true,
}: OfficeStatusIndicatorProps) {
  const { isOpen, statusText, statusTextEs } = useOfficeStatus();
  const { language } = useLanguage();
  
  const text = language === 'es' ? statusTextEs : statusText;
  
  // Dot indicator
  const StatusDot = () => (
    <span 
      className={cn(
        "w-2 h-2 rounded-full shrink-0",
        isOpen 
          ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" 
          : "bg-amber-500"
      )} 
    />
  );

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        {showIcon && <StatusDot />}
        <span className={cn(
          "text-xs font-medium",
          isOpen ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
        )}>
          {isOpen ? (language === 'es' ? 'Abierto' : 'Open') : (language === 'es' ? 'Cerrado' : 'Closed')}
        </span>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        isOpen 
          ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border border-green-200 dark:border-green-800" 
          : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
        className
      )}>
        {showIcon && <StatusDot />}
        {text}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        isOpen ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400",
        className
      )}>
        {showIcon && <StatusDot />}
        {text}
      </span>
    );
  }

  // Default variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && <StatusDot />}
      <span className={cn(
        "text-sm font-medium",
        isOpen ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
      )}>
        {text}
      </span>
    </div>
  );
}

export default OfficeStatusIndicator;
