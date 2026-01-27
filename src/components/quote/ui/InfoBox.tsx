// ============================================================
// INFO BOX - Neutral background notice box
// ============================================================
import { cn } from '@/lib/utils';
import { Info, AlertTriangle, CheckCircle, type LucideIcon } from 'lucide-react';

interface InfoBoxProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'neutral';
  icon?: LucideIcon;
  title?: string;
  className?: string;
}

export function InfoBox({ 
  children, 
  variant = 'neutral', 
  icon,
  title,
  className 
}: InfoBoxProps) {
  const variantStyles = {
    neutral: {
      container: 'bg-muted/50 border-border text-muted-foreground',
      icon: 'text-muted-foreground',
      defaultIcon: Info,
    },
    info: {
      container: 'bg-primary/5 border-primary/20 text-foreground',
      icon: 'text-primary',
      defaultIcon: Info,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200',
      icon: 'text-amber-600 dark:text-amber-400',
      defaultIcon: AlertTriangle,
    },
    success: {
      container: 'bg-success/10 border-success/20 text-foreground',
      icon: 'text-success',
      defaultIcon: CheckCircle,
    },
  };

  const styles = variantStyles[variant];
  const Icon = icon || styles.defaultIcon;

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-xl border',
      styles.container,
      className
    )}>
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', styles.icon)} />
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-semibold text-sm mb-1">{title}</div>
        )}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

// Compact variant for inline notices
interface InfoBoxCompactProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'neutral';
  icon?: LucideIcon;
  className?: string;
}

export function InfoBoxCompact({ 
  children, 
  variant = 'neutral', 
  icon,
  className 
}: InfoBoxCompactProps) {
  const variantStyles = {
    neutral: {
      container: 'bg-muted/50 border-border text-muted-foreground',
      icon: 'text-muted-foreground',
      defaultIcon: Info,
    },
    info: {
      container: 'bg-primary/5 border-primary/20 text-foreground',
      icon: 'text-primary',
      defaultIcon: Info,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200',
      icon: 'text-amber-600 dark:text-amber-400',
      defaultIcon: AlertTriangle,
    },
    success: {
      container: 'bg-success/10 border-success/20 text-foreground',
      icon: 'text-success',
      defaultIcon: CheckCircle,
    },
  };

  const styles = variantStyles[variant];
  const Icon = icon || styles.defaultIcon;

  return (
    <div className={cn(
      'flex items-start gap-2 p-3 rounded-lg border text-xs',
      styles.container,
      className
    )}>
      <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', styles.icon)} />
      <span className="flex-1">{children}</span>
    </div>
  );
}

export default InfoBox;
