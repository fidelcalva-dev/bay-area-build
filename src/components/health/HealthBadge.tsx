import { cn } from '@/lib/utils';
import type { HealthStatus } from '@/lib/customerHealthService';

interface HealthBadgeProps {
  status: HealthStatus;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const STATUS_CONFIG: Record<HealthStatus, { bg: string; text: string; ring: string; label: string }> = {
  GREEN: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    ring: 'ring-green-500/30',
    label: 'Healthy',
  },
  AMBER: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    ring: 'ring-amber-500/30',
    label: 'Attention',
  },
  RED: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    ring: 'ring-red-500/30',
    label: 'At Risk',
  },
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function HealthBadge({ 
  status, 
  score, 
  showScore = false, 
  size = 'md',
  className 
}: HealthBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium ring-1',
        config.bg,
        config.text,
        config.ring,
        SIZE_CLASSES[size],
        className
      )}
    >
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          status === 'GREEN' && 'bg-green-500',
          status === 'AMBER' && 'bg-amber-500',
          status === 'RED' && 'bg-red-500'
        )}
      />
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="font-semibold">({score})</span>
      )}
    </div>
  );
}

interface HealthScoreDisplayProps {
  score: number;
  status: HealthStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HealthScoreDisplay({ score, status, size = 'md', className }: HealthScoreDisplayProps) {
  const config = STATUS_CONFIG[status];
  
  const sizeStyles = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl',
  };
  
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold ring-2',
        config.bg,
        config.text,
        config.ring,
        sizeStyles[size],
        className
      )}
    >
      {score}
    </div>
  );
}

interface HealthIndicatorProps {
  status: HealthStatus;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

export function HealthIndicator({ status, size = 'md', pulse = false, className }: HealthIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };
  
  return (
    <div
      className={cn(
        'rounded-full',
        status === 'GREEN' && 'bg-green-500',
        status === 'AMBER' && 'bg-amber-500',
        status === 'RED' && 'bg-red-500',
        pulse && 'animate-pulse',
        sizeClasses[size],
        className
      )}
      title={STATUS_CONFIG[status].label}
    />
  );
}
