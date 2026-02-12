/**
 * Gallery photos for each dumpster size in the Size Visualizer.
 * The first slide is always the canonical dimension overlay.
 * Additional slides are real job-site photos.
 */

import photo6yd1 from '@/assets/dumpsters/6yd-photo-1.jpg';
import photo6yd2 from '@/assets/dumpsters/6yd-photo-2.jpg';
import photo6yd3 from '@/assets/dumpsters/6yd-photo-3.jpg';

export type DumpsterGalleryPhoto = {
  src: string;
  alt: string;
};

// Map of size → extra gallery photos (beyond the canonical dimension view)
export const DUMPSTER_GALLERY: Record<number, DumpsterGalleryPhoto[]> = {
  6: [
    { src: photo6yd1, alt: '6-yard dumpster loaded with concrete debris' },
    { src: photo6yd2, alt: '6-yard dumpster on residential driveway' },
    { src: photo6yd3, alt: '6-yard dumpster at commercial job site' },
  ],
};

export function getGalleryPhotos(sizeYd: number): DumpsterGalleryPhoto[] {
  return DUMPSTER_GALLERY[sizeYd] || [];
}
