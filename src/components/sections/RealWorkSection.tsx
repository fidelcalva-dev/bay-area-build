import { useState } from 'react';
import { Play, Truck, Clock, Shield, ChevronLeft, ChevronRight, MapPin, Users, Wrench, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Import real work images
import truckDelivery from '@/assets/real-work/truck-delivery.jpg';
import jobSite1 from '@/assets/real-work/job-site-1.jpg';
import fleetYard from '@/assets/real-work/fleet-yard.jpg';
import workerAction from '@/assets/real-work/worker-action.jpg';
import pickupComplete from '@/assets/real-work/pickup-complete.jpg';
import heavyMaterials from '@/assets/real-work/heavy-materials.jpg';

const galleryImages = [
  { id: 1, src: truckDelivery, alt: 'Dumpster delivery in action', label: 'Same-Day Delivery' },
  { id: 2, src: fleetYard, alt: 'Our fleet of trucks', label: 'Our Fleet' },
  { id: 3, src: workerAction, alt: 'Team at work', label: 'Professional Team' },
  { id: 4, src: jobSite1, alt: 'Active job site', label: 'Job Site' },
  { id: 5, src: pickupComplete, alt: 'Clean pickup complete', label: 'Pickup Complete' },
  { id: 6, src: heavyMaterials, alt: 'Heavy materials disposal', label: 'Heavy Materials' },
];

const stats = [
  { value: '15+', label: 'Years Experience', icon: Clock },
  { value: '50+', label: 'Trucks & Dumpsters', icon: Truck },
  { value: '9', label: 'Counties Served', icon: MapPin },
  { value: '100%', label: 'Local Team', icon: Users },
];

const bullets = [
  { 
    icon: Truck, 
    title: 'Local Fleet, Real Equipment',
    text: 'Every truck you see is part of our Bay Area fleet—not subcontracted from unknown providers.' 
  },
  { 
    icon: Clock, 
    title: 'On-Time, Every Time',
    text: 'We show up when we say we will. Same-day delivery available throughout the Bay Area.' 
  },
  { 
    icon: Shield, 
    title: 'Licensed, Insured, Professional',
    text: 'Full commercial insurance, licensed drivers, and safety-certified operations.' 
  },
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
    <section className="py-20 md:py-28 bg-foreground text-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-semibold mb-4">
            <Wrench className="w-4 h-4" />
            Behind the Scenes
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Real People. Real Work.
          </h2>
          <p className="text-lg md:text-xl text-background/70 max-w-2xl mx-auto">
            We're not a faceless booking platform. Meet our trucks, our team, and see the work we do across the Bay Area every day.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-background/5 border border-background/10 rounded-xl p-4 text-center hover:bg-background/10 transition-colors"
            >
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-background">{stat.value}</div>
              <div className="text-sm text-background/60">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Video + Copy Grid */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 mb-16 items-center">
          {/* Video Section */}
          <div className="order-1">
            <div 
              className="relative aspect-video bg-background/5 rounded-2xl overflow-hidden cursor-pointer group border border-background/10 shadow-2xl"
              onClick={() => setVideoPlaying(true)}
            >
              {/* Video Thumbnail - use first gallery image */}
              <img 
                src={truckDelivery} 
                alt="Watch our team in action" 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1" fill="currentColor" />
                </div>
              </div>

              {/* Video Label */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2.5 flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-white font-medium">
                    Watch: A Day with Calsan Dumpsters Pro
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Copy */}
          <div className="order-2 flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              See the Difference <span className="text-primary">Quality</span> Makes
            </h3>
            <p className="text-background/70 text-lg mb-8 leading-relaxed">
              When you rent from us, you're supporting a local Bay Area business that's been serving our community for over 15 years. 
              Our drivers know these neighborhoods, and our equipment is maintained to the highest standards.
            </p>

            {/* Enhanced Bullets */}
            <ul className="space-y-5">
              {bullets.map((bullet, index) => (
                <li key={index} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <bullet.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-background mb-0.5">{bullet.title}</h4>
                    <p className="text-sm text-background/60 leading-relaxed">{bullet.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Photo Gallery */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-bold">
              Our Work in Action
            </h3>
            <span className="text-sm text-background/50">
              Click any photo to enlarge
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className="group aspect-square rounded-xl overflow-hidden cursor-pointer relative border border-background/10 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() => openLightbox(index)}
              >
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-3 w-full">
                    <span className="text-white text-sm font-medium">{image.label}</span>
                  </div>
                </div>

                {/* Corner indicator */}
                <div className="absolute top-2 right-2 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs">+</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={videoPlaying} onOpenChange={setVideoPlaying}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none overflow-hidden">
          <button 
            onClick={() => setVideoPlaying(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="aspect-video bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground p-8">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-primary" />
              </div>
              <p className="text-lg font-semibold mb-2">Video Coming Soon</p>
              <p className="text-sm opacity-70 max-w-md mx-auto">
                We're filming a behind-the-scenes look at our operations. 
                Check back soon to see our team and fleet in action!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-none overflow-hidden">
          <button 
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="relative aspect-video flex items-center justify-center">
            <img 
              src={galleryImages[currentImageIndex]?.src}
              alt={galleryImages[currentImageIndex]?.alt}
              className="w-full h-full object-contain"
            />

            {/* Navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="text-white font-semibold text-lg">{galleryImages[currentImageIndex]?.label}</p>
              <p className="text-white/70 text-sm">{galleryImages[currentImageIndex]?.alt}</p>
            </div>

            {/* Image counter */}
            <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-white text-sm font-medium">
                {currentImageIndex + 1} / {galleryImages.length}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
