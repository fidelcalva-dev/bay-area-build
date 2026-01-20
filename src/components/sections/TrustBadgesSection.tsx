import { motion } from 'framer-motion';
import { Shield, Award, Star, ExternalLink } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seo';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';

const trustBadges = [
  {
    id: 'google',
    icon: Shield,
    title: 'Google Guaranteed',
    subtitle: 'Verified Local Service',
    description: 'Background-checked, licensed, and insured. Google may reimburse up to $2,000 if unsatisfied.',
    link: BUSINESS_INFO.social.googleGuarantee,
    featured: true,
  },
  {
    id: 'bbb',
    icon: Award,
    title: 'BBB A+ Rating',
    subtitle: 'Accredited Business',
    description: 'Trusted by the Better Business Bureau for transparency and customer service.',
    link: BUSINESS_INFO.social.bbb,
    featured: false,
  },
  {
    id: 'yelp',
    icon: Star,
    title: '5.0 on Yelp',
    subtitle: '200+ Reviews',
    description: 'Real customers, real reviews from across the Bay Area.',
    link: BUSINESS_INFO.social.yelp,
    featured: false,
  },
];

const stats = [
  { value: '500+', label: '5-Star Reviews' },
  { value: '15+', label: 'Years in Business' },
  { value: '98%', label: 'Would Recommend' },
  { value: '9', label: 'Counties Served' },
];

export function TrustBadgesSection() {
  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="container-wide">
        {/* Header - Minimal */}
        <AnimatedSection className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Trust verified
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Industry-leading certifications
          </h2>
        </AnimatedSection>

        {/* Trust Badges - Compact grid */}
        <StaggeredContainer className="grid md:grid-cols-3 gap-4 lg:gap-6 mb-10">
          {trustBadges.map((badge) => (
            <AnimatedItem key={badge.id} variant="fadeUp">
              <motion.a
                href={badge.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative block p-5 lg:p-6 rounded-2xl border transition-colors ${
                  badge.featured
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-background border-border hover:border-primary/20'
                }`}
                whileHover={{ y: -4, boxShadow: '0 10px 30px -10px hsl(var(--foreground) / 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                {badge.featured && (
                  <div className="absolute -top-2.5 left-5 px-2.5 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    Featured
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    badge.featured
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-primary'
                  }`}>
                    <badge.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-0.5">{badge.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{badge.subtitle}</p>
                    <p className="text-sm text-foreground/70 leading-relaxed">{badge.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </motion.a>
            </AnimatedItem>
          ))}
        </StaggeredContainer>

        {/* Stats Row - Clean numbers */}
        <StaggeredContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" staggerDelay={0.05}>
          {stats.map((stat) => (
            <AnimatedItem key={stat.label} variant="scaleIn">
              <div className="text-center p-5 bg-muted/50 rounded-xl">
                <div className="text-2xl lg:text-3xl font-bold text-primary mb-0.5">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </AnimatedItem>
          ))}
        </StaggeredContainer>
      </div>
    </section>
  );
}
