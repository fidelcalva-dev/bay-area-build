import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';
import { ReplacementForm } from '@/components/forms/ReplacementForm';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <Layout
      title="Contact Calsan Dumpsters Pro | Get in Touch"
      description="Contact us for dumpster rental in SF Bay Area. Call (510) 680-2150 for sales, text us, or email. Office in Oakland, CA. Hablamos Español."
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
                      <a href="tel:+15106802150" className="text-2xl font-bold text-primary hover:underline">
                        (510) 680-2150
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
                      <a href="tel:+14158465621" className="text-2xl font-bold text-primary hover:underline">
                        (415) 846-5621
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
                      <a href="mailto:contact@calsandumpsterspro.com" className="text-lg font-semibold text-primary hover:underline break-all">
                        contact@calsandumpsterspro.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-2">{t('contact.address')}</h3>
                      <p className="text-foreground">
                        1930 12th Ave #201<br />
                        Oakland, CA 94606
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-2">Business Hours</h3>
                      <p className="text-foreground">
                        Monday - Saturday: 7:00 AM - 6:00 PM<br />
                        Sunday: Closed
                      </p>
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

      {/* Map Placeholder */}
      <section className="bg-muted py-12">
        <div className="container-wide">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Map embed placeholder</p>
                <p className="text-sm text-muted-foreground">1930 12th Ave #201, Oakland, CA 94606</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
