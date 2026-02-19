import { motion, Variants } from 'framer-motion';
import { Phone, Zap, Clock, Users } from 'lucide-react';
import { MinimalQuoteCalculator } from '@/components/quote/MinimalQuoteCalculator';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/shared-data';
import { analytics } from '@/lib/analytics';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const BULLET_ITEMS = [
  { icon: Zap, text: 'Structured ZIP-based pricing' },
  { icon: Clock, text: 'Routing-based delivery estimation' },
  { icon: Users, text: 'Professional dispatch coordination' },
];

export function HeroSectionPlatform() {
  const handleCTAClick = (ctaType: string) => {
    analytics.homepageCTAClick(ctaType);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--accent)/0.15)_0%,_transparent_50%)]" />

      <div className="container-wide relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-8 md:py-12 lg:py-20">
          {/* Left Content */}
          <motion.div
            className="text-center lg:text-left space-y-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-[1.1] tracking-tight">
                Dumpster Rental by Zip Code – Fast & Reliable Service Near You
              </h1>
              <p className="mt-4 text-lg md:text-xl text-primary-foreground/80">
                Instant estimates. Contractor-friendly. Additional fees may apply for overages.
              </p>
            </motion.div>

            {/* Bullet Points */}
            <motion.div variants={fadeInUp} className="space-y-3">
              {BULLET_ITEMS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-primary-foreground/85">
                  <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm md:text-base font-medium">{text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
              <Button
                asChild
                variant="cta"
                size="lg"
                className="flex-1 text-lg font-bold shadow-lg"
                onClick={() => handleCTAClick('get_smart_quote')}
              >
                <a href="#quote">Get Your Smart Quote</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="flex-1 border-primary-foreground/30 text-accent hover:bg-primary-foreground/10"
                onClick={() => handleCTAClick('call_dispatch')}
              >
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                  <Phone className="w-5 h-5 mr-2 text-accent" />
                  Call Dispatch
                </a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right - Quote Calculator */}
          <motion.div
            id="quote"
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            className="relative"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-foreground/10 rounded-full blur-3xl" />
            <MinimalQuoteCalculator />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
