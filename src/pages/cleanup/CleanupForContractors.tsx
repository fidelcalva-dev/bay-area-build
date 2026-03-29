import { Link } from 'react-router-dom';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const CONTRACTOR_NEEDS = [
  'Phase cleanup between trades',
  'Final cleanup before walkthroughs',
  'Recurring support for long-duration projects',
  'ADU and remodel cleanup',
  'Demo debris staging and removal',
  'Quick-turn cleanup for tight schedules',
  'Site presentation before inspections',
];

export default function CleanupForContractors() {
  return (
    <CleanupLayout
      title="Cleanup Support Built for Contractors | Calsan C&D Waste Removal"
      description="Phase cleanup, recurring service, ADU cleanup, and demo debris support for general contractors, remodelers, and trade contractors in Oakland, Alameda, and the Bay Area."
    >
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">Cleanup Support Built for Contractors</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mb-6">
            We work with general contractors, remodelers, ADU builders, and trade contractors who need dependable cleanup that fits the project pace — not a generic hauling approach.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" variant="cta">
              <Link to="/cleanup/quote">Request a Contractor Quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/cleanup/recurring-jobsite-cleanup">Ask About Recurring Service</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">What Contractors Need From a Cleanup Partner</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-10">
            {CONTRACTOR_NEEDS.map((n) => (
              <div key={n} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{n}</span>
              </div>
            ))}
          </div>

          <div className="bg-muted rounded-xl border border-border p-6 mb-10">
            <h2 className="text-lg font-bold text-foreground mb-3">Recurring Service for Active Contractors</h2>
            <p className="text-sm text-muted-foreground mb-4">
              If you run multiple projects or long-duration builds, scheduled recurring cleanup keeps sites cleaner without rescoping every visit. Plans start at $1,200/month.
            </p>
            <Link to="/cleanup/recurring-jobsite-cleanup" className="text-sm text-accent font-medium hover:underline">
              Learn about recurring plans →
            </Link>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Upload project photos and scope details for a faster recommendation.
            </p>
            <Button asChild size="lg" variant="cta">
              <Link to="/cleanup/quote">Upload Project Photos</Link>
            </Button>
          </div>
        </div>
      </section>
    </CleanupLayout>
  );
}
