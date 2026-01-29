// Compact Operational Time Badge for inline display

import { useState, useEffect } from 'react';
import { Clock, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useOperationalTimeCalculation, buildOperationalTimeRequest } from '@/hooks/useOperationalTime';
import { formatDuration, getSlaClassInfo } from '@/services/operationalTimeService';
import type { ServiceType, MaterialCategory } from '@/types/operationalTime';

interface OperationalTimeBadgeProps {
  yardId: string;
  destinationAddress?: string;
  destinationLat?: number;
  destinationLng?: number;
  serviceType: ServiceType;
  materialCategory: MaterialCategory;
  facilityId?: string;
  autoCalculate?: boolean;
}

export function OperationalTimeBadge({
  yardId,
  destinationAddress,
  destinationLat,
  destinationLng,
  serviceType,
  materialCategory,
  facilityId,
  autoCalculate = true,
}: OperationalTimeBadgeProps) {
  const { result, calculate, isLoading, isError } = useOperationalTimeCalculation();
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    if (autoCalculate && yardId && !hasCalculated) {
      const request = buildOperationalTimeRequest({
        yardId,
        destinationAddress,
        destinationLat,
        destinationLng,
        serviceType,
        materialCategory,
        facilityId,
      });
      calculate(request);
      setHasCalculated(true);
    }
  }, [yardId, destinationAddress, serviceType, materialCategory, autoCalculate, hasCalculated, calculate, destinationLat, destinationLng, facilityId]);

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Calculating...
      </Badge>
    );
  }

  if (isError || (result && !result.success)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Error
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Failed to calculate operational time</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!result) {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <Clock className="h-3 w-3" />
        --
      </Badge>
    );
  }

  const slaInfo = getSlaClassInfo(result.sla_class);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge className={`gap-1 ${slaInfo.bgColor} ${slaInfo.color} border-0`}>
            <Clock className="h-3 w-3" />
            {formatDuration(result.total_time_minutes)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1 text-sm">
            <div className="font-medium">{slaInfo.label} - {result.recommended_run_type.replace('_', ' ')}</div>
            <div className="text-xs text-muted-foreground">
              Yard: {result.breakdown.yard_time}m | 
              Drive: {result.breakdown.drive_time}m | 
              Site: {result.breakdown.jobsite_time}m
              {result.breakdown.dump_time > 0 && ` | Dump: ${result.breakdown.dump_time}m`}
            </div>
            {result.facility && (
              <div className="text-xs">Facility: {result.facility}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
