// Internal Operations & Sales Calculator Page

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { CalculatorInputs } from '@/components/calculator/CalculatorInputs';
import { CalculatorResults } from '@/components/calculator/CalculatorResults';
import { DiscountPanel } from '@/components/calculator/DiscountPanel';
import { useCalculator } from '@/hooks/useCalculator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Shield, User } from 'lucide-react';
import type { CalculatorInputs as CalculatorInputsType } from '@/types/calculator';

const ROLE_DISPLAY: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
  sales: { label: 'Sales', color: 'bg-blue-100 text-blue-700' },
  cs: { label: 'Customer Service', color: 'bg-green-100 text-green-700' },
  dispatcher: { label: 'Dispatch', color: 'bg-amber-100 text-amber-700' },
};

export default function InternalCalculator() {
  const { user, isLoading: authLoading, getPrimaryRole } = useAdminAuth();
  const role = getPrimaryRole();
  const { toast } = useToast();
  const { result, isCalculating, calculate, saveEstimate, applyDiscount, reset } = useCalculator();
  
  // Default to sales if no role detected
  const userRole = role || 'sales';
  const roleInfo = ROLE_DISPLAY[userRole] || ROLE_DISPLAY.sales;

  const handleCalculate = async (inputs: CalculatorInputsType) => {
    await calculate(inputs);
  };

  const handleSave = async () => {
    const saved = await saveEstimate();
    if (saved) {
      toast({
        title: 'Estimate Saved',
        description: `Estimate ID: ${saved.id.slice(0, 8)}...`,
      });
    }
  };

  const handleApplyDiscount = async (type: string, value: number, reason?: string) => {
    if (!result?.estimate?.id) {
      // Save first, then apply discount
      const saved = await saveEstimate();
      if (saved) {
        await applyDiscount(saved.id, type, value, reason);
      }
    } else {
      await applyDiscount(result.estimate.id, type, value, reason);
    }
  };

  const canSeePricing = userRole !== 'dispatcher';
  const canApplyDiscounts = userRole === 'admin' || userRole === 'sales';

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
        <title>Internal Calculator | Bay Area Bin</title>
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-background border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Internal Calculator</h1>
                  <p className="text-sm text-muted-foreground">
                    Pricing, Logistics & Profitability
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${roleInfo.color} border-0`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {roleInfo.label}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {user?.email || 'Staff User'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Inputs */}
            <div className="lg:col-span-1">
              <CalculatorInputs
                onCalculate={handleCalculate}
                isCalculating={isCalculating}
                userRole={userRole}
              />
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-2 space-y-6">
              {result ? (
                <>
                  <CalculatorResults
                    result={result}
                    onSave={handleSave}
                    userRole={userRole}
                  />

                  {/* Discount Panel (if applicable) */}
                  {canApplyDiscounts && result.success && !result.is_blocked && result.estimate && (
                    <DiscountPanel
                      userRole={userRole}
                      customerTier={result.estimate.customer_tier || 'standard'}
                      currentPrice={result.estimate.customer_price || 0}
                      internalCost={result.estimate.internal_cost || 0}
                      onApplyDiscount={handleApplyDiscount}
                    />
                  )}
                </>
              ) : (
                <Card className="h-[400px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <Calculator className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">
                      Configure and Calculate
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Fill in the service details and click Calculate to see pricing and logistics estimates
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        {/* Footer Info */}
        <footer className="border-t bg-background mt-8">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>Internal use only. All calculations are logged for audit.</p>
              <div className="flex items-center gap-4">
                <span>🟢 Margin ≥30%</span>
                <span>🟡 Margin 20-30%</span>
                <span>🔴 Margin &lt;20% (approval required)</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
