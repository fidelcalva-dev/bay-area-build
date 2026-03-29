import { Link } from 'react-router-dom';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { CLEANUP_BRAND, BRAND_CLARIFICATION } from '@/config/cleanup/content';
import { Button } from '@/components/ui/button';

export default function CleanupAbout() {
  return (
    <CleanupLayout
      title="About Calsan C&D Waste Removal | Construction Cleanup Division"
      description="Calsan C&D Waste Removal is the cleanup-focused division of Calsan Services, the same trusted team behind Calsan Dumpsters Pro. CSLB #1152237."
    >
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">About Calsan C&D Waste Removal</h1>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
            <p>
              Many customers already know us as <strong className="text-foreground">Calsan Dumpsters Pro</strong>. 
              Calsan C&D Waste Removal is the cleanup-focused division of the same trusted team.
            </p>
            <p>
              We created this division because contractors, remodelers, ADU builders, and property managers 
              kept asking for more than dumpster rentals. They needed cleanup support that fits the pace and 
              demands of real jobsite work — not a generic hauling service.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">What We Focus On</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Construction cleanup for active jobsites</li>
              <li>Final and post-construction cleanup</li>
              <li>Demolition debris cleanup</li>
              <li>Recurring jobsite cleanup</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8">Why This Division Exists</h2>
            <p>
              Dumpster rentals and cleanup services require different crews, equipment, scheduling, and scoping. 
              By separating them, we deliver better results for both. Dumpster rentals stay under Calsan Dumpsters Pro. 
              Cleanup and debris support operate under Calsan C&D Waste Removal.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">Compliance & Licensing</h2>
            <p>
              <strong className="text-foreground">Calsan Services dba Calsan C&D Waste Removal</strong><br />
              {CLEANUP_BRAND.license}<br />
              {CLEANUP_BRAND.license_class}
            </p>
          </div>

          <div className="mt-10 text-center">
            <Button asChild size="lg" variant="cta">
              <Link to="/cleanup/quote">Request a Quote</Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">{BRAND_CLARIFICATION}</p>
          </div>
        </div>
      </section>
    </CleanupLayout>
  );
}
