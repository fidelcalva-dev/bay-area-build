import { Link } from 'react-router-dom';

const SERVICE_LINKS = [
  { label: 'Construction Cleanup', href: '/cleanup/construction-cleanup' },
  { label: 'Post-Construction Cleanup', href: '/cleanup/post-construction-cleanup' },
  { label: 'Demolition Debris Cleanup', href: '/cleanup/demolition-debris-cleanup' },
  { label: 'Recurring Jobsite Cleanup', href: '/cleanup/recurring-jobsite-cleanup' },
];

const COMPANY_LINKS = [
  { label: 'About', href: '/cleanup/about' },
  { label: 'For Contractors', href: '/cleanup/for-contractors' },
  { label: 'Pricing', href: '/cleanup/pricing' },
  { label: 'FAQs', href: '/cleanup/faqs' },
  { label: 'Contact', href: '/cleanup/contact' },
  { label: 'Before & After', href: '/cleanup/before-after' },
];

const AREA_LINKS = [
  { label: 'Oakland', href: '/cleanup/oakland-construction-cleanup' },
  { label: 'Alameda', href: '/cleanup/alameda-construction-cleanup' },
  { label: 'Bay Area', href: '/cleanup/bay-area-construction-cleanup' },
  { label: 'Service Areas', href: '/cleanup/service-areas' },
];

export function CleanupFooter() {
  return (
    <footer className="bg-foreground text-primary-foreground/80">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-primary-foreground text-lg mb-3">Calsan C&D Waste Removal</h3>
            <p className="text-sm leading-relaxed">
              Professional construction cleanup, post-construction cleanup, demolition debris cleanup,
              and recurring jobsite cleanup across Oakland, Alameda, and the Bay Area.
            </p>
            <p className="text-sm mt-4">
              Dumpster rentals continue through{' '}
              <a
                href="https://calsandumpsterspro.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Calsan Dumpsters Pro
              </a>
              .
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-3">Services</h4>
            <ul className="space-y-2">
              {SERVICE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm hover:text-accent transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-3">Company</h4>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm hover:text-accent transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-3">Service Areas</h4>
            <ul className="space-y-2">
              {AREA_LINKS.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm hover:text-accent transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                to="/cleanup/quote"
                className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs">
            Calsan Services dba Calsan C&D Waste Removal · CSLB #1152237
          </p>
          <p className="text-xs">
            © {new Date().getFullYear()} Calsan Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
