/**
 * Social Links Configuration — Single Source of Truth
 * 
 * CRITICAL: Only PUBLIC profile/company URLs go here.
 * NEVER add admin/dashboard/analytics URLs.
 * These URLs are exposed on the public website footer, schema, and SEO pages.
 */

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
  /** Show in website footer */
  showInFooter: boolean;
  /** Include in schema.org sameAs */
  showInSchema: boolean;
  /** Icon identifier for rendering */
  iconKey: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'facebook',
    label: 'Facebook',
    url: 'https://facebook.com/calsandumpsterspro',
    showInFooter: true,
    showInSchema: true,
    iconKey: 'facebook',
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    url: 'https://instagram.com/calsandumpsterspro',
    showInFooter: true,
    showInSchema: true,
    iconKey: 'instagram',
  },
  {
    platform: 'youtube',
    label: 'YouTube',
    url: 'https://youtube.com/@calsandumpsterspro',
    showInFooter: true,
    showInSchema: true,
    iconKey: 'youtube',
  },
  {
    platform: 'tiktok',
    label: 'TikTok',
    url: 'https://tiktok.com/@calsandumpsterspro',
    showInFooter: true,
    showInSchema: true,
    iconKey: 'tiktok',
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    url: 'https://linkedin.com/company/calsan-dumpsters-pro',
    showInFooter: true,
    showInSchema: true,
    iconKey: 'linkedin',
  },
  {
    platform: 'twitter',
    label: 'X (Twitter)',
    url: 'https://x.com/calsandumpsters',
    showInFooter: false,
    showInSchema: true,
    iconKey: 'twitter',
  },
  {
    platform: 'pinterest',
    label: 'Pinterest',
    url: 'https://pinterest.com/calsandumpsterspro',
    showInFooter: false,
    showInSchema: true,
    iconKey: 'pinterest',
  },
  {
    platform: 'yelp',
    label: 'Yelp',
    url: 'https://yelp.com/biz/calsan-dumpsters-pro-oakland',
    showInFooter: true,
    showInSchema: true,
    iconKey: 'yelp',
  },
  {
    platform: 'google',
    label: 'Google Business',
    url: 'https://g.page/calsan-dumpsters-pro',
    showInFooter: false,
    showInSchema: true,
    iconKey: 'google',
  },
];

/** Get all URLs for schema.org sameAs */
export function getSchemaSameAs(): string[] {
  return SOCIAL_LINKS
    .filter(l => l.showInSchema)
    .map(l => l.url);
}

/** Get footer-visible social links */
export function getFooterSocialLinks(): SocialLink[] {
  return SOCIAL_LINKS.filter(l => l.showInFooter);
}

/** Get a specific social link by platform */
export function getSocialUrl(platform: string): string | null {
  return SOCIAL_LINKS.find(l => l.platform === platform)?.url || null;
}
