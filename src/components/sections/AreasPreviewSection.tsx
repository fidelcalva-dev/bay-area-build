// Service Areas Preview — Links to full Areas page
// Shows regional hub structure with direct/partner split

import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Truck, Building, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { REGIONS, getCitiesForRegion } from '@/lib/service-area-config';
import { cityUrl } from '@/lib/seo-urls';
import { CTA_LINKS } from '@/lib/shared-data';

const FEATURED_DIRECT_CITIES = [
  { slug: 'oakland', name: 'Oakland' },
  { slug: 'san-jose', name: 'San Jose' },
  { slug: 'san-francisco', name: 'San Francisco' },
  { slug: 'berkeley', name: 'Berkeley' },
  { slug: 'fremont', name: 'Fremont' },
  { slug: 'hayward', name: 'Hayward' },
  { slug: 'walnut-creek', name: 'Walnut Creek' },
  { slug: 'concord', name: 'Concord' },
  { slug: 'sunnyvale', name: 'Sunnyvale' },
  { slug: 'palo-alto', name: 'Palo Alto' },
];

export function AreasPreviewSection() {
  return (
    <section className="section-padding bg-muted">
      <div className="container-wide">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <MapPin className="w-4 h-4" />
            Local Yards • 100+ Cities
          </div>
          <h2 className="heading-lg text-foreground mb-4">Proudly Serving California</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Direct operations from our Bay Area yards with coordinated service across the state.
          </p>
        </div>

        {/* Featured direct-operation cities */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          {FEATURED_DIRECT_CITIES.map((city) => (
            <Link
              key={city.slug}
              to={cityUrl(city.slug)}
              className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
              <span className="text-sm font-medium text-foreground">{city.name}</span>
            </Link>
          ))}
        </div>

        {/* Region pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {REGIONS.map((region) => (
            <Link
              key={region.slug}
              to={region.hubUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-sm text-foreground hover:bg-primary/10 transition-colors"
            >
              {region.serviceModel === 'DIRECT_OPERATION' ? (
                <Truck className="w-3 h-3 text-primary" />
              ) : (
                <Building className="w-3 h-3 text-muted-foreground" />
              )}
              {region.name}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Enter your ZIP code for instant coverage confirmation and transparent pricing.
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
