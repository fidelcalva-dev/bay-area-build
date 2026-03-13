import { Layout } from '@/components/layout/Layout';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle, Cpu, Database, Route, Clock, 
  Bot, Users, BarChart3, Truck, Shield 
} from 'lucide-react';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';

const ENGINE_FEATURES = [
  { icon: Database, text: 'Yard inventory management' },
  { icon: Route, text: 'Route optimization' },
  { icon: Truck, text: 'Disposal facility routing' },
  { icon: Clock, text: 'Service cycle timing logic' },
  { icon: Bot, text: 'AI-assisted quoting' },
  { icon: Users, text: 'CRM integration' },
  { icon: BarChart3, text: 'Dispatch performance tracking' },
  { icon: Shield, text: 'Vendor fallback system' },
];

export default function Technology() {
  return (
    <Layout
      title="The Calsan Logistics Engine | Technology-Driven Dumpster Platform"
      description="Calsan integrates yard inventory, route optimization, AI-assisted quoting, and real-time dispatch into one logistics platform for the Bay Area."
      canonical="/technology"
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 rounded-full text-sm font-medium text-primary-foreground/80 mb-6">
              <Cpu className="w-3.5 h-3.5" />
              Platform Architecture
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight mb-6">
              The Calsan Logistics Engine
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
              We are building the operating system for waste logistics in the Bay Area.
            </p>
            <Button asChild variant="cta" size="lg" className="group">
              <Link to="/quote">
                Experience the Platform
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Engine Features */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              What Our Platform Integrates
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Calsan integrates multiple logistics systems into a single coordinated platform.
            </p>
          </AnimatedSection>

          <StaggeredContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {ENGINE_FEATURES.map(({ icon: Icon, text }) => (
              <AnimatedItem key={text} variant="fadeUp">
                <div className="flex items-center gap-3 p-5 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{text}</span>
                </div>
              </AnimatedItem>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-narrow text-center">
          <AnimatedSection>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Not Just a Dumpster Company
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              We combine real Bay Area yards with centralized logistics technology.
              We calculate routes, disposal timing, and delivery cycles before dispatching drivers.
              This means faster scheduling, fewer delays, and clearer pricing.
            </p>
            <Button asChild variant="cta" size="lg" className="group">
              <Link to="/quote">
                Get Your Smart Quote
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
