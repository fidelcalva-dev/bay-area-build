/**
 * Admin Pricing Simulator — Test smart pricing for any address/material/size
 * Includes zone surcharges, rush delivery, contractor tiers, and extras
 */
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { calculateSmartQuoteFromZip, type SmartQuote } from '@/lib/smartPricingEngine';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Truck, Warehouse, Scale, DollarSign, AlertTriangle, CheckCircle, Loader2, Zap, Users, Layers, ListChecks } from 'lucide-react';

const MATERIAL_OPTIONS = [
  { value: 'GENERAL_DEBRIS', label: 'General Debris' },
  { value: 'CLEAN_SOIL', label: 'Clean Soil' },
  { value: 'CLEAN_CONCRETE', label: 'Clean Concrete' },
  { value: 'MIXED_SOIL', label: 'Mixed Soil' },
  { value: 'ROOFING', label: 'Roofing' },
  { value: 'YARD_WASTE', label: 'Yard Waste' },
  { value: 'MIXED_CONSTRUCTION', label: 'Mixed C&D' },
];

const SIZE_OPTIONS = [5, 8, 10, 20, 30, 40, 50];

const RUSH_OPTIONS = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'NEXT_DAY', label: 'Next Day' },
  { value: 'PRIORITY_NEXT_DAY', label: 'Priority Next Day ($45)' },
  { value: 'SAME_DAY', label: 'Same Day (size-based)' },
  { value: 'AFTER_HOURS', label: 'After Hours / Holiday ($195)' },
];

const TIER_OPTIONS = [
  { value: 'RETAIL', label: 'Retail' },
  { value: 'CONTRACTOR_TIER_1', label: 'Contractor T1' },
  { value: 'CONTRACTOR_TIER_2', label: 'Contractor T2' },
  { value: 'COMMERCIAL_ACCOUNT', label: 'Commercial' },
  { value: 'MANUAL_RATE_CARD', label: 'Manual' },
];

interface ExtraCatalogItem {
  code: string;
  label: string;
  category: string;
  default_amount: number;
}

export default function PricingSimulator() {
  const [zip, setZip] = useState('');
  const [material, setMaterial] = useState('GENERAL_DEBRIS');
  const [size, setSize] = useState(20);
  const [greenHalo, setGreenHalo] = useState(false);
  const [rushState, setRushState] = useState<'STANDARD' | 'NEXT_DAY' | 'PRIORITY_NEXT_DAY' | 'SAME_DAY' | 'PRIORITY' | 'AFTER_HOURS'>('STANDARD');
  const [contractorTier, setContractorTier] = useState('RETAIL');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extras
  const [extrasCatalog, setExtrasCatalog] = useState<ExtraCatalogItem[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  useEffect(() => {
    supabase.from('extra_items').select('code, label, category, default_amount').eq('is_active', true).order('display_order')
      .then(({ data }) => setExtrasCatalog((data as any[]) || []));
  }, []);

  function toggleExtra(code: string) {
    setSelectedExtras(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  }

  const runSimulation = async () => {
    if (zip.length !== 5) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const quote = await calculateSmartQuoteFromZip(zip, material, size, {
        greenHaloRequired: greenHalo,
        isContractor: contractorTier !== 'RETAIL',
        contractorTier: contractorTier !== 'RETAIL' ? contractorTier : undefined,
        rushState,
        isSameDay: rushState === 'SAME_DAY',
        extraCodes: selectedExtras,
      });

      if (!quote) {
        setError('No pricing available for this combination. Check yard/dump site coverage.');
      } else {
        setResult(quote);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Smart Pricing Simulator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Test location-aware pricing: yard, zone, dump site, rush, contractor tier, extras, and cost engine output.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 p-4 rounded-xl border border-border bg-card">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ZIP Code</label>
          <Input placeholder="94612" value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))} className="h-10" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Material</label>
          <Select value={material} onValueChange={setMaterial}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>{MATERIAL_OPTIONS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Size (yd)</label>
          <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>{SIZE_OPTIONS.map((s) => <SelectItem key={s} value={String(s)}>{s} yd</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rush State</label>
          <Select value={rushState} onValueChange={(v) => setRushState(v as any)}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>{RUSH_OPTIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contractor Tier</label>
          <Select value={contractorTier} onValueChange={setContractorTier}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>{TIER_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex flex-col justify-end gap-2 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <Checkbox id="gh" checked={greenHalo} onCheckedChange={(v) => setGreenHalo(v === true)} />
            <label htmlFor="gh" className="text-xs text-muted-foreground">Green Halo</label>
          </div>
        </div>
      </div>

      {/* Extras toggles */}
      {extrasCatalog.length > 0 && (
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs font-bold text-foreground uppercase mb-2 flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5" /> Extras & Exceptions
          </p>
          <div className="flex flex-wrap gap-2">
            {extrasCatalog.map(e => (
              <button
                key={e.code}
                onClick={() => toggleExtra(e.code)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  selectedExtras.includes(e.code)
                    ? 'bg-primary/10 border-primary text-primary font-medium'
                    : 'bg-muted border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {e.label} {Number(e.default_amount) > 0 ? `($${e.default_amount})` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button onClick={runSimulation} disabled={zip.length !== 5 || loading} className="w-full h-12">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <DollarSign className="w-4 h-4 mr-2" />}
        Run Simulation
      </Button>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Public Output */}
          <div className="p-5 rounded-xl border-2 border-primary bg-primary/5">
            <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2">Customer-Facing Output</p>
            <div className="text-4xl font-bold text-foreground">
              ${result.publicPriceLow.toLocaleString()} — ${result.publicPriceHigh.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {result.isFlatFee
                ? `${size} Yard Heavy Material — Flat rate includes delivery, pickup, and disposal`
                : `${size} Yard — ${result.includedTons}T included, $${result.overweightFeePerTon}/ton overage`}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {result.rushFee > 0 && <Badge variant="secondary">Rush: +${result.rushFee}</Badge>}
              {result.zoneSurchargeAmount > 0 && <Badge variant="secondary">Zone: +${result.zoneSurchargeAmount}</Badge>}
              {result.contractorDiscount > 0 && <Badge variant="default">Contractor: -{result.contractorDiscount}%</Badge>}
              {result.extrasTotal > 0 && <Badge variant="secondary">Extras: +${result.extrasTotal}</Badge>}
              {result.lowMarginWarning && <Badge variant="destructive">Low Margin</Badge>}
              {result.isManualReview && <Badge variant="destructive">Manual Review</Badge>}
            </div>
          </div>

          {/* Internal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Yard */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Warehouse className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-foreground uppercase">Selected Yard</p>
              </div>
              <p className="font-semibold text-foreground">{result.yard?.yard?.name || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">{result.yard?.yard?.city}, {result.yard?.yard?.state}</p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>Distance: {result.yard?.distanceMiles?.toFixed(1)} mi</p>
                <p>Delivery: ${result.yard?.deliveryFee}</p>
                <p>Pickup: ${result.yard?.pickupFee}</p>
                <p>Zone adj: +${result.yard?.zoneAdjustment}</p>
              </div>
              {result.outsideServiceRadius && (
                <p className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Outside service radius
                </p>
              )}
            </div>

            {/* Zone & Rush & Contractor */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-foreground uppercase">Zone / Rush / Tier</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Zone</span><span className="font-medium">{result.zoneSurcharge?.zone_name || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Zone Surcharge</span><span>${result.zoneSurchargeAmount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Remote</span><span>{result.zoneSurcharge?.remote_area_flag ? 'Yes' : 'No'}</span></div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Rush State</span><span className="font-medium">{result.rushState}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rush Fee</span><span>${result.rushFee}</span></div>
                </div>
                {result.contractorTier && result.contractorTier !== 'RETAIL' && (
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Contractor Tier</span><span className="font-medium">{result.contractorTier}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>{result.contractorDiscount}%</span></div>
                  </div>
                )}
              </div>
            </div>

            {/* Dump Site */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-foreground uppercase">Dump Site</p>
              </div>
              <p className="font-semibold text-foreground">{result.dumpSite?.site?.name || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">{result.dumpSite?.site?.city} — {result.dumpSite?.site?.type}</p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>From job: {result.dumpSite?.distanceFromJobMiles} mi</p>
                <p>From yard: {result.dumpSite?.distanceFromYardMiles} mi</p>
                <p>Dump cost: ${result.dumpSite?.dumpCostBasis}/ton</p>
                <p>Contamination: ${result.dumpSite?.surchargeRules?.contamination}</p>
                <p>Reroute: ${result.dumpSite?.surchargeRules?.reroute}</p>
              </div>
              {result.greenHaloApplied && (
                <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Green Halo supported
                </p>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-foreground uppercase">Internal Cost</p>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>${result.internalCost.delivery}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pickup</span><span>${result.internalCost.pickup}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dump Fee</span><span>${result.internalCost.dumpFee}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Fuel</span><span>${result.internalCost.fuel}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Labor</span><span>${result.internalCost.labor}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Overhead</span><span>${result.internalCost.overhead}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Route adj</span><span>${result.internalCost.routeAdjustment}</span></div>
                {result.internalCost.greenHaloCost > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Green Halo</span><span>${result.internalCost.greenHaloCost}</span></div>
                )}
                <div className="flex justify-between border-t border-border pt-1.5 font-bold">
                  <span>Total Internal</span><span>${result.internalCost.totalInternal}</span>
                </div>
                <div className="flex justify-between text-primary font-semibold">
                  <span>Margin</span><span>{result.marginPct}%</span>
                </div>
                {result.surgeMultiplier > 1 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Surge</span><span>{result.surgeMultiplier}x ({result.capacityUtilization}%)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Extras applied */}
          {result.extras.length > 0 && (
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-xs font-bold text-foreground uppercase mb-2 flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-primary" /> Extras Applied (${result.extrasTotal})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {result.extras.map(e => (
                  <div key={e.code} className="flex justify-between text-xs p-2 rounded bg-muted/50">
                    <span>{e.label}</span>
                    <span className="font-medium">{e.amount > 0 ? `$${e.amount}` : e.pricing_mode}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/20">
              <p className="text-xs font-bold text-amber-700 uppercase mb-2">Warnings & Notes</p>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
