// Related Locations — "Also Serving Nearby Areas" grid
// Pulls from seo_locations_registry, excludes current city, rotates anchors

import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useLocationRegistry } from '@/hooks/useLocationRegistry';
import { pickAnchor, getCityUrl } from '@/lib/internal-links';

interface RelatedLocationsProps {
  currentCity?: string; // slug to exclude, e.g. 'oakland-ca'
  maxLinks?: number;
  title?: string;
  pageContext?: string; // unique string per page for anchor rotation
}

export function RelatedLocations({
  currentCity,
  maxLinks = 8,
  title = 'Also Serving Nearby Areas',
  pageContext = 'default',
}: RelatedLocationsProps) {
  const { data: locations, isLoading } = useLocationRegistry();

  if (isLoading || !locations?.length) return null;

  const filtered = locations
    .filter(loc => loc.slug !== currentCity)
    .slice(0, maxLinks);

  if (!filtered.length) return null;

  // Track used anchors to avoid duplicates on this page
  const usedAnchors = new Set<string>();

  return (
    <section className="py-12 bg-muted/30 border-t border-border">
      <div className="container-wide">
        <div className="flex items-center justify-center gap-2 mb-6">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map(loc => {
            let anchor = pickAnchor(loc.anchor_variants, loc.slug, pageContext);
            // Deduplicate on-page
            if (usedAnchors.has(anchor)) {
              const alt = loc.anchor_variants.find(a => !usedAnchors.has(a));
              if (alt) anchor = alt;
            }
            usedAnchors.add(anchor);

            return (
              <Link
                key={loc.slug}
                to={getCityUrl(loc.slug, loc.page_exists)}
                className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border hover:border-primary/40 hover:shadow-sm transition-all text-sm font-medium text-foreground"
              >
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                {anchor}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
