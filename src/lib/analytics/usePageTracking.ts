// SPA Page View Tracking Hook
// Fires page_view on every route change

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from './ga4';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Use document.title which updates via react-helmet-async
    const timer = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title);
    }, 100); // small delay to let helmet update title

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);
}
