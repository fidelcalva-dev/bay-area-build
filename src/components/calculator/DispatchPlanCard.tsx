// Card 3: "Dispatch Plan" result card

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Clock, MapPin, Route, ClipboardList } from 'lucide-react';
import { formatDuration, getSlaClassInfo } from '@/services/operationalTimeService';
import type { CalculatorEstimate } from '@/types/calculator';

interface DispatchPlanCardProps {
  estimate: CalculatorEstimate;
  userRole: string;
  onCreateRun?: () => void;
}

export function DispatchPlanCard({ estimate, userRole, onCreateRun }: DispatchPlanCardProps) {
  const slaInfo = estimate.sla_class ? getSlaClassInfo(estimate.sla_class) : null;
  const breakdown = estimate.time_breakdown;
  const route = estimate.route_details;

  // Generate dispatch notes template
  const dispatchNotes = [
    `Service: ${estimate.service_type}`,
    `Size: ${estimate.dumpster_size}yd`,
    `Material: ${estimate.material_category}`,
    estimate.destination_address ? `Address: ${estimate.destination_address}` : null,
    estimate.is_same_day ? 'SAME DAY - Priority' : null,
  ].filter(Boolean).join('\n');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-5 w-5" />
            Dispatch Plan
          </CardTitle>
          {slaInfo && (
            <Badge className={`${slaInfo.bgColor} ${slaInfo.color} border-0 text-xs`}>
              {slaInfo.label} SLA
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time breakdown */}
        {breakdown && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Service Time Breakdown</p>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: 'Yard', value: breakdown.yard_time },
                { label: 'Drive', value: breakdown.drive_time },
                { label: 'Site', value: breakdown.jobsite_time },
                { label: 'Dump', value: breakdown.dump_time },
                { label: 'Buffer', value: breakdown.buffer },
              ].map(item => (
                <div key={item.label} className="text-center p-2 rounded-md bg-muted/50">
                  <p className="text-sm font-semibold">{item.value}m</p>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-sm px-1">
              <span className="text-muted-foreground">Total Cycle</span>
              <span className="font-semibold">
                {estimate.total_time_minutes ? formatDuration(estimate.total_time_minutes) : '--'}
              </span>
            </div>
          </div>
        )}

        {/* Route distances */}
        {route && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Route</p>
            <div className="space-y-1.5 text-sm">
              {route.yard_to_site_miles != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Yard to Site</span>
                  <span>{route.yard_to_site_miles.toFixed(1)} mi</span>
                </div>
              )}
              {route.site_to_dump_miles != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Site to Facility</span>
                  <span>{route.site_to_dump_miles.toFixed(1)} mi</span>
                </div>
              )}
              {route.dump_to_yard_miles != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Facility to Yard</span>
                  <span>{route.dump_to_yard_miles.toFixed(1)} mi</span>
                </div>
              )}
              {route.total_miles != null && (
                <div className="flex justify-between font-medium border-t pt-1.5">
                  <span>Total Round Trip</span>
                  <span>{route.total_miles.toFixed(1)} mi</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Swap logic note */}
        {estimate.service_type === 'SWAP' && (
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
            <p className="font-medium mb-1">Swap Workflow</p>
            <p>1. Deliver empty to site</p>
            <p>2. Pick up full from site</p>
            <p>3. Transport to facility</p>
            <p>4. Return to yard</p>
          </div>
        )}

        {/* Dispatch notes preview */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Driver Notes Template</p>
          <pre className="text-xs bg-muted/50 rounded-md p-2.5 whitespace-pre-wrap font-mono">
            {dispatchNotes}
          </pre>
        </div>

        {/* Create Run */}
        {(userRole === 'admin' || userRole === 'dispatcher') && onCreateRun && (
          <Button onClick={onCreateRun} variant="outline" size="sm" className="w-full">
            <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
            Create Run
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
