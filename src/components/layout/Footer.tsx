import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Truck, Facebook, Instagram, Youtube, Shield, Award, ExternalLink, Navigation, Star, Globe, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BUSINESS_INFO, SERVICE_AREAS, OPERATIONAL_YARDS } from '@/lib/seo';
import { OfficeStatusIndicator } from '@/components/shared/OfficeStatusIndicator';
import logoCalsanDumpstersPro from '@/assets/logo-calsan-dumpsters-pro-bg.jpeg';
import { FooterLocationCluster } from '@/components/seo/FooterLocationCluster';

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: '/pricing', label: t('nav.pricing') },
    { to: '/sizes', label: t('nav.sizes') },
    { to: '/areas', label: t('nav.areas') },
    { to: '/materials', label: t('nav.materials') },
    { to: '/locations', label: 'Locations' },
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

  const resourceLinks = [
    { to: '/contractor-best-practices', label: 'Contractor Best Practices' },
    { to: '/materials', label: 'Materials Guide' },
    { to: '/sizes', label: 'Size Guide' },
  ];

  // Category differentiation links (SEO + Trust)
  const differentiationLinks = [
    { to: '/why-local-yards', label: 'Why Local Yards' },
    { to: '/not-a-broker', label: 'We\'re Not a Broker' },
    { to: '/how-it-works', label: 'How It Works' },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column - NAP Consistent */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src={logoCalsanDumpstersPro}
                alt="Calsan Dumpsters Pro"
                className="h-12 md:h-14 w-auto"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="text-secondary-foreground/80 text-sm mb-2">
              {t('footer.tagline')}
            </p>
            {/* Category positioning tagline */}
            <p className="text-xs text-primary/80 font-medium mb-4 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              ZIP-Based Pricing · Powered by Real Local Yards
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
              <MessageCircle className="w-4 h-4" />
              Hablamos Español
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

            {/* Resources subsection */}
            <h5 className="font-semibold text-sm mt-5 mb-2 text-secondary-foreground/70">Resources</h5>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors text-xs"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Why Us / Differentiation Links */}
            <h5 className="font-semibold text-sm mt-5 mb-2 text-secondary-foreground/70">Why Us</h5>
            <ul className="space-y-2">
              {differentiationLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors text-xs"
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
              {/* Live Office Status */}
              <li>
                <OfficeStatusIndicator variant="default" className="mb-2" />
              </li>
              <li className="text-secondary-foreground/60 text-sm space-y-2">
                <div>
                  <p className="font-medium text-secondary-foreground/80">Customer Service</p>
                  <p>{BUSINESS_INFO.hours.customerService.days}</p>
                  <p>{BUSINESS_INFO.hours.customerService.hours}</p>
                </div>
                <div className="pt-1 border-t border-secondary-foreground/10">
                  <p className="font-medium text-secondary-foreground/80">Delivery & Pickup</p>
                  <p>{BUSINESS_INFO.hours.operations.days}</p>
                  <p className="text-xs italic">{BUSINESS_INFO.hours.operations.weekendNote}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Operational Yards */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-lg">Operational Yards</h4>
            <Link to="/locations" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all locations
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {OPERATIONAL_YARDS.map((yard) => (
              <div key={yard.id} className="bg-secondary-foreground/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{yard.name}</span>
                </div>
                <p className="text-xs text-secondary-foreground/70 mb-2">{yard.address}</p>
                <a
                  href={yard.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Navigation className="w-3 h-3" />
                  Get Directions
                </a>
              </div>
            ))}
          </div>
          
          {/* Service Areas */}
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

        {/* Dynamic Location Cluster */}
        <FooterLocationCluster />

        {/* Trust Badges & Links */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            {/* BBB Badge */}
            <a
              href={BUSINESS_INFO.social.bbb}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-foreground/5 rounded-lg border border-secondary-foreground/10 hover:bg-secondary-foreground/10 transition-colors"
            >
              <Award className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">BBB A+ Accredited</span>
              <ExternalLink className="w-3 h-3 text-secondary-foreground/50" />
            </a>
            
            {/* Google Guarantee */}
            <a
              href={BUSINESS_INFO.social.googleGuarantee}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-foreground/5 rounded-lg border border-secondary-foreground/10 hover:bg-secondary-foreground/10 transition-colors"
            >
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium">Google Guaranteed</span>
              <ExternalLink className="w-3 h-3 text-secondary-foreground/50" />
            </a>

            {/* Yelp */}
            <a
              href={BUSINESS_INFO.social.yelp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-foreground/5 rounded-lg border border-secondary-foreground/10 hover:bg-secondary-foreground/10 transition-colors"
            >
              <Star className="w-5 h-5 fill-accent text-accent" />
              <span className="text-sm font-medium">5.0 on Yelp</span>
              <ExternalLink className="w-3 h-3 text-secondary-foreground/50" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-secondary-foreground/60 text-sm">
              © {currentYear} {BUSINESS_INFO.name}. {t('footer.rights')}
            </p>
            <p className="text-secondary-foreground/40 text-xs mt-1">
              {BUSINESS_INFO.address.full} • {BUSINESS_INFO.phone.salesFormatted}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
              <Link to="/terms" className="text-secondary-foreground/50 hover:text-secondary-foreground text-xs transition-colors">
                Terms of Service
              </Link>
              <span className="text-secondary-foreground/30">|</span>
              <Link to="/privacy" className="text-secondary-foreground/50 hover:text-secondary-foreground text-xs transition-colors">
                Privacy Policy
              </Link>
              <span className="text-secondary-foreground/30">|</span>
              <a href="https://crm.calsandumpsterspro.com/app" className="text-secondary-foreground/50 hover:text-secondary-foreground text-xs transition-colors" rel="nofollow noopener">
                Staff Login
              </a>
            </div>
          </div>
          
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-secondary-foreground/50 mr-2">Follow us:</span>
            <a 
              href={BUSINESS_INFO.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-secondary-foreground/5 rounded-lg text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-secondary-foreground/10 transition-colors"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href={BUSINESS_INFO.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-secondary-foreground/5 rounded-lg text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-secondary-foreground/10 transition-colors"
              aria-label="Subscribe on YouTube"
            >
              <Youtube className="w-5 h-5" />
            </a>
            <a 
              href={BUSINESS_INFO.social.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-secondary-foreground/5 rounded-lg text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-secondary-foreground/10 transition-colors"
              aria-label="Like us on Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a 
              href={BUSINESS_INFO.social.yelp}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-secondary-foreground/5 rounded-lg text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-secondary-foreground/10 transition-colors"
              aria-label="Review us on Yelp"
            >
              <Star className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
