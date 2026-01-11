import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Zap, ChevronRight, Phone, User, Mail, Loader2, MessageCircle,
  CheckCircle, ArrowLeft, MapPin, Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { selectVendorForQuote, saveQuote, type VendorSelectionResult } from '@/lib/vendorSelection';

// Quote components
import { UserTypeSelector } from './steps/UserTypeSelector';
import { ZipLookup } from './steps/ZipLookup';
import { MaterialSelector } from './steps/MaterialSelector';
import { SizeSelector } from './steps/SizeSelector';
import { RentalDuration } from './steps/RentalDuration';
import { ExtrasSelector } from './steps/ExtrasSelector';
import { QuoteBreakdown } from './QuoteBreakdown';
import { DebrisEstimator } from './DebrisEstimator';
import { useQuoteCalculation, getZoneByZip } from './hooks/useQuoteCalculation';
import { DUMPSTER_SIZES, MATERIAL_TYPES, USER_TYPES, RENTAL_PERIODS } from './constants';
import type { QuoteFormData, ExtraSelection } from './types';

export function InstantQuoteCalculatorV2() {
  const { toast } = useToast();
  const [step, setStep] = useState<'quote' | 'contact' | 'success'>('quote');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEstimator, setShowEstimator] = useState(false);
  const [vendorResult, setVendorResult] = useState<VendorSelectionResult | null>(null);
  const [zoneDbId, setZoneDbId] = useState<string | null>(null);
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

  // Calculate zone from ZIP
  const zone = useMemo(() => getZoneByZip(formData.zip), [formData.zip]);
  const isZipValid = formData.zip.length === 5;
  const isZipInArea = isZipValid && zone !== null;

  // Auto-adjust size if material changes and current size isn't allowed
  useEffect(() => {
    const material = MATERIAL_TYPES.find((m) => m.value === formData.material);
    if (material && !material.allowedSizes.includes(formData.size)) {
      setFormData((prev) => ({ ...prev, size: material.allowedSizes[0] }));
    }
  }, [formData.material, formData.size]);

  // Calculate quote using hook
  const quote = useQuoteCalculation(formData);

  // Fetch zone and size IDs from database for vendor selection
  useEffect(() => {
    async function fetchDbIds() {
      if (!isZipInArea) {
        setZoneDbId(null);
        setSizeDbId(null);
        setVendorResult(null);
        return;
      }

      try {
        // Fetch zone by zip
        const { data: zipData } = await supabase
          .from('zone_zip_codes')
          .select('zone_id')
          .eq('zip_code', formData.zip)
          .maybeSingle();

        if (zipData?.zone_id) {
          setZoneDbId(zipData.zone_id);
        }

        // Fetch size ID
        const { data: sizeData } = await supabase
          .from('dumpster_sizes')
          .select('id')
          .eq('size_value', formData.size)
          .eq('is_active', true)
          .maybeSingle();

        if (sizeData?.id) {
          setSizeDbId(sizeData.id);
        }
      } catch (err) {
        console.error('Error fetching DB IDs:', err);
      }
    }

    fetchDbIds();
  }, [formData.zip, formData.size, isZipInArea]);

  // Run vendor selection when we have valid data
  useEffect(() => {
    async function runVendorSelection() {
      if (!zoneDbId || !sizeDbId || !quote.isValid) {
        setVendorResult(null);
        return;
      }

      const result = await selectVendorForQuote({
        zoneId: zoneDbId,
        sizeId: sizeDbId,
        basePrice: quote.subtotal,
      });

      setVendorResult(result);
    }

    runVendorSelection();
  }, [zoneDbId, sizeDbId, quote.isValid, quote.subtotal]);

  // Handle debris estimator size selection
  const handleEstimatorSelect = useCallback((size: number, isHeavy: boolean) => {
    setFormData((prev) => ({
      ...prev,
      size,
      material: isHeavy ? 'heavy' : 'general',
    }));
  }, []);

  // Handle extras change
  const handleExtrasChange = useCallback((extras: ExtraSelection[]) => {
    setFormData((prev) => ({ ...prev, extras }));
  }, []);

  // Generate SMS message
  const getSmsMessage = useCallback(() => {
    const selectedSize = DUMPSTER_SIZES.find((s) => s.value === formData.size);
    const selectedMat = MATERIAL_TYPES.find((m) => m.value === formData.material);
    return encodeURIComponent(
      `New Quote Request\n${formData.name}\n${selectedSize?.label} ${selectedMat?.label}\nZIP: ${formData.zip}\nEst: $${quote.estimatedMin}-$${quote.estimatedMax}`
    );
  }, [formData, quote]);

  const handleConfirmByText = useCallback(() => {
    window.open(`sms:+15106802150?body=${getSmsMessage()}`, '_blank');
  }, [getSmsMessage]);

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

    try {
      // Save quote to database
      const userTypeData = USER_TYPES.find((u) => u.value === formData.userType);
      
      const saveResult = await saveQuote({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        userType: formData.userType,
        zipCode: formData.zip,
        zoneId: zoneDbId || undefined,
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

      if (!saveResult.success) {
        console.error('Failed to save quote:', saveResult.error);
      }

      setStep('success');
      
      toast({
        title: 'Quote Submitted! 🎉',
        description: "We'll contact you within 15 minutes",
      });
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

  return (
    <>
      <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border" id="quote-calculator">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-primary-foreground">Instant Quote Calculator</h3>
              <p className="text-sm text-primary-foreground/80">All-inclusive pricing • No hidden fees</p>
            </div>
          </div>
        </div>

        {step === 'quote' && (
          <div className="p-5 space-y-6">
            {/* User Type */}
            <UserTypeSelector 
              value={formData.userType} 
              onChange={(type) => setFormData((prev) => ({ ...prev, userType: type }))}
            />

            {/* ZIP Lookup */}
            <ZipLookup 
              value={formData.zip}
              onChange={(zip) => setFormData((prev) => ({ ...prev, zip }))}
              zone={zone}
            />

            {/* Only show rest if ZIP is valid */}
            {isZipInArea && (
              <>
                {/* Material Type */}
                <MaterialSelector 
                  value={formData.material}
                  onChange={(material) => setFormData((prev) => ({ ...prev, material }))}
                />

                {/* Dumpster Size */}
                <SizeSelector 
                  value={formData.size}
                  onChange={(size) => setFormData((prev) => ({ ...prev, size }))}
                  materialType={formData.material}
                  onOpenEstimator={() => setShowEstimator(true)}
                />

                {/* Rental Duration */}
                <RentalDuration 
                  value={formData.rentalDays}
                  onChange={(days) => setFormData((prev) => ({ ...prev, rentalDays: days }))}
                />

                {/* Extras */}
                <ExtrasSelector 
                  value={formData.extras}
                  onChange={handleExtrasChange}
                />

                {/* Quote Breakdown */}
                <QuoteBreakdown quote={quote} />

                {/* Continue Button */}
                <Button
                  type="button"
                  variant="cta"
                  size="lg"
                  className="w-full gap-2 text-base h-14"
                  onClick={() => setStep('contact')}
                  disabled={!quote.isValid}
                >
                  Continue to Book
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        )}

        {step === 'contact' && (
          <div className="p-5 space-y-5">
            {/* Back button */}
            <button
              type="button"
              onClick={() => setStep('quote')}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to quote
            </button>

            {/* Quote Summary */}
            <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-xl p-4 border border-success/30">
              <div className="flex justify-between items-center">
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
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Contact Information</h4>
              
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="pl-11 py-3.5 h-auto text-base"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="pl-11 py-3.5 h-auto text-base"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-11 py-3.5 h-auto text-base"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Delivery Address (optional)"
                  value={formData.address || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  className="pl-11 py-3.5 h-auto text-base"
                />
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <Button
                type="button"
                variant="cta"
                size="lg"
                className="w-full gap-2 text-base h-14"
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
                    <CheckCircle className="w-5 h-5" />
                    Book Now
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={handleConfirmByText}
                  disabled={!formData.name}
                >
                  <MessageCircle className="w-4 h-4" />
                  Text Quote
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  asChild
                >
                  <a href="tel:+15106802150">
                    <Phone className="w-4 h-4" />
                    Call Now
                  </a>
                </Button>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground pt-2">
              Or email us at{' '}
              <a href="mailto:info@calsandisposal.com" className="font-medium text-primary hover:underline">
                info@calsandisposal.com
              </a>
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 text-center">
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
                </div>
                <div className="text-lg font-bold text-foreground">
                  ${quote.estimatedMin}–${quote.estimatedMax}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  setStep('quote');
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
                }}
              >
                Get Another Quote
              </Button>
              
              <Button
                variant="outline"
                className="w-full gap-2"
                asChild
              >
                <a href="tel:+15106802150">
                  <Phone className="w-4 h-4" />
                  Call (510) 680-2150
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Debris Estimator Modal */}
      <DebrisEstimator 
        isOpen={showEstimator}
        onClose={() => setShowEstimator(false)}
        onSelectSize={handleEstimatorSelect}
      />
    </>
  );
}
