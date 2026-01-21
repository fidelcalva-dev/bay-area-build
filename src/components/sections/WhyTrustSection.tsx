import { ExternalLink } from 'lucide-react';
import { WHY_TRUST_CALSAN, COMPANY_FACTS, CERTIFICATION_LINKS } from '@/data/trustSignals';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import { IconCircle } from '@/components/shared/IconCircle';

export function WhyTrustSection() {
  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="container-wide">
        {/* Header */}
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Legitimate & verified
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Why Customers Trust Calsan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Factual reasons to trust us with your dumpster rental needs.
          </p>
        </AnimatedSection>

        {/* Trust Signals Grid with IconCircle */}
        <StaggeredContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-12">
          {WHY_TRUST_CALSAN.map((signal) => (
            <AnimatedItem key={signal.id} variant="fadeUp">
              <div className="group flex items-start gap-4 p-5 bg-background rounded-xl border border-border hover:border-primary/20 transition-colors">
                <IconCircle 
                  icon={signal.icon} 
                  size="md" 
                  variant="primary" 
                  hoverEffect 
                />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{signal.title}</h3>
                  <p className="text-sm text-muted-foreground">{signal.description}</p>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </StaggeredContainer>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="text-center p-5 bg-muted/50 rounded-xl">
            <div className="text-2xl lg:text-3xl font-bold text-primary mb-0.5">{COMPANY_FACTS.yearsInBusiness}+</div>
            <div className="text-sm text-muted-foreground">Years in Business</div>
          </div>
          <div className="text-center p-5 bg-muted/50 rounded-xl">
            <div className="text-2xl lg:text-3xl font-bold text-primary mb-0.5">{COMPANY_FACTS.countiesServed}</div>
            <div className="text-sm text-muted-foreground">Counties Served</div>
          </div>
          <div className="text-center p-5 bg-muted/50 rounded-xl">
            <div className="text-2xl lg:text-3xl font-bold text-primary mb-0.5">{COMPANY_FACTS.totalDeliveries}</div>
            <div className="text-sm text-muted-foreground">Deliveries Completed</div>
          </div>
          <div className="text-center p-5 bg-muted/50 rounded-xl">
            <div className="text-2xl lg:text-3xl font-bold text-primary mb-0.5">{COMPANY_FACTS.recommendationRate}%</div>
            <div className="text-sm text-muted-foreground">Would Recommend</div>
          </div>
        </div>

        {/* Verification Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <span className="text-muted-foreground">Verify our credentials:</span>
          <a 
            href={CERTIFICATION_LINKS.bbb} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            BBB Profile <ExternalLink className="w-3 h-3" strokeWidth={2} />
          </a>
          <a 
            href={CERTIFICATION_LINKS.googleBusiness} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Google Business <ExternalLink className="w-3 h-3" strokeWidth={2} />
          </a>
        </div>
      </div>
    </section>
  );
}
