import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  MapPin, ArrowRight, Truck, CheckCircle, Building2,
  Users, Phone, Shield, AlertCircle
} from 'lucide-react';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import { IconCircle } from '@/components/shared/IconCircle';
import { BrokerComparisonTable, SimplifiedComparison } from '@/components/shared/BrokerComparisonTable';
import { OPERATIONAL_MODEL, CATEGORY_TAGLINE } from '@/lib/categoryPositioning';
import { BUSINESS_INFO, OPERATIONAL_YARDS } from '@/lib/seo';

export default function NotABroker() {
  return (
    <Layout
      title="We're Not a Broker | Local Yard Dumpster Operator"
      description="Calsan Dumpsters Pro is not a broker. We own our fleet, operate local yards, and dispatch directly. Transparent pricing, real accountability."
      canonical="/not-a-broker"
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <AnimatedSection className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm mb-4">
              <Shield className="w-4 h-4" />
              Transparency Matters
            </div>
            <h1 className="heading-xl mb-4">We're Not a Broker</h1>
            <p className="text-xl text-primary-foreground/85 mb-4">
              {CATEGORY_TAGLINE}
            </p>
            <p className="text-primary-foreground/70 mb-6">
              We own our dumpsters. We operate our yards. We dispatch directly. 
              That means better service, transparent pricing, and real accountability.
            </p>
            <Button asChild variant="cta" size="lg">
              <Link to="/quote">
                Get Instant Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* What We Do */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <h2 className="heading-lg text-foreground mb-6">
                How We Actually Operate
              </h2>
              <div className="space-y-4">
                {OPERATIONAL_MODEL.points.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <p className="text-foreground">{point}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-sm text-muted-foreground italic flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                  {OPERATIONAL_MODEL.disclaimer}
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Our Bay Area Yards
                </h3>
                <div className="space-y-3">
                  {OPERATIONAL_YARDS.map((yard) => (
                    <div key={yard.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground text-sm">{yard.name}</p>
                        <p className="text-xs text-muted-foreground">{yard.city}, {yard.state}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Link 
                    to="/locations" 
                    className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    View all locations
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <AnimatedSection className="text-center mb-10">
            <h2 className="heading-lg text-foreground mb-4">
              Broker vs. Local Yard Operator
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Understand the difference between booking through a broker and working 
              directly with a yard-based operator.
            </p>
          </AnimatedSection>

          {/* Desktop Table */}
          <AnimatedSection delay={0.1} className="hidden md:block max-w-4xl mx-auto">
            <BrokerComparisonTable />
          </AnimatedSection>

          {/* Mobile Simplified */}
          <AnimatedSection delay={0.1} className="md:hidden">
            <SimplifiedComparison />
          </AnimatedSection>
        </div>
      </section>

      {/* What This Means For You */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <AnimatedSection className="text-center mb-10">
            <h2 className="heading-lg text-foreground mb-4">
              What This Means for You
            </h2>
          </AnimatedSection>

          <StaggeredContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Truck,
                title: 'Reliable Delivery',
                description: 'We know where our dumpsters are and can commit to real delivery windows.',
              },
              {
                icon: MapPin,
                title: 'Transparent Pricing',
                description: 'No middleman markups. ZIP-based pricing from our system.',
              },
              {
                icon: Users,
                title: 'Direct Support',
                description: 'One team handles your order from quote to pickup. No runaround.',
              },
              {
                icon: Phone,
                title: 'Real Accountability',
                description: 'If something goes wrong, we own it. No finger-pointing.',
              },
            ].map((item) => (
              <AnimatedItem key={item.title} variant="fadeUp">
                <div className="bg-card rounded-2xl p-6 border border-border h-full text-center">
                  <IconCircle icon={item.icon} size="lg" variant="primary" className="mx-auto mb-4" />
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </AnimatedItem>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section-padding bg-primary/5">
        <div className="container-narrow">
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-3">
              Verified & Trusted
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              We're BBB A+ accredited, Google Guaranteed, and locally operated in Oakland. 
              Our reputation is built on transparency and service quality.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href={BUSINESS_INFO.social.bbb}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary font-medium hover:underline"
              >
                BBB Profile →
              </a>
              <a 
                href={BUSINESS_INFO.social.googleGuarantee}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary font-medium hover:underline"
              >
                Google Business →
              </a>
              <a 
                href={BUSINESS_INFO.social.yelp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary font-medium hover:underline"
              >
                Yelp Reviews →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Experience the Difference</h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Work directly with a local yard operator. Transparent pricing, reliable service, 
            real accountability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">
                Get Instant Quote
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="bg-white/10 border-white/20 hover:bg-white/20 text-primary-foreground">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-5 h-5" />
                {BUSINESS_INFO.phone.salesFormatted}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
