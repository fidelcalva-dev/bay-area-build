// Internal Calculator Hook

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { calculateOperationalTime } from '@/services/operationalTimeService';
import { calculateServiceCost } from '@/services/serviceCostService';
import {
  getZoneRestrictions,
  checkRestrictions,
  saveEstimate,
  applyDiscount,
  logCalculatorAction,
  getMarginClass,
} from '@/services/calculatorService';
import { getPriceFromList, getPriceByZip } from '@/lib/price-list-data';
import type {
  CalculatorInputs,
  CalculatorEstimate,
  CalculatorResult,
  ZoneRestriction,
  Recommendation,
} from '@/types/calculator';
import type { OperationalTimeRequest } from '@/types/operationalTime';
import type { ServiceCostRequest } from '@/types/serviceCost';

export function useCalculator() {
  const { toast } = useToast();
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch zone restrictions for a market
  const { data: restrictions = [], refetch: refetchRestrictions } = useQuery({
    queryKey: ['zone-restrictions'],
    queryFn: () => getZoneRestrictions(''),
    enabled: false,
  });

  const calculate = useCallback(async (inputs: CalculatorInputs): Promise<CalculatorResult> => {
    setIsCalculating(true);

    try {
      // 1. Fetch zone restrictions
      const marketRestrictions = await getZoneRestrictions(inputs.market_code);

      // 2. Check for blocking restrictions
      const restrictionCheck = checkRestrictions(inputs, marketRestrictions);
      
      if (restrictionCheck.isBlocked) {
        const blockedResult: CalculatorResult = {
          success: false,
          estimate: {
            id: '',
            ...inputs,
            is_feasible: false,
            blocked_reason: restrictionCheck.reason,
          },
          restrictions_checked: marketRestrictions,
          is_blocked: true,
          block_reason: restrictionCheck.reason,
          alternative_suggestions: restrictionCheck.suggestions,
        };
        setResult(blockedResult);
        setIsCalculating(false);
        return blockedResult;
      }

      // 3. Calculate operational time
      const timeRequest: OperationalTimeRequest = {
        origin_yard_id: inputs.yard_id,
        destination_address: inputs.destination_address,
        destination_lat: inputs.destination_lat,
        destination_lng: inputs.destination_lng,
        service_type: inputs.service_type,
        material_category: inputs.material_category,
        dumpster_size: inputs.dumpster_size,
        disposal_facility_id: inputs.facility_id,
        market_code: inputs.market_code,
        traffic_mode: inputs.traffic_mode,
      };

      let timeResult;
      try {
        timeResult = await calculateOperationalTime(timeRequest);
      } catch (error) {
        console.error('Time calculation failed:', error);
        // Continue with mock data for now
        timeResult = {
          success: true,
          total_time_minutes: 120,
          breakdown: { yard_time: 15, drive_time: 60, jobsite_time: 30, dump_time: 15, buffer: 0 },
          sla_class: 'STANDARD' as const,
          recommended_run_type: 'SAME_DAY' as const,
          service_type: inputs.service_type,
          origin_yard: inputs.yard_id,
        };
      }

      // 4. Calculate service cost from official price list — prefer ZIP-based lookup
      const zipCode = (inputs as any).zip_code || '';
      const cityName = (inputs as any).city_name || '';
      let basePrice: number;
      
      if (zipCode) {
        const zipResult = getPriceByZip(zipCode, inputs.dumpster_size, inputs.material_category);
        if (zipResult.zipFound && zipResult.price > 0) {
          basePrice = zipResult.price;
        } else {
          basePrice = getPriceFromList(cityName, inputs.dumpster_size, inputs.material_category).price;
        }
      } else {
        basePrice = getPriceFromList(cityName, inputs.dumpster_size, inputs.material_category).price;
      }
      const estimatedCost = basePrice * 0.6; // internal cost estimate
      
      let costResult;
      try {
        const costRequest: ServiceCostRequest = {
          market_code: inputs.market_code,
          service_type: inputs.service_type,
          origin_yard_id: inputs.yard_id,
          destination_address: inputs.destination_address,
          destination_lat: inputs.destination_lat,
          destination_lng: inputs.destination_lng,
          facility_id: inputs.facility_id,
          material_category: inputs.material_category,
          customer_price: basePrice,
        };
        costResult = await calculateServiceCost(costRequest);
      } catch (error) {
        console.error('Cost calculation failed:', error);
        // Use fallback
        costResult = {
          success: true,
          primary_estimate: {
            total_cost: estimatedCost,
            margin: basePrice - estimatedCost,
            margin_pct: ((basePrice - estimatedCost) / basePrice) * 100,
          },
        };
      }

      // 5. Build estimate
      const marginPct = costResult?.primary_estimate?.margin_pct || 40;
      const marginClass = getMarginClass(marginPct);
      
      // Check for SLA warnings
      const warnings: string[] = [];
      if (timeResult?.sla_class === 'LONG') {
        warnings.push('Long service time - operationally expensive. Consider next-day scheduling.');
      }
      if (marginClass === 'RED') {
        warnings.push('Low margin job - requires approval before proceeding.');
      }

      // Generate recommendations
      const recommendations: Recommendation[] = [];
      if (marginClass !== 'GREEN') {
        recommendations.push({
          type: 'BEST_MARGIN',
          label: 'Optimize for Margin',
          description: 'Consider a smaller container or different service type',
          estimated_margin_pct: marginPct + 10,
        });
      }

      const estimate: CalculatorEstimate = {
        id: '', // Will be set when saved
        ...inputs,
        total_time_minutes: timeResult?.total_time_minutes,
        time_breakdown: timeResult?.breakdown,
        sla_class: timeResult?.sla_class as CalculatorEstimate['sla_class'],
        is_feasible: true,
        customer_price: basePrice,
        internal_cost: costResult?.primary_estimate?.total_cost || estimatedCost,
        margin_pct: marginPct,
        margin_class: marginClass,
        final_price: basePrice,
        final_margin_pct: marginPct,
        requires_approval: marginClass === 'RED',
        approval_status: marginClass === 'RED' ? 'PENDING' : 'NOT_REQUIRED',
        recommendations,
        warnings,
        route_details: timeResult?.route_details,
      };

      const successResult: CalculatorResult = {
        success: true,
        estimate,
        restrictions_checked: marketRestrictions,
        is_blocked: false,
        alternative_suggestions: recommendations,
      };

      setResult(successResult);

      // Log the calculation
      await logCalculatorAction({
        action_type: 'CALCULATE',
        inputs_json: inputs,
        outputs_json: estimate,
      });

      return successResult;
    } catch (error) {
      console.error('Calculator error:', error);
      toast({
        title: 'Calculation Failed',
        description: 'Unable to complete the calculation. Please try again.',
        variant: 'destructive',
      });
      
      const errorResult: CalculatorResult = {
        success: false,
        estimate: { id: '', ...inputs } as CalculatorEstimate,
        restrictions_checked: [],
        is_blocked: false,
        error: 'Calculation failed',
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsCalculating(false);
    }
  }, [toast]);

  const saveCurrentEstimate = useCallback(async (): Promise<CalculatorEstimate | null> => {
    if (!result?.estimate) {
      toast({
        title: 'No Estimate',
        description: 'Please calculate an estimate first.',
        variant: 'destructive',
      });
      return null;
    }

    const saved = await saveEstimate(result.estimate);
    if (saved) {
      toast({
        title: 'Estimate Saved',
        description: 'The estimate has been saved successfully.',
      });
      return saved;
    }
    return null;
  }, [result, toast]);

  const applyDiscountToEstimate = useCallback(async (
    estimateId: string,
    discountType: string,
    discountValue: number,
    reason?: string
  ): Promise<boolean> => {
    const success = await applyDiscount(estimateId, discountType, discountValue, reason);
    if (success) {
      toast({
        title: 'Discount Applied',
        description: `${discountType} discount of ${discountValue} applied.`,
      });

      // Log the discount
      await logCalculatorAction({
        estimate_id: estimateId,
        action_type: 'APPLY_DISCOUNT',
        inputs_json: result?.estimate as any,
        discount_applied: { type: discountType as any, value: discountValue, reason },
      });
    }
    return success;
  }, [result, toast]);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return {
    result,
    isCalculating,
    calculate,
    saveEstimate: saveCurrentEstimate,
    applyDiscount: applyDiscountToEstimate,
    reset,
  };
}

// getBasePrice is now replaced by getPriceFromList in price-list-data.ts
