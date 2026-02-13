import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Instagram, Youtube, Facebook, ChevronDown, HardHat, BookOpen, FileText, Globe, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { BUSINESS_INFO } from '@/lib/seo';
import { CTA_LINKS } from '@/lib/shared-data';
import { OfficeStatusIndicator } from '@/components/shared/OfficeStatusIndicator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import logoCalsan from '@/assets/logo-calsan.jpeg';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contractorDropdownOpen, setContractorDropdownOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/pricing', label: t('nav.pricing') },
    { to: '/sizes', label: t('nav.sizes') },
    { to: '/areas', label: t('nav.areas') },
    { to: '/materials', label: t('nav.materials') },
    { to: '/portal', label: 'Customer Portal' },
  ];

  const contractorLinks = [
    { to: '/contractors', label: 'Contractor Services', icon: HardHat },
    { to: '/quote/contractor', label: 'Contractor Quote', icon: FileText },
    { to: '/contractor-best-practices', label: 'Best Practices Guide', icon: BookOpen },
  ];

  const moreLinks = [
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
    { to: '/blog', label: t('nav.blog') },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isContractorActive = contractorLinks.some(link => location.pathname === link.to);

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border/40">
      <div className="container-wide">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoCalsan} 
              alt="Calsan Dumpsters Pro" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive(link.to)
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Contractors Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setContractorDropdownOpen(true)}
              onMouseLeave={() => setContractorDropdownOpen(false)}
            >
              <button
                className={cn(
                  "flex items-center gap-1 px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                  isContractorActive
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {t('nav.contractors')}
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", contractorDropdownOpen && "rotate-180")} />
              </button>

              {contractorDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl py-2 z-50 animate-scale-in">
                  {contractorLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                        isActive(link.to)
                          ? "text-primary bg-primary/8"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <link.icon className="w-4 h-4" strokeWidth={1.75} />
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {moreLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive(link.to)
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Office Status - Desktop only */}
            <div className="hidden xl:block">
              <OfficeStatusIndicator variant="badge" />
            </div>

            {/* Social Icons - Desktop only */}
            <div className="hidden lg:flex items-center">
              <a
                href={BUSINESS_INFO.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/60"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" strokeWidth={1.75} />
              </a>
              <a
                href={BUSINESS_INFO.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/60"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" strokeWidth={1.75} />
              </a>
              <a
                href={BUSINESS_INFO.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/60"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" strokeWidth={1.75} />
              </a>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/50 rounded-lg transition-all hover:bg-muted/60"
            >
              <Globe className="w-3.5 h-3.5" strokeWidth={1.75} />
              {language === 'en' ? 'ES' : 'EN'}
            </button>

            {/* Phone */}
            <a
              href={`tel:${BUSINESS_INFO.phone.sales}`}
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60"
            >
              <Phone className="w-4 h-4" strokeWidth={1.75} />
              <span>{BUSINESS_INFO.phone.salesFormatted}</span>
            </a>

            {/* Login Button with Portal Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Link to="/portal">
                    <LogIn className="w-4 h-4 sm:mr-1.5" strokeWidth={1.75} />
                    <span className="hidden sm:inline">Portal</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Resume quotes or manage orders</p>
              </TooltipContent>
            </Tooltip>

            {/* Order Now Button */}
            <Button asChild variant="cta" size="sm" className="hidden sm:inline-flex">
              <Link to={CTA_LINKS.trashlab}>
                {t('nav.orderNow')}
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-foreground rounded-xl hover:bg-muted/60 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" strokeWidth={1.75} /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border/40 bg-card/95 backdrop-blur-xl py-4 animate-fade-in">
            <nav className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive(link.to)
                      ? 'text-primary bg-primary/5'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Contractors Section */}
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Contractors
              </div>
              {contractorLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive(link.to)
                      ? 'text-primary bg-primary/5'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}

              {/* More Links */}
              {moreLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive(link.to)
                      ? 'text-primary bg-primary/5'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 px-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground border border-border rounded-lg"
              >
                <Globe className="w-4 h-4" />
                {language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              </button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/portal" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Customer Portal
                </Link>
              </Button>
              <Button asChild variant="cta" size="lg" className="w-full">
                <Link to={CTA_LINKS.trashlab} onClick={() => setIsMenuOpen(false)}>
                  {t('nav.orderNow')}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
