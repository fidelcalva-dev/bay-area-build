import { Link } from 'react-router-dom';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { CORE_SERVICES, SURCHARGES, BRAND_CLARIFICATION } from '@/config/cleanup/content';
import { Button } from '@/components/ui/button';

export default function CleanupPricing() {
  return (
    <CleanupLayout
      title="Simple Starting Prices for Core Cleanup Services | Calsan C&D Waste Removal"
      description="Transparent starting prices for construction cleanup, post-construction cleanup, demolition debris cleanup, and recurring jobsite cleanup in the Bay Area."
    >
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Simple Starting Prices for Core Cleanup Services</h1>
          <p className="text-muted-foreground max-w-2xl mb-10">
            Pricing is tied to scope, labor, disposal, and real site conditions. These starting points help you plan. Send us project details for accurate pricing.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {CORE_SERVICES.map((svc) => (
              <div key={svc.code} className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-bold text-foreground text-lg mb-1">{svc.name}</h2>
                <p className="text-2xl font-extrabold text-primary mb-2">{svc.startingPrice}</p>
                <p className="text-sm text-muted-foreground mb-4">{svc.pricingNote}</p>
                <Link
                  to={`/cleanup/${svc.slug}`}
                  className="text-sm text-accent font-medium hover:underline"
                >
                  Learn more →
                </Link>
              </div>
            ))}
          </div>

          {/* Labor-assisted block */}
          <div className="bg-muted rounded-xl border border-border p-6 mb-10">
            <h2 className="font-bold text-foreground text-lg mb-1">Labor-Assisted Cleanup</h2>
            <p className="text-2xl font-extrabold text-primary mb-2">$95/hr per tech</p>
            <p className="text-sm text-muted-foreground">
              Best for loading, material movement, debris pickup, and cleanup support tied to active project phases. 2-tech / 2-hour minimum.
            </p>
          </div>

          {/* Surcharges */}
          <div className="bg-card rounded-xl border border-border p-6 mb-10">
            <h2 className="font-bold text-foreground mb-4">Common Surcharges</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SURCHARGES.map((s) => (
                <div key={s.label} className="text-sm">
                  <span className="font-semibold text-foreground">{s.value}</span>
                  <span className="text-muted-foreground ml-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Send photos and project details for accurate pricing tailored to your site.
            </p>
            <Button asChild size="lg" variant="cta">
              <Link to="/cleanup/quote">Request Accurate Project Pricing</Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-6">{BRAND_CLARIFICATION}</p>
          </div>
        </div>
      </section>
    </CleanupLayout>
  );
}
