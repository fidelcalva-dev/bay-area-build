// ============================================================
// V3 QUOTE FLOW — Premium Logistics Platform Experience
// ZIP → Customer Type → Project → Size → Price → Confirm
// ============================================================

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  MapPin, ChevronRight, ChevronLeft, Phone, User, Mail, Loader2,
  CheckCircle, Shield, Clock, Truck, Home, HardHat, Building2,
  Warehouse, UtensilsCrossed, Trees, Hammer, Mountain, Construction,
  DoorOpen, Store, RefreshCw, Scale, Calendar, Star, Info, RotateCcw, SkipForward,
  Award, Zap,
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
// STEP TRANSITION WRAPPER
// ============================================================
function StepTransition({ children, stepKey }: { children: React.ReactNode; stepKey: string }) {
  return (
    <div key={stepKey} className="animate-fade-in">
      {children}
    </div>
  );
}

// ============================================================
// TRUST BLOCK
// ============================================================
function TrustBlock({ className }: { className?: string }) {
  const items = [
    { icon: Shield, label: 'Licensed & Insured' },
    { icon: Warehouse, label: 'Real Local Yard' },
    { icon: Zap, label: 'Transparent Pricing' },
    { icon: Clock, label: 'Same-Day Available' },
  ];
  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {items.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/50"
        >
          <Icon className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-medium text-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
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
    return Math.min(map[step], 6);
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

  // Handle size tap
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
        setSavedQuoteId(result.quoteId ?? null);
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

  // Placement sub-state
  const [placementPhase, setPlacementPhase] = useState<'prompt' | 'mapping' | 'done'>('prompt');

  // Staff-only internal breakdown toggle
  const showInternalBreakdown = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('internal') === '1';
    } catch { return false; }
  }, []);

  // Back button component
  const BackButton = () => (
    <button
      onClick={goBack}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
    >
      <ChevronLeft className="w-4 h-4" />
      <span>Back</span>
    </button>
  );

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border/60" id="quote-calculator-v3">
      {/* Header — Clean, minimal, white */}
      <div className="px-5 py-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground tracking-tight">Instant Quote</h3>
              <p className="text-[11px] text-muted-foreground">All-inclusive pricing</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-success/10 rounded-full">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
            </span>
            <span className="text-[10px] font-semibold text-success tracking-wide uppercase">Live</span>
          </div>
        </div>
        {/* Progress — thin line */}
        <div className="mt-3">
          <div className="relative h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(stepIndex / 6) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">Step {stepIndex} of 6</span>
            <span className="text-[10px] font-medium text-foreground">
              {step === 'zip' && 'Location'}
              {step === 'customer-type' && 'Profile'}
              {step === 'project' && 'Project'}
              {step === 'size' && 'Size'}
              {step === 'price' && 'Price'}
              {step === 'confirm' && 'Confirm'}
              {step === 'placement' && 'Complete'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 md:p-6">
        {/* ============================== */}
        {/* STEP 1: ZIP + YARD MATCH */}
        {/* ============================== */}
        {step === 'zip' && (
          <StepTransition stepKey="zip">
            <div className="space-y-5">
              <div>
                <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
                  Where do you need service?
                </h4>
                <p className="text-sm text-muted-foreground">
                  We automatically match you to the nearest local yard.
                </p>
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  placeholder="Enter ZIP code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className="h-14 pl-12 text-lg font-semibold rounded-xl border-border/60 focus:border-primary"
                  autoFocus
                />
                {isCheckingZip && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
                )}
              </div>

              {/* Yard match result */}
              {zoneResult && (
                <div className="rounded-xl bg-card border border-border/60 shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {autoDetectZip.cityName || zoneResult.cityName || zoneResult.zoneName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Service area confirmed</p>
                      </div>
                    </div>
                    {distanceCalc.distance && (
                      <div className="space-y-2 pl-11">
                        <div className="flex items-center gap-2 text-xs text-foreground">
                          <Warehouse className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="font-medium">{distanceCalc.distance.yard.name}</span>
                          <span className="text-muted-foreground">({distanceCalc.distance.distanceMiles.toFixed(1)} mi)</span>
                        </div>
                        {etaDisplay && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Estimated delivery: {etaDisplay}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2.5 bg-muted/30 border-t border-border/50">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Award className="w-3 h-3 text-primary shrink-0" />
                      Local yard selected for faster delivery
                    </p>
                  </div>
                </div>
              )}

              {zip.length === 5 && !zoneResult && !isCheckingZip && (
                <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-sm text-destructive">
                  {ZIP_NOT_SERVICEABLE}
                </div>
              )}

              {/* Trust blocks */}
              <TrustBlock />

              <Button
                variant="cta"
                size="lg"
                className="w-full h-14 rounded-xl text-base font-semibold"
                onClick={goNext}
                disabled={zip.length !== 5 || !zoneResult || isCheckingZip}
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </StepTransition>
        )}

        {/* ============================== */}
        {/* STEP 2: CUSTOMER TYPE */}
        {/* ============================== */}
        {step === 'customer-type' && (
          <StepTransition stepKey="customer-type">
            <div className="space-y-5">
              <BackButton />

              <div>
                <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
                  {getStepTitles().TYPE_STEP_TITLE}
                </h4>
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
                      'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 text-left group',
                      customerType === type
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/60 hover:border-primary/40 hover:shadow-sm'
                    )}
                  >
                    <div className="w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors duration-150">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 group-hover:text-foreground transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </StepTransition>
        )}

        {/* ============================== */}
        {/* STEP 3: PROJECT PICKER */}
        {/* ============================== */}
        {step === 'project' && customerType && (
          <StepTransition stepKey="project">
            <div className="space-y-5">
              <BackButton />

              <div>
                <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
                  {getStepTitles().PROJECT_STEP_TITLE}
                </h4>
                <p className="text-sm text-muted-foreground">{getStepTitles().PROJECT_STEP_SUBTITLE}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {getProjectsForCustomerType(customerType).map((project) => {
                  const IconComp = ICON_MAP[project.icon] || Truck;
                  const isSelected = selectedProject?.id === project.id;
                  return (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSelect(project)}
                      className={cn(
                        'p-4 rounded-xl border text-center transition-all duration-150 flex flex-col items-center gap-2.5 group',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border/60 hover:border-primary/40 hover:shadow-sm'
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-150">
                        <IconComp className="w-5 h-5 text-primary" />
                      </div>
                      <p className="font-semibold text-foreground text-sm leading-tight">{project.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-tight">{project.description}</p>
                      {project.isHeavy && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                          6-10 yd only
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </StepTransition>
        )}

        {/* ============================== */}
        {/* STEP 4: RECOMMENDED SIZE */}
        {/* ============================== */}
        {step === 'size' && (
          <StepTransition stepKey="size">
            <div className="space-y-5">
              <BackButton />

              <div>
                <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
                  Recommended Size
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedProject?.label} {isHeavy ? `— ${HEAVY_SIZE_NOTE}` : ''}
                </p>
              </div>

              {/* Hero card — recommended size */}
              <button
                onClick={() => handleSizeSelect(recommendedSize)}
                className={cn(
                  'w-full rounded-2xl border-2 transition-all duration-150 relative overflow-hidden text-left',
                  size === recommendedSize ? 'border-primary shadow-md' : 'border-primary/30 hover:border-primary hover:shadow-sm'
                )}
              >
                {/* Recommended badge */}
                <div className="px-4 py-2 bg-primary/5 border-b border-primary/10">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-wider">
                    <Star className="w-3 h-3" />
                    Recommended
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-16 flex items-center justify-center shrink-0">
                      {DUMPSTER_PHOTO_MAP[recommendedSize] && (
                        <img
                          src={DUMPSTER_PHOTO_MAP[recommendedSize]}
                          alt={`${recommendedSize} yard dumpster`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-3xl font-bold text-foreground tracking-tight">
                        {recommendedSize} <span className="text-sm font-normal text-muted-foreground">Yard</span>
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Truck className="w-3 h-3 text-primary" /> Delivery & Pickup
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-primary" /> 7 Days Rental
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Scale className="w-3 h-3 text-primary" />
                          {isHeavy
                            ? FLAT_FEE_LABEL
                            : `${INCLUDED_TONS_BY_SIZE[recommendedSize] || 2} Tons Included`}
                        </p>
                      </div>
                      {etaDisplay && (
                        <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          Est. delivery: {etaDisplay}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-primary shrink-0" />
                  </div>
                </div>
              </button>

              {/* Info note */}
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                <span>
                  {isHeavy
                    ? `${HEAVY_FILL_LINE_TITLE}. ${HEAVY_FILL_LINE_DESC.split('.')[0]}.`
                    : `Based on typical ${selectedProject?.label?.toLowerCase() || 'project'} volume. Most customers pick this size.`}
                </span>
              </div>

              {/* Alternatives */}
              {(alternativeSizes.smaller || alternativeSizes.larger) && (
                <div className="grid grid-cols-2 gap-3">
                  {alternativeSizes.smaller && (
                    <button
                      onClick={() => handleSizeSelect(alternativeSizes.smaller!)}
                      className={cn(
                        'p-4 rounded-xl border text-center transition-all duration-150',
                        size === alternativeSizes.smaller ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/60 hover:border-primary/40 hover:shadow-sm'
                      )}
                    >
                      <div className="w-full h-10 flex items-center justify-center mb-2">
                        {DUMPSTER_PHOTO_MAP[alternativeSizes.smaller!] && (
                          <img src={DUMPSTER_PHOTO_MAP[alternativeSizes.smaller!]} alt="" className="h-full object-contain" loading="lazy" />
                        )}
                      </div>
                      <p className="text-xl font-bold text-foreground">{alternativeSizes.smaller}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mt-0.5">Yard (smaller)</p>
                    </button>
                  )}
                  {alternativeSizes.larger && (
                    <button
                      onClick={() => handleSizeSelect(alternativeSizes.larger!)}
                      className={cn(
                        'p-4 rounded-xl border text-center transition-all duration-150',
                        size === alternativeSizes.larger ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/60 hover:border-primary/40 hover:shadow-sm'
                      )}
                    >
                      <div className="w-full h-10 flex items-center justify-center mb-2">
                        {DUMPSTER_PHOTO_MAP[alternativeSizes.larger!] && (
                          <img src={DUMPSTER_PHOTO_MAP[alternativeSizes.larger!]} alt="" className="h-full object-contain" loading="lazy" />
                        )}
                      </div>
                      <p className="text-xl font-bold text-foreground">{alternativeSizes.larger}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mt-0.5">Yard (larger)</p>
                    </button>
                  )}
                </div>
              )}

              {/* Heavy fill-line warning */}
              {isHeavy && (
                <div className="rounded-xl bg-muted/40 border border-border/60 p-4">
                  <div className="flex items-start gap-3">
                    <Scale className="w-4 h-4 mt-0.5 shrink-0 text-foreground" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{HEAVY_FILL_LINE_TITLE}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{HEAVY_FILL_LINE_DESC}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </StepTransition>
        )}

        {/* ============================== */}
        {/* STEP 5: PRICE MOMENT */}
        {/* ============================== */}
        {step === 'price' && quote.isValid && (
          <StepTransition stepKey="price">
            <div className="space-y-5">
              <BackButton />

              {/* Price card */}
              <div className="rounded-2xl border border-border/60 bg-card shadow-md overflow-hidden">
                {/* Price hero */}
                <div className="p-6 text-center bg-gradient-to-b from-muted/20 to-transparent">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Your Exact Price
                  </p>
                  <div className="text-5xl font-bold text-foreground tracking-tight">
                    ${quote.subtotal.toLocaleString()}
                  </div>
                  <div className="mt-3 space-y-0.5">
                    <p className="text-sm text-foreground font-medium">
                      {getSizeLabel()} Dumpster
                    </p>
                    <p className="text-xs text-muted-foreground">
                      7-Day Rental — Delivery & Pickup Included
                    </p>
                  </div>
                </div>

                {/* Included breakdown */}
                {(() => {
                  const copy = getPriceMomentCopy(customerType, isHeavy, quote.includedTons);
                  const items = isHeavy ? copy.heavy.includedItems : copy.general.includedItems;
                  return (
                    <div className="px-5 py-4 border-t border-border/50">
                      <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-3">Included</p>
                      <div className="space-y-2.5">
                        {items.map((label, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                            <CheckCircle className="w-4 h-4 text-success shrink-0" />
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Overage / Heavy rules */}
                {!quote.isFlatFee && (
                  <div className="px-5 py-3 border-t border-border/50 bg-muted/20">
                    <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-1">Overage</p>
                    <p className="text-xs text-muted-foreground">
                      {getPriceMomentCopy(customerType, isHeavy, quote.includedTons).general.overageNote}
                    </p>
                  </div>
                )}
                {isHeavy && (
                  <div className="px-5 py-3 border-t border-border/50 bg-muted/20">
                    <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-1">Flat Rate Disposal Included</p>
                    <p className="text-xs text-muted-foreground">
                      {getPriceMomentCopy(customerType, isHeavy, quote.includedTons).heavy.ruleLine}
                    </p>
                  </div>
                )}

                {/* Service Timing */}
                <div className="px-5 py-4 border-t border-border/50">
                  <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-3">Service Timing (Estimated)</p>
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

                {/* Swap */}
                <div className="px-5 py-3 border-t border-border/50">
                  <button
                    onClick={() => setWantsSwap(!wantsSwap)}
                    className={cn(
                      'flex items-center gap-2.5 w-full text-left text-xs rounded-lg p-2 -m-1 transition-colors duration-150',
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

                {/* Trust footer */}
                <div className="px-5 py-3 border-t border-border/50 bg-muted/20">
                  <div className="flex items-center justify-center gap-5">
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                      <Warehouse className="w-3 h-3 text-primary" />
                      Real local yard
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                      <Shield className="w-3 h-3 text-primary" />
                      Transparent pricing
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="cta"
                size="lg"
                className="w-full h-14 rounded-xl text-base font-semibold"
                onClick={goNext}
              >
                {getPriceMomentCopy(customerType, isHeavy, quote.includedTons)[isHeavy ? 'heavy' : 'general'].primaryButton}
              </Button>

              <Button
                variant="outline"
                size="default"
                className="w-full rounded-xl"
                onClick={() => window.open('tel:+15106802150', '_blank')}
              >
                <Phone className="w-4 h-4" />
                Call (510) 680-2150
              </Button>
            </div>
          </StepTransition>
        )}

        {/* ============================== */}
        {/* STEP 6: CONFIRM */}
        {/* ============================== */}
        {step === 'confirm' && (
          <StepTransition stepKey="confirm">
            <div className="space-y-5">
              <BackButton />

              <div>
                <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
                  {getStepTitles().CONFIRM_STEP_TITLE}
                </h4>
                <p className="text-sm text-muted-foreground">{getButtons().CONFIRM_HELP}</p>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <div className="p-4 space-y-2.5">
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
                </div>
                <div className="px-4 py-3 bg-muted/20 border-t border-border/50 flex justify-between items-center">
                  <span className="font-semibold text-foreground text-sm">Total</span>
                  <span className="font-bold text-foreground text-xl">${quote.subtotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Contact form */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" /> Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Smith"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-12 rounded-xl border-border/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone
                  </label>
                  <Input
                    type="tel"
                    placeholder="(510) 555-1234"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-12 rounded-xl border-border/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="h-12 rounded-xl border-border/60"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/50">
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
                className="w-full h-14 rounded-xl text-base font-semibold"
                onClick={handleSaveQuote}
                disabled={isSubmitting || !customerName || !customerPhone || !termsAccepted}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {getButtons().PROCESSING}
                  </>
                ) : (
                  getButtons().CONFIRM_ORDER
                )}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                {getButtons().CONFIRM_FINEPRINT}
              </p>
            </div>
          </StepTransition>
        )}

        {/* ============================== */}
        {/* STEP 7: MAP PLACEMENT */}
        {/* ============================== */}
        {step === 'placement' && (
          <StepTransition stepKey="placement">
            <div className="space-y-5">
              {/* Confirmation banner */}
              <div className="rounded-xl bg-card border border-border/60 shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Order Confirmed</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getSizeLabel()} — ${quote.subtotal.toLocaleString()} — {selectedProject?.label || 'General'}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2.5 bg-muted/20 border-t border-border/50">
                  <p className="text-[11px] text-muted-foreground">
                    Our team will contact you within 15 minutes during business hours.
                  </p>
                </div>
              </div>

              {/* Phase: PROMPT */}
              {placementPhase === 'prompt' && (
                <>
                  <div>
                    <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
                      {getPlacementCopy().PLACEMENT_TITLE}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {getPlacementCopy().PLACEMENT_SUBTITLE}
                    </p>
                  </div>

                  <Button
                    variant="cta"
                    size="lg"
                    className="w-full h-14 rounded-xl text-base font-semibold"
                    onClick={() => setPlacementPhase('mapping')}
                    disabled={!distanceCalc.geocoding}
                  >
                    <MapPin className="w-5 h-5" />
                    {getPlacementCopy().PLACEMENT_PRIMARY_BUTTON}
                  </Button>

                  <Button
                    variant="outline"
                    size="default"
                    className="w-full rounded-xl"
                    onClick={() => {
                      analytics.quoteStepComplete('placement-skipped', Date.now() - stepStartTime);
                      setPlacementPhase('done');
                    }}
                  >
                    {getPlacementCopy().PLACEMENT_SKIP_BUTTON}
                  </Button>

                  {!distanceCalc.geocoding && (
                    <p className="text-xs text-muted-foreground text-center">
                      {PLACEMENT_MAP_UNAVAILABLE}
                    </p>
                  )}
                </>
              )}

              {/* Phase: MAPPING */}
              {placementPhase === 'mapping' && distanceCalc.geocoding && (
                <Suspense
                  fallback={
                    <div className="h-[300px] rounded-xl bg-muted/20 border border-border/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  }
                >
                  <PlacementMap
                    addressLat={distanceCalc.geocoding.lat}
                    addressLng={distanceCalc.geocoding.lng}
                    yard={distanceCalc.distance?.yard ?? null}
                    distanceMiles={distanceCalc.distance?.distanceMiles}
                    dumpsterSizeYd={size}
                    onPlacementConfirmed={async (placement) => {
                      analytics.quoteStepComplete('placement', Date.now() - stepStartTime);
                      if (savedQuoteId) {
                        try {
                          // 1. Upload screenshot
                          let screenshotUrl: string | null = null;
                          if (placement.screenshotBlob) {
                            const fileName = `quotes/${savedQuoteId}/${Date.now()}_placement.png`;
                            const { data: uploadData } = await supabase.storage
                              .from('placements-private')
                              .upload(fileName, placement.screenshotBlob, {
                                contentType: 'image/png',
                                upsert: true,
                              });
                            if (uploadData?.path) {
                              screenshotUrl = uploadData.path;
                            }
                          }

                          // 2. Build full geometry payload
                          const geometryJson = {
                            dumpsterRect: placement.dumpsterRect,
                            truckRect: placement.truckRect,
                            entry: placement.entry,
                          };

                          // 3. Insert into quote_site_placement
                          await supabase.from('quote_site_placement').insert({
                            quote_id: savedQuoteId,
                            geometry_json: geometryJson as never,
                            screenshot_url: screenshotUrl,
                            notes: placement.notes || null,
                          } as never);

                          // 4. Log timeline event PLACEMENT_SAVED
                          await supabase.from('timeline_events').insert({
                            entity_type: 'quote',
                            entity_id: savedQuoteId,
                            event_type: 'PLACEMENT_SAVED',
                            description: `Placement saved: ${placement.dumpsterRect.widthFt}x${placement.dumpsterRect.lengthFt}ft dumpster at (${placement.dumpsterRect.centerLat.toFixed(6)}, ${placement.dumpsterRect.centerLng.toFixed(6)})`,
                            metadata: geometryJson as any,
                          } as any);
                        } catch (err) {
                          console.error('Failed to save placement:', err);
                        }
                      }
                      setPlacementPhase('done');
                    }}
                  />
                </Suspense>
              )}

              {/* Phase: DONE */}
              {placementPhase === 'done' && (
                <div className="p-6 rounded-xl bg-card border border-border/60 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <p className="font-bold text-foreground text-lg">
                    {ORDER_CONFIRMED_TITLE}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {ORDER_CONFIRMED_SUBTITLE}
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                size="default"
                className="w-full rounded-xl"
                onClick={() => window.open('tel:+15106802150', '_blank')}
              >
                <Phone className="w-4 h-4" />
                Call (510) 680-2150
              </Button>
            </div>
          </StepTransition>
        )}
      </div>
    </div>
  );
}

export default V3QuoteFlow;
