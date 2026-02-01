import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Truck, DollarSign, AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { calculateServiceCost, getMarginDisplay, getCostModelDisplay } from '@/services/serviceCostService';
import type { ServiceCostRequest, ServiceCostResponse, CostModel } from '@/types/serviceCost';

interface ServiceCostPanelProps {
  entityType: 'QUOTE' | 'ORDER' | 'RUN';
  entityId: string;
  marketCode: string;
  serviceType: 'DELIVERY' | 'PICKUP' | 'SWAP';
  originYardId: string;
  destinationAddress?: string;
  materialCategory: 'DEBRIS' | 'HEAVY' | 'DEBRIS_HEAVY' | 'CLEAN_RECYCLING';
  materialCode?: string;
  dumpsterSize?: number;
  customerPrice: number;
  vehicleType?: 'ROLLOFF' | 'HIGHSIDE' | 'END_DUMP' | 'SUPER10' | 'TENWHEEL' | 'PICKUP';
  compareModels?: boolean;
}

export function ServiceCostPanel({
  entityType,
  entityId,
  marketCode,
  serviceType,
  originYardId,
  destinationAddress,
  materialCategory,
  materialCode,
  dumpsterSize = 10,
  customerPrice,
  vehicleType = 'ROLLOFF',
  compareModels = true,
}: ServiceCostPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [costData, setCostData] = useState<ServiceCostResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  async function fetchCostEstimate() {
    if (!entityId || !marketCode || !originYardId || customerPrice <= 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const request: ServiceCostRequest = {
        market_code: marketCode,
        vehicle_type: vehicleType,
        service_type: serviceType,
        origin_yard_id: originYardId,
        destination_address: destinationAddress,
        material_category: materialCategory,
        material_code: materialCode,
        dumpster_size: dumpsterSize,
        customer_price: customerPrice,
        compare_models: compareModels,
        entity_type: entityType,
        entity_id: entityId,
      };

      const result = await calculateServiceCost(request);
      setCostData(result);
    } catch (err) {
      console.error('Failed to calculate cost:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate cost');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCostEstimate();
  }, [entityId, customerPrice]);

  if (!entityId || customerPrice <= 0) {
    return null;
  }

  const marginDisplay = costData?.primary_estimate 
    ? getMarginDisplay(costData.primary_estimate.margin_pct)
    : null;

  const primaryModelDisplay = costData?.primary_estimate
    ? getCostModelDisplay(costData.primary_estimate.cost_model)
    : null;

  const altModelDisplay = costData?.alternative_estimate
    ? getCostModelDisplay(costData.alternative_estimate.cost_model)
    : null;

  return (
    <Card className="border-dashed border-amber-300 bg-amber-50/30">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>Internal Cost Estimate</span>
            <Badge variant="outline" className="text-xs bg-amber-100 border-amber-300">
              Internal Only
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCostEstimate}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="py-2 px-4">
        {error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : isLoading ? (
          <div className="text-sm text-muted-foreground">Calculating...</div>
        ) : costData?.primary_estimate ? (
          <div className="space-y-3">
            {/* Main Stats */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-xs text-muted-foreground">Price</div>
                <div className="font-semibold">${costData.primary_estimate.customer_price}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Est. Cost</div>
                <div className="font-semibold">${costData.primary_estimate.total_cost}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Margin</div>
                <div className={`font-semibold ${marginDisplay?.color}`}>
                  ${costData.primary_estimate.margin}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Margin %</div>
                <Badge className={`${marginDisplay?.bgColor} ${marginDisplay?.color}`}>
                  {marginDisplay?.text}
                </Badge>
              </div>
            </div>

            {/* Cost Model Used */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Model:</span>
              <span className={primaryModelDisplay?.color}>
                {primaryModelDisplay?.icon} {primaryModelDisplay?.label}
              </span>
            </div>

            {/* Guardrail Warning */}
            {costData.guardrail && (
              <div className={`p-2 rounded-md text-xs ${
                costData.guardrail.severity === 'CRITICAL' 
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                <div className="flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  {costData.guardrail.reason}
                </div>
                <div className="mt-1 text-xs opacity-80">
                  {costData.guardrail.recommended_action}
                </div>
              </div>
            )}

            {/* Model Comparison */}
            {compareModels && costData.alternative_estimate && (
              <div className="border-t pt-2">
                <div className="text-xs text-muted-foreground mb-1">Alternative Model Comparison:</div>
                <div className="flex items-center justify-between text-xs">
                  <span className={altModelDisplay?.color}>
                    {altModelDisplay?.icon} {altModelDisplay?.label}
                  </span>
                  <span>
                    Cost: ${costData.alternative_estimate.total_cost}
                  </span>
                  <span>
                    Margin: {costData.alternative_estimate.margin_pct.toFixed(1)}%
                  </span>
                  {costData.margin_delta && costData.margin_delta !== 0 && (
                    <Badge 
                      variant="outline" 
                      className={costData.margin_delta > 0 ? 'text-green-600' : 'text-red-600'}
                    >
                      {costData.margin_delta > 0 ? '+' : ''}{costData.margin_delta}%
                    </Badge>
                  )}
                </div>
                {costData.best_model !== costData.primary_estimate.cost_model && (
                  <div className="text-xs text-green-600 mt-1">
                    ✓ Better margin with {getCostModelDisplay(costData.best_model).label}
                  </div>
                )}
              </div>
            )}

            {/* Expandable Details */}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full text-xs h-6">
                  {isExpanded ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                  {isExpanded ? 'Hide Details' : 'Show Details'}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                {/* Time Breakdown */}
                {costData.time_breakdown && (
                  <div className="text-xs">
                    <div className="font-medium mb-1">Time Breakdown:</div>
                    <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                      <span>Drive: {costData.time_breakdown.drive_minutes}m</span>
                      <span>Handling: {costData.time_breakdown.handling_minutes}m</span>
                      <span>Dump: {costData.time_breakdown.dump_minutes}m</span>
                      <span className="font-medium text-foreground">
                        Total: {costData.time_breakdown.total_minutes}m
                      </span>
                    </div>
                  </div>
                )}

                {/* Cost Breakdown */}
                <div className="text-xs">
                  <div className="font-medium mb-1">Cost Breakdown:</div>
                  <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                    <span>Truck: ${costData.primary_estimate.truck_cost}</span>
                    <span>Dump Fee: ${costData.primary_estimate.dump_cost}</span>
                    {costData.primary_estimate.breakdown.miles && (
                      <span>Miles: {costData.primary_estimate.breakdown.miles}</span>
                    )}
                    {costData.primary_estimate.breakdown.hours && (
                      <span>Hours: {costData.primary_estimate.breakdown.hours}</span>
                    )}
                  </div>
                </div>

                {/* Dump Fee Details */}
                <div className="text-xs">
                  <div className="font-medium mb-1">Dump Fee Details:</div>
                  <div className="text-muted-foreground">
                    {costData.dump_breakdown.model === 'PER_TON' ? (
                      <span>
                        {costData.dump_breakdown.assumed_tons} tons × 
                        ${costData.dump_breakdown.cost_per_ton}/ton = 
                        ${costData.dump_breakdown.total_dump_cost}
                      </span>
                    ) : (
                      <span>Flat: ${costData.dump_breakdown.total_dump_cost}</span>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No cost data available</div>
        )}
      </CardContent>
    </Card>
  );
}
