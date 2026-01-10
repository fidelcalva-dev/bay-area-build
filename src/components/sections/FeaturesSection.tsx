import { Truck, DollarSign, Clock, MessageSquare, Shield, Leaf } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Truck,
      title: t('features.sameDay'),
      description: t('features.sameDayDesc'),
    },
    {
      icon: DollarSign,
      title: t('features.transparent'),
      description: t('features.transparentDesc'),
    },
    {
      icon: Clock,
      title: t('features.onTime'),
      description: t('features.onTimeDesc'),
    },
    {
      icon: MessageSquare,
      title: t('features.textUpdates'),
      description: t('features.textUpdatesDesc'),
    },
    {
      icon: Shield,
      title: t('features.googleGuaranteed'),
      description: t('features.googleGuaranteedDesc'),
    },
    {
      icon: Leaf,
      title: t('features.ecoFriendly'),
      description: t('features.ecoFriendlyDesc'),
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="heading-lg text-foreground mb-4">{t('features.title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 md:p-8 bg-card rounded-2xl border border-border hover:border-primary/20 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
