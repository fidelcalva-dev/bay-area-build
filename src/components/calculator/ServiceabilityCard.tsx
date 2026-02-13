// Card 1: "Can We Service It?" result card

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, MapPin, Clock, Truck, AlertTriangle, Package } from 'lucide-react';
import { formatDuration } from '@/services/operationalTimeService';
import type { CalculatorResult } from '@/types/calculator';

interface ServiceabilityCardProps {
  result: CalculatorResult;
}

export function ServiceabilityCard({ result }: ServiceabilityCardProps) {
  const { estimate, is_blocked, block_reason } = result;
  const isServiceable = !is_blocked && estimate.is_feasible !== false;

  return (
    <Card className={is_blocked ? 'border-destructive/50' : 'border-green-200'}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            {isServiceable ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            Can We Service It?
          </span>
          <Badge className={isServiceable ? 'bg-green-100 text-green-700 border-0' : 'bg-red-100 text-red-700 border-0'}>
            {isServiceable ? 'YES' : 'NO'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {is_blocked ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{block_reason}</AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Yard + ETA */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-semibold">{estimate.yard_id ? 'Matched' : '--'}</p>
                <p className="text-xs text-muted-foreground">Best Yard</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-semibold">
                  {estimate.total_time_minutes ? formatDuration(estimate.total_time_minutes) : '--'}
                </p>
                <p className="text-xs text-muted-foreground">Est. Time</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Truck className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-semibold">
                  {estimate.route_details?.total_miles 
                    ? `${estimate.route_details.total_miles.toFixed(1)} mi`
                    : '--'}
                </p>
                <p className="text-xs text-muted-foreground">Distance</p>
              </div>
            </div>

            {/* Available sizes */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Available Sizes</p>
              <div className="flex flex-wrap gap-1.5">
                {(estimate.material_category === 'HEAVY'
                  ? [6, 8, 10]
                  : [6, 8, 10, 20, 30, 40, 50]
                ).map(size => (
                  <Badge
                    key={size}
                    variant={size === estimate.dumpster_size ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {size}yd
                  </Badge>
                ))}
              </div>
            </div>

            {/* Warnings / risk flags */}
            {estimate.warnings && estimate.warnings.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Risk Flags</p>
                {estimate.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-md p-2">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {w}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
