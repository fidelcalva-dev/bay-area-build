import { useState } from 'react';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { CLEANUP_BRAND, BRAND_CLARIFICATION } from '@/config/cleanup/content';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield, Camera } from 'lucide-react';

const SERVICE_OPTIONS = [
  'Construction Cleanup',
  'Post-Construction / Final Cleanup',
  'Demolition Debris Cleanup',
  'Recurring Jobsite Cleanup',
  'Labor-Assisted Cleanup',
  'Material Pickup / Haul-Off',
  'Other / Not Sure',
];

const TIMELINE_OPTIONS = [
  'ASAP / Rush',
  'This week',
  'Next 1–2 weeks',
  'Planning ahead',
];

export default function CleanupQuote() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <CleanupLayout title="Thank You | Calsan C&D Waste Removal" description="Your cleanup quote request has been received.">
        <section className="py-16 md:py-24">
          <div className="max-w-lg mx-auto px-4 text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" />
            <h1 className="text-3xl font-extrabold text-foreground mb-4">Request Received</h1>
            <p className="text-muted-foreground mb-6">
              We'll review your project details and follow up with a recommendation and pricing as quickly as possible.
            </p>
            <p className="text-sm text-muted-foreground">
              During business hours (Mon–Sat, 6 AM – 9 PM PT), expect a response within 15 minutes.
            </p>
          </div>
        </section>
      </CleanupLayout>
    );
  }

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

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                    <input required className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Company Name</label>
                    <input className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Phone *</label>
                    <input required type="tel" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                    <input required type="email" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Project Address *</label>
                  <input required className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" placeholder="Street, City, ZIP" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Service Needed *</label>
                  <select required className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
                    <option value="">Select a service</option>
                    {SERVICE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Timeline Needed</label>
                  <select className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
                    <option value="">Select timeline</option>
                    {TIMELINE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Approximate Project Size (sqft)</label>
                  <input type="text" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" placeholder="e.g. 1,200 sqft" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Describe the Scope *</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm resize-y"
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
                  <select className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
                    <option value="phone">Phone</option>
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                <Button type="submit" size="lg" variant="cta" className="w-full text-base font-bold">
                  Submit Quote Request
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
