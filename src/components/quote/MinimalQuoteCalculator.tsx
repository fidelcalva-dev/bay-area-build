// ============================================================
// OPTION B CALCULATOR - Chips-Based Intake + Smart Recommendation
// ============================================================
// Flow: ZIP → Items (Chips) → Recommendation → Price → (Notice) → Confirm
// Mobile-first, 60-90 second completion, invisible complexity

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Zap, ChevronRight, ChevronLeft, Phone, User, Mail, Loader2, 
  CheckCircle, MapPin, Shield, Clock, Truck,
  Home, HardHat, Trash2, Recycle, Leaf, Sparkles, type LucideIcon
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

import type { QuoteFormData } from './types';
import { usePricingData, calculateIncludedTons } from './hooks/usePricingData';
import { useDistanceCalculation } from './hooks/useDistanceCalculation';
import { useDisposalItemCatalog, type ItemSelection } from './hooks/useDisposalItemCatalog';
import { useSizeRecommendation } from './hooks/useSizeRecommendation';
import { useQuoteAIRecommendation } from './hooks/useQuoteAIRecommendation';
import { PRICING_ZONES } from './constants';
import { DUMPSTER_PHOTO_MAP } from '@/lib/canonicalDumpsterImages';

// UI Components
import { ProgressBar6 } from './ui/ProgressBar6';
import { CardSelectable } from './ui/CardSelectable';
import { BadgePill } from './ui/BadgePill';
import { PriceHero } from './ui/PriceHero';
import { InfoBox, InfoBoxCompact } from './ui/InfoBox';
import { SummaryCardMini } from './ui/SummaryCard';
import { SmartMaterialsList } from './steps/SmartMaterialsList';
import { SizeRecommendationView } from './steps/SizeRecommendationView';

// ============================================================
// TYPES
// ============================================================

// Option B: 6 main steps (notice is conditional)
type Step = 'zip' | 'items' | 'recommend' | 'size' | 'price' | 'notice' | 'confirm' | 'success';
type MaterialCategory = 'GENERAL_DEBRIS' | 'HEAVY_MATERIALS' | 'YARD_WASTE' | 'CLEAN_RECYCLING';

interface MaterialOption {
  id: MaterialCategory;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: 'default' | 'warning' | 'info';
}

interface SizeOption {
  value: number;
  label: string;
  fits: string;
  popular?: boolean;
}

interface ZoneResult {
  zoneId: string;
  zoneName: string;
  cityName?: string;
  multiplier: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const STEP_LABELS = ['Location', 'Items', 'Size', 'Price', 'Notice', 'Confirm'];

const MATERIAL_OPTIONS: MaterialOption[] = [
  {
    id: 'GENERAL_DEBRIS',
    title: 'Household & Construction',
    subtitle: 'Furniture, drywall, wood, mixed debris',
    icon: Trash2,
  },
  {
    id: 'HEAVY_MATERIALS',
    title: 'Concrete & Dirt',
    subtitle: 'Rock, brick, asphalt, clean fill',
    icon: HardHat,
    badge: '6-10 yd only',
    badgeVariant: 'warning',
  },
  {
    id: 'YARD_WASTE',
    title: 'Yard Waste',
    subtitle: 'Grass, leaves, branches, landscaping',
    icon: Leaf,
  },
  {
    id: 'CLEAN_RECYCLING',
    title: 'Clean Recycling',
    subtitle: 'Clean wood, metal, cardboard',
    icon: Recycle,
  },
];

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
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());

  // Form state
  const [zip, setZip] = useState('');
  const [materialCategory, setMaterialCategory] = useState<MaterialCategory | null>(null);
  const [size, setSize] = useState(20);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  
  // Smart materials selection state
  const [itemSelections, setItemSelections] = useState<ItemSelection[]>([]);
  
  // Fetch disposal item catalog
  const { data: catalogItems = [], isLoading: catalogLoading } = useDisposalItemCatalog();
  
  // Size recommendation based on selected items (local fallback)
  const sizeRecommendation = useSizeRecommendation(itemSelections, catalogItems);

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

  // Track step timing for analytics
  useEffect(() => {
    setStepStartTime(Date.now());
  }, [step]);

  // Zone lookup
  const lookupZone = useCallback(async (zipCode: string) => {
    if (zipCode.length !== 5) {
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

      // Fallback to constants
      for (const zone of PRICING_ZONES) {
        if (zone.zipCodes.includes(zipCode)) {
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
    if (zip.length === 5) {
      lookupZone(zip);
    } else {
      setZoneResult(null);
    }
  }, [zip, lookupZone]);

  // Derived state - also check recommendation for smart flow
  const isHeavy = materialCategory === 'HEAVY_MATERIALS' || sizeRecommendation.isHeavy;
  const isYardWaste = materialCategory === 'YARD_WASTE' || sizeRecommendation.forcesDebrisHeavy;
  const isRecycling = sizeRecommendation.allowGreenHalo;
  const showNoticeStep = isHeavy || isYardWaste || isRecycling;
  const materialTypeForPricing = isHeavy || sizeRecommendation.isHeavy ? 'heavy' : 'general';

  // AI Recommendation hook - after derived state
  const aiRecommendation = useQuoteAIRecommendation({
    zip,
    marketCode: zoneResult?.zoneName || null,
    yardId: distanceCalc.distance?.yard?.id || null,
    availableSizes: isHeavy ? [5, 6, 8, 10] : [10, 20, 30, 40],
    customerType: 'homeowner',
  });

  // Fetch AI recommendation when transitioning to recommend step
  useEffect(() => {
    if (step === 'recommend' && itemSelections.length > 0) {
      aiRecommendation.fetchRecommendation(itemSelections);
    }
  }, [step, itemSelections]);

  // Auto-apply recommendation in LIVE modes (preselection)
  useEffect(() => {
    if (step === 'recommend' && aiRecommendation.shouldPreselect && aiRecommendation.recommendation) {
      const rec = aiRecommendation.recommendation;
      // Pre-set the size based on AI recommendation
      if (rec.recommended_size_yd && rec.recommended_size_yd !== size) {
        setSize(rec.recommended_size_yd);
      }
    }
  }, [step, aiRecommendation.shouldPreselect, aiRecommendation.recommendation]);

  // Auto-adjust size for heavy materials
  useEffect(() => {
    if (isHeavy && size > 10) {
      setSize(10);
    }
  }, [isHeavy, size]);

  // Available sizes based on material
  const availableSizes = useMemo(() => {
    return isHeavy ? HEAVY_SIZES : DEBRIS_SIZES;
  }, [isHeavy]);

  // Calculate quote
  const quote = useMemo(() => {
    if (!zoneResult) {
      return { subtotal: 0, includedTons: 0, isValid: false, isFlatFee: false };
    }

    const sizeData = DUMPSTER_SIZES.find(s => s.value === size);
    if (!sizeData) {
      return { subtotal: 0, includedTons: 0, isValid: false, isFlatFee: false };
    }

    const isFlatFee = isHeavy;
    const includedTons = isFlatFee ? 0 : calculateIncludedTons(size, materialTypeForPricing);

    // Base price with zone multiplier
    let subtotal = Math.round(sizeData.basePrice * zoneResult.multiplier);

    // Heavy material adjustment
    if (isHeavy) {
      subtotal += 200;
    }

    // Distance adjustment
    if (distanceCalc.distance?.priceAdjustment) {
      subtotal += distanceCalc.distance.priceAdjustment;
    }

    return { subtotal, includedTons, isValid: true, isFlatFee };
  }, [size, zoneResult, DUMPSTER_SIZES, distanceCalc.distance, isHeavy, materialTypeForPricing]);

  // Step index for progress bar (1-6)
  const stepIndex = useMemo(() => {
    const map: Record<Step, number> = {
      zip: 1,
      items: 2,
      recommend: 3,
      size: 3,
      price: 4,
      notice: 5,
      confirm: showNoticeStep ? 6 : 5,
      success: showNoticeStep ? 6 : 5,
    };
    return map[step];
  }, [step, showNoticeStep]);

  const totalSteps = showNoticeStep ? 6 : 5;

  // Navigation
  const canGoNext = useMemo(() => {
    switch (step) {
      case 'zip': return zip.length === 5 && zoneResult && !isCheckingZip;
      case 'items': return itemSelections.length > 0;
      case 'recommend': return true;
      case 'size': return !!size;
      case 'price': return true;
      case 'notice': return true;
      case 'confirm': return customerName && customerPhone && termsAccepted;
      default: return false;
    }
  }, [step, zip, zoneResult, isCheckingZip, itemSelections, size, customerName, customerPhone, termsAccepted]);

  const goNext = () => {
    const duration = Date.now() - stepStartTime;
    analytics.quoteStepComplete(step, duration);
    
    const nextSteps: Record<Step, Step> = {
      zip: 'items',
      items: 'recommend',
      recommend: 'price', // After accepting recommendation, go to price
      size: 'price',
      price: showNoticeStep ? 'notice' : 'confirm',
      notice: 'confirm',
      confirm: 'success',
      success: 'success',
    };
    setStep(nextSteps[step]);
  };

  const goBack = () => {
    const prevSteps: Record<Step, Step> = {
      zip: 'zip',
      items: 'zip',
      recommend: 'items',
      size: 'recommend',
      price: 'recommend',
      notice: 'price',
      confirm: showNoticeStep ? 'notice' : 'price',
      success: 'confirm',
    };
    setStep(prevSteps[step]);
  };

  // Handle size selection (auto-advance)
  const handleSizeSelect = (sizeValue: number) => {
    setSize(sizeValue);
    // Auto-advance after selection
    setTimeout(() => setStep('price'), 150);
  };

  // Handle accepting size recommendation
  const handleAcceptRecommendation = (recommendedSize: number, wasPreselected?: boolean) => {
    // Apply recommendation to state
    setSize(recommendedSize);
    setMaterialCategory(sizeRecommendation.category);
    
    // Track acceptance
    aiRecommendation.trackAccept(recommendedSize, wasPreselected || false);
    
    // Go to price step
    const duration = Date.now() - stepStartTime;
    analytics.quoteStepComplete('recommend', duration);
    setStep('price');
  };

  // Handle "change size" from recommendation - go to size picker
  const handleChangeSize = () => {
    setMaterialCategory(sizeRecommendation.category);
    aiRecommendation.trackChange(0, 'change_size_clicked');
    setStep('size');
  };

  // Handle "edit items" from recommendation
  const handleEditItems = () => {
    setStep('items');
  };

  // Handle tracking size change for AI metrics
  const handleTrackSizeChange = (selectedSize: number, reason: string) => {
    aiRecommendation.trackChange(selectedSize, reason);
  };

  // Save quote
  const handleSaveQuote = async () => {
    const phoneValidation = validateAndFormatPhone(customerPhone);
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
      const sizeData = DUMPSTER_SIZES.find(s => s.value === size);
      
      const result = await saveQuote({
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone: phoneValidation.formatted,
        userType: 'homeowner',
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
        setSavedQuoteId(result.quoteId || null);
        analytics.quoteCompleted(size, materialTypeForPricing, quote.subtotal);
        
        // Send SMS notification
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

  // Reset calculator
  const handleReset = () => {
    setStep('zip');
    setZip('');
    setMaterialCategory(null);
    setSize(20);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setTermsAccepted(false);
    setZoneResult(null);
    setSavedQuoteId(null);
    setItemSelections([]);
  };

  // Get size label
  const getSizeLabel = () => {
    const sizeData = DUMPSTER_SIZES.find(s => s.value === size);
    return sizeData?.label || `${size} Yard`;
  };

  // Get material label
  const getMaterialLabel = () => {
    const mat = MATERIAL_OPTIONS.find(m => m.id === materialCategory);
    return mat?.title || materialCategory || '';
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border" id="quote-calculator">
      {/* Header */}
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
            <ProgressBar6 currentStep={stepIndex} totalSteps={totalSteps} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        
        {/* ============================== */}
        {/* STEP 1: LOCATION (ZIP) */}
        {/* ============================== */}
        {step === 'zip' && (
          <div className="space-y-5">
            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">Where do you need it?</h4>
              <p className="text-sm text-muted-foreground">Enter your service ZIP code</p>
            </div>

            <div>
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
                { icon: Clock, label: 'Same-day available' },
                { icon: Truck, label: 'All-inclusive pricing' },
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
              disabled={!canGoNext}
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}

        {/* ============================== */}
        {/* STEP 2: SMART ITEMS SELECTION */}
        {/* ============================== */}
        {step === 'items' && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">What are you throwing away?</h4>
              <p className="text-sm text-muted-foreground">Select all that apply</p>
            </div>

            {catalogLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <SmartMaterialsList
                catalogItems={catalogItems}
                selections={itemSelections}
                onSelectionsChange={setItemSelections}
              />
            )}

            <Button
              variant="cta"
              size="lg"
              className="w-full h-14"
              onClick={goNext}
              disabled={!canGoNext}
            >
              Get Recommendation
              <Sparkles className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}

        {/* ============================== */}
        {/* STEP 3: SIZE RECOMMENDATION */}
        {/* ============================== */}
        {step === 'recommend' && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <SizeRecommendationView
              recommendation={sizeRecommendation}
              aiRecommendation={aiRecommendation.recommendation}
              aiLoading={aiRecommendation.isLoading}
              aiMode={aiRecommendation.mode}
              shouldPreselect={aiRecommendation.shouldPreselect}
              onAccept={handleAcceptRecommendation}
              onChangeSize={handleChangeSize}
              onEditItems={handleEditItems}
              onTrackChange={handleTrackSizeChange}
            />
          </div>
        )}

        {/* ============================== */}
        {/* STEP 3: DUMPSTER SIZE */}
        {/* ============================== */}
        {step === 'size' && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">Choose your size</h4>
              <p className="text-sm text-muted-foreground">
                {isHeavy 
                  ? 'Heavy materials require smaller dumpsters'
                  : 'Most customers choose 20 yard'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {availableSizes.map(sizeOpt => {
                const isSelected = size === sizeOpt.value;
                const image = DUMPSTER_PHOTO_MAP[sizeOpt.value];
                
                return (
                  <button
                    key={sizeOpt.value}
                    type="button"
                    onClick={() => handleSizeSelect(sizeOpt.value)}
                    className={cn(
                      "relative p-3 rounded-xl border-2 text-center transition-all min-h-[140px] flex flex-col",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {sizeOpt.popular && (
                      <BadgePill 
                        variant="primary" 
                        className="absolute -top-2 left-1/2 -translate-x-1/2"
                      >
                        Popular
                      </BadgePill>
                    )}
                    
                    <div className="flex-1 flex items-center justify-center">
                      {image && (
                        <img 
                          src={image} 
                          alt={sizeOpt.label}
                          className="w-full h-16 object-contain"
                        />
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-xl font-bold text-foreground">{sizeOpt.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">yard</div>
                      <div className="text-xs text-muted-foreground mt-1">{sizeOpt.fits}</div>
                    </div>
                    
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
        )}

        {/* ============================== */}
        {/* STEP 4: PRICE DISPLAY */}
        {/* ============================== */}
        {step === 'price' && quote.isValid && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <PriceHero
              price={quote.subtotal}
              subtitle={`${getSizeLabel()} dumpster • 7-day rental`}
              ctaLabel="Reserve Dumpster"
              onCtaClick={goNext}
              includedItems={[
                { label: 'Delivery & pickup' },
                { label: '7-day rental included' },
                quote.isFlatFee 
                  ? { label: 'Flat fee (no weight charges)' }
                  : { label: `${quote.includedTons}T disposal included` },
                { label: 'Licensed & insured' },
              ]}
            />

            <Button
              variant="outline"
              size="default"
              className="w-full"
              onClick={() => window.open(`tel:+15106802150`, '_blank')}
            >
              <Phone className="w-4 h-4" />
              Call (510) 680-2150
            </Button>
          </div>
        )}

        {/* ============================== */}
        {/* STEP 5: NOTICE (Conditional) */}
        {/* ============================== */}
        {step === 'notice' && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">Before You Confirm</h4>
              <p className="text-sm text-muted-foreground">Just a quick heads up</p>
            </div>

            {/* Heavy materials notice - simplified, no numbers */}
            {isHeavy && !isYardWaste && (
              <InfoBox variant="warning" title="Heavy Material Guidelines">
                Heavy materials have weight limits. We'll guide you to load it safely.
              </InfoBox>
            )}

            {/* Yard waste notice - simplified, no numbers */}
            {isYardWaste && (
              <InfoBox variant="info" title="Yard Waste Notice">
                Yard waste must be kept free of trash or debris.
              </InfoBox>
            )}

            {/* Recycling notice */}
            {sizeRecommendation.allowGreenHalo && (
              <InfoBox variant="success" title="Recycling Requirement">
                Materials must be clean and separated to qualify for recycling.
              </InfoBox>
            )}

            <SummaryCardMini
              size={getSizeLabel()}
              material={getMaterialLabel()}
              price={quote.subtotal}
              rentalDays={7}
            />

            <Button
              variant="cta"
              size="lg"
              className="w-full h-14"
              onClick={goNext}
            >
              Continue to Confirm
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}

        {/* ============================== */}
        {/* STEP 6: CONFIRM & SCHEDULE */}
        {/* ============================== */}
        {step === 'confirm' && (
          <div className="space-y-5">
            <button onClick={goBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">Confirm Your Order</h4>
              <p className="text-sm text-muted-foreground">We'll text you the details</p>
            </div>

            {/* Mini summary */}
            <SummaryCardMini
              size={getSizeLabel()}
              material={getMaterialLabel()}
              price={quote.subtotal}
              rentalDays={7}
            />

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

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                I understand that additional charges may apply for weight over the included amount, extra days, or prohibited items.
              </label>
            </div>

            <Button
              variant="cta"
              size="lg"
              className="w-full h-14 text-base"
              onClick={handleSaveQuote}
              disabled={isSubmitting || !canGoNext}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirm Order
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By confirming, you authorize CALSAN DUMPSTERS PRO to send text messages with offers and other information. Message and data rates may apply.
            </p>
          </div>
        )}

        {/* ============================== */}
        {/* SUCCESS */}
        {/* ============================== */}
        {step === 'success' && (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">Order Confirmed</h3>
            <p className="text-muted-foreground mb-6">
              We'll contact you within 15 minutes to schedule delivery.
            </p>

            <SummaryCardMini
              size={getSizeLabel()}
              material={getMaterialLabel()}
              price={quote.subtotal}
              rentalDays={7}
              className="mb-6"
            />

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleReset}
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
