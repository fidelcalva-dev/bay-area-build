// ============================================================
// HOW IT WORKS V2 - Simplified 3-Step Strip
// Uber-like minimal flow visualization
// ============================================================

import { motion } from 'framer-motion';
import { MapPin, Package, Truck, ArrowRight } from 'lucide-react';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';

interface Step {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: '1',
    icon: MapPin,
    title: 'Enter ZIP',
    description: 'Get instant pricing from nearest yard',
  },
  {
    number: '2',
    icon: Package,
    title: 'Choose your dumpster',
    description: 'Smart recommendations based on your project',
  },
  {
    number: '3',
    icon: Truck,
    title: 'Confirm and track',
    description: 'Schedule later, track your delivery live',
  },
];

export function HowItWorksV2() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-wide">
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Book in 3 simple steps
          </h2>
          <p className="text-muted-foreground mt-2">
            60-second booking. Schedule whenever you're ready.
          </p>
        </AnimatedSection>

        <StaggeredContainer className="relative max-w-4xl mx-auto">
          {/* Connection line */}
          <div className="absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 hidden md:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <AnimatedItem key={step.title} variant="fadeUp">
                <div className="relative text-center group">
                  {/* Step number circle */}
                  <motion.div 
                    className="relative mx-auto mb-4 w-16 h-16 md:w-20 md:h-20 rounded-full bg-card border-2 border-border flex items-center justify-center z-10 group-hover:border-primary transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    <step.icon className="w-7 h-7 md:w-8 md:h-8 text-primary" strokeWidth={1.75} />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center">
                      {step.number}
                    </span>
                  </motion.div>
                  
                  {/* Content */}
                  <h3 className="font-bold text-foreground text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>

                  {/* Arrow connector (mobile) */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-4 md:hidden">
                      <ArrowRight className="w-5 h-5 text-muted-foreground/30 rotate-90" />
                    </div>
                  )}
                </div>
              </AnimatedItem>
            ))}
          </div>
        </StaggeredContainer>
      </div>
    </section>
  );
}
