import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { KPIMetric } from '@/hooks/useKPIData';

interface KPISummaryBarProps {
  kpis: KPIMetric[];
  loading?: boolean;
}

export function KPISummaryBar({ kpis, loading = false }: KPISummaryBarProps) {
  const greenCount = kpis.filter(k => k.status === 'green').length;
  const yellowCount = kpis.filter(k => k.status === 'yellow').length;
  const redCount = kpis.filter(k => k.status === 'red').length;
  const total = kpis.length;

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-8 bg-muted rounded w-full" />
        </CardContent>
      </Card>
    );
  }

  const greenPercent = total > 0 ? (greenCount / total) * 100 : 0;
  const yellowPercent = total > 0 ? (yellowCount / total) * 100 : 0;
  const redPercent = total > 0 ? (redCount / total) * 100 : 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-6">
          {/* Summary stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium">{greenCount} On Track</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium">{yellowCount} Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium">{redCount} Off Track</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-1">
            <div className="h-3 bg-muted rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 transition-all"
                style={{ width: `${greenPercent}%` }}
              />
              <div 
                className="bg-amber-500 transition-all"
                style={{ width: `${yellowPercent}%` }}
              />
              <div 
                className="bg-red-500 transition-all"
                style={{ width: `${redPercent}%` }}
              />
            </div>
          </div>

          {/* Score */}
          <div className="text-right">
            <div className={cn(
              'text-2xl font-bold',
              greenPercent >= 70 && 'text-emerald-600',
              greenPercent >= 40 && greenPercent < 70 && 'text-amber-600',
              greenPercent < 40 && 'text-red-600'
            )}>
              {Math.round(greenPercent)}%
            </div>
            <div className="text-xs text-muted-foreground">Health Score</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
