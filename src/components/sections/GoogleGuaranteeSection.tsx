import { Shield, CheckCircle, Award, BadgeCheck, Users, Clock, Truck, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const certifications = [
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
    description: '10+ years of excellence',
  },
  {
    icon: BadgeCheck,
    title: 'Licensed & Insured',
    subtitle: 'California DOT',
    description: 'Full liability coverage',
  },
  {
    icon: Users,
    title: '500+ Reviews',
    subtitle: '5.0 Star Average',
    description: 'Verified customer reviews',
  },
];

const guaranteePoints = [
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
              <Shield className="w-5 h-5 text-accent" />
              <span>{t('trust.guarantee')}</span>
            </div>

            {/* Large Badge Visual */}
            <div className="relative inline-block mb-8">
              <div className="w-40 h-40 md:w-48 md:h-48 mx-auto lg:mx-0 rounded-full bg-primary-foreground/10 backdrop-blur-sm border-4 border-primary-foreground/30 flex items-center justify-center relative">
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-accent to-accent/80 flex flex-col items-center justify-center shadow-lg">
                  <Shield className="w-12 h-12 md:w-14 md:h-14 text-accent-foreground mb-1" />
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

            {/* Guarantee Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guaranteePoints.map((point) => (
                <div key={point.text} className="flex items-center gap-3 bg-primary-foreground/5 rounded-xl px-4 py-3 border border-primary-foreground/10">
                  <point.icon className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-sm text-primary-foreground/90 font-medium">{point.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Certification Grid */}
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
                <div className={`flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl mb-4 transition-colors ${
                  index === 0 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-primary-foreground/10 group-hover:bg-primary-foreground/15'
                }`}>
                  <cert.icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <h4 className="font-bold text-lg md:text-xl mb-1">{cert.title}</h4>
                <p className="text-sm text-primary-foreground/70 mb-2">{cert.subtitle}</p>
                <p className="text-xs text-primary-foreground/60">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Partners / Affiliations Bar */}
        <div className="border-t border-primary-foreground/10 pt-12">
          <p className="text-center text-sm text-primary-foreground/60 uppercase tracking-widest font-medium mb-8">
            Trusted by Industry Leaders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16 opacity-70">
            {/* Partner Logos - Placeholder badges */}
            {['HomeAdvisor', 'Angi', 'Yelp', 'Thumbtack', 'NextDoor'].map((partner) => (
              <div 
                key={partner} 
                className="flex items-center gap-2 px-6 py-3 bg-primary-foreground/10 rounded-xl border border-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors"
              >
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="font-semibold text-sm md:text-base">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
