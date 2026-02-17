// 301-style redirects from old URL patterns to canonical SEO URLs
// Old: /{citySlug}/{size}-yard-dumpster → New: /dumpster-rental/{citySlug}/{size}-yard
// Old: /{citySlug}/{materialSlug} → New: /dumpster-rental/{citySlug}/{materialSlug}
// Old: /{citySlug}/{jobSlug} → New: /dumpster-rental/{citySlug}/{jobSlug}

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function LegacySizeRedirect() {
  const { citySlug, sizeSlug } = useParams<{ citySlug: string; sizeSlug: string }>();
  const navigate = useNavigate();
  useEffect(() => {
    if (citySlug && sizeSlug) {
      // /{citySlug}/{sz}-yard-dumpster → /dumpster-rental/{citySlug}/{sz}-yard
      const size = parseInt(sizeSlug);
      if (!isNaN(size)) {
        navigate(`/dumpster-rental/${citySlug}/${size}-yard`, { replace: true });
      }
    }
  }, [citySlug, sizeSlug, navigate]);
  return null;
}

export function LegacySubpageRedirect() {
  const { citySlug, subSlug } = useParams<{ citySlug: string; subSlug: string }>();
  const navigate = useNavigate();
  useEffect(() => {
    if (citySlug && subSlug) {
      navigate(`/dumpster-rental/${citySlug}/${subSlug}`, { replace: true });
    }
  }, [citySlug, subSlug, navigate]);
  return null;
}
