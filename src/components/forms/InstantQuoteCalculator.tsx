import { useState, useMemo, useCallback } from 'react';
import { 
  MessageCircle, Zap, MapPin, Package, Recycle, Calendar, 
  Home, HardHat, Building2, ChevronRight, Check, AlertCircle,
  Phone, User, Mail, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  calculateQuote,
  getZoneByZip,
  DUMPSTER_SIZES,
  MATERIAL_TYPES,
  EXTRAS,
  RENTAL_DAYS,
  USER_TYPES,
  type QuoteResult,
} from '@/lib/pricingEngine';

interface FormData {
  userType: string;
  zip: string;
  material: string;
  size: string;
  rentalDays: number;
  extras: string[];
  name: string;
  phone: string;
  email: string;
}

const HIGHLEVEL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/';

export function InstantQuoteCalculator() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'quote' | 'contact'>('quote');
  
  const [formData, setFormData] = useState<FormData>({
    userType: 'homeowner',
    zip: '',
    material: 'general',
    size: '20',
    rentalDays: 7,
    extras: [],
    name: '',
    phone: '',
    email: '',
  });

  // Get zone info
  const zone = useMemo(() => getZoneByZip(formData.zip), [formData.zip]);
  const isZipValid = formData.zip.length === 5;
  const isZipInArea = isZipValid && zone !== null;

  // Get available sizes based on material
  const selectedMaterial = MATERIAL_TYPES.find((m) => m.value === formData.material);
  const availableSizes = DUMPSTER_SIZES.filter(
    (s) => selectedMaterial?.allowedSizes.includes(s.value)
  );

  // Auto-adjust size if current selection is not available
  useMemo(() => {
    if (selectedMaterial && !selectedMaterial.allowedSizes.includes(formData.size)) {
      setFormData((prev) => ({ ...prev, size: selectedMaterial.allowedSizes[0] }));
    }
  }, [selectedMaterial, formData.size]);

  // Calculate quote
  const quote: QuoteResult = useMemo(() => {
    if (!isZipInArea) {
      return {
        lineItems: [],
        subtotal: 0,
        estimatedMin: 0,
        estimatedMax: 0,
        includedTons: 0,
        overageCostPerTon: 85,
        zone: null,
        isValid: false,
        errors: isZipValid ? ['ZIP code is outside our service area'] : [],
      };
    }

    return calculateQuote({
      zip: formData.zip,
      materialType: formData.material,
      sizeValue: formData.size,
      rentalDays: formData.rentalDays,
      extras: formData.extras,
      userType: formData.userType,
    });
  }, [formData, isZipInArea, isZipValid]);

  const toggleExtra = (extraId: string) => {
    setFormData((prev) => ({
      ...prev,
      extras: prev.extras.includes(extraId)
        ? prev.extras.filter((e) => e !== extraId)
        : [...prev.extras, extraId],
    }));
  };

  const handleConfirmByText = useCallback(() => {
    const selectedSize = DUMPSTER_SIZES.find((s) => s.value === formData.size);
    const selectedMat = MATERIAL_TYPES.find((m) => m.value === formData.material);
    const message = `New Quote Request%0A${formData.name}%0A${formData.size}yd ${selectedMat?.label}%0AZIP: ${formData.zip}%0AEst: $${quote.estimatedMin}-$${quote.estimatedMax}`;
    window.open(`sms:+15106802150?body=${encodeURIComponent(decodeURIComponent(message))}`, '_blank');
  }, [formData, quote]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all contact fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const selectedSize = DUMPSTER_SIZES.find((s) => s.value === formData.size);
    const selectedMat = MATERIAL_TYPES.find((m) => m.value === formData.material);
    const selectedRental = RENTAL_DAYS.find((r) => r.value === formData.rentalDays);
    const selectedExtras = EXTRAS.filter((e) => formData.extras.includes(e.id));

    const payload = {
      source: 'Instant Quote Calculator',
      timestamp: new Date().toISOString(),
      contact: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      },
      quote: {
        userType: formData.userType,
        zip: formData.zip,
        zone: zone?.name,
        material: selectedMat?.label,
        size: selectedSize?.label,
        rentalDays: selectedRental?.label,
        extras: selectedExtras.map((e) => e.label),
        lineItems: quote.lineItems,
        estimatedMin: quote.estimatedMin,
        estimatedMax: quote.estimatedMax,
        includedTons: quote.includedTons,
      },
    };

    try {
      // Send to HighLevel webhook (fire and forget pattern for demo)
      // In production, you'd have the actual webhook URL
      console.log('Quote submission payload:', payload);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Quote Sent! 🎉',
        description: "We'll contact you within 15 minutes",
      });

      // Open SMS as secondary action
      handleConfirmByText();
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

  const userTypeData = USER_TYPES.find((u) => u.value === formData.userType);

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border" id="quote-calculator">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-primary-foreground">Instant Quote Calculator</h3>
          <p className="text-sm text-primary-foreground/80">All-inclusive pricing • No hidden fees</p>
        </div>
      </div>

      {step === 'quote' ? (
        <div className="p-5 space-y-5">
          {/* User Type Pills */}
          <div className="flex gap-2">
            {USER_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, userType: type.value }))}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all',
                  formData.userType === type.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input bg-background text-muted-foreground hover:border-primary/50'
                )}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
                {type.discount > 0 && formData.userType === type.value && (
                  <span className="text-[10px] bg-success text-success-foreground px-1.5 py-0.5 rounded-full font-bold">
                    -{type.discount * 100}%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ZIP Input */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="tel"
              inputMode="numeric"
              value={formData.zip}
              onChange={(e) => setFormData((prev) => ({ ...prev, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
              placeholder="Enter ZIP code"
              className="w-full pl-10 pr-12 py-3.5 rounded-xl border-2 border-input bg-background text-foreground text-lg font-semibold placeholder:font-normal placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {isZipValid && (
              <span className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-lg",
                isZipInArea ? "text-success" : "text-destructive"
              )}>
                {isZipInArea ? '✓' : '✕'}
              </span>
            )}
          </div>
          {isZipValid && !isZipInArea && (
            <p className="text-sm text-destructive flex items-center gap-1.5 -mt-3">
              <AlertCircle className="w-4 h-4" />
              ZIP code is outside our service area
            </p>
          )}
          {isZipInArea && zone && (
            <p className="text-sm text-success flex items-center gap-1.5 -mt-3">
              <Check className="w-4 h-4" />
              {zone.name} • Same-day delivery available
            </p>
          )}

          {/* Material Type */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <Recycle className="w-3.5 h-3.5" /> Material Type
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MATERIAL_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, material: type.value }))}
                  className={cn(
                    'py-3 px-4 rounded-xl border-2 text-left transition-all',
                    formData.material === type.value
                      ? 'border-primary bg-primary/10'
                      : 'border-input bg-background hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{type.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{type.label}</div>
                      <div className="text-[10px] text-muted-foreground">{type.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dumpster Size Grid */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <Package className="w-3.5 h-3.5" /> Dumpster Size
            </div>
            <div className="grid grid-cols-4 gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, size: size.value }))}
                  className={cn(
                    'relative py-3 rounded-xl border-2 text-center transition-all',
                    formData.size === size.value
                      ? 'border-primary bg-primary/10'
                      : 'border-input bg-background hover:border-primary/50'
                  )}
                >
                  {size.popular && (
                    <span className="absolute -top-2 inset-x-0 mx-auto w-fit px-2 bg-accent text-accent-foreground text-[9px] font-bold rounded-full">
                      POPULAR
                    </span>
                  )}
                  <div className="text-lg font-bold text-foreground">{size.value}</div>
                  <div className="text-[10px] text-muted-foreground">yard</div>
                </button>
              ))}
            </div>
            {selectedMaterial?.value === 'heavy' && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Heavy materials limited to 6-10 yd for safe transport
              </p>
            )}
          </div>

          {/* Rental Duration */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <Calendar className="w-3.5 h-3.5" /> Rental Duration
            </div>
            <div className="grid grid-cols-4 gap-2">
              {RENTAL_DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, rentalDays: day.value }))}
                  className={cn(
                    'relative py-2.5 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center',
                    formData.rentalDays === day.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input bg-background text-foreground hover:border-primary/50'
                  )}
                >
                  {day.popular && (
                    <span className="absolute -top-2 inset-x-0 mx-auto w-fit px-2 bg-success text-success-foreground text-[9px] font-bold rounded-full">
                      STD
                    </span>
                  )}
                  {day.label}
                  {day.extraCost > 0 && (
                    <span className="text-[9px] text-muted-foreground">+${day.extraCost}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Extras Multi-Select */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              ➕ Add Extras (optional)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXTRAS.map((extra) => (
                <button
                  key={extra.id}
                  type="button"
                  onClick={() => toggleExtra(extra.id)}
                  className={cn(
                    'py-2.5 px-3 rounded-xl border-2 text-left transition-all flex items-center gap-2',
                    formData.extras.includes(extra.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-input bg-background hover:border-primary/50'
                  )}
                >
                  <span className="text-base">{extra.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{extra.label}</div>
                    <div className="text-[10px] text-muted-foreground">+${extra.price}</div>
                  </div>
                  {formData.extras.includes(extra.id) && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quote Breakdown */}
          {quote.isValid && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Quote Breakdown</h4>
              <div className="space-y-1.5">
                {quote.lineItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex justify-between text-sm',
                      item.type === 'discount' ? 'text-success' : 'text-foreground'
                    )}
                  >
                    <span className={item.type === 'base' ? 'font-medium' : ''}>{item.label}</span>
                    <span className={item.type === 'discount' ? '' : 'font-medium'}>
                      {item.type === 'discount' ? '-' : ''}${Math.abs(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs text-muted-foreground">Estimated Total</div>
                    <div className="text-2xl font-extrabold text-foreground">
                      ${quote.estimatedMin}
                      <span className="text-base font-medium text-muted-foreground">–${quote.estimatedMax}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="text-success font-medium">All-inclusive</div>
                    <div>Delivery + Pickup</div>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  Includes {quote.includedTons} ton{quote.includedTons > 1 ? 's' : ''} • Overage: ${quote.overageCostPerTon}/ton
                </div>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <Button
            type="button"
            variant="cta"
            size="lg"
            className="w-full gap-2 text-base"
            onClick={() => setStep('contact')}
            disabled={!quote.isValid}
          >
            Continue to Book
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <div className="p-5 space-y-5">
          {/* Back button */}
          <button
            type="button"
            onClick={() => setStep('quote')}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            ← Back to quote
          </button>

          {/* Quote Summary */}
          <div className="bg-success/10 rounded-xl p-4 border border-success/30">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-muted-foreground">Your Quote</div>
                <div className="text-xl font-bold text-foreground">
                  ${quote.estimatedMin}–${quote.estimatedMax}
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium text-foreground">
                  {DUMPSTER_SIZES.find((s) => s.value === formData.size)?.label}
                </div>
                <div className="text-muted-foreground">
                  {RENTAL_DAYS.find((r) => r.value === formData.rentalDays)?.label}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Information</h4>
            
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="pl-10 py-3 h-auto text-base"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="pl-10 py-3 h-auto text-base"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="pl-10 py-3 h-auto text-base"
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="cta"
              size="lg"
              className="w-full gap-2 text-base"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name || !formData.phone || !formData.email}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Book Now
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full gap-2 text-base"
              onClick={handleConfirmByText}
              disabled={!formData.name}
            >
              <MessageCircle className="w-5 h-5" />
              Confirm by Text
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Or call <a href="tel:+15106802150" className="font-semibold text-foreground hover:text-primary">(510) 680-2150</a>
          </p>
        </div>
      )}
    </div>
  );
}
