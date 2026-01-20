import { MapPin, Truck, Trash2, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: MapPin,
    number: '01',
    title: 'Enter ZIP',
    description: 'Nearest yard auto-selected',
    status: '~30 sec',
  },
  {
    icon: Trash2,
    number: '02',
    title: 'Choose size',
    description: 'Smart recommendation included',
    status: 'Instant',
  },
  {
    icon: Truck,
    number: '03',
    title: 'Schedule delivery',
    description: 'Same-day available',
    status: 'Confirmed',
  },
  {
    icon: CheckCircle,
    number: '04',
    title: 'We handle pickup',
    description: 'Text when done',
    status: 'On-time guarantee',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container-wide">
        {/* Header - Minimal */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Simple process
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Four steps. No friction.
          </h2>
        </div>

        {/* Steps - Timeline style */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connection line */}
          <div className="absolute top-8 left-8 right-8 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 hidden md:block" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative group">
                {/* Step card */}
                <div className="relative z-10 bg-card rounded-2xl border border-border p-5 md:p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full">
                  {/* Number badge */}
                  <div className="absolute -top-3 left-4 px-2.5 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <step.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                  
                  {/* Status indicator */}
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-success/10 rounded-full text-xs font-medium text-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                    {step.status}
                  </div>
                </div>
                
                {/* Arrow connector (mobile hidden) */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-4 z-20 hidden md:block">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA - Minimal */}
        <div className="text-center mt-12">
          <Button asChild variant="default" size="lg" className="group">
            <Link to="/#quote">
              Get instant estimate
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
