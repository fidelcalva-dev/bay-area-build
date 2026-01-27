// ============================================================
// MINIMAL QUOTE CALCULATOR - High-Conversion 6-Step Flow
// ============================================================
// Reduces friction while preserving all backend pricing rules
// Flow: ZIP → Material → Size → Price → (Notices) → Confirm

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Zap, ChevronRight, ChevronLeft, Phone, User, Mail, Loader2, MessageCircle,
  CheckCircle, MapPin, Package, Calendar, Shield, Clock, Info, Truck,
  Home, HardHat, Trash2, Scale, AlertTriangle, type LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAutoDetectZip } from '@/hooks/useAutoDetectZip';
import { supabase } from '@/integrations/supabase/client';
import { saveQuote } from '@/lib/vendorSelection';
import { PRICING_POLICIES } from '@/lib/shared-data';
import { validateAndFormatPhone } from '@/lib/phoneUtils';
import { analytics } from '@/lib/analytics';

import type { QuoteFormData } from './types';
import { usePricingData, calculateIncludedTons } from './hooks/usePricingData';
import { useDistanceCalculation } from './hooks/useDistanceCalculation';
import { USER_TYPES, PRICING_ZONES } from './constants';
import { DUMPSTER_PHOTO_MAP } from '@/lib/canonicalDumpsterImages';

// ============================================================
// STEP DEFINITIONS
// ============================================================

type Step = 'zip' | 'material' | 'size' | 'price' | 'contact' | 'success';

const STEPS: { key: Step; label: string }[] = [
  { key: 'zip', label: 'Location' },
  { key: 'material', label: 'Material' },
  { key: 'size', label: 'Size' },
  { key: 'price', label: 'Quote' },
  { key: 'contact', label: 'Confirm' },
];

// ============================================================
// MATERIAL OPTIONS - Human Readable
// ============================================================

interface MaterialOption {
  id: 'general' | 'heavy';
  title: string;
  subtitle: string;
  icon: LucideIcon;
  examples: string;
  badge?: string;
}

const MATERIAL_OPTIONS: MaterialOption[] = [
  {
    id: 'general',
    title: 'Household & Construction',
    subtitle: 'Furniture, drywall, wood, yard waste',
    icon: Trash2,
    examples: 'Remodels, cleanouts, landscaping debris',
  },
  {
    id: 'heavy',
    title: 'Concrete & Dirt',
    subtitle: 'Rock, brick, asphalt, soil',
    icon: HardHat,
    examples: 'Driveways, foundations, hardscape',
    badge: '6-10 yd only',
  },
];

// ============================================================
// SIZE OPTIONS
// ============================================================

interface SizeOption {
  value: number;
  label: string;
  fits: string;
  popular?: boolean;
}

const DEBRIS_SIZES: SizeOption[] = [
  { value: 10, label: '10 Yard', fits: '3-4 pickup loads' },
  { value: 20, label: '20 Yard', fits: 'Most remodels', popular: true },
  { value: 30, label: '30 Yard', fits: 'Large projects' },
  { value: 40, label: '40 Yard', fits: 'Major construction' },
];

const HEAVY_SIZES: SizeOption[] = [
  { value: 6, label: '6 Yard', fits: 'Small concrete job' },
  { value: 8, label: '8 Yard', fits: 'Patio or walkway' },
  { value: 10, label: '10 Yard', fits: 'Driveway demo', popular: true },
];

// ============================================================
// ZONE RESULT TYPE
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

export function MinimalQuoteCalculator() {
  const { toast } = useToast();
  const pricingData = usePricingData();
  const { sizes: DUMPSTER_SIZES } = pricingData;

  // Step state
  const [step, setStep] = useState<Step>('zip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingZip, setIsCheckingZip] = useState(false);
  const [zoneResult, setZoneResult] = useState<ZoneResult | null>(null);
  const [quoteSaved, setQuoteSaved] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());

  // Form state
  const [formData, setFormData] = useState<QuoteFormData>({
    userType: 'homeowner',
    zip: '',
    material: 'general',
    size: 20,
    rentalDays: 7,
    extras: [],
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  // Auto-detect ZIP
  const autoDetectZip = useAutoDetectZip();
  
  useEffect(() => {
    if (!formData.zip && autoDetectZip.status === 'idle') {
      autoDetectZip.detectZip();
    }
  }, []);
  
  useEffect(() => {
    if (autoDetectZip.zip && autoDetectZip.zip.length === 5 && !formData.zip) {
      setFormData(prev => ({ ...prev, zip: autoDetectZip.zip! }));
    }
  }, [autoDetectZip.zip]);

  // Distance calculation
  const distanceCalc = useDistanceCalculation(formData.zip);

  // Track step timing for analytics
  useEffect(() => {
    setStepStartTime(Date.now());
  }, [step]);

  // Step index
  const stepIndex = STEPS.findIndex(s => s.key === step);

  // Zone lookup
  const lookupZone = useCallback(async (zip: string) => {
    if (zip.length !== 5) {
      setZoneResult(null);
      return;
    }

    setIsCheckingZip(true);
    try {
      const { data, error } = await supabase
        .from('zone_zip_codes')
        .select(`
          zone_id,
          city_name,
          zone:pricing_zones!inner(id, name, base_multiplier, is_active)
        `)
        .eq('zip_code', zip)
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

      // Fallback to constants
      for (const zone of PRICING_ZONES) {
        if (zone.zipCodes.includes(zip)) {
          setZoneResult({
            zoneId: zone.id,
            zoneName: zone.name,
            cityName: undefined,
            multiplier: zone.baseMultiplier,
          });
          return;
        }
      }
      setZoneResult(null);
    } catch (err) {
      console.error('Zone lookup error:', err);
      setZoneResult(null);
    } finally {
      setIsCheckingZip(false);
    }
  }, []);

  useEffect(() => {
    if (formData.zip.length === 5) {
      lookupZone(formData.zip);
    } else {
      setZoneResult(null);
    }
  }, [formData.zip, lookupZone]);

  // Auto-adjust size for heavy materials
  useEffect(() => {
    if (formData.material === 'heavy' && formData.size > 10) {
      setFormData(prev => ({ ...prev, size: 10 }));
    }
  }, [formData.material, formData.size]);

  // Available sizes based on material
  const availableSizes = useMemo(() => {
    return formData.material === 'heavy' ? HEAVY_SIZES : DEBRIS_SIZES;
  }, [formData.material]);

  // Calculate quote
  const quote = useMemo(() => {
    if (!zoneResult) {
      return { subtotal: 0, includedTons: 0, isValid: false };
    }

    const sizeData = DUMPSTER_SIZES.find(s => s.value === formData.size);
    if (!sizeData) {
      return { subtotal: 0, includedTons: 0, isValid: false };
    }

    const isFlatFee = formData.material === 'heavy';
    const includedTons = isFlatFee ? 0 : calculateIncludedTons(formData.size, formData.material);

    // Base price with zone multiplier
    let subtotal = Math.round(sizeData.basePrice * zoneResult.multiplier);

    // Heavy material adjustment
    if (formData.material === 'heavy') {
      subtotal += 200; // Base heavy surcharge
    }

    // Distance adjustment
    if (distanceCalc.distance?.priceAdjustment) {
      subtotal += distanceCalc.distance.priceAdjustment;
    }

    return { subtotal, includedTons, isValid: true, isFlatFee };
  }, [formData, zoneResult, DUMPSTER_SIZES, distanceCalc.distance]);

  // Navigation
  const canGoNext = useMemo(() => {
    switch (step) {
      case 'zip': return formData.zip.length === 5 && zoneResult && !isCheckingZip;
      case 'material': return !!formData.material;
      case 'size': return !!formData.size;
      case 'price': return true;
      case 'contact': return formData.name && formData.phone;
      default: return false;
    }
  }, [step, formData, zoneResult, isCheckingZip]);

  const trackStepComplete = (currentStep: Step) => {
    const duration = Date.now() - stepStartTime;
    analytics.quoteStep1Complete(currentStep, String(duration));
  };

  const goNext = () => {
    trackStepComplete(step);
    
    const nextSteps: Record<Step, Step> = {
      zip: 'material',
      material: 'size',
      size: 'price',
      price: 'contact',
      contact: 'success',
      success: 'success',
    };
    setStep(nextSteps[step]);
  };

  const goBack = () => {
    const prevSteps: Record<Step, Step> = {
      zip: 'zip',
      material: 'zip',
      size: 'material',
      price: 'size',
      contact: 'price',
      success: 'contact',
    };
    setStep(prevSteps[step]);
  };

  // Save quote
  const handleSaveQuote = async () => {
    const phoneValidation = validateAndFormatPhone(formData.phone);
    if (!phoneValidation.valid) {
      toast({
        title: 'Invalid Phone',
        description: phoneValidation.error,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const sizeData = DUMPSTER_SIZES.find(s => s.value === formData.size);
      
      const result = await saveQuote({
        customerName: formData.name,
        customerEmail: formData.email || undefined,
        customerPhone: phoneValidation.formatted,
        userType: formData.userType,
        zipCode: formData.zip,
        zoneId: zoneResult?.zoneId,
        materialType: formData.material,
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
        setSavedQuoteId(result.quoteId || null);
        setQuoteSaved(true);
        analytics.quoteCompleted(formData.size, formData.material, quote.subtotal);
        
        // Send SMS notification
        await supabase.functions.invoke('send-quote-summary', {
          body: {
            customerName: formData.name,
            customerPhone: phoneValidation.formatted,
            sizeLabel: sizeData?.label || `${formData.size} Yard`,
            materialType: formData.material,
            rentalDays: 7,
            zipCode: formData.zip,
            estimatedMin: quote.subtotal,
            estimatedMax: quote.subtotal + Math.round(quote.subtotal * 0.08),
            includedTons: quote.includedTons,
          },
        });

        toast({ title: 'Quote Saved', description: "We'll text you the details shortly." });
        goNext();
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to save quote', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border" id="quote-calculator">
      {/* Minimal Header */}
      <div className="bg-foreground px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-base text-background">Instant Quote</h3>
              <p className="text-xs text-background/60">60 seconds</p>
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

        {/* Progress bar */}
        {step !== 'success' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-background/60">Step {stepIndex + 1} of {STEPS.length}</span>
              <span className="text-xs font-semibold text-background">{STEPS[stepIndex]?.label}</span>
            </div>
            <div className="relative h-1 bg-background/10 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-300"
                style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        
        {/* Step 1: ZIP */}
        {step === 'zip' && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Service ZIP Code
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  placeholder="94501"
                  value={formData.zip}
                  onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                  className="h-14 pl-12 text-lg font-semibold"
                />
                {isCheckingZip && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
                )}
              </div>
            </div>

            {/* Zone confirmation */}
            {zoneResult && (
              <div className="p-3 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {autoDetectZip.cityName || zoneResult.cityName || zoneResult.zoneName}
                  </p>
                  {distanceCalc.distance && (
                    <p className="text-xs text-success">
                      Nearest yard: {distanceCalc.distance.yard.name} ({distanceCalc.distance.distanceMiles.toFixed(1)} mi)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Shield, label: 'Licensed' },
                { icon: Clock, label: 'Same-day' },
                { icon: Truck, label: 'All-inclusive' },
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
              className="w-full h-12"
              onClick={goNext}
              disabled={!canGoNext}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2: Material */}
        {step === 'material' && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div>
              <h4 className="text-base font-bold text-foreground mb-1">What are you disposing?</h4>
              <p className="text-xs text-muted-foreground mb-4">This determines pricing and size options</p>

              <div className="space-y-3">
                {MATERIAL_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, material: opt.id }))}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      formData.material === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                        formData.material === opt.id ? "bg-primary/10" : "bg-muted"
                      )}>
                        <opt.icon className={cn(
                          "w-5 h-5",
                          formData.material === opt.id ? "text-primary" : "text-foreground/70"
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{opt.title}</span>
                          {opt.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{opt.subtitle}</p>
                        <p className="text-xs text-muted-foreground/80 mt-1">{opt.examples}</p>
                      </div>
                      {formData.material === opt.id && (
                        <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="cta"
              size="lg"
              className="w-full h-12"
              onClick={goNext}
              disabled={!canGoNext}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 3: Size */}
        {step === 'size' && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div>
              <h4 className="text-base font-bold text-foreground mb-1">Choose your size</h4>
              <p className="text-xs text-muted-foreground mb-4">
                {formData.material === 'heavy' 
                  ? 'Heavy materials require smaller dumpsters'
                  : 'Most customers choose 20 yard'}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {availableSizes.map(size => {
                  const isSelected = formData.size === size.value;
                  const image = DUMPSTER_PHOTO_MAP[size.value];
                  
                  return (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, size: size.value }))}
                      className={cn(
                        "relative p-3 rounded-xl border-2 text-center transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {size.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                          POPULAR
                        </span>
                      )}
                      
                      {image && (
                        <img 
                          src={image} 
                          alt={size.label}
                          className="w-full h-20 object-contain mb-2"
                        />
                      )}
                      
                      <div className="text-lg font-bold text-foreground">{size.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">yard</div>
                      <div className="text-xs text-muted-foreground mt-1">{size.fits}</div>
                      
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              variant="cta"
              size="lg"
              className="w-full h-12"
              onClick={goNext}
              disabled={!canGoNext}
            >
              See my price
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 4: Price Display */}
        {step === 'price' && quote.isValid && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            {/* Main price card */}
            <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
              <div className="p-5 text-center">
                <div className="text-sm text-muted-foreground mb-1">Your instant quote</div>
                <div className="text-4xl font-bold text-foreground">
                  ${quote.subtotal.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {DUMPSTER_SIZES.find(s => s.value === formData.size)?.label} • 7 days
                </div>
              </div>

              {/* What's included - Expandable */}
              <Collapsible>
                <CollapsibleTrigger className="w-full px-5 py-3 bg-muted/30 border-t border-border flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">What's included?</span>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-5 py-3 bg-muted/20 border-t border-border/50 text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    Delivery & pickup
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    7-day rental
                  </div>
                  {quote.isFlatFee ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-success" />
                      Disposal (flat fee, no weight charges)
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-success" />
                      {quote.includedTons}T disposal included
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    Licensed & insured
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Conditional notices - only if applicable */}
            {formData.material === 'heavy' && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Heavy materials must follow fill line. Mixed/contaminated loads may be reclassified.</span>
              </div>
            )}

            {!quote.isFlatFee && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
                <Scale className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Weight over {quote.includedTons}T billed at $165/ton based on scale ticket.</span>
              </div>
            )}

            <Button
              variant="cta"
              size="lg"
              className="w-full h-12"
              onClick={goNext}
            >
              <MessageCircle className="w-4 h-4" />
              Get this quote
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            <Button
              variant="outline"
              size="default"
              className="w-full"
              onClick={() => window.open(`sms:+15106802150?body=${encodeURIComponent(`Quote: ${DUMPSTER_SIZES.find(s => s.value === formData.size)?.label} in ${formData.zip} - $${quote.subtotal}`)}`, '_blank')}
            >
              <Phone className="w-4 h-4" />
              Text us instead
            </Button>
          </div>
        )}

        {/* Step 5: Contact / Confirm */}
        {step === 'contact' && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-lg font-bold text-foreground">Almost there!</h4>
              <p className="text-sm text-muted-foreground mt-1">We'll text you the quote details</p>
            </div>

            {/* Mini summary */}
            <div className="bg-muted/50 rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold text-foreground">
                  {DUMPSTER_SIZES.find(s => s.value === formData.size)?.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formData.material === 'heavy' ? 'Heavy' : 'General'} • 7 days
                </div>
              </div>
              <div className="text-xl font-bold text-foreground">
                ${quote.subtotal.toLocaleString()}
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
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12"
                />
              </div>
            </div>

            <Button
              variant="cta"
              size="lg"
              className="w-full h-14 text-base"
              onClick={handleSaveQuote}
              disabled={isSubmitting || !formData.name || !formData.phone}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Save & Text Me
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By saving, you agree to receive SMS messages about your quote.
            </p>
          </div>
        )}

        {/* Step 6: Success */}
        {step === 'success' && (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">Quote Saved!</h3>
            <p className="text-muted-foreground mb-6">
              We'll contact you within 15 minutes to confirm.
            </p>

            <div className="bg-muted/50 rounded-xl p-4 text-left mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-foreground">
                    {DUMPSTER_SIZES.find(s => s.value === formData.size)?.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    7 days • ZIP {formData.zip}
                  </div>
                </div>
                <div className="text-lg font-bold text-foreground">
                  ${quote.subtotal.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep('zip');
                  setFormData({
                    userType: 'homeowner',
                    zip: '',
                    material: 'general',
                    size: 20,
                    rentalDays: 7,
                    extras: [],
                    name: '',
                    phone: '',
                    email: '',
                    address: '',
                  });
                  setZoneResult(null);
                  setQuoteSaved(false);
                }}
              >
                Get Another Quote
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <a href="tel:+15106802150">
                  <Phone className="w-4 h-4" />
                  Call (510) 680-2150
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MinimalQuoteCalculator;
