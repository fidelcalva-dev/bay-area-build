import { cn } from '@/lib/utils';
import type { HealthSeverity } from '@/hooks/useSystemHealth';

interface HealthStatusBadgeProps {
  severity: HealthSeverity;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const SEVERITY_COLORS: Record<HealthSeverity, { bg: string; ring: string; text: string }> = {
  GREEN: {
    bg: 'bg-green-500',
    ring: 'ring-green-500/30',
    text: 'text-green-700',
  },
  AMBER: {
    bg: 'bg-amber-500',
    ring: 'ring-amber-500/30',
    text: 'text-amber-700',
  },
  RED: {
    bg: 'bg-red-500',
    ring: 'ring-red-500/30',
    text: 'text-red-700',
  },
};

const SIZE_CLASSES = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export function HealthStatusBadge({ 
  severity, 
  size = 'md', 
  showLabel = false,
  className 
}: HealthStatusBadgeProps) {
  const colors = SEVERITY_COLORS[severity];
  
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'rounded-full ring-2',
          colors.bg,
          colors.ring,
          SIZE_CLASSES[size]
        )}
      />
      {showLabel && (
        <span className={cn('text-xs font-medium', colors.text)}>
          {severity}
        </span>
      )}
    </div>
  );
}

interface HealthRingProps {
  severity: HealthSeverity;
  children: React.ReactNode;
  className?: string;
}

export function HealthRing({ severity, children, className }: HealthRingProps) {
  const colors = SEVERITY_COLORS[severity];
  
  return (
    <div
      className={cn(
        'relative rounded-lg ring-2',
        colors.ring,
        className
      )}
    >
      <div className={cn(
        'absolute -top-1 -right-1 w-3 h-3 rounded-full',
        colors.bg
      )} />
      {children}
    </div>
  );
}
