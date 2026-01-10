import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Truck, Facebook, Instagram, Twitter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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

  const counties = [
    'Alameda County',
    'San Francisco',
    'Santa Clara County',
    'Contra Costa County',
    'San Mateo County',
    'Marin County',
    'Napa County',
    'Solano County',
    'Sonoma County',
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight">{t('footer.company')}</span>
                <span className="text-xs text-secondary-foreground/70 leading-tight">SF Bay Area</span>
              </div>
            </Link>
            <p className="text-secondary-foreground/80 text-sm mb-6">
              {t('footer.tagline')}
            </p>
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
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+15106802150"
                  className="flex items-start gap-3 text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-sm"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium">Sales: (510) 680-2150</span>
                    <span className="block">Support: (415) 846-5621</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@calsandumpsterspro.com"
                  className="flex items-center gap-3 text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-sm"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>contact@calsandumpsterspro.com</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-secondary-foreground/80 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>1930 12th Ave #201<br />Oakland, CA 94606</span>
              </li>
              <li className="text-secondary-foreground/60 text-sm">
                {t('footer.hours')}
              </li>
            </ul>
          </div>
        </div>

        {/* Service Areas */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10">
          <h4 className="font-bold text-lg mb-4">Service Areas</h4>
          <div className="flex flex-wrap gap-2">
            {counties.map((county) => (
              <span
                key={county}
                className="px-3 py-1 bg-secondary-foreground/5 rounded-full text-xs text-secondary-foreground/70"
              >
                {county}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary-foreground/60 text-sm">
            © {currentYear} Calsan Dumpsters Pro. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
