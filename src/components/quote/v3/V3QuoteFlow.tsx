// ============================================================
// V3 QUOTE FLOW — Refactored with Step Components
// ZIP → Customer Type → Project → Size → Contact → Price → Access → Confirm → Placement
// ============================================================

import { useState, useEffect, useMemo, useCallback, lazy, Suspense, useRef } from 'react';
import { getPriceRangeForZip, type PriceRange } from '@/lib/masterPricingService';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuoteDraftAutosave, clearDraft } from './useQuoteDraftAutosave';
import { upsertDraftQuote, logQuoteMilestone, getDraftQuoteId, clearDraftIds, meetsQuoteThreshold, type DraftQuoteData } from '@/lib/draftQuoteService';
import { HOMEOWNER_PROJECTS, CONTRACTOR_PROJECTS, COMMERCIAL_PROJECTS } from './types';
import {
  MapPin, ChevronRight, ChevronLeft, Phone, Loader2,
  CheckCircle, Truck, RotateCcw, SkipForward,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { buildServiceTimeEstimate } from './ServiceTimeBreakdown';
import type { AccessConstraintData } from './AccessConstraintStep';
import type { AddressResult } from './AddressAutocomplete';
import { ServiceCycleBar } from './components/ServiceCycleBar';
import { useAvailabilityConfidence } from './hooks/useAvailabilityConfidence';
import {
  calculateServiceTime,
  buildRouteMinutes,
  type LogisticsServiceType,
} from '@/lib/logistics/serviceTimeEngine';
import {
  getPlacementCopy, PLACEMENT_MAP_UNAVAILABLE,
  ORDER_CONFIRMED_TITLE, ORDER_CONFIRMED_SUBTITLE,
} from './copy';

// Step Components
import {
  ZipStep, CustomerTypeStep, ProjectStep, SizeStep,
  ContactStep, PriceStep, AccessStep, ConfirmStep,
  StepTransition,
} from './steps';

// Lazy load placement map
const PlacementMap = lazy(() =>
  import('../steps/PlacementMap').then((m) => ({ default: m.PlacementMap }))
);

// ============================================================
// ZONE RESULT
// ============================================================
interface ZoneResult {
  zoneId: string | null;
  zoneName: string;
  cityName?: string;
  multiplier: number;
  marketCode?: string;
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
  const urlAddress = searchParams.get('address') || '';
  const urlType = searchParams.get('type') as CustomerType | null;
  const urlProject = searchParams.get('project') || '';
  const urlSize = searchParams.get('size');
  const prefillApplied = useRef(false);

  // Draft autosave
  const urlDraftToken = searchParams.get('draft');
  const draft = useQuoteDraftAutosave(urlDraftToken);
  const draftApplied = useRef(false);
  const quoteStartedFired = useRef(false);

  // Step state
  const [step, setStep] = useState<V3Step>('zip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingZip, setIsCheckingZip] = useState(false);
  const [zoneResult, setZoneResult] = useState<ZoneResult | null>(null);
  const [stepStartTime, setStepStartTime] = useState(Date.now());

  // Form state
  const [zip, setZip] = useState(urlZip.length === 5 && /^\d{5}$/.test(urlZip) ? urlZip : '');
  const [customerType, setCustomerType] = useState<CustomerType | null>(
    urlType && ['homeowner', 'contractor', 'commercial'].includes(urlType) ? urlType : null
  );
  const [selectedProject, setSelectedProject] = useState<ProjectCard | null>(null);
  const [size, setSize] = useState(urlSize ? parseInt(urlSize, 10) || 20 : 20);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [consentSms, setConsentSms] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Phase A new fields
  const [customerNotes, setCustomerNotes] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [rentalDays, setRentalDays] = useState(7);

  // Access constraint data
  const [accessData, setAccessData] = useState<AccessConstraintData | null>(null);

  // Address mode
  const [useAddress, setUseAddress] = useState(!!urlAddress);
  const [addressResult, setAddressResult] = useState<AddressResult | null>(null);

  // Swap toggle
  const [wantsSwap, setWantsSwap] = useState(false);

  // Restore draft state
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

  // Autosave on meaningful changes
  useEffect(() => {
    if (step === 'placement') return;
    draft.saveDraft({
      step, zip, customerType,
      selectedProjectId: selectedProject?.id || null,
      size, wantsSwap,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      termsAccepted, useAddress,
      formattedAddress: addressResult?.formattedAddress,
      lat: addressResult?.lat, lng: addressResult?.lng,
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
    setCustomerNotes('');
    setCompanyName('');
    setRentalDays(7);
    setTermsAccepted(false);
    setUseAddress(false);
    setAddressResult(null);
    setZoneResult(null);
    setWantsSwap(false);
    setConsentSms(false);
    setConsentTerms(false);
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

  // Distance calculation
  const distanceCalc = useDistanceCalculation(zip, addressResult?.lat, addressResult?.lng);

  // Track step timing + GA4
  const stepIndexMap: Record<V3Step, number> = { zip: 1, 'customer-type': 2, project: 3, size: 4, contact: 5, price: 6, access: 7, confirm: 8, placement: 9 };
  useEffect(() => {
    setStepStartTime(Date.now());
    ga4.quoteStepViewed({ flow_version: 'v3', step_name: step, step_index: stepIndexMap[step] });
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
          setZoneResult({ zoneId: null, zoneName: zone.name, cityName: undefined, multiplier: zone.baseMultiplier });
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

  // Auto-advance past ZIP step when prefilled
  useEffect(() => {
    if (prefillApplied.current) return;
    if (!zoneResult) return;
    if (urlZip.length === 5 && step === 'zip') {
      prefillApplied.current = true;
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

  // City-specific master pricing
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

  // Calculate quote
  const quote = useMemo(() => {
    if (!zoneResult) return { subtotal: 0, subtotalHigh: 0, includedTons: 0, isValid: false, isFlatFee: false };

    if (masterPriceRange) {
      let low = masterPriceRange.low;
      let high = masterPriceRange.high;
      if (distanceCalc.distance?.priceAdjustment) {
        low += distanceCalc.distance.priceAdjustment;
        high += distanceCalc.distance.priceAdjustment;
      }
      // Add rental day extra cost
      if (rentalDays > 7) {
        const extraDays = rentalDays - 7;
        const extraDayCost = 15 * extraDays; // $15/extra day
        low += extraDayCost;
        high += extraDayCost;
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
    // Add rental day extra cost
    if (rentalDays > 7) {
      const extraDays = rentalDays - 7;
      subtotal += 15 * extraDays;
    }

    return { subtotal, subtotalHigh: subtotal + 70, includedTons, isValid: true, isFlatFee };
  }, [size, zoneResult, DUMPSTER_SIZES, distanceCalc.distance, isHeavy, materialTypeForPricing, masterPriceRange, rentalDays]);

  // Step index for progress
  const stepIndex = useMemo(() => {
    const map: Record<V3Step, number> = { zip: 1, 'customer-type': 2, project: 3, size: 4, contact: 5, price: 6, access: 7, confirm: 8, placement: 9 };
    return Math.min(map[step], 8);
  }, [step]);

  // Navigation
  const goNext = () => {
    const duration = Date.now() - stepStartTime;
    analytics.quoteStepComplete(step, duration);
    ga4.quoteStepCompleted({ flow_version: 'v3', step_name: step, time_on_step_sec: Math.round(duration / 1000) });
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

  // Progressive lead capture
  const leadCaptured = useRef<Record<string, boolean>>({});
  const capturePartialLead = useCallback(async (milestone: string) => {
    const hasContact = !!(customerPhone || customerEmail);
    if (!hasContact) return;

    if (leadCaptured.current[milestone]) return;
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
            customer_notes: customerNotes || null,
            company_name: companyName || null,
            rental_days: rentalDays,
          },
        },
      });
    } catch (err) {
      console.warn('Partial lead capture failed:', err);
    }
  }, [zip, customerName, customerPhone, customerEmail, addressResult, zoneResult, selectedProject, materialTypeForPricing, size, customerType, isHeavy, quote, step, customerNotes, companyName, rentalDays]);

  // Draft Quote Auto-Creation
  const draftSynced = useRef<Record<string, boolean>>({});
  const buildDraftData = useCallback((): DraftQuoteData => ({
    zip,
    materialType: materialTypeForPricing,
    size,
    customerType: customerType || undefined,
    projectType: selectedProject?.label || undefined,
    customerName: customerName || undefined,
    customerPhone: customerPhone || undefined,
    customerEmail: customerEmail || undefined,
    zoneId: zoneResult?.zoneId || undefined,
    zoneName: zoneResult?.zoneName || undefined,
    cityName: zoneResult?.cityName || undefined,
    yardId: distanceCalc.distance?.yard.id || undefined,
    yardName: distanceCalc.distance?.yard.name || undefined,
    distanceMiles: distanceCalc.distance?.distanceMiles || undefined,
    distanceBracket: distanceCalc.distance?.bracket?.bracketName || undefined,
    subtotal: quote.isValid ? quote.subtotal : undefined,
    subtotalHigh: quote.isValid ? quote.subtotalHigh : undefined,
    includedTons: quote.isValid ? quote.includedTons : undefined,
    isFlatFee: quote.isFlatFee,
    isHeavy,
    materialClass: isHeavy ? (selectedProject?.id || 'heavy') : 'general',
    recommendedSize: recommendedSize,
    addressLine1: addressResult?.formattedAddress || undefined,
    city: addressResult?.city || undefined,
    state: addressResult?.state || undefined,
    lat: addressResult?.lat || distanceCalc.geocoding?.lat || undefined,
    lng: addressResult?.lng || distanceCalc.geocoding?.lng || undefined,
    accessFlags: accessData?.flagsMap || undefined,
    placementType: accessData?.placementType || undefined,
    gateCode: accessData?.gateCode || undefined,
    wantsSwap,
  }), [zip, materialTypeForPricing, size, customerType, selectedProject, customerName, customerPhone, customerEmail, zoneResult, distanceCalc, quote, isHeavy, recommendedSize, addressResult, accessData, wantsSwap]);

  // Sync draft quote on key step transitions
  useEffect(() => {
    const data = buildDraftData();
    if (!meetsQuoteThreshold(data)) return;

    const milestoneKey = `${step}_${size}_${materialTypeForPricing}`;
    if (draftSynced.current[milestoneKey]) return;
    draftSynced.current[milestoneKey] = true;

    upsertDraftQuote(data).then(result => {
      if (result.quoteId) {
        logQuoteMilestone(`quote_step_${step}`, {
          quoteId: result.quoteId,
          leadId: result.leadId,
          metadata: { step, size, material: materialTypeForPricing },
        });
      }
    });
  }, [step, size, materialTypeForPricing, buildDraftData]);

  // Fire progressive captures on step transitions
  useEffect(() => {
    if (step === 'customer-type' && zip) capturePartialLead('address_saved');
    if (step === 'size' && zip && selectedProject) {
      capturePartialLead('quote_started');
      capturePartialLead('material_selected');
    }
    if (step === 'contact' && size > 0) capturePartialLead('size_selected');
    if (step === 'price' && quote.isValid) {
      capturePartialLead('quote_priced');
      capturePartialLead('price_shown');
    }
    if (step === 'access') capturePartialLead('delivery_preference_saved');
    if (step === 'confirm' && accessData) capturePartialLead('placement_marked');
  }, [step, zip, customerType, selectedProject, size, quote.isValid, accessData]);

  // Batch-capture when contact is first provided
  const contactBatchFired = useRef(false);
  useEffect(() => {
    if (contactBatchFired.current) return;
    if (!(customerPhone || customerEmail)) return;
    contactBatchFired.current = true;
    capturePartialLead('contact_captured');
  }, [customerPhone, customerEmail, capturePartialLead]);

  const handleProjectSelect = (project: ProjectCard) => {
    setSelectedProject(project);
    setSize(project.suggestedSize);
    ga4.quoteRecommendedSizeShown({ size_yd: project.suggestedSize, material_category: project.isHeavy ? 'heavy' : 'general', customer_type: customerType || 'unknown' });
    setTimeout(() => setStep('size'), 200);
  };

  // Upsell nudge
  const [showUpsellNudge, setShowUpsellNudge] = useState(false);

  const handleSizeSelect = (s: number) => {
    setSize(s);
    ga4.quoteSizeSelected({ size_yd: s, was_recommended: s === recommendedSize });
    if (s === 10 && !isHeavy && availableSizes.includes(20)) {
      setShowUpsellNudge(true);
      return;
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
        zoneId: zoneResult?.zoneId ?? undefined,
        materialType: materialTypeForPricing,
        rentalDays,
        extras: [],
        subtotal: quote.subtotal,
        estimatedMin: quote.subtotal,
        estimatedMax: quote.subtotalHigh,
        isCalsanFulfillment: true,
        recommendedSizeYards: recommendedSize,
        userSelectedSizeYards: size,
        projectType: selectedProject?.label || undefined,
        customerLat: addressResult?.lat ?? distanceCalc.geocoding?.lat,
        customerLng: addressResult?.lng ?? distanceCalc.geocoding?.lng,
        yardId: distanceCalc.distance?.yard.id,
        yardName: distanceCalc.distance?.yard.name,
        distanceMiles: distanceCalc.distance?.distanceMiles,
        distanceBracket: distanceCalc.distance?.bracket?.bracketName,
        streetAddress: addressResult?.formattedAddress,
        city: addressResult?.city,
        state: addressResult?.state,
        accessFlags: accessData?.flagsMap,
        placementType: accessData?.placementType,
        gateCode: accessData?.gateCode,
      });

      if (result.success) {
        setSavedQuoteId(result.quoteId ?? null);
        draft.resetDraft();
        analytics.quoteCompleted(size, materialTypeForPricing, quote.subtotal);
        ga4.quoteSubmitted({ flow_version: 'v3', size_yd: size, material_category: materialTypeForPricing, value_estimated: quote.subtotal, city: zoneResult?.cityName, zip, serviceable: true });
        supabase.functions.invoke('send-quote-summary', {
          body: {
            customerName,
            customerPhone: phoneValidation.formatted,
            sizeLabel: sizeData?.label || `${size} Yard`,
            materialType: materialTypeForPricing,
            rentalDays,
            zipCode: zip,
            estimatedMin: quote.subtotal,
            estimatedMax: quote.subtotalHigh,
            includedTons: quote.includedTons,
            customerNotes: customerNotes || undefined,
            companyName: companyName || undefined,
          },
        }).catch(() => {});

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

        toast({ title: 'Quote Saved', description: "We'll contact you within 15 minutes." });
        setStep('placement');
      } else {
        console.error('[V3QuoteFlow] Save failed:', result.error);
        toast({ title: 'Quote Saved Partially', description: "We saved most of your quote. Please continue or contact us if you need help." });
      }
    } catch (err) {
      console.error('[V3QuoteFlow] Network error:', err);
      toast({ title: 'Quote Saved Partially', description: "We saved most of your quote. Please continue or contact us if you need help." });
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

  // Availability confidence
  const availability = useAvailabilityConfidence(
    distanceCalc.distance?.yard?.id,
    size,
  );

  // Saved quote ID for placement
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [placementPhase, setPlacementPhase] = useState<'prompt' | 'mapping' | 'done'>('prompt');

  // Staff-only internal breakdown toggle
  const showInternalBreakdown = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('internal') === '1';
    } catch { return false; }
  }, []);

  // Customer type selection handler
  const handleCustomerTypeSelect = (type: CustomerType) => {
    setCustomerType(type);
    setSelectedProject(null);
    setTimeout(() => setStep('project'), 200);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border/60" id="quote-calculator-v3">
      {/* Header */}
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
        {/* Progress */}
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
              <span className="text-xs font-semibold text-foreground truncate">Resume your quote?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="cta" className="rounded-lg text-xs h-7 px-3" onClick={draft.acceptResume}>
                Resume
              </Button>
              <Button size="sm" variant="ghost" className="rounded-lg text-xs h-7 px-2" onClick={draft.dismissResume}>
                <SkipForward className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 md:p-6">
        {/* Compact service area banner */}
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

        {/* Step 1: ZIP */}
        {step === 'zip' && (
          <ZipStep
            zip={zip} setZip={setZip}
            useAddress={useAddress} setUseAddress={setUseAddress}
            addressResult={addressResult} setAddressResult={setAddressResult}
            urlAddress={urlAddress}
            isCheckingZip={isCheckingZip}
            zoneResult={zoneResult}
            distanceCalc={distanceCalc}
            etaDisplay={etaDisplay}
            availability={availability}
            autoDetectCityName={autoDetectZip.cityName}
            goNext={goNext} goBack={goBack}
          />
        )}

        {/* Step 2: Customer Type */}
        {step === 'customer-type' && (
          <CustomerTypeStep
            customerType={customerType}
            onSelect={handleCustomerTypeSelect}
            goNext={goNext} goBack={goBack}
          />
        )}

        {/* Step 3: Project */}
        {step === 'project' && customerType && (
          <ProjectStep
            customerType={customerType}
            selectedProject={selectedProject}
            onSelect={handleProjectSelect}
            goNext={goNext} goBack={goBack}
          />
        )}

        {/* Step 4: Size */}
        {step === 'size' && (
          <SizeStep
            size={size} recommendedSize={recommendedSize}
            availableSizes={availableSizes} alternativeSizes={alternativeSizes}
            isHeavy={isHeavy} selectedProject={selectedProject}
            customerType={customerType} etaDisplay={etaDisplay}
            availability={availability}
            showUpsellNudge={showUpsellNudge}
            onSizeSelect={handleSizeSelect}
            onAcceptUpsell={handleAcceptUpsell}
            onDeclineUpsell={handleDeclineUpsell}
            goNext={goNext} goBack={goBack}
          />
        )}

        {/* Step 5: Contact */}
        {step === 'contact' && (
          <ContactStep
            customerName={customerName} setCustomerName={setCustomerName}
            customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
            customerEmail={customerEmail} setCustomerEmail={setCustomerEmail}
            customerNotes={customerNotes} setCustomerNotes={setCustomerNotes}
            companyName={companyName} setCompanyName={setCompanyName}
            consentSms={consentSms} setConsentSms={setConsentSms}
            consentTerms={consentTerms} setConsentTerms={setConsentTerms}
            customerType={customerType}
            goNext={goNext} goBack={goBack}
          />
        )}

        {/* Step 6: Price */}
        {step === 'price' && (
          <PriceStep
            quote={quote} size={size} getSizeLabel={getSizeLabel}
            customerType={customerType} isHeavy={isHeavy}
            wantsSwap={wantsSwap} setWantsSwap={setWantsSwap}
            serviceTime={serviceTime} availability={availability}
            etaDisplay={etaDisplay}
            showInternalBreakdown={showInternalBreakdown}
            capturePartialLead={capturePartialLead}
            rentalDays={rentalDays} setRentalDays={setRentalDays}
            goNext={goNext} goBack={goBack}
          />
        )}

        {/* Step 7: Access */}
        {step === 'access' && (
          <AccessStep
            zip={zip} addressResult={addressResult} zoneResult={zoneResult}
            onComplete={(data) => { setAccessData(data); goNext(); }}
            onSkip={() => { setAccessData(null); goNext(); }}
            goNext={goNext} goBack={goBack}
          />
        )}

        {/* Step 8: Confirm */}
        {step === 'confirm' && (
          <ConfirmStep
            quote={quote} size={size} getSizeLabel={getSizeLabel}
            selectedProject={selectedProject} isHeavy={isHeavy}
            customerName={customerName} customerPhone={customerPhone}
            customerEmail={customerEmail} customerNotes={customerNotes}
            companyName={companyName}
            zip={zip} addressResult={addressResult}
            distanceCalc={distanceCalc} accessData={accessData}
            termsAccepted={termsAccepted} setTermsAccepted={setTermsAccepted}
            isSubmitting={isSubmitting} onConfirm={handleSaveQuote}
            rentalDays={rentalDays} wantsSwap={wantsSwap}
            goNext={goNext} goBack={goBack}
          />
        )}

        {/* Step 9: Placement */}
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
                    variant="cta" size="lg"
                    className="w-full h-14 rounded-xl text-base font-semibold"
                    onClick={() => setPlacementPhase('mapping')}
                    disabled={!distanceCalc.geocoding}
                  >
                    <MapPin className="w-5 h-5" />
                    {getPlacementCopy().PLACEMENT_PRIMARY_BUTTON}
                  </Button>
                  <Button
                    variant="outline" size="default"
                    className="w-full rounded-xl"
                    onClick={() => {
                      analytics.quoteStepComplete('placement-skipped', Date.now() - stepStartTime);
                      setPlacementPhase('done');
                    }}
                  >
                    {getPlacementCopy().PLACEMENT_SKIP_BUTTON}
                  </Button>
                  {!distanceCalc.geocoding && (
                    <p className="text-xs text-muted-foreground text-center">{PLACEMENT_MAP_UNAVAILABLE}</p>
                  )}
                </>
              )}

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
                          let screenshotUrl: string | null = null;
                          if (placement.screenshotBlob) {
                            const fileName = `quotes/${savedQuoteId}/${Date.now()}_placement.png`;
                            const { data: uploadData } = await supabase.storage
                              .from('placements-private')
                              .upload(fileName, placement.screenshotBlob, {
                                contentType: 'image/png',
                                upsert: true,
                              });
                            if (uploadData?.path) screenshotUrl = uploadData.path;
                          }
                          const geometryJson = {
                            dumpsterRect: placement.dumpsterRect,
                            truckRect: placement.truckRect,
                            entry: placement.entry,
                          };
                          await supabase.from('quote_site_placement').insert({
                            quote_id: savedQuoteId,
                            geometry_json: geometryJson as never,
                            screenshot_url: screenshotUrl,
                            notes: placement.notes || null,
                          } as never);
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

              {placementPhase === 'done' && (
                <div className="p-6 rounded-xl bg-card border border-border/60 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <p className="font-bold text-foreground text-lg">{ORDER_CONFIRMED_TITLE}</p>
                  <p className="text-sm text-muted-foreground mt-1.5">{ORDER_CONFIRMED_SUBTITLE}</p>
                  <Button
                    variant="outline" size="sm"
                    className="mt-4 rounded-xl"
                    onClick={() => navigate('/')}
                  >
                    Back to Home
                  </Button>
                </div>
              )}

              <Button
                variant="outline" size="default"
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
