// Footer Location Cluster — "Bay Area Dumpster Rental Locations"
// Auto-updates when new cities are added to the registry

import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useLocationRegistry } from '@/hooks/useLocationRegistry';
import { getCityUrl } from '@/lib/internal-links';

export function FooterLocationCluster() {
  const { data: locations } = useLocationRegistry();

  if (!locations?.length) return null;

  return (
    <div className="mt-8 pt-8 border-t border-secondary-foreground/10">
      <div className="flex items-center justify-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-secondary-foreground uppercase tracking-wider">
          Bay Area Dumpster Rental Locations
        </h4>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {locations.map(loc => (
          <Link
            key={loc.slug}
            to={getCityUrl(loc.slug, loc.page_exists)}
            className="px-3 py-1.5 bg-secondary-foreground/5 rounded-full text-xs text-secondary-foreground/70 hover:bg-primary/20 hover:text-primary transition-colors"
          >
            {loc.city_name}
          </Link>
        ))}
      </div>
    </div>
  );
}
