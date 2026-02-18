/**
 * Disposal Pricing Options — Phase 4 & 10
 * Customer-facing: shows Affordable vs Premium without exposing internals
 * Staff-facing: shows full cost breakdown
 */
import { Clock, MapPin, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { DisposalRouteOption, DisposalCostResult } from '@/types/disposal';

interface Props {
  result: DisposalCostResult;
  isStaff?: boolean;
  onSelectOption?: (option: DisposalRouteOption) => void;
}

function MarginBadge({ marginClass, marginPct }: { marginClass: string; marginPct: number }) {
  const colors: Record<string, string> = {
    GREEN: 'bg-green-100 text-green-800 border-green-200',
    AMBER: 'bg-amber-100 text-amber-800 border-amber-200',
    RED: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <Badge variant="outline" className={colors[marginClass] || ''}>
      {marginPct.toFixed(1)}% margin
    </Badge>
  );
}

function CustomerOptionCard({ option, onSelect }: { option: DisposalRouteOption; onSelect?: () => void }) {
  return (
    <Card className={`cursor-pointer transition-shadow hover:shadow-md ${option.route_label === 'premium' ? 'border-primary/30' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="capitalize">{option.route_label === 'affordable' ? 'Standard Route' : 'Priority Route'}</span>
          <span className="text-lg font-bold">From ${option.suggested_price}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{option.disposal_site.city} certified facility</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Estimated cycle: {option.estimated_cycle_minutes} minutes</span>
        </div>
        {option.disposal_site.compliance_rating >= 4 && (
          <div className="flex items-center gap-2 text-green-700">
            <Shield className="h-3.5 w-3.5" />
            <span>High compliance facility</span>
          </div>
        )}
        {onSelect && (
          <Button size="sm" className="w-full mt-2" onClick={onSelect}>
            Select {option.route_label === 'affordable' ? 'Standard' : 'Priority'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function StaffOptionCard({ option }: { option: DisposalRouteOption }) {
  const { breakdown } = option;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="capitalize">{option.route_label}</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">${option.suggested_price}</span>
            <MarginBadge marginClass={option.margin_class} marginPct={option.margin_pct} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
          <span>Facility:</span>
          <span className="font-medium text-foreground">{option.disposal_site.name}</span>
          <span>Type:</span>
          <span className="capitalize">{option.disposal_site.type.replace('_', ' ')}</span>
          <span>Distance:</span>
          <span>{option.distance_miles} miles</span>
          <span>Compliance:</span>
          <span>{option.disposal_site.compliance_rating}/5</span>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
          <span>Truck Cycle Cost:</span>
          <span className="font-medium text-foreground">${option.truck_cycle_cost.toFixed(2)}</span>
          <span>Disposal Cost:</span>
          <span className="font-medium text-foreground">${option.disposal_cost.toFixed(2)}</span>
          <span>Overhead:</span>
          <span className="font-medium text-foreground">${option.overhead_cost.toFixed(2)}</span>
          <span className="font-medium text-foreground">Total Internal:</span>
          <span className="font-bold text-foreground">${option.total_internal_cost.toFixed(2)}</span>
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground space-y-0.5">
          <p className="font-medium text-foreground mb-1">Time Breakdown:</p>
          <p>Yard prep: {breakdown.yard_prep_min}m</p>
          <p>Travel to site: {breakdown.travel_to_site_min}m</p>
          <p>Drop-off: {breakdown.dropoff_min}m</p>
          <p>Pickup/secure: {breakdown.pickup_secure_min}m</p>
          <p>Travel to disposal: {breakdown.travel_to_disposal_min}m</p>
          <p>Dump wait: {breakdown.dump_wait_min}m</p>
          <p>Return: {breakdown.return_to_yard_min}m</p>
          <p className="font-medium text-foreground pt-1">Total: {option.estimated_cycle_minutes}m</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DisposalPricingOptions({ result, isStaff = false, onSelectOption }: Props) {
  if (!result.success) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-amber-500" />
          <p>{result.error || 'Unable to calculate disposal costs for this configuration.'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Material weight summary */}
      <div className="flex items-center gap-3 text-sm">
        <Badge variant="outline">
          {result.material_weight.material_name}
        </Badge>
        <span className="text-muted-foreground">
          Est. {result.material_weight.estimated_tons} tons
        </span>
        {result.material_weight.is_heavy && (
          <Badge variant="destructive" className="text-xs">Heavy Material</Badge>
        )}
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="space-y-1">
          {result.warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded bg-amber-500/10 text-amber-700 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.affordable_option && (
          isStaff ? (
            <StaffOptionCard option={result.affordable_option} />
          ) : (
            <CustomerOptionCard
              option={result.affordable_option}
              onSelect={onSelectOption ? () => onSelectOption(result.affordable_option!) : undefined}
            />
          )
        )}
        {result.premium_option && (
          isStaff ? (
            <StaffOptionCard option={result.premium_option} />
          ) : (
            <CustomerOptionCard
              option={result.premium_option}
              onSelect={onSelectOption ? () => onSelectOption(result.premium_option!) : undefined}
            />
          )
        )}
      </div>

      {/* Customer disclaimer */}
      {!isStaff && (
        <p className="text-[11px] text-muted-foreground">
          Pricing is based on local yard routing, material type, and certified disposal facility rates.
          Final price confirmed at booking. Service times are estimated.
        </p>
      )}
    </div>
  );
}
