/**
 * CANONICAL DUMPSTER IMAGE REGISTRY
 * 
 * This is the SINGLE SOURCE OF TRUTH for all dumpster visuals across the entire system.
 * 
 * RULES:
 * - Every place that displays a dumpster MUST reference images from this registry
 * - NEVER embed local image imports in components
 * - NEVER generate new renders or switch styles
 * - These images are FINAL and APPROVED
 * 
 * USAGE:
 * import { getCanonicalDumpsterImage, CANONICAL_DUMPSTER_IMAGES } from '@/lib/canonicalDumpsterImages';
 * 
 * // Get image by size
 * const image = getCanonicalDumpsterImage(20); // Returns photo URL
 * const dims = getCanonicalDumpsterImage(20, 'dims'); // Returns dimension diagram URL
 */

// Canonical dimensioned render images (with measurements + human scale baked in)
// Single source of truth — all photo/dims/png references resolve to these.
const dumpster5yardPhoto = '/images/dumpsters/render-5yd.png';
const dumpster8yardPhoto = '/images/dumpsters/render-8yd.png';
const dumpster10yardPhoto = '/images/dumpsters/render-10yd.png';
const dumpster20yardPhoto = '/images/dumpsters/render-20yd.png';
const dumpster30yardPhoto = '/images/dumpsters/render-30yd.png';
const dumpster40yardPhoto = '/images/dumpsters/render-40yd.png';
const dumpster50yardPhoto = '/images/dumpsters/render-50yd.png';

// Dimension diagrams and legacy PNGs now use the same dimensioned renders
const dumpster5yardDims = dumpster5yardPhoto;
const dumpster8yardDims = dumpster8yardPhoto;
const dumpster10yardDims = dumpster10yardPhoto;
const dumpster20yardDims = dumpster20yardPhoto;
const dumpster30yardDims = dumpster30yardPhoto;
const dumpster40yardDims = dumpster40yardPhoto;

const dumpster5yardPng = dumpster5yardPhoto;
const dumpster8yardPng = dumpster8yardPhoto;
const dumpster10yardPng = dumpster10yardPhoto;
const dumpster20yardPng = dumpster20yardPhoto;
const dumpster30yardPng = dumpster30yardPhoto;
const dumpster40yardPng = dumpster40yardPhoto;


/**
 * Valid dumpster sizes in yards — canonical set
 * 5yd replaces the legacy 6yd standard
 */
export type CanonicalDumpsterSize = 5 | 8 | 10 | 20 | 30 | 40;

/**
 * Image types available for each dumpster size
 */
export type DumpsterImageType = 'photo' | 'dims' | 'png';

/**
 * Structure for a single dumpster's images
 */
export interface DumpsterImageSet {
  /** Primary photorealistic image (PREFERRED) */
  photo: string;
  /** Dimension diagram with measurements */
  dims: string;
  /** Legacy PNG render (for backwards compatibility) */
  png: string;
}

/**
 * CANONICAL DUMPSTER IMAGES REGISTRY
 * 
 * The complete, locked set of approved dumpster visuals.
 * These images:
 * - Are photo-real
 * - Have correct proportions
 * - Match each other perfectly in style, angle, lighting, padding
 * - Are APPROVED and FINAL
 */
export const CANONICAL_DUMPSTER_IMAGES: Record<CanonicalDumpsterSize, DumpsterImageSet> = {
  5: {
    photo: dumpster5yardPhoto,
    dims: dumpster5yardDims,
    png: dumpster5yardPng,
  },
  8: {
    photo: dumpster8yardPhoto,
    dims: dumpster8yardDims,
    png: dumpster8yardPng,
  },
  10: {
    photo: dumpster10yardPhoto,
    dims: dumpster10yardDims,
    png: dumpster10yardPng,
  },
  20: {
    photo: dumpster20yardPhoto,
    dims: dumpster20yardDims,
    png: dumpster20yardPng,
  },
  30: {
    photo: dumpster30yardPhoto,
    dims: dumpster30yardDims,
    png: dumpster30yardPng,
  },
  40: {
    photo: dumpster40yardPhoto,
    dims: dumpster40yardDims,
    png: dumpster40yardPng,
  },
};

/**
 * Get the canonical image for a dumpster size
 * 
 * @param size - Dumpster size in yards (5, 8, 10, 20, 30, 40, 50)
 * @param type - Image type: 'photo' (default), 'dims', or 'png'
 * @returns Image URL string
 */
export function getCanonicalDumpsterImage(
  size: number,
  type: DumpsterImageType = 'photo'
): string {
  const validSizes: CanonicalDumpsterSize[] = [5, 8, 10, 20, 30, 40];
  // Map 50yd to 40yd visuals (closest), map legacy 6yd to 5yd
  let normalizedSize: CanonicalDumpsterSize;
  if (size === 50) normalizedSize = 40;
  else if (size === 6) normalizedSize = 5;
  else normalizedSize = validSizes.includes(size as CanonicalDumpsterSize)
    ? (size as CanonicalDumpsterSize)
    : 20;
  
  const imageSet = CANONICAL_DUMPSTER_IMAGES[normalizedSize];
  return imageSet[type];
}

/**
 * Get all images for a dumpster size
 */
export function getCanonicalDumpsterImageSet(size: number): DumpsterImageSet {
  const validSizes: CanonicalDumpsterSize[] = [5, 8, 10, 20, 30, 40];
  let normalizedSize: CanonicalDumpsterSize;
  if (size === 50) normalizedSize = 40;
  else if (size === 6) normalizedSize = 5;
  else normalizedSize = validSizes.includes(size as CanonicalDumpsterSize)
    ? (size as CanonicalDumpsterSize)
    : 20;
  
  return CANONICAL_DUMPSTER_IMAGES[normalizedSize];
}

/**
 * Simple flat map for quick access (backwards compatible)
 * Maps size to primary photo URL
 */
export const DUMPSTER_PHOTO_MAP: Record<number, string> = {
  5: dumpster5yardPhoto,
  6: dumpster5yardPhoto, // Legacy compat — maps to 5yd
  8: dumpster8yardPhoto,
  10: dumpster10yardPhoto,
  20: dumpster20yardPhoto,
  30: dumpster30yardPhoto,
  40: dumpster40yardPhoto,
  50: dumpster50yardPhoto,
};

/**
 * Simple flat map for dimension diagrams
 */
export const DUMPSTER_DIMS_MAP: Record<number, string> = {
  5: dumpster5yardDims,
  6: dumpster5yardDims,
  8: dumpster8yardDims,
  10: dumpster10yardDims,
  20: dumpster20yardDims,
  30: dumpster30yardDims,
  40: dumpster40yardDims,
  50: dumpster50yardPhoto,
};

/**
 * Legacy PNG map (for backwards compatibility)
 */
export const DUMPSTER_PNG_MAP: Record<number, string> = {
  5: dumpster5yardPng,
  6: dumpster5yardPng,
  8: dumpster8yardPng,
  10: dumpster10yardPng,
  20: dumpster20yardPng,
  30: dumpster30yardPng,
  40: dumpster40yardPng,
  50: dumpster50yardPhoto,
};

/**
 * Check if a size has canonical images available
 */
export function hasCanonicalImage(size: number): boolean {
  if (size === 50 || size === 6) return true;
  return size in CANONICAL_DUMPSTER_IMAGES;
}

/**
 * Get all available canonical sizes
 */
export function getAvailableCanonicalSizes(): CanonicalDumpsterSize[] {
  return [5, 8, 10, 20, 30, 40];
}
