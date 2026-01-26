// Weight Estimation Card Component
// Displays weight estimate with visual risk indicator

import { Weight, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { WeightEstimation } from '@/lib/heavyMaterialService';

interface WeightEstimationCardProps {
  estimation: WeightEstimation;
  sizeYd: number;
  materialName: string;
  className?: string;
}

export function WeightEstimationCard({
  estimation,
  sizeYd,
  materialName,
  className,
}: WeightEstimationCardProps) {
  const { weightMinTons, weightMaxTons, riskLevel, volumeEffective } = estimation;
  
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'HIGH': return 'text-destructive';
      case 'MED': return 'text-amber-600';
      case 'LOW': return 'text-success';
    }
  };

  const getRiskBg = () => {
    switch (riskLevel) {
      case 'HIGH': return 'bg-destructive/10 border-destructive/30';
      case 'MED': return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
      case 'LOW': return 'bg-success/10 border-success/30';
    }
  };

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'HIGH': return <AlertTriangle className="w-5 h-5" />;
      case 'MED': return <TrendingUp className="w-5 h-5" />;
      case 'LOW': return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn("rounded-xl border", getRiskBg(), className)}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Weight className={cn("w-5 h-5", getRiskColor())} />
            <h3 className="font-semibold text-foreground">Weight Estimate</h3>
          </div>
          <Badge 
            variant="outline"
            className={cn(
              "gap-1",
              riskLevel === 'HIGH' && "bg-destructive/20 border-destructive text-destructive",
              riskLevel === 'MED' && "bg-amber-100 border-amber-500 text-amber-700",
              riskLevel === 'LOW' && "bg-success/20 border-success text-success"
            )}
          >
            {getRiskIcon()}
            {riskLevel === 'LOW' && 'Safe'}
            {riskLevel === 'MED' && 'Caution'}
            {riskLevel === 'HIGH' && 'Risk'}
          </Badge>
        </div>

        {/* Weight Display */}
        <div className="flex items-end gap-2 mb-2">
          <span className={cn("text-4xl font-bold tracking-tight", getRiskColor())}>
            {weightMinTons.toFixed(1)}–{weightMaxTons.toFixed(1)}
          </span>
          <span className="text-lg text-muted-foreground mb-1">tons</span>
        </div>

        {/* Details */}
        <p className="text-sm text-muted-foreground">
          {sizeYd}yd of {materialName} @ {Math.round(estimation.recommendedFillPct * 100)}% fill
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Effective volume: {volumeEffective.toFixed(1)} cubic yards
        </p>

        {/* Max Weight Line */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>0 T</span>
            <span className="font-semibold">10 T MAX</span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            {/* Max line */}
            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-destructive z-10" />
            
            {/* Weight range indicator */}
            <div 
              className={cn(
                "absolute top-0 bottom-0 rounded-full transition-all",
                riskLevel === 'LOW' && "bg-success",
                riskLevel === 'MED' && "bg-amber-500",
                riskLevel === 'HIGH' && "bg-destructive"
              )}
              style={{
                left: `${Math.min(weightMinTons / 12 * 100, 100)}%`,
                width: `${Math.min((weightMaxTons - weightMinTons) / 12 * 100, 100 - weightMinTons / 12 * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Risk-specific message */}
      {riskLevel === 'HIGH' && (
        <div className="px-4 pb-4">
          <div className="p-3 bg-destructive/10 rounded-lg">
            <p className="text-sm font-medium text-destructive">
              ⚠️ This load may exceed the 10-ton weight limit
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              Must follow the fill line. Driver may require on-site adjustment.
            </p>
          </div>
        </div>
      )}

      {riskLevel === 'MED' && (
        <div className="px-4 pb-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              ⚡ Close to weight limit
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Follow fill line carefully to stay under 10 tons.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
