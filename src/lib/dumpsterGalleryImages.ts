/**
 * Gallery photos for each dumpster size in the Size Visualizer.
 * The first slide is always the canonical dimension overlay.
 * Additional slides are real job-site photos.
 */

import photo6yd1 from '@/assets/dumpsters/6yd-photo-1.jpg';
import photo6yd2 from '@/assets/dumpsters/6yd-photo-2.jpg';
import photo6yd3 from '@/assets/dumpsters/6yd-photo-3.jpg';
import photo8yd1 from '@/assets/dumpsters/8yd-photo-1.jpg';
import photo8yd2 from '@/assets/dumpsters/8yd-photo-2.jpg';
import photo8yd3 from '@/assets/dumpsters/8yd-photo-3.jpg';
import photo8yd4 from '@/assets/dumpsters/8yd-photo-4.jpg';

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
  8: [
    { src: photo8yd1, alt: '8-yard dumpster at job site with materials' },
    { src: photo8yd2, alt: '8-yard dumpster open with interior view' },
    { src: photo8yd3, alt: '8-yard dumpster on residential property' },
    { src: photo8yd4, alt: '8-yard dumpster loaded with construction debris' },
  ],
};

export function getGalleryPhotos(sizeYd: number): DumpsterGalleryPhoto[] {
  return DUMPSTER_GALLERY[sizeYd] || [];
}
