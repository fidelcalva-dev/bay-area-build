import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, ChevronRight, Navigation, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CityMarker {
  name: string;
  slug: string;
  countySlug: string;
  status: 'active' | 'coming-soon';
  x: number;
  y: number;
  region?: string;
}

// Bay Area cities positioned on California map (coordinates are percentages)
const cityMarkers: CityMarker[] = [
  // Active - Bay Area cities
  { name: 'San Francisco', slug: 'downtown-sf', countySlug: 'san-francisco', status: 'active', x: 22, y: 42, region: 'SF Bay' },
  { name: 'Oakland', slug: 'oakland', countySlug: 'alameda', status: 'active', x: 26, y: 43, region: 'East Bay' },
  { name: 'San Jose', slug: 'san-jose', countySlug: 'santa-clara', status: 'active', x: 28, y: 52, region: 'South Bay' },
  { name: 'Fremont', slug: 'fremont', countySlug: 'alameda', status: 'active', x: 30, y: 47, region: 'East Bay' },
  { name: 'Berkeley', slug: 'berkeley', countySlug: 'alameda', status: 'active', x: 25, y: 40, region: 'East Bay' },
  { name: 'Concord', slug: 'concord', countySlug: 'contra-costa', status: 'active', x: 30, y: 38, region: 'East Bay' },
  { name: 'Walnut Creek', slug: 'walnut-creek', countySlug: 'contra-costa', status: 'active', x: 32, y: 40, region: 'East Bay' },
  { name: 'Palo Alto', slug: 'palo-alto', countySlug: 'santa-clara', status: 'active', x: 25, y: 50, region: 'Peninsula' },
  { name: 'Sunnyvale', slug: 'sunnyvale', countySlug: 'santa-clara', status: 'active', x: 27, y: 51, region: 'South Bay' },
  { name: 'Santa Rosa', slug: 'santa-rosa', countySlug: 'sonoma', status: 'active', x: 20, y: 32, region: 'North Bay' },
  { name: 'Napa', slug: 'napa', countySlug: 'napa', status: 'active', x: 26, y: 34, region: 'North Bay' },
  { name: 'Vallejo', slug: 'vallejo', countySlug: 'solano', status: 'active', x: 24, y: 36, region: 'North Bay' },
  { name: 'San Rafael', slug: 'san-rafael', countySlug: 'marin', status: 'active', x: 21, y: 38, region: 'North Bay' },
  { name: 'Hayward', slug: 'hayward', countySlug: 'alameda', status: 'active', x: 28, y: 45, region: 'East Bay' },
  { name: 'San Mateo', slug: 'san-mateo', countySlug: 'san-mateo', status: 'active', x: 24, y: 47, region: 'Peninsula' },
  
  // Coming Soon - Future expansion cities
  { name: 'Sacramento', slug: 'sacramento', countySlug: '', status: 'coming-soon', x: 38, y: 35, region: 'Central Valley' },
  { name: 'Stockton', slug: 'stockton', countySlug: '', status: 'coming-soon', x: 42, y: 42, region: 'Central Valley' },
  { name: 'Modesto', slug: 'modesto', countySlug: '', status: 'coming-soon', x: 45, y: 48, region: 'Central Valley' },
  { name: 'Fresno', slug: 'fresno', countySlug: '', status: 'coming-soon', x: 52, y: 60, region: 'Central Valley' },
  { name: 'Los Angeles', slug: 'los-angeles', countySlug: '', status: 'coming-soon', x: 48, y: 82, region: 'SoCal' },
  { name: 'San Diego', slug: 'san-diego', countySlug: '', status: 'coming-soon', x: 55, y: 92, region: 'SoCal' },
];

export const ServiceCoverageMapSection = () => {
  const [selectedCity, setSelectedCity] = useState<CityMarker | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const activeCities = cityMarkers.filter(c => c.status === 'active');
  const comingSoonCities = cityMarkers.filter(c => c.status === 'coming-soon');

  const handleCityClick = useCallback((city: CityMarker) => {
    setSelectedCity(prev => prev?.slug === city.slug ? null : city);
  }, []);

  return (
    <section className="section-padding bg-gradient-to-b from-secondary via-secondary to-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container-wide relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Navigation className="h-4 w-4" />
            Interactive Coverage Map
          </div>
          <h2 className="heading-lg text-secondary-foreground mb-4">
            Bay Area Coverage — California Expansion
          </h2>
          <p className="text-lg text-secondary-foreground/70 max-w-3xl mx-auto">
            Tap any city to see service details. We operate our own yards and fleet across the Bay Area.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-10">
          {[
            { icon: MapPin, label: 'Active Cities', value: activeCities.length.toString() },
            { icon: Clock, label: 'Same-Day Delivery', value: '100%' },
            { icon: Zap, label: 'Expansion Cities', value: comingSoonCities.length.toString() },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 bg-card/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/10">
              <stat.icon className="h-5 w-5 text-accent" />
              <div>
                <div className="text-xl font-bold text-secondary-foreground">{stat.value}</div>
                <div className="text-xs text-secondary-foreground/60">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <div className="relative bg-gradient-to-br from-card via-card to-muted/50 rounded-2xl p-1 shadow-2xl">
              {/* Map inner container with border effect */}
              <div className="bg-card rounded-xl overflow-hidden relative">
                {/* Map header bar */}
                <div className="bg-secondary/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-border/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <span className="text-xs text-secondary-foreground/60 font-mono">calsan-coverage.map</span>
                  <div className="w-16" />
                </div>

                {/* California Map SVG */}
                <div className="relative p-4 md:p-6">
                  <svg
                    viewBox="0 0 100 120"
                    className="w-full h-auto transition-all duration-500"
                    style={{ maxHeight: '500px' }}
                  >
                    {/* Gradient definitions */}
                    <defs>
                      <linearGradient id="californiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--muted))" />
                        <stop offset="100%" stopColor="hsl(var(--muted) / 0.7)" />
                      </linearGradient>
                      <linearGradient id="bayAreaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary) / 0.25)" />
                        <stop offset="100%" stopColor="hsl(var(--primary) / 0.1)" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <filter id="dropShadow">
                        <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
                      </filter>
                    </defs>

                    {/* California outline */}
                    <path
                      d="M15 5 L35 3 L40 8 L42 15 L45 25 L50 35 L55 45 L60 55 L65 65 L70 75 L68 85 L65 95 L60 100 L55 105 L50 110 L45 112 L42 108 L40 100 L38 90 L35 80 L30 70 L25 60 L20 50 L18 40 L17 30 L15 20 L14 10 Z"
                      fill="url(#californiaGradient)"
                      stroke="hsl(var(--border))"
                      strokeWidth="0.5"
                      filter="url(#dropShadow)"
                    />

                    {/* Bay Area active zone */}
                    <ellipse
                      cx="26"
                      cy="44"
                      rx="15"
                      ry="14"
                      fill="url(#bayAreaGradient)"
                      stroke="hsl(var(--primary))"
                      strokeWidth="0.4"
                      strokeDasharray="2,1"
                      className="animate-pulse-slow"
                    />

                    {/* Bay Area label */}
                    <text
                      x="26"
                      y="58"
                      textAnchor="middle"
                      className="text-[2.5px] font-semibold fill-primary"
                    >
                      BAY AREA
                    </text>

                    {/* Connection lines from Bay Area to expansion cities */}
                    {comingSoonCities.map((city) => (
                      <line
                        key={`line-${city.slug}`}
                        x1="26"
                        y1="44"
                        x2={city.x}
                        y2={city.y}
                        stroke="hsl(var(--accent) / 0.2)"
                        strokeWidth="0.3"
                        strokeDasharray="1,1"
                        className={`transition-all duration-300 ${
                          hoveredCity === city.slug ? 'stroke-[hsl(var(--accent))] opacity-100' : 'opacity-50'
                        }`}
                      />
                    ))}

                    {/* City markers - Coming Soon first (render behind) */}
                    {comingSoonCities.map((city) => (
                      <g
                        key={city.slug}
                        className="cursor-pointer transition-transform duration-200"
                        onClick={() => handleCityClick(city)}
                        onMouseEnter={() => setHoveredCity(city.slug)}
                        onMouseLeave={() => setHoveredCity(null)}
                        style={{
                          transform: hoveredCity === city.slug || selectedCity?.slug === city.slug 
                            ? 'scale(1.2)' 
                            : 'scale(1)',
                          transformOrigin: `${city.x}px ${city.y}px`,
                        }}
                      >
                        {/* Outer glow ring */}
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r="3"
                          fill="none"
                          stroke="hsl(var(--accent) / 0.3)"
                          strokeWidth="0.5"
                          className={`transition-all duration-300 ${
                            hoveredCity === city.slug || selectedCity?.slug === city.slug 
                              ? 'opacity-100' 
                              : 'opacity-0'
                          }`}
                        />
                        {/* Main marker */}
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r="1.8"
                          fill="hsl(var(--accent))"
                          stroke="hsl(var(--card))"
                          strokeWidth="0.5"
                          className="transition-all duration-200"
                        />
                        {/* Inner dot */}
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r="0.6"
                          fill="hsl(var(--accent-foreground))"
                        />
                      </g>
                    ))}

                    {/* City markers - Active cities (render on top) */}
                    {activeCities.map((city) => (
                      <g
                        key={city.slug}
                        className="cursor-pointer"
                        onClick={() => handleCityClick(city)}
                        onMouseEnter={() => setHoveredCity(city.slug)}
                        onMouseLeave={() => setHoveredCity(null)}
                      >
                        {/* Pulse animation ring */}
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r={hoveredCity === city.slug || selectedCity?.slug === city.slug ? "4" : "3"}
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="0.3"
                          className={`transition-all duration-300 ${
                            hoveredCity === city.slug || selectedCity?.slug === city.slug 
                              ? 'opacity-100 animate-ping' 
                              : 'opacity-0'
                          }`}
                          style={{ transformOrigin: `${city.x}px ${city.y}px` }}
                        />
                        {/* Outer glow */}
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r="3"
                          fill="hsl(var(--primary) / 0.2)"
                          className={`transition-all duration-200 ${
                            hoveredCity === city.slug || selectedCity?.slug === city.slug 
                              ? 'opacity-100' 
                              : 'opacity-0'
                          }`}
                        />
                        {/* Main marker with glow */}
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r={hoveredCity === city.slug || selectedCity?.slug === city.slug ? "2.2" : "1.8"}
                          fill="hsl(var(--primary))"
                          stroke="hsl(var(--card))"
                          strokeWidth="0.6"
                          filter={hoveredCity === city.slug || selectedCity?.slug === city.slug ? "url(#glow)" : ""}
                          className="transition-all duration-200"
                        />
                        {/* Inner checkmark indicator */}
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r="0.7"
                          fill="hsl(var(--primary-foreground))"
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Selected city popup card */}
                  {selectedCity && (
                    <div 
                      className="absolute bg-card border border-border rounded-xl shadow-2xl p-4 min-w-[240px] z-20 animate-fade-in"
                      style={{
                        left: `${Math.min(Math.max(selectedCity.x, 25), 75)}%`,
                        top: `${Math.min(selectedCity.y + 5, 70)}%`,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-l border-t border-border rotate-45" />
                      
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-foreground text-lg">{selectedCity.name}</h4>
                            <p className="text-xs text-muted-foreground">{selectedCity.region}</p>
                          </div>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              selectedCity.status === 'active'
                                ? 'bg-primary/15 text-primary'
                                : 'bg-accent/15 text-accent'
                            }`}
                          >
                            {selectedCity.status === 'active' ? '● Active' : '◐ Coming Soon'}
                          </span>
                        </div>
                        
                        {selectedCity.status === 'active' ? (
                          <>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              Same-day delivery available
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="cta" className="flex-1 text-sm" asChild>
                                <Link to={`/areas#${selectedCity.countySlug}`}>
                                  Get Instant Quote
                                  <ChevronRight className="ml-1 h-3 w-3" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline" className="px-3" asChild>
                                <a href="tel:+15106802150">
                                  <Phone className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              We're expanding to {selectedCity.name} soon! Get notified when we launch.
                            </p>
                            <Button size="sm" variant="outline" className="w-full" asChild>
                              <a href="tel:+15106802150">
                                <Phone className="mr-2 h-3 w-3" />
                                Request Early Access
                              </a>
                            </Button>
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedCity(null)}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-muted hover:bg-muted-foreground/20 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Map footer legend */}
                <div className="bg-muted/30 backdrop-blur-sm px-4 py-3 flex flex-wrap items-center justify-center gap-4 md:gap-8 border-t border-border/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
                    <span className="text-sm text-foreground font-medium">Active Service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.5)]" />
                    <span className="text-sm text-foreground font-medium">Coming Soon</span>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 bg-muted rounded">Click pin for details</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-5">
            {/* Active Cities Card */}
            <div className="bg-card rounded-xl p-5 border border-border/50 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Active Service</h3>
                  <p className="text-xs text-muted-foreground">{activeCities.length} cities ready</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {activeCities.slice(0, 8).map((city) => (
                  <button
                    key={city.slug}
                    onClick={() => handleCityClick(city)}
                    className={`text-sm text-left px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      selectedCity?.slug === city.slug
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {city.name}
                  </button>
                ))}
              </div>
              {activeCities.length > 8 && (
                <p className="text-xs text-muted-foreground mb-3">
                  +{activeCities.length - 8} more cities
                </p>
              )}
              <Button variant="cta" className="w-full" size="sm" asChild>
                <Link to="/areas">
                  View All Service Areas
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Coming Soon Card */}
            <div className="bg-muted/30 rounded-xl p-5 border border-border/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Expanding Soon</h3>
                  <p className="text-xs text-muted-foreground">{comingSoonCities.length} new markets</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {comingSoonCities.map((city) => (
                  <button
                    key={city.slug}
                    onClick={() => handleCityClick(city)}
                    className={`w-full text-sm text-left px-2.5 py-2 rounded-lg transition-all flex items-center justify-between ${
                      selectedCity?.slug === city.slug
                        ? 'bg-accent/10 text-accent font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {city.name}
                    </span>
                    <span className="text-xs opacity-60">{city.region}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-xl p-5 border border-primary/20">
              <p className="text-sm text-foreground font-medium mb-3">
                Don't see your city? We may still serve your area.
              </p>
              <Button variant="outline" className="w-full" size="sm" asChild>
                <a href="tel:+15106802150" className="flex items-center justify-center gap-2">
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
