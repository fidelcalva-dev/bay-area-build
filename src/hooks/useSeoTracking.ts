// SEO Page GA4 Tracking Hook
// Fires seo_page_view on mount, provides helpers for quote/call click tracking
import { useEffect, useCallback } from 'react';
import { track, zipPrefix } from '@/lib/analytics/ga4';

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

  const trackQuoteClick = useCallback(() => {
    track('quote_click_from_seo', {
      page_type: pageType,
      city: city || undefined,
      zip_prefix: zip ? zipPrefix(zip) : undefined,
      size_yd: sizeYd || undefined,
      material: material || undefined,
      job_type: jobType || undefined,
    });
  }, [pageType, city, zip, sizeYd, material, jobType]);

  const trackCallClick = useCallback(() => {
    track('call_click_from_seo', {
      page_type: pageType,
      city: city || undefined,
      zip_prefix: zip ? zipPrefix(zip) : undefined,
    });
  }, [pageType, city, zip]);

  return { trackQuoteClick, trackCallClick };
}
