import { Shield, CheckCircle, Award, BadgeCheck, Users, Clock, Truck, Phone, LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { REVIEW_STATS } from '@/data/reviews';
import { IconCircle } from '@/components/shared/IconCircle';

interface Certification {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
}

interface GuaranteePoint {
  icon: LucideIcon;
  text: string;
}

const certifications: Certification[] = [
  {
    icon: Shield,
    title: 'Google Guaranteed',
    subtitle: 'Local Services Verified',
    description: 'Verified by Google for quality & trust',
  },
  {
    icon: Award,
    title: 'BBB A+ Rating',
    subtitle: 'Accredited Business',
    description: 'Oakland HQ accredited',
  },
  {
    icon: BadgeCheck,
    title: 'Licensed & Insured',
    subtitle: 'California DOT',
    description: 'Full liability coverage',
  },
  {
    icon: Users,
    title: `${REVIEW_STATS.totalReviews}+ Reviews`,
    subtitle: `${REVIEW_STATS.averageRating}★ Average`,
    description: 'Verified customer reviews',
  },
];

const guaranteePoints: GuaranteePoint[] = [
  { icon: Clock, text: 'Same-day delivery available' },
  { icon: Truck, text: 'On-time guaranteed or discount' },
  { icon: Phone, text: 'Real human support, always' },
  { icon: Shield, text: 'Money-back satisfaction guarantee' },
];

export function GoogleGuaranteeSection() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container-wide relative z-10">
        {/* Main Google Guarantee Block */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 lg:mb-24">
          {/* Left - Google Guarantee Badge & Explanation */}
          <div className="text-center lg:text-left">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary-foreground/15 backdrop-blur-sm rounded-full text-sm font-semibold mb-8 border border-primary-foreground/20">
              <Shield className="w-5 h-5 text-accent" strokeWidth={2} />
              <span>{t('trust.guarantee')}</span>
            </div>

            {/* Large Badge Visual */}
            <div className="relative inline-block mb-8">
              <div className="w-40 h-40 md:w-48 md:h-48 mx-auto lg:mx-0 rounded-full bg-primary-foreground/10 backdrop-blur-sm border-4 border-primary-foreground/30 flex items-center justify-center relative">
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-accent to-accent/80 flex flex-col items-center justify-center shadow-lg">
                  <Shield className="w-12 h-12 md:w-14 md:h-14 text-accent-foreground mb-1" strokeWidth={2} />
                  <span className="text-[10px] md:text-xs font-bold text-accent-foreground uppercase tracking-wider">Google</span>
                  <span className="text-xs md:text-sm font-extrabold text-accent-foreground uppercase">Guaranteed</span>
                </div>
                {/* Decorative Ring */}
                <div className="absolute -inset-2 rounded-full border-2 border-primary-foreground/10 animate-pulse-slow" />
              </div>
            </div>

            <h2 className="heading-lg mb-4 text-balance">
              {t('trust.title')}
            </h2>
            
            <p className="text-lg text-primary-foreground/85 mb-8 max-w-lg mx-auto lg:mx-0">
              {t('trust.guaranteeDesc')}
            </p>

            {/* Guarantee Points with IconCircle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guaranteePoints.map((point) => (
                <div key={point.text} className="flex items-center gap-3 bg-primary-foreground/5 rounded-xl px-4 py-3 border border-primary-foreground/10">
                  <point.icon className="w-5 h-5 text-accent flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm text-primary-foreground/90 font-medium">{point.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Certification Grid with IconCircle */}
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {certifications.map((cert, index) => (
              <div
                key={cert.title}
                className={`group p-6 md:p-8 rounded-2xl border border-primary-foreground/15 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary-foreground/30 ${
                  index === 0 
                    ? 'bg-accent/20 border-accent/30' 
                    : 'bg-primary-foreground/5'
                }`}
              >
                {/* Icon Container - Consistent circular style */}
                <div className={`flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full mb-4 transition-colors border ${
                  index === 0 
                    ? 'bg-accent text-accent-foreground border-accent/50' 
                    : 'bg-primary-foreground/10 border-primary-foreground/20 group-hover:bg-primary-foreground/15'
                }`}>
                  <cert.icon className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2} />
                </div>
                <h4 className="font-bold text-lg md:text-xl mb-1">{cert.title}</h4>
                <p className="text-sm text-primary-foreground/70 mb-2">{cert.subtitle}</p>
                <p className="text-xs text-primary-foreground/60">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Note */}
        <div className="border-t border-primary-foreground/10 pt-12">
          <p className="text-center text-sm text-primary-foreground/60 max-w-xl mx-auto">
            All certifications are publicly verifiable. 
            <a href="https://www.bbb.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-foreground ml-1">
              Verify on BBB
            </a>
            <span className="mx-2">•</span>
            <a href="https://www.google.com/search?q=calsan+dumpsters+pro" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-foreground">
              View on Google
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
