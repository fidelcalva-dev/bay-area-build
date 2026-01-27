// ============================================================
// CARD SELECTABLE - Big clickable card with states
// ============================================================
import { cn } from '@/lib/utils';
import { Check, type LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';

interface CardSelectableProps {
  selected?: boolean;
  onClick?: () => void;
  icon?: LucideIcon;
  iconComponent?: React.ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'default' | 'warning' | 'info';
  disabled?: boolean;
  size?: 'default' | 'compact';
  className?: string;
  children?: React.ReactNode;
}

export const CardSelectable = forwardRef<HTMLButtonElement, CardSelectableProps>(({
  selected = false,
  onClick,
  icon: Icon,
  iconComponent,
  title,
  subtitle,
  description,
  badge,
  badgeVariant = 'default',
  disabled = false,
  size = 'default',
  className,
  children,
}, ref) => {
  const badgeStyles = {
    default: 'bg-muted text-muted-foreground',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    info: 'bg-primary/10 text-primary',
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative w-full rounded-xl border-2 text-left transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        size === 'default' ? 'p-4' : 'p-3',
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border hover:border-primary/50 hover:bg-muted/30',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        {(Icon || iconComponent) && (
          <div className={cn(
            'shrink-0 flex items-center justify-center rounded-full',
            size === 'default' ? 'w-12 h-12' : 'w-10 h-10',
            selected ? 'bg-primary/10' : 'bg-muted'
          )}>
            {iconComponent || (Icon && (
              <Icon className={cn(
                size === 'default' ? 'w-5 h-5' : 'w-4 h-4',
                selected ? 'text-primary' : 'text-foreground/70'
              )} />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'font-semibold text-foreground',
              size === 'compact' && 'text-sm'
            )}>
              {title}
            </span>
            {badge && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded font-medium',
                badgeStyles[badgeVariant]
              )}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={cn(
              'text-muted-foreground mt-0.5',
              size === 'default' ? 'text-sm' : 'text-xs'
            )}>
              {subtitle}
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground/80 mt-1">
              {description}
            </p>
          )}
          {children}
        </div>

        {/* Check indicator */}
        {selected && (
          <div className="shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>
    </button>
  );
});

CardSelectable.displayName = 'CardSelectable';

export default CardSelectable;
