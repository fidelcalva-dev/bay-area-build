import { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, ExternalLink, Quote, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VERIFIED_REVIEWS, REVIEW_STATS, REVIEW_LINKS, type CustomerReview } from '@/data/reviews';
import { GoogleIcon, FacebookIcon } from '@/components/shared/BrandIcons';

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const maxIndex = Math.max(0, VERIFIED_REVIEWS.length - 3);

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
    VERIFIED_REVIEWS[currentIndex],
    VERIFIED_REVIEWS[(currentIndex + 1) % VERIFIED_REVIEWS.length],
    VERIFIED_REVIEWS[(currentIndex + 2) % VERIFIED_REVIEWS.length],
  ];

  return (
    <section id="reviews" className="py-16 md:py-24 bg-muted/50">
      <div className="container-wide">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified reviews
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              What customers say
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Reviews shown are from verified customers on Google and Facebook.
            </p>
          </div>
          
          {/* Rating Summary & Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card rounded-xl px-4 py-2 border border-border">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(REVIEW_STATS.averageRating) ? 'fill-accent text-accent' : 'fill-muted text-muted'}`} 
                  />
                ))}
              </div>
              <span className="font-bold text-foreground">{REVIEW_STATS.averageRating}</span>
              <span className="text-sm text-muted-foreground">• {REVIEW_STATS.totalReviews}+ reviews</span>
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

        {/* External Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Button asChild variant="outline" size="lg">
            <a href="https://share.google/TnFPr0cSXhoW36Vso" target="_blank" rel="noopener noreferrer">
              Read more on Google
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={REVIEW_LINKS.facebookPage} target="_blank" rel="noopener noreferrer">
              View on Facebook
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
          <Button asChild variant="default" size="lg">
            <a href={REVIEW_LINKS.google} target="_blank" rel="noopener noreferrer">
              <Star className="w-4 h-4 mr-2" />
              Leave a review
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

interface ReviewCardProps {
  review: CustomerReview;
}

function ReviewCard({ review }: ReviewCardProps) {
  const isGoogle = review.source === 'google';
  const SourceIcon = isGoogle ? GoogleIcon : FacebookIcon;
  const sourceLabel = isGoogle ? 'Google' : 'Facebook';

  return (
    <div className="relative bg-card rounded-2xl p-5 border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300">
      {/* Quote decoration */}
      <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

      {/* Source Badge with Brand Icon */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-card border border-border px-2.5 py-1 rounded-full shadow-sm">
          <SourceIcon size={14} />
          <span className="text-foreground">{sourceLabel}</span>
        </span>
        {review.verified && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Verified
          </span>
        )}
      </div>

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
          <span className="font-semibold text-foreground text-sm block">{review.name}</span>
          <span className="text-xs text-muted-foreground">{review.location} • {review.date}</span>
        </div>
      </div>
    </div>
  );
}
