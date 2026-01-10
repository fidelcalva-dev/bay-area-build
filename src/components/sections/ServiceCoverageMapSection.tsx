import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Region {
  id: string;
  name: string;
  status: 'active' | 'coming-soon';
  cities: string[];
  path: string;
  labelX: number;
  labelY: number;
}

const regions: Region[] = [
  // Bay Area Counties - Active
  {
    id: 'san-francisco',
    name: 'San Francisco',
    status: 'active',
    cities: ['Downtown SF', 'SOMA', 'Mission', 'Marina'],
    path: 'M118,195 L125,190 L132,193 L130,202 L122,205 Z',
    labelX: 124,
    labelY: 198,
  },
  {
    id: 'alameda',
    name: 'Alameda County',
    status: 'active',
    cities: ['Oakland', 'Berkeley', 'Fremont', 'Hayward'],
    path: 'M132,190 L155,185 L165,200 L160,225 L145,235 L130,220 L128,205 Z',
    labelX: 145,
    labelY: 210,
  },
  {
    id: 'contra-costa',
    name: 'Contra Costa',
    status: 'active',
    cities: ['Concord', 'Walnut Creek', 'Richmond', 'Antioch'],
    path: 'M132,165 L175,155 L185,175 L165,200 L155,185 L132,190 Z',
    labelX: 155,
    labelY: 178,
  },
  {
    id: 'santa-clara',
    name: 'Santa Clara',
    status: 'active',
    cities: ['San Jose', 'Sunnyvale', 'Palo Alto', 'Mountain View'],
    path: 'M115,225 L145,235 L160,225 L175,260 L145,280 L115,265 Z',
    labelX: 142,
    labelY: 252,
  },
  {
    id: 'san-mateo',
    name: 'San Mateo',
    status: 'active',
    cities: ['San Mateo', 'Redwood City', 'Daly City', 'Burlingame'],
    path: 'M105,200 L122,205 L130,220 L115,225 L115,265 L95,250 L100,215 Z',
    labelX: 112,
    labelY: 232,
  },
  {
    id: 'marin',
    name: 'Marin County',
    status: 'active',
    cities: ['San Rafael', 'Novato', 'Mill Valley', 'Sausalito'],
    path: 'M95,165 L118,160 L125,175 L118,195 L105,200 L95,185 Z',
    labelX: 110,
    labelY: 180,
  },
  {
    id: 'sonoma',
    name: 'Sonoma County',
    status: 'active',
    cities: ['Santa Rosa', 'Petaluma', 'Rohnert Park', 'Healdsburg'],
    path: 'M75,120 L110,115 L118,160 L95,165 L80,155 L70,135 Z',
    labelX: 95,
    labelY: 142,
  },
  {
    id: 'napa',
    name: 'Napa County',
    status: 'active',
    cities: ['Napa', 'Yountville', 'St. Helena', 'Calistoga'],
    path: 'M110,115 L135,110 L145,145 L132,165 L118,160 Z',
    labelX: 128,
    labelY: 140,
  },
  {
    id: 'solano',
    name: 'Solano County',
    status: 'active',
    cities: ['Vallejo', 'Fairfield', 'Vacaville', 'Benicia'],
    path: 'M135,110 L170,105 L175,155 L132,165 L145,145 Z',
    labelX: 152,
    labelY: 135,
  },
  // Coming Soon Regions
  {
    id: 'sacramento',
    name: 'Sacramento',
    status: 'coming-soon',
    cities: ['Sacramento', 'Elk Grove', 'Roseville', 'Folsom'],
    path: 'M170,105 L215,95 L225,140 L210,165 L185,175 L175,155 Z',
    labelX: 195,
    labelY: 135,
  },
  {
    id: 'san-joaquin',
    name: 'San Joaquin',
    status: 'coming-soon',
    cities: ['Stockton', 'Tracy', 'Manteca', 'Lodi'],
    path: 'M185,175 L210,165 L225,200 L220,240 L175,260 L165,200 Z',
    labelX: 198,
    labelY: 210,
  },
  {
    id: 'fresno',
    name: 'Fresno County',
    status: 'coming-soon',
    cities: ['Fresno', 'Clovis', 'Madera', 'Selma'],
    path: 'M175,260 L220,240 L250,320 L210,350 L170,320 L145,280 Z',
    labelX: 200,
    labelY: 295,
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    status: 'coming-soon',
    cities: ['Los Angeles', 'Long Beach', 'Pasadena', 'Glendale'],
    path: 'M170,420 L230,400 L260,440 L250,480 L200,490 L165,460 Z',
    labelX: 210,
    labelY: 445,
  },
  {
    id: 'san-diego',
    name: 'San Diego',
    status: 'coming-soon',
    cities: ['San Diego', 'Chula Vista', 'Oceanside', 'Carlsbad'],
    path: 'M200,490 L250,480 L275,520 L260,550 L215,545 L195,515 Z',
    labelX: 235,
    labelY: 520,
  },
];

export const ServiceCoverageMapSection = () => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const activeRegions = regions.filter(r => r.status === 'active');
  const comingSoonRegions = regions.filter(r => r.status === 'coming-soon');

  const handleRegionClick = (region: Region) => {
    setSelectedRegion(prev => prev?.id === region.id ? null : region);
  };

  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="heading-lg text-foreground mb-3">
            Service Coverage Map
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Click any region to see service details. Green areas have same-day delivery.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* SVG Map */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
              <svg
                viewBox="60 80 230 500"
                className="w-full h-auto"
                style={{ maxHeight: '600px' }}
              >
                {/* California State Outline */}
                <path
                  d="M85,95 L130,90 L170,105 L215,95 L240,110 L260,150 L280,200 L295,260 L300,320 L290,380 L275,420 L260,440 L250,480 L275,520 L260,560 L215,555 L195,515 L165,460 L150,400 L125,350 L110,300 L95,250 L85,200 L75,150 L80,120 Z"
                  fill="hsl(var(--muted) / 0.5)"
                  stroke="hsl(var(--border))"
                  strokeWidth="1.5"
                />

                {/* Render regions */}
                {regions.map((region) => {
                  const isHovered = hoveredRegion === region.id;
                  const isSelected = selectedRegion?.id === region.id;
                  const isActive = region.status === 'active';

                  return (
                    <g key={region.id}>
                      {/* Region path */}
                      <path
                        d={region.path}
                        fill={
                          isActive
                            ? isHovered || isSelected
                              ? 'hsl(var(--primary) / 0.6)'
                              : 'hsl(var(--primary) / 0.4)'
                            : isHovered || isSelected
                              ? 'hsl(var(--muted-foreground) / 0.3)'
                              : 'hsl(var(--muted-foreground) / 0.15)'
                        }
                        stroke={
                          isActive
                            ? 'hsl(var(--primary))'
                            : 'hsl(var(--muted-foreground) / 0.4)'
                        }
                        strokeWidth={isHovered || isSelected ? '2' : '1'}
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredRegion(region.id)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        onClick={() => handleRegionClick(region)}
                      />

                      {/* Region label */}
                      <text
                        x={region.labelX}
                        y={region.labelY}
                        textAnchor="middle"
                        className={`text-[8px] font-semibold pointer-events-none select-none ${
                          isActive ? 'fill-primary' : 'fill-muted-foreground'
                        }`}
                      >
                        {region.name.split(' ')[0]}
                      </text>

                      {/* Status indicator dot */}
                      <circle
                        cx={region.labelX}
                        cy={region.labelY + 10}
                        r="3"
                        fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
                        className="pointer-events-none"
                      />
                    </g>
                  );
                })}

                {/* Hover tooltip */}
                {hoveredRegion && !selectedRegion && (
                  (() => {
                    const region = regions.find(r => r.id === hoveredRegion);
                    if (!region) return null;
                    const tooltipX = Math.min(Math.max(region.labelX, 100), 250);
                    const tooltipY = region.labelY - 35;
                    
                    return (
                      <g className="pointer-events-none">
                        <rect
                          x={tooltipX - 50}
                          y={tooltipY - 12}
                          width="100"
                          height="28"
                          rx="4"
                          fill="hsl(var(--popover))"
                          stroke="hsl(var(--border))"
                          strokeWidth="1"
                        />
                        <text
                          x={tooltipX}
                          y={tooltipY}
                          textAnchor="middle"
                          className="text-[9px] font-semibold fill-foreground"
                        >
                          {region.name}
                        </text>
                        <text
                          x={tooltipX}
                          y={tooltipY + 10}
                          textAnchor="middle"
                          className={`text-[7px] ${
                            region.status === 'active' ? 'fill-primary' : 'fill-accent'
                          }`}
                        >
                          {region.status === 'active' ? '● Active' : '○ Coming Soon'}
                        </text>
                      </g>
                    );
                  })()
                )}
              </svg>

              {/* Legend */}
              <div className="flex items-center justify-center gap-8 py-4 border-t border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/40 border border-primary" />
                  <span className="text-sm text-foreground">Active Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted-foreground/15 border border-muted-foreground/40" />
                  <span className="text-sm text-foreground">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Selected Region Card */}
            {selectedRegion ? (
              <div className="bg-card rounded-xl border border-border p-5 shadow-lg animate-fade-in">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{selectedRegion.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium mt-1 ${
                        selectedRegion.status === 'active' ? 'text-primary' : 'text-accent'
                      }`}
                    >
                      {selectedRegion.status === 'active' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Active Service
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" /> Coming Soon
                        </>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedRegion(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Cities served:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRegion.cities.map((city) => (
                      <span
                        key={city}
                        className="text-xs bg-muted px-2 py-1 rounded-full text-foreground"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedRegion.status === 'active' ? (
                  <div className="space-y-2">
                    <Button variant="cta" className="w-full" size="sm" asChild>
                      <Link to={`/areas#${selectedRegion.id}`}>
                        Get Instant Quote
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" size="sm" asChild>
                      <a href="tel:+15106802150">
                        <Phone className="mr-2 h-4 w-4" />
                        Call (510) 680-2150
                      </a>
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a href="tel:+15106802150">
                      <Phone className="mr-2 h-4 w-4" />
                      Request Early Access
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-xl border border-border/50 p-5 text-center">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click a region on the map to see details
                </p>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Active Regions ({activeRegions.length})
              </h4>
              <div className="space-y-1 mb-4">
                {activeRegions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => handleRegionClick(region)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      selectedRegion?.id === region.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {region.name}
                  </button>
                ))}
              </div>

              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Expanding Soon ({comingSoonRegions.length})
              </h4>
              <div className="space-y-1">
                {comingSoonRegions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => handleRegionClick(region)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      selectedRegion?.id === region.id
                        ? 'bg-accent/10 text-accent font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-5 text-center">
              <p className="text-sm text-foreground mb-3">
                Don't see your area? We may still serve you.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="tel:+15106802150">
                  <Phone className="mr-2 h-4 w-4" />
                  Check Coverage
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
