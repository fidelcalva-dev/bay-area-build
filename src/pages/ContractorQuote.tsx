import { Layout } from '@/components/layout/Layout';
import { InstantQuoteCalculatorV3 } from '@/components/quote/InstantQuoteCalculatorV3';
import { CheckCircle, Percent, Truck, Calendar, Users, Briefcase, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrustStrip, PhoneCTA, TRUST_BADGES } from '@/components/shared';

// Custom contractor badges
const contractorTrustBadges = [
  TRUST_BADGES.licensedInsured,
  { icon: TRUST_BADGES.reviews.icon, label: '4.9★ Contractor Reviews' },
  TRUST_BADGES.contractorDiscount,
];

const contractorBenefits = [
  { icon: Percent, text: 'Volume discounts with commitment (up to 10%)' },
  { icon: Calendar, text: 'Priority scheduling & same-day available' },
  { icon: Truck, text: 'Reliable on-time delivery & pickup' },
  { icon: Users, text: 'Dedicated account support' },
  { icon: Briefcase, text: 'Net-30 terms available' },
  { icon: CheckCircle, text: 'Custom programs for recurring jobs' },
];

const testimonials = [
  {
    name: 'Mike R.',
    company: 'MR Construction',
    quote: 'CALSAN is our go-to. On time, every time. The volume program saves us thousands.',
  },
  {
    name: 'Sarah L.',
    company: 'Bay Area Renovations',
    quote: 'Finally a dumpster company that understands contractor schedules. Highly recommend.',
  },
];

export default function ContractorQuote() {
  return (
    <Layout
      title="Contractor Dumpster Rentals | Volume Programs | CALSAN"
      description="Exclusive contractor programs on roll-off dumpster rentals. Volume discounts up to 10%, priority scheduling, Net-30 terms. Serving Bay Area contractors."
    >
      <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-orange-500/5 via-background to-muted">
        <div className="container-wide py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left - Contractor Value Proposition */}
            <div className="lg:sticky lg:top-24">
              {/* Contractor Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-600 dark:text-orange-400 text-sm font-bold mb-4">
                <Briefcase className="w-4 h-4" />
                Contractor Pricing
              </div>

              {/* Trust Badges - Using shared component with custom badges */}
              <TrustStrip 
                customBadges={contractorTrustBadges}
                variant="muted"
                className="mb-6"
              />

              {/* Headline */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 leading-tight">
                Built for Contractors.
                <span className="block text-primary mt-1">Volume Programs Available.</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                We know your job depends on reliable equipment. Get priority scheduling, 
                dedicated support, and automatic contractor pricing on every order.
              </p>

              {/* Benefits Grid */}
              <div className="bg-card rounded-2xl border border-border p-6 mb-8">
                <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Contractor Benefits
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contractorBenefits.map((benefit) => (
                    <li key={benefit.text} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <benefit.icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{benefit.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Testimonials */}
              <div className="space-y-4 mb-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Trusted by Bay Area Contractors
                </h3>
                {testimonials.map((t) => (
                  <div key={t.name} className="bg-muted/50 rounded-xl p-4">
                    <p className="text-foreground italic mb-2">"{t.quote}"</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{t.name}</span> — {t.company}
                    </p>
                  </div>
                ))}
              </div>

              {/* Phone CTA */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Contractor hotline</p>
                  <p className="font-bold text-foreground text-lg">(510) 680-2150</p>
                </div>
                <Button asChild variant="default" size="sm">
                  <a href="tel:+15106802150">Call Now</a>
                </Button>
              </div>
            </div>

            {/* Right - Calculator with pre-selected contractor */}
            <div className="lg:pt-0">
              {/* Volume program notice */}
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 mb-4 flex items-center gap-3">
                <Percent className="w-5 h-5 text-accent-foreground shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Contractor programs available</span> with volume commitment
                </p>
              </div>

              <ContractorQuoteCalculator />
              
              {/* Reassurance */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  🔒 Your information is secure • Net-30 available on approval
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// Wrapper component that pre-selects contractor
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Zap, ChevronRight, ChevronLeft, Mail, Loader2, MessageCircle,
  MapPin, Package, Weight, Sparkles, HelpCircle, Bookmark
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { selectVendorForQuote, saveQuote, type VendorSelectionResult } from '@/lib/vendorSelection';
import type { QuoteFormData, ExtraSelection } from '@/components/quote/types';
import { DUMPSTER_SIZES, MATERIAL_TYPES, USER_TYPES, RENTAL_PERIODS, EXTRAS, OVERAGE_COST_PER_TON } from '@/components/quote/constants';

import dumpster6yard from '@/assets/dumpsters/dumpster-6yard.png';
import dumpster8yard from '@/assets/dumpsters/dumpster-8yard.png';
import dumpster10yard from '@/assets/dumpsters/dumpster-10yard.png';
import dumpster20yard from '@/assets/dumpsters/dumpster-20yard.png';
import dumpster30yard from '@/assets/dumpsters/dumpster-30yard.png';
import dumpster40yard from '@/assets/dumpsters/dumpster-40yard.png';

const DUMPSTER_IMAGES: Record<number, string> = {
  6: dumpster6yard, 8: dumpster8yard, 10: dumpster10yard,
  20: dumpster20yard, 30: dumpster30yard, 40: dumpster40yard,
};

const INCLUDED_TONS: Record<number, number> = {
  6: 10, 8: 10, 10: 1, 20: 2, 30: 3, 40: 4,
};

type Step = 'zip' | 'material' | 'size' | 'options' | 'contact' | 'success';

interface ZoneResult {
  zoneId: string;
  zoneName: string;
  cityName?: string;
  multiplier: number;
}

function ContractorQuoteCalculator() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('zip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingZip, setIsCheckingZip] = useState(false);
  const [zoneResult, setZoneResult] = useState<ZoneResult | null>(null);
  const [vendorResult, setVendorResult] = useState<VendorSelectionResult | null>(null);
  const [sizeDbId, setSizeDbId] = useState<string | null>(null);

  // Pre-select contractor!
  const [formData, setFormData] = useState<QuoteFormData>({
    userType: 'contractor', // PRE-SELECTED
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

  // Zone lookup
  const lookupZone = useCallback(async (zip: string) => {
    if (zip.length !== 5) { setZoneResult(null); return; }
    setIsCheckingZip(true);
    try {
      const { data, error } = await supabase
        .from('zone_zip_codes')
        .select(`zone_id, city_name, zone:pricing_zones!inner(id, name, base_multiplier, is_active)`)
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
    } catch { setZoneResult(null); }
    finally { setIsCheckingZip(false); }
  }, []);

  useEffect(() => {
    if (formData.zip.length === 5) lookupZone(formData.zip);
    else setZoneResult(null);
  }, [formData.zip, lookupZone]);

  useEffect(() => {
    const material = MATERIAL_TYPES.find((m) => m.value === formData.material);
    if (material && !material.allowedSizes.includes(formData.size)) {
      setFormData((prev) => ({ ...prev, size: formData.material === 'heavy' ? 10 : 20 }));
    }
  }, [formData.material, formData.size]);

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

  const quote = useMemo(() => {
    if (!zoneResult) return { lineItems: [], subtotal: 0, estimatedMin: 0, estimatedMax: 0, includedTons: 0, isValid: false };
    const lineItems: { label: string; subLabel?: string; amount: number; type: string }[] = [];
    const sizeData = DUMPSTER_SIZES.find((s) => s.value === formData.size);
    const material = MATERIAL_TYPES.find((m) => m.value === formData.material);
    const rental = RENTAL_PERIODS.find((r) => r.value === formData.rentalDays);
    const userTypeData = USER_TYPES.find((u) => u.value === formData.userType);
    if (!sizeData || !material || !rental) return { lineItems: [], subtotal: 0, estimatedMin: 0, estimatedMax: 0, includedTons: 0, isValid: false };

    const includedTons = INCLUDED_TONS[formData.size] || 1;
    const basePrice = Math.round(sizeData.basePrice * zoneResult.multiplier);
    lineItems.push({ label: `${sizeData.label} Dumpster`, subLabel: `${rental.label} rental • ${includedTons}T included`, amount: basePrice, type: 'base' });

    if (material.priceAdjustment > 0) {
      lineItems.push({ label: 'Heavy Material Surcharge', subLabel: 'Concrete, dirt, rock, asphalt', amount: material.priceAdjustment, type: 'addition' });
    }
    if (rental.extraCost > 0) {
      lineItems.push({ label: 'Extended Rental', subLabel: `+${rental.extraDays} extra days`, amount: rental.extraCost, type: 'addition' });
    }
    for (const extraSel of formData.extras) {
      const extra = EXTRAS.find((e) => e.id === extraSel.id);
      if (extra && extraSel.quantity > 0) {
        lineItems.push({ label: extra.label, subLabel: extraSel.quantity > 1 ? `${extraSel.quantity} × $${extra.price}` : extra.description, amount: extra.price * extraSel.quantity, type: 'addition' });
      }
    }

    const subtotalBeforeDiscount = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const discount = userTypeData?.discount || 0;
    if (discount > 0) {
      lineItems.push({ label: `${userTypeData?.label} Discount`, subLabel: `${(discount * 100).toFixed(0)}% off`, amount: -Math.round(subtotalBeforeDiscount * discount), type: 'discount' });
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    return { lineItems, subtotal, estimatedMin: subtotal, estimatedMax: subtotal + Math.round(subtotal * 0.08), includedTons, isValid: true };
  }, [formData, zoneResult]);

  useEffect(() => {
    async function runVendorSelection() {
      if (!zoneResult?.zoneId || !sizeDbId || !quote.isValid) { setVendorResult(null); return; }
      const result = await selectVendorForQuote({ zoneId: zoneResult.zoneId, sizeId: sizeDbId, basePrice: quote.subtotal });
      setVendorResult(result);
    }
    runVendorSelection();
  }, [zoneResult?.zoneId, sizeDbId, quote.isValid, quote.subtotal]);

  const canGoNext = useMemo(() => {
    switch (step) {
      case 'zip': return zoneResult !== null;
      case 'contact': return formData.name && formData.phone && formData.email;
      default: return true;
    }
  }, [step, zoneResult, formData]);

  const goNext = () => {
    const nextSteps: Record<Step, Step> = { zip: 'material', material: 'size', size: 'options', options: 'contact', contact: 'success', success: 'success' };
    setStep(nextSteps[step]);
  };
  const goBack = () => {
    const prevSteps: Record<Step, Step> = { zip: 'zip', material: 'zip', size: 'material', options: 'size', contact: 'options', success: 'contact' };
    setStep(prevSteps[step]);
  };

  const handleSaveQuote = async (bookNow = false) => {
    if (!formData.name || !formData.phone || !formData.email) {
      toast({ title: 'Missing Information', description: 'Please fill in all contact fields', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const userTypeData = USER_TYPES.find((u) => u.value === formData.userType);
      const result = await saveQuote({
        customerName: formData.name, customerEmail: formData.email, customerPhone: formData.phone,
        userType: formData.userType, zipCode: formData.zip, zoneId: zoneResult?.zoneId, sizeId: sizeDbId || undefined,
        materialType: formData.material, rentalDays: formData.rentalDays,
        extras: formData.extras.map((e) => `${e.id}:${e.quantity}`),
        subtotal: quote.subtotal, estimatedMin: quote.estimatedMin, estimatedMax: quote.estimatedMax,
        discountPercent: (userTypeData?.discount || 0) * 100,
        selectedVendorId: vendorResult?.selectedVendor?.vendorId,
        vendorCost: vendorResult?.vendorCost || undefined, margin: vendorResult?.margin || undefined,
        isCalsanFulfillment: vendorResult?.isCalsanFulfillment ?? true,
      });
      if (result.success) {
        setStep('success');
        toast({ title: bookNow ? 'Booking Submitted! 🎉' : 'Quote Saved! 📧', description: bookNow ? "We'll contact you within 15 minutes" : "Check your email for the quote details" });
      } else throw new Error(result.error);
    } catch {
      toast({ title: 'Submission Error', description: 'Please try again or call us directly', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  const handleTextQuote = () => {
    const sizeData = DUMPSTER_SIZES.find((s) => s.value === formData.size);
    const msg = encodeURIComponent(`Contractor Quote:\n${formData.name}\n${sizeData?.label} ${formData.material === 'heavy' ? '(Heavy)' : ''}\nZIP: ${formData.zip}\nEst: $${quote.estimatedMin}-$${quote.estimatedMax}`);
    window.open(`sms:+15106802150?body=${msg}`, '_blank');
  };

  const toggleExtra = (extraId: string, quantity: number = 1) => {
    setFormData((prev) => {
      const existing = prev.extras.find((e) => e.id === extraId);
      if (existing) {
        if (quantity === 0) return { ...prev, extras: prev.extras.filter((e) => e.id !== extraId) };
        return { ...prev, extras: prev.extras.map((e) => (e.id === extraId ? { ...e, quantity } : e)) };
      }
      return { ...prev, extras: [...prev.extras, { id: extraId, quantity }] };
    });
  };
  const getExtraQuantity = (extraId: string) => formData.extras.find((e) => e.id === extraId)?.quantity || 0;
  const availableSizes = useMemo(() => {
    const material = MATERIAL_TYPES.find((m) => m.value === formData.material);
    return DUMPSTER_SIZES.filter((s) => material?.allowedSizes.includes(s.value));
  }, [formData.material]);

  const STEPS = [
    { key: 'zip', label: 'Location', icon: <MapPin className="w-4 h-4" /> },
    { key: 'material', label: 'Material', icon: <Package className="w-4 h-4" /> },
    { key: 'size', label: 'Size', icon: <Weight className="w-4 h-4" /> },
    { key: 'options', label: 'Options', icon: <Calendar className="w-4 h-4" /> },
    { key: 'contact', label: 'Contact', icon: <Users className="w-4 h-4" /> },
  ];
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-primary px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Contractor Quote</h3>
            <p className="text-sm text-white/80">10% discount applied • Priority scheduling</p>
          </div>
        </div>

        {step !== 'success' && (
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <button
                  type="button"
                  onClick={() => i < stepIndex && setStep(s.key as Step)}
                  disabled={i > stepIndex}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                    step === s.key ? "bg-white text-orange-600" : i < stepIndex ? "bg-white/20 text-white hover:bg-white/30" : "bg-white/10 text-white/50"
                  )}
                >
                  {i < stepIndex ? <CheckCircle className="w-3.5 h-3.5" /> : s.icon}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-white/40 mx-1 shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Step 1: ZIP */}
        {step === 'zip' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <MapPin className="w-4 h-4 inline mr-1.5" />
                Job Site ZIP Code
              </label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="Enter 5-digit ZIP"
                value={formData.zip}
                onChange={(e) => setFormData((prev) => ({ ...prev, zip: e.target.value.replace(/\D/g, '') }))}
                className={cn("text-lg h-14 text-center font-semibold tracking-widest", formData.zip.length === 5 && !isCheckingZip && (zoneResult ? "border-success bg-success/5" : "border-destructive bg-destructive/5"))}
              />
              {isCheckingZip && <div className="flex justify-center mt-3"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
              {formData.zip.length === 5 && !isCheckingZip && (
                <div className={cn("mt-3 p-3 rounded-lg flex items-start gap-3", zoneResult ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30")}>
                  {zoneResult ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">{zoneResult.cityName ? `${zoneResult.cityName} — We service your area!` : "We service your area!"}</p>
                        <p className="text-sm text-muted-foreground">{zoneResult.zoneName} • Same-day available</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Outside service area</p>
                        <p className="text-sm text-muted-foreground">Call us — we may still be able to help!</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <Button type="button" variant="cta" size="lg" className="w-full h-14 text-base bg-orange-600 hover:bg-orange-700" onClick={goNext} disabled={!canGoNext}>
              Continue <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Material */}
        {step === 'material' && (
          <div className="space-y-5">
            <button type="button" onClick={goBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"><ChevronLeft className="w-4 h-4" />Back</button>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-4">What are you disposing?</h4>
              <div className="grid gap-3">
                {MATERIAL_TYPES.map((type) => (
                  <button key={type.value} type="button" onClick={() => setFormData((prev) => ({ ...prev, material: type.value }))}
                    className={cn("p-4 rounded-xl border-2 text-left transition-all", formData.material === type.value ? "border-orange-500 bg-orange-500/5" : "border-input hover:border-orange-500/50")}>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{type.icon}</span>
                      <div className="flex-1">
                        <h5 className="font-semibold text-foreground">{type.label}</h5>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                      {formData.material === type.value && <CheckCircle className="w-5 h-5 text-orange-500" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <Button type="button" variant="cta" size="lg" className="w-full h-14 text-base bg-orange-600 hover:bg-orange-700" onClick={goNext}>
              Continue <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 3: Size */}
        {step === 'size' && (
          <div className="space-y-5">
            <button type="button" onClick={goBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"><ChevronLeft className="w-4 h-4" />Back</button>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-4">Select dumpster size</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableSizes.map((size) => {
                  const includedTons = formData.material === 'heavy' ? 10 : INCLUDED_TONS[size.value] || 1;
                  const image = DUMPSTER_IMAGES[size.value];
                  const price = Math.round(size.basePrice * (zoneResult?.multiplier || 1));
                  return (
                    <button key={size.id} type="button" onClick={() => setFormData((prev) => ({ ...prev, size: size.value }))}
                      className={cn("relative p-3 rounded-xl border-2 text-left transition-all", formData.size === size.value ? "border-orange-500 bg-orange-500/5 ring-2 ring-orange-500/20" : "border-input hover:border-orange-500/50")}>
                      {size.popular && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">POPULAR</span>}
                      {image && <div className="aspect-[4/3] bg-muted/50 rounded-lg mb-2 p-2"><img src={image} alt={size.label} className="w-full h-full object-contain" /></div>}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{size.value}</div>
                        <div className="text-xs text-muted-foreground uppercase">yard</div>
                        <div className="flex items-center justify-center gap-1 mt-1 text-xs text-orange-600 font-medium"><Weight className="w-3 h-3" />{includedTons}T</div>
                        <div className="mt-2 text-sm font-semibold text-foreground">${price}</div>
                      </div>
                      {formData.size === size.value && <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-white" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button type="button" variant="cta" size="lg" className="w-full h-14 text-base bg-orange-600 hover:bg-orange-700" onClick={goNext}>
              Continue <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 4: Options */}
        {step === 'options' && (
          <div className="space-y-5">
            <button type="button" onClick={goBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"><ChevronLeft className="w-4 h-4" />Back</button>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-3">Rental Duration</h4>
              <div className="grid grid-cols-4 gap-2">
                {RENTAL_PERIODS.map((period) => (
                  <button key={period.value} type="button" onClick={() => setFormData((prev) => ({ ...prev, rentalDays: period.value }))}
                    className={cn("relative py-3 px-2 rounded-xl border-2 text-center transition-all", formData.rentalDays === period.value ? "border-orange-500 bg-orange-500/5" : "border-input hover:border-orange-500/50")}>
                    {period.popular && <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded-full">STD</span>}
                    <div className="text-lg font-bold text-foreground">{period.value}</div>
                    <div className="text-xs text-muted-foreground">days</div>
                    {period.extraCost > 0 && <div className="text-xs text-orange-600 mt-1">+${period.extraCost}</div>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-3">Extras</h4>
              <div className="space-y-2">
                {EXTRAS.map((extra) => {
                  const qty = getExtraQuantity(extra.id);
                  return (
                    <div key={extra.id} className={cn("p-3 rounded-xl border-2 transition-all", qty > 0 ? "border-orange-500 bg-orange-500/5" : "border-input")}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{extra.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between"><span className="font-medium text-foreground">{extra.label}</span><span className="text-sm font-semibold">${extra.price}</span></div>
                          <p className="text-xs text-muted-foreground truncate">{extra.description}</p>
                        </div>
                        {extra.allowQuantity ? (
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => toggleExtra(extra.id, Math.max(0, qty - 1))} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">−</button>
                            <span className="w-6 text-center font-medium">{qty}</span>
                            <button type="button" onClick={() => toggleExtra(extra.id, Math.min(extra.maxQuantity || 99, qty + 1))} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">+</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => toggleExtra(extra.id, qty > 0 ? 0 : 1)} className={cn("w-7 h-7 rounded-lg flex items-center justify-center", qty > 0 ? "bg-orange-500 text-white" : "bg-muted")}>
                            {qty > 0 ? <CheckCircle className="w-4 h-4" /> : '+'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Breakdown */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <h5 className="font-semibold text-foreground text-sm">Quote Breakdown</h5>
              {quote.lineItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div><span className={item.type === 'discount' ? 'text-success' : 'text-foreground'}>{item.label}</span>{item.subLabel && <div className="text-xs text-muted-foreground">{item.subLabel}</div>}</div>
                  <span className={cn("font-medium", item.type === 'discount' ? 'text-success' : '')}>{item.type === 'discount' ? '-' : ''}${Math.abs(item.amount)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between items-center">
                <span className="font-bold text-foreground">Estimated Total</span>
                <span className="text-xl font-bold text-foreground">${quote.estimatedMin}<span className="text-sm font-medium text-muted-foreground">–${quote.estimatedMax}</span></span>
              </div>
            </div>
            <Button type="button" variant="cta" size="lg" className="w-full h-14 text-base bg-orange-600 hover:bg-orange-700" onClick={goNext}>
              Continue to Book <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 5: Contact */}
        {step === 'contact' && (
          <div className="space-y-5">
            <button type="button" onClick={goBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"><ChevronLeft className="w-4 h-4" />Back</button>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div><div className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success" />Contractor Quote</div><div className="text-2xl font-bold text-foreground">${quote.estimatedMin}<span className="text-base font-medium text-muted-foreground">–${quote.estimatedMax}</span></div></div>
                <div className="text-right"><div className="font-semibold text-foreground">{DUMPSTER_SIZES.find((s) => s.value === formData.size)?.label}</div><div className="text-sm text-muted-foreground">{formData.rentalDays} days</div></div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Contact Information</h4>
              <div className="relative"><Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="text" placeholder="Your Name / Company" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} className="pl-11 h-12 text-base" /></div>
              <div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} className="pl-11 h-12 text-base" /></div>
              <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} className="pl-11 h-12 text-base" /></div>
              <div className="relative"><MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="text" placeholder="Job Site Address (optional)" value={formData.address || ''} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} className="pl-11 h-12 text-base" /></div>
            </div>
            <div className="space-y-3 pt-2">
              <Button type="button" variant="cta" size="lg" className="w-full h-14 text-base gap-2 bg-orange-600 hover:bg-orange-700" onClick={() => handleSaveQuote(true)} disabled={isSubmitting || !canGoNext}>
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</> : <><CheckCircle className="w-5 h-5" />Book Now</>}
              </Button>
              <div className="grid grid-cols-3 gap-2">
                <Button type="button" variant="outline" className="gap-1.5 h-11" onClick={() => handleSaveQuote(false)} disabled={!canGoNext || isSubmitting}><Bookmark className="w-4 h-4" /><span className="hidden sm:inline">Save</span></Button>
                <Button type="button" variant="outline" className="gap-1.5 h-11" onClick={handleTextQuote} disabled={!formData.name}><MessageCircle className="w-4 h-4" /><span className="hidden sm:inline">Text</span></Button>
                <Button type="button" variant="outline" className="gap-1.5 h-11" asChild><a href="tel:+15106802150"><Phone className="w-4 h-4" /><span className="hidden sm:inline">Call</span></a></Button>
              </div>
            </div>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-success" /></div>
            <h3 className="text-xl font-bold text-foreground mb-2">Quote Submitted!</h3>
            <p className="text-muted-foreground mb-6">We'll contact you within 15 minutes to confirm your contractor booking.</p>
            <div className="bg-muted/50 rounded-xl p-4 text-left mb-6">
              <div className="text-sm text-muted-foreground mb-1">Contractor Quote Summary</div>
              <div className="flex justify-between items-center"><div className="font-semibold text-foreground">{DUMPSTER_SIZES.find((s) => s.value === formData.size)?.label}</div><div className="text-lg font-bold text-foreground">${quote.estimatedMin}–${quote.estimatedMax}</div></div>
              <div className="text-sm text-muted-foreground mt-1">{formData.rentalDays} days • 10% discount applied • ZIP {formData.zip}</div>
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={() => { setStep('zip'); setFormData({ userType: 'contractor', zip: '', material: 'general', size: 20, rentalDays: 7, extras: [], name: '', phone: '', email: '', address: '' }); setZoneResult(null); }}>
              Get Another Quote
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
