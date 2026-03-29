// SEO Page GA4 + dataLayer Tracking Hook
// Fires seo_page_view on mount, provides helpers for quote/call click tracking
import { useEffect, useCallback } from 'react';
import { track, zipPrefix } from '@/lib/analytics/ga4';
import { trackPhoneClick, trackQuoteClick } from '@/lib/analytics/seoTracking';

export type SeoPageType = 'city' | 'city_size' | 'city_material' | 'city_job' | 'zip' | 'blog';

interface UseSeoTrackingParams {
  pageType: SeoPageType;
  city?: string;
  zip?: string;
  sizeYd?: number;
  material?: string;
  jobType?: string;
  slug?: string;
}

export function useSeoTracking(params: UseSeoTrackingParams) {
  const { pageType, city, zip, sizeYd, material, jobType, slug } = params;

  // Fire seo_page_view once on mount
  useEffect(() => {
    track('seo_page_view', {
      page_type: pageType,
      city: city || undefined,
      zip_prefix: zip ? zipPrefix(zip) : undefined,
      size_yd: sizeYd || undefined,
      material: material || undefined,
      job_type: jobType || undefined,
      slug: slug || undefined,
    });
  }, [pageType, city, zip, sizeYd, material, jobType, slug]);

  const page = slug || pageType;

  const trackQuoteClick = useCallback(() => {
    trackQuoteClick(page, city);
  }, [page, city]);

  const trackCallClick = useCallback(() => {
    trackPhoneClick(page, city);
  }, [page, city]);

  return { trackQuoteClick, trackCallClick };
}
