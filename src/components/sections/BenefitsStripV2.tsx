// ============================================================
// BENEFITS STRIP V2 - 3 Key Benefits Cards
// Uber-like value proposition display
// ============================================================

import { Zap, MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';

interface Benefit {
  icon: React.ElementType;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: Zap,
    title: 'Instant pricing',
    description: 'ZIP-based quotes in seconds. No calls, no waiting.',
  },
  {
    icon: MapPin,
    title: 'Local yard delivery',
    description: 'Matched to your nearest yard for fastest service.',
  },
  {
    icon: Navigation,
    title: 'Track your service',
    description: 'Real-time updates from booking to pickup.',
  },
];

export function BenefitsStripV2() {
  return (
    <section className="py-10 md:py-14 bg-muted/30 border-y border-border/50">
      <div className="container-wide">
        <StaggeredContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit) => (
            <AnimatedItem key={benefit.title} variant="fadeUp">
              <motion.div 
                className="flex items-start gap-4 p-5 md:p-6 bg-card rounded-2xl border border-border"
                whileHover={{ 
                  y: -4,
                  boxShadow: '0 10px 30px -10px hsl(var(--foreground) / 0.1)',
                  borderColor: 'hsl(var(--primary) / 0.2)',
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-primary" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            </AnimatedItem>
          ))}
        </StaggeredContainer>
      </div>
    </section>
  );
}
