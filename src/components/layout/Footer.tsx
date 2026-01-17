import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Truck, Facebook, Instagram, Twitter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BUSINESS_INFO, SERVICE_AREAS } from '@/lib/seo';

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: '/pricing', label: t('nav.pricing') },
    { to: '/sizes', label: t('nav.sizes') },
    { to: '/areas', label: t('nav.areas') },
    { to: '/materials', label: t('nav.materials') },
  ];

  const serviceLinks = [
    { to: '/contractors', label: t('nav.contractors') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
    { to: '/blog', label: t('nav.blog') },
  ];

  const moreLinks = [
    { to: '/green-halo', label: 'Green Halo™' },
    { to: '/careers', label: 'Careers' },
    { to: '/quote', label: 'Get Quote' },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column - NAP Consistent */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight">{BUSINESS_INFO.name}</span>
                <span className="text-xs text-secondary-foreground/70 leading-tight">SF Bay Area</span>
              </div>
            </Link>
            <p className="text-secondary-foreground/80 text-sm mb-4">
              {t('footer.tagline')}
            </p>
            
            {/* NAP - Name, Address, Phone */}
            <div 
              className="space-y-3 mb-4 p-4 bg-secondary-foreground/5 rounded-lg"
              itemScope 
              itemType="https://schema.org/LocalBusiness"
            >
              <meta itemProp="name" content={BUSINESS_INFO.name} />
              <div className="flex items-start gap-3 text-sm" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <div>
                  <span itemProp="streetAddress">{BUSINESS_INFO.address.street}</span><br />
                  <span itemProp="addressLocality">{BUSINESS_INFO.address.city}</span>, 
                  <span itemProp="addressRegion"> {BUSINESS_INFO.address.state}</span> 
                  <span itemProp="postalCode"> {BUSINESS_INFO.address.zip}</span>
                </div>
              </div>
              <a
                href={`tel:${BUSINESS_INFO.phone.sales}`}
                className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                itemProp="telephone"
              >
                <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                <span className="font-medium">Sales: {BUSINESS_INFO.phone.salesFormatted}</span>
              </a>
              <a
                href={`mailto:${BUSINESS_INFO.email}`}
                className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                itemProp="email"
              >
                <Mail className="w-4 h-4 flex-shrink-0 text-primary" />
                <span>{BUSINESS_INFO.email}</span>
              </a>
              <meta itemProp="url" content={BUSINESS_INFO.url} />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-primary/20 rounded-lg text-sm font-medium text-primary-foreground w-fit">
              🇪🇸 Hablamos Español
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-lg mb-4">{t('footer.services')}</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {moreLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours & Support */}
          <div>
            <h4 className="font-bold text-lg mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li>
                <p className="text-sm text-secondary-foreground/80 mb-1">Sales Line</p>
                <a
                  href={`tel:${BUSINESS_INFO.phone.sales}`}
                  className="text-xl font-bold text-primary hover:underline"
                >
                  {BUSINESS_INFO.phone.salesFormatted}
                </a>
              </li>
              <li>
                <p className="text-sm text-secondary-foreground/80 mb-1">Support Line</p>
                <a
                  href={`tel:${BUSINESS_INFO.phone.support}`}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {BUSINESS_INFO.phone.supportFormatted}
                </a>
              </li>
              <li className="text-secondary-foreground/60 text-sm">
                <p className="font-medium text-secondary-foreground/80">Hours</p>
                <p>{BUSINESS_INFO.hours.days}</p>
                <p>{BUSINESS_INFO.hours.hours}</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Service Areas */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10">
          <h4 className="font-bold text-lg mb-4">Service Areas</h4>
          <div className="flex flex-wrap gap-2">
            {SERVICE_AREAS.map((county) => (
              <Link
                key={county}
                to="/areas"
                className="px-3 py-1 bg-secondary-foreground/5 rounded-full text-xs text-secondary-foreground/70 hover:bg-primary/20 hover:text-primary transition-colors"
              >
                {county}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-secondary-foreground/60 text-sm">
              © {currentYear} {BUSINESS_INFO.name}. {t('footer.rights')}
            </p>
            <p className="text-secondary-foreground/40 text-xs mt-1">
              {BUSINESS_INFO.address.full} • {BUSINESS_INFO.phone.salesFormatted}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href={BUSINESS_INFO.social.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a 
              href={BUSINESS_INFO.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href={BUSINESS_INFO.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
