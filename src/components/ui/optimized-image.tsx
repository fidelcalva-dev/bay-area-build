import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'empty',
  className,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Generate optimized srcset for responsive images
  const generateSrcSet = (baseSrc: string) => {
    // For external URLs (unsplash, etc), add width parameters
    if (baseSrc.includes('unsplash.com')) {
      return `${baseSrc}&w=400 400w, ${baseSrc}&w=800 800w, ${baseSrc}&w=1200 1200w`;
    }
    return undefined;
  };

  const srcSet = generateSrcSet(src);

  return (
    <div 
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        placeholder === 'blur' && !isLoaded && 'bg-muted animate-pulse',
        className
      )}
      style={{ width, height }}
    >
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          srcSet={srcSet}
          sizes={srcSet ? '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px' : undefined}
          onLoad={handleLoad}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}

// Lightweight skeleton for image placeholders
export function ImageSkeleton({ 
  className,
  aspectRatio = '16/9' 
}: { 
  className?: string;
  aspectRatio?: string;
}) {
  return (
    <div 
      className={cn(
        'bg-muted animate-pulse rounded-lg',
        className
      )}
      style={{ aspectRatio }}
    />
  );
}
