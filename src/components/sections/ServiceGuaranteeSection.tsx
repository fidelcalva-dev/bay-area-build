import { Shield, Clock, Users, CheckCircle } from 'lucide-react';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import calsanPromiseImage from '@/assets/calsan-promise-dumpster.webp';

const GUARANTEES = [
  {
    icon: Clock,
    title: 'Estimated Time Windows',
    description: 'Scheduled within time windows, not exact times',
  },
  {
    icon: Shield,
    title: 'Transparent Pricing',
    description: 'Upfront estimates. Additional fees may apply.',
  },
  {
    icon: Users,
    title: 'Real Local Team',
    description: 'Bay Area based, same-day response',
  },
];

export function ServiceGuaranteeSection() {
  return (
    <section className="py-8 md:py-10 bg-primary/5 border-y border-primary/10">
      <div className="container-wide">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Left side - Image */}
            <AnimatedItem variant="fadeUp" className="flex-shrink-0">
              <div className="p-1.5 rounded-xl bg-primary/30">
                <img 
                  src={calsanPromiseImage} 
                  alt="Dumpster delivery" 
                  width={320}
                  height={180}
                  loading="lazy"
                  decoding="async"
                  className="w-64 md:w-80 h-auto rounded-lg object-cover"
                />
              </div>
            </AnimatedItem>

            {/* Right side - Promise badge and points */}
            <StaggeredContainer className="flex flex-col items-center md:items-start gap-4">
              {/* Main guarantee badge */}
              <AnimatedItem variant="fadeUp">
                <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="font-bold text-primary text-sm md:text-base">
                    The Calsan Promise
                  </span>
                </div>
              </AnimatedItem>

              {/* Guarantee points */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
                {GUARANTEES.map(({ icon: Icon, title, description }) => (
                  <AnimatedItem key={title} variant="fadeUp">
                    <div className="flex items-center gap-2 group">
                      <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors">
                        <Icon className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">{description}</p>
                      </div>
                    </div>
                  </AnimatedItem>
                ))}
              </div>
            </StaggeredContainer>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
