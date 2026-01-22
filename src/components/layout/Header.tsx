import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Instagram, Youtube, Facebook, ChevronDown, HardHat, BookOpen, FileText, Globe, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { BUSINESS_INFO } from '@/lib/seo';
import { CTA_LINKS } from '@/lib/shared-data';
import { OfficeStatusIndicator } from '@/components/shared/OfficeStatusIndicator';
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
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border">
      <div className="container-wide">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoCalsan} 
              alt="Calsan Dumpsters Pro" 
              className="h-14 md:h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.to)
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
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
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isContractorActive
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {t('nav.contractors')}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${contractorDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {contractorDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-xl shadow-lg py-2 z-50 animate-fade-in">
                  {contractorLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive(link.to)
                          ? 'text-primary bg-primary/5'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
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
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.to)
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Office Status - Desktop only */}
            <div className="hidden xl:block">
              <OfficeStatusIndicator variant="badge" />
            </div>

            {/* Social Icons - Desktop only */}
            <div className="hidden lg:flex items-center gap-1">
              <a
                href={BUSINESS_INFO.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={BUSINESS_INFO.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={BUSINESS_INFO.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-md transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {language === 'en' ? 'ES' : 'EN'}
            </button>

            {/* Phone */}
            <a
              href={`tel:${BUSINESS_INFO.phone.sales}`}
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{BUSINESS_INFO.phone.salesFormatted}</span>
            </a>

            {/* Login Button */}
            <Button asChild variant="outline" size="sm" className="inline-flex">
              <Link to="/admin/login">
                <LogIn className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            </Button>

            {/* Order Now Button */}
            <Button asChild variant="cta" size="default" className="hidden sm:inline-flex">
              <a href={CTA_LINKS.trashlab} target="_blank" rel="noopener noreferrer">
                {t('nav.orderNow')}
              </a>
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card py-4 animate-fade-in">
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
                <Link to="/admin/login" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button asChild variant="cta" size="lg" className="w-full">
                <a href={CTA_LINKS.trashlab} target="_blank" rel="noopener noreferrer">
                  {t('nav.orderNow')}
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
