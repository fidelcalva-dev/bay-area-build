/**
 * Dimension Overlay - Shows canonical dumpster photo with dimension labels
 * Supports swipeable gallery for sizes that have extra photos.
 */
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { DumpsterSize, DUMPSTER_SPECS } from './constants';
import { getCanonicalDumpsterImage } from '@/lib/canonicalDumpsterImages';
import { getGalleryPhotos, DumpsterGalleryPhoto } from '@/lib/dumpsterGalleryImages';
import { Ruler, ChevronLeft, ChevronRight } from 'lucide-react';

interface DimensionOverlayProps {
  size: DumpsterSize;
  className?: string;
  showPickupLoads?: boolean;
}

export function DimensionOverlay({ size, className, showPickupLoads = true }: DimensionOverlayProps) {
  const spec = DUMPSTER_SPECS[size];
  const photoUrl = getCanonicalDumpsterImage(size, 'photo');
  const galleryPhotos = getGalleryPhotos(size);
  const totalSlides = 1 + galleryPhotos.length; // 1 = dimensions slide
  const hasGallery = galleryPhotos.length > 0;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Reset slide when size changes
  useEffect(() => { setCurrentSlide(0); }, [size]);

  const goTo = (idx: number) => setCurrentSlide(Math.max(0, Math.min(idx, totalSlides - 1)));
  const prev = () => goTo(currentSlide - 1);
  const next = () => goTo(currentSlide + 1);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
    setTouchStart(null);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Size badge */}
      <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold text-lg shadow-md">
        {size} YD
      </div>

      {/* Pickup loads badge */}
      {showPickupLoads && (
        <div className="absolute top-2 right-2 z-10 bg-muted text-foreground px-2.5 py-1 rounded-lg text-sm font-medium">
          ~{spec.pickupLoads} pickup loads
        </div>
      )}

      {/* Slider container */}
      <div
        className="relative bg-muted/30 rounded-xl border border-border overflow-hidden"
        onTouchStart={hasGallery ? handleTouchStart : undefined}
        onTouchEnd={hasGallery ? handleTouchEnd : undefined}
      >
        {/* Slides */}
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* Slide 0: Canonical dimension view */}
          <div className="w-full flex-shrink-0 p-4 pt-14">
            {/* Height dimension line - left side */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-xs text-muted-foreground z-10">
              <div className="w-px h-8 bg-primary/60" />
              <span className="font-semibold text-foreground bg-background/90 px-1.5 py-0.5 rounded shadow-sm">
                {spec.heightFt}' H
              </span>
              <div className="w-px h-8 bg-primary/60" />
            </div>

            {/* Canonical dumpster photo */}
            <div className="relative mx-8">
              <img
                src={photoUrl}
                alt={`${size}-yard dumpster dimensions`}
                className="w-full h-auto object-contain rounded-lg"
                loading="lazy"
              />

              {/* Width indicator - top */}
              <div className="absolute -top-1 left-1/4 right-1/4 flex items-center justify-center z-10">
                <div className="h-px flex-1 bg-primary/60" />
                <span className="px-2 text-xs font-semibold text-foreground bg-background/90 rounded shadow-sm">
                  {spec.widthFt}' W
                </span>
                <div className="h-px flex-1 bg-primary/60" />
              </div>
            </div>

            {/* Length dimension line - bottom */}
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-primary/60" />
              <span className="font-semibold text-foreground bg-background/90 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                <Ruler className="w-3 h-3" />
                {spec.lengthFt}' L
              </span>
              <div className="h-px flex-1 bg-primary/60" />
            </div>
          </div>

          {/* Gallery photo slides */}
          {galleryPhotos.map((photo, idx) => (
            <div key={idx} className="w-full flex-shrink-0 p-4 pt-14 flex items-center justify-center">
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-auto max-h-[320px] object-cover rounded-lg"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {hasGallery && currentSlide > 0 && (
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center text-foreground hover:bg-background transition-colors"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {hasGallery && currentSlide < totalSlides - 1 && (
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center text-foreground hover:bg-background transition-colors"
            aria-label="Next photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Dot indicators */}
        {hasGallery && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentSlide === i
                    ? "bg-primary w-4"
                    : "bg-foreground/30 hover:bg-foreground/50"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dimensions summary bar */}
      <div className="mt-3 flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span><span className="font-semibold text-foreground">{spec.widthFt}'</span> W</span>
        <span className="text-border">×</span>
        <span><span className="font-semibold text-foreground">{spec.lengthFt}'</span> L</span>
        <span className="text-border">×</span>
        <span><span className="font-semibold text-foreground">{spec.heightFt}'</span> H</span>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-2">
        Approx. {spec.volumeCuYd} cubic yards capacity
      </p>
    </div>
  );
}
