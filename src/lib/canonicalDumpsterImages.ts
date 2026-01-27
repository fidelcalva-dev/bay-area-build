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

// Canonical photo imports - photorealistic dumpsters
import dumpster6yardPhoto from '@/assets/dumpsters/6_yd.png';
import dumpster8yardPhoto from '@/assets/dumpsters/8_yd.png';
import dumpster10yardPhoto from '@/assets/dumpsters/dumpster-10yard-photo.png';
import dumpster20yardPhoto from '@/assets/dumpsters/dumpster-20yard-photo.png';
import dumpster30yardPhoto from '@/assets/dumpsters/dumpster-30yard-photo.png';
import dumpster40yardPhoto from '@/assets/dumpsters/dumpster-40yard-photo.png';
import dumpster50yardPhoto from '@/assets/dumpsters/50_yd.png';

// Canonical dimension diagram imports
import dumpster6yardDims from '@/assets/dumpsters/dumpster-6yard-dims.png';
import dumpster8yardDims from '@/assets/dumpsters/dumpster-8yard-dims.png';
import dumpster10yardDims from '@/assets/dumpsters/dumpster-10yard-dims.png';
import dumpster20yardDims from '@/assets/dumpsters/dumpster-20yard-dims.png';
import dumpster30yardDims from '@/assets/dumpsters/dumpster-30yard-dims.png';
import dumpster40yardDims from '@/assets/dumpsters/dumpster-40yard-dims.png';
import dumpster50yardDims from '@/assets/dumpsters/dumpster-50yard-dims.png';

// Legacy PNG imports (for backwards compatibility - prefer photos)
import dumpster6yardPng from '@/assets/dumpsters/dumpster-6yard.png';
import dumpster8yardPng from '@/assets/dumpsters/dumpster-8yard.png';
import dumpster10yardPng from '@/assets/dumpsters/dumpster-10yard.png';
import dumpster20yardPng from '@/assets/dumpsters/dumpster-20yard.png';
import dumpster30yardPng from '@/assets/dumpsters/dumpster-30yard.png';
import dumpster40yardPng from '@/assets/dumpsters/dumpster-40yard.png';
import dumpster50yardPng from '@/assets/dumpsters/dumpster-50yard.png';

/**
 * Valid dumpster sizes in yards
 */
export type CanonicalDumpsterSize = 6 | 8 | 10 | 20 | 30 | 40 | 50;

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
  6: {
    photo: dumpster6yardPhoto,
    dims: dumpster6yardDims,
    png: dumpster6yardPng,
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
  50: {
    photo: dumpster50yardPhoto,
    dims: dumpster50yardDims,
    png: dumpster50yardPng,
  },
};

/**
 * Get the canonical image for a dumpster size
 * 
 * @param size - Dumpster size in yards (6, 8, 10, 20, 30, 40, 50)
 * @param type - Image type: 'photo' (default), 'dims', or 'png'
 * @returns Image URL string
 * 
 * @example
 * // Get primary photo
 * const photo = getCanonicalDumpsterImage(20);
 * 
 * // Get dimension diagram
 * const dims = getCanonicalDumpsterImage(20, 'dims');
 */
export function getCanonicalDumpsterImage(
  size: number,
  type: DumpsterImageType = 'photo'
): string {
  // Validate and normalize size
  const validSizes: CanonicalDumpsterSize[] = [6, 8, 10, 20, 30, 40, 50];
  const normalizedSize = validSizes.includes(size as CanonicalDumpsterSize)
    ? (size as CanonicalDumpsterSize)
    : 20; // Default to 20yd if invalid size
  
  const imageSet = CANONICAL_DUMPSTER_IMAGES[normalizedSize];
  return imageSet[type];
}

/**
 * Get all images for a dumpster size
 * 
 * @param size - Dumpster size in yards
 * @returns Object with photo, dims, and png URLs
 */
export function getCanonicalDumpsterImageSet(size: number): DumpsterImageSet {
  const validSizes: CanonicalDumpsterSize[] = [6, 8, 10, 20, 30, 40, 50];
  const normalizedSize = validSizes.includes(size as CanonicalDumpsterSize)
    ? (size as CanonicalDumpsterSize)
    : 20;
  
  return CANONICAL_DUMPSTER_IMAGES[normalizedSize];
}

/**
 * Simple flat map for quick access (backwards compatible)
 * Maps size to primary photo URL
 */
export const DUMPSTER_PHOTO_MAP: Record<number, string> = {
  6: dumpster6yardPhoto,
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
  6: dumpster6yardDims,
  8: dumpster8yardDims,
  10: dumpster10yardDims,
  20: dumpster20yardDims,
  30: dumpster30yardDims,
  40: dumpster40yardDims,
  50: dumpster50yardDims,
};

/**
 * Legacy PNG map (for backwards compatibility)
 */
export const DUMPSTER_PNG_MAP: Record<number, string> = {
  6: dumpster6yardPng,
  8: dumpster8yardPng,
  10: dumpster10yardPng,
  20: dumpster20yardPng,
  30: dumpster30yardPng,
  40: dumpster40yardPng,
  50: dumpster50yardPng,
};

/**
 * Check if a size has canonical images available
 */
export function hasCanonicalImage(size: number): boolean {
  return size in CANONICAL_DUMPSTER_IMAGES;
}

/**
 * Get all available canonical sizes
 */
export function getAvailableCanonicalSizes(): CanonicalDumpsterSize[] {
  return [6, 8, 10, 20, 30, 40, 50];
}
