// ============================================================
// HERO SECTION V2 - Uber-like Homepage Hero
// Prominent ZIP bar, fast-booking copy, minimal design
// ============================================================

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, MapPin, Truck, Clock, Shield, Star, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { PriceAnchor } from '@/components/shared/PriceAnchor';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';
import { BUSINESS_INFO } from '@/lib/shared-data';
import { analytics } from '@/lib/analytics';
import { useAutoDetectZip } from '@/hooks/useAutoDetectZip';
import { cn } from '@/lib/utils';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const TRUST_ITEMS = [
  { icon: Star, label: '4.9★ Google' },
  { icon: Shield, label: 'BBB A+' },
  { icon: Clock, label: 'Same-Day Available' },
];

interface HeroSectionV2Props {
  cityName?: string;
  countyName?: string;
}

export function HeroSectionV2({ cityName, countyName }: HeroSectionV2Props = {}) {
  const navigate = useNavigate();
  const [zipCode, setZipCode] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Auto-detect ZIP
  const autoDetectZip = useAutoDetectZip();
  
  useEffect(() => {
    if (autoDetectZip.zip && autoDetectZip.zip.length === 5 && !zipCode) {
      setZipCode(autoDetectZip.zip);
    }
  }, [autoDetectZip.zip]);

  const handleGetPrice = () => {
    if (zipCode.length === 5) {
      analytics.homepageCTAClick('get_instant_price');
      navigate(`/quote?zip=${zipCode}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && zipCode.length === 5) {
      handleGetPrice();
    }
  };

  const handleTrackOrder = () => {
    analytics.homepageCTAClick('track_order');
    // Navigate to portal tracking entry
    navigate('/portal/track');
  };

  const isValidZip = zipCode.length === 5 && /^\d{5}$/.test(zipCode);

  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center">
      {/* Local SEO Schema injection */}
      <LocalSEOSchema 
        cityName={cityName} 
        countyName={countyName}
        includeFAQ={true}
        includeService={true}
      />
      
      {/* Modern gradient background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--accent)/0.15)_0%,_transparent_50%)]" />
      
      <div className="container-wide relative py-12 md:py-20">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full text-sm font-medium text-primary-foreground/90 border border-primary-foreground/20">
              <MapPin className="w-4 h-4" />
              Local yards, not brokers
            </span>
          </motion.div>

          {/* Main Headline - Uber-like */}
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground leading-[1.1] tracking-tight mb-6"
          >
            {cityName ? (
              <>Dumpster rental in {cityName}</>
            ) : (
              <>Dumpster rental,<br className="hidden sm:block" /> booked in seconds</>
            )}
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto"
          >
            Instant ZIP-based pricing. Local yards. Fast delivery.
          </motion.p>

          {/* ZIP Input Bar - Primary CTA */}
          <motion.div 
            variants={fadeInUp}
            className="max-w-md mx-auto mb-6"
          >
            <div 
              className={cn(
                "relative flex items-center bg-white rounded-2xl shadow-xl transition-all duration-200",
                isFocused && "ring-4 ring-accent/30"
              )}
            >
              <div className="flex items-center pl-5 pr-3">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="Enter delivery ZIP"
                className="flex-1 h-14 md:h-16 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
              />
              <div className="pr-2">
                <Button
                  variant="cta"
                  size="lg"
                  onClick={handleGetPrice}
                  disabled={!isValidZip}
                  className="h-10 md:h-12 px-5 md:px-6 rounded-xl text-base font-bold shadow-none"
                >
                  <span className="hidden sm:inline">Get Instant Price</span>
                  <span className="sm:hidden">Get Price</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-primary-foreground/60 mt-3">
              We'll match you with the nearest yard and available dumpsters
            </p>
          </motion.div>

          {/* Price Anchor */}
          <motion.div variants={fadeInUp}>
            <PriceAnchor variant="hero" />
          </motion.div>

          {/* Secondary CTA - Track Order */}
          <motion.div variants={fadeInUp} className="mt-6">
            <Button
              variant="ghost"
              onClick={handleTrackOrder}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Truck className="w-4 h-4 mr-2" />
              Already ordered? Track your delivery
            </Button>
          </motion.div>

          {/* Trust Strip */}
          <motion.div variants={fadeInUp} className="mt-10 pt-8 border-t border-primary-foreground/10">
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div 
                  key={label}
                  className="flex items-center gap-2 text-sm text-primary-foreground/70"
                >
                  <Icon className="w-4 h-4 text-accent" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
