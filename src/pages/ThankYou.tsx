import { useLocation, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, ArrowRight } from 'lucide-react';

const QUOTE_URL = '/quote';

export default function ThankYou() {
  const location = useLocation();
  const { formData, estimate, type } = location.state || {};

  return (
    <Layout title="Thank You | Request Received">
      <section className="section-padding bg-background min-h-[70vh] flex items-center">
        <div className="container-narrow">
          <div className="text-center">
            {/* Success Icon */}
            <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-success/10 text-success mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h1 className="heading-xl text-foreground mb-4">Thank You!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              {type === 'replacement'
                ? 'Your pickup/replacement request has been received. We\'ll contact you shortly to confirm.'
                : 'Your quote request has been received. We\'ll reach out within 15 minutes during business hours (6AM–9PM daily). After-hours messages will be answered first thing next business window.'}
            </p>

            {/* Estimate Display */}
            {estimate && (
              <div className="bg-card rounded-2xl border border-border p-6 mb-8 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground mb-2">Your Estimated Price</p>
                <div className="text-4xl font-extrabold text-primary mb-2">
                  ${estimate.min} - ${estimate.max}
                </div>
                <p className="text-sm text-muted-foreground">
                  Final price confirmed after we verify your delivery address
                </p>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-muted rounded-2xl p-6 mb-8 max-w-lg mx-auto text-left">
              <h3 className="font-bold text-foreground mb-4">What Happens Next?</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">1</span>
                  <span className="text-muted-foreground">We'll review your request and check availability</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">2</span>
                  <span className="text-muted-foreground">A team member will call or text you to confirm details</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">3</span>
                  <span className="text-muted-foreground">Once confirmed, we'll schedule your delivery</span>
                </li>
              </ol>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button asChild variant="cta" size="lg">
                <Link to={QUOTE_URL}>
                  Get Another Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="tel:+15106802150">
                  <Phone className="w-4 h-4" />
                  Call (510) 680-2150
                </a>
              </Button>
            </div>

            <p className="text-muted-foreground">
              <Link to="/" className="text-primary hover:underline">
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
