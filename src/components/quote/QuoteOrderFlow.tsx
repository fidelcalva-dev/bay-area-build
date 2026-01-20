// Quote Order Flow - Multi-step lead capture after quote
// Step 1: Save Quote (contact) → Step 2: Address → Step 3: Map Pin → Step 4: Continue Order

import { useState, useCallback, lazy, Suspense } from 'react';
import { 
  User, MapPin, Navigation, ExternalLink, ChevronLeft, ChevronRight,
  Loader2, CheckCircle, Phone, Building2, Mail, Briefcase, Home, Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AddressInput } from './steps/AddressInput';
import type { Yard } from '@/lib/distanceService';

// Lazy load the map component to avoid react-leaflet causing multiple React instances
const PlacementMap = lazy(() => import('./steps/PlacementMap').then(m => ({ default: m.PlacementMap })));

// Loading fallback for map
function MapLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64 bg-muted/50 rounded-xl border border-border">
      <div className="text-center space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  );
}

type OrderStep = 'save' | 'address' | 'pin' | 'continue';

const ORDER_STEPS: { key: OrderStep; label: string; icon: React.ReactNode }[] = [
  { key: 'save', label: 'Save Quote', icon: <User className="w-4 h-4" /> },
  { key: 'address', label: 'Address', icon: <MapPin className="w-4 h-4" /> },
  { key: 'pin', label: 'Pin Location', icon: <Navigation className="w-4 h-4" /> },
  { key: 'continue', label: 'Continue', icon: <ExternalLink className="w-4 h-4" /> },
];

interface QuoteSummary {
  sizeLabel: string;
  materialType: 'general' | 'heavy';
  rentalDays: number;
  zipCode: string;
  estimatedMin: number;
  estimatedMax: number;
  includedTons: number;
  subtotal: number;
}

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  company: string;
  customerType: 'homeowner' | 'contractor';
}

interface AddressResult {
  formattedAddress: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  zip?: string;
}

interface PlacementResult {
  lat: number;
  lng: number;
  placementType: 'driveway' | 'street';
  notes: string;
}

interface DistanceInfo {
  yard: Yard;
  distanceMiles: number;
  distanceBracket?: string;
}

interface QuoteOrderFlowProps {
  quoteId?: string;
  quoteSummary: QuoteSummary;
  initialContact?: Partial<ContactInfo>;
  onComplete: () => void;
  onBack: () => void;
  // Distance-based pricing info
  distanceInfo?: DistanceInfo | null;
}

export function QuoteOrderFlow({ 
  quoteId, 
  quoteSummary, 
  initialContact,
  onComplete,
  onBack,
  distanceInfo,
}: QuoteOrderFlowProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<OrderStep>('save');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(quoteId || null);

  // Form state
  const [contact, setContact] = useState<ContactInfo>({
    name: initialContact?.name || '',
    phone: initialContact?.phone || '',
    email: initialContact?.email || '',
    company: initialContact?.company || '',
    customerType: initialContact?.customerType || 'homeowner',
  });

  const [address, setAddress] = useState<AddressResult | null>(null);
  const [placement, setPlacement] = useState<PlacementResult | null>(null);

  // Step navigation
  const stepIndex = ORDER_STEPS.findIndex(s => s.key === step);

  const canGoNext = useCallback(() => {
    switch (step) {
      case 'save':
        return contact.name.trim() && contact.phone.trim() && contact.phone.length >= 10;
      case 'address':
        return address !== null;
      case 'pin':
        return placement !== null;
      default:
        return true;
    }
  }, [step, contact, address, placement]);

  // Save contact info to database
  const handleSaveQuote = async () => {
    if (!canGoNext()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in your name and phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (savedQuoteId) {
        // Update existing quote
        const { error } = await supabase
          .from('quotes')
          .update({
            customer_name: contact.name,
            customer_phone: contact.phone,
            customer_email: contact.email || null,
            company_name: contact.company || null,
            user_type: contact.customerType,
            status: 'saved',
          })
          .eq('id', savedQuoteId);

        if (error) throw error;
      } else {
        // Create new quote record
        const { data, error } = await supabase
          .from('quotes')
          .insert({
            customer_name: contact.name,
            customer_phone: contact.phone,
            customer_email: contact.email || null,
            company_name: contact.company || null,
            user_type: contact.customerType,
            zip_code: quoteSummary.zipCode,
            material_type: quoteSummary.materialType,
            rental_days: quoteSummary.rentalDays,
            subtotal: quoteSummary.subtotal,
            estimated_min: quoteSummary.estimatedMin,
            estimated_max: quoteSummary.estimatedMax,
            status: 'saved',
          })
          .select('id')
          .single();

        if (error) throw error;
        setSavedQuoteId(data.id);
      }

      toast({
        title: 'Quote Saved! ✅',
        description: 'Your information has been saved.',
      });
      
      setStep('address');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save Failed',
        description: 'Please try again or call us directly',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save address to database
  const handleAddressConfirmed = async (addressResult: AddressResult) => {
    setAddress(addressResult);
    
    if (savedQuoteId) {
      try {
        await supabase
          .from('quotes')
          .update({
            delivery_address: addressResult.formattedAddress,
            delivery_lat: addressResult.lat,
            delivery_lng: addressResult.lng,
          })
          .eq('id', savedQuoteId);
      } catch (error) {
        console.error('Address save error:', error);
      }
    }
  };

  // Save placement to database
  const handlePlacementConfirmed = async (placementResult: PlacementResult) => {
    setPlacement(placementResult);
    
    if (savedQuoteId) {
      try {
        await supabase
          .from('quotes')
          .update({
            placement_lat: placementResult.lat,
            placement_lng: placementResult.lng,
            placement_type: placementResult.placementType,
            placement_notes: placementResult.notes || null,
            status: 'pinned',
          })
          .eq('id', savedQuoteId);

        // Send placement confirmed event to HighLevel
        await supabase.functions.invoke('highlevel-webhook', {
          body: {
            event: 'placement_confirmed',
            quote_id: savedQuoteId,
            name: contact.name,
            phone: contact.phone,
            email: contact.email || undefined,
            zip: quoteSummary.zipCode,
            waste_type: quoteSummary.materialType,
            recommended_size: 0,
            selected_size: parseInt(quoteSummary.sizeLabel) || 0,
            included_tons: quoteSummary.includedTons,
            estimated_total: `$${quoteSummary.estimatedMin} - $${quoteSummary.estimatedMax}`,
            extras: '',
            page: 'quote_order_flow',
            tags: ['Placement Confirmed', placementResult.placementType === 'street' ? 'Street Placement' : 'Driveway'],
            // Distance info
            yard_name: distanceInfo?.yard.name,
            distance_miles: distanceInfo?.distanceMiles,
            distance_bracket: distanceInfo?.distanceBracket,
            // Placement info
            placement_type: placementResult.placementType,
            placement_notes: placementResult.notes,
            delivery_address: address?.formattedAddress,
          },
        });
      } catch (error) {
        console.error('Placement save error:', error);
      }
    }
  };

  // Continue to checkout
  const handleContinueOrder = async () => {
    // Update status to checkout_started
    if (savedQuoteId) {
      try {
        await supabase
          .from('quotes')
          .update({ status: 'checkout_started' })
          .eq('id', savedQuoteId);
      } catch (error) {
        console.error('Status update error:', error);
      }
    }

    // Build checkout URL with params
    const checkoutParams = new URLSearchParams({
      quote_id: savedQuoteId || '',
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      size: quoteSummary.sizeLabel,
      material: quoteSummary.materialType,
      days: quoteSummary.rentalDays.toString(),
      zip: quoteSummary.zipCode,
      total: quoteSummary.estimatedMin.toString(),
      address: address?.formattedAddress || '',
      lat: placement?.lat.toString() || '',
      lng: placement?.lng.toString() || '',
      placement: placement?.placementType || '',
    });

    // For now, open a confirmation page or call
    // In production, this would redirect to TrashLab or HighLevel
    toast({
      title: 'Ready to Book! 🎉',
      description: "We'll call you within 15 minutes to confirm.",
    });

    onComplete();
  };

  // Phone validation helper
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  return (
    <div className="space-y-5">
      {/* Progress Steps */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {ORDER_STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <button
              type="button"
              onClick={() => i < stepIndex && setStep(s.key)}
              disabled={i > stepIndex}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                step === s.key
                  ? "bg-primary text-primary-foreground"
                  : i < stepIndex
                  ? "bg-success/20 text-success hover:bg-success/30 cursor-pointer"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {i < stepIndex ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">
                  {i + 1}
                </span>
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < ORDER_STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 mx-1 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Quote Summary (always visible) */}
      <div className="bg-muted/50 rounded-xl p-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-foreground">{quoteSummary.sizeLabel}</div>
          <div className="text-xs text-muted-foreground">
            {quoteSummary.rentalDays} days • {quoteSummary.includedTons}T incl • ZIP {quoteSummary.zipCode}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-foreground">${quoteSummary.estimatedMin}</div>
          <div className="text-xs text-muted-foreground">–${quoteSummary.estimatedMax}</div>
        </div>
      </div>

      {/* Step 1: Save Quote (Contact Info) */}
      {step === 'save' && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Quote
          </button>

          <div>
            <h4 className="text-lg font-bold text-foreground mb-1">Save Your Quote</h4>
            <p className="text-sm text-muted-foreground">
              Enter your contact info to save this quote and continue booking
            </p>
          </div>

          {/* Customer Type Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setContact(p => ({ ...p, customerType: 'homeowner' }))}
              className={cn(
                "p-3 rounded-xl border-2 text-center transition-all",
                contact.customerType === 'homeowner'
                  ? "border-primary bg-primary/5"
                  : "border-input bg-background hover:border-primary/50"
              )}
            >
              <Home className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-sm font-medium text-foreground">Homeowner</div>
            </button>
            <button
              type="button"
              onClick={() => setContact(p => ({ ...p, customerType: 'contractor' }))}
              className={cn(
                "p-3 rounded-xl border-2 text-center transition-all",
                contact.customerType === 'contractor'
                  ? "border-primary bg-primary/5"
                  : "border-input bg-background hover:border-primary/50"
              )}
            >
              <Briefcase className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-sm font-medium text-foreground">Contractor</div>
            </button>
          </div>

          {/* Contact Form */}
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Full Name *"
                value={contact.name}
                onChange={(e) => setContact(p => ({ ...p, name: e.target.value }))}
                className="pl-11 h-12 text-base"
                required
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Mobile Phone *"
                value={contact.phone}
                onChange={(e) => setContact(p => ({ ...p, phone: formatPhone(e.target.value) }))}
                className="pl-11 h-12 text-base"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email (recommended)"
                value={contact.email}
                onChange={(e) => setContact(p => ({ ...p, email: e.target.value }))}
                className="pl-11 h-12 text-base"
              />
            </div>

            {contact.customerType === 'contractor' && (
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Company Name (optional)"
                  value={contact.company}
                  onChange={(e) => setContact(p => ({ ...p, company: e.target.value }))}
                  className="pl-11 h-12 text-base"
                />
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-muted-foreground text-center">
            🔒 Your info is used only to provide service and scheduling.
          </p>

          {/* Save Button */}
          <Button
            type="button"
            variant="cta"
            size="lg"
            className="w-full h-14 text-base"
            onClick={handleSaveQuote}
            disabled={!canGoNext() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Save & Continue
              </>
            )}
          </Button>
        </div>
      )}

      {/* Step 2: Address */}
      {step === 'address' && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setStep('save')}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div>
            <h4 className="text-lg font-bold text-foreground mb-1">Delivery Address</h4>
            <p className="text-sm text-muted-foreground">
              Enter the complete street address for dumpster delivery
            </p>
          </div>

          <AddressInput
            initialZip={quoteSummary.zipCode}
            onAddressConfirmed={handleAddressConfirmed}
            value={address}
          />

          <Button
            type="button"
            variant="cta"
            size="lg"
            className="w-full h-14 text-base"
            onClick={() => setStep('pin')}
            disabled={!address}
          >
            Continue to Pin Location
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Step 3: Pin Location */}
      {step === 'pin' && address && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setStep('address')}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <Suspense fallback={<MapLoadingFallback />}>
            <PlacementMap
              addressLat={address.lat}
              addressLng={address.lng}
              onPlacementConfirmed={handlePlacementConfirmed}
              value={placement}
              yard={distanceInfo?.yard}
              distanceMiles={distanceInfo?.distanceMiles}
            />
          </Suspense>

          <Button
            type="button"
            variant="cta"
            size="lg"
            className="w-full h-14 text-base"
            onClick={() => setStep('continue')}
            disabled={!placement}
          >
            Continue to Checkout
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Step 4: Continue Order */}
      {step === 'continue' && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setStep('pin')}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h4 className="text-xl font-bold text-foreground mb-2">Ready to Book!</h4>
            <p className="text-muted-foreground">
              Your quote and delivery details are saved. Complete your order now.
            </p>
          </div>

          {/* Summary Card */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium text-foreground">{contact.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium text-foreground">{contact.phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dumpster</span>
              <span className="font-medium text-foreground">{quoteSummary.sizeLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Address</span>
              <span className="font-medium text-foreground text-right max-w-[200px] truncate">
                {address?.formattedAddress}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Placement</span>
              <span className="font-medium text-foreground capitalize">
                {placement?.placementType}
              </span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold text-foreground">Estimated Total</span>
              <span className="font-bold text-lg text-foreground">
                ${quoteSummary.estimatedMin}–${quoteSummary.estimatedMax}
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <Button
            type="button"
            variant="cta"
            size="lg"
            className="w-full h-14 text-base"
            onClick={handleContinueOrder}
          >
            <ExternalLink className="w-5 h-5" />
            Continue Order
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="gap-2"
              asChild
            >
              <a href={`sms:+15106802150?body=${encodeURIComponent(`Hi! I'd like to complete my dumpster booking:\n${quoteSummary.sizeLabel}\n${address?.formattedAddress}\n${contact.name} - ${contact.phone}`)}`}>
                💬 Text Us
              </a>
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
      )}
    </div>
  );
}
