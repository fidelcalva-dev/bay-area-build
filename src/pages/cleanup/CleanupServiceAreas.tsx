import { Link } from 'react-router-dom';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { Button } from '@/components/ui/button';

export default function CleanupServiceAreas() {
  return (
    <CleanupLayout
      title="Service Areas | Construction Cleanup in Oakland, Alameda & Bay Area"
      description="Calsan C&D Waste Removal provides construction cleanup across Oakland, Alameda, and the Bay Area. Confirm availability for your project location."
    >
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Service Areas</h1>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            We provide construction cleanup, post-construction cleanup, demolition debris cleanup, and recurring jobsite service across our core Bay Area markets.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
             <Link to="/cleanup/oakland" className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <h2 className="font-bold text-foreground text-lg mb-2">Oakland</h2>
              <p className="text-sm text-muted-foreground mb-3">Primary market. Remodels, ADUs, active jobsites, commercial turnover.</p>
              <span className="text-sm text-accent font-medium">Learn more →</span>
            </Link>
            <Link to="/cleanup/alameda" className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <h2 className="font-bold text-foreground text-lg mb-2">Alameda</h2>
              <p className="text-sm text-muted-foreground mb-3">Strong coverage for residential and ADU projects.</p>
              <span className="text-sm text-accent font-medium">Learn more →</span>
            </Link>
            <Link to="/cleanup/bay-area" className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <h2 className="font-bold text-foreground text-lg mb-2">Bay Area</h2>
              <p className="text-sm text-muted-foreground mb-3">Extended service area. Contact us to confirm availability.</p>
              <span className="text-sm text-accent font-medium">Learn more →</span>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">Not sure if we cover your area? Contact us with the project address.</p>
            <Button asChild size="lg" variant="cta">
              <Link to="/cleanup/quote">Request a Quote</Link>
            </Button>
          </div>
        </div>
      </section>
    </CleanupLayout>
  );
}
