import { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, ExternalLink, Quote, Grid3X3, LayoutList, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const reviews = [
  {
    id: 1,
    name: 'Michael R.',
    location: 'Oakland, CA',
    rating: 5,
    text: 'Called in the morning, had a dumpster by 2pm. Price was exactly what they quoted. Will definitely use again for our next project.',
    date: 'December 2025',
    verified: true,
    source: 'Google',
  },
  {
    id: 2,
    name: 'Sandra L.',
    location: 'San Francisco, CA',
    rating: 5,
    text: 'Excellent service! The driver was professional and placed the dumpster exactly where I needed it. Text updates were super helpful.',
    date: 'November 2025',
    verified: true,
    source: 'Google',
  },
  {
    id: 3,
    name: 'Carlos M.',
    location: 'San Jose, CA',
    rating: 5,
    text: 'Great bilingual support. They answered all my questions in Spanish and made the process so easy. Highly recommend!',
    date: 'November 2025',
    verified: true,
    source: 'Google',
  },
  {
    id: 4,
    name: 'Jennifer T.',
    location: 'Berkeley, CA',
    rating: 5,
    text: 'Used them for a kitchen renovation. Perfect size recommendation, on-time delivery and pickup. No hidden fees. 10/10.',
    date: 'October 2025',
    verified: true,
    source: 'Google',
  },
  {
    id: 5,
    name: 'David K.',
    location: 'Fremont, CA',
    rating: 5,
    text: 'As a contractor, I need reliable dumpster service. Calsan has never let me down. Quick turnarounds and fair pricing.',
    date: 'October 2025',
    verified: true,
    source: 'Google',
  },
  {
    id: 6,
    name: 'Maria G.',
    location: 'Palo Alto, CA',
    rating: 5,
    text: 'The online booking was so easy and they called to confirm within minutes. Dumpster arrived exactly when promised. Very impressed!',
    date: 'September 2025',
    verified: true,
    source: 'Google',
  },
  {
    id: 7,
    name: 'Robert H.',
    location: 'Walnut Creek, CA',
    rating: 5,
    text: 'Third time using Calsan. Consistency is key and they deliver every time. Fair prices and reliable service.',
    date: 'September 2025',
    verified: true,
    source: 'Google',
  },
  {
    id: 8,
    name: 'Lisa M.',
    location: 'Concord, CA',
    rating: 5,
    text: 'Needed a last-minute dumpster for an estate cleanout. They came through when two other companies couldn\'t. Lifesavers!',
    date: 'August 2025',
    verified: true,
    source: 'Google',
  },
];

type ViewMode = 'slider' | 'grid';

export function ReviewsSection() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const maxIndex = reviews.length - 3;

  const nextReview = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevReview = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying || viewMode !== 'slider') return;
    
    const interval = setInterval(nextReview, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, viewMode, nextReview]);

  const visibleReviews = [
    reviews[currentIndex],
    reviews[(currentIndex + 1) % reviews.length],
    reviews[(currentIndex + 2) % reviews.length],
  ];

  return (
    <section id="reviews" className="section-padding bg-muted relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container-wide relative z-10">
        {/* Header with Stats */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-semibold text-primary mb-6">
              <Quote className="w-4 h-4" />
              <span>Customer Reviews</span>
            </div>
            
            <h2 className="heading-lg text-foreground mb-6">{t('reviews.title')}</h2>
            
            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-card rounded-xl px-5 py-3 border border-border shadow-sm">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <div>
                  <span className="font-bold text-xl text-foreground">5.0</span>
                  <span className="text-muted-foreground text-sm ml-1">rating</span>
                </div>
              </div>
              
              <div className="bg-card rounded-xl px-5 py-3 border border-border shadow-sm">
                <span className="font-bold text-xl text-foreground">500+</span>
                <span className="text-muted-foreground text-sm ml-1">verified reviews</span>
              </div>
              
              <div className="bg-card rounded-xl px-5 py-3 border border-border shadow-sm flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-primary" />
                <span className="font-bold text-xl text-primary">98%</span>
                <span className="text-muted-foreground text-sm">recommend us</span>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Toggle */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-card rounded-lg border border-border">
              <button
                onClick={() => setViewMode('slider')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'slider' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted text-muted-foreground'
                }`}
                aria-label="Slider view"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted text-muted-foreground'
                }`}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>

            {/* Slider Controls */}
            {viewMode === 'slider' && (
              <div className="flex gap-2">
                <button
                  onClick={() => { prevReview(); setIsAutoPlaying(false); }}
                  className="p-2.5 rounded-xl border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { nextReview(); setIsAutoPlaying(false); }}
                  className="p-2.5 rounded-xl border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* Leave a Review CTA */}
            <Button asChild variant="cta" size="default" className="shadow-cta">
              <a href="https://g.page/r/calsan-dumpsters/review" target="_blank" rel="noopener noreferrer">
                <Star className="w-4 h-4 mr-2" />
                Leave a Review
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>

        {/* Reviews Display */}
        {viewMode === 'slider' ? (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {visibleReviews.map((review, index) => (
              <ReviewCard key={`${review.id}-${currentIndex}-${index}`} review={review} featured={index === 0} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {/* Dot Indicators for Slider */}
        {viewMode === 'slider' && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentIndex(idx); setIsAutoPlaying(false); }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-border hover:bg-muted-foreground w-2.5'
                }`}
                aria-label={`Go to review ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA - Leave a Review */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-card border border-border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Had a great experience?</p>
                <p className="text-sm text-muted-foreground">Your review helps other customers find us</p>
              </div>
            </div>
            <Button asChild variant="default" size="lg">
              <a href="https://g.page/r/calsan-dumpsters/review" target="_blank" rel="noopener noreferrer">
                Write a Review
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ReviewCardProps {
  review: typeof reviews[0];
  featured?: boolean;
}

function ReviewCard({ review, featured }: ReviewCardProps) {
  return (
    <div
      className={`relative bg-card rounded-2xl p-6 md:p-8 border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        featured 
          ? 'border-primary/30 ring-1 ring-primary/20' 
          : 'border-border'
      }`}
    >
      {/* Quote Icon */}
      <div className="absolute top-6 right-6 opacity-10">
        <Quote className="w-12 h-12 text-primary" />
      </div>

      {/* Header with Source */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex">
          {[...Array(review.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-accent text-accent" />
          ))}
        </div>
        {review.source && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            via {review.source}
          </span>
        )}
      </div>

      {/* Review Text */}
      <p className="text-foreground mb-6 leading-relaxed relative z-10 line-clamp-4">
        "{review.text}"
      </p>

      {/* Author Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">
              {review.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{review.name}</p>
              {review.verified && (
                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                  <svg className="w-3.5 h-3.5 fill-primary" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{review.location}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground hidden sm:block">{review.date}</p>
      </div>
    </div>
  );
}
