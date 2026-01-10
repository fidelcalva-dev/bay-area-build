import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface CityMarker {
  name: string;
  slug: string;
  countySlug: string;
  status: 'active' | 'coming-soon';
  x: number;
  y: number;
}

// Bay Area cities positioned on simplified CA map (coordinates are percentages)
const cityMarkers: CityMarker[] = [
  // Active - Bay Area cities
  { name: 'San Francisco', slug: 'downtown-sf', countySlug: 'san-francisco', status: 'active', x: 22, y: 42 },
  { name: 'Oakland', slug: 'oakland', countySlug: 'alameda', status: 'active', x: 26, y: 43 },
  { name: 'San Jose', slug: 'san-jose', countySlug: 'santa-clara', status: 'active', x: 28, y: 52 },
  { name: 'Fremont', slug: 'fremont', countySlug: 'alameda', status: 'active', x: 30, y: 47 },
  { name: 'Berkeley', slug: 'berkeley', countySlug: 'alameda', status: 'active', x: 25, y: 40 },
  { name: 'Concord', slug: 'concord', countySlug: 'contra-costa', status: 'active', x: 30, y: 38 },
  { name: 'Walnut Creek', slug: 'walnut-creek', countySlug: 'contra-costa', status: 'active', x: 32, y: 40 },
  { name: 'Palo Alto', slug: 'palo-alto', countySlug: 'santa-clara', status: 'active', x: 25, y: 50 },
  { name: 'Sunnyvale', slug: 'sunnyvale', countySlug: 'santa-clara', status: 'active', x: 27, y: 51 },
  { name: 'Santa Rosa', slug: 'santa-rosa', countySlug: 'sonoma', status: 'active', x: 20, y: 32 },
  { name: 'Napa', slug: 'napa', countySlug: 'napa', status: 'active', x: 26, y: 34 },
  { name: 'Vallejo', slug: 'vallejo', countySlug: 'solano', status: 'active', x: 24, y: 36 },
  { name: 'San Rafael', slug: 'san-rafael', countySlug: 'marin', status: 'active', x: 21, y: 38 },
  { name: 'Hayward', slug: 'hayward', countySlug: 'alameda', status: 'active', x: 28, y: 45 },
  { name: 'San Mateo', slug: 'san-mateo', countySlug: 'san-mateo', status: 'active', x: 24, y: 47 },
  
  // Coming Soon - Future expansion cities
  { name: 'Sacramento', slug: 'sacramento', countySlug: '', status: 'coming-soon', x: 38, y: 35 },
  { name: 'Stockton', slug: 'stockton', countySlug: '', status: 'coming-soon', x: 42, y: 42 },
  { name: 'Modesto', slug: 'modesto', countySlug: '', status: 'coming-soon', x: 45, y: 48 },
  { name: 'Fresno', slug: 'fresno', countySlug: '', status: 'coming-soon', x: 52, y: 60 },
  { name: 'Los Angeles', slug: 'los-angeles', countySlug: '', status: 'coming-soon', x: 48, y: 82 },
  { name: 'San Diego', slug: 'san-diego', countySlug: '', status: 'coming-soon', x: 55, y: 92 },
];

export const ServiceCoverageMapSection = () => {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const activeCities = cityMarkers.filter(c => c.status === 'active');
  const comingSoonCities = cityMarkers.filter(c => c.status === 'coming-soon');

  return (
    <section className="section-padding bg-secondary">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="heading-lg text-secondary-foreground mb-4">
            Serving the Bay Area — Expanding Across California
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We operate locally and are expanding into top California cities with our own yards and equipment.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Map Container */}
          <div className="lg:col-span-3 relative">
            <div className="bg-card rounded-2xl p-4 shadow-lg border border-border/30 overflow-hidden">
              {/* California Map SVG */}
              <svg
                viewBox="0 0 100 120"
                className="w-full h-auto"
                style={{ maxHeight: '600px' }}
              >
                {/* Simplified California shape */}
                <path
                  d="M15 5 L35 3 L40 8 L42 15 L45 25 L50 35 L55 45 L60 55 L65 65 L70 75 L68 85 L65 95 L60 100 L55 105 L50 110 L45 112 L42 108 L40 100 L38 90 L35 80 L30 70 L25 60 L20 50 L18 40 L17 30 L15 20 L14 10 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="0.5"
                  className="drop-shadow-sm"
                />

                {/* Bay Area highlight region */}
                <ellipse
                  cx="26"
                  cy="44"
                  rx="14"
                  ry="12"
                  fill="hsl(var(--primary) / 0.15)"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.3"
                  strokeDasharray="1,1"
                />

                {/* City markers */}
                {cityMarkers.map((city) => (
                  <Popover key={city.slug}>
                    <PopoverTrigger asChild>
                      <g
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredCity(city.slug)}
                        onMouseLeave={() => setHoveredCity(null)}
                      >
                        {/* Marker pin */}
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r={hoveredCity === city.slug ? 2.5 : 2}
                          fill={city.status === 'active' ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
                          stroke="hsl(var(--background))"
                          strokeWidth="0.5"
                          className="transition-all duration-200"
                        />
                        {/* Pulse effect for active cities */}
                        {city.status === 'active' && hoveredCity === city.slug && (
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r="4"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="0.3"
                            className="animate-ping"
                            style={{ transformOrigin: `${city.x}px ${city.y}px` }}
                          />
                        )}
                      </g>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4" align="center">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">{city.name}</h4>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              city.status === 'active'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-accent/10 text-accent'
                            }`}
                          >
                            {city.status === 'active' ? 'Active' : 'Coming Soon'}
                          </span>
                        </div>
                        
                        {city.status === 'active' ? (
                          <>
                            <p className="text-sm text-muted-foreground">
                              Same-day dumpster delivery available in {city.name}.
                            </p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="cta" className="flex-1" asChild>
                                <Link to={`/areas#${city.countySlug}`}>
                                  Get Quote
                                  <ChevronRight className="ml-1 h-3 w-3" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <a href="tel:+14155551234">
                                  <Phone className="h-3 w-3" />
                                </a>
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            We're expanding to {city.name} soon! Contact us for updates.
                          </p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </svg>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Active Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span className="text-sm text-muted-foreground">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>

          {/* City Lists */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Cities */}
            <div className="bg-card rounded-xl p-6 border border-border/30">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Active Service Areas</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {activeCities.map((city) => (
                  <Link
                    key={city.slug}
                    to={`/areas#${city.countySlug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <ChevronRight className="h-3 w-3" />
                    {city.name}
                  </Link>
                ))}
              </div>
              <Button variant="cta" className="w-full mt-4" asChild>
                <Link to="/areas">
                  View All Service Areas
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Coming Soon Cities */}
            <div className="bg-muted/30 rounded-xl p-6 border border-border/30">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">Expanding Soon</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {comingSoonCities.map((city) => (
                  <span
                    key={city.slug}
                    className="text-sm text-muted-foreground flex items-center gap-1"
                  >
                    <ChevronRight className="h-3 w-3 text-accent/60" />
                    {city.name}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Interested in service when we launch? Call us for early access.
              </p>
            </div>

            {/* CTA */}
            <div className="bg-primary/10 rounded-xl p-6 text-center">
              <p className="text-sm text-foreground mb-3">
                Don't see your city? We may still serve your area.
              </p>
              <Button variant="outline" asChild>
                <a href="tel:+14155551234" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Call to Check Coverage
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
