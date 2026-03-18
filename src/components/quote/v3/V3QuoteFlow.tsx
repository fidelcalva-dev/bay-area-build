// ============================================================
// V3 QUOTE FLOW — Premium Logistics Platform Experience
// ZIP → Customer Type → Project → Size → Price → Access → Confirm
// ============================================================

import { useState, useEffect, useMemo, useCallback, lazy, Suspense, useRef } from 'react';
import { getPriceRangeForZip, type PriceRange } from '@/lib/masterPricingService';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuoteDraftAutosave, clearDraft } from './useQuoteDraftAutosave';
import { HOMEOWNER_PROJECTS, CONTRACTOR_PROJECTS, COMMERCIAL_PROJECTS } from './types';
import {
  MapPin, ChevronRight, ChevronLeft, Phone, User, Mail, Loader2,
  CheckCircle, Shield, Clock, Truck, Home, HardHat, Building2,
  Warehouse, UtensilsCrossed, Trees, Hammer, Mountain, Construction,
  DoorOpen, Store, RefreshCw, Scale, Calendar, Star, Info, RotateCcw, SkipForward,
  Award, Zap, Navigation, MessageSquare,
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
import { ga4, zipPrefix } from '@/lib/analytics/ga4';
import { PRICING_POLICIES, INCLUDED_TONS_BY_SIZE } from '@/lib/shared-data';
import { DUMPSTER_PHOTO_MAP } from '@/lib/canonicalDumpsterImages';

import { usePricingData, calculateIncludedTons } from '../hooks/usePricingData';
import { useDistanceCalculation } from '../hooks/useDistanceCalculation';
import { PRICING_ZONES } from '../constants';

import type { V3Step, CustomerType, ProjectCard } from './types';
import { getProjectsForCustomerType } from './types';
import { ServiceTimeBreakdown, buildServiceTimeEstimate } from './ServiceTimeBreakdown';
import { AccessConstraintStep, type AccessConstraintData } from './AccessConstraintStep';
import { HEAVY_MATERIAL_STRUCTURE, LIVE_LOAD_POLICY } from './copy';
import { ServiceCycleBar } from './components/ServiceCycleBar';
import { AvailabilityMeter } from './components/AvailabilityMeter';
import { useAvailabilityConfidence } from './hooks/useAvailabilityConfidence';
import {
  calculateServiceTime,
  buildRouteMinutes,
  type LogisticsServiceType,
} from '@/lib/logistics/serviceTimeEngine';
import { AddressAutocomplete, type AddressResult } from './AddressAutocomplete';
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
  marketCode?: string;
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pricingData = usePricingData();
  const { sizes: DUMPSTER_SIZES } = pricingData;

  // URL param prefill
  const urlZip = searchParams.get('zip') || '';
  const urlType = searchParams.get('type') as CustomerType | null;
  const urlProject = searchParams.get('project') || '';
  const urlSize = searchParams.get('size');
  const prefillApplied = useRef(false);

  // Draft autosave
  const urlDraftToken = searchParams.get('draft');
  const draft = useQuoteDraftAutosave(urlDraftToken);
  const draftApplied = useRef(false);
  const quoteStartedFired = useRef(false);

  // Step state — start at zip, will auto-advance if prefilled
  const [step, setStep] = useState<V3Step>('zip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingZip, setIsCheckingZip] = useState(false);
  const [zoneResult, setZoneResult] = useState<ZoneResult | null>(null);
  const [stepStartTime, setStepStartTime] = useState(Date.now());

  // Form state — initialize from URL params
  const [zip, setZip] = useState(urlZip.length === 5 && /^\d{5}$/.test(urlZip) ? urlZip : '');
  const [customerType, setCustomerType] = useState<CustomerType | null>(
    urlType && ['homeowner', 'contractor', 'commercial'].includes(urlType) ? urlType : null
  );
  const [selectedProject, setSelectedProject] = useState<ProjectCard | null>(null);
  const [size, setSize] = useState(urlSize ? parseInt(urlSize, 10) || 20 : 20);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Access constraint data
  const [accessData, setAccessData] = useState<AccessConstraintData | null>(null);

  // Address mode
  const [useAddress, setUseAddress] = useState(false);
  const [addressResult, setAddressResult] = useState<AddressResult | null>(null);

  // Swap toggle (declared early for draft effects)
  const [wantsSwap, setWantsSwap] = useState(false);

  // Restore draft state when user accepts resume
  useEffect(() => {
    if (draft.loadedDraft && !draft.showResumeBanner && !draftApplied.current) {
      draftApplied.current = true;
      const d = draft.loadedDraft;
      if (d.zip) setZip(d.zip);
      if (d.customerType) setCustomerType(d.customerType);
      if (d.selectedProjectId) {
        const allProjects = [...HOMEOWNER_PROJECTS, ...CONTRACTOR_PROJECTS, ...COMMERCIAL_PROJECTS];
        const found = allProjects.find(p => p.id === d.selectedProjectId);
        if (found) setSelectedProject(found);
      }
      if (d.size) setSize(d.size);
      if (d.wantsSwap) setWantsSwap(true);
      if (d.customerName) setCustomerName(d.customerName);
      if (d.customerPhone) setCustomerPhone(d.customerPhone);
      if (d.customerEmail) setCustomerEmail(d.customerEmail);
      if (d.termsAccepted) setTermsAccepted(d.termsAccepted);
      if (d.useAddress) setUseAddress(true);
      setStep(d.step);
    }
  }, [draft.loadedDraft, draft.showResumeBanner]);

  // Autosave on meaningful changes (debounced inside the hook)
  useEffect(() => {
    if (step === 'placement') return; // don't save post-submit
    draft.saveDraft({
      step,
      zip,
      customerType,
      selectedProjectId: selectedProject?.id || null,
      size,
      wantsSwap,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      termsAccepted,
      useAddress,
      formattedAddress: addressResult?.formattedAddress,
      lat: addressResult?.lat,
      lng: addressResult?.lng,
    });
  }, [step, zip, customerType, selectedProject, size, customerName, customerPhone, customerEmail, termsAccepted, useAddress, addressResult]);

  // Handle "Start Over"
  const handleStartOver = useCallback(() => {
    draft.resetDraft();
    setStep('zip');
    setZip('');
    setCustomerType(null);
    setSelectedProject(null);
    setSize(20);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setTermsAccepted(false);
    setUseAddress(false);
    setAddressResult(null);
    setZoneResult(null);
    setWantsSwap(false);
    draftApplied.current = false;
    prefillApplied.current = false;
  }, [draft]);

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

  // Distance calculation — use address lat/lng if available
  const distanceCalc = useDistanceCalculation(zip, addressResult?.lat, addressResult?.lng);

  // Track step timing + GA4 step viewed
  const stepIndexMap: Record<V3Step, number> = { zip: 1, 'customer-type': 2, project: 3, size: 4, contact: 5, price: 6, access: 7, confirm: 8, placement: 9 };
  useEffect(() => {
    setStepStartTime(Date.now());
    ga4.quoteStepViewed({ flow_version: 'v3', step_name: step, step_index: stepIndexMap[step] });
    // Fire price_viewed when entering price step
    if (step === 'price' && quote.isValid) {
      ga4.quotePriceViewed({ size_yd: size, material_category: materialTypeForPricing, value_estimated: quote.subtotal, included_tons: quote.includedTons });
    }
  }, [step]);

  // Zone lookup
  const lookupZone = useCallback(async (zipCode: string) => {
    if (zipCode.length !== 5) { setZoneResult(null); return; }
    setIsCheckingZip(true);
    try {
      const { data, error } = await supabase
        .from('zone_zip_codes')
        .select(`zone_id, city_name, market_id, zone:pricing_zones!inner(id, name, base_multiplier, is_active)`)
        .eq('zip_code', zipCode)
        .maybeSingle();

      if (!error && data && (data.zone as any)?.is_active) {
        setZoneResult({
          zoneId: data.zone_id,
          zoneName: (data.zone as any).name,
          cityName: data.city_name || undefined,
          multiplier: Number((data.zone as any).base_multiplier),
          marketCode: data.market_id || undefined,
        });
        return;
      }
      for (const zone of PRICING_ZONES) {
        if (zone.zipCodes.includes(zipCode)) {
          setZoneResult({ zoneId: null as any, zoneName: zone.name, cityName: undefined, multiplier: zone.baseMultiplier });
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

  // Auto-advance past ZIP step when prefilled from homepage
  useEffect(() => {
    if (prefillApplied.current) return;
    if (!zoneResult) return;
    // Only auto-advance if ZIP came from URL and we're still on ZIP step
    if (urlZip.length === 5 && step === 'zip') {
      prefillApplied.current = true;
      // If customer type was also provided, skip to project step
      if (customerType) {
        setStep('project');
      } else {
        setStep('customer-type');
      }
    }
  }, [zoneResult, step, urlZip, customerType]);

  const isHeavy = selectedProject?.isHeavy ?? false;
  const materialTypeForPricing = isHeavy ? 'heavy' : 'general';

  // Auto-adjust size for heavy materials
  useEffect(() => {
    if (isHeavy && size > 10) setSize(10);
  }, [isHeavy, size]);

  // Available sizes
  const availableSizes = useMemo(() => {
    if (isHeavy) return [5, 8, 10];
    return [5, 8, 10, 20, 30, 40, 50];
  }, [isHeavy]);

  // Recommended + alternatives
  const recommendedSize = selectedProject?.suggestedSize ?? 20;
  const alternativeSizes = useMemo(() => {
    const rec = recommendedSize;
    const smaller = availableSizes.filter(s => s < rec).slice(-1)[0];
    const larger = availableSizes.filter(s => s > rec)[0];
    return { smaller, larger };
  }, [recommendedSize, availableSizes]);

  // City-specific master pricing from dumpster_pricing table
  const [masterPriceRange, setMasterPriceRange] = useState<PriceRange | null>(null);
  useEffect(() => {
    if (!zip || zip.length !== 5 || !zoneResult) {
      setMasterPriceRange(null);
      return;
    }
    let cancelled = false;
    getPriceRangeForZip(zip, size, materialTypeForPricing as 'general' | 'heavy').then((range) => {
      if (!cancelled) setMasterPriceRange(range);
    });
    return () => { cancelled = true; };
  }, [zip, size, materialTypeForPricing, zoneResult]);

  // Calculate quote — use master pricing when available, fallback to legacy
  const quote = useMemo(() => {
    if (!zoneResult) return { subtotal: 0, subtotalHigh: 0, includedTons: 0, isValid: false, isFlatFee: false };

    // Master pricing path (city-specific from dumpster_pricing table)
    if (masterPriceRange) {
      let low = masterPriceRange.low;
      let high = masterPriceRange.high;
      if (distanceCalc.distance?.priceAdjustment) {
        low += distanceCalc.distance.priceAdjustment;
        high += distanceCalc.distance.priceAdjustment;
      }
      return {
        subtotal: low,
        subtotalHigh: high,
        includedTons: masterPriceRange.includedTons,
        isValid: true,
        isFlatFee: masterPriceRange.isFlatFee,
      };
    }

    // Legacy fallback
    const sizeData = DUMPSTER_SIZES.find(s => s.value === size);
    if (!sizeData) return { subtotal: 0, subtotalHigh: 0, includedTons: 0, isValid: false, isFlatFee: false };

    const isFlatFee = isHeavy;
    const includedTons = isFlatFee ? 0 : calculateIncludedTons(size, materialTypeForPricing);
    let subtotal = Math.round(sizeData.basePrice * zoneResult.multiplier);
    if (isHeavy) subtotal += 200;
    if (distanceCalc.distance?.priceAdjustment) subtotal += distanceCalc.distance.priceAdjustment;

    return { subtotal, subtotalHigh: subtotal + 70, includedTons, isValid: true, isFlatFee };
  }, [size, zoneResult, DUMPSTER_SIZES, distanceCalc.distance, isHeavy, materialTypeForPricing, masterPriceRange]);

  // Step index for progress
  const stepIndex = useMemo(() => {
    const map: Record<V3Step, number> = { zip: 1, 'customer-type': 2, project: 3, size: 4, contact: 5, price: 6, access: 7, confirm: 8, placement: 9 };
    return Math.min(map[step], 8);
  }, [step]);

  // Swap toggle (moved up for draft effects)

  // Navigation
  const goNext = () => {
    const duration = Date.now() - stepStartTime;
    analytics.quoteStepComplete(step, duration);
    ga4.quoteStepCompleted({ flow_version: 'v3', step_name: step, time_on_step_sec: Math.round(duration / 1000) });
    // Fire quote_started on first progression from zip
    if (step === 'zip' && !quoteStartedFired.current) {
      quoteStartedFired.current = true;
      ga4.quoteStarted({ flow_version: 'v3', entry_point: 'quote_page', city: zoneResult?.cityName, zip });
    }
    const next: Record<V3Step, V3Step> = {
      zip: 'customer-type',
      'customer-type': 'project',
      project: 'size',
      size: 'contact',
      contact: 'price',
      price: 'access',
      access: 'confirm',
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
      contact: 'size',
      price: 'contact',
      access: 'price',
      confirm: 'access',
      placement: 'confirm',
    };
    setStep(prev[step]);
  };

  // Progressive lead capture — fire at key milestones
  const leadCaptured = useRef<Record<string, boolean>>({});
  const capturePartialLead = useCallback(async (milestone: string) => {
    if (leadCaptured.current[milestone]) return;

    // lead-ingest requires phone or email — skip early milestones that fire
    // before the user enters contact info; they'll be captured at contact_captured
    const hasContact = !!(customerPhone || customerEmail);
    if (!hasContact) {
      return;
    }

    leadCaptured.current[milestone] = true;
    try {
      await supabase.functions.invoke('lead-ingest', {
        body: {
          source_channel: 'QUOTE_FLOW',
          source_detail: `quote_${milestone}`,
          source_page: '/quote',
          source_module: 'v3_quote_flow',
          name: customerName || null,
          phone: customerPhone || null,
          email: customerEmail || null,
          zip: zip || null,
          city: addressResult?.city || zoneResult?.cityName || null,
          address: addressResult?.formattedAddress || null,
          project_type: selectedProject?.label || null,
          material_category: materialTypeForPricing || null,
          size_preference: String(size),
          selected_size: size,
          customer_type: customerType || null,
          quote_amount: quote.isValid ? quote.subtotal : null,
          quote_amount_high: quote.isValid ? quote.subtotalHigh : null,
          last_step_completed: milestone,
          message: `Quote flow milestone: ${milestone} | Size: ${size}yd | Type: ${customerType || 'unknown'}`,
          consent_status: 'TRANSACTIONAL',
          raw_payload: {
            milestone,
            selected_size: size,
            material_type: materialTypeForPricing,
            material_class: isHeavy ? (selectedProject?.id || 'heavy') : 'general',
            customer_type: customerType,
            project_id: selectedProject?.id,
            is_heavy: isHeavy,
            quote_amount: quote.isValid ? quote.subtotal : null,
            quote_amount_high: quote.isValid ? quote.subtotalHigh : null,
            last_step_completed: step,
            readiness_state: milestone,
          },
        },
      });
    } catch (err) {
      console.warn('Partial lead capture failed:', err);
    }
  }, [zip, customerName, customerPhone, customerEmail, addressResult, zoneResult, selectedProject, materialTypeForPricing, size, customerType, isHeavy, quote, step]);

  // Fire progressive captures on step transitions
  useEffect(() => {
    if (step === 'size' && zip && selectedProject) {
      capturePartialLead('quote_started');
    }
    if (step === 'price' && quote.isValid) {
      capturePartialLead('quote_priced');
    }
  }, [step, zip, selectedProject, quote.isValid]);

  // Batch-capture all prior milestones when contact is first provided
  const contactBatchFired = useRef(false);
  useEffect(() => {
    if (contactBatchFired.current) return;
    if (!(customerPhone || customerEmail)) return;
    contactBatchFired.current = true;
    // Fire contact_captured which will also include all context
    capturePartialLead('contact_captured');
  }, [customerPhone, customerEmail, capturePartialLead]);

  const handleProjectSelect = (project: ProjectCard) => {
    setSelectedProject(project);
    setSize(project.suggestedSize);
    ga4.quoteRecommendedSizeShown({ size_yd: project.suggestedSize, material_category: project.isHeavy ? 'heavy' : 'general', customer_type: customerType || 'unknown' });
    setTimeout(() => setStep('size'), 200);
  };

  // Upsell nudge state
  const [showUpsellNudge, setShowUpsellNudge] = useState(false);

  // Handle size tap
  const handleSizeSelect = (s: number) => {
    setSize(s);
    ga4.quoteSizeSelected({ size_yd: s, was_recommended: s === recommendedSize });

    // Upsell: if 10yd selected for general debris, nudge toward 20yd
    if (s === 10 && !isHeavy && availableSizes.includes(20)) {
      setShowUpsellNudge(true);
      return; // don't auto-advance — show nudge first
    }

    setShowUpsellNudge(false);
    setTimeout(() => setStep('contact'), 200);
  };

  const handleAcceptUpsell = () => {
    setSize(20);
    setShowUpsellNudge(false);
    ga4.quoteSizeSelected({ size_yd: 20, was_recommended: false });
    setTimeout(() => setStep('contact'), 200);
  };

  const handleDeclineUpsell = () => {
    setShowUpsellNudge(false);
    setTimeout(() => setStep('contact'), 200);
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
        estimatedMax: quote.subtotalHigh,
        isCalsanFulfillment: true,
        customerLat: addressResult?.lat ?? distanceCalc.geocoding?.lat,
        customerLng: addressResult?.lng ?? distanceCalc.geocoding?.lng,
        yardId: distanceCalc.distance?.yard.id,
        distanceMiles: distanceCalc.distance?.distanceMiles,
        streetAddress: addressResult?.formattedAddress,
        city: addressResult?.city,
        state: addressResult?.state,
        accessFlags: accessData?.flagsMap,
        placementType: accessData?.placementType,
        gateCode: accessData?.gateCode,
      });

      if (result.success) {
        setSavedQuoteId(result.quoteId ?? null);
        draft.resetDraft(); // Clear draft after successful submission
        analytics.quoteCompleted(size, materialTypeForPricing, quote.subtotal);
        ga4.quoteSubmitted({ flow_version: 'v3', size_yd: size, material_category: materialTypeForPricing, value_estimated: quote.subtotal, city: zoneResult?.cityName, zip, serviceable: true });
        // Send quote summary (best effort)
        supabase.functions.invoke('send-quote-summary', {
          body: {
            customerName,
            customerPhone: phoneValidation.formatted,
            sizeLabel: sizeData?.label || `${size} Yard`,
            materialType: materialTypeForPricing,
            rentalDays: 7,
            zipCode: zip,
            estimatedMin: quote.subtotal,
            estimatedMax: quote.subtotalHigh,
            includedTons: quote.includedTons,
          },
        }).catch(() => {});

        // Convert quote to order
        try {
          const { data: orderData } = await supabase.functions.invoke('create-order-from-quote', {
            body: { quoteId: result.quoteId },
          });
          if (orderData?.orderId) {
            toast({ title: 'Order Confirmed!', description: 'Choose your delivery date next.' });
            navigate(`/quote/schedule?orderId=${orderData.orderId}`);
            return;
          }
        } catch (orderErr) {
          console.error('Order creation failed, falling back to placement:', orderErr);
        }

        // Fallback: show placement step if order creation fails
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

  // Service time estimate (legacy for internal breakdown)
  const serviceTime = useMemo(() => {
    if (!distanceCalc.distance) return null;
    return buildServiceTimeEstimate({
      driveMinutes: distanceCalc.distance.distanceMinutes,
      driveToFacilityMinutes: Math.round(distanceCalc.distance.distanceMinutes * 0.8),
      returnMinutes: Math.round(distanceCalc.distance.distanceMinutes * 1.1),
      isSwap: wantsSwap,
    });
  }, [distanceCalc.distance, wantsSwap]);

  // Calsan total cycle for customer display
  const totalCycleDisplay = useMemo(() => {
    if (!distanceCalc.distance) return null;
    const driveMin = distanceCalc.distance.distanceMinutes;
    const route = buildRouteMinutes({
      yardToSiteMinutes: driveMin,
      siteToFacilityMinutes: Math.round(driveMin * 0.8),
      facilityToYardMinutes: Math.round(driveMin * 1.1),
    });
    const svcType: LogisticsServiceType = wantsSwap ? 'SWAP' : 'DELIVERY';
    const result = calculateServiceTime(svcType, route);

    if (wantsSwap) {
      return {
        label: 'Swap cycle estimated',
        minHours: (result.swap.min / 60).toFixed(1),
        maxHours: (result.swap.max / 60).toFixed(1),
      };
    }
    // Delivery + Pickup combined
    const totalMin = result.delivery.min + result.pickup.min;
    const totalMax = result.delivery.max + result.pickup.max;
    return {
      label: 'Total service cycle',
      minHours: (totalMin / 60).toFixed(1),
      maxHours: (totalMax / 60).toFixed(1),
    };
  }, [distanceCalc.distance, wantsSwap]);

  // Availability confidence meter
  const availability = useAvailabilityConfidence(
    distanceCalc.distance?.yard?.id,
    size,
  );

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
          <div className="flex items-center gap-2">
            {step !== 'zip' && step !== 'placement' && (
              <button
                onClick={handleStartOver}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5"
              >
                Start over
              </button>
            )}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-success/10 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
              </span>
              <span className="text-[10px] font-semibold text-success tracking-wide uppercase">Live</span>
            </div>
          </div>
        </div>
        {/* Progress — thin line */}
        <div className="mt-3">
          <div className="relative h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(stepIndex / 8) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">Step {stepIndex} of 8</span>
            <span className="text-[10px] font-medium text-foreground">
              {step === 'zip' && 'Location'}
              {step === 'customer-type' && 'Profile'}
              {step === 'project' && 'Project'}
              {step === 'size' && 'Size'}
              {step === 'contact' && 'Contact'}
              {step === 'price' && 'Price'}
              {step === 'access' && 'Access'}
              {step === 'confirm' && 'Confirm'}
              {step === 'placement' && 'Complete'}
            </span>
          </div>
        </div>
      </div>

      {/* Resume Banner */}
      {draft.showResumeBanner && (
        <div className="px-5 py-3 bg-primary/5 border-b border-border/50 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <RotateCcw className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-foreground font-medium truncate">
                We saved your progress. Continue where you left off?
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground"
                onClick={draft.declineResume}
              >
                Start over
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={draft.acceptResume}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
               )}
      {/* Content */}
      <div className="p-5 md:p-6">
        {/* Compact service area banner when ZIP is known and past zip step */}
        {step !== 'zip' && step !== 'placement' && zoneResult && zip && (
          <div className="mb-4 flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/40 border border-border/50">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-foreground truncate">
                {addressResult?.city || zoneResult.cityName || zoneResult.zoneName}, {zip}
              </span>
            </div>
            <button
              onClick={() => { setStep('zip'); prefillApplied.current = false; }}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors shrink-0 ml-2"
            >
              Change
            </button>
          </div>
        )}
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

              {!useAddress ? (
                <>
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
                  <button
                    type="button"
                    onClick={() => {
                      setUseAddress(true);
                      setZip('');
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Enter full address instead
                  </button>
                </>
              ) : (
                <>
                  <AddressAutocomplete
                    onAddressSelect={(result) => {
                      setAddressResult(result);
                      if (result.zip) setZip(result.zip);
                    }}
                    onClear={() => {
                      setAddressResult(null);
                    }}
                  />
                  {addressResult && (
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={addressResult.zip}
                        readOnly
                        className="h-11 pl-11 text-sm font-medium rounded-xl border-border/40 bg-muted/30 text-muted-foreground cursor-default"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setUseAddress(false);
                      setAddressResult(null);
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Use ZIP code instead
                  </button>
                </>
              )}

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
                          {addressResult?.city || autoDetectZip.cityName || zoneResult.cityName || zoneResult.zoneName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {addressResult ? 'Address verified' : 'Service area confirmed'}
                        </p>
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

              {/* Availability Meter — Step 1 */}
              {zoneResult && distanceCalc.distance && (
                <AvailabilityMeter
                  confidence={availability.confidence}
                  sameDayLikely={availability.sameDayLikely}
                  loading={availability.loading}
                />
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
                          5-10 yd only
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

              {/* Urgency bar */}
              {availability.sameDayLikely && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
                  <Zap className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-xs font-semibold text-primary">
                    Same-day delivery available — limited slots remaining
                  </p>
                </div>
              )}

              {/* Contractor perks banner */}
              {customerType === 'contractor' && (
                <div className="rounded-xl bg-muted/40 border border-border/60 p-3.5">
                  <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-2">Contractor Benefits</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center text-center gap-1">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-[10px] text-muted-foreground font-medium">Priority Delivery</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-1">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="text-[10px] text-muted-foreground font-medium">Volume Pricing</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-1">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="text-[10px] text-muted-foreground font-medium">Dedicated Support</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Hero card — recommended size (anchored to 20yd for general) */}
              <button
                onClick={() => handleSizeSelect(recommendedSize)}
                className={cn(
                  'w-full rounded-2xl border-2 transition-all duration-150 relative overflow-hidden text-left',
                  size === recommendedSize ? 'border-primary shadow-md' : 'border-primary/30 hover:border-primary hover:shadow-sm'
                )}
              >
                {/* Recommended badge */}
                <div className="px-4 py-2 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-wider">
                    <Star className="w-3 h-3" />
                    {recommendedSize === 20 ? 'Best Value' : 'Recommended'}
                  </span>
                  {recommendedSize === 20 && (
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  )}
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

              {/* Alternatives with value labels */}
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
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mt-0.5">Yard</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Good for small projects</p>
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
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mt-0.5">Yard</p>
                      <p className="text-[10px] text-muted-foreground mt-1">For large jobs</p>
                    </button>
                  )}
                </div>
              )}

              {/* Upsell nudge: 10yd → 20yd */}
              {showUpsellNudge && !isHeavy && (
                <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Navigation className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Upgrade to 20 Yard?</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        More space for your project. Less risk of overflow. Better value per cubic yard.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="cta"
                      size="sm"
                      className="rounded-xl text-xs font-semibold"
                      onClick={handleAcceptUpsell}
                    >
                      Yes, upgrade to 20 yd
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-semibold"
                      onClick={handleDeclineUpsell}
                    >
                      Keep 10 yd
                    </Button>
                  </div>
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
        {/* STEP 5: CONTACT / LEAD CAPTURE */}
        {/* ============================== */}
        {step === 'contact' && (
          <StepTransition stepKey="contact">
            <div className="space-y-5">
              <BackButton />

              <div>
                <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
                  Almost there — who should we contact?
                </h4>
                <p className="text-sm text-muted-foreground">
                  We'll send your exact price and next steps.
                </p>
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
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone
                  </label>
                  <Input
                    type="tel"
                    inputMode="tel"
                    placeholder="(510) 555-1234"
                    value={customerPhone}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                      if (raw.length >= 7) {
                        setCustomerPhone(`(${raw.slice(0,3)}) ${raw.slice(3,6)}-${raw.slice(6)}`);
                      } else if (raw.length >= 4) {
                        setCustomerPhone(`(${raw.slice(0,3)}) ${raw.slice(3)}`);
                      } else {
                        setCustomerPhone(raw);
                      }
                    }}
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

              {/* SMS Consent */}
              <div className="space-y-2.5">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  By clicking, I consent to receive transactional messages from Calsan Dumpsters Pro at the phone number provided. Message frequency may vary. Message &amp; Data rates may apply. Reply HELP for help or STOP to opt-out.
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  I consent to receive marketing and promotional messages from Calsan Dumpsters Pro at the phone number provided. Message frequency may vary. Message &amp; Data rates may apply. Reply HELP for help or STOP to opt-out.
                </p>
              </div>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 py-1">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Shield className="w-3 h-3 text-primary" />
                  Secure & private
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Clock className="w-3 h-3 text-primary" />
                  15-min response
                </span>
              </div>

              <Button
                variant="cta"
                size="lg"
                className="w-full h-14 rounded-xl text-base font-semibold"
                onClick={goNext}
                disabled={!customerName || !customerPhone}
              >
                See My Exact Price
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Privacy Policy</a>
                {' · '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Terms of Service</a>
              </p>
            </div>
          </StepTransition>
        )}

        {/* ============================== */}
        {/* STEP 6: PRICE MOMENT */}
        {/* ============================== */}
        {step === 'price' && !quote.isValid && (
          <StepTransition stepKey="price-fallback">
            <div className="space-y-5">
              <BackButton />
              <div className="p-6 rounded-xl bg-muted/30 border border-border/60 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-3" />
                <p className="font-semibold text-foreground">Calculating your price...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll confirm the exact price after reviewing your location.
                </p>
              </div>
              <Button variant="outline" className="w-full rounded-xl" onClick={goBack}>
                <ChevronLeft className="w-4 h-4" /> Go Back
              </Button>
            </div>
          </StepTransition>
        )}
        {step === 'price' && quote.isValid && (
          <StepTransition stepKey="price">
            <div className="space-y-5">
              <BackButton />

              {/* Price card */}
              <div className="rounded-2xl border border-border/60 bg-card shadow-md overflow-hidden">
                {/* Price hero */}
                <div className="p-6 text-center bg-gradient-to-b from-muted/20 to-transparent">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Your Price Range
                  </p>
                  <div className="text-5xl font-bold text-foreground tracking-tight">
                    ${quote.subtotal.toLocaleString()} — ${quote.subtotalHigh.toLocaleString()}
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
                    <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-2">{HEAVY_MATERIAL_STRUCTURE.title}</p>
                    <div className="space-y-1.5">
                      {HEAVY_MATERIAL_STRUCTURE.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Scale className="w-3 h-3 text-primary shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Cycle — Premium mini bar */}
                {serviceTime && (
                  <div className="px-5 py-4 border-t border-border/50">
                    <ServiceCycleBar
                      estimate={serviceTime}
                      showInternalLink={showInternalBreakdown}
                      onToggleInternal={() => {
                        const el = document.getElementById('internal-breakdown');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />
                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                      Service times are estimated and may vary based on traffic conditions, facility wait times, and on-site access.
                    </p>
                    {showInternalBreakdown && (
                      <div id="internal-breakdown" className="mt-4">
                        <ServiceTimeBreakdown estimate={serviceTime} />
                      </div>
                    )}
                  </div>
                )}

                {/* Availability Meter — Price Moment */}
                <div className="px-5 py-4 border-t border-border/50">
                  <AvailabilityMeter
                    confidence={availability.confidence}
                    sameDayLikely={availability.sameDayLikely}
                    loading={availability.loading}
                  />
                  {/* Conversion Boosters — Scarcity + Social Proof */}
                  <div className="mt-3 space-y-1.5">
                    {availability.confidence === 'limited' && (
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Zap className="w-3 h-3" />
                        Limited availability in your area today
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-primary" />
                      Trusted by Bay Area homeowners and contractors since 2009
                    </p>
                  </div>
                </div>

                {/* Fallback if no service time data */}
                {!serviceTime && (
                  <div className="px-5 py-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {etaDisplay ? `Delivery ETA: ${etaDisplay}` : DELIVERY_TIME_FALLBACK}
                    </div>
                  </div>
                )}

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

                {/* Live Load Policy — Contractor info */}
                {customerType === 'contractor' && (
                  <div className="px-5 py-3 border-t border-border/50 bg-muted/20">
                    <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-2">{LIVE_LOAD_POLICY.title}</p>
                    <div className="space-y-1.5">
                      {LIVE_LOAD_POLICY.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 text-primary shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">{LIVE_LOAD_POLICY.disclaimer}</p>
                  </div>
                )}

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
                Continue Booking
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>

              {/* Follow-up options */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="default"
                  className="rounded-xl text-xs"
                  onClick={() => {
                    capturePartialLead('text_quote_request');
                    toast({ title: 'Quote texted!', description: "We'll text your quote details shortly." });
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Text Me This Quote
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  className="rounded-xl text-xs"
                  onClick={() => {
                    capturePartialLead('call_request');
                    window.open('tel:+15106802150', '_blank');
                  }}
                >
                  <Phone className="w-4 h-4 mr-1.5" />
                  Call Me to Confirm
                </Button>
              </div>

              {/* Reassurance */}
              <p className="text-center text-xs text-muted-foreground">
                You'll review everything before confirming. No hidden fees.
              </p>
            </div>
          </StepTransition>
        )}

        {/* ============================== */}
        {/* STEP 6: PLACEMENT & ACCESS */}
        {/* ============================== */}
        {step === 'access' && (
          <StepTransition stepKey="access">
            <div className="space-y-5">
              <BackButton />

              <div>
                <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
                  Placement & Access
                </h4>
                <p className="text-sm text-muted-foreground">
                  Help us plan the best delivery route and placement.
                </p>
              </div>

              <AccessConstraintStep
                zip={zip}
                city={addressResult?.city || zoneResult?.cityName}
                onComplete={(data) => {
                  setAccessData(data);
                  goNext();
                }}
                onSkip={() => {
                  setAccessData(null);
                  goNext();
                }}
              />
            </div>
          </StepTransition>
        )}

        {/* ============================== */}
        {/* STEP 7: CONFIRM */}
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

              {/* Quote Summary — Full Breakdown */}
              <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
                {/* Dumpster Details */}
                <div className="p-4 border-b border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Dumpster Details</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dumpster Size</span>
                      <span className="font-semibold text-foreground">{getSizeLabel()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Project Type</span>
                      <span className="font-semibold text-foreground">{selectedProject?.label || 'General'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Material</span>
                      <span className="font-semibold text-foreground">{isHeavy ? 'Heavy Material' : 'General Debris'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rental Period</span>
                      <span className="font-semibold text-foreground">7 days</span>
                    </div>
                    {!quote.isFlatFee && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Weight Included</span>
                        <span className="font-semibold text-foreground">{quote.includedTons} tons</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="p-4 border-b border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Location</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ZIP Code</span>
                      <span className="font-semibold text-foreground">{zip}</span>
                    </div>
                    {addressResult?.formattedAddress && (
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-muted-foreground shrink-0">Address</span>
                        <span className="font-semibold text-foreground text-right">{addressResult.formattedAddress}</span>
                      </div>
                    )}
                    {distanceCalc.distance && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Nearest Yard</span>
                        <span className="font-semibold text-foreground">{distanceCalc.distance.yard.name} ({distanceCalc.distance.distanceMiles.toFixed(1)} mi)</span>
                      </div>
                    )}
                    {accessData?.placementType && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Placement</span>
                        <span className="font-semibold text-foreground capitalize">{accessData.placementType}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="p-4 border-b border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Pricing</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base Price</span>
                      <span className="text-foreground">${quote.subtotal.toLocaleString()} — ${quote.subtotalHigh.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-success" /> Delivery & Pickup
                      </span>
                      <span className="text-success text-xs font-medium">Included</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-success" /> Disposal
                      </span>
                      <span className="text-success text-xs font-medium">Included</span>
                    </div>
                    {!quote.isFlatFee && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-success" /> {quote.includedTons}T Weight Allowance
                        </span>
                        <span className="text-success text-xs font-medium">Included</span>
                      </div>
                    )}
                    {!quote.isFlatFee && (
                      <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
                        <span>Overage rate</span>
                        <span>$165/ton beyond {quote.includedTons}T</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="px-4 py-3 bg-primary/5 flex justify-between items-center">
                  <span className="font-bold text-foreground">Total Estimate</span>
                  <span className="font-bold text-foreground text-2xl">${quote.subtotal.toLocaleString()} — ${quote.subtotalHigh.toLocaleString()}</span>
                </div>
              </div>

              {/* Contact summary */}
              <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <div className="p-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Contact</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-semibold text-foreground">{customerName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-semibold text-foreground">{customerPhone}</span>
                    </div>
                    {customerEmail && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-semibold text-foreground">{customerEmail}</span>
                      </div>
                    )}
                  </div>
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

              {/* Urgency + trust before CTA */}
              <div className="flex items-center justify-center gap-4 py-2">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Shield className="w-3 h-3 text-primary" />
                  Licensed & Insured
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Clock className="w-3 h-3 text-primary" />
                  15-min response
                </span>
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
              <p className="text-[11px] text-muted-foreground text-center">
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Privacy Policy</a>
                {' · '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Terms of Service</a>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-xl"
                    onClick={() => navigate('/')}
                  >
                    Back to Home
                  </Button>
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
