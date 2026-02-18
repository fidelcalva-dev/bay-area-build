// Internal Master Calculator Page — Single Price from Official Price List

import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { MasterCalculatorInputs } from '@/components/calculator/MasterCalculatorInputs';
import { ServiceabilityCard } from '@/components/calculator/ServiceabilityCard';
import { VendorFinderPanel } from '@/components/calculator/VendorFinderPanel';
import { ScriptGenerator } from '@/components/calculator/ScriptGenerator';
import { LiveLoadPanel, type LiveLoadState } from '@/components/calculator/LiveLoadPanel';
import { DumpReturnPanel, type DumpReturnState } from '@/components/calculator/DumpReturnPanel';
import { ExtrasLibraryPanel, type SelectedExtra } from '@/components/calculator/ExtrasLibraryPanel';
import { DispatchPlanCard } from '@/components/calculator/DispatchPlanCard';
import { useCalculator } from '@/hooks/useCalculator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, Shield, User, RotateCcw, Lock, AlertTriangle, DollarSign, Package, Clock, CheckCircle } from 'lucide-react';
import { logCalculatorAction } from '@/services/calculatorService';
import { getPriceFromList, getPriceByZip, INCLUDED_TONS } from '@/lib/price-list-data';
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
  const { result, isCalculating, calculate, saveEstimate, reset } = useCalculator();
  const [lastInputs, setLastInputs] = useState<any>(null);
  const [priceInfo, setPriceInfo] = useState<{ price: number; cityFound: boolean; cityUsed: string } | null>(null);
  const [liveLoadState, setLiveLoadState] = useState<LiveLoadState>({ enabled: false, estimatedMinutes: 30, extraCharge: 0, billableIncrements: 0 });
  const [dumpReturnState, setDumpReturnState] = useState<DumpReturnState>({ enabled: false, estimatedDriveMinutes: 60, estimatedDumpFee: 350, materialStream: 'general', notes: '', estimate: null });
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);

  const hasAccess = roles.some(r => ALLOWED_ROLES.includes(r));
  const isAdmin = hasAnyRole('admin', 'system_admin', 'ops_admin');
  const isFinanceOnly = role === 'finance' && !isAdmin;
  const userRole = role || 'sales';
  const roleInfo = ROLE_DISPLAY[userRole] || ROLE_DISPLAY.sales;

  const handleCalculate = useCallback(async (inputs: CalculatorInputsType & {
    delivery_date?: string;
    delivery_window?: string;
    access_notes?: string;
    zip_code?: string;
    city_name?: string;
  }) => {
    try {
      setLastInputs(inputs);
      // Look up the price from the official price list — prefer ZIP-based lookup
      const zipCode = inputs.zip_code || '';
      const cityName = inputs.city_name || '';
      let pResult: { price: number; cityFound?: boolean; zipFound?: boolean; cityUsed?: string; zip?: string };
      
      if (zipCode) {
        const zipResult = getPriceByZip(zipCode, inputs.dumpster_size, inputs.material_category);
        if (zipResult.zipFound && zipResult.price > 0) {
          pResult = { price: zipResult.price, cityFound: true, cityUsed: cityName || `ZIP ${zipCode}` };
        } else {
          pResult = getPriceFromList(cityName, inputs.dumpster_size, inputs.material_category);
        }
      } else {
        pResult = getPriceFromList(cityName, inputs.dumpster_size, inputs.material_category);
      }
      setPriceInfo(pResult as any);
      await calculate(inputs);
    } catch (err) {
      console.error('Calculator error:', err);
    }
  }, [calculate]);

  const handleSave = useCallback(async () => {
    if (isFinanceOnly) {
      toast({ title: 'Read Only', description: 'Finance role cannot save estimates.', variant: 'destructive' });
      return;
    }
    const saved = await saveEstimate();
    if (saved) {
      toast({ title: 'Estimate Saved', description: `Estimate ID: ${saved.id.slice(0, 8)}...` });
    }
  }, [saveEstimate, toast, isFinanceOnly]);

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

  const handleAddExtra = useCallback((extra: SelectedExtra) => {
    setSelectedExtras(prev => [...prev, extra]);
  }, []);

  const handleRemoveExtra = useCallback((code: string) => {
    setSelectedExtras(prev => prev.filter(e => e.catalogItem.code !== code));
  }, []);

  const showVendorFinder = result && (result.is_blocked || !result.success);

  // Compute extras total
  const extrasTotal = selectedExtras.reduce((sum, e) => sum + (e.unitPrice * e.quantity), 0);
  const liveLoadTotal = liveLoadState.enabled ? liveLoadState.extraCharge : 0;
  const finalPrice = (priceInfo?.price || 0) + extrasTotal + liveLoadTotal;
  const includedTons = lastInputs ? (INCLUDED_TONS[lastInputs.dumpster_size] || 4) : 4;

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
              <p className="text-sm text-muted-foreground mt-2">
                The Master Calculator is available to Sales, CS, Dispatch, and Admin staff.
                {user ? ` Your current role (${role || 'none'}) does not have access.` : ' Please sign in first.'}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 items-center">
              {user ? (
                <Button onClick={handleRequestAccess}>Request Access</Button>
              ) : (
                <Button onClick={() => navigate('/admin/login')}>Sign In</Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>Return to Dashboard</Button>
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
                  <p className="text-xs text-muted-foreground">Official Price List</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {result && (
                  <Button variant="ghost" size="sm" onClick={() => { reset(); setPriceInfo(null); }} className="text-xs">
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
            <div className="lg:col-span-4 space-y-4">
              <MasterCalculatorInputs
                onCalculate={handleCalculate}
                isCalculating={isCalculating}
                userRole={userRole}
              />
              <LiveLoadPanel onStateChange={setLiveLoadState} />
              <DumpReturnPanel onStateChange={setDumpReturnState} />
              <ExtrasLibraryPanel
                selectedExtras={selectedExtras}
                onAddExtra={handleAddExtra}
                onRemoveExtra={handleRemoveExtra}
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
                      customerPrice={priceInfo?.price || 0}
                      userRole={userRole}
                      customerType={lastInputs.customer_type || 'homeowner'}
                      isSameDay={lastInputs.is_same_day || false}
                      accessNotes={lastInputs.access_notes}
                    />
                  )}

                  {/* Card 2: Single Price from Official Price List */}
                  {result.success && !result.is_blocked && priceInfo && (
                    <>
                      <Card className="border-primary/30">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-primary" />
                              Customer Price
                            </CardTitle>
                            {!priceInfo.cityFound && (
                              <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                City not found — using Oakland default
                              </Badge>
                            )}
                            {priceInfo.cityFound && (
                              <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {priceInfo.cityUsed.replace(/\b\w/g, c => c.toUpperCase())}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Main Price */}
                          <div className="bg-primary/5 rounded-xl p-6 text-center">
                            <p className="text-sm text-muted-foreground mb-1">
                              {lastInputs?.dumpster_size}yd {lastInputs?.material_category === 'HEAVY' ? 'Heavy' : 'General Debris'}
                            </p>
                            <p className="text-5xl font-bold text-foreground tracking-tight">
                              ${priceInfo.price.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Includes delivery, pickup, {includedTons} ton{includedTons !== 1 ? 's' : ''}, 7 business days
                            </p>
                          </div>

                          {/* Add-ons breakdown */}
                          {(extrasTotal > 0 || liveLoadTotal > 0) && (
                            <div className="space-y-2 border-t pt-3">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Add-ons</p>
                              {selectedExtras.map(e => (
                                <div key={e.catalogItem.code} className="flex justify-between text-sm">
                                  <span>{e.catalogItem.name} x{e.quantity}</span>
                                  <span className="font-medium">${(e.unitPrice * e.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                              {liveLoadTotal > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span>Live Load ({liveLoadState.estimatedMinutes} min)</span>
                                  <span className="font-medium">${liveLoadTotal.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                                <span>Total</span>
                                <span>${finalPrice.toLocaleString()}</span>
                              </div>
                            </div>
                          )}

                          {/* Details row */}
                          <div className="grid grid-cols-3 gap-3 text-center border-t pt-3">
                            <div>
                              <Package className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                              <p className="text-sm font-semibold">{lastInputs?.dumpster_size}yd</p>
                              <p className="text-xs text-muted-foreground">Container</p>
                            </div>
                            <div>
                              <DollarSign className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                              <p className="text-sm font-semibold">{includedTons}T</p>
                              <p className="text-xs text-muted-foreground">Included</p>
                            </div>
                            <div>
                              <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                              <p className="text-sm font-semibold">7 days</p>
                              <p className="text-xs text-muted-foreground">Rental</p>
                            </div>
                          </div>

                          {/* Save button */}
                          {!isFinanceOnly && (
                            <Button onClick={handleSave} className="w-full" size="lg">
                              Save Estimate
                            </Button>
                          )}
                        </CardContent>
                      </Card>

                      <DispatchPlanCard
                        estimate={result.estimate}
                        userRole={userRole}
                      />

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
                      The price shown comes from the official price list.
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
            <p className="text-xs text-muted-foreground">
              Internal use only. Prices from official META 2026 price list. All actions are logged for audit.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
