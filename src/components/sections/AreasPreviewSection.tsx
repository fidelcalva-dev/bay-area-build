import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const counties = [
  { name: 'Alameda County', cities: ['Oakland', 'Fremont', 'Berkeley', 'Hayward'] },
  { name: 'San Francisco', cities: ['All Districts', 'Downtown', 'Mission', 'Sunset'] },
  { name: 'Santa Clara County', cities: ['San Jose', 'Sunnyvale', 'Santa Clara', 'Mountain View'] },
  { name: 'Contra Costa County', cities: ['Concord', 'Richmond', 'Walnut Creek', 'Antioch'] },
  { name: 'San Mateo County', cities: ['Daly City', 'Redwood City', 'San Mateo', 'South SF'] },
  { name: 'Marin County', cities: ['San Rafael', 'Novato', 'Mill Valley', 'Sausalito'] },
];

export function AreasPreviewSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="heading-lg text-foreground mb-4">Proudly Serving Northern California</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We proudly serve Oakland, San Jose, San Francisco, Concord, Walnut Creek, Richmond, Vallejo, Stockton, Modesto, Sacramento, and surrounding cities.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Not sure if we service your area? Request a quote and we'll confirm right away.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {counties.map((county) => (
            <Link
              key={county.name}
              to="/areas"
              className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{county.name}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {county.cities.map((city) => (
                  <span
                    key={city}
                    className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-4">Ready to get started?</p>
          <Button asChild variant="default" size="lg">
            <Link to="/quote">
              Get an Instant Dumpster Rental Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
