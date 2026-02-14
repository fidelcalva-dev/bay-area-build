// Card 3: "Dispatch Plan" result card — Calsan Service Time Standards

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Clock, MapPin, Route, ClipboardList, ArrowRight, RotateCcw, Timer, Factory } from 'lucide-react';
import { formatDuration, getSlaClassInfo } from '@/services/operationalTimeService';
import {
  calculateServiceTime,
  buildRouteMinutes,
  formatTimeRange,
  CALSAN_STANDARDS,
  type LogisticsServiceType,
  type CycleEstimate,
  type TimeSegment,
} from '@/lib/logistics/serviceTimeEngine';
import type { CalculatorEstimate } from '@/types/calculator';

interface DispatchPlanCardProps {
  estimate: CalculatorEstimate;
  userRole: string;
  onCreateRun?: () => void;
}

/** Map route miles → approximate drive minutes (avg 25 mph) */
function milesToMinutes(miles?: number): number | undefined {
  return miles != null ? Math.round((miles / 25) * 60) : undefined;
}

export function DispatchPlanCard({ estimate, userRole, onCreateRun }: DispatchPlanCardProps) {
  const slaInfo = estimate.sla_class ? getSlaClassInfo(estimate.sla_class) : null;
  const route = estimate.route_details;

  // Build Calsan service time from route distances
  const routeMinutes = buildRouteMinutes({
    yardToSiteMinutes: milesToMinutes(route?.yard_to_site_miles),
    siteToFacilityMinutes: milesToMinutes(route?.site_to_dump_miles),
    facilityToYardMinutes: milesToMinutes(route?.dump_to_yard_miles),
  });

  const serviceType = (estimate.service_type || 'DELIVERY') as LogisticsServiceType;
  const serviceTime = calculateServiceTime(serviceType, routeMinutes);
  const primary = serviceTime.primary;

  // Icon map for breakdown labels
  const labelIcon: Record<string, React.ElementType> = {
    'Load on truck': Truck,
    'Load replacement': Truck,
    'Drive to site': ArrowRight,
    'Drop-off': MapPin,
    'Pickup secure': MapPin,
    'Swap (pick + drop)': RotateCcw,
    'Drive to facility': ArrowRight,
    'Dump processing': Factory,
    'Return to yard': ArrowRight,
  };

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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              {serviceType}
            </Badge>
            {slaInfo && (
              <Badge className={`${slaInfo.bgColor} ${slaInfo.color} border-0 text-xs`}>
                {slaInfo.label} SLA
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calsan Service Time Breakdown */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
            Service Time — Calsan Standards
          </p>
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
            {primary.breakdown.map((seg, i) => {
              const Icon = labelIcon[seg.label] || Clock;
              return (
                <div key={i} className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                    {seg.label}
                  </span>
                  <span className="font-mono text-foreground/80 text-xs">
                    {formatTimeRange(seg.min, seg.max)}
                  </span>
                </div>
              );
            })}

            <div className="border-t border-border my-1.5" />
            <div className="flex items-center justify-between font-semibold text-foreground text-sm">
              <span className="flex items-center gap-2">
                <Timer className="w-3.5 h-3.5 text-primary shrink-0" />
                Total cycle
              </span>
              <span className="font-mono">
                {formatTimeRange(primary.min, primary.max)}
              </span>
            </div>
          </div>
        </div>

        {/* Route distances */}
        {route && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Route</p>
            <div className="space-y-1.5 text-sm">
              {route.yard_to_site_miles != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Yard → Site</span>
                  <span>{route.yard_to_site_miles.toFixed(1)} mi</span>
                </div>
              )}
              {route.site_to_dump_miles != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Site → Facility</span>
                  <span>{route.site_to_dump_miles.toFixed(1)} mi</span>
                </div>
              )}
              {route.dump_to_yard_miles != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Facility → Yard</span>
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
          <div className="p-2.5 rounded-lg bg-accent/50 border border-accent text-xs text-accent-foreground">
            <p className="font-medium mb-1">Swap Workflow</p>
            <p>1. Load replacement at yard</p>
            <p>2. Drive to site → swap (pick full + drop empty)</p>
            <p>3. Transport to facility → dump</p>
            <p>4. Return to yard</p>
          </div>
        )}

        {/* Calsan assumptions */}
        <div className="text-[10px] text-muted-foreground/70 flex flex-wrap gap-x-3 gap-y-0.5">
          <span>Load: {CALSAN_STANDARDS.LOAD_ON_TRUCK}m</span>
          <span>Drop: {CALSAN_STANDARDS.DROPOFF_MIN}–{CALSAN_STANDARDS.DROPOFF_MAX}m</span>
          <span>Pickup: {CALSAN_STANDARDS.PICKUP_ONLY}m</span>
          <span>Swap: {CALSAN_STANDARDS.SWAP_PICKUP}m</span>
          <span>Dump: {CALSAN_STANDARDS.DUMP_PROCESS_MIN}–{CALSAN_STANDARDS.DUMP_PROCESS_MAX}m</span>
          <span>Traffic: ±15%</span>
        </div>

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
