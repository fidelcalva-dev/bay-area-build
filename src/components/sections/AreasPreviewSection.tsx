import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const dumpsterSizes = [
  { name: '6 Yard', details: ['Heavy materials', 'Concrete & dirt', '6 tons included'] },
  { name: '8 Yard', details: ['Heavy materials', 'Asphalt & brick', '8 tons included'] },
  { name: '10 Yard', details: ['Small projects', 'Garage cleanouts', '1 ton included'] },
  { name: '12 Yard', details: ['Medium projects', 'Room remodel', '1.5 tons included'] },
  { name: '15 Yard', details: ['Medium projects', 'Bathroom remodel', '1.5 tons included'] },
  { name: '20 Yard', details: ['Most popular', 'Kitchen remodel', '2 tons included'] },
  { name: '30 Yard', details: ['Large projects', 'Full cleanouts', '3 tons included'] },
  { name: '40 Yard', details: ['Major renovations', 'New construction', '4 tons included'] },
  { name: '50 Yard', details: ['Largest size', 'Commercial jobs', '5 tons included'] },
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
          {dumpsterSizes.map((size) => (
            <Link
              key={size.name}
              to="/sizes"
              className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{size.name}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {size.details.map((detail) => (
                  <span
                    key={detail}
                    className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-2">Ready to get started?</p>
          <p className="text-sm text-muted-foreground mb-4">Simple. Fast. No obligation.</p>
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
