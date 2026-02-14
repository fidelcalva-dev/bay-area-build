// Internal Master Calculator Page

import { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { MasterCalculatorInputs } from '@/components/calculator/MasterCalculatorInputs';
import { ServiceabilityCard } from '@/components/calculator/ServiceabilityCard';
import { TierSelector } from '@/components/calculator/TierSelector';
import { QuoteSendPanel } from '@/components/calculator/QuoteSendPanel';
import { DispatchPlanCard } from '@/components/calculator/DispatchPlanCard';
import { VendorFinderPanel } from '@/components/calculator/VendorFinderPanel';
import { ScriptGenerator } from '@/components/calculator/ScriptGenerator';
import { useCalculator } from '@/hooks/useCalculator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, Shield, User, RotateCcw, Lock, AlertTriangle } from 'lucide-react';
import {
  fetchTierConfigs,
  calculateTiers,
  buildRiskFlags,
  type PricingTier,
  type TierCalculationResult,
} from '@/services/pricingTierService';
import { logCalculatorAction } from '@/services/calculatorService';
import type { CalculatorInputs as CalculatorInputsType } from '@/types/calculator';
import { supabase } from '@/integrations/supabase/client';

const ALLOWED_ROLES = ['admin', 'sales', 'cs', 'cs_agent', 'dispatcher', 'finance', 'ops_admin', 'sales_admin', 'executive'];

const ROLE_DISPLAY: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
  sales: { label: 'Sales', color: 'bg-blue-100 text-blue-700' },
  cs: { label: 'Customer Service', color: 'bg-green-100 text-green-700' },
  cs_agent: { label: 'CS Agent', color: 'bg-green-100 text-green-700' },
  dispatcher: { label: 'Dispatch', color: 'bg-amber-100 text-amber-700' },
  finance: { label: 'Finance (Read Only)', color: 'bg-slate-100 text-slate-700' },
  executive: { label: 'Executive', color: 'bg-indigo-100 text-indigo-700' },
};

export default function InternalCalculator() {
  const { user, isLoading: authLoading, getPrimaryRole, roles, hasAnyRole } = useAdminAuth();
  const navigate = useNavigate();
  const role = getPrimaryRole();
  const { toast } = useToast();
  const { result, isCalculating, calculate, saveEstimate, applyDiscount, reset } = useCalculator();
  const [lastInputs, setLastInputs] = useState<any>(null);
  const [tierResult, setTierResult] = useState<TierCalculationResult | null>(null);
  const [selectedTier, setSelectedTier] = useState<PricingTier | undefined>();
  const [tierConfigs, setTierConfigs] = useState<Record<PricingTier, import('@/services/pricingTierService').TierConfig> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const hasAccess = roles.some(r => ALLOWED_ROLES.includes(r));
  const isAdmin = hasAnyRole('admin', 'system_admin', 'ops_admin');
  const isFinanceOnly = role === 'finance' && !isAdmin;
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
      setLoadError(null);
      const configs = await fetchTierConfigs();
      const riskFlags = buildRiskFlags({
        is_same_day: lastInputs?.is_same_day || false,
        material_category: lastInputs?.material_category || 'DEBRIS',
        access_notes: lastInputs?.access_notes,
        warnings: result?.estimate?.warnings,
      });

      setTierConfigs(configs.tiers);

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
      setLoadError('Pricing tier configuration could not be loaded. Please try again.');
    }
  };

  const handleCalculate = useCallback(async (inputs: CalculatorInputsType & {
    delivery_date?: string;
    delivery_window?: string;
    access_notes?: string;
    zip_code?: string;
  }) => {
    try {
      setLoadError(null);
      setLastInputs(inputs);
      await calculate(inputs);
    } catch (err) {
      console.error('Calculator error:', err);
      setLoadError('Calculation failed. Please check inputs and try again.');
    }
  }, [calculate]);

  const handleSave = useCallback(async () => {
    if (isFinanceOnly) {
      toast({ title: 'Read Only', description: 'Finance role cannot save estimates.', variant: 'destructive' });
      return;
    }
    const saved = await saveEstimate();
    if (saved) {
      toast({
        title: 'Estimate Saved',
        description: `Estimate ID: ${saved.id.slice(0, 8)}...`,
      });
    }
  }, [saveEstimate, toast, isFinanceOnly]);

  const handleSelectTier = useCallback(async (tier: PricingTier, overridePrice?: number, overrideReason?: string) => {
    if (overridePrice && !isAdmin) {
      toast({ title: 'Admin Required', description: 'Only admins can override pricing.', variant: 'destructive' });
      return;
    }
    setSelectedTier(tier);

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
  }, [lastInputs, tierResult, isAdmin, toast]);

  const handleRequestAccess = async () => {
    if (!user) return;
    try {
      await supabase.from('access_requests').insert({
        user_id: user.id,
        email: user.email || '',
        requested_role: 'calculator_access',
        notes: 'Requested access to Internal Master Calculator',
      });
      toast({ title: 'Access Requested', description: 'Your request has been submitted to the admin team.' });
    } catch {
      toast({ title: 'Error', description: 'Could not submit request. Please try again.', variant: 'destructive' });
    }
  };

  const showVendorFinder = result && (result.is_blocked || !result.success);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Access denied
  if (!user || !hasAccess) {
    return (
      <>
        <Helmet>
          <title>Access Required | Calculator</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-7 h-7 text-amber-600" />
              </div>
              <CardTitle>Calculator Access Required</CardTitle>
              <CardDescription>
                The Master Calculator is available to Sales, CS, Dispatch, and Admin staff.
                {user ? ` Your current role (${role || 'none'}) does not have access.` : ' Please sign in first.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 items-center">
              {user ? (
                <Button onClick={handleRequestAccess}>
                  Request Access
                </Button>
              ) : (
                <Button onClick={() => navigate('/admin/login')}>
                  Sign In
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
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

        {/* Error Banner */}
        {loadError && (
          <div className="container mx-auto px-4 pt-3">
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="py-3 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{loadError}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">ERR_CALC_LOAD</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setLoadError(null)}>
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Finance Read-Only Banner */}
        {isFinanceOnly && (
          <div className="container mx-auto px-4 pt-3">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="py-2 flex items-center gap-2 text-sm text-blue-700">
                <Shield className="h-4 w-4" />
                <span>Read-only mode — Finance role cannot save estimates or apply overrides.</span>
              </CardContent>
            </Card>
          </div>
        )}

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
                            onSave={isFinanceOnly ? undefined : handleSave}
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

                      {/* Quote Send Panel — hidden for finance */}
                      {!isFinanceOnly && tierResult && selectedTier && tierConfigs && user && (
                        <QuoteSendPanel
                          activeTier={selectedTier}
                          activePricing={tierResult.tiers[selectedTier]}
                          tierConfig={tierConfigs[selectedTier]}
                          dumpsterSize={result.estimate.dumpster_size}
                          customerType={lastInputs?.customer_type || 'homeowner'}
                          materialCategory={lastInputs?.material_category || 'DEBRIS'}
                          userId={user.id}
                          userRole={userRole}
                          inputs={{
                            zip_code: lastInputs?.zip_code,
                            address_text: lastInputs?.destination_address,
                            is_same_day: lastInputs?.is_same_day,
                          }}
                        />
                      )}

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
