// Platform Positioning Sections — Technology-Driven Logistics Messaging
import { 
  Cpu, MapPin, Clock, Truck, Route, Shield, CreditCard, Phone,
  CheckCircle, ArrowRight, Users, Scale, FileText, 
  BarChart3, Layers, Bot, Wrench, RefreshCw, Package
} from 'lucide-react';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import serviceCycleImg from '@/assets/images/calsan-service-cycle.jpg';

// ─── SECTION 2: How Our System Works ─────────────────────────
export function HowSystemWorksSection() {
  const capabilities = [
    { icon: MapPin, text: 'We operate real yards in Oakland and San Jose, so your dumpster is always nearby' },
    { icon: Clock, text: 'Our system matches your ZIP code to the closest yard for faster scheduling' },
    { icon: Route, text: 'Drivers are routed to certified local disposal facilities automatically' },
    { icon: BarChart3, text: 'Track your service from delivery to pickup with transparent status updates' },
    { icon: Scale, text: 'Clear weight limits and pricing shown upfront, no surprise fees' },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-wide">
        <AnimatedSection className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Local Service, Smart Operations
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            A Local Dumpster Company Built on Better Technology
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Calsan Dumpsters Pro is a local dumpster rental company serving Oakland, San Jose, San Francisco,
            and the greater Bay Area. We use technology to streamline scheduling, routing, and pricing so you
            get reliable service with full transparency from quote to pickup.
          </p>
        </AnimatedSection>

        <StaggeredContainer className="max-w-2xl mx-auto space-y-4">
          {capabilities.map(({ icon: Icon, text }) => (
            <AnimatedItem key={text} variant="fadeUp">
              <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm md:text-base text-foreground font-medium">{text}</span>
              </div>
            </AnimatedItem>
          ))}
        </StaggeredContainer>

        <AnimatedSection className="text-center mt-10">
          <p className="text-sm text-muted-foreground italic max-w-lg mx-auto">
            Real local yards. Technology-driven operations. Serving the SF Bay Area since day one.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── SECTION 3: Real-Time Delivery Intelligence ──────────────
export function DeliveryIntelligenceSection() {
  const calculations = [
    'Yard-to-site distance',
    'Estimated service window',
    'Full service cycle time',
    'Disposal routing',
    'Driver completion confirmation',
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container-wide">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              <BarChart3 className="w-3.5 h-3.5" />
              Delivery Intelligence
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Delivery Intelligence
            </h2>
            <p className="text-muted-foreground mb-6">
              Our platform calculates key logistics data so you know what to expect before we dispatch.
            </p>
            <p className="text-sm text-muted-foreground italic">
              Operational routing estimates — not guesswork.
            </p>
          </AnimatedSection>

          <StaggeredContainer className="space-y-3">
            {calculations.map((item) => (
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
  );
}

// ─── SECTION 4: Full Service Cycle Transparency ──────────────
export function ServiceCycleSection() {
  const steps = [
    'Load preparation at yard',
    'Travel to delivery site',
    'Drop-off time',
    'Pickup secure time',
    'Travel to disposal facility',
    'Dump time',
    'Return to yard',
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-wide">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <RefreshCw className="w-3.5 h-3.5" />
            Full Cycle
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Full Service Cycle Transparency
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We estimate the complete service cycle. Customers see structured timing ranges — not guesswork.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          <StaggeredContainer>
            {steps.map((step, i) => (
              <AnimatedItem key={step} variant="fadeUp">
                <div className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <span className="text-sm text-foreground">{step}</span>
                </div>
              </AnimatedItem>
            ))}
          </StaggeredContainer>

          <AnimatedSection>
            <img
              src={serviceCycleImg}
              alt="Calsan truck at disposal facility with concrete debris"
              className="w-full rounded-2xl border-4 border-[hsl(140,40%,75%)] shadow-lg"
              loading="lazy"
            />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 5: AI Dumpster Assistant ────────────────────────
export function AIDumpsterAssistantSection() {
  const assists = [
    { icon: Package, text: 'Correct dumpster size' },
    { icon: Layers, text: 'Material classification' },
    { icon: Scale, text: 'Heavy vs general rules' },
    { icon: BarChart3, text: 'Weight limitations' },
    { icon: Truck, text: 'Delivery eligibility' },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container-wide">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <Bot className="w-3.5 h-3.5" />
            AI Assistant
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Intelligent Dumpster Assistant
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Technology-supported guidance — like a logistics coordinator, not a salesperson.
          </p>
        </AnimatedSection>

        <StaggeredContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {assists.map(({ icon: Icon, text }) => (
            <AnimatedItem key={text} variant="fadeUp">
              <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{text}</span>
              </div>
            </AnimatedItem>
          ))}
        </StaggeredContainer>
      </div>
    </section>
  );
}

// ─── SECTION 6: Built for Contractors ────────────────────────
export function BuiltForContractorsSection() {
  const features = [
    'Live Load timing controls',
    'Swap scheduling',
    'Dump & Return services',
    'Multi-container ordering',
    'Custom service item creation',
    'Transparent overage tracking',
    'Digital dump ticket uploads',
    'Structured dispatch coordination',
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-wide">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              <Wrench className="w-3.5 h-3.5" />
              Pro Features
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Built for Contractors & Builders
            </h2>
            <p className="text-muted-foreground mb-6">
              Our internal logistics system supports the most demanding job sites.
            </p>
            <p className="text-sm text-muted-foreground italic">
              We operate like a logistics partner — not just a vendor.
            </p>
          </AnimatedSection>

          <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature) => (
              <AnimatedItem key={feature} variant="fadeUp">
                <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs md:text-sm text-foreground">{feature}</span>
                </div>
              </AnimatedItem>
            ))}
          </StaggeredContainer>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 7: Secure Digital Operations ────────────────────
export function SecureDigitalSection() {
  const features = [
    { icon: Shield, text: 'PCI-DSS compliant payments' },
    { icon: CreditCard, text: 'Authorize.Net secure gateway' },
    { icon: Phone, text: 'SMS verification' },
    { icon: FileText, text: 'Digital receipts' },
    { icon: Users, text: 'Customer portal access' },
    { icon: Clock, text: 'Order timeline tracking' },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container-wide">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <Shield className="w-3.5 h-3.5" />
            Secure Operations
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Secure Payments & Digital Records
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every service is recorded. Every transaction is traceable.
          </p>
        </AnimatedSection>

        <StaggeredContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {features.map(({ icon: Icon, text }) => (
            <AnimatedItem key={text} variant="fadeUp">
              <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{text}</span>
              </div>
            </AnimatedItem>
          ))}
        </StaggeredContainer>
      </div>
    </section>
  );
}

// ─── SECTION 8: Why We're Different ──────────────────────────
export function WhyDifferentSection() {
  const traditional = [
    'Manual quotes over the phone',
    'No delivery window visibility',
    'Hidden weight confusion',
    'No service timeline',
    'National broker — no local yard',
  ];

  const calsan = [
    'Structured dispatch process',
    'Routing-based delivery estimation',
    'Transparent weight policies',
    'Heavy material expertise',
    'Technology-supported scheduling',
    'Bilingual support',
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-wide">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Why Calsan Operates Differently
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Traditional */}
          <AnimatedSection>
            <div className="p-6 bg-muted/50 border border-border rounded-2xl h-full">
              <h3 className="font-bold text-foreground mb-4 text-lg">Traditional Dumpster Company</h3>
              <ul className="space-y-3">
                {traditional.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          {/* Calsan */}
          <AnimatedSection>
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl h-full">
              <h3 className="font-bold text-foreground mb-4 text-lg">Calsan Logistics Platform</h3>
              <ul className="space-y-3">
                {calsan.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection className="text-center mt-10">
          <Button asChild variant="cta" size="lg" className="group">
            <Link to="/quote">
              Get a Structured Quote
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
