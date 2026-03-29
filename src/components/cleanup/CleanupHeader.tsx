import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { label: 'Home', href: '/cleanup' },
  {
    label: 'Services',
    href: '/cleanup/services',
    children: [
      { label: 'Construction Cleanup', href: '/cleanup/construction-cleanup' },
      { label: 'Post-Construction Cleanup', href: '/cleanup/post-construction-cleanup' },
      { label: 'Demolition Debris Cleanup', href: '/cleanup/demolition-debris-cleanup' },
      { label: 'Recurring Jobsite Cleanup', href: '/cleanup/recurring-jobsite-cleanup' },
    ],
  },
  { label: 'For Contractors', href: '/cleanup/for-contractors' },
  { label: 'Pricing', href: '/cleanup/pricing' },
  { label: 'Service Areas', href: '/cleanup/service-areas' },
  { label: 'About', href: '/cleanup/about' },
  { label: 'FAQs', href: '/cleanup/faqs' },
  { label: 'Contact', href: '/cleanup/contact' },
];

export function CleanupHeader() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo / Brand */}
        <Link to="/cleanup" className="flex flex-col leading-tight">
          <span className="text-base font-extrabold text-foreground tracking-tight">Calsan C&D</span>
          <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">Waste Removal</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label} className="relative group">
                <Link
                  to={item.href}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  {item.label}
                  <ChevronDown className="w-3.5 h-3.5" />
                </Link>
                <div className="absolute top-full left-0 pt-1 hidden group-hover:block">
                  <div className="bg-card border border-border rounded-lg shadow-lg py-1 min-w-[220px]">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                to={item.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-2">
          <a
            href="https://calsandumpsterspro.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Dumpster Rentals →
          </a>
          <Button asChild size="sm" variant="default">
            <Link to="/cleanup/quote">
              <FileText className="w-4 h-4 mr-1.5" />
              Request a Quote
            </Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  to={item.href}
                  className="block py-2 text-sm font-medium text-foreground"
                  onClick={() => !item.children && setOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className="block py-1.5 text-sm text-muted-foreground"
                        onClick={() => setOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-border space-y-2">
              <Button asChild className="w-full" size="sm">
                <Link to="/cleanup/quote" onClick={() => setOpen(false)}>Request a Quote</Link>
              </Button>
              <a
                href="https://calsandumpsterspro.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs text-muted-foreground py-2"
              >
                Need a dumpster rental? Visit Calsan Dumpsters Pro →
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
