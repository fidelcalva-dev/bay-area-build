import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PHOTOS = [
  { src: '/images/carousel/1.jpg', alt: 'Calsan dumpsters at yard' },
  { src: '/images/carousel/2.jpg', alt: 'Dumpster at residential site' },
  { src: '/images/carousel/3.jpg', alt: 'Dumpster loaded with soil' },
  { src: '/images/carousel/4.jpg', alt: 'Dumpster being delivered by truck' },
  { src: '/images/carousel/5.jpg', alt: 'Large dumpster at residential property' },
  { src: '/images/carousel/6.jpg', alt: 'Dumpster with debris on street' },
];

export function PhotoCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? PHOTOS.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === PHOTOS.length - 1 ? 0 : c + 1));

  return (
    <section className="py-10 md:py-14 bg-background">
      <div className="container-wide max-w-3xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <img
            src={PHOTOS[current].src}
            alt={PHOTOS[current].alt}
            className="w-full h-[280px] md:h-[400px] object-cover transition-opacity duration-300"
          />

          {/* Arrows */}
          <button
            onClick={prev}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {PHOTOS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === current ? 'bg-primary' : 'bg-background/60 border border-border/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
