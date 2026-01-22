import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { KPIMetric } from '@/hooks/useKPIData';

interface KPICardProps {
  kpi: KPIMetric;
  showSparkline?: boolean;
  className?: string;
  loading?: boolean;
}

export function KPICard({ kpi, showSparkline = false, className, loading = false }: KPICardProps) {
  const getStatusColor = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green': return 'bg-emerald-500';
      case 'yellow': return 'bg-amber-500';
      case 'red': return 'bg-red-500';
    }
  };

  const getStatusBadge = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50"><CheckCircle className="w-3 h-3 mr-1" />On Track</Badge>;
      case 'yellow':
        return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>;
      case 'red':
        return <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50"><AlertTriangle className="w-3 h-3 mr-1" />Off Track</Badge>;
    }
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case '$': return `$${value.toLocaleString()}`;
      case '%': return `${value}%`;
      case 'days': return `${value}d`;
      case 'hours': return `${value}h`;
      case 'count': return value.toLocaleString();
      case 'score': return value.toString();
      default: return value.toString();
    }
  };

  const getTrendDisplay = (trend: number | null, label: string) => {
    if (trend === null) return null;
    
    const isPositive = kpi.higherIsBetter ? trend > 0 : trend < 0;
    const isNegative = kpi.higherIsBetter ? trend < 0 : trend > 0;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn(
              'flex items-center gap-0.5 text-xs font-medium cursor-help',
              isPositive && 'text-emerald-600',
              isNegative && 'text-red-600',
              !isPositive && !isNegative && 'text-muted-foreground'
            )}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label} change</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderSparkline = () => {
    if (!showSparkline || kpi.sparklineData.length < 2) return null;
    
    const values = kpi.sparklineData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    
    const points = kpi.sparklineData.map((d, i) => {
      const x = (i / (kpi.sparklineData.length - 1)) * width;
      const y = height - ((d.value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="ml-auto">
        <polyline
          points={points}
          fill="none"
          stroke={kpi.status === 'green' ? '#10b981' : kpi.status === 'yellow' ? '#f59e0b' : '#ef4444'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="h-4 bg-muted rounded w-1/2 mb-3" />
          <div className="h-8 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </CardContent>
      </Card>
    );
  }

  // Calculate progress percentage
  const progressPercent = kpi.higherIsBetter 
    ? Math.min(100, (kpi.actual / kpi.target) * 100)
    : Math.min(100, (kpi.target / Math.max(kpi.actual, 0.01)) * 100);

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground truncate">{kpi.name}</span>
          <div className={cn('w-2 h-2 rounded-full', getStatusColor(kpi.status))} />
        </div>

        {/* Value */}
        <div className="flex items-end justify-between mb-2">
          <div className="text-2xl font-bold text-foreground">
            {formatValue(kpi.actual, kpi.unit)}
          </div>
          {showSparkline && renderSparkline()}
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {formatValue(kpi.target, kpi.unit)}
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn('h-full rounded-full transition-all', getStatusColor(kpi.status))}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Trends */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getTrendDisplay(kpi.trend7d, '7 day')}
            {getTrendDisplay(kpi.trend30d, '30 day')}
            {getTrendDisplay(kpi.trend90d, '90 day')}
          </div>
          {getStatusBadge(kpi.status)}
        </div>
      </CardContent>
    </Card>
  );
}

interface KPICardGridProps {
  kpis: KPIMetric[];
  loading?: boolean;
  showSparkline?: boolean;
}

export function KPICardGrid({ kpis, loading = false, showSparkline = false }: KPICardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map(kpi => (
        <KPICard
          key={kpi.key}
          kpi={kpi}
          loading={loading}
          showSparkline={showSparkline}
        />
      ))}
    </div>
  );
}
