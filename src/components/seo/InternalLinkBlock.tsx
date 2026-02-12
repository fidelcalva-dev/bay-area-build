// Internal Link Block — compact row of cross-links for bottom of pages
// Auto-injects city links + service links based on page type

import { Link } from 'react-router-dom';
import { useLocationRegistry } from '@/hooks/useLocationRegistry';
import { pickAnchor, getCityUrl, SERVICE_CROSS_LINKS, BLOG_CROSS_LINKS } from '@/lib/internal-links';

interface InternalLinkBlockProps {
  currentCity?: string;
  type?: 'city' | 'blog' | 'size' | 'service';
  maxCityLinks?: number;
  pageContext?: string;
}

export function InternalLinkBlock({
  currentCity,
  type = 'city',
  maxCityLinks = 4,
  pageContext = 'linkblock',
}: InternalLinkBlockProps) {
  const { data: locations } = useLocationRegistry();

  const cityLinks = (locations ?? [])
    .filter(loc => loc.slug !== currentCity)
    .slice(0, maxCityLinks);

  // Pick service links based on page type
  const serviceLinks = type === 'blog'
    ? [SERVICE_CROSS_LINKS[0], SERVICE_CROSS_LINKS[1], ...BLOG_CROSS_LINKS.slice(0, 2)]
    : SERVICE_CROSS_LINKS.slice(0, 4);

  const allLinks = [
    ...serviceLinks.map(s => ({ url: s.url, label: s.label })),
    ...cityLinks.map(loc => ({
      url: getCityUrl(loc.slug, loc.page_exists),
      label: pickAnchor(loc.anchor_variants, loc.slug, pageContext + type),
    })),
  ];

  if (!allLinks.length) return null;

  return (
    <section className="py-8 bg-muted/30 border-t border-border">
      <div className="container-wide">
        <p className="text-center text-xs text-muted-foreground mb-4 uppercase tracking-wider font-medium">
          Related Pages
        </p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          {allLinks.map((link, i) => (
            <span key={link.url} className="inline-flex items-center gap-x-4">
              {i > 0 && <span className="text-border">|</span>}
              <Link to={link.url} className="text-primary hover:underline">
                {link.label}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
