// Canonical shared components - import from here
export { TrustStrip, StarRating, TRUST_BADGES, type TrustBadgeKey } from './TrustStrip';
export { DumpsterSizeCard, DUMPSTER_IMAGES, type DumpsterSizeData } from './DumpsterSizeCard';
export { TechnicalDumpsterCard, TechnicalDumpsterGrid, DUMPSTER_SPECS } from './TechnicalDumpsterCard';
export { DumpsterSilhouettePlain } from './DumpsterSilhouettePlain';
export { PlainDumpsterCard, DUMPSTER_SPECS as PLAIN_DUMPSTER_SPECS, type DumpsterSizeYd, type PlainDumpsterCardProps } from './PlainDumpsterCard';
export { PhotoDumpsterCard } from './PhotoDumpsterCard';
export { CTAButtons, PhoneCTA, CTA_CONFIG } from './CTAButtons';
export { OfficeStatusIndicator } from './OfficeStatusIndicator';

// Re-export canonical image registry for convenience
export { 
  CANONICAL_DUMPSTER_IMAGES,
  DUMPSTER_PHOTO_MAP,
  DUMPSTER_DIMS_MAP,
  DUMPSTER_PNG_MAP,
  getCanonicalDumpsterImage,
  getCanonicalDumpsterImageSet,
  hasCanonicalImage,
  getAvailableCanonicalSizes,
  type CanonicalDumpsterSize,
  type DumpsterImageType,
  type DumpsterImageSet,
} from '@/lib/canonicalDumpsterImages';
