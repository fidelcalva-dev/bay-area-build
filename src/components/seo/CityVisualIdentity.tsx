/**
 * CityVisualIdentity — City-specific visual accents for domination SEO pages.
 * Renders: accent ribbon w/ landmark line, local stats bar, and neighborhood pills.
 *
 * Colors are accents only — they do NOT override the brand design tokens.
 * Used inline below the hero on /dumpster-rental-{oakland|san-jose|san-francisco}-ca.
 */
import { MapPin, Zap, Star, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CityKey = 'oakland' | 'san-jose' | 'san-francisco';

interface CityProfile {
  accent: string;          // hex, used inline only as accent
  accentSoft: string;      // soft tint for backgrounds
  landmark: string;
  stats: { icon: 'pin' | 'bolt' | 'star' | 'cal'; label: string }[];
  neighborhoods: string[];
}

const PROFILES: Record<CityKey, CityProfile> = {
  oakland: {
    accent: '#006400',
    accentSoft: 'rgba(0,100,0,0.08)',
    landmark: 'Serving the East Bay from our Oakland yard at 46th Ave',
    stats: [
      { icon: 'pin', label: '2.3 miles from downtown Oakland' },
      { icon: 'bolt', label: 'Same-day delivery available' },
      { icon: 'star', label: '4.7 stars · 89 reviews' },
      { icon: 'cal', label: 'Serving Oakland since 2015' },
    ],
    neighborhoods: ['Fruitvale', 'Rockridge', 'Temescal', 'Jack London', 'West Oakland', 'East Oakland'],
  },
  'san-jose': {
    accent: '#0066CC',
    accentSoft: 'rgba(0,102,204,0.08)',
    landmark: 'Delivering to San Jose from our South Bay yard — same day',
    stats: [
      { icon: 'pin', label: 'Central San Jose dispatch' },
      { icon: 'bolt', label: 'Same-day delivery available' },
      { icon: 'star', label: '4.8 stars · 112 reviews' },
      { icon: 'cal', label: 'Serving San Jose since 2015' },
    ],
    neighborhoods: ['Downtown', 'Willow Glen', 'Eastside', 'Berryessa', 'Almaden', 'Cambrian'],
  },
  'san-francisco': {
    accent: '#C0392B',
    accentSoft: 'rgba(192,57,43,0.08)',
    landmark: 'SF delivery available — SFMTA permit guidance included',
    stats: [
      { icon: 'pin', label: 'All SF neighborhoods served' },
      { icon: 'bolt', label: 'Same-day delivery available' },
      { icon: 'star', label: '4.7 stars · 76 reviews' },
      { icon: 'cal', label: 'Serving San Francisco since 2015' },
    ],
    neighborhoods: ['SOMA', 'Mission', 'Sunset', 'Richmond', 'Bayview', 'Potrero Hill'],
  },
};

const ICONS = { pin: MapPin, bolt: Zap, star: Star, cal: Calendar } as const;

interface Props {
  city: CityKey;
  className?: string;
}

export function CityVisualIdentity({ city, className }: Props) {
  const p = PROFILES[city];
  return (
    <section
      className={cn('border-b border-border', className)}
      style={{ backgroundColor: p.accentSoft }}
      aria-label="Local service details"
    >
      <div className="container-wide py-6 md:py-8 space-y-5">
        {/* Landmark accent ribbon */}
        <div className="flex items-start gap-3">
          <span
            className="mt-1 inline-block w-1 h-6 rounded-full shrink-0"
            style={{ backgroundColor: p.accent }}
            aria-hidden="true"
          />
          <p className="text-sm md:text-base font-semibold text-foreground leading-snug">
            {p.landmark}
          </p>
        </div>

        {/* Local stats bar */}
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {p.stats.map((s) => {
            const Icon = ICONS[s.icon];
            return (
              <li
                key={s.label}
                className="flex items-center gap-2 rounded-lg bg-background border border-border px-3 py-2.5"
              >
                <Icon className="w-4 h-4 shrink-0" style={{ color: p.accent }} aria-hidden="true" />
                <span className="text-xs md:text-sm text-foreground font-medium leading-tight">
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Neighborhood coverage pills */}
        <div>
          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
            Neighborhoods we serve
          </p>
          <div className="flex flex-wrap gap-2">
            {p.neighborhoods.map((n) => (
              <span
                key={n}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border bg-background"
                style={{ color: p.accent, borderColor: p.accent + '40' }}
              >
                <MapPin className="w-3 h-3" />
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CityVisualIdentity;
