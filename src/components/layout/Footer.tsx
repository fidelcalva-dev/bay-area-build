import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, LogIn } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BUSINESS_INFO } from '@/lib/seo';
import logoCalsanDumpstersPro from '@/assets/logo-calsan-dumpsters-pro-bg.jpeg';

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container-wide py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Dumpster Sizes */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-secondary-foreground/50 mb-5">
              Dumpster Sizes
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/sizes#10-yard', label: '10 Yard Dumpster' },
                { to: '/sizes#20-yard', label: '20 Yard Dumpster' },
                { to: '/sizes#30-yard', label: '30 Yard Dumpster' },
                { to: '/sizes#40-yard', label: '40 Yard Dumpster' },
                { to: '/materials', label: 'Heavy Material Dumpsters' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-secondary-foreground/70 hover:text-secondary-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Service Areas */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-secondary-foreground/50 mb-5">
              Service Areas
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/dumpster-rental/oakland-ca', label: 'Oakland' },
                { to: '/dumpster-rental/san-jose-ca', label: 'San Jose' },
                { to: '/dumpster-rental/san-francisco-ca', label: 'San Francisco' },
                { to: '/areas', label: 'Bay Area Coverage Map' },
                { to: '/locations', label: 'All Locations' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-secondary-foreground/70 hover:text-secondary-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Contractors */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-secondary-foreground/50 mb-5">
              For Contractors
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/contractors', label: 'Contractor Accounts' },
                { to: '/quote/contractor', label: 'Volume Pricing' },
                { to: '/contractor-best-practices', label: 'Project Scheduling' },
                { to: '/how-it-works', label: 'How It Works' },
                { to: '/blog', label: 'Resources & Blog' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-secondary-foreground/70 hover:text-secondary-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact + Portal */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-secondary-foreground/50 mb-5">
              Contact
            </h4>
            <div className="space-y-4">
              <a
                href={`tel:${BUSINESS_INFO.phone.sales}`}
                className="flex items-center gap-2.5 text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors"
              >
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                {BUSINESS_INFO.phone.salesFormatted}
              </a>
              <a
                href={`mailto:${BUSINESS_INFO.email}`}
                className="flex items-center gap-2.5 text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors"
              >
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                {BUSINESS_INFO.email}
              </a>
              <div className="flex items-start gap-2.5 text-sm text-secondary-foreground/60">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.address.full}</span>
              </div>
              <div className="pt-2">
                <Link
                  to="/portal"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-foreground/8 border border-secondary-foreground/10 rounded-lg text-sm font-medium text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-foreground/12 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Customer Portal
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-secondary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img
                src={logoCalsanDumpstersPro}
                alt="Calsan Dumpsters Pro"
                className="h-10 w-auto rounded-md opacity-80"
                loading="lazy"
              />
            </Link>
            <p className="text-secondary-foreground/50 text-xs">
              © {currentYear} {BUSINESS_INFO.name}. {t('footer.rights')}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-secondary-foreground/50">
            <Link to="/terms" className="hover:text-secondary-foreground transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-secondary-foreground transition-colors">
              Privacy
            </Link>
            <a
              href="https://app.calsandumpsterspro.com/app"
              rel="nofollow"
              className="hover:text-secondary-foreground transition-colors"
            >
              Staff
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
