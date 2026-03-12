/**
 * Local Presence Configuration — Single source of truth for NAP,
 * business profiles, review links, and local search strategy.
 *
 * Used by: public website, local profile exports, review requests,
 * citation consistency checks, and admin/local dashboards.
 */

import { REGIONS, CITY_DIRECTORY, type ServiceModel } from '@/lib/service-area-config';

// ─── Core Business Data ──────────────────────────────────────────

export const BUSINESS_INFO = {
  name: 'Calsan Dumpsters Pro',
  legalName: 'Calsan Dumpsters Pro LLC',
  primaryPhone: '(510) 680-2150',
  primaryPhoneE164: '+15106802150',
  supportEmail: 'info@calsandumpsterspro.com',
  website: 'https://calsandumpsterspro.com',
  foundedYear: 2021,
  primaryCategory: 'Dumpster Rental Service',
  secondaryCategories: [
    'Waste Management Service',
    'Roll Off Dumpster Rental',
    'Construction Dumpster Service',
  ],
  descriptionShort:
    'Professional dumpster rental serving the San Francisco Bay Area with direct yard operations in Oakland, San Jose, and San Francisco.',
  descriptionLong:
    'Calsan Dumpsters Pro provides fast, reliable dumpster rental for residential, commercial, and construction projects across the Bay Area. With local yard operations in Oakland and San Jose, we offer same-day delivery, transparent pricing, and a full range of container sizes from 5 to 50 yards. Our service extends statewide through a trusted logistics network covering the Central Valley, North Bay, and Southern California.',
  hours: {
    label: 'Mon–Sun 6:00 AM – 9:00 PM PT',
    structured: [
      { days: 'Monday',    open: '06:00', close: '21:00' },
      { days: 'Tuesday',   open: '06:00', close: '21:00' },
      { days: 'Wednesday', open: '06:00', close: '21:00' },
      { days: 'Thursday',  open: '06:00', close: '21:00' },
      { days: 'Friday',    open: '06:00', close: '21:00' },
      { days: 'Saturday',  open: '06:00', close: '21:00' },
      { days: 'Sunday',    open: '06:00', close: '21:00' },
    ],
  },
} as const;

// ─── Locations / Yards ───────────────────────────────────────────

export interface YardLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  isHeadquarters: boolean;
  serviceModel: ServiceModel;
}

export const YARD_LOCATIONS: YardLocation[] = [
  {
    id: 'hq',
    name: 'Headquarters',
    address: '1930 12th Ave, Suite 201',
    city: 'Oakland',
    state: 'CA',
    zip: '94606',
    lat: 37.7945,
    lng: -122.2471,
    isHeadquarters: true,
    serviceModel: 'DIRECT_OPERATION',
  },
  {
    id: 'oakland-yard',
    name: 'Oakland Yard',
    address: '1000 46th Ave',
    city: 'Oakland',
    state: 'CA',
    zip: '94601',
    lat: 37.7700,
    lng: -122.2100,
    isHeadquarters: false,
    serviceModel: 'DIRECT_OPERATION',
  },
  {
    id: 'sanjose-yard',
    name: 'San Jose Yard',
    address: '2071 Ringwood Ave',
    city: 'San Jose',
    state: 'CA',
    zip: '95131',
    lat: 37.3861,
    lng: -121.8906,
    isHeadquarters: false,
    serviceModel: 'DIRECT_OPERATION',
  },
];

// ─── Review Links ────────────────────────────────────────────────

export interface ReviewLink {
  platform: string;
  marketCode: string;
  url: string;
  label: string;
}

export const REVIEW_LINKS: ReviewLink[] = [
  { platform: 'google', marketCode: 'OAK_EAST_BAY',  url: 'https://g.page/calsan-dumpsters-pro/review', label: 'Oakland / East Bay' },
  { platform: 'google', marketCode: 'SJ_SOUTH_BAY',  url: 'https://g.page/calsan-dumpsters-pro/review', label: 'San Jose / South Bay' },
  { platform: 'google', marketCode: 'SF_PENINSULA',   url: 'https://g.page/calsan-dumpsters-pro/review', label: 'San Francisco' },
];

// ─── Profile Statuses ────────────────────────────────────────────

export type ProfileStatus = 'claimed' | 'unclaimed' | 'pending' | 'suspended' | 'not_applicable';

export interface PlatformProfile {
  platform: 'google' | 'bing' | 'apple';
  label: string;
  status: ProfileStatus;
  listingUrl?: string;
  verified: boolean;
  completenessPercent: number;
  lastUpdated?: string;
  notes?: string;
}

export const PLATFORM_PROFILES: PlatformProfile[] = [
  {
    platform: 'google',
    label: 'Google Business Profile — Oakland',
    status: 'claimed',
    verified: true,
    completenessPercent: 85,
    listingUrl: 'https://g.page/calsan-dumpsters-pro',
  },
  {
    platform: 'google',
    label: 'Google Business Profile — San Jose',
    status: 'claimed',
    verified: true,
    completenessPercent: 75,
  },
  {
    platform: 'bing',
    label: 'Bing Places — Primary',
    status: 'claimed',
    verified: false,
    completenessPercent: 40,
    notes: 'Imported from Google; needs verification.',
  },
  {
    platform: 'apple',
    label: 'Apple Business Connect — Primary',
    status: 'unclaimed',
    verified: false,
    completenessPercent: 0,
    notes: 'Not yet claimed. Needs Apple Business Connect setup.',
  },
];

// ─── Review Response Templates ───────────────────────────────────

export interface ReviewResponseTemplate {
  id: string;
  scenario: string;
  template: string;
}

export const REVIEW_RESPONSE_TEMPLATES: ReviewResponseTemplate[] = [
  {
    id: 'positive-residential',
    scenario: '5-Star Residential',
    template:
      "Thank you so much for your kind words, {name}! We're glad the delivery went smoothly and your project in {city} is moving forward. We appreciate your business!",
  },
  {
    id: 'positive-contractor',
    scenario: '5-Star Contractor',
    template:
      'Thanks for the great review, {name}! We love working with contractors in {city} and making sure you have the right dumpster on-site when you need it. Looking forward to your next project!',
  },
  {
    id: 'neutral',
    scenario: 'Neutral / 3-Star',
    template:
      'Hi {name}, thank you for your feedback. We always aim for 5-star service and would love to hear how we can improve. Please reach out to us at (510) 680-2150 so we can make things right.',
  },
  {
    id: 'negative-resolution',
    scenario: 'Complaint With Resolution',
    template:
      'Hi {name}, we sincerely apologize for the inconvenience. We've looked into your order and want to make this right. Please call us at (510) 680-2150 so our team can resolve this for you directly.',
  },
];

// ─── Photo Categories ────────────────────────────────────────────

export const LOCAL_PHOTO_CATEGORIES = [
  'yard',
  'delivery',
  'pickup',
  'dumpster-on-site',
  'before-after',
  'truck',
  'team',
  'contractor-project',
  'residential-project',
  'construction-site',
] as const;

export type LocalPhotoCategory = typeof LOCAL_PHOTO_CATEGORIES[number];

// ─── Citation Platforms ──────────────────────────────────────────

export const CITATION_PLATFORMS = [
  { id: 'google', name: 'Google Business Profile', priority: 1 },
  { id: 'bing', name: 'Bing Places', priority: 2 },
  { id: 'apple', name: 'Apple Business Connect', priority: 3 },
  { id: 'yelp', name: 'Yelp', priority: 4 },
  { id: 'bbb', name: 'Better Business Bureau', priority: 5 },
  { id: 'yellowpages', name: 'Yellow Pages', priority: 6 },
  { id: 'nextdoor', name: 'Nextdoor', priority: 7 },
  { id: 'thumbtack', name: 'Thumbtack', priority: 8 },
  { id: 'homeadvisor', name: 'HomeAdvisor / Angi', priority: 9 },
  { id: 'facebook', name: 'Facebook Business', priority: 10 },
] as const;

// ─── Weekly Task Templates ───────────────────────────────────────

export const WEEKLY_LOCAL_TASKS = [
  { task: 'Upload 3–5 fresh geo-tagged photos', platform: 'google', frequency: 'weekly' },
  { task: 'Publish 1 Google Business post', platform: 'google', frequency: 'weekly' },
  { task: 'Reply to all new reviews', platform: 'google', frequency: 'daily' },
  { task: 'Verify service areas match current coverage', platform: 'google', frequency: 'monthly' },
  { task: 'Refresh service descriptions if needed', platform: 'google', frequency: 'monthly' },
  { task: 'Verify Bing listing info matches GBP', platform: 'bing', frequency: 'monthly' },
  { task: 'Check Apple place card status', platform: 'apple', frequency: 'monthly' },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────

export function getReviewLink(marketCode: string): string {
  const link = REVIEW_LINKS.find(r => r.marketCode === marketCode);
  return link?.url || REVIEW_LINKS[0].url;
}

export function getProfileByPlatform(platform: 'google' | 'bing' | 'apple'): PlatformProfile[] {
  return PLATFORM_PROFILES.filter(p => p.platform === platform);
}

/** Re-export service-area config for unified access */
export { REGIONS, CITY_DIRECTORY };
