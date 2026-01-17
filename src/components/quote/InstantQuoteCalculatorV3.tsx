import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Zap, ChevronRight, ChevronLeft, Phone, User, Mail, Loader2, MessageCircle,
  CheckCircle, MapPin, Package, Weight, Calendar, Sparkles, Shield, Clock,
  HelpCircle, ArrowRight, Send, Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { selectVendorForQuote, saveQuote, type VendorSelectionResult } from '@/lib/vendorSelection';

// Types
import type { QuoteFormData, ExtraSelection } from './types';

// Constants
import { DUMPSTER_SIZES, MATERIAL_TYPES, USER_TYPES, RENTAL_PERIODS, EXTRAS, OVERAGE_COST_PER_TON } from './constants';

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

// Included tons by size as specified: 10=1, 20=2, 30=3, 40=4, 50=5
// Heavy materials: 6/8/10 all get 10T
const INCLUDED_TONS: Record<number, number> = {
  6: 10,  // Heavy materials - 10 tons
  8: 10,  // Heavy materials - 10 tons
  10: 1,  // General: 1 ton, Heavy: 10 tons
  20: 2,
  30: 3,
  40: 4,
  50: 5,
};

type Step = 'zip' | 'material' | 'size' | 'options' | 'contact' | 'success';

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: 'zip', label: 'Location', icon: <MapPin className="w-4 h-4" /> },
  { key: 'material', label: 'Material', icon: <Package className="w-4 h-4" /> },
  { key: 'size', label: 'Size', icon: <Weight className="w-4 h-4" /> },
  { key: 'options', label: 'Options', icon: <Calendar className="w-4 h-4" /> },
  { key: 'contact', label: 'Contact', icon: <User className="w-4 h-4" /> },
];

interface ZoneResult {
  zoneId: string;
  zoneName: string;
  cityName?: string;
  multiplier: number;
}

export function InstantQuoteCalculatorV3() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('zip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingZip, setIsCheckingZip] = useState(false);
  const [zoneResult, setZoneResult] = useState<ZoneResult | null>(null);
  const [vendorResult, setVendorResult] = useState<VendorSelectionResult | null>(null);
  const [sizeDbId, setSizeDbId] = useState<string | null>(null);

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

  // Lookup zone from database
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

      if (error || !data || !(data.zone as any)?.is_active) {
        setZoneResult(null);
      } else {
        setZoneResult({
          zoneId: data.zone_id,
          zoneName: (data.zone as any).name,
          cityName: data.city_name || undefined,
          multiplier: Number((data.zone as any).base_multiplier),
        });
      }
    } catch (err) {
      console.error('Zone lookup error:', err);
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
    const includedTons = formData.material === 'heavy' ? 10 : INCLUDED_TONS[formData.size] || 1;

    // Base price with zone multiplier
    const basePrice = Math.round(sizeData.basePrice * zoneResult.multiplier);
    lineItems.push({
      label: `${sizeData.label} Dumpster`,
      subLabel: `${rental.label} rental • ${includedTons}T included`,
      amount: basePrice,
      type: 'base',
    });

    // Heavy material surcharge
    if (material.priceAdjustment > 0) {
      lineItems.push({
        label: 'Heavy Material Surcharge',
        subLabel: 'Concrete, dirt, rock, asphalt',
        amount: material.priceAdjustment,
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
  }, [formData, zoneResult]);

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
      case 'contact': return formData.name && formData.phone && formData.email;
      default: return false;
    }
  }, [step, zoneResult, formData]);

  const goNext = () => {
    const nextSteps: Record<Step, Step> = {
      zip: 'material',
      material: 'size',
      size: 'options',
      options: 'contact',
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
      options: 'size',
      contact: 'options',
      success: 'contact',
    };
    setStep(prevSteps[step]);
  };

  // Handle save quote
  const handleSaveQuote = async (bookNow = false) => {
    if (!formData.name || !formData.phone || !formData.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all contact fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const userTypeData = USER_TYPES.find((u) => u.value === formData.userType);
      
      const result = await saveQuote({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
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
      });

      if (result.success) {
        setStep('success');
        toast({
          title: bookNow ? 'Booking Submitted! 🎉' : 'Quote Saved! 📧',
          description: bookNow 
            ? "We'll contact you within 15 minutes" 
            : "Check your email for the quote details",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Submission Error',
        description: 'Please try again or call us directly',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border" id="quote-calculator">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary/80 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-primary-foreground">Instant Quote Calculator</h3>
            <p className="text-sm text-primary-foreground/80">All-inclusive pricing • Book in 60 seconds</p>
          </div>
        </div>

        {/* Progress Steps */}
        {step !== 'success' && (
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <button
                  type="button"
                  onClick={() => i < stepIndex && setStep(s.key)}
                  disabled={i > stepIndex}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                    step === s.key
                      ? "bg-white text-primary"
                      : i < stepIndex
                      ? "bg-white/20 text-white hover:bg-white/30 cursor-pointer"
                      : "bg-white/10 text-white/50 cursor-not-allowed"
                  )}
                >
                  {i < stepIndex ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    s.icon
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-white/40 mx-1 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className="p-5">
        {/* Step 1: ZIP */}
        {step === 'zip' && (
          <div className="space-y-5">
            {/* User Type Pills */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Who are you?</label>
              <div className="flex flex-wrap gap-2">
                {USER_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, userType: type.value }))}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                      formData.userType === type.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-input bg-background text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                    {type.discount > 0 && (
                      <span className="px-1.5 py-0.5 bg-accent text-accent-foreground text-xs rounded-full font-bold">
                        {type.discount * 100}% OFF
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ZIP Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <MapPin className="w-4 h-4 inline mr-1.5" />
                Delivery ZIP Code
              </label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  placeholder="Enter 5-digit ZIP"
                  value={formData.zip}
                  onChange={(e) => setFormData((prev) => ({ ...prev, zip: e.target.value.replace(/\D/g, '') }))}
                  className={cn(
                    "text-lg h-14 text-center font-semibold tracking-widest",
                    formData.zip.length === 5 && !isCheckingZip && (
                      zoneResult ? "border-success bg-success/5" : "border-destructive bg-destructive/5"
                    )
                  )}
                />
                {isCheckingZip && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Zone Result */}
              {formData.zip.length === 5 && !isCheckingZip && (
                <div className={cn(
                  "mt-3 p-3 rounded-lg flex items-start gap-3",
                  zoneResult 
                    ? "bg-success/10 border border-success/30" 
                    : "bg-destructive/10 border border-destructive/30"
                )}>
                  {zoneResult ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {zoneResult.cityName ? `${zoneResult.cityName} — We're in your area!` : "We service your area!"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {zoneResult.zoneName} • Same-day delivery available
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Outside our service area</p>
                        <p className="text-sm text-muted-foreground">
                          Call us at (510) 680-2150 — we may still be able to help!
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: <Shield className="w-4 h-4" />, label: 'Licensed & Insured' },
                { icon: <Clock className="w-4 h-4" />, label: 'Same-Day Available' },
                { icon: <Sparkles className="w-4 h-4" />, label: 'No Hidden Fees' },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center gap-1 text-center p-2 bg-muted/50 rounded-lg">
                  <div className="text-primary">{badge.icon}</div>
                  <span className="text-xs text-muted-foreground">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Next Button */}
            <Button
              type="button"
              variant="cta"
              size="lg"
              className="w-full h-14 text-base"
              onClick={goNext}
              disabled={!canGoNext}
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Material Type */}
        {step === 'material' && (
          <div className="space-y-5">
            <button
              type="button"
              onClick={goBack}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">What are you throwing away?</h4>
              <p className="text-sm text-muted-foreground mb-4">This determines available dumpster sizes and pricing</p>

              <div className="grid gap-3">
                {MATERIAL_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, material: type.value }))}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      formData.material === type.value
                        ? "border-primary bg-primary/5"
                        : "border-input bg-background hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{type.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-foreground">{type.label}</h5>
                          {type.value === 'heavy' && (
                            <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-600 rounded-full font-medium">
                              +$150
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{type.description}</p>
                        {type.value === 'heavy' && (
                          <p className="text-xs text-primary mt-1 font-medium">
                            10 tons included on all heavy material dumpsters
                          </p>
                        )}
                      </div>
                      {formData.material === type.value && (
                        <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="button"
              variant="cta"
              size="lg"
              className="w-full h-14 text-base"
              onClick={goNext}
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 3: Size Selection */}
        {step === 'size' && (
          <div className="space-y-5">
            <button
              type="button"
              onClick={goBack}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">Choose your dumpster size</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {formData.material === 'heavy' 
                  ? 'Compact sizes for heavy materials (6-10 yard)'
                  : 'Full range for general debris (10-40 yard)'
                }
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableSizes.map((size) => {
                  const includedTons = formData.material === 'heavy' ? 10 : INCLUDED_TONS[size.value] || 1;
                  const image = DUMPSTER_IMAGES[size.value];
                  const price = Math.round(size.basePrice * (zoneResult?.multiplier || 1));

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
                        size.popular && "ring-1 ring-accent/50"
                      )}
                    >
                      {size.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full whitespace-nowrap">
                          POPULAR
                        </span>
                      )}

                      {image && (
                        <div className="aspect-[4/3] bg-muted/50 rounded-lg mb-2 p-2">
                          <img src={image} alt={size.label} className="w-full h-full object-contain" />
                        </div>
                      )}

                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{size.value}</div>
                        <div className="text-xs text-muted-foreground uppercase">yard</div>
                        <div className="flex items-center justify-center gap-1 mt-1 text-xs text-primary font-medium">
                          <Weight className="w-3 h-3" />
                          {includedTons}T incl
                        </div>
                        {size.dimensions && (
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            Approx. {size.dimensions}
                          </div>
                        )}
                        <div className="mt-2 text-sm font-semibold text-foreground">${price}</div>
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
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="cta"
              size="lg"
              className="w-full h-14 text-base"
              onClick={goNext}
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 4: Options (Rental + Extras) */}
        {step === 'options' && (
          <div className="space-y-5">
            <button
              type="button"
              onClick={goBack}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {/* Rental Duration */}
            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">Rental Duration</h4>
              <p className="text-sm text-muted-foreground mb-3">Standard 7-day rental included</p>

              <div className="grid grid-cols-4 gap-2">
                {RENTAL_PERIODS.map((period) => (
                  <button
                    key={period.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, rentalDays: period.value }))}
                    className={cn(
                      "relative py-3 px-2 rounded-xl border-2 text-center transition-all",
                      formData.rentalDays === period.value
                        ? "border-primary bg-primary/5"
                        : "border-input bg-background hover:border-primary/50"
                    )}
                  >
                    {period.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-accent text-accent-foreground text-[9px] font-bold rounded-full">
                        STD
                      </span>
                    )}
                    <div className="text-lg font-bold text-foreground">{period.value}</div>
                    <div className="text-xs text-muted-foreground">days</div>
                    {period.extraCost > 0 && (
                      <div className="text-xs text-primary mt-1">+${period.extraCost}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Extras */}
            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">Add Extras</h4>
              <p className="text-sm text-muted-foreground mb-3">Optional services and fees</p>

              <div className="space-y-2">
                {EXTRAS.map((extra) => {
                  const qty = getExtraQuantity(extra.id);
                  const isSelected = qty > 0;

                  return (
                    <div
                      key={extra.id}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all",
                        isSelected ? "border-primary bg-primary/5" : "border-input bg-background"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{extra.icon}</span>
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

            {/* Price Breakdown */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <h5 className="font-semibold text-foreground text-sm">Quote Breakdown</h5>
              {quote.lineItems.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm">
                  <div>
                    <span className={cn(
                      item.type === 'discount' ? 'text-success' : 'text-foreground'
                    )}>
                      {item.label}
                    </span>
                    {item.subLabel && (
                      <div className="text-xs text-muted-foreground">{item.subLabel}</div>
                    )}
                  </div>
                  <span className={cn(
                    "font-medium shrink-0",
                    item.type === 'discount' ? 'text-success' : 'text-foreground'
                  )}>
                    {item.type === 'discount' ? '-' : ''}${Math.abs(item.amount)}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
                <span className="font-bold text-foreground">Estimated Total</span>
                <span className="text-xl font-bold text-foreground">
                  ${quote.estimatedMin}
                  <span className="text-sm font-medium text-muted-foreground">–${quote.estimatedMax}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Includes {quote.includedTons}T • Overage: ${OVERAGE_COST_PER_TON}/ton
              </p>
            </div>

            <Button
              type="button"
              variant="cta"
              size="lg"
              className="w-full h-14 text-base"
              onClick={goNext}
            >
              Continue to Book
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 5: Contact */}
        {step === 'contact' && (
          <div className="space-y-5">
            <button
              type="button"
              onClick={goBack}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {/* Quote Summary Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-success" />
                    Your Quote
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    ${quote.estimatedMin}
                    <span className="text-base font-medium text-muted-foreground">–${quote.estimatedMax}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">
                    {DUMPSTER_SIZES.find((s) => s.value === formData.size)?.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {RENTAL_PERIODS.find((r) => r.value === formData.rentalDays)?.label} rental
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Contact Information</h4>
              
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="pl-11 h-12 text-base"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="pl-11 h-12 text-base"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-11 h-12 text-base"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Delivery Address (optional)"
                  value={formData.address || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  className="pl-11 h-12 text-base"
                />
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <Button
                type="button"
                variant="cta"
                size="lg"
                className="w-full h-14 text-base gap-2"
                onClick={() => handleSaveQuote(true)}
                disabled={isSubmitting || !canGoNext}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Book Now
                  </>
                )}
              </Button>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5 h-11"
                  onClick={() => handleSaveQuote(false)}
                  disabled={!canGoNext || isSubmitting}
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5 h-11"
                  onClick={handleTextQuote}
                  disabled={!formData.name}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Text</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5 h-11"
                  asChild
                >
                  <a href="tel:+15106802150">
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">Call</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
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
