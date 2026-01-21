// Standardized Icon Circle Component
// Clean outline icons inside a light circular container
// Modern SaaS/app look with consistent styling

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type IconCircleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type IconCircleVariant = 'default' | 'primary' | 'muted' | 'success' | 'warning' | 'accent';

interface IconCircleProps {
  icon: LucideIcon;
  size?: IconCircleSize;
  variant?: IconCircleVariant;
  className?: string;
  iconClassName?: string;
  hoverEffect?: boolean;
}

const sizeMap: Record<IconCircleSize, { container: string; icon: string }> = {
  xs: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  sm: { container: 'w-10 h-10', icon: 'w-4.5 h-4.5' },
  md: { container: 'w-12 h-12', icon: 'w-5 h-5' },
  lg: { container: 'w-14 h-14', icon: 'w-6 h-6' },
  xl: { container: 'w-16 h-16', icon: 'w-7 h-7' },
};

const variantMap: Record<IconCircleVariant, { container: string; icon: string; hover?: string }> = {
  default: {
    container: 'bg-muted/80 border border-border/50',
    icon: 'text-foreground/70',
    hover: 'group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground',
  },
  primary: {
    container: 'bg-primary/10 border border-primary/20',
    icon: 'text-primary',
    hover: 'group-hover:bg-primary group-hover:text-primary-foreground',
  },
  muted: {
    container: 'bg-muted border border-border/30',
    icon: 'text-muted-foreground',
    hover: 'group-hover:bg-primary/10 group-hover:text-primary',
  },
  success: {
    container: 'bg-success/10 border border-success/20',
    icon: 'text-success',
    hover: 'group-hover:bg-success group-hover:text-success-foreground',
  },
  warning: {
    container: 'bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    hover: 'group-hover:bg-amber-500 group-hover:text-white',
  },
  accent: {
    container: 'bg-accent/10 border border-accent/20',
    icon: 'text-accent',
    hover: 'group-hover:bg-accent group-hover:text-accent-foreground',
  },
};

export function IconCircle({
  icon: Icon,
  size = 'md',
  variant = 'default',
  className,
  iconClassName,
  hoverEffect = false,
}: IconCircleProps) {
  const sizeStyles = sizeMap[size];
  const variantStyles = variantMap[variant];

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200',
        sizeStyles.container,
        variantStyles.container,
        hoverEffect && variantStyles.hover,
        className
      )}
    >
      <Icon
        className={cn(
          sizeStyles.icon,
          variantStyles.icon,
          hoverEffect && 'transition-colors duration-200',
          iconClassName
        )}
        strokeWidth={2}
      />
    </div>
  );
}

// Reusable icon card component for consistent feature/service cards
interface IconCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconSize?: IconCircleSize;
  iconVariant?: IconCircleVariant;
  className?: string;
  hoverEffect?: boolean;
}

export function IconCard({
  icon,
  title,
  description,
  iconSize = 'md',
  iconVariant = 'primary',
  className,
  hoverEffect = true,
}: IconCardProps) {
  return (
    <div
      className={cn(
        'group p-5 md:p-6 bg-card rounded-2xl border border-border transition-all duration-200',
        hoverEffect && 'hover:border-primary/20 hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <IconCircle
          icon={icon}
          size={iconSize}
          variant={iconVariant}
          hoverEffect={hoverEffect}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Compact inline icon with text
interface IconTextProps {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

export function IconText({ icon: Icon, children, className, iconClassName }: IconTextProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icon className={cn('w-4 h-4 text-muted-foreground flex-shrink-0', iconClassName)} strokeWidth={2} />
      <span>{children}</span>
    </div>
  );
}

// Badge-style icon display for status/trust indicators
interface IconBadgeProps {
  icon: LucideIcon;
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

export function IconBadge({ icon: Icon, label, variant = 'default', className }: IconBadgeProps) {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      <span>{label}</span>
    </div>
  );
}
