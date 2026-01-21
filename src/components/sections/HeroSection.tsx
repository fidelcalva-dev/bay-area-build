import { motion, Variants } from 'framer-motion';
import { Zap, MapPin, Clock } from 'lucide-react';
import { InstantQuoteCalculatorV3 } from '@/components/quote/InstantQuoteCalculatorV3';
import { TrustStrip, StarRating } from '@/components/shared';

// Animation variants with proper typing
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

export function HeroSection() {
  const systemFeatures = [
    { icon: MapPin, label: 'Nearest yard auto-selected' },
    { icon: Zap, label: 'Instant ZIP-based estimate' },
    { icon: Clock, label: 'Same-day available' },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--accent)/0.15)_0%,_transparent_50%)]" />
      
      {/* Subtle grid pattern for tech feel */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--primary-foreground)) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="container-wide relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-8 md:py-12 lg:py-20">
          {/* Left Content - System-First Messaging */}
          <motion.div 
            className="text-center lg:text-left space-y-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Micro-indicator */}
            <motion.div 
              variants={fadeIn}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 backdrop-blur-sm rounded-full border border-primary-foreground/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-xs font-medium text-primary-foreground/80">
                Dispatch available now
              </span>
            </motion.div>

            {/* Headline - Tech-style */}
            <motion.div variants={fadeInUp}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-[1.1] tracking-tight">
                Dumpster logistics
                <span className="block text-accent mt-1">made simple</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-primary-foreground/70 max-w-lg">
                Enter your ZIP. Get an instant estimate. Schedule delivery. 
                <span className="text-primary-foreground font-medium"> That's it.</span>
              </p>
            </motion.div>

            {/* System Features - Inline indicators */}
            <motion.div 
              variants={staggerContainer}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {systemFeatures.map(({ icon: Icon, label }) => (
                <motion.div 
                  key={label}
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary-foreground/5 backdrop-blur-sm rounded-lg border border-primary-foreground/10 text-sm"
                >
                  <Icon className="w-4 h-4 text-accent" />
                  <span className="text-primary-foreground/90 font-medium">{label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Star Rating - Subtle */}
            <motion.div variants={fadeIn} className="pt-2">
              <StarRating 
                rating={4.9} 
                reviews={200} 
                variant="hero"
                className="justify-center lg:justify-start" 
              />
            </motion.div>

            {/* Trust Strip - Compact */}
            <motion.div variants={fadeIn}>
              <TrustStrip 
                badges={['googleGuaranteed', 'licensedInsured', 'hablamosEspanol']}
                variant="hero"
                size="sm"
                className="justify-center lg:justify-start" 
              />
            </motion.div>
          </motion.div>

          {/* Right - Quote Calculator with system styling */}
          <motion.div 
            id="quote"
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            className="relative"
          >
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-foreground/10 rounded-full blur-3xl" />
            
            <InstantQuoteCalculatorV3 />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
