// ============================================================
// BADGE PILL - Subtle badge for "Most common" etc
// ============================================================
import { cn } from '@/lib/utils';

interface BadgePillProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function BadgePill({ 
  children, 
  variant = 'primary', 
  size = 'sm',
  className 
}: BadgePillProps) {
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-muted text-muted-foreground',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    info: 'bg-primary/10 text-primary',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={cn(
      'inline-flex items-center font-bold rounded-full uppercase tracking-wide',
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      {children}
    </span>
  );
}

export default BadgePill;
