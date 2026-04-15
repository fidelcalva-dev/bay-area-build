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

/**
 * LegacySubpageRedirect
 * ---------------------
 * Catches legacy 2-segment URLs like /{citySlug}/{materialOrJobSlug}
 * and redirects them to the canonical /dumpster-rental/{citySlug}/{sub} path.
 *
 * PROTECTED SEGMENTS: First-segment values that belong to internal app routes
 * are excluded so this catch-all never intercepts valid application paths.
 * React Router 6 ranks static routes higher than parameterised ones, but this
 * safeguard provides defence-in-depth in case ordering changes.
 *
 * Last reviewed: 2026-04-15
 */

const PROTECTED_SEGMENTS = new Set([
  'admin', 'sales', 'cs', 'dispatch', 'driver', 'finance',
  'portal', 'cleanup', 'platform', 'provider', 'crew',
  'internal', 'ops', 'auth', 'api', 'staff', 'quote',
  'blog', 'careers', 'contact', 'about', 'pricing',
  'sizes', 'materials', 'areas', 'contractors',
  'terms', 'privacy', 'unauthorized',
]);

export function LegacySubpageRedirect() {
  const { citySlug, subSlug } = useParams<{ citySlug: string; subSlug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!citySlug || !subSlug) return;

    // Never redirect if the first segment is a known app route
    if (PROTECTED_SEGMENTS.has(citySlug.toLowerCase())) {
      if (import.meta.env.DEV) {
        console.warn(
          `[LegacySubpageRedirect] Blocked redirect for protected segment: /${citySlug}/${subSlug}`
        );
      }
      return;
    }

    if (import.meta.env.DEV) {
      console.warn(
        `[LegacySubpageRedirect] Redirecting legacy URL: /${citySlug}/${subSlug} → /dumpster-rental/${citySlug}/${subSlug}`
      );
    }

    navigate(`/dumpster-rental/${citySlug}/${subSlug}`, { replace: true });
  }, [citySlug, subSlug, navigate]);

  return null;
}
