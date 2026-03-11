/**
 * Admin Pricing Engine Dashboard
 * Unified control panel for the dynamic pricing engine:
 * - Pricing rules (delivery, margin, surge)
 * - Dump fee references
 * - Material rules
 * - Vendor marketplace
 * - Pricing simulator
 */
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateSmartQuoteFromZip, type SmartQuote } from '@/lib/smartPricingEngine';
import { GENERAL_DEBRIS_SIZES, HEAVY_MATERIAL, POLICIES, formatPrice } from '@/config/pricingConfig';
import {
  Settings, Truck, Warehouse, Scale, DollarSign, AlertTriangle,
  CheckCircle, Loader2, MapPin, Zap, Users, Save, RefreshCw,
} from 'lucide-react';

// ─── Pricing Rules Tab ───────────────────────────────────
function PricingRulesTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState({
    base_delivery_cost: '85',
    base_pickup_cost: '65',
    per_mile_cost: '2',
    per_mile_threshold: '15',
    overweight_cost_per_ton: '165',
    minimum_margin_percent: '15',
    surge_threshold_pct: '85',
    surge_multiplier: '1.08',
    same_day_premium: '100',
    contamination_surcharge: '150',
    reroute_surcharge: '150',
    extra_day_fee: '35',
    standard_rental_days: '7',
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      if (data) {
        setRules({
          base_delivery_cost: String(data.base_delivery_cost),
          base_pickup_cost: String(data.base_pickup_cost),
          per_mile_cost: String(data.per_mile_cost),
          per_mile_threshold: String(data.per_mile_threshold),
          overweight_cost_per_ton: String(data.overweight_cost_per_ton),
          minimum_margin_percent: String(data.minimum_margin_percent),
          surge_threshold_pct: String(data.surge_threshold_pct),
          surge_multiplier: String(data.surge_multiplier),
          same_day_premium: String(data.same_day_premium),
          contamination_surcharge: String(data.contamination_surcharge),
          reroute_surcharge: String(data.reroute_surcharge),
          extra_day_fee: String(data.extra_day_fee),
          standard_rental_days: String(data.standard_rental_days),
        });
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('pricing_rules')
      .update({
        base_delivery_cost: parseFloat(rules.base_delivery_cost),
        base_pickup_cost: parseFloat(rules.base_pickup_cost),
        per_mile_cost: parseFloat(rules.per_mile_cost),
        per_mile_threshold: parseFloat(rules.per_mile_threshold),
        overweight_cost_per_ton: parseFloat(rules.overweight_cost_per_ton),
        minimum_margin_percent: parseFloat(rules.minimum_margin_percent),
        surge_threshold_pct: parseFloat(rules.surge_threshold_pct),
        surge_multiplier: parseFloat(rules.surge_multiplier),
        same_day_premium: parseFloat(rules.same_day_premium),
        contamination_surcharge: parseFloat(rules.contamination_surcharge),
        reroute_surcharge: parseFloat(rules.reroute_surcharge),
        extra_day_fee: parseFloat(rules.extra_day_fee),
        standard_rental_days: parseInt(rules.standard_rental_days),
        updated_at: new Date().toISOString(),
      })
      .eq('rule_name', 'default');
    setSaving(false);
    if (error) {
      toast({ title: 'Error saving rules', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Pricing rules saved' });
    }
  };

  if (loading) return <div className="flex items-center gap-2 p-4"><Loader2 className="w-4 h-4 animate-spin" /> Loading rules...</div>;

  const fields: { key: keyof typeof rules; label: string; prefix?: string; suffix?: string }[] = [
    { key: 'base_delivery_cost', label: 'Base Delivery Cost', prefix: '$' },
    { key: 'base_pickup_cost', label: 'Base Pickup Cost', prefix: '$' },
    { key: 'per_mile_cost', label: 'Per-Mile Cost', prefix: '$', suffix: '/mi' },
    { key: 'per_mile_threshold', label: 'Free Miles Threshold', suffix: 'mi' },
    { key: 'overweight_cost_per_ton', label: 'Overweight Cost', prefix: '$', suffix: '/ton' },
    { key: 'minimum_margin_percent', label: 'Min Margin', suffix: '%' },
    { key: 'surge_threshold_pct', label: 'Surge Threshold', suffix: '% utilization' },
    { key: 'surge_multiplier', label: 'Surge Multiplier', suffix: 'x' },
    { key: 'same_day_premium', label: 'Same-Day Premium', prefix: '$' },
    { key: 'contamination_surcharge', label: 'Contamination Surcharge', prefix: '$' },
    { key: 'reroute_surcharge', label: 'Reroute Surcharge', prefix: '$' },
    { key: 'extra_day_fee', label: 'Extra Day Fee', prefix: '$', suffix: '/day' },
    { key: 'standard_rental_days', label: 'Standard Rental', suffix: 'days' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map(f => (
          <div key={f.key} className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
            <div className="flex items-center gap-1">
              {f.prefix && <span className="text-sm text-muted-foreground">{f.prefix}</span>}
              <Input
                value={rules[f.key]}
                onChange={e => setRules(p => ({ ...p, [f.key]: e.target.value }))}
                className="h-8 text-sm"
              />
              {f.suffix && <span className="text-xs text-muted-foreground whitespace-nowrap">{f.suffix}</span>}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={saving} size="sm">
        <Save className="w-3.5 h-3.5 mr-1.5" />
        {saving ? 'Saving...' : 'Save Rules'}
      </Button>
    </div>
  );
}

// ─── Canonical Pricing Reference Tab ─────────────────────
function CanonicalPricingTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">General Debris Pricing</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2 font-medium">Size</th>
                <th className="text-left p-2 font-medium">Price</th>
                <th className="text-left p-2 font-medium">Included Tons</th>
                <th className="text-left p-2 font-medium">Best For</th>
              </tr>
            </thead>
            <tbody>
              {GENERAL_DEBRIS_SIZES.map(s => (
                <tr key={s.size} className="border-t">
                  <td className="p-2 font-medium">{s.size} yd</td>
                  <td className="p-2">{formatPrice(s.price)}</td>
                  <td className="p-2">{s.includedTons}T</td>
                  <td className="p-2 text-muted-foreground">{s.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Heavy Material Pricing (Flat Fee)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(HEAVY_MATERIAL).map(([key, mat]) => (
            <div key={key} className="border rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
              <div className="space-y-1">
                {mat.allowedSizes.map(size => (
                  <div key={size} className="flex justify-between text-sm">
                    <span>{size} yd</span>
                    <span className="font-medium">{formatPrice(mat.prices[size])}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-3 bg-muted/30">
        <h3 className="text-sm font-semibold mb-2">Policies</h3>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>• Overweight: {formatPrice(POLICIES.overweightCostPerTon)}/ton</p>
          <p>• Contamination: {formatPrice(POLICIES.contaminationFee)} surcharge</p>
          <p>• Reroute: {formatPrice(POLICIES.misdeclaredMaterialFee)} surcharge</p>
          <p>• Extra days: {formatPrice(POLICIES.extraDayCost)}/day</p>
          <p>• Standard rental: {POLICIES.standardRentalDays} days</p>
        </div>
      </div>
    </div>
  );
}

// ─── Simulator Tab ───────────────────────────────────────
function SimulatorTab() {
  const [zip, setZip] = useState('');
  const [material, setMaterial] = useState('GENERAL_DEBRIS');
  const [size, setSize] = useState(20);
  const [greenHalo, setGreenHalo] = useState(false);
  const [isContractor, setIsContractor] = useState(false);
  const [isSameDay, setIsSameDay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (zip.length !== 5) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const quote = await calculateSmartQuoteFromZip(zip, material, size, {
        greenHaloRequired: greenHalo,
        isContractor,
        contractorDiscountPct: isContractor ? 3 : undefined,
        isSameDay,
      });
      if (!quote) setError('No pricing available. Check yard/dump site coverage.');
      else setResult(quote);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const materials = [
    'GENERAL_DEBRIS', 'CLEAN_SOIL', 'CLEAN_CONCRETE', 'MIXED_SOIL', 'ROOFING', 'YARD_WASTE', 'MIXED_CONSTRUCTION',
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">ZIP Code</label>
          <Input value={zip} onChange={e => setZip(e.target.value)} placeholder="94601" className="h-8" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Material</label>
          <select
            value={material}
            onChange={e => setMaterial(e.target.value)}
            className="h-8 w-full rounded-md border bg-background px-2 text-sm"
          >
            {materials.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Size (yd)</label>
          <select
            value={size}
            onChange={e => setSize(Number(e.target.value))}
            className="h-8 w-full rounded-md border bg-background px-2 text-sm"
          >
            {[5, 8, 10, 20, 30, 40, 50].map(s => <option key={s} value={s}>{s} yd</option>)}
          </select>
        </div>
        <div className="space-y-2 pt-4">
          <div className="flex items-center gap-2">
            <Switch checked={greenHalo} onCheckedChange={setGreenHalo} />
            <span className="text-xs">Green Halo</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isContractor} onCheckedChange={setIsContractor} />
            <span className="text-xs">Contractor</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isSameDay} onCheckedChange={setIsSameDay} />
            <span className="text-xs">Same-Day</span>
          </div>
        </div>
      </div>

      <Button onClick={run} disabled={loading || zip.length !== 5} size="sm">
        {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 mr-1.5" />}
        Run Simulation
      </Button>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Public Price */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Public Price
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">${result.publicPriceLow} – ${result.publicPriceHigh}</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Margin: {result.marginPct}%</p>
                <p>Included tons: {result.includedTons}T</p>
                <p>Flat fee: {result.isFlatFee ? 'Yes' : 'No'}</p>
                {result.surgeMultiplier > 1 && (
                  <p className="text-amber-600">Surge: {result.surgeMultiplier}x ({result.capacityUtilization}% util)</p>
                )}
                {result.isVendorFallback && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">Vendor: {result.vendorName}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Internal Cost */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Scale className="w-4 h-4" /> Internal Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs">
                {Object.entries(result.internalCost).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium">${(v as number).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          {result.yard && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Warehouse className="w-4 h-4" /> Yard
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <p className="font-medium">{result.yard.yard.name}</p>
                <p>{result.yard.distanceMiles.toFixed(1)} mi from job</p>
                <p>Delivery: ${result.yard.deliveryFee} | Pickup: ${result.yard.pickupFee}</p>
              </CardContent>
            </Card>
          )}

          {result.dumpSite && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Dump Site
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <p className="font-medium">{result.dumpSite.site.name}</p>
                <p>{result.dumpSite.distanceFromJobMiles} mi from job | {result.dumpSite.distanceFromYardMiles} mi from yard</p>
                <p>Dump fee: ${result.dumpSite.dumpCostBasis}/ton</p>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="md:col-span-2 space-y-1">
              {result.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-md px-2 py-1.5">
                  <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /> {w}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────
export default function PricingEngineDashboard() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5" /> Pricing Engine
          </h1>
          <p className="text-sm text-muted-foreground">
            Dynamic pricing control — yards, dump sites, margins, and simulator
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <CheckCircle className="w-3 h-3 text-green-500" /> Engine Active
        </Badge>
      </div>

      <Tabs defaultValue="simulator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="simulator" className="gap-1.5"><Zap className="w-3.5 h-3.5" /> Simulator</TabsTrigger>
          <TabsTrigger value="rules" className="gap-1.5"><Settings className="w-3.5 h-3.5" /> Rules</TabsTrigger>
          <TabsTrigger value="reference" className="gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Price Simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <SimulatorTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Pricing Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <PricingRulesTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reference">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Canonical Pricing Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <CanonicalPricingTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
