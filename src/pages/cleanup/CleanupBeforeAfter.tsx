import { Link } from 'react-router-dom';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

const PROJECTS = [
  { type: 'Remodel Cleanup', city: 'Oakland', challenge: 'Full-gut kitchen and bath remodel with mixed debris', scope: 'Construction cleanup, debris staging, haul-off coordination', result: 'Site cleared and reset for finish trades in one visit' },
  { type: 'ADU Final Cleanup', city: 'Alameda', challenge: 'New ADU build ready for owner walkthrough with dust and construction debris throughout', scope: 'Post-construction detail clean, window/fixture wipe-down, floor prep', result: 'Turnover-ready presentation passed inspection' },
  { type: 'Commercial Demo Cleanup', city: 'Oakland', challenge: 'Interior demo of tenant improvement space with heavy mixed debris', scope: 'Labor-assisted debris cleanup, material sorting, loading coordination', result: 'Space cleared for new build-out phase within 2 days' },
];

export default function CleanupBeforeAfter() {
  return (
    <CleanupLayout
      title="Before & After Project Gallery | Calsan C&D Waste Removal"
      description="Real construction cleanup, post-construction cleanup, and demolition debris projects completed in Oakland, Alameda, and the Bay Area."
    >
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Before & After Projects</h1>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Real cleanup projects from active jobsites in Oakland, Alameda, and the Bay Area.
          </p>

          <div className="space-y-8 mb-12">
            {PROJECTS.map((project, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">{project.type}</span>
                  <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-1 rounded">{project.city}</span>
                </div>

                {/* Photo placeholder */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Camera className="w-8 h-8 mx-auto mb-1 opacity-40" />
                      <span className="text-xs">Before</span>
                    </div>
                  </div>
                  <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Camera className="w-8 h-8 mx-auto mb-1 opacity-40" />
                      <span className="text-xs">After</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p><strong className="text-foreground">Challenge:</strong> <span className="text-muted-foreground">{project.challenge}</span></p>
                  <p><strong className="text-foreground">Scope:</strong> <span className="text-muted-foreground">{project.scope}</span></p>
                  <p><strong className="text-foreground">Result:</strong> <span className="text-muted-foreground">{project.result}</span></p>
                </div>

                {(i + 1) % 2 === 0 && (
                  <div className="mt-4 pt-4 border-t border-border text-center">
                    <Button asChild size="sm" variant="cta">
                      <Link to="/cleanup/quote">Request Similar Cleanup</Link>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Have a similar project? Send us photos for a faster scope review.
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
