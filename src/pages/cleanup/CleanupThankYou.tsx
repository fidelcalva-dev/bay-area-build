import { Link } from 'react-router-dom';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone } from 'lucide-react';
import { CLEANUP_BRAND } from '@/config/cleanup/content';

export default function CleanupThankYou() {
  return (
    <CleanupLayout
      title="Thank You | Calsan C&D Waste Removal"
      description="Your cleanup quote request has been received. We will follow up shortly."
      noindex
    >
      <section className="py-16 md:py-24">
        <div className="max-w-lg mx-auto px-4 text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-foreground mb-4">Request Received</h1>
          <p className="text-muted-foreground mb-6">
            We'll review your project details and follow up with a recommendation and pricing as quickly as possible.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            During business hours (Mon–Sat, 6 AM – 9 PM PT), expect a response within 15 minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg" variant="outline">
              <a href={`tel:${CLEANUP_BRAND.phone}`}>
                <Phone className="w-4 h-4 mr-2" />
                Call Us Now
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/cleanup">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>
    </CleanupLayout>
  );
}
