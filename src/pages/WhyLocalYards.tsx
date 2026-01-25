import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  MapPin, ArrowRight, Truck, Clock, DollarSign, 
  Shield, Users, AlertTriangle, CheckCircle, Building2 
} from 'lucide-react';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import { IconCircle } from '@/components/shared/IconCircle';
import { 
  LOCAL_YARD_BENEFITS, 
  DIFFERENTIATION_FAQS,
  CATEGORY_PHRASE 
} from '@/lib/categoryPositioning';
import { BUSINESS_INFO, OPERATIONAL_YARDS } from '@/lib/seo';
import { generateFAQSchema } from '@/lib/seo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const ICONS = {
  'faster-delivery': Clock,
  'real-availability': MapPin,
  'lower-cost': DollarSign,
  'fewer-surprises': Shield,
  'better-accountability': Users,
} as const;

export default function WhyLocalYards() {
  const faqSchema = generateFAQSchema(
    DIFFERENTIATION_FAQS.map(f => ({ question: f.question, answer: f.answer }))
  );

  return (
    <Layout
      title="Why Local Yards Matter | Dumpster Rental"
      description="Learn why yard-based dumpster operators outperform brokers. Faster delivery, transparent pricing, and better accountability from local yards."
      canonical="/why-local-yards"
      schema={faqSchema}
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <AnimatedSection className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm mb-4">
              <MapPin className="w-4 h-4" />
              {CATEGORY_PHRASE}
            </div>
            <h1 className="heading-xl mb-4">Why Local Yards Matter</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">
              Not all dumpster companies are the same. Yard-based operators deliver faster, 
              price more transparently, and provide better service than broker models.
            </p>
            <Button asChild variant="cta" size="lg">
              <Link to="/#quote">
                Get Instant Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* What Most Sites Don't Show */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <AnimatedSection className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">
              What Most Dumpster Websites Don't Show You
            </h2>
            <p className="text-lg text-muted-foreground">
              Many dumpster rental websites aren't actually dumpster companies. 
              They're lead brokers who sell your job to the lowest-bidding subcontractor.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Broker Model */}
            <AnimatedSection delay={0.1}>
              <div className="bg-muted/50 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground">Broker Model</h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    You submit a request online
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Broker shops your job to subcontractors
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Unknown vendor shows up (maybe on time)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    If issues arise, you're bounced between parties
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Final price may differ from quote
                  </li>
                </ul>
              </div>
            </AnimatedSection>

            {/* Local Yard Model */}
            <AnimatedSection delay={0.2}>
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">Local Yard Model</h3>
                </div>
                <ul className="space-y-3 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    You get a quote from our inventory
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    We dispatch from the nearest yard
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    Our driver delivers your dumpster
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    One team handles everything
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    Transparent pricing, no surprises
                  </li>
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <AnimatedSection className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">
              Why Distance to Yard Matters
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The location of your dumpster provider directly affects cost, speed, and service quality.
            </p>
          </AnimatedSection>

          <StaggeredContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {LOCAL_YARD_BENEFITS.map((benefit) => {
              const Icon = ICONS[benefit.id as keyof typeof ICONS] || MapPin;
              return (
                <AnimatedItem key={benefit.id} variant="fadeUp">
                  <div className="bg-card rounded-2xl p-6 border border-border h-full">
                    <IconCircle icon={Icon} size="lg" variant="primary" className="mb-4" />
                    <h3 className="font-bold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </AnimatedItem>
              );
            })}
          </StaggeredContainer>
        </div>
      </section>

      {/* Our Yards */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <h2 className="heading-lg text-foreground mb-4">
                Our Operational Yards
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We operate multiple yards across the Bay Area, strategically located to 
                minimize delivery distance and maximize service reliability.
              </p>
              <div className="grid gap-4">
                {OPERATIONAL_YARDS.map((yard) => (
                  <div key={yard.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{yard.name}</h4>
                      <p className="text-sm text-muted-foreground">{yard.address}</p>
                      {yard.note && (
                        <p className="text-xs text-primary mt-1">{yard.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Same-Day Delivery Available
              </h3>
              <p className="text-muted-foreground mb-6">
                Because we control our fleet and know our inventory in real-time, 
                we can offer same-day delivery when capacity allows. Brokers can't 
                make that promise because they don't control the equipment.
              </p>
              <Button asChild variant="cta" size="lg" className="w-full sm:w-auto">
                <Link to="/#quote">
                  Check Availability
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-muted">
        <div className="container-narrow">
          <AnimatedSection className="text-center mb-10">
            <h2 className="heading-lg text-foreground mb-4">Common Questions</h2>
          </AnimatedSection>

          <Accordion type="single" collapsible className="space-y-3">
            {DIFFERENTIATION_FAQS.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="bg-card rounded-xl border border-border px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready for Local Service?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Experience the difference with a dumpster company that operates from local yards, 
            not a call center.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/#quote">
                Get Instant Quote
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="bg-white/10 border-white/20 hover:bg-white/20 text-primary-foreground">
              <Link to="/how-it-works">
                See How It Works
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
