// Sizes Preview Section - Shows dumpster sizes with consistent data
// Uses master data from shared-data.ts

import { Link } from 'react-router-dom';
import { ArrowRight, Package, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { DUMPSTER_SIZES_DATA, CTA_LINKS } from '@/lib/shared-data';

// Show the most popular sizes for preview
const PREVIEW_SIZES = DUMPSTER_SIZES_DATA.filter(s => 
  [10, 20, 30, 40].includes(s.yards)
);

export function SizesPreviewSection() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-muted">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2 className="heading-lg text-foreground mb-3">{t('sizes.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              From small cleanouts to major construction projects.
            </p>
          </div>
          <Button asChild variant="outline" size="lg">
            <Link to="/sizes">
              View All Sizes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PREVIEW_SIZES.map((size) => (
            <div
              key={size.yards}
              className={`group bg-card rounded-2xl border p-6 hover:shadow-card-hover transition-all duration-300 ${
                size.popular ? 'border-primary ring-1 ring-primary/20' : 'border-border hover:border-primary/30'
              }`}
            >
              {size.popular && (
                <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Package className="w-7 h-7" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">From</div>
                  <div className="text-2xl font-bold text-foreground">${size.priceFrom}</div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-1">
                {size.yards} Yard
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Weight className="w-4 h-4" />
                <span>{size.includedTons}T included • {size.loads}</span>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{size.description}</p>

              <Button 
                asChild 
                variant={size.popular ? 'default' : 'outline'} 
                size="default" 
                className="w-full"
              >
                <Link to={`/sizes`}>
                  Choose {size.yards} Yard
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Heavy Materials Callout */}
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex items-center gap-3">
            <Weight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-semibold text-foreground">Need a dumpster for concrete, dirt, or rock?</span>
              <span className="text-muted-foreground ml-2">
                We offer dedicated 6, 8, and 10 yard heavy material dumpsters with 10 tons included.
              </span>
              <Link to="/sizes" className="text-primary font-medium ml-2 hover:underline">
                View heavy material sizes →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
