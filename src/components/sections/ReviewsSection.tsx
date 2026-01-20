import { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, ExternalLink, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reviews = [
  {
    id: 1,
    name: 'Michael R.',
    location: 'Oakland, CA',
    rating: 5,
    text: 'Called in the morning, had a dumpster by 2pm. Price was exactly what they quoted. Will definitely use again.',
    date: 'December 2025',
    verified: true,
  },
  {
    id: 2,
    name: 'Sandra L.',
    location: 'San Francisco, CA',
    rating: 5,
    text: 'The driver was professional and placed the dumpster exactly where I needed it. Text updates were super helpful.',
    date: 'November 2025',
    verified: true,
  },
  {
    id: 3,
    name: 'Carlos M.',
    location: 'San Jose, CA',
    rating: 5,
    text: 'Great bilingual support. They answered all my questions in Spanish and made the process easy. Highly recommend!',
    date: 'November 2025',
    verified: true,
  },
  {
    id: 4,
    name: 'Jennifer T.',
    location: 'Berkeley, CA',
    rating: 5,
    text: 'Perfect size recommendation, on-time delivery and pickup. No hidden fees. 10/10.',
    date: 'October 2025',
    verified: true,
  },
  {
    id: 5,
    name: 'David K.',
    location: 'Fremont, CA',
    rating: 5,
    text: 'As a contractor, I need reliable dumpster service. Calsan has never let me down. Quick turnarounds.',
    date: 'October 2025',
    verified: true,
  },
  {
    id: 6,
    name: 'Maria G.',
    location: 'Palo Alto, CA',
    rating: 5,
    text: 'Online booking was easy and they called to confirm within minutes. Very impressed!',
    date: 'September 2025',
    verified: true,
  },
];

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const maxIndex = reviews.length - 3;

  const nextReview = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevReview = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextReview, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextReview]);

  const visibleReviews = [
    reviews[currentIndex],
    reviews[(currentIndex + 1) % reviews.length],
    reviews[(currentIndex + 2) % reviews.length],
  ];

  return (
    <section id="reviews" className="py-16 md:py-24 bg-muted/50">
      <div className="container-wide">
        {/* Header - Compact */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Customer reviews
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              What customers say
            </h2>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card rounded-xl px-4 py-2 border border-border">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <span className="font-bold text-foreground">5.0</span>
              <span className="text-sm text-muted-foreground">• 500+ reviews</span>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => { prevReview(); setIsAutoPlaying(false); }}
                className="p-2 rounded-lg border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => { nextReview(); setIsAutoPlaying(false); }}
                className="p-2 rounded-lg border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                aria-label="Next review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {visibleReviews.map((review, index) => (
            <ReviewCard key={`${review.id}-${currentIndex}-${index}`} review={review} />
          ))}
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-1.5 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); setIsAutoPlaying(false); }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex 
                  ? 'bg-primary w-6' 
                  : 'bg-border hover:bg-muted-foreground w-2'
              }`}
              aria-label={`Go to review ${idx + 1}`}
            />
          ))}
        </div>

        {/* Leave a Review CTA */}
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg">
            <a href="https://g.page/r/calsan-dumpsters/review" target="_blank" rel="noopener noreferrer">
              <Star className="w-4 h-4 mr-2" />
              Leave a review
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

interface ReviewCardProps {
  review: typeof reviews[0];
}

function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="relative bg-card rounded-2xl p-5 border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300">
      {/* Quote decoration */}
      <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[...Array(review.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
        ))}
      </div>

      {/* Text */}
      <p className="text-foreground text-sm leading-relaxed mb-4 line-clamp-3">
        "{review.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">{review.name.charAt(0)}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm">{review.name}</span>
            {review.verified && (
              <svg className="w-3.5 h-3.5 fill-primary" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{review.location}</span>
        </div>
      </div>
    </div>
  );
}
