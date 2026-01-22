import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DashboardKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  loading?: boolean;
}

export function DashboardKPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  loading = false,
}: DashboardKPICardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-3 h-3" />;
    if (trend.value < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-emerald-600';
    if (trend.value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="h-4 bg-muted rounded w-1/2 mb-4" />
          <div className="h-8 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        <div className="flex items-center gap-2">
          {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
          {trend && (
            <span className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
              {getTrendIcon()}
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
