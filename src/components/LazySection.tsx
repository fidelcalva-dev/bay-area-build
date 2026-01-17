import { Suspense, lazy, ComponentType, useEffect, useState, useRef } from 'react';

interface LazySectionProps {
  component: () => Promise<{ default: ComponentType }>;
  fallback?: React.ReactNode;
  rootMargin?: string;
}

const DefaultFallback = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export function LazySection({ 
  component, 
  fallback = <DefaultFallback />,
  rootMargin = '200px' 
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [LazyComponent, setLazyComponent] = useState<ComponentType | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (isVisible && !LazyComponent) {
      component().then((mod) => {
        setLazyComponent(() => mod.default);
      });
    }
  }, [isVisible, component, LazyComponent]);

  return (
    <div ref={ref}>
      {LazyComponent ? <LazyComponent /> : fallback}
    </div>
  );
}

// Pre-built lazy loaders for heavy sections
export const LazyServiceCoverageMap = lazy(() => 
  import('@/components/sections/ServiceCoverageMapSection').then(mod => ({ default: mod.ServiceCoverageMapSection }))
);

export const LazyBeforeAfterGallery = lazy(() => 
  import('@/components/sections/BeforeAfterGallerySection').then(mod => ({ default: mod.BeforeAfterGallerySection }))
);

export const LazyVideoTestimonials = lazy(() => 
  import('@/components/sections/VideoTestimonialsSection').then(mod => ({ default: mod.VideoTestimonialsSection }))
);

export const LazyReviews = lazy(() => 
  import('@/components/sections/ReviewsSection').then(mod => ({ default: mod.ReviewsSection }))
);

export const LazyCompareSizes = lazy(() => 
  import('@/components/sections/CompareSizesSection').then(mod => ({ default: mod.CompareSizesSection }))
);

export const LazyRealWork = lazy(() => 
  import('@/components/sections/RealWorkSection').then(mod => ({ default: mod.RealWorkSection }))
);

// Wrapper with Suspense for lazy components
export function SuspenseSection({ 
  children, 
  fallback = <DefaultFallback /> 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
