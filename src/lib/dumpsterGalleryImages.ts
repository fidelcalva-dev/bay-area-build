/**
 * Gallery photos for each dumpster size in the Size Visualizer.
 * The first slide is always the canonical dimension overlay.
 * Additional slides are real job-site photos.
 */

// Photos served from public/ to avoid bundling large images
const photo5yd1 = '/images/dumpsters/6yd-photo-1.jpg';
const photo5yd2 = '/images/dumpsters/6yd-photo-2.jpg';
const photo5yd3 = '/images/dumpsters/6yd-photo-3.jpg';
const photo8yd1 = '/images/dumpsters/8yd-photo-1.jpg';
const photo8yd2 = '/images/dumpsters/8yd-photo-2.jpg';
const photo8yd3 = '/images/dumpsters/8yd-photo-3.jpg';
const photo8yd4 = '/images/dumpsters/8yd-photo-4.jpg';
const photo10yd1 = '/images/dumpsters/10yd-photo-1.jpg';
const photo10yd2 = '/images/dumpsters/10yd-photo-2.jpg';
const photo10yd3 = '/images/dumpsters/10yd-photo-3.jpg';
const photo10yd4 = '/images/dumpsters/10yd-photo-4.jpg';
const photo20yd1 = '/images/dumpsters/20yd-photo-1.jpg';
const photo20yd2 = '/images/dumpsters/20yd-photo-2.jpg';
const photo20yd3 = '/images/dumpsters/20yd-photo-3.jpg';
const photo20yd4 = '/images/dumpsters/20yd-photo-4.jpg';
const photo30yd1 = '/images/dumpsters/30yd-photo-1.jpg';
const photo30yd2 = '/images/dumpsters/30yd-photo-2.jpg';
const photo30yd3 = '/images/dumpsters/30yd-photo-3.jpg';
const photo30yd4 = '/images/dumpsters/30yd-photo-4.jpg';
const photo40yd1 = '/images/dumpsters/40yd-photo-1.jpg';
const photo40yd2 = '/images/dumpsters/40yd-photo-2.jpg';
const photo40yd3 = '/images/dumpsters/40yd-photo-3.jpg';
const photo40yd4 = '/images/dumpsters/40yd-photo-4.jpg';
const photo50yd1 = '/images/dumpsters/50yd-photo-1.jpg';
const photo50yd2 = '/images/dumpsters/50yd-photo-2.jpg';
const photo50yd3 = '/images/dumpsters/50yd-photo-3.jpg';

export type DumpsterGalleryPhoto = {
  src: string;
  alt: string;
};

// Map of size → extra gallery photos (beyond the canonical dimension view)
export const DUMPSTER_GALLERY: Record<number, DumpsterGalleryPhoto[]> = {
  5: [
    { src: photo5yd1, alt: '5-yard dumpster loaded with concrete debris' },
    { src: photo5yd2, alt: '5-yard dumpster on residential driveway' },
    { src: photo5yd3, alt: '5-yard dumpster at commercial job site' },
  ],
  8: [
    { src: photo8yd1, alt: '8-yard dumpster at job site with materials' },
    { src: photo8yd2, alt: '8-yard dumpster open with interior view' },
    { src: photo8yd3, alt: '8-yard dumpster on residential property' },
    { src: photo8yd4, alt: '8-yard dumpster loaded with construction debris' },
  ],
  10: [
    { src: photo10yd1, alt: '10-yard dumpster on residential grass' },
    { src: photo10yd2, alt: '10-yard dumpster filled with soil and landscaping debris' },
    { src: photo10yd3, alt: '10-yard dumpster at construction site' },
    { src: photo10yd4, alt: '10-yard dumpster loaded with driveway asphalt' },
  ],
  20: [
    { src: photo20yd1, alt: '20-yard dumpster on residential street' },
    { src: photo20yd2, alt: '20-yard dumpster at job site with green lid' },
    { src: photo20yd3, alt: '20-yard dumpster in suburban neighborhood' },
    { src: photo20yd4, alt: '20-yard dumpster being loaded from truck' },
  ],
  30: [
    { src: photo30yd1, alt: '30-yard dumpster being delivered on residential street' },
    { src: photo30yd2, alt: '30-yard dumpsters at commercial warehouse' },
    { src: photo30yd3, alt: '30-yard dumpster on residential property side yard' },
    { src: photo30yd4, alt: '30-yard dumpster at industrial yard' },
  ],
  40: [
    { src: photo40yd1, alt: '40-yard dumpster on residential property' },
    { src: photo40yd2, alt: '40-yard dumpster at commercial site' },
    { src: photo40yd3, alt: '40-yard dumpster being loaded with debris' },
    { src: photo40yd4, alt: '40-yard dumpster at night on residential street' },
  ],
  50: [
    { src: photo50yd1, alt: '50-yard dumpster at warehouse loading dock' },
    { src: photo50yd2, alt: '50-yard dumpster loaded at commercial property' },
    { src: photo50yd3, alt: '50-yard dumpster being delivered on residential driveway' },
  ],
};

export function getGalleryPhotos(sizeYd: number): DumpsterGalleryPhoto[] {
  return DUMPSTER_GALLERY[sizeYd] || [];
}
