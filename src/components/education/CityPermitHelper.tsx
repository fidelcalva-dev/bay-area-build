import { FileText, MapPin, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CityPermitHelperProps {
  className?: string;
}

const PERMIT_INFO = [
  {
    city: 'San Francisco',
    required: 'Street only',
    cost: '$5–15/day',
    link: 'https://sf.gov/encroachment-permits',
    notes: 'No permit if on private property',
  },
  {
    city: 'Oakland',
    required: 'Street only',
    cost: '$50+',
    link: 'https://www.oaklandca.gov/services/apply-for-a-special-encroachment-permit',
    notes: '2-3 day processing',
  },
  {
    city: 'San Jose',
    required: 'Street only',
    cost: '$25–50',
    link: 'https://www.sanjoseca.gov/your-government/departments/transportation/permits',
    notes: 'Online application available',
  },
  {
    city: 'Berkeley',
    required: 'Street only',
    cost: '$40+',
    link: 'https://berkeleyca.gov/doing-business/permits',
    notes: 'Residential areas 7 days max',
  },
];

export function CityPermitHelper({ className }: CityPermitHelperProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">City Permit Guide</h3>
            <p className="text-sm text-muted-foreground">Do you need a permit?</p>
          </div>
        </div>
      </div>

      {/* Quick answer */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex gap-3">
          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-foreground font-medium mb-1">On your driveway = No permit needed</p>
            <p className="text-muted-foreground">
              Permits only required when placing dumpster on public streets or sidewalks.
            </p>
          </div>
        </div>
      </div>

      {/* City list */}
      <div className="divide-y divide-border">
        {PERMIT_INFO.map((city) => (
          <div key={city.city} className="p-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">{city.city}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {city.cost}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{city.notes}</p>
              </div>
              <a
                href={city.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors shrink-0"
                aria-label={`Apply for ${city.city} permit`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="p-4 border-t border-border bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex gap-3">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="text-sm">
            <p className="text-foreground font-medium mb-1">Apply 2–5 days before delivery</p>
            <p className="text-xs text-muted-foreground">
              Most cities require advance notice. We can help coordinate timing.
            </p>
          </div>
        </div>
      </div>

      {/* Help CTA */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground flex-1">
            Not sure? Call us — we'll check your address.
          </p>
          <Button asChild variant="outline" size="sm">
            <a href="tel:+15106802150">Call</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
