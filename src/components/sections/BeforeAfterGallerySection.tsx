import { useState } from 'react';
import { MapPin, Recycle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageCompareSlider } from '@/components/ui/image-compare-slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PROJECTS = [
  {
    id: 1,
    city: 'Oakland',
    material: 'Construction Debris',
    beforeImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&h=600&fit=crop',
    description: 'Full home renovation cleanout',
  },
  {
    id: 2,
    city: 'San Francisco',
    material: 'Household Junk',
    beforeImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    description: 'Garage cleanout project',
  },
  {
    id: 3,
    city: 'San Jose',
    material: 'Roofing',
    beforeImage: 'https://images.unsplash.com/photo-1632923565833-03a0eaad6e38?w=800&h=600&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    description: 'Complete roof replacement',
  },
  {
    id: 4,
    city: 'Fremont',
    material: 'Yard Waste',
    beforeImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&h=600&fit=crop',
    description: 'Backyard landscaping overhaul',
  },
  {
    id: 5,
    city: 'Hayward',
    material: 'Mixed Debris',
    beforeImage: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    description: 'Kitchen remodel debris removal',
  },
];

export function BeforeAfterGallerySection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? PROJECTS.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === PROJECTS.length - 1 ? 0 : prev + 1));
  };

  const activeProject = PROJECTS[activeIndex];

  return (
    <section className="section-padding bg-muted">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="heading-lg text-foreground mb-4">See the Transformation</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Drag the slider to compare before and after. Real projects from Bay Area customers.
          </p>
        </div>

        {/* Main Slider */}
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <ImageCompareSlider
              beforeImage={activeProject.beforeImage}
              afterImage={activeProject.afterImage}
              className="shadow-card"
            />

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
              aria-label="Previous project"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
              aria-label="Next project"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Project Caption */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">
                {activeProject.description}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {activeProject.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Recycle className="w-4 h-4" />
                  {activeProject.material}
                </span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {activeIndex + 1} / {PROJECTS.length}
            </div>
          </div>

          {/* Thumbnail Navigation */}
          <div className="mt-6 flex justify-center gap-2 overflow-x-auto pb-2">
            {PROJECTS.map((project, index) => (
              <button
                key={project.id}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all border-2',
                  index === activeIndex
                    ? 'border-primary ring-2 ring-primary/30 scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                )}
              >
                <img
                  src={project.afterImage}
                  alt={`${project.city} ${project.material} cleanup project after`}
                  width={80}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: '1,000+', label: 'Projects Completed' },
            { value: '98%', label: 'Customer Satisfaction' },
            { value: '24hr', label: 'Average Turnaround' },
            { value: '9', label: 'Counties Served' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
