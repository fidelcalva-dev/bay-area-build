import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, CheckCircle } from 'lucide-react';

const TRASHLAB_URL = 'https://app.trashlab.com';

const serviceAreas = [
  {
    county: 'Alameda County',
    cities: ['Oakland', 'Fremont', 'Berkeley', 'Hayward', 'San Leandro', 'Alameda', 'Livermore', 'Pleasanton', 'Union City', 'Newark', 'Dublin', 'Emeryville', 'Albany', 'Piedmont'],
  },
  {
    county: 'San Francisco',
    cities: ['Downtown', 'Mission District', 'Sunset', 'Richmond', 'Marina', 'SOMA', 'Potrero Hill', 'Bayview', 'Noe Valley', 'Castro', 'Haight-Ashbury', 'Pacific Heights'],
  },
  {
    county: 'Santa Clara County',
    cities: ['San Jose', 'Sunnyvale', 'Santa Clara', 'Mountain View', 'Palo Alto', 'Milpitas', 'Cupertino', 'Campbell', 'Los Gatos', 'Saratoga', 'Gilroy', 'Morgan Hill'],
  },
  {
    county: 'Contra Costa County',
    cities: ['Concord', 'Richmond', 'Antioch', 'Walnut Creek', 'Pittsburg', 'San Ramon', 'Brentwood', 'Danville', 'Martinez', 'Pleasant Hill', 'Lafayette', 'Orinda', 'Moraga'],
  },
  {
    county: 'San Mateo County',
    cities: ['Daly City', 'San Mateo', 'Redwood City', 'South San Francisco', 'San Bruno', 'Burlingame', 'Foster City', 'Menlo Park', 'Pacifica', 'Half Moon Bay', 'Belmont', 'San Carlos'],
  },
  {
    county: 'Marin County',
    cities: ['San Rafael', 'Novato', 'Mill Valley', 'Sausalito', 'Corte Madera', 'Larkspur', 'Tiburon', 'Fairfax', 'San Anselmo', 'Ross', 'Kentfield', 'Stinson Beach'],
  },
  {
    county: 'Napa County',
    cities: ['Napa', 'Yountville', 'St. Helena', 'Calistoga', 'American Canyon', 'Angwin', 'Deer Park', 'Lake Berryessa'],
  },
  {
    county: 'Solano County',
    cities: ['Vallejo', 'Fairfield', 'Vacaville', 'Suisun City', 'Benicia', 'Dixon', 'Rio Vista', 'Travis AFB'],
  },
  {
    county: 'Sonoma County',
    cities: ['Santa Rosa', 'Petaluma', 'Rohnert Park', 'Windsor', 'Healdsburg', 'Sonoma', 'Cotati', 'Cloverdale', 'Sebastopol', 'Bodega Bay'],
  },
];

export default function Areas() {
  return (
    <Layout
      title="Dumpster Rental Service Areas | SF Bay Area Coverage"
      description="Dumpster rental service in 9 Bay Area counties. Same-day delivery in Oakland, San Francisco, San Jose, and 100+ cities. Check your area."
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-4">Service Areas</h1>
            <p className="text-xl text-primary-foreground/85">
              Serving 9 Bay Area counties with same-day delivery. Find dumpster rental service near you.
            </p>
          </div>
        </div>
      </section>

      {/* Service Area Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">Dumpster Rental Near You</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We deliver roll-off dumpsters throughout the San Francisco Bay Area. Same-day service available in most locations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceAreas.map((area) => (
              <div
                key={area.county}
                className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-card-hover transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{area.county}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {area.cities.map((city) => (
                    <span
                      key={city}
                      className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Local Matters */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-lg text-foreground mb-6">Why Choose a Local Provider?</h2>
              <div className="space-y-4">
                {[
                  'Same-day delivery available in most areas',
                  'No long-distance fuel surcharges',
                  'Drivers who know your neighborhood',
                  'Quick response for pickups and swaps',
                  'Supporting local Bay Area business',
                  'Bilingual support (English & Spanish)',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-8">
              <h3 className="heading-sm text-foreground mb-4">Check Your Coverage</h3>
              <p className="text-muted-foreground mb-6">
                Enter your ZIP code to confirm service availability and get an instant quote.
              </p>
              <Button asChild variant="cta" size="lg" className="w-full">
                <Link to="/#quote">
                  Get Instant Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Or call <a href="tel:+15106802150" className="text-primary font-semibold">(510) 680-2150</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Don't See Your City?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            We may still be able to serve you. Give us a call and we'll check if delivery is available in your area.
          </p>
          <Button asChild variant="cta" size="xl">
            <a href="tel:+15106802150">
              Call (510) 680-2150
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
