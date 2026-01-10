import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
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
  },
  {
    id: 2,
    name: 'Sandra L.',
    location: 'San Francisco, CA',
    rating: 5,
    text: 'Excellent service! The driver was professional and placed the dumpster exactly where I needed it. Text updates were super helpful.',
    date: 'November 2025',
  },
  {
    id: 3,
    name: 'Carlos M.',
    location: 'San Jose, CA',
    rating: 5,
    text: 'Great bilingual support. They answered all my questions in Spanish and made the process so easy. Highly recommend!',
    date: 'November 2025',
  },
  {
    id: 4,
    name: 'Jennifer T.',
    location: 'Berkeley, CA',
    rating: 5,
    text: 'Used them for a kitchen renovation. Perfect size recommendation, on-time delivery and pickup. No hidden fees. 10/10.',
    date: 'October 2025',
  },
  {
    id: 5,
    name: 'David K.',
    location: 'Fremont, CA',
    rating: 5,
    text: 'As a contractor, I need reliable dumpster service. Calsan has never let me down. Quick turnarounds and fair pricing.',
    date: 'October 2025',
  },
];

export function ReviewsSection() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const visibleReviews = [
    reviews[currentIndex],
    reviews[(currentIndex + 1) % reviews.length],
    reviews[(currentIndex + 2) % reviews.length],
  ];

  return (
    <section className="section-padding bg-muted">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <h2 className="heading-lg text-foreground mb-4">{t('reviews.title')}</h2>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <span className="font-semibold text-foreground">5.0</span>
              <span className="text-muted-foreground">• 500+ reviews</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={prevReview}
                className="p-2 rounded-lg border border-border hover:bg-card transition-colors"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextReview}
                className="p-2 rounded-lg border border-border hover:bg-card transition-colors"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <Button asChild variant="outline" size="default">
              <a href="https://g.page/review" target="_blank" rel="noopener noreferrer">
                {t('reviews.leave')}
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleReviews.map((review, index) => (
            <div
              key={`${review.id}-${index}`}
              className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-card"
            >
              <div className="flex mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed">"{review.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{review.name}</p>
                  <p className="text-sm text-muted-foreground">{review.location}</p>
                </div>
                <p className="text-sm text-muted-foreground">{review.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
