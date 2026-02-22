import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  MapPin, ArrowRight, Truck, CheckCircle, 
  Calendar, Eye, MessageSquare, Clock
} from 'lucide-react';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import { IconCircle } from '@/components/shared/IconCircle';
import { HOW_IT_WORKS_STEPS, CATEGORY_PHRASE } from '@/lib/categoryPositioning';
import { BUSINESS_INFO } from '@/lib/seo';
const calsanVideo = '/videos/calsan-how-it-works.mp4';

const STEP_ICONS = [MapPin, Truck, Eye, Calendar, MessageSquare];

export default function HowItWorks() {
  return (
    <Layout
      title="How It Works | Dumpster Rental Process"
      description="Five simple steps to rent a dumpster. Enter ZIP, get quote, schedule delivery, and manage everything online. Same-day delivery available."
      canonical="/how-it-works"
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <AnimatedSection className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm mb-4">
              <CheckCircle className="w-4 h-4" />
              Simple & Fast
            </div>
            <h1 className="heading-xl mb-4">How It Works</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">
              Renting a dumpster should be easy. Enter your ZIP, pick a size, and schedule 
              delivery—all in under 5 minutes. No phone calls required.
            </p>
            <Button asChild variant="cta" size="lg">
              <Link to="/#quote">
                Start Your Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Steps */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <AnimatedSection className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">
              Five Steps to Your Dumpster
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our {CATEGORY_PHRASE.toLowerCase()} model makes the process transparent and predictable.
            </p>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto">
            {HOW_IT_WORKS_STEPS.map((step, index) => {
              const Icon = STEP_ICONS[index] || CheckCircle;
              const isLast = index === HOW_IT_WORKS_STEPS.length - 1;
              
              return (
                <AnimatedSection key={step.step} delay={index * 0.1}>
                  <div className="relative flex gap-6 pb-12">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold z-10">
                        {step.step}
                      </div>
                      {!isLast && (
                        <div className="w-0.5 flex-1 bg-gradient-to-b from-primary to-primary/20 mt-2" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors">
                        <div className="flex items-start gap-4">
                          <IconCircle icon={Icon} size="lg" variant="primary" className="flex-shrink-0 hidden sm:flex" />
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground mb-2">
                              {step.title}
                            </h3>
                            <p className="text-muted-foreground mb-3">
                              {step.description}
                            </p>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full text-xs font-medium text-primary">
                              <CheckCircle className="w-3 h-3" />
                              {step.detail}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <AnimatedSection className="text-center mb-8">
            <h2 className="heading-md text-foreground mb-4">
              See It in Action
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Watch how simple it is to get a dumpster delivered to your location.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border bg-card">
              <video
                className="w-full aspect-video"
                controls
                playsInline
                preload="metadata"
              >
                <source src={calsanVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <AnimatedSection className="text-center mb-10">
            <h2 className="heading-lg text-foreground mb-4">
              Why Customers Love Our Process
            </h2>
          </AnimatedSection>

          <StaggeredContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Clock,
                title: 'Under 5 Minutes',
                description: 'Complete your quote and schedule delivery in minutes, not hours.',
              },
              {
                icon: MapPin,
                title: 'No Phone Calls',
                description: 'Everything online. Call only if you want to—we\'re here either way.',
              },
              {
                icon: Truck,
                title: 'Same-Day Available',
                description: 'When inventory allows, get your dumpster the same day.',
              },
              {
                icon: MessageSquare,
                title: 'Text Updates',
                description: 'Delivery confirmations and pickup reminders via text.',
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

      {/* FAQ Quick Section */}
      <section className="section-padding bg-muted">
        <div className="container-narrow">
          <AnimatedSection className="bg-card rounded-2xl border border-border p-8">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">
              Quick Answers
            </h3>
            <div className="grid gap-4">
              {[
                {
                  q: 'Do I need to be home for delivery?',
                  a: 'Not necessarily. Just tell us where to place the dumpster and ensure the area is accessible.',
                },
                {
                  q: 'How do I schedule pickup?',
                  a: 'Text us, call, or use your online portal. We typically pick up within 1-3 business days.',
                },
                {
                  q: 'What if I need it longer than 7 days?',
                  a: 'No problem. Extra days are $35/day. Just let us know before your rental ends.',
                },
              ].map((faq, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-xl">
                  <p className="font-semibold text-foreground mb-1">{faq.q}</p>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/pricing" className="text-sm text-primary font-medium hover:underline">
                View full FAQ & pricing details →
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Enter your ZIP code and get an instant quote. No commitment, no phone calls required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/#quote">
                Get Instant Quote
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="bg-white/10 border-white/20 hover:bg-white/20 text-primary-foreground">
              <Link to="/why-local-yards">
                Why Local Yards Matter
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
