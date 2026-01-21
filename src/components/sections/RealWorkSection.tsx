import { useState } from 'react';
import { Play, Truck, Clock, Shield, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Import real work images
import truckDelivery from '@/assets/real-work/truck-delivery.jpg';
import jobSite1 from '@/assets/real-work/job-site-1.jpg';
import fleetYard from '@/assets/real-work/fleet-yard.jpg';
import workerAction from '@/assets/real-work/worker-action.jpg';
import pickupComplete from '@/assets/real-work/pickup-complete.jpg';
import heavyMaterials from '@/assets/real-work/heavy-materials.jpg';

const galleryImages = [
  { id: 1, src: truckDelivery, alt: 'Dumpster delivery', label: 'Same-Day Delivery' },
  { id: 2, src: fleetYard, alt: 'Fleet yard', label: 'Our Fleet' },
  { id: 3, src: workerAction, alt: 'Team at work', label: 'Professional Team' },
  { id: 4, src: jobSite1, alt: 'Job site', label: 'Job Site' },
  { id: 5, src: pickupComplete, alt: 'Pickup complete', label: 'Pickup Complete' },
  { id: 6, src: heavyMaterials, alt: 'Heavy materials', label: 'Heavy Materials' },
];

const stats = [
  { value: '15+', label: 'Years', icon: Clock },
  { value: '2', label: 'Yards', icon: Truck },
  { value: '9', label: 'Counties', icon: MapPin },
  { value: '100%', label: 'Local', icon: Shield },
];

export const RealWorkSection = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <section className="py-16 md:py-24 bg-foreground text-background overflow-hidden">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Our operations
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
            Real people. Real work.
          </h2>
          <p className="text-background/60 max-w-xl mx-auto">
            Not a booking platform. A local Bay Area team you can trust.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3 mb-10 max-w-xl mx-auto">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="text-center p-3 bg-background/5 border border-background/10 rounded-xl"
            >
              <stat.icon className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-xl md:text-2xl font-bold text-background">{stat.value}</div>
              <div className="text-xs text-background/50">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className="group aspect-square rounded-xl overflow-hidden cursor-pointer relative border border-background/10 hover:border-primary/50 transition-all"
              onClick={() => openLightbox(index)}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-white text-xs font-medium">{image.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <button 
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="relative aspect-video">
            <img 
              src={galleryImages[currentImageIndex]?.src}
              alt={galleryImages[currentImageIndex]?.alt}
              className="w-full h-full object-contain"
            />

            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"
              onClick={prevImage}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"
              onClick={nextImage}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-white font-medium">{galleryImages[currentImageIndex]?.label}</p>
              <p className="text-white/60 text-sm">{currentImageIndex + 1} / {galleryImages.length}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
