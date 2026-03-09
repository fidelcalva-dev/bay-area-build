import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export function ReplacementForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create lead via lead-ingest for CRM visibility
      await supabase.functions.invoke('lead-ingest', {
        body: {
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
        },
      });

      navigate('/thank-you', { state: { formData, type: 'replacement' } });
    } catch (err) {
      console.error('Lead ingest error:', err);
      // Still navigate on failure — non-blocking for UX
      navigate('/thank-you', { state: { formData, type: 'replacement' } });
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

        <Button type="submit" variant="default" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
          <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Pickup typically scheduled within 1-3 business days
        </p>
      </form>
    </div>
  );
}
