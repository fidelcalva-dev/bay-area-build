import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ArrowRight, Leaf, Truck, Users, Award, Heart, Recycle, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PAGE_SEO } from '@/lib/seo';

// Served from public/ to avoid bundling large files
const fleetYard = '/images/real-work/fleet-yard.jpg';
const brandedFleet = '/images/real-work/branded-fleet.jpg';
const stockedReady = '/images/real-work/stocked-ready.jpg';
const jobSite = '/images/real-work/job-site.jpg';
const truckDelivery = '/images/real-work/truck-delivery.jpg';
const heavyMaterials = '/images/real-work/heavy-materials.jpg';
const liveDelivery = '/images/real-work/live-delivery.jpg';
const pickupComplete = '/images/real-work/pickup-complete.jpg';

const values = [
  {
    icon: Truck,
    title: 'Reliability First',
    description: 'We show up when we say we will. Reliable delivery and pickup, every time.',
  },
  {
    icon: Leaf,
    title: 'Eco-Conscious',
    description: 'We recycle and dispose responsibly. Protecting the Bay Area environment matters to us.',
  },
  {
    icon: Users,
    title: 'Community Focused',
    description: 'Locally owned and operated. We know the Bay Area because we live here.',
  },
  {
    icon: Heart,
    title: 'Customer Care',
    description: 'Real people answering your calls. Bilingual support in English and Spanish.',
  },
];

const stats = [
  { value: '9', label: 'Counties Served' },
  { value: '200+', label: 'Happy Customers' },
  { value: '24hr', label: 'Delivery Available' },
  { value: '7', label: 'Dumpster Sizes' },
];

const fleetGallery = [
  { id: 1, caption: 'Fleet Yard', image: fleetYard },
  { id: 2, caption: 'Branded Fleet', image: brandedFleet },
  { id: 3, caption: 'Stocked & Ready', image: stockedReady },
  { id: 4, caption: 'Job Site', image: jobSite },
  { id: 5, caption: 'Truck Delivery', image: truckDelivery },
  { id: 6, caption: 'Heavy Materials', image: heavyMaterials },
  { id: 7, caption: 'Live Delivery', image: liveDelivery },
  { id: 8, caption: 'Pickup Complete', image: pickupComplete },
];

export default function About() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % fleetGallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + fleetGallery.length) % fleetGallery.length);
  };

  return (
    <Layout
      title="About Calsan Dumpsters Pro | Bay Area Dumpster Company"
      description="Locally owned dumpster rental company serving the SF Bay Area. Reliable, eco-friendly waste removal with bilingual support. Learn about our story."
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-4">About Us</h1>
            <p className="text-xl text-primary-foreground/85">
              Your trusted dumpster rental partner in the San Francisco Bay Area. Reliable service, transparent pricing, eco-friendly practices.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-lg text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Calsan Dumpsters Pro was founded with a simple mission: make dumpster rental easy, affordable, and reliable for Bay Area residents and businesses.
                </p>
                <p>
                  We saw an industry filled with hidden fees, unreliable service, and poor communication. We knew we could do better. Today, we're proud to serve 9 Bay Area counties with transparent pricing and on-time service.
                </p>
                <p>
                  As a locally owned and operated company based in Oakland, we understand the unique needs of Bay Area customers. Whether you're cleaning out a garage in San Francisco or managing a construction site in San Jose, we're here to help.
                </p>
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-4xl font-extrabold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Yard & Fleet Section */}
      <section className="section-padding bg-foreground text-background">
        <div className="container-wide">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Built on Real Operations.
            </h2>
            <p className="text-lg md:text-xl text-background/70 max-w-3xl mx-auto">
              We operate our own fleet and equipment to ensure reliable delivery, fast replacements, and consistent service across the Bay Area.
            </p>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
            {fleetGallery.map((image, index) => (
              <div
                key={image.id}
                className="aspect-square rounded-xl overflow-hidden cursor-pointer group border border-background/10 hover:border-primary/50 transition-all duration-300 relative"
                onClick={() => openLightbox(index)}
              >
                <img 
                  src={image.image} 
                  alt={image.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <span className="text-[10px] md:text-xs text-background/90 font-medium">
                    {image.caption}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-background font-medium text-sm">
                    View
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox Modal */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
            <div className="relative aspect-video flex items-center justify-center">
              <img 
                src={fleetGallery[currentImageIndex]?.image} 
                alt={fleetGallery[currentImageIndex]?.caption}
                className="max-w-full max-h-full object-contain"
              />

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
                  {currentImageIndex + 1} / {fleetGallery.length}
                </span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* Values */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">What We Stand For</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our values guide everything we do, from customer service to environmental responsibility.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-card rounded-2xl border border-border p-6 text-center">
                <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-xl bg-primary/10 text-primary mb-5">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eco Section */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full text-sm font-medium mb-6">
                <Recycle className="w-4 h-4" />
                <span>Environmental Commitment</span>
              </div>
              <h2 className="heading-lg mb-6">Eco-Friendly Disposal</h2>
              <p className="text-primary-foreground/85 mb-6">
                We're committed to responsible waste management. We work with certified recycling facilities and disposal sites to ensure materials are handled properly.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-accent" />
                  <span>Materials sorted for maximum recycling</span>
                </li>
                <li className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-accent" />
                  <span>Certified disposal facilities</span>
                </li>
                <li className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-accent" />
                  <span>Proper handling of construction debris</span>
                </li>
                <li className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-accent" />
                  <span>Compliance with California regulations</span>
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <Recycle className="w-24 h-24 text-primary-foreground/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-background">
        <div className="container-narrow text-center">
          <h2 className="heading-lg text-foreground mb-4">Ready to Work With Us?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Experience the difference with a dumpster rental company that puts you first.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">
                Get Instant Quote
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}