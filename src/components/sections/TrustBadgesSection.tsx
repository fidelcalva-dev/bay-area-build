import { motion } from 'framer-motion';
import { Shield, Award, Star, ExternalLink, CheckCircle, LucideIcon } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seo';
import { REVIEW_STATS, REVIEW_LINKS } from '@/data/reviews';
import { COMPANY_FACTS, CERTIFICATION_LINKS } from '@/data/trustSignals';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import { IconCircle } from '@/components/shared/IconCircle';

interface TrustBadge {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  link: string;
  featured: boolean;
}

const trustBadges: TrustBadge[] = [
  {
    id: 'google',
    icon: Shield,
    title: 'Google Guaranteed',
    subtitle: 'Verified Local Service',
    description: 'Background-checked, licensed, and insured through Google Local Services.',
    link: CERTIFICATION_LINKS.googleGuarantee,
    featured: true,
  },
  {
    id: 'bbb',
    icon: Award,
    title: 'BBB Accredited',
    subtitle: 'Oakland HQ',
    description: 'Better Business Bureau accredited for transparency and service.',
    link: CERTIFICATION_LINKS.bbb,
    featured: false,
  },
  {
    id: 'reviews',
    icon: Star,
    title: `${REVIEW_STATS.averageRating}★ Average`,
    subtitle: `${REVIEW_STATS.totalReviews}+ Verified Reviews`,
    description: 'Real reviews from verified customers on Google and Facebook.',
    link: REVIEW_LINKS.googleProfile,
    featured: false,
  },
];

const stats = [
  { value: `${REVIEW_STATS.totalReviews}+`, label: 'Verified Reviews' },
  { value: `${COMPANY_FACTS.yearsInBusiness}+`, label: 'Years in Business' },
  { value: `${COMPANY_FACTS.recommendationRate}%`, label: 'Would Recommend' },
  { value: `${COMPANY_FACTS.countiesServed}`, label: 'Counties Served' },
];

export function TrustBadgesSection() {
  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="container-wide">
        {/* Header - Minimal */}
        <AnimatedSection className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
            Verified credentials
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Why Contractors and Homeowners Choose Calsan
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            All credentials are publicly verifiable. Click any badge to confirm.
          </p>
        </AnimatedSection>

        {/* Trust Badges - Compact grid with IconCircle */}
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
                  {/* Consistent IconCircle styling */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 border ${
                    badge.featured
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/80 text-primary border-border/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary'
                  } transition-colors duration-200`}>
                    <badge.icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-0.5">{badge.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{badge.subtitle}</p>
                    <p className="text-sm text-foreground/70 leading-relaxed">{badge.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" strokeWidth={2} />
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
