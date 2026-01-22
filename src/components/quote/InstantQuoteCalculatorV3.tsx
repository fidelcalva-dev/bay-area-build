import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { 
  Zap, ChevronRight, ChevronLeft, Phone, User, Mail, Loader2, MessageCircle,
  CheckCircle, MapPin, Package, Weight, Calendar, Sparkles, Shield, Clock, Bookmark, Info, Truck,
  Navigation, X, RefreshCw, Home, HardHat, Building2, Scale, FileText, Bed, Refrigerator,
  AlertCircle, Calculator, Trash2, Copy, type LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAutoDetectZip } from '@/hooks/useAutoDetectZip';
import { useOfficeStatus } from '@/hooks/useOfficeStatus';
import { supabase } from '@/integrations/supabase/client';
import { selectVendorForQuote, saveQuote, type VendorSelectionResult } from '@/lib/vendorSelection';
import { getOverageInfo, PRICING_POLICIES } from '@/lib/shared-data';
import { validateAndFormatPhone } from '@/lib/phoneUtils';

// Extra Tons Pre-Purchase
import { ExtraTonsRecommendation, shouldShowExtraTonsRecommendation, getSuggestedExtraTons, DEFAULT_EXTRA_TON_PRICING } from './ExtraTonsRecommendation';

// Types
import type { QuoteFormData, ExtraSelection } from './types';

// Material Sub-Classification
import { HeavyMaterialSelector, type HeavyClassificationResult } from './HeavyMaterialSelector';
import { GeneralMaterialSelector, type GeneralClassificationResult } from './GeneralMaterialSelector';
import { calculateHeavyPrice, type HeavyMaterialClass } from '@/lib/heavyPricing';
// Database-powered pricing data hook
import { usePricingData, useZoneLookup, calculateIncludedTons, getSizeDbId } from './hooks/usePricingData';

// Distance-based pricing hook
import { useDistanceCalculation } from './hooks/useDistanceCalculation';

// Fallback constants (used when DB is empty)
import { USER_TYPES, OVERAGE_COST_PER_TON, EXTRA_DAY_COST, OVERAGE_NOTE, PRICING_ZONES } from './constants';

// Quote Order Flow (Lead Capture → Address → Map Pin → Continue)
import { QuoteOrderFlow } from './QuoteOrderFlow';

// Smart Recommendation Features
import { ProjectTypeSelector, ConfidenceBadge, RecommendedBadge, RecommendationReason, WhyThisSize, getSmartRecommendation } from './SmartRecommendation';
import { WeightVisualization, EducationalMicroCopy } from './WeightVisualization';
import { DeliveryFeasibility } from './DeliveryFeasibility';

// Material Volume & Weight Estimator
import { MaterialVolumeEstimator, type EstimatorData } from './estimator';

// Lazy load the distance map to avoid issues with Leaflet
const DistanceMap = lazy(() => import('./DistanceMap').then(m => ({ default: m.DistanceMap })));
const DistanceMapLoading = lazy(() => import('./DistanceMap').then(m => ({ default: m.DistanceMapLoading })));

// Dumpster images
import dumpster6yard from '@/assets/dumpsters/dumpster-6yard.png';
import dumpster8yard from '@/assets/dumpsters/dumpster-8yard.png';
import dumpster10yard from '@/assets/dumpsters/dumpster-10yard.png';
import dumpster20yard from '@/assets/dumpsters/dumpster-20yard.png';
import dumpster30yard from '@/assets/dumpsters/dumpster-30yard.png';
import dumpster40yard from '@/assets/dumpsters/dumpster-40yard.png';

const DUMPSTER_IMAGES: Record<number, string> = {
  6: dumpster6yard,
  8: dumpster8yard,
  10: dumpster10yard,
  20: dumpster20yard,
  30: dumpster30yard,
  40: dumpster40yard,
  50: dumpster40yard, // Use 40yd image for 50yd as placeholder
};

// Office Status inline component for the save step
function OfficeStatusLine() {
  const officeStatus = useOfficeStatus();
  return (
    <>
      <span 
        className={cn(
          "w-2 h-2 rounded-full shrink-0",
          officeStatus.isOpen 
            ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" 
            : "bg-amber-500"
        )} 
      />
      <span className={officeStatus.isOpen ? "text-green-600" : "text-amber-600"}>
        Customer Service is currently {officeStatus.isOpen ? 'Open' : 'After Hours'}
      </span>
    </>
  );
}

// Icon mapping for user types (using canonical Lucide icons)
const USER_TYPE_ICONS: Record<string, LucideIcon> = {
  'home': Home,
  'hard-hat': HardHat,
  'building-2': Building2,
  'homeowner': Home,
  'contractor': HardHat,
  'business': Building2,
};

// Icon mapping for extras (canonical Lucide icons)
const EXTRAS_ICON_MAP: Record<string, LucideIcon> = {
  'calendar': Calendar,
  'scale': Scale,
  'file-text': FileText,
  'bed': Bed,
  'refrigerator': Refrigerator,
  'zap': Zap,
  'truck': Truck,
  'package': Package,
};

type Step = 'zip' | 'material' | 'size' | 'options' | 'save' | 'order' | 'success';

const STEPS: { key: Step; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { key: 'zip', label: 'Location', shortLabel: '01', icon: <MapPin className="w-3.5 h-3.5" /> },
  { key: 'material', label: 'Material', shortLabel: '02', icon: <Package className="w-3.5 h-3.5" /> },
  { key: 'size', label: 'Size', shortLabel: '03', icon: <Weight className="w-3.5 h-3.5" /> },
  { key: 'options', label: 'Options', shortLabel: '04', icon: <Calendar className="w-3.5 h-3.5" /> },
  { key: 'save', label: 'Save', shortLabel: '05', icon: <Bookmark className="w-3.5 h-3.5" /> },
  { key: 'order', label: 'Order', shortLabel: '06', icon: <CheckCircle className="w-3.5 h-3.5" /> },
];

interface ZoneResult {
  zoneId: string;
  zoneName: string;
  cityName?: string;
  multiplier: number;
}

// Calculate Green Halo dump fee based on size (estimate tons × canonical rate)
function calculateGreenHaloDumpFee(sizeYards: number): number {
  const estimatedTons = sizeYards <= 10 ? 1 : (sizeYards <= 20 ? 2 : sizeYards <= 30 ? 3 : 4);
  return Math.round(estimatedTons * PRICING_POLICIES.greenHaloDumpFeePerTon);
}

export function InstantQuoteCalculatorV3() {
  const { toast } = useToast();
  
  // Fetch pricing data from database (with fallback to constants)
  const pricingData = usePricingData();
  const { sizes: DUMPSTER_SIZES, materials: MATERIAL_TYPES, extras: EXTRAS, rentalPeriods: RENTAL_PERIODS } = pricingData;
  
  const [step, setStep] = useState<Step>('zip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingZip, setIsCheckingZip] = useState(false);
  const [zoneResult, setZoneResult] = useState<ZoneResult | null>(null);
  const [vendorResult, setVendorResult] = useState<VendorSelectionResult | null>(null);
  const [sizeDbId, setSizeDbId] = useState<string | null>(null);
  const [quoteSaved, setQuoteSaved] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [smsStatus, setSmsStatus] = useState<'pending' | 'sent' | 'failed' | null>(null);
  const [showDistanceMap, setShowDistanceMap] = useState(false);
  const [showEstimator, setShowEstimator] = useState(false);
  const [estimatorData, setEstimatorData] = useState<EstimatorData | null>(null);
  
  // Pre-purchase extra tons state
  const [prepurchasedExtraTons, setPrepurchasedExtraTons] = useState(0);
  const [prePurchaseSuggested, setPrePurchaseSuggested] = useState(false);
  const [prePurchaseSkipped, setPrePurchaseSkipped] = useState(false);
  
  // Material sub-classification state
  const [heavyClassification, setHeavyClassification] = useState<HeavyClassificationResult | null>(null);
  const [generalClassification, setGeneralClassification] = useState<GeneralClassificationResult | null>(null);

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

  // Auto-detect ZIP functionality
  const autoDetectZip = useAutoDetectZip();
  
  // Trigger auto-detection on mount
  useEffect(() => {
    if (!formData.zip && autoDetectZip.status === 'idle') {
      autoDetectZip.detectZip();
    }
  }, []);
  
  // Sync auto-detected ZIP to form
  useEffect(() => {
    if (autoDetectZip.zip && autoDetectZip.zip.length === 5 && !formData.zip) {
      setFormData(prev => ({ ...prev, zip: autoDetectZip.zip! }));
    }
  }, [autoDetectZip.zip]);

  // Distance-based pricing calculation
  const distanceCalc = useDistanceCalculation(formData.zip);

  // Project type for smart recommendations
  const [projectType, setProjectType] = useState<string | null>(null);

  // Smart recommendation based on project type and material
  const smartRecommendation = useMemo(() => {
    return getSmartRecommendation(formData.size, projectType, formData.material);
  }, [formData.size, projectType, formData.material]);

  // Lookup zone from database with fallback to constants
  const lookupZone = useCallback(async (zip: string) => {
    if (zip.length !== 5) {
      setZoneResult(null);
      return;
    }

    setIsCheckingZip(true);
    try {
      // First try database lookup
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

      // Fallback to constants if DB has no data
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

      // ZIP not found in either source
      setZoneResult(null);
    } catch (err) {
      console.error('Zone lookup error:', err);
      
      // Fallback to constants on error
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
    } finally {
      setIsCheckingZip(false);
    }
  }, []);

  // Lookup zone when ZIP changes
  useEffect(() => {
    if (formData.zip.length === 5) {
      lookupZone(formData.zip);
    } else {
      setZoneResult(null);
    }
  }, [formData.zip, lookupZone]);

  // Auto-adjust size when material changes
  useEffect(() => {
    const material = MATERIAL_TYPES.find((m) => m.value === formData.material);
    if (material && !material.allowedSizes.includes(formData.size)) {
      setFormData((prev) => ({ 
        ...prev, 
        size: formData.material === 'heavy' ? 10 : 20 
      }));
    }
  }, [formData.material, formData.size]);

  // Fetch size DB ID for vendor selection
  useEffect(() => {
    async function fetchSizeId() {
      const { data } = await supabase
        .from('dumpster_sizes')
        .select('id')
        .eq('size_value', formData.size)
        .eq('is_active', true)
        .maybeSingle();
      
      setSizeDbId(data?.id || null);
    }
    fetchSizeId();
  }, [formData.size]);

  // Calculate quote
  const quote = useMemo(() => {
    if (!zoneResult) {
      return { 
        lineItems: [], 
        subtotal: 0, 
        estimatedMin: 0, 
        estimatedMax: 0, 
        includedTons: 0,
        isValid: false 
      };
    }

    const lineItems: { label: string; subLabel?: string; amount: number; type: string }[] = [];
    const sizeData = DUMPSTER_SIZES.find((s) => s.value === formData.size);
    const material = MATERIAL_TYPES.find((m) => m.value === formData.material);
    const rental = RENTAL_PERIODS.find((r) => r.value === formData.rentalDays);
    const userTypeData = USER_TYPES.find((u) => u.value === formData.userType);

    if (!sizeData || !material || !rental) {
      return { lineItems: [], subtotal: 0, estimatedMin: 0, estimatedMax: 0, includedTons: 0, isValid: false };
    }

    // Determine included tons based on material type
    // Green Halo general materials also use flat-fee pricing (specialized facility)
    const isGreenHaloMaterial = formData.material === 'general' && generalClassification?.isGreenHalo;
    const isFlatFeePricing = formData.material === 'heavy' || isGreenHaloMaterial;
    const includedTons = isFlatFeePricing ? 0 : calculateIncludedTons(formData.size, formData.material);

    // Base price with zone multiplier
    const basePrice = Math.round(sizeData.basePrice * zoneResult.multiplier);
    
    lineItems.push({
      label: `${sizeData.label} Dumpster`,
      subLabel: isFlatFeePricing 
        ? `${rental.label} rental • Flat fee pricing`
        : `${rental.label} rental • ${includedTons}T included`,
      amount: basePrice,
      type: 'base',
    });

    // Heavy material surcharge
    if (material.priceAdjustment > 0) {
      lineItems.push({
        label: formData.material === 'heavy' ? 'Heavy Materials (flat-fee pricing)' : 'Heavy Material Surcharge',
        subLabel: formData.material === 'heavy' ? 'Disposal included, no weight charges' : 'Concrete, dirt, rock, asphalt',
        amount: material.priceAdjustment,
        type: 'addition',
      });
    }

    // Green Halo pricing: Flat fee + Dump fee + Handling fee
    if (isGreenHaloMaterial) {
      // Dump fee estimate based on size (variable $75-250/ton, use canonical rate)
      const estimatedTons = formData.size <= 10 ? 1 : (formData.size <= 20 ? 2 : formData.size <= 30 ? 3 : 4);
      const dumpFeePerTon = PRICING_POLICIES.greenHaloDumpFeePerTon;
      const dumpFeeEstimate = Math.round(estimatedTons * dumpFeePerTon);
      
      lineItems.push({
        label: 'Green Halo™ Recycling Facility',
        subLabel: 'Specialized facility for compliance documentation',
        amount: 0,
        type: 'info',
      });
      
      lineItems.push({
        label: 'Estimated Dump Fee',
        subLabel: `~${estimatedTons}T × $${dumpFeePerTon}/ton (actual varies $75-250/ton)`,
        amount: dumpFeeEstimate,
        type: 'addition',
      });
      
      // Handling fee (recommended additional) - from canonical source
      lineItems.push({
        label: 'Green Halo Handling Fee',
        subLabel: 'Processing & compliance documentation',
        amount: PRICING_POLICIES.greenHaloHandlingFee,
        type: 'addition',
      });
    }

    // Extended rental
    if (rental.extraCost > 0) {
      lineItems.push({
        label: 'Extended Rental',
        subLabel: `+${rental.extraDays} extra days`,
        amount: rental.extraCost,
        type: 'addition',
      });
    }

    // Distance-based adjustment
    if (distanceCalc.distance && distanceCalc.distance.priceAdjustment > 0) {
      lineItems.push({
        label: 'Distance Adjustment',
        subLabel: `${distanceCalc.distance.distanceMiles.toFixed(1)} mi from ${distanceCalc.distance.yard.name}`,
        amount: distanceCalc.distance.priceAdjustment,
        type: 'addition',
      });
    }

    // Extras
    for (const extraSel of formData.extras) {
      const extra = EXTRAS.find((e) => e.id === extraSel.id);
      if (extra && extraSel.quantity > 0) {
        const cost = extra.price * extraSel.quantity;
        lineItems.push({
          label: extra.label,
          subLabel: extraSel.quantity > 1 ? `${extraSel.quantity} × $${extra.price}` : extra.description,
          amount: cost,
          type: 'addition',
        });
      }
    }

    // Pre-purchased extra tons (only for general debris 20+ that is NOT Green Halo)
    if (prepurchasedExtraTons > 0 && formData.material === 'general' && formData.size >= 20 && !isGreenHaloMaterial) {
      const prepurchaseCost = Math.round(prepurchasedExtraTons * DEFAULT_EXTRA_TON_PRICING.prepurchaseRate);
      lineItems.push({
        label: 'Pre-purchased Extra Tons',
        subLabel: `${prepurchasedExtraTons}T × $${DEFAULT_EXTRA_TON_PRICING.prepurchaseRate.toFixed(2)} (5% off)`,
        amount: prepurchaseCost,
        type: 'addition',
      });
    }

    // Calculate subtotal before discount
    const subtotalBeforeDiscount = lineItems.reduce((sum, item) => sum + item.amount, 0);

    // Discount
    const discount = userTypeData?.discount || 0;
    if (discount > 0) {
      const discountAmount = Math.round(subtotalBeforeDiscount * discount);
      lineItems.push({
        label: `${userTypeData?.label} Discount`,
        subLabel: `${(discount * 100).toFixed(0)}% off`,
        amount: -discountAmount,
        type: 'discount',
      });
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const estimatedMin = subtotal;
    const estimatedMax = subtotal + Math.round(subtotal * 0.08);

    return { lineItems, subtotal, estimatedMin, estimatedMax, includedTons, isValid: true };
  }, [formData, zoneResult, distanceCalc.distance, generalClassification?.isGreenHalo, prepurchasedExtraTons]);

  // Run vendor selection
  useEffect(() => {
    async function runVendorSelection() {
      if (!zoneResult?.zoneId || !sizeDbId || !quote.isValid) {
        setVendorResult(null);
        return;
      }

      const result = await selectVendorForQuote({
        zoneId: zoneResult.zoneId,
        sizeId: sizeDbId,
        basePrice: quote.subtotal,
      });

      setVendorResult(result);
    }

    runVendorSelection();
  }, [zoneResult?.zoneId, sizeDbId, quote.isValid, quote.subtotal]);

  // Navigation
  const stepIndex = STEPS.findIndex((s) => s.key === step);
  
  const canGoNext = useMemo(() => {
    switch (step) {
      case 'zip': return zoneResult !== null;
      case 'material': return true;
      case 'size': return true;
      case 'options': return true;
      case 'save': return true;
      case 'order': return true;
      default: return false;
    }
  }, [step, zoneResult]);

  const goNext = () => {
    const nextSteps: Record<Step, Step> = {
      zip: 'material',
      material: 'size',
      size: 'options',
      options: 'save',
      save: 'order',
      order: 'success',
      success: 'success',
    };
    setStep(nextSteps[step]);
  };

  const goBack = () => {
    const prevSteps: Record<Step, Step> = {
      zip: 'zip',
      material: 'zip',
      size: 'material',
      options: 'size',
      save: 'options',
      order: 'save',
      success: 'order',
    };
    setStep(prevSteps[step]);
  };

  // Handle save quote (for lead capture) - SPLIT FLOW: DB first, notifications best-effort
  const handleSaveQuote = async () => {
    // PHASE 1: Validate form inputs
    if (!formData.name || !formData.phone) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your name and phone number',
        variant: 'destructive',
      });
      return;
    }

    // PHASE 2: Validate phone format BEFORE attempting anything
    const phoneValidation = validateAndFormatPhone(formData.phone);
    if (!phoneValidation.valid) {
      toast({
        title: 'Invalid Phone Number',
        description: phoneValidation.error || 'Please enter a valid 10-digit US phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setSmsStatus('pending');

    const userTypeData = USER_TYPES.find((u) => u.value === formData.userType);
    const sizeData = DUMPSTER_SIZES.find((s) => s.value === formData.size);
    const extrasLabels = formData.extras
      .map((e) => {
        const extra = EXTRAS.find((ex) => ex.id === e.id);
        return extra ? `${extra.label}${e.quantity > 1 ? ` (×${e.quantity})` : ''}` : null;
      })
      .filter(Boolean) as string[];

    // ============================================================
    // PHASE 3: SAVE TO DATABASE FIRST (Critical - must succeed)
    // ============================================================
    let quoteId: string | null = null;
    try {
      console.log('[SaveQuote] Step A: Saving quote to database...');
      
      const result = await saveQuote({
        customerName: formData.name,
        customerEmail: formData.email || undefined,
        customerPhone: phoneValidation.formatted, // Use normalized E.164 format
        userType: formData.userType,
        zipCode: formData.zip,
        zoneId: zoneResult?.zoneId,
        sizeId: sizeDbId || undefined,
        materialType: formData.material,
        rentalDays: formData.rentalDays,
        extras: formData.extras.map((e) => `${e.id}:${e.quantity}`),
        subtotal: quote.subtotal,
        estimatedMin: quote.estimatedMin,
        estimatedMax: quote.estimatedMax,
        discountPercent: (userTypeData?.discount || 0) * 100,
        selectedVendorId: vendorResult?.selectedVendor?.vendorId,
        vendorCost: vendorResult?.vendorCost || undefined,
        margin: vendorResult?.margin || undefined,
        isCalsanFulfillment: vendorResult?.isCalsanFulfillment ?? true,
        // Smart recommendation data
        recommendedSizeYards: smartRecommendation.recommendedSize,
        recommendationReason: smartRecommendation.recommendationReason,
        userSelectedSizeYards: formData.size,
        projectType: projectType || undefined,
        // Confidence data
        confidenceLevel: smartRecommendation.confidence,
        confidenceNote: smartRecommendation.confidenceNote,
        // Distance-based pricing data
        customerLat: distanceCalc.geocoding?.lat,
        customerLng: distanceCalc.geocoding?.lng,
        yardId: distanceCalc.distance?.yard.id,
        yardName: distanceCalc.distance?.yard.name,
        distanceMiles: distanceCalc.distance?.distanceMiles,
        distanceBracket: distanceCalc.distance?.bracket?.bracketName,
        // Truck-aware routing data
        truckDistanceMiles: distanceCalc.distance?.routingProvider === 'google_routes' ? distanceCalc.distance?.distanceMiles : undefined,
        truckDurationMin: distanceCalc.distance?.durationTrafficMin,
        truckDurationMax: distanceCalc.distance?.durationTrafficMax,
        routePolyline: distanceCalc.distance?.polyline,
        routingProvider: distanceCalc.distance?.routingProvider,
        // Pre-purchase extra tons
        prePurchaseSuggested: prePurchaseSuggested,
        suggestedExtraTons: getSuggestedExtraTons(smartRecommendation.confidence),
        extraTonsPrepurchased: prepurchasedExtraTons,
        prepurchaseDiscountPct: DEFAULT_EXTRA_TON_PRICING.discountPct,
        prepurchaseRate: prepurchasedExtraTons > 0 ? DEFAULT_EXTRA_TON_PRICING.prepurchaseRate : undefined,
        prepurchaseCityRate: DEFAULT_EXTRA_TON_PRICING.standardRate,
        // Green Halo pricing data
        isGreenHalo: generalClassification?.isGreenHalo || false,
        greenHaloCategory: generalClassification?.isGreenHalo ? generalClassification.category || undefined : undefined,
        greenHaloDumpFee: generalClassification?.isGreenHalo ? calculateGreenHaloDumpFee(formData.size) : undefined,
        greenHaloHandlingFee: generalClassification?.isGreenHalo ? PRICING_POLICIES.greenHaloHandlingFee : undefined,
        greenHaloDumpFeePerTon: generalClassification?.isGreenHalo ? PRICING_POLICIES.greenHaloDumpFeePerTon : undefined,
      });

      if (!result.success) {
        console.error('[SaveQuote] Step A FAILED - DB error:', result.error);
        toast({
          title: 'Could Not Save Quote',
          description: result.error || 'Database error. Please try again or call us.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        setSmsStatus(null);
        return; // Exit early - don't proceed if DB save failed
      }

      quoteId = result.quoteId || null;
      setSavedQuoteId(quoteId);
      console.log('[SaveQuote] Step A SUCCESS - Quote saved with ID:', quoteId);

    } catch (dbError: any) {
      console.error('[SaveQuote] Step A EXCEPTION:', dbError);
      toast({
        title: 'Could Not Save Quote',
        description: 'Network error. Check your connection and try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      setSmsStatus(null);
      return; // Exit early
    }

    // ============================================================
    // PHASE 4: MARK AS SAVED (Success path - quote is in DB)
    // ============================================================
    setQuoteSaved(true);

    // ============================================================
    // PHASE 5: SEND NOTIFICATIONS (Best-effort - failures don't block save)
    // ============================================================
    let smsSent = false;

    // 5A: Send SMS/Email notification
    try {
      console.log('[SaveQuote] Step B: Sending SMS notification...');
      
      const notifyResponse = await supabase.functions.invoke('send-quote-summary', {
        body: {
          customerName: formData.name,
          customerEmail: formData.email || '',
          customerPhone: phoneValidation.formatted, // Use E.164 format
          sizeLabel: sizeData?.label || `${formData.size} Yard`,
          materialType: formData.material,
          rentalDays: formData.rentalDays,
          zipCode: formData.zip,
          estimatedMin: quote.estimatedMin,
          estimatedMax: quote.estimatedMax,
          includedTons: quote.includedTons,
          extras: extrasLabels,
        },
      });

      if (notifyResponse.error) {
        console.error('[SaveQuote] Step B WARNING - SMS function error:', notifyResponse.error);
      } else if (notifyResponse.data?.smsSent) {
        smsSent = true;
        console.log('[SaveQuote] Step B SUCCESS - SMS sent');
      } else {
        console.log('[SaveQuote] Step B - SMS not sent (Twilio may not be configured)');
      }
    } catch (notifyError: any) {
      console.error('[SaveQuote] Step B EXCEPTION (non-blocking):', notifyError?.message || notifyError);
    }

    // 5B: Sync to HighLevel CRM (fire and forget)
    try {
      console.log('[SaveQuote] Step C: Syncing to HighLevel...');
      
      supabase.functions.invoke('highlevel-webhook', {
        body: {
          event: 'quote_saved',
          quote_id: quoteId || 'unknown',
          name: formData.name,
          phone: phoneValidation.formatted,
          email: formData.email || undefined,
          zip: formData.zip,
          waste_type: formData.material,
          recommended_size: smartRecommendation.recommendedSize,
          selected_size: formData.size,
          included_tons: quote.includedTons,
          estimated_total: `$${quote.estimatedMin} - $${quote.estimatedMax}`,
          extras: extrasLabels.length > 0 ? extrasLabels.join(', ') : '',
          page: 'quick_quote',
          zone_name: zoneResult?.zoneName,
          project_type: projectType || undefined,
          confidence_level: smartRecommendation.confidence,
          tags: ['Quote Saved', 'Resume Later', formData.material === 'heavy' ? 'Heavy Materials' : 'General Debris'],
          yard_name: distanceCalc.distance?.yard.name,
          distance_miles: distanceCalc.distance?.distanceMiles,
          distance_bracket: distanceCalc.distance?.bracket?.bracketName,
        },
      }).then(() => {
        console.log('[SaveQuote] Step C SUCCESS - HighLevel sync complete');
      }).catch((hlError) => {
        console.error('[SaveQuote] Step C WARNING - HighLevel sync failed (non-blocking):', hlError);
      });
    } catch (hlError) {
      console.error('[SaveQuote] Step C EXCEPTION (non-blocking):', hlError);
    }

    // ============================================================
    // PHASE 6: SHOW SUCCESS UI WITH APPROPRIATE MESSAGE
    // ============================================================
    setSmsStatus(smsSent ? 'sent' : 'failed');
    
    if (smsSent) {
      toast({
        title: 'Quote Saved! ✅',
        description: "We've texted you the quote details",
      });
    } else {
      toast({
        title: 'Quote Saved! ✅',
        description: 'SMS could not be sent. Use the copy link below.',
      });
    }

    setIsSubmitting(false);
  };

  // Resend SMS for failed attempts
  const handleResendSms = async () => {
    if (!savedQuoteId || !formData.phone) return;
    
    const phoneValidation = validateAndFormatPhone(formData.phone);
    if (!phoneValidation.valid) {
      toast({ title: 'Invalid phone', description: phoneValidation.error, variant: 'destructive' });
      return;
    }

    setSmsStatus('pending');
    const sizeData = DUMPSTER_SIZES.find((s) => s.value === formData.size);
    const extrasLabels = formData.extras
      .map((e) => {
        const extra = EXTRAS.find((ex) => ex.id === e.id);
        return extra ? `${extra.label}${e.quantity > 1 ? ` (×${e.quantity})` : ''}` : null;
      })
      .filter(Boolean) as string[];

    try {
      const response = await supabase.functions.invoke('send-quote-summary', {
        body: {
          customerName: formData.name,
          customerEmail: formData.email || '',
          customerPhone: phoneValidation.formatted,
          sizeLabel: sizeData?.label || `${formData.size} Yard`,
          materialType: formData.material,
          rentalDays: formData.rentalDays,
          zipCode: formData.zip,
          estimatedMin: quote.estimatedMin,
          estimatedMax: quote.estimatedMax,
          includedTons: quote.includedTons,
          extras: extrasLabels,
        },
      });

      if (response.data?.smsSent) {
        setSmsStatus('sent');
        toast({ title: 'SMS Sent! ✅', description: 'Check your phone for the quote details.' });
      } else {
        setSmsStatus('failed');
        toast({ title: 'SMS Failed', description: 'Please use the copy link instead.', variant: 'destructive' });
      }
    } catch (err) {
      setSmsStatus('failed');
      toast({ title: 'SMS Failed', description: 'Network error. Try again later.', variant: 'destructive' });
    }
  };

  // Copy quote link to clipboard
  const handleCopyQuoteLink = () => {
    const link = `${window.location.origin}/quick-order?zip=${formData.zip}&size=${formData.size}&material=${formData.material}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link Copied! 📋', description: 'Share or save this link to resume your quote.' });
  };

  // SMS handler
  const handleTextQuote = () => {
    const sizeData = DUMPSTER_SIZES.find((s) => s.value === formData.size);
    const msg = encodeURIComponent(
      `Quote Request:\n${formData.name}\n${sizeData?.label} ${formData.material === 'heavy' ? '(Heavy)' : ''}\nZIP: ${formData.zip}\nEst: $${quote.estimatedMin}-$${quote.estimatedMax}`
    );
    window.open(`sms:+15106802150?body=${msg}`, '_blank');
  };

  // Toggle extra
  const toggleExtra = (extraId: string, quantity: number = 1) => {
    setFormData((prev) => {
      const existing = prev.extras.find((e) => e.id === extraId);
      if (existing) {
        if (quantity === 0) {
          return { ...prev, extras: prev.extras.filter((e) => e.id !== extraId) };
        }
        return {
          ...prev,
          extras: prev.extras.map((e) => (e.id === extraId ? { ...e, quantity } : e)),
        };
      }
      return { ...prev, extras: [...prev.extras, { id: extraId, quantity }] };
    });
  };

  const getExtraQuantity = (extraId: string) => {
    return formData.extras.find((e) => e.id === extraId)?.quantity || 0;
  };

  // Available sizes based on material
  const availableSizes = useMemo(() => {
    const material = MATERIAL_TYPES.find((m) => m.value === formData.material);
    return DUMPSTER_SIZES.filter((s) => material?.allowedSizes.includes(s.value));
  }, [formData.material]);

  // Filtered extras based on material and size (visibility rules)
  // Heavy: Hide "Extra Tons" entirely
  // Mixed 6/8/10: Hide "Extra Tons"
  // Mixed 20+: Show "Extra Tons" (optional pre-purchase)
  const filteredExtras = useMemo(() => {
    const isHeavy = formData.material === 'heavy';
    const isSmallGeneral = formData.material === 'general' && formData.size <= 10;
    
    return EXTRAS.filter(extra => {
      // Hide extra-tons for heavy materials and small general debris
      if (extra.id === 'extra-tons') {
        return !isHeavy && !isSmallGeneral;
      }
      return true;
    });
  }, [formData.material, formData.size]);

  // Get overage info for current selection
  const overageInfo = useMemo(() => {
    return getOverageInfo(formData.material, formData.size);
  }, [formData.material, formData.size]);

  return (
    <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border" id="quote-calculator">
      {/* Header - Modern System Style */}
      <div className="bg-foreground px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-base text-background">Quick Quote</h3>
              <p className="text-xs text-background/60">~60 seconds</p>
            </div>
          </div>
          {/* Live status indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-success/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-xs font-medium text-success">Live pricing</span>
          </div>
        </div>

        {/* Progress Steps - Modern numbered style with Step X of 6 indicator */}
        {step !== 'success' && (
          <div className="mt-4">
            {/* Step indicator text */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-background/60">
                Step {stepIndex + 1} of {STEPS.length}
              </span>
              <span className="text-xs font-semibold text-background">
                {STEPS[stepIndex]?.label}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="relative h-1.5 bg-background/10 rounded-full overflow-hidden mb-3">
              <div 
                className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
              />
            </div>

            {/* Step dots */}
            <div className="flex items-center">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                  <button
                    type="button"
                    onClick={() => i < stepIndex && setStep(s.key)}
                    disabled={i > stepIndex}
                    className={cn(
                      "relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all",
                      step === s.key
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-foreground"
                        : i < stepIndex
                        ? "bg-success text-success-foreground cursor-pointer"
                        : "bg-background/10 text-background/40 cursor-not-allowed"
                    )}
                    title={s.label}
                  >
                    {i < stepIndex ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      s.shortLabel
                    )}
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-1",
                      i < stepIndex ? "bg-success" : "bg-background/10"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className="p-5">
        {/* Step 1: ZIP */}
        {step === 'zip' && (
          <div className="space-y-5">
            {/* User Type Selection - Compact chips with SVG icons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">I am a...</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {USER_TYPES.map((type) => {
                  const IconComponent = USER_TYPE_ICONS[type.icon] || USER_TYPE_ICONS[type.value] || Home;
                  const isSelected = formData.userType === type.value;
                  
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, userType: type.value }))}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <IconComponent className="w-4 h-4" strokeWidth={2} />
                      <span>{type.label}</span>
                      {type.discount > 0 && isSelected && (
                        <span className="px-1.5 py-0.5 bg-success text-success-foreground text-[10px] rounded font-bold">
                          -{type.discount * 100}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ZIP Input - Clean system style with auto-detect */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Delivery ZIP
              </label>
              
              {/* Auto-detect status banner */}
              {autoDetectZip.isLoading && (
                <div className="mb-3 p-2.5 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Detecting your location...</span>
                </div>
              )}
              
              {/* Detected ZIP banner */}
              {formData.zip.length === 5 && autoDetectZip.source && autoDetectZip.source !== 'manual' && (
                <div className="mb-3 p-2.5 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">
                      {autoDetectZip.source === 'stored' ? (
                        <>Last used: <span className="font-mono font-bold">{formData.zip}</span></>
                      ) : autoDetectZip.source === 'geolocation' ? (
                        <>Detected: <span className="font-mono font-bold">{formData.zip}</span>{autoDetectZip.cityName && <span className="text-muted-foreground"> ({autoDetectZip.cityName})</span>}</>
                      ) : (
                        <>Suggested: <span className="font-mono font-bold">{formData.zip}</span></>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, zip: '' }));
                      autoDetectZip.clearStoredZip();
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Not my ZIP?
                  </button>
                </div>
              )}
              
              {/* ZIP input with inline location button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={5}
                    placeholder="94607"
                    value={formData.zip}
                    onChange={(e) => {
                      const newZip = e.target.value.replace(/\D/g, '');
                      setFormData((prev) => ({ ...prev, zip: newZip }));
                      // Save to storage when manually entering a complete ZIP
                      if (newZip.length === 5) {
                        autoDetectZip.saveZip(newZip);
                      }
                    }}
                    className={cn(
                      "text-xl h-14 text-center font-mono font-bold tracking-[0.3em] border-2",
                      formData.zip.length === 5 && !isCheckingZip && (
                        zoneResult ? "border-success bg-success/5 focus:border-success" : "border-destructive bg-destructive/5"
                      )
                    )}
                  />
                  {isCheckingZip && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  )}
                  {formData.zip.length === 5 && !isCheckingZip && zoneResult && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                  )}
                </div>
                
                {/* Use my location button - only shows when no ZIP and not loading */}
                {!formData.zip && !autoDetectZip.isLoading && autoDetectZip.permissionState !== 'denied' && (
                  <button
                    type="button"
                    onClick={() => autoDetectZip.requestGeolocation()}
                    className="h-14 px-4 rounded-lg bg-muted/50 border-2 border-border hover:border-primary/30 hover:bg-muted transition-colors flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground whitespace-nowrap"
                    title="Use my location"
                  >
                    <Navigation className="w-4 h-4" />
                    <span className="hidden sm:inline">Use my location</span>
                  </button>
                )}
              </div>
              
              {/* Privacy note - shown after geolocation is used */}
              {autoDetectZip.source === 'geolocation' && (
                <p className="mt-2 text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Location used only to suggest ZIP for pricing accuracy
                </p>
              )}

              {/* Zone Result - Status card */}
              {formData.zip.length === 5 && !isCheckingZip && (
                <>
                  {zoneResult ? (
                    <>
                      {/* Service confirmation badge */}
                      <div className="mt-3 p-3 rounded-lg bg-success/10 border border-success/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                            <Truck className="w-4 h-4 text-success" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* City/County line */}
                            <p className="font-medium text-foreground text-sm">
                              {autoDetectZip.cityName || zoneResult.cityName || zoneResult.zoneName}
                              {autoDetectZip.county && (
                                <span className="text-muted-foreground font-normal">, {autoDetectZip.county}</span>
                              )}
                            </p>
                            {/* Nearest yard */}
                            {distanceCalc.distance && (
                              <p className="text-xs text-success font-medium">
                                ✓ Nearest: {distanceCalc.distance.yard.name}
                              </p>
                            )}
                          </div>
                          {distanceCalc.distance && (
                            <div className="text-right flex-shrink-0">
                              <span className="text-sm font-bold text-foreground">
                                {distanceCalc.distance.distanceMiles.toFixed(1)} mi
                              </span>
                              {distanceCalc.distance.distanceMinutes && (
                                <p className="text-[10px] text-muted-foreground">
                                  ~{distanceCalc.distance.distanceMinutes} min
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Availability messaging based on distance */}
                        {distanceCalc.distance && (
                          <div className="mt-2 pt-2 border-t border-success/20">
                            <p className="text-xs text-muted-foreground">
                              {distanceCalc.distance.distanceMiles <= 10 && (
                                <span className="text-success">⚡ Same-day delivery may be available</span>
                              )}
                              {distanceCalc.distance.distanceMiles > 10 && distanceCalc.distance.distanceMiles <= 25 && (
                                <span className="text-primary">📅 Next-day delivery likely</span>
                              )}
                              {distanceCalc.distance.distanceMiles > 25 && (
                                <span className="text-warning">📞 Manual review recommended — we'll confirm by text</span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Distance Map */}
                      {distanceCalc.distance && distanceCalc.geocoding && (
                        <div className="mt-3">
                          <Suspense fallback={
                            <div className="h-40 bg-muted/50 rounded-lg animate-pulse flex items-center justify-center">
                              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                          }>
                            <DistanceMap
                              customerLat={distanceCalc.geocoding.lat}
                              customerLng={distanceCalc.geocoding.lng}
                              yard={distanceCalc.distance.yard}
                              distanceMiles={distanceCalc.distance.distanceMiles}
                              distanceMinutes={distanceCalc.distance.distanceMinutes}
                              durationTrafficMin={distanceCalc.distance.durationTrafficMin}
                              durationTrafficMax={distanceCalc.distance.durationTrafficMax}
                              polyline={distanceCalc.distance.polyline}
                              routingProvider={distanceCalc.distance.routingProvider}
                              requiresReview={distanceCalc.distance.requiresReview}
                            />
                          </Suspense>
                        </div>
                      )}
                      
                      {distanceCalc.isLoading && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Calculating distance...</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="mt-3 p-3 rounded-lg flex items-center gap-3 bg-amber-500/10 border border-amber-500/20">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">We may still help</p>
                        <p className="text-xs text-muted-foreground">
                          Enter your ZIP to confirm service availability
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Feature indicators - Horizontal compact */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Shield className="w-3.5 h-3.5" />, label: 'Licensed & Insured' },
                { icon: <Clock className="w-3.5 h-3.5" />, label: 'Same-Day' },
                { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'All-Inclusive' },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 rounded-lg border border-border">
                  <span className="text-primary">{badge.icon}</span>
                  <span className="text-xs text-muted-foreground font-medium">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Next Button - System style */}
            <Button
              type="button"
              variant="cta"
              size="lg"
              className="w-full h-12 text-sm font-semibold group"
              onClick={goNext}
              disabled={!canGoNext}
            >
              Continue to material
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        )}

        {/* Step 2: Material Type */}
        {step === 'material' && (
          <div className="space-y-5">
            {/* Back button - minimal */}
            <button
              type="button"
              onClick={goBack}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <div>
              <h4 className="text-base font-bold text-foreground mb-1">Material type</h4>
              <p className="text-xs text-muted-foreground mb-4">Determines size options and pricing</p>

              <div className="grid gap-3">
                {MATERIAL_TYPES.map((type) => {
                  // Use Lucide SVG icons based on material type
                  const IconComponent = type.value === 'heavy' ? HardHat : Trash2;
                  
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, material: type.value }));
                        // Reset classifications when switching material types
                        if (type.value !== 'heavy') {
                          setHeavyClassification(null);
                        }
                        if (type.value !== 'general') {
                          setGeneralClassification(null);
                        }
                      }}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden",
                        formData.material === type.value
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Lucide SVG Icon in circular container */}
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors",
                          formData.material === type.value
                            ? "bg-primary/10 border-primary/20"
                            : "bg-muted/80 border-border/50"
                        )}>
                          <IconComponent 
                            className={cn(
                              "w-5 h-5 transition-colors",
                              formData.material === type.value ? "text-primary" : "text-foreground/70"
                            )}
                            strokeWidth={2}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-semibold text-foreground">{type.label}</h5>
                            {type.value === 'heavy' && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded font-medium">
                                6-10 yd only
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{type.description}</p>
                          {type.value === 'heavy' && formData.material === 'heavy' && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-success font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Flat fee — disposal included
                            </div>
                          )}
                          {type.value === 'general' && formData.material === 'general' && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <span className="font-medium">Overage:</span> $165/ton (20+yd) or $30/yard (6-10yd)
                            </div>
                          )}
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          formData.material === type.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        )}>
                          {formData.material === type.value && (
                            <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Heavy Material Sub-Classification (only when heavy is selected) */}
            {formData.material === 'heavy' && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <h5 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-primary" strokeWidth={2} />
                  Heavy material details
                </h5>
                <HeavyMaterialSelector
                  selectedSize={formData.size <= 10 ? (formData.size as 6 | 8 | 10) : 10}
                  cityId="oakland"
                  onClassificationChange={(result) => {
                    setHeavyClassification(result);
                    // If reclassified to mixed, switch material to general
                    if (result.reclassifiedToMixed) {
                      setFormData(prev => ({ ...prev, material: 'general' }));
                    }
                  }}
                />
              </div>
            )}

            {/* General Material Sub-Classification (only when general is selected) */}
            {formData.material === 'general' && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <h5 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-primary" strokeWidth={2} />
                  Debris details
                </h5>
                <GeneralMaterialSelector
                  selectedSize={formData.size}
                  onClassificationChange={(result) => {
                    setGeneralClassification(result);
                  }}
                />
              </div>
            )}

            {/* Estimator Button */}
            <button
              type="button"
              onClick={() => setShowEstimator(true)}
              className="w-full p-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2 text-sm font-medium text-primary"
            >
              <Calculator className="w-4 h-4" />
              Estimate my debris volume (optional)
            </button>

            <Button
              type="button"
              variant="cta"
              size="lg"
              className="w-full h-12 text-sm font-semibold group"
              onClick={goNext}
              disabled={
                (formData.material === 'heavy' && !heavyClassification?.materialClass && !heavyClassification?.reclassifiedToMixed) ||
                (formData.material === 'general' && !generalClassification?.isComplete)
              }
            >
              {(formData.material === 'heavy' && !heavyClassification?.materialClass && !heavyClassification?.reclassifiedToMixed) ||
               (formData.material === 'general' && !generalClassification?.isComplete)
                ? 'Select debris type above'
                : 'Continue to size'}
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>

            {/* Material Volume Estimator Modal */}
            <MaterialVolumeEstimator
              isOpen={showEstimator}
              onClose={() => setShowEstimator(false)}
              initialMaterial={formData.material}
              onSelectSize={(size, isHeavy, data) => {
                setFormData(prev => ({ 
                  ...prev, 
                  size,
                  material: isHeavy ? 'heavy' : 'general'
                }));
                setEstimatorData(data);
                setShowEstimator(false);
                goNext(); // Go to size step with pre-selected size
              }}
            />
          </div>
        )}

        {/* Step 3: Size Selection */}
        {step === 'size' && (
          <div className="space-y-5">
            {/* Back button - minimal */}
            <button
              type="button"
              onClick={goBack}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>

            {/* Project Type Selector */}
            <ProjectTypeSelector 
              value={projectType}
              onChange={setProjectType}
              materialType={formData.material}
            />

            <div>
              <h4 className="text-base font-bold text-foreground mb-1">Select size</h4>
              <p className="text-xs text-muted-foreground mb-3">
                {formData.material === 'heavy' 
                  ? '6-10 yard for heavy materials — flat-fee pricing'
                  : '6-50 yard available'
                }
              </p>

              {/* Heavy Material Classification Summary */}
              {formData.material === 'heavy' && heavyClassification?.materialClass && (
                <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">
                        {heavyClassification.materialClass === 'base' && 'Base Heavy Materials'}
                        {heavyClassification.materialClass === 'plus_200' && 'Specialty Heavy (+$200)'}
                        {heavyClassification.materialClass === 'mixed_heavy' && 'Mixed Heavy (+$300)'}
                      </span>
                      <span className="text-xs text-success ml-2">
                        Flat fee — no weight charges
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confidence Meter - Compact (hidden for heavy since pricing is flat) */}
              {formData.material !== 'heavy' && (
                <div className="mb-4 p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <ConfidenceBadge 
                      confidence={smartRecommendation.confidence}
                      label={smartRecommendation.confidenceLabel}
                    />
                    <p className="text-xs text-foreground flex-1">{smartRecommendation.confidenceNote}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableSizes.map((size) => {
                  const includedTons = calculateIncludedTons(size.value, formData.material);
                  const image = DUMPSTER_IMAGES[size.value];
                  
                  // Calculate price based on material type
                  const isHeavyWithClass = formData.material === 'heavy' && heavyClassification?.materialClass;
                  let displayPrice: number;
                  let isFlatFee = false;
                  
                  if (isHeavyWithClass && [6, 8, 10].includes(size.value)) {
                    // Use heavy pricing calculation
                    const heavyPrice = calculateHeavyPrice(
                      size.value as 6 | 8 | 10, 
                      heavyClassification.materialClass as HeavyMaterialClass,
                      'oakland'
                    );
                    displayPrice = heavyPrice.roundedPrice;
                    isFlatFee = true;
                  } else {
                    // Standard pricing with zone multiplier
                    displayPrice = Math.round(size.basePrice * (zoneResult?.multiplier || 1));
                  }

                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, size: size.value }))}
                      className={cn(
                        "relative p-3 rounded-xl border-2 text-left transition-all",
                        formData.size === size.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-input bg-background hover:border-primary/50",
                        size.popular && "ring-1 ring-accent/50",
                        projectType && size.value === smartRecommendation.recommendedSize && "ring-2 ring-primary/50"
                      )}
                    >
                      {/* Recommended Badge (when project type is selected) */}
                      <RecommendedBadge isRecommended={projectType !== null && size.value === smartRecommendation.recommendedSize} />
                      
                      {/* Popular Badge (only if not showing recommended) */}
                      {size.popular && !(projectType !== null && size.value === smartRecommendation.recommendedSize) && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full whitespace-nowrap z-10">
                          POPULAR
                        </span>
                      )}

                      {image && (
                        <div className="aspect-[4/3] bg-muted/50 rounded-lg mb-2 p-2 mt-2">
                          <img src={image} alt={size.label} className="w-full h-full object-contain" />
                        </div>
                      )}

                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{size.value}</div>
                        <div className="text-xs text-muted-foreground uppercase">yard</div>
                        
                        {/* Weight info - different for heavy vs general */}
                        {isFlatFee ? (
                          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-success font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Flat fee
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-primary font-medium">
                            <Weight className="w-3 h-3" />
                            {includedTons}T incl
                          </div>
                        )}
                        
                        {size.dimensions && (
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            Approx. {size.dimensions}
                          </div>
                        )}
                        
                        {/* Price display */}
                        <div className={cn(
                          "mt-2 text-sm font-semibold",
                          isFlatFee ? "text-success" : "text-foreground"
                        )}>
                          ${displayPrice}
                        </div>
                        
                        {/* Heavy material increment badge */}
                        {isFlatFee && heavyClassification?.increment && heavyClassification.increment > 0 && (
                          <div className="mt-1 text-[10px] text-amber-600 font-medium">
                            +${heavyClassification.increment} specialty
                          </div>
                        )}
                        
                        {/* Show reason under recommended card */}
                        {projectType !== null && size.value === smartRecommendation.recommendedSize && (
                          <RecommendationReason reason={smartRecommendation.recommendationReason} />
                        )}
                      </div>

                      {formData.size === size.value && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Why This Size - Expandable explanation */}
              <WhyThisSize
                projectType={projectType}
                materialType={formData.material}
                recommendedSize={smartRecommendation.recommendedSize}
                selectedSize={formData.size}
              />

              {/* Selected size details */}
              {formData.size && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold text-foreground">
                        {DUMPSTER_SIZES.find((s) => s.value === formData.size)?.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {DUMPSTER_SIZES.find((s) => s.value === formData.size)?.dimensions} • 
                        {' '}{DUMPSTER_SIZES.find((s) => s.value === formData.size)?.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Weight Visualization */}
                  <WeightVisualization 
                    includedTons={calculateIncludedTons(formData.size, formData.material)}
                    materialType={formData.material}
                    projectType={projectType}
                    className="mt-3"
                  />
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="cta"
              size="lg"
              className="w-full h-12 text-sm font-semibold group"
              onClick={goNext}
            >
              Continue to options
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        )}

        {/* Step 4: Options (Rental + Extras) */}
        {step === 'options' && (
          <div className="space-y-5">
            {/* Back button - minimal */}
            <button
              type="button"
              onClick={goBack}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>

            {/* Rental Duration - Compact */}
            <div>
              <h4 className="text-base font-bold text-foreground mb-1">Rental period</h4>
              <p className="text-xs text-muted-foreground mb-3">7-day standard included</p>

              <div className="grid grid-cols-4 gap-2">
                {RENTAL_PERIODS.map((period) => (
                  <button
                    key={period.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, rentalDays: period.value }))}
                    className={cn(
                      "relative py-2.5 px-2 rounded-lg border text-center transition-all",
                      formData.rentalDays === period.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/30"
                    )}
                  >
                    {period.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-success text-success-foreground text-[9px] font-bold rounded">
                        STD
                      </span>
                    )}
                    <div className="text-base font-bold text-foreground">{period.value}</div>
                    <div className="text-[10px] text-muted-foreground">days</div>
                    {period.extraCost > 0 && (
                      <div className="text-[10px] text-primary mt-0.5 font-medium">+${period.extraCost}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Tons Pre-Purchase Recommendation */}
            {!prePurchaseSkipped && (
              <ExtraTonsRecommendation
                materialType={formData.material}
                sizeYards={formData.size}
                confidence={smartRecommendation.confidence}
                confidenceLabel={smartRecommendation.confidenceLabel}
                onAddExtraTons={(tons) => {
                  setPrepurchasedExtraTons(tons);
                  setPrePurchaseSuggested(true);
                }}
                onSkip={() => setPrePurchaseSkipped(true)}
                currentExtraTons={prepurchasedExtraTons}
              />
            )}

            {/* Extras - Cleaner cards with SVG icons */}
            <div>
              <h4 className="text-base font-bold text-foreground mb-1">Add-ons</h4>
              <p className="text-xs text-muted-foreground mb-3">Optional services</p>

              {/* Material-specific overage note */}
              <div className={cn(
                "mb-3 text-xs rounded-lg px-3 py-2 flex items-center gap-2",
                formData.material === 'heavy' 
                  ? "bg-success/10 text-success border border-success/20" 
                  : "bg-muted/50 text-muted-foreground border border-border"
              )}>
                {formData.material === 'heavy' ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Heavy materials are flat-fee. No extra weight charges.</span>
                  </>
                ) : formData.size <= 10 ? (
                  <>
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Overage is billed at $30 per additional yard for 6–10 yard mixed debris.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Overage billed per ton after disposal scale ticket ($165/ton).</span>
                  </>
                )}
              </div>

              <div className="space-y-2">
                {filteredExtras.map((extra) => {
                  const qty = getExtraQuantity(extra.id);
                  const isSelected = qty > 0;
                  const IconComponent = EXTRAS_ICON_MAP[extra.icon] || Package;

                  return (
                    <div
                      key={extra.id}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all",
                        isSelected ? "border-primary bg-primary/5" : "border-input bg-background"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon in circular container */}
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                          "bg-muted/80 border border-border/50",
                          isSelected && "bg-primary/10 border-primary/20"
                        )}>
                          <IconComponent 
                            className={cn(
                              "w-5 h-5 transition-colors",
                              isSelected ? "text-primary" : "text-foreground/70"
                            )}
                            strokeWidth={2}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-foreground">{extra.label}</span>
                            <span className="text-sm font-semibold text-foreground">${extra.price}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{extra.description}</p>
                        </div>
                        
                        {extra.allowQuantity ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleExtra(extra.id, Math.max(0, qty - 1))}
                              className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-muted/80"
                            >
                              −
                            </button>
                            <span className="w-6 text-center font-medium text-foreground">{qty}</span>
                            <button
                              type="button"
                              onClick={() => toggleExtra(extra.id, Math.min(extra.maxQuantity || 99, qty + 1))}
                              className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-muted/80"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleExtra(extra.id, isSelected ? 0 : 1)}
                            className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                          >
                            {isSelected ? <CheckCircle className="w-4 h-4" /> : '+'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quote Breakdown - Cleaner invoice style */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-foreground px-4 py-2.5 flex items-center justify-between">
                <h5 className="font-bold text-background text-sm">Quote summary</h5>
                <div className="flex items-center gap-1.5 text-xs text-background/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                  Live estimate
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {/* Line Items */}
                <div className="space-y-2">
                  {quote.lineItems.map((item, i) => {
                    // Fix "Heavy Material Surcharge" label when using flat-fee
                    const displayLabel = item.label === 'Heavy Material Surcharge' && formData.material === 'heavy'
                      ? 'Heavy Materials (flat-fee pricing)'
                      : item.label;
                    
                    return (
                      <div key={i} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <span className={cn(
                            "font-medium",
                            item.type === 'discount' ? 'text-success' : 'text-foreground'
                          )}>
                            {displayLabel}
                          </span>
                          {item.subLabel && (
                            <div className="text-[11px] text-muted-foreground">{item.subLabel}</div>
                          )}
                        </div>
                        <span className={cn(
                          "font-semibold shrink-0 tabular-nums text-sm",
                          item.type === 'discount' ? 'text-success' : 'text-foreground'
                        )}>
                          {item.type === 'discount' ? '−' : ''}${Math.abs(item.amount).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-border" />

                {/* Estimated Total */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-foreground text-sm">Estimated Total</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-foreground tabular-nums">
                      ${quote.estimatedMin.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      –${quote.estimatedMax.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Included info row - different for heavy vs general */}
                <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 text-xs">
                  {formData.material === 'heavy' ? (
                    <span className="text-success font-medium flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Flat fee — disposal included, no weight charges
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {formData.rentalDays}-day rental • {quote.includedTons}T included
                    </span>
                  )}
                  <CheckCircle className="w-3.5 h-3.5 text-success" />
                </div>

                {/* Overage disclaimer - only for general debris */}
                {formData.material === 'general' && (
                  <div className="text-[10px] text-muted-foreground bg-muted/30 rounded px-2 py-1.5">
                    {formData.size <= 10 
                      ? 'Overage: $30 per additional yard'
                      : 'Included tons + overage per ton after scale ticket'
                    }
                  </div>
                )}
              </div>

              {/* Tips footer */}
              <div className="bg-success/5 px-4 py-2.5 border-t border-success/20">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" /> Below rim</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" /> No mixing</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" /> Clear access</span>
                </div>
              </div>
            </div>
            
            {/* Educational Micro-Copy */}
            <EducationalMicroCopy />

            {/* CTAs - System style */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="cta"
                size="lg"
                className="w-full h-12 text-sm font-semibold group"
                onClick={goNext}
              >
                <Bookmark className="w-4 h-4" />
                Save & text me this quote
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="default"
                className="w-full text-sm"
                onClick={() => {
                  const sizeData = DUMPSTER_SIZES.find((s) => s.value === formData.size);
                  const materialLabel = formData.material === 'heavy' ? 'Heavy Materials' : 'General Debris';
                  const msg = encodeURIComponent(
                    `Hi! I'd like to confirm my dumpster rental:\n\n` +
                    `📦 ${sizeData?.label} (${materialLabel})\n` +
                    `📍 ZIP: ${formData.zip}\n` +
                    `📅 ${formData.rentalDays} day rental\n` +
                    `💰 Est: $${quote.estimatedMin}–$${quote.estimatedMax}\n\n` +
                    `Please confirm availability!`
                  );
                  window.open(`sms:+15106802150?body=${msg}`, '_blank');
                }}
              >
                <MessageCircle className="w-4 h-4" />
                Text us instead
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Save & Resume (Lead Capture) */}
        {step === 'save' && (
          <div className="space-y-5">
            <button
              type="button"
              onClick={goBack}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {!quoteSaved ? (
              <>
                {/* Header */}
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-7 h-7 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground">Save & Text Me This Quote</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll text you the quote details so you can resume anytime
                  </p>
                </div>

                {/* Mini Quote Summary */}
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-foreground">
                        {DUMPSTER_SIZES.find((s) => s.value === formData.size)?.label}
                        {' '}({formData.material === 'heavy' ? 'Heavy' : 'General'})
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formData.material === 'heavy' 
                          ? `${formData.rentalDays} days • Flat fee – disposal included`
                          : `${formData.rentalDays} days • ${quote.includedTons}T included`
                        }
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">
                        ${quote.estimatedMin}–${quote.estimatedMax}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Capture Form */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      <User className="w-4 h-4 inline mr-1.5" />
                      Your Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      <Phone className="w-4 h-4 inline mr-1.5" />
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      placeholder="(510) 555-1234"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      <Mail className="w-4 h-4 inline mr-1.5" />
                      Email <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  type="button"
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

                {/* Office Status */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <OfficeStatusLine />
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  By saving, you agree to receive SMS messages about your quote. 
                  Msg & data rates may apply.
                </p>
              </>
            ) : (
              /* Quote Saved State */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                
                <h4 className="text-xl font-bold text-foreground mb-2">Quote Saved!</h4>
                
                {/* SMS Status Message */}
                {smsStatus === 'sent' ? (
                  <p className="text-muted-foreground mb-4">
                    Check your phone — we've texted you the details.
                  </p>
                ) : smsStatus === 'failed' ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <p className="text-orange-700 text-sm">
                      ⚠️ SMS could not be sent. Use the buttons below to copy your link or try again.
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-4">
                    Your quote is saved. We're sending confirmation...
                  </p>
                )}

                {/* Copy Link & Resend Buttons */}
                {smsStatus !== 'sent' && (
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={handleCopyQuoteLink}
                    >
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={handleResendSms}
                      disabled={smsStatus === 'pending'}
                    >
                      {smsStatus === 'pending' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Resend SMS
                    </Button>
                  </div>
                )}

                {/* Mini Quote Summary */}
                <div className="bg-muted/50 rounded-xl p-4 text-left mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-foreground">
                        {DUMPSTER_SIZES.find((s) => s.value === formData.size)?.label}
                        {' '}({formData.material === 'heavy' ? 'Heavy' : 'General'})
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formData.rentalDays} days • {quote.includedTons}T included • ZIP {formData.zip}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        ${quote.estimatedMin}–${quote.estimatedMax}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Continue Order CTA */}
                <Button
                  type="button"
                  variant="cta"
                  size="lg"
                  className="w-full h-14 text-base"
                  onClick={goNext}
                >
                  Continue Order
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <p className="text-sm text-muted-foreground mt-4">
                  Not ready yet? No problem — {smsStatus === 'sent' ? 'click the link in your text' : 'use the copy link above'} anytime to continue.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 6: Order Flow (Address → Map Pin → Continue) */}
        {step === 'order' && (
          <QuoteOrderFlow
            quoteSummary={{
              sizeLabel: DUMPSTER_SIZES.find((s) => s.value === formData.size)?.label || `${formData.size} Yard`,
              materialType: formData.material,
              rentalDays: formData.rentalDays,
              zipCode: formData.zip,
              estimatedMin: quote.estimatedMin,
              estimatedMax: quote.estimatedMax,
              includedTons: quote.includedTons,
              subtotal: quote.subtotal,
            }}
            initialContact={{
              name: formData.name,
              phone: formData.phone,
              email: formData.email,
            }}
            onComplete={() => setStep('success')}
            onBack={goBack}
          />
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">Quote Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              We'll contact you within 15 minutes to confirm your booking.
            </p>

            <div className="bg-muted/50 rounded-xl p-4 text-left mb-6">
              <div className="text-sm text-muted-foreground mb-1">Quote Summary</div>
              <div className="flex justify-between items-center">
                <div className="font-semibold text-foreground">
                  {DUMPSTER_SIZES.find((s) => s.value === formData.size)?.label}
                  {' '}({formData.material === 'heavy' ? 'Heavy' : 'General'})
                </div>
                <div className="text-lg font-bold text-foreground">
                  ${quote.estimatedMin}–${quote.estimatedMax}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {formData.rentalDays} days • {quote.includedTons}T included • ZIP {formData.zip}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full gap-2"
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
                  setProjectType(null);
                }}
              >
                Get Another Quote
              </Button>
              
              <Button variant="outline" className="w-full gap-2" asChild>
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
