import { useState } from 'react';
import { Play, X, Truck, Clock, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const galleryImages = [
  { id: 1, alt: 'Dumpster delivery in action', placeholder: true },
  { id: 2, alt: 'Our fleet of trucks', placeholder: true },
  { id: 3, alt: 'Team at work', placeholder: true },
  { id: 4, alt: 'Clean job site', placeholder: true },
  { id: 5, alt: 'Professional service', placeholder: true },
  { id: 6, alt: 'Bay Area delivery', placeholder: true },
];

const bullets = [
  { icon: Truck, text: 'Local team, real equipment' },
  { icon: Clock, text: 'On-time delivery and pickup' },
  { icon: Shield, text: 'Transparent, professional service' },
];

export const RealWorkSection = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <section className="py-16 md:py-24 bg-foreground text-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Real People. Real Dumpsters. Real Service.
          </h2>
          <p className="text-lg md:text-xl text-background/70 max-w-2xl mx-auto">
            See our actual trucks, dumpsters, and team in action across the Bay Area.
          </p>
        </div>

        {/* Video + Copy Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Video Placeholder */}
          <div className="order-1 lg:order-1">
            <div 
              className="relative aspect-video bg-muted/20 rounded-2xl overflow-hidden cursor-pointer group border border-background/10"
              onClick={() => setVideoPlaying(true)}
            >
              {/* Placeholder background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                  <p className="text-background/60 text-sm font-medium">
                    📹 Replace with your real video
                  </p>
                </div>
              </div>

              {/* Video embed placeholder overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-background/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                  <span className="text-xs text-background/70">
                    YouTube / Vimeo / Self-hosted video placeholder
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Copy */}
          <div className="order-2 lg:order-2 flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              See the Difference Quality Makes
            </h3>
            <p className="text-background/70 text-lg mb-8 leading-relaxed">
              We're not a faceless corporation—we're your neighbors. Our family-owned business 
              has been serving the Bay Area for years, and we take pride in every delivery.
            </p>

            {/* Bullets */}
            <ul className="space-y-4">
              {bullets.map((bullet, index) => (
                <li key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <bullet.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-lg font-medium">{bullet.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="mt-16">
          <h3 className="text-xl md:text-2xl font-bold mb-6 text-center">
            Our Work in Action
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className="aspect-square bg-muted/20 rounded-xl overflow-hidden cursor-pointer group border border-background/10 hover:border-primary/50 transition-all duration-300"
                onClick={() => openLightbox(index)}
              >
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative">
                  <div className="text-center p-2">
                    <div className="w-8 h-8 bg-background/20 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <span className="text-xs">📷</span>
                    </div>
                    <span className="text-[10px] md:text-xs text-background/60 leading-tight block">
                      {image.alt}
                    </span>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-background font-medium text-sm">
                      View
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-background/50 text-sm mt-4">
            ⚠️ Replace these placeholders with your real job site photos
          </p>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={videoPlaying} onOpenChange={setVideoPlaying}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
          <div className="aspect-video bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground p-8">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Video Placeholder</p>
              <p className="text-sm opacity-70">
                Replace with YouTube/Vimeo embed or self-hosted video
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
          <div className="relative aspect-video flex items-center justify-center">
            {/* Image placeholder */}
            <div className="w-full h-full bg-muted/20 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-lg font-medium mb-2">
                  {galleryImages[currentImageIndex]?.alt}
                </p>
                <p className="text-sm opacity-70">
                  Image placeholder - replace with real photo
                </p>
              </div>
            </div>

            {/* Navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-white rounded-full"
              onClick={prevImage}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-white rounded-full"
              onClick={nextImage}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-white text-sm">
                {currentImageIndex + 1} / {galleryImages.length}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
