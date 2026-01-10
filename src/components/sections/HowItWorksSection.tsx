import { ClipboardCheck, Truck, HardHat, PhoneCall, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: ClipboardCheck,
    number: '1',
    title: 'Get a Quote',
    description: 'Tell us your project type, location, and preferred size. Get instant pricing in seconds.',
  },
  {
    icon: Truck,
    number: '2',
    title: 'We Deliver',
    description: 'Same-day or scheduled delivery. We place the dumpster exactly where you need it.',
  },
  {
    icon: HardHat,
    number: '3',
    title: 'Fill It Up',
    description: 'Take your time—standard rental is 7 days. Load at your own pace.',
  },
  {
    icon: PhoneCall,
    number: '4',
    title: 'We Haul Away',
    description: 'Call or text when ready. We pick up within 1-3 business days.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="section-padding bg-muted">
      <div className="container-wide">
        <div className="text-center mb-10">
          <h2 className="heading-lg text-foreground mb-3">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Renting a dumpster is easy. Four simple steps from quote to haul-away.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 mb-10">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              {/* Connector Line (hidden on mobile, shown on lg) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-border z-0" />
              )}
              
              <div className="relative z-10 bg-card rounded-2xl border border-border p-6 text-center hover:border-primary/30 hover:shadow-card-hover transition-all h-full">
                {/* Step Number Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary mb-4">
                  <step.icon className="w-8 h-8" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild variant="cta" size="lg">
            <Link to="/#quote">
              Get Your Instant Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
