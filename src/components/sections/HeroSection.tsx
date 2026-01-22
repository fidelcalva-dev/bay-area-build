import { motion, Variants } from 'framer-motion';
import { Phone, MessageSquare, Star, Shield, Award } from 'lucide-react';
import { InstantQuoteCalculatorV3 } from '@/components/quote/InstantQuoteCalculatorV3';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/shared-data';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const TRUST_ITEMS = [
  { icon: Star, label: '4.9★ Google Reviews' },
  { icon: Shield, label: 'BBB A+ (Oakland HQ)' },
  { icon: Award, label: 'Licensed & Insured' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--accent)/0.15)_0%,_transparent_50%)]" />
      
      <div className="container-wide relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-8 md:py-12 lg:py-20">
          {/* Left Content - Simplified */}
          <motion.div 
            className="text-center lg:text-left space-y-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* H1 - Clear value prop */}
            <motion.div variants={fadeInUp}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-[1.1] tracking-tight">
                ZIP-Based Dumpster Rentals
                <span className="block text-accent mt-1">with Local Yards</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-primary-foreground/80">
                Instant estimates · Nearest yard selected · Estimated time windows
              </p>
            </motion.div>

            {/* 2 CTAs Only */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
              <Button 
                asChild
                variant="cta" 
                size="lg"
                className="flex-1 text-lg font-bold shadow-lg"
              >
                <a href="#quote">
                  Get Instant Quote
                </a>
              </Button>
              
              <Button 
                asChild
                variant="outline" 
                size="lg"
                className="flex-1 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <a href={`sms:${BUSINESS_INFO.phone.sales}`}>
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Text Us
                </a>
              </Button>
            </motion.div>

            {/* Trust Strip - Single Line */}
            <motion.div variants={fadeIn} className="pt-2">
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4">
                {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                  <div 
                    key={label}
                    className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/80"
                  >
                    <Icon className="w-4 h-4 text-accent" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
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
            
            <InstantQuoteCalculatorV3 />
          </motion.div>
        </div>
      </div>
    </section>
  );
}