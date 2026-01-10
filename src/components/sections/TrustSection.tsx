import { Shield, CheckCircle, Award, BadgeCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function TrustSection() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              <span>{t('trust.guarantee')}</span>
            </div>
            
            <h2 className="heading-lg mb-6">
              {t('trust.title')}
            </h2>
            
            <p className="text-lg text-primary-foreground/85 mb-8">
              {t('trust.guaranteeDesc')}
            </p>

            <div className="space-y-4">
              {[
                'Licensed & insured for your protection',
                'Background-checked drivers',
                'Real-time delivery tracking',
                'Satisfaction guaranteed or money back',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-primary-foreground/90">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Trust Badges */}
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div className="p-6 bg-primary-foreground/5 rounded-2xl border border-primary-foreground/10 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary-foreground/10 mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg mb-1">Google Guaranteed</h4>
              <p className="text-sm text-primary-foreground/70">Local Services Verified</p>
            </div>
            
            <div className="p-6 bg-primary-foreground/5 rounded-2xl border border-primary-foreground/10 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary-foreground/10 mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg mb-1">A+ Rating</h4>
              <p className="text-sm text-primary-foreground/70">BBB Accredited</p>
            </div>
            
            <div className="p-6 bg-primary-foreground/5 rounded-2xl border border-primary-foreground/10 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary-foreground/10 mb-4">
                <BadgeCheck className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg mb-1">5-Star Reviews</h4>
              <p className="text-sm text-primary-foreground/70">500+ Happy Customers</p>
            </div>
            
            <div className="p-6 bg-primary-foreground/5 rounded-2xl border border-primary-foreground/10 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary-foreground/10 mb-4">
                <span className="text-2xl">🇪🇸</span>
              </div>
              <h4 className="font-bold text-lg mb-1">Hablamos Español</h4>
              <p className="text-sm text-primary-foreground/70">Bilingual Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
