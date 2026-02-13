// ============================================================
// V3 QUOTE FLOW — Uber-style conversion-optimized calculator
// ZIP → Customer Type → Project → Size → Price → Confirm
// ============================================================

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  MapPin, ChevronRight, ChevronLeft, Phone, User, Mail, Loader2,
  CheckCircle, Shield, Clock, Truck, Home, HardHat, Building2,
  Warehouse, UtensilsCrossed, Trees, Hammer, Mountain, Construction,
  DoorOpen, Store, RefreshCw, Scale, Calendar, Star, Info, RotateCcw, SkipForward,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAutoDetectZip } from '@/hooks/useAutoDetectZip';
import { supabase } from '@/integrations/supabase/client';
import { saveQuote } from '@/lib/vendorSelection';
import { validateAndFormatPhone } from '@/lib/phoneUtils';
import { analytics } from '@/lib/analytics';
import { PRICING_POLICIES, INCLUDED_TONS_BY_SIZE } from '@/lib/shared-data';
import { DUMPSTER_PHOTO_MAP } from '@/lib/canonicalDumpsterImages';

import { usePricingData, calculateIncludedTons } from '../hooks/usePricingData';
import { useDistanceCalculation } from '../hooks/useDistanceCalculation';
import { PRICING_ZONES } from '../constants';
import { ProgressBar6 } from '../ui/ProgressBar6';
import { BadgePill } from '../ui/BadgePill';

import type { V3Step, CustomerType, ProjectCard } from './types';
import { getProjectsForCustomerType } from './types';
import { ServiceTimeBreakdown, buildServiceTimeEstimate } from './ServiceTimeBreakdown';
import {
  getStepTitles, getButtons, getPriceMomentCopy, getPlacementCopy, getEtaCopy,
  YARD_SELECTED_LINE, ZIP_NOT_SERVICEABLE, PLACEMENT_MAP_UNAVAILABLE,
  QUOTE_SAVED_TITLE, ORDER_CONFIRMED_TITLE, ORDER_CONFIRMED_SUBTITLE,
  SWAP_ACTIVE, SWAP_PROMPT, HEAVY_FILL_LINE_TITLE, HEAVY_FILL_LINE_DESC,
  HEAVY_SIZE_NOTE, FLAT_FEE_LABEL, FACILITY_AUTO_SELECTED, DELIVERY_TIME_FALLBACK,
} from './copy';

// Lazy load placement map
const PlacementMap = lazy(() =>
  import('../steps/PlacementMap').then((m) => ({ default: m.PlacementMap }))
);

// ============================================================
// ICON MAP
// ============================================================
const ICON_MAP: Record<string, React.ElementType> = {
  'warehouse': Warehouse,
  'utensils-crossed': UtensilsCrossed,
  'home': Home,
  'trees': Trees,
  'hammer': Hammer,
  'hard-hat': HardHat,
  'mountain': Mountain,
  'construction': Construction,
  'door-open': DoorOpen,
  'store': Store,
  'refresh-cw': RefreshCw,
};

// ============================================================
// ZONE RESULT
// ============================================================
interface ZoneResult {
  zoneId: string;
  zoneName: string;
  cityName?: string;
  multiplier: number;
}

// ============================================================
// COMPONENT
// ============================================================
export function V3QuoteFlow() {
  const { toast } = useToast();
  const pricingData = usePricingData();
  const { sizes: DUMPSTER_SIZES } = pricingData;

  // Step state
  const [step, setStep] = useState<V3Step>('zip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingZip, setIsCheckingZip] = useState(false);
  const [zoneResult, setZoneResult] = useState<ZoneResult | null>(null);
  const [stepStartTime, setStepStartTime] = useState(Date.now());

  // Form state
  const [zip, setZip] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectCard | null>(null);
  const [size, setSize] = useState(20);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Auto-detect ZIP
  const autoDetectZip = useAutoDetectZip();

  useEffect(() => {
    if (!zip && autoDetectZip.status === 'idle') {
      autoDetectZip.detectZip();
    }
  }, []);

  useEffect(() => {
    if (autoDetectZip.zip && autoDetectZip.zip.length === 5 && !zip) {
      setZip(autoDetectZip.zip);
    }
  }, [autoDetectZip.zip]);

  // Distance calculation
  const distanceCalc = useDistanceCalculation(zip);

  // Track step timing
  useEffect(() => {
    setStepStartTime(Date.now());
  }, [step]);

  // Zone lookup
  const lookupZone = useCallback(async (zipCode: string) => {
    if (zipCode.length !== 5) { setZoneResult(null); return; }
    setIsCheckingZip(true);
    try {
      const { data, error } = await supabase
        .from('zone_zip_codes')
        .select(`zone_id, city_name, zone:pricing_zones!inner(id, name, base_multiplier, is_active)`)
        .eq('zip_code', zipCode)
        .maybeSingle();

      if (!error && data && (data.zone as any)?.is_active) {
        setZoneResult({
          zoneId: data.zone_id,
          zoneName: (data.zone as any).name,
          cityName: data.city_name || undefined,
          multiplier: Number((data.zone as any).base_multiplier),
        });
        return;
      }
      for (const zone of PRICING_ZONES) {
        if (zone.zipCodes.includes(zipCode)) {
          setZoneResult({ zoneId: zone.id, zoneName: zone.name, cityName: undefined, multiplier: zone.baseMultiplier });
          return;
        }
      }
      setZoneResult(null);
    } catch { setZoneResult(null); } finally { setIsCheckingZip(false); }
  }, []);

  useEffect(() => {
    if (zip.length === 5) lookupZone(zip);
    else setZoneResult(null);
  }, [zip, lookupZone]);

  // Derived state
  const isHeavy = selectedProject?.isHeavy ?? false;
  const materialTypeForPricing = isHeavy ? 'heavy' : 'general';

  // Auto-adjust size for heavy materials
  useEffect(() => {
    if (isHeavy && size > 10) setSize(10);
  }, [isHeavy, size]);

  // Available sizes
  const availableSizes = useMemo(() => {
    if (isHeavy) return [6, 8, 10];
    return [10, 20, 30, 40];
  }, [isHeavy]);

  // Recommended + alternatives
  const recommendedSize = selectedProject?.suggestedSize ?? 20;
  const alternativeSizes = useMemo(() => {
    const rec = recommendedSize;
    const smaller = availableSizes.filter(s => s < rec).slice(-1)[0];
    const larger = availableSizes.filter(s => s > rec)[0];
    return { smaller, larger };
  }, [recommendedSize, availableSizes]);

  // Calculate quote
  const quote = useMemo(() => {
    if (!zoneResult) return { subtotal: 0, includedTons: 0, isValid: false, isFlatFee: false };
    const sizeData = DUMPSTER_SIZES.find(s => s.value === size);
    if (!sizeData) return { subtotal: 0, includedTons: 0, isValid: false, isFlatFee: false };

    const isFlatFee = isHeavy;
    const includedTons = isFlatFee ? 0 : calculateIncludedTons(size, materialTypeForPricing);
    let subtotal = Math.round(sizeData.basePrice * zoneResult.multiplier);
    if (isHeavy) subtotal += 200;
    if (distanceCalc.distance?.priceAdjustment) subtotal += distanceCalc.distance.priceAdjustment;

    return { subtotal, includedTons, isValid: true, isFlatFee };
  }, [size, zoneResult, DUMPSTER_SIZES, distanceCalc.distance, isHeavy, materialTypeForPricing]);

  // Step index for progress
  const stepIndex = useMemo(() => {
    const map: Record<V3Step, number> = { zip: 1, 'customer-type': 2, project: 3, size: 4, price: 5, confirm: 6, placement: 7 };
    return Math.min(map[step], 6); // Progress bar shows 6 max
  }, [step]);

  // Swap toggle
  const [wantsSwap, setWantsSwap] = useState(false);

  // Navigation
  const goNext = () => {
    const duration = Date.now() - stepStartTime;
    analytics.quoteStepComplete(step, duration);
    const next: Record<V3Step, V3Step> = {
      zip: 'customer-type',
      'customer-type': 'project',
      project: 'size',
      size: 'price',
      price: 'confirm',
      confirm: 'placement',
      placement: 'placement',
    };
    setStep(next[step]);
  };

  const goBack = () => {
    const prev: Record<V3Step, V3Step> = {
      zip: 'zip',
      'customer-type': 'zip',
      project: 'customer-type',
      size: 'project',
      price: 'size',
      confirm: 'price',
      placement: 'confirm',
    };
    setStep(prev[step]);
  };

  // Handle project selection
  const handleProjectSelect = (project: ProjectCard) => {
    setSelectedProject(project);
    setSize(project.suggestedSize);
    setTimeout(() => setStep('size'), 200);
  };

  // Handle size tap (1-tap accept or change)
  const handleSizeSelect = (s: number) => {
    setSize(s);
    setTimeout(() => setStep('price'), 200);
  };

  // Save quote
  const handleSaveQuote = async () => {
    const phoneValidation = validateAndFormatPhone(customerPhone);
    if (!phoneValidation.valid) {
      toast({ title: 'Invalid Phone', description: phoneValidation.error, variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const sizeData = DUMPSTER_SIZES.find(s => s.value === size);
      const result = await saveQuote({
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone: phoneValidation.formatted,
        userType: customerType || 'homeowner',
        zipCode: zip,
        zoneId: zoneResult?.zoneId,
        materialType: materialTypeForPricing,
        rentalDays: 7,
        extras: [],
        subtotal: quote.subtotal,
        estimatedMin: quote.subtotal,
        estimatedMax: quote.subtotal + Math.round(quote.subtotal * 0.08),
        isCalsanFulfillment: true,
        customerLat: distanceCalc.geocoding?.lat,
        customerLng: distanceCalc.geocoding?.lng,
        yardId: distanceCalc.distance?.yard.id,
        distanceMiles: distanceCalc.distance?.distanceMiles,
      });

      if (result.success) {
        analytics.quoteCompleted(size, materialTypeForPricing, quote.subtotal);
        await supabase.functions.invoke('send-quote-summary', {
          body: {
            customerName,
            customerPhone: phoneValidation.formatted,
            sizeLabel: sizeData?.label || `${size} Yard`,
            materialType: materialTypeForPricing,
            rentalDays: 7,
            zipCode: zip,
            estimatedMin: quote.subtotal,
            estimatedMax: quote.subtotal + Math.round(quote.subtotal * 0.08),
            includedTons: quote.includedTons,
          },
        });
        toast({ title: 'Quote Saved', description: "We'll contact you within 15 minutes." });
        setStep('placement');
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to save quote', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSizeLabel = () => {
    const sizeData = DUMPSTER_SIZES.find(s => s.value === size);
    return sizeData?.label || `${size} Yard`;
  };

  // ETA display
  const etaDisplay = useMemo(() => {
    if (!distanceCalc.distance) return null;
    const d = distanceCalc.distance;
    const minMin = d.durationTrafficMin ?? Math.round(d.distanceMinutes * 0.85);
    const maxMin = d.durationTrafficMax ?? Math.round(d.distanceMinutes * 1.25);
    return `${minMin}-${maxMin} min from yard`;
  }, [distanceCalc.distance]);

  // Service time estimate
  const serviceTime = useMemo(() => {
    if (!distanceCalc.distance) return null;
    return buildServiceTimeEstimate({
      driveMinutes: distanceCalc.distance.distanceMinutes,
      driveToFacilityMinutes: Math.round(distanceCalc.distance.distanceMinutes * 0.8),
      returnMinutes: Math.round(distanceCalc.distance.distanceMinutes * 1.1),
      isSwap: wantsSwap,
    });
  }, [distanceCalc.distance, wantsSwap]);

  // Saved quote ID for placement
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);

  // Placement sub-state: 'prompt' (show buttons) | 'mapping' (show map) | 'done' (success)
  const [placementPhase, setPlacementPhase] = useState<'prompt' | 'mapping' | 'done'>('prompt');

  // Staff-only internal breakdown toggle (via ?internal=1 query param)
  const showInternalBreakdown = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('internal') === '1';
    } catch { return false; }
  }, []);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border" id="quote-calculator-v3">
      {/* Header */}
      <div className="bg-foreground px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-base text-background">Instant Quote</h3>
              <p className="text-xs text-background/60">60 seconds to your price</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-success/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <span className="text-xs font-medium text-success">Live</span>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar6 currentStep={stepIndex} totalSteps={6} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* ============================== */}
        {/* STEP 1: ZIP + YARD MATCH */}
        {/* ============================== */}
        {step === 'zip' && (
          <div className="space-y-5">
            <div>
            <h4 className="text-lg font-bold text-foreground mb-1">{getStepTitles().ZIP_STEP_TITLE}</h4>
              <p className="text-sm text-muted-foreground">{getStepTitles().ZIP_STEP_SUBTITLE}</p>
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                placeholder="94501"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                className="h-14 pl-12 text-lg font-semibold"
                autoFocus
              />
              {isCheckingZip && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
              )}
            </div>

            {/* Yard match confirmation */}
            {zoneResult && (
              <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <p className="font-semibold text-foreground text-sm">
                    {autoDetectZip.cityName || zoneResult.cityName || zoneResult.zoneName}
                  </p>
                </div>
                {distanceCalc.distance && (
                  <div className="ml-8 space-y-1">
                    <p className="text-xs text-success flex items-center gap-1.5">
                      <Warehouse className="w-3.5 h-3.5" />
                      {distanceCalc.distance.yard.name} ({distanceCalc.distance.distanceMiles.toFixed(1)} mi)
                    </p>
                    {etaDisplay && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Delivery ETA: {etaDisplay}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2 ml-8">
                  {YARD_SELECTED_LINE}
                </p>
              </div>
            )}

            {zip.length === 5 && !zoneResult && !isCheckingZip && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {ZIP_NOT_SERVICEABLE}
              </div>
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Shield, label: 'Licensed & Insured' },
                { icon: Clock, label: 'Same-day available' },
                { icon: Star, label: 'All-inclusive pricing' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {label}
                </div>
              ))}
            </div>

            <Button
              variant="cta"
              size="lg"
              className="w-full h-14"
              onClick={goNext}
              disabled={zip.length !== 5 || !zoneResult || isCheckingZip}
            >
              {getButtons().CONTINUE}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}

        {/* ============================== */}
        {/* STEP 2: CUSTOMER TYPE */}
        {/* ============================== */}
        {step === 'customer-type' && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">{getStepTitles().TYPE_STEP_TITLE}</h4>
              <p className="text-sm text-muted-foreground">{getStepTitles().TYPE_STEP_SUBTITLE}</p>
            </div>

            <div className="space-y-3">
              {([
                { type: 'homeowner' as CustomerType, icon: Home, label: 'Homeowner', desc: 'Cleanouts, remodels, yard work' },
                { type: 'contractor' as CustomerType, icon: HardHat, label: 'Contractor', desc: 'Demo, concrete, excavation' },
                { type: 'commercial' as CustomerType, icon: Building2, label: 'Commercial', desc: 'Warehouse, retail, ongoing' },
              ]).map(({ type, icon: Icon, label, desc }) => (
                <button
                  key={type}
                  onClick={() => {
                    setCustomerType(type);
                    setSelectedProject(null);
                    setTimeout(() => setStep('project'), 200);
                  }}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                    customerType === type
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* STEP 3: PROJECT PICKER */}
        {/* ============================== */}
        {step === 'project' && customerType && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">{getStepTitles().PROJECT_STEP_TITLE}</h4>
              <p className="text-sm text-muted-foreground">{getStepTitles().PROJECT_STEP_SUBTITLE}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {getProjectsForCustomerType(customerType).map((project) => {
                const IconComp = ICON_MAP[project.icon] || Truck;
                return (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2',
                      selectedProject?.id === project.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComp className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-semibold text-foreground text-sm leading-tight">{project.label}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{project.description}</p>
                    {project.isHeavy && (
                      <BadgePill variant="warning" size="sm">6-10 yd only</BadgePill>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* STEP 4: RECOMMENDED SIZE */}
        {/* ============================== */}
        {step === 'size' && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">{getStepTitles().SIZE_STEP_TITLE}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedProject?.label} — {isHeavy ? HEAVY_SIZE_NOTE : 'tap to select'}
              </p>
            </div>

            {/* Recommended size - hero card */}
            <button
              onClick={() => handleSizeSelect(recommendedSize)}
              className={cn(
                'w-full p-4 rounded-2xl border-2 transition-all relative',
                size === recommendedSize ? 'border-primary bg-primary/5' : 'border-primary/30 hover:border-primary'
              )}
            >
              <BadgePill variant="primary" className="absolute -top-2.5 left-4">Best fit</BadgePill>
              <div className="flex items-center gap-4 mt-1">
                <div className="w-20 h-16 flex items-center justify-center">
                  {DUMPSTER_PHOTO_MAP[recommendedSize] && (
                    <img
                      src={DUMPSTER_PHOTO_MAP[recommendedSize]}
                      alt={`${recommendedSize} yard dumpster`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-2xl font-bold text-foreground">{recommendedSize} <span className="text-sm font-normal text-muted-foreground">yard</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isHeavy
                      ? FLAT_FEE_LABEL
                      : `Includes ${INCLUDED_TONS_BY_SIZE[recommendedSize] || 2}T disposal`}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-primary shrink-0" />
              </div>
            </button>

            {/* Why this size */}
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-muted/40 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
              <span>
                {isHeavy
                  ? `${HEAVY_FILL_LINE_TITLE}. ${HEAVY_FILL_LINE_DESC.split('.')[0]}.`
                  : `Based on typical ${selectedProject?.label?.toLowerCase() || 'project'} volume. Most customers pick this size.`}
              </span>
            </div>

            {/* Alternatives */}
            <div className="grid grid-cols-2 gap-3">
              {alternativeSizes.smaller && (
                <button
                  onClick={() => handleSizeSelect(alternativeSizes.smaller!)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-center transition-all',
                    size === alternativeSizes.smaller ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  )}
                >
                  <div className="w-full h-10 flex items-center justify-center mb-2">
                    {DUMPSTER_PHOTO_MAP[alternativeSizes.smaller!] && (
                      <img src={DUMPSTER_PHOTO_MAP[alternativeSizes.smaller!]} alt="" className="h-full object-contain" loading="lazy" />
                    )}
                  </div>
                  <p className="text-lg font-bold text-foreground">{alternativeSizes.smaller}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">yard (smaller)</p>
                </button>
              )}
              {alternativeSizes.larger && (
                <button
                  onClick={() => handleSizeSelect(alternativeSizes.larger!)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-center transition-all',
                    size === alternativeSizes.larger ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  )}
                >
                  <div className="w-full h-10 flex items-center justify-center mb-2">
                    {DUMPSTER_PHOTO_MAP[alternativeSizes.larger!] && (
                      <img src={DUMPSTER_PHOTO_MAP[alternativeSizes.larger!]} alt="" className="h-full object-contain" loading="lazy" />
                    )}
                  </div>
                  <p className="text-lg font-bold text-foreground">{alternativeSizes.larger}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">yard (larger)</p>
                </button>
              )}
            </div>

            {/* Heavy fill-line warning */}
            {isHeavy && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/30 text-xs text-warning-foreground">
                <Scale className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                   <p className="font-semibold">{HEAVY_FILL_LINE_TITLE}</p>
                   <p>{HEAVY_FILL_LINE_DESC}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================== */}
        {/* STEP 5: PRICE MOMENT */}
        {/* ============================== */}
        {step === 'price' && quote.isValid && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            {/* Premium price card */}
            <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
              {/* Price */}
              <div className="p-6 text-center">
                <div className="mb-2">
                  {(() => {
                    const copy = getPriceMomentCopy(customerType, isHeavy, quote.includedTons);
                    const c = isHeavy ? copy.heavy : copy.general;
                    return (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        {c.headline}
                      </span>
                    );
                  })()}
                </div>
                <div className="text-5xl font-bold text-foreground tracking-tight">
                  ${quote.subtotal.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {getSizeLabel()} dumpster — 7-day rental
                </p>
              </div>

              {/* Included items */}
              {(() => {
                const copy = getPriceMomentCopy(customerType, isHeavy, quote.includedTons);
                const items = isHeavy ? copy.heavy.includedItems : copy.general.includedItems;
                const title = isHeavy ? copy.heavy.includedTitle : copy.general.includedTitle;
                const icons = [Truck, Calendar, Scale, Shield];
                return (
                  <div className="px-5 py-4 bg-muted/20 border-t border-border/50 space-y-2.5">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</p>
                    {items.map((label, i) => {
                      const Icon = icons[i % icons.length];
                      return (
                        <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <Icon className="w-4 h-4 text-success shrink-0" />
                          {label}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Overage info */}
              {!quote.isFlatFee && (
                <div className="px-5 py-3 bg-muted/10 border-t border-border/30 text-xs text-muted-foreground">
                  {getPriceMomentCopy(customerType, isHeavy, quote.includedTons).general.overageNote}
                </div>
              )}
              {isHeavy && (
                <div className="px-5 py-3 bg-muted/10 border-t border-border/30 text-xs text-muted-foreground">
                  {getPriceMomentCopy(customerType, isHeavy, quote.includedTons).heavy.ruleLine}
                </div>
              )}

              {/* Service Time Breakdown */}
              <div className="px-5 py-3 border-t border-border/30">
                {serviceTime ? (
                  <ServiceTimeBreakdown
                    estimate={serviceTime}
                    yardName={distanceCalc.distance?.yard.name}
                    showInternal={showInternalBreakdown}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {etaDisplay ? `Delivery ETA: ${etaDisplay}` : DELIVERY_TIME_FALLBACK}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {FACILITY_AUTO_SELECTED}
                </div>
              </div>

              {/* Swap option */}
              <div className="px-5 py-3 border-t border-border/30">
                <button
                  onClick={() => setWantsSwap(!wantsSwap)}
                  className={cn(
                    'flex items-center gap-2.5 w-full text-left text-xs rounded-lg p-2 -m-1 transition-colors',
                    wantsSwap ? 'bg-primary/5 text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <RotateCcw className={cn('w-4 h-4 shrink-0', wantsSwap ? 'text-primary' : '')} />
                  <span className="flex-1">
                     {wantsSwap ? SWAP_ACTIVE : SWAP_PROMPT}
                  </span>
                  {wantsSwap && <CheckCircle className="w-3.5 h-3.5 text-success" />}
                </button>
              </div>

              {/* Trust badges */}
              <div className="px-5 py-3 border-t border-border/30 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Warehouse className="w-3.5 h-3.5 text-primary" />
                  Real local yard
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Transparent pricing
                </span>
              </div>
            </div>

            <Button
              variant="cta"
              size="lg"
              className="w-full h-14 text-base"
              onClick={goNext}
            >
              <CheckCircle className="w-5 h-5" />
              {getPriceMomentCopy(customerType, isHeavy, quote.includedTons)[isHeavy ? 'heavy' : 'general'].primaryButton}
            </Button>

            <Button
              variant="outline"
              size="default"
              className="w-full"
              onClick={() => window.open('tel:+15106802150', '_blank')}
            >
              <Phone className="w-4 h-4" />
              Call (510) 680-2150
            </Button>
          </div>
        )}

        {/* ============================== */}
        {/* STEP 6: CONFIRM */}
        {/* ============================== */}
        {step === 'confirm' && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">{getStepTitles().CONFIRM_STEP_TITLE}</h4>
              <p className="text-sm text-muted-foreground">{getButtons().CONFIRM_HELP}</p>
            </div>

            {/* Mini summary */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dumpster</span>
                <span className="font-semibold text-foreground">{getSizeLabel()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Project</span>
                <span className="font-semibold text-foreground">{selectedProject?.label || 'General'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rental</span>
                <span className="font-semibold text-foreground">7 days</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-foreground text-lg">${quote.subtotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Contact form */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Your Name
                </label>
                <Input
                  type="text"
                  placeholder="John Smith"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4" /> Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="(510) 555-1234"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> Email <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <Checkbox
                id="terms-v3"
                checked={termsAccepted}
                onCheckedChange={(c) => setTermsAccepted(c === true)}
                className="mt-0.5"
              />
               <label htmlFor="terms-v3" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                {getButtons().TERMS_TEXT}
              </label>
            </div>

            <Button
              variant="cta"
              size="lg"
              className="w-full h-14 text-base"
              onClick={handleSaveQuote}
              disabled={isSubmitting || !customerName || !customerPhone || !termsAccepted}
            >
              {isSubmitting ? (
                <>
                   <Loader2 className="w-5 h-5 animate-spin" />
                   {getButtons().PROCESSING}
                 </>
               ) : (
                 <>
                   <CheckCircle className="w-5 h-5" />
                   {getButtons().CONFIRM_ORDER}
                 </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              {getButtons().CONFIRM_FINEPRINT}
            </p>
          </div>
        )}

        {/* ============================== */}
        {/* STEP 7: MAP PLACEMENT */}
        {/* ============================== */}
        {step === 'placement' && (
          <div className="space-y-5">
            {/* Confirmation banner (always shown) */}
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-sm">
              <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
                <CheckCircle className="w-4 h-4 text-success" />
                {QUOTE_SAVED_TITLE}
              </div>
              <p className="text-xs text-muted-foreground">
                {getSizeLabel()} — ${quote.subtotal.toLocaleString()} — {selectedProject?.label || 'General'}
              </p>
            </div>

            {/* Phase: PROMPT — choose or skip */}
            {placementPhase === 'prompt' && (
              <>
                <div>
                  <h4 className="text-lg font-bold text-foreground mb-1">
                    {getPlacementCopy().PLACEMENT_TITLE}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {getPlacementCopy().PLACEMENT_SUBTITLE}
                  </p>
                </div>

                <Button
                  variant="cta"
                  size="lg"
                  className="w-full h-14 text-base"
                  onClick={() => setPlacementPhase('mapping')}
                  disabled={!distanceCalc.geocoding}
                >
                  <MapPin className="w-5 h-5" />
                  {getPlacementCopy().PLACEMENT_PRIMARY_BUTTON}
                </Button>

                <Button
                  variant="outline"
                  size="default"
                  className="w-full"
                  onClick={() => {
                    analytics.quoteStepComplete('placement-skipped', Date.now() - stepStartTime);
                    setPlacementPhase('done');
                  }}
                >
                  <SkipForward className="w-4 h-4" />
                  {getPlacementCopy().PLACEMENT_SKIP_BUTTON}
                </Button>

                {!distanceCalc.geocoding && (
                  <p className="text-xs text-muted-foreground text-center">
                    {PLACEMENT_MAP_UNAVAILABLE}
                  </p>
                )}
              </>
            )}

            {/* Phase: MAPPING — show the map tool */}
            {placementPhase === 'mapping' && distanceCalc.geocoding && (
              <Suspense
                fallback={
                  <div className="h-[300px] rounded-xl bg-muted/20 border border-border flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                }
              >
                <PlacementMap
                  addressLat={distanceCalc.geocoding.lat}
                  addressLng={distanceCalc.geocoding.lng}
                  yard={distanceCalc.distance?.yard ?? null}
                  distanceMiles={distanceCalc.distance?.distanceMiles}
                  onPlacementConfirmed={(placement) => {
                    analytics.quoteStepComplete('placement', Date.now() - stepStartTime);
                    setPlacementPhase('done');
                  }}
                />
              </Suspense>
            )}

            {/* Phase: DONE — success message */}
            {placementPhase === 'done' && (
              <div className="p-4 rounded-xl bg-muted/20 border border-border text-center">
                <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="font-semibold text-foreground">
                  {ORDER_CONFIRMED_TITLE}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {ORDER_CONFIRMED_SUBTITLE}
                </p>
              </div>
            )}

            <Button
              variant="outline"
              size="default"
              className="w-full"
              onClick={() => window.open('tel:+15106802150', '_blank')}
            >
              <Phone className="w-4 h-4" />
              Call (510) 680-2150
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default V3QuoteFlow;
