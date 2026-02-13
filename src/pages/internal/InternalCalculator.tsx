// Internal Master Calculator Page

import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { MasterCalculatorInputs } from '@/components/calculator/MasterCalculatorInputs';
import { ServiceabilityCard } from '@/components/calculator/ServiceabilityCard';
import { QuoteCard } from '@/components/calculator/QuoteCard';
import { DispatchPlanCard } from '@/components/calculator/DispatchPlanCard';
import { DiscountPanel } from '@/components/calculator/DiscountPanel';
import { VendorFinderPanel } from '@/components/calculator/VendorFinderPanel';
import { ScriptGenerator } from '@/components/calculator/ScriptGenerator';
import { useCalculator } from '@/hooks/useCalculator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, Shield, User, RotateCcw } from 'lucide-react';
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

  const userRole = role || 'sales';
  const roleInfo = ROLE_DISPLAY[userRole] || ROLE_DISPLAY.sales;

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

  const handleApplyDiscount = useCallback(async (type: string, value: number, reason?: string) => {
    if (!result?.estimate?.id) {
      const saved = await saveEstimate();
      if (saved) {
        await applyDiscount(saved.id, type, value, reason);
      }
    } else {
      await applyDiscount(result.estimate.id, type, value, reason);
    }
  }, [result, saveEstimate, applyDiscount]);

  const canApplyDiscounts = userRole === 'admin' || userRole === 'sales';
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
                    />
                  )}

                  {/* Card 2: Quote (if serviceable) */}
                  {result.success && !result.is_blocked && (
                    <>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <QuoteCard
                          result={result}
                          userRole={userRole}
                          onSave={handleSave}
                        />
                        <DispatchPlanCard
                          estimate={result.estimate}
                          userRole={userRole}
                        />
                      </div>

                      {/* Discount Panel */}
                      {canApplyDiscounts && result.estimate && (
                        <DiscountPanel
                          userRole={userRole}
                          customerTier={result.estimate.customer_tier || 'standard'}
                          currentPrice={result.estimate.customer_price || 0}
                          internalCost={result.estimate.internal_cost || 0}
                          onApplyDiscount={handleApplyDiscount}
                        />
                      )}

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
                      Results include serviceability, pricing, logistics, vendor options, and ready-to-use scripts.
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
              <p>Internal use only. All calculations are logged for audit.</p>
              <div className="flex items-center gap-4">
                <span className="text-green-600 font-medium">Margin 30%+</span>
                <span className="text-amber-600 font-medium">Margin 20-30%</span>
                <span className="text-red-600 font-medium">Margin &lt;20% (approval)</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
