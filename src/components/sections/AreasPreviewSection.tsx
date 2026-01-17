// Service Areas Preview - Links to full Areas page
// Uses master data from shared-data.ts

import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SERVICE_AREAS, CTA_LINKS } from '@/lib/shared-data';
import { useLanguage } from '@/contexts/LanguageContext';

const FEATURED_CITIES = [
  'Oakland', 'San Francisco', 'San Jose', 'Concord', 'Walnut Creek',
  'Richmond', 'Vallejo', 'Stockton', 'Modesto', 'Sacramento',
];

export function AreasPreviewSection() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-muted">
      <div className="container-wide">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <MapPin className="w-4 h-4" />
            9 Counties • 100+ Cities
          </div>
          <h2 className="heading-lg text-foreground mb-4">Proudly Serving Northern California</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Same-day dumpster delivery across the San Francisco Bay Area and beyond.
          </p>
        </div>

        {/* Featured Cities */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          {FEATURED_CITIES.map((city) => (
            <div
              key={city}
              className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border"
            >
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
              <span className="text-sm font-medium text-foreground">{city}</span>
            </div>
          ))}
        </div>

        {/* County Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SERVICE_AREAS.map((county) => (
            <span
              key={county}
              className="px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-sm text-foreground"
            >
              {county.replace(' County', '')}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Not sure if we service your area? Enter your ZIP code for instant confirmation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="cta" size="lg">
              <Link to={CTA_LINKS.quote}>
                Get Instant Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/areas">
                View All Service Areas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
