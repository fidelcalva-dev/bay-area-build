import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';
import { ReplacementForm } from '@/components/forms/ReplacementForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { PAGE_SEO, BUSINESS_INFO } from '@/lib/seo';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <Layout
      title={PAGE_SEO.contact.title}
      description={PAGE_SEO.contact.description}
      canonical={PAGE_SEO.contact.canonical}
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-4">{t('contact.title')}</h1>
            <p className="text-xl text-primary-foreground/85">
              {t('contact.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="heading-lg text-foreground mb-8">Get in Touch</h2>
              
              <div className="space-y-6">
                {/* Phone */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-2">{t('contact.phone')}</h3>
                      <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="text-2xl font-bold text-primary hover:underline">
                        {BUSINESS_INFO.phone.salesFormatted}
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">Main sales line</p>
                    </div>
                  </div>
                </div>

                {/* Support */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-2">{t('contact.support')}</h3>
                      <a href={`tel:${BUSINESS_INFO.phone.support}`} className="text-2xl font-bold text-primary hover:underline">
                        {BUSINESS_INFO.phone.supportFormatted}
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">Existing customers & support</p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-2">{t('contact.email')}</h3>
                      <a href={`mailto:${BUSINESS_INFO.email}`} className="text-lg font-semibold text-primary hover:underline break-all">
                        {BUSINESS_INFO.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Address - Links to Locations */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-2">{t('contact.address')}</h3>
                      <p className="text-foreground mb-2">
                        {BUSINESS_INFO.address.street}<br />
                        {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state} {BUSINESS_INFO.address.zip}
                      </p>
                      <a 
                        href="/locations" 
                        className="text-sm text-primary hover:underline"
                      >
                        View all locations →
                      </a>
                    </div>
                  </div>
                </div>

                {/* Customer Service Hours */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-2">Customer Service Hours</h3>
                      <p className="text-foreground mb-2">
                        Monday – Sunday: 6:00 AM – 9:00 PM
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Messages and emails received after hours will be answered the next business window.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Operations / Delivery Hours */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-2">Delivery & Pickup</h3>
                      <p className="text-foreground mb-2">
                        <strong>Monday – Friday:</strong> Standard service
                      </p>
                      <div className="text-sm text-muted-foreground mb-3">
                        <p className="font-medium mb-1">Estimated Arrival Windows:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Morning: 7:00 AM – 11:00 AM</li>
                          <li>Midday: 11:00 AM – 3:00 PM</li>
                          <li>Afternoon: 3:00 PM – 6:00 PM</li>
                        </ul>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-3 text-sm">
                        <p className="font-medium text-foreground">🗓️ Weekend Service</p>
                        <p className="text-muted-foreground">
                          Available by special request. Subject to availability and may include additional fees.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spanish Support */}
                <div className="bg-accent/10 rounded-2xl border border-accent/20 p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🇪🇸</span>
                    <div>
                      <h3 className="font-bold text-foreground">Hablamos Español</h3>
                      <p className="text-muted-foreground">Bilingual support available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Replacement Form */}
            <div>
              <ReplacementForm />
            </div>
          </div>
        </div>
      </section>

      {/* Locations CTA */}
      <section className="bg-muted py-12">
        <div className="container-wide text-center">
          <MapPin className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="heading-md text-foreground mb-2">Visit Our Yards</h2>
          <p className="text-muted-foreground mb-6">
            Two operational yards serving the entire Bay Area
          </p>
          <a 
            href="/locations" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            View Locations & Get Directions
          </a>
        </div>
      </section>
    </Layout>
  );
}
