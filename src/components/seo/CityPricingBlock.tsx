/**
 * CityPricingBlock — Dynamic pricing display for city SEO pages
 * 
 * Shows representative price ranges based on the city's primary ZIP.
 * Falls back to generic CTA if no pricing data available.
 */
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, HardHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCityDisplayPricing } from '@/hooks/useCityDisplayPricing';
import { getCityDisplayPricingSync, type CityPriceEntry } from '@/lib/cityDisplayPricing';

interface CityPricingBlockProps {
  citySlug: string;
  cityName: string;
  /** Show heavy material section */
  showHeavy?: boolean;
}

function PriceCard({ entry }: { entry: CityPriceEntry }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/40 transition-colors">
      <div className="text-3xl font-black text-foreground">{entry.sizeYd}</div>
      <div className="text-xs text-muted-foreground mb-3">YARD DUMPSTER</div>
      <div className="text-lg font-bold text-primary">{entry.formatted}</div>
      {entry.includedTons > 0 && (
        <div className="text-xs text-muted-foreground mt-1">
          {entry.includedTons} ton{entry.includedTons !== 1 ? 's' : ''} included
        </div>
      )}
    </div>
  );
}

export default function CityPricingBlock({ citySlug, cityName, showHeavy = true }: CityPricingBlockProps) {
  const { data: pricing, isLoading } = useCityDisplayPricing(citySlug);

  // Use sync fallback while loading
  const displayData = pricing || getCityDisplayPricingSync(cityName);

  if (isLoading) {
    return (
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  // If no pricing at all, show CTA only
  if (!displayData.generalPrices.length) {
    return (
      <section className="section-padding bg-muted/30">
        <div className="container-wide text-center">
          <h2 className="heading-lg text-foreground mb-4">Get Exact Pricing for {cityName}</h2>
          <p className="text-muted-foreground mb-6">Enter your ZIP code for transparent, instant pricing.</p>
          <Button asChild variant="cta" size="lg">
            <Link to="/quote">Get Exact Price for Your ZIP <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-wide">
        <h2 className="heading-lg text-foreground mb-3 text-center">
          <Truck className="w-6 h-6 inline-block mr-2 text-primary" />
          Typical Dumpster Pricing in {cityName}
        </h2>
        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          Representative pricing for {cityName} addresses. Your exact price is based on ZIP code, material type, and delivery timing.
        </p>

        {/* General Debris */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          {displayData.generalPrices.map(entry => (
            <PriceCard key={entry.sizeYd} entry={entry} />
          ))}
        </div>

        {/* Heavy Materials */}
        {showHeavy && displayData.heavyPrices.length > 0 && (
          <>
            <h3 className="heading-md text-foreground mb-4 text-center">
              <HardHat className="w-5 h-5 inline-block mr-2 text-primary" />
              Heavy Material Containers in {cityName}
            </h3>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Clean concrete, soil & dirt — flat fee, no weight overage
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-6">
              {displayData.heavyPrices.map(entry => (
                <PriceCard key={`heavy-${entry.sizeYd}`} entry={entry} />
              ))}
            </div>
          </>
        )}

        {/* Disclaimer + CTA */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground mb-4">{displayData.disclaimer}</p>
          <Button asChild variant="cta" size="lg">
            <Link to="/quote">Get Exact Price for {cityName} <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
