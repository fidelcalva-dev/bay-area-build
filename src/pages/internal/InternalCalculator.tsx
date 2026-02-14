// Internal Master Calculator Page

import { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { MasterCalculatorInputs } from '@/components/calculator/MasterCalculatorInputs';
import { ServiceabilityCard } from '@/components/calculator/ServiceabilityCard';
import { TierSelector } from '@/components/calculator/TierSelector';
import { DispatchPlanCard } from '@/components/calculator/DispatchPlanCard';
import { VendorFinderPanel } from '@/components/calculator/VendorFinderPanel';
import { ScriptGenerator } from '@/components/calculator/ScriptGenerator';
import { useCalculator } from '@/hooks/useCalculator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, Shield, User, RotateCcw } from 'lucide-react';
import {
  fetchTierConfigs,
  calculateTiers,
  buildRiskFlags,
  type PricingTier,
  type TierCalculationResult,
} from '@/services/pricingTierService';
import { logCalculatorAction } from '@/services/calculatorService';
import type { CalculatorInputs as CalculatorInputsType } from '@/types/calculator';

const ROLE_DISPLAY: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
  sales: { label: 'Sales', color: 'bg-blue-100 text-blue-700' },
  cs: { label: 'Customer Service', color: 'bg-green-100 text-green-700' },
  dispatcher: { label: 'Dispatch', color: 'bg-amber-100 text-amber-700' },
  finance: { label: 'Finance', color: 'bg-slate-100 text-slate-700' },
};

export default function InternalCalculator() {
  const { user, isLoading: authLoading, getPrimaryRole } = useAdminAuth();
  const role = getPrimaryRole();
  const { toast } = useToast();
  const { result, isCalculating, calculate, saveEstimate, applyDiscount, reset } = useCalculator();
  const [lastInputs, setLastInputs] = useState<any>(null);
  const [tierResult, setTierResult] = useState<TierCalculationResult | null>(null);
  const [selectedTier, setSelectedTier] = useState<PricingTier | undefined>();

  const userRole = role || 'sales';
  const roleInfo = ROLE_DISPLAY[userRole] || ROLE_DISPLAY.sales;

  // Compute tiers when result changes
  useEffect(() => {
    if (result?.success && !result.is_blocked && result.estimate?.internal_cost) {
      computeTiers(result.estimate.internal_cost);
    } else {
      setTierResult(null);
      setSelectedTier(undefined);
    }
  }, [result]);

  const computeTiers = async (internalCost: number) => {
    try {
      const configs = await fetchTierConfigs();
      const riskFlags = buildRiskFlags({
        is_same_day: lastInputs?.is_same_day || false,
        material_category: lastInputs?.material_category || 'DEBRIS',
        access_notes: lastInputs?.access_notes,
        warnings: result?.estimate?.warnings,
      });

      const tiers = calculateTiers(
        internalCost,
        riskFlags,
        lastInputs?.customer_type || 'homeowner',
        configs.tiers,
        configs.surcharges,
        configs.roundingRule,
      );

      setTierResult(tiers);
      setSelectedTier(tiers.recommended_tier);
    } catch (err) {
      console.error('Failed to compute tiers:', err);
    }
  };

  const handleCalculate = useCallback(async (inputs: CalculatorInputsType & {
    delivery_date?: string;
    delivery_window?: string;
    access_notes?: string;
    zip_code?: string;
  }) => {
    setLastInputs(inputs);
    await calculate(inputs);
  }, [calculate]);

  const handleSave = useCallback(async () => {
    const saved = await saveEstimate();
    if (saved) {
      toast({
        title: 'Estimate Saved',
        description: `Estimate ID: ${saved.id.slice(0, 8)}...`,
      });
    }
  }, [saveEstimate, toast]);

  const handleSelectTier = useCallback(async (tier: PricingTier, overridePrice?: number, overrideReason?: string) => {
    setSelectedTier(tier);

    // Log tier selection (and override if applicable)
    await logCalculatorAction({
      action_type: overridePrice ? 'OVERRIDE' : 'CALCULATE',
      inputs_json: lastInputs,
      outputs_json: {
        selected_tier: tier,
        tier_price: tierResult?.tiers[tier]?.customer_price,
        override_price: overridePrice,
      } as any,
      override_details: overridePrice ? {
        field: 'customer_price',
        original_value: tierResult?.tiers[tier]?.customer_price,
        new_value: overridePrice,
      } : undefined,
      notes: overrideReason || `Tier ${tier} selected`,
    });
  }, [lastInputs, tierResult]);

  const showVendorFinder = result && (result.is_blocked || !result.success);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Master Calculator | Bay Area Bin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-background border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Master Calculator</h1>
                  <p className="text-xs text-muted-foreground">
                    Pricing, Logistics, Vendor & Scripts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {result && (
                  <Button variant="ghost" size="sm" onClick={reset} className="text-xs">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Reset
                  </Button>
                )}
                <Badge className={`${roleInfo.color} border-0`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {roleInfo.label}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.email || 'Staff'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column - Inputs */}
            <div className="lg:col-span-4">
              <MasterCalculatorInputs
                onCalculate={handleCalculate}
                isCalculating={isCalculating}
                userRole={userRole}
              />
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-8 space-y-4">
              {result ? (
                <>
                  {/* Card 1: Serviceability */}
                  <ServiceabilityCard result={result} />

                  {/* Vendor Finder (if not serviceable) */}
                  {showVendorFinder && lastInputs && (
                    <VendorFinderPanel
                      zipCode={lastInputs.zip_code || ''}
                      materialCategory={lastInputs.material_category}
                      dumpsterSize={lastInputs.dumpster_size}
                      customerPrice={result.estimate?.customer_price || 0}
                      userRole={userRole}
                      customerType={lastInputs.customer_type || 'homeowner'}
                      isSameDay={lastInputs.is_same_day || false}
                      accessNotes={lastInputs.access_notes}
                    />
                  )}

                  {/* Card 2: Tier Quote (if serviceable) */}
                  {result.success && !result.is_blocked && (
                    <>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {tierResult ? (
                          <TierSelector
                            tierResult={tierResult}
                            userRole={userRole}
                            dumpsterSize={result.estimate.dumpster_size}
                            onSelectTier={handleSelectTier}
                            onSave={handleSave}
                            selectedTier={selectedTier}
                          />
                        ) : (
                          <Card className="flex items-center justify-center p-8">
                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                          </Card>
                        )}
                        <DispatchPlanCard
                          estimate={result.estimate}
                          userRole={userRole}
                        />
                      </div>

                      {/* Scripts */}
                      <ScriptGenerator
                        estimate={result.estimate}
                        userRole={userRole}
                      />
                    </>
                  )}
                </>
              ) : (
                <Card className="h-[400px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <Calculator className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">
                      Configure and Calculate
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Enter a ZIP or address, select service details, and click Calculate.
                      Results include serviceability, pricing tiers, logistics, vendor options, and ready-to-use scripts.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-background mt-6">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>Internal use only. All tier selections and overrides are logged for audit.</p>
              <div className="flex items-center gap-4">
                <span className="text-blue-600 font-medium">BASE 18-25%</span>
                <span className="text-primary font-medium">CORE 25-35%</span>
                <span className="text-amber-600 font-medium">PREMIUM 35-50%</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
