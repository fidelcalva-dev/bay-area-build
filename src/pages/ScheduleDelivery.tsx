import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Truck, MapPin, ArrowRight, Calendar as CalendarIcon, Phone,
  MessageSquare, Zap, CalendarDays, Loader2, CheckCircle, Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BUSINESS_INFO } from '@/lib/seo';
import { GENERAL_DEBRIS_SIZES, HEAVY_MATERIAL } from '@/config/pricingConfig';

const PROJECT_TYPES = [
  { value: 'home-cleanout', label: 'Home Cleanout' },
  { value: 'kitchen-remodel', label: 'Kitchen Remodel' },
  { value: 'roof-replacement', label: 'Roofing Debris' },
  { value: 'construction-debris', label: 'Construction Debris' },
  { value: 'garage-cleanout', label: 'Garage Cleanout' },
  { value: 'estate-cleanout', label: 'Estate Cleanout' },
  { value: 'yard-cleanup', label: 'Yard Cleanup' },
  { value: 'concrete-soil', label: 'Concrete / Soil Removal' },
];

const ALL_SIZES = [5, 8, 10, 20, 30, 40, 50];

const SCHEDULE_PREFERENCES = [
  { id: 'pick_date', label: 'Pick a Date', icon: CalendarIcon, desc: 'Choose your preferred delivery date' },
  { id: 'asap', label: 'ASAP / Earliest Available', icon: Zap, desc: 'We\'ll schedule the soonest open slot' },
  { id: 'flexible', label: 'I\'m Flexible', icon: CalendarDays, desc: 'Any day that works for your area' },
  { id: 'call_me', label: 'Call Me to Confirm', icon: Phone, desc: 'Our team will reach out to schedule' },
];

function toLocalISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ScheduleDelivery() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 - Location
  const [address, setAddress] = useState(searchParams.get('address') || '');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState(searchParams.get('zip') || '');

  // Step 2 - Project
  const [projectType, setProjectType] = useState('');
  const [size, setSize] = useState('');
  const [material, setMaterial] = useState('general');

  // Step 3 - Schedule
  const [schedulePref, setSchedulePref] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Step 4 - Contact
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const canProceed = useCallback(() => {
    switch (step) {
      case 1: return address.length > 3 && zip.length === 5;
      case 2: return projectType !== '';
      case 3: return schedulePref !== '' && (schedulePref !== 'pick_date' || selectedDate);
      case 4: return name.length > 1 && phone.length >= 7;
      default: return false;
    }
  }, [step, address, zip, projectType, schedulePref, selectedDate, name, phone]);

  const isDisabledDate = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date < tomorrow;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create lead via lead-ingest
      const leadPayload = {
        source: 'schedule_delivery',
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        zip_code: zip,
        delivery_address: `${address}${city ? ', ' + city : ''}, CA ${zip}`,
        project_type: projectType,
        selected_size: size ? parseInt(size) : null,
        material_type: material === 'heavy' ? 'clean_soil' : 'general_debris',
        delivery_preference: schedulePref,
        preferred_date: schedulePref === 'pick_date' && selectedDate ? toLocalISO(selectedDate) : null,
        notes: notes || null,
        status: 'new',
        priority: schedulePref === 'asap' ? 'high' : 'normal',
      };

      const { error } = await supabase.functions.invoke('lead-ingest', {
        body: {
          ...leadPayload,
          event_type: 'schedule_request',
        },
      });

      if (error) throw error;

      toast({ title: 'Delivery request submitted!' });
      navigate('/thank-you?source=schedule');
    } catch (err: any) {
      // Fallback: insert directly into sales_leads
      try {
        await supabase.from('sales_leads').insert({
          source: 'schedule_delivery',
          customer_name: name,
          customer_phone: phone,
          customer_email: email || null,
          zip_code: zip,
          status: 'new',
          notes: `Schedule request: ${projectType}, ${size || 'undecided'}yd, ${material}, pref: ${schedulePref}${schedulePref === 'pick_date' && selectedDate ? ', date: ' + toLocalISO(selectedDate) : ''}. Address: ${address} ${city} ${zip}. ${notes}`,
        });
        toast({ title: 'Delivery request submitted!' });
        navigate('/thank-you?source=schedule');
      } catch {
        toast({ title: 'Something went wrong', description: 'Please call us to schedule.', variant: 'destructive' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSizes = material === 'heavy' ? [5, 8, 10] : ALL_SIZES;

  return (
    <Layout
      title="Schedule Dumpster Delivery | Calsan Dumpsters Pro"
      description="Schedule your dumpster delivery in the Bay Area. Pick your date, size, and project type. Same-day and next-day delivery available."
      canonical="/schedule-delivery"
    >
      <div className="min-h-screen bg-muted/30 py-8 md:py-12">
        <div className="container-wide max-w-2xl mx-auto px-4">
          {/* Progress */}
          <div className="flex items-center justify-between mb-8">
            {['Location', 'Project', 'Schedule', 'Contact'].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                  step > i + 1 ? 'bg-primary text-primary-foreground' :
                  step === i + 1 ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                )}>
                  {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs font-medium text-muted-foreground hidden sm:inline">{label}</span>
                {i < 3 && <div className="w-8 sm:w-12 h-0.5 bg-border mx-1" />}
              </div>
            ))}
          </div>

          {/* Step 1: Location */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Where should we deliver?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Street Address</Label>
                  <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>City</Label>
                    <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Oakland" />
                  </div>
                  <div>
                    <Label>ZIP Code</Label>
                    <Input value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="94601" inputMode="numeric" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Project */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Tell us about your project
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Project Type</Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger><SelectValue placeholder="Select project type" /></SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Material Type</Label>
                  <Select value={material} onValueChange={(v) => { setMaterial(v); if (v === 'heavy' && parseInt(size) > 10) setSize(''); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Debris</SelectItem>
                      <SelectItem value="heavy">Heavy Material (Soil / Concrete)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dumpster Size</Label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <button
                      onClick={() => setSize('')}
                      className={cn(
                        'p-3 rounded-xl border text-sm font-medium transition-all',
                        !size ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                      )}
                    >
                      Help me choose
                    </button>
                    {availableSizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSize(String(s))}
                        className={cn(
                          'p-3 rounded-xl border text-sm font-medium transition-all',
                          size === String(s) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                        )}
                      >
                        {s} yd
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  When do you need it?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {SCHEDULE_PREFERENCES.map(pref => {
                    const Icon = pref.icon;
                    return (
                      <button
                        key={pref.id}
                        onClick={() => setSchedulePref(pref.id)}
                        className={cn(
                          'p-4 rounded-xl border text-left transition-all',
                          schedulePref === pref.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/30'
                        )}
                      >
                        <Icon className={cn('w-5 h-5 mb-2', schedulePref === pref.id ? 'text-primary' : 'text-muted-foreground')} />
                        <div className="text-sm font-semibold text-foreground">{pref.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{pref.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {schedulePref === 'pick_date' && (
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={isDisabledDate}
                      className="rounded-xl border border-border"
                    />
                  </div>
                )}

                {schedulePref === 'asap' && (
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" /> We'll find the earliest available slot for your area
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Contact */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Your contact information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(510) 555-0123" type="tel" />
                </div>
                <div>
                  <Label>Email (optional)</Label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" type="email" />
                </div>
                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Gate code, access instructions, placement preference..."
                    rows={3}
                  />
                </div>

                {/* Summary */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Request Summary</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Location:</strong> {address}{city && `, ${city}`}, CA {zip}</p>
                    <p><strong>Project:</strong> {PROJECT_TYPES.find(t => t.value === projectType)?.label}</p>
                    <p><strong>Size:</strong> {size ? `${size} yd` : 'Help me choose'} · {material === 'heavy' ? 'Heavy Material' : 'General Debris'}</p>
                    <p><strong>Schedule:</strong> {SCHEDULE_PREFERENCES.find(p => p.id === schedulePref)?.label}{schedulePref === 'pick_date' && selectedDate ? ` — ${selectedDate.toLocaleDateString()}` : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Truck className="w-4 h-4 mr-2" />}
                Submit Delivery Request
              </Button>
            )}
          </div>

          {/* Support fallback */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground mb-2">Prefer to schedule by phone?</p>
            <div className="flex justify-center gap-4">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="inline-flex items-center gap-1.5 text-sm text-primary font-medium">
                <Phone className="w-3.5 h-3.5" /> Call {BUSINESS_INFO.phone.salesFormatted}
              </a>
              <a href={`sms:${BUSINESS_INFO.phone.sales}`} className="inline-flex items-center gap-1.5 text-sm text-primary font-medium">
                <MessageSquare className="w-3.5 h-3.5" /> Text Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
