import { AnimatedSection } from '@/components/animations';
import calsanVideo from '@/assets/videos/calsan-how-it-works.mp4';

export function VideoExplainerSection() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-wide">
        <AnimatedSection className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border bg-card">
            <video
              className="w-full aspect-video"
              controls
              playsInline
              preload="metadata"
              poster=""
            >
              <source src={calsanVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Watch how dumpster rental works with Calsan
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
