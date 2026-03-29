import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Ruler, DollarSign, Truck, HardHat, FileText, Recycle } from 'lucide-react';

interface ClusterLink {
  to: string;
  label: string;
  icon: React.ElementType;
}

const SERVICE_LINKS: ClusterLink[] = [
  { to: '/services/construction-dumpsters', label: 'Construction Dumpsters', icon: HardHat },
  { to: '/services/roofing-dumpsters', label: 'Roofing Dumpsters', icon: Truck },
  { to: '/services/residential-dumpsters', label: 'Residential Dumpsters', icon: Truck },
  { to: '/services/commercial-dumpsters', label: 'Commercial Dumpsters', icon: Truck },
  { to: '/services/concrete-dirt-dumpsters', label: 'Concrete & Dirt Dumpsters', icon: Truck },
  { to: '/services/junk-debris-dumpsters', label: 'Junk & Debris Dumpsters', icon: Truck },
  { to: '/services/same-day-dumpster-rental', label: 'Same-Day Delivery', icon: Truck },
];

const SIZE_LINKS: ClusterLink[] = [
  { to: '/sizes', label: 'All Dumpster Sizes', icon: Ruler },
  { to: '/pricing', label: 'Pricing Guide', icon: DollarSign },
  { to: '/capacity-guide', label: 'Capacity Guide', icon: Ruler },
  { to: '/materials', label: 'Materials Guide', icon: FileText },
];

const LOCATION_LINKS: ClusterLink[] = [
  { to: '/dumpster-rental-oakland-ca', label: 'Oakland', icon: MapPin },
  { to: '/dumpster-rental-san-jose-ca', label: 'San Jose', icon: MapPin },
  { to: '/dumpster-rental-san-francisco-ca', label: 'San Francisco', icon: MapPin },
  { to: '/dumpster-rental-berkeley-ca', label: 'Berkeley', icon: MapPin },
  { to: '/dumpster-rental-fremont-ca', label: 'Fremont', icon: MapPin },
  { to: '/dumpster-rental-hayward-ca', label: 'Hayward', icon: MapPin },
];

type ClusterType = 'services' | 'sizes' | 'locations' | 'all';

interface InternalLinkClusterProps {
  type?: ClusterType;
  title?: string;
  className?: string;
  /** Exclude specific paths from the cluster */
  exclude?: string[];
}

export function InternalLinkCluster({ 
  type = 'all', 
  title = 'Explore More',
  className = '',
  exclude = [],
}: InternalLinkClusterProps) {
  const clusters: { heading: string; links: ClusterLink[] }[] = [];

  if (type === 'all' || type === 'services') {
    clusters.push({ heading: 'Services', links: SERVICE_LINKS.filter(l => !exclude.includes(l.to)) });
  }
  if (type === 'all' || type === 'sizes') {
    clusters.push({ heading: 'Sizes & Pricing', links: SIZE_LINKS.filter(l => !exclude.includes(l.to)) });
  }
  if (type === 'all' || type === 'locations') {
    clusters.push({ heading: 'Service Areas', links: LOCATION_LINKS.filter(l => !exclude.includes(l.to)) });
  }

  return (
    <section className={`py-10 md:py-14 bg-muted/30 border-t border-border ${className}`}>
      <div className="container-wide">
        <h2 className="text-lg font-bold text-foreground mb-6 text-center">{title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {clusters.map(({ heading, links }) => (
            <div key={heading}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{heading}</h3>
              <div className="space-y-1.5">
                {links.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
