import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RefreshCw, ArrowRight, Phone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { logCrmError } from '@/lib/crmErrorLogger';
import { BUSINESS_INFO } from '@/lib/seo';

export function ReplacementForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hardError, setHardError] = useState(false);
  
  const [smsConsent, setSmsConsent] = useState(false);
  const [legalConsent, setLegalConsent] = useState(false);

  const [formData, setFormData] = useState({
    address: '',
    dumpsterNumber: '',
    requestType: 'pickup',
    desiredDate: '',
    notes: '',
    name: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => ({
    source_channel: 'WEBSITE_CONTACT',
    source_detail: 'replacement_pickup_form',
    name: formData.name.trim(),
    phone: formData.phone.trim(),
    address: formData.address.trim(),
    notes: [
      `Request: ${formData.requestType}`,
      formData.desiredDate ? `Desired date: ${formData.desiredDate}` : '',
      formData.dumpsterNumber ? `Dumpster #: ${formData.dumpsterNumber}` : '',
      formData.notes || '',
    ].filter(Boolean).join(' | '),
    consent_status: 'FORM_SUBMIT',
    created_from_page: location.pathname,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setHardError(false);

    const payload = buildPayload();

    try {
      // Step 1: Try lead-ingest
      const { error } = await supabase.functions.invoke('lead-ingest', { body: payload });
      if (error) throw error;
      navigate('/thank-you', { state: { formData, type: 'replacement' } });
    } catch (ingestErr) {
      console.error('lead-ingest failed, attempting fallback queue:', ingestErr);
      try {
        // Step 2: Fallback queue
        const { error: fbError } = await (supabase.from('lead_fallback_queue' as any) as any)
          .insert({
            payload_json: payload,
            source: 'replacement_pickup_form',
            status: 'pending',
            retry_count: 0,
          });
        if (fbError) throw fbError;
        navigate('/thank-you', { state: { formData, type: 'replacement', fallback: true } });
      } catch (fallbackErr) {
        // Step 3: Hard failure — show inline error + log to crm_errors
        console.error('Fallback queue also failed:', fallbackErr);
        logCrmError({
          action: 'LEAD_CAPTURE_HARD_FAILURE',
          error_message: fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error',
          error_detail: { payload, ingest_error: String(ingestErr), fallback_error: String(fallbackErr) },
          entity_type: 'lead',
          source_page: location.pathname,
        });
        setHardError(true);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
          <RefreshCw className="w-6 h-6" />
        </div>
        <div>
          <h3 className="heading-sm text-foreground">Replacement / Pickup Request</h3>
          <p className="text-sm text-muted-foreground">Already have a dumpster? Request service here.</p>
        </div>
      </div>

      {hardError && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">We had trouble submitting your request.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please try again or call us now at{' '}
              <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="text-primary font-semibold hover:underline">
                {BUSINESS_INFO.phone.salesFormatted}
              </a>
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Service Address *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Address where dumpster is located"
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Request Type *
            </label>
            <select
              name="requestType"
              value={formData.requestType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            >
              <option value="pickup">Final Pickup</option>
              <option value="swap">Swap (Empty & Return)</option>
              <option value="replacement">Full Replacement</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Desired Date *
            </label>
            <input
              type="date"
              name="desiredDate"
              value={formData.desiredDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Dumpster # (if known)
          </label>
          <input
            type="text"
            name="dumpsterNumber"
            value={formData.dumpsterNumber}
            onChange={handleChange}
            placeholder="Found on the side of your dumpster"
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Any special instructions..."
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Consent Checkboxes */}
        <div className="space-y-3 pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary/30 shrink-0"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              By checking, you are allowing to receive promotional/marketing SMS communications from Calsan Dumpsters Pro. Frequency may vary. Message and data rates may apply, reply HELP for help or STOP to opt-out.
            </span>
          </label>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={legalConsent}
              onChange={(e) => setLegalConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary/30 shrink-0"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              By checking, I accept{' '}
              <a href="/terms" className="text-primary underline hover:text-primary/80">Terms Of Service</a>
              {' & '}
              <a href="/privacy" className="text-primary underline hover:text-primary/80">Privacy Policy</a>
            </span>
          </label>
        </div>

        <Button type="submit" variant="default" size="lg" className="w-full" disabled={isSubmitting || !smsConsent || !legalConsent}>
          {isSubmitting ? 'Submitting...' : hardError ? 'Try Again' : 'Submit Request'}
          <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Pickup typically scheduled within 1-3 business days
        </p>
      </form>
    </div>
  );
}
