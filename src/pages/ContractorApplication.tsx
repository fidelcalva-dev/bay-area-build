import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HardHat, CheckCircle, ArrowRight, Phone, Loader2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BUSINESS_INFO } from '@/lib/seo';
import { Link } from 'react-router-dom';
import { PrivacyNoticeAtCollection } from '@/components/legal/PrivacyNoticeAtCollection';

const SERVICE_CITIES = [
  'Oakland', 'San Jose', 'San Francisco', 'Berkeley', 'Alameda',
  'San Leandro', 'Hayward', 'Fremont', 'Walnut Creek', 'Concord',
  'Pleasanton', 'Dublin', 'Livermore', 'Santa Clara', 'Sunnyvale', 'Mountain View',
];

const PROJECT_TYPE_OPTIONS = [
  'New Construction', 'Renovation / Remodel', 'Roofing', 'Demolition',
  'Landscaping / Excavation', 'Commercial Buildout', 'Multi-Family Cleanout', 'Other',
];

const DUMPSTER_SIZES = ['5 yd', '8 yd', '10 yd', '20 yd', '30 yd', '40 yd', '50 yd'];

const MATERIAL_OPTIONS = [
  'General Debris', 'Clean Concrete', 'Clean Soil', 'Mixed Soil',
  'Roofing Materials', 'Yard Waste', 'Mixed Construction',
];

const BILLING_OPTIONS = [
  { value: 'per_job', label: 'Pay Per Job' },
  { value: 'invoice', label: 'Monthly Invoice' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
];

export default function ContractorApplication() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceCities, setServiceCities] = useState<string[]>([]);
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [typicalSizes, setTypicalSizes] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [billingPreference, setBillingPreference] = useState('per_job');
  const [creditTerms, setCreditTerms] = useState('');
  const [notes, setNotes] = useState('');

  const toggleArray = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactName || !phone || !email) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contractor_applications').insert({
        company_name: companyName,
        contact_name: contactName,
        phone,
        email,
        service_cities: serviceCities,
        project_types: projectTypes,
        estimated_monthly_volume: monthlyVolume,
        typical_sizes: typicalSizes,
        materials_handled: materials,
        billing_preference: billingPreference,
        credit_terms_requested: creditTerms || null,
        notes: notes || null,
      });

      if (error) throw error;

      // Lead ingest — capture contractor application as a lead (non-blocking)
      supabase.functions.invoke('lead-ingest', {
        body: {
          source_channel: 'CONTRACTOR_APPLICATION',
          source_detail: 'contractor_application_form',
          source_page: '/contractor-application',
          source_module: 'contractor_application',
          brand: 'CALSAN_DUMPSTERS_PRO',
          lead_intent: 'CONTRACTOR_ACCOUNT',
          name: contactName,
          phone,
          email,
          company_name: companyName,
          customer_type: 'contractor',
          message: `Contractor application: ${companyName} | Volume: ${monthlyVolume} | Cities: ${serviceCities.join(', ')} | Sizes: ${typicalSizes.join(', ')}`,
          consent_status: 'TRANSACTIONAL',
          raw_payload: {
            service_line: 'DUMPSTER',
            contractor_flag: true,
            service_cities: serviceCities,
            project_types: projectTypes,
            monthly_volume: monthlyVolume,
            typical_sizes: typicalSizes,
            materials: materials,
            billing_preference: billingPreference,
            credit_terms: creditTerms,
          },
        },
      }).catch(err => console.warn('lead-ingest failed for contractor app (non-blocking):', err));

      setIsSubmitted(true);
      toast({ title: 'Application submitted successfully!' });
    } catch (err) {
      console.error('Error submitting application:', err);
      toast({ title: 'Failed to submit application. Please try again or call us.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout
        title="Application Received | Calsan Dumpsters Pro"
        description="Your contractor account application has been received."
        canonical="/contractor-application"
      >
        <section className="py-16 md:py-24 bg-background">
          <div className="container-narrow text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="heading-lg text-foreground mb-4">Application Received</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Thank you! Our team will review your application and contact you within 1–2 business days to discuss your account setup.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/quote">
                  Get a Quote Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us: {BUSINESS_INFO.phone.salesFormatted}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout
      title="Contractor Account Application | Calsan Dumpsters Pro"
      description="Apply for a contractor or commercial dumpster rental account. Priority dispatch, volume pricing, and dedicated support for Bay Area construction professionals."
      canonical="/contractor-application"
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-10 md:py-14">
        <div className="container-narrow text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 rounded-full text-sm mb-4">
            <HardHat className="w-4 h-4" />
            Contractor & Commercial Accounts
          </div>
          <h1 className="heading-lg mb-3">Apply for a Contractor Account</h1>
          <p className="text-lg text-primary-foreground/85 max-w-lg mx-auto">
            Get priority dispatch, dedicated support, and volume pricing for your construction projects across the Bay Area.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-10 md:py-14 bg-background">
        <div className="container-narrow max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Primary Contact Name *</Label>
                    <Input id="contactName" value={contactName} onChange={e => setContactName(e.target.value)} required />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="mb-2 block">Service Cities (select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_CITIES.map(city => (
                      <Badge
                        key={city}
                        variant={serviceCities.includes(city) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArray(serviceCities, city, setServiceCities)}
                      >
                        {city}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Project Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_TYPE_OPTIONS.map(pt => (
                      <Badge
                        key={pt}
                        variant={projectTypes.includes(pt) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArray(projectTypes, pt, setProjectTypes)}
                      >
                        {pt}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="monthlyVolume">Estimated Monthly Volume</Label>
                  <Select value={monthlyVolume} onValueChange={setMonthlyVolume}>
                    <SelectTrigger><SelectValue placeholder="How many dumpsters per month?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">1–3 per month</SelectItem>
                      <SelectItem value="4-10">4–10 per month</SelectItem>
                      <SelectItem value="11-25">11–25 per month</SelectItem>
                      <SelectItem value="25+">25+ per month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Typical Dumpster Sizes</Label>
                  <div className="flex flex-wrap gap-2">
                    {DUMPSTER_SIZES.map(s => (
                      <Badge
                        key={s}
                        variant={typicalSizes.includes(s) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArray(typicalSizes, s, setTypicalSizes)}
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Materials Handled</Label>
                  <div className="flex flex-wrap gap-2">
                    {MATERIAL_OPTIONS.map(m => (
                      <Badge
                        key={m}
                        variant={materials.includes(m) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArray(materials, m, setMaterials)}
                      >
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Billing Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="billing">Preferred Billing Method</Label>
                  <Select value={billingPreference} onValueChange={setBillingPreference}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BILLING_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="creditTerms">Credit Terms Requested (optional)</Label>
                  <Input
                    id="creditTerms"
                    value={creditTerms}
                    onChange={e => setCreditTerms(e.target.value)}
                    placeholder="e.g., Net 30, PO-based billing"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Anything else we should know about your business or project needs?"
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <PrivacyNoticeAtCollection variant="compact" />

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full h-14 text-base font-bold" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Application
                </>
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Prefer to talk? Call us at{' '}
              <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="text-primary font-semibold">
                {BUSINESS_INFO.phone.salesFormatted}
              </a>
            </p>
          </form>
        </div>
      </section>
    </Layout>
  );
}
