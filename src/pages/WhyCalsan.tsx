// /why-calsan — Expert Dumpster Rental Positioning Page
import { Layout } from '@/components/layout/Layout';
import {
  Truck, MapPin, Scale, Clock, Bot, CheckCircle,
  ArrowRight, Building2, Shield, Route, Users, FileText
} from 'lucide-react';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function WhyCalsan() {
  return (
    <Layout
      title="Dumpster Rental Done Right"
      description="Learn why Calsan Dumpsters Pro manages dispatch directly through local yard operations, structured routing, and technology-enhanced service across the Bay Area."
      canonical="/why-calsan"
    >
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container-wide relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-foreground leading-tight">
              Dumpster Rental Done Right
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              We manage dispatch directly, operate through local yards, and use structured technology to deliver reliable dumpster service across the Bay Area.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="cta" size="lg">
                <Link to="/quote">
                  Get Your Quote
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Not a Marketplace */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
                <Building2 className="w-3.5 h-3.5" />
                Direct Operations
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Not a Marketplace. Not a Broker.
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We do not resell capacity from unknown vendors. Calsan manages dispatch directly through local yard partnerships, so your dumpster comes from a real facility near your project.
              </p>
            </AnimatedSection>
            <StaggeredContainer className="space-y-3">
              {[
                'We manage dispatch coordination internally',
                'We operate through established local yard partnerships',
                'Structured routing for every delivery and pickup',
                'You always know where your dumpster is coming from',
              ].map((item) => (
                <AnimatedItem key={item} variant="fadeUp">
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                </AnimatedItem>
              ))}
            </StaggeredContainer>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="container-wide"><div className="border-t border-border/50" /></div>

      {/* Section 2: Built for Contractors */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <StaggeredContainer className="space-y-3 order-2 md:order-1">
              {[
                'Heavy material control with clear fill-line rules',
                'Weight enforcement communicated before delivery',
                'Transparent overage policy with no hidden fees',
                'Multi-container ordering for large projects',
                'Swap scheduling for ongoing construction',
                'Digital dump ticket uploads for accountability',
              ].map((item) => (
                <AnimatedItem key={item} variant="fadeUp">
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                </AnimatedItem>
              ))}
            </StaggeredContainer>
            <AnimatedSection className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
                <Scale className="w-3.5 h-3.5" />
                Contractor-Grade
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Built for Contractors and Builders
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our systems are designed around construction timelines, repeat orders, and heavy material management. We handle the details so you can focus on the job.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="container-wide"><div className="border-t border-border/50" /></div>

      {/* Section 3: Precision Scheduling */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-wide">
          <AnimatedSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              <Clock className="w-3.5 h-3.5" />
              Precision Scheduling
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Structured Service Timing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We estimate the complete service cycle so you can plan your project with confidence.
            </p>
          </AnimatedSection>

          <StaggeredContainer className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Route, title: 'Delivery ETA', desc: 'Estimated windows based on yard proximity and routing' },
              { icon: Truck, title: 'Service Cycle', desc: 'Prep, travel, drop, pickup, dump, and return — all tracked' },
              { icon: MapPin, title: 'Disposal Routing', desc: 'Drivers routed to certified local disposal facilities' },
            ].map(({ icon: Icon, title, desc }) => (
              <AnimatedItem key={title} variant="fadeUp">
                <div className="p-6 bg-card border border-border rounded-2xl text-center h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </AnimatedItem>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* Section 4: AI-Supported Operations */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
                <Bot className="w-3.5 h-3.5" />
                Technology-Enhanced
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Technology-Supported Operations
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We use technology to route leads, automate follow-ups, and keep you informed at every step. No black boxes — just better coordination.
              </p>
            </AnimatedSection>
            <StaggeredContainer className="space-y-3">
              {[
                { icon: Users, text: 'Smart lead routing to the right team member' },
                { icon: FileText, text: 'Intelligent follow-up based on your project' },
                { icon: Shield, text: 'Real-time tracking from delivery to pickup' },
                { icon: MapPin, text: 'ZIP-based pricing with no guesswork' },
              ].map(({ icon: Icon, text }) => (
                <AnimatedItem key={text} variant="fadeUp">
                  <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                    <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{text}</span>
                  </div>
                </AnimatedItem>
              ))}
            </StaggeredContainer>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-wide text-center">
          <AnimatedSection>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Get a transparent quote in under 60 seconds. No hidden fees, no brokers, just local service.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="cta" size="lg" className="group">
                <Link to="/quote">
                  Get Your Quote
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/sizes">
                  View Dumpster Sizes
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
