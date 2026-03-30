import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { CLEANUP_BRAND, BRAND_CLARIFICATION } from '@/config/cleanup/content';
import { Button } from '@/components/ui/button';
import { Shield, Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SERVICE_OPTIONS = [
  'Construction Cleanup',
  'Post-Construction / Final Cleanup',
  'Demolition Debris Cleanup',
  'Recurring Jobsite Cleanup',
  'Labor-Assisted Cleanup',
  'Not Sure Yet',
];

const TIMELINE_OPTIONS = [
  'ASAP / Rush',
  'This week',
  'Next 1–2 weeks',
  'Planning ahead',
];

const CONTACT_METHOD_OPTIONS = [
  { value: 'phone', label: 'Phone' },
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
];

export default function CleanupQuote() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    service_type: searchParams.get('service') || '',
    timeline: '',
    approx_size: '',
    scope: '',
    contact_method: 'phone',
  });

  // Attribution (captured once on mount)
  const [attribution] = useState(() => ({
    source_page: typeof window !== 'undefined' ? window.location.pathname : '',
    source_channel: 'CLEANUP_WEBSITE',
    source_module: 'cleanup_quote_form',
    utm_source: searchParams.get('utm_source') || '',
    utm_medium: searchParams.get('utm_medium') || '',
    utm_campaign: searchParams.get('utm_campaign') || '',
    utm_term: searchParams.get('utm_term') || '',
    utm_content: searchParams.get('utm_content') || '',
    gclid: searchParams.get('gclid') || '',
    page_variant: 'cleanup_quote_v2',
  }));

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Build the message from scope + metadata
      const messageParts = [
        `Service: ${form.service_type}`,
        form.timeline ? `Timeline: ${form.timeline}` : '',
        form.approx_size ? `Size: ${form.approx_size}` : '',
        form.contact_method ? `Preferred contact: ${form.contact_method}` : '',
        '',
        form.scope,
      ].filter(Boolean).join('\n');

      const payload = {
        source_channel: attribution.source_channel,
        source_page: attribution.source_page,
        source_module: attribution.source_module,
        brand: 'CALSAN_CD_WASTE_REMOVAL',
        lead_intent: 'QUOTE_REQUEST',
        name: form.name,
        phone: form.phone,
        email: form.email,
        company_name: form.company_name || undefined,
        address: form.address,
        city: form.city,
        message: messageParts,
        project_type: 'construction_cleanup',
        customer_type: form.company_name ? 'contractor' : 'homeowner',
        utm_source: attribution.utm_source || undefined,
        utm_medium: attribution.utm_medium || undefined,
        utm_campaign: attribution.utm_campaign || undefined,
        utm_term: attribution.utm_term || undefined,
        utm_content: attribution.utm_content || undefined,
        gclid: attribution.gclid || undefined,
        landing_url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer_url: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
        raw_payload: {
          service_line: 'CLEANUP',
          brand: 'CALSAN_CD_WASTE_REMOVAL',
          cleanup_service_type: form.service_type,
          cleanup_timeline: form.timeline,
          project_scope: form.scope,
          approx_size: form.approx_size,
          contact_method: form.contact_method,
          contractor_flag: !!form.company_name,
          recurring_service_flag: form.service_type === 'Recurring Jobsite Cleanup',
        },
      };

      const { error } = await supabase.functions.invoke('lead-ingest', {
        body: payload,
      });

      if (error) throw error;

      navigate('/cleanup/thank-you');
    } catch (err) {
      console.error('Cleanup quote submission error:', err);
      toast.error('Something went wrong. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <CleanupLayout
      title="Request a Cleanup Quote | Calsan C&D Waste Removal"
      description="Get a construction cleanup quote in minutes. Send project details, location, and photos for the fastest scope review and recommendation."
    >
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Form */}
            <div className="md:col-span-3">
              <h1 className="text-3xl font-extrabold text-foreground mb-2">Request a Cleanup Quote</h1>
              <p className="text-muted-foreground mb-6">
                Tell us what kind of project you have, where it is located, and upload photos if available. We'll review the scope and follow up with the best next step.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Company Name</label>
                    <input
                      value={form.company_name}
                      onChange={(e) => updateField('company_name', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Phone *</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">Project Address *</label>
                    <input
                      required
                      value={form.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Street address"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">City *</label>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="e.g. Oakland"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Service Needed *</label>
                  <select
                    required
                    value={form.service_type}
                    onChange={(e) => updateField('service_type', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select a service</option>
                    {SERVICE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Timeline Needed</label>
                    <select
                      value={form.timeline}
                      onChange={(e) => updateField('timeline', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select timeline</option>
                      {TIMELINE_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Approximate Size (sqft)</label>
                    <input
                      type="text"
                      value={form.approx_size}
                      onChange={(e) => updateField('approx_size', e.target.value)}
                      placeholder="e.g. 1,200 sqft"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Describe the Scope *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.scope}
                    onChange={(e) => updateField('scope', e.target.value)}
                    className={`${inputClass} resize-y`}
                    placeholder="What kind of project, current condition, what needs to be cleaned or removed..."
                  />
                </div>
                <div id="photos">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <Camera className="w-4 h-4 inline mr-1" />
                    Upload Photos (recommended)
                  </label>
                  <input type="file" multiple accept="image/*" className="w-full text-sm" />
                  <p className="text-xs text-muted-foreground mt-1">Photos help us scope faster and provide better pricing.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Best Contact Method</label>
                  <select
                    value={form.contact_method}
                    onChange={(e) => updateField('contact_method', e.target.value)}
                    className={inputClass}
                  >
                    {CONTACT_METHOD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="cta"
                  className="w-full text-base font-bold"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit Quote Request'
                  )}
                </Button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-muted rounded-xl border border-border p-5">
                <h3 className="font-bold text-foreground mb-3">What to Send</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Project type and location</li>
                  <li>• Current site condition</li>
                  <li>• Approximate size</li>
                  <li>• Photos of the area (recommended)</li>
                  <li>• Timeline needs</li>
                  <li>• Any access challenges</li>
                </ul>
              </div>

              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> Our Commitment
                </h3>
                <p className="text-sm text-muted-foreground">
                  We review every request with a practical jobsite mindset and will recommend the best next step as quickly as possible.
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  {CLEANUP_BRAND.license} · Licensed Construction Cleanup
                </p>
              </div>

              <p className="text-xs text-muted-foreground">{BRAND_CLARIFICATION}</p>
            </div>
          </div>
        </div>
      </section>
    </CleanupLayout>
  );
}
