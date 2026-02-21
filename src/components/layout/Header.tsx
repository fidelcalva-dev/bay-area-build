import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ga4 } from '@/lib/analytics/ga4';
import { Menu, X, Phone, ChevronDown, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/seo';
import { cn } from '@/lib/utils';
import logoCalsan from '@/assets/logo-calsan.jpeg';

// ── NAV CONFIG ──────────────────────────────────────────
interface NavChild {
  to: string;
  label: string;
}

interface NavItem {
  label: string;
  to?: string;
  children?: NavChild[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dumpster Sizes',
    children: [
      { to: '/sizes', label: 'All Sizes' },
      { to: '/sizes#10-yard', label: '10 Yard Dumpster' },
      { to: '/sizes#20-yard', label: '20 Yard Dumpster' },
      { to: '/sizes#30-yard', label: '30 Yard Dumpster' },
      { to: '/sizes#40-yard', label: '40 Yard Dumpster' },
      { to: '/materials', label: 'Heavy Material Dumpsters' },
    ],
  },
  {
    label: 'Service Areas',
    children: [
      { to: '/dumpster-rental/oakland-ca', label: 'Oakland' },
      { to: '/dumpster-rental/san-jose-ca', label: 'San Jose' },
      { to: '/dumpster-rental/san-francisco-ca', label: 'San Francisco' },
      { to: '/areas', label: 'Bay Area Coverage Map' },
    ],
  },
  {
    label: 'For Contractors',
    children: [
      { to: '/contractors', label: 'Contractor Accounts' },
      { to: '/quote/contractor', label: 'Volume Pricing' },
      { to: '/contractor-best-practices', label: 'Project Scheduling' },
      { to: '/contractor-resources', label: 'Documentation & Compliance' },
    ],
  },
  {
    label: 'Resources',
    children: [
      { to: '/materials', label: 'What Can I Put in a Dumpster?' },
      { to: '/how-it-works', label: 'How Pricing Works' },
      { to: '/blog', label: 'Blog' },
      { to: '/about', label: 'About Calsan' },
    ],
  },
];

// ── HEADER ──────────────────────────────────────────────
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setMobileSection(null);
    setOpenDropdown(null);
  }, [location.pathname]);

  const handleDropdownEnter = useCallback((label: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenDropdown(label);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setOpenDropdown(null), 150);
  }, []);

  return (
    <>
      {/* Authority micro-bar */}
      <div className="bg-[#F7F9F8] border-b border-border/30">
        <div className="container-wide flex justify-center py-1.5">
          <span className="text-[11px] text-muted-foreground/60 tracking-wide">
            Serving the Bay Area since 2009
          </span>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'bg-white border-b border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
            : 'bg-white border-b border-border/20'
        )}
      >
        <div className="container-wide">
          <div className="flex h-[72px] items-center justify-between">
            {/* ── Logo ── */}
            <Link to="/" className="flex items-center shrink-0">
              <img src={logoCalsan} alt="Calsan Dumpsters Pro" className="h-16 w-auto rounded-lg" />
            </Link>

            {/* ── Desktop Nav (center) ── */}
            <nav className="hidden lg:flex items-center gap-0.5 mx-auto">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  {item.to ? (
                    <Link
                      to={item.to}
                      className="px-3.5 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      className={cn(
                        'flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium rounded-lg transition-colors',
                        openDropdown === item.label
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          'w-3 h-3 transition-transform duration-200',
                          openDropdown === item.label && 'rotate-180'
                        )}
                        strokeWidth={2}
                      />
                    </button>
                  )}

                  {/* Dropdown */}
                  {item.children && openDropdown === item.label && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-56 bg-white border border-border/50 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-2 z-50 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={cn(
                            'block px-4 py-2.5 text-sm transition-colors',
                            location.pathname === child.to
                              ? 'text-primary font-medium bg-primary/5'
                              : 'text-foreground/80 hover:text-foreground hover:bg-muted/40'
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* ── Right Side ── */}
            <div className="flex items-center gap-3">
              {/* Phone - desktop */}
              <a
                href={`tel:${BUSINESS_INFO.phone.sales}`}
                onClick={() => ga4.clickCall({ page: location.pathname })}
                className="hidden md:flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg"
              >
                <Phone className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="hidden xl:inline">{BUSINESS_INFO.phone.salesFormatted}</span>
              </a>

              {/* Portal */}
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground text-[13px]">
                <Link to="/portal">
                  <LogIn className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                  Portal
                </Link>
              </Button>

              {/* CTA */}
              <Button
                asChild
                size="sm"
                className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-sm font-semibold text-[13px] px-5 hover:scale-[1.02] transition-all duration-200"
              >
                <Link to="/quote?v3=1">
                  Get Exact Price
                </Link>
              </Button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-foreground rounded-lg hover:bg-muted/60 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" strokeWidth={2} /> : <Menu className="w-5 h-5" strokeWidth={2} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Drawer ── */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[72px] z-40 bg-white overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            <nav className="container-wide py-4 space-y-1">
              {/* Mobile CTA - top */}
              <div className="px-4 pb-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-sm"
                >
                  <Link to="/quote?v3=1" onClick={() => setIsMenuOpen(false)}>
                    Get Exact Price
                  </Link>
                </Button>
              </div>

              {NAV_ITEMS.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => setMobileSection(mobileSection === item.label ? null : item.label)}
                        className="w-full flex items-center justify-between px-4 py-3.5 text-base font-medium text-foreground rounded-lg hover:bg-muted/40 transition-colors"
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 text-muted-foreground transition-transform duration-200',
                            mobileSection === item.label && 'rotate-180'
                          )}
                        />
                      </button>
                      {mobileSection === item.label && (
                        <div className="ml-4 space-y-0.5 pb-2 animate-in slide-in-from-top-1 duration-150">
                          {item.children.map((child) => (
                            <Link
                              key={child.to}
                              to={child.to}
                              onClick={() => setIsMenuOpen(false)}
                              className={cn(
                                'block px-4 py-2.5 text-sm rounded-lg transition-colors',
                                location.pathname === child.to
                                  ? 'text-primary font-medium bg-primary/5'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.to!}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3.5 text-base font-medium text-foreground rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile utilities */}
              <div className="pt-4 mt-4 border-t border-border/40 space-y-2 px-4">
                <Button asChild variant="outline" size="lg" className="w-full rounded-xl">
                  <Link to="/portal" onClick={() => setIsMenuOpen(false)}>
                    <LogIn className="w-4 h-4 mr-2" strokeWidth={2} />
                    Portal
                  </Link>
                </Button>

                <a
                  href={`tel:${BUSINESS_INFO.phone.sales}`}
                  className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-foreground border border-border/40 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <Phone className="w-4 h-4" strokeWidth={2} />
                  Call {BUSINESS_INFO.phone.salesFormatted}
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
