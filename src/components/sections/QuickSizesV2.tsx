// ============================================================
// QUICK SIZES V2 - Common Sizes Quick Picks
// Simplified size selection for homepage
// ============================================================

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import { DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { motion } from 'framer-motion';

const COMMON_SIZES = [10, 20, 30, 40];

export function QuickSizesV2() {
  const sizesData = DUMPSTER_SIZES_DATA.filter(s => COMMON_SIZES.includes(s.yards));

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-wide">
        <AnimatedSection className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Most popular sizes
          </h2>
          <p className="text-muted-foreground mt-2">
            Not sure which? Our quote flow recommends the right size for your project.
          </p>
        </AnimatedSection>

        <StaggeredContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          {sizesData.map((sizeData) => (
            <AnimatedItem key={sizeData.yards} variant="fadeUp">
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.15)' }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={`/quote?size=${sizeData.yards}`}
                  className="block p-5 md:p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-colors text-center group"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    {sizeData.yards}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-2">
                    Yard Dumpster
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    {sizeData.loads}
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    From ${sizeData.priceFrom}
                  </div>
                  {sizeData.popular && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      Most Popular
                    </span>
                  )}
                </Link>
              </motion.div>
            </AnimatedItem>
          ))}
        </StaggeredContainer>

        <AnimatedSection delay={0.3} className="text-center mt-8">
          <Button asChild variant="outline" size="lg" className="group">
            <Link to="/sizes">
              View all sizes and specs
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
