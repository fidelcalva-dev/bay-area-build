// Apple-Style Icon System
// Clean, consistent icons in soft circular containers
// Premium feel with subtle hover states

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type IconCircleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type IconCircleVariant = 'default' | 'primary' | 'muted' | 'success' | 'warning' | 'accent' | 'glass';

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
  sm: { container: 'w-10 h-10', icon: 'w-[18px] h-[18px]' },
  md: { container: 'w-12 h-12', icon: 'w-5 h-5' },
  lg: { container: 'w-14 h-14', icon: 'w-6 h-6' },
  xl: { container: 'w-16 h-16', icon: 'w-7 h-7' },
};

const variantMap: Record<IconCircleVariant, { container: string; icon: string; hover?: string }> = {
  default: {
    container: 'bg-muted/60 border border-border/30',
    icon: 'text-foreground/70',
    hover: 'group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary',
  },
  primary: {
    container: 'bg-primary/8 border border-primary/15',
    icon: 'text-primary',
    hover: 'group-hover:bg-primary/15 group-hover:border-primary/25',
  },
  muted: {
    container: 'bg-muted/40 border border-border/20',
    icon: 'text-muted-foreground',
    hover: 'group-hover:bg-muted group-hover:text-foreground',
  },
  success: {
    container: 'bg-success/8 border border-success/15',
    icon: 'text-success',
    hover: 'group-hover:bg-success/15 group-hover:border-success/25',
  },
  warning: {
    container: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30',
    icon: 'text-amber-600 dark:text-amber-400',
    hover: 'group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30',
  },
  accent: {
    container: 'bg-accent/8 border border-accent/15',
    icon: 'text-accent',
    hover: 'group-hover:bg-accent/15 group-hover:border-accent/25',
  },
  glass: {
    container: 'bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/10',
    icon: 'text-foreground',
    hover: 'group-hover:bg-white/70 dark:group-hover:bg-white/20',
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
        'rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ease-out',
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
        strokeWidth={1.75}
      />
    </div>
  );
}

// Apple-style feature card with icon
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
        'group p-6 bg-card rounded-2xl border border-border/40 shadow-sm transition-all duration-300 ease-out',
        hoverEffect && 'hover:border-border hover:shadow-lg hover:-translate-y-0.5',
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
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
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
      <Icon className={cn('w-4 h-4 text-muted-foreground flex-shrink-0', iconClassName)} strokeWidth={1.75} />
      <span>{children}</span>
    </div>
  );
}

// Apple-style badge with icon
interface IconBadgeProps {
  icon: LucideIcon;
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

export function IconBadge({ icon: Icon, label, variant = 'default', className }: IconBadgeProps) {
  const variants = {
    default: 'bg-muted/60 text-muted-foreground border-border/30',
    primary: 'bg-primary/8 text-primary border-primary/15',
    success: 'bg-success/8 text-success border-success/15',
    warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
      <span>{label}</span>
    </div>
  );
}

// Loading skeleton circle
interface SkeletonCircleProps {
  size?: IconCircleSize;
  className?: string;
}

export function SkeletonCircle({ size = 'md', className }: SkeletonCircleProps) {
  const sizeStyles = sizeMap[size];
  return (
    <div 
      className={cn(
        'rounded-2xl skeleton-shimmer',
        sizeStyles.container,
        className
      )} 
    />
  );
}
