// Brand Positioning Sections — Timeline Credibility + What Makes Us Different
import {
  MapPin, Truck, Users, Bot, CheckCircle, ArrowRight,
  Calendar, Building2, Headphones, Cpu
} from 'lucide-react';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// ─── Timeline Credibility ────────────────────────────────────
export function TimelineCredibilitySection() {
  const milestones = [
    {
      year: '2009',
      icon: Truck,
      title: 'Founded in Hauling',
      text: 'We started in hauling, junk removal, construction debris, and material logistics across the Bay Area.',
    },
    {
      year: '2015',
      icon: Building2,
      title: 'Specialized in Roll-Off Rentals',
      text: 'We focused exclusively on roll-off dumpster rentals and contractor-focused material delivery.',
    },
    {
      year: '2020',
      icon: Headphones,
      title: 'Remote Operations',
      text: 'During the pandemic, we transitioned to remote sales, customer service, and dispatch operations.',
    },
    {
      year: 'Today',
      icon: Cpu,
      title: 'Structured Logistics',
      text: 'We operate with structured logistics and technology-enhanced systems for accuracy and speed.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-wide">
        <AnimatedSection className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <Calendar className="w-3.5 h-3.5" />
            Our Story
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Built on Experience. Powered by Logistics.
          </h2>
          <p className="text-lg text-muted-foreground">
            Serving the Bay Area Since 2015.
          </p>
        </AnimatedSection>

        <StaggeredContainer className="max-w-3xl mx-auto space-y-0">
          {milestones.map(({ year, icon: Icon, title, text }, i) => (
            <AnimatedItem key={year} variant="fadeUp">
              <div className="flex gap-6 relative">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center flex-shrink-0 z-10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="w-px flex-1 bg-border min-h-[2rem]" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-8">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{year}</span>
                  <h3 className="text-lg font-semibold text-foreground mt-1">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{text}</p>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </StaggeredContainer>
      </div>
    </section>
  );
}

// ─── What Makes Us Different ─────────────────────────────────
export function WhatMakesDifferentSection() {
  const blocks = [
    {
      icon: MapPin,
      title: 'Local Yard Strategy',
      points: [
        'We operate through strategically located local yards',
        'Faster delivery windows from yards close to your project',
        'Better control of dispatch and service timing',
      ],
    },
    {
      icon: Truck,
      title: 'Structured Dispatch',
      points: [
        'Defined service cycle from start to finish',
        'Yard to Delivery to Pickup to Disposal to Return',
        'Transparent logistics at every stage',
      ],
    },
    {
      icon: Users,
      title: 'Contractor-Grade Systems',
      points: [
        'Designed for repeat customers and volume',
        'Built around construction timelines',
        'Designed to scale with your business',
      ],
    },
    {
      icon: Bot,
      title: 'Technology-Enhanced Service',
      points: [
        'Automated follow-ups and status updates',
        'Smart scheduling based on yard proximity',
        'Accurate pricing engine by ZIP code',
      ],
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container-wide">
        <AnimatedSection className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            What Makes Calsan Different
          </h2>
          <p className="text-muted-foreground">
            We combine local yard operations with structured technology to deliver reliable, transparent dumpster service.
          </p>
        </AnimatedSection>

        <StaggeredContainer className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {blocks.map(({ icon: Icon, title, points }) => (
            <AnimatedItem key={title} variant="fadeUp">
              <div className="p-6 bg-card border border-border rounded-2xl h-full">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
                <ul className="space-y-2">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedItem>
          ))}
        </StaggeredContainer>

        <AnimatedSection className="text-center mt-10">
          <Button asChild variant="cta" size="lg" className="group">
            <Link to="/why-calsan">
              Learn More About Calsan
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
