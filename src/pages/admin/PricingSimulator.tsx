/**
 * Admin Pricing Simulator — Test smart pricing for any address/material/size
 */
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { calculateSmartQuoteFromZip, type SmartQuote } from '@/lib/smartPricingEngine';
import { MapPin, Truck, Warehouse, Scale, DollarSign, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

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

export default function PricingSimulator() {
  const [zip, setZip] = useState('');
  const [material, setMaterial] = useState('GENERAL_DEBRIS');
  const [size, setSize] = useState(20);
  const [greenHalo, setGreenHalo] = useState(false);
  const [isContractor, setIsContractor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async () => {
    if (zip.length !== 5) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const quote = await calculateSmartQuoteFromZip(zip, material, size, {
        greenHaloRequired: greenHalo,
        isContractor,
        contractorDiscountPct: isContractor ? 3 : undefined,
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Smart Pricing Simulator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Test location-aware pricing: yard selection, dump site routing, cost engine, and public price output.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-border bg-card">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ZIP Code</label>
          <Input
            placeholder="94612"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            className="h-10"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Material</label>
          <Select value={material} onValueChange={setMaterial}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MATERIAL_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Size (yd)</label>
          <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>{s} yd</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col justify-end gap-2">
          <div className="flex items-center gap-2">
            <Checkbox id="gh" checked={greenHalo} onCheckedChange={(v) => setGreenHalo(v === true)} />
            <label htmlFor="gh" className="text-xs text-muted-foreground">Green Halo</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="ctr" checked={isContractor} onCheckedChange={(v) => setIsContractor(v === true)} />
            <label htmlFor="ctr" className="text-xs text-muted-foreground">Contractor</label>
          </div>
        </div>
      </div>

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
            {result.isManualReview && (
              <p className="text-xs text-amber-600 font-semibold mt-1">⚠ Requires manual pricing approval</p>
            )}
          </div>

          {/* Internal Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Yard */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Warehouse className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-foreground uppercase">Selected Yard</p>
              </div>
              <p className="font-semibold text-foreground">{result.yard.yard.name}</p>
              <p className="text-xs text-muted-foreground">{result.yard.yard.city}, {result.yard.yard.state}</p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>Distance: {result.yard.distanceMiles.toFixed(1)} mi</p>
                <p>Delivery: ${result.yard.deliveryFee}</p>
                <p>Pickup: ${result.yard.pickupFee}</p>
                <p>Zone adj: +${result.yard.zoneAdjustment}</p>
              </div>
              {result.outsideServiceRadius && (
                <p className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Outside service radius
                </p>
              )}
            </div>

            {/* Dump Site */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-foreground uppercase">Selected Dump Site</p>
              </div>
              <p className="font-semibold text-foreground">{result.dumpSite.site.name}</p>
              <p className="text-xs text-muted-foreground">{result.dumpSite.site.city} — {result.dumpSite.site.type}</p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>From job: {result.dumpSite.distanceFromJobMiles} mi</p>
                <p>From yard: {result.dumpSite.distanceFromYardMiles} mi</p>
                <p>Dump cost: ${result.dumpSite.dumpCostBasis}/ton</p>
                <p>Contamination: ${result.dumpSite.surchargeRules.contamination}</p>
                <p>Reroute: ${result.dumpSite.surchargeRules.reroute}</p>
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
                  <span>Total Internal</span>
                  <span>${result.internalCost.totalInternal}</span>
                </div>
                <div className="flex justify-between text-primary font-semibold">
                  <span>Margin</span>
                  <span>{result.marginPct}%</span>
                </div>
              </div>
            </div>
          </div>

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
