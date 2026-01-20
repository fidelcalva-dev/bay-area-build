import { motion } from 'framer-motion';
import { Truck, DollarSign, MessageSquare, Shield, Zap, MapPin } from 'lucide-react';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';

const features = [
  {
    icon: Zap,
    title: 'Instant estimates',
    description: 'ZIP-based pricing. No calls needed.',
  },
  {
    icon: MapPin,
    title: 'Smart routing',
    description: 'Nearest yard auto-selected for faster delivery.',
  },
  {
    icon: DollarSign,
    title: 'Transparent pricing',
    description: 'All-inclusive. No surprise fees.',
  },
  {
    icon: MessageSquare,
    title: 'Text updates',
    description: 'Driver ETA, delivery confirmation, pickup reminder.',
  },
  {
    icon: Truck,
    title: 'Same-day available',
    description: 'Order by noon, delivered today.',
  },
  {
    icon: Shield,
    title: 'Google Guaranteed',
    description: 'Verified, licensed, and insured.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-wide">
        {/* Header - System style */}
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Platform features
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Built different
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Modern logistics technology, not a rental flyer.
          </p>
        </AnimatedSection>

        {/* Features Grid - Clean cards */}
        <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature) => (
            <AnimatedItem key={feature.title} variant="fadeUp">
              <motion.div
                className="group p-6 bg-card rounded-2xl border border-border h-full"
                whileHover={{ 
                  borderColor: 'hsl(var(--primary) / 0.2)',
                  boxShadow: '0 10px 30px -10px hsl(var(--foreground) / 0.1)',
                  y: -2
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                    <feature.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors duration-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatedItem>
          ))}
        </StaggeredContainer>
      </div>
    </section>
  );
}
