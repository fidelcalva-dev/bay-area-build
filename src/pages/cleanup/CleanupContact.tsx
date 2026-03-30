import { useState } from 'react';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { CLEANUP_BRAND, BRAND_CLARIFICATION } from '@/config/cleanup/content';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, FileText, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function CleanupContact() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    message: '',
  });

  const updateField = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('lead-ingest', {
        body: {
          source_channel: 'CLEANUP_CONTACT',
          source_page: '/cleanup/contact',
          source_module: 'cleanup_contact_form',
          brand: 'CALSAN_CD_WASTE_REMOVAL',
          lead_intent: 'CONTACT_REQUEST',
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          city: form.city || undefined,
          message: form.message || undefined,
          consent_status: 'TRANSACTIONAL',
          raw_payload: {
            service_line: 'CLEANUP',
            brand: 'CALSAN_CD_WASTE_REMOVAL',
          },
        },
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Cleanup contact error:', err);
      toast.error('Something went wrong. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <CleanupLayout
      title="Contact Calsan C&D Waste Removal | Construction Cleanup"
      description="Contact Calsan C&D Waste Removal for construction cleanup, post-construction cleanup, and recurring jobsite service in Oakland, Alameda, and the Bay Area."
    >
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl mb-10">
            Tell us about your project and we'll help you choose the right cleanup service.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Send Us a Message</h2>

              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Message Received</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll review your request and follow up shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                    <input required value={form.name} onChange={e => updateField('name', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Phone *</label>
                    <input required type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                    <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">City</label>
                    <input value={form.city} onChange={e => updateField('city', e.target.value)} placeholder="e.g. Oakland" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">How can we help?</label>
                    <textarea rows={4} value={form.message} onChange={e => updateField('message', e.target.value)} placeholder="Describe your project or question..." className={`${inputClass} resize-y`} />
                  </div>
                  <Button type="submit" size="lg" variant="cta" className="w-full" disabled={submitting}>
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</> : 'Send Message'}
                  </Button>
                </form>
              )}

              <div className="mt-6 space-y-3">
                <a href={`tel:${CLEANUP_BRAND.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Phone className="w-4 h-4" /> {CLEANUP_BRAND.phone}
                </a>
                <a href={`mailto:${CLEANUP_BRAND.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Mail className="w-4 h-4" /> {CLEANUP_BRAND.email}
                </a>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" /> Oakland, Alameda & Bay Area
                </div>
              </div>
            </div>

            {/* Dumpster Crossover */}
            <div className="space-y-6">
              <div className="bg-muted rounded-xl border border-border p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Dumpster Rentals</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Dumpster rentals are handled through our sister brand, Calsan Dumpsters Pro.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <a href={CLEANUP_BRAND.legacy_url} target="_blank" rel="noopener noreferrer">
                    Visit Calsan Dumpsters Pro →
                  </a>
                </Button>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Need a Quote Instead?
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  For a detailed cleanup quote with scope, photos, and timeline, use our quote request form.
                </p>
                <Button asChild className="w-full">
                  <a href="/cleanup/quote">Request a Cleanup Quote →</a>
                </Button>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8">{BRAND_CLARIFICATION}</p>
        </div>
      </section>
    </CleanupLayout>
  );
}
