import { motion } from 'framer-motion';
import { MapPin, Truck, Trash2, CheckCircle, ArrowRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import { IconCircle } from '@/components/shared/IconCircle';
const calsanVideo = '/videos/calsan-how-it-works.mp4';

interface Step {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
  status: string;
}

const steps: Step[] = [
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
    description: 'Same-day may be available',
    status: 'Pending confirmation',
  },
  {
    icon: CheckCircle,
    number: '04',
    title: 'We handle pickup',
    description: 'Text when done',
    status: 'Reliable service',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container-wide">
        {/* Header - Minimal */}
        <AnimatedSection className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Simple process
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Four steps. No friction.
          </h2>
        </AnimatedSection>

        {/* Steps - Timeline style */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connection line */}
          <div className="absolute top-8 left-8 right-8 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 hidden md:block" />
          
          <StaggeredContainer className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {steps.map((step, index) => (
              <AnimatedItem key={step.title} variant="fadeUp">
                <div className="relative group h-full">
                  {/* Step card */}
                  <motion.div 
                    className="relative z-10 bg-card rounded-2xl border border-border p-5 md:p-6 h-full"
                    whileHover={{ 
                      borderColor: 'hsl(var(--primary) / 0.3)',
                      boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.2)',
                      y: -4
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Number badge */}
                    <div className="absolute -top-3 left-4 px-2.5 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                      {step.number}
                    </div>
                    
                    {/* Icon with IconCircle */}
                    <div className="mb-4">
                      <IconCircle 
                        icon={step.icon} 
                        size="lg" 
                        variant="primary" 
                        hoverEffect 
                      />
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    
                    {/* Status indicator */}
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-success/10 rounded-full text-xs font-medium text-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                      {step.status}
                    </div>
                  </motion.div>
                  
                  {/* Arrow connector (mobile hidden) */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-1/2 -right-4 z-20 hidden md:block">
                      <ArrowRight className="w-6 h-6 text-muted-foreground/30" strokeWidth={2} />
                    </div>
                  )}
                </div>
              </AnimatedItem>
            ))}
          </StaggeredContainer>
        </div>

        {/* Video Explainer */}
        <AnimatedSection delay={0.2} className="max-w-3xl mx-auto mt-12">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border bg-card">
            <video
              className="w-full aspect-video"
              controls
              playsInline
              preload="none"
            >
              <source src={calsanVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-3">
            Watch how dumpster rental works with Calsan
          </p>
        </AnimatedSection>

        {/* CTA - Minimal */}
        <AnimatedSection delay={0.4} className="text-center mt-10">
          <Button asChild variant="default" size="lg" className="group">
            <a href="#quote">
              Get instant estimate
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
            </a>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
