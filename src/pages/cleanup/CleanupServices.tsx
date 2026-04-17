import { Link } from 'react-router-dom';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { CORE_SERVICES } from '@/config/cleanup/content';
import { Button } from '@/components/ui/button';
import { ChevronRight, HardHat, Sparkles, Hammer, CalendarCheck } from 'lucide-react';
import { BeforeAfterStrip } from '@/components/cleanup/BeforeAfterStrip';
import { ServiceAreaBadges } from '@/components/cleanup/ServiceAreaBadges';

const SERVICE_ICONS: Record<string, React.ElementType> = {
  'hard-hat': HardHat,
  'sparkles': Sparkles,
  'hammer': Hammer,
  'calendar-check': CalendarCheck,
};

const ADD_ONS = [
  'Labor-assisted cleanup',
  'Disposal coordination',
  'Rush scheduling',
  'Material handling support',
  'Documentation / photo close-out support',
];

export default function CleanupServices() {
  return (
    <CleanupLayout
      title="Cleanup Services Built for Construction Projects | Calsan C&D Waste Removal"
      description="Construction cleanup, post-construction cleanup, demolition debris cleanup, and recurring jobsite cleanup for contractors, remodelers, and property teams in the Bay Area."
    >
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Cleanup Services Built for Construction Projects</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Our service menu is built around the work that shows up most often on real projects: active site cleanup, final cleanup, debris-heavy cleanup, and recurring jobsite support.
          </p>

          {/* Service area pills */}
          <div className="mb-10">
            <ServiceAreaBadges align="start" />
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {CORE_SERVICES.map((svc) => {
              const Icon = SERVICE_ICONS[svc.icon] || HardHat;
              return (
                <Link
                  key={svc.code}
                  to={`/cleanup/${svc.slug}`}
                  className="group bg-card rounded-xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-foreground">{svc.name}</h2>
                      <p className="text-sm font-semibold text-primary">{svc.startingPrice}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{svc.tagline}</p>
                  <BeforeAfterStrip className="mb-4" />
                  <span className="text-sm text-accent font-medium inline-flex items-center gap-1 group-hover:underline">
                    Learn More <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="bg-muted rounded-xl p-6 border border-border mb-10">
            <h2 className="text-lg font-bold text-foreground mb-3">Project Add-Ons</h2>
            <p className="text-sm text-muted-foreground mb-4">
              These can be included with any core service depending on the project scope:
            </p>
            <ul className="grid sm:grid-cols-2 gap-2">
              {ADD_ONS.map((a) => (
                <li key={a} className="text-sm text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Need help choosing the right service? Send us the project details and photos for a faster recommendation.
            </p>
            <Button asChild size="lg" variant="cta">
              <Link to="/cleanup/quote">Request a Quote</Link>
            </Button>
          </div>
        </div>
      </section>
    </CleanupLayout>
  );
}
