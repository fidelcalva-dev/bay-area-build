import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Phone, Shield, MapPin, DollarSign, Users } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/shared-data';
import { PriceAnchor } from '@/components/shared/PriceAnchor';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const TRUST_ROW = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: MapPin, label: 'Real Local Yards' },
  { icon: DollarSign, label: 'Transparent Pricing' },
  { icon: Users, label: 'Structured Dispatch Team' },
];

interface IndustrialHeroProps {
  cityName?: string;
  countyName?: string;
}

export function IndustrialHero({ cityName, countyName }: IndustrialHeroProps) {
  return (
    <section className="bg-card relative">
      <LocalSEOSchema cityName={cityName} countyName={countyName} includeFAQ includeService />

      <div className="container-wide py-16 md:py-24 lg:py-32">
        <motion.div
          className="max-w-3xl mx-auto text-center space-y-8"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* H1 */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight"
          >
            Dumpster Rental Made Simple
            <span className="block text-primary mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold">
              in the Bay Area
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.div variants={fadeUp} className="space-y-1 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            <p>Local yards in Oakland, San Jose & San Francisco.</p>
            <p>Clear pricing based on your ZIP, size, and material type.</p>
            <p>We'll guide you to the best option — no guesswork.</p>
          </motion.div>

          {/* Trust Row */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-x-6 gap-y-3 pt-2">
            {TRUST_ROW.map(({ icon: Icon, label }) => (
              <div key={label} className="inline-flex items-center gap-2 text-sm text-foreground/70">
                <Icon className="w-4 h-4 text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Price Anchor */}
          <motion.div variants={fadeUp}>
            <PriceAnchor variant="hero" />
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Button asChild variant="cta" size="lg" className="flex-1 text-lg font-bold">
              <a href="/quote">Check Price & Availability</a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="flex-1 border-foreground/20 text-foreground hover:bg-secondary"
            >
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-5 h-5 mr-2" />
                Talk to Dispatch
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
