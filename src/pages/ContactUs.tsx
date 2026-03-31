import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, MessageCircle, Send } from 'lucide-react';
import { BUSINESS_INFO, generateBreadcrumbSchema } from '@/lib/seo';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { validateAndFormatPhone } from '@/lib/phoneUtils';

const WASTE_TYPES = [
  'Household Junk',
  'Furniture / Bulk Items',
  'Construction Debris',
  'Roofing Shingles',
  'Concrete / Heavy Material',
  'Yard Waste',
  'Mixed Remodel Debris',
  'Other',
];

const DUMPSTER_SIZES = [
  '5 Yard',
  '8 Yard',
  '10 Yard',
  '20 Yard',
  '30 Yard',
  '40 Yard',
  '50 Yard',
  'Not sure — help me choose',
];

export default function ContactUs() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    postalCode: '',
    wasteType: '',
    size: '',
  });
  const [smsConsent, setSmsConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const phoneValidation = form.phone ? validateAndFormatPhone(form.phone) : null;
  const phoneError = form.phone && phoneValidation && !phoneValidation.valid ? phoneValidation.error : null;

  const canSubmit =
    form.name.trim() &&
    form.phone.trim() &&
    form.email.trim() &&
    form.city.trim() &&
    form.postalCode.trim() &&
    form.wasteType &&
    form.size &&
    smsConsent &&
    termsConsent &&
    (!phoneValidation || phoneValidation.valid) &&
    !submitting;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const sizeNum = form.size.match(/(\d+)/)?.[1];
      const { error } = await supabase.functions.invoke('lead-ingest', {
        body: {
          source_channel: 'CONTACT_FORM',
          source_page: '/contact-us',
          source_module: 'contact_us_form',
          brand: 'CALSAN_DUMPSTERS_PRO',
          lead_intent: 'CONTACT_REQUEST',
          name: form.name.trim(),
          phone: phoneValidation?.formatted || form.phone.trim(),
          email: form.email.trim(),
          city: form.city.trim(),
          zip: form.postalCode.trim(),
          material_category: form.wasteType,
          size_preference: form.size,
          selected_size: sizeNum ? Number(sizeNum) : undefined,
          consent_status: 'OPTED_IN',
          last_step_completed: 'contact_captured',
          raw_payload: { service_line: 'DUMPSTER' },
        },
      });

      if (error) throw error;

      toast({
        title: 'Quote request sent!',
        description: "We'll get back to you shortly.",
      });
      setForm({ name: '', phone: '', email: '', city: '', postalCode: '', wasteType: '', size: '' });
      setSmsConsent(false);
      setTermsConsent(false);
    } catch {
      toast({ title: 'Something went wrong', description: 'Please try again or call us.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact-us' },
  ]);
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Calsan Dumpsters Pro",
    "url": `${BUSINESS_INFO.url}/contact-us`,
    "mainEntity": { "@type": "LocalBusiness", "@id": `${BUSINESS_INFO.url}/#organization` },
  };

  return (
    <Layout
      title="Contact Us | Calsan Dumpsters Pro"
      description="Get in touch with Calsan Dumpsters Pro for dumpster rental in the Bay Area. Call, text, or request a quote online."
      canonical="/contact-us"
      schema={[contactSchema, breadcrumbSchema]}
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container-wide text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Contact Us</h1>
          <p className="text-lg md:text-xl text-primary-foreground/85 max-w-2xl mx-auto">
            Ready to rent a dumpster? Call, text, or fill out the form below and we'll get you an exact price fast.
          </p>
        </div>
      </section>

      {/* Call & Text buttons */}
      <section className="py-8 bg-background">
        <div className="container-wide max-w-md mx-auto flex gap-4">
          <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="flex-1">
            <Button variant="default" size="lg" className="w-full rounded-xl text-base font-semibold gap-2">
              <Phone className="w-5 h-5" />
              Call Us
            </Button>
          </a>
          <a href={`sms:${BUSINESS_INFO.phone.sales}`} className="flex-1">
            <Button variant="outline" size="lg" className="w-full rounded-xl text-base font-semibold gap-2 border-primary text-primary hover:bg-primary/5">
              <MessageCircle className="w-5 h-5" />
              Send SMS
            </Button>
          </a>
        </div>
      </section>

      {/* Quote Form */}
      <section className="pb-16 pt-4 bg-background">
        <div className="container-wide max-w-lg mx-auto">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Get a Quote</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="cu-name">Name <span className="text-destructive">*</span></Label>
                <Input id="cu-name" placeholder="Your full name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} maxLength={100} required />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="cu-phone">Phone <span className="text-destructive">*</span></Label>
                <Input id="cu-phone" type="tel" placeholder="(555) 123-4567" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} maxLength={15} required />
                {phoneError && <p className="text-destructive text-xs mt-1">{phoneError}</p>}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="cu-email">Email <span className="text-destructive">*</span></Label>
                <Input id="cu-email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => handleChange('email', e.target.value)} maxLength={255} required />
              </div>

              {/* City */}
              <div>
                <Label htmlFor="cu-city">City <span className="text-destructive">*</span></Label>
                <Input id="cu-city" placeholder="e.g. Oakland" value={form.city} onChange={(e) => handleChange('city', e.target.value)} maxLength={100} required />
              </div>

              {/* Postal Code */}
              <div>
                <Label htmlFor="cu-zip">Postal Code <span className="text-destructive">*</span></Label>
                <Input id="cu-zip" placeholder="e.g. 94606" value={form.postalCode} onChange={(e) => handleChange('postalCode', e.target.value)} maxLength={10} required />
              </div>

              {/* Waste Type */}
              <div>
                <Label htmlFor="cu-waste">What type of waste do you need the dumpster for? <span className="text-destructive">*</span></Label>
                <select
                  id="cu-waste"
                  value={form.wasteType}
                  onChange={(e) => handleChange('wasteType', e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                >
                  <option value="">Select waste type…</option>
                  {WASTE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div>
                <Label htmlFor="cu-size">What size do you need? <span className="text-destructive">*</span></Label>
                <select
                  id="cu-size"
                  value={form.size}
                  onChange={(e) => handleChange('size', e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                >
                  <option value="">Select size…</option>
                  {DUMPSTER_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Consent checkboxes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="cu-sms"
                    checked={smsConsent}
                    onCheckedChange={(v) => setSmsConsent(v === true)}
                  />
                  <Label htmlFor="cu-sms" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                    By checking, you are allowing to receive promotional/marketing SMS communications from Calsan Dumpsters Pro. Frequency may vary. Message and data rates may apply, reply HELP for help or STOP to opt-out.
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="cu-terms"
                    checked={termsConsent}
                    onCheckedChange={(v) => setTermsConsent(v === true)}
                  />
                  <Label htmlFor="cu-terms" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                    By checking, I accept{' '}
                    <Link to="/terms" className="text-primary underline">Terms Of Service</Link>{' '}
                    &amp;{' '}
                    <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>
                  </Label>
                </div>
              </div>

              {/* Privacy Notice */}
              <PrivacyNoticeAtCollection variant="compact" className="pt-1" />

              {/* Submit */}
              <Button type="submit" size="lg" disabled={!canSubmit} className="w-full rounded-xl font-semibold text-base gap-2 mt-2">
                <Send className="w-4 h-4" />
                {submitting ? 'Sending…' : 'Send'}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
