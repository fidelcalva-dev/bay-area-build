import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PhotoDumpsterCard } from '@/components/shared/PhotoDumpsterCard';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import { IconCircle } from '@/components/shared/IconCircle';

export function SizesPreviewSection() {
  const sizes = [10, 20, 30, 40] as const;

  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container-wide">
        {/* Header */}
        <AnimatedSection className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              <Truck className="w-3.5 h-3.5" strokeWidth={2} />
              Dumpster sizes
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Choose your size
            </h2>
            <p className="text-muted-foreground mt-2">
              Smart recommendation included in quote flow.
            </p>
          </div>
          <Button asChild variant="outline" size="default" className="group">
            <Link to="/sizes">
              View all sizes
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
            </Link>
          </Button>
        </AnimatedSection>

        {/* Technical Dumpster Cards Grid */}
        <StaggeredContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {sizes.map((size) => (
            <AnimatedItem key={size} variant="fadeUp">
              <PhotoDumpsterCard
                size={size}
                ctaLink="/quote"
                ctaLabel="Get Quote"
                imageMode="photo"
                showPrice={true}
              />
            </AnimatedItem>
          ))}
        </StaggeredContainer>

        {/* Heavy Materials Callout with IconCircle */}
        <AnimatedSection delay={0.3} className="mt-6 p-4 bg-card border border-border rounded-xl flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <IconCircle 
              icon={Weight} 
              size="md" 
              variant="warning" 
            />
            <div>
              <span className="font-semibold text-foreground">Heavy materials?</span>
              <span className="text-muted-foreground text-sm ml-2">
                Concrete, dirt, brick → 6/8/10 yard with flat fee pricing.
              </span>
            </div>
          </div>
          <Link 
            to="/sizes" 
            className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
          >
            View options
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
