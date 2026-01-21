import { useState } from 'react';
import { Star, Play, Quote, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoTestimonial {
  id: string;
  name: string;
  location: string;
  projectType: string;
  rating: number;
  caption: string;
  thumbnailUrl: string;
  videoUrl: string;
}

const testimonials: VideoTestimonial[] = [
  {
    id: '1',
    name: 'Maria G.',
    location: 'Oakland, CA',
    projectType: 'Kitchen Remodel',
    rating: 5,
    caption: '"The driver was so helpful and the dumpster arrived exactly when they said. Made our renovation stress-free!"',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '2',
    name: 'James T.',
    location: 'Fremont, CA',
    projectType: 'Garage Cleanout',
    rating: 5,
    caption: '"Finally cleared out 20 years of stuff. Same-day delivery was a lifesaver. Highly recommend Calsan!"',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '3',
    name: 'Sarah M.',
    location: 'San Jose, CA',
    projectType: 'Roof Replacement',
    rating: 5,
    caption: '"As a contractor, I need reliable partners. Calsan has never let me down. Best dumpster service in the Bay!"',
    thumbnailUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];

export const VideoTestimonialsSection = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
      />
    ));
  };

  return (
    <section className="section-padding bg-gradient-to-b from-background to-muted/30">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Play className="h-4 w-4" />
            Real Customer Stories
          </div>
          <h2 className="heading-lg text-foreground mb-4">
            Hear From Our Happy Customers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it — watch real customers share their experience with Calsan dumpster rentals.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={testimonial.thumbnailUrl}
                  alt={`${testimonial.name} testimonial`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Play Button */}
                <button
                  onClick={() => setActiveVideo(testimonial.id)}
                  className="absolute inset-0 flex items-center justify-center"
                  aria-label={`Play ${testimonial.name}'s testimonial`}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all duration-300 shadow-lg">
                    <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                </button>

                {/* Project Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-full">
                    {testimonial.projectType}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Caption */}
                <div className="relative mb-4">
                  <Quote className="absolute -top-1 -left-1 h-4 w-4 text-primary/30" />
                  <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                    {testimonial.caption}
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary font-medium">
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="w-4 h-4"
                    />
                    Verified
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-muted-foreground mb-4">
            Join 200+ happy customers in the Bay Area
          </p>
          <Button variant="outline" size="lg" asChild>
            <a
              href="https://www.google.com/search?q=calsan+dumpster+reviews"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read More Reviews on Google
            </a>
          </Button>
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
              aria-label="Close video"
            >
              <X className="h-8 w-8" />
            </button>
            <iframe
              src={testimonials.find((t) => t.id === activeVideo)?.videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Customer Testimonial Video"
            />
          </div>
        </div>
      )}
    </section>
  );
};