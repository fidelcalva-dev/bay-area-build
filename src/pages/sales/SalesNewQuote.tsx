import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle, ChevronRight, ChevronLeft, Mail, Loader2, MessageCircle,
  MapPin, Package, Weight, Calendar, Users, Phone, Bookmark, Briefcase,
  Truck, Search, UserPlus, Link2, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { selectVendorForQuote, type VendorSelectionResult } from '@/lib/vendorSelection';
import type { QuoteFormData } from '@/components/quote/types';
import { DUMPSTER_SIZES, MATERIAL_TYPES, RENTAL_PERIODS, EXTRAS, OVERAGE_COST_PER_TON } from '@/components/quote/constants';
import { getPriceByZip } from '@/lib/price-list-data';
import { DUMPSTER_PHOTO_MAP } from '@/lib/canonicalDumpsterImages';
import { saveQuote } from '@/lib/vendorSelection';
import { Trash2, Mountain, HardHat } from 'lucide-react';

const DUMPSTER_IMAGES: Record<number, string> = DUMPSTER_PHOTO_MAP;

const INCLUDED_TONS: Record<number, number> = {
  5: 0.5, 8: 0.5, 10: 1, 20: 2, 30: 3, 40: 4, 50: 5,
};

// Sales-specific material options (5 choices mapping to underlying 'general' | 'heavy')
const SALES_MATERIAL_OPTIONS = [
  {
    key: 'general',
    materialValue: 'general' as const,
    label: 'General Debris',
    description: 'Household, furniture, wood, drywall',
    Icon: Trash2,
  },
  {
    key: 'clean_soil',
    materialValue: 'heavy' as const,
    label: 'Clean Soil',
    description: 'Clean fill dirt only — no debris',
    Icon: Mountain,
  },
  {
    key: 'clean_concrete',
    materialValue: 'heavy' as const,
    label: 'Clean Concrete',
    description: 'Clean concrete only — no rebar or debris',
    Icon: HardHat,
  },
  {
    key: 'mix_heavy',
    materialValue: 'heavy' as const,
    label: 'Mixed Heavy',
    description: 'Mix of concrete, dirt, brick, asphalt',
    Icon: HardHat,
  },
  {
    key: 'concrete_rebar',
    materialValue: 'heavy' as const,
    label: 'Concrete with Rebar',
    description: 'Concrete containing rebar — facility surcharge may apply',
    Icon: HardHat,
  },
];

const DELIVERY_PREFERENCES = [
  { value: 'specific_date', label: 'Specific Date', desc: 'Customer has a preferred delivery date' },
  { value: 'asap', label: 'ASAP / Earliest Available', desc: 'Needs delivery as soon as possible' },
  { value: 'flexible', label: 'Flexible — Any Day This Week', desc: 'Flexible on timing' },
  { value: 'call_to_confirm', label: 'Call to Confirm', desc: 'Wants a callback to decide' },
];

const CUSTOMER_TYPE_OPTIONS = [
  { value: 'homeowner', label: 'Homeowner', desc: 'Residential customer' },
  { value: 'contractor', label: 'Contractor', desc: 'Licensed contractor' },
  { value: 'commercial', label: 'Commercial', desc: 'Business / commercial account' },
];

const PLACEMENT_TYPES = [
  { value: 'driveway', label: 'Driveway' },
  { value: 'street', label: 'Street' },
  { value: 'yard', label: 'Yard / Dirt' },
  { value: 'alley', label: 'Alley' },
  { value: 'other', label: 'Other' },
];

type Step = 'zip' | 'material' | 'size' | 'options' | 'delivery' | 'contact' | 'success';

interface ZoneResult {
  zoneId: string;
  zoneName: string;
  cityName?: string;
  multiplier: number;
}

interface CustomerMatch {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
  billing_email: string | null;
}

export default function SalesNewQuote() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('zip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingZip, setIsCheckingZip] = useState(false);
  const [zoneResult, setZoneResult] = useState<ZoneResult | null>(null);
  const [vendorResult, setVendorResult] = useState<VendorSelectionResult | null>(null);
  const [sizeDbId, setSizeDbId] = useState<string | null>(null);
  const [salesMaterialKey, setSalesMaterialKey] = useState<string>('general');
  const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(null);
  const [heavyMaterialNotes, setHeavyMaterialNotes] = useState('');
  const [placementType, setPlacementType] = useState('');
  const [placementNotes, setPlacementNotes] = useState('');
  const [greenHalo, setGreenHalo] = useState(false);
  const [contaminationRisk, setContaminationRisk] = useState(false);

  // Customer linking
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerMatches, setCustomerMatches] = useState<CustomerMatch[]>([]);
  const [linkedCustomerId, setLinkedCustomerId] = useState<string | null>(null);
  const [linkedCustomerName, setLinkedCustomerName] = useState<string | null>(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // Delivery preference
  const [deliveryPref, setDeliveryPref] = useState('asap');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeWindow, setDeliveryTimeWindow] = useState('');
  const [driverNotes, setDriverNotes] = useState('');

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

  // Pre-fill from URL params (e.g., from lead)
  useEffect(() => {
    const leadId = searchParams.get('lead_id');
    const zip = searchParams.get('zip');
    if (zip) setFormData(prev => ({ ...prev, zip }));
    if (leadId) {
      // Fetch lead info to pre-fill
      supabase.from('sales_leads').select('*').eq('id', leadId).maybeSingle().then(({ data }) => {
        if (data) {
          setFormData(prev => ({
            ...prev,
            name: data.customer_name || prev.name,
            phone: data.customer_phone || prev.phone,
            email: data.customer_email || prev.email,
            zip: data.zip || prev.zip,
            address: data.address || prev.address,
          }));
        }
      });
    }
  }, [searchParams]);

  // Customer search
  const searchCustomers = useCallback(async (query: string) => {
    if (query.length < 2) { setCustomerMatches([]); return; }
    setIsSearchingCustomer(true);
    try {
      const { data } = await supabase
        .from('customers')
        .select('id, company_name, contact_name, phone, billing_email')
        .or(`contact_name.ilike.%${query}%,company_name.ilike.%${query}%,phone.ilike.%${query}%,billing_email.ilike.%${query}%`)
        .limit(5);
      setCustomerMatches(data || []);
    } catch { setCustomerMatches([]); }
    finally { setIsSearchingCustomer(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchCustomers(customerSearch), 300);
    return () => clearTimeout(timer);
  }, [customerSearch, searchCustomers]);

  const linkCustomer = (customer: CustomerMatch) => {
    setLinkedCustomerId(customer.id);
    setLinkedCustomerName(customer.contact_name || customer.company_name || 'Customer');
    setFormData(prev => ({
      ...prev,
      name: customer.contact_name || customer.company_name || prev.name,
      phone: customer.phone || prev.phone,
      email: customer.billing_email || prev.email,
    }));
    setCustomerSearch('');
    setCustomerMatches([]);
    toast({ title: 'Customer linked', description: `Linked to ${customer.contact_name || customer.company_name}` });
  };

  const unlinkCustomer = () => {
    setLinkedCustomerId(null);
    setLinkedCustomerName(null);
  };

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

  // Map salesMaterialKey to price-list material category
  const priceListMaterialCategory = useMemo(() => {
    switch (salesMaterialKey) {
      case 'clean_soil': return 'CLEAN_SOIL';
      case 'clean_concrete': return 'CLEAN_CONCRETE';
      case 'concrete_rebar': return 'CLEAN_CONCRETE'; // Same base pricing, facility surcharge added separately
      case 'mix_heavy': return 'MIX';
      default: return 'GENERAL';
    }
  }, [salesMaterialKey]);

  // Quote calculation — NO discounts, prices from official price list
  const quote = useMemo(() => {
    if (!zoneResult) return { lineItems: [], subtotal: 0, estimatedMin: 0, estimatedMax: 0, includedTons: 0, isValid: false };
    const lineItems: { label: string; subLabel?: string; amount: number; type: string }[] = [];
    const sizeData = DUMPSTER_SIZES.find((s) => s.value === formData.size);
    const material = MATERIAL_TYPES.find((m) => m.value === formData.material);
    const rental = RENTAL_PERIODS.find((r) => r.value === formData.rentalDays);
    if (!sizeData || !material || !rental) return { lineItems: [], subtotal: 0, estimatedMin: 0, estimatedMax: 0, includedTons: 0, isValid: false };

    const includedTons = INCLUDED_TONS[formData.size] || 1;

    const zipResult = getPriceByZip(formData.zip, formData.size, priceListMaterialCategory);
    const basePrice = zipResult.zipFound && zipResult.price > 0
      ? Math.round(zipResult.price)
      : Math.round(sizeData.basePrice * zoneResult.multiplier);

    lineItems.push({ label: `${sizeData.label} Dumpster`, subLabel: `${rental.label} rental • ${includedTons}T included`, amount: basePrice, type: 'base' });

    if (rental.extraCost > 0) {
      lineItems.push({ label: 'Extended Rental', subLabel: `+${rental.extraDays} extra days`, amount: rental.extraCost, type: 'addition' });
    }
    for (const extraSel of formData.extras) {
      const extra = EXTRAS.find((e) => e.id === extraSel.id);
      if (extra && extraSel.quantity > 0) {
        lineItems.push({ label: extra.label, subLabel: extraSel.quantity > 1 ? `${extraSel.quantity} × $${extra.price}` : extra.description, amount: extra.price * extraSel.quantity, type: 'addition' });
      }
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    return { lineItems, subtotal, estimatedMin: subtotal, estimatedMax: subtotal + Math.round(subtotal * 0.08), includedTons, isValid: true };
  }, [formData, zoneResult, priceListMaterialCategory]);

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
      case 'delivery': return deliveryPref === 'asap' || deliveryPref === 'flexible' || deliveryPref === 'call_to_confirm' || (deliveryPref === 'specific_date' && deliveryDate);
      default: return true;
    }
  }, [step, zoneResult, formData, deliveryPref, deliveryDate]);

  const goNext = () => {
    const nextSteps: Record<Step, Step> = { zip: 'material', material: 'size', size: 'options', options: 'delivery', delivery: 'contact', contact: 'success', success: 'success' };
    setStep(nextSteps[step]);
  };
  const goBack = () => {
    const prevSteps: Record<Step, Step> = { zip: 'zip', material: 'zip', size: 'material', options: 'size', delivery: 'options', contact: 'delivery', success: 'contact' };
    setStep(prevSteps[step]);
  };

  const handleSaveQuote = async (bookNow = false) => {
    if (!formData.name || !formData.phone || !formData.email) {
      toast({ title: 'Missing Information', description: 'Please fill in all contact fields', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await saveQuote({
        customerName: formData.name, customerEmail: formData.email, customerPhone: formData.phone,
        userType: formData.userType, zipCode: formData.zip, zoneId: zoneResult?.zoneId, sizeId: sizeDbId || undefined,
        materialType: formData.material, rentalDays: formData.rentalDays,
        extras: formData.extras.map((e) => `${e.id}:${e.quantity}`),
        subtotal: quote.subtotal, estimatedMin: quote.estimatedMin, estimatedMax: quote.estimatedMax,
        discountPercent: 0,
        selectedVendorId: vendorResult?.selectedVendor?.vendorId,
        vendorCost: vendorResult?.vendorCost || undefined, margin: vendorResult?.margin || undefined,
        isCalsanFulfillment: vendorResult?.isCalsanFulfillment ?? true,
      });
      if (result.success) {
        const quoteId = result.quoteId;
        setCreatedQuoteId(quoteId || null);

        // Update quote with delivery preference & customer link
        if (quoteId) {
          const updatePayload: Record<string, any> = {
            preferred_delivery_window: deliveryPref !== 'specific_date' ? deliveryPref : null,
            delivery_address: formData.address || null,
            material_class: salesMaterialKey,
          };
          if (deliveryPref === 'specific_date' && deliveryDate) {
            updatePayload.delivery_date = deliveryDate;
          }
          if (deliveryTimeWindow) {
            updatePayload.time_window = deliveryTimeWindow;
          }
          if (heavyMaterialNotes) {
            updatePayload.heavy_material_notes = heavyMaterialNotes;
          }
          if (driverNotes) {
            updatePayload.driver_notes = driverNotes;
          }
          if (linkedCustomerId) {
            updatePayload.customer_id = linkedCustomerId;
          }
          await supabase.from('quotes').update(updatePayload).eq('id', quoteId);
        }

        setStep('success');
        toast({ title: bookNow ? 'Quote Created!' : 'Quote Saved!', description: bookNow ? "Quote created successfully" : "Quote saved to the system" });
      } else throw new Error(result.error);
    } catch {
      toast({ title: 'Submission Error', description: 'Please try again', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
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
    { key: 'delivery', label: 'Delivery', icon: <Truck className="w-4 h-4" /> },
    { key: 'contact', label: 'Contact', icon: <Users className="w-4 h-4" /> },
  ];
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="max-w-xl mx-auto py-6 px-4 sm:px-0">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/sales/quotes')} className="mb-2">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Quotes
        </Button>
        <h1 className="text-2xl font-bold text-foreground">New Quote</h1>
        <p className="text-muted-foreground text-sm">Create a new customer quote</p>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-primary to-primary/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Sales Quote</h3>
              <p className="text-sm text-white/80">Standard pricing — no discounts</p>
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
                      step === s.key ? "bg-white text-primary" : i < stepIndex ? "bg-white/20 text-white hover:bg-white/30" : "bg-white/10 text-white/50"
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
                          <p className="font-semibold text-foreground">{zoneResult.cityName ? `${zoneResult.cityName} — We service this area` : "We service this area"}</p>
                          <p className="text-sm text-muted-foreground">{zoneResult.zoneName} • Same-day available</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Outside service area</p>
                          <p className="text-sm text-muted-foreground">This ZIP is not in our coverage zone</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <Button type="button" size="lg" className="w-full h-14 text-base" onClick={goNext} disabled={!canGoNext}>
                Continue <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Step 2: Material */}
          {step === 'material' && (
            <div className="space-y-5">
              <button type="button" onClick={goBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"><ChevronLeft className="w-4 h-4" />Back</button>
              <div>
                <h4 className="text-lg font-bold text-foreground mb-4">What is being disposed?</h4>
                <div className="grid gap-3">
                  {SALES_MATERIAL_OPTIONS.map((opt) => {
                    const isSelected = salesMaterialKey === opt.key;
                    return (
                      <button key={opt.key} type="button" onClick={() => { setSalesMaterialKey(opt.key); setFormData((prev) => ({ ...prev, material: opt.materialValue })); }}
                        className={cn("p-4 rounded-xl border-2 text-left transition-all", isSelected ? "border-primary bg-primary/5" : "border-input hover:border-primary/50")}>
                        <div className="flex items-start gap-3">
                          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", isSelected ? "bg-primary/10" : "bg-muted/80")}>
                            <opt.Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-foreground/70")} strokeWidth={2} />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-foreground">{opt.label}</h5>
                            <p className="text-sm text-muted-foreground">{opt.description}</p>
                          </div>
                          {isSelected && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button type="button" size="lg" className="w-full h-14 text-base" onClick={goNext}>
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
                    const includedTons = formData.material === 'heavy' ? 0 : (INCLUDED_TONS[size.value] || 1);
                    const image = DUMPSTER_IMAGES[size.value];
                    const zipResult = getPriceByZip(formData.zip, size.value, priceListMaterialCategory);
                    const price = zipResult.zipFound && zipResult.price > 0 ? Math.round(zipResult.price) : Math.round(size.basePrice * (zoneResult?.multiplier || 1));
                    return (
                      <button key={size.id} type="button" onClick={() => setFormData((prev) => ({ ...prev, size: size.value }))}
                        className={cn("relative p-3 rounded-xl border-2 text-left transition-all", formData.size === size.value ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-input hover:border-primary/50")}>
                        {size.popular && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">POPULAR</span>}
                        {image && <div className="aspect-[4/3] bg-muted/50 rounded-lg mb-2 p-2"><img src={image} alt={size.label} className="w-full h-full object-contain" /></div>}
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{size.value}</div>
                          <div className="text-xs text-muted-foreground uppercase">yard</div>
                          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-primary font-medium"><Weight className="w-3 h-3" />{includedTons}T</div>
                          <div className="mt-2 text-sm font-semibold text-foreground">${price}</div>
                        </div>
                        {formData.size === size.value && <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-primary-foreground" /></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button type="button" size="lg" className="w-full h-14 text-base" onClick={goNext}>
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
                      className={cn("relative py-3 px-2 rounded-xl border-2 text-center transition-all", formData.rentalDays === period.value ? "border-primary bg-primary/5" : "border-input hover:border-primary/50")}>
                      {period.popular && <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full">STD</span>}
                      <div className="text-lg font-bold text-foreground">{period.value}</div>
                      <div className="text-xs text-muted-foreground">days</div>
                      {period.extraCost > 0 && <div className="text-xs text-primary mt-1">+${period.extraCost}</div>}
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
                      <div key={extra.id} className={cn("p-3 rounded-xl border-2 transition-all", qty > 0 ? "border-primary bg-primary/5" : "border-input")}>
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
                            <button type="button" onClick={() => toggleExtra(extra.id, qty > 0 ? 0 : 1)} className={cn("w-7 h-7 rounded-lg flex items-center justify-center", qty > 0 ? "bg-primary text-primary-foreground" : "bg-muted")}>
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
                    <div><span className="text-foreground">{item.label}</span>{item.subLabel && <div className="text-xs text-muted-foreground">{item.subLabel}</div>}</div>
                    <span className="font-medium">${Math.abs(item.amount)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between items-center">
                  <span className="font-bold text-foreground">Estimated Total</span>
                  <span className="text-xl font-bold text-foreground">${quote.estimatedMin}<span className="text-sm font-medium text-muted-foreground">–${quote.estimatedMax}</span></span>
                </div>
              </div>
              <Button type="button" size="lg" className="w-full h-14 text-base" onClick={goNext}>
                Continue <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Step 5: Delivery Preference */}
          {step === 'delivery' && (
            <div className="space-y-5">
              <button type="button" onClick={goBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"><ChevronLeft className="w-4 h-4" />Back</button>
              <div>
                <h4 className="text-lg font-bold text-foreground mb-4">Delivery Preference</h4>
                <div className="grid gap-3">
                  {DELIVERY_PREFERENCES.map((pref) => (
                    <button key={pref.value} type="button" onClick={() => setDeliveryPref(pref.value)}
                      className={cn("p-4 rounded-xl border-2 text-left transition-all", deliveryPref === pref.value ? "border-primary bg-primary/5" : "border-input hover:border-primary/50")}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-foreground">{pref.label}</h5>
                          <p className="text-sm text-muted-foreground">{pref.desc}</p>
                        </div>
                        {deliveryPref === pref.value && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {deliveryPref === 'specific_date' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Preferred Date</label>
                  <Input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="h-12"
                  />
                </div>
              )}

              {/* Time Window */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Clock className="w-4 h-4 inline mr-1.5" />
                  Preferred Time Window
                </label>
                <Select value={deliveryTimeWindow} onValueChange={setDeliveryTimeWindow}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select time window..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8am–10am)</SelectItem>
                    <SelectItem value="midday">Midday (10am–12pm)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12pm–4pm)</SelectItem>
                    <SelectItem value="any">Any Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <MapPin className="w-4 h-4 inline mr-1.5" />
                  Job Site Address (optional)
                </label>
                <Input
                  type="text"
                  placeholder="Full delivery address..."
                  value={formData.address || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  className="h-12"
                />
              </div>

              {/* Driver Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Truck className="w-4 h-4 inline mr-1.5" />
                  Driver Notes (optional)
                </label>
                <Input
                  type="text"
                  placeholder="Gate code, placement instructions, etc."
                  value={driverNotes}
                  onChange={(e) => setDriverNotes(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Heavy material notes */}
              {formData.material === 'heavy' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Heavy Material Notes (optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Special mix details, unusual disposal notes..."
                    value={heavyMaterialNotes}
                    onChange={(e) => setHeavyMaterialNotes(e.target.value)}
                    className="h-12"
                  />
                </div>
              )}

              <Button type="button" size="lg" className="w-full h-14 text-base" onClick={goNext} disabled={!canGoNext}>
                Continue <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Step 6: Contact */}
          {step === 'contact' && (
            <div className="space-y-5">
              <button type="button" onClick={goBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"><ChevronLeft className="w-4 h-4" />Back</button>
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div><div className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success" />Sales Quote</div><div className="text-2xl font-bold text-foreground">${quote.estimatedMin}<span className="text-base font-medium text-muted-foreground">–${quote.estimatedMax}</span></div></div>
                  <div className="text-right"><div className="font-semibold text-foreground">{DUMPSTER_SIZES.find((s) => s.value === formData.size)?.label}</div><div className="text-sm text-muted-foreground">{formData.rentalDays} days</div></div>
                </div>
              </div>

              {/* Customer Search / Link */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Search className="w-4 h-4" /> Link Existing Customer
                </h4>
                {linkedCustomerId ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/30">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-success" />
                      <span className="font-medium text-foreground">{linkedCustomerName}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={unlinkCustomer} className="text-xs h-7">Unlink</Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, phone, or email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-9 h-10"
                    />
                    {isSearchingCustomer && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
                    {customerMatches.length > 0 && (
                      <div className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {customerMatches.map((c) => (
                          <button key={c.id} type="button" onClick={() => linkCustomer(c)}
                            className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors border-b border-border last:border-0">
                            <p className="text-sm font-medium">{c.contact_name || c.company_name}</p>
                            <p className="text-xs text-muted-foreground">{c.phone} · {c.billing_email}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Customer Information
                </h4>
                <div className="relative"><Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="text" placeholder="Customer Name / Company" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} className="pl-11 h-12 text-base" /></div>
                <div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} className="pl-11 h-12 text-base" /></div>
                <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} className="pl-11 h-12 text-base" /></div>
              </div>
              <div className="space-y-3 pt-2">
                <Button type="button" size="lg" className="w-full h-14 text-base gap-2" onClick={() => handleSaveQuote(true)} disabled={isSubmitting || !canGoNext}>
                  {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</> : <><CheckCircle className="w-5 h-5" />Create Quote</>}
                </Button>
                <Button type="button" variant="outline" className="w-full gap-1.5 h-11" onClick={() => handleSaveQuote(false)} disabled={!canGoNext || isSubmitting}>
                  <Bookmark className="w-4 h-4" /> Save as Draft
                </Button>
              </div>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-success" /></div>
              <h3 className="text-xl font-bold text-foreground mb-2">Quote Created!</h3>
              <p className="text-muted-foreground mb-6">The quote has been saved to the system.</p>
              <div className="bg-muted/50 rounded-xl p-4 text-left mb-6">
                <div className="text-sm text-muted-foreground mb-1">Quote Summary</div>
                <div className="flex justify-between items-center"><div className="font-semibold text-foreground">{DUMPSTER_SIZES.find((s) => s.value === formData.size)?.label}</div><div className="text-lg font-bold text-foreground">${quote.estimatedMin}–${quote.estimatedMax}</div></div>
                <div className="text-sm text-muted-foreground mt-1">{formData.rentalDays} days • ZIP {formData.zip}</div>
                <div className="text-sm text-muted-foreground">Delivery: {DELIVERY_PREFERENCES.find(p => p.value === deliveryPref)?.label}{deliveryPref === 'specific_date' && deliveryDate ? ` — ${deliveryDate}` : ''}</div>
                {linkedCustomerName && <div className="text-sm text-primary mt-1 flex items-center gap-1"><Link2 className="w-3 h-3" /> Linked to {linkedCustomerName}</div>}
              </div>
              <div className="flex gap-3">
                {createdQuoteId && (
                  <Button className="flex-1 gap-2" onClick={() => navigate(`/sales/quotes/${createdQuoteId}`)}>
                    Open Quote
                  </Button>
                )}
                <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate('/sales/quotes')}>
                  View All Quotes
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => { setStep('zip'); setFormData({ userType: 'homeowner', zip: '', material: 'general', size: 20, rentalDays: 7, extras: [], name: '', phone: '', email: '', address: '' }); setZoneResult(null); setCreatedQuoteId(null); setLinkedCustomerId(null); setLinkedCustomerName(null); setDeliveryPref('asap'); setDeliveryDate(''); }}>
                  New Quote
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
